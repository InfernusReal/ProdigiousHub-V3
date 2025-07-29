import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-purple-500" />;
      case 'level_up':
        return <StarIcon className="w-5 h-5 text-yellow-500" />;
      case 'xp_reward':
        return <TrophyIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'project_invite':
      case 'project_join':
        return 'bg-blue-50 border-blue-200';
      case 'comment':
        return 'bg-purple-50 border-purple-200';
      case 'level_up':
        return 'bg-yellow-50 border-yellow-200';
      case 'xp_reward':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">We'll notify you when something happens!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                          !notification.is_read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 p-1 rounded transition-all"
                          >
                            <XMarkIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/notifications';
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
