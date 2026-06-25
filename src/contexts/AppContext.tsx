import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/db/supabase';
import {
  createCalendarEvent, createFlashcard, createFlashcardDeck,
  createNote, createTodo,
  deleteCalendarEvent, deleteFlashcard as apiDeleteFlashcard,
  deleteFlashcardDeck, deleteNote as apiDeleteNote,
  deleteTodo as apiDeleteTodo,
  getAiHistory, getCalendarEvents, getFlashcardDecks,
  getFlashcards, getNotes, getTodos,
  saveAiHistory, updateCalendarEvent,
  updateFlashcard, updateNote as apiUpdateNote, updateTodo,
} from '@/lib/api';
import type {
  DbAiHistory as DbAiRow, DbCalendarEvent as DbEventRow,
  DbFlashcard as DbFlashcardRow, DbFlashcardDeck as DbDeckRow,
  DbNote as DbNoteRow, DbTodo as DbTodoRow,
} from '@/db/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type {AiHistoryItem,Badge,CalendarEvent, DailyChallenge, 
  Flashcard, FlashcardDeck, 
  Note, PomodoroSession,Quest, RevisionSession, 
  SchoolLevel, Subject, Todo, 
  UserProfile } from '@/types/types';

// ─── Données initiales ────────────────────────────────────────────────────────

const INITIAL_PROFILE: UserProfile = {
  id: 'local',
  name: 'Étudiant',
  schoolLevel: '2nde',
  favoriteSubjects: ['Maths', 'Français'],
  xpPoints: 0,
  streakDays: 0,
  lastActiveDate: '' };

const INITIAL_BADGES: Badge[] = [
  { id: 'first_question', name: 'Première question', description: "Poser votre première question à l'assistant", icon: '🤔', unlocked: false },
  { id: 'streak_3', name: 'Série de 3 jours', description: 'Travailler 3 jours consécutifs', icon: '🔥', unlocked: false },
  { id: 'streak_7', name: 'Série de 7 jours', description: 'Travailler 7 jours consécutifs', icon: '⚡', unlocked: false },
  { id: 'todo_master', name: 'Maître des tâches', description: 'Compléter 10 tâches', icon: '✅', unlocked: false },
  { id: 'scanner_pro', name: 'Pro du scanner', description: 'Scanner 5 devoirs', icon: '📷', unlocked: false },
  { id: 'linguist', name: 'Linguiste', description: 'Utiliser les outils linguistiques 10 fois', icon: '📚', unlocked: false },
  { id: 'mathmagician', name: 'Mathmagicien', description: 'Effectuer 20 calculs', icon: '🔢', unlocked: false },
  { id: 'pomodoro_5', name: 'Focus', description: 'Compléter 5 sessions Pomodoro', icon: '🍅', unlocked: false },
  { id: 'xp_500', name: 'Niveau 5', description: 'Atteindre 500 XP', icon: '🏆', unlocked: false },
  { id: 'xp_1000', name: 'Niveau 10', description: 'Atteindre 1000 XP', icon: '🥇', unlocked: false },
];

const INITIAL_CHALLENGES: DailyChallenge[] = [
  { id: 'daily_1', title: "Utiliser l'assistant Apprenix", description: "Posez une question à l'assistant pour résoudre un problème aujourd'hui", xpReward: 20, completed: false, type: 'daily' },
  { id: 'daily_2', title: 'Compléter une tâche', description: 'Marquez au moins une tâche comme terminée', xpReward: 15, completed: false, type: 'daily' },
  { id: 'daily_3', title: 'Session Pomodoro', description: 'Effectuez une session de travail Pomodoro complète', xpReward: 25, completed: false, type: 'daily' },
  { id: 'weekly_1', title: 'Révision hebdomadaire', description: 'Consultez les ressources pédagogiques 3 fois cette semaine', xpReward: 50, completed: false, type: 'weekly' },
  { id: 'weekly_2', title: 'Maître des outils', description: 'Utiliser 4 outils différents cette semaine', xpReward: 60, completed: false, type: 'weekly' },
];

const INITIAL_TODOS: Todo[] = [
  { id: '1', title: 'Réviser le chapitre 3 de Maths', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], completed: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Rendre la dissertation de Français', priority: 'high', dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], completed: false, createdAt: new Date().toISOString() },
  { id: '3', title: 'Préparer l\'exposé d\'Histoire', priority: 'medium', dueDate: new Date(Date.now() + 432000000).toISOString().split('T')[0], completed: false, createdAt: new Date().toISOString() },
];

