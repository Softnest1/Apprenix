import {
  BookOpen, Briefcase, Building2, Calendar, CheckCircle, ChevronRight, ClipboardList,
  Edit3, Eye, EyeOff, GraduationCap, HelpCircle,
  Loader2, Mail, MessageSquare, Phone, Plus,
  Save, ShieldCheck, Star, Users, X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { upsertTeacherProfile } from '@/lib/api';
import { supabase } from '@/db/supabase';

const SUBJECTS_LIST = [
  'Maths','Français','Histoire-Géo','Anglais','Physique-Chimie','SVT',
  'Philosophie','NSI','Espagnol','Allemand','SES','Arts plastiques',
  'Éducation musicale','Technologie','Économie','Droit',
];
const LEVELS_LIST = ['Primaire','Collège','Lycée','Supérieur'];

// ─── Avatars enseignants ──────────────────────────────────────────────────────
const AVATARS_TEACHER = [
  '👨‍🏫','👩‍🏫','🧑‍🏫','👨‍💼','👩‍💼','🧑‍💼',
  '👨‍🔬','👩‍🔬','🧑‍🔬','👨‍💻','👩‍💻','🦉',
  '📚','🎓','✏️','🧠',
];

// ─── Types locaux pour le profil étendu ───────────────────────────────────────
interface TeacherExtra {
  subjects: string[];
  institution: string;
  teachingLevels: string[];
  bio: string;
  // Nouveaux champs annuaire
  availability: 'available' | 'busy' | 'paused';
  isVisible: boolean;
  maxStudents: number;
  contactPhone: string;
  contactEmail: string;
  contactMode: 'phone' | 'email' | 'app';
}

function useTeacherExtra(): [TeacherExtra, (v: TeacherExtra) => void] {
  const KEY = 'ep_teacher_extra';
  const [extra, setExtraState] = useState<TeacherExtra>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as TeacherExtra;
    } catch { /* */ }
    return {
      subjects: [], institution: '', teachingLevels: [], bio: '',
      availability: 'available', isVisible: true, maxStudents: 5,
      contactPhone: '', contactEmail: '', contactMode: 'app',
    };
  });
  const setExtra = (v: TeacherExtra) => {
    setExtraState(v);
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* */ }
  };
  return [extra, setExtra];
}
// ─── Chips sélecteur ─────────────────────────────────────────────────────────
function ChipSelector({ options, selected, onChange, label }: {
  options: string[]; selected: string[];
  onChange: (v: string[]) => void; label: string;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            type="button" key={opt}
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              selected.includes(opt)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${color} min-w-0`}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[10px] text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Outil rapide ─────────────────────────────────────────────────────────────
function QuickTool({ icon: Icon, label, desc, to }: {
  icon: React.ElementType; label: string; desc: string; to: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-left w-full group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}

// ─── Page principale profil enseignant ───────────────────────────────────────
export default function EnseignantProfilPage() {
  const { profile, setProfile } = useApp();
  const [extra, setExtra] = useTeacherExtra();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);

  const [editAvatar, setEditAvatar] = useState(profile.avatarUrl || '👨‍🏫');

  const [form, setForm] = useState({
    name:           profile.name ?? '',
    subjects:       extra.subjects,
    institution:    extra.institution,
    teachingLevels: extra.teachingLevels,
    bio:            extra.bio,
    availability:   extra.availability,
    isVisible:      extra.isVisible,
    maxStudents:    extra.maxStudents,
    contactPhone:   extra.contactPhone,
    contactEmail:   extra.contactEmail,
    contactMode:    extra.contactMode,
  });

  const initials = (profile.name || 'P').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const verified = !!(profile as { verified?: boolean }).verified;

  // Charger depuis Supabase (profiles + teacher_profiles)
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [profileRes, teacherRes] = await Promise.all([
          supabase.from('profiles')
            .select('name, avatar_url, teacher_institution, teacher_bio, teacher_subjects, teacher_levels')
            .eq('id', user.id).maybeSingle(),
          supabase.from('teacher_profiles')
            .select('*').eq('user_id', user.id).maybeSingle(),
        ]);
        const p = profileRes.data;
        const t = teacherRes.data;
        const dbExtra: TeacherExtra = {
          subjects:       t?.subjects       ?? (p?.teacher_subjects as string[]) ?? extra.subjects,
          institution:    t?.institution    ?? p?.teacher_institution ?? extra.institution,
          teachingLevels: t?.levels         ?? (p?.teacher_levels as string[])   ?? extra.teachingLevels,
          bio:            t?.bio            ?? p?.teacher_bio        ?? extra.bio,
          availability:   t?.availability   ?? extra.availability,
          isVisible:      t?.is_visible     ?? extra.isVisible,
          maxStudents:    t?.max_students   ?? extra.maxStudents,
          contactPhone:   t?.contact_phone  ?? extra.contactPhone,
          contactEmail:   t?.contact_email  ?? extra.contactEmail,
          contactMode:    t?.contact_mode   ?? extra.contactMode,
        };
        setExtra(dbExtra);
        const avatar = t?.avatar_emoji ?? p?.avatar_url ?? editAvatar;
        setEditAvatar(avatar);
        setProfile(prev => ({ ...prev, avatarUrl: avatar, name: p?.name ?? prev.name }));
        setForm(f => ({ ...f, ...dbExtra, name: p?.name ?? f.name }));
      } catch { /* offline */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = () => {
    setForm({
      name:           profile.name ?? '',
      subjects:       extra.subjects,
      institution:    extra.institution,
      teachingLevels: extra.teachingLevels,
      bio:            extra.bio,
      availability:   extra.availability,
      isVisible:      extra.isVisible,
      maxStudents:    extra.maxStudents,
      contactPhone:   extra.contactPhone,
      contactEmail:   extra.contactEmail,
      contactMode:    extra.contactMode,
    });
    setEditing(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Le nom est obligatoire.'); return; }
    setSaving(true);
    setProfile(p => ({ ...p, name: form.name.trim(), avatarUrl: editAvatar }));
    const newExtra: TeacherExtra = {
      subjects:       form.subjects,
      institution:    form.institution,
      teachingLevels: form.teachingLevels,
      bio:            form.bio,
      availability:   form.availability,
      isVisible:      form.isVisible,
      maxStudents:    form.maxStudents,
      contactPhone:   form.contactPhone,
      contactEmail:   form.contactEmail,
      contactMode:    form.contactMode,
    };
    setExtra(newExtra);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          // Mise à jour profil de base
          supabase.from('profiles').update({
            name:                form.name.trim(),
            avatar_url:          editAvatar,
            teacher_institution: form.institution,
            teacher_bio:         form.bio,
            teacher_subjects:    form.subjects,
            teacher_levels:      form.teachingLevels,
          }).eq('id', user.id),
          // Upsert teacher_profiles (annuaire)
          upsertTeacherProfile(user.id, {
            display_name:  form.name.trim(),
            avatar_emoji:  editAvatar,
            institution:   form.institution || undefined,
            bio:           form.bio || undefined,
            subjects:      form.subjects,
            levels:        form.teachingLevels,
            availability:  form.availability,
            is_visible:    form.isVisible,
            max_students:  form.maxStudents,
            contact_phone: form.contactPhone || undefined,
            contact_email: form.contactEmail || undefined,
            contact_mode:  form.contactMode,
          }),
        ]);
      }
    } catch { /* offline */ }
    setSaving(false);
    setEditing(false);
    toast.success('Profil mis à jour !');
  };

  return (
    <>
      <SEO title="Mon profil — Espace Enseignant" description="Gérez votre profil enseignant sur Apprenix." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header profil ─────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          {/* Bannière couleur */}
          <div className="h-24 bg-gradient-to-br from-primary/80 to-primary/50 relative">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          </div>

          <CardContent className="px-5 pb-5">
            {/* Avatar + bouton édition */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-card shadow-lg">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold select-none">
                    {(editing ? editAvatar : profile.avatarUrl) || initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="w-3.5 h-3.5 mr-1" /> Annuler
                  </Button>
                  <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Enregistrer
                  </Button>
                </div>
              )}
            </div>

            {/* Nom + badge */}
            {!editing ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground text-balance">{profile.name || 'Enseignant'}</h1>
                  {verified && (
                    <Badge className="bg-success/15 text-success border-success/30 gap-1 text-xs">
                      <ShieldCheck className="w-3 h-3" /> Enseignant vérifié
                    </Badge>
                  )}
                </div>
                {extra.institution && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" /> {extra.institution}
                  </p>
                )}
                {extra.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extra.subjects.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                )}
                {extra.teachingLevels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {extra.teachingLevels.map(l => (
                      <span key={l} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">{l}</span>
                    ))}
                  </div>
                )}
                {extra.bio && (
                  <p className="text-sm text-muted-foreground mt-2 text-pretty leading-relaxed">{extra.bio}</p>
                )}
              </div>
            ) : (
              /* ── Formulaire d'édition ── */
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prof-name" className="text-sm font-normal text-muted-foreground mb-1.5">Nom complet *</Label>
                  <Input
                    id="prof-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Votre nom et prénom"
                  />
                </div>
                {/* Sélecteur avatar enseignant */}
                <div>
                  <Label className="text-sm font-normal text-muted-foreground mb-2 block">Personnage / Avatar</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATARS_TEACHER.map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setEditAvatar(av)}
                        className={[
                          'w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all duration-150',
                          editAvatar === av
                            ? 'ring-2 ring-primary bg-primary/10 scale-110 shadow-md'
                            : 'bg-secondary hover:bg-muted hover:scale-105',
                        ].join(' ')}
                        aria-label={`Avatar ${av}`}
                        aria-pressed={editAvatar === av}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="prof-inst" className="text-sm font-normal text-muted-foreground mb-1.5">Établissement</Label>
                  <Input
                    id="prof-inst"
                    value={form.institution}
                    onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                    placeholder="Lycée Victor Hugo, Université Paris…"
                    className="flex items-center gap-2"
                  />
                </div>
                <ChipSelector
                  label="Matières enseignées"
                  options={SUBJECTS_LIST}
                  selected={form.subjects}
                  onChange={v => setForm(f => ({ ...f, subjects: v }))}
                />
                <ChipSelector
                  label="Niveaux enseignés"
                  options={LEVELS_LIST}
                  selected={form.teachingLevels}
                  onChange={v => setForm(f => ({ ...f, teachingLevels: v }))}
                />
                <div>
                  <Label htmlFor="prof-bio" className="text-sm font-normal text-muted-foreground mb-1.5">Présentation (max 500 caractères)</Label>
                  <Textarea
                    id="prof-bio"
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 500) }))}
                    placeholder="Quelques mots sur votre parcours, vos méthodes…"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/500</p>
                </div>

                {/* ── Annuaire — nouveaux champs ── */}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3">Paramètres de l'annuaire</p>
                  <div className="space-y-4">
                    {/* Visibilité */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        {form.isVisible ? <Eye className="w-4 h-4 text-success shrink-0" /> : <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">Visible dans l'annuaire</p>
                          <p className="text-xs text-muted-foreground">Les élèves peuvent vous trouver et envoyer des demandes</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.isVisible ? 'bg-success' : 'bg-muted-foreground/30'}`}
                        aria-pressed={form.isVisible}
                        aria-label="Visibilité dans l'annuaire"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Disponibilité */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal text-muted-foreground">Disponibilité</Label>
                      <Select value={form.availability} onValueChange={v => setForm(f => ({ ...f, availability: v as TeacherExtra['availability'] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible — j'accepte de nouvelles demandes</SelectItem>
                          <SelectItem value="busy">Peu disponible — en attente selon mes disponibilités</SelectItem>
                          <SelectItem value="paused">En pause — je n'accepte pas de nouvelles demandes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Max étudiants */}
                    <div className="space-y-1.5">
                      <Label htmlFor="max-students" className="text-sm font-normal text-muted-foreground">
                        Nombre max d'élèves accompagnés ({form.maxStudents})
                      </Label>
                      <input
                        id="max-students"
                        type="range"
                        min={1} max={20} step={1}
                        value={form.maxStudents}
                        onChange={e => setForm(f => ({ ...f, maxStudents: Number(e.target.value) }))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1</span><span>10</span><span>20</span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                      <Label className="text-sm font-normal text-muted-foreground">Mode de contact partagé avec les élèves acceptés</Label>
                      <Select value={form.contactMode} onValueChange={v => setForm(f => ({ ...f, contactMode: v as TeacherExtra['contactMode'] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="app">Via l'espace de travail uniquement</SelectItem>
                          <SelectItem value="phone">Partager mon numéro de téléphone</SelectItem>
                          <SelectItem value="email">Partager mon adresse email</SelectItem>
                        </SelectContent>
                      </Select>
                      {(form.contactMode === 'phone' || form.contactMode === 'email') && (
                        <div className="space-y-3">
                          {form.contactMode === 'phone' && (
                            <div className="space-y-1.5">
                              <Label htmlFor="contact-phone" className="text-sm font-normal text-muted-foreground">
                                <Phone className="w-3.5 h-3.5 inline mr-1" />Numéro de téléphone
                              </Label>
                              <Input
                                id="contact-phone"
                                type="tel"
                                placeholder="+33 6 00 00 00 00"
                                value={form.contactPhone}
                                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                              />
                            </div>
                          )}
                          {form.contactMode === 'email' && (
                            <div className="space-y-1.5">
                              <Label htmlFor="contact-email" className="text-sm font-normal text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 inline mr-1" />Adresse email de contact
                              </Label>
                              <Input
                                id="contact-email"
                                type="email"
                                placeholder="votre@email.com"
                                value={form.contactEmail}
                                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                              />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border">
                            Ces coordonnées ne seront visibles que par les élèves dont vous avez accepté la demande.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Paramètres annuaire (vue) ─────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Annuaire &amp; accompagnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                {extra.isVisible ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <p className="text-sm text-foreground">{extra.isVisible ? 'Visible dans l\'annuaire' : 'Masqué de l\'annuaire'}</p>
              </div>
              {extra.isVisible && (
                <span className="px-2 py-0.5 bg-success/15 text-success border border-success/30 rounded-full text-xs font-medium">Actif</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <p className="text-sm text-muted-foreground">Disponibilité</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                extra.availability === 'available' ? 'bg-success/15 text-success border-success/30' :
                extra.availability === 'busy'      ? 'bg-warning/15 text-warning-foreground border-warning/30' :
                'bg-muted text-muted-foreground border-border'
              }`}>
                {extra.availability === 'available' ? 'Disponible' : extra.availability === 'busy' ? 'Peu disponible' : 'En pause'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <p className="text-sm text-muted-foreground">Max élèves accompagnés</p>
              <p className="text-sm font-medium text-foreground">{extra.maxStudents}</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-muted-foreground">Contact partagé</p>
              <p className="text-sm font-medium text-foreground">
                {extra.contactMode === 'app' ? 'Espace de travail uniquement' :
                 extra.contactMode === 'phone' ? (extra.contactPhone || 'Téléphone (non renseigné)') :
                 (extra.contactEmail || 'Email (non renseigné)')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Statistiques ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Mes statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <StatBadge icon={HelpCircle}    label="Questions répondues"   value={0} color="bg-warning/5 border-warning/20 text-warning-foreground" />
            <StatBadge icon={BookOpen}      label="Contenus publiés"      value={0} color="bg-primary/5 border-primary/20 text-primary" />
            <StatBadge icon={Users}         label="Élèves aidés"          value={0} color="bg-success/5 border-success/20 text-success" />
          </CardContent>
        </Card>

        {/* ── Informations du compte ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground">Rôle</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-medium text-foreground">Enseignant</p>
                  {verified && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                </div>
              </div>
            </div>
            {extra.subjects.length > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Matières</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{extra.subjects.join(', ')}</p>
                </div>
                <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            )}
            {!verified && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <ShieldCheck className="w-4 h-4 text-warning-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-warning-foreground">Compte en attente de vérification</p>
                  <p className="text-xs text-warning-foreground/80 mt-0.5">
                    Votre document est en cours d'examen. Toutes les fonctionnalités restent accessibles.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Outils rapides ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Accès rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickTool icon={HelpCircle}    label="Répondre à une question" desc="Voir les questions en attente des élèves"    to="/espace-enseignant/questions"   />
            <QuickTool icon={Plus}          label="Créer un contenu"        desc="Cours, fiche de révision ou exercice"        to="/espace-enseignant/contenus"    />
            <QuickTool icon={ClipboardList} label="Corriger des copies"     desc="Copies soumises en attente de correction"   to="/espace-enseignant/corrections" />
            <QuickTool icon={Calendar}      label="Voir mon agenda"         desc="Cours et événements à venir"                to="/espace-enseignant/agenda"      />
            <QuickTool icon={MessageSquare} label="Messagerie élèves"       desc="Échanges directs avec vos élèves"           to="/espace-enseignant/messagerie"  />
          </CardContent>
        </Card>

      </div>
    </>
  );
}
