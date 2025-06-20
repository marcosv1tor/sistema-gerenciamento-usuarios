import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData, UpdateUserData } from '@/types';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          apiService.setAuthToken(storedToken);

          // Verify token is still valid by fetching profile
          try {
            const profile = await apiService.getProfile();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (error) {
            // Token is invalid, clear auth state
            logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('=== INÍCIO DO LOGIN ==>');
      console.log('Credenciais:', credentials);
      console.log('URL da API:', process.env.REACT_APP_API_URL);
      
      const response = await apiService.login(credentials);
      console.log('valor de response -> ', response);
      
      const { access_token, user: userData } = response;
      
      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      apiService.setAuthToken(access_token);
      
      toast.success(`Bem-vindo, ${userData.name}!`);
      console.log('=== LOGIN SUCESSO ==>');
    } catch (error: any) {
      console.error('=== ERRO NO LOGIN ==>');
      console.error('Erro completo:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Config:', error.config);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      
      const { access_token, user: userData } = response;
      
      setToken(access_token);
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth token for future requests
      apiService.setAuthToken(access_token);
      
      toast.success(`Conta criada com sucesso! Bem-vindo, ${userData.name}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from API service
    apiService.removeAuthToken();
    
    toast.success('Logout realizado com sucesso!');
  };

  const updateProfile = async (data: UpdateUserData): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateProfile(data);
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated,
    googleLogin: async (credential: string) => {
      try {
        setIsLoading(true);
        console.log('=== INÍCIO DO GOOGLE LOGIN ==>');
        console.log('Credential:', credential);
        
        const response = await apiService.googleLogin(credential);
        console.log('Google login response:', response);
        
        const { access_token, user: userData } = response;
        
        setToken(access_token);
        setUser(userData);
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        apiService.setAuthToken(access_token);
        
        toast.success(`Bem-vindo, ${userData.name}!`);
        console.log('=== GOOGLE LOGIN SUCESSO ==>');
      } catch (error: any) {
        console.error('=== ERRO NO GOOGLE LOGIN ==>');
        console.error('Erro completo:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        
        const message = error.response?.data?.message || 'Erro ao fazer login com Google';
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;