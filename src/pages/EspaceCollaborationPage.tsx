import {
  BookOpen, CheckCircle, Circle, Download, ExternalLink,
  FileText, Image, Link2, Loader2, Paperclip, Play, Plus, Save, Send, Trash2, Upload,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import {
  addCollaborationObjective,
  addCollaborationResource,
  deleteCollaborationObjective,
  deleteCollaborationResource,
  getCollaborationById,
  getCollaborationMessages,
  getCollaborationObjectives,
  getCollaborationResources,
  getProfile,
  getTeacherProfileByUserId,
  sendCollaborationMessage,
  toggleObjectiveCompleted,
  updateCollaborationNotes,
  uploadCollaborationFile,
} from '@/lib/api';
import { supabase } from '@/db/supabase';
import type {
  DbCollaboration, DbCollaborationMessage, DbCollaborationObjective,
  DbCollaborationResource, DbTeacherProfile,
} from '@/db/supabase';

type PartnerInfo = { display_name: string; avatar_emoji: string; institution?: string; contact_phone?: string; contact_email?: string; contact_mode?: string };

// ── Helpers fichiers ──────────────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
].join(',');

const MAX_SIZE_MB = 200;

function getFileIcon(type: string, url: string) {
  if (type.startsWith('video/') || url.match(/\.(mp4|webm|ogg|mov|avi)/i))
    return <Play className="w-5 h-5 text-purple-500 shrink-0" />;
  if (type.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp)/i))
    return <Image className="w-5 h-5 text-primary shrink-0" />;
  if (type === 'application/pdf' || url.match(/\.pdf/i))
    return <FileText className="w-5 h-5 text-destructive shrink-0" />;
  if (type.includes('word') || url.match(/\.docx?/i))
    return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
  if (type.includes('sheet') || type.includes('excel') || url.match(/\.xlsx?/i))
    return <FileText className="w-5 h-5 text-green-600 shrink-0" />;
  if (type.includes('presentation') || type.includes('powerpoint') || url.match(/\.pptx?/i))
    return <FileText className="w-5 h-5 text-orange-500 shrink-0" />;
  return <Paperclip className="w-5 h-5 text-muted-foreground shrink-0" />;
}

function getFileBadge(url: string): string {
  if (url.match(/\.pdf/i)) return 'PDF';
  if (url.match(/\.docx?/i)) return 'Word';
  if (url.match(/\.xlsx?/i)) return 'Excel';
  if (url.match(/\.pptx?/i)) return 'PowerPoint';
  if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return 'Image';
  if (url.match(/\.mp4/i)) return 'Vidéo MP4';
  if (url.match(/\.webm/i)) return 'Vidéo WebM';
  if (url.match(/\.mov/i)) return 'Vidéo MOV';
  if (url.match(/\.avi/i)) return 'Vidéo AVI';
  if (url.match(/\.(ogg|ogv)/i)) return 'Vidéo';
  if (url.match(/\.txt/i)) return 'Texte';
  return 'Fichier';
}

const SUBJECTS_LIST = ['Maths','Français','Histoire-Géo','Anglais','Physique-Chimie','SVT','Philosophie','NSI','Espagnol','Allemand','SES'];

