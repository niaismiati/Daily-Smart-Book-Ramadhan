import apiClient from './client';

function getCurrentUserId(): number {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw).id || 0; } catch {}
  return 0;
}

export async function getMyReport() {
  const userId = getCurrentUserId();
  const { data } = await apiClient.get(`/reports/student/${userId}`);
  return data;
}

export async function getStudentReport(studentId: number) {
  const { data } = await apiClient.get(`/reports/student/${studentId}`);
  return data;
}

export async function getClassReport(className?: string) {
  const params = className ? { class: className } : {};
  const { data } = await apiClient.get('/reports/teacher', { params });
  return data;
}

export async function exportReport(_type: string, _id?: number): Promise<Blob> {
  const { data } = await apiClient.get('/reports/export', { responseType: 'json' });
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export async function exportMyReportPdf(): Promise<Blob> {
  const userId = getCurrentUserId();
  const { data } = await apiClient.get('/reports/export', { params: { userId }, responseType: 'json' });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return blob;
}

export async function getClassReportOld(_classId?: number, _from?: string, _to?: string) {
  const { data } = await apiClient.get('/reports/teacher');
  return data;
}
