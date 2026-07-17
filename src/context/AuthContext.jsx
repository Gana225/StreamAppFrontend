import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile context on mount if an access token is available
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me/'); // Endpoint matching user profile schema
          setUser(res.data);
        } catch (err) {
          console.error('Initialization profile parse failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  // src/context/AuthContext.jsx

const logout = async () => {
  try {
   
    await api.post('/auth/logout/');
  } catch (err) {
    console.error("Backend sign-out sync failed:", err);
  } finally {
   
    localStorage.removeItem('access_token');
    setUser(null);
  }
};

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);