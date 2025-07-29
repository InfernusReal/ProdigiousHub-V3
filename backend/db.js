const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ProdigiousHub',
  port: process.env.DB_PORT || 3001,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection and create database/tables
const connectDatabase = async () => {
  try {
    console.log('🔗 Attempting to connect to MySQL database...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log(`🗄️  Database: ${dbConfig.database}`);
    
    // First, connect without specifying database to create it if needed
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' ready!`);
    await connection.end();

    // Test pool connection with the database
    const poolConnection = await pool.getConnection();
    console.log('✅ Database connection pool established!');
    
    // Create tables
    await createTables();
    
    poolConnection.release();
    console.log('🚀 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('---');
    console.error('Please check:');
    console.error('1. MySQL server is running on port', dbConfig.port);
    console.error('2. Username and password are correct');
    console.error('3. User has necessary permissions');
    process.exit(1);
  }
};

// Create all necessary tables
const createTables = async () => {
  try {
    console.log('📋 Creating database tables...');

    // Users table - Core user information and gamification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        
        -- Profile fields
        display_name VARCHAR(100) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        skills JSON DEFAULT NULL,
        profile_picture LONGTEXT DEFAULT NULL,
        location VARCHAR(100) DEFAULT NULL,
        github_username VARCHAR(100) DEFAULT NULL,
        linkedin_url VARCHAR(255) DEFAULT NULL,
        portfolio_url VARCHAR(255) DEFAULT NULL,
        profile_completed BOOLEAN DEFAULT FALSE,
        
        -- Gamification fields
        level INT DEFAULT 1,
        total_xp INT DEFAULT 0,
        current_xp INT DEFAULT 0,
        next_level_xp INT DEFAULT 1000,
        
        -- Verification and security
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255) DEFAULT NULL,
        verification_expires DATETIME DEFAULT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_expires DATETIME DEFAULT NULL,
        
        -- Discord integration
        discord_id VARCHAR(50) DEFAULT NULL,
        discord_username VARCHAR(100) DEFAULT NULL,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Indexes for performance
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_verification_token (verification_token),
        INDEX idx_reset_token (reset_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Projects table - Project management and collaboration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        creator_id INT NOT NULL,
        status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
        difficulty ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
        max_participants INT DEFAULT 5,
        current_participants INT DEFAULT 1,
        xp_reward INT DEFAULT 100,
        tags JSON,
        discord_channel_id VARCHAR(50) DEFAULT NULL,
        github_repo VARCHAR(255) DEFAULT NULL,
        deadline DATE DEFAULT NULL,
        poster_image LONGTEXT DEFAULT NULL,
        slug VARCHAR(255) DEFAULT NULL,
        custom_content LONGTEXT DEFAULT NULL,
        
        -- Advanced customization fields for management system
        theme_settings JSON DEFAULT NULL,
        layout_config JSON DEFAULT NULL,
        custom_sections JSON DEFAULT NULL,
        navbar_theme JSON DEFAULT NULL,
        background_config JSON DEFAULT NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes
        INDEX idx_creator (creator_id),
        INDEX idx_status (status),
        INDEX idx_difficulty (difficulty),
        INDEX idx_slug (slug),
        INDEX idx_status_difficulty (status, difficulty)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Project participants table - Track who's working on what
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('creator', 'collaborator', 'contributor') DEFAULT 'collaborator',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contribution_score INT DEFAULT 0,
        
        -- Ensure unique participation
        UNIQUE KEY unique_participant (project_id, user_id),
        
        -- Foreign key constraints
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes
        INDEX idx_project (project_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Achievements table - Define available achievements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT '🏆',
        category ENUM('projects', 'collaboration', 'skills', 'community', 'special') DEFAULT 'projects',
        xp_reward INT DEFAULT 50,
        requirements JSON,
        rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Indexes
        INDEX idx_category (category),
        INDEX idx_rarity (rarity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // User achievements table - Track earned achievements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure unique achievement per user
        UNIQUE KEY unique_user_achievement (user_id, achievement_id),
        
        -- Foreign key constraints
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        
        -- Indexes
        INDEX idx_user (user_id),
        INDEX idx_achievement (achievement_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Sessions table - JWT session management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        device_info TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes for performance
        INDEX idx_user (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Activity feed table - Track all platform activity
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        project_id INT DEFAULT NULL,
        action_type ENUM(
          'user_registered', 
          'email_verified',
          'project_created', 
          'project_joined', 
          'project_completed', 
          'achievement_earned', 
          'level_up',
          'profile_completed'
        ) NOT NULL,
        description TEXT,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraints (allow NULL for system events)
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        
        -- Indexes
        INDEX idx_user (user_id),
        INDEX idx_project (project_id),
        INDEX idx_action_type (action_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Project comments table - Comments system for projects
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        parent_id INT DEFAULT NULL,
        content TEXT NOT NULL,
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

    // Project reviews table - Reviews from participants only
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
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

    console.log('✅ All database tables created successfully!');
    
    // Insert default achievements
    await insertDefaultAchievements();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

// Insert default achievements for the platform
const insertDefaultAchievements = async () => {
  try {
    console.log('🏆 Setting up default achievements...');
    
    const defaultAchievements = [
      {
        name: 'Welcome to the Hub!',
        description: 'Successfully verified your email address',
        icon: '🎉',
        category: 'special',
        xp_reward: 100,
        requirements: JSON.stringify({ email_verified: true }),
        rarity: 'common'
      },
      {
        name: 'First Steps',
        description: 'Complete your first project',
        icon: '🎯',
        category: 'projects',
        xp_reward: 200,
        requirements: JSON.stringify({ projects_completed: 1 }),
        rarity: 'common'
      },
      {
        name: 'Team Player',
        description: 'Join 5 different projects',
        icon: '🤝',
        category: 'collaboration',
        xp_reward: 300,
        requirements: JSON.stringify({ projects_joined: 5 }),
        rarity: 'rare'
      },
      {
        name: 'Code Master',
        description: 'Complete 10 projects successfully',
        icon: '👑',
        category: 'projects',
        xp_reward: 500,
        requirements: JSON.stringify({ projects_completed: 10 }),
        rarity: 'epic'
      },
      {
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '⭐',
        category: 'special',
        xp_reward: 400,
        requirements: JSON.stringify({ level: 10 }),
        rarity: 'rare'
      },
      {
        name: 'Community Leader',
        description: 'Create 5 successful projects',
        icon: '🚀',
        category: 'community',
        xp_reward: 600,
        requirements: JSON.stringify({ projects_created: 5 }),
        rarity: 'epic'
      },
      {
        name: 'Legend',
        description: 'Reach level 25',
        icon: '🔥',
        category: 'special',
        xp_reward: 1000,
        requirements: JSON.stringify({ level: 25 }),
        rarity: 'legendary'
      }
    ];

    for (const achievement of defaultAchievements) {
      try {
        await pool.query(`
          INSERT IGNORE INTO achievements (name, description, icon, category, xp_reward, requirements, rarity)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.category,
          achievement.xp_reward,
          achievement.requirements,
          achievement.rarity
        ]);
      } catch (error) {
        // Ignore duplicate entries
        if (error.code !== 'ER_DUP_ENTRY') {
          console.warn('Warning inserting achievement:', achievement.name, error.message);
        }
      }
    }
    
    console.log('✅ Default achievements ready!');
    
  } catch (error) {
    console.error('❌ Error setting up achievements:', error.message);
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('🔌 Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', closeDatabase);
process.on('SIGINT', closeDatabase);

module.exports = {
  pool,
  connectDatabase,
  closeDatabase
};
