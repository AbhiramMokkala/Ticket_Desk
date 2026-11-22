import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ticketdesk_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ticketdesk_token');
      const savedUser = localStorage.getItem('ticketdesk_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch {
          localStorage.removeItem('ticketdesk_token');
          localStorage.removeItem('ticketdesk_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      const userData: User = {
        userId: res.userId,
        id: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      };

      localStorage.setItem('ticketdesk_token', res.token);
      localStorage.setItem('ticketdesk_user', JSON.stringify(userData));
      setToken(res.token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, pass);
      const userData: User = {
        userId: res.userId,
        id: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      };

      localStorage.setItem('ticketdesk_token', res.token);
      localStorage.setItem('ticketdesk_user', JSON.stringify(userData));
      setToken(res.token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ticketdesk_token');
    localStorage.removeItem('ticketdesk_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
