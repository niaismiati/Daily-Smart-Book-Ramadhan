import apiClient from './client';
import type { FridayPrayer } from '../types';

interface StoreResponse {
  message: string;
  friday_prayer: FridayPrayer;
}

interface ShowResponse {
  friday_prayer: FridayPrayer | null;
}

interface ListResponse {
  friday_prayers: FridayPrayer[];
}

function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw).id || 0;
  } catch {}
  return 0;
}

export async function saveFridayPrayer(data: {
  date: string;
  khatib_name: string;
  sermon_topic_id?: number;
  summary: string;
  lesson?: string;
}): Promise<StoreResponse> {
  const userId = getCurrentUserId();
  const res = await apiClient.post('/friday-prayer', {
    user_id: userId,
    date: data.date,
    khatib_name: data.khatib_name,
    sermon_topic_id: data.sermon_topic_id,
    summary: data.summary,
    lesson: data.lesson || '',
  });
  return { message: res.data.message, friday_prayer: res.data.friday_prayer };
}

export async function getFridayPrayer(date: string): Promise<ShowResponse> {
  const userId = getCurrentUserId();
  const { data } = await apiClient.get('/friday-prayer', { params: { userId, date } });
  return { friday_prayer: data.friday_prayer || null };
}

export async function getAllFridayPrayers(): Promise<ListResponse> {
  const { data } = await apiClient.get('/friday-prayer');
  return { friday_prayers: data.friday_prayers || [] };
}

export async function gradeFridayPrayer(id: number, payload: { teacher_comment: string; teacher_score: number }) {
  const { data } = await apiClient.put(`/friday-prayer/${id}`, payload);
  return { message: data.message, friday_prayer: data.friday_prayer };
}
