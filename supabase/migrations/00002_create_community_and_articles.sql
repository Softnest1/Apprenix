
-- ─── Table : articles d'actualités ──────────────────────────────────────────
CREATE TABLE articles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  excerpt      text NOT NULL,
  full_summary text NOT NULL DEFAULT '',
  category     text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  read_time    int  NOT NULL DEFAULT 4,
  featured     boolean NOT NULL DEFAULT false,
  tags         text[] NOT NULL DEFAULT '{}',
  is_admin     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_select_all" ON articles
  FOR SELECT USING (true);

CREATE POLICY "articles_insert_anon" ON articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "articles_update_anon" ON articles
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "articles_delete_anon" ON articles
  FOR DELETE USING (true);

-- ─── Table : questions de la communauté ─────────────────────────────────────
CREATE TABLE community_questions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  subject      text NOT NULL DEFAULT 'Maths',
  level        text NOT NULL DEFAULT 'Lycée',
  author_name  text NOT NULL DEFAULT 'Anonyme',
  tags         text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cq_select_all" ON community_questions FOR SELECT USING (true);
CREATE POLICY "cq_insert_all" ON community_questions FOR INSERT WITH CHECK (true);

-- ─── Table : réponses aux questions ─────────────────────────────────────────
CREATE TABLE community_answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonyme',
  author_level text NOT NULL DEFAULT '',
  content     text NOT NULL,
  upvotes     int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_select_all" ON community_answers FOR SELECT USING (true);
CREATE POLICY "ca_insert_all" ON community_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "ca_update_all" ON community_answers FOR UPDATE USING (true) WITH CHECK (true);

-- ─── Seed : articles initiaux ────────────────────────────────────────────────
INSERT INTO articles (title, excerpt, full_summary, category, read_time, featured, tags) VALUES
(
  'IA générative en classe : 5 usages pédagogiques concrets pour 2026',
  'Les assistants IA comme GPT-4o et Gemini 2.5 bouleversent les pratiques en classe. Voici comment enseignants et élèves peuvent en tirer le meilleur sans perdre le sens critique.',
  'En 2026, 68 % des établissements secondaires européens ont intégré un outil IA dans leurs pratiques. Les 5 usages les plus efficaces : génération de quiz personnalisés, correction orthographique contextuelle, aide à la compréhension de textes complexes, simulation de débats socratiques, et création de plans de révision adaptatifs.',
  'IA & Éducation', 6, true, ARRAY['IA','Pédagogie','2026','Classe']
),
(
  'La répétition espacée : la science derrière la mémorisation efficace',
  'Pourquoi certains élèves retiennent tout avec 30 minutes de révision là où d''autres oublient après 3 heures ? La science répond grâce à la courbe de l''oubli d''Ebbinghaus.',
  'La courbe de l''oubli d''Ebbinghaus (1885) montre qu''on oublie 70 % d''une information en 24h sans révision. La répétition espacée (revoir une info à J+1, J+3, J+7, J+21) est la technique la plus efficace prouvée scientifiquement pour ancrer l''information à long terme.',
  'Conseils méthode', 5, false, ARRAY['Mémoire','Révision','Flashcards','Scientifique']
),
(
  'Bac 2026 : ce qui change dans les épreuves de spécialité',
  'Le Ministère de l''Éducation nationale a publié les nouvelles modalités pour les épreuves de spécialité du Baccalauréat 2026. Tour d''horizon des changements.',
  'Pour le Bac 2026, les épreuves de spécialité se tiennent en mars. Les coefficients restent identiques à 2025. Nouveauté : une question orale obligatoire dans certaines spécialités (Maths, SES). Les candidats peuvent composer sur ordinateur pour NSI. Le grand oral voit son coefficient augmenter à 14.',
  'Tendances EdTech', 4, false, ARRAY['Bac 2026','Épreuves','Réforme']
),
(
  'Neurodiversité à l''école : comment l''IA peut réduire les inégalités',
  'Dyslexie, TDAH, troubles DYS : les outils d''IA adaptative offrent des perspectives inédites pour personnaliser l''apprentissage des élèves neuroatypiques.',
  'Les outils d''IA adaptative analysent en temps réel les difficultés spécifiques de chaque élève : vitesse de lecture, erreurs récurrentes, temps de réponse. Ils ajustent automatiquement la complexité des exercices. Pour les élèves DYS, des polices spéciales et des espacements adaptés réduisent la charge cognitive. En ULIS/SEGPA, les modes simplifiés permettent un accès équitable au savoir.',
  'IA & Éducation', 7, false, ARRAY['Inclusion','TDAH','DYS','Handicap']
),
(
  'Deep Work : la méthode Cal Newport pour des révisions ultra-efficaces',
  'Le concept de « travail en profondeur » (Deep Work) du professeur Cal Newport révolutionne la façon dont les étudiants organisent leurs sessions de révision.',
  'Cal Newport définit le Deep Work comme des sessions de travail cognitif intense, sans distraction, pendant des blocs de 25 à 90 minutes. Études à l''appui : 4h de Deep Work quotidien équivalent à 8h de travail fragmenté. La clé : couper toutes les notifications, choisir un environnement dédié, et utiliser un rituel de démarrage.',
  'Conseils méthode', 5, false, ARRAY['Concentration','Deep Work','Méthode','Pomodoro']
),
(
  'Outils numériques à l''école : le bilan de l''OCDE en 2025',
  'L''OCDE a publié son rapport annuel sur l''intégration du numérique dans les systèmes éducatifs de 37 pays membres.',
  'Le rapport OCDE 2025 révèle que les pays avec la meilleure intégration du numérique (Corée du Sud, Finlande, Estonie) montrent des gains significatifs en compréhension de lecture et en résolution de problèmes. La clé : la formation des enseignants, pas les équipements. Les tablettes sans accompagnement pédagogique n''améliorent pas les résultats.',
  'Outils numériques', 6, false, ARRAY['OCDE','Numérique','International','Rapport']
);

