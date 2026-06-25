
-- ─── 1. Profils enseignants ────────────────────────────────────────────────────
CREATE TABLE teacher_profiles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   text NOT NULL,
  bio            text,
  subjects       text[]    NOT NULL DEFAULT '{}',
  levels         text[]    NOT NULL DEFAULT '{}',
  is_available   boolean   NOT NULL DEFAULT false,
  rating_avg     numeric(3,2) NOT NULL DEFAULT 0,
  rating_count   int       NOT NULL DEFAULT 0,
  response_time_avg_min int NOT NULL DEFAULT 30,
  verified       boolean   NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_profiles_public_read" ON teacher_profiles
  FOR SELECT TO anon, authenticated USING (verified = true);

CREATE POLICY "teacher_own_write" ON teacher_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 2. Base de connaissances ─────────────────────────────────────────────────
CREATE TABLE knowledge_base (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          text    NOT NULL,
  level            text    NOT NULL,
  question_text    text    NOT NULL,
  tags             text[]  NOT NULL DEFAULT '{}',
  answer_text      text    NOT NULL,
  answer_steps     jsonb   NOT NULL DEFAULT '[]',
  teacher_id       uuid    REFERENCES teacher_profiles(id),
  teacher_name     text,
  validated        boolean NOT NULL DEFAULT false,
  view_count       int     NOT NULL DEFAULT 0,
  helpful_votes    int     NOT NULL DEFAULT 0,
  quality_score    int     NOT NULL DEFAULT 3 CHECK (quality_score BETWEEN 1 AND 5),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kb_public_read" ON knowledge_base
  FOR SELECT TO anon, authenticated USING (validated = true);

CREATE POLICY "kb_teacher_insert" ON knowledge_base
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM teacher_profiles WHERE user_id = auth.uid() AND verified = true)
  );

CREATE POLICY "kb_teacher_update_own" ON knowledge_base
  FOR UPDATE TO authenticated
  USING (teacher_id IN (SELECT id FROM teacher_profiles WHERE user_id = auth.uid()));

-- ─── 3. Demandes de matching élève → enseignant ───────────────────────────────
CREATE TABLE matching_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          text NOT NULL,
  level            text NOT NULL,
  question_text    text NOT NULL,
  question_images  text[] NOT NULL DEFAULT '{}',
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','matched','answered','closed')),
  teacher_id       uuid REFERENCES teacher_profiles(id),
  answer_text      text,
  answered_at      timestamptz,
  matched_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE matching_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matching_student_own" ON matching_requests
  FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "matching_student_insert" ON matching_requests
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "matching_teacher_read_pending" ON matching_requests
  FOR SELECT TO authenticated
  USING (
    status = 'pending'
    OR teacher_id IN (SELECT id FROM teacher_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "matching_teacher_update" ON matching_requests
  FOR UPDATE TO authenticated
  USING (
    teacher_id IN (SELECT id FROM teacher_profiles WHERE user_id = auth.uid())
    OR (status = 'pending' AND teacher_id IS NULL)
  );

-- ─── 4. Votes sur les réponses ────────────────────────────────────────────────
CREATE TABLE kb_votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id       uuid NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  helpful     boolean NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kb_id, user_id)
);

ALTER TABLE kb_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_read" ON kb_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "votes_insert" ON kb_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "votes_delete_own" ON kb_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─── 5. Indexes performance ───────────────────────────────────────────────────
CREATE INDEX kb_subject_level_idx ON knowledge_base(subject, level);
CREATE INDEX kb_search_idx ON knowledge_base USING gin(to_tsvector('french', question_text || ' ' || answer_text));
CREATE INDEX kb_tags_idx ON knowledge_base USING gin(tags);
CREATE INDEX matching_student_idx ON matching_requests(student_id, status);
CREATE INDEX matching_pending_idx ON matching_requests(status, subject, level) WHERE status = 'pending';

-- ─── 6. Seed — 20 réponses initiales de démonstration ────────────────────────
INSERT INTO knowledge_base (subject, level, question_text, tags, answer_text, answer_steps, teacher_name, validated, quality_score) VALUES

