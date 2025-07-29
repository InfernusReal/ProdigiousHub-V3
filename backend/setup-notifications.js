const mysql = require('mysql2/promise');

const createNotificationsTable = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'prodigyhub'
    });

    console.log('Creating notifications table...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sender_id INT NULL,
        type ENUM(
          'project_invite',
          'project_join', 
          'project_update',
          'comment',
          'level_up',
          'xp_reward',
          'achievement',
          'warning',
          'system',
          'general'
        ) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_created (user_id, created_at),
        INDEX idx_user_read (user_id, is_read)
      ) ENGINE=InnoDB;
    `);

    console.log('Notifications table created successfully!');

    // Insert some sample notifications for testing
    console.log('Adding sample notifications...');
    
    // Get a sample user
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      const sampleNotifications = [
        {
          type: 'level_up',
          title: 'Level Up! 🎉',
          message: 'Congratulations! You\'ve reached Level 2. Keep up the great work!',
          data: { new_level: 2, old_level: 1 }
        },
        {
          type: 'xp_reward',
          title: 'XP Reward Earned! 💰',
          message: 'You earned 150 XP for completing the React To-Do App project!',
          data: { xp_amount: 150, project_slug: 'react-todo-app' }
        },
        {
          type: 'comment',
          title: 'New Comment on Your Project 💬',
          message: 'Someone commented on your React To-Do App project. Check it out!',
          data: { project_slug: 'react-todo-app', comment_id: 1 }
        },
        {
          type: 'project_join',
          title: 'New Team Member! 👥',
          message: 'A new developer has joined your React To-Do App project.',
          data: { project_slug: 'react-todo-app', joined_user: 'john_doe' }
        },
        {
          type: 'system',
          title: 'Welcome to ProdigyHub! 🚀',
          message: 'Thanks for joining our community! Start exploring projects and level up your skills.',
          data: null
        }
      ];

      for (const notification of sampleNotifications) {
        await connection.execute(`
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (?, ?, ?, ?, ?)
        `, [
          userId,
          notification.type,
          notification.title,
          notification.message,
          notification.data ? JSON.stringify(notification.data) : null
        ]);
      }
      
      console.log('Sample notifications added!');
    }

    await connection.end();
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Error setting up notifications table:', error);
  }
};

createNotificationsTable();
