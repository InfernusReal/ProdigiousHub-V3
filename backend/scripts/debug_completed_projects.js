const mysql = require('mysql2/promise');
require('dotenv').config();

const debugCompletedProjects = async () => {
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

    console.log('🔗 Connected to database for debugging...');

    // Check completed projects
    console.log('\n📋 Checking completed projects...');
    const [completedProjects] = await connection.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.status, 
        p.completed_at, 
        p.creator_id,
        (SELECT username FROM users WHERE id = p.creator_id) as creator_username
      FROM projects p 
      WHERE p.status = 'completed'
    `);

    console.log('Completed projects found:', completedProjects.length);
    completedProjects.forEach(project => {
      console.log(`- ID: ${project.id}, Title: ${project.title}, Creator: ${project.creator_username} (ID: ${project.creator_id}), Completed: ${project.completed_at}`);
    });

    // Check project participants for completed projects
    console.log('\n👥 Checking project participants for completed projects...');
    const [participants] = await connection.execute(`
      SELECT 
        pp.project_id,
        pp.user_id,
        pp.completed_at as participant_completed_at,
        p.title,
        p.completed_at as project_completed_at,
        (SELECT username FROM users WHERE id = pp.user_id) as participant_username
      FROM project_participants pp
      JOIN projects p ON pp.project_id = p.id
      WHERE p.status = 'completed'
    `);

    console.log('Participants in completed projects:', participants.length);
    participants.forEach(participant => {
      console.log(`- Project: ${participant.title}, User: ${participant.participant_username} (ID: ${participant.user_id}), Participant Completed: ${participant.participant_completed_at}, Project Completed: ${participant.project_completed_at}`);
    });

    // Check all users
    console.log('\n👤 All users:');
    const [users] = await connection.execute('SELECT id, username FROM users');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Database connection closed');
    }
  }
};

debugCompletedProjects();
