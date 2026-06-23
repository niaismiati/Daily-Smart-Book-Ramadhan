import apiClient from './client';

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

function getCurrentUserId(): number {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw).id || 0; } catch {}
  return 0;
}

export async function getQuizzes(): Promise<{ data: Quiz[] }> {
  const { data } = await apiClient.get('/quizzes');
  return { data: data.quizzes || data.data || [] };
}

export async function getActiveQuizzes(): Promise<Quiz[]> {
  const { data } = await apiClient.get('/quizzes');
  const quizzes = data.quizzes || data.data || [];
  return quizzes.filter((q: Quiz) => q.is_active);
}

export async function getQuiz(id: number): Promise<{ quiz: Quiz & { questions: Question[] } }> {
  const { data } = await apiClient.get(`/quizzes/${id}/questions`);
  return { quiz: data.quiz ?? data };
}

export async function createQuiz(data: { title: string; description?: string; time_limit?: number; passing_score?: number }): Promise<{ message: string; quiz: Quiz }> {
  const res = await apiClient.post('/quizzes', data);
  return res.data;
}

export async function updateQuiz(id: number, data: Partial<Quiz>): Promise<{ message: string; quiz: Quiz }> {
  const res = await apiClient.put(`/quizzes/${id}`, data);
  return res.data;
}

export async function deleteQuiz(id: number): Promise<{ message: string }> {
  const res = await apiClient.delete(`/quizzes/${id}`);
  return res.data;
}

export async function addQuestion(quizId: number, data: {
  question_text: string; points?: number;
  answers: { answer_text: string; is_correct: boolean }[];
}): Promise<{ message: string; question: Question }> {
  const res = await apiClient.post(`/quizzes/${quizId}/questions`, data);
  return res.data;
}

export async function updateQuestion(questionId: number, data: {
  question_text: string; points?: number;
  answers: { id?: number; answer_text: string; is_correct: boolean }[];
}): Promise<{ message: string; question: Question }> {
  const res = await apiClient.put(`/questions/${questionId}`, data);
  return res.data;
}

export async function deleteQuestion(questionId: number): Promise<{ message: string }> {
  const res = await apiClient.delete(`/questions/${questionId}`);
  return res.data;
}

export async function getQuizResults(quizId: number): Promise<{ results: QuizResult[] }> {
  const { data } = await apiClient.get(`/quizzes/${quizId}/results`);
  return { results: data.results || data.data || [] };
}

export async function startQuiz(quizId: number): Promise<{
  quiz: { id: number; title: string; time_limit: number; questions_count: number; total_points: number };
  questions: { id: number; question_text: string; points: number; answers: { id: number; answer_text: string }[] }[];
}> {
  const { data } = await apiClient.post(`/quizzes/${quizId}/start`);
  return data;
}

export async function submitQuiz(quizId: number, data: {
  answers: { question_id: number; answer_id: number }[];
  time_taken: number;
}): Promise<{ message: string; result: QuizResult; passed: boolean }> {
  const userId = getCurrentUserId();
  const { data: res } = await apiClient.post(`/quizzes/${quizId}/submit`, {
    user_id: userId,
    answers: data.answers,
    time_taken: data.time_taken,
  });
  return { message: res.message || 'Berhasil', result: res.result, passed: res.passed };
}

export async function getQuizHistory(): Promise<{ data: QuizResult[] }> {
  const userId = getCurrentUserId();
  const { data: res } = await apiClient.get(`/quizzes/history/${userId}`);
  return { data: res.results || res.data || [] };
}
