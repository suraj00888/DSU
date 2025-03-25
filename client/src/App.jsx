import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkSessionExpiry } from './features/auth/authSlice';
import TokenRefresher from './features/auth/TokenRefresher';
import router from './routes/Routes';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.status);
  
  // Check token validity when app loads
  useEffect(() => {
    dispatch(checkSessionExpiry());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      {isAuthenticated && <TokenRefresher />}
    </>
  );
}

export default App; 