const mysql = require('mysql2/promise');
require('dotenv').config();

const addMissingColumns = async () => {
  let connection;
  
  try {
    console.log('🔧 Adding missing columns to users table...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3001,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'F4D1BD8Bs@1234',
      database: process.env.DB_NAME || 'ProdigiousHub'
    });

    console.log('✅ Connected to database');

    // Add missing columns with proper error handling
    const columnsToAdd = [
      { name: 'display_name', sql: 'ALTER TABLE users ADD COLUMN display_name VARCHAR(100) DEFAULT NULL' },
      { name: 'bio', sql: 'ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL' },
      { name: 'skills', sql: 'ALTER TABLE users ADD COLUMN skills JSON DEFAULT NULL' },
      { name: 'profile_picture', sql: 'ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL' },
      { name: 'location', sql: 'ALTER TABLE users ADD COLUMN location VARCHAR(100) DEFAULT NULL' },
      { name: 'github_username', sql: 'ALTER TABLE users ADD COLUMN github_username VARCHAR(100) DEFAULT NULL' },
      { name: 'linkedin_url', sql: 'ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) DEFAULT NULL' },
      { name: 'portfolio_url', sql: 'ALTER TABLE users ADD COLUMN portfolio_url VARCHAR(255) DEFAULT NULL' },
      { name: 'profile_completed', sql: 'ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE' }
    ];

    for (const column of columnsToAdd) {
      try {
        await connection.execute(column.sql);
        console.log('✅ Added column:', column.name);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️ Column already exists:', column.name);
        } else {
          console.error('❌ Error adding column', column.name, ':', error.message);
        }
      }
    }

    await connection.end();
    console.log('🎉 Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

addMissingColumns();