('Maths', 'Collège 3e',
 'Comment résoudre une équation du second degré ax² + bx + c = 0 ?',
 ARRAY['algèbre','équation','discriminant','3e','brevet'],
 'Pour résoudre ax² + bx + c = 0, on calcule le discriminant Δ = b² - 4ac, puis on distingue 3 cas selon le signe de Δ.',
 '[{"step":1,"title":"Identifier a, b, c","text":"Repère les coefficients : a devant x², b devant x, c le terme constant."},{"step":2,"title":"Calculer Δ = b² − 4ac","text":"Effectue le calcul numérique du discriminant."},{"step":3,"title":"Cas Δ > 0","text":"Deux solutions : x₁ = (−b + √Δ)/(2a) et x₂ = (−b − √Δ)/(2a)"},{"step":4,"title":"Cas Δ = 0","text":"Une solution double : x = −b/(2a)"},{"step":5,"title":"Cas Δ < 0","text":"Pas de solution réelle."}]',
 'M. Dupont — Professeur de Maths', true, 5),

('Maths', 'Lycée Terminale',
 'Quelle est la dérivée de f(x) = ln(x) et comment la démontrer ?',
 ARRAY['dérivée','logarithme','terminale','analyse'],
 'La dérivée de ln(x) est 1/x pour tout x > 0. On peut le montrer par la définition ou par la relation avec exp.',
 '[{"step":1,"title":"Définition de la dérivée","text":"f''(x) = lim[h→0] (ln(x+h) − ln(x)) / h"},{"step":2,"title":"Simplification","text":"= lim[h→0] (1/h) × ln(1 + h/x) = lim[h→0] (1/x) × (x/h) × ln(1 + h/x)"},{"step":3,"title":"Limite classique","text":"Comme lim[u→0] ln(1+u)/u = 1, on obtient f''(x) = 1/x"},{"step":4,"title":"Règle de la chaîne","text":"Pour f(g(x)) = ln(g(x)), la dérivée est g''(x)/g(x)"}]',
 'Mme Martin — Professeure de Maths', true, 5),

('Français', 'Lycée 1ère',
 'Comment rédiger une introduction de dissertation en français ?',
 ARRAY['dissertation','introduction','méthode','1ère','bac français'],
 'L''introduction de dissertation comporte 3 parties obligatoires : l''accroche, la problématique et l''annonce du plan.',
 '[{"step":1,"title":"L''accroche","text":"Commence par une citation, un fait culturel ou une question générale en lien avec le sujet. Jamais ''De tout temps les hommes...''"},{"step":2,"title":"Contextualisation","text":"Présente le sujet et délimite son cadre (époque, genre littéraire, auteurs concernés)."},{"step":3,"title":"La problématique","text":"Reformule le sujet sous forme de question précise qui montre la tension, le paradoxe ou l''enjeu."},{"step":4,"title":"Annonce du plan","text":"Annonce les 2 ou 3 grandes parties de façon claire. ''Dans un premier temps... puis...''"},{"step":5,"title":"Longueur","text":"Une bonne introduction = 8 à 12 lignes. Ni trop courte ni trop longue."}]',
 'Mme Leroy — Professeure de Français', true, 5),

('Histoire', 'Lycée Terminale',
 'Quelles sont les causes de la Première Guerre mondiale ?',
 ARRAY['1ère guerre mondiale','causes','terminale','bac histoire'],
 'Les causes de la Grande Guerre se regroupent en causes structurelles (longues) et immédiates (courtes).',
 '[{"step":1,"title":"Causes structurelles","text":"1. Nationalisme exacerbé en Europe. 2. Impérialisme colonial et rivalités économiques. 3. Course aux armements depuis 1870. 4. Système des alliances (Triple Entente vs Triple Alliance)."},{"step":2,"title":"La crise de juillet 1914","text":"Assassinat de l''archiduc François-Ferdinand à Sarajevo le 28 juin 1914 — l''étincelle."},{"step":3,"title":"L''engrenage des alliances","text":"L''Autriche-Hongrie déclare la guerre à la Serbie → Russie mobilise → Allemagne déclare la guerre → France et GB entrent en guerre."},{"step":4,"title":"Le rôle de l''Allemagne","text":"Le ''plan Schlieffen'' prévoyait une guerre sur deux fronts — preuve d''une préparation offensive."}]',
 'M. Bernard — Professeur d''Histoire', true, 5),

