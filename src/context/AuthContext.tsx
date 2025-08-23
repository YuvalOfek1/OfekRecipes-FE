import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, AuthContextType } from '../types';
import { loginUser } from '../api/axios';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const responseInterceptorId = useRef<number | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session from localStorage without immediate validation; rely on 401 handling for invalid tokens
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setInitializing(false);
  }, []);

  // Attach/detach axios defaults & interceptors when token changes
  useEffect(() => {
    // Set or remove default Authorization header
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }

    // Eject previous interceptor if exists
    if (responseInterceptorId.current !== null) {
      axios.interceptors.response.eject(responseInterceptorId.current);
      responseInterceptorId.current = null;
    }

    // Install a single response interceptor to catch 401 / auth errors
    responseInterceptorId.current = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        if (error?.response?.status === 401) {
          if (localStorage.getItem('token')) {
            toast.error('Session expired. Please log in again.');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      if (responseInterceptorId.current !== null) {
        axios.interceptors.response.eject(responseInterceptorId.current);
        responseInterceptorId.current = null;
      }
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    if (!res?.token) throw new Error('Token missing in login response');
    const nextUser: User = { name: res.name, email: res.email };
    setToken(res.token);
    setUser(nextUser);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
