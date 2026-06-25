
-- Assurer que avatar_url existe bien (déjà dans 00001 mais migration idempotente)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS student_card_number text,
  ADD COLUMN IF NOT EXISTS student_card_school text,
  ADD COLUMN IF NOT EXISTS student_card_year text;

-- Index utile pour les recherches par numéro de carte
CREATE INDEX IF NOT EXISTS idx_profiles_student_card ON public.profiles(student_card_number)
  WHERE student_card_number IS NOT NULL;