('Physique', 'Lycée Terminale',
 'Comment calculer la force électrostatique entre deux charges avec la loi de Coulomb ?',
 ARRAY['coulomb','électrostatique','force','terminale','physique'],
 'La loi de Coulomb donne la force entre deux charges ponctuelles : F = k × |q₁ × q₂| / r²',
 '[{"step":1,"title":"La formule","text":"F = k × |q₁ × q₂| / r²  avec k = 9×10⁹ N·m²/C²"},{"step":2,"title":"Les grandeurs","text":"q₁ et q₂ : charges en Coulombs (C). r : distance entre les charges en mètres (m). F : force en Newtons (N)."},{"step":3,"title":"Direction","text":"Si les charges sont de même signe → répulsion. Si de signes opposés → attraction."},{"step":4,"title":"Exemple","text":"q₁ = 2×10⁻⁶ C, q₂ = 3×10⁻⁶ C, r = 0,1 m → F = 9×10⁹ × 6×10⁻¹² / 0,01 = 5,4 N"}]',
 'M. Rousseau — Professeur de Physique', true, 5),

('SVT', 'Lycée Terminale',
 'Comment fonctionne la photosynthèse et quelles sont ses équations bilan ?',
 ARRAY['photosynthèse','chlorophylle','SVT','terminale','bac'],
 'La photosynthèse est la synthèse de matière organique à partir de CO₂ et H₂O grâce à l''énergie lumineuse.',
 '[{"step":1,"title":"Équation bilan","text":"6 CO₂ + 6 H₂O + énergie lumineuse → C₆H₁₂O₆ (glucose) + 6 O₂"},{"step":2,"title":"Phase lumineuse","text":"Dans les thylakoïdes : absorption de la lumière par la chlorophylle → production d''ATP et NADPH, libération d''O₂."},{"step":3,"title":"Cycle de Calvin","text":"Dans le stroma : fixation du CO₂ grâce à l''ATP et NADPH → synthèse de glucose."},{"step":4,"title":"Facteurs limitants","text":"Intensité lumineuse, concentration en CO₂, température."}]',
 'Mme Petit — Professeure de SVT', true, 5),

('Maths', 'Collège 4e',
 'Comment calculer le théorème de Pythagore et dans quel cas l''utiliser ?',
 ARRAY['pythagore','triangle rectangle','géométrie','4e','collège'],
 'Le théorème de Pythagore s''applique dans un triangle rectangle : le carré de l''hypoténuse = somme des carrés des deux autres côtés.',
 '[{"step":1,"title":"L''énoncé","text":"Dans un triangle ABC rectangle en C : AB² = AC² + BC²  (AB = hypoténuse)"},{"step":2,"title":"Comment identifier l''hypoténuse","text":"C''est le côté en face de l''angle droit — toujours le plus long."},{"step":3,"title":"Trouver un côté manquant","text":"Exemple : AC = 3 cm, BC = 4 cm → AB² = 9 + 16 = 25 → AB = 5 cm"},{"step":4,"title":"Réciproque","text":"Si AB² = AC² + BC², alors le triangle est rectangle en C."},{"step":5,"title":"Erreur classique","text":"Ne pas oublier d''extraire la racine carrée à la fin !"}]',
 'M. Dupont — Professeur de Maths', true, 5),

('Français', 'Collège 3e',
 'Quelle est la différence entre une métaphore et une comparaison ?',
 ARRAY['figure de style','métaphore','comparaison','français','3e','brevet'],
 'La comparaison utilise un outil de comparaison (comme, tel, pareil à), la métaphore non — elle assimile directement.',
 '[{"step":1,"title":"La comparaison","text":"Elle utilise un COMPARANT et un OUTIL : ''Il court COMME le vent''. Outil = comme."},{"step":2,"title":"La métaphore","text":"Elle fusionne directement : ''Il est le vent'' — pas d''outil de comparaison."},{"step":3,"title":"Métaphore filée","text":"Quand la métaphore est développée sur plusieurs phrases ou vers."},{"step":4,"title":"Comment les identifier à l''oral","text":"Cherche d''abord un outil (comme, tel, ainsi que...). S''il n''y en a pas mais qu''il y a une image → métaphore."}]',
 'Mme Leroy — Professeure de Français', true, 5),