-- ─── Seed : questions communauté initiales ───────────────────────────────────
WITH q1 AS (
  INSERT INTO community_questions (title, description, subject, level, author_name, tags)
  VALUES ('Comment expliquer la dérivée à un 1ère ?',
    'Je bloque sur la notion de dérivée, surtout la définition par la limite. Quelqu''un pourrait expliquer avec un exemple concret ?',
    'Maths', '1ère', 'Léa M.', ARRAY['Dérivée','Limite','Lycée'])
  RETURNING id
),
q2 AS (
  INSERT INTO community_questions (title, description, subject, level, author_name, tags)
  VALUES ('Différence entre respiration et fermentation ?',
    'En SVT, je confonds toujours respiration cellulaire et fermentation. Quelles sont les vraies différences ?',
    'SVT', 'Terminale', 'Max P.', ARRAY['Respiration','Fermentation','Cellule'])
  RETURNING id
),
q3 AS (
  INSERT INTO community_questions (title, description, subject, level, author_name, tags)
  VALUES ('Méthode pour la dissertation de philosophie ?',
    'Chaque fois que je commence une dissert de philo, je ne sais pas comment construire mon plan. Y a-t-il une méthode universelle ?',
    'Philosophie', 'Terminale', 'Jade N.', ARRAY['Dissertation','Méthode','Plan'])
  RETURNING id
),
q4 AS (
  INSERT INTO community_questions (title, description, subject, level, author_name, tags)
  VALUES ('Comment gérer le stress des examens ?',
    'J''ai mes partiels dans 3 semaines et je commence déjà à paniquer. Des conseils pratiques pour gérer l''anxiété de performance ?',
    'Maths', 'Licence', 'Rayan O.', ARRAY['Stress','Examens','Bien-être'])
  RETURNING id
),
q5 AS (
  INSERT INTO community_questions (title, description, subject, level, author_name, tags)
  VALUES ('Équilibrage d''équations chimiques : astuces ?',
    'J''ai du mal à équilibrer les équations chimiques rapidement, surtout les réactions complexes. Des techniques mnémotechniques ?',
    'Chimie', '2nde', 'Inès V.', ARRAY['Chimie','Équation','Méthode'])
  RETURNING id
)
INSERT INTO community_answers (question_id, author_name, author_level, content, upvotes)
SELECT id, 'Thomas R.', 'Terminale',
  'La dérivée, c''est le taux de variation instantané. Imagine une voiture : sa vitesse à l''instant t, c''est la dérivée de sa position. Formellement : f''(x) = lim(h→0) [f(x+h)-f(x)]/h. Pour f(x)=x², on obtient f''(x)=2x. Essaie de calculer f''(3) = 2×3 = 6.', 24
FROM q1
UNION ALL
SELECT id, 'Sophie K.', 'Licence',
  'Astuce visuelle : la dérivée est le coefficient directeur de la tangente à la courbe en un point. Sur Geogebra, trace f(x)=x² et une tangente en x=2 : tu verras que sa pente vaut exactement f''(2)=4.', 18
FROM q1
UNION ALL
SELECT id, 'Camille B.', 'Licence',
  'Les deux produisent de l''énergie (ATP) à partir du glucose, mais : Respiration = nécessite de l''O₂ (aérobie), produit CO₂+H₂O, très efficace (36-38 ATP). Fermentation = sans O₂ (anaérobie), produit lactate ou éthanol+CO₂, peu efficace (2 ATP).', 31
FROM q2
UNION ALL
SELECT id, 'Hugo L.', 'Master',
  'Plan dialectique universel : I. Thèse (oui, parce que…) → II. Antithèse (non, parce que…) → III. Synthèse (nuance). Intro en 4 étapes : accroche / définition des termes / problématique / annonce du plan. Conclusion : bilan + ouverture.', 42
FROM q3
UNION ALL
SELECT id, 'Emma T.', 'Terminale',
  'Petit conseil : lis 2-3 citations de philosophes sur le sujet avant de commencer. Ça te donne des arguments solides. Pour la liberté : Sartre ("L''homme est condamné à être libre"), Kant (liberté = autonomie morale).', 29
FROM q3
UNION ALL
SELECT id, 'Sarah M.', 'Master',
  'Technique de la "boîte à soucis" : écris tes angoisses sur papier, ferme le carnet. Méthode 5-4-3-2-1 pour les moments de panique. Et surtout : dors 7-8h minimum les 2 semaines avant l''exam.', 38
FROM q4
UNION ALL
SELECT id, 'Antoine G.', '1ère',
  'Méthode étape par étape : 1. Commence par les éléments présents une seule fois. 2. Carbone. 3. Hydrogène avant l''oxygène. 4. Oxygène en dernier. 5. Vérifie. Pour 2H₂ + O₂ → 2H₂O ✓', 21
FROM q5;
