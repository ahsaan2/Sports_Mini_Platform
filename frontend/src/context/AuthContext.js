import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data from backend to ensure up-to-date profile
      if (!user) {
        (async () => {
          try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } catch (err) {
            // If unauthorized or server down, clear token and user
            if (err.response && err.response.status === 401) {
              setToken(null);
              setUser(null);
            }
          } finally {
            setLoading(false);
          }
        })();
        return; // avoid setting loading=false twice
      }
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // also clear saved user when token removed
      localStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  }, [token, user]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

