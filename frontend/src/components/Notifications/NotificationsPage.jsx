import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FunnelIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all');
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_invite':
      case 'project_join':
        return <UserPlusIcon className="w-6 h-6 text-blue-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-purple-500" />;
      case 'level_up':
        return <StarIcon className="w-6 h-6 text-yellow-500" />;
      case 'xp_reward':
        return <TrophyIcon className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    const baseClasses = "border-l-4";
    
    if (!isRead) {
      switch (type) {
        case 'project_invite':
        case 'project_join':
          return `${baseClasses} border-l-blue-500 bg-blue-50`;
        case 'comment':
          return `${baseClasses} border-l-purple-500 bg-purple-50`;
        case 'level_up':
          return `${baseClasses} border-l-yellow-500 bg-yellow-50`;
        case 'xp_reward':
          return `${baseClasses} border-l-green-500 bg-green-50`;
        case 'warning':
          return `${baseClasses} border-l-orange-500 bg-orange-50`;
        default:
          return `${baseClasses} border-l-gray-500 bg-gray-50`;
      }
    }
    
    return `${baseClasses} border-l-gray-300 bg-white`;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to relevant page based on notification type
    if (notification.data && notification.data.project_slug) {
      window.location.href = `/dashboard/${notification.data.project_slug}`;
    } else if (notification.data && notification.data.url) {
      window.location.href = notification.data.url;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.is_read) return false;
    if (filter === 'read' && !notification.is_read) return false;
    
    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    
    return true;
  });

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'project_invite', label: 'Project Invites' },
    { value: 'project_join', label: 'Project Joins' },
    { value: 'comment', label: 'Comments' },
    { value: 'level_up', label: 'Level Ups' },
    { value: 'xp_reward', label: 'XP Rewards' },
    { value: 'warning', label: 'Warnings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BellIcon className="w-10 h-10" />
                Notifications
              </h1>
              <p className="text-purple-200">
                Stay updated with your projects and community activity
              </p>
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
                Mark All Read ({unreadCount})
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Read Status Filter */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-purple-300" />
                <span className="text-white font-medium">Filter:</span>
                <div className="flex bg-white/10 rounded-lg p-1">
                  {['all', 'unread', 'read'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filter === filterOption
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-200 hover:text-white'
                      }`}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800 text-white">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <ArchiveBoxIcon className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No notifications found</h3>
              <p className="text-purple-300">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "No read notifications to show."
                  : "We'll notify you when something interesting happens!"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 hover:bg-white/5 transition-colors cursor-pointer group ${
                    getNotificationColor(notification.type, notification.is_read)
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-1 ${
                            !notification.is_read ? 'text-white' : 'text-purple-200'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-purple-300 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-purple-400">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;
