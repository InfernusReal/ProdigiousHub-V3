const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../db');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Calculate XP for next level
const calculateNextLevelXP = (level) => {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
};

// Level up user if they have enough XP
const checkLevelUp = async (userId) => {
  try {
    const [user] = await pool.execute(
      'SELECT level, total_xp, current_xp, next_level_xp FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) return false;

    const userData = user[0];
    let { level, total_xp, current_xp, next_level_xp } = userData;
    let leveledUp = false;

    // Check if user can level up
    while (current_xp >= next_level_xp) {
      current_xp -= next_level_xp;
      level += 1;
      next_level_xp = calculateNextLevelXP(level);
      leveledUp = true;

      // Add level up activity
      await pool.execute(`
        INSERT INTO activity_feed (user_id, action_type, description, data)
        VALUES (?, 'level_up', ?, ?)
      `, [
        userId,
        `Leveled up to level ${level}!`,
        JSON.stringify({ new_level: level, previous_level: level - 1 })
      ]);
    }

    if (leveledUp) {
      // Update user level and XP
      await pool.execute(`
        UPDATE users 
        SET level = ?, current_xp = ?, next_level_xp = ?
        WHERE id = ?
      `, [level, current_xp, next_level_xp, userId]);

      return { leveledUp: true, newLevel: level };
    }

    return { leveledUp: false };
  } catch (error) {
    console.error('Error checking level up:', error);
    return { leveledUp: false };
  }
};

// Award XP to user
const awardXP = async (userId, xpAmount, reason = 'Activity') => {
  try {
    // Get current user data
    const [user] = await pool.execute(
      'SELECT total_xp, current_xp FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) return false;

    const newTotalXP = user[0].total_xp + xpAmount;
    const newCurrentXP = user[0].current_xp + xpAmount;

    // Update user XP
    await pool.execute(`
      UPDATE users 
      SET total_xp = ?, current_xp = ?
      WHERE id = ?
    `, [newTotalXP, newCurrentXP, userId]);

    // Check for level up
    const levelUpResult = await checkLevelUp(userId);

    return {
      success: true,
      xpAwarded: xpAmount,
      newTotalXP,
      levelUp: levelUpResult
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false };
  }
};

// Store session in database
const storeSession = async (userId, token, deviceInfo, ipAddress) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await pool.execute(`
      INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, tokenHash, expiresAt, deviceInfo, ipAddress]);

    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

// Validate session
const validateSession = async (token) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const [session] = await pool.execute(`
      SELECT s.*, u.id, u.username, u.email, u.is_verified
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > NOW()
    `, [tokenHash]);

    return session.length > 0 ? session[0] : null;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
};

// Clean expired sessions
const cleanExpiredSessions = async () => {
  try {
    await pool.execute('DELETE FROM user_sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('Error cleaning expired sessions:', error);
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateVerificationToken,
  calculateNextLevelXP,
  checkLevelUp,
  awardXP,
  storeSession,
  validateSession,
  cleanExpiredSessions
};
