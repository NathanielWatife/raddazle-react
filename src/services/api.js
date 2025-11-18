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
      if (!requestPath.includes('/auth/me')) {
        console.error('Unauthorized access');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
