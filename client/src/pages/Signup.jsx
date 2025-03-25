import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import api from "../api/index.js";
import { Button, Input } from '../components/index.jsx';
import { User, Mail, Lock, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";
import logo from '../assets/logo.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    // Check for empty fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Check password strength (at least 8 characters with at least one number and one letter)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters and include both letters and numbers");
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Make sure endpoint matches the backend route
      const response = await api.post("/api/auth/register", formData);
      
      // If signup is successful, process the response
      if (response.data) {
        console.log("Signup successful:", response.data);
        
        // Save tokens to localStorage
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        
        // Dispatch user data to Redux store
        if (response.data.user) {
          console.log(response.data.user)
          dispatch(loginSuccess(response.data.user));
        }
        
        // Navigate with success message
        navigate('/', { 
          state: { 
            successMessage: 'Account created successfully! Welcome to DSUConnect.' 
          },
          replace: true // Ensures back button doesn't return to signup
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle different error cases
      if (err.response) {
        const status = err.response.status;
        
        switch (status) {
          case 409:
            setError("This email is already in use. Please try another email or login.");
            break;
          case 400:
            setError(err.response.data.message || "Invalid input. Please check your information.");
            break;
          case 429:
            setError("Too many signup attempts. Please try again later.");
            break;
          default:
            setError("An error occurred during signup. Please try again.");
        }
      } else if (err.request) {
        // Request was made but no response was received
        setError("Server not responding. Please check your internet connection.");
      } else {
        // Something else caused the error
        setError("An unexpected error occurred. Please try again.");
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
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">Create your account</h2>
          
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
        
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSignup}>
          {/* Name Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="name" className="block text-foreground font-medium text-xs sm:text-sm text-left">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="pl-8 sm:pl-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="email" className="block text-foreground font-medium text-xs sm:text-sm text-left">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="pl-8 sm:pl-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@dsu.edu"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="password" className="block text-foreground font-medium text-xs sm:text-sm text-left">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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

          {/* Confirm Password Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-foreground font-medium text-xs sm:text-sm text-left">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 w-full h-9 sm:h-10 text-xs sm:text-sm border border-input rounded-md"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
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

          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-medium py-2 sm:py-2.5 h-9 sm:h-10 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors mt-4 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </Button>
        </form>
        
        {/* Already have an account section moved to bottom */}
        <div className="text-center mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 text-sm font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 