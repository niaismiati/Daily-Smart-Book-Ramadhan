import apiClient from './client';

function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw).id || 0;
  } catch {}
  return 0;
}

export const getStudentDashboard = async () => {
  const userId = getCurrentUserId();
  const { data } = await apiClient.get(`/dashboard/student/${userId}`);
  return data;
};

export const getTeacherDashboard = async () => {
  const { data } = await apiClient.get('/dashboard/teacher');
  return data;
};
