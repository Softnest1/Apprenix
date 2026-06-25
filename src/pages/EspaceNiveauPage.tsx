import {AlarmClock, ArrowRight,Award, BarChart2,BookMarked, BookOpen, 
  Brain, Calculator, Calendar,CheckCircle, CheckSquare, ChevronRight, Clock, CreditCard, Dumbbell, ExternalLink,FileText, 
  Flame, Globe, GraduationCap, Heart,
  Languages, Layers, Lightbulb,
  MessageSquare, Microscope, PenLine,ScanLine, 
  School, Sigma,Star, Target, 
  Trophy, Zap } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { getLevelCategory, getXpInfo } from '@/lib/levelUtils';
import { RESSOURCES_PAR_CATEGORIE, type SectionRessources } from '@/lib/ressourcesParNiveau';
import { cn } from '@/lib/utils';
import type { SchoolLevel } from '@/types/types';

type CategoryId = 'primaire' | 'college' | 'lycee' | 'superieur' | 'adapte';

// ─── Composant : bloc ressources officielles ──────────────────────────────────
const RessourcesOfficiellesBloc: React.FC<{ sections: SectionRessources[] }> = ({ sections }) => {
  const [openId, setOpenId] = React.useState<string | null>(sections[0]?.id ?? null);
  return (
    <section aria-labelledby="ressources-officielles-titre">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 id="ressources-officielles-titre" className="text-base md:text-lg xl:text-xl font-bold text-foreground text-balance flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            Ressources officielles — cliquer &amp; accéder
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Sources vérifiées : Ministère EN, Éduscol, CNED, Lumni, Sésamath… — 0 % IA · <span className="inline-flex items-center gap-0.5">liens externes <ExternalLink className="w-3 h-3 inline" aria-hidden="true" /></span></p>
        </div>
        <Link to="/ressources-officielles" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors shrink-0">
          Toutes les ressources <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {sections.map(sec => (
          <div key={sec.id} className="border border-border rounded-xl overflow-hidden">
            {/* En-tête accordéon */}
            <button type="button"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/50 transition-colors"
              onClick={() => setOpenId(openId === sec.id ? null : sec.id)}
              aria-expanded={openId === sec.id}
              aria-controls={`sec-${sec.id}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${sec.fond} shrink-0 text-base`} aria-hidden="true">
                  {sec.emoji}
                </span>
                <span className="text-sm font-semibold text-foreground">{sec.titre}</span>
                <span className="text-xs text-muted-foreground tabular-nums">({sec.liens.length} liens)</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">{openId === sec.id ? 'Masquer' : 'Voir les liens'}</span>
                <ChevronRight
                  className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', openId === sec.id ? 'rotate-90' : '')}
                  aria-hidden="true"
                />
              </div>
            </button>

            {/* Corps accordéon */}
            {openId === sec.id && (
              <div id={`sec-${sec.id}`} className="bg-card border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
                  {sec.liens.map((lien, i) => (
                    <a
                      key={lien.url}
                      href={lien.url}
                      target="_blank" rel="noopener noreferrer"
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group',
                        i > 0 && i % 2 === 0 ? 'md:border-t md:border-border' : '',
                        i > 1 ? 'md:border-t md:border-border' : '',
                      )}
                      aria-label={`${lien.label} — ${lien.desc} (ouvre dans un nouvel onglet)`}
                    >
                      <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{lien.emoji ?? '📎'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-balance">
                            {lien.label}
                          </p>
                          <ExternalLink className="w-3 h-3 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed text-pretty line-clamp-2">{lien.desc}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground border border-border font-medium">{lien.tag}</span>
                          {lien.gratuit && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-chart-2/10 text-chart-2 border border-chart-2/20 font-semibold">✓ Gratuit</span>
                          )}
                          {lien.niveaux && lien.niveaux.map(n => (
                            <span key={n} className="px-1.5 py-0.5 text-xs rounded bg-primary/10 text-primary border border-primary/20 font-medium">{n}</span>
                          ))}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <Link to="/etablissements" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <School className="w-3.5 h-3.5" />
          Trouver mon établissement (68 936 réels)
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
};

// ─── Config enrichie par catégorie ────────────────────────────────────────────
interface ToolItem   { path: string; icon: React.ElementType; label: string; desc: string; badge?: string }
interface SubjectItem { name: string; icon: string; path: string; color: string }
interface TipItem    { icon: React.ElementType; title: string; desc: string }
interface ActionItem { label: string; path: string; icon: React.ElementType }
interface StepItem   { step: number; title: string; desc: string }
interface ChallengeItem { icon: string; title: string; xp: number }

interface SpaceConfig {
  emoji: string;
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBg: string;
  accentColor: string;
  accentBg: string;
  accentText: string;
  examBadge: string | null;
  levelGroup: SchoolLevel[];
  defaultLevel: SchoolLevel;
  featuredTools: ToolItem[];
  extraTools: ToolItem[];
  subjects: SubjectItem[];
  tips: TipItem[];
  quickActions: ActionItem[];
  parcours: StepItem[];
  dailyChallenges: ChallengeItem[];
  studyTechnique: { name: string; duration: string; desc: string };
  motivationQuote: string;
}

const SPACE_CONFIGS: Record<CategoryId, SpaceConfig> = {
  // ─── PRIMAIRE — Vert émeraude ───────────────────────────────────────────────
  primaire: {
    emoji: '🏫', title: 'École Primaire', subtitle: 'CP · CE1 · CE2 · CM1 · CM2',
    heroTitle: 'Apprends, explore et amuse-toi !',
    heroSubtitle: 'Pose tes questions, consulte des fiches illustrées et organise tes devoirs facilement — tout est fait pour toi !',
    heroBg: 'linear-gradient(135deg, hsl(145 55% 25%) 0%, hsl(158 60% 36%) 100%)',
    accentColor: 'text-chart-2', accentBg: 'bg-chart-2/10', accentText: 'text-chart-2',
    examBadge: null,
    levelGroup: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'], defaultLevel: 'CM2',
    featuredTools: [
      { path: '/aide-ia',      icon: Brain,      label: 'Aide aux exercices',          desc: 'Explications claires et fiches méthode pas-à-pas pour chaque type d\'exercice', badge: 'Essentiel' },
      { path: '/organisation', icon: Calendar,   label: 'Mon agenda scolaire',         desc: 'Ajoute tes devoirs, gère les dates importantes et utilise le minuteur focus',   badge: 'Planning' },
      { path: '/flashcards',   icon: CreditCard, label: 'Mes flashcards',              desc: 'Tables de multiplication, orthographe, leçons — mémoriser en jouant',           badge: 'Mémoire' },
      { path: '/scanner',      icon: ScanLine,   label: 'Scanner un exercice',         desc: 'Prends une photo de ta feuille → explication instantanée étape par étape',      badge: 'Photo' },
    ],
    extraTools: [
      { path: '/chansons-educatives', icon: Zap,       label: '🎵 Chansons & Vidéos éducatives', desc: 'Alphabet en chanson, tables chantées, phonétique — apprendre en s\'amusant !' },
      { path: '/linguistique',        icon: Languages, label: 'Dictionnaire & conjugaison',      desc: 'Trouver un mot, conjuguer un verbe, corriger une phrase' },
      { path: '/notes',               icon: FileText,  label: 'Mes notes de cours',              desc: 'Écrire et garder mes résumés de leçons par matière' },
      { path: '/motivation',          icon: Trophy,    label: 'Mes badges & progrès',            desc: 'Voir mes XP, badges débloqués et défis du jour' },
    ],
    subjects: [
      { name: 'Maths',       icon: '🔢', path: '/maths-sciences', color: 'border-chart-1/30 hover:bg-chart-1/5' },
      { name: 'Français',    icon: '📝', path: '/linguistique',   color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Histoire',    icon: '🏛️', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
      { name: 'Géographie',  icon: '🌍', path: '/aide-ia',        color: 'border-chart-4/30 hover:bg-chart-4/5' },
      { name: 'Sciences',    icon: '🌿', path: '/aide-ia',        color: 'border-chart-5/30 hover:bg-chart-5/5' },
      { name: 'Arts & EPS',  icon: '🎨', path: '/aide-ia',        color: 'border-primary/30 hover:bg-primary/5' },
    ],
    tips: [
      { icon: Star,      title: 'Relis le soir',          desc: 'Relis ta leçon le soir même — tu la retiendras 2× mieux le lendemain matin.' },
      { icon: Clock,     title: 'Sessions de 15 min',     desc: '15 min de travail concentré, puis une vraie pause debout — plus efficace qu\'1h d\'un coup !' },
      { icon: Target,    title: 'Un exercice à la fois',  desc: 'Commence par l\'exercice le plus difficile quand tu es encore bien réveillé(e).' },
      { icon: Lightbulb, title: 'Pose des questions',     desc: 'Il n\'y a pas de question bête — demande à l\'assistant d\'expliquer autrement si tu ne comprends pas.' },
    ],
    quickActions: [
      { label: 'Mes devoirs du jour', path: '/organisation', icon: CheckSquare },
      { label: 'Fiches méthode',      path: '/aide-ia',      icon: Brain },
      { label: 'Mes progrès',         path: '/motivation',   icon: Trophy },
    ],
    parcours: [
      { step: 1, title: 'Ajoute tes devoirs dans l\'agenda',       desc: 'Liste tout ce que tu dois faire ce soir et coche au fur et à mesure' },
      { step: 2, title: 'Consulte ta 1ère fiche méthode',          desc: 'Choisis l\'exercice que tu ne comprends pas et suis la méthode étape par étape' },
      { step: 3, title: 'Crée tes 1ères flashcards',               desc: 'Tables de multiplication ou orthographe — commence avec 5 cartes' },
      { step: 4, title: 'Explore les ressources officielles',      desc: 'Regarde les fiches adaptées à ton niveau (Lumni, Canopé...)' },
      { step: 5, title: 'Gagne tes premiers badges',               desc: 'Complète les défis du jour pour débloquer des récompenses et XP' },
    ],
    dailyChallenges: [
      { icon: '🤔', title: 'Consulter 1 fiche méthode',    xp: 20 },
      { icon: '✅', title: 'Cocher 1 tâche de l\'agenda',  xp: 15 },
      { icon: '🃏', title: 'Réviser 3 flashcards',         xp: 10 },
    ],
    studyTechnique: { name: 'Technique des 15 min', duration: '15 min focus + 5 min pause active', desc: 'Parfait pour l\'école primaire : sessions courtes et efficaces. Debout, bouge, bois de l\'eau pendant la pause !' },
    motivationQuote: '« Chaque question que tu poses te rapproche d\'une étoile. »' },

  // ─── COLLÈGE — Violet indigo (distinct du lycée orange) ─────────────────────
  college: {
    emoji: '📚', title: 'Collège', subtitle: '6e · 5e · 4e · 3e',
    heroTitle: 'Réussis ton Brevet, étape par étape',
    heroSubtitle: 'Fiches de révision, annales corrigées, aide aux devoirs personnalisée et planning de révision — tout pour décrocher le Brevet.',
    heroBg: 'linear-gradient(135deg, hsl(258 65% 32%) 0%, hsl(270 60% 44%) 100%)',
    accentColor: 'text-chart-3', accentBg: 'bg-chart-3/10', accentText: 'text-chart-3',
    examBadge: 'Brevet',
    levelGroup: ['6e', '5e', '4e', '3e'], defaultLevel: '3e',
    featuredTools: [
      { path: '/aide-ia',        icon: Brain,      label: 'Aide aux devoirs',           desc: 'Fiches méthode détaillées pour chaque type d\'exercice et chaque matière',    badge: 'Devoirs' },
      { path: '/ressources',     icon: BookOpen,   label: 'Fiches & Annales Brevet',    desc: 'Résumés par matière, sujets du Brevet corrigés avec barèmes officiel',        badge: 'Brevet' },
      { path: '/organisation',   icon: Calendar,   label: 'Planning de révision',       desc: 'Agenda intelligent, timer Pomodoro 25/5 et gestion des priorités',            badge: 'Planning' },
      { path: '/flashcards',     icon: CreditCard, label: 'Flashcards Brevet',          desc: 'Cartes mémoire pour dates, définitions, formules — répétition espacée',       badge: 'Révision' },
    ],
    extraTools: [
      { path: '/maths-sciences', icon: Calculator, label: 'Maths & Sciences',           desc: 'Calculatrice, formulaire Brevet, tableau périodique, grapheur' },
      { path: '/linguistique',   icon: Languages,  label: 'Français & Langues',         desc: 'Correcteur, conjugueur, dictionnaire, aide à la rédaction' },
      { path: '/scanner',        icon: ScanLine,   label: 'Scanner un exercice',        desc: 'Photo d\'un problème → résolution guidée étape par étape' },
      { path: '/notes',          icon: FileText,   label: 'Notes de cours',             desc: 'Wiki personnel — organise tes résumés par matière et par chapitre' },
    ],
    subjects: [
      { name: 'Maths',           icon: '🔢', path: '/maths-sciences', color: 'border-chart-1/30 hover:bg-chart-1/5' },
      { name: 'Français',        icon: '📝', path: '/linguistique',   color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Histoire-Géo',    icon: '🌍', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
      { name: 'Physique-Chimie', icon: '⚡', path: '/maths-sciences', color: 'border-chart-4/30 hover:bg-chart-4/5' },
      { name: 'SVT',             icon: '🌿', path: '/aide-ia',        color: 'border-chart-5/30 hover:bg-chart-5/5' },
      { name: 'Anglais',         icon: '🇬🇧', path: '/linguistique',   color: 'border-primary/30 hover:bg-primary/5' },
      { name: 'Espagnol',        icon: '🇪🇸', path: '/linguistique',   color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Technologie',     icon: '⚙️', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
    ],
    tips: [
      { icon: BookMarked, title: 'Méthode Brevet',         desc: 'Lis l\'énoncé entier avant de commencer, souligne les mots-clés, structure ta réponse en 3 parties.' },
      { icon: Clock,      title: 'Révision espacée',       desc: 'Révise un chapitre → attends 3 jours → révise à nouveau : 2× plus efficace pour ancrer les notions.' },
      { icon: Target,     title: 'Annales = entraînement', desc: 'Fais 2 sujets d\'annales par matière en condition réelle avant le Brevet. Note tes erreurs, corrige-les.' },
      { icon: Layers,     title: 'Alterne les matières',   desc: '1 matière par demi-journée maximum — évite la fatigue mentale et améliore la mémorisation.' },
    ],
    quickActions: [
      { label: 'Mes devoirs',           path: '/organisation', icon: Calendar },
      { label: 'Mes flashcards',        path: '/flashcards',   icon: CreditCard },
      { label: 'Révision Brevet Maths', path: '/brevet-maths', icon: GraduationCap },
      { label: 'Mes progrès',           path: '/motivation',   icon: Trophy },
    ],
    parcours: [
      { step: 1, title: 'Identifier tes 3 matières à renforcer',  desc: 'Note ta maîtrise de 1 à 5 pour chaque matière — commence par les plus faibles' },
      { step: 2, title: 'Créer des flashcards par chapitre',      desc: '10 cartes par chapitre : dates, formules, définitions, vocabulaire' },
      { step: 3, title: 'Faire 2 annales corrigées par matière',  desc: 'En conditions réelles, chronomètre allumé — analyse chaque erreur après' },
      { step: 4, title: 'Planifier 4 semaines de révision',       desc: '1 matière/jour, weekends pour revoir les points faibles — note dans l\'agenda' },
      { step: 5, title: 'Compléter la quête "Survie au Collège"', desc: '10 missions pour 300 XP + badge Collège exclusif' },
    ],
    dailyChallenges: [
      { icon: '📚', title: 'Consulter 1 fiche de révision',  xp: 15 },
      { icon: '🃏', title: 'Réviser 5 flashcards',           xp: 25 },
      { icon: '✅', title: 'Cocher 1 tâche du planning',     xp: 20 },
    ],
    studyTechnique: { name: 'Pomodoro 25/5', duration: '25 min focus + 5 min pause', desc: 'La technique Pomodoro classique : idéale pour le collège. 4 sessions = 1 grande pause de 20 min. Parfait pour les révisions Brevet.' },
    motivationQuote: '« Le Brevet se prépare un exercice à la fois, chaque jour. »' },

  // ─── LYCÉE — Orange-rouge (couleur principale Apprenix) ────────────────────
  lycee: {
    emoji: '🎓', title: 'Lycée', subtitle: '2nde · 1ère · Terminale',
    heroTitle: 'Décroche ton Bac avec méthode',
    heroSubtitle: 'Dissertations guidées, annales Bac, flashcards Anki-style et Deep Focus Pomodoro — l\'arsenal complet pour réussir le Bac.',
    heroBg: 'linear-gradient(135deg, hsl(14 100% 44%) 0%, hsl(28 100% 54%) 100%)',
    accentColor: 'text-primary', accentBg: 'bg-primary/10', accentText: 'text-primary',
    examBadge: 'Bac 2026',
    levelGroup: ['2nde', '1ère', 'Terminale'], defaultLevel: 'Terminale',
    featuredTools: [
      { path: '/aide-ia',      icon: Brain,      label: 'Fiches méthode & Dissertation', desc: 'Méthode dissertation étape par étape, plan d\'argumentation, connecteurs logiques', badge: 'Bac' },
      { path: '/ressources',   icon: BookOpen,   label: 'Ressources & Annales Bac',      desc: 'Fiches de révision par spécialité, sujets corrigés, calendrier des épreuves',     badge: 'Révision' },
      { path: '/flashcards',   icon: CreditCard, label: 'Flashcards Anki-style',         desc: 'Répétition espacée : mémorise tout ton programme en 1 mois',                      badge: 'Mémoire' },
      { path: '/organisation', icon: Calendar,   label: 'Deep Focus Pomodoro',           desc: 'Sessions 50/10 min, stats de concentration et planning de révision intensif',     badge: 'Focus' },
    ],
    extraTools: [
      { path: '/linguistique',   icon: Languages,  label: 'Dissertation & rédaction',  desc: 'Correcteur avancé, plan d\'argumentation, analyse de texte' },
      { path: '/maths-sciences', icon: Calculator, label: 'Maths & Physique Bac',      desc: 'Formulaire complet, calculatrice scientifique, grapheur' },
      { path: '/scanner',        icon: ScanLine,   label: 'Scanner un sujet',           desc: 'Photo d\'un sujet Bac → plan guidé + explication étape par étape' },
      { path: '/notes',          icon: FileText,   label: 'Notes par spécialité',       desc: 'Wiki organisé par spécialité — résumés, schémas, filtres par tag' },
    ],
    subjects: [
      { name: 'Maths',        icon: '🔢', path: '/maths-sciences', color: 'border-chart-1/30 hover:bg-chart-1/5' },
      { name: 'Français',     icon: '📝', path: '/linguistique',   color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Philosophie',  icon: '🤔', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
      { name: 'Histoire-Géo', icon: '🏛️', path: '/aide-ia',        color: 'border-chart-4/30 hover:bg-chart-4/5' },
      { name: 'Physique',     icon: '⚡', path: '/maths-sciences', color: 'border-chart-5/30 hover:bg-chart-5/5' },
      { name: 'Anglais',      icon: '🇬🇧', path: '/linguistique',   color: 'border-primary/30 hover:bg-primary/5' },
      { name: 'SVT',          icon: '🌿', path: '/aide-ia',        color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Éco / SES',    icon: '📊', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
    ],
    tips: [
      { icon: PenLine,    title: 'Méthode dissertation',  desc: 'Thèse · Antithèse · Synthèse — chaque partie : 2 arguments + 1 exemple concret + 1 phrase de transition.' },
      { icon: Microscope, title: '1 annale/semaine',      desc: 'Une annale en conditions réelles par semaine suffit à maîtriser le format Bac. Chronomètre-toi.' },
      { icon: Flame,      title: 'Pomodoro 50/10',        desc: '50 min de focus total + 10 min de pause active — idéal pour les longues révisions lycée.' },
      { icon: BarChart2,  title: 'Suivi de progression',  desc: 'Note ta maîtrise de 1 à 5 pour chaque chapitre — attaque en priorité les chapitres notés 1 ou 2.' },
    ],
    quickActions: [
      { label: 'Mes notes',         path: '/notes',              icon: FileText },
      { label: 'Mon planning',      path: '/organisation',       icon: Calendar },
      { label: 'Révision Bac 2026', path: '/revision-bac-2026', icon: GraduationCap },
      { label: 'Mes progrès',       path: '/motivation',         icon: Trophy },
    ],
    parcours: [
      { step: 1, title: '1 deck de flashcards par spécialité',   desc: 'Formules, définitions, dates clés — commence avec 10 cartes par spécialité' },
      { step: 2, title: 'Rédiger 1 dissertation structurée',     desc: 'Utilise les fiches méthode pour construire ton plan complet en 15 min' },
      { step: 3, title: '2 annales corrigées par matière',       desc: 'Sujets récents en conditions réelles + analyse détaillée des erreurs' },
      { step: 4, title: 'Planifier 4 semaines Deep Focus',       desc: '3 sessions Pomodoro par jour, cibler les chapitres les plus faibles' },
      { step: 5, title: 'Compléter la quête "Décroche le Bac"', desc: '10 missions pour 500 XP + badge exclusif Bac' },
    ],
    dailyChallenges: [
      { icon: '🎓', title: 'Réviser 10 flashcards',            xp: 30 },
      { icon: '📝', title: 'Rédiger 1 intro de dissertation',  xp: 25 },
      { icon: '⏱',  title: 'Compléter 2 sessions Pomodoro',   xp: 40 },
    ],
    studyTechnique: { name: 'Pomodoro Deep Focus 50/10', duration: '50 min focus + 10 min pause', desc: 'Spécial lycée : sessions longues pour entrer dans l\'état de flow. 3 sessions consécutives = 1 pause de 30 min.' },
    motivationQuote: '« Le Bac se gagne dans les petites révisions quotidiennes, pas la veille. »' },

  // ─── SUPÉRIEUR — Bleu profond ───────────────────────────────────────────────
  superieur: {
    emoji: '🏛️', title: 'Supérieur', subtitle: 'BTS · Licence · Master · Grandes Écoles',
    heroTitle: 'Maîtrisez vos études supérieures',
    heroSubtitle: 'Wiki personnel avancé, mode Socratique, Pomodoro Deep Work 90/20, outil Remix de cours — la plateforme des étudiants exigeants.',
    heroBg: 'linear-gradient(135deg, hsl(213 90% 28%) 0%, hsl(222 85% 42%) 100%)',
    accentColor: 'text-chart-3', accentBg: 'bg-chart-3/10', accentText: 'text-chart-3',
    examBadge: 'Examens & Concours',
    levelGroup: ['BTS', 'Licence', 'Master', 'Grandes Écoles'], defaultLevel: 'Licence',
    featuredTools: [
      { path: '/notes',        icon: FileText,    label: 'Wiki personnel avancé',       desc: 'Notes Notion-like : tags, liens entre concepts, recherche plein texte, export',  badge: 'Wiki' },
      { path: '/aide-ia',      icon: Brain,       label: 'Fiches méthode avancées',     desc: 'Raisonnement structuré, analyse critique, méthode Socratique guidée',            badge: 'Analyse' },
      { path: '/organisation', icon: Calendar,    label: 'Deep Work Pomodoro 90/20',   desc: 'Sessions de 90 min, score de concentration, indice de charge cognitive',        badge: 'Deep Work' },
      { path: '/ressources',   icon: BookOpen,    label: 'Remix de cours',              desc: 'Transformer vos cours en flashcards, quiz, fiches de révision ou carte mentale', badge: 'Remix' },
    ],
    extraTools: [
      { path: '/flashcards',     icon: CreditCard, label: 'Flashcards par UE',          desc: 'Répétition espacée par unité d\'enseignement — synchronisée avec vos notes' },
      { path: '/maths-sciences', icon: Sigma,      label: 'Maths sup & Physique',       desc: 'Formulaire avancé : intégrales, probabilités, statistiques, suites' },
      { path: '/linguistique',   icon: Languages,  label: 'Rédaction académique',       desc: 'Rapport, note de synthèse, abstract, email professionnel, anglais académique' },
      { path: '/scanner',        icon: ScanLine,   label: 'Scanner & analyser',         desc: 'OCR de cours ou exercice → explication détaillée étape par étape' },
    ],
    subjects: [
      { name: 'Maths',         icon: '∑',  path: '/maths-sciences', color: 'border-chart-1/30 hover:bg-chart-1/5' },
      { name: 'Philosophie',   icon: '🤔', path: '/aide-ia',        color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Économie',      icon: '📊', path: '/aide-ia',        color: 'border-chart-3/30 hover:bg-chart-3/5' },
      { name: 'Anglais',       icon: '🇬🇧', path: '/linguistique',   color: 'border-chart-4/30 hover:bg-chart-4/5' },
      { name: 'Physique',      icon: '⚡', path: '/maths-sciences', color: 'border-chart-5/30 hover:bg-chart-5/5' },
      { name: 'Informatique',  icon: '💻', path: '/aide-ia',        color: 'border-primary/30 hover:bg-primary/5' },
      { name: 'Droit',         icon: '⚖️', path: '/aide-ia',        color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Chimie',        icon: '🧪', path: '/maths-sciences', color: 'border-chart-3/30 hover:bg-chart-3/5' },
    ],
    tips: [
      { icon: Globe,         title: 'Technique Feynman',     desc: 'Expliquez un concept à voix haute comme si vous l\'enseigniez — c\'est la vraie façon de tester votre maîtrise.' },
      { icon: Dumbbell,      title: 'Blocs Deep Work',        desc: 'Bloquez 2 × 90 min par jour de travail sans interruption — téléphone en mode avion, notifications off.' },
      { icon: BookMarked,    title: 'Synthèse hebdomadaire', desc: 'Chaque vendredi : rédigez une note de synthèse de tout ce que vous avez appris dans la semaine.' },
      { icon: MessageSquare, title: 'Mode Socratique',        desc: 'L\'assistant vous challenge sur vos idées — excellent pour préparer les oraux et concours.' },
    ],
    quickActions: [
      { label: 'Mes notes',         path: '/notes',          icon: FileText },
      { label: 'Maths & Sciences',  path: '/maths-sciences', icon: Calculator },
      { label: 'Mode Deep Work',    path: '/focus',          icon: Target },
      { label: 'Mes progrès',       path: '/motivation',     icon: Trophy },
    ],
    parcours: [
      { step: 1, title: 'Créer 1 deck de flashcards par UE',     desc: 'Organiser par unité d\'enseignement — 15 cartes pour démarrer efficacement' },
      { step: 2, title: 'Rédiger 5 notes de cours en wiki',      desc: 'Tags, liens entre concepts, résumés — construire votre base de connaissances' },
      { step: 3, title: 'Compléter 5 sessions Deep Work 90 min', desc: 'Focus total, téléphone en mode avion — noter votre score de concentration' },
      { step: 4, title: 'Utiliser Remix 3 fois sur vos cours',   desc: 'Transformer 3 cours en quiz ou cartes mentales exploitables directement' },
      { step: 5, title: 'Valider la quête "Grandes Écoles"',     desc: '5 missions stratégiques pour 600 XP + badge d\'excellence exclusif' },
    ],
    dailyChallenges: [
      { icon: '🏛️', title: 'Créer 3 notes de cours en wiki',     xp: 30 },
      { icon: '🧠', title: 'Session mode Socratique',             xp: 35 },
      { icon: '⚡', title: '1 bloc Deep Work complet (90 min)',   xp: 50 },
    ],
    studyTechnique: { name: 'Deep Work 90/20', duration: '90 min focus total + 20 min pause', desc: 'Inspiré de Cal Newport : 2 sessions de 90 min par jour, téléphone en mode avion. Plus efficace que 4h de travail distrait.' },
    motivationQuote: '« L\'excellence n\'est pas un acte, c\'est une habitude. » — Aristote' },

  // ─── ULIS / SEGPA — Vert doux ───────────────────────────────────────────────
  adapte: {
    emoji: '💚', title: 'ULIS & SEGPA', subtitle: 'Dispositif adapté · Apprentissage à ton rythme',
    heroTitle: 'Ton espace adapté — ULIS & SEGPA',
    heroSubtitle: 'Des explications en mots simples, des exercices étape par étape et des outils pensés pour toi. Avance à ton rythme, sans pression.',
    heroBg: 'linear-gradient(135deg, hsl(145 50% 28%) 0%, hsl(160 55% 38%) 100%)',
    accentColor: 'text-chart-2', accentBg: 'bg-chart-2/10', accentText: 'text-chart-2',
    examBadge: null,
    levelGroup: ['ULIS', 'SEGPA'], defaultLevel: 'ULIS',
    featuredTools: [
      { path: '/aide-ia',      icon: Brain,      label: 'Aide aux devoirs ULIS',      desc: 'Active le mode ULIS/SEGPA pour des explications courtes, visuelles et étape par étape', badge: 'Mode 💚' },
      { path: '/flashcards',   icon: CreditCard, label: 'Flashcards visuelles',       desc: 'Mémoriser avec des cartes illustrées — tables, mots, images et vie quotidienne',          badge: 'Mémoire' },
      { path: '/organisation', icon: Calendar,   label: 'Mon emploi du temps',        desc: 'Organiser ses journées, ses devoirs et ses activités avec un agenda simple',              badge: 'Planning' },
      { path: '/inclusion',    icon: Heart,      label: 'Ressources & droits',        desc: 'Fiches ULIS/SEGPA, droits scolaires, associations et contacts utiles',                   badge: 'Aide' },
    ],
    extraTools: [
      { path: '/scanner',      icon: ScanLine,   label: 'Scanner un exercice',        desc: 'Prends une photo de ta feuille → explication simple et guidée' },
      { path: '/linguistique', icon: Languages,  label: 'Dictionnaire illustré',      desc: 'Chercher un mot, écouter sa prononciation, trouver un synonyme simple' },
      { path: '/motivation',   icon: Trophy,     label: 'Mes badges & progrès',       desc: 'Voir mes XP et badges débloqués — chaque étape compte !' },
    ],
    subjects: [
      { name: 'Lecture',           icon: '📖', path: '/aide-ia',      color: 'border-chart-2/30 hover:bg-chart-2/5' },
      { name: 'Calcul',            icon: '🔢', path: '/maths-sciences',color: 'border-chart-1/30 hover:bg-chart-1/5' },
      { name: 'Français',          icon: '📝', path: '/linguistique',  color: 'border-chart-3/30 hover:bg-chart-3/5' },
      { name: 'Vie quotidienne',   icon: '🏠', path: '/aide-ia',      color: 'border-chart-4/30 hover:bg-chart-4/5' },
      { name: 'Vie sociale',       icon: '🤝', path: '/aide-ia',      color: 'border-chart-5/30 hover:bg-chart-5/5' },
      { name: 'Orientation',       icon: '🎯', path: '/aide-ia',      color: 'border-primary/30 hover:bg-primary/5' },
    ],
    tips: [
      { icon: Star,      title: 'Étape par étape',       desc: 'Lis chaque consigne lentement. Si tu ne comprends pas un mot, demande à l\'assistant — il explique en mots simples.' },
      { icon: Clock,     title: 'Sessions de 10 min',    desc: '10 min de travail, puis une pause. Ton cerveau apprend mieux par petites sessions régulières.' },
      { icon: Target,    title: 'Une chose à la fois',   desc: 'Concentre-toi sur un seul exercice avant de passer au suivant. C\'est la clé de la réussite.' },
      { icon: Lightbulb, title: 'Pose des questions',    desc: 'Toutes les questions sont bonnes — l\'assistant te répond toujours avec patience et clarté.' },
    ],
    quickActions: [
      { label: 'Aide aux devoirs 💚', path: '/aide-ia',      icon: Brain },
      { label: 'Mes flashcards',      path: '/flashcards',   icon: CreditCard },
      { label: 'Mon agenda',          path: '/organisation', icon: Calendar },
    ],
    parcours: [
      { step: 1, title: 'Active le mode ULIS/SEGPA dans l\'aide',  desc: 'Dans la page aide aux devoirs, appuie sur le bouton vert "Mode ULIS/SEGPA"' },
      { step: 2, title: 'Pose ta première question',               desc: 'Écris ce que tu ne comprends pas — en mots simples, c\'est très bien !' },
      { step: 3, title: 'Crée 3 flashcards visuelles',             desc: 'Tables de multiplication, mots importants ou leçons de vie quotidienne' },
      { step: 4, title: 'Explore les ressources inclusion',        desc: 'Fiches adaptées ULIS/SEGPA, associations, droits et contacts utiles' },
      { step: 5, title: 'Gagne ton premier badge 💚',              desc: 'Complète ton premier défi du jour pour débloquer une récompense !' },
    ],
    dailyChallenges: [
      { icon: '💚', title: 'Utiliser l\'aide aux devoirs',        xp: 20 },
      { icon: '🃏', title: 'Réviser 3 flashcards',               xp: 10 },
      { icon: '✅', title: 'Cocher 1 tâche de l\'agenda',        xp: 15 },
    ],
    studyTechnique: { name: 'Sessions de 10 min', duration: '10 min focus + 5 min pause', desc: 'Courtes sessions régulières : ton cerveau retient mieux. Bois de l\'eau, bouge pendant la pause, puis recommence !' },
    motivationQuote: '« Chaque petit pas compte. Tu avances, et c\'est ce qui importe. 💚 »' } };

// ─── Calendrier des épreuves 2026 — Brevet & Bac ──────────────────────────────
interface ExamEvent {
  id: string;
  label: string;
  sublabel: string;
  date: Date;
  endDate?: Date;
  category: 'college' | 'lycee' | 'both';
  emoji: string;
  // Dossier de révision
  matieres?: string[];
  tips?: string[];
  tools?: { path: string; icon: React.ElementType; label: string; colorBg: string; colorText: string }[];
  guideLink?: string;
  guideLinkLabel?: string;
}

// ── Dates officielles vérifiées — calendrier Éducation nationale 2026 ──────────
const EXAM_EVENTS_2026: ExamEvent[] = [
  // ── BAC — épreuves anticipées (1ère) ────────────────────────────────────────
  {
    id: 'bac-francais-1ere',
    label: 'Bac Français — écrit (1ère)',
    sublabel: '1ère générale & technologique · écrit anticipé',
    date: new Date('2026-06-17T08:00:00'),
    endDate: new Date('2026-06-18T18:00:00'),
    category: 'lycee', emoji: '✍️',
    guideLink: '/linguistique', guideLinkLabel: 'Outils rédaction',
    matieres: ['Commentaire composé', 'Dissertation littéraire', 'Contraction + essai (techno)'],
    tips: [
      'Maîtrise les 3 mouvements littéraires du programme : classicisme, romantisme, surréalisme',
      'Entraîne-toi sur au moins 2 sujets de commentaire et 2 dissertations avant l\'écrit',
      'Pour la contraction : vise 25% du texte original, ni plus ni moins',
    ],
    tools: [
      { path: '/linguistique', icon: PenLine,    label: 'Rédaction',   colorBg: 'bg-violet-100 dark:bg-violet-900/30', colorText: 'text-violet-700 dark:text-violet-300' },
      { path: '/flashcards',   icon: CreditCard, label: 'Flashcards',  colorBg: 'bg-blue-100 dark:bg-blue-900/30',    colorText: 'text-blue-700 dark:text-blue-300'    },
      { path: '/aide-ia',      icon: Brain,      label: 'Aide IA',     colorBg: 'bg-amber-100 dark:bg-amber-900/30',  colorText: 'text-amber-700 dark:text-amber-400'  },
    ],
  },
  // ── BAC — épreuves terminales écrites ───────────────────────────────────────
  {
    id: 'bac-philo',
    label: 'Bac Philosophie',
    sublabel: 'Terminale · 1ʳᵉ épreuve écrite · 4h',
    date: new Date('2026-06-17T08:00:00'),
    endDate: new Date('2026-06-17T18:00:00'),
    category: 'lycee', emoji: '📜',
    guideLink: '/aide-ia', guideLinkLabel: 'Fiches Philo',
    matieres: ['Dissertation (2 sujets)', 'Explication de texte (1 sujet)'],
    tips: [
      'Intro : accroche + problématique + annonce plan en 20 min max',
      'Chaque partie : thèse + argument + exemple + transition',
      'Réserve 15 min pour relire et corriger les fautes logiques',
    ],
    tools: [
      { path: '/aide-ia',      icon: Brain,      label: 'Fiches méthode', colorBg: 'bg-amber-100 dark:bg-amber-900/30',  colorText: 'text-amber-700 dark:text-amber-400'  },
      { path: '/flashcards',   icon: CreditCard, label: 'Flashcards',     colorBg: 'bg-blue-100 dark:bg-blue-900/30',    colorText: 'text-blue-700 dark:text-blue-300'    },
      { path: '/notes',        icon: FileText,   label: 'Mes notes',      colorBg: 'bg-emerald-100 dark:bg-emerald-900/30', colorText: 'text-emerald-700 dark:text-emerald-300' },
    ],
  },
  {
    id: 'bac-ecrits-terminale',
    label: 'Bac — Épreuves écrites Terminale',
    sublabel: 'Spécialités non-passées en mars + LV · 17-20 juin',
    date: new Date('2026-06-17T08:00:00'),
    endDate: new Date('2026-06-20T18:00:00'),
    category: 'lycee', emoji: '📝',
    guideLink: '/ressources', guideLinkLabel: 'Ressources Bac',
    matieres: ['Maths Complémentaires', 'Sciences Ingénieur', 'Langues vivantes', 'EPS', 'Enseignement Moral & Civique'],
    tips: [
      'Maths complémentaires : revoir les probabilités, suites et intégrales',
      'Langues : vocabulaire thématique + compréhension de l\'oral en conditions réelles',
      'EMC : révise les notions de démocratie, laïcité, droits de l\'Homme',
    ],
    tools: [
      { path: '/flashcards',    icon: CreditCard,  label: 'Flashcards',  colorBg: 'bg-blue-100 dark:bg-blue-900/30',    colorText: 'text-blue-700 dark:text-blue-300'    },
      { path: '/maths-sciences',icon: Calculator,  label: 'Maths',       colorBg: 'bg-violet-100 dark:bg-violet-900/30',colorText: 'text-violet-700 dark:text-violet-300' },
      { path: '/linguistique',  icon: Languages,   label: 'Langues',     colorBg: 'bg-emerald-100 dark:bg-emerald-900/30', colorText: 'text-emerald-700 dark:text-emerald-300' },
    ],
  },
  {
    id: 'grand-oral',
    label: 'Grand Oral',
    sublabel: 'Terminale · 20 min préparation + 20 min oral',
    date: new Date('2026-06-23T08:00:00'),
    endDate: new Date('2026-07-03T18:00:00'),
    category: 'lycee', emoji: '🎤',
    guideLink: '/aide-ia', guideLinkLabel: 'Préparer l\'oral',
    matieres: ['Question 1 — croisement 2 spécialités', 'Question 2 — projet d\'orientation', 'Échange avec le jury (5 min)'],
    tips: [
      '2 questions à préparer : choisir celle qui valorise ton projet d\'orientation',
      'Les 20 min de préparation : note le plan sur papier, pas de texte rédigé',
      'Pose des questions au jury si tu veux — ça montre ta curiosité intellectuelle',
    ],
    tools: [
      { path: '/aide-ia',      icon: Brain,      label: 'Fiches méthode', colorBg: 'bg-amber-100 dark:bg-amber-900/30',  colorText: 'text-amber-700 dark:text-amber-400'  },
      { path: '/flashcards',   icon: CreditCard, label: 'Flashcards',     colorBg: 'bg-blue-100 dark:bg-blue-900/30',    colorText: 'text-blue-700 dark:text-blue-300'    },
      { path: '/notes',        icon: FileText,   label: 'Mes notes',      colorBg: 'bg-emerald-100 dark:bg-emerald-900/30', colorText: 'text-emerald-700 dark:text-emerald-300' },
    ],
  },
  // ── BREVET (college) ────────────────────────────────────────────────────────
  {
    id: 'brevet',
    label: 'Brevet des collèges',
    sublabel: '3ème · épreuves écrites + oral soutenance',
    date: new Date('2026-06-25T08:00:00'),
    endDate: new Date('2026-06-26T18:00:00'),
    category: 'college', emoji: '📚',
    guideLink: '/brevet-maths', guideLinkLabel: 'Guide Brevet Maths',
    matieres: ['Français (3h)', 'Maths (2h)', 'Histoire-Géo + EMC (2h)', 'Sciences (SVT + Physique-Chimie, 1h)', 'Oral soutenance projet'],
    tips: [
      'Français : 1 dictée + questions sur texte + rédaction — alloue 40 min à la rédaction',
      'Maths : commence par les exercices que tu maîtrises, laisse le plus dur pour la fin',
      'Oral soutenance : présente un projet réel (EPI, option arts, sport…) en 5 min + 10 min questions',
    ],
    tools: [
      { path: '/flashcards',    icon: CreditCard,  label: 'Flashcards',  colorBg: 'bg-blue-100 dark:bg-blue-900/30',    colorText: 'text-blue-700 dark:text-blue-300'    },
      { path: '/maths-sciences',icon: Calculator,  label: 'Maths',       colorBg: 'bg-violet-100 dark:bg-violet-900/30',colorText: 'text-violet-700 dark:text-violet-300' },
      { path: '/aide-ia',       icon: Brain,       label: 'Aide IA',     colorBg: 'bg-amber-100 dark:bg-amber-900/30',  colorText: 'text-amber-700 dark:text-amber-400'  },
      { path: '/scanner',       icon: ScanLine,    label: 'Scanner',     colorBg: 'bg-emerald-100 dark:bg-emerald-900/30', colorText: 'text-emerald-700 dark:text-emerald-300' },
    ],
  },
  // ── Résultats ───────────────────────────────────────────────────────────────
  {
    id: 'res-brevet',
    label: 'Résultats Brevet',
    sublabel: 'Publication sur Scolarité Services',
    date: new Date('2026-07-04T10:00:00'),
    category: 'college', emoji: '🏅',
    tips: ['Retrouve tes résultats sur scolarite-services.education.gouv.fr'],
  },
  {
    id: 'res-bac',
    label: 'Résultats du Bac',
    sublabel: 'Publication sur Scolarité Services + rattrapages',
    date: new Date('2026-07-07T10:00:00'),
    category: 'lycee', emoji: '🎓',
    tips: [
      'Résultats sur scolarite-services.education.gouv.fr',
      'Rattrapage oral : 8-9 juillet pour les candidats entre 8 et 9,99/20',
    ],
  },
];

function daysFromNow(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const ExamCalendarBanner: React.FC<{ categoryId: 'college' | 'lycee' }> = ({ categoryId }) => {
  const now = Date.now();
  const [openDossier, setOpenDossier] = React.useState<string | null>(null);

  const events = useMemo(() =>
    EXAM_EVENTS_2026
      .filter(e => e.category === categoryId || e.category === 'both')
      .map(e => ({
        ...e,
        daysLeft: daysFromNow(e.date),
        isPast: (e.endDate ?? e.date).getTime() < now,
        isToday: daysFromNow(e.date) <= 0 && (e.endDate ?? e.date).getTime() >= now,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
  [categoryId, now]);

  const nextEvent = events.find(e => !e.isPast);
  const daysLeft  = nextEvent ? Math.max(0, daysFromNow(nextEvent.date)) : 0;
  const urgency   = !nextEvent ? 'done' : daysLeft <= 3 ? 'critical' : daysLeft <= 10 ? 'high' : 'normal';

  const bannerStyle: React.CSSProperties = urgency === 'critical'
    ? { background: 'linear-gradient(135deg, hsl(0 75% 26%) 0%, hsl(22 85% 34%) 100%)' }
    : urgency === 'high'
    ? { background: 'linear-gradient(135deg, hsl(22 82% 30%) 0%, hsl(42 88% 38%) 100%)' }
    : urgency === 'done'
    ? { background: 'linear-gradient(135deg, hsl(142 55% 26%) 0%, hsl(162 50% 32%) 100%)' }
    : categoryId === 'lycee'
    ? { background: 'linear-gradient(135deg, hsl(14 95% 38%) 0%, hsl(30 90% 44%) 100%)' }
    : { background: 'linear-gradient(135deg, hsl(38 88% 30%) 0%, hsl(210 70% 40%) 100%)' };

  const title = categoryId === 'lycee' ? 'Bac 2026' : 'Brevet 2026';

  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={bannerStyle}
      aria-label={`Calendrier des épreuves ${title}`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-8 left-1/4 w-28 h-28 rounded-full bg-white/[0.06] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 p-4 md:p-5 flex flex-col gap-4">

        {/* ── En-tête ── */}
        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-extrabold text-white leading-tight">
                  📅 Calendrier {title}
                </p>
                {urgency === 'critical' && nextEvent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/25 border border-white/35 text-white text-xs font-bold animate-pulse">
                    🔥 J-{daysLeft}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/75 mt-0.5">
                {urgency === 'done'
                  ? '✅ Toutes les épreuves sont terminées — bravo !'
                  : nextEvent?.isToday
                  ? `🎯 Aujourd'hui : ${nextEvent.label} — bonne chance !`
                  : nextEvent
                  ? `Prochain : ${nextEvent.label} dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                  : ''}
              </p>
            </div>
          </div>
          {nextEvent && !nextEvent.isToday && (
            <div className="flex flex-col items-center bg-white/20 border border-white/30 rounded-xl px-3 py-2 min-w-[52px] shrink-0 self-start">
              <span className="text-2xl font-black text-white leading-none">{daysLeft}</span>
              <span className="text-[10px] text-white/65 font-medium mt-0.5 uppercase tracking-wide">jour{daysLeft !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* ── Timeline + dossiers ── */}
        <div>
          <p className="text-[11px] text-white/50 font-semibold uppercase tracking-wider mb-2.5">
            Calendrier officiel & dossiers de révision
          </p>
          <div className="flex flex-col gap-2">
            {events.map(ev => {
              const days = daysFromNow(ev.date);
              const past = ev.isPast;
              const today = ev.isToday;
              const isOpen = openDossier === ev.id;
              const hasDossier = !past && ((ev.matieres?.length ?? 0) > 0 || (ev.tips?.length ?? 0) > 0);

              return (
                <div key={ev.id} className="flex flex-col rounded-xl border overflow-hidden"
                  style={{ borderColor: past ? 'rgba(255,255,255,0.1)' : today ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)' }}>

                  {/* Ligne principale */}
                  <div className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5',
                    past ? 'bg-white/[0.05] opacity-55' : today ? 'bg-white/25' : 'bg-white/10 hover:bg-white/15',
                    hasDossier && 'cursor-pointer',
                  )}
                    onClick={() => hasDossier && setOpenDossier(isOpen ? null : ev.id)}
                    role={hasDossier ? 'button' : undefined}
                    aria-expanded={hasDossier ? isOpen : undefined}
                  >
                    <span className="text-base shrink-0">{ev.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold leading-tight', past ? 'text-white/55 line-through' : 'text-white')}>
                        {ev.label}
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5 truncate">{ev.sublabel}</p>
                    </div>

                    {/* J-X ou statut */}
                    <div className="shrink-0 text-right mr-1">
                      {past ? (
                        <span className="text-[10px] text-white/40 font-medium">✓ Passé</span>
                      ) : today ? (
                        <span className="text-[10px] text-white font-bold animate-pulse">Auj.</span>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={cn('text-xs font-bold', days <= 3 ? 'text-white' : 'text-white/80')}>J-{days}</span>
                          <span className="text-[9px] text-white/45 whitespace-nowrap">
                            {ev.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dossier toggle */}
                    {hasDossier && (
                      <div className={cn('shrink-0 w-5 h-5 rounded-md border border-white/30 flex items-center justify-center transition-transform', isOpen && 'rotate-180')}>
                        <ChevronRight className="w-3 h-3 text-white/70 rotate-90" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Dossier expansible */}
                  {hasDossier && isOpen && (
                    <div className="bg-black/20 px-4 py-3 flex flex-col gap-3 border-t border-white/10">

                      {/* Matières */}
                      {ev.matieres && ev.matieres.length > 0 && (
                        <div>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
                            Épreuves du jour
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.matieres.map(m => (
                              <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-[11px] text-white font-medium">
                                <CheckCircle className="w-2.5 h-2.5 text-white/60 shrink-0" aria-hidden="true" />
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conseils */}
                      {ev.tips && ev.tips.length > 0 && (
                        <div>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
                            Conseils clés
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {ev.tips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">{i + 1}</span>
                                <span className="text-pretty">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outils spécifiques */}
                      {ev.tools && ev.tools.length > 0 && (
                        <div>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
                            Outils recommandés
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ev.tools.map(({ path, icon: Icon, label, colorBg, colorText }) => (
                              <Link key={path} to={path}>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/90 hover:bg-white active:scale-95 transition-all duration-150 cursor-pointer shadow-sm">
                                  <div className={cn('w-4 h-4 rounded-md flex items-center justify-center shrink-0', colorBg)}>
                                    <Icon className={cn('w-2.5 h-2.5', colorText)} aria-hidden="true" />
                                  </div>
                                  <span className="text-foreground">{label}</span>
                                </div>
                              </Link>
                            ))}
                            {ev.guideLink && (
                              <Link to={ev.guideLink}>
                                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/20 border border-white/35 text-white hover:bg-white/30 active:scale-95 transition-all duration-150 cursor-pointer">
                                  {ev.guideLinkLabel} <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Composant contenu du tableau de bord (catégorie depuis URL prop) ──
export const EspaceNiveauContent: React.FC<{ urlCategory?: string }> = ({ urlCategory }) => {
  const { level, setLevel, profile, badges, todos, flashcards, challenges, quests, pomodoroSessions } = useApp();

  // La catégorie provient de l'URL (/espace/:category) ; fallback sur le niveau du profil
  const validCategories = new Set(['primaire', 'college', 'lycee', 'superieur', 'adapte']);
  const category = (urlCategory && validCategories.has(urlCategory)
    ? urlCategory
    : getLevelCategory(level)) as CategoryId;
  const config = SPACE_CONFIGS[category];
  const niveauRessources = RESSOURCES_PAR_CATEGORIE[category] ?? [];

  // Synchronise le niveau du profil avec la catégorie de l'URL
  // (permet aux sélecteurs internes de cohérence, sans forcer le niveau exact)
  useEffect(() => {
    if (urlCategory && validCategories.has(urlCategory)) {
      const currentCat = getLevelCategory(level);
      if (currentCat !== urlCategory) {
        // Choisit le niveau par défaut de la catégorie URL si l'utilisateur change de section
        const defaultLevels: Record<string, import('@/types/types').SchoolLevel> = {
          primaire: 'CM2', college: '3e', lycee: '2nde', superieur: 'Licence', adapte: 'ULIS',
        };
        setLevel(defaultLevels[urlCategory] ?? '2nde');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string }> = {
    primaire:  { title: 'Espace École Primaire — CP au CM2', description: 'Outils éducatifs gratuits pour l\'école primaire : aide aux devoirs, fiches méthode, flashcards et organisation scolaire. Du CP au CM2 avec Apprenix.', keywords: 'école primaire gratuit, aide devoirs CP CE1 CE2 CM1 CM2, révision primaire, fiches école, Apprenix primaire' },
    college:   { title: 'Espace Collège — 6e à 3e',          description: 'Tous les outils pour réussir au collège : aide aux devoirs, fiches méthode, flashcards, organisation et brevet. De la 6e à la 3e avec Apprenix.', keywords: 'collège gratuit, aide devoirs collège, révision brevet, fiches 6ème 5ème 4ème 3ème, Apprenix collège' },
    lycee:     { title: 'Espace Lycée — 2nde à Terminale',   description: 'Prépare ton bac avec Apprenix : aide aux devoirs, fiches méthode, flashcards, organisation et dissertation. De la 2nde à la Terminale, 100% gratuit.', keywords: 'lycée gratuit, aide devoirs lycée, révision bac, fiches terminale, dissertation philo, Apprenix lycée' },
    superieur: { title: 'Espace Supérieur — BTS, Licence, Master', description: 'Outils pédagogiques gratuits pour les étudiants du supérieur : aide aux devoirs, fiches méthode, flashcards et organisation. BTS, Licence, Master avec Apprenix.', keywords: 'enseignement supérieur gratuit, aide devoirs université, révision licence master BTS, fiches études supérieures' },
    adapte:    { title: 'Espace ULIS & SEGPA — Dispositif adapté', description: 'Outils éducatifs gratuits pour les élèves ULIS et SEGPA : aide aux devoirs en mode simplifié, fiches méthode illustrées, flashcards visuelles et ressources inclusion.', keywords: 'ULIS gratuit, SEGPA aide devoirs, dispositif adapté scolaire, ressources inclusion, Apprenix ULIS SEGPA' },
  };
  const seo = CATEGORY_SEO[category] ?? CATEGORY_SEO['lycee'];

  // ── Stats ──
  const today = new Date().toISOString().split('T')[0];
  const dueCards = flashcards.filter(c => c.nextReview <= today);
  const pendingTodos = todos.filter(t => !t.completed);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const dailyChallengesDone = challenges.filter(c => c.type === 'daily' && c.completed).length;
  const dailyChallengesTotal = challenges.filter(c => c.type === 'daily').length;
  const { xpToNext, progress: xpProgress, next: xpNextLevel } = getXpInfo(profile.xpPoints);
  const totalFocusMin = pomodoroSessions.reduce((acc, s) => acc + s.workMinutes, 0);

  const categoryQuest = quests.find(q => q.levelCategory === category);
  const questDone = categoryQuest?.missions.filter(m => m.completed).length ?? 0;
  const questTotal = categoryQuest?.missions.length ?? 0;
  const questPct = questTotal > 0 ? Math.round((questDone / questTotal) * 100) : 0;

  // Changer de niveau : navigue vers la bonne URL de catégorie
  const navigate = useNavigate();
  const handleLevelSwitch = (newLevel: SchoolLevel) => {
    setLevel(newLevel);
    const newCat = getLevelCategory(newLevel);
    navigate(`/espace/${newCat}`, { replace: true });
  };

  return (
    <div className="min-w-0 space-y-4 md:space-y-6 px-3 md:px-5 py-4 md:py-6">
      <SEO
        title={`${seo.title} | Apprenix`}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`/espace/${category}`}
        dateModified="2026-06-18"
      />

      {/* ── Hero — style dashboard moderne ── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: config.heroBg }}
        aria-label={`Espace ${config.title}`}
      >
        {/* Cercles décoratifs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -right-4 w-36 h-36 rounded-full bg-white/8" />
          <div className="absolute top-1/2 -translate-y-1/2 right-20 w-20 h-20 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 left-1/4 w-32 h-32 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 px-5 py-6 md:px-8 md:py-7">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {config.emoji} {config.title}
            </span>
            {config.examBadge && (
              <span className="inline-flex items-center bg-white/25 border border-white/35 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                🎯 {config.examBadge}
              </span>
            )}
            <ENBadge className="bg-white/20 text-white border-white/30 dark:bg-white/20 dark:text-white dark:border-white/30" />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1.5 text-balance leading-tight">
            {config.heroTitle}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed mb-4">
            {config.heroSubtitle}
          </p>

          {/* Sélecteur sous-niveau — pills blanches */}
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Choisir un sous-niveau">
            {config.levelGroup.map(l => (
              <button type="button" key={l} onClick={() => handleLevelSwitch(l)}
                aria-pressed={level === l}
                aria-label={`Passer en ${l}`}
                className={cn(
                  'min-h-[44px] px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150',
                  level === l
                    ? 'bg-white text-foreground border-white shadow-md scale-105'
                    : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                )}>
                {l}
              </button>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2">
            {config.quickActions.map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button variant="ghost" size="sm" className="h-8 text-xs border border-white/40 text-white hover:bg-white/20 font-medium rounded-xl">
                  <Icon className="w-3.5 h-3.5 mr-1.5" />{label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats — ligne de 4 cartes épurées ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" aria-label="Statistiques de progression">
        {[
          { label: 'XP Total',       value: profile.xpPoints,                       sub: xpNextLevel ? `encore ${xpToNext} XP → ${xpNextLevel.name}` : '🌟 Niveau max', icon: Zap,       iconBg: 'bg-amber-100 dark:bg-amber-900/30',   iconColor: 'text-amber-600 dark:text-amber-400',   progress: xpProgress },
          { label: 'Série',          value: `${profile.streakDays}j`,               sub: 'jours consécutifs',                             icon: Flame,     iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500 dark:text-orange-400' },
          { label: 'Flashcards',     value: dueCards.length,                        sub: 'à réviser auj.',                                icon: CreditCard,iconBg: 'bg-blue-100 dark:bg-blue-900/30',    iconColor: 'text-blue-600 dark:text-blue-400'     },
          { label: 'Défis du jour',  value: `${dailyChallengesDone}/${dailyChallengesTotal}`, sub: 'complétés',                           icon: Trophy,    iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, progress }) => (
          <Card key={label} className="h-full shadow-sm border-border/60">
            <CardContent className="p-3 md:p-4 flex flex-col gap-1.5 md:gap-2">
              {/* Icône cercle */}
              <div className={cn('w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0', iconBg)}>
                <Icon className={cn('w-3.5 h-3.5 md:w-4 md:h-4', iconColor)} />
              </div>
              <span className="text-xl md:text-2xl font-bold text-foreground leading-none">{value}</span>
              {progress !== undefined && <Progress value={progress} className="h-1" />}
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight mt-0.5">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Bandeau épreuves 2026 — collège et lycée uniquement ── */}
      {(category === 'college' || category === 'lycee') && (
        <ExamCalendarBanner categoryId={category as 'college' | 'lycee'} />
      )}

      {/* ── Services scolaires numériques ── */}
      <section aria-label="Services numériques de l'établissement">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          Services numériques de l'établissement
        </h2>
        <div className="flex flex-col gap-3">
          {/* ── ENT académie ── */}
          <a
            href="https://www.education.gouv.fr/les-projets-numeriques-territoriaux-les-espaces-numeriques-de-travail-ent-450478"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5 hover:border-chart-3/50 hover:bg-chart-3/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            aria-label="Accéder à la liste des ENT par académie (nouvelle fenêtre)"
          >
            <span className="text-2xl shrink-0" aria-hidden="true">💻</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-chart-3 text-balance">ENT de votre académie</p>
              <p className="text-xs text-muted-foreground mt-0.5">Trouvez l'ENT de votre région — varie selon l'académie</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Demandez l'adresse exacte à votre établissement</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0 text-chart-3/50 group-hover:text-chart-3 transition-colors" aria-hidden="true" />
          </a>

          {/* ── Téléservices Éducation nationale ── */}
          <a
            href="https://teleservices.education.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl border border-success/20 bg-success/5 hover:border-success/50 hover:bg-success/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            aria-label="Accéder aux Téléservices de l'Éducation nationale (nouvelle fenêtre)"
          >
            <span className="text-2xl shrink-0" aria-hidden="true">🇫🇷</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-success text-balance">Téléservices Éducation nationale</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inscriptions, bourses, services officiels en ligne</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0 text-success/50 group-hover:text-success transition-colors" aria-hidden="true" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 L'adresse ENT peut varier selon l'académie — demandez à votre établissement.
        </p>
      </section>

      {/* ── Outils phares — liste style dashboard ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-foreground text-balance">
              Outils essentiels — {config.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sélectionnés pour votre programme</p>
          </div>
          <Link to="/motivation" className="shrink-0 hidden md:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Mes progrès <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.featuredTools.map(({ path, icon: Icon, label, desc, badge }) => (
            <Link key={path} to={path}>
              <div className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer h-full">
                <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform', config.accentBg)}>
                  <Icon className={cn('w-5 h-5', config.accentColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground text-balance">{label}</p>
                    {badge && (
                      <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium', config.accentBg, config.accentColor)}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 text-pretty leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className={cn('w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all', config.accentColor)} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Outils supplémentaires — grille compacte ── */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Tous les outils de votre espace</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {config.extraTools.map(({ path, icon: Icon, label, desc }) => (
            <Link key={path} to={path}>
              <div className="group flex flex-col gap-2.5 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer h-full">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', config.accentBg)}>
                  <Icon className={cn('w-4 h-4', config.accentColor)} />
                </div>
                <p className="text-xs font-semibold text-foreground text-balance">{label}</p>
                <p className="text-xs text-muted-foreground text-pretty leading-relaxed flex-1 hidden md:block">{desc}</p>
                <div className={cn('flex items-center gap-1 text-xs font-medium mt-auto', config.accentColor)}>
                  Accéder <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Ressources officielles par matière ── */}
      {niveauRessources.length > 0 && <RessourcesOfficiellesBloc sections={niveauRessources} />}

      {/* ── Matières + Parcours ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Matières */}
        <Card className="shadow-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookMarked className={cn('w-4 h-4', config.accentColor)} />
              Mes matières — {level}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {config.subjects.map(({ name, icon, path, color }) => (
                <Link key={name} to={path}>
                  <div className={cn('flex items-center gap-2.5 p-3 rounded-xl border transition-[background-color,border-color,color,box-shadow] cursor-pointer group min-w-0', color)}>
                    <span className="text-xl shrink-0">{icon}</span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parcours */}
        <Card className="shadow-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className={cn('w-4 h-4', config.accentColor)} />
              Parcours recommandé
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {config.parcours.map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5', config.accentBg, config.accentColor)}>
                    {step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quête + Défis du jour ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Quête de la catégorie */}
        {categoryQuest && (
          <Card className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className={cn('w-4 h-4', config.accentColor)} />
                Quête : {categoryQuest.title}
                <Badge className={cn('ml-auto text-xs border-transparent shrink-0', config.accentBg, config.accentText)}>
                  {categoryQuest.xpReward} XP
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                  <span>{questDone}/{questTotal} missions</span><span>{questPct}%</span>
                </div>
                <Progress value={questPct} className="h-2" />
              </div>
              <div className="space-y-2">
                {categoryQuest.missions.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle className={cn('w-3.5 h-3.5 shrink-0', m.completed ? config.accentColor : 'text-muted-foreground/40')} />
                    <span className={m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{m.title}</span>
                  </div>
                ))}
              </div>
              <Link to="/motivation">
                <Button variant="outline" size="sm" className="w-full h-9 text-xs mt-1">
                  Voir toutes les missions <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Défis du jour */}
        <Card className="shadow-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className={cn('w-4 h-4', config.accentColor)} />
              Défis du jour — {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {config.dailyChallenges.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{c.icon}</span>
                  <span className="text-sm font-medium text-foreground truncate">{c.title}</span>
                </div>
                <Badge className={cn('text-xs shrink-0 border-transparent', config.accentBg, config.accentText)}>+{c.xp} XP</Badge>
              </div>
            ))}
            <div className={cn('rounded-xl p-3 border text-xs text-pretty leading-relaxed italic', config.accentBg, 'border-transparent', config.accentText)}>
              {config.motivationQuote}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Technique de travail ── */}
      <section>
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', config.accentBg)}>
              <AlarmClock className={cn('w-6 h-6', config.accentColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-bold text-foreground">{config.studyTechnique.name}</p>
                <Badge variant="secondary" className="text-xs">{config.studyTechnique.duration}</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{config.studyTechnique.desc}</p>
            </div>
            <Link to="/organisation" className="shrink-0 self-center">
              <Button size="sm" className="h-9 text-xs font-semibold">
                Démarrer <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* ── Conseils ── */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-4 text-balance">Conseils pour {config.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.tips.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="shadow-card h-full">
              <CardContent className="p-4 flex gap-3 h-full">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', config.accentBg)}>
                  <Icon className={cn('w-4 h-4', config.accentColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground text-balance mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Focus hebdo (todos + focus time) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckSquare className={cn('w-4 h-4', config.accentColor)} />
              Tâches en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune tâche en retard. Bon travail.</p>
            ) : (
              <div className="space-y-2">
                {pendingTodos.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border text-xs">
                    <div className={cn('w-2 h-2 rounded-full shrink-0',
                      t.priority === 'high' ? 'bg-destructive' : t.priority === 'medium' ? 'bg-chart-5' : 'bg-chart-2'
                    )} />
                    <span className="flex-1 min-w-0 text-foreground truncate">{t.title}</span>
                    {t.dueDate && <span className="text-muted-foreground shrink-0">{t.dueDate}</span>}
                  </div>
                ))}
                {pendingTodos.length > 4 && (
                  <p className="text-sm text-muted-foreground text-center">+{pendingTodos.length - 4} autres tâches</p>
                )}
              </div>
            )}
            <Link to="/organisation">
              <Button variant="outline" size="sm" className="w-full h-9 text-xs mt-3">
                Gérer mes tâches <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className={cn('w-4 h-4', config.accentColor)} />
              Statistiques de travail
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { label: 'Minutes de focus total', value: `${totalFocusMin} min`, icon: Clock },
              { label: 'Badges débloqués',       value: `${unlockedBadges.length}`, icon: Award },
              { label: 'Flashcards à réviser',   value: `${dueCards.length}`, icon: CreditCard },
              { label: 'Tâches restantes',        value: `${pendingTodos.length}`, icon: CheckSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </div>
                <span className="text-sm font-bold text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Changer d'espace ── */}
      <section className="rounded-xl border border-border bg-secondary/40 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Changer d'espace étudiant</p>
          <p className="text-sm text-muted-foreground mt-0.5">Accédez aux espaces pour les autres niveaux ou modifiez votre classe dans votre profil.</p>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          {(['primaire','college','lycee','superieur','adapte'] as CategoryId[]).filter(c => c !== category).map(c => {
            const cfg = SPACE_CONFIGS[c];
            return (
              <Button key={c} variant="outline" size="sm" className="h-9 text-xs"
                onClick={() => handleLevelSwitch(cfg.defaultLevel)}>
                {cfg.emoji} {cfg.title}
              </Button>
            );
          })}
        </div>
      </section>

    </div>
  );
};

// ─── Page wrapper (conservé pour compatibilité import) ────────────────────────
const EspaceNiveauPage: React.FC = () => <EspaceNiveauContent />;

export default EspaceNiveauPage;
