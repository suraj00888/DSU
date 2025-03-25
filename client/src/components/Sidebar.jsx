import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, FileText, MessageSquare, Star } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import logo from '../assets/logo.png';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Toggle sidebar open/close state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle resize events to determine if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Always show sidebar on desktop
      } else {
        setIsOpen(false); // Hide by default on mobile
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Array of navigation items - My Events only for non-admin users
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Home' },
    { path: '/events', icon: <Calendar size={20} />, label: 'Events' },
    // Only show My Events for non-admin users
    ...(!isAdmin ? [{ path: '/my-events', icon: <Star size={20} />, label: 'My Events' }] : []),
    { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
    { path: '/forum', icon: <MessageSquare size={20} />, label: 'Discussion Forum' },
  ];

  return (
    <>
      {/* Overlay - visible only when sidebar is open on mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background/95 backdrop-blur-sm z-40 w-64 shadow-xl transition-transform duration-300 ease-in-out",
          isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
          <img src={logo} alt="DSUConnect Logo" className="h-12 w-auto" />
          
          {/* Close button inside sidebar - only visible on mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary hover:bg-primary/10 hover:text-primary"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-medium shadow-sm"
                      : "text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-background hover:text-foreground hover:shadow-sm"
                  )}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <span className={cn(
                    "mr-3 transition-transform duration-200",
                    location.pathname === item.path ? "scale-110" : ""
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer area */}
        <div className="absolute bottom-0 w-full p-5 bg-gradient-to-t from-primary/5 to-transparent">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 DSUConnect
          </p>
        </div>
      </div>

      {/* Hamburger menu button - separate from the sidebar */}
      {isMobile && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-6 left-4 z-20 lg:hidden text-primary bg-background/90 backdrop-blur-md shadow-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </Button>
      )}

      {/* Main content wrapper with appropriate padding when sidebar is visible */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          !isMobile && "lg:ml-64"
        )}
      >
        {/* Your main content will be rendered here */}
      </div>
    </>
  );
};

export default Sidebar; 