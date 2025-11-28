import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUserByEmail, createUser } from '@/data/userData';

export type UserRole = 'doctor' | 'patient' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const navigate = useNavigate();

  // Login function with actual user validation
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user in database
    const storedUser = findUserByEmail(email);

    if (!storedUser) {
      return false;
    }

    // Check password (in production, use bcrypt or similar)
    if (storedUser.password !== password) {
      return false;
    }

    // Create user object without password
    const authenticatedUser: User = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      phone: storedUser.phone,
      role: storedUser.role,
    };

    setUser(authenticatedUser);
    setLastActivity(Date.now());

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(authenticatedUser));

    // Navigate based on role
    switch (authenticatedUser.role) {
      case 'doctor':
        navigate('/doctor');
        break;
      case 'patient':
        navigate('/patient');
        break;
      case 'admin':
        navigate('/');
        break;
      default:
        navigate('/');
    }

    return true;
  };

  // Signup function
  const signup = async (data: SignupData): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = findUserByEmail(data.email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Create new user
    const newUser = createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password, // In production, hash this
    });

    // Automatically log in the new user
    const authenticatedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    };

    setUser(authenticatedUser);
    setLastActivity(Date.now());

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(authenticatedUser));

    // Navigate based on role
    switch (authenticatedUser.role) {
      case 'doctor':
        navigate('/doctor');
        break;
      case 'patient':
        navigate('/patient');
        break;
      default:
        navigate('/');
    }

    return { success: true, message: 'Account created successfully' };
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return true;
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  // Track user activity
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Check for idle timeout
  useEffect(() => {
    if (!user) return;

    const checkIdleTimeout = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= IDLE_TIMEOUT) {
        logout();
      }
    }, 1000); // Check every second

    return () => clearInterval(checkIdleTimeout);
  }, [user, lastActivity, logout]);

  // Add activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, updateActivity]);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLastActivity(Date.now());
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
