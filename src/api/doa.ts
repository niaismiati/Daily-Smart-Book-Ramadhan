import apiClient from './client';
import type { DoaMaterial, DoaTracking } from '../types';

interface DoaListResponse {
  materials: DoaMaterial[];
}

interface DoaResponse {
  message: string;
  material: DoaMaterial;
}

interface TrackingListResponse {
  trackings: Record<number, DoaTracking>;
}

interface TrackingResponse {
  message: string;
  tracking: DoaTracking;
}

function getCurrentUserId(): number {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw).id || 0; } catch {}
  return 0;
}

export async function getActiveDoa(): Promise<DoaListResponse> {
  const { data } = await apiClient.get('/doa', { params: { is_active: '1' } });
  return { materials: data.materials || [] };
}

export async function getAllDoa(): Promise<DoaListResponse> {
  const { data } = await apiClient.get('/doa');
  return { materials: data.materials || [] };
}

export async function createDoa(payload: {
  title: string; arabic_text: string; latin_text: string; translation: string;
  audio_url?: string; category: string;
}): Promise<DoaResponse> {
  const { data } = await apiClient.post('/doa', payload);
  return { message: data.message, material: data.material };
}

export async function updateDoa(id: number, payload: Partial<DoaMaterial>): Promise<DoaResponse> {
  const { data } = await apiClient.put(`/doa/${id}`, payload);
  return { message: data.message, material: data.material };
}

export async function deleteDoa(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/doa/${id}`);
  return { message: data.message };
}

export async function getDoaTrackings(): Promise<TrackingListResponse> {
  const userId = getCurrentUserId();
  const { data } = await apiClient.get(`/doa-trackings/${userId}`);
  return { trackings: data.trackings || {} };
}

export async function toggleDoaTracking(doaMaterialId: number, memorized: boolean): Promise<TrackingResponse> {
  const userId = getCurrentUserId();
  const { data } = await apiClient.post('/doa-trackings', {
    user_id: userId,
    doa_material_id: doaMaterialId,
    memorized,
  });
  return { message: data.message, tracking: data.tracking };
}
