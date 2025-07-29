import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CompactLevelDisplay } from '../UI/LevelDisplay';
import { calculateLevel, getLevelProgress, getLevelColor } from '../../utils/levelSystem';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  console.log('Navbar render - isAuthenticated:', isAuthenticated, 'user:', user?.username, 'loading:', loading);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Custom navbar level display with progress
  const NavbarLevelDisplay = ({ xp, isProfileRoute }) => {
    const level = calculateLevel(xp);
    const levelProgress = getLevelProgress(xp);
    const levelColor = getLevelColor(level);

    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white text-xs font-bold`}>
          {level}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${isProfileRoute ? 'text-white' : 'text-white'}`}>
            Level {level}
          </span>
          {level < 100 && (
            <div className={`w-16 ${isProfileRoute ? 'bg-white/30' : 'bg-gray-700'} rounded-full h-1 overflow-hidden`}>
              <motion.div
                className={`h-1 bg-gradient-to-r ${levelColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: "/home_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
    },
    {
      name: "Dashboard", 
      path: "/dashboard",
      icon: "/dynamic_feed_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
    },
    {
      name: "Projects",
      path: "/projects", 
      icon: "/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
    }
  ];

  // Check if we're on a profile route
  const isProfileRoute = location.pathname.startsWith('/profile/');

  // Calculate XP progress
  const xpProgress = user && user.xp && user.next_level_xp ? (user.xp / user.next_level_xp) * 100 : 0;

  // Always render navbar, but show different content based on auth status
  console.log('Navbar rendering - isAuthenticated:', isAuthenticated, 'loading:', loading);

  // Show loading state only when actually loading auth status
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </nav>
    );
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        isProfileRoute 
          ? 'bg-black border-b border-white shadow-lg' 
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img 
                src="/Logo-removebg.png" 
                alt="ProdigiousHub" 
                className="h-10 w-auto"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg"
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0 }}
              />
            </motion.div>
            <span className={`text-xl font-bold bg-gradient-to-r ${
              isProfileRoute 
                ? 'from-white to-gray-200 text-white' 
                : 'from-gray-900 to-gray-700'
            } bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300`}>
              ProdigiousHub
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? (isProfileRoute ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600')
                        : (isProfileRoute ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className={`w-5 h-5 ${isActive ? 'filter brightness-0 saturate-100 contrast-200 hue-rotate-180' : ''}`}
                    />
                    <span className="font-medium">{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 ${
                          isProfileRoute 
                            ? 'bg-gradient-to-r from-white/20 to-white/10 rounded-lg border border-white/30'
                            : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200'
                        }`}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                {/* Level Indicator */}
                <div className={`hidden sm:flex items-center space-x-2 ${
                  isProfileRoute 
                    ? 'bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30'
                    : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-600/50'
                } px-3 py-1.5 rounded-full`}>
                  <NavbarLevelDisplay 
                    xp={user?.total_xp || user?.xp || 0} 
                    isProfileRoute={isProfileRoute}
                  />
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg transition-colors ${
                      isProfileRoute 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <img 
                      src={
                        user.profile_picture_url 
                          ? `http://localhost:5000${user.profile_picture_url}` 
                          : (user.id ? `http://localhost:5000/api/profile-picture/${user.id}` : "/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png")
                      } 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 object-cover"
                      onError={(e) => {
                        console.log('Profile picture failed to load, trying fallback...');
                        // Try the direct API endpoint if profile_picture_url fails
                        if (user.id && !e.target.src.includes('api/profile-picture')) {
                          e.target.src = `http://localhost:5000/api/profile-picture/${user.id}`;
                        } else {
                          // Final fallback to default avatar
                          e.target.src = "/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png";
                        }
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully');
                      }}
                    />
                    <div className="hidden sm:block text-left">
                      <p className={`text-sm font-medium ${
                        isProfileRoute ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.display_name || user.username}
                      </p>
                      <p className={`text-xs ${
                        isProfileRoute ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {user.xp?.toLocaleString() || 0} XP
                      </p>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${
                      isProfileRoute ? 'text-gray-300' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 z-50 ${
                          isProfileRoute 
                            ? 'bg-gray-800 border-gray-600' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Link 
                          to={`/profile/${user.username}`} 
                          className={`flex items-center px-4 py-2 transition-colors ${
                            isProfileRoute 
                              ? 'text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <img 
                            src={
                              user.profile_picture_url 
                                ? `http://localhost:5000${user.profile_picture_url}` 
                                : (user.id ? `http://localhost:5000/api/profile-picture/${user.id}` : "/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png")
                            } 
                            alt="Profile" 
                            className="w-4 h-4 mr-3 rounded-full object-cover"
                            onError={(e) => {
                              if (user.id && !e.target.src.includes('api/profile-picture')) {
                                e.target.src = `http://localhost:5000/api/profile-picture/${user.id}`;
                              } else {
                                e.target.src = "/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png";
                              }
                            }}
                          />
                          View Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          className={`flex items-center px-4 py-2 transition-colors ${
                            isProfileRoute 
                              ? 'text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                        <hr className={`my-2 ${
                          isProfileRoute ? 'border-gray-600' : 'border-gray-200'
                        }`} />
                        <button 
                          onClick={handleLogout} 
                          className={`flex items-center w-full px-4 py-2 transition-colors ${
                            isProfileRoute 
                              ? 'text-red-400 hover:bg-gray-700' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Auth Buttons for Non-Authenticated Users */
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <img 
                    src={item.icon} 
                    alt={item.name}
                    className={`w-6 h-6 ${isActive ? 'filter brightness-0 saturate-100 contrast-200 hue-rotate-180' : ''}`}
                  />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
