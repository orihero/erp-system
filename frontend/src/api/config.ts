import axios from 'axios';
import { store } from '@/store';
import { showNotification } from '@/store/slices/notificationSlice';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  // Add response type configuration for proper UTF-8 handling
  responseType: 'json',
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timestamp to prevent caching for module requests
    if (config.url?.includes('/api/modules')) {
      config.params = {
        ...(config.params as Record<string, unknown>),
        _t: new Date().getTime(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Show success notification for mutating requests
    const method = response.config.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method || "")) {
      store.dispatch(showNotification({
        message: 'Request executed successfully!',
        type: 'success',
      }));
    }
    return response;
  },
  (error) => {
    // Show error notification for mutating requests
    const method = error.config?.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method || "")) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
      store.dispatch(showNotification({
        message,
        type: 'error',
      }));
    }
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Let the saga handle the redirection
      return Promise.reject({
        ...error,
        isUnauthorized: true
      });
    }
    return Promise.reject(error);
  }
);

export default api; 