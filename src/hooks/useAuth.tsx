import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  fullName: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface BackendUserSummary {
  id: string;
  username: string;
  fullName: string;
  createdAt: string;
  lastLoginAt: string;
  isStoredInBackend: boolean;
}

export interface BackendStatus {
  status: string;
  serverTime: string;
  storageType: string;
  databasePath: string;
  userCount: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  storedUsers: BackendUserSummary[];
  backendStatus: BackendStatus | null;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'madrasmacha_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [storedUsers, setStoredUsers] = useState<BackendUserSummary[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  // Fetch registered users and backend database status
  const refreshUsers = useCallback(async () => {
    try {
      const [usersRes, statusRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/backend-status'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStoredUsers(usersData.users || []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setBackendStatus(statusData);
      }
    } catch (err) {
      console.warn('[useAuth] Could not fetch backend users / status:', err);
    }
  }, []);

  // Check existing session token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        refreshUsers();
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[useAuth] Session check failed:', err);
      } finally {
        setIsLoading(false);
        refreshUsers();
      }
    };

    verifyToken();
  }, [refreshUsers]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('[useAuth] Logout error:', err);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    await refreshUsers();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        storedUsers,
        backendStatus,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
