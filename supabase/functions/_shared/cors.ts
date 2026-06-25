// _shared/cors.ts — Apprenix Edge Functions
// Module CORS centralisé — importé par toutes les Edge Functions
// Évite la duplication du même bloc dans chaque fonction

export const ALLOWED_ORIGINS = [
  'https://apprenix.org',
  'https://www.apprenix.org',
  'https://apprenix.vercel.app',
  'https://app-cfkom5or162p.appmedo.com',
];

/** Vérifie si l'origine est autorisée (liste fixe + sous-domaines *.appmedo.com) */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try { return new URL(origin).hostname.endsWith('.appmedo.com'); } catch { return false; }
}

/**
 * Retourne les headers CORS adaptés à l'origine de la requête.
 * @param origin  Valeur du header "Origin" (peut être null)
 * @param methods Méthodes HTTP autorisées (défaut: "POST, OPTIONS")
 */
export function makeCorsHeaders(
  origin: string | null,
  methods = 'POST, OPTIONS',
): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': methods,
    'Vary': 'Origin',
  };
}

/** Réponse préflight OPTIONS — à retourner immédiatement */
export function handleOptions(origin: string | null, methods = 'POST, OPTIONS'): Response {
  return new Response('ok', { headers: makeCorsHeaders(origin, methods) });
}

/** Réponse JSON d'erreur avec CORS */
export function errorResponse(
  message: string,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...makeCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

/** Réponse JSON de succès avec CORS */
export function jsonResponse(
  // deno-lint-ignore no-explicit-any
  data: Record<string, any>,
  origin: string | null,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...makeCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}
