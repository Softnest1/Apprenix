
-- Champs profil enseignant — persistance cross-device
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teacher_institution   text,
  ADD COLUMN IF NOT EXISTS teacher_bio           text,
  ADD COLUMN IF NOT EXISTS teacher_subjects      text[],
  ADD COLUMN IF NOT EXISTS teacher_levels        text[];
