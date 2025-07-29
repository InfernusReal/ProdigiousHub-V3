const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🚀 Starting database clearing process...');

const clearDatabase = async () => {
  let connection;
  
  try {
    console.log('🗃️  Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3001,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ProdigiousHub'
    });

    console.log('✅ Connected to database successfully!');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');

    // Clear all tables
    const tables = [
      'user_sessions',
      'activity_feed', 
      'reviews',
      'project_participants',
      'projects',
      'users'
    ];

    for (const table of tables) {
      try {
        await connection.execute(`TRUNCATE TABLE ${table}`);
        console.log(`🧹 Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} might not exist: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Re-enabled foreign key checks');

    await connection.end();
    console.log('✅ Database cleared successfully!');
    console.log('🎉 All done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

clearDatabase().catch(console.error);
