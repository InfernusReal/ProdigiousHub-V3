const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/users/search - Search for users
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    let query;
    let params = [];
    
    if (!q || q.trim().length === 0) {
      // Return all users when no query provided
      query = `
        SELECT 
          id,
          username,
          display_name,
          bio,
          profile_picture,
          total_xp,
          level as current_level
        FROM users 
        WHERE is_verified = TRUE
        ORDER BY total_xp DESC
        LIMIT 20
      `;
    } else if (q.trim().length < 2) {
      // Return empty for very short queries
      return res.json({
        success: true,
        users: []
      });
    } else {
      // Search with the provided query
      const searchTerm = `%${q.trim()}%`;
      query = `
        SELECT 
          id,
          username,
          display_name,
          bio,
          profile_picture,
          total_xp,
          level as current_level
        FROM users 
        WHERE (username LIKE ? OR display_name LIKE ? OR bio LIKE ?)
          AND is_verified = TRUE
        ORDER BY total_xp DESC
        LIMIT 10
      `;
      params = [searchTerm, searchTerm, searchTerm];
    }

    const [users] = await pool.execute(query, params);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

module.exports = router;
