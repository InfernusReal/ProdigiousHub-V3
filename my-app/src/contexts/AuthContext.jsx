import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { calculateLevel } from '../utils/levelSystem';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;

  // Add token to requests if available
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Helper function to enhance user data with calculated level
  const enhanceUserWithLevel = (userData) => {
    if (!userData) return null;
    
    const totalXP = userData.total_xp || userData.xp || 0;
    const calculatedLevel = calculateLevel(totalXP);
    
    return {
      ...userData,
      level: calculatedLevel,
      total_xp: totalXP,
      xp: totalXP // Keep for backwards compatibility
    };
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status, token:', token ? 'exists' : 'missing');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/me');
      
      if (response.data.success) {
        const enhancedUser = enhanceUserWithLevel(response.data.user);
        setUser(enhancedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data; // Note the .data.data structure
        
        // Store token
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        const enhancedUser = enhanceUserWithLevel(user);
        setUser(enhancedUser);
        setIsAuthenticated(true);
        
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      
      if (response.data.success) {
        const enhancedUser = enhanceUserWithLevel(response.data.user);
        setUser(enhancedUser);
        return { success: true, user: enhancedUser };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const updateUser = (newUserData) => {
    const enhancedUser = enhanceUserWithLevel(newUserData);
    setUser(enhancedUser);
  };

  const sendVerification = async () => {
    try {
      const response = await axios.post('/auth/send-verification');
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Send verification failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send verification email' 
      };
    }
  };

  const checkVerificationStatus = async (email) => {
    try {
      // Check if user is now verified by attempting to get user data
      const response = await axios.post('/auth/check-verification-status', { email });
      
      if (response.data.success && response.data.isVerified) {
        // User is now verified, update context
        await checkAuthStatus();
        return { success: true, isVerified: true };
      }
      
      return { success: true, isVerified: false };
    } catch (error) {
      console.error('Check verification status failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to check verification status' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    sendVerification,
    checkVerificationStatus,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
