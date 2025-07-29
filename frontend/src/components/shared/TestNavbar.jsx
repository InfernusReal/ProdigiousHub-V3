import React from 'react';
import { Link } from 'react-router-dom';

const TestNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white h-16 flex items-center px-6">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-xl">TEST NAVBAR</span>
        <Link to="/" className="hover:text-blue-200">Home</Link>
        <Link to="/login" className="hover:text-blue-200">Login</Link>
        <Link to="/signup" className="hover:text-blue-200">Signup</Link>
      </div>
    </nav>
  );
};

export default TestNavbar;
