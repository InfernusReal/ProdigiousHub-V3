import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../Projects/CreateProjectModal';
import LevelDisplay from '../UI/LevelDisplay';
import DiscordIntegration from '../Discord/DiscordIntegration';
import { 
  RocketLaunchIcon, 
  UserGroupIcon, 
  FireIcon, 
  StarIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Refresh feed every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Check for Discord OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const discordStatus = urlParams.get('discord');
    
    if (discordStatus === 'success') {
      // Show success message and refresh Discord status
      setTimeout(() => {
        alert('Discord account connected successfully! 🎉');
        // Remove the query parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 100);
    } else if (discordStatus === 'error') {
      // Show error message
      setTimeout(() => {
        alert('Failed to connect Discord account. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const [activitiesRes, projectsRes] = await Promise.all([
        fetch('/api/projects/feed', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/projects?${new URLSearchParams(filters)}`)
      ]);

      if (activitiesRes.ok && projectsRes.ok) {
        const activitiesData = await activitiesRes.json();
        const projectsData = await projectsRes.json();
        
        setActivities(activitiesData.activities || []);
        setProjects(projectsData.projects || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'project_created':
        return <RocketLaunchIcon className="h-5 w-5 text-blue-500" />;
      case 'project_joined':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'project_completed':
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'achievement_earned':
        return <StarIcon className="h-5 w-5 text-purple-500" />;
      case 'level_up':
        return <FireIcon className="h-5 w-5 text-orange-500" />;
      case 'profile_completed':
        return <UserGroupIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <StarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Welcome back, {user?.display_name || user?.username}! 🚀
          </h1>
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-600/50">
            <LevelDisplay 
              xp={user?.total_xp || user?.xp || 0} 
              size="large"
              showProgress={true}
              showTitle={true}
              showXP={true}
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Active Projects', value: projects.filter(p => p.status === 'open').length, icon: RocketLaunchIcon, color: 'bg-blue-500' },
            { label: 'Total Projects', value: projects.length, icon: FireIcon, color: 'bg-purple-500' },
            { label: 'Your Level', value: user?.level || 1, icon: StarIcon, color: 'bg-yellow-500' },
            { label: 'Total XP', value: user?.xp || 0, icon: TrophyIcon, color: 'bg-green-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/20 sm:bg-white/10 backdrop-blur-md sm:backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/30 sm:border-white/20 shadow-lg sm:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-purple-200 text-xs sm:text-sm truncate">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Discord Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <DiscordIntegration />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/20 sm:bg-white/10 backdrop-blur-md sm:backdrop-blur-sm rounded-xl border border-white/30 sm:border-white/20 p-4 sm:p-6 shadow-lg sm:shadow-none">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <FireIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                Live Feed
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-white/10 sm:bg-white/5 rounded-lg border border-white/20 sm:border-white/10 hover:bg-white/15 sm:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-purple-300 text-xs mt-1">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/20 sm:bg-white/10 backdrop-blur-md sm:backdrop-blur-sm rounded-xl border border-white/30 sm:border-white/20 p-4 sm:p-6 shadow-lg sm:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <RocketLaunchIcon className="h-6 w-6 text-blue-500" />
                  Discover Projects
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Project
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Search projects..."
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                    >
                      {/* Project Image */}
                      {project.poster_image && (
                        <div className="aspect-video bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${project.poster_image}`}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                            {project.title}
                          </h3>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-4 mb-4 text-sm text-purple-300">
                          <span className={`px-2 py-1 rounded-full border ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                          </span>
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="h-4 w-4" />
                            {project.participant_count || 0}/{project.max_participants}
                          </div>
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-4 w-4" />
                            {project.xp_reward} XP
                          </div>
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full">
                                +{project.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project.creator_avatar ? (
                              <img
                                src={project.creator_avatar}
                                alt={project.creator_display_name || project.creator_username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {(project.creator_display_name || project.creator_username)?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-purple-300 text-sm">
                              {project.creator_display_name || project.creator_username}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(`/dashboard/${project.slug}`, '_blank')}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(project) => {
            // Refresh projects
            fetchDashboardData();
            // Optionally redirect to the new project
            window.open(`/projects/${project.slug}`, '_blank');
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
