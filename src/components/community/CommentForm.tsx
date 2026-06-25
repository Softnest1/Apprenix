/**
 * CommentForm — formulaire de dépôt de commentaire (visiteur + connecté).
 * Validation : 10–500 caractères, pseudo obligatoire si visiteur.
 */

import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UserBadge } from '@/hooks/useComments';

interface CommentFormProps {
  /** Nom pré-rempli si connecté (undefined = visiteur) */
  connectedName?: string;
  onSubmit: (data: { pseudoOrName: string; badge: UserBadge; text: string }) => void;
  placeholder?: string;
  submitLabel?: string;
}

const MIN_LEN = 10;
const MAX_LEN = 500;

const CommentForm: React.FC<CommentFormProps> = ({
  connectedName,
  onSubmit,
  placeholder = 'Partagez votre expérience avec la communauté…',
  submitLabel = 'Publier le commentaire',
}) => {
  const isConnected = Boolean(connectedName);
  const [pseudo, setPseudo] = useState('');
  const [badge, setBadge] = useState<UserBadge>('Étudiant');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = isConnected ? connectedName! : pseudo.trim();
    const trimmed = text.trim();

    if (!isConnected && !name) { setError('Veuillez saisir un pseudo.'); return; }
    if (trimmed.length < MIN_LEN) { setError(`Minimum ${MIN_LEN} caractères requis.`); return; }
    if (trimmed.length > MAX_LEN) { setError(`Maximum ${MAX_LEN} caractères autorisés.`); return; }

    setError('');
    onSubmit({ pseudoOrName: name, badge: isConnected ? 'Étudiant' : badge, text: trimmed });
    setText('');
    if (!isConnected) setPseudo('');
  };

  const remaining = MAX_LEN - text.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Champs visiteur */}
      {!isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cf-pseudo" className="text-xs font-medium text-muted-foreground">
              Pseudo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cf-pseudo"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Votre pseudo…"
              maxLength={50}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cf-badge" className="text-xs font-medium text-muted-foreground">
              Je suis…
            </Label>
            <Select value={badge} onValueChange={v => setBadge(v as UserBadge)}>
              <SelectTrigger id="cf-badge" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Étudiant">🎓 Étudiant(e)</SelectItem>
                <SelectItem value="Parent">👨‍👩‍👦 Parent</SelectItem>
                <SelectItem value="Visiteur">🌟 Visiteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Nom connecté (lecture seule) */}
      {isConnected && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Commentaire publié en tant que{' '}
          <span className="font-semibold text-foreground">{connectedName}</span>
        </p>
      )}

      {/* Textarea */}
      <div className="flex flex-col gap-1">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          maxLength={MAX_LEN}
          rows={3}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          {error
            ? <p className="text-xs text-destructive">{error}</p>
            : <span />
          }
          <span className={`text-xs ${remaining < 50 ? 'text-warning' : 'text-muted-foreground'}`}>
            {remaining} car. restants
          </span>
        </div>
      </div>

      <Button type="submit" size="sm" className="self-end h-9 text-sm">
        <Send className="w-3.5 h-3.5 mr-1.5" />
        {submitLabel}
      </Button>
    </form>
  );
};

export default CommentForm;
