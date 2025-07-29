const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get project customization data
router.get('/:slug/editor-data', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [projects] = await pool.query(
      `SELECT * FROM projects WHERE slug = ?`,
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Check if user is the creator
    if (project.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. Only project creator can access editor.' });
    }

    // Parse JSON fields safely
    const editorData = {
      id: project.id,
      title: project.title,
      description: project.description,
      poster_image: project.poster_image,
      status: project.status,
      difficulty: project.difficulty,
      xp_reward: project.xp_reward,
      max_participants: project.max_participants,
      current_participants: project.current_participants,
      tags: project.tags ? JSON.parse(project.tags) : [],
      github_repo: project.github_repo,
      deadline: project.deadline,
      created_at: project.created_at,
      updated_at: project.updated_at,
      theme_settings: project.theme_settings ? JSON.parse(project.theme_settings) : getDefaultTheme(),
      layout_config: project.layout_config ? JSON.parse(project.layout_config) : getDefaultLayout(),
      custom_sections: project.custom_sections ? JSON.parse(project.custom_sections) : [],
      navbar_theme: project.navbar_theme ? JSON.parse(project.navbar_theme) : getDefaultNavbarTheme(),
      background_config: project.background_config ? JSON.parse(project.background_config) : getDefaultBackground()
    };

    res.json(editorData);
  } catch (error) {
    console.error('Error fetching editor data:', error);
    res.status(500).json({ error: 'Failed to fetch editor data' });
  }
});

// Update project customization
router.put('/:slug/editor-data', [
  authenticateToken,
  body('theme_settings').optional().isObject(),
  body('layout_config').optional().isArray(),
  body('custom_sections').optional().isArray(),
  body('navbar_theme').optional().isObject(),
  body('background_config').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slug } = req.params;
    const { theme_settings, layout_config, custom_sections, navbar_theme, background_config } = req.body;

    // First, get the project and verify ownership
    const [projects] = await pool.query(
      'SELECT id, creator_id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    if (project.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. Only project creator can edit.' });
    }

    // Update the project with new customization data
    await pool.query(
      `UPDATE projects SET 
        theme_settings = ?,
        layout_config = ?,
        custom_sections = ?,
        navbar_theme = ?,
        background_config = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        theme_settings ? JSON.stringify(theme_settings) : null,
        layout_config ? JSON.stringify(layout_config) : null,
        custom_sections ? JSON.stringify(custom_sections) : null,
        navbar_theme ? JSON.stringify(navbar_theme) : null,
        background_config ? JSON.stringify(background_config) : null,
        project.id
      ]
    );

    res.json({ message: 'Project customization updated successfully' });
  } catch (error) {
    console.error('Error updating editor data:', error);
    res.status(500).json({ error: 'Failed to update project customization' });
  }
});

// Upload custom assets (images, logos)
router.post('/:slug/upload-asset', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { asset_data, asset_name, asset_type } = req.body;

    // Verify project ownership
    const [projects] = await pool.query(
      'SELECT id, creator_id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projects[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, we'll return the asset data as-is
    // In production, you might want to store this in a separate assets table
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      asset_id: assetId,
      asset_url: asset_data, // Base64 data or URL
      asset_name,
      asset_type
    });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Get predefined themes
router.get('/themes', (req, res) => {
  const themes = [
    {
      id: 'light-blue',
      name: 'Light Blue',
      primary_color: '#3b82f6',
      secondary_color: '#e5e7eb',
      background_color: '#ffffff',
      text_color: '#1f2937',
      accent_color: '#10b981'
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      primary_color: '#1f2937',
      secondary_color: '#374151',
      background_color: '#111827',
      text_color: '#f9fafb',
      accent_color: '#fbbf24'
    },
    {
      id: 'blue-golden',
      name: 'Blue & Golden',
      primary_color: '#1e40af',
      secondary_color: '#fbbf24',
      background_color: '#f8fafc',
      text_color: '#1e293b',
      accent_color: '#dc2626'
    },
    {
      id: 'ocean-breeze',
      name: 'Ocean Breeze',
      primary_color: '#0891b2',
      secondary_color: '#67e8f9',
      background_color: '#f0f9ff',
      text_color: '#0c4a6e',
      accent_color: '#059669'
    },
    {
      id: 'sunset-glow',
      name: 'Sunset Glow',
      primary_color: '#ea580c',
      secondary_color: '#fed7aa',
      background_color: '#fffbeb',
      text_color: '#9a3412',
      accent_color: '#dc2626'
    }
  ];

  res.json(themes);
});

// Default configuration functions
function getDefaultTheme() {
  return {
    id: 'light-blue',
    name: 'Light Blue',
    primary_color: '#3b82f6',
    secondary_color: '#e5e7eb',
    background_color: '#ffffff',
    text_color: '#1f2937',
    accent_color: '#10b981',
    custom_css: ''
  };
}

function getDefaultLayout() {
  return {
    grid_enabled: true,
    grid_size: 20,
    responsive_mode: true,
    container_width: '1200px',
    container_padding: '20px',
    snap_to_grid: false
  };
}

function getDefaultNavbarTheme() {
  return {
    background: '#3b82f6',
    text_color: '#ffffff',
    logo_url: null,
    transparency: 1.0,
    position: 'fixed',
    height: '64px'
  };
}

function getDefaultBackground() {
  return {
    type: 'solid',
    color: '#ffffff',
    gradient: null,
    image_url: null,
    overlay_opacity: 0,
    pattern: null
  };
}

// Update project core data (poster_image, description, etc.)
router.put('/:slug/project-data', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { poster_image, description, title } = req.body;

    // First, get the project and verify ownership
    const [projects] = await pool.query(
      'SELECT id, creator_id FROM projects WHERE slug = ?',
      [slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    if (project.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. Only project creator can edit.' });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (poster_image !== undefined) {
      updateFields.push('poster_image = ?');
      updateValues.push(poster_image);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(project.id);

    // Update the project
    await pool.query(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ success: true, message: 'Project updated successfully' });

  } catch (error) {
    console.error('Error updating project data:', error);
    res.status(500).json({ error: 'Failed to update project data' });
  }
});

module.exports = router;
