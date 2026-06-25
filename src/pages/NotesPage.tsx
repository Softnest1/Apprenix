import {BookOpen, ChevronLeft, Edit3,FileText, 
  Plus, 
  Save, Search, Tag, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import type { Note, Subject } from '@/types/types';

type View = 'list' | 'edit';

const NotesPage: React.FC = () => {
  const { level, notes, addNote, updateNote, deleteNote } = useApp();
  const subjects = getSubjectsForLevel(level);

  const [view, setView] = useState<View>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const [form, setForm] = useState({
    title: '',
    content: '',
    subject: subjects[0] as Subject,
    tagInput: '',
    tags: [] as string[] });

  // ── Tags disponibles (tous tags existants) ───────────────────────────────────
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // ── Notes filtrées ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notes.filter(note => {
      const matchSearch = search.trim() === '' ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === 'all' || note.subject === filterSubject;
      const matchTag = filterTag === 'all' || note.tags.includes(filterTag);
      return matchSearch && matchSubject && matchTag;
    });
  }, [notes, search, filterSubject, filterTag]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', subject: subjects[0] as Subject, tagInput: '', tags: [] });
    setView('edit');
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, subject: note.subject, tagInput: '', tags: [...note.tags] });
    setView('edit');
  };

  const handleAddTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: '' }));
    } else {
      setForm(f => ({ ...f, tagInput: '' }));
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingNote) {
      updateNote(editingNote.id, { title: form.title, content: form.content, subject: form.subject, tags: form.tags });
    } else {
      addNote({ title: form.title, content: form.content, subject: form.subject, tags: form.tags });
    }
    setView('list');
  };

  /** Construit le contenu d'export pour une note */
  const buildNoteContent = (note: Note) => ({
    title: note.title,
    subtitle: `Matière : ${note.subject}${note.tags.length ? ` · Tags : ${note.tags.join(', ')}` : ''} · ${formatDate(note.updatedAt)}`,
    sections: [{ heading: 'Contenu', body: note.content || '(note vide)' }] });

  /** Construit le contenu d'export pour toutes les notes filtrées */
  const buildAllNotesContent = () => ({
    title: 'Mes notes — Apprenix',
    subtitle: `${filtered.length} note${filtered.length > 1 ? 's' : ''} exportée${filtered.length > 1 ? 's' : ''}`,
    sections: filtered.map(n => ({
      heading: `${n.title} (${n.subject})`,
      body: n.content || '(note vide)' })) });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Vue : Éditeur de note ─────────────────────────────────────────────────────
  if (view === 'edit') {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('list')}>
            <ChevronLeft className="w-4 h-4 mr-1" />Retour
          </Button>
          <h2 className="font-semibold text-foreground flex-1 min-w-0 truncate">
            {editingNote ? 'Modifier la note' : 'Nouvelle note'}
          </h2>
          {editingNote && (
            <ExportButton
              fileName={`note-${editingNote.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`}
              variant="outline"
              size="sm"
              label="Télécharger"
              getContent={() => ({
                title: editingNote.title,
                subtitle: `Matière : ${editingNote.subject}${editingNote.tags.length ? ` · Tags : ${editingNote.tags.join(', ')}` : ''}`,
                sections: [{ heading: 'Contenu de la note', body: editingNote.content || '(note vide)' }] })}
            />
          )}
          <Button size="sm" onClick={handleSave} disabled={!form.title.trim()}>
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Titre</Label>
              <Input
                id="note-title"
                placeholder="Titre de la note"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="text-base font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Matière</Label>
                <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v as Subject }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note-tag">Ajouter un tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="note-tag"
                    placeholder="ex : chapitre-3"
                    value={form.tagInput}
                    onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}>
                    <Tag className="w-2.5 h-2.5" />{tag}
                    <span className="text-muted-foreground hover:text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Contenu</Label>
              <Textarea
                placeholder="Écrivez votre note ici..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={14}
                className="resize-y"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Vue : Liste des notes ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 min-w-0">
    <h1 className="sr-only">Notes de cours</h1>
      <SEO
        title="Notes de cours gratuites — Mon Wiki Personnel Étudiant | Apprenix"
        description="Prenez et organisez vos notes de cours en ligne. Wiki personnel, tags et recherche instantanée. Sauvegarde automatique. 100% gratuit."
        canonical="/notes"
        keywords="notes de cours gratuites, wiki scolaire personnel, organisation notes lycée, prise de notes étudiant, cahier numérique gratuit, fiches personnelles, notes université, prendre notes en ligne"
        dateModified="2026-06-20"
      />
      {/* En-tête */}
      <PageHero
        variant="tool"
        icon={FileText}
        badge={<>📓 Notes & Wiki</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Notes & Wiki Personnel"
        subtitle="Organisez vos notes de cours par matière et par tags — recherche plein texte, mise en forme enrichie. Tout votre savoir scolaire au même endroit, toujours accessible."
        stats={[
          { value: String(notes.length), label: 'Notes créées' },
          { value: String(new Set(notes.map(n => n.subject)).size), label: 'Matières couvertes' },
          { value: 'Export', label: 'PDF & texte brut' },
        ]}
        cta={{ label: 'Nouvelle note', onClick: openNew }}
      >
        <ENBadge />
      </PageHero>

      {/* Bandeau d'aide */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">📓 Comment utiliser les notes ?</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
            Cliquez sur <strong>"Nouvelle note"</strong> pour créer une fiche de cours. Choisissez la matière, ajoutez des tags (ex : <em>chapitre-3</em>) pour retrouver vite. Utilisez la <strong>recherche</strong> pour trouver un mot dans toutes vos notes.
          </p>
        </div>
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Rechercher dans les notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Rechercher dans les notes"
            autoComplete="off"
          />
        </div>
        <Select value={filterSubject} onValueChange={v => setFilterSubject(v as Subject | 'all')}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Toutes les matières" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {allTags.length > 0 && (
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Tous les tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les tags</SelectItem>
              {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Liste */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-10 md:py-20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold text-foreground text-lg">Aucune note pour l'instant</p>
            <p className="text-sm text-muted-foreground mt-2 text-pretty max-w-xs mx-auto">
              Créez votre première note pour commencer à organiser vos connaissances.
            </p>
            <Button className="mt-6" onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />Créer ma première note
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Aucune note ne correspond à votre recherche</p>
            <p className="text-sm text-muted-foreground mt-1">Essayez d'autres mots-clés ou réinitialisez les filtres.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setFilterSubject('all'); setFilterTag('all'); }}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(note => (
            <Card key={note.id} className="h-full flex flex-col group">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-balance line-clamp-2">{note.title}</CardTitle>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-xs">{note.subject}</Badge>
                  {note.tags.slice(0, 2).map(t => (
                    <Badge key={t} variant="outline" className="text-xs gap-1">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && <Badge variant="outline" className="text-xs">+{note.tags.length - 2}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">
                  {note.content || <span className="italic">Note vide</span>}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground leading-relaxed text-pretty">{formatDate(note.updatedAt)}</span>
                  <div className="flex gap-0.5">
                    <ExportButton
                      fileName={`note-${note.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`}
                      variant="ghost"
                      size="sm"
                      label=""
                      getContent={() => buildNoteContent(note)}
                      className="h-9 w-9 min-h-[48px] min-w-[44px] px-0 justify-center"
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[48px] min-w-[44px] text-muted-foreground hover:text-foreground" onClick={() => openEdit(note)} aria-label={`Modifier la note : ${note.title}`}>
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[48px] min-w-[44px] text-muted-foreground hover:text-destructive" onClick={() => deleteNote(note.id)} aria-label={`Supprimer la note : ${note.title}`}>
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} note{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur {notes.length}
          </p>
          {filtered.length > 0 && (
            <ExportButton
              fileName="mes-notes-apprenix"
              variant="outline"
              size="sm"
              label="Tout exporter"
              getContent={buildAllNotesContent}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
