import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '../../shared/stores/authStore';
import { apiClient } from '../../shared/api/client';

interface AuthContextType {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { token, login, logout, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient
        .get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={{ isLoading }}>{children}</AuthContext.Provider>;
}
