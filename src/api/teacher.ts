import apiClient from './client';
import type { TeacherDashboardStats, StudentRecap, FridayPrayer, DoaRecap, User } from '../types';

export async function getDashboardStats(): Promise<{ stats: TeacherDashboardStats }> {
  const { data } = await apiClient.get('/dashboard/teacher');
  const stats = data.stats || data;
  return { stats };
}

export async function getStudents(classFilter?: string): Promise<{ students: User[] }> {
  const params = classFilter ? { class: classFilter } : {};
  const { data } = await apiClient.get('/students', { params });
  const students = data.students || data.data || [];
  return { students: students.map((s: any) => ({
    id: s.id,
    name: s.name,
    nisn: s.nisn || null,
    class: s.class || null,
    role: 'siswa' as const,
    email: s.email || null,
    nip: null,
    phone: s.phone || null,
  })) };
}

export async function getPrayerRecap(classFilter?: string, _from?: string, _to?: string): Promise<{ recap: StudentRecap[] }> {
  const params = classFilter ? { class: classFilter } : {};
  const { data } = await apiClient.get('/reports/teacher', { params });
  const report = data.report || [];
  return { recap: report.map((r: any) => ({
    id: r.id,
    name: r.name,
    nisn: r.nisn || '',
    class: r.class || '',
    total_days: 0,
    prayer_percentage: r.prayer_percentage || 0,
    berjamaah_count: 0,
    subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0,
    friday_count: r.friday_count || 0,
    journal_count: r.journal_count || 0,
    quiz_count: r.quiz_count || 0,
    quiz_avg: r.quiz_avg || 0,
  })) };
}

export async function getFridayPrayers(_classFilter?: string, _from?: string, _to?: string): Promise<{ friday_prayers: FridayPrayer[] }> {
  const { data } = await apiClient.get('/friday-prayer');
  return { friday_prayers: data.friday_prayers || [] };
}

export async function gradeFridayPrayer(id: number, comment: string, score?: number): Promise<{ message: string; friday_prayer: FridayPrayer }> {
  const { data } = await apiClient.put(`/friday-prayer/${id}`, {
    teacher_comment: comment,
    teacher_score: score,
  });
  return { message: data.message, friday_prayer: data.friday_prayer };
}

export async function getDoaRecap(classFilter?: string): Promise<{ recap: DoaRecap[] }> {
  const studentsResult = await getStudents(classFilter);
  const students = studentsResult.students;
  const { data: reportData } = await apiClient.get('/reports/teacher', { params: classFilter ? { class: classFilter } : {} });
  const report = reportData.report || [];

  const recap: DoaRecap[] = students.map((s) => {
    const reportEntry = report.find((r: any) => r.id === s.id);
    return {
      id: s.id,
      name: s.name,
      class: s.class || '',
      total_doa: 0,
      tracked: 0,
      memorized: reportEntry?.total_doa_learned || 0,
      progress_percentage: 0,
    };
  });

  return { recap };
}

export async function getClasses(): Promise<{ classes: string[] }> {
  const { data } = await apiClient.get('/classes');
  return { classes: data.classes || [] };
}

export async function createUser(payload: {
  name: string; role: 'siswa' | 'guru'; nisn?: string; nip?: string;
  class?: string; email?: string; password: string;
}): Promise<{ message: string; user: User }> {
  const { data } = await apiClient.post('/students', payload);
  const u = data.student || data.user;
  return { message: data.message, user: u };
}

export async function updateUser(id: number, payload: Partial<User> & { password?: string }): Promise<{ message: string; user: User }> {
  const { data } = await apiClient.put(`/users/${id}`, payload);
  return { message: data.message, user: data.user };
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/students/${id}`);
  return { message: data.message };
}
