import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { logout } from '../features/auth/authSlice';
import { User, LogOut } from 'lucide-react';
import api from '../api/index.js';

const UserAvatar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get initials from user name (first two letters)
  const getInitials = () => {
    if (!user?.name) return 'U';
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length === 1) {
      // If only one name, take first two letters
      return nameParts[0].substring(0, 2).toUpperCase();
    } else {
      // Take first letter of first name and first letter of last name
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
  };

  // Update dropdown position based on avatar position
  useEffect(() => {
    if (avatarRef.current && isDropdownOpen) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
  }, [isDropdownOpen]);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current && 
        !avatarRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if server request fails
      dispatch(logout());
      navigate("/login");
    }
  };

  // Handle profile click
  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  // Generate a consistent background color based on user name
  const getAvatarColor = () => {
    if (!user?.name) return 'bg-primary';

    // Simple hash function for the name to get a consistent color
    const hash = user.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Use the hash to generate a hue (0-360)
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Dropdown menu to be rendered in portal
  const Dropdown = () => {
    if (!isDropdownOpen) return null;
    
    return createPortal(
      <div 
        ref={dropdownRef}
        className="fixed shadow-lg bg-card rounded-md ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          zIndex: 9999,
          width: '12rem'
        }}
      >
        <div className="py-1 rounded-md bg-card">
          <div className="px-4 py-2 text-sm text-card-foreground border-b border-muted">
            <p className="font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
          </div>
          <button
            onClick={handleProfileClick}
            className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-primary/10 flex items-center"
          >
            <User size={16} className="mr-2" />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="relative">
        {/* Avatar button */}
        <button
          ref={avatarRef}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200`}
          style={{ backgroundColor: getAvatarColor() }}
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {getInitials()}
        </button>
      </div>
      
      {/* Render dropdown through portal */}
      <Dropdown />
    </>
  );
};

export default UserAvatar; 