import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'contributor' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isContributor: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { user: u, token } = await api.login(username, password);
    localStorage.setItem('token', token);
    setUser(u);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const { user: u, token } = await api.register(username, password);
    localStorage.setItem('token', token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isContributor: user?.role === 'admin' || user?.role === 'contributor',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
