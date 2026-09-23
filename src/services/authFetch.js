export const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) token = JSON.parse(stored).token;
    } catch (e) {
      // ignore
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export default authFetch;