('Anglais', 'Lycée 2nde',
 'Quand utiliser le present perfect vs le prétérit en anglais ?',
 ARRAY['present perfect','prétérit','grammaire anglaise','2nde','lycée'],
 'Le present perfect lie le passé au présent (résultat visible maintenant), le prétérit parle d''un moment précis et révolu.',
 '[{"step":1,"title":"Present Perfect","text":"Formule : have/has + participe passé. Usage : action passée avec résultat présent. Ex : ''I have lost my keys'' (je ne les ai toujours pas)."},{"step":2,"title":"Prétérit simple","text":"Formule : V-ed ou forme irrégulière. Usage : moment précis dans le passé. Ex : ''I lost my keys yesterday.''"},{"step":3,"title":"Marqueurs temporels","text":"Present perfect : ever, never, already, just, since, for. Prétérit : yesterday, last week, in 2020, ago."},{"step":4,"title":"Erreur classique","text":"''I have seen him yesterday'' → FAUX. ''Yesterday'' impose le prétérit : ''I saw him yesterday.''"}]',
 'Mme Dumont — Professeure d''Anglais', true, 5),

('Philo', 'Lycée Terminale',
 'Comment construire un plan de dissertation philosophique en 3 parties ?',
 ARRAY['dissertation philo','plan','méthode','terminale','bac philo'],
 'Un plan de dissertation philo doit être dialectique : thèse → antithèse → synthèse (dépassement).',
 '[{"step":1,"title":"La thèse (Partie 1)","text":"Défends la première réponse à la question. Ex : ''Oui, la liberté est possible.'' — avec arguments et exemples."},{"step":2,"title":"L''antithèse (Partie 2)","text":"Contredis la thèse. Ex : ''Mais les déterminismes limitent la liberté.'' — n''annule pas la thèse, la nuance."},{"step":3,"title":"La synthèse (Partie 3)","text":"Dépasse l''opposition. Ex : ''La liberté n''est pas absence de contraintes, mais leur maîtrise consciente.''"},{"step":4,"title":"Conseil","text":"Chaque partie doit avoir 2-3 sous-parties avec : argument → exemple concret → lien avec le sujet."}]',
 'M. Moreau — Professeur de Philosophie', true, 5),

('Maths', 'Lycée 1ère',
 'Comment calculer la limite d''une suite géométrique ?',
 ARRAY['suite géométrique','limite','1ère','terminale','analyse'],
 'La limite d''une suite géométrique de raison q dépend de la valeur de |q|.',
 '[{"step":1,"title":"Rappel","text":"Suite géométrique : uₙ = u₀ × qⁿ"},{"step":2,"title":"Si |q| < 1","text":"lim qⁿ = 0 → la suite converge vers 0"},{"step":3,"title":"Si q = 1","text":"lim uₙ = u₀ → suite constante"},{"step":4,"title":"Si q > 1","text":"lim uₙ = +∞"},{"step":5,"title":"Si q ≤ −1","text":"La suite diverge (oscille)"}]',
 'Mme Martin — Professeure de Maths', true, 5),

('Histoire', 'Collège 3e',
 'Quels sont les grands moments de la Résistance française pendant la 2e Guerre mondiale ?',
 ARRAY['résistance','2ème guerre mondiale','3e','brevet histoire'],
 'La Résistance française s''est organisée de 1940 à 1945 contre l''Occupation nazie et le régime de Vichy.',
 '[{"step":1,"title":"18 juin 1940","text":"Appel du Général de Gaulle depuis Londres — naissance de la France libre."},{"step":2,"title":"Résistance intérieure","text":"Réseaux clandestins, maquis (zone rurale), presse clandestine (Libération, Combat)."},{"step":3,"title":"Jean Moulin","text":"Unifie les mouvements de résistance en 1943 → Conseil National de la Résistance (CNR)."},{"step":4,"title":"Le D-Day (6 juin 1944)","text":"Débarquement allié en Normandie — soutenu par des actions de résistance (sabotages)."},{"step":5,"title":"Libération","text":"Paris libéré le 25 août 1944. Gouvernement provisoire de la République française."}]',
 'M. Bernard — Professeur d''Histoire', true, 5),

