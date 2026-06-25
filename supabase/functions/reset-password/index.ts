// Edge Function — reset-password
// Deux modes :
//   1. { mode: 'get_question', email } → retourne la security_question
//   2. { email, securityAnswer, newPassword } → vérifie et réinitialise le mdp
// Sécurité : rate-limit par IP (5 tentatives / 15 min), validation stricte.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, makeCorsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';

// ── Rate limiting en mémoire (réinitialisé au redémarrage Deno) ──────────────
const attempts = new Map<string, { count: number; firstAt: number }>();
const LIMIT     = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now   = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

/** Normalise une réponse : minuscules, sans accents, sans espaces superflus */
const normalize = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors   = makeCorsHeaders(origin);

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Méthode non autorisée.', 405, origin);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';

  try {
    const body = await req.json() as {
      mode?: string;
      email?: string;
      securityAnswer?: string;
      newPassword?: string;
    };

    const emailClean = (body.email ?? '').trim().toLowerCase();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean))
      return errorResponse('Adresse email invalide.', 400, origin);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // ── MODE 1 : récupérer la question secrète ───────────────────────────────
    if (body.mode === 'get_question') {
      if (!checkRateLimit(`q:${ip}`)) {
        return new Response(
          JSON.stringify({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '900' } },
        );
      }

      const { data: profile } = await supabaseAdmin
        .from('profiles').select('security_question')
        .eq('email', emailClean).maybeSingle();

      // Même réponse qu'il y ait un compte ou non (anti-énumération)
      if (!profile?.security_question)
        return jsonResponse({ found: false }, origin);

      return jsonResponse({ found: true, question: profile.security_question }, origin);
    }

    // ── MODE 2 : réinitialiser le mot de passe ───────────────────────────────
    const { securityAnswer, newPassword } = body;

    if (!securityAnswer || !newPassword)
      return errorResponse('Champs securityAnswer et newPassword requis.', 400, origin);
    if (typeof newPassword !== 'string' || newPassword.length < 8)
      return errorResponse('Le mot de passe doit contenir au moins 8 caractères.', 400, origin);
    if (newPassword !== newPassword.trim())
      return errorResponse('Le mot de passe ne doit pas commencer ou finir par des espaces.', 400, origin);

    if (!checkRateLimit(`r:${ip}`)) {
      return new Response(
        JSON.stringify({ error: `Trop de tentatives (${LIMIT} max / 15 min). Réessayez dans quelques minutes.` }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '900' } },
      );
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles').select('id, security_answer')
      .eq('email', emailClean).maybeSingle();

    if (profileErr || !profile)
      return errorResponse('Email ou réponse secrète incorrects.', 401, origin);
    if (!profile.security_answer)
      return errorResponse('Aucune question secrète configurée. Contactez le support.', 400, origin);
    if (normalize(securityAnswer) !== profile.security_answer)
      return errorResponse('Email ou réponse secrète incorrects.', 401, origin);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id, { password: newPassword },
    );

    if (updateErr) {
      console.error('[reset-password] updateUser error:', updateErr.message);
      return errorResponse('Erreur lors de la mise à jour du mot de passe.', 500, origin);
    }

    attempts.delete(`r:${ip}`);
    return jsonResponse({ ok: true }, origin);

  } catch (err) {
    console.error('[reset-password] unexpected error:', err);
    return errorResponse('Erreur interne du serveur.', 500, origin);
  }
});
