import { MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// ─── Numéro WhatsApp (jamais en clair dans le DOM) ───────────────────────────
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '33667485226';

// ─── Options de sujet — adaptées élèves, parents, visiteurs ─────────────────
const SUBJECTS = [
  { value: 'question-cours',      label: '📚 Question sur un cours / exercice' },
  { value: 'aide-outil',          label: '🛠️ Aide pour utiliser un outil Apprenix' },
  { value: 'signaler-bug',        label: '🐛 Signaler un problème technique' },
  { value: 'suggestion',          label: '💡 Suggérer une amélioration' },
  { value: 'parent-info',         label: '👨‍👩‍👧 Parent — Question sur la plateforme' },
  { value: 'enseignant',          label: '🎓 Enseignant — Usage pédagogique' },
  { value: 'rgpd-donnees',        label: '🔒 Données personnelles / RGPD' },
  { value: 'autre',               label: '💬 Autre demande' },
];

// ─── Niveaux scolaires ────────────────────────────────────────────────────────
const LEVELS = [
  { value: 'primaire',   label: 'Primaire (CP → CM2)' },
  { value: 'college',    label: 'Collège (6ème → 3ème)' },
  { value: 'lycee',      label: 'Lycée (2nde → Terminale)' },
  { value: 'superieur',  label: 'Supérieur (Bac+1 → Bac+5)' },
  { value: 'enseignant', label: 'Enseignant / Professionnel' },
  { value: 'parent',     label: "Parent d'élève" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  prenom: string;
  niveau: string;
  sujet: string;
  message: string;
}

const INITIAL: FormState = { prenom: '', niveau: '', sujet: '', message: '' };

const WhatsAppContactModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.prenom.trim())  e.prenom  = 'Indique ton prénom.';
    if (!form.niveau)         e.niveau  = 'Choisis ton niveau scolaire.';
    if (!form.sujet)          e.sujet   = 'Sélectionne un sujet.';
    if (!form.message.trim()) e.message = 'Écris un message avant d\'envoyer.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Envoi → ouverture WhatsApp avec message pré-rempli ────────────────────
  const handleSend = () => {
    if (!validate()) return;

    const sujetLabel = SUBJECTS.find(s => s.value === form.sujet)?.label ?? form.sujet;
    const niveauLabel = LEVELS.find(l => l.value === form.niveau)?.label ?? form.niveau;

    const texte = [
      `Bonjour Apprenix ! 👋`,
      ``,
      `Je m'appelle *${form.prenom.trim()}*.`,
      `Niveau : ${niveauLabel}`,
      `Sujet : ${sujetLabel}`,
      ``,
      form.message.trim(),
    ].join('\n');

    // Méthode <a> native : contourne le blocage popup iOS Safari / Android WebView
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texte)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setForm(INITIAL);
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onOpenChange(false);
  };

  const field = (key: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/*
        ─── max-h + overflow-y-auto : le contenu scrolle sur mobile/tablette
        ─── p-0 : on gère le padding manuellement pour que le scroll soit propre
      */}
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── En-tête fixe (ne scroll pas) ──────────────────────────────── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm font-semibold leading-snug">
                Contacter Apprenix via WhatsApp
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5 leading-snug">
                Ton message sera pré-rempli et envoyé directement.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Corps scrollable ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">

          {/* Prénom */}
          <div className="space-y-1.5">
            <Label htmlFor="wa-prenom" className="text-sm font-medium block">
              Ton prénom <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="wa-prenom"
              autoComplete="given-name"
              placeholder="Ex : Léa, Mohammed, Lucas…"
              value={form.prenom}
              onChange={e => field('prenom', e.target.value)}
              className={`h-10 text-sm ${errors.prenom ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.prenom && (
              <p className="text-xs text-destructive">{errors.prenom}</p>
            )}
          </div>

          {/* Niveau scolaire */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium block">
              Niveau scolaire <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Select value={form.niveau} onValueChange={v => field('niveau', v)}>
              <SelectTrigger
                className={`h-10 text-sm w-full ${errors.niveau ? 'border-destructive' : ''}`}
              >
                <SelectValue placeholder="Sélectionne ton niveau…" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {LEVELS.map(l => (
                  <SelectItem key={l.value} value={l.value} className="text-sm">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.niveau && (
              <p className="text-xs text-destructive">{errors.niveau}</p>
            )}
          </div>

          {/* Sujet */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium block">
              Sujet <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Select value={form.sujet} onValueChange={v => field('sujet', v)}>
              <SelectTrigger
                className={`h-10 text-sm w-full ${errors.sujet ? 'border-destructive' : ''}`}
              >
                <SelectValue placeholder="De quoi s'agit-il ?" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {SUBJECTS.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-sm">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sujet && (
              <p className="text-xs text-destructive">{errors.sujet}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="wa-message" className="text-sm font-medium block">
              Message <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Textarea
              id="wa-message"
              placeholder="Décris ta question ou ta demande…"
              rows={3}
              value={form.message}
              onChange={e => field('message', e.target.value)}
              className={`text-sm resize-none px-3 py-2 ${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message}</p>
            )}
          </div>

          {/* Aperçu — uniquement quand tout est rempli */}
          {form.prenom && form.niveau && form.sujet && form.message && (
            <div className="rounded-lg bg-[#25D366]/8 border border-[#25D366]/25 p-3">
              <p className="text-xs font-semibold text-[#25D366] mb-2">
                Aperçu de ton message WhatsApp
              </p>
              <p className="text-xs text-foreground whitespace-pre-line leading-relaxed break-words">
                {`Bonjour Apprenix ! 👋\n\nJe m'appelle ${form.prenom.trim()}.\nNiveau : ${LEVELS.find(l => l.value === form.niveau)?.label}\nSujet : ${SUBJECTS.find(s => s.value === form.sujet)?.label}\n\n${form.message.trim()}`}
              </p>
            </div>
          )}
        </div>

        {/* ── Pied fixe avec les boutons ─────────────────────────────────── */}
        <div className="px-5 pb-5 pt-3 border-t border-border shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-10 text-sm"
          >
            <X className="w-4 h-4 mr-1.5 shrink-0" />
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            className="flex-1 h-10 text-sm bg-[#25D366] hover:bg-[#1ebe5d] text-white"
          >
            <Send className="w-4 h-4 mr-1.5 shrink-0" />
            Envoyer
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppContactModal;
