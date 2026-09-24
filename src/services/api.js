import axios from 'axios';

// Ensure all requests use same-origin relative URLs in the browser
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '';

  if (typeof window !== 'undefined') {
    // If accessed through web preview or HTTPS, avoid localhost/mixed-content blocks
    if (envUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
      return '';
    }
    if (window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
      return '';
    }
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (!token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          token = parsed.token;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if already on login/register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        console.warn('Unauthorized session. Please re-login.');
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
