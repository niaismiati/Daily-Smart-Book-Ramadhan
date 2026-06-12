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

const STORAGE_KEY = 'smartbook_friday_prayers';

function getStored(): FridayPrayer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStored(list: FridayPrayer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw).id || 0;
  } catch {}
  return 0;
}

let nextId = 100;

export async function saveFridayPrayer(data: {
  date: string;
  khatib_name: string;
  sermon_topic_id?: number;
  summary: string;
  lesson?: string;
}): Promise<StoreResponse> {
  const userId = getCurrentUserId();
  const all = getStored();

  // Cek apakah sudah ada data untuk user + tanggal ini
  const existing = all.findIndex((p) => p.user_id === userId && p.date === data.date);
  if (existing >= 0) {
    // Update existing
    all[existing] = {
      ...all[existing],
      khatib_name: data.khatib_name,
      sermon_topic_id: data.sermon_topic_id ?? null,
      summary: data.summary,
      lesson: data.lesson || '',
    };
    saveStored(all);
    return { message: 'Data Shalat Jumat berhasil diupdate', friday_prayer: all[existing] };
  }

  const prayer: FridayPrayer = {
    id: ++nextId,
    user_id: userId,
    date: data.date,
    khatib_name: data.khatib_name,
    sermon_topic_id: data.sermon_topic_id ?? null,
    summary: data.summary,
    lesson: data.lesson || '',
    teacher_comment: null,
    teacher_score: null,
    is_graded: false,
  };
  all.push(prayer);
  saveStored(all);
  return { message: 'Data Shalat Jumat berhasil disimpan', friday_prayer: prayer };
}

export async function getFridayPrayer(date: string): Promise<ShowResponse> {
  const userId = getCurrentUserId();
  const all = getStored();
  const prayer = all.find((p) => p.user_id === userId && p.date === date) || null;
  return { friday_prayer: prayer };
}

export async function getAllFridayPrayers(): Promise<ListResponse> {
  const all = getStored();
  return { friday_prayers: all };
}

export async function gradeFridayPrayer(id: number, payload: { teacher_comment: string; teacher_score: number }) {
  const all = getStored();
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      teacher_comment: payload.teacher_comment,
      teacher_score: payload.teacher_score,
      is_graded: true,
    };
    saveStored(all);
    return { message: 'Nilai berhasil disimpan', friday_prayer: all[idx] };
  }
  throw new Error('Data tidak ditemukan');
}