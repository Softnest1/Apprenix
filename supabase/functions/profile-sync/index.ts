// Edge Function — profile-sync
// Crée ou met à jour le profil Supabase d'un utilisateur authentifié.
// Appelé après login/inscription pour synchroniser les données locales → DB.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Méthode non autorisée', 405, origin);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer '))
    return errorResponse('Non autorisé', 401, origin);

  const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
  const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnon    = Deno.env.get('SUPABASE_ANON_KEY')!;
  const token           = authHeader.replace('Bearer ', '');

  // Valider le JWT
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return errorResponse('Token invalide', 401, origin);

  const adminClient = createClient(supabaseUrl, supabaseService);

  try {
    const body = await req.json().catch(() => ({}));

    // Upsert profil
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id:           user.id,
      email:        user.email ?? '',
      name:         body.name         ?? user.user_metadata?.name         ?? user.email?.split('@')[0] ?? 'Élève',
      school_level: body.school_level ?? user.user_metadata?.school_level ?? '2nde',
      avatar_url:   body.avatar_url   ?? user.user_metadata?.avatar_url   ?? null,
      xp_points:    body.xp_points    ?? 0,
      streak_days:  body.streak_days  ?? 0,
    }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // Upsert settings (valeurs par défaut si absent)
    await adminClient.from('user_settings').upsert({
      user_id:       user.id,
      dark_mode:     body.dark_mode     ?? false,
      socratic_mode: body.socratic_mode ?? false,
      font_size:     body.font_size     ?? 'normal',
      high_contrast: body.high_contrast ?? false,
      dyslexia_font: body.dyslexia_font ?? false,
    }, { onConflict: 'user_id' });

    return jsonResponse({ success: true, user_id: user.id }, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return errorResponse(msg, 500, origin);
  }
});
