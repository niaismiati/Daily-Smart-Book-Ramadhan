import axios from 'axios';

const resolveApiBaseUrl = () => {
  // Di Vercel production, API ada di domain yang sama (relative URL)
  if (import.meta.env.PROD) {
    return '/api';
  }
  // Di development, gunakan VITE_API_URL atau fallback ke localhost dengan proxy Vite
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const fallback = '/api'; // Vite proxy akan handle ini
  const base = (raw && raw.trim()) ? raw.trim() : fallback;
  // Pastikan base URL selalu mengandung '/api'
  return base.endsWith('/api') ? base : base.endsWith('/api/') ? base.slice(0, -1) : (base.includes('/api') ? base : `${base}/api`);
};

const API_BASE_URL = resolveApiBaseUrl();


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;