// ─── Données initiales quêtes ─────────────────────────────────────────────────

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_college', title: 'Survie au Collège', description: 'Maîtrise les bases pour réussir au collège',
    levelCategory: 'college', xpReward: 200,
    missions: [
      { id: 'm1', title: "Poser ta première question à l'assistant", completed: false },
      { id: 'm2', title: 'Créer un événement dans l\'agenda', completed: false },
      { id: 'm3', title: 'Compléter 3 tâches', completed: false },
      { id: 'm4', title: 'Consulter une fiche de révision', completed: false },
      { id: 'm5', title: 'Faire une session Pomodoro', completed: false },
    ] },
  {
    id: 'q_lycee', title: 'Décroche le Bac', description: '10 missions pour être au top le jour J',
    levelCategory: 'lycee', xpReward: 500,
    missions: [
      { id: 'm1', title: 'Créer un deck de flashcards', completed: false },
      { id: 'm2', title: 'Réviser 10 flashcards', completed: false },
      { id: 'm3', title: 'Utiliser l\'outil Transformer sur un cours', completed: false },
      { id: 'm4', title: 'Planifier 3 sessions de révision', completed: false },
      { id: 'm5', title: 'Compléter 5 tâches', completed: false },
      { id: 'm6', title: 'Consulter les annales de ta matière', completed: false },
      { id: 'm7', title: 'Créer une note de cours', completed: false },
      { id: 'm8', title: 'Faire 3 sessions Pomodoro', completed: false },
      { id: 'm9', title: 'Essayer le mode Socratique', completed: false },
      { id: 'm10', title: 'Atteindre 300 XP', completed: false },
    ] },
  {
    id: 'q_superieur', title: 'Cap sur les Grandes Écoles', description: 'Optimise ta méthode pour le supérieur',
    levelCategory: 'superieur', xpReward: 600,
    missions: [
      { id: 'm1', title: 'Créer 2 decks de flashcards', completed: false },
      { id: 'm2', title: 'Rédiger 5 notes de cours', completed: false },
      { id: 'm3', title: 'Compléter une semaine de Pomodoro', completed: false },
      { id: 'm4', title: 'Utiliser l\'outil Transformer 3 fois', completed: false },
      { id: 'm5', title: 'Atteindre 500 XP', completed: false },
    ] },
  {
    id: 'q_primaire', title: 'Aventurier du Savoir', description: 'Explore et apprends en t\'amusant',
    levelCategory: 'primaire', xpReward: 150,
    missions: [
      { id: 'm1', title: "Poser une question à l'assistant", completed: false },
      { id: 'm2', title: 'Créer ta première tâche', completed: false },
      { id: 'm3', title: 'Consulter une fiche de révision', completed: false },
    ] },
  {
    id: 'q_adapte', title: 'À mon rythme 💚', description: 'Petits pas, grandes victoires — avance à ton rythme',
    levelCategory: 'adapte', xpReward: 100,
    missions: [
      { id: 'm1', title: "Poser une question à l'assistant", completed: false },
      { id: 'm2', title: 'Créer ta première flashcard', completed: false },
      { id: 'm3', title: 'Cocher 1 tâche de l\'agenda', completed: false },
    ] },
];

// ─── Comptes (auth Supabase) ──────────────────────────────────────────────────

export interface AppAccount {
  email: string;
  name: string;
  passwordHash: string;          // conservé pour compatibilité anciens comptes localStorage
  salt?: string;
  schoolLevel: SchoolLevel;
  securityQuestion: string;
  securityAnswer: string;
  role?: 'student' | 'teacher' | 'parent';  // rôle du compte — défaut implicite : student
  verified?: boolean;            // compte vérifié via document scolaire (étape 3)
  verifiedMethod?: 'agenda' | 'carte' | 'autre' | 'carte_pro' | 'carte_identite'; // type de document utilisé
  verifiedDescription?: string;  // texte libre si option "autre"
}


export const normalizeAnswer = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Contexte ─────────────────────────────────────────────────────────────────

interface AppContextType {
  // Thème
  isDark: boolean;
  toggleTheme: () => void;

  // Authentification
  isAuthenticated: boolean;
  authReady: boolean;       // true dès que getSession() a répondu (évite les redirections prématurées)
  profileReady: boolean;    // true dès que le profil DB est chargé (évite redirect sur niveau par défaut)
  login: (name: string, schoolLevel: SchoolLevel) => void;
  logout: () => void;

  // Gestion des comptes
  accounts: AppAccount[];
  registerAccount: (account: AppAccount) => Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }>;
  findAccountByEmail: (email: string) => Promise<AppAccount | undefined>;
  loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; error?: string; name?: string; schoolLevel?: SchoolLevel; role?: 'student' | 'teacher' | 'parent' | 'admin' }>;
  updateAccountPassword: (email: string, newPassword: string) => Promise<void>;

  // Profil / niveau scolaire
  profile: UserProfile;
  user: UserProfile;  // alias de profile pour compatibilité
  setProfile: (p: UserProfile | ((prev: UserProfile) => UserProfile)) => void;

  // Niveau scolaire (raccourci)
  level: SchoolLevel;
  setLevel: (l: SchoolLevel) => void;

  // Todos
  todos: Todo[];
  setTodos: (t: Todo[] | ((prev: Todo[]) => Todo[])) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Calendrier
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // Historique IA
  aiHistory: AiHistoryItem[];
  addAiHistory: (item: Omit<AiHistoryItem, 'id' | 'createdAt'>) => void;

  // Sessions de révision
  revisionSessions: RevisionSession[];
  setRevisionSessions: (s: RevisionSession[] | ((prev: RevisionSession[]) => RevisionSession[])) => void;

  // Badges
  badges: Badge[];
  setBadges: (b: Badge[] | ((prev: Badge[]) => Badge[])) => void;
  unlockBadge: (id: string) => void;

  // Défis
  challenges: DailyChallenge[];
  setChallenges: (c: DailyChallenge[] | ((prev: DailyChallenge[]) => DailyChallenge[])) => void;
  completeChallenge: (id: string) => void;

  // XP
  addXp: (amount: number) => void;

  // Activité récente
  recentActivity: string[];
  addActivity: (activity: string) => void;

  // Flashcards
  decks: FlashcardDeck[];
  setDecks: (d: FlashcardDeck[] | ((prev: FlashcardDeck[]) => FlashcardDeck[])) => void;
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => string;
  deleteDeck: (id: string) => void;
  flashcards: Flashcard[];
  setFlashcards: (f: Flashcard[] | ((prev: Flashcard[]) => Flashcard[])) => void;
  addFlashcard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'nextReview'>) => void;
  /** Importe N cartes en un seul setState pour éviter N re-renders (import de pack). */
  importPackCards: (cards: Array<Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'nextReview'>>) => void;
  deleteFlashcard: (id: string) => void;
  reviewFlashcard: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;

  // Notes
  notes: Note[];
  setNotes: (n: Note[] | ((prev: Note[]) => Note[])) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;

  // Quêtes
  quests: Quest[];
  setQuests: (q: Quest[] | ((prev: Quest[]) => Quest[])) => void;
  completeQuestMission: (questId: string, missionId: string) => void;

  // Sessions Pomodoro
  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => void;
}

