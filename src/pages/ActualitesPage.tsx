import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any


import {BadgeCheck, BookOpen, Brain,Calendar,ChevronDown, ChevronRight, ChevronUp, Clock, Lightbulb, Lock,Megaphone, 
  Monitor, 
  Newspaper, Pencil, PenLine, Search, 
  Send, Shield, 
  ShieldCheck, Star, Trash2, TrendingUp, Users, X, 
  Zap } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Toutes' | 'Tendances EdTech' | 'Innovations' | 'Conseils méthode' | 'Numérique & Éducation' | 'Outils numériques';
type ContribType = 'Article' | 'Conseil' | 'Témoignage';
type ContribRole = 'Étudiant' | 'Parent' | 'Enseignant';

interface DbArticle {
  id: string;
  title: string;
  excerpt: string;
  full_summary: string;
  category: Exclude<Category, 'Toutes'>;
  published_at: string;
  read_time: number;
  featured: boolean;
  tags: string[];
  is_admin: boolean;
}

interface Contribution {
  id: string;
  title: string;
  type: ContribType;
  content: string;
  prenom: string;
  role: ContribRole;
  date: string;
}

const CATEGORIES: Category[] = ['Toutes', 'Tendances EdTech', 'Innovations', 'Conseils méthode', 'Numérique & Éducation', 'Outils numériques'];

const CATEGORY_COLORS: Record<Exclude<Category, 'Toutes'>, string> = {
  'Tendances EdTech': 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  'Innovations': 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  'Conseils méthode': 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'Numérique & Éducation': 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  'Outils numériques': 'bg-chart-5/15 text-chart-5 border-chart-5/30' };

const CATEGORY_ICONS: Record<Exclude<Category, 'Toutes'>, React.ElementType> = {
  'Numérique & Éducation': Brain,
  'Tendances EdTech': TrendingUp,
  'Innovations': Lightbulb,
  'Conseils méthode': BookOpen,
  'Outils numériques': Monitor };

// ─── Composant Article Card ────────────────────────────────────────────────────

