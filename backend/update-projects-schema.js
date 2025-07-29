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

    console.log('🔗 Connected to database for projects schema update...');

    // Add new fields to projects table
    console.log('📝 Adding new fields to projects table...');
    
    try {
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN poster_image LONGTEXT DEFAULT NULL,
        ADD COLUMN slug VARCHAR(255) DEFAULT NULL,
        ADD COLUMN custom_content LONGTEXT DEFAULT NULL
      `);
      console.log('✅ Added poster_image, slug, and custom_content columns');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns already exist, skipping...');
      } else {
        throw error;
      }
    }

    // Create project_comments table
    console.log('📝 Creating project_comments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign key constraints
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES project_comments(id) ON DELETE CASCADE,
        
        -- Indexes
        INDEX idx_project (project_id),
        INDEX idx_user (user_id),
        INDEX idx_parent (parent_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create project_reviews table
    console.log('📝 Creating project_reviews table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Ensure one review per user per project
        UNIQUE KEY unique_user_project_review (project_id, user_id),
        
        -- Foreign key constraints
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes
        INDEX idx_project (project_id),
        INDEX idx_user (user_id),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Update projects table indexes
    console.log('📝 Adding indexes to projects table...');
    try {
      await connection.execute(`
        ALTER TABLE projects 
        ADD INDEX idx_slug (slug),
        ADD INDEX idx_status_difficulty (status, difficulty)
      `);
      console.log('✅ Added slug and composite indexes');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Indexes already exist, skipping...');
      } else {
        throw error;
      }
    }

    await connection.end();
    console.log('🚀 Projects database schema update complete!');
    
  } catch (error) {
    console.error('❌ Error updating projects schema:', error.message);
    process.exit(1);
  }
};

// Run the update
connectDB();
