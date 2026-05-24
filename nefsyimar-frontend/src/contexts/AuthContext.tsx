'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { User, Wallet } from '@/types/api.types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  setAuthenticatedUser: (user: User, wallet: Wallet) => void;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  region?: string;
  role?: User['role'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking authentication status...');
      
      const response = await authApi.getAuthStatus();
      
      if (response.data.success && response.data.authenticated && response.data.data) {
        setUser(response.data.data.user);
        setWallet(response.data.data.wallet || response.data.data.user.wallet);
        console.log('✅ User authenticated successfully');
      } else {
        console.log('User not authenticated');
        setUser(null);
        setWallet(null);
      }
    } catch (error: any) {
      // Error checking auth status
      console.log('Error checking auth status:', error.message);
      setUser(null);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      if (response.data.success && response.data.data) {
        const apiUser = response.data.data.user;
        const apiWallet = response.data.data.wallet || (apiUser as any).wallet;

        setUser(apiUser);
        setWallet(apiWallet || null);
        
        // Store JWT token if provided
        if (response.data.data.token) {
          localStorage.setItem('nefsyimar_token', response.data.data.token);
        }
        
        toast.success('Welcome back! 🕊️');
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting registration with data:', { ...data, password: '[HIDDEN]' });
      
      const response = await authApi.register(data);
      console.log('📡 Registration response:', response.data);
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
        setWallet(response.data.data.wallet);
        
        // Store JWT token if provided
        if (response.data.data.token) {
          localStorage.setItem('nefsyimar_token', response.data.data.token);
          console.log('🔑 JWT token stored');
        }
        
        toast.success('Welcome to Nefsyimar! 🕊️ Please check your email to verify your account.');
        return true;
      } else {
        console.error('❌ Registration failed:', response.data.message);
        toast.error(response.data.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err: any) => err.message).join(', ');
        toast.error(`Validation Error: ${validationErrors}`);
      } else {
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear any impersonation token before calling API so we log out as the real admin user
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nefsyimar_impersonation_token');
      }
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      // Clear JWT token
      localStorage.removeItem('nefsyimar_token');
      setUser(null);
      setWallet(null);
      toast.success('Goodbye! 👋');
    }
  };

  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile(data);
      
      if (response.data.success && response.data.data) {
        const updatedUser = (response.data.data as any).user || response.data.data;
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Update failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Update failed. Please try again.';
      toast.error(errorMessage);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApi.getProfile();
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
        setWallet(response.data.data.wallet);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const setAuthenticatedUser = (user: User, wallet: Wallet): void => {
    setUser(user);
    setWallet(wallet);
  };

  const value: AuthContextType = {
    user,
    wallet,
    isLoading,
    isAuthenticated,
    login,
    setAuthenticatedUser,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
