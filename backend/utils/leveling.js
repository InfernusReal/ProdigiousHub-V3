// ProdigyHub Leveling System
// Updated to match the new leveling requirements

/**
 * Calculate level based on total XP
 * 
 * Level Requirements:
 * - Level 0-1: 50 XP
 * - Level 1-2: 100 XP (total 150)
 * - Level 2-3: 200 XP (total 350)
 * - Level 3-10: 200 XP per level
 * - Level 10-20: 500 XP per level
 * - Level 20-30: 1000 XP per level
 * - Level 30-50: 5000 XP per level
 * - Level 50-90: 10,000 XP per level
 * - Level 90-100: 50,000 XP per level
 * - Level 100+: 100,000 XP per level
 */
const calculateLevelFromTotalXP = (totalXP) => {
  if (totalXP < 50) return 0;
  if (totalXP < 150) return 1; // 50 XP
  if (totalXP < 350) return 2; // 50 + 100 XP
  
  let currentXP = totalXP;
  let level = 0;
  
  // Level 0-1: 50 XP
  if (currentXP >= 50) {
    currentXP -= 50;
    level = 1;
  }
  
  // Level 1-2: 100 XP
  if (currentXP >= 100) {
    currentXP -= 100;
    level = 2;
  }
  
  // Level 2-3: 200 XP
  if (currentXP >= 200) {
    currentXP -= 200;
    level = 3;
  }
  
  // Level 3-10: 200 XP per level (7 levels)
  const levelsAt200 = Math.min(7, Math.floor(currentXP / 200));
  currentXP -= levelsAt200 * 200;
  level += levelsAt200;
  
  if (level >= 10) {
    // Level 10-20: 500 XP per level (10 levels)
    const levelsAt500 = Math.min(10, Math.floor(currentXP / 500));
    currentXP -= levelsAt500 * 500;
    level += levelsAt500;
    
    if (level >= 20) {
      // Level 20-30: 1000 XP per level (10 levels)
      const levelsAt1000 = Math.min(10, Math.floor(currentXP / 1000));
      currentXP -= levelsAt1000 * 1000;
      level += levelsAt1000;
      
      if (level >= 30) {
        // Level 30-50: 5000 XP per level (20 levels)
        const levelsAt5000 = Math.min(20, Math.floor(currentXP / 5000));
        currentXP -= levelsAt5000 * 5000;
        level += levelsAt5000;
        
        if (level >= 50) {
          // Level 50-90: 10,000 XP per level (40 levels)
          const levelsAt10000 = Math.min(40, Math.floor(currentXP / 10000));
          currentXP -= levelsAt10000 * 10000;
          level += levelsAt10000;
          
          if (level >= 90) {
            // Level 90-100: 50,000 XP per level (10 levels)
            const levelsAt50000 = Math.min(10, Math.floor(currentXP / 50000));
            currentXP -= levelsAt50000 * 50000;
            level += levelsAt50000;
            
            if (level >= 100) {
              // Level 100+: 100,000 XP per level
              const levelsAt100000 = Math.floor(currentXP / 100000);
              level += levelsAt100000;
            }
          }
        }
      }
    }
  }
  
  return level;
};

/**
 * Calculate total XP required for a specific level
 */