// ── Composant Chat
function ChatTab({
  collabId, currentUserId, partnerName, partnerEmoji,
}: {
  collabId: string; currentUserId: string; partnerName: string; partnerEmoji: string;
}) {
  const [messages, setMessages]   = useState<DbCollaborationMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    try {
      const msgs = await getCollaborationMessages(collabId);
      setMessages(msgs);
    } catch { /* offline */ }
    setLoading(false);
  };

  // ── Realtime : nouveaux messages en temps réel ─────────────────────────
  useEffect(() => {
    load();

    const channel = supabase
      .channel(`chat-${collabId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_messages',
          filter: `collaboration_id=eq.${collabId}`,
        },
        (payload) => {
          const msg = payload.new as DbCollaborationMessage;
          setMessages(prev => {
            // Éviter les doublons (message optimiste déjà ajouté)
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [collabId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    setText('');
    try {
      await sendCollaborationMessage(collabId, content);
      // Le Realtime reçoit le message — pas besoin de reload manuel
    } catch { toast.error('Impossible d\'envoyer le message.'); setText(content); }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Aucun message. Démarrez la conversation !
          </div>
        ) : (
          messages.map(m => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
                {!isMine && (
                  <Avatar className="w-7 h-7 shrink-0 border border-border mt-0.5">
                    <AvatarFallback className="bg-primary/10 text-sm">{partnerEmoji}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {new Date(m.created_at!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <div className="shrink-0 p-4 pt-2 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="Votre message… (Entrée pour envoyer)"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            className="flex-1 min-h-[60px] resize-none text-sm px-3"
          />
          <Button onClick={handleSend} disabled={sending || !text.trim()} className="h-full px-4 self-end mb-0.5">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Composant Ressources ──────────────────────────────────────────────────────
function ResourcesTab({ collabId, currentUserId }: { collabId: string; currentUserId: string }) {
  const [resources, setResources]   = useState<DbCollaborationResource[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  // onglet dans la dialog : 'file' ou 'link'
  const [addMode, setAddMode]       = useState<'file' | 'link'>('file');
  // upload fichier
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // lien web
  const [newTitle, setNewTitle]   = useState('');
  const [newUrl, setNewUrl]       = useState('');
  const [adding, setAdding]       = useState(false);
  // aperçu image/PDF/vidéo
  const [preview, setPreview]     = useState<{ url: string; title: string; kind: 'pdf' | 'image' | 'video' } | null>(null);

  const load = async () => {
    try { setResources(await getCollaborationResources(collabId)); }
    catch { /* offline */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, [collabId]);

  // ── Upload fichier réel ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }
    setSelectedFile(f);
  };

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Sélectionnez un fichier.'); return; }
    setUploading(true);
    setUploadProgress(10);
    try {
      // Simule progression pendant l'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 80));
      }, 300);

      const signedUrl = await uploadCollaborationFile(collabId, currentUserId, selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(95);

      await addCollaborationResource({
        collaboration_id: collabId,
        title: selectedFile.name,
        resource_type: 'file',
        url: signedUrl,
      });

      setUploadProgress(100);
      toast.success(`${selectedFile.name} partagé avec succès.`);
      setSelectedFile(null);
      setShowAdd(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'upload.';
      toast.error(msg);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  // ── Ajout lien web ────────────────────────────────────────────────────────
  const handleAddLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) { toast.error('Titre et URL obligatoires.'); return; }
    setAdding(true);
    try {
      await addCollaborationResource({
        collaboration_id: collabId,
        title: newTitle.trim(),
        resource_type: 'link',
        url: newUrl.trim(),
      });
      setNewTitle(''); setNewUrl(''); setShowAdd(false);
      toast.success('Lien ajouté.');
      await load();
    } catch { toast.error('Erreur lors de l\'ajout.'); }
    setAdding(false);
  };

  const handleDelete = async (r: DbCollaborationResource) => {
    try {
      await deleteCollaborationResource(r.id);
      setResources(prev => prev.filter(x => x.id !== r.id));
      toast.success('Supprimé.');
    } catch { toast.error('Erreur.'); }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setNewTitle('');
    setNewUrl('');
    setAddMode('file');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resources.length} ressource{resources.length !== 1 ? 's' : ''} partagée{resources.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="h-8 gap-1.5" onClick={() => { resetDialog(); setShowAdd(true); }}>
          <Plus className="w-3.5 h-3.5" /> Partager
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Upload className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Aucune ressource pour l'instant.</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Partagez des devoirs, exercices (PDF, Word, Excel…) ou des liens utiles directement ici.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map(r => {
            const isImage = r.url.match(/\.(jpg|jpeg|png|gif|webp)/i) != null;
            const isPdf   = r.url.match(/\.pdf/i) != null;
            const isVideo = r.url.match(/\.(mp4|webm|ogg|mov|avi)/i) != null;
            const badge   = r.resource_type === 'link' ? 'Lien' : getFileBadge(r.url);
            const canPreview = r.resource_type === 'file' && (isImage || isPdf || isVideo);
            const previewKind = isPdf ? 'pdf' : isVideo ? 'video' : 'image';

            return (
              <div key={r.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group">
                {/* Icône */}
                {r.resource_type === 'link'
                  ? <Link2 className="w-5 h-5 text-primary shrink-0" />
                  : getFileIcon(r.resource_type, r.url)
                }

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium shrink-0">
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Aperçu image, PDF ou vidéo */}
                  {canPreview && (
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary"
                      onClick={() => setPreview({ url: r.url, title: r.title, kind: previewKind as 'pdf' | 'image' | 'video' })}
                      title="Aperçu">
                      {isVideo ? <Play className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  {/* Ouvrir / télécharger */}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" download={r.resource_type === 'file' ? r.title : undefined}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary"
                      title={r.resource_type === 'file' ? 'Télécharger' : 'Ouvrir'}>
                      {r.resource_type === 'file'
                        ? <Download className="w-3.5 h-3.5" />
                        : <ExternalLink className="w-3.5 h-3.5" />
                      }
                    </Button>
                  </a>
                  {/* Supprimer (propre à l'uploader) */}
                  {r.uploader_id === currentUserId && (
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(r)} title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog ajout ── */}
      <Dialog open={showAdd} onOpenChange={v => { setShowAdd(v); if (!v) resetDialog(); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Partager une ressource</DialogTitle>
          </DialogHeader>

          {/* Sélecteur mode */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setAddMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                addMode === 'file' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-4 h-4" /> Fichier
            </button>
            <button
              type="button"
              onClick={() => setAddMode('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                addMode === 'link' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link2 className="w-4 h-4" /> Lien web
            </button>
          </div>

          {addMode === 'file' ? (
            <div className="space-y-4">
              {/* Zone de dépôt / sélection */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  selectedFile ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) {
                    if (f.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`Max ${MAX_SIZE_MB} Mo.`); return; }
                    setSelectedFile(f);
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <Paperclip className="w-8 h-8 text-primary mx-auto" />
                    <p className="text-sm font-medium text-foreground truncate px-2">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                    <p className="text-sm font-medium text-foreground">Cliquez ou glissez un fichier ici</p>
                    <p className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, Images, Vidéos — max {MAX_SIZE_MB} Mo</p>
                  </div>
                )}
              </div>

              {/* Barre de progression upload */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Upload en cours…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10" onClick={() => setShowAdd(false)} disabled={uploading}>
                  Annuler
                </Button>
                <Button className="flex-1 h-10" onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Upload…</>
                    : <><Upload className="w-4 h-4 mr-1.5" /> Envoyer</>
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Titre *</Label>
                <Input placeholder="ex : Vidéo YouTube — Les fonctions" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">URL *</Label>
                <Input placeholder="https://…" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10" onClick={() => setShowAdd(false)} disabled={adding}>Annuler</Button>
                <Button className="flex-1 h-10" onClick={handleAddLink} disabled={adding}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Link2 className="w-4 h-4 mr-1.5" />}
                  Ajouter le lien
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog aperçu ── */}
      <Dialog open={!!preview} onOpenChange={v => { if (!v) setPreview(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="truncate text-sm">{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview?.kind === 'pdf' ? (
            <iframe
              src={`${preview.url}#toolbar=1&navpanes=0`}
              className="w-full"
              style={{ height: '70vh' }}
              title={preview.title}
            />
          ) : preview?.kind === 'video' ? (
            <div className="p-4 bg-black flex justify-center">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={preview.url}
                controls
                controlsList="nodownload"
                className="max-h-[65vh] max-w-full rounded-lg"
                style={{ outline: 'none' }}
              />
            </div>
          ) : (
            <div className="p-4 flex justify-center bg-muted/30">
              <img
                src={preview?.url}
                alt={preview?.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>
          )}
          <div className="p-3 border-t border-border flex justify-end gap-2">
            <a href={preview?.url} target="_blank" rel="noopener noreferrer" download={preview?.title}>
              <Button size="sm" className="h-8 gap-1.5">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Composant Objectifs ───────────────────────────────────────────────────────
function ObjectivesTab({ collabId, currentUserId, isTeacher }: { collabId: string; currentUserId: string; isTeacher: boolean }) {
  const [objectives, setObjectives] = useState<DbCollaborationObjective[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [adding, setAdding]         = useState(false);

  const load = async () => {
    try { setObjectives(await getCollaborationObjectives(collabId)); }
    catch { /* offline */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, [collabId]);

  const handleAdd = async () => {
    if (!newTitle.trim()) { toast.error('Titre obligatoire.'); return; }
    setAdding(true);
    try {
      await addCollaborationObjective({ collaboration_id: collabId, title: newTitle.trim(), description: newDesc.trim() || undefined });
      setNewTitle(''); setNewDesc(''); setShowAdd(false);
      toast.success('Objectif ajouté.');
      await load();
    } catch { toast.error('Erreur.'); }
    setAdding(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleObjectiveCompleted(id, !current);
      setObjectives(o => o.map(x => x.id === id ? { ...x, is_completed: !current } : x));
    } catch { toast.error('Erreur.'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCollaborationObjective(id); setObjectives(o => o.filter(x => x.id !== id)); toast.success('Supprimé.'); }
    catch { toast.error('Erreur.'); }
  };

  const done = objectives.filter(o => o.is_completed).length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{done}/{objectives.length} complété{done !== 1 ? 's' : ''}</p>
        {isTeacher && (
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </Button>
        )}
      </div>

      {/* Barre de progression */}
      {objectives.length > 0 && (
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-success h-2 rounded-full transition-all duration-500"
            style={{ width: `${objectives.length > 0 ? (done / objectives.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {isTeacher ? 'Ajoutez des objectifs pour suivre la progression.' : 'Aucun objectif défini pour l\'instant.'}
        </div>
      ) : (
        <div className="space-y-2">
          {objectives.map(o => (
            <div key={o.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
              o.is_completed ? 'border-success/30 bg-success/5' : 'border-border bg-card'
            }`}>
              <button
                type="button"
                onClick={() => handleToggle(o.id, o.is_completed)}
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-success transition-colors"
                aria-label={o.is_completed ? 'Marquer comme non complété' : 'Marquer comme complété'}
              >
                {o.is_completed
                  ? <CheckCircle className="w-5 h-5 text-success" />
                  : <Circle className="w-5 h-5" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${o.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {o.title}
                </p>
                {o.description && <p className="text-xs text-muted-foreground mt-0.5">{o.description}</p>}
              </div>
              {isTeacher && (
                <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(o.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Nouvel objectif</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground">Titre *</Label>
              <Input placeholder="ex : Maîtriser les dérivées" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground">Description (optionnel)</Label>
              <Textarea placeholder="Détails, critères de réussite…" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setShowAdd(false)} disabled={adding}>Annuler</Button>
              <Button className="flex-1 h-10" onClick={handleAdd} disabled={adding}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Composant Notes partagées ─────────────────────────────────────────────────
function NotesTab({ collab, onSave }: { collab: DbCollaboration; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(collab.shared_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await updateCollaborationNotes(collab.id, notes); onSave(notes); toast.success('Notes enregistrées.'); }
    catch { toast.error('Erreur lors de l\'enregistrement.'); }
    setSaving(false);
  };

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground">Notes partagées — modifiables par le professeur et l'étudiant.</p>
      <Textarea
        placeholder="Notes de cours, résumés, exercices à faire…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={12}
        className="text-sm resize-none min-h-[200px]"
      />
      <Button className="h-9 gap-1.5" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer
      </Button>
    </div>
  );
}

// ── Page Espace de Collaboration ──────────────────────────────────────────────
export default function EspaceCollaborationPage() {
  const { id } = useParams<{ id: string }>();
  useApp(); // garde le contexte actif
  const navigate  = useNavigate();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [collab, setCollab]   = useState<DbCollaboration | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('chat');

  const isTeacher = currentUserId === collab?.teacher_id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!id || currentUserId === null) return;
    (async () => {
      setLoading(true);
      try {
        const c = await getCollaborationById(id);
        if (!c) { navigate(-1); return; }
        setCollab(c);

        const loggedIsTeacher = currentUserId === c.teacher_id;

        if (loggedIsTeacher) {
          // Le prof voit le profil de l'étudiant
          const studentProfile = await getProfile(c.student_id).catch(() => null);
          if (studentProfile) {
            setPartner({
              display_name: studentProfile.name || 'Étudiant',
              avatar_emoji: studentProfile.avatar_emoji || '👨‍🎓',
            });
          }
        } else {
          // L'étudiant voit le profil du professeur
          const tp = await getTeacherProfileByUserId(c.teacher_id).catch(() => null);
          if (tp) {
            setPartner({
              display_name: tp.display_name,
              avatar_emoji: tp.avatar_emoji,
              institution: tp.institution,
              contact_phone: tp.contact_phone,
              contact_email: tp.contact_email,
              contact_mode: tp.contact_mode,
            });
          }
        }
      } catch { /* offline */ }
      setLoading(false);
    })();
  }, [id, currentUserId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!collab) return null;

  const partnerName  = partner?.display_name || (isTeacher ? 'Étudiant' : 'Professeur');
  const partnerEmoji = partner?.avatar_emoji  || (isTeacher ? '👨‍🎓' : '👩‍🏫');

  return (
    <>
      <SEO title={`Collaboration — ${partnerName}`} description="Espace de travail partagé." />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* ── Header ─────────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 shrink-0 border-2 border-border">
                <AvatarFallback className="bg-primary/10 text-2xl">{partnerEmoji}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{partnerName}</p>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{collab.subject}</span>
                  <span className="px-2 py-0.5 bg-success/15 text-success border border-success/30 rounded-full text-xs font-medium">Actif</span>
                </div>
                {partner?.institution && (
                  <p className="text-xs text-muted-foreground truncate">{partner?.institution}</p>
                )}
              </div>
            </div>

            {/* Contacts si dispo */}
            {!isTeacher && partner && (partner.contact_phone || partner.contact_email) && (
              <div className="mt-3 flex flex-wrap gap-3 pt-3 border-t border-border">
                {partner.contact_phone && partner.contact_mode !== 'email' && (
                  <a href={`tel:${partner.contact_phone}`}
                    className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    📞 {partner.contact_phone}
                  </a>
                )}
                {partner.contact_email && partner.contact_mode !== 'phone' && (
                  <a href={`mailto:${partner.contact_email}`}
                    className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors">
                    ✉️ {partner.contact_email}
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Onglets ─────────────────────────────────────────────── */}
        <Card className="flex flex-col" style={{ minHeight: 500 }}>
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-4 pt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="chat" className="text-xs md:text-sm gap-1">
                  💬 <span className="sr-only md:not-sr-only">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs md:text-sm gap-1">
                  📝 <span className="sr-only md:not-sr-only">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-xs md:text-sm gap-1">
                  📎 <span className="sr-only md:not-sr-only">Ressources</span>
                </TabsTrigger>
                <TabsTrigger value="objectives" className="text-xs md:text-sm gap-1">
                  🎯 <span className="sr-only md:not-sr-only">Objectifs</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 min-h-0 mt-0">
              <ChatTab
                collabId={collab.id}
                currentUserId={currentUserId ?? ''}
                partnerName={partnerName}
                partnerEmoji={partnerEmoji}
              />
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              <NotesTab
                collab={collab}
                onSave={notes => setCollab(c => c ? { ...c, shared_notes: notes } : c)}
              />
            </TabsContent>
            <TabsContent value="resources" className="mt-0">
              <ResourcesTab collabId={collab.id} currentUserId={currentUserId ?? ''} />
            </TabsContent>
            <TabsContent value="objectives" className="mt-0">
              <ObjectivesTab collabId={collab.id} currentUserId={currentUserId ?? ''} isTeacher={isTeacher} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
