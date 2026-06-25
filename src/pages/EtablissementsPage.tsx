import {AlertCircle, Award,BookMarked, BookOpen, 
  Building2, ChevronLeft, ChevronRight,ExternalLink, Filter,Globe, GraduationCap, Info, 
  Loader2, MapPin, RefreshCw, 
  School, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Etablissement {
  identifiant_de_l_etablissement: string;
  nom_etablissement: string;
  type_etablissement: string;
  statut_public_prive: string;
  nom_commune: string;
  code_postal: string;
  libelle_departement: string;
  libelle_academie: string;
  libelle_region: string;
  voie_generale?: number | null;
  voie_technologique?: number | null;
  voie_professionnelle?: number | null;
  ecole_maternelle?: number | null;
  ecole_elementaire?: number | null;
  ulis?: number | null;
  segpa?: number | null;
  web?: string | null;
  mail?: string | null;
  etat?: string;
  post_bac?: number | null;
  appartenance_education_prioritaire?: string | null;
}

// ─── Constantes ────────────────────────────────────────────────────────────────
const API_BASE = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records';
const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'Ecole', label: 'École (Primaire)' },
  { value: 'Collège', label: 'Collège' },
  { value: 'Lycée', label: 'Lycée' },
  { value: 'EREA', label: 'EREA (Enseignement adapté)' },
];

const STATUT_OPTIONS = [
  { value: 'all', label: 'Public & Privé' },
  { value: 'Public', label: 'Public uniquement' },
  { value: 'Privé', label: 'Privé uniquement' },
];

const VOIE_OPTIONS = [
  { value: 'all', label: 'Toutes les voies' },
  { value: 'generale', label: 'Voie Générale (Bac G)' },
  { value: 'technologique', label: 'Voie Technologique (Bac T)' },
  { value: 'professionnelle', label: 'Voie Professionnelle (Bac Pro)' },
  { value: 'ulis', label: 'ULIS (Inclusion)' },
  { value: 'segpa', label: 'SEGPA (Adapté)' },
  { value: 'post_bac', label: 'Post-Bac (BTS/CPGE)' },
  { value: 'rep', label: 'REP / REP+ (Éducation prioritaire)' },
];

// ─── Stats officielles ─────────────────────────────────────────────────────────
const STATS = [
  { value: '68 936', label: 'Établissements\nen France', icon: Building2 },
  { value: '9 173', label: 'Collèges\npublics & privés', icon: BookOpen },
  { value: '5 638', label: 'Lycées\n(général, techno, pro)', icon: GraduationCap },
  { value: '48 726', label: 'Écoles primaires\n(maternelle + élémentaire)', icon: School },
];

// ─── Badges couleur par type ───────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    'Ecole': 'bg-chart-2/10 text-chart-2 border-chart-2/25',
    'Collège': 'bg-chart-4/10 text-chart-4 border-chart-4/25',
    'Lycée': 'bg-primary/10 text-primary border-primary/25',
    'EREA': 'bg-chart-5/10 text-chart-5 border-chart-5/25' };
  const cls = config[type] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {type}
    </span>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  return statut === 'Public' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-chart-3/10 text-chart-3 border border-chart-3/25">
      Public
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-chart-5/10 text-chart-5 border border-chart-5/25">
      Privé
    </span>
  );
}

