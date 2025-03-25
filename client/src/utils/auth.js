// Import only the action, not the store
import { logout } from '../features/auth/authSlice';

// We'll get the store at runtime instead of importing it directly
let storeInstance = null;

/**
 * Set the store instance to be used by the auth utilities
 * This function should be called once the store is created
 * @param {Object} store - The Redux store instance
 */
export const setStore = (store) => {
  storeInstance = store;
};

/**
 * Checks if the current JWT token is valid and not expired
 * @param {boolean} silentMode If true, will not dispatch logout action if token is invalid
 * @returns {Object|boolean} Object with token validity info or false if no token
 */
export const isTokenValid = (silentMode = false) => {
  const token = localStorage.getItem('token');
  
  // If no token exists, return false
  if (!token) {
    if (!silentMode && storeInstance) {
      storeInstance.dispatch(logout({ expired: true }));
    }
    return false;
  }
  
  try {
    // Decode the token (JWT is in format header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Calculate minutes remaining before expiry
    const minutesRemaining = Math.max(0, Math.floor((expiryTime - currentTime) / (60 * 1000)));
    
    // If token is expired
    if (currentTime >= expiryTime) {
      if (!silentMode && storeInstance) {
        storeInstance.dispatch(logout({ expired: true }));
      }
      return { valid: false, expired: true };
    }
    
    // Token is valid, return validity info with minutes remaining
    return { 
      valid: true,
      minutesRemaining
    };
  } catch (error) {
    console.error('Error validating token:', error);
    
    if (!silentMode && storeInstance) {
      storeInstance.dispatch(logout({ expired: true }));
    }
    
    return { valid: false, error: true };
  }
};

/**
 * Sets up token monitoring to redirect users when their token expires
 * @returns {Function} Cleanup function to remove event listeners
 */
export const setupTokenMonitoring = () => {
  // Define a function that checks token validity
  const checkTokenStatus = () => {
    isTokenValid();
  };
  
  // Periodically check token validity (every minute)
  const intervalId = setInterval(checkTokenStatus, 60 * 1000);
  
  // Handle visibility change (when user comes back to the tab)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkTokenStatus();
    }
  };
  
  // Add event listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
