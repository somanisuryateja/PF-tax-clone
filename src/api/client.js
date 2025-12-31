import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:3000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all storage on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.dispatchEvent(new Event('pf-force-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('pf-token', token);
  } else {
    localStorage.removeItem('pf-token');
  }
};

export const setEmployer = (employer) => {
  if (employer) {
    localStorage.setItem('pf-employer', JSON.stringify(employer));
  } else {
    localStorage.removeItem('pf-employer');
  }
};

export const getStoredEmployer = () => {
  const stored = localStorage.getItem('pf-employer');
  return stored ? JSON.parse(stored) : null;
};