// ─── Carte établissement ───────────────────────────────────────────────────────
function EtablissementCard({ etab }: { etab: Etablissement }) {
  const voies: string[] = [];
  if (etab.voie_generale) voies.push('Général');
  if (etab.voie_technologique) voies.push('Techno');
  if (etab.voie_professionnelle) voies.push('Pro');
  if (etab.ecole_maternelle) voies.push('Maternelle');
  if (etab.ecole_elementaire) voies.push('Élémentaire');

  const specials: string[] = [];
  if (etab.ulis) specials.push('ULIS');
  if (etab.segpa) specials.push('SEGPA');
  if (etab.post_bac) specials.push('Post-Bac');
  if (etab.appartenance_education_prioritaire === 'REP+') specials.push('REP+');
  else if (etab.appartenance_education_prioritaire === 'REP') specials.push('REP');

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-foreground leading-snug text-balance flex-1 min-w-0">
            {etab.nom_etablissement}
          </CardTitle>
          <StatutBadge statut={etab.statut_public_prive} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <TypeBadge type={etab.type_etablissement} />
          <span className="text-xs font-mono text-muted-foreground ml-auto shrink-0">
            {etab.identifiant_de_l_etablissement}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4 gap-3">
        {/* Localisation */}
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">
            {etab.nom_commune} ({etab.code_postal}) — {etab.libelle_departement}
          </span>
        </div>

        {/* Académie */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>Académie de {etab.libelle_academie}</span>
        </div>

        {/* Voies */}
        {voies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {voies.map(v => (
              <span key={v} className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground border border-border">
                {v}
              </span>
            ))}
          </div>
        )}

        {/* Spéciaux */}
        {specials.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specials.map(s => (
              <span key={s} className="px-1.5 py-0.5 text-xs rounded bg-chart-5/10 text-chart-5 border border-chart-5/20 font-medium">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          {etab.web ? (
            <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1">
              <a href={etab.web} target="_blank" rel="noopener noreferrer">
                <Globe className="w-3.5 h-3.5" />
                Site officiel
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `${etab.nom_etablissement} ${etab.nom_commune} ${etab.code_postal}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Search className="w-3.5 h-3.5" />
                Rechercher
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Squelette de chargement ───────────────────────────────────────────────────
function EtabSkeleton() {
  return (
    <Card className="h-48 border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <Skeleton className="bg-muted h-4 w-3/4 rounded" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="bg-muted h-5 w-16 rounded-full" />
          <Skeleton className="bg-muted h-5 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <Skeleton className="bg-muted h-3 w-full rounded" />
        <Skeleton className="bg-muted h-3 w-2/3 rounded" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="bg-muted h-5 w-14 rounded" />
          <Skeleton className="bg-muted h-5 w-14 rounded" />
        </div>
        <Skeleton className="bg-muted h-8 w-full rounded mt-auto" />
      </CardContent>
    </Card>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function EtablissementsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [statut, setStatut] = useState('all');
  const [voie, setVoie] = useState('all');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Etablissement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce recherche 400ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Reset page si filtre change
  useEffect(() => { setPage(0); }, [type, statut, voie]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const wheres: string[] = ["etat='OUVERT'"];

      if (type !== 'all') wheres.push(`type_etablissement='${type}'`);
      if (statut !== 'all') {
        const s = statut === 'Privé' ? "statut_public_prive='Privé'" : "statut_public_prive='Public'";
        wheres.push(s);
      }
      if (voie === 'generale') wheres.push('voie_generale=1');
      else if (voie === 'technologique') wheres.push('voie_technologique=1');
      else if (voie === 'professionnelle') wheres.push('voie_professionnelle=1');
      else if (voie === 'ulis') wheres.push('ulis=1');
      else if (voie === 'segpa') wheres.push('segpa=1');
      else if (voie === 'post_bac') wheres.push('post_bac=1');
      else if (voie === 'rep') wheres.push("(appartenance_education_prioritaire='REP' OR appartenance_education_prioritaire='REP+')");

      if (debouncedSearch.trim().length >= 2) {
        const s = debouncedSearch.trim().replace(/'/g, "\\'");
        wheres.push(`(nom_etablissement LIKE '%${s}%' OR nom_commune LIKE '%${s}%' OR code_postal LIKE '%${s}%' OR libelle_departement LIKE '%${s}%')`);
      }

      const params = new URLSearchParams({
        select: [
          'identifiant_de_l_etablissement', 'nom_etablissement', 'type_etablissement',
          'statut_public_prive', 'nom_commune', 'code_postal', 'libelle_departement',
          'libelle_academie', 'libelle_region', 'voie_generale', 'voie_technologique',
          'voie_professionnelle', 'ecole_maternelle', 'ecole_elementaire', 'ulis', 'segpa',
          'web', 'mail', 'etat', 'post_bac', 'appartenance_education_prioritaire',
        ].join(','),
        where: wheres.join(' AND '),
        order_by: 'nom_etablissement',
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE) });

      const res = await fetch(`${API_BASE}?${params}`);
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
      const json = await res.json();
      setData(json.results || []);
      setTotal(json.total_count || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion à l\'API');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type, statut, voie, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
    <h1 className="sr-only">Annuaire des établissements scolaires</h1>
      <SEO
        title="Annuaire Établissements Scolaires — 68 936 Collèges, Lycées & Écoles | Apprenix"
        description="Annuaire des établissements scolaires en France : collèges, lycées, écoles, EREA. Données officielles 2026, codes UAI, adresses. Gratuit."
        canonical="/etablissements"

        keywords="annuaire établissements scolaires France, collèges France, lycées France, écoles primaires, EREA, Éducation nationale, codes UAI établissement, trouver lycée collège France, annuaire académie"
        dateModified="2026-06-18"
      />

      <PageHero
        variant="trust"
        badge={<ENBadge />}
        title={<>Annuaire des établissements<br className="hidden md:block" /> scolaires de France</>}
        subtitle="68 936 établissements réels — données officielles du Ministère de l'Éducation nationale, mises à jour mai 2026. Codes UAI vérifiables."
        icon={School}
        stats={[
          { value: '68 936', label: 'établissements' },
          { value: '9 173', label: 'collèges' },
          { value: '5 638', label: 'lycées' },
          { value: 'MAJ 2026', label: 'mise à jour' },
        ]}
      />

      <div className="min-w-0 space-y-6 md:space-y-8">

        {/* ── Statistiques officielles ─────────────────────────────────────── */}
        <section aria-label="Statistiques établissements">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {STATS.map(s => (
              <Card key={s.label} className="border-border text-center p-4 h-full">
                <div className="flex justify-center mb-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
                    <s.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-xl md:text-2xl xl:text-3xl font-bold text-foreground tabular-nums">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line leading-snug">{s.label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Filtres de recherche ─────────────────────────────────────────── */}
        <Card className="border-border">
          <CardHeader className="pb-3 pt-4 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4 text-primary" />
              Rechercher un établissement
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 space-y-3">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9 h-11 text-base"
                placeholder="Nom de l'établissement, commune, code postal, département…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Rechercher un établissement"
              />
              {search && (
                <button type="button"
                  onClick={() => { setSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filtres en ligne */}
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={type} onValueChange={v => setType(v)}>
                <SelectTrigger className="h-10 flex-1" aria-label="Filtrer par niveau">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={statut} onValueChange={v => setStatut(v)}>
                <SelectTrigger className="h-10 flex-1" aria-label="Filtrer par statut">
                  <SelectValue placeholder="Public & Privé" />
                </SelectTrigger>
                <SelectContent>
                  {STATUT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={voie} onValueChange={v => setVoie(v)}>
                <SelectTrigger className="h-10 flex-1" aria-label="Filtrer par voie">
                  <SelectValue placeholder="Toutes les voies" />
                </SelectTrigger>
                <SelectContent>
                  {VOIE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-10 shrink-0"
                onClick={() => { setSearch(''); setType('all'); setStatut('all'); setVoie('all'); setPage(0); }}
                aria-label="Réinitialiser les filtres"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Résultats ────────────────────────────────────────────────────── */}
        <section aria-label="Résultats de recherche">
          {/* Compteur */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement…
                </span>
              ) : error ? (
                <span className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </span>
              ) : (
                <span>
                  <strong className="text-foreground tabular-nums">{total.toLocaleString('fr-FR')}</strong>
                  {' '}établissement{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                  {debouncedSearch && <span className="ml-1">pour « {debouncedSearch} »</span>}
                </span>
              )}
            </p>
            {!loading && total > 0 && (
              <p className="text-sm text-muted-foreground tabular-nums">
                Page {page + 1} / {totalPages.toLocaleString('fr-FR')}
              </p>
            )}
          </div>

          {/* Erreur */}
          {error && !loading && (
            <Card className="border-destructive/30 bg-destructive/5 mb-4">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Impossible de charger les données</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    L'API du Ministère de l'Éducation nationale est momentanément indisponible. Réessayez dans quelques instants.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 h-8" onClick={fetchData}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Réessayer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grille résultats — min-h stabilise le footer pendant le chargement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px] content-start">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <EtabSkeleton key={i} />)
              : data.map(etab => (
                <EtablissementCard key={etab.identifiant_de_l_etablissement} etab={etab} />
              ))
            }
          </div>

          {/* État vide */}
          {!loading && !error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Search className="w-12 h-12 text-muted-foreground/40" aria-hidden="true" />
              <div>
                <p className="text-base font-medium text-foreground">Aucun établissement trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essaie un autre nom, une commune ou modifie les filtres.
                </p>
              </div>
              <Button variant="outline" onClick={() => { setSearch(''); setType('all'); setStatut('all'); setVoie('all'); }}>
                Voir tous les établissements
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>

              {/* Pages visibles */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let p: number;
                  if (totalPages <= 5) p = i;
                  else if (page < 3) p = i;
                  else if (page > totalPages - 3) p = totalPages - 5 + i;
                  else p = page - 2 + i;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9 p-0 tabular-nums"
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p + 1}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Page suivante"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </nav>
          )}
        </section>

        {/* ── Source officielle ─────────────────────────────────────────────── */}
        <Card className="border-chart-3/25 bg-chart-3/5">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
            <Info className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Source 100 % officielle — 0 % IA</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Données extraites en temps réel de l'API ouverte du Ministère de l'Éducation nationale
                (data.education.gouv.fr). Licence Etalab 2.0. Chaque établissement possède un code UAI unique
                vérifiable sur le site du Ministère.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 h-9 gap-1.5">
              <a href="https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Source officielle
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* ── Lien vers ressources pédagogiques ───────────────────────────── */}
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
            <BookMarked className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Ressources pédagogiques officielles</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Annales, cours, méthodes de révision et liens officiels par niveau (Éduscol, CNED, Onisep, Sésamath…)
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="shrink-0 h-9 gap-1.5">
              <a href="/ressources-officielles">
                <BookOpen className="w-4 h-4" />
                Voir les ressources
              </a>
            </Button>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
