const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'prodigioushub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection and create database/tables
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Test pool connection
    const poolConnection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    
    // Create tables
    await createTables();
    
    poolConnection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Create all necessary tables
const createTables = async () => {
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255),
        level INT DEFAULT 1,
        total_xp INT DEFAULT 0,
        current_xp INT DEFAULT 0,
        next_level_xp INT DEFAULT 1000,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        verification_expires DATETIME,
        reset_token VARCHAR(255),
        reset_expires DATETIME,
        discord_id VARCHAR(50),
        discord_username VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await pool.execute(`
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
        discord_channel_id VARCHAR(50),
        github_repo VARCHAR(255),
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Project participants table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS project_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('creator', 'collaborator', 'contributor') DEFAULT 'collaborator',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contribution_score INT DEFAULT 0,
        UNIQUE KEY unique_participant (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Achievements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        category ENUM('projects', 'collaboration', 'skills', 'community', 'special') DEFAULT 'projects',
        xp_reward INT DEFAULT 50,
        requirements JSON,
        rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User achievements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
      )
    `);

    // Sessions table for JWT management
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        device_info TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Feed/Activity table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        project_id INT,
        action_type ENUM('project_created', 'project_joined', 'project_completed', 'achievement_earned', 'level_up') NOT NULL,
        description TEXT,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Database tables created successfully!');
    
    // Insert default achievements
    await insertDefaultAchievements();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

// Insert default achievements
const insertDefaultAchievements = async () => {
  const defaultAchievements = [
    {
      name: 'First Steps',
      description: 'Complete your first project',
      icon: '🎯',
      category: 'projects',
      xp_reward: 100,
      requirements: JSON.stringify({ projects_completed: 1 }),
      rarity: 'common'
    },
    {
      name: 'Team Player',
      description: 'Join 5 different projects',
      icon: '🤝',
      category: 'collaboration',
      xp_reward: 200,
      requirements: JSON.stringify({ projects_joined: 5 }),
      rarity: 'rare'
    },
    {
      name: 'Code Master',
      description: 'Complete 10 projects',
      icon: '👑',
      category: 'projects',
      xp_reward: 500,
      requirements: JSON.stringify({ projects_completed: 10 }),
      rarity: 'epic'
    },
    {
      name: 'Level 10 Hero',
      description: 'Reach level 10',
      icon: '🚀',
      category: 'special',
      xp_reward: 300,
      requirements: JSON.stringify({ level: 10 }),
      rarity: 'rare'
    }
  ];

  for (const achievement of defaultAchievements) {
    try {
      await pool.execute(`
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
    }
  }
};

module.exports = {
  pool,
  initializeDatabase
};
