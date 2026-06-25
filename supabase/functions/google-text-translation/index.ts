// Edge Function — Traducteur Google Text Translation
// Proxy sécurisé — INTEGRATIONS_API_KEY jamais exposé au client

import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Method Not Allowed', 405, origin);

  // Parse la requête client
  let q: string, target: string, source: string | undefined, format: string | undefined;
  try {
    const body = await req.json();
    q      = body.q;
    target = body.target;
    source = body.source;
    format = body.format;
    if (!q || typeof q !== 'string' || q.trim() === '') throw new Error("Paramètre 'q' manquant");
    if (!target || typeof target !== 'string')           throw new Error("Paramètre 'target' manquant");
  } catch (e) {
    return errorResponse(String(e), 400, origin);
  }

  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey) return errorResponse('Erreur de configuration serveur', 500, origin);

  const requestBody: Record<string, string> = { q, target };
  if (source) requestBody.source = source;
  if (format) requestBody.format = format;

  const upstream = await fetch(
    'https://app-cfkom5or162p-api-GaDwZ8DX7jPY.gateway.appmedo.com/language/translate/v2',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Gateway-Authorization': `Bearer ${apiKey}` },
      body:    JSON.stringify(requestBody),
    },
  );

  if (upstream.status === 429 || upstream.status === 402) {
    return new Response(await upstream.text(), {
      status:  upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!upstream.ok)
    return errorResponse(`Erreur API: ${upstream.status}`, 502, origin);

  return jsonResponse(await upstream.json(), origin);
});
