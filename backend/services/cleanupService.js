const { pool } = require('../db');
const cron = require('node-cron');

// Delete unverified accounts after 1 hour
const deleteUnverifiedAccounts = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    
    // Find unverified accounts older than 1 hour
    const [unverifiedUsers] = await pool.execute(`
      SELECT id, email, username FROM users 
      WHERE is_verified = FALSE AND created_at < ?
    `, [oneHourAgo]);

    if (unverifiedUsers.length > 0) {
      console.log(`🗑️  Deleting ${unverifiedUsers.length} unverified accounts older than 1 hour:`);
      
      for (const user of unverifiedUsers) {
        console.log(`   - ${user.email} (${user.username})`);
      }

      // Delete the unverified accounts
      const [result] = await pool.execute(`
        DELETE FROM users 
        WHERE is_verified = FALSE AND created_at < ?
      `, [oneHourAgo]);

      console.log(`✅ Successfully deleted ${result.affectedRows} unverified accounts`);
    }
  } catch (error) {
    console.error('❌ Error deleting unverified accounts:', error);
  }
};

// Run cleanup every 10 minutes
const startCleanupScheduler = () => {
  console.log('🧹 Starting cleanup scheduler for unverified accounts...');
  
  // Run immediately once
  deleteUnverifiedAccounts();
  
  // Then run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    deleteUnverifiedAccounts();
  });
};

module.exports = {
  startCleanupScheduler,
  deleteUnverifiedAccounts
};
