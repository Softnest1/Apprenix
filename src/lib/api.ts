/**
 * api.ts — Fonctions typées Supabase pour toutes les tables Apprenix
 * Règles : maybeSingle(), order()+limit(), pagination curseur, Array.isArray guard
 */

import type {
  DbAccompanimentRequest, DbAiHistory, DbAppNotification,
  DbArticle, DbCalendarEvent,
  DbCollaboration, DbCollaborationMessage,
  DbCollaborationObjective, DbCollaborationResource,
  DbCommunityAnswer, DbCommunityQuestion,
  DbContentItem, DbFlashcard, DbFlashcardDeck,
  DbNote, DbParentMessage, DbPomodoroSession,
  DbProfile, DbRevisionSession, DbSiteIntegrityCheck,
  DbStudentQuestion, DbStudentSubmission,
  DbTeacherAnswer, DbTeacherProfile,
  DbTodo, DbUserBadge, DbUserSettings,
} from '@/db/supabase';
import { supabase } from '@/db/supabase';



// Helpers pour caster les réponses vers nos types définis
const asRow  = <T>(d: unknown): T => d as T;
const asRows = <T>(d: unknown): T[] => (Array.isArray(d) ? d : []) as T[];

// ══════════════════════════════════════════════════════════════════════════════
// PROFILES
// ══════════════════════════════════════════════════════════════════════════════
export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data ? asRow<DbProfile>(data) : null;
}

export async function upsertProfile(profile: Partial<DbProfile> & { id: string }): Promise<void> {
  await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
}

// ══════════════════════════════════════════════════════════════════════════════
// USER SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
export async function getUserSettings(userId: string): Promise<DbUserSettings | null> {
  const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
  return data ? asRow<DbUserSettings>(data) : null;
}

export async function upsertUserSettings(
  settings: Partial<DbUserSettings> & { user_id: string }
): Promise<void> {
  await supabase.from('user_settings').upsert(settings, { onConflict: 'user_id' });
}

// ══════════════════════════════════════════════════════════════════════════════
// TODOS
// ══════════════════════════════════════════════════════════════════════════════
export async function getTodos(userId: string, limit = 50): Promise<DbTodo[]> {
  const { data } = await supabase
    .from('todos').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbTodo>(data);
}

export async function createTodo(
  userId: string,
  payload: Omit<DbTodo, 'id' | 'created_at' | 'user_id'>
): Promise<void> {
  await supabase.from('todos').insert({ ...payload, user_id: userId });
}

export async function updateTodo(
  id: string,
  changes: Partial<Pick<DbTodo, 'title' | 'completed' | 'priority' | 'due_date'>>
): Promise<void> {
  await supabase.from('todos').update(changes).eq('id', id);
}

