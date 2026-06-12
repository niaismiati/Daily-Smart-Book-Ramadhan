interface Quiz {
  id: number; title: string; description?: string; time_limit: number;
  passing_score: number; is_active: boolean; created_by: number;
  creator?: { id: number; name: string }; questions_count?: number;
  created_at: string;
}

interface Question {
  id: number; quiz_id: number; question_text: string; points: number;
  answers: { id: number; answer_text: string; is_correct: boolean }[];
}

interface QuizResult {
  id: number; user_id: number; quiz_id: number; score: number;
  total_questions: number; correct_answers: number; time_taken?: number;
  answers_data?: unknown; passed?: boolean;
  user?: { id: number; name: string; nisn?: string; class?: string };
  quiz?: { id: number; title: string; passing_score: number };
  created_at: string;
}

// Storage keys
const QUIZZES_KEY = 'smartbook_quizzes';
const QUESTIONS_KEY = 'smartbook_quiz_questions';
const RESULTS_KEY = 'smartbook_quiz_results';

function getLocal<T>(key: string, def: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : def; }
  catch { return def; }
}
function setLocal(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function getCurrentUserId(): number {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw).id || 0; } catch {}
  return 0;
}

function getCurrentUserInfo(): { id: number; name: string; class?: string; nisn?: string } {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw); } catch {}
  return { id: 0, name: '' };
}

const DEFAULT_QUIZZES: Quiz[] = [
  { id: 1, title: 'Quiz Puasa Ramadhan', description: 'Quiz tentang puasa Ramadhan', time_limit: 15, passing_score: 70, is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, questions_count: 3, created_at: new Date().toISOString() },
  { id: 2, title: 'Quiz Shalat', description: 'Quiz tentang shalat wajib', time_limit: 10, passing_score: 60, is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, questions_count: 2, created_at: new Date(Date.now() - 86400000).toISOString() },
];

const DEFAULT_QUESTIONS: Record<number, Question[]> = {
  1: [
    { id: 1, quiz_id: 1, question_text: 'Puasa Ramadhan hukumnya...', points: 1, answers: [{ id: 1, answer_text: 'Sunnah', is_correct: false }, { id: 2, answer_text: 'Wajib', is_correct: true }, { id: 3, answer_text: 'Mubah', is_correct: false }, { id: 4, answer_text: 'Makruh', is_correct: false }] },
    { id: 2, quiz_id: 1, question_text: 'Berapa jumlah hari puasa Ramadhan?', points: 1, answers: [{ id: 5, answer_text: '28 hari', is_correct: false }, { id: 6, answer_text: '29 hari', is_correct: false }, { id: 7, answer_text: '30 hari', is_correct: true }, { id: 8, answer_text: '31 hari', is_correct: false }] },
    { id: 3, quiz_id: 1, question_text: 'Orang yang tidak mampu berpuasa karena sakit menahun, wajib...', points: 1, answers: [{ id: 9, answer_text: 'Mengganti puasa', is_correct: false }, { id: 10, answer_text: 'Membayar fidyah', is_correct: true }, { id: 11, answer_text: 'Tidak perlu apa-apa', is_correct: false }, { id: 12, answer_text: 'Bersedekah', is_correct: false }] },
  ],
  2: [
    { id: 4, quiz_id: 2, question_text: 'Shalat wajib sehari semalam berjumlah...', points: 1, answers: [{ id: 13, answer_text: '4 waktu', is_correct: false }, { id: 14, answer_text: '5 waktu', is_correct: true }, { id: 15, answer_text: '6 waktu', is_correct: false }, { id: 16, answer_text: '7 waktu', is_correct: false }] },
    { id: 5, quiz_id: 2, question_text: 'Shalat apakah yang jumlah rakaatnya 3?', points: 1, answers: [{ id: 17, answer_text: 'Subuh', is_correct: false }, { id: 18, answer_text: 'Maghrib', is_correct: true }, { id: 19, answer_text: 'Isya', is_correct: false }, { id: 20, answer_text: 'Dzuhur', is_correct: false }] },
  ],
};

