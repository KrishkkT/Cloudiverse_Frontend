import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;