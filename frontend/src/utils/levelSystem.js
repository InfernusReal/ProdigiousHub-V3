/**
 * ProdigyHub Leveling System
 * 
 * Level Requirements:
 * - Level 0-1: 50 XP
 * - Level 1-2: 100 XP
 * - Level 2-3: 200 XP
 * - Level 3-10: 200 XP per level
 * - Level 10-20: 500 XP per level
 * - Level 20-30: 1000 XP per level
 * - Level 30-50: 5000 XP per level
 * - Level 50-90: 10,000 XP per level
 * - Level 90-100: 50,000 XP per level
 * - Level 100+: 100,000 XP per level
 */

// Calculate level based on total XP
export const calculateLevel = (totalXP) => {
  if (totalXP < 50) return 0;
  if (totalXP < 100) return 1;
  if (totalXP < 200) return 2;
  
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

// Calculate total XP required for a specific level
export const getXPRequiredForLevel = (targetLevel) => {
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

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
};

// Calculate XP progress for current level
export const getLevelProgress = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = getXPRequiredForLevel(currentLevel);
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);
  
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

// Get level title based on level
export const getLevelTitle = (level) => {
  if (level >= 100) return 'Legendary Master';
  if (level >= 90) return 'Grandmaster';
  if (level >= 80) return 'Master';
  if (level >= 70) return 'Expert';
  if (level >= 60) return 'Advanced';
  if (level >= 50) return 'Professional';
  if (level >= 40) return 'Senior';
  if (level >= 30) return 'Experienced';
  if (level >= 20) return 'Intermediate';
  if (level >= 10) return 'Developing';
  if (level >= 5) return 'Beginner';
  if (level >= 1) return 'Novice';
  return 'Newcomer';
};

// Get level color based on level
export const getLevelColor = (level) => {
  if (level >= 100) return 'from-purple-600 to-pink-600';
  if (level >= 90) return 'from-yellow-500 to-orange-500';
  if (level >= 80) return 'from-red-500 to-pink-500';
  if (level >= 70) return 'from-orange-500 to-red-500';
  if (level >= 60) return 'from-purple-500 to-purple-600';
  if (level >= 50) return 'from-indigo-500 to-purple-500';
  if (level >= 40) return 'from-blue-500 to-indigo-500';
  if (level >= 30) return 'from-green-500 to-blue-500';
  if (level >= 20) return 'from-yellow-500 to-green-500';
  if (level >= 10) return 'from-blue-400 to-blue-500';
  if (level >= 5) return 'from-green-400 to-green-500';
  if (level >= 1) return 'from-gray-400 to-gray-500';
  return 'from-gray-300 to-gray-400';
};

// Check if user leveled up after gaining XP
export const checkLevelUp = (oldXP, newXP) => {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);
  
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    levelsGained: newLevel - oldLevel
  };
};