function getAllQuizzes(): Quiz[] {
  const stored = getLocal<Quiz[]>(QUIZZES_KEY, []);
  const merged = [...DEFAULT_QUIZZES];
  for (const s of stored) {
    const idx = merged.findIndex((q) => q.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  return merged;
}

function getQuestionsForQuiz(quizId: number): Question[] {
  const stored = getLocal<Record<number, Question[]>>(QUESTIONS_KEY, {});
  const defaultQs = DEFAULT_QUESTIONS[quizId] || [];
  const storedQs = stored[quizId] || [];
  const merged = [...defaultQs];
  for (const s of storedQs) {
    const idx = merged.findIndex((q) => q.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  return merged;
}

function saveQuestionsForQuiz(quizId: number, questions: Question[]) {
  const stored = getLocal<Record<number, Question[]>>(QUESTIONS_KEY, {});
  stored[quizId] = questions;
  setLocal(QUESTIONS_KEY, stored);
}

function getResults(): QuizResult[] {
  return getLocal<QuizResult[]>(RESULTS_KEY, []);
}

function saveResults(results: QuizResult[]) {
  setLocal(RESULTS_KEY, results);
}

let nextId = 100;

export async function getQuizzes(): Promise<{ data: Quiz[] }> {
  return { data: getAllQuizzes() };
}

export async function getActiveQuizzes(): Promise<Quiz[]> {
  return getAllQuizzes().filter((q) => q.is_active);
}

export async function getQuiz(id: number): Promise<{ quiz: Quiz & { questions: Question[] } }> {
  const quiz = getAllQuizzes().find((q) => q.id === id);
  const questions = getQuestionsForQuiz(id);
  return { quiz: { ...quiz!, questions } };
}

export async function createQuiz(data: { title: string; description?: string; time_limit?: number; passing_score?: number }): Promise<{ message: string; quiz: Quiz }> {
  const quizzes = getLocal<Quiz[]>(QUIZZES_KEY, []);
  const quiz: Quiz = { id: ++nextId, ...data, time_limit: data.time_limit || 0, passing_score: data.passing_score || 70, is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, questions_count: 0, created_at: new Date().toISOString() };
  quizzes.push(quiz);
  setLocal(QUIZZES_KEY, quizzes);
  return { message: 'Quiz berhasil dibuat', quiz };
}

export async function updateQuiz(id: number, data: Partial<Quiz>): Promise<{ message: string; quiz: Quiz }> {
  const quizzes = getLocal<Quiz[]>(QUIZZES_KEY, []);
  const idx = quizzes.findIndex((q) => q.id === id);
  if (idx < 0) throw new Error('Quiz tidak ditemukan');
  quizzes[idx] = { ...quizzes[idx], ...data };
  setLocal(QUIZZES_KEY, quizzes);
  return { message: 'Quiz berhasil diubah', quiz: quizzes[idx] };
}

export async function deleteQuiz(id: number): Promise<{ message: string }> {
  const quizzes = getLocal<Quiz[]>(QUIZZES_KEY, []);
  const idx = quizzes.findIndex((q) => q.id === id);
  if (idx >= 0) { quizzes.splice(idx, 1); setLocal(QUIZZES_KEY, quizzes); }
  return { message: 'Quiz berhasil dihapus' };
}

export async function addQuestion(quizId: number, data: {
  question_text: string; points?: number;
  answers: { answer_text: string; is_correct: boolean }[];
}): Promise<{ message: string; question: Question }> {
  const questions = getQuestionsForQuiz(quizId);
  const question: Question = { id: ++nextId, quiz_id: quizId, question_text: data.question_text, points: data.points || 1, answers: data.answers.map((a, i) => ({ id: ++nextId, ...a })) };
  questions.push(question);
  saveQuestionsForQuiz(quizId, questions);
  // Update questions_count
  const quizzes = getLocal<Quiz[]>(QUIZZES_KEY, []);
  const qi = quizzes.findIndex((q) => q.id === quizId);
  if (qi >= 0) { quizzes[qi].questions_count = (quizzes[qi].questions_count || 0) + 1; setLocal(QUIZZES_KEY, quizzes); }
  return { message: 'Soal ditambahkan', question };
}

export async function updateQuestion(questionId: number, data: {
  question_text: string; points?: number;
  answers: { id?: number; answer_text: string; is_correct: boolean }[];
}): Promise<{ message: string; question: Question }> {
  return { message: 'Soal diubah', question: { id: questionId, quiz_id: 0, question_text: data.question_text, points: data.points || 1, answers: data.answers.map((a, i) => ({ id: a.id || ++nextId, ...a })) } };
}

export async function deleteQuestion(questionId: number): Promise<{ message: string }> {
  return { message: 'Soal dihapus' };
}

export async function getQuizResults(quizId: number): Promise<{ results: QuizResult[] }> {
  const results = getResults().filter((r) => r.quiz_id === quizId);
  return { results };
}

export async function startQuiz(quizId: number): Promise<{
  quiz: { id: number; title: string; time_limit: number; questions_count: number; total_points: number };
  questions: { id: number; question_text: string; points: number; answers: { id: number; answer_text: string }[] }[];
}> {
  const quiz = getAllQuizzes().find((q) => q.id === quizId);
  const questions = getQuestionsForQuiz(quizId).map((q) => ({
    id: q.id, question_text: q.question_text, points: q.points,
    answers: q.answers.map((a) => ({ id: a.id, answer_text: a.answer_text })),
  }));
  return { quiz: { id: quizId, title: quiz?.title || '', time_limit: quiz?.time_limit || 0, questions_count: questions.length, total_points: questions.reduce((s, q) => s + q.points, 0) }, questions };
}

export async function submitQuiz(quizId: number, data: {
  answers: { question_id: number; answer_id: number }[];
  time_taken: number;
}): Promise<{ message: string; result: QuizResult; passed: boolean }> {
  const questions = getQuestionsForQuiz(quizId);
  const quiz = getAllQuizzes().find((q) => q.id === quizId);
  let correct = 0;
  for (const a of data.answers) {
    const q = questions.find((q) => q.id === a.question_id);
    if (q) { const correctAns = q.answers.find((ans) => ans.is_correct); if (correctAns?.id === a.answer_id) correct++; }
  }
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const user = getCurrentUserInfo();
  const result: QuizResult = {
    id: ++nextId,
    user_id: user.id,
    quiz_id: quizId,
    score,
    total_questions: total,
    correct_answers: correct,
    time_taken: data.time_taken,
    passed: score >= (quiz?.passing_score || 70),
    answers_data: data.answers,
    user: { id: user.id, name: user.name, nisn: user.nisn, class: user.class },
    quiz: quiz ? { id: quiz.id, title: quiz.title, passing_score: quiz.passing_score } : undefined,
    created_at: new Date().toISOString(),
  };
  const results = getResults();
  results.push(result);
  saveResults(results);
  return { message: 'Quiz selesai!', result, passed: result.passed || false };
}

export async function getQuizHistory(): Promise<{ data: QuizResult[] }> {
  const userId = getCurrentUserId();
  const results = getResults().filter((r) => r.user_id === userId);
  return { data: results };
}