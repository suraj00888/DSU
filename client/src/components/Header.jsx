import React from 'react';
import UserAvatar from './UserAvatar';

const Header = ({ title }) => {
  return (
    <header className="bg-card/80 backdrop-blur-sm shadow-md w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-card-foreground pl-10 lg:pl-0">{title}</h1>
        <div>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};

export default Header; 