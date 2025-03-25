import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90 w-full">
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
};

export default AppLayout; 