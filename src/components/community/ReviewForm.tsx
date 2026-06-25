/**
 * ReviewForm — formulaire de dépôt d'avis noté (étoiles 1–5 + commentaire).
 * Visiteur : pseudo + badge. Connecté : nom pré-rempli.
 */

import { Send, Star } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UserBadge } from '@/hooks/useComments';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  connectedName?: string;
  onSubmit: (data: { pseudoOrName: string; badge: UserBadge; stars: number; text: string }) => void;
}

const MIN_LEN = 10;
const MAX_LEN = 500;

const ReviewForm: React.FC<ReviewFormProps> = ({ connectedName, onSubmit }) => {
  const isConnected = Boolean(connectedName);
  const [pseudo, setPseudo]   = useState('');
  const [badge, setBadge]     = useState<UserBadge>('Étudiant');
  const [stars, setStars]     = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name    = isConnected ? connectedName! : pseudo.trim();
    const trimmed = text.trim();

    if (!isConnected && !name) { setError('Veuillez saisir un pseudo.'); return; }
    if (stars === 0)           { setError('Veuillez sélectionner une note (1 à 5 étoiles).'); return; }
    if (trimmed.length < MIN_LEN) { setError(`Minimum ${MIN_LEN} caractères requis.`); return; }
    if (trimmed.length > MAX_LEN) { setError(`Maximum ${MAX_LEN} caractères autorisés.`); return; }

    setError('');
    onSubmit({ pseudoOrName: name, badge: isConnected ? 'Étudiant' : badge, stars, text: trimmed });
    setText('');
    setStars(0);
    if (!isConnected) setPseudo('');
  };

  const displayed = hovered || stars;
  const remaining = MAX_LEN - text.length;

  const STAR_LABELS = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Identité visiteur */}
      {!isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-pseudo" className="text-xs font-medium text-muted-foreground">
              Pseudo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rf-pseudo"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Votre pseudo…"
              maxLength={50}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-badge" className="text-xs font-medium text-muted-foreground">Je suis…</Label>
            <Select value={badge} onValueChange={v => setBadge(v as UserBadge)}>
              <SelectTrigger id="rf-badge" className="h-9 text-sm">
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

      {isConnected && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Avis publié en tant que{' '}
          <span className="font-semibold text-foreground">{connectedName}</span>
        </p>
      )}

      {/* Sélecteur d'étoiles */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Note <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button type="button"
              key={s}
              onClick={() => setStars(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  s <= displayed
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground/30',
                )}
              />
            </button>
          ))}
          {displayed > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">{STAR_LABELS[displayed]}</span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-1">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Partagez votre expérience avec Apprenix…"
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
        Publier mon avis
      </Button>
    </form>
  );
};

export default ReviewForm;
