import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api, setAuthToken } from '../lib/api';

type Role = 'student' | 'instructor' | 'admin' | 'parent';

interface AuthState {
  token: string | null;
  role: Role | null;
  user?: { name: string; email: string } | null;
}

interface LoginPayload {
  email: string;
  password: string;
  role: Role;
  name?: string;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') return { token: null, role: null };
    const storedToken = window.localStorage.getItem('authToken');
    const storedRole = window.localStorage.getItem('authRole') as Role | null;
    const storedUser = window.localStorage.getItem('authUser');
    return {
      token: storedToken,
      role: storedRole,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  });

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  const login = useCallback(async ({ email, password, role, name }: LoginPayload) => {
    try {
      const result = await api.login(email, password);
      setState({
        token: result.token,
        role: result.role as Role,
        user: { email, name: name || email },
      });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authRole', result.role);
        window.localStorage.setItem('authUser', JSON.stringify({ email, name: name || email }));
      }
      setAuthToken(result.token);
    } catch (error: any) {
      // attempt registration then login
      await api.register({
        name: name || email,
        email,
        password,
        role,
      });
      const result = await api.login(email, password);
      setState({
        token: result.token,
        role: result.role as Role,
        user: { email, name: name || email },
      });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authRole', result.role);
        window.localStorage.setItem('authUser', JSON.stringify({ email, name: name || email }));
      }
      setAuthToken(result.token);
    }
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, role: null, user: null });
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authRole');
      window.localStorage.removeItem('authUser');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      role: state.role,
      user: state.user ?? null,
      isAuthenticated: Boolean(state.token),
      login,
      logout,
    }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};