('Physique', 'Collège 4e',
 'Quelle est la différence entre masse et poids en physique ?',
 ARRAY['masse','poids','force','4e','collège','physique'],
 'La masse est une propriété intrinsèque de la matière (en kg), le poids est une force (en N) qui dépend de la gravité.',
 '[{"step":1,"title":"La masse","text":"Grandeur scalaire, invariable. Unité : kilogramme (kg). Ne change pas selon le lieu."},{"step":2,"title":"Le poids","text":"Force exercée par la gravité. Unité : Newton (N). Formule : P = m × g"},{"step":3,"title":"La valeur de g","text":"Sur Terre : g ≈ 9,8 N/kg. Sur la Lune : g ≈ 1,6 N/kg."},{"step":4,"title":"Exemple","text":"Un homme de 70 kg sur Terre : P = 70 × 9,8 = 686 N. Sur la Lune : P = 70 × 1,6 = 112 N. Masse : toujours 70 kg."}]',
 'M. Rousseau — Professeur de Physique', true, 5),

('Français', 'Lycée Terminale',
 'Comment analyser un texte littéraire pour un commentaire composé ?',
 ARRAY['commentaire composé','méthode','terminale','bac français'],
 'Le commentaire composé analyse un texte sous 2 ou 3 axes thématiques, chacun illustré par des procédés stylistiques.',
 '[{"step":1,"title":"Lire et annoter","text":"Lis 3 fois. Souligne les figures de style, le vocabulaire fort, les effets de rythme."},{"step":2,"title":"Dégager les axes","text":"Trouve 2-3 idées principales (thèmes + effets produits). Ex : ''Le portrait satirique'' + ''Une ironie mordante''."},{"step":3,"title":"Plan des axes","text":"Chaque axe = un paragraphe de développement. Chaque paragraphe : idée → citation → analyse du procédé → interprétation."},{"step":4,"title":"Introduction","text":"Présentation du texte + auteur + mouvement + problématique + annonce des axes."},{"step":5,"title":"Conclusion","text":"Synthèse des axes + ouverture sur une œuvre ou un thème proche."}]',
 'Mme Leroy — Professeure de Français', true, 5),

('Maths', 'Primaire CM2',
 'Comment poser et effectuer une division euclidienne avec reste ?',
 ARRAY['division','euclidienne','reste','CM2','primaire'],
 'La division euclidienne : dividende ÷ diviseur = quotient avec reste. On vérifie : dividende = diviseur × quotient + reste.',
 '[{"step":1,"title":"Écrire la division","text":"Exemple : 47 ÷ 6 = ?"},{"step":2,"title":"Chercher le quotient","text":"Combien de fois 6 entre dans 47 ? → 6×7=42, 6×8=48 trop grand → quotient = 7"},{"step":3,"title":"Calculer le reste","text":"47 − (6×7) = 47 − 42 = 5 → reste = 5"},{"step":4,"title":"Vérification","text":"6 × 7 + 5 = 42 + 5 = 47 ✓"},{"step":5,"title":"Règle","text":"Le reste est toujours strictement inférieur au diviseur."}]',
 'Mme Petit — Professeure des écoles', true, 5),

('SVT', 'Collège 3e',
 'Comment fonctionne la division cellulaire (mitose) ?',
 ARRAY['mitose','division cellulaire','3e','SVT','brevet'],
 'La mitose est une division cellulaire produisant 2 cellules filles identiques à la cellule mère (même nombre de chromosomes).',
 '[{"step":1,"title":"Interphase","text":"La cellule duplique son ADN : chaque chromosome est copié → 2 chromatides sœurs."},{"step":2,"title":"Prophase","text":"Les chromosomes se condensent et deviennent visibles au microscope."},{"step":3,"title":"Métaphase","text":"Les chromosomes s''alignent au centre de la cellule."},{"step":4,"title":"Anaphase","text":"Les chromatides sœurs se séparent et migrent vers les pôles opposés."},{"step":5,"title":"Télophase","text":"Deux noyaux se forment → la cellule se divise en deux cellules filles identiques."}]',
 'Mme Petit — Professeure de SVT', true, 5),

