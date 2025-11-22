import axios from 'axios';

const raw = process.env.REACT_APP_API_URL;
let baseURL = '/api';
if (raw && typeof raw === 'string') {
  const trimmed = raw.replace(/\/$/, '');
  baseURL = /\/(api)(\/|$)/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestPath = error.config?.url || '';
      // Suppress noisy repeated 401 logs for the same endpoint within a short window
      if (!api._unauthorizedCache) api._unauthorizedCache = new Map();
      const now = Date.now();
      const key = requestPath;
      const cooldown = 10000; // 10 seconds
      const last = api._unauthorizedCache.get(key) || 0;
      if (now - last > cooldown) {
        api._unauthorizedCache.set(key, now);
        if (!requestPath.includes('/auth/me')) {
          console.error('Unauthorized access', requestPath);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
