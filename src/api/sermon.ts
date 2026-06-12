import apiClient from './client';
import type { SermonTopic } from '../types';

interface TopicListResponse {
  topics: SermonTopic[];
}

interface TopicResponse {
  message: string;
  topic: SermonTopic;
}

const MOCK_TOPICS: SermonTopic[] = [
  { id: 1, title: 'Keutamaan 10 Hari Pertama Ramadhan', description: 'Membahas tentang keutamaan sepuluh hari pertama Ramadhan.', is_active: true, created_by: 1, created_at: new Date().toISOString() },
  { id: 2, title: 'Puasa dan Pembentukan Karakter', description: 'Bagaimana puasa membentuk karakter muslim yang bertakwa.', is_active: true, created_by: 1, created_at: new Date().toISOString() },
  { id: 3, title: 'Malam Lailatul Qadar', description: 'Keutamaan malam Lailatul Qadar dan cara meraihnya.', is_active: true, created_by: 1, created_at: new Date().toISOString() },
  { id: 4, title: 'Zakat Fitrah dan Hikmahnya', description: 'Penjelasan tentang zakat fitrah dan hikmahnya.', is_active: true, created_by: 1, created_at: new Date().toISOString() },
];

export async function getActiveTopics(): Promise<TopicListResponse> {
  try {
    const { data } = await apiClient.get<TopicListResponse>('/sermon-topics/active');
    return data;
  } catch {
    return { topics: MOCK_TOPICS.filter((t) => t.is_active) };
  }
}

export async function getAllTopics(): Promise<TopicListResponse> {
  try {
    const { data } = await apiClient.get<TopicListResponse>('/teacher/sermon-topics');
    return data;
  } catch {
    return { topics: [...MOCK_TOPICS] };
  }
}

export async function createTopic(title: string, description?: string): Promise<TopicResponse> {
  try {
    const { data } = await apiClient.post<TopicResponse>('/teacher/sermon-topics', { title, description });
    return data;
  } catch {
    const newTopic: SermonTopic = {
      id: Date.now(),
      title,
      description: description || '',
      is_active: true,
      created_by: 1,
      created_at: new Date().toISOString(),
    };
    MOCK_TOPICS.push(newTopic);
    return { message: 'Materi khotbah berhasil ditambahkan (mode development)', topic: newTopic };
  }
}

export async function updateTopic(id: number, payload: Partial<SermonTopic>): Promise<TopicResponse> {
  try {
    const { data } = await apiClient.put<TopicResponse>(`/teacher/sermon-topics/${id}`, payload);
    return data;
  } catch {
    const idx = MOCK_TOPICS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      MOCK_TOPICS[idx] = { ...MOCK_TOPICS[idx], ...payload };
    }
    return { message: 'Diubah (mode development)', topic: MOCK_TOPICS[idx] || MOCK_TOPICS[0] };
  }
}

export async function deleteTopic(id: number): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.delete<{ message: string }>(`/teacher/sermon-topics/${id}`);
    return data;
  } catch {
    const idx = MOCK_TOPICS.findIndex((t) => t.id === id);
    if (idx !== -1) MOCK_TOPICS.splice(idx, 1);
    return { message: 'Dihapus (mode development)' };
  }
}