('Anglais', 'Collège 3e',
 'Comment conjuguer le present perfect en anglais (formation et usage) ?',
 ARRAY['present perfect','conjugaison','anglais','3e','collège'],
 'Le present perfect se forme avec have/has + participe passé. Il exprime un lien entre passé et présent.',
 '[{"step":1,"title":"Formation","text":"Affirmation : I have + V-ed / She has + V-ed. Négation : I haven''t + V-ed. Question : Have you + V-ed ?"},{"step":2,"title":"Participes passés irréguliers","text":"go → gone, see → seen, eat → eaten, write → written, buy → bought..."},{"step":3,"title":"Usages principaux","text":"1. Expérience de vie : ''I have visited Paris.'' 2. Résultat présent : ''She has broken her leg.'' 3. Très récent (just) : ''I have just arrived.''"},{"step":4,"title":"Avec since / for","text":"Since : depuis un moment précis. For : depuis une durée. ''I have lived here for 3 years / since 2021.''"}]',
 'Mme Dumont — Professeure d''Anglais', true, 5),

('Maths', 'Lycée 2nde',
 'Comment résoudre une inéquation du premier degré ?',
 ARRAY['inéquation','1er degré','2nde','lycée','algèbre'],
 'On résout une inéquation comme une équation, SAUF quand on multiplie/divise par un nombre négatif : l''inégalité se retourne.',
 '[{"step":1,"title":"Isoler l''inconnue","text":"Ex : 3x − 2 > 7 → 3x > 9 → x > 3"},{"step":2,"title":"Règle clé","text":"Si on multiplie ou divise par un nombre NÉGATIF, on retourne le sens de l''inégalité."},{"step":3,"title":"Exemple avec négatif","text":"−2x < 6 → x > −3  (on a divisé par −2 → signe inversé)"},{"step":4,"title":"Représentation","text":"Solution sur une droite graduée : crochet ouvert si strict (> ou <), fermé si large (≥ ou ≤)."},{"step":5,"title":"Notation","text":"x > 3 se note ]3 ; +∞[ en notation d''intervalle."}]',
 'M. Dupont — Professeur de Maths', true, 5),

('Histoire', 'Lycée 1ère',
 'Quelles sont les principales caractéristiques de la République de Weimar (1919-1933) ?',
 ARRAY['weimar','République','Allemagne','1ère','lycée','histoire'],
 'La République de Weimar est la démocratie allemande née après la 1ère GM, fragile et finalement détruite par Hitler.',
 '[{"step":1,"title":"Contexte de création","text":"Proclamée en nov. 1918 après la défaite allemande. Constitution de Weimar (1919) : suffrage universel, droits fondamentaux."},{"step":2,"title":"Fragilités","text":"1. Humiliation du Traité de Versailles (''le diktat''). 2. Crise économique (hyperinflation 1923, crise 1929). 3. Instabilité politique (extrêmes gauche et droite)."},{"step":3,"title":"La culture de Weimar","text":"Période de bouillonnement artistique : Bauhaus, expressionnisme, cabaret berlinois."},{"step":4,"title":"La fin","text":"Hitler nommé chancelier en janvier 1933 → lois d''exception → fin de la démocratie."}]',
 'M. Bernard — Professeur d''Histoire', true, 5),

('Philo', 'Lycée Terminale',
 'Comment définir la notion de liberté en philosophie ?',
 ARRAY['liberté','notion','philo','terminale','bac philo'],
 'La liberté est l''une des notions centrales du bac philo. Elle s''analyse selon 3 angles : libre arbitre, déterminisme, liberté politique.',
 '[{"step":1,"title":"Le libre arbitre","text":"Capacité de choisir sans être déterminé. Descartes : ''La volonté est infinie.'' Sartre : ''L''homme est condamné à être libre.''"},{"step":2,"title":"Le déterminisme","text":"Spinoza : tout est déterminé par des causes. Freud : l''inconscient détermine nos actes. Sommes-nous vraiment libres ?"},{"step":3,"title":"Liberté et contrainte","text":"Paradoxe : les lois contraignent mais garantissent la liberté civile (Rousseau, Montesquieu)."},{"step":4,"title":"La liberté comme conquête","text":"Hegel : la liberté n''est pas donnée, elle se conquiert par la conscience et l''action."},{"step":5,"title":"Méthode","text":"Au bac : toujours partir de la définition commune → la problématiser → montrer sa complexité."}]',
 'M. Moreau — Professeur de Philosophie', true, 5);
