import { ChevronDown, ChevronUp, Filter, GraduationCap, Search, X } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FAQ_LEVELS, FAQ_STATS } from '@/data/faqData';

// ── Accordion item ────────────────────────────────────────────────────────────
const FaqItem: React.FC<{ id: string; q: string; a: string }> = ({ id, q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div id={id} className="border border-border rounded-xl overflow-hidden scroll-mt-32">
      <button type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`${id}-ans`}
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
      >
        <span className="text-pretty flex-1 leading-snug">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0 text-primary mt-0.5" />
          : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />}
      </button>
      {open && (
        <div id={`${id}-ans`} className="px-4 pb-4 border-t border-border bg-secondary/20">
          <p className="pt-3 text-base text-muted-foreground leading-relaxed text-pretty whitespace-pre-line">{a}</p>
        </div>
      )}
    </div>
  );
};

// ── Subject nav sidebar ───────────────────────────────────────────────────────
const SubjectNav: React.FC<{
  levelId: string;
  activeSub: string;
  onSelect: (id: string) => void;
  counts: Record<string, number>;
}> = ({ levelId, activeSub, onSelect, counts }) => {
  const level = FAQ_LEVELS.find(l => l.id === levelId);
  if (!level) return null;
  return (
    <nav className="space-y-0.5" aria-label="Matières">
      <button type="button"
        onClick={() => onSelect('all')}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeSub === 'all' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
      >
        <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 shrink-0" />Toutes les matières</span>
        <Badge variant="secondary" className="text-xs shrink-0">
          {level.subjects.reduce((s, sub) => s + (counts[sub.id] ?? sub.items.length), 0)}
        </Badge>
      </button>
      {level.subjects.map(sub => {
        const count = counts[sub.id] ?? sub.items.length;
        if (count === 0) return null;
        return (
          <button type="button"
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeSub === sub.id ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-base">{sub.icon}</span>
              <span className="truncate">{sub.label}</span>
            </span>
            <Badge variant="secondary" className="text-xs shrink-0">{count}</Badge>
          </button>
        );
      })}
    </nav>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const FaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeLevelId, setActiveLevelId] = useState(FAQ_LEVELS[0]?.id ?? 'lycee');
  const [activeSubId, setActiveSubId] = useState('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const levelTabsRef = useRef<HTMLDivElement>(null);

  const handleLevelSelect = useCallback((id: string) => {
    setActiveLevelId(id);
    setActiveSubId('all');
    setSearch('');
  }, []);

  const handleSubSelect = useCallback((id: string) => {
    setActiveSubId(id);
    setMobileNavOpen(false);
  }, []);

  // Filtered subjects/items for active level
  const { filteredSubjects, subjectCounts } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const level = FAQ_LEVELS.find(l => l.id === activeLevelId);
    if (!level) return { filteredSubjects: [], subjectCounts: {} };

    const counts: Record<string, number> = {};
    const filtered = level.subjects
      .map(sub => {
        const items = sub.items
          .filter(item => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
          .map((item, i) => ({ ...item, id: `faq-${sub.id}-${i}` }));
        counts[sub.id] = items.length;
        return { ...sub, items };
      })
      .filter(sub =>
        (activeSubId === 'all' || sub.id === activeSubId) && sub.items.length > 0
      );

    return { filteredSubjects: filtered, subjectCounts: counts };
  }, [search, activeLevelId, activeSubId]);

  // Global search across all levels
  const globalResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q || activeSubId !== 'all') return null;
    return FAQ_LEVELS.flatMap(level =>
      level.subjects.flatMap(sub =>
        sub.items
          .filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
          .map((item, i) => ({
            ...item,
            id: `faq-${sub.id}-${i}`,
            levelLabel: level.label,
            levelIcon: level.icon,
            subLabel: sub.label,
          }))
      )
    );
  }, [search, activeSubId]);

  const isGlobalSearch = search.trim().length > 0 && activeSubId === 'all';
  const totalVisible = isGlobalSearch
    ? (globalResults?.length ?? 0)
    : filteredSubjects.reduce((s, sub) => s + sub.items.length, 0);

  const activeLevel = FAQ_LEVELS.find(l => l.id === activeLevelId);

  return (
    <div className="min-w-0">
      <SEO
        title="FAQ Scolaire 2026 — Bac, Brevet, Parcoursup, CROUS & Révisions | Apprenix"
        description={`${FAQ_STATS.total} réponses vérifiées sur le Bac 2026, Brevet, Parcoursup, bourses CROUS et méthodes de révision. Par niveau et matière — réponse en quelques secondes. Gratuit.`}
        canonical="/faq"
        keywords="FAQ bac 2026, questions brevet 2026, Parcoursup 2026 dossier, bourses CROUS aide étudiante, méthodes révision efficaces, grand oral terminale, philosophie terminale, aide orientation scolaire, questions scolaires réponses, FAQ apprenix, fiche révision bac"
        noIndex={false}
        dateModified="2026-06-18"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            { '@type': 'Question', 'name': 'Apprenix est-il vraiment gratuit ?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Oui, Apprenix est 100% gratuit pour toujours. Aucune publicité, aucun abonnement, aucune inscription obligatoire. Tous les outils sont accessibles du CP jusqu\'à l\'université.' } },
            { '@type': 'Question', 'name': 'Comment réussir le Bac 2026 ?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Pour réussir le Bac 2026 : commencez les révisions tôt avec la méthode de répétition espacée, utilisez les flashcards pour mémoriser, faites des annales sous conditions d\'examen, et organisez vos révisions avec un planning hebdomadaire. Apprenix propose tous ces outils gratuitement.' } },
            { '@type': 'Question', 'name': 'Comment fonctionne Parcoursup 2026 ?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Parcoursup 2026 ouvre les candidatures en janvier. Il faut choisir vos formations, rédiger une lettre de motivation par vœu, et attendre les réponses à partir de juin. Apprenix propose une page dédiée avec le calendrier complet et des conseils pour optimiser votre dossier.' } },
            { '@type': 'Question', 'name': 'Comment obtenir une bourse CROUS ?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Pour obtenir une bourse CROUS, faites votre Dossier Social Étudiant (DSE) sur messervices.etudiant.gouv.fr dès avril. Le montant dépend des revenus de vos parents et de votre situation. Les échelons vont de 0bis à 7. La FAQ Apprenix détaille toutes les conditions et les montants 2026.' } },
            { '@type': 'Question', 'name': 'Apprenix est-il adapté aux élèves DYS ?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Oui. Apprenix intègre des outils d\'accessibilité dédiés : mode contraste élevé, police adaptée, texte agrandi, synthèse vocale. La page /inclusion détaille les droits MDPH, PPS, PAP et logiciels adaptés.' } },
          ],
        }}
      />

      {/* ── Hero ── */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-chart-2/5 border border-primary/20 px-4 py-5 md:px-8 md:py-7 mb-0 animate-fade-up">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />Base de connaissance 2026
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {FAQ_STATS.total} réponses · {FAQ_STATS.levels} niveaux · {FAQ_STATS.subjects} matières
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-foreground text-balance mb-1">
            Toutes vos questions, une réponse claire
          </h1>
          <p className="text-sm text-muted-foreground text-pretty mb-4 max-w-xl">
            Questions fréquentes classées par niveau et matière — basées sur les programmes officiels 2026.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher dans toutes les matières…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10"
              aria-label="Rechercher une question"
            />
            {search && (
              <button type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {search && (
            <p className="text-sm text-muted-foreground mt-1.5">
              {totalVisible === 0 ? 'Aucun résultat.' : `${totalVisible} résultat${totalVisible > 1 ? 's' : ''}`}
              {isGlobalSearch && ' dans toutes les matières'}
            </p>
          )}
        </div>
      </section>

      {/* ── Level tabs ── */}
      <div className="border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div
            ref={levelTabsRef}
            className="flex gap-0 overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Niveaux scolaires"
          >
            {FAQ_LEVELS.map(level => (
              <button type="button"
                key={level.id}
                role="tab"
                aria-selected={activeLevelId === level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                  activeLevelId === level.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span className="text-base leading-none">{level.icon}</span>
                <span>{level.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0" aria-label="Navigation par catégorie FAQ">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {activeLevel?.label ?? 'Matières'}
              </p>
              <SubjectNav
                levelId={activeLevelId}
                activeSub={activeSubId}
                onSelect={handleSubSelect}
                counts={subjectCounts}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Mobile subject filter */}
            <div className="md:hidden mb-4 flex items-center gap-2 flex-wrap">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    {activeSubId === 'all'
                      ? 'Toutes les matières'
                      : (activeLevel?.subjects.find(s => s.id === activeSubId)?.label ?? 'Matière')}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4">
                  <p className="text-sm font-semibold mb-3">{activeLevel?.label}</p>
                  <SubjectNav
                    levelId={activeLevelId}
                    activeSub={activeSubId}
                    onSelect={handleSubSelect}
                    counts={subjectCounts}
                  />
                </SheetContent>
              </Sheet>
              {activeSubId !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-sm text-muted-foreground"
                  onClick={() => setActiveSubId('all')}
                >
                  <X className="w-3.5 h-3.5 mr-1" />Tout voir
                </Button>
              )}
            </div>

            {/* ── Global search results (cross-level) ── */}
            {isGlobalSearch && globalResults && (
              <div className="space-y-2">
                {globalResults.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Aucun résultat</p>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                        Essayez d&apos;autres mots-clés ou{' '}
                        <button type="button"
                          className="text-primary underline underline-offset-2"
                          onClick={() => setSearch('')}
                        >parcourez par niveau</button>.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  globalResults.map(item => (
                    <div key={item.id} className="space-y-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm text-muted-foreground leading-relaxed text-pretty">{item.levelIcon} {item.levelLabel}</span>
                        <span className="text-sm text-muted-foreground leading-relaxed text-pretty">›</span>
                        <span className="text-sm text-muted-foreground leading-relaxed text-pretty">{item.subLabel}</span>
                      </div>
                      <FaqItem id={item.id} q={item.q} a={item.a} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Per-subject groups (normal mode) ── */}
            {!isGlobalSearch && (
              <div className="space-y-8">
                {filteredSubjects.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Aucune question</p>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                        <button type="button"
                          className="text-primary underline underline-offset-2"
                          onClick={() => { setSearch(''); setActiveSubId('all'); }}
                        >Voir toutes les matières</button>
                      </p>
                    </CardContent>
                  </Card>
                )}
                {filteredSubjects.map(sub => (
                  <section key={sub.id} aria-labelledby={`sub-${sub.id}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl" aria-hidden="true">{sub.icon}</span>
                      <h2 id={`sub-${sub.id}`} className="text-base font-semibold text-foreground text-balance">
                        {sub.label}
                      </h2>
                      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
                        {sub.items.length} Q&amp;A
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {sub.items.map(item => (
                        <FaqItem key={item.id} id={item.id} q={item.q} a={item.a} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* CTA contact */}
            {totalVisible > 0 && (
              <Card className="mt-10 bg-primary/5 border-primary/20">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Vous n&apos;avez pas trouvé la réponse ?
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Posez votre question directement — nous répondons rapidement.
                    </p>
                  </div>
                  <a href="/contact" className="shrink-0">
                    <Button size="sm" className="h-9">
                      Nous contacter
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
