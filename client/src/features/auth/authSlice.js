import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isTokenValid } from '../../utils/auth';

// Thunk to check token expiration
export const checkTokenExpiry = createAsyncThunk(
  'auth/checkTokenExpiry',
  async () => {
    try {
      const result = isTokenValid(true);
      return result;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return { valid: false, error: true };
    }
  }
);

// Add an alias for checkTokenExpiry to fix import error
export const checkSessionExpiry = checkTokenExpiry;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: false, // false means not authenticated
    user: null, // user data will be stored here
    sessionExpired: false, // true when session has expired
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.status = true;
      state.user = action.payload; // Store user data from payload
      state.sessionExpired = false;
    },
    logout: (state, action) => {
      // Check if logout was due to session expiry
      if (action.payload?.expired) {
        state.sessionExpired = true;
      }
      
      state.status = false;
      state.user = null; // Clear user data on logout
      
      // Clear auth tokens
      localStorage.removeItem('token'); 
      localStorage.removeItem('refreshToken');
    },
    clearSessionExpired: (state) => {
      state.sessionExpired = false;
    },
    sessionRefreshed: (state, action) => {
      // Update state with new user data if provided
      if (action.payload?.user) {
        state.user = action.payload.user;
      }
      state.sessionExpired = false;
    },
    updateUser: (state, action) => {
      // Update the user data with the new information
      state.user = { ...state.user, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkTokenExpiry.fulfilled, (state, action) => {
        // If token check returns valid: false, we already dispatched logout
        // If it returns an object with valid: true, we can use this to update state
        if (action.payload && action.payload.valid === true) {
          // Optional: You could store minutes remaining in the state if needed
          // state.tokenExpiresIn = action.payload.minutesRemaining;
        }
      });
  }
});

export const { loginSuccess, logout, clearSessionExpired, sessionRefreshed, updateUser } = authSlice.actions;
export default authSlice.reducer; 