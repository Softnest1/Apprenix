// Edge Function — avatar-upload
// Reçoit une image (multipart/form-data), l'upload dans le bucket "avatars"
// et retourne l'URL publique. Met à jour profiles.avatar_url.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, makeCorsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';

const MAX_SIZE      = 1_048_576; // 1 Mo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

  // Valider le JWT utilisateur via le client anon
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return errorResponse('Token invalide', 401, origin);

  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;

    if (!file)                       throw new Error('Aucun fichier reçu (champ "file" manquant)');
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Type de fichier non autorisé');
    if (file.size > MAX_SIZE)        throw new Error('Fichier trop lourd (max 1 Mo)');

    const ext         = file.type.split('/')[1] ?? 'jpg';
    const newPath     = `${user.id}/avatar_${Date.now()}.${ext}`;
    const adminClient = createClient(supabaseUrl, supabaseService);

    // Supprimer les anciens avatars (best-effort) — liste puis supprime
    const { data: oldFiles } = await adminClient.storage
      .from('avatars').list(user.id);
    if (oldFiles && oldFiles.length > 0) {
      const paths = oldFiles.map(f => `${user.id}/${f.name}`);
      await adminClient.storage.from('avatars').remove(paths).catch(() => null);
    }

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(newPath, arrayBuffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = adminClient.storage
      .from('avatars').getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    // Mettre à jour le profil
    await adminClient.from('profiles')
      .update({ avatar_url: publicUrl }).eq('id', user.id);

    return jsonResponse({ success: true, url: publicUrl }, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return errorResponse(msg, 500, origin);
  }
});
