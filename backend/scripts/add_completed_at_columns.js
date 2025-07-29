const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigration = async () => {
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

    console.log('🔗 Connected to database for migration...');

    // Check if columns exist before adding them
    console.log('📋 Checking existing table structure...');

    // Check projects table
    const [projectsColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'projects'
    `, [process.env.DB_NAME || 'ProdigiousHub']);

    const projectsHasCompletedAt = projectsColumns.some(col => col.COLUMN_NAME === 'completed_at');

    // Check project_participants table
    const [participantsColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_participants'
    `, [process.env.DB_NAME || 'ProdigiousHub']);

    const participantsHasCompletedAt = participantsColumns.some(col => col.COLUMN_NAME === 'completed_at');

    // Add completed_at column to projects table if it doesn't exist
    if (!projectsHasCompletedAt) {
      console.log('➕ Adding completed_at column to projects table...');
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN completed_at DATETIME NULL AFTER updated_at
      `);
      console.log('✅ Added completed_at column to projects table');
    } else {
      console.log('ℹ️  projects.completed_at column already exists');
    }

    // Add completed_at column to project_participants table if it doesn't exist
    if (!participantsHasCompletedAt) {
      console.log('➕ Adding completed_at column to project_participants table...');
      await connection.execute(`
        ALTER TABLE project_participants 
        ADD COLUMN completed_at DATETIME NULL AFTER joined_at
      `);
      console.log('✅ Added completed_at column to project_participants table');
    } else {
      console.log('ℹ️  project_participants.completed_at column already exists');
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
};

// Run the migration
runMigration();
