import { createContext, useContext, useMemo, useState } from 'react';
import { apiClient, getStoredEmployer, setAuthToken, setEmployer } from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => localStorage.getItem('pf-token') ?? '');
  const [employer, setEmployerState] = useState(() => getStoredEmployer());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token: newToken, employer: employerData } = response.data;
      setAuthToken(newToken);
      setEmployer(employerData);
      setTokenState(newToken);
      setEmployerState(employerData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to login. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔴 [AUTH CONTEXT] logout() called');
    console.log('🔴 [AUTH CONTEXT] Clearing token state...');
    setAuthToken('');
    console.log('🔴 [AUTH CONTEXT] Clearing employer state...');
    setEmployer(null);
    console.log('🔴 [AUTH CONTEXT] Clearing token state variable...');
    setTokenState('');
    console.log('🔴 [AUTH CONTEXT] Clearing employer state variable...');
    setEmployerState(null);
    console.log('🔴 [AUTH CONTEXT] logout() completed');
  };

  const value = useMemo(
    () => ({
      token,
      employer,
      authenticated: Boolean(token),
      loading,
      error,
      login,
      logout,
      setError,
    }),
    [token, employer, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