const getTotalXPForLevel = (targetLevel) => {
  if (targetLevel <= 0) return 0;
  if (targetLevel === 1) return 50;
  if (targetLevel === 2) return 150; // 50 + 100
  if (targetLevel === 3) return 350; // 50 + 100 + 200
  
  let totalXP = 350; // XP for levels 0-3
  
  // Level 3-10: 200 XP per level
  if (targetLevel > 3) {
    const levelsAt200 = Math.min(targetLevel - 3, 7);
    totalXP += levelsAt200 * 200;
  }
  
  // Level 10-20: 500 XP per level
  if (targetLevel > 10) {
    const levelsAt500 = Math.min(targetLevel - 10, 10);
    totalXP += levelsAt500 * 500;
  }
  
  // Level 20-30: 1000 XP per level
  if (targetLevel > 20) {
    const levelsAt1000 = Math.min(targetLevel - 20, 10);
    totalXP += levelsAt1000 * 1000;
  }
  
  // Level 30-50: 5000 XP per level
  if (targetLevel > 30) {
    const levelsAt5000 = Math.min(targetLevel - 30, 20);
    totalXP += levelsAt5000 * 5000;
  }
  
  // Level 50-90: 10,000 XP per level
  if (targetLevel > 50) {
    const levelsAt10000 = Math.min(targetLevel - 50, 40);
    totalXP += levelsAt10000 * 10000;
  }
  
  // Level 90-100: 50,000 XP per level
  if (targetLevel > 90) {
    const levelsAt50000 = Math.min(targetLevel - 90, 10);
    totalXP += levelsAt50000 * 50000;
  }
  
  // Level 100+: 100,000 XP per level
  if (targetLevel > 100) {
    const levelsAt100000 = targetLevel - 100;
    totalXP += levelsAt100000 * 100000;
  }
  
  return totalXP;
};

/**
 * Calculate XP needed for next level
 */
const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevelFromTotalXP(currentXP);
  const nextLevelXP = getTotalXPForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
};

/**
 * Calculate XP progress for current level
 */
const getLevelProgress = (currentXP) => {
  const currentLevel = calculateLevelFromTotalXP(currentXP);
  const currentLevelXP = getTotalXPForLevel(currentLevel);
  const nextLevelXP = getTotalXPForLevel(currentLevel + 1);
  
  const progressXP = currentXP - currentLevelXP;
  const levelTotalXP = nextLevelXP - currentLevelXP;
  
  return {
    currentLevel,
    progressXP,
    levelTotalXP,
    percentage: Math.round((progressXP / levelTotalXP) * 100),
    xpNeeded: levelTotalXP - progressXP
  };
};

/**
 * Update user's level and XP
 */
const updateUserLevel = async (pool, userId, xpGained) => {
  try {
    // Get current user stats
    const [users] = await pool.execute(
      'SELECT total_xp, level FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    const newTotalXP = user.total_xp + xpGained;
    const newLevel = calculateLevelFromTotalXP(newTotalXP);
    const levelProgress = getLevelProgress(newTotalXP);
    
    const leveledUp = newLevel > user.level;
    
    // Update user stats
    await pool.execute(`
      UPDATE users 
      SET total_xp = ?, 
          level = ?
      WHERE id = ?
    `, [
      newTotalXP,
      newLevel,
      userId
    ]);
    
    // If user leveled up, add activity feed entry
    if (leveledUp) {
      await pool.execute(`
        INSERT INTO activity_feed (user_id, action_type, description, data)
        VALUES (?, 'level_up', ?, ?)
      `, [
        userId,
        `Reached level ${newLevel}!`,
        JSON.stringify({
          new_level: newLevel,
          old_level: user.level,
          xp_gained: xpGained
        })
      ]);
    }
    
    return {
      leveledUp,
      oldLevel: user.level,
      newLevel: newLevel,
      totalXP: newTotalXP,
      xpGained,
      levelProgress
    };
    
  } catch (error) {
    console.error('Error updating user level:', error);
    throw error;
  }
};

/**
 * Get XP limits based on difficulty
 */
const getXPLimitsForDifficulty = (difficulty) => {
  const limits = {
    'beginner': { min: 50, max: 100 },
    'intermediate': { min: 100, max: 300 },
    'advanced': { min: 300, max: 600 },
    'expert': { min: 600, max: 1000 }
  };
  
  return limits[difficulty] || limits['beginner'];
};

module.exports = {
  calculateLevelFromTotalXP,
  getTotalXPForLevel,
  getXPForNextLevel,
  getLevelProgress,
  updateUserLevel,
  getXPLimitsForDifficulty
};
