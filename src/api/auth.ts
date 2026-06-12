import apiClient from './client';
import type { AuthResponse, User } from '../types';

export async function login(
  credential: string,
  password: string,
  role: 'siswa' | 'guru'
): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      credential,
      password,
      role,
    });
    return data;
  } catch {
    // Fallback ke mock login jika server tidak tersedia
    return mockLogin(credential, password, role);
  }
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
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Mock credentials untuk development (backend belum jalan)
const MOCK_USERS = [
  { credential: '1234567890', password: 'siswa123', name: 'Ahmad Fauzan', role: 'siswa' as const, nisn: '1234567890', class: '9A' },
  { credential: '0987654321', password: 'siswa123', name: 'Fatimah Azzahra', role: 'siswa' as const, nisn: '0987654321', class: '9B' },
  { credential: '1122334455', password: 'siswa123', name: 'Muhammad Alif', role: 'siswa' as const, nisn: '1122334455', class: '9C' },
  { credential: '5566778899', password: 'siswa123', name: 'Siti Nurhaliza', role: 'siswa' as const, nisn: '5566778899', class: '9A' },
  { credential: '9988776655', password: 'siswa123', name: 'Aisyah Ramadhani', role: 'siswa' as const, nisn: '9988776655', class: '9A' },
  { credential: '5544332211', password: 'siswa123', name: 'Zaki Abdullah', role: 'siswa' as const, nisn: '5544332211', class: '9B' },
  { credential: '6677889900', password: 'siswa123', name: 'Nabila Putri', role: 'siswa' as const, nisn: '6677889900', class: '9A' },
  { credential: '4433221100', password: 'siswa123', name: 'Farhan Maulana', role: 'siswa' as const, nisn: '4433221100', class: '9C' },
  { credential: 'GT-001', password: 'guru123', name: 'Guru Pembimbing', role: 'guru' as const, nip: 'GT-001', email: 'guru@smartbook.sch.id' },
];

export async function updateProfile(data: { name?: string; email?: string; phone?: string; class?: string }): Promise<{ user: User; message: string }> {
  try {
    const res = await apiClient.put('/auth/profile', data);
    return res.data;
  } catch {
    const stored = getStoredUser();
    const updated = { ...stored, ...data } as User;
    localStorage.setItem('auth_user', JSON.stringify(updated));
    return { user: updated, message: 'Profil diperbarui (mode development)' };
  }
}

export async function changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<{ message: string }> {
  try {
    const res = await apiClient.put('/auth/password', data);
    return res.data;
  } catch {
    return { message: 'Password diubah (mode development)' };
  }
}

export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('photo', file);
  try {
    const res = await apiClient.post('/auth/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch {
    return { url: URL.createObjectURL(file) };
  }
}

function mockLogin(credential: string, password: string, role: 'siswa' | 'guru'): AuthResponse {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.credential === credential && u.password === password && u.role === role
      );
      if (user) {
        resolve({
          message: 'Login berhasil (mode development)',
          token: 'mock-token-' + Date.now(),
          user: {
            id: MOCK_USERS.indexOf(user) + 1,
            name: user.name,
            email: user.email ?? null,
            role: user.role,
            nisn: user.nisn ?? null,
            nip: user.nip ?? null,
            class: user.class ?? null,
            phone: null,
          },
        });
      } else {
        reject(new Error('NISN/NIP atau Password salah!'));
      }
    }, 500);
  });
}
