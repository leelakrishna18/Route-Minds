import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apsrtc_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.email === 'passenger@example.com') {
        localStorage.removeItem('apsrtc_user');
        localStorage.removeItem('apsrtc_token');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('apsrtc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('apsrtc_token', newToken);
    localStorage.setItem('apsrtc_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('apsrtc_token');
    localStorage.removeItem('apsrtc_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get<User>('/auth/me');
      setUser(data);
      localStorage.setItem('apsrtc_user', JSON.stringify(data));
    } catch (err: any) {
      // ONLY logout if token is explicitly invalid or expired (401 with INVALID_TOKEN or TOKEN_EXPIRED)
      if (err?.status === 401 && (err?.errorCode === 'INVALID_TOKEN' || err?.errorCode === 'TOKEN_EXPIRED')) {
        console.warn('Authentication token expired or rejected by server.');
        logout();
      } else {
        // Retain saved session on transient cold-starts or network blips
        console.info('Using locally stored authenticated session.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        refreshUser
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
