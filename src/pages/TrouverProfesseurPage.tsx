import {
  BookOpen, CheckCircle, Clock, Filter, GraduationCap,
  Loader2, Mail, Phone, Search, Send, Users, X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import {
  createAccompanimentRequest, getMyRequestsAsStudent, getTeacherProfiles,
} from '@/lib/api';
import type { DbAccompanimentRequest, DbTeacherProfile } from '@/db/supabase';

// ── Constantes ────────────────────────────────────────────────────────────────
const SUBJECTS = [
  'Maths','Français','Histoire-Géo','Anglais','Physique-Chimie','SVT',
  'Philosophie','NSI','Espagnol','Allemand','SES','Arts plastiques',
  'Technologie','Économie',
];
const LEVELS = ['Primaire','Collège','Lycée','Supérieur'];

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible',     color: 'bg-success/15 text-success border-success/30' },
  busy:      { label: 'Peu disponible', color: 'bg-warning/15 text-warning-foreground border-warning/30' },
  paused:    { label: 'En pause',       color: 'bg-muted text-muted-foreground border-border' },
};

// ── Badge disponibilité ───────────────────────────────────────────────────────
function AvailabilityBadge({ availability }: { availability: string }) {
  const info = AVAILABILITY_LABELS[availability] ?? AVAILABILITY_LABELS['available'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {info.label}
    </span>
  );
}

