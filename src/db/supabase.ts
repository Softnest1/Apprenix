import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types DB ──────────────────────────────────────────────────────────────────

export interface AccessibilityPrefs {
  profile:      'standard' | 'dys' | 'ulis' | 'malvoyant';
  font:         'inter' | 'luciole' | 'opendyslexic' | 'arial';
  fontSize:     number;
  lineHeight:   number;
  background:   'white' | 'cream' | 'lightblue' | 'lightgray';
  contrast:     'normal' | 'high' | 'veryhigh';
  daltonism:    'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  tts:          boolean;
  syllabation:  boolean;
  falc:         boolean;
  simplifiedNav: boolean;
}

export interface DbProfile {
  id: string;
  name?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
  school_level?: string;
  avatar_url?: string;
  avatar_emoji?: string;
  verified?: boolean;
  created_at?: string;
  accessibility_prefs?: AccessibilityPrefs;
}

export interface DbUserSettings {
  user_id: string;
  theme?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  updated_at?: string;
}

export interface DbTodo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
}

export interface DbCalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  event_type?: string;
  subject?: string;
  notes?: string;
  created_at?: string;
}

export interface DbAiHistory {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  subject?: string;
  level?: string;
  created_at?: string;
}

export interface DbFlashcardDeck {
  id: string;
  user_id: string;
  name: string;
  title?: string;       // alias de name pour compatibilité avec certaines queries
  color?: string;
  subject?: string;
  card_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbFlashcard {
  id: string;
  user_id: string;
  deck_id?: string;
  front?: string;       // alias – colonne DB réelle : question
  back?: string;        // alias – colonne DB réelle : answer
  question?: string;
  answer?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  next_review?: string;
  review_count?: number;
  ease_factor?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  subject?: string;
  tags?: string[];
  color?: string;
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbRevisionSession {
  id: string;
  user_id: string;
  subject?: string;
  duration_min?: number;
  xp_earned?: number;
  created_at?: string;
}

export interface DbPomodoroSession {
  id: string;
  user_id: string;
  duration_min?: number;
  completed?: boolean;
  created_at?: string;
}

export interface DbUserBadge {
  id: string;
  user_id: string;
  badge_id?: string;
  unlocked_at?: string;
}

export interface DbArticle {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  subject?: string;
  cover_url?: string;
  featured?: boolean;
  status?: string;
  created_at?: string;
}

export interface DbContentItem {
  id: string;
  author_id?: string;
  title: string;
  type?: string;
  content_type?: string;
  subject?: string;
  level?: string;
  content?: string;
  body?: string;
  status?: string;
  is_ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbStudentQuestion {
  id: string;
  student_id?: string;
  teacher_id?: string;
  title: string;
  content?: string;
  subject?: string;
  level?: string;
  status?: string;
  created_at?: string;
}

export interface DbStudentSubmission {
  id: string;
  student_id?: string;
  teacher_id?: string;
  title?: string;
  file_url?: string;
  subject?: string;
  status?: string;
  grade?: number;
  teacher_feedback?: string;
  created_at?: string;
}

export interface DbTeacherAnswer {
  id: string;
  question_id?: string;
  teacher_id?: string;
  content?: string;
  body?: string;
  is_official?: boolean;
  created_at?: string;
}

export interface DbCommunityQuestion {
  id: string;
  author_id?: string;
  title: string;
  content?: string;
  subject?: string;
  votes?: number;
  created_at?: string;
}

export interface DbCommunityAnswer {
  id: string;
  question_id?: string;
  author_id?: string;
  content?: string;
  votes?: number;
  created_at?: string;
}

export interface DbParentMessage {
  id: string;
  student_id?: string;
  parent_id?: string;
  parent_email?: string;
  teacher_id?: string;
  subject?: string;
  content?: string;
  body?: string;
  sender_role?: string;
  read?: boolean;
  created_at?: string;
}

export interface DbSiteIntegrityCheck {
  id: string;
  check_type?: string;
  target_url?: string;
  checked_at?: string;
  status?: string;
  details?: string | Record<string, unknown>;
}

// ── Nouvelles tables — Système professeur / collaboration ─────────────────────

export interface DbTeacherProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  institution?: string;
  bio?: string;
  subjects: string[];
  levels: string[];
  is_visible: boolean;
  availability: 'available' | 'busy' | 'paused';
  max_students: number;
  contact_phone?: string;
  contact_email?: string;
  contact_mode: 'phone' | 'email' | 'app';
  total_students: number;
  // hérité de l'ancienne table
  is_available?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbAccompanimentRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  message?: string;
  status: 'pending' | 'accepted' | 'refused' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  // joints optionnels
  teacher_profile?: Partial<DbTeacherProfile>;
  student_profile?: Partial<DbProfile>;
}

export interface DbCollaboration {
  id: string;
  student_id: string;
  teacher_id: string;
  request_id?: string;
  subject: string;
  status: 'active' | 'closed';
  shared_notes?: string;
  created_at?: string;
  updated_at?: string;
  // joints optionnels
  teacher_profile?: Partial<DbTeacherProfile>;
  student_profile?: Partial<DbProfile>;
}

export interface DbCollaborationMessage {
  id: string;
  collaboration_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
}

export interface DbCollaborationResource {
  id: string;
  collaboration_id: string;
  uploader_id: string;
  title: string;
  resource_type: 'link' | 'file';
  url: string;
  created_at?: string;
}

export interface DbCollaborationObjective {
  id: string;
  collaboration_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbAppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  ref_id?: string;
  created_at?: string;
}
