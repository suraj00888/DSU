import React, { useState, useEffect } from 'react';
import { Button, Input, Checkbox } from '../components/index.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, clearSessionExpired } from '../features/auth/authSlice';
import api from '../api/index.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.status);
  const sessionExpired = useSelector(state => state.auth.sessionExpired);
  
  // Check for success message in location state (from signup redirect)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the location state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear session expired flag when component mounts
  useEffect(() => {
    if (sessionExpired) {
      dispatch(clearSessionExpired());
    }
  }, [sessionExpired, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      console.log('Attempting login...');
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response);
      
      if (response.status === 200 && response.data.token) {
        // Store tokens in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Dispatch user data to Redux
        dispatch(loginSuccess(response.data.user));
        
        // Add a small delay before navigation to ensure state updates
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error messages based on the response
      if (error.response) {
        // The server responded with an error status
        if (error.response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (error.response.status === 404) {
          setError('User not found. Please check your email or sign up for a new account.');
        } else if (error.response.status === 429) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(error.response.data?.message || 'An error occurred during login. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">Sign in to your account</h2>
          
          {/* Success message display */}
          {successMessage && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-md flex items-start">
              <div className="flex-shrink-0 text-primary">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="ml-3 text-xs sm:text-sm text-primary">{successMessage}</p>
            </div>
          )}
          
          {/* Session expired notification */}
          {sessionExpired && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-accent/20 border border-accent/30 rounded-md">
              <p className="text-xs sm:text-sm text-accent-foreground">
                Your session has expired. Please sign in again.
              </p>
            </div>
          )}
          
          {/* Error message display with improved styling */}
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
          
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-foreground font-medium block text-xs sm:text-sm text-left">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md" 
                required
                disabled={loading}
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
          
          <div className="flex items-center justify-end pt-1">
            <Link to="/forgot-password" className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium">
              Forgot Password?
            </Link>
          </div>
          
          <div className="text-center mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium">
              Sign up
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-medium py-2 sm:py-2.5 h-9 sm:h-10 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