// ── Carte professeur ──────────────────────────────────────────────────────────
function TeacherCard({
  teacher, myRequests, onRequest, onViewProfile,
}: {
  teacher: DbTeacherProfile;
  myRequests: DbAccompanimentRequest[];
  onRequest: (t: DbTeacherProfile) => void;
  onViewProfile: (t: DbTeacherProfile) => void;
}) {
  const existing = myRequests.find(r => r.teacher_id === teacher.user_id);
  const isAccepted = existing?.status === 'accepted';
  const isPending  = existing?.status === 'pending';

  return (
    <Card className="h-full flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* En-tête */}
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 shrink-0 border-2 border-border">
            <AvatarFallback className="bg-primary/10 text-2xl select-none">
              {teacher.avatar_emoji || '👩‍🏫'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground leading-tight truncate">{teacher.display_name || 'Professeur'}</p>
            {teacher.institution && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{teacher.institution}</p>
            )}
            <div className="mt-1">
              <AvailabilityBadge availability={teacher.availability} />
            </div>
          </div>
          {teacher.verified && (
            <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" aria-label="Enseignant vérifié" />
          )}
        </div>

        {/* Bio */}
        {teacher.bio && (
          <p className="text-xs text-muted-foreground text-pretty line-clamp-2 leading-relaxed">
            {teacher.bio}
          </p>
        )}

        {/* Matières */}
        {teacher.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {teacher.subjects.slice(0, 4).map(s => (
              <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
            ))}
            {teacher.subjects.length > 4 && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">+{teacher.subjects.length - 4}</span>
            )}
          </div>
        )}

        {/* Niveaux */}
        {teacher.levels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {teacher.levels.map(l => (
              <span key={l} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">{l}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {teacher.total_students} élève{teacher.total_students !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Max {teacher.max_students}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => onViewProfile(teacher)}>
            Voir le profil
          </Button>
          {isAccepted ? (
            <Button size="sm" type="button" className="flex-1 h-9 bg-success/90 hover:bg-success text-white" onClick={() => {}} disabled>
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accepté
            </Button>
          ) : isPending ? (
            <Button size="sm" type="button" variant="secondary" className="flex-1 h-9" onClick={() => {}} disabled>
              <Clock className="w-3.5 h-3.5 mr-1" /> En attente
            </Button>
          ) : teacher.availability === 'paused' ? (
            <Button size="sm" type="button" className="flex-1 h-9" onClick={() => {}} disabled>Indisponible</Button>
          ) : (
            <Button size="sm" className="flex-1 h-9" onClick={() => onRequest(teacher)}>
              <Send className="w-3.5 h-3.5 mr-1" /> Contacter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Modal demande d'accompagnement ────────────────────────────────────────────
function RequestModal({
  teacher, open, onClose, onSuccess,
}: {
  teacher: DbTeacherProfile | null;
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!teacher) return;
    if (!subject.trim()) { toast.error('Veuillez indiquer la matière.'); return; }
    setLoading(true);
    try {
      await createAccompanimentRequest({
        teacher_id: teacher.user_id,
        subject: subject.trim(),
        message: message.trim() || undefined,
      });
      toast.success('Demande envoyée ! Le professeur va examiner votre demande.');
      setSubject('');
      setMessage('');
      onSuccess();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l\'envoi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-balance">
            <Send className="w-4 h-4 text-primary shrink-0" />
            Demande d'accompagnement
          </DialogTitle>
        </DialogHeader>
        {teacher && (
          <div className="space-y-4">
            {/* Résumé prof */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xl">{teacher.avatar_emoji || '👩‍🏫'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{teacher.display_name}</p>
                {teacher.institution && <p className="text-xs text-muted-foreground">{teacher.institution}</p>}
              </div>
            </div>

            {/* Matière */}
            <div className="space-y-1.5">
              <Label htmlFor="req-subject" className="text-sm font-normal text-muted-foreground">
                Matière concernée *
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="req-subject">
                  <SelectValue placeholder="Choisir une matière" />
                </SelectTrigger>
                <SelectContent>
                  {teacher.subjects.length > 0
                    ? teacher.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                    : SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="req-message" className="text-sm font-normal text-muted-foreground">
                Message (optionnel)
              </Label>
              <Textarea
                id="req-message"
                placeholder="Présentez-vous brièvement, expliquez vos besoins…"
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 500))}
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-10" onClick={onClose} disabled={loading}>Annuler</Button>
              <Button className="flex-1 h-10" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Modal profil détaillé ─────────────────────────────────────────────────────
function TeacherProfileModal({
  teacher, myRequests, open, onClose, onRequest,
}: {
  teacher: DbTeacherProfile | null;
  myRequests: DbAccompanimentRequest[];
  open: boolean; onClose: () => void;
  onRequest: (t: DbTeacherProfile) => void;
}) {
  if (!teacher) return null;
  const existing = myRequests.find(r => r.teacher_id === teacher.user_id);
  const isAccepted = existing?.status === 'accepted';
  const isPending  = existing?.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profil de {teacher.display_name}</DialogTitle>
        </DialogHeader>

        {/* Bannière + avatar */}
        <div className="relative -mx-6 -mt-6">
          <div className="h-28 bg-gradient-to-br from-primary/70 to-primary/40 rounded-t-lg" />
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <Avatar className="w-16 h-16 border-4 border-card shadow-lg">
              <AvatarFallback className="bg-primary/10 text-3xl">{teacher.avatar_emoji || '👩‍🏫'}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {/* Nom + disponibilité */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground text-balance">{teacher.display_name}</h2>
              {teacher.verified && (
                <Badge className="bg-success/15 text-success border-success/30 gap-1 text-xs">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </Badge>
              )}
            </div>
            {teacher.institution && (
              <p className="text-sm text-muted-foreground mt-0.5">{teacher.institution}</p>
            )}
            <div className="mt-2">
              <AvailabilityBadge availability={teacher.availability} />
            </div>
          </div>

          {/* Bio */}
          {teacher.bio && (
            <p className="text-sm text-foreground/80 text-pretty leading-relaxed">{teacher.bio}</p>
          )}

          {/* Matières & niveaux */}
          {teacher.subjects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Matières enseignées</p>
              <div className="flex flex-wrap gap-1.5">
                {teacher.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
          {teacher.levels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Niveaux</p>
              <div className="flex flex-wrap gap-1.5">
                {teacher.levels.map(l => (
                  <span key={l} className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs">{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{teacher.total_students}</p>
              <p className="text-xs text-muted-foreground">Élèves accompagnés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{teacher.max_students}</p>
              <p className="text-xs text-muted-foreground">Places maximum</p>
            </div>
          </div>

          {/* Contacts révélés seulement si accepté */}
          {isAccepted && (teacher.contact_phone || teacher.contact_email) && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/20 space-y-2">
              <p className="text-xs font-semibold text-success">Coordonnées partagées</p>
              {teacher.contact_phone && teacher.contact_mode !== 'email' && (
                <a href={`tel:${teacher.contact_phone}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-success shrink-0" />
                  {teacher.contact_phone}
                </a>
              )}
              {teacher.contact_email && teacher.contact_mode !== 'phone' && (
                <a href={`mailto:${teacher.contact_email}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-success shrink-0" />
                  {teacher.contact_email}
                </a>
              )}
            </div>
          )}
          {isPending && (
            <div className="p-3 rounded-xl bg-muted/70 border border-border text-xs text-muted-foreground">
              Les coordonnées de contact seront partagées une fois votre demande acceptée.
            </div>
          )}

          {/* Bouton action */}
          <div className="pt-1">
            {isAccepted ? (
              <Button type="button" className="w-full h-10 bg-success/90 hover:bg-success text-white" onClick={() => {}} disabled>
                <CheckCircle className="w-4 h-4 mr-1.5" /> Accompagnement en cours
              </Button>
            ) : isPending ? (
              <Button type="button" variant="secondary" className="w-full h-10" onClick={() => {}} disabled>
                <Clock className="w-4 h-4 mr-1.5" /> Demande en attente
              </Button>
            ) : teacher.availability === 'paused' ? (
              <Button type="button" className="w-full h-10" onClick={() => {}} disabled>Ce professeur n'accepte pas de nouvelles demandes</Button>
            ) : (
              <Button className="w-full h-10" onClick={() => { onClose(); onRequest(teacher); }}>
                <Send className="w-4 h-4 mr-1.5" /> Envoyer une demande
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function TrouverProfesseurPage() {
  const { user } = useApp();

  const [teachers, setTeachers] = useState<DbTeacherProfile[]>([]);
  const [myRequests, setMyRequests] = useState<DbAccompanimentRequest[]>([]);
  const [loading, setLoading]    = useState(true);
  const [search, setSearch]      = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterLevel, setFilterLevel]     = useState('all');
  const [filterAvail, setFilterAvail]     = useState('all');
  const [showFilters, setShowFilters]     = useState(false);

  const [requestTarget, setRequestTarget]   = useState<DbTeacherProfile | null>(null);
  const [profileTarget, setProfileTarget]   = useState<DbTeacherProfile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([
        getTeacherProfiles({ subject: filterSubject, level: filterLevel, availability: filterAvail }),
        user?.id ? getMyRequestsAsStudent(user.id) : Promise.resolve([]),
      ]);
      setTeachers(t);
      setMyRequests(r);
    } catch { /* offline */ }
    setLoading(false);
  }, [filterSubject, filterLevel, filterAvail, user?.id]);

  useEffect(() => { load(); }, [load]);

  // Filtre côté client (recherche texte)
  const filtered = teachers.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (t.display_name || '').toLowerCase().includes(q) ||
      (t.institution || '').toLowerCase().includes(q) ||
      (t.bio || '').toLowerCase().includes(q) ||
      t.subjects.some(s => s.toLowerCase().includes(q))
    );
  });

  const hasFilters = filterSubject !== 'all' || filterLevel !== 'all' || filterAvail !== 'all';

  return (
    <>
      <SEO title="Trouver un professeur — Apprenix" description="Trouvez un professeur pour vous accompagner dans vos révisions." />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── En-tête ────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Trouver un professeur</h1>
          <p className="text-muted-foreground mt-1 text-pretty">
            Découvrez nos enseignants disponibles et envoyez une demande d'accompagnement personnalisé.
          </p>
        </div>

        {/* ── Barre de recherche + filtres ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Nom, matière, établissement…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Effacer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters || hasFilters ? 'default' : 'outline'}
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setShowFilters(v => !v)}
              aria-label="Filtres"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Matière</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Niveau</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Disponibilité</Label>
                <Select value={filterAvail} onValueChange={setFilterAvail}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="busy">Peu disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasFilters && (
                <div className="md:col-span-3 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-8"
                    onClick={() => { setFilterSubject('all'); setFilterLevel('all'); setFilterAvail('all'); }}>
                    <X className="w-3.5 h-3.5 mr-1" /> Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Résultats ────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des professeurs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Aucun professeur trouvé</p>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              {hasFilters || search
                ? "Essayez d'ajuster vos filtres ou votre recherche."
                : "Aucun professeur n'a encore rempli son profil dans l'annuaire."}
            </p>
            {(hasFilters || search) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setFilterSubject('all'); setFilterLevel('all'); setFilterAvail('all'); }}>
                Tout réinitialiser
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {filtered.length} professeur{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(t => (
                <TeacherCard
                  key={t.id}
                  teacher={t}
                  myRequests={myRequests}
                  onRequest={setRequestTarget}
                  onViewProfile={setProfileTarget}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <RequestModal
        teacher={requestTarget}
        open={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={() => { load(); }}
      />
      <TeacherProfileModal
        teacher={profileTarget}
        myRequests={myRequests}
        open={!!profileTarget}
        onClose={() => setProfileTarget(null)}
        onRequest={t => { setProfileTarget(null); setRequestTarget(t); }}
      />
    </>
  );
}
