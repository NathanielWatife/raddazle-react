import axios from 'axios';

const raw = process.env.REACT_APP_API_URL;
let baseURL = '/api';
let apiBaseUrl = ''; // The base URL without /api for static files

if (raw && typeof raw === 'string') {
  const trimmed = raw.replace(/\/$/, '');
  baseURL = /\/(api)(\/|$)/.test(trimmed) ? trimmed : `${trimmed}/api`;
  // Extract base URL without /api for static files like /uploads
  apiBaseUrl = trimmed.replace(/\/api$/, '');
}

// Placeholder image path
const PLACEHOLDER_IMAGE = '/img/product-placeholder.jpg';

// Helper to get the correct image URL
export const getImageUrl = (imagePath) => {
  // Return placeholder for empty/null/undefined
  if (!imagePath || imagePath === '' || imagePath === 'null' || imagePath === 'undefined') {
    return PLACEHOLDER_IMAGE;
  }
  
  // If it's already a full URL (http/https), return as-is
  // This handles Cloudinary URLs, external image URLs, and any other valid URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path like /uploads/..., prepend the API base URL
  if (imagePath.startsWith('/uploads')) {
    // If we have an API base URL, construct the full URL
    if (apiBaseUrl) {
      return `${apiBaseUrl}${imagePath}`;
    }
    // Fallback: return as relative path (works if same origin)
    return imagePath;
  }
  
  // Otherwise return as-is (might be a local public path like /img/...)
  return imagePath;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper functions to manage auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Request interceptor - add token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
