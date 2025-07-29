const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { awardXP } = require('../utils/xpSystem');
const { createNotification } = require('./notifications');

// GET /api/dashboard/:slug - Public project view
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Extract ID from slug (last part after final dash)
    const slugParts = slug.split('-');
    const projectId = slugParts[slugParts.length - 1];

    if (!projectId || isNaN(projectId)) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const [projects] = await pool.query(`
      SELECT 
        p.*,
        u.username as creator_username,
        u.display_name as creator_display_name,
        u.profile_picture as creator_avatar,
        u.github_username as creator_github,
        u.linkedin_url as creator_linkedin,
        (SELECT COUNT(*) FROM project_participants pp WHERE pp.project_id = p.id) as participant_count
      FROM projects p
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE p.id = ?
    `, [projectId]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projects[0];

    // Get participants
    const [participants] = await pool.query(`
      SELECT 
        pp.*,
        u.username,
        u.display_name,
        u.profile_picture,
        u.github_username,
        u.linkedin_url
      FROM project_participants pp
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE pp.project_id = ?
      ORDER BY pp.joined_at ASC
    `, [projectId]);

    // Get comments
    const [comments] = await pool.query(`
      SELECT 
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.comment as content,
        pc.parent_id,
        pc.created_at,
        pc.updated_at,
        u.username,
        u.display_name,
        u.profile_picture
      FROM project_comments pc
      LEFT JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ?
      ORDER BY pc.created_at DESC
    `, [projectId]).catch(() => [[]]);

    const formattedProject = {
      ...project,
      tags: (() => {
        try {
          return project.tags ? JSON.parse(project.tags) : [];
        } catch (e) {
          console.warn('Failed to parse tags for project:', project.id);
          return [];
        }
      })(),
      custom_content: (() => {
        try {
          return project.custom_content ? JSON.parse(project.custom_content) : { sections: [] };
        } catch (e) {
          console.warn('Failed to parse custom_content for project:', project.id);
          return { sections: [] };
        }
      })(),
      participants,
      comments: comments || []
    };

    res.json({
      success: true,
      project: formattedProject
    });

  } catch (error) {
    console.error('Error fetching project for public view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

// POST /api/dashboard/:slug/join - Join project (requires auth)
router.post('/:slug/join', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;

    // Extract ID from slug
    const slugParts = slug.split('-');
    const projectId = slugParts[slugParts.length - 1];

    if (!projectId || isNaN(projectId)) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project exists and is open
    const [projects] = await pool.query(`
      SELECT id, title, status, max_participants, current_participants, difficulty, creator_id
      FROM projects 
      WHERE id = ?
    `, [projectId]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projects[0];

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This project is not accepting new members'
      });
    }

    if (project.current_participants >= project.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'This project is already full'
      });
    }

    // Check if user is already a participant
    const [existingParticipant] = await pool.query(`
      SELECT id FROM project_participants 
      WHERE project_id = ? AND user_id = ?
    `, [projectId, req.user.id]);

    if (existingParticipant.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    // Add user as participant
    await pool.query(`
      INSERT INTO project_participants (project_id, user_id, role)
      VALUES (?, ?, 'collaborator')
    `, [projectId, req.user.id]);

    // Update participant count
    await pool.query(`
      UPDATE projects SET current_participants = current_participants + 1
      WHERE id = ?
    `, [projectId]);

    // Award XP for joining project
    await awardXP(req.user.id, 25, 'Joining a project');

    // Create notification for project creator (if joiner is not the creator)
    if (project.creator_id !== req.user.id) {
      await createNotification(pool, {
        userId: project.creator_id,
        senderId: req.user.id,
        type: 'project_join',
        title: 'New Member Joined Your Project! 🎉',
        message: `${req.user.display_name || req.user.username} just joined "${project.title}". Welcome them to the team!`,
        data: {
          project_id: project.id,
          project_title: project.title,
          new_member_id: req.user.id,
          new_member_name: req.user.display_name || req.user.username
        }
      });
    }

    // Add to activity feed
    await pool.query(`
      INSERT INTO activity_feed (user_id, project_id, action_type, description, data)
      VALUES (?, ?, 'project_joined', ?, ?)
    `, [
      req.user.id,
      projectId,
      `${req.user.display_name || req.user.username} joined the project: ${project.title}`,
      JSON.stringify({ 
        project_title: project.title,
        difficulty: project.difficulty 
      })
    ]);

    res.json({
      success: true,
      message: 'Successfully joined the project!'
    });

  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join project'
    });
  }
});

module.exports = router;