const ArticleCard: React.FC<{ article: DbArticle; expanded: boolean; onToggle: () => void }> = ({
  article, expanded, onToggle }) => {
  const Icon = CATEGORY_ICONS[article.category] ?? BookOpen;
  const catColor = CATEGORY_COLORS[article.category] ?? 'bg-muted text-muted-foreground border-border';
  const dateLabel = new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-md transition-[border-color,box-shadow,transform] duration-200 group">
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="outline" className={`text-xs shrink-0 border ${catColor}`}>{article.category}</Badge>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm md:text-base text-foreground text-balance leading-snug mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground text-pretty leading-relaxed">
            {expanded ? article.full_summary : article.excerpt}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(article.tags ?? []).map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
        <div className="border-t border-border/40" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateLabel}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time} min</span>
          </div>
          <Button variant="ghost" size="sm" className="h-9 text-xs px-2 text-primary hover:bg-primary/10" onClick={onToggle}>
            {expanded ? 'Réduire' : 'Lire la suite'}
            <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const ActualitesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ── Articles depuis Supabase ──────────────────────────────────────────────
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [_submittingAdmin, setSubmittingAdmin] = useState(false);

  // ── Contributions communautaires (localStorage) ───────────────────────────
  const [contributions, setContributions] = useLocalStorage<Contribution[]>('apprenix_contributions', []);
  const [showContribForm, setShowContribForm] = useState(false);
  const [expandedContribIds, setExpandedContribIds] = useState<Set<string>>(new Set());
  const [contribForm, setContribForm] = useState({ title: '', type: '' as ContribType | '', content: '', prenom: '', role: '' as ContribRole | '' });
  const [contribErrors, setContribErrors] = useState<Record<string, string>>({});

  // ── Articles administrateur (Supabase) ───────────────────────────────────
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({ title: '', category: '' as Exclude<Category, 'Toutes'> | '', excerpt: '', content: '', readTime: '' });
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [expandedAdminIds, setExpandedAdminIds] = useState<Set<string>>(new Set());

  // ── Chargement articles Supabase ─────────────────────────────────────────
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, full_summary, category, published_at, read_time, featured, tags, is_admin')
      .order('published_at', { ascending: false })
      .limit(100);
    if (!error && data) setArticles(data as DbArticle[]);
    setLoadingArticles(false);
  }, []);

  useEffect(() => { loadArticles(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Article à la une : featured = true depuis Supabase ou premier article
  const featured = useMemo(() => articles.find(a => a.featured) ?? articles[0], [articles]);
  const FeaturedIcon = featured ? (CATEGORY_ICONS[featured.category] ?? BookOpen) : null;
  const featuredDateLabel = featured
    ? new Date(featured.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // Articles officiels (is_admin = false) et articles admin (is_admin = true)
  const filtered = useMemo(() => articles.filter(a => {
    if (a.featured) return false;
    if (a.is_admin) return false;
    const matchesCat = activeCategory === 'Toutes' || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || (a.tags ?? []).some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  }), [articles, activeCategory, searchQuery]);

  const filteredAdmin = useMemo(() => articles.filter(a => {
    if (!a.is_admin) return false;
    const matchesCat = activeCategory === 'Toutes' || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    return matchesCat && (!q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
  }), [articles, activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleContrib = (id: string) => {
    setExpandedContribIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAdmin = (id: string) => {
    setExpandedAdminIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ── Soumission contribution ───────────────────────────────────────────────
  const submitContrib = () => {
    const errs: Record<string, string> = {};
    if (!contribForm.title.trim() || contribForm.title.length < 5) errs.title = 'Titre requis (5 caractères minimum)';
    if (contribForm.title.length > 100) errs.title = 'Titre trop long (100 caractères max)';
    if (!contribForm.type) errs.type = 'Type requis';
    if (!contribForm.content.trim() || contribForm.content.length < 50) errs.content = 'Contenu trop court (50 caractères minimum)';
    if (contribForm.content.length > 2000) errs.content = 'Contenu trop long (2000 caractères max)';
    if (!contribForm.prenom.trim() || contribForm.prenom.length < 2) errs.prenom = 'Prénom requis (2 caractères minimum)';
    if (!contribForm.role) errs.role = 'Rôle requis';
    setContribErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newContrib: Contribution = {
      id: Date.now().toString(),
      title: contribForm.title.trim(),
      type: contribForm.type as ContribType,
      content: contribForm.content.trim(),
      prenom: contribForm.prenom.trim(),
      role: contribForm.role as ContribRole,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) };
    setContributions(prev => [newContrib, ...prev]);
    setContribForm({ title: '', type: '', content: '', prenom: '', role: '' });
    setShowContribForm(false);
    setContribErrors({});
    toast.success('Contribution publiée ! Merci de partager votre expérience.');
  };

  // ── Publication article admin → Supabase ─────────────────────────────────
  const submitAdminArticle = async () => {
    const errs: Record<string, string> = {};
    if (!adminForm.title.trim() || adminForm.title.length < 5) errs.title = 'Titre requis (5 caractères minimum)';
    if (adminForm.title.length > 150) errs.title = 'Titre trop long (150 caractères max)';
    if (!adminForm.category) errs.category = 'Catégorie requise';
    if (!adminForm.excerpt.trim() || adminForm.excerpt.length < 50) errs.excerpt = 'Extrait trop court (50 caractères minimum)';
    if (adminForm.excerpt.length > 300) errs.excerpt = 'Extrait trop long (300 caractères max)';
    if (!adminForm.content.trim() || adminForm.content.length < 200) errs.content = 'Contenu trop court (200 caractères minimum)';
    if (adminForm.content.length > 5000) errs.content = 'Contenu trop long (5000 caractères max)';
    setAdminErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmittingAdmin(true);
    if (editingAdminId) {
      const { error } = await supabase.from('articles').update({
        title: adminForm.title.trim(),
        category: adminForm.category,
        excerpt: adminForm.excerpt.trim(),
        full_summary: adminForm.content.trim(),
        read_time: Number(adminForm.readTime) || 5 }).eq('id', editingAdminId);
      if (error) { toast.error('Erreur lors de la mise à jour.'); setSubmittingAdmin(false); return; }
      setEditingAdminId(null);
      toast.success('Article mis à jour !');
    } else {
      const { error } = await supabase.from('articles').insert({
        title: adminForm.title.trim(),
        category: adminForm.category,
        excerpt: adminForm.excerpt.trim(),
        full_summary: adminForm.content.trim(),
        read_time: Number(adminForm.readTime) || 5,
        featured: false,
        is_admin: true,
        tags: [adminForm.category],
        published_at: new Date().toISOString() });
      if (error) { toast.error('Erreur lors de la publication.'); setSubmittingAdmin(false); return; }
      toast.success('Article publié ! Il est maintenant visible par tous.');
    }
    setSubmittingAdmin(false);
    setAdminForm({ title: '', category: '', excerpt: '', content: '', readTime: '' });
    setShowAdminForm(false);
    setAdminErrors({});
    await loadArticles();
  };

  const editAdminArticle = (a: DbArticle) => {
    setAdminForm({ title: a.title, category: a.category, excerpt: a.excerpt, content: a.full_summary, readTime: String(a.read_time) });
    setEditingAdminId(a.id);
    setShowAdminForm(true);
  };

  const deleteAdminArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { toast.error('Erreur lors de la suppression.'); return; }
    toast.success('Article supprimé.');
    await loadArticles();
  };

  return (
    <div className="min-w-0 space-y-5">
    <h1 className="sr-only">Actualités Éducation 2026</h1>
      <SEO
        title="Actualités Éducation 2026 — Bac, IA en classe & Conseils révision | Apprenix"
        description="Actus éducation 2026 : réforme du bac, Parcoursup, IA scolaire, méthodes de révision. Conseils pour élèves, parents et enseignants. Gratuit."
        canonical="/actualites"
        keywords="actualités éducation 2026, réforme bac 2026, EdTech France, IA scolaire tendances, méthodes révision efficaces bac 2026, conseils lycéens étudiants, blog éducatif gratuit, innovation pédagogique numérique, actualité Parcoursup 2026, actualité CROUS"
        newsKeywords="éducation, bac 2026, brevet 2026, Parcoursup, intelligence artificielle, révision, enseignement, lycée, collège, orientation scolaire"
        dateModified="2026-06-18"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          'name': 'Actualités Éducation — Apprenix',
          'description': 'Blog éducatif gratuit : actualités, conseils de révision, méthodes d\'apprentissage et tendances EdTech pour les élèves, parents et enseignants de France.',
          'url': 'https://apprenix.org/actualites',
          'inLanguage': 'fr-FR',
          'publisher': { '@type': 'Organization', 'name': 'Apprenix', 'url': 'https://apprenix.org', 'logo': { '@type': 'ImageObject', 'url': 'https://apprenix.org/apprenix-logo.png' } },
          'author': { '@type': 'Person', 'name': 'Charly Soudan' } }}
      />

      {/* ── Hero unifié ── */}
      <PageHero
        variant="community"
        icon={Newspaper}
        badge="Actualités · Éducation &amp; EdTech"
        title="Actualités Apprenix"
        subtitle="Articles pédagogiques, tendances éducation 2026 et conseils méthode — pour les élèves, parents et enseignants. Partagez aussi votre expérience depuis l'onglet Contributions."
        stats={[
          { value: '100%', label: 'Gratuit' },
          { value: 'Vérifié', label: 'Contenu éditorial' },
          { value: 'Ouvert', label: 'Contributions' },
        ]}
      />

      {/* ── Avertissement éditorial ── */}
      <div className="flex items-start gap-3 rounded-xl border border-muted bg-muted/30 px-4 py-3">
        <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground text-pretty">
          <strong className="text-foreground">Contenus indicatifs</strong> — Les articles officiels sont des synthèses pédagogiques rédigées à titre informatif. Les statistiques citées sont illustratives ; consultez les sources originales pour tout usage académique.
        </p>
      </div>

      {/* ── À la une ── */}
      {loadingArticles ? (
        <Card className="border border-border/60">
          <CardContent className="p-4 md:p-6 space-y-3">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted" />
          </CardContent>
        </Card>
      ) : featured ? (
      <Card className="overflow-hidden border border-border/60 bg-gradient-to-br from-primary/5 to-chart-1/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">À la une</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {FeaturedIcon && <FeaturedIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className={`text-xs border mb-2 ${CATEGORY_COLORS[featured.category]}`}>
                {featured.category}
              </Badge>
              <h2 className="text-base md:text-2xl font-bold text-foreground text-balance leading-snug mb-2">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-3">
                {expandedIds.has(featured.id) ? featured.full_summary : featured.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{featuredDateLabel}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.read_time} min</span>
                </div>
                <Button size="sm" className="h-9 bg-primary text-primary-foreground text-xs" onClick={() => toggleExpand(featured.id)}>
                  {expandedIds.has(featured.id) ? 'Réduire' : "Lire l'article"}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {/* ── Onglets principaux ── */}
      <Tabs defaultValue="actualites" className="space-y-4" onValueChange={v => { if (v === 'rediger') setShowAdminForm(true); }}>
        <TabsList className="w-full grid grid-cols-3 h-10">
          <TabsTrigger value="actualites" className="text-xs gap-1.5">
            <Newspaper className="w-3.5 h-3.5" />Actualités
          </TabsTrigger>
          <TabsTrigger value="contributions" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Contributions
            {contributions.length > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-xs bg-chart-4/15 text-chart-4 border-chart-4/30">{contributions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rediger" className="text-xs gap-1.5">
            <Pencil className="w-3.5 h-3.5" />Rédiger
          </TabsTrigger>
        </TabsList>

        {/* ════════════ ONGLET ACTUALITÉS ════════════ */}
        <TabsContent value="actualites" className="space-y-4 min-h-[500px]">
          {/* Recherche + filtres */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input aria-label="Rechercher un article" placeholder="Rechercher un article…" className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button type="button" key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{filtered.length + filteredAdmin.length} article{filtered.length + filteredAdmin.length !== 1 ? 's' : ''} trouvé{filtered.length + filteredAdmin.length !== 1 ? 's' : ''} pour « {searchQuery} »</p>
          )}

          {/* Articles admin publiés */}
          {loadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2].map(i => (
                <Card key={i} className="border border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAdmin.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-primary" />Publiés par l'équipe Apprenix
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmin.map(a => {
                  const dateLabel = new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <Card key={a.id} className="h-full flex flex-col border border-primary/20 hover:border-primary/40 hover:shadow-md transition-[border-color,box-shadow,transform] duration-200">
                      <CardContent className="p-4 flex flex-col flex-1 gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className={`text-xs shrink-0 border ${CATEGORY_COLORS[a.category]}`}>{a.category}</Badge>
                          <Badge className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0">Apprenix</Badge>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-foreground text-balance leading-snug mb-1">{a.title}</h3>
                          <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-3">
                            {expandedAdminIds.has(a.id) ? a.full_summary : a.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border/40">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateLabel}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-9 text-xs text-primary hover:text-primary" onClick={() => toggleAdmin(a.id)}>
                            {expandedAdminIds.has(a.id) ? <><ChevronUp className="w-3 h-3 mr-1" />Réduire</> : <><ChevronDown className="w-3 h-3 mr-1" />Lire</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles officiels statiques */}
          {filtered.length === 0 && filteredAdmin.length === 0 ? (
            <Card className="border border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-16 gap-3">
                <Newspaper className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Aucun article trouvé</p>
                <Button variant="outline" size="sm" onClick={() => { setActiveCategory('Toutes'); setSearchQuery(''); }}>Réinitialiser les filtres</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {filtered.length > 0 && (
                <div className="space-y-3">
                  {filteredAdmin.length > 0 && <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-chart-2" />Sélection éditoriale</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(article => (
                      <ArticleCard key={article.id} article={article} expanded={expandedIds.has(article.id)} onToggle={() => toggleExpand(article.id)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <Card className="border border-border/60 bg-muted/30">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-semibold text-foreground">Apprenix veille pour vous</p>
                <p className="text-sm text-muted-foreground mt-0.5">Articles sélectionnés et rédigés avec soin. Contenu mis à jour régulièrement.</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs border-primary/30 text-primary">
                {articles.length} article{articles.length !== 1 ? 's' : ''} disponible{articles.length !== 1 ? 's' : ''}
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════ ONGLET CONTRIBUTIONS ════════════ */}
        <TabsContent value="contributions" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-foreground">Contributions de la communauté</h2>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Étudiants, parents et enseignants — partagez un article, un conseil ou un témoignage.</p>
            </div>
            <Button size="sm" className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/25 border border-chart-4/30 h-9 text-sm font-semibold shrink-0" onClick={() => setShowContribForm(v => !v)}>
              <PenLine className="w-4 h-4 mr-1.5" />
              {showContribForm ? 'Annuler' : 'Soumettre une contribution'}
            </Button>
          </div>

          {/* Formulaire contribution */}
          {showContribForm && (
            <Card className="border border-chart-4/30 bg-chart-4/3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-chart-4" />Nouvelle contribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="contrib-title" className="text-sm text-muted-foreground leading-relaxed text-pretty">Titre *</Label>
                    <Input id="contrib-title" placeholder="Titre de votre contribution" value={contribForm.title} onChange={e => setContribForm(f => ({ ...f, title: e.target.value }))} className={contribErrors.title ? 'border-destructive' : ''} />
                    {contribErrors.title && <p className="text-xs text-destructive">{contribErrors.title}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Type de contribution *</Label>
                    <Select value={contribForm.type} onValueChange={v => setContribForm(f => ({ ...f, type: v as ContribType }))}>
                      <SelectTrigger className={contribErrors.type ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="Conseil">Conseil</SelectItem>
                        <SelectItem value="Témoignage">Témoignage</SelectItem>
                      </SelectContent>
                    </Select>
                    {contribErrors.type && <p className="text-xs text-destructive">{contribErrors.type}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Contenu * ({contribForm.content.length}/2000 caractères)</Label>
                  <Textarea placeholder="Partagez votre article, conseil ou témoignage… (50 caractères minimum)" rows={5} value={contribForm.content} onChange={e => setContribForm(f => ({ ...f, content: e.target.value }))} className={contribErrors.content ? 'border-destructive' : ''} />
                  {contribErrors.content && <p className="text-xs text-destructive">{contribErrors.content}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="contrib-prenom" className="text-sm text-muted-foreground leading-relaxed text-pretty">Votre prénom *</Label>
                    <Input id="contrib-prenom" placeholder="Prénom" value={contribForm.prenom} onChange={e => setContribForm(f => ({ ...f, prenom: e.target.value }))} className={contribErrors.prenom ? 'border-destructive' : ''} />
                    {contribErrors.prenom && <p className="text-xs text-destructive">{contribErrors.prenom}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Votre rôle *</Label>
                    <Select value={contribForm.role} onValueChange={v => setContribForm(f => ({ ...f, role: v as ContribRole }))}>
                      <SelectTrigger className={contribErrors.role ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Étudiant, Parent ou Enseignant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Étudiant">Étudiant</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Enseignant">Enseignant</SelectItem>
                      </SelectContent>
                    </Select>
                    {contribErrors.role && <p className="text-xs text-destructive">{contribErrors.role}</p>}
                  </div>
                </div>
                <Button onClick={submitContrib} className="w-full h-10 font-semibold">
                  <Send className="w-4 h-4 mr-2" />Publier ma contribution
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Liste contributions */}
          {contributions.length === 0 ? (
            <Card className="border border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-16 gap-3 text-center">
                <Users className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium text-balance">Soyez le premier à partager votre expérience !</p>
                <p className="text-sm text-muted-foreground text-pretty max-w-xs">Cliquez sur « Soumettre une contribution » pour partager un article, un conseil ou un témoignage avec la communauté.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributions.map(c => {
                const typeColors: Record<ContribType, string> = { Article: 'bg-chart-2/15 text-chart-2 border-chart-2/30', Conseil: 'bg-chart-3/15 text-chart-3 border-chart-3/30', Témoignage: 'bg-chart-4/15 text-chart-4 border-chart-4/30' };
                const roleColors: Record<ContribRole, string> = { Étudiant: 'text-primary', Parent: 'text-success', Enseignant: 'text-chart-5' };
                return (
                  <Card key={c.id} className="h-full flex flex-col border border-chart-4/20 hover:border-chart-4/40 transition-[border-color,box-shadow] duration-200">
                    <CardContent className="p-4 flex flex-col flex-1 gap-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <Badge className="text-xs bg-chart-4/10 text-chart-4 border-chart-4/25 border">Partagé par la communauté</Badge>
                        <Badge variant="outline" className={`text-xs border ${typeColors[c.type]}`}>{c.type}</Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-foreground text-balance leading-snug mb-1">{c.title}</h3>
                        <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                          {expandedContribIds.has(c.id) ? c.content : `${c.content.slice(0, 150)}${c.content.length > 150 ? '…' : ''}`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`font-medium ${roleColors[c.role]}`}>{c.prenom}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{c.role}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{c.date}</span>
                        </div>
                        {c.content.length > 150 && (
                          <Button variant="ghost" size="sm" className="h-9 text-xs text-chart-4 hover:text-chart-4" onClick={() => toggleContrib(c.id)}>
                            {expandedContribIds.has(c.id) ? <><ChevronUp className="w-3 h-3 mr-1" />Réduire</> : <><ChevronDown className="w-3 h-3 mr-1" />Lire</>}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ════════════ ONGLET RÉDIGER (ADMIN) ════════════ */}
        <TabsContent value="rediger" className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
            <Lock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Espace réservé à l'administrateur</p>
              <p className="text-sm text-muted-foreground mt-0.5">Rédigez et publiez vos articles officiels. Ils apparaîtront dans l'onglet Actualités avec le badge « Apprenix ».</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-foreground">
              {editingAdminId ? 'Modifier l\'article' : 'Nouvel article'}
            </h2>
            <Button size="sm" onClick={() => { setShowAdminForm(v => !v); if (showAdminForm) { setEditingAdminId(null); setAdminForm({ title: '', category: '', excerpt: '', content: '', readTime: '' }); setAdminErrors({}); } }} className="h-9 text-sm font-semibold gap-1.5">
              {showAdminForm ? <><X className="w-4 h-4" />Annuler</> : <><Pencil className="w-4 h-4" />Rédiger un article</>}
            </Button>
          </div>

          {showAdminForm && (
            <Card className="border border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="admin-title" className="text-sm text-muted-foreground leading-relaxed text-pretty">Titre de l'article *</Label>
                    <Input id="admin-title" placeholder="Titre accrocheur…" value={adminForm.title} onChange={e => setAdminForm(f => ({ ...f, title: e.target.value }))} className={adminErrors.title ? 'border-destructive' : ''} />
                    {adminErrors.title && <p className="text-xs text-destructive">{adminErrors.title}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Catégorie *</Label>
                    <Select value={adminForm.category} onValueChange={v => setAdminForm(f => ({ ...f, category: v as Exclude<Category, 'Toutes'> }))}>
                      <SelectTrigger className={adminErrors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tendances EdTech">Tendances EdTech</SelectItem>
                        <SelectItem value="Innovations">Innovations</SelectItem>
                        <SelectItem value="Conseils méthode">Conseils méthode</SelectItem>
                        <SelectItem value="Numérique & Éducation">Numérique & Éducation</SelectItem>
                        <SelectItem value="Outils numériques">Outils numériques</SelectItem>
                      </SelectContent>
                    </Select>
                    {adminErrors.category && <p className="text-xs text-destructive">{adminErrors.category}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="admin-readtime" className="text-sm text-muted-foreground leading-relaxed text-pretty">Temps de lecture estimé (minutes)</Label>
                    <Input id="admin-readtime" type="number" inputMode="numeric" placeholder="5" min={1} max={60} value={adminForm.readTime} onChange={e => setAdminForm(f => ({ ...f, readTime: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Extrait / Résumé * ({adminForm.excerpt.length}/300)</Label>
                  <Textarea placeholder="Résumé accrocheur visible dans la grille d'articles…" rows={2} value={adminForm.excerpt} onChange={e => setAdminForm(f => ({ ...f, excerpt: e.target.value }))} className={adminErrors.excerpt ? 'border-destructive' : ''} />
                  {adminErrors.excerpt && <p className="text-xs text-destructive">{adminErrors.excerpt}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Contenu complet * ({adminForm.content.length}/5000)</Label>
                  <Textarea placeholder="Rédigez ici le contenu complet de votre article… (200 caractères minimum)" rows={8} value={adminForm.content} onChange={e => setAdminForm(f => ({ ...f, content: e.target.value }))} className={adminErrors.content ? 'border-destructive' : ''} />
                  {adminErrors.content && <p className="text-xs text-destructive">{adminErrors.content}</p>}
                </div>
                <Button onClick={submitAdminArticle} className="w-full h-10 font-semibold">
                  <Send className="w-4 h-4 mr-2" />{editingAdminId ? "Mettre à jour l'article" : "Publier l'article"}
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredAdmin.filter(() => true).length === 0 && articles.filter(a => a.is_admin).length === 0 ? (
            <Card className="border border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-16 gap-3 text-center">
                <Pencil className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Aucun article publié pour l'instant</p>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Cliquez sur « Rédiger un article » pour créer votre premier article.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{articles.filter(a => a.is_admin).length} article{articles.filter(a => a.is_admin).length > 1 ? 's' : ''} publié{articles.filter(a => a.is_admin).length > 1 ? 's' : ''}</p>
              <div className="space-y-3">
                {articles.filter(a => a.is_admin).map(a => {
                  const dateLabel = new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <Card key={a.id} className="border border-primary/15">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className={`text-xs border ${CATEGORY_COLORS[a.category]}`}>{a.category}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{dateLabel}</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                            </div>
                            <h3 className="font-semibold text-sm text-foreground text-balance">{a.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 text-pretty line-clamp-2">{a.excerpt}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => editAdminArticle(a)}>
                              <Pencil className="w-3 h-3" />Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="h-9 text-xs gap-1 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60" onClick={() => deleteAdminArticle(a.id)}>
                            <Trash2 className="w-3 h-3" />Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Section confiance parents / visiteurs ── */}
      <Card className="border border-border/60 bg-gradient-to-br from-success/5 to-primary/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h2 className="text-sm font-bold text-foreground">Pourquoi faire confiance à Apprenix ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: BadgeCheck, color: 'text-success', bg: 'bg-success/10', title: 'Contenu vérifié', desc: 'Nos articles sont rédigés avec soin pour garantir leur qualité pédagogique.' },
              { icon: Star, color: 'text-primary', bg: 'bg-primary/10', title: '100% gratuit', desc: 'Toutes nos ressources sont accessibles gratuitement, sans abonnement.' },
              { icon: Zap, color: 'text-chart-2', bg: 'bg-chart-2/10', title: 'Sans publicité', desc: 'Aucune publicité intrusive — une expérience d\'apprentissage sereine.' },
              { icon: Shield, color: 'text-chart-4', bg: 'bg-chart-4/10', title: 'Données protégées', desc: 'Vos données personnelles sont protégées conformément au RGPD.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-border/40">
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActualitesPage;