// ── Stable context reference across Vite HMR cycles ─────────────────────────
// During hot-reload, this module is re-evaluated and createContext() would
// produce a NEW object. Components that already called useContext(oldRef)
// would then receive `null` and throw "useApp doit être utilisé dans AppProvider".
// Persisting the reference in import.meta.hot.data keeps the same object
// across re-evaluations, so providers and consumers always share the same ref.
declare const __VITE_HMR__: unknown; // prevents TS complaints on import.meta.hot
let AppContext: React.Context<AppContextType | null>;
if (import.meta.hot && import.meta.hot.data.AppContext) {
  AppContext = import.meta.hot.data.AppContext as React.Context<AppContextType | null>;
} else {
  AppContext = createContext<AppContextType | null>(null);
  if (import.meta.hot) import.meta.hot.data.AppContext = AppContext;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider');
  return ctx;
};

// ─── Helpers répétition espacée ───────────────────────────────────────────────
const nextReviewDate = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  const days = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 3 : 1;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useLocalStorage('ep_dark_mode', false);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('ep_auth', false);
  // authReady : passe à true une fois que Supabase a confirmé (ou infirmé) la session
  const [authReady, setAuthReady] = useState(false);
  // profileReady : passe à true une fois que le profil DB est chargé (schoolLevel fiable)
  const [profileReady, setProfileReady] = useState(false);
  const [profile, setProfile] = useLocalStorage<UserProfile>('ep_profile', INITIAL_PROFILE);
  const [accounts, setAccounts] = useLocalStorage<AppAccount[]>('ep_accounts', []);
  const [todos, setTodos] = useLocalStorage<Todo[]>('ep_todos', INITIAL_TODOS);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('ep_events', []);
  const [aiHistory, setAiHistory] = useLocalStorage<AiHistoryItem[]>('ep_ai_history', []);
  const [revisionSessions, setRevisionSessions] = useLocalStorage<RevisionSession[]>('ep_revision', []);
  const [badges, setBadges] = useLocalStorage<Badge[]>('ep_badges', INITIAL_BADGES);
  const [challenges, setChallenges] = useLocalStorage<DailyChallenge[]>('ep_challenges', INITIAL_CHALLENGES);
  const [lastChallengeReset, setLastChallengeReset] = useLocalStorage<string>('ep_challenge_reset', '');
  const [dataVersion, setDataVersion] = useLocalStorage<string>('ep_data_version', '1');
  const [recentActivity, setRecentActivity] = useLocalStorage<string[]>('ep_activity', [
    'Vous avez consulté les Ressources pédagogiques',
    'Vous avez posé une question à l\'assistant',
    'Vous avez complété une tâche',
  ]);
  const [decks, setDecks] = useLocalStorage<FlashcardDeck[]>('ep_decks', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('ep_flashcards', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('ep_notes', []);
  const [quests, setQuests] = useLocalStorage<Quest[]>('ep_quests', INITIAL_QUESTS);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage<PomodoroSession[]>('ep_pomodoro', []);

  // ── ID Supabase de l'utilisateur connecté (null = déconnecté) ─────────────
  // Utilisé pour toutes les écritures Supabase. Non persisté dans localStorage
  // car il est récupéré à chaque restauration de session.
  const [userId, setUserId] = useState<string | null>(null);
  // Ref stable pour éviter que loadUserData soit recréée à chaque changement
  const userIdRef = useRef<string | null>(null);

  // ── Convertisseurs DB → état local ────────────────────────────────────────
  const dbToTodo = (r: DbTodoRow): Todo => ({
    id: r.id as string, title: r.title as string, completed: r.completed as boolean,
    priority: (r.priority as Todo['priority']) ?? 'medium', dueDate: (r.due_date as string) ?? undefined,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  });
  const dbToEvent = (r: DbEventRow): CalendarEvent => ({
    id: r.id as string, title: r.title as string,
    eventType: ((r.event_type ?? 'other') as CalendarEvent['eventType']),
    eventDate: r.event_date as string,
    startTime: (r.start_time as string) ?? undefined, endTime: (r.end_time as string) ?? undefined,
    subject: (r.subject as string) ?? undefined, notes: (r.notes as string) ?? undefined,
  });
  const dbToAi = (r: DbAiRow): AiHistoryItem => ({
    id: r.id as string, question: r.question as string, answer: r.answer as string,
    subject: (r.subject as string) ?? '', level: (r.level as string) ?? '',
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  });
  const dbToDeck = (r: DbDeckRow): FlashcardDeck => ({
    id: r.id as string, name: ((r.name ?? r.title) as string) ?? '',
    subject: ((r.subject ?? '') as Subject),
    level: '2nde' as SchoolLevel,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  });
  const dbToFlashcard = (r: DbFlashcardRow): Flashcard => ({
    id: r.id as string, deckId: (r.deck_id as string) ?? '',
    question: ((r.question ?? r.front) as string) ?? '',
    answer: ((r.answer ?? r.back) as string) ?? '',
    difficulty: ((r.difficulty ?? 'medium') as 'easy' | 'medium' | 'hard'),
    nextReview: (r.next_review as string) ?? new Date().toISOString().split('T')[0],
    reviewCount: (r.review_count as number) ?? 0,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  });
  const dbToNote = (r: DbNoteRow): Note => ({
    id: r.id as string, title: r.title as string, content: (r.content as string) ?? '',
    subject: ((r.subject ?? '') as Subject), tags: (r.tags as string[]) ?? [],
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  });

  // ── Chargement des données Supabase après connexion ───────────────────────
  // Appelée une fois à chaque connexion (loginWithCredentials + restauration de session).
  // Remplace les données localStorage par les données Supabase si disponibles,
  // garantissant la cohérence multi-appareils.
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const [rawTodos, rawEvents, rawAi, rawDecks, rawCards, rawNotes] = await Promise.all([
        getTodos(uid, 100),
        getCalendarEvents(uid, 200),
        getAiHistory(uid, undefined, 20),
        getFlashcardDecks(uid),
        getFlashcards(uid),
        getNotes(uid, 200),
      ]);

      // Ne remplacer les données locales que si Supabase retourne des résultats,
      // afin de préserver le travail fait hors-ligne (sinon on laisserait localStorage intact).
      if (rawTodos.length > 0)  setTodos(rawTodos.map(dbToTodo));
      if (rawEvents.length > 0) setEvents(rawEvents.map(dbToEvent));
      if (rawAi.length > 0)     setAiHistory(rawAi.map(dbToAi));
      if (rawDecks.length > 0)  setDecks(rawDecks.map(dbToDeck));
      if (rawCards.length > 0)  setFlashcards(rawCards.map(dbToFlashcard));
      if (rawNotes.length > 0)  setNotes(rawNotes.map(dbToNote));
    } catch {
      // Hors-ligne ou quota Supabase → on conserve les données localStorage
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Thème ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute('content', isDark ? 'hsl(220, 25%, 9%)' : 'hsl(220, 20%, 98%)');
  }, [isDark]);

  // ── Synchronisation session Supabase au démarrage ───────────────────────────
  useEffect(() => {
    // Restaurer la session Supabase persistée
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        userIdRef.current = session.user.id;
        // Mettre à jour le profil local avec les données Supabase si disponibles
        supabase.from('profiles')
          .select('name, school_level, avatar_url, security_question, security_answer, xp_points, streak_days, last_active_date, favorite_subjects')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              const metaRole = session.user.user_metadata?.role as 'student' | 'teacher' | undefined;
              setProfile(p => ({
                ...p,
                ...(data.name && data.name !== 'Étudiant' ? { name: data.name } : {}),
                schoolLevel: (data.school_level as SchoolLevel) || p.schoolLevel,
                role: metaRole ?? p.role,
                ...(data.avatar_url ? { avatarUrl: data.avatar_url } : {}),
                ...(data.security_question ? { securityQuestion: data.security_question, securityAnswer: data.security_answer ?? p.securityAnswer } : {}),
                // Restaurer XP et série depuis Supabase (source de vérité multi-appareils)
                ...(typeof data.xp_points === 'number' && data.xp_points > 0 ? { xpPoints: data.xp_points } : {}),
                ...(typeof data.streak_days === 'number' && data.streak_days > 0 ? { streakDays: data.streak_days } : {}),
                ...(data.last_active_date ? { lastActiveDate: data.last_active_date } : {}),
                ...(Array.isArray(data.favorite_subjects) && data.favorite_subjects.length > 0
                  ? { favoriteSubjects: data.favorite_subjects as UserProfile['favoriteSubjects'] }
                  : {}),
              }));
            }
            // Profil chargé (ou absent) — le niveau est maintenant fiable
            setProfileReady(true);
          });
        // Charger toutes les données utilisateur depuis Supabase
        loadUserData(session.user.id);
      } else {
        // Pas de session — le profil par défaut est fiable (visiteur)
        setProfileReady(true);
      }
      // Auth initialisée — les gardes de route peuvent maintenant agir
      setAuthReady(true);
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        userIdRef.current = session.user.id;
        // Synchroniser le rôle depuis les metadata Supabase si disponible
        const metaRole = session.user.user_metadata?.role as 'student' | 'teacher' | 'parent' | 'admin' | undefined;
        if (metaRole) {
          setProfile(p => ({ ...p, role: metaRole }));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserId(null);
        userIdRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = useCallback(() => setIsDark(d => !d), [setIsDark]);

  // ── Migration des données (v1/v2 → v3) : badges uniquement, jamais de reset XP ─
  useEffect(() => {
    if (dataVersion !== '3') {
      // Ne jamais toucher à xpPoints ni streakDays ici — risque de perte de données
      setBadges(INITIAL_BADGES);
      setDataVersion('3');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Série quotidienne 100% automatique ────────────────────────────────────
  // À chaque ouverture de l'app : détecte automatiquement si c'est un nouveau
  // jour consécutif, un gap (série brisée) ou déjà compté aujourd'hui.
  useEffect(() => {
    if (!isAuthenticated) return;
    const today     = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setProfile(p => {
      if (p.lastActiveDate === today) return p;           // déjà compté auj.
      if (p.lastActiveDate === yesterday)                 // jour consécutif
        return { ...p, streakDays: p.streakDays + 1, lastActiveDate: today };
      // premier jour ou série interrompue → (re)démarrer à 1
      return { ...p, streakDays: 1, lastActiveDate: today };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Réinitialisation automatique des défis journaliers chaque nouveau jour ─
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastChallengeReset !== today) {
      setChallenges(c => c.map(ch =>
        ch.type === 'daily' ? { ...ch, completed: false } : ch
      ));
      setLastChallengeReset(today);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = profile.schoolLevel;
  const setLevel = useCallback((l: SchoolLevel) => setProfile(p => ({ ...p, schoolLevel: l })), [setProfile]);

  const login = useCallback((name: string, schoolLevel: SchoolLevel) => {
    setProfile(p => ({ ...p, name, schoolLevel }));
    setIsAuthenticated(true);
  }, [setProfile, setIsAuthenticated]);

  const logout = useCallback(async () => {
    // Étape A : purger l'état React IMMÉDIATEMENT (synchrone)
    // → l'interface bascule sur "non connecté" avant même la réponse Supabase
    setIsAuthenticated(false);
    setUserId(null);
    userIdRef.current = null;

    // Étape B : réinitialiser toutes les données utilisateur en mémoire
    // afin qu'un deuxième compte sur le même appareil ne voie pas les données du premier
    setTodos(INITIAL_TODOS);
    setEvents([]);
    setAiHistory([]);
    setDecks([]);
    setFlashcards([]);
    setNotes([]);
    setBadges(INITIAL_BADGES);
    setChallenges(INITIAL_CHALLENGES);
    setQuests(INITIAL_QUESTS);
    setPomodoroSessions([]);
    setRevisionSessions([]);
    setRecentActivity([]);
    setProfile(INITIAL_PROFILE);

    // Étape C : vider les clés localStorage utilisateur
    const keysToClean = [
      'ep_todos', 'ep_events', 'ep_ai_history', 'ep_decks', 'ep_flashcards',
      'ep_notes', 'ep_badges', 'ep_quests', 'ep_pomodoro', 'ep_revision',
      'ep_activity', 'ep_challenges', 'ep_challenge_reset', 'ep_profile',
    ];
    try { keysToClean.forEach(k => localStorage.removeItem(k)); } catch { /* silencieux */ }

    // Étape D : vider sessionStorage
    try { sessionStorage.clear(); } catch { /* silencieux */ }

    // Étape E : révoquer la session côté Supabase (async, hors fil critique UI)
    await supabase.auth.signOut();
  }, [setIsAuthenticated, setTodos, setEvents, setAiHistory, setDecks, setFlashcards,
      setNotes, setBadges, setChallenges, setQuests, setPomodoroSessions,
      setRevisionSessions, setRecentActivity, setProfile]);

  // ── Inscription via Supabase Auth ─────────────────────────────────────────
  const registerAccount = useCallback(async (account: AppAccount): Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email: account.email.trim().toLowerCase(),
      password: account.passwordHash,
      options: {
        data: {
          name: account.name.trim(),
          school_level: account.schoolLevel,
          security_question: account.securityQuestion || '',
          security_answer: account.securityAnswer ? normalizeAnswer(account.securityAnswer) : '',
          role: account.role ?? 'student',
          verified: account.verified ?? false,
          verified_method: account.verifiedMethod ?? '',
          verified_description: account.verifiedDescription ?? '',
        } } });

    if (error) {
      const msg = error.message ?? '';
      const code = (error as { code?: string })?.code ?? '';
      if (
        msg.includes('already registered') ||
        msg.includes('User already registered') ||
        msg.includes('already been registered') ||
        code === 'user_already_exists'
      ) {
        return { ok: false, error: 'Un compte avec cet email existe déjà. Connectez-vous ou utilisez « Mot de passe oublié ».' };
      }
      if (msg.includes('Password should be') || msg.includes('weak_password') || code === 'weak_password') {
        return { ok: false, error: 'Mot de passe trop faible. Utilisez au moins 6 caractères.' };
      }
      if (msg.includes('rate limit') || msg.includes('too many') || code === 'over_request_rate_limit') {
        return { ok: false, error: 'Trop de tentatives. Attendez quelques minutes avant de réessayer.' };
      }
      return { ok: false, error: 'Erreur lors de la création du compte. Vérifiez votre email.' };
    }

    if (!data.user) return { ok: false, error: 'Erreur lors de la création du compte.' };

    // ⚠️ Supabase retourne un "succès" silencieux quand l'email existe déjà
    // et que la confirmation email est désactivée — identities sera [] dans ce cas.
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, error: 'Un compte avec cet email existe déjà. Connectez-vous ou utilisez « Mot de passe oublié ».' };
    }

    // Le trigger on_auth_user_created crée automatiquement le profil
    // avec les données de raw_user_meta_data (name, school_level).
    // On ne fait PAS de .update() ici car après signUp il n'y a souvent
    // pas de session active (email confirmation requis) → RLS bloque l'update.

    // Sauvegarde locale pour compatibilité / fallback
    const newLocalAccount: AppAccount = {
      email: account.email.trim().toLowerCase(),
      name: account.name.trim(),
      passwordHash: account.passwordHash,
      schoolLevel: account.schoolLevel,
      securityQuestion: account.securityQuestion || '',
      securityAnswer: account.securityAnswer ? normalizeAnswer(account.securityAnswer) : '',
      role: account.role ?? 'student',
      verified: account.verified ?? false,
      verifiedMethod: account.verifiedMethod,
      verifiedDescription: account.verifiedDescription,
    };
    setAccounts(prev => {
      const filtered = prev.filter(a => a.email.toLowerCase() !== newLocalAccount.email.toLowerCase());
      return [...filtered, newLocalAccount];
    });

    // La confirmation email est désactivée → session créée immédiatement après signUp
    const needsEmailConfirm = !data.session;

    // Si session présente, connecter l'utilisateur directement
    if (data.session && data.user) {
      setIsAuthenticated(true);
      setProfile(p => ({
        ...p,
        name:             account.name.trim(),
        schoolLevel:      account.schoolLevel,
        role:             account.role ?? 'student',
        securityQuestion: account.securityQuestion || '',
        securityAnswer:   account.securityAnswer   || '',
      }));
    }

    return { ok: true, needsEmailConfirm };
  }, [setAccounts]);

  // ── Recherche compte par email (Supabase + fallback localStorage) ────────
  const findAccountByEmail = useCallback(async (email: string): Promise<AppAccount | undefined> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Essayer Supabase profiles
    const { data } = await supabase.from('profiles')
      .select('email, name, school_level, security_question, security_answer')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (data) {
      return {
        email: data.email ?? '',
        name: data.name,
        passwordHash: '',
        schoolLevel: (data.school_level as SchoolLevel) || '2nde',
        securityQuestion: data.security_question ?? '',
        securityAnswer: data.security_answer ?? '' };
    }

    // 2. Fallback : comptes créés avant la migration Supabase
    return accounts.find(a => a.email.toLowerCase() === cleanEmail);
  }, [accounts]);

  // ── Connexion via Supabase Auth + fallback localStorage ──────────────────
  const loginWithCredentials = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string; name?: string; schoolLevel?: SchoolLevel; role?: 'student' | 'teacher' | 'parent' | 'admin' }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Essayer Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password });

    if (data?.user && !error) {
      // Succès Supabase → récupérer le profil complet (y compris question secrète)
      const { data: prof } = await supabase.from('profiles')
        .select('name, school_level, avatar_url, security_question, security_answer, xp_points, streak_days, last_active_date, favorite_subjects')
        .eq('id', data.user.id)
        .maybeSingle();

      const name             = prof?.name             || data.user.user_metadata?.name             || 'Étudiant';
      const schoolLevel      = (prof?.school_level    as SchoolLevel) || (data.user.user_metadata?.school_level as SchoolLevel) || '2nde';
      const role             = (data.user.user_metadata?.role as 'student' | 'teacher' | 'parent' | 'admin') ?? 'student';
      const securityQuestion = prof?.security_question || (data.user.user_metadata?.security_question as string) || '';
      const securityAnswer   = prof?.security_answer   || (data.user.user_metadata?.security_answer   as string) || '';
      const avatarUrl        = prof?.avatar_url        || undefined;

      // Mettre à jour le profil local avec toutes les données récupérées depuis la DB
      setProfile(p => ({
        ...p,
        name,
        schoolLevel,
        role,
        securityQuestion,
        securityAnswer,
        ...(avatarUrl ? { avatarUrl } : {}),
        // Restaurer XP et série depuis Supabase (source de vérité multi-appareils)
        ...(typeof prof?.xp_points === 'number' && prof.xp_points > 0 ? { xpPoints: prof.xp_points } : {}),
        ...(typeof prof?.streak_days === 'number' && prof.streak_days > 0 ? { streakDays: prof.streak_days } : {}),
        ...(prof?.last_active_date ? { lastActiveDate: prof.last_active_date } : {}),
        ...(Array.isArray(prof?.favorite_subjects) && prof.favorite_subjects.length > 0
          ? { favoriteSubjects: prof.favorite_subjects as UserProfile['favoriteSubjects'] }
          : {}),
      }));

      // Stocker userId et charger toutes les données depuis Supabase
      setUserId(data.user.id);
      userIdRef.current = data.user.id;
      loadUserData(data.user.id);

      return { ok: true, name, schoolLevel, role };
    }

    // 2. Si Supabase échoue → fallback localStorage (comptes créés avant migration)
    const localAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (localAccount && localAccount.passwordHash === password) {
      // Créer une session locale simulée
      setIsAuthenticated(true);
      setProfile(p => ({
        ...p,
        name: localAccount.name,
        schoolLevel: localAccount.schoolLevel }));
      return { ok: true, name: localAccount.name, schoolLevel: localAccount.schoolLevel };
    }

    // 3. Erreurs explicites — vérifier code ET message (Supabase v2.x)
    const msg  = error?.message ?? '';
    const code = (error as { code?: string })?.code ?? '';
    console.warn('[loginWithCredentials] Supabase error — code:', code, '| msg:', msg);

    if (
      code === 'email_not_confirmed' ||
      msg.includes('Email not confirmed') ||
      msg.includes('email_not_confirmed')
    ) {
      return { ok: false, error: 'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte de réception (et vos spams).' };
    }
    if (
      code === 'invalid_credentials' ||
      code === 'user_not_found' ||
      msg.includes('Invalid login credentials') ||
      msg.includes('invalid_credentials') ||
      msg.includes('Invalid email or password')
    ) {
      return { ok: false, error: 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou utilisez « Mot de passe oublié ».' };
    }
    if (
      code === 'over_request_rate_limit' ||
      code === 'too_many_requests' ||
      msg.includes('rate limit') ||
      msg.includes('too many')
    ) {
      return { ok: false, error: 'Trop de tentatives. Attendez quelques minutes avant de réessayer.' };
    }
    if (msg.includes('User not found') || msg.includes('user_not_found')) {
      return { ok: false, error: 'Aucun compte trouvé avec cet email. Vérifiez votre adresse ou créez un compte.' };
    }
    return { ok: false, error: 'Connexion impossible. Vérifiez votre connexion internet et réessayez.' };
  }, [accounts, setIsAuthenticated, setProfile]);

  // ── Mise à jour mot de passe (session active) ─────────────────────────────
  const updateAccountPassword = useCallback(async (_email: string, newPassword: string): Promise<void> => {
    await supabase.auth.updateUser({ password: newPassword });
  }, []);

  const addXp = useCallback((amount: number) => setProfile(p => ({ ...p, xpPoints: p.xpPoints + amount })), [setProfile]);

  // ── Sync XP + série vers Supabase (debounce via useEffect) ────────────────
  // Utilise une ref pour éviter les appels au démarrage (avant toute action utilisateur)
  const xpSyncRef = useRef({ xp: -1, streak: -1 });
  useEffect(() => {
    if (!userIdRef.current) return;
    if (xpSyncRef.current.xp === profile.xpPoints && xpSyncRef.current.streak === profile.streakDays) return;
    xpSyncRef.current = { xp: profile.xpPoints, streak: profile.streakDays };
    const timer = setTimeout(() => {
      if (!userIdRef.current) return;
      supabase.from('profiles').update({
        xp_points: profile.xpPoints,
        streak_days: profile.streakDays,
        last_active_date: profile.lastActiveDate ?? new Date().toISOString().split('T')[0],
      }).eq('id', userIdRef.current).then(() => { /* silencieux */ });
    }, 2000); // debounce 2 s — évite les appels à chaque frappe XP
    return () => clearTimeout(timer);
  }, [profile.xpPoints, profile.streakDays, profile.lastActiveDate]);

  // ── Helper : valide un défi ET donne la récompense XP ────────────────────
  // IMPORTANT : ne jamais appeler addXp (setProfile) à l'intérieur d'un
  // setter setChallenges — React interdit les setState imbriqués dans un
  // updater fonctionnel (crash AppProvider en StrictMode/hot-reload).
  // On lit `challenges` en snapshot synchrone AVANT de mettre à jour.
  const autoCompleteChallenge = useCallback((challengeId: string) => {
    const target = challenges.find(ch => ch.id === challengeId && !ch.completed);
    if (!target) return;
    addXp(target.xpReward);
    setChallenges(c => c.map(ch => ch.id === challengeId ? { ...ch, completed: true } : ch));
  }, [challenges, setChallenges, addXp]);

  const addActivity = useCallback((activity: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setRecentActivity(a => [`${activity} · ${timestamp}`, ...a].slice(0, 20));
  }, [setRecentActivity]);

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newTodo: Todo = { ...todo, id, createdAt: new Date().toISOString() };
    setTodos(t => [newTodo, ...t]);
    addActivity(`Tâche ajoutée : ${todo.title}`);
    // Persistance Supabase (fire-and-forget)
    if (userIdRef.current) {
      createTodo(userIdRef.current, {
        title: todo.title, completed: false,
        priority: todo.priority, due_date: todo.dueDate,
      }).catch(() => { /* hors-ligne — déjà en localStorage */ });
    }
  }, [setTodos, addActivity]);

  const toggleTodo = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      addXp(10);
      autoCompleteChallenge('daily_2');
    }
    const newCompleted = !(todo?.completed ?? false);
    setTodos(t => t.map(t2 => t2.id === id ? { ...t2, completed: !t2.completed } : t2));
    // Persistance Supabase
    if (userIdRef.current) {
      updateTodo(id, { completed: newCompleted }).catch(() => { /* hors-ligne */ });
    }
  }, [todos, setTodos, addXp, autoCompleteChallenge]);

  const deleteTodo = useCallback((id: string) => {
    setTodos(t => t.filter(todo => todo.id !== id));
    if (userIdRef.current) {
      apiDeleteTodo(id).catch(() => { /* hors-ligne */ });
    }
  }, [setTodos]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    setEvents(e => [...e, { ...event, id: crypto.randomUUID() }]);
    addActivity(`Événement ajouté : ${event.title}`);
    if (userIdRef.current) {
      createCalendarEvent(userIdRef.current, {
        title: event.title,
        event_date: event.eventDate,
        event_type: event.eventType,
        start_time: event.startTime, end_time: event.endTime,
        subject: event.subject, notes: event.notes,
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setEvents, addActivity]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(e => e.filter(ev => ev.id !== id));
    if (userIdRef.current) {
      deleteCalendarEvent(id).catch(() => { /* hors-ligne */ });
    }
  }, [setEvents]);

  const addAiHistory = useCallback((item: Omit<AiHistoryItem, 'id' | 'createdAt'>) => {
    const newItem: AiHistoryItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setAiHistory(h => [newItem, ...h].slice(0, 10));
    addActivity(`Question : ${item.question.slice(0, 40)}...`);
    addXp(15);
    autoCompleteChallenge('daily_1');
    if (userIdRef.current) {
      saveAiHistory(userIdRef.current, {
        question: item.question, answer: item.answer,
        subject: item.subject, level: item.level,
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setAiHistory, addActivity, addXp, autoCompleteChallenge]);

  // ── Auto-unlock badges selon progression réelle ───────────────────────────
  useEffect(() => {
    const xp           = profile.xpPoints;
    const doneCount    = todos.filter(t => t.completed).length;
    const pomodoroTotal = pomodoroSessions.reduce((acc, s) => acc + s.sessionCount, 0);

    setBadges(b => b.map(badge => {
      if (badge.unlocked) return badge;
      let shouldUnlock = false;
      if (badge.id === 'xp_500'    && xp >= 500)           shouldUnlock = true;
      if (badge.id === 'xp_1000'   && xp >= 1000)          shouldUnlock = true;
      if (badge.id === 'todo_master' && doneCount >= 10)    shouldUnlock = true;
      if (badge.id === 'pomodoro_5' && pomodoroTotal >= 5)  shouldUnlock = true;
      return shouldUnlock
        ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
        : badge;
    }));
  }, [profile.xpPoints, todos, pomodoroSessions, setBadges]);

  const unlockBadge = useCallback((id: string) => {
    setBadges(b => b.map(badge =>
      badge.id === id && !badge.unlocked
        ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
        : badge
    ));
  }, [setBadges]);

  const completeChallenge = useCallback((id: string) => {
    setChallenges(c => c.map(ch => {
      if (ch.id === id && !ch.completed) {
        addXp(ch.xpReward);
        addActivity(`Défi complété : ${ch.title}`);
        return { ...ch, completed: true };
      }
      return ch;
    }));
  }, [setChallenges, addXp, addActivity]);

  // ── Flashcards ──────────────────────────────────────────────────────────────
  const addDeck = useCallback((deck: Omit<FlashcardDeck, 'id' | 'createdAt'>): string => {
    const id = crypto.randomUUID();
    setDecks(d => [...d, { ...deck, id, createdAt: new Date().toISOString() }]);
    addActivity(`Deck créé : ${deck.name}`);
    if (userIdRef.current) {
      createFlashcardDeck(userIdRef.current, {
        name: deck.name, subject: deck.subject ?? '', color: 'blue',
      }).catch(() => { /* hors-ligne */ });
    }
    return id;
  }, [setDecks, addActivity]);

  const deleteDeck = useCallback((id: string) => {
    setDecks(d => d.filter(deck => deck.id !== id));
    setFlashcards(f => f.filter(card => card.deckId !== id));
    if (userIdRef.current) {
      deleteFlashcardDeck(id).catch(() => { /* hors-ligne */ });
    }
  }, [setDecks, setFlashcards]);

  const addFlashcard = useCallback((card: Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'nextReview'>) => {
    const today = new Date().toISOString().split('T')[0];
    setFlashcards(f => [...f, {
      ...card, id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      reviewCount: 0, nextReview: today }].slice(-500));
    if (userIdRef.current) {
      createFlashcard(userIdRef.current, {
        deck_id: card.deckId,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty ?? 'medium',
        next_review: today,
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setFlashcards]);

  // ── Ajout groupé (import de pack) ─────────────────────────────────────────
  const importPackCards = useCallback((cards: Array<Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'nextReview'>>) => {
    if (cards.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const now   = new Date().toISOString();
    const newCards = cards.map(card => ({
      ...card, id: crypto.randomUUID(), createdAt: now, reviewCount: 0, nextReview: today,
    }));
    setFlashcards(f => [...f, ...newCards].slice(-500));
    if (userIdRef.current) {
      newCards.forEach(card => {
        createFlashcard(userIdRef.current!, {
          deck_id: card.deckId, question: card.question, answer: card.answer,
          difficulty: card.difficulty ?? 'medium', next_review: today,
        }).catch(() => { /* hors-ligne */ });
      });
    }
  }, [setFlashcards]);

  const deleteFlashcard = useCallback((id: string) => {
    setFlashcards(f => f.filter(c => c.id !== id));
    if (userIdRef.current) {
      apiDeleteFlashcard(id).catch(() => { /* hors-ligne */ });
    }
  }, [setFlashcards]);

  const reviewFlashcard = useCallback((id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const nextReview = nextReviewDate(difficulty);
    setFlashcards(f => f.map(c => c.id === id
      ? { ...c, difficulty, nextReview, reviewCount: c.reviewCount + 1 }
      : c
    ));
    addXp(difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8);
    if (userIdRef.current) {
      updateFlashcard(id, {
        difficulty, next_review: nextReview,
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setFlashcards, addXp]);

  // ── Notes ────────────────────────────────────────────────────────────────────
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setNotes(n => [{ ...note, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...n].slice(0, 300));
    addActivity(`Note créée : ${note.title}`);
    addXp(5);
    if (userIdRef.current) {
      createNote(userIdRef.current, {
        title: note.title, content: note.content ?? '',
        subject: note.subject ?? '', tags: note.tags ?? [],
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setNotes, addActivity, addXp]);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(n => n.map(note => note.id === id
      ? { ...note, ...updates, updatedAt: new Date().toISOString() }
      : note
    ));
    if (userIdRef.current) {
      apiUpdateNote(id, {
        ...(updates.title    !== undefined ? { title: updates.title }     : {}),
        ...(updates.content  !== undefined ? { content: updates.content } : {}),
        ...(updates.subject  !== undefined ? { subject: updates.subject } : {}),
        ...(updates.tags     !== undefined ? { tags: updates.tags }       : {}),
      }).catch(() => { /* hors-ligne */ });
    }
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(n => n.filter(note => note.id !== id));
    if (userIdRef.current) {
      apiDeleteNote(id).catch(() => { /* hors-ligne */ });
    }
  }, [setNotes]);

  // ── Quêtes ───────────────────────────────────────────────────────────────────
  const completeQuestMission = useCallback((questId: string, missionId: string) => {
    setQuests(q => q.map(quest => {
      if (quest.id !== questId) return quest;
      const missions = quest.missions.map(m => m.id === missionId ? { ...m, completed: true } : m);
      const allDone = missions.every(m => m.completed);
      if (allDone) { addXp(quest.xpReward); addActivity(`Quête terminée : ${quest.title}`); }
      return { ...quest, missions };
    }));
  }, [setQuests, addXp, addActivity]);

  // ── Pomodoro ─────────────────────────────────────────────────────────────────
  const addPomodoroSession = useCallback((session: Omit<PomodoroSession, 'id'>) => {
    setPomodoroSessions(s => {
      const existing = s.find(x => x.date === session.date);
      if (existing) {
        return s.map(x => x.date === session.date
          ? { ...x, sessionCount: x.sessionCount + 1, workMinutes: x.workMinutes + session.workMinutes }
          : x
        );
      }
      return [...s, { ...session, id: crypto.randomUUID() }].slice(-90); // Cap à 90 jours
    });
    addXp(20);
    addActivity(`Session Pomodoro terminée (${session.workMinutes} min)`);
    // Auto-valider le défi journalier "Session Pomodoro" + XP reward
    autoCompleteChallenge('daily_3');
  }, [setPomodoroSessions, addXp, addActivity, autoCompleteChallenge]);

  // ── Valeur du contexte mémoïsée (évite les re-renders en cascade) ─────────
  const contextValue = useMemo(() => ({
    isDark, toggleTheme,
    isAuthenticated, authReady, profileReady, login, logout,
    accounts, registerAccount, findAccountByEmail, loginWithCredentials, updateAccountPassword,
    profile, user: profile, setProfile, level, setLevel,
    todos, setTodos, addTodo, toggleTodo, deleteTodo,
    events, setEvents, addEvent, deleteEvent,
    aiHistory, addAiHistory,
    revisionSessions, setRevisionSessions,
    badges, setBadges, unlockBadge,
    challenges, setChallenges, completeChallenge,
    addXp, recentActivity, addActivity,
    decks, setDecks, addDeck, deleteDeck,
    flashcards, setFlashcards, addFlashcard, importPackCards, deleteFlashcard, reviewFlashcard,
    notes, setNotes, addNote, updateNote, deleteNote,
    quests, setQuests, completeQuestMission,
    pomodoroSessions, addPomodoroSession }), [
    isDark, toggleTheme,
    isAuthenticated, authReady, profileReady, login, logout,
    accounts, registerAccount, findAccountByEmail, loginWithCredentials, updateAccountPassword,
    profile, setProfile, level, setLevel,
    todos, setTodos, addTodo, toggleTodo, deleteTodo,
    events, setEvents, addEvent, deleteEvent,
    aiHistory, addAiHistory,
    revisionSessions, setRevisionSessions,
    badges, setBadges, unlockBadge,
    challenges, setChallenges, completeChallenge,
    addXp, recentActivity, addActivity,
    decks, setDecks, addDeck, deleteDeck,
    flashcards, setFlashcards, addFlashcard, importPackCards, deleteFlashcard, reviewFlashcard,
    notes, setNotes, addNote, updateNote, deleteNote,
    quests, setQuests, completeQuestMission,
    pomodoroSessions, addPomodoroSession,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Vite HMR : ce module exporte un React Context. Si React Fast Refresh
// remplaçait le module à chaud, `createContext()` produirait une nouvelle
// identité → useApp() obtiendrait null → crash.
// On accepte la mise à jour (évite la propagation HMR aux parents) puis on
// appelle invalidate() pour forcer un rechargement complet de page — en le
// plaçant DANS le callback accept, il ne s'exécute que lors d'une vraie
// mise à jour, jamais lors de l'initialisation initiale du module.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate();
  });
}