export async function deleteTodo(id: string): Promise<void> {
  await supabase.from('todos').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR EVENTS
// ══════════════════════════════════════════════════════════════════════════════
export async function getCalendarEvents(userId: string, limit = 100): Promise<DbCalendarEvent[]> {
  const { data } = await supabase
    .from('calendar_events').select('*').eq('user_id', userId)
    .order('event_date', { ascending: true }).limit(limit);
  return asRows<DbCalendarEvent>(data);
}

export async function createCalendarEvent(
  userId: string,
  payload: Omit<DbCalendarEvent, 'id' | 'created_at' | 'user_id'>
): Promise<void> {
  await supabase.from('calendar_events').insert({ ...payload, user_id: userId });
}

export async function updateCalendarEvent(
  id: string,
  changes: Partial<Omit<DbCalendarEvent, 'id' | 'user_id'>>
): Promise<void> {
  await supabase.from('calendar_events').update(changes).eq('id', id);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await supabase.from('calendar_events').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// AI HISTORY
// ══════════════════════════════════════════════════════════════════════════════
export async function getAiHistory(
  userId: string,
  cursor?: string,
  limit = 20
): Promise<DbAiHistory[]> {
  let q = supabase
    .from('ai_history').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit);
  if (cursor) q = q.lt('created_at', cursor);
  const { data } = await q;
  return asRows<DbAiHistory>(data);
}

export async function saveAiHistory(
  userId: string,
  payload: Omit<DbAiHistory, 'id' | 'created_at' | 'user_id'>
): Promise<void> {
  await supabase.from('ai_history').insert({ ...payload, user_id: userId });
}

export async function deleteAiHistory(id: string): Promise<void> {
  await supabase.from('ai_history').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// FLASHCARD DECKS
// ══════════════════════════════════════════════════════════════════════════════
export async function getFlashcardDecks(userId: string): Promise<DbFlashcardDeck[]> {
  const { data } = await supabase
    .from('flashcard_decks').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(200);
  return asRows<DbFlashcardDeck>(data);
}

export async function createFlashcardDeck(
  userId: string,
  payload: Omit<DbFlashcardDeck, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<void> {
  await supabase.from('flashcard_decks').insert({ ...payload, user_id: userId });
}

export async function updateFlashcardDeck(
  id: string,
  changes: Partial<Pick<DbFlashcardDeck, 'name' | 'subject' | 'color'>>
): Promise<void> {
  await supabase.from('flashcard_decks').update(changes).eq('id', id);
}

export async function deleteFlashcardDeck(id: string): Promise<void> {
  await supabase.from('flashcard_decks').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// FLASHCARDS
// ══════════════════════════════════════════════════════════════════════════════
export async function getFlashcards(userId: string, deckId?: string): Promise<DbFlashcard[]> {
  let q = supabase
    .from('flashcards').select('*').eq('user_id', userId)
    .order('next_review', { ascending: true }).limit(500);
  if (deckId) q = q.eq('deck_id', deckId);
  const { data } = await q;
  return asRows<DbFlashcard>(data);
}

export async function getDueFlashcards(userId: string, limit = 20): Promise<DbFlashcard[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('flashcards').select('*').eq('user_id', userId)
    .lte('next_review', today).order('next_review', { ascending: true }).limit(limit);
  return asRows<DbFlashcard>(data);
}

export async function createFlashcard(
  userId: string,
  payload: Omit<DbFlashcard, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<void> {
  await supabase.from('flashcards').insert({ ...payload, user_id: userId });
}

export async function updateFlashcard(
  id: string,
  changes: Partial<Omit<DbFlashcard, 'id' | 'user_id'>>
): Promise<void> {
  await supabase.from('flashcards').update(changes).eq('id', id);
}

export async function deleteFlashcard(id: string): Promise<void> {
  await supabase.from('flashcards').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTES
// ══════════════════════════════════════════════════════════════════════════════
export async function getNotes(userId: string, limit = 100): Promise<DbNote[]> {
  const { data } = await supabase
    .from('notes').select('*').eq('user_id', userId)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false }).limit(limit);
  return asRows<DbNote>(data);
}

export async function createNote(
  userId: string,
  payload: Omit<DbNote, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<void> {
  await supabase.from('notes').insert({ ...payload, user_id: userId });
}

export async function updateNote(
  id: string,
  changes: Partial<Omit<DbNote, 'id' | 'user_id'>>
): Promise<void> {
  await supabase.from('notes').update(changes).eq('id', id);
}

export async function deleteNote(id: string): Promise<void> {
  await supabase.from('notes').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// REVISION SESSIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getRevisionSessions(userId: string, limit = 50): Promise<DbRevisionSession[]> {
  const { data } = await supabase
    .from('revision_sessions').select('*').eq('user_id', userId)
    .order('session_date', { ascending: false }).limit(limit);
  return asRows<DbRevisionSession>(data);
}

export async function createRevisionSession(
  userId: string,
  payload: Omit<DbRevisionSession, 'id' | 'created_at' | 'user_id'>
): Promise<void> {
  await supabase.from('revision_sessions').insert({ ...payload, user_id: userId });
}

// ══════════════════════════════════════════════════════════════════════════════
// POMODORO SESSIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getPomodoroSessions(userId: string, limit = 50): Promise<DbPomodoroSession[]> {
  const { data } = await supabase
    .from('pomodoro_sessions').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbPomodoroSession>(data);
}

export async function createPomodoroSession(
  userId: string,
  payload: Omit<DbPomodoroSession, 'id' | 'created_at' | 'user_id'>
): Promise<void> {
  await supabase.from('pomodoro_sessions').insert({ ...payload, user_id: userId });
}

// ══════════════════════════════════════════════════════════════════════════════
// USER BADGES
// ══════════════════════════════════════════════════════════════════════════════
export async function getUserBadges(userId: string): Promise<DbUserBadge[]> {
  const { data } = await supabase
    .from('user_badges').select('*').eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  return asRows<DbUserBadge>(data);
}

export async function unlockBadge(userId: string, badgeId: string): Promise<void> {
  await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId });
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLES
// ══════════════════════════════════════════════════════════════════════════════
export async function getArticles(limit = 20, cursor?: string): Promise<DbArticle[]> {
  let q = supabase.from('articles').select('*').order('published_at', { ascending: false }).limit(limit);
  if (cursor) q = q.lt('published_at', cursor);
  const { data } = await q;
  return asRows<DbArticle>(data);
}

export async function getFeaturedArticles(limit = 5): Promise<DbArticle[]> {
  const { data } = await supabase
    .from('articles').select('*').eq('featured', true)
    .order('published_at', { ascending: false }).limit(limit);
  return asRows<DbArticle>(data);
}

export async function createArticle(payload: Omit<DbArticle, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('articles').insert(payload);
}

export async function updateArticle(
  id: string, changes: Partial<Omit<DbArticle, 'id'>>
): Promise<void> {
  await supabase.from('articles').update(changes).eq('id', id);
}

export async function deleteArticle(id: string): Promise<void> {
  await supabase.from('articles').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNAUTÉ — QUESTIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getCommunityQuestions(
  limit = 30, cursor?: string
): Promise<DbCommunityQuestion[]> {
  let q = supabase
    .from('community_questions').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  if (cursor) q = q.lt('created_at', cursor);
  const { data } = await q;
  return asRows<DbCommunityQuestion>(data);
}

export async function createCommunityQuestion(
  payload: Omit<DbCommunityQuestion, 'id' | 'created_at'>
): Promise<void> {
  await supabase.from('community_questions').insert(payload);
}

export async function deleteCommunityQuestion(id: string): Promise<void> {
  await supabase.from('community_questions').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNAUTÉ — RÉPONSES
// ══════════════════════════════════════════════════════════════════════════════
export async function getCommunityAnswers(questionId: string): Promise<DbCommunityAnswer[]> {
  const { data } = await supabase
    .from('community_answers').select('*').eq('question_id', questionId)
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: true }).limit(50);
  return asRows<DbCommunityAnswer>(data);
}

export async function createCommunityAnswer(
  payload: Omit<DbCommunityAnswer, 'id' | 'created_at'>
): Promise<void> {
  await supabase.from('community_answers').insert(payload);
}

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE — AVATAR & SCANNER
// ══════════════════════════════════════════════════════════════════════════════
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar_${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('avatars').upload(path, file, { contentType: file.type, upsert: true });
  if (error || !data) return null;

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
  return urlData.publicUrl ?? null;
}

export async function uploadScannerImage(userId: string, file: File): Promise<string | null> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/scan_${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('scanner-uploads').upload(path, file, { contentType: file.type });
  if (error || !data) return null;

  const { data: signedData } = await supabase.storage
    .from('scanner-uploads').createSignedUrl(data.path, 300);
  return signedData?.signedUrl ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT ITEMS (contenus pédagogiques — Couche A, 100% humain)
// ══════════════════════════════════════════════════════════════════════════════
export async function getPublishedContents(limit = 30, cursor?: string): Promise<DbContentItem[]> {
  let q = supabase.from('content_items').select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false }).limit(limit);
  if (cursor) q = q.lt('published_at', cursor);
  const { data } = await q;
  return asRows<DbContentItem>(data);
}

export async function getMyContents(authorId: string, limit = 50): Promise<DbContentItem[]> {
  const { data } = await supabase.from('content_items').select('*')
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false }).limit(limit);
  return asRows<DbContentItem>(data);
}

