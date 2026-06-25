
-- Ajouter les champs manquants pour l'auth locale → Supabase
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email            text,
  ADD COLUMN IF NOT EXISTS security_question text,
  ADD COLUMN IF NOT EXISTS security_answer   text;

-- Remplir email depuis auth.users pour les profils existants
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Trigger handle_new_user : créer/remplacer pour inclure email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, school_level)
  VALUES (NEW.id, NEW.email, 'Étudiant', '2nde')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Recréer le trigger s'il n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

-- RLS : policies pour les nouveaux champs (service_role déjà existant)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Utilisateur voit son propre profil'
  ) THEN
    CREATE POLICY "Utilisateur voit son propre profil"
      ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Utilisateur met à jour son propre profil'
  ) THEN
    CREATE POLICY "Utilisateur met à jour son propre profil"
      ON public.profiles FOR UPDATE TO authenticated
      USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END;
$$;
