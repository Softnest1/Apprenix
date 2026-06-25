// Utilitaire LLM — appel réel à l'Edge Function large-language-model
// Supporte le streaming SSE progressif et l'accumulation complète

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Backoff partagé entre toutes les fonctionnalités ─────────────────────────
// Quand un 429 est reçu, TOUTES les prochaines requêtes sont bloquées pendant
// QUOTA_BACKOFF_MS (5 min) pour éviter de gaspiller le quota restant.
const QUOTA_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes
let quotaExhaustedAt: number | null = null;

/** Retourne true si le quota est actuellement épuisé (dans la fenêtre de backoff). */
export function isQuotaExhausted(): boolean {
  if (quotaExhaustedAt === null) return false;
  if (Date.now() - quotaExhaustedAt > QUOTA_BACKOFF_MS) {
    quotaExhaustedAt = null; // fenêtre expirée → on réessaie
    return false;
  }
  return true;
}

/** Réinitialise manuellement le backoff — permet à l'utilisateur de forcer un nouvel essai. */
export function resetQuotaBackoff(): void {
  quotaExhaustedAt = null;
}

/** Retourne le nombre de secondes restantes avant la fin du backoff (0 si pas de backoff). */
export function quotaBackoffSecondsLeft(): number {
  if (quotaExhaustedAt === null) return 0;
  const elapsed = Date.now() - quotaExhaustedAt;
  const left = Math.ceil((QUOTA_BACKOFF_MS - elapsed) / 1000);
  return left > 0 ? left : 0;
}

export interface LLMMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface CallLLMOptions {
  /** Appelé à chaque fragment de texte reçu (streaming progressif) */
  onChunk?: (chunk: string) => void;
  /** Signal pour annuler la requête */
  signal?: AbortSignal;
}

/**
 * Appelle l'Edge Function large-language-model avec streaming SSE.
 * Retourne le texte complet une fois le stream terminé.
 * Lance une Error avec message.isQuotaError = true si le quota est épuisé.
 */
export async function callLLM(
  contents: LLMMessage[],
  options: CallLLMOptions = {},
): Promise<string> {
  const { onChunk, signal } = options;

  // Bloquer immédiatement si le quota est encore en backoff
  if (isQuotaExhausted()) {
    const secs = quotaBackoffSecondsLeft();
    const mins = Math.ceil(secs / 60);
    throw Object.assign(
      new Error(`L'assistant est momentanément surchargé. Réessaie dans ${mins} min.`),
      { isQuotaError: true },
    );
  }

  // Wrapper try/catch : capture les erreurs réseau (status 0, timeout, connexion refusée)
  // qui font throw fetch() sans jamais retourner de Response.
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/large-language-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ contents }),
      signal,
    });
  } catch (fetchErr) {
    // AbortError = annulé volontairement par l'appelant → ne pas afficher d'erreur
    if (fetchErr instanceof Error && fetchErr.name === 'AbortError') throw fetchErr;
    // Timeout ou perte réseau → message clair, pas de blocage quota
    throw new Error("L'assistant ne répond pas. Vérifie ta connexion et réessaie.");
  }

  if (!res.ok) {
    if (res.status === 429) {
      quotaExhaustedAt = Date.now(); // déclenche le backoff partagé
      throw Object.assign(
        new Error("L'assistant est momentanément surchargé. Réessaie dans 5 min."),
        { isQuotaError: true },
      );
    }
    if (res.status === 402) {
      quotaExhaustedAt = Date.now();
      throw Object.assign(
        new Error("L'assistant est momentanément indisponible. Réessaie dans 5 min."),
        { isQuotaError: true },
      );
    }
    if (res.status === 504) {
      // Timeout côté Edge Function (gemini trop lent) → message spécifique, pas de blocage quota
      throw new Error("L'assistant a mis trop longtemps à répondre. Réessaie avec une question plus courte.");
    }
    throw new Error(`Erreur serveur : ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Réponse vide du serveur.');

  const decoder = new TextDecoder();
  let fullText = '';
  let done = false;
  let buffer = '';

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    buffer += decoder.decode(value, { stream: !doneReading });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;
      try {
        const parsed = JSON.parse(json);
        const text: string = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (text) {
          fullText += text;
          onChunk?.(text);
        }
      } catch {
        // ligne malformée — ignorée
      }
    }
  }

  return fullText.trim() || 'Réponse non disponible.';
}

/**
 * Construit un message utilisateur simple.
 */
export function userMsg(text: string): LLMMessage {
  return { role: 'user', parts: [{ text }] };
}
