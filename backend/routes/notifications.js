const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db');

// Helper function to safely parse JSON
const safeJSONParse = (data, defaultValue = null) => {
  if (!data) return defaultValue;
  
  // If data is already an object, return it
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  
  // If data is a string, try to parse it
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse JSON:', data, error.message);
      return defaultValue;
    }
  }
  
  return defaultValue;
};

// Get all notifications for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get notifications
    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        u.username as sender_username,
        u.display_name as sender_display_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [userId]);
    
    // Get unread count
    const [unreadResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    const unreadCount = unreadResult[0].count;
    
    // Parse JSON data fields safely
    const processedNotifications = notifications.map(notification => ({
      ...notification,
      data: safeJSONParse(notification.data, null)
    }));
    
    res.json({
      success: true,
      notifications: processedNotifications,
      unreadCount
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Helper function to create notifications
const createNotification = async (db, notificationData) => {
  const {
    userId,
    senderId = null,
    type,
    title,
    message,
    data = null
  } = notificationData;
  
  try {
    await db.execute(`
      INSERT INTO notifications (user_id, sender_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      senderId,
      type,
      title,
      message,
      data ? JSON.stringify(data) : null
    ]);
    
    console.log(`Notification created for user ${userId}: ${title}`);
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

module.exports = { router, createNotification };
