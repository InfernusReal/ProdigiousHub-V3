const { pool } = require('./db');

const createNotificationsTable = async () => {
  try {
    console.log('Creating notifications table...');
    
    // Create notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sender_id INT NULL,
        type ENUM(
          'project_join',
          'project_comment',
          'project_update',
          'level_up',
          'achievement',
          'system'
        ) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ Notifications table created successfully!');
    
    // Create some sample notifications for testing
    console.log('Creating sample notifications...');
    
    // Get a user to create sample notifications for
    const [users] = await pool.execute('SELECT id FROM users LIMIT 1');
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      // Create sample notifications
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, data) VALUES
        (?, 'system', 'Welcome to ProdigyHub!', 'Thanks for joining our community of developers and creators.', '{"action": "welcome"}'),
        (?, 'achievement', 'First Login Achievement', 'You have successfully logged in for the first time!', '{"achievement": "first_login"}'),
        (?, 'level_up', 'Level Up!', 'Congratulations! You have reached Level 2.', '{"level": 2, "xp": 250}')
      `, [userId, userId, userId]);
      
      console.log('✅ Sample notifications created!');
    }
    
    console.log('🎉 Notifications system setup complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    process.exit(1);
  }
};

createNotificationsTable();
