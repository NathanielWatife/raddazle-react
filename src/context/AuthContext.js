import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authCheckInProgress = useRef(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        return null;
      }
      throw error;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (authCheckInProgress.current) {
      return; // Skip if already checking
    }
    authCheckInProgress.current = true;
    try {
      await fetchCurrentUser();
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
      authCheckInProgress.current = false;
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    checkAuth();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = async () => fetchCurrentUser();

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    // Do not set user on signup yet; require email verification first
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
