import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import { setStore } from './utils/auth';

// Function to load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

// Function to save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

const persistedState = loadState();

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: persistedState,
});

// Set the store in the auth utilities
setStore(store);

// Subscribe to store updates to save state
store.subscribe(() => {
  saveState({
    auth: store.getState().auth
  });
});

export default store; 