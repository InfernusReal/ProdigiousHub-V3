const mysql = require('mysql2/promise');
require('dotenv').config();

const addDiscordColumns = async () => {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3001,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ProdigiousHub'
    });

    console.log('🔗 Connected to database for Discord migration...');

    // Check if Discord columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'ProdigiousHub']);

    const hasDiscordId = columns.some(col => col.COLUMN_NAME === 'discord_id');
    const hasDiscordUsername = columns.some(col => col.COLUMN_NAME === 'discord_username');

    // Add discord_id column if it doesn't exist
    if (!hasDiscordId) {
      console.log('➕ Adding discord_id column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN discord_id VARCHAR(255) NULL UNIQUE AFTER email
      `);
      console.log('✅ Added discord_id column to users table');
    } else {
      console.log('ℹ️  discord_id column already exists');
    }

    // Add discord_username column if it doesn't exist
    if (!hasDiscordUsername) {
      console.log('➕ Adding discord_username column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN discord_username VARCHAR(255) NULL AFTER discord_id
      `);
      console.log('✅ Added discord_username column to users table');
    } else {
      console.log('ℹ️  discord_username column already exists');
    }

    // Add Discord columns to projects table for channel/role tracking
    const [projectColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'projects'
    `, [process.env.DB_NAME || 'ProdigiousHub']);

    const hasDiscordChannelId = projectColumns.some(col => col.COLUMN_NAME === 'discord_channel_id');
    const hasDiscordRoleId = projectColumns.some(col => col.COLUMN_NAME === 'discord_role_id');

    if (!hasDiscordChannelId) {
      console.log('➕ Adding discord_channel_id column to projects table...');
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN discord_channel_id VARCHAR(255) NULL AFTER completed_at
      `);
      console.log('✅ Added discord_channel_id column to projects table');
    } else {
      console.log('ℹ️  discord_channel_id column already exists');
    }

    if (!hasDiscordRoleId) {
      console.log('➕ Adding discord_role_id column to projects table...');
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN discord_role_id VARCHAR(255) NULL AFTER discord_channel_id
      `);
      console.log('✅ Added discord_role_id column to projects table');
    } else {
      console.log('ℹ️  discord_role_id column already exists');
    }

    console.log('🎉 Discord migration completed successfully!');

  } catch (error) {
    console.error('❌ Discord migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
};

// Run the migration
addDiscordColumns();
