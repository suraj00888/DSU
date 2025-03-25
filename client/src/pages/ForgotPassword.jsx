import React, { useState } from 'react';
import { Button, Input } from '../components/index.jsx';
import { Link } from 'react-router-dom';
import { Mail, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../api/index.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      console.log('Requesting password reset...');
      const response = await api.post('/api/auth/forgot-password', { email });
      console.log('Password reset response:', response);
      
      if (response.status === 200) {
        setSuccessMessage('Password reset email sent. Please check your inbox and follow the instructions.');
      } else {
        setError(response.data.message || 'Failed to process your request. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // More specific error messages based on the response
      if (error.response) {
        if (error.response.status === 404) {
          setError('No account with that email address exists.');
        } else {
          setError(error.response.data?.message || 'An error occurred during the password reset request.');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src={logo} 
            alt="DSUConnect Logo" 
            className="mx-auto h-12 sm:h-16 w-auto mb-3 sm:mb-4"
          />
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">Reset Your Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
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
        
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-foreground font-medium block text-xs sm:text-sm text-left">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email" 
                className="pl-8 sm:pl-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md" 
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
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
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 