
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

// Mock user data for development
const MOCK_USERS: Record<string, User> = {
  'admin@kovi.com.br': {
    id: '1',
    name: 'Admin Kovi',
    email: 'admin@kovi.com.br',
    role: 'admin',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(),
  },
  'member@kovi.com.br': {
    id: '2',
    name: 'Membro Kovi',
    email: 'member@kovi.com.br',
    role: 'member',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(),
  },
  'partner@example.com': {
    id: '3',
    name: 'Parceiro Exemplo',
    email: 'partner@example.com',
    role: 'partner',
    company: 'Empresa Parceira',
    isActive: true,
    createdAt: new Date(),
  },
  'driver@example.com': {
    id: '4',
    name: 'Motorista Exemplo',
    email: 'driver@example.com',
    role: 'driver',
    company: 'Empresa Parceira',
    isActive: true,
    createdAt: new Date(),
  }
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  resetPassword: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('kovi_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUser = MOCK_USERS[email.toLowerCase()];
      
      if (!mockUser) {
        throw new Error('Usuário não encontrado');
      }
      
      // In a real app, this would verify the password
      if (password !== '123456') {
        throw new Error('Senha incorreta');
      }
      
      setUser(mockUser);
      localStorage.setItem('kovi_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll just log in as a member
      const googleUser = MOCK_USERS['member@kovi.com.br'];
      
      setUser(googleUser);
      localStorage.setItem('kovi_user', JSON.stringify(googleUser));
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kovi_user');
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists
      if (!MOCK_USERS[email.toLowerCase()]) {
        throw new Error('E-mail não encontrado');
      }
      
      // In a real app, this would trigger a password reset email
      console.log(`Password reset requested for: ${email}`);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
