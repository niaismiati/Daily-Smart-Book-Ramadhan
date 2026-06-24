import apiClient from './client';
import type { AuthResponse, User } from '../types';

export async function login(
  credential: string,
  password: string,
  role: 'siswa' | 'guru'
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', {
    credential,
    password,
    role,
  });
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // ignore
  }
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await apiClient.get<{ user: User }>('/auth/me');
  return data;
}

export function saveAuth(token: string, user: User): void {
  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    // ignore
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}


export async function updateProfile(userId: number, data: { name?: string; email?: string; phone?: string; class?: string }): Promise<{ user: User; message: string }> {
  const res = await apiClient.put(`/profile/${userId}`, data);
  // backend sekarang mengembalikan { success, data: { user, message } }
  const payload = res.data;
  const u = payload.data?.user ?? payload.data?.profile ?? payload.user ?? payload;
  return { user: u as User, message: payload.data?.message ?? 'Profil diperbarui' };
}

export async function changePassword(userId: number, data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<{ message: string }> {
  const res = await apiClient.put(`/profile/${userId}/password`, data);
  const payload = res.data;
  return { message: payload.data?.message ?? payload.message };
}

export async function uploadPhoto(userId: number, file: File): Promise<{ url: string; message?: string }> {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await apiClient.put(`/profile/${userId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const payload = res.data;
  return { url: payload.url, message: payload.message };
}


