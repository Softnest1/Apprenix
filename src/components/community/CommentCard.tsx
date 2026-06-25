/**
 * CommentCard — card d'un commentaire ou d'un avis réel de la communauté.
 * Affiche : avatar emoji, pseudo, badge profil, [étoiles si avis], texte, date, likes.
 */

import { Heart, Star } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Comment, Review, UserBadge } from '@/hooks/useComments';
import { cn } from '@/lib/utils';

const BADGE_COLORS: Record<UserBadge, string> = {
  Étudiant: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  Parent:   'bg-chart-3/15 text-chart-3 border-chart-3/30',
  Visiteur: 'bg-muted text-muted-foreground border-border' };

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Hier';
  if (days < 30)  return `Il y a ${days} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

interface CommentCardProps {
  item: Comment | Review;
  onLike: (id: string) => void;
  variant?: 'comment' | 'review';
  className?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({ item, onLike, variant = 'comment', className }) => {
  const isReview = variant === 'review';
  const stars = isReview ? (item as Review).stars : undefined;

  return (
    <Card className={cn('h-full border-border/60 hover:border-border transition-colors', className)}>
      <CardContent className="p-4 flex flex-col gap-3">
        {/* En-tête */}
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-base shrink-0 select-none">
            {item.avatarEmoji}
          </div>
          {/* Infos auteur */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                {item.pseudoOrName}
              </span>
              <Badge
                variant="outline"
                className={cn('text-xs font-medium px-1.5 py-0 h-4 shrink-0', BADGE_COLORS[item.badge])}
              >
                {item.badge}
              </Badge>
            </div>
            {/* Étoiles pour les avis */}
            {isReview && stars !== undefined && (
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={cn('w-3 h-3', s <= stars ? 'fill-warning text-warning' : 'text-muted-foreground/30')}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Date */}
          <span className="text-sm text-muted-foreground shrink-0 mt-0.5">
            {formatRelativeDate(item.date)}
          </span>
        </div>

        {/* Texte */}
        <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">
          {item.text}
        </p>

        {/* Pied : likes */}
        <div className="flex items-center justify-end">
          <button type="button"
            onClick={() => onLike(item.id)}
            className={cn(
              'flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-[background-color,color,transform,box-shadow] duration-150 select-none',
              item.likedByMe
                ? 'text-primary bg-primary/10 hover:bg-primary/15'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            aria-label={item.likedByMe ? 'Retirer le like' : 'Aimer ce commentaire'}
          >
            <Heart className={cn('w-3.5 h-3.5 transition-[transform,fill]', item.likedByMe ? 'fill-primary' : '')} />
            <span className="font-medium">{item.likes}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentCard;
