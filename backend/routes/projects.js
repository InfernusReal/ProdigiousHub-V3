const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { updateUserLevel, getXPLimitsForDifficulty } = require('../utils/leveling');
const { createNotification } = require('./notifications');
const { setupProjectDiscordIntegration, addUserToProjectRole, handleProjectCompletion } = require('../services/discord');
const multer = require('multer');
const path = require('path');

// Helper function to safely parse JSON
const safeJSONParse = (data, defaultValue = null) => {
  if (!data) return defaultValue;
  
  // If data is already an object, return it
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  
  // If data is a string, try to parse it
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse JSON:', data, error.message);
      return defaultValue;
    }
  }
  
  return defaultValue;
};

// Configure multer for project images
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Helper function to generate unique slug
const generateSlug = (title, id) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + id;
};

// Helper function to award XP
const awardXP = async (userId, amount, reason) => {
  try {
    const [users] = await pool.query(
      'SELECT level, current_xp, next_level_xp FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) return;
    
    const user = users[0];
    let newCurrentXP = user.current_xp + amount;
    let newLevel = user.level;
    let newNextLevelXP = user.next_level_xp;
    
    // Check for level up
    while (newCurrentXP >= newNextLevelXP) {
      newCurrentXP -= newNextLevelXP;
      newLevel++;
      newNextLevelXP = Math.floor(newNextLevelXP * 1.5); // Exponential scaling
    }
    
    await pool.query(`
      UPDATE users 
      SET total_xp = total_xp + ?, current_xp = ?, level = ?, next_level_xp = ?
      WHERE id = ?
    `, [amount, newCurrentXP, newLevel, newNextLevelXP, userId]);
    
    // Log XP activity
    await pool.query(`
      INSERT INTO activity_feed (user_id, action_type, description, data)
      VALUES (?, 'level_up', ?, ?)
    `, [
      userId,
      `Earned ${amount} XP for ${reason}`,
      JSON.stringify({ xp_gained: amount, reason, new_level: newLevel })
    ]);
    
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
};

// GET /api/projects - Get all projects with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const difficulty = req.query.difficulty || 'all';
    const search = req.query.search || '';

    let whereConditions = [];
    let params = [];

    // By default, exclude completed projects from the live feed
    if (status === 'all') {
      whereConditions.push('p.status != ?');
      params.push('completed');
    } else {
      whereConditions.push('p.status = ?');
      params.push(status);
    }

    if (difficulty !== 'all') {
      whereConditions.push('p.difficulty = ?');
      params.push(difficulty);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Debug logging
    console.log('SQL Debug:', {
      whereClause,
      params,
      limit: limit,
      offset: offset,
      limitType: typeof limit,
      offsetType: typeof offset
    });

    // Get projects with creator info - use query instead of execute for better compatibility
    const projectQuery = `
      SELECT 
        p.*,
        u.username as creator_username,
        u.display_name as creator_display_name,
        u.profile_picture as creator_avatar,
        (SELECT COUNT(*) FROM project_participants pp WHERE pp.project_id = p.id) as participant_count
      FROM projects p
      LEFT JOIN users u ON p.creator_id = u.id
      ` + whereClause + `
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Ensure limit and offset are integers
    const queryParams = [...params, parseInt(limit), parseInt(offset)];
    console.log('Final query params:', queryParams);
    console.log('Clean query:', projectQuery);

    // Try using query instead of execute
    const [projects] = await pool.query(projectQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM projects p 
      ` + whereClause;
    
    const [countResult] = await pool.query(countQuery, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON fields safely
    const formattedProjects = projects.map(project => ({
      ...project,
      tags: safeJSONParse(project.tags, []),
      slug: generateSlug(project.title, project.id)
    }));

    res.json({
      success: true,
      projects: formattedProjects,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// GET /api/projects/my - Get current user's projects
router.get('/my', auth, async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM project_participants pp WHERE pp.project_id = p.id) as participant_count
      FROM projects p
      WHERE p.creator_id = ? AND p.status != 'completed'
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    const formattedProjects = projects.map(project => ({
      ...project,
      tags: safeJSONParse(project.tags, []),
      slug: generateSlug(project.title, project.id)
    }));

    res.json({
      success: true,
      projects: formattedProjects
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your projects'
    });
  }
});

// GET /api/projects/participating - Get projects user is participating in
router.get('/participating', auth, async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT 
        p.*,
        u.username as creator_username,
        u.display_name as creator_display_name,
        u.profile_picture as creator_avatar,
        pp.role as my_role,
        pp.joined_at,
        (SELECT COUNT(*) FROM project_participants pp2 WHERE pp2.project_id = p.id) as participant_count
      FROM projects p
      INNER JOIN project_participants pp ON p.id = pp.project_id
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE pp.user_id = ? AND p.creator_id != ? AND p.status != 'completed'
      ORDER BY pp.joined_at DESC
    `, [req.user.id, req.user.id]);

    const formattedProjects = projects.map(project => ({
      ...project,
      tags: safeJSONParse(project.tags, []),
      slug: generateSlug(project.title, project.id)
    }));

    res.json({
      success: true,
      projects: formattedProjects
    });

  } catch (error) {
    console.error('Error fetching participating projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects you\'re participating in'
    });
  }
});

// GET /api/projects/completed - Get completed projects for current user
router.get('/completed', auth, async (req, res) => {
  try {
    console.log('Fetching completed projects for user:', req.user.id);
    
    const [projects] = await pool.query(`
      SELECT 
        p.*,
        u.username as creator_username,
        u.display_name as creator_display_name,
        u.profile_picture as creator_avatar,
        pp.role as my_role,
        pp.joined_at,
        COALESCE(pp.completed_at, p.completed_at) as project_completed_at,
        'participant' as completion_type,
        (SELECT COUNT(*) FROM project_participants pp2 WHERE pp2.project_id = p.id) as participant_count
      FROM projects p
      INNER JOIN project_participants pp ON p.id = pp.project_id
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE pp.user_id = ? AND p.status = 'completed' AND p.creator_id != ?
      
      UNION ALL
      
      SELECT 
        p.*,
        u.username as creator_username,
        u.display_name as creator_display_name,
        u.profile_picture as creator_avatar,
        'creator' as my_role,
        p.created_at as joined_at,
        p.completed_at as project_completed_at,
        'creator' as completion_type,
        (SELECT COUNT(*) FROM project_participants pp2 WHERE pp2.project_id = p.id) as participant_count
      FROM projects p
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE p.creator_id = ? AND p.status = 'completed'
      
      ORDER BY project_completed_at DESC
    `, [req.user.id, req.user.id, req.user.id]);

    console.log('Found completed projects:', projects.length);
    console.log('Project details:', projects.map(p => ({ id: p.id, title: p.title, creator_id: p.creator_id, completion_type: p.completion_type })));

    const formattedProjects = projects.map(project => ({
      ...project,
      completed_at: project.project_completed_at, // Map back to expected field name
      tags: safeJSONParse(project.tags, []),
      slug: generateSlug(project.title, project.id)
    }));

    res.json({
      success: true,
      projects: formattedProjects
    });

  } catch (error) {
    console.error('Error fetching completed projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed projects'
    });
  }
});

// GET /api/projects/feed - Get activity feed for dashboard
router.get('/feed', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    console.log('Feed Debug:', {
      limit: limit,
      limitType: typeof limit
    });

    const feedQuery = `
      SELECT 
        af.*,
        u.username,
        u.display_name,
        u.profile_picture,
        p.title as project_title,
        p.id as project_id
      FROM activity_feed af
      LEFT JOIN users u ON af.user_id = u.id
      LEFT JOIN projects p ON af.project_id = p.id
      WHERE af.action_type IN ('project_created', 'project_joined', 'project_completed', 'achievement_earned', 'level_up', 'profile_completed')
      ORDER BY af.created_at DESC
      LIMIT ?
    `;

    console.log('Clean feed query:', feedQuery);

    // Try using query instead of execute
    const [activities] = await pool.query(feedQuery, [parseInt(limit)]);

    const formattedActivities = activities.map(activity => ({
      ...activity,
      data: safeJSONParse(activity.data, {}),
      project_slug: activity.project_id ? generateSlug(activity.project_title, activity.project_id) : null
    }));

    res.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed'
    });
  }
});

// POST /api/projects - Create new project
router.post('/', [
  auth,
  upload.single('poster_image'),
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid difficulty level'),
    body('max_participants').isInt({ min: 2, max: 20 }).withMessage('Max participants must be 2-20'),
    body('xp_reward').isInt({ min: 50, max: 1500 }).withMessage('XP reward must be 50-1500'),
    body('tags').optional().custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Tags must be valid JSON array');
      }
    }),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
    body('github_repo').optional().isURL().withMessage('Invalid GitHub repo URL')
  ]
], async (req, res) => {
  try {
    console.log('🚀 POST /api/projects called');
    console.log('📝 Request body:', req.body);
    console.log('📷 Request file:', req.file ? 'Present' : 'None');
    console.log('👤 User:', req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      difficulty,
      max_participants,
      xp_reward,
      tags: rawTags,
      deadline,
      github_repo
    } = req.body;

    // Parse tags if it's a string
    let tags = rawTags;
    if (typeof rawTags === 'string') {
      try {
        tags = JSON.parse(rawTags);
      } catch (error) {
        tags = [];
      }
    }

    console.log('🏷️ Parsed tags:', tags);

    // Validate XP reward based on difficulty
    const xpLimits = getXPLimitsForDifficulty(difficulty);
    if (xp_reward < xpLimits.min || xp_reward > xpLimits.max) {
      return res.status(400).json({
        success: false,
        message: `XP reward must be between ${xpLimits.min} and ${xpLimits.max} for ${difficulty} difficulty`
      });
    }

    // Handle poster image
    let posterImageBase64 = null;
    if (req.file) {
      posterImageBase64 = req.file.buffer.toString('base64');
    }

    if (!posterImageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Poster image is required'
      });
    }

    // Create project
    const [result] = await pool.query(`
      INSERT INTO projects (
        title, description, creator_id, difficulty, max_participants, 
        xp_reward, tags, deadline, github_repo, poster_image, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      req.user.id,
      difficulty,
      max_participants,
      xp_reward,
      JSON.stringify(tags || []),
      deadline || null,
      github_repo || null,
      posterImageBase64,
      '' // Will be updated after we get the ID
    ]);

    const projectId = result.insertId;
    const slug = generateSlug(title, projectId);

    // Update with generated slug
    await pool.query('UPDATE projects SET slug = ? WHERE id = ?', [slug, projectId]);

    // Add creator as first participant
    await pool.query(`
      INSERT INTO project_participants (project_id, user_id, role)
      VALUES (?, ?, 'creator')
    `, [projectId, req.user.id]);

    // Award XP for creating project
    await awardXP(req.user.id, 100, 'Creating a new project');

    // Add to activity feed
    await pool.query(`
      INSERT INTO activity_feed (user_id, project_id, action_type, description, data)
      VALUES (?, ?, 'project_created', ?, ?)
    `, [
      req.user.id,
      projectId,
      `${req.user.display_name || req.user.username} created a new project: ${title}`,
      JSON.stringify({ 
        project_title: title, 
        difficulty, 
        max_participants,
        xp_reward 
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project: {
        id: projectId,
        slug,
        title,
        description,
        difficulty,
        max_participants,
        xp_reward
      }
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    console.error('📊 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// GET /api/projects/:slug - Get project by slug
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

    // Get comments (we'll create this table next)
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
      tags: safeJSONParse(project.tags, []),
      slug: generateSlug(project.title, project.id),
      participants,
      comments: comments || [],
      custom_content: safeJSONParse(project.custom_content, {})
    };

    res.json({
      success: true,
      project: formattedProject
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

// POST /api/projects/:slug/setup-discord - Setup Discord integration for project (creator only)
router.post('/:slug/setup-discord', auth, async (req, res) => {
  try {
    const { slug } = req.params;
    const slugParts = slug.split('-');
    const projectId = slugParts[slugParts.length - 1];

    if (!projectId || isNaN(projectId)) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project exists and user is creator
    const [projects] = await pool.query(`
      SELECT * FROM projects WHERE id = ? AND creator_id = ?
    `, [projectId, req.user.id]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the creator'
      });
    }

    const project = projects[0];

    // Check if Discord integration already exists
    if (project.discord_channel_id && project.discord_role_id) {
      return res.status(400).json({
        success: false,
        message: 'Discord integration already set up for this project'
      });
    }

    // Get all participants (including creator)
    const [participants] = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.discord_id,
        u.discord_username,
        pp.role
      FROM project_participants pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.project_id = ?
      UNION
      SELECT 
        u.id,
        u.username,
        u.discord_id,
        u.discord_username,
        'creator' as role
      FROM users u
      WHERE u.id = ? AND NOT EXISTS (
        SELECT 1 FROM project_participants WHERE project_id = ? AND user_id = ?
      )
    `, [projectId, project.creator_id, projectId, project.creator_id]);

    // Filter participants who have Discord connected
    const discordParticipants = participants.filter(p => p.discord_id);

    if (discordParticipants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No participants have connected Discord accounts'
      });
    }

    // Setup Discord integration
    const discordResult = await setupProjectDiscordIntegration(project, discordParticipants);

    // Update project with Discord info
    await pool.query(`
      UPDATE projects 
      SET discord_channel_id = ?, discord_role_id = ?
      WHERE id = ?
    `, [discordResult.channelId, discordResult.roleId, projectId]);

    res.json({
      success: true,
      message: 'Discord integration set up successfully!',
      discord: {
        channelName: discordResult.channelName,
        roleName: discordResult.roleName,
        participantsAdded: discordParticipants.length
      }
    });

  } catch (error) {
    console.error('Error setting up Discord integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set up Discord integration'
    });
  }
});

// POST /api/projects/:slug/join - Join a project
router.post('/:slug/join', auth, async (req, res) => {
  try {
    const { slug } = req.params;
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
      SELECT p.*, 
             creator.discord_id as creator_discord_id,
             user.discord_id as user_discord_id
      FROM projects p
      LEFT JOIN users creator ON p.creator_id = creator.id
      LEFT JOIN users user ON user.id = ?
      WHERE p.id = ? AND p.status = 'open'
    `, [req.user.id, projectId]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not accepting new members'
      });
    }

    const project = projects[0];

    // Check if user is already a participant
    const [existingParticipant] = await pool.query(`
      SELECT * FROM project_participants WHERE project_id = ? AND user_id = ?
    `, [projectId, req.user.id]);

    if (existingParticipant.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    // Check if project is full
    const [participantCount] = await pool.query(`
      SELECT COUNT(*) as count FROM project_participants WHERE project_id = ?
    `, [projectId]);

    if (participantCount[0].count >= project.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Project is full'
      });
    }

    // Add user as participant
    await pool.query(`
      INSERT INTO project_participants (project_id, user_id, role)
      VALUES (?, ?, 'collaborator')
    `, [projectId, req.user.id]);

    // Update project participant count
    await pool.query(`
      UPDATE projects SET current_participants = current_participants + 1
      WHERE id = ?
    `, [projectId]);

    // Award XP for joining project
    await awardXP(req.user.id, 25, 'Joining a project');

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

    // Create notification for project creator
    await createNotification(pool, {
      userId: project.creator_id,
      senderId: req.user.id,
      type: 'project_join',
      title: 'New Team Member! 👥',
      message: `${req.user.display_name || req.user.username} has joined your project "${project.title}".`,
      data: {
        project_slug: project.slug,
        project_title: project.title,
        joined_user: req.user.username
      }
    });

    // Add to Discord if integration exists and user has Discord connected
    if (project.discord_role_id && project.user_discord_id) {
      try {
        await addUserToProjectRole(project.user_discord_id, project.discord_role_id);
        console.log(`✅ Added user ${req.user.username} to Discord role for project ${project.title}`);
        
        // If there's a project channel, send a welcome message
        if (project.discord_channel_id) {
          const { sendProjectWelcomeMessage } = require('../services/discord');
          await sendProjectWelcomeMessage(project.discord_channel_id, {
            username: req.user.display_name || req.user.username,
            project_title: project.title,
            project_description: project.description,
            project_slug: project.slug,
            discord_user_id: project.user_discord_id
          });
        }
      } catch (discordError) {
        console.error('Error adding user to Discord role:', discordError);
        // Don't fail the request if Discord fails
      }
    }

    res.json({
      success: true,
      message: 'Successfully joined the project!',
      discordIntegration: !!(project.discord_role_id && project.user_discord_id)
    });

  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join project'
    });
  }
});

// PUT /api/projects/:slug/manage - Update project (creator only)
router.put('/:slug/manage', [
  auth,
  upload.single('poster_image'),
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    body('custom_content').optional().isObject()
  ]
], async (req, res) => {
  try {
    const { slug } = req.params;
    const slugParts = slug.split('-');
    const projectId = slugParts[slugParts.length - 1];

    // Verify user is the creator
    const [projects] = await pool.query(`
      SELECT * FROM projects WHERE id = ? AND creator_id = ?
    `, [projectId, req.user.id]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to edit it'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (req.body.title) {
      updateFields.push('title = ?');
      updateValues.push(req.body.title);
    }

    if (req.body.description) {
      updateFields.push('description = ?');
      updateValues.push(req.body.description);
    }

    if (req.body.custom_content) {
      updateFields.push('custom_content = ?');
      updateValues.push(JSON.stringify(req.body.custom_content));
    }

    if (req.file) {
      updateFields.push('poster_image = ?');
      updateValues.push(req.file.buffer.toString('base64'));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(projectId);

    await pool.query(`
      UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);

    res.json({
      success: true,
      message: 'Project updated successfully!'
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// POST /api/projects/:slug/complete - Mark project as completed (creator only)
router.post('/:slug/complete', auth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get project by slug
    const [projects] = await pool.query(
      'SELECT * FROM projects WHERE slug = ? AND creator_id = ?',
      [slug, req.user.id]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the creator'
      });
    }

    const project = projects[0];

    if (project.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Project is already completed'
      });
    }

    // Update project status
    await pool.query(
      'UPDATE projects SET status = "completed", completed_at = NOW() WHERE id = ?',
      [project.id]
    );

    // Update project participants with completion date
    await pool.query(
      'UPDATE project_participants SET completed_at = NOW() WHERE project_id = ?',
      [project.id]
    );

    // Get all participants with Discord info
    const [participants] = await pool.query(`
      SELECT pp.user_id, u.username, u.discord_id, u.discord_username
      FROM project_participants pp
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE pp.project_id = ?
    `, [project.id]);

    // Create list of all users who should get XP (participants + creator)
    const allUsers = [...participants];
    // Add creator if not already in participants
    const creatorAlreadyParticipant = participants.some(p => p.user_id === project.creator_id);
    if (!creatorAlreadyParticipant) {
      // Get creator info
      const [creatorInfo] = await pool.query(`
        SELECT id as user_id, username, discord_id, discord_username
        FROM users WHERE id = ?
      `, [project.creator_id]);
      if (creatorInfo.length > 0) {
        allUsers.push(creatorInfo[0]);
      }
    }

    // Award XP to all participants and creator
    for (const user of allUsers) {
      try {
        await updateUserLevel(pool, user.user_id, project.xp_reward);
        
        // Add activity feed entry
        await pool.query(`
          INSERT INTO activity_feed (user_id, project_id, action_type, description, data)
          VALUES (?, ?, 'project_completed', ?, ?)
        `, [
          user.user_id,
          project.id,
          `Completed "${project.title}" and earned ${project.xp_reward} XP!`,
          JSON.stringify({
            project_title: project.title,
            xp_earned: project.xp_reward,
            difficulty: project.difficulty
          })
        ]);

        // Create notification for the user
        await createNotification(pool, {
          userId: user.user_id,
          type: 'project_completed',
          title: 'Project Completed!',
          message: `"${project.title}" has been completed. You earned ${project.xp_reward} XP!`,
          data: { 
            project_id: project.id, 
            project_title: project.title,
            xp_earned: project.xp_reward 
          }
        });
        
      } catch (error) {
        console.error(`Error awarding XP to user ${user.user_id}:`, error);
      }
    }

    // Handle Discord completion if project has Discord integration
    if (project.discord_channel_id && project.discord_role_id) {
      try {
        await handleProjectCompletion(
          project.discord_channel_id,
          project.discord_role_id,
          {
            project_title: project.title,
            project_description: project.description,
            xp_reward: project.xp_reward,
            project_slug: project.slug
          },
          allUsers
        );
        console.log(`🎉 Sent completion notification and scheduled cleanup for project: ${project.title}`);
      } catch (discordError) {
        console.error('Error handling Discord completion:', discordError);
        // Don't fail the completion if Discord fails
      }
    }

    res.json({
      success: true,
      message: 'Project completed successfully! XP awarded to all participants.',
      xp_awarded: project.xp_reward
    });

  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete project'
    });
  }
});

// POST /api/projects/:slug/comments - Add a comment to a project
router.post('/:slug/comments', auth, async (req, res) => {
  try {
    const { content, parent_id } = req.body;
    const { slug } = req.params;

    // Get project by slug
    const [projects] = await pool.query(
      'SELECT id, title, slug, creator_id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectId = projects[0].id;

    // Insert comment
    const [result] = await pool.query(`
      INSERT INTO project_comments (project_id, user_id, parent_id, comment)
      VALUES (?, ?, ?, ?)
    `, [projectId, req.user.id, parent_id || null, content]);

    // Get the created comment with user info
    const [comment] = await pool.query(`
      SELECT 
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.comment as content,
        pc.parent_id,
        pc.created_at,
        pc.updated_at,
        u.username,
        u.avatar_url,
        u.display_name
      FROM project_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ?
    `, [result.insertId]);

    // Create notification for project creator (if commenter is not the creator)
    const project = projects[0];
    if (project.creator_id !== req.user.id) {
      await createNotification(pool, {
        userId: project.creator_id,
        senderId: req.user.id,
        type: 'project_comment',
        title: 'New Comment on Your Project 💬',
        message: `${req.user.display_name || req.user.username} commented on "${project.title}": "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
        data: {
          project_slug: project.slug,
          project_title: project.title,
          comment_id: result.insertId
        }
      });
    }

    res.status(201).json({
      success: true,
      comment: comment[0]
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// GET /api/projects/:slug/comments - Get comments for a project
router.get('/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get project by slug
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectId = projects[0].id;

    // Get comments with user info
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
        u.avatar_url,
        u.display_name
      FROM project_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ?
      ORDER BY pc.created_at ASC
    `, [projectId]);

    res.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// POST /api/projects/:slug/reviews - Add a review (participants only)
router.post('/:slug/reviews', auth, async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    const { slug } = req.params;

    // Get project by slug
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectId = projects[0].id;

    // Check if user is a participant
    const [participants] = await pool.query(
      'SELECT id FROM project_participants WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (participants.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project participants can leave reviews'
      });
    }

    // Insert or update review
    await pool.query(`
      INSERT INTO project_reviews (project_id, user_id, rating, review_text)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      review_text = VALUES(review_text),
      updated_at = CURRENT_TIMESTAMP
    `, [projectId, req.user.id, rating, review_text]);

    res.json({
      success: true,
      message: 'Review submitted successfully!'
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
});

// GET /api/projects/:slug/reviews - Get reviews for a project
router.get('/:slug/reviews', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get project by slug
    const [projects] = await pool.query(
      'SELECT id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectId = projects[0].id;

    // Get reviews with user info
    const [reviews] = await pool.query(`
      SELECT 
        pr.*,
        u.username,
        u.avatar_url,
        u.display_name
      FROM project_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.project_id = ?
      ORDER BY pr.created_at DESC
    `, [projectId]);

    // Calculate average rating
    const [avgRating] = await pool.query(`
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM project_reviews
      WHERE project_id = ?
    `, [projectId]);

    res.json({
      success: true,
      reviews,
      statistics: {
        average_rating: avgRating[0].average_rating || 0,
        total_reviews: avgRating[0].total_reviews
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

module.exports = router;
