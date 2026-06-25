/**
 * Landing SEO — Révision Bac de Français
 * Cible : "révision bac français", "bac français 2026", "méthode bac français"
 * Trafic estimé : 8 000–20 000 recherches/mois (France)
 */

import {ArrowRight,
  BookOpen, Brain, 
  CheckCircle, Clock, FileText, GraduationCap, PenTool, Sparkles, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingHero from '@/components/ui/LandingHero';

const EPREUVES = [
  {
    titre: "Commentaire de texte",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "Méthode complète : introduction, axes d'étude, conclusion. L'assistant t'aide à structurer ton commentaire pas à pas.",
    outil: "/aide-ia",
    cta: "Méthode commentaire" },
  {
    titre: "Dissertation littéraire",
    icon: PenTool,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    desc: "Plan dialectique, thèse/antithèse/synthèse, citations d'auteurs. Entraîne-toi avec des sujets réels de bac.",
    outil: "/linguistique",
    cta: "Aide dissertation" },
  {
    titre: "Explication linéaire",
    icon: BookOpen,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    desc: "Analyse vers par vers, procédés stylistiques, figures de style. Fiches sur tous les textes du programme.",
    outil: "/ressources",
    cta: "Fiches de révision" },
  {
    titre: "Oral de français",
    icon: Brain,
    color: "text-success",
    bg: "bg-success/10",
    desc: "Prépare tes 20 minutes avec des flashcards sur les œuvres du programme et l'entretien avec l'examinateur.",
    outil: "/flashcards",
    cta: "Flashcards oral" },
];

const OEUVRES = [
  "Molière — Le Mariage de Figaro",
  "Colette — Sido / Les Vrilles de la vigne",
  "Albert Camus — La Peste",
  "Marivaux — Les Fausses Confidences",
  "Olympe de Gouges — Déclaration",
  "Victor Hugo — Les Contemplations",
  "Corneille — Le Cid",
  "Marguerite Yourcenar — Mémoires d'Hadrien",
  "Alain-Fournier — Le Grand Meaulnes",
  "Guillaume Apollinaire — Alcools",
  "Stendhal — Le Rouge et le Noir",
  "Flaubert — Madame Bovary",
];

const STATS = [
  { value: "12 h", label: "d'épreuves au total", icon: Clock },
  { value: "20", label: "œuvres au programme", icon: BookOpen },
  { value: "3", label: "types d'exercices clés", icon: FileText },
  { value: "100%", label: "gratuit, sans inscription", icon: Star },
];

export default function BacFrancaisPage() {
  return (
    <>
      <SEO
        title="Révision Bac de Français 2026 — Fiches Méthode, Révision Gratuite | Apprenix"
        description="Prépare le Bac de Français 2026 gratuitement : commentaire, dissertation, explication linéaire, oral. Fiches méthode, fiches de révision, flashcards. Zéro pub."
        keywords={[
          "révision bac français","bac français 2026","aide bac français","commentaire texte bac",
          "dissertation bac français","explication linéaire bac","oral bac français",
          "fiches révision français lycée","méthode commentaire","plan dissertation bac",
          "bac français première","analyse texte bac","figures de style bac",
        ]}
        ogType="article"
      />

      <main className="min-h-dvh bg-background">

        {/* ── Hero ── */}
        <LandingHero
          gradientFrom="14,85%,30%"
          gradientMid="20,90%,42%"
          gradientTo="10,80%,34%"
          badge="📚 Bac de Français 2026"
          title={<>Révise le Bac de Français<br /><span className="text-yellow-300">avec méthode — gratuitement</span></>}
          subtitle="Commentaire, dissertation, explication linéaire, oral : Apprenix t'accompagne sur toutes les épreuves du Bac de Français avec des fiches méthode, des ressources de révision et des flashcards. Zéro pub, zéro abonnement."
          ctaPrimary={{ label: 'Fiches méthode bac français', to: '/aide-ia', icon: Sparkles }}
          ctaSecondary={{ label: 'Flashcards œuvres au programme', to: '/flashcards', icon: Brain }}
        />

        {/* ── Stats ── */}
        <section className="py-8 px-4 border-b border-border bg-muted/30">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-1 p-3">
                <s.icon className="w-5 h-5 text-primary mb-1" aria-hidden="true" />
                <span className="text-2xl font-extrabold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Épreuves ── */}
        <section className="py-12 px-4" aria-labelledby="epreuves-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="epreuves-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Tous les types d'épreuves couverts
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Apprenix t'aide sur chacune des épreuves du Bac de Français de première.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EPREUVES.map((e) => (
                <Card key={e.titre} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${e.bg}`}>
                        <e.icon className={`w-5 h-5 ${e.color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{e.titre}</h3>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{e.desc}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-2">
                      <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <Link to={e.outil}>
                          {e.cta}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Œuvres ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="oeuvres-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="oeuvres-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Œuvres au programme — flashcards disponibles
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Mémorise les auteurs, les thèmes et les citations clés grâce à la répétition espacée.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {OEUVRES.map((oeuvre) => (
                <div key={oeuvre} className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                  <span className="text-sm text-foreground">{oeuvre}</span>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="bg-primary text-primary-foreground h-11 gap-2">
              <Link to="/flashcards">
                <Brain className="w-5 h-5" />
                Créer mes flashcards bac français
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Méthode ── */}
        <section className="py-12 px-4" aria-labelledby="methode-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="methode-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              La méthode Apprenix pour le bac français
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Un plan de révision structuré en 3 étapes pour être prêt le jour J.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "1", title: "Maîtrise les œuvres",
                  desc: "Lis les résumés, les thèmes et les analyses de personnages. Mémorise les citations clés avec les flashcards SRS.",
                  link: "/ressources", cta: "Fiches de révision" },
                {
                  step: "2", title: "Entraîne-toi sur les méthodes",
                  desc: "Consulte les fiches méthode pour le commentaire ou la dissertation. Pose toutes tes questions à l'assistant sans jugement.",
                  link: "/aide-ia", cta: "Méthode & exercices guidés" },
                {
                  step: "3", title: "Prépare l'oral",
                  desc: "Entraîne-toi à formuler ta lecture linéaire à voix haute. Utilise les fiches pour anticiper les questions de l'examinateur.",
                  link: "/aide-ia", cta: "Préparer l'entretien oral" },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center shrink-0 text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{item.desc}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-8 text-xs gap-1.5">
                      <Link to={item.link}>{item.cta} <ArrowRight className="w-3 h-3" /></Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-12 px-4 bg-primary/5 border-t border-primary/10">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 text-balance">
              Prêt(e) à décrocher le bac de français ?
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Des milliers d'élèves utilisent Apprenix pour réviser leur bac. Rejoins-les — c'est totalement gratuit.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 text-base bg-primary text-primary-foreground gap-2">
                <Link to="/aide-ia">
                  <Zap className="w-5 h-5" />
                  Commencer maintenant — gratuit
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 text-base gap-2">
                <Link to="/connexion">
                  <Users className="w-5 h-5" />
                  Créer un compte
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Aucune carte bancaire requise · Aucune pub · Données protégées RGPD
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
