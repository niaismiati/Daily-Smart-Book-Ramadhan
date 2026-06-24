import axios from 'axios';

const resolveApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return '/api';
  }
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.trim()) {
    return raw.trim().replace(/\/+$/, ''); // hapus trailing slash saja
  }
  return '/api';
};

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Tambahkan token ke setiap request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response — auto-unwrap success() wrapper dari backend
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');

    // Jangan redirect kalau lagi proses login (401 = password salah)
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;