export async function getContentsForReview(limit = 50): Promise<DbContentItem[]> {
  const { data } = await supabase.from('content_items').select('*')
    .eq('status', 'review')
    .order('created_at', { ascending: true }).limit(limit);
  return asRows<DbContentItem>(data);
}

export async function createContent(payload: Omit<DbContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await supabase.from('content_items').insert({ ...payload, is_ai_generated: false });
}

export async function updateContent(id: string, changes: Partial<Omit<DbContentItem, 'id'>>): Promise<void> {
  await supabase.from('content_items').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function publishContent(id: string, adminId: string): Promise<void> {
  await supabase.from('content_items').update({
    status: 'published',
    verified_by: adminId,
    verified_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('is_ai_generated', false);
}

export async function rejectContent(id: string): Promise<void> {
  await supabase.from('content_items').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', id);
}

export async function uploadContentAttachment(userId: string, file: File): Promise<string | null> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${safeName}`;
  const { data, error } = await supabase.storage
    .from('content-attachments').upload(path, file, { contentType: file.type });
  if (error || !data) return null;
  const { data: signed } = await supabase.storage.from('content-attachments').createSignedUrl(data.path, 86400);
  return signed?.signedUrl ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT QUESTIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getMyQuestions(studentId: string, limit = 50): Promise<DbStudentQuestion[]> {
  const { data } = await supabase.from('student_questions').select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbStudentQuestion>(data);
}

export async function getAllOpenQuestions(limit = 100): Promise<DbStudentQuestion[]> {
  const { data } = await supabase.from('student_questions').select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: true }).limit(limit);
  return asRows<DbStudentQuestion>(data);
}

export async function createStudentQuestion(
  payload: Omit<DbStudentQuestion, 'id' | 'created_at' | 'updated_at' | 'student_id'>
): Promise<void> {
  await supabase.from('student_questions').insert(payload);
}

export async function closeStudentQuestion(id: string): Promise<void> {
  await supabase.from('student_questions').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', id);
}

export async function uploadQuestionAttachment(userId: string, file: File): Promise<string | null> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${safeName}`;
  const { data, error } = await supabase.storage
    .from('question-attachments').upload(path, file, { contentType: file.type });
  if (error || !data) return null;
  const { data: signed } = await supabase.storage.from('question-attachments').createSignedUrl(data.path, 86400);
  return signed?.signedUrl ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER ANSWERS
// ══════════════════════════════════════════════════════════════════════════════
export async function getAnswersForQuestion(questionId: string): Promise<DbTeacherAnswer[]> {
  const { data } = await supabase.from('teacher_answers').select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true }).limit(20);
  return asRows<DbTeacherAnswer>(data);
}

export async function createTeacherAnswer(
  payload: Omit<DbTeacherAnswer, 'id' | 'created_at' | 'teacher_id'>
): Promise<void> {
  await supabase.from('teacher_answers').insert(payload);
  // Mettre à jour le statut de la question
  await supabase.from('student_questions').update({ status: 'answered', updated_at: new Date().toISOString() })
    .eq('id', payload.question_id);
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT SUBMISSIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getMySubmissions(studentId: string, limit = 50): Promise<DbStudentSubmission[]> {
  const { data } = await supabase.from('student_submissions').select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbStudentSubmission>(data);
}

export async function getAllSubmissions(limit = 100): Promise<DbStudentSubmission[]> {
  const { data } = await supabase.from('student_submissions').select('*')
    .in('status', ['submitted', 'reviewed'])
    .order('created_at', { ascending: true }).limit(limit);
  return asRows<DbStudentSubmission>(data);
}

export async function getChildSubmissions(childId: string, limit = 30): Promise<DbStudentSubmission[]> {
  const { data } = await supabase.from('student_submissions').select('*')
    .eq('student_id', childId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbStudentSubmission>(data);
}

export async function createSubmission(
  payload: Omit<DbStudentSubmission, 'id' | 'created_at' | 'updated_at' | 'student_id'>
): Promise<void> {
  await supabase.from('student_submissions').insert(payload);
}

export async function gradeSubmission(
  id: string,
  teacherId: string,
  grade: number,
  feedback: string,
): Promise<void> {
  await supabase.from('student_submissions').update({
    status: 'graded',
    grade,
    teacher_feedback: feedback,
    teacher_id: teacherId,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
}

export async function uploadSubmissionFile(userId: string, file: File): Promise<string | null> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${safeName}`;
  const { data, error } = await supabase.storage
    .from('submission-files').upload(path, file, { contentType: file.type });
  if (error || !data) return null;
  const { data: signed } = await supabase.storage.from('submission-files').createSignedUrl(data.path, 86400);
  return signed?.signedUrl ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// PARENT MESSAGES
// ══════════════════════════════════════════════════════════════════════════════
export async function getParentMessages(
  parentId: string,
  teacherId?: string,
  limit = 50
): Promise<DbParentMessage[]> {
  let q = supabase.from('parent_messages').select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true }).limit(limit);
  if (teacherId) q = q.eq('teacher_id', teacherId);
  const { data } = await q;
  return asRows<DbParentMessage>(data);
}

export async function getTeacherMessages(teacherId: string, limit = 100): Promise<DbParentMessage[]> {
  const { data } = await supabase.from('parent_messages').select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbParentMessage>(data);
}

export async function sendParentMessage(
  payload: Omit<DbParentMessage, 'id' | 'created_at' | 'read'>
): Promise<void> {
  await supabase.from('parent_messages').insert({ ...payload, read: false });
}

export async function markMessageRead(id: string): Promise<void> {
  await supabase.from('parent_messages').update({ read: true }).eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// SITE INTEGRITY CHECKS (Admin 3000%)
// ══════════════════════════════════════════════════════════════════════════════
export async function getIntegrityChecks(limit = 200): Promise<DbSiteIntegrityCheck[]> {
  const { data } = await supabase.from('site_integrity_checks').select('*')
    .order('checked_at', { ascending: false }).limit(limit);
  return asRows<DbSiteIntegrityCheck>(data);
}

export async function insertIntegrityCheck(
  payload: Omit<DbSiteIntegrityCheck, 'id' | 'checked_at'>
): Promise<void> {
  await supabase.from('site_integrity_checks').insert(payload);
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — GESTION UTILISATEURS
// ══════════════════════════════════════════════════════════════════════════════
export async function getAllProfiles(limit = 200): Promise<DbProfile[]> {
  const { data } = await supabase.from('profiles').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbProfile>(data);
}

export async function updateProfileRole(id: string, role: DbProfile['role']): Promise<void> {
  await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function updateAccessibilityPrefs(
  userId: string,
  prefs: DbProfile['accessibility_prefs']
): Promise<void> {
  await supabase.from('profiles').update({
    accessibility_prefs: prefs,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
}

// ══════════════════════════════════════════════════════════════════════════════
// PLATFORM STATS (Admin dashboard)
// ══════════════════════════════════════════════════════════════════════════════
export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalContents: number;
  pendingContents: number;
  openQuestions: number;
  pendingSubmissions: number;
}> {
  const [users, contents, pending, questions, submissions] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('student_questions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('student_submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
  ]);
  return {
    totalUsers: users.count ?? 0,
    totalContents: contents.count ?? 0,
    pendingContents: pending.count ?? 0,
    openQuestions: questions.count ?? 0,
    pendingSubmissions: submissions.count ?? 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER PROFILES — annuaire professeurs
// ══════════════════════════════════════════════════════════════════════════════
export async function getTeacherProfiles(filters?: {
  subject?: string; level?: string; availability?: string;
}, limit = 30, cursor?: string): Promise<DbTeacherProfile[]> {
  let q = supabase.from('teacher_profiles').select('*').eq('is_visible', true);
  if (filters?.availability && filters.availability !== 'all') {
    q = q.eq('availability', filters.availability);
  }
  if (filters?.subject && filters.subject !== 'all') {
    q = q.contains('subjects', [filters.subject]);
  }
  if (filters?.level && filters.level !== 'all') {
    q = q.contains('levels', [filters.level]);
  }
  if (cursor) q = q.lt('created_at', cursor);
  q = q.order('created_at', { ascending: false }).limit(limit);
  const { data } = await q;
  return asRows<DbTeacherProfile>(data);
}

export async function getTeacherProfileByUserId(userId: string): Promise<DbTeacherProfile | null> {
  const { data } = await supabase.from('teacher_profiles').select('*').eq('user_id', userId).maybeSingle();
  return data ? asRow<DbTeacherProfile>(data) : null;
}

export async function upsertTeacherProfile(
  userId: string,
  payload: Partial<Omit<DbTeacherProfile, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  await supabase.from('teacher_profiles').upsert(
    { ...payload, user_id: userId, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ACCOMPANIMENT REQUESTS — demandes d'accompagnement
// ══════════════════════════════════════════════════════════════════════════════
export async function getMyRequestsAsStudent(studentId: string, limit = 30): Promise<DbAccompanimentRequest[]> {
  const { data } = await supabase
    .from('accompaniment_requests').select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbAccompanimentRequest>(data);
}

export async function getRequestsForTeacher(teacherId: string, limit = 30): Promise<DbAccompanimentRequest[]> {
  const { data } = await supabase
    .from('accompaniment_requests').select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbAccompanimentRequest>(data);
}

export async function getPendingRequestsCount(teacherId: string): Promise<number> {
  const { count } = await supabase
    .from('accompaniment_requests').select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId).eq('status', 'pending');
  return count ?? 0;
}

export async function createAccompanimentRequest(payload: {
  teacher_id: string; subject: string; message?: string;
}): Promise<void> {
  await supabase.from('accompaniment_requests').insert(payload);
}

export async function cancelAccompanimentRequest(requestId: string): Promise<void> {
  await supabase.from('accompaniment_requests').update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', requestId).eq('status', 'pending');
}

export async function acceptRequest(requestId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('accept_accompaniment_request', { p_request_id: requestId });
  if (error) throw new Error(error.message);
  return data as string | null;
}

export async function refuseRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('refuse_accompaniment_request', { p_request_id: requestId });
  if (error) throw new Error(error.message);
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLABORATIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getCollaborationsAsStudent(studentId: string, limit = 20): Promise<DbCollaboration[]> {
  const { data } = await supabase
    .from('collaborations').select('*')
    .eq('student_id', studentId).eq('status', 'active')
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbCollaboration>(data);
}

export async function getCollaborationsAsTeacher(teacherId: string, limit = 20): Promise<DbCollaboration[]> {
  const { data } = await supabase
    .from('collaborations').select('*')
    .eq('teacher_id', teacherId).eq('status', 'active')
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbCollaboration>(data);
}

export async function getActiveCollaborationsCount(teacherId: string): Promise<number> {
  const { count } = await supabase
    .from('collaborations').select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId).eq('status', 'active');
  return count ?? 0;
}

export async function getCollaborationById(id: string): Promise<DbCollaboration | null> {
  const { data } = await supabase.from('collaborations').select('*').eq('id', id).maybeSingle();
  return data ? asRow<DbCollaboration>(data) : null;
}

export async function getCollaborationByRequestId(requestId: string): Promise<DbCollaboration | null> {
  const { data } = await supabase
    .from('collaborations').select('*').eq('request_id', requestId).maybeSingle();
  return data ? asRow<DbCollaboration>(data) : null;
}

export async function updateCollaborationNotes(id: string, notes: string): Promise<void> {
  await supabase.from('collaborations').update({ shared_notes: notes, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function closeCollaboration(id: string): Promise<void> {
  await supabase.from('collaborations').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLABORATION MESSAGES — chat
// ══════════════════════════════════════════════════════════════════════════════
export async function getCollaborationMessages(collabId: string, limit = 80): Promise<DbCollaborationMessage[]> {
  const { data } = await supabase
    .from('collaboration_messages').select('*')
    .eq('collaboration_id', collabId)
    .order('created_at', { ascending: true }).limit(limit);
  return asRows<DbCollaborationMessage>(data);
}

export async function sendCollaborationMessage(collabId: string, content: string): Promise<void> {
  await supabase.from('collaboration_messages').insert({ collaboration_id: collabId, content });
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLABORATION RESOURCES — fichiers / liens
// ══════════════════════════════════════════════════════════════════════════════
export async function getCollaborationResources(collabId: string): Promise<DbCollaborationResource[]> {
  const { data } = await supabase
    .from('collaboration_resources').select('*')
    .eq('collaboration_id', collabId)
    .order('created_at', { ascending: false }).limit(50);
  return asRows<DbCollaborationResource>(data);
}

export async function addCollaborationResource(payload: {
  collaboration_id: string; title: string; resource_type: 'link' | 'file'; url: string;
}): Promise<void> {
  await supabase.from('collaboration_resources').insert(payload);
}

export async function deleteCollaborationResource(id: string): Promise<void> {
  await supabase.from('collaboration_resources').delete().eq('id', id);
}

/**
 * Uploade un fichier dans le bucket collaboration-files et insère la ressource.
 * Chemin : collaboration-files/{collabId}/{userId}/{timestamp}_{filename}
 * Retourne l'URL signée valable 7 jours stockée en base.
 */
export async function uploadCollaborationFile(
  collabId: string,
  userId: string,
  file: File
): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'bin';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path     = `${collabId}/${userId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('collaboration-files')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  // URL signée 7 jours (604800 s) — suffit pour consultation ; peut être renouvelée
  const { data: signedData, error: signError } = await supabase.storage
    .from('collaboration-files')
    .createSignedUrl(path, 604800);

  if (signError || !signedData?.signedUrl) throw new Error('Impossible de générer le lien de téléchargement.');

  return signedData.signedUrl;
}

/**
 * Renvoie une URL signée fraîche pour un fichier déjà stocké.
 * Utile si l'URL stockée en base a expiré (> 7 jours).
 */
export async function refreshCollaborationFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('collaboration-files')
    .createSignedUrl(storagePath, 604800);
  if (error || !data?.signedUrl) throw new Error('Lien expiré et non renouvelable.');
  return data.signedUrl;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLABORATION OBJECTIVES — tableau de suivi
// ══════════════════════════════════════════════════════════════════════════════
export async function getCollaborationObjectives(collabId: string): Promise<DbCollaborationObjective[]> {
  const { data } = await supabase
    .from('collaboration_objectives').select('*')
    .eq('collaboration_id', collabId)
    .order('created_at', { ascending: true }).limit(30);
  return asRows<DbCollaborationObjective>(data);
}

export async function addCollaborationObjective(payload: {
  collaboration_id: string; title: string; description?: string;
}): Promise<void> {
  await supabase.from('collaboration_objectives').insert(payload);
}

export async function toggleObjectiveCompleted(id: string, is_completed: boolean): Promise<void> {
  await supabase.from('collaboration_objectives')
    .update({ is_completed, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteCollaborationObjective(id: string): Promise<void> {
  await supabase.from('collaboration_objectives').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════════════════════
// APP NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
export async function getNotifications(userId: string, limit = 20): Promise<DbAppNotification[]> {
  const { data } = await supabase
    .from('app_notifications').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit);
  return asRows<DbAppNotification>(data);
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('app_notifications').update({ is_read: true }).eq('id', id);
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('app_notifications').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('is_read', false);
  return count ?? 0;
}
