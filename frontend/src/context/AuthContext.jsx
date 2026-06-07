import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get('auth/me/');
      setUser(res.data);
    } catch (err) {
      console.error("Session expirée ou invalide lors du démarrage", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('auth/login/', { username, password });
      const { access, refresh } = res.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Récupérer immédiatement le profil complet
      const meRes = await api.get('auth/me/');
      setUser(meRes.data);
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Identifiants incorrects.";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;
    try {
      const res = await api.post('auth/refresh/', { refresh });
      const { access } = res.data;
      localStorage.setItem('access_token', access);
      return access;
    } catch (err) {
      logout();
      return null;
    }
  };

  const getCurrentUser = () => user;

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
};
export default AuthContext;
