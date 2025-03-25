import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Button } from './index.jsx';
import logo from '../assets/logo.png';

const SessionExpiryModal = ({ minutesRemaining, onExtendSession }) => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(minutesRemaining * 60);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          dispatch(logout({ expired: true }));
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [dispatch]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-4">
          <img src={logo} alt="DSUConnect Logo" className="h-12 w-auto mx-auto mb-2" />
        </div>
        <h3 className="text-xl font-medium text-card-foreground mb-2">Session Expiring</h3>
        <p className="text-muted-foreground mb-4">
          Your session will expire in <span className="font-semibold">{formatTime(timeLeft)}</span>.
          Would you like to stay logged in?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <Button 
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded"
            onClick={() => {
              setVisible(false);
              dispatch(logout());
            }}
          >
            Logout Now
          </Button>
          
          <Button 
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
            onClick={() => {
              setVisible(false);
              if (onExtendSession) onExtendSession();
            }}
          >
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal; 