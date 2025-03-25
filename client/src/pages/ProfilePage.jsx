import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../features/auth/authSlice';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { User, Mail, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/index.js';

const ProfilePage = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form data states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle input changes for profile form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle input changes for password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // API call to update user profile
      const response = await api.put('/api/user/profile', formData);
      
      // Update the user in Redux store
      dispatch(updateUser(response.data.user));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // API call to update password
      await api.put('/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setSuccess('Password updated successfully!');
      setIsChangingPassword(false);
      
      // Reset form data
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setError('');
  };
  
  // Toggle password change mode
  const togglePasswordMode = () => {
    setIsChangingPassword(!isChangingPassword);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setError('');
  };

  return (
    <AppLayout>
      <Header title="Profile" />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {/* Success message */}
          {success && (
            <div className="mb-6 bg-gradient-to-r from-green-500/20 to-green-500/5 backdrop-blur-sm rounded-lg shadow-sm p-4 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-destructive/20 to-destructive/5 backdrop-blur-sm rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile Card */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-medium"
                   style={{ 
                     backgroundColor: user?.name 
                       ? `hsl(${user.name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) % 360}, 70%, 50%)`
                       : 'hsl(215, 70%, 50%)' 
                   }}>
                {user?.name 
                  ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'U'}
              </div>
              
              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-card-foreground">{user?.name || 'User'}</h2>
                <p className="text-muted-foreground mt-1">{user?.email || 'email@example.com'}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Details / Edit Form */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Profile Details</h3>
              {!isEditing && !isChangingPassword && (
                <button 
                  onClick={toggleEditMode}
                  className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="flex items-center">
                  <label htmlFor="name" className="text-sm font-medium text-muted-foreground w-1/4">Full Name</label>
                  <div className="relative w-3/4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground w-1/4">Email Address</label>
                  <div className="relative w-3/4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                      placeholder="Your Email Address"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="flex items-center">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-muted-foreground w-1/4">Current Password</label>
                  <div className="relative w-3/4">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="block w-full pl-3 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                      placeholder="Your Current Password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="newPassword" className="text-sm font-medium text-muted-foreground w-1/4">New Password</label>
                  <div className="relative w-3/4">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="block w-full pl-3 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                      placeholder="Your New Password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground w-1/4">Confirm New Password</label>
                  <div className="relative w-3/4">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="block w-full pl-3 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card"
                      placeholder="Confirm New Password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="text-foreground">{user?.name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="text-foreground">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="text-foreground">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                  <button 
                    onClick={togglePasswordMode}
                    className="w-full text-center px-4 py-2.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    Change Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default ProfilePage; 