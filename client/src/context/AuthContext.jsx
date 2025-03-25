import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import api from '../api';

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set token in default headers for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by getting user profile
          const response = await api.get('/api/user/profile');
          
          if (response.status === 200 && response.data) {
            // If token is valid, update Redux store with user data
            dispatch(loginSuccess(response.data));
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Token is invalid or expired - clear it
          localStorage.removeItem('token');
        }
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return children;
};

export default AuthProvider; 