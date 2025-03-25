import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/index.jsx';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../api/index.js';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Validate the token format on component mount
  useEffect(() => {
    if (!token || token.length < 32) {
      setValidToken(false);
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      console.log('Resetting password...');
      const response = await api.post(`/api/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword
      });
      console.log('Password reset response:', response);
      
      if (response.status === 200) {
        setSuccessMessage('Your password has been successfully reset!');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              successMessage: 'Your password has been reset. Please log in with your new password.' 
            } 
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset your password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // More specific error messages based on the response
      if (error.response) {
        if (error.response.status === 400) {
          setError(error.response.data.message || 'Invalid token or passwords do not match.');
        } else {
          setError(error.response.data?.message || 'An error occurred during password reset.');
        }
      } else if (error.request) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src={logo} 
            alt="DSUConnect Logo" 
            className="mx-auto h-12 sm:h-16 w-auto mb-3 sm:mb-4"
          />
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">Create New Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
          
          {/* Success message display */}
          {successMessage && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-md flex items-start">
              <div className="flex-shrink-0 text-primary">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="ml-3 text-xs sm:text-sm text-primary">{successMessage}</p>
            </div>
          )}
          
          {/* Error message display */}
          {error && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start">
              <div className="flex-shrink-0 text-destructive">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="ml-3 text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
        
        {validToken && (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-foreground font-medium block text-xs sm:text-sm text-left">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password" 
                  className="pl-8 sm:pl-10 pr-8 sm:pr-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md" 
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                  disabled={loading}
                >
                  {showPassword ? 
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : 
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  }
                </button>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-foreground font-medium block text-xs sm:text-sm text-left">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password" 
                  className="pl-8 sm:pl-10 pr-8 sm:pr-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md" 
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 text-muted-foreground hover:text-foreground"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                  disabled={loading}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : 
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  }
                </button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 6 characters long.
            </p>
            
            <div className="flex items-center justify-between gap-3 pt-3">
              <Link to="/login" className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium">
                Back to Login
              </Link>
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-primary text-primary-foreground font-medium py-2 sm:py-2.5 h-9 sm:h-10 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
            </div>
          </form>
        )}
        
        {!validToken && (
          <div className="flex justify-center mt-4">
            <Link 
              to="/forgot-password" 
              className="bg-primary text-primary-foreground font-medium py-2 px-4 sm:py-2.5 h-9 sm:h-10 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 