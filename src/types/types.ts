// Types globaux pour Apprenix

export type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6e' | '5e' | '4e' | '3e'
  | '2nde' | '1ère' | 'Terminale'
  | 'BTS' | 'Licence' | 'Master' | 'Grandes Écoles'
  | 'ULIS' | 'SEGPA';

export type Subject =
  | 'Maths' | 'Physique' | 'Chimie' | 'SVT'
  | 'Histoire' | 'Géographie' | 'Français'
  | 'Anglais' | 'Espagnol' | 'Allemand'
  | 'Philosophie' | 'Économie/SES' | 'NSI/Informatique';

export interface Todo {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'cours' | 'examen' | 'devoir' | 'revision' | 'other';
  eventDate: string;
  startTime?: string;
  endTime?: string;
  subject?: string;
  notes?: string;
}

export interface AiHistoryItem {
  id: string;
  question: string;
  subject: string;
  level: string;
  answer: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  schoolLevel: SchoolLevel;
  favoriteSubjects: Subject[];
  xpPoints: number;
  streakDays: number;
  lastActiveDate?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  role?: 'student' | 'teacher' | 'parent' | 'admin';
}

export interface RevisionSession {
  id: string;
  subject: string;
  chapter: string;
  date: string;
  duration: number; // minutes
  completed: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

// ─── Flashcards (répétition espacée) ─────────────────────────────────────────

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string; // ISO date
  reviewCount: number;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: Subject;
  level: SchoolLevel;
  createdAt: string;
}

// ─── Notes (wiki personnel) ───────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: Subject;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Quêtes narratives ────────────────────────────────────────────────────────

export interface QuestMission {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  levelCategory: 'primaire' | 'college' | 'lycee' | 'superieur' | 'adapte';
  missions: QuestMission[];
  xpReward: number;
  badgeReward?: string;
}

// ─── Sessions Pomodoro ────────────────────────────────────────────────────────

export interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  workMinutes: number;
  sessionCount: number;
}


