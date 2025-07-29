import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
