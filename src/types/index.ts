export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// Réexporte tous les types centraux depuis types.ts pour rétrocompatibilité
export type {
  AiHistoryItem,
  Badge,
  CalendarEvent,
  DailyChallenge,
  Flashcard,
  FlashcardDeck,
  Note,
  PomodoroSession,
  Quest,
  RevisionSession,
  SchoolLevel,
  Subject,
  Todo,
  UserProfile,
} from '@/types/types';
