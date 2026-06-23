import apiClient from './client';

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

function getCurrentUser(): { id: number; name: string; class: string } {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { id: 0, name: '', class: '' };
}

export const getMyJournals = async (): Promise<JournalListResponse> => {
  const user = getCurrentUser();
  const { data } = await apiClient.get(`/journals/${user.id}`);
  return data;
};

export const createJournal = async (data: { content: string; mood?: string; reflection?: string }): Promise<JournalResponse> => {
  const user = getCurrentUser();
  const res = await apiClient.post('/journals', {
    user_id: user.id,
    date: new Date().toISOString().slice(0, 10),
    content: data.content,
    mood: data.mood || 'neutral',
  });
  return res.data;
};

export const updateJournal = async (id: number, data: { content: string; mood?: string; reflection?: string }): Promise<JournalResponse> => {
  const res = await apiClient.put(`/journals/${id}`, {
    content: data.content,
    mood: data.mood,
  });
  return res.data;
};

export const deleteJournal = async (id: number): Promise<{ success: boolean }> => {
  await apiClient.delete(`/journals/${id}`);
  return { success: true };
};

export const getAllStudentsJournals = async (): Promise<{ students: any[] }> => {
  const { data } = await apiClient.get('/journals');
  return data;
};

export const getStudentJournals = async (studentId: number): Promise<JournalListResponse> => {
  const { data } = await apiClient.get(`/journals/${studentId}`);
  return data;
};
