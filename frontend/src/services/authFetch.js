const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export const getAuthToken = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user?.token || '';
  } catch (error) {
    console.error('Unable to read authentication token:', error);
    return '';
  }
};

export const authFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;

  return fetch(url, {
    ...options,
    headers,
  });
};

export default authFetch;
