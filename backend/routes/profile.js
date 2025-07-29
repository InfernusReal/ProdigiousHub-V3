const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper function to calculate level from XP
const calculateLevel = (totalXP) => {
  if (totalXP < 100) return 1;
  if (totalXP < 250) return 2;
  if (totalXP < 500) return 3;
  if (totalXP < 1000) return 4;
  if (totalXP < 2000) return 5;
  if (totalXP < 4000) return 6;
  if (totalXP < 8000) return 7;
  if (totalXP < 15000) return 8;
  if (totalXP < 25000) return 9;
  return 10; // Max level
};

// GET /api/profile/:username - Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Get user basic info
    const [users] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        display_name,
        bio,
        CASE 
          WHEN LENGTH(profile_picture) > 1000000 THEN NULL 
          ELSE profile_picture 
        END as profile_picture,
        total_xp,
        portfolio_url,
        github_username,
        linkedin_url,
        location,
        skills,
        created_at,
        updated_at
      FROM users 
      WHERE username = ?
    `, [username]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get completed projects
    const [completedProjects] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.difficulty,
        p.xp_reward,
        pp.joined_at,
        COALESCE(pp.completed_at, p.completed_at, p.updated_at) as completed_at
      FROM projects p
      JOIN project_participants pp ON p.id = pp.project_id
      WHERE pp.user_id = ? AND p.status = 'completed'
      ORDER BY COALESCE(pp.completed_at, p.completed_at, p.updated_at) DESC
    `, [user.id]);

    // Get active projects
    const [activeProjects] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.difficulty,
        p.xp_reward,
        p.status,
        pp.joined_at
      FROM projects p
      JOIN project_participants pp ON p.id = pp.project_id
      WHERE pp.user_id = ? AND p.status IN ('open', 'in_progress')
      ORDER BY pp.joined_at DESC
    `, [user.id]);

    // Calculate total work hours (simplified calculation)
    const allProjects = [...completedProjects, ...activeProjects];
    const totalWorkHours = allProjects.reduce((total, project) => {
      const startDate = new Date(project.joined_at);
      const endDate = project.completed_at ? new Date(project.completed_at) : new Date();
      const diffInHours = Math.max(0, (endDate - startDate) / (1000 * 60 * 60));
      return total + Math.min(diffInHours, 168); // Max 1 week per project
    }, 0);

    // Format the response
    const profile = {
      ...user,
      current_level: calculateLevel(user.total_xp || 0),
      completed_projects: completedProjects,
      active_projects: activeProjects,
      total_work_hours: Math.round(totalWorkHours),
      projects: allProjects // For backward compatibility
    };

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// PUT /api/profile/update - Update user profile (authenticated)
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const {
      display_name,
      bio,
      portfolio_url,
      github_username,
      linkedin_url,
      location,
      skills
    } = req.body;

    // Update user profile
    await pool.execute(`
      UPDATE users SET
        display_name = ?,
        bio = ?,
        portfolio_url = ?,
        github_username = ?,
        linkedin_url = ?,
        location = ?,
        skills = ?,
        profile_completed = TRUE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      display_name || null,
      bio || null,
      portfolio_url || null,
      github_username || null,
      linkedin_url || null,
      location || null,
      skills ? JSON.stringify(skills) : null,
      req.user.id
    ]);

    // Get updated user data
    const [users] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        display_name,
        bio,
        profile_picture,
        total_xp,
        portfolio_url,
        github_username,
        linkedin_url,
        location,
        skills,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    const updatedUser = {
      ...users[0],
      current_level: calculateLevel(users[0].total_xp || 0),
      profile_completed: true
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;
