const STORAGE_KEY = 'smartbook_journals';

interface StoredJournal {
  id: number;
  content: string;
  mood: string;
  reflection: string;
  created_at: string;
  user_id: number;
  user_name: string;
  user_class: string;
}

interface JournalListResponse {
  journals: StoredJournal[];
}

interface JournalResponse {
  journal: StoredJournal;
}

function getStored(): StoredJournal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStored(list: StoredJournal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getCurrentUser(): { id: number; name: string; class: string } {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { id: 0, name: '', class: '' };
}

let nextId = 50;

export const getMyJournals = async (): Promise<JournalListResponse> => {
  const user = getCurrentUser();
  const all = getStored();
  const mine = all
    .filter((j) => j.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { journals: mine };
};

export const createJournal = async (data: { content: string; mood?: string; reflection?: string }): Promise<JournalResponse> => {
  const user = getCurrentUser();
  const journal: StoredJournal = {
    id: ++nextId,
    content: data.content,
    mood: data.mood || 'neutral',
    reflection: data.reflection || '',
    created_at: new Date().toISOString(),
    user_id: user.id,
    user_name: user.name,
    user_class: user.class,
  };
  const all = getStored();
  all.push(journal);
  saveStored(all);
  return { journal };
};

export const updateJournal = async (id: number, data: { content: string; mood?: string; reflection?: string }): Promise<JournalResponse> => {
  const all = getStored();
  const idx = all.findIndex((j) => j.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
    saveStored(all);
    return { journal: all[idx] };
  }
  throw new Error('Jurnal tidak ditemukan');
};

export const deleteJournal = async (id: number): Promise<{ success: boolean }> => {
  const all = getStored();
  const idx = all.findIndex((j) => j.id === id);
  if (idx >= 0) {
    all.splice(idx, 1);
    saveStored(all);
  }
  return { success: true };
};

export const getAllStudentsJournals = async (): Promise<{ students: any[] }> => {
  const all = getStored();
  const map = new Map<number, { id: number; name: string; class: string; journals_count: number }>();
  for (const j of all) {
    if (!map.has(j.user_id)) {
      map.set(j.user_id, { id: j.user_id, name: j.user_name, class: j.user_class, journals_count: 0 });
    }
    map.get(j.user_id)!.journals_count++;
  }
  return { students: Array.from(map.values()) };
};

export const getStudentJournals = async (studentId: number): Promise<JournalListResponse> => {
  const all = getStored();
  const journals = all
    .filter((j) => j.user_id === studentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { journals };
};