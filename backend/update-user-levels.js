const mysql = require('mysql2/promise');
const { calculateLevelFromTotalXP } = require('./utils/leveling');

const updateAllUserLevels = async () => {
  try {
    // Database connection
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'prodigyhub',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connecting to database...');
    
    // Get all users with their current XP
    const [users] = await pool.execute('SELECT id, username, total_xp, xp FROM users');
    
    console.log(`Found ${users.length} users to update`);
    
    for (const user of users) {
      // Use total_xp if available, fallback to xp
      const totalXP = user.total_xp || user.xp || 0;
      const newLevel = calculateLevelFromTotalXP(totalXP);
      
      // Update the user's level
      await pool.execute(
        'UPDATE users SET level = ?, total_xp = ? WHERE id = ?',
        [newLevel, totalXP, user.id]
      );
      
      console.log(`Updated ${user.username}: ${totalXP} XP → Level ${newLevel}`);
    }
    
    console.log('All user levels updated successfully!');
    
    await pool.end();
    
  } catch (error) {
    console.error('Error updating user levels:', error);
  }
};

updateAllUserLevels();
