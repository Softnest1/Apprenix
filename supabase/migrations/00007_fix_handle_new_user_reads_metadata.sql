CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, school_level, security_question, security_answer)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Étudiant'),
    COALESCE(NEW.raw_user_meta_data->>'school_level', '2nde'),
    COALESCE(NEW.raw_user_meta_data->>'security_question', ''),
    COALESCE(NEW.raw_user_meta_data->>'security_answer', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email             = EXCLUDED.email,
    name              = COALESCE(EXCLUDED.name, profiles.name),
    school_level      = COALESCE(EXCLUDED.school_level, profiles.school_level),
    security_question = CASE WHEN EXCLUDED.security_question <> '' THEN EXCLUDED.security_question ELSE profiles.security_question END,
    security_answer   = CASE WHEN EXCLUDED.security_answer   <> '' THEN EXCLUDED.security_answer   ELSE profiles.security_answer   END;
  RETURN NEW;
END;
$function$;