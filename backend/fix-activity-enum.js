const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'F4D1BD8Bs@1234',
      database: process.env.DB_NAME || 'ProdigiousHub',
      port: process.env.DB_PORT || 3001
    });

    console.log('🔗 Connected to database for schema update...');

    // Add 'profile_completed' to action_type enum
    console.log('📝 Updating activity_feed action_type enum...');
    
    await connection.execute(`
      ALTER TABLE activity_feed 
      MODIFY COLUMN action_type ENUM(
        'user_registered', 
        'email_verified',
        'project_created', 
        'project_joined', 
        'project_completed', 
        'achievement_earned', 
        'level_up',
        'profile_completed'
      ) NOT NULL
    `);

    console.log('✅ Updated activity_feed action_type enum to include profile_completed');

    await connection.end();
    console.log('🚀 Database schema update complete!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    process.exit(1);
  }
};

// Run the update
connectDB();
