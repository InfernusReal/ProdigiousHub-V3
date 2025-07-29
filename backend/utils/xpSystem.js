const { pool } = require('../db');
const { updateUserLevel } = require('./leveling');

/**
 * Award XP to a user and update their level if necessary
 * @param {number} userId - The user's ID
 * @param {number} xpAmount - The amount of XP to award
 * @param {string} reason - The reason for awarding XP (optional)
 * @returns {Promise<Object>} - Returns the updated user data
 */
const awardXP = async (userId, xpAmount, reason = 'XP awarded') => {
  try {
    // Get current user XP
    const [users] = await pool.execute(
      'SELECT total_xp, current_level FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const currentXP = users[0].total_xp || 0;
    const currentLevel = users[0].current_level || 0;
    
    // Update user XP in database
    await pool.execute(
      'UPDATE users SET total_xp = total_xp + ? WHERE id = ?',
      [xpAmount, userId]
    );
    
    // Use the leveling system to update level if necessary
    const levelUpdate = await updateUserLevel(pool, userId, xpAmount);
    
    console.log(`XP awarded: ${xpAmount} to user ${userId} for ${reason}`);
    
    return {
      success: true,
      xpAwarded: xpAmount,
      newTotalXP: currentXP + xpAmount,
      leveledUp: levelUpdate.leveledUp,
      newLevel: levelUpdate.newLevel,
      reason: reason
    };
    
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

/**
 * Get user's current XP and level info
 * @param {number} userId - The user's ID
 * @returns {Promise<Object>} - Returns user's XP and level data
 */
const getUserXPInfo = async (userId) => {
  try {
    const [users] = await pool.execute(
      'SELECT total_xp, current_level FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    return {
      totalXP: users[0].total_xp || 0,
      currentLevel: users[0].current_level || 0
    };
    
  } catch (error) {
    console.error('Error getting user XP info:', error);
    throw error;
  }
};

module.exports = {
  awardXP,
  getUserXPInfo
};
