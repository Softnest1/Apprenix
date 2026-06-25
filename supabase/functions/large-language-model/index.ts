// Edge Function — Tuteur IA Apprenix (Gemini 2.0 Flash Lite via API Gateway)
// Cache REST Supabase : économie ~50-70% quota (requêtes single-message uniquement)
// Streaming SSE direct pour les conversations multi-tours.

import { makeCorsHeaders, handleOptions, errorResponse } from '../_shared/cors.ts';

const MODEL          = 'gemini-2.0-flash-lite';
const CACHE_TTL_DAYS = 7;

const SYSTEM_PROMPT = `Tu es le tuteur IA d'Apprenix, plateforme scolaire française 100 % gratuite (CP → Bac+5).
Règles : réponds en français, tutoie les élèves, sois encourageant et concis (5 phrases max sauf si on demande plus).
Pour les devoirs : explique étape par étape, adapte au niveau scolaire français.
Pour les questions hors scolaire : redirige poliment vers /aide-ia.`;

/** SHA-256 hex du contenu sérialisé — clé de cache */
async function hashContents(contents: unknown[]): Promise<string> {
  const data = new TextEncoder().encode(MODEL + JSON.stringify(contents));
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** SSE simulé depuis un texte mis en cache */
function cachedSSE(text: string, corsHeaders: Record<string, string>): Response {
  const chunk = JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] });
  const body  = `data: ${chunk}\n\ndata: [DONE]\n\n`;
  return new Response(body, {
    headers: {
      ...corsHeaders,
      'Content-Type':    'text/event-stream',
      'Cache-Control':   'no-cache',
      'X-Apprenix-Cache': 'HIT',
    },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin      = req.headers.get('origin');
  const CORS        = makeCorsHeaders(origin);

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Method Not Allowed', 405, origin);

  // ── Parse + validation body ───────────────────────────────────────────────
  let contents: unknown[];
  try {
    const body = await req.json();
    contents   = body.contents;
    if (!Array.isArray(contents) || contents.length === 0)
      throw new Error('contents manquant ou vide');
    // Garder les 10 derniers tours, tronquer les textes longs
    contents = (contents as unknown[]).slice(-10);
    for (const item of contents as { role?: string; parts?: { text?: string }[] }[]) {
      for (const part of item?.parts ?? []) {
        if (typeof part.text === 'string' && part.text.length > 2000)
          part.text = part.text.slice(0, 2000);
      }
    }
  } catch {
    return errorResponse('Corps de requête invalide', 400, origin);
  }

  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey)  return errorResponse('Configuration serveur manquante', 500, origin);

  const supabaseUrl     = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const hasDb           = Boolean(supabaseUrl && supabaseService);

  const fullContents = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: "Compris ! Je suis prêt à aider les utilisateurs d'Apprenix." }] },
    ...contents,
  ];

  // ── Cache Supabase (requêtes single-message uniquement) ───────────────────
  const isCacheable = contents.length === 1;
  let promptHash    = '';

  if (isCacheable && hasDb) {
    promptHash = await hashContents(fullContents);
    try {
      const cacheRes = await fetch(
        `${supabaseUrl}/rest/v1/ai_response_cache?prompt_hash=eq.${encodeURIComponent(promptHash)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=response_text,hit_count&limit=1`,
        {
          headers: {
            'apikey':        supabaseService,
            'Authorization': `Bearer ${supabaseService}`,
            'Accept':        'application/json',
          },
          signal: AbortSignal.timeout(3_000),
        },
      );
      if (cacheRes.ok) {
        const rows = await cacheRes.json() as { response_text: string; hit_count: number }[];
        if (rows.length > 0 && rows[0].response_text) {
          // Incrémenter hit_count (fire-and-forget)
          fetch(`${supabaseUrl}/rest/v1/ai_response_cache?prompt_hash=eq.${encodeURIComponent(promptHash)}`, {
            method:  'PATCH',
            headers: { 'apikey': supabaseService, 'Authorization': `Bearer ${supabaseService}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ hit_count: (rows[0].hit_count ?? 0) + 1 }),
          }).catch(() => {/* fire-and-forget */});
          return cachedSSE(rows[0].response_text, CORS);
        }
      }
    } catch {
      // Cache indisponible → continuer vers Gemini
    }
  }

  // ── Appel API Gateway avec retry + backoff ────────────────────────────────
  const GATEWAY_URL  = `https://app-cfkom5or162p-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;
  const REQUEST_BODY = JSON.stringify({
    contents:         fullContents,
    generationConfig: { maxOutputTokens: 800 },
  });
  const MAX_ATTEMPTS = 3;
  const BACKOFF_MS   = [0, 1_000, 2_000];

  let upstream: Response | null = null;
  let lastStatus = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (BACKOFF_MS[attempt] > 0)
      await new Promise(r => setTimeout(r, BACKOFF_MS[attempt]));
    try {
      upstream = await fetch(GATEWAY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-Gateway-Authorization': `Bearer ${apiKey}` },
        body:    REQUEST_BODY,
        signal:  AbortSignal.timeout(25_000 - BACKOFF_MS[attempt] - attempt * 3_000),
      });
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'TimeoutError';
      if (attempt < MAX_ATTEMPTS - 1) continue;
      return errorResponse(isTimeout ? 'timeout' : 'network_error', 504, origin);
    }
    lastStatus = upstream.status;
    if (upstream.status !== 429) break;
    if (attempt === MAX_ATTEMPTS - 1) break;
    await upstream.body?.cancel();
    upstream = null;
  }

  if (!upstream) return errorResponse('network_error', 504, origin);
  if (lastStatus === 429 || lastStatus === 402) {
    return new Response(await upstream.text(), {
      status: lastStatus,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
  if (!upstream.ok || !upstream.body)
    return errorResponse(`Erreur upstream : ${upstream.status}`, 502, origin);

  // ── Streaming + écriture cache ────────────────────────────────────────────
  if (isCacheable && hasDb && promptHash) {
    // Lire tout le flux → extraire le texte → stocker en cache
    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer   = '';
    let done     = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done    = doneReading;
      buffer += decoder.decode(value, { stream: !doneReading });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (!json || json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json);
          fullText += parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        } catch { /* ligne malformée */ }
      }
    }

    // Stocker en cache (fire-and-forget)
    if (fullText) {
      const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86_400_000).toISOString();
      fetch(`${supabaseUrl}/rest/v1/ai_response_cache`, {
        method:  'POST',
        headers: {
          'apikey':        supabaseService,
          'Authorization': `Bearer ${supabaseService}`,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates',
        },
        body: JSON.stringify({ prompt_hash: promptHash, model: MODEL, response_text: fullText, expires_at: expiresAt }),
      }).catch(() => {/* fire-and-forget */});
    }

    return cachedSSE(fullText || 'Réponse non disponible.', CORS);
  }

  // Chat multi-tours : flux direct sans buffer (meilleure latence perçue)
  return new Response(upstream.body, {
    headers: {
      ...CORS,
      'Content-Type':         'text/event-stream',
      'Cache-Control':        'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
