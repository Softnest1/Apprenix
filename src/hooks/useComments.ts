/**
 * useComments — système d'avis et commentaires réels (localStorage).
 * Partagé entre AccueilPage (avis notés) et CommunautePage (commentaires).
 */
import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserBadge = 'Étudiant' | 'Parent' | 'Visiteur';

export interface Review {
  id: string;
  pseudoOrName: string;
  badge: UserBadge;
  avatarEmoji: string;
  stars: number;          // 1–5
  text: string;
  date: string;           // ISO
  likes: number;
  likedByMe: boolean;
}

export interface Comment {
  id: string;
  pseudoOrName: string;
  badge: UserBadge;
  avatarEmoji: string;
  text: string;
  date: string;           // ISO
  likes: number;
  likedByMe: boolean;
}

// ─── Avatars par badge ────────────────────────────────────────────────────────

const AVATAR_POOL: Record<UserBadge, string[]> = {
  Étudiant: ['🎓', '📚', '✏️', '🧑‍🎓', '👩‍🎓', '📖', '🔬', '🎒'],
  Parent:   ['👨‍👩‍👦', '👪', '👩‍👦', '👨‍👧', '🏠', '💛', '🤗', '👋'],
  Visiteur: ['🌟', '😊', '👀', '🙋', '💬', '🧑', '👤', '🙂'],
};

export const pickAvatar = (badge: UserBadge): string => {
  const pool = AVATAR_POOL[badge];
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Aucun avis ni commentaire inventé : la liste est vide au premier lancement.
// Chaque entrée provient d'un vrai utilisateur via le formulaire.

export function useComments() {
  const [reviews, setReviews] = useLocalStorage<Review[]>('ep_reviews', []);
  const [comments, setComments] = useLocalStorage<Comment[]>('ep_comments', []);

  // ── Avis (page Accueil) ──────────────────────────────────────────────────────
  const addReview = useCallback((data: Omit<Review, 'id' | 'date' | 'likes' | 'likedByMe' | 'avatarEmoji'>) => {
    const review: Review = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      avatarEmoji: pickAvatar(data.badge),
      likes: 0,
      likedByMe: false,
    };
    setReviews(prev => [review, ...prev]);
  }, [setReviews]);

  const likeReview = useCallback((id: string) => {
    setReviews(prev => prev.map(r =>
      r.id === id
        ? { ...r, likes: r.likedByMe ? r.likes - 1 : r.likes + 1, likedByMe: !r.likedByMe }
        : r
    ));
  }, [setReviews]);

  // ── Commentaires (page Communauté) ───────────────────────────────────────────
  const addComment = useCallback((data: Omit<Comment, 'id' | 'date' | 'likes' | 'likedByMe' | 'avatarEmoji'>) => {
    const comment: Comment = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      avatarEmoji: pickAvatar(data.badge),
      likes: 0,
      likedByMe: false,
    };
    setComments(prev => [comment, ...prev]);
  }, [setComments]);

  const likeComment = useCallback((id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, likes: c.likedByMe ? c.likes - 1 : c.likes + 1, likedByMe: !c.likedByMe }
        : c
    ));
  }, [setComments]);

  return { reviews, addReview, likeReview, comments, addComment, likeComment };
}
