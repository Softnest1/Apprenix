// Edge Function — flashcards-spaced-repetition
// Calcule la prochaine date de révision selon l'algorithme SM-2
// et met à jour la flashcard en base.
// Body: { flashcard_id: string, grade: 0|1|2|3|4|5 }

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

/** Algorithme SM-2 */
function sm2(
  grade: number,
  easeFactor: number,
  reviewCount: number,
): { interval: number; easeFactor: number } {
  let ef = easeFactor;
  let interval: number;

  if (grade < 3) {
    interval = 1;
  } else {
    ef = Math.max(1.3, ef + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (reviewCount === 0)      interval = 1;
    else if (reviewCount === 1) interval = 6;
    else                        interval = Math.round((reviewCount - 1) * ef);
  }

  return { interval, easeFactor: Math.round(ef * 100) / 100 };
}

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

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return errorResponse('Token invalide', 401, origin);

  try {
    const { flashcard_id, grade } = await req.json();
    if (!flashcard_id || grade === undefined) throw new Error('Paramètres manquants');
    if (grade < 0 || grade > 5)              throw new Error('Grade doit être entre 0 et 5');

    const adminClient = createClient(supabaseUrl, supabaseService);

    const { data: card, error: fetchErr } = await adminClient
      .from('flashcards')
      .select('review_count, ease_factor, user_id')
      .eq('id', flashcard_id)
      .maybeSingle();

    if (fetchErr || !card) throw new Error('Flashcard introuvable');
    if (card.user_id !== user.id) throw new Error('Accès refusé');

    const { interval, easeFactor } = sm2(grade, Number(card.ease_factor), card.review_count);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    const nextReviewStr = nextReview.toISOString().split('T')[0];

    await adminClient.from('flashcards').update({
      ease_factor:  easeFactor,
      review_count: card.review_count + 1,
      next_review:  nextReviewStr,
    }).eq('id', flashcard_id);

    return jsonResponse({
      success:       true,
      next_review:   nextReviewStr,
      interval_days: interval,
      ease_factor:   easeFactor,
    }, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return errorResponse(msg, 500, origin);
  }
});
