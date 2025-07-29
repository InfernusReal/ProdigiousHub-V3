import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  StarIcon,
  CalendarIcon,
  LinkIcon,
  PencilIcon,
  TrophyIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';

const ProfileSlug = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Add custom styles for the scrollbar and shimmer effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #ec4899);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #9333ea, #db2777);
      }
      .shimmer {
        position: relative;
        overflow: hidden;
      }
      .shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s ease;
      }
      .shimmer:hover::before {
        left: 100%;
      }
      .will-change-transform {
        will-change: transform;
      }
      .scale-102 {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Helper function to format profile picture URL
  const formatProfilePicture = (profilePicture) => {
    if (!profilePicture) return null;
    
    if (profilePicture.startsWith('data:image/')) {
      return profilePicture;
    }
    
    return `data:image/jpeg;base64,${profilePicture}`;
  };

  useEffect(() => {
    fetchProfile();
    fetchAllUsers();
  }, [username]);

  useEffect(() => {
    if (user && profile) {
      setIsOwnProfile(user.username === profile.username);
    }
  }, [user, profile]);

  const setMockUsers = () => {
    console.log('Setting mock users');
    setAllUsers([
      {
        id: 1,
        username: 'developer1',
        display_name: 'John Doe',
        bio: 'Full-stack developer passionate about React and Node.js',
        profile_picture: null
      },
      {
        id: 2,
        username: 'developer2', 
        display_name: 'Jane Smith',
        bio: 'UI/UX designer who loves creating beautiful interfaces',
        profile_picture: null
      },
      {
        id: 3,
        username: 'developer3',
        display_name: 'Alex Chen',
        bio: 'Machine learning engineer building the future with AI',
        profile_picture: null
      },
      {
        id: 4,
        username: 'developer4',
        display_name: 'Sarah Wilson',
        bio: 'Mobile app developer crafting seamless user experiences',
        profile_picture: null
      },
      {
        id: 5,
        username: 'developer5',
        display_name: 'Mike Johnson',
        bio: 'DevOps engineer automating everything that can be automated',
        profile_picture: null
      },
      {
        id: 6,
        username: 'developer6',
        display_name: 'Emma Davis',
        bio: 'Frontend wizard making pixels dance with CSS magic',
        profile_picture: null
      }
    ]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchOverlay(false);
      }
    };

    if (showSearchOverlay) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showSearchOverlay]);

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users...');
      
      // Try to get all users (no query parameter)
      const response = await fetch('/api/users/search');
      console.log('Users API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users API response:', data);
        
        if (data.success && data.users && data.users.length > 0) {
          console.log('Found registered users:', data.users.length);
          setAllUsers(data.users);
          return;
        } else {
          console.log('API returned empty users array');
        }
      } else {
        console.log('API response not ok:', response.status, response.statusText);
      }
      
      // Fallback to mock users if no real users found
      console.log('No registered users found, using mock users for demonstration');
      setMockUsers();
      
    } catch (error) {
      console.error('Error fetching users:', error);
      console.log('Using mock users due to error');
      setMockUsers();
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleSearchFocus = () => {
    setShowSearchOverlay(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on user cards
    setTimeout(() => {
      setShowSearchOverlay(false);
    }, 200);
  };

  const handleUserCardClick = (username) => {
    setShowSearchOverlay(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/profile/${username}`);
  };

  const calculateWorkHours = () => {
    if (!profile.projects) return 0;
    
    // Calculate based on project participation duration
    // This is a simplified calculation - you might want to implement actual time tracking
    return profile.projects.reduce((total, project) => {
      const startDate = new Date(project.joined_at);
      const endDate = project.completed_at ? new Date(project.completed_at) : new Date();
      const diffInHours = Math.max(0, (endDate - startDate) / (1000 * 60 * 60));
      return total + Math.min(diffInHours, 168); // Max 1 week per project for realistic calculation
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with image */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          showSearchOverlay ? 'blur-sm scale-102' : ''
        }`}
        style={{
          backgroundImage: 'url(/pexels-eberhardgross-2098427.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Search Overlay */}
      {showSearchOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSearchOverlay(false);
              setSearchQuery('');
              setSearchResults([]);
            }
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-6xl"
            >
              {/* Search Input in Overlay */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onBlur={handleSearchBlur}
                  autoFocus
                  placeholder="Search for amazing developers..."
                  className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 bg-white/10 backdrop-blur-md border-2 border-purple-500/50 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl placeholder-purple-300 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-300"
                />
              </div>

              {/* User Cards Grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-h-96 overflow-y-auto custom-scrollbar"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {allUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-purple-300 text-base sm:text-lg">Loading amazing developers...</p>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mt-4"
                    />
                  </div>
                ) : (
                  (searchQuery ? searchResults : allUsers.slice(0, 12)).map((searchUser, index) => (
                    <motion.div
                      key={searchUser.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -3,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserCardClick(searchUser.username)}
                      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 cursor-pointer hover:border-purple-400/50 transition-all duration-200 overflow-hidden shimmer will-change-transform"
                    >
                      {/* Simplified shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-xl sm:rounded-2xl blur-sm"></div>
                      </div>
                      
                      {/* Card content */}
                      <div className="relative z-10">
                        {/* Profile Picture */}
                        <div className="flex justify-center mb-3 sm:mb-4">
                          {searchUser.profile_picture ? (
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              src={formatProfilePicture(searchUser.profile_picture)}
                              alt={searchUser.display_name || searchUser.username}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-400/50 group-hover:border-purple-300 transition-colors duration-200 will-change-transform"
                            />
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm sm:text-lg font-bold border-2 border-purple-400/50 group-hover:border-purple-300 transition-colors duration-200 will-change-transform"
                            >
                              {(searchUser.display_name || searchUser.username)?.charAt(0)?.toUpperCase()}
                            </motion.div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="text-center mb-3 sm:mb-4">
                          <h3 className="text-white font-semibold text-sm sm:text-lg group-hover:text-purple-200 transition-colors duration-200">
                            {searchUser.display_name || searchUser.username}
                          </h3>
                          <p className="text-purple-300 text-xs sm:text-sm">@{searchUser.username}</p>
                        </div>

                        {/* Bio */}
                        <div className="text-center">
                          <p className="text-purple-200 text-xs sm:text-sm italic leading-relaxed group-hover:text-white transition-colors duration-200 line-clamp-2">
                            "{searchUser.bio || "A passionate developer building amazing things..."}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* Close hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <p className="text-purple-300 text-sm">Click outside or press ESC to close</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className={`relative z-10 pt-16 sm:pt-20 pb-4 sm:pb-8 transition-all duration-500 ${
        showSearchOverlay ? 'pointer-events-none' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative max-w-md mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="Search for other developers..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
              />
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-sm"></div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/20 sm:bg-white/10 backdrop-blur-md sm:backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30 sm:border-white/20 p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg sm:shadow-none"
              >
                {/* Profile Picture and Basic Info */}
                <div className="text-center mb-4 sm:mb-6">
                  {profile.profile_picture ? (
                    <img
                      src={formatProfilePicture(profile.profile_picture)}
                      alt={profile.display_name || profile.username}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-3 sm:mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                      {(profile.display_name || profile.username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-purple-300 mb-2 text-sm sm:text-base">@{profile.username}</p>
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/settings')}
                      className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Bio Section */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Bio
                  </h3>
                  <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                    {profile.bio || "This developer hasn't written a bio yet."}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm sm:text-base">{profile.total_xp || 0}</p>
                    <p className="text-purple-300 text-xs sm:text-sm">Total XP</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm sm:text-base">Level {profile.current_level || 0}</p>
                    <p className="text-purple-300 text-xs sm:text-sm">Current Level</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm sm:text-base">{Math.round(calculateWorkHours())}</p>
                    <p className="text-purple-300 text-xs sm:text-sm">Hours Worked</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm sm:text-base">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-purple-300 text-xs sm:text-sm">Joined</p>
                  </div>
                </div>

                {/* CTA Section - Social Links */}
                {(profile.portfolio_url || profile.github_username || profile.linkedin_url) && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Connect
                    </h3>
                    <div className="space-y-2">
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm sm:text-base"
                        >
                          <BriefcaseIcon className="h-4 w-4" />
                          Portfolio
                        </a>
                      )}
                      {profile.github_username && (
                        <a
                          href={`https://github.com/${profile.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm sm:text-base"
                        >
                          GitHub
                        </a>
                      )}
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm sm:text-base"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Project History */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Project History</h2>
                
                {/* Completed Projects */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    Completed Projects ({profile.completed_projects?.length || 0})
                  </h3>
                  
                  {profile.completed_projects && profile.completed_projects.length > 0 ? (
                    <div className="grid gap-4">
                      {profile.completed_projects.map((project) => (
                        <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-green-400/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{project.title}</h4>
                            <span className="text-green-400 text-sm">+{project.xp_reward} XP</span>
                          </div>
                          <p className="text-purple-300 text-sm mb-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-xs text-purple-400">
                            <span>Completed: {new Date(project.completed_at).toLocaleDateString()}</span>
                            <span className="capitalize">{project.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-purple-300">No completed projects yet.</p>
                  )}
                </div>

                {/* Active Projects */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PlayCircleIcon className="h-5 w-5 text-blue-400" />
                    Active Projects ({profile.active_projects?.length || 0})
                  </h3>
                  
                  {profile.active_projects && profile.active_projects.length > 0 ? (
                    <div className="grid gap-4">
                      {profile.active_projects.map((project) => (
                        <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-blue-400/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{project.title}</h4>
                            <span className="text-blue-400 text-sm">Potential: +{project.xp_reward} XP</span>
                          </div>
                          <p className="text-purple-300 text-sm mb-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-xs text-purple-400">
                            <span>Joined: {new Date(project.joined_at).toLocaleDateString()}</span>
                            <span className="capitalize">{project.difficulty}</span>
                            <span className="capitalize text-blue-400">{project.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-purple-300">No active projects.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSlug;
