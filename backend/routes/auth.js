const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { pool } = require('../db');
const { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  generateVerificationToken,
  storeSession,
  awardXP
} = require('../utils/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to parse skills from various formats
const parseSkills = (skillsData) => {
  if (!skillsData) return [];
  
  try {
    // First try to parse as JSON
    return JSON.parse(skillsData);
  } catch (e) {
    try {
      // If that fails, try to handle JavaScript array literal format
      const skillsStr = skillsData.toString();
      
      // Check if it looks like a JavaScript array
      if (skillsStr.startsWith('[') && skillsStr.endsWith(']')) {
        // Convert JavaScript array literal to proper JSON
        const jsonStr = skillsStr.replace(/'/g, '"');
        return JSON.parse(jsonStr);
      }
      
      // If it's a simple string, wrap it in an array
      return [skillsStr];
    } catch (e2) {
      console.warn('Failed to parse skills:', skillsData);
      return [];
    }
  }
};

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 emails per hour
  message: {
    success: false,
    message: 'Too many verification emails sent, please try again later.'
  }
});

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Comprehensive validation - check for duplicates
    const validationErrors = [];

    // Check email uniqueness
    const [emailCheck] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    
    if (emailCheck.length > 0) {
      validationErrors.push({
        field: 'email',
        message: 'This email address is already registered'
      });
    }

    // Check username uniqueness
    const [usernameCheck] = await pool.execute(
      'SELECT id, username FROM users WHERE username = ?',
      [username]
    );
    
    if (usernameCheck.length > 0) {
      validationErrors.push({
        field: 'username',
        message: 'This username is already taken'
      });
    }

    // Check if display name (firstName + lastName combination) already exists
    const displayName = `${firstName} ${lastName}`;
    const [displayNameCheck] = await pool.execute(
      'SELECT id, first_name, last_name FROM users WHERE CONCAT(first_name, " ", last_name) = ?',
      [displayName]
    );
    
    if (displayNameCheck.length > 0) {
      validationErrors.push({
        field: 'displayName',
        message: 'This name combination is already in use. Please try a different name or add a middle initial.'
      });
    }

    // If any validation errors, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed due to duplicate information',
        errors: validationErrors,
        details: {
          emailTaken: validationErrors.some(e => e.field === 'email'),
          usernameTaken: validationErrors.some(e => e.field === 'username'),
          displayNameTaken: validationErrors.some(e => e.field === 'displayName')
        }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token (but don't send email yet)
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const [result] = await pool.execute(`
      INSERT INTO users (
        username, email, password, first_name, last_name, 
        verification_token, verification_expires
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      username, email, hashedPassword, firstName, lastName,
      verificationToken, verificationExpires
    ]);

    const userId = result.insertId;

    // Send verification email
    const emailSent = await sendVerificationEmail(email, username, verificationToken);
    
    if (!emailSent) {
      // If email fails, still create account but warn
      console.warn('Failed to send verification email to:', email);
    }

    // Add welcome activity
    await pool.execute(`
      INSERT INTO activity_feed (user_id, action_type, description, data)
      VALUES (?, 'user_registered', ?, ?)
    `, [
      userId,
      `${username} joined ProdigiousHub!`,
      JSON.stringify({ username, email })
    ]);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        userId,
        username,
        email,
        verificationEmailSent: emailSent
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/check-availability
// @desc    Check if username, email, or display name is available
// @access  Public
router.post('/check-availability', async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;
    const results = {};

    // Check username availability
    if (username) {
      const [usernameCheck] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      results.username = {
        available: usernameCheck.length === 0,
        message: usernameCheck.length === 0 ? 'Username is available' : 'Username is already taken'
      };
    }

    // Check email availability
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      results.email = {
        available: emailCheck.length === 0,
        message: emailCheck.length === 0 ? 'Email is available' : 'Email is already registered'
      };
    }

    // Check display name availability
    if (firstName && lastName) {
      const displayName = `${firstName} ${lastName}`;
      const [displayNameCheck] = await pool.execute(
        'SELECT id FROM users WHERE CONCAT(first_name, " ", last_name) = ?',
        [displayName]
      );
      results.displayName = {
        available: displayNameCheck.length === 0,
        message: displayNameCheck.length === 0 ? 'Name combination is available' : 'This name combination is already in use'
      };
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Store session
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await storeSession(user.id, token, deviceInfo, ipAddress);

    // Award login XP (only for verified users)
    if (user.is_verified) {
      await awardXP(user.id, 10, 'Daily login');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name,
          bio: user.bio,
          skills: parseSkills(user.skills),
          profile_picture_url: user.profile_picture ? `/api/auth/profile-picture/${user.id}` : null,
          location: user.location,
          github_username: user.github_username,
          linkedin_url: user.linkedin_url,
          portfolio_url: user.portfolio_url,
          profile_completed: user.profile_completed,
          level: user.level,
          xp: user.total_xp,
          current_xp: user.current_xp,
          next_level_xp: user.next_level_xp,
          is_verified: user.is_verified,
          avatar_url: user.avatar_url,
          discord_id: user.discord_id,
          discord_username: user.discord_username
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with valid token
    const [users] = await pool.execute(`
      SELECT * FROM users 
      WHERE verification_token = ? AND verification_expires > NOW()
    `, [token]);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    const user = users[0];

    // Update user as verified
    await pool.execute(`
      UPDATE users 
      SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL
      WHERE id = ?
    `, [user.id]);

    // Award verification XP
    await awardXP(user.id, 100, 'Email verification');

    // Add verification activity
    await pool.execute(`
      INSERT INTO activity_feed (user_id, action_type, description, data)
      VALUES (?, 'email_verified', ?, ?)
    `, [
      user.id,
      `${user.username} verified their email!`,
      JSON.stringify({ email: user.email })
    ]);

    res.json({
      success: true,
      message: 'Email verified successfully! You earned 100 XP!'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/check-verification-status
// @desc    Check if user email is verified
// @access  Public
router.post('/check-verification-status', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      isVerified: Boolean(users[0].is_verified)
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find unverified user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = FALSE',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User not found or already verified'
      });
    }

    const user = users[0];

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await pool.execute(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `, [verificationToken, verificationExpires, user.id]);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, user.username, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/send-verification
// @desc    Send verification email to authenticated user
// @access  Private
router.post('/send-verification', authenticateToken, emailLimiter, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await pool.execute(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `, [verificationToken, verificationExpires, user.id]);

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, user.username, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        bio: user.bio,
        skills: parseSkills(user.skills),
        profile_picture_url: user.profile_picture ? `/api/auth/profile-picture/${user.id}` : null,
        location: user.location,
        github_username: user.github_username,
        linkedin_url: user.linkedin_url,
        portfolio_url: user.portfolio_url,
        profile_completed: user.profile_completed,
        level: user.level,
        xp: user.total_xp,
        current_xp: user.current_xp,
        next_level_xp: user.next_level_xp,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
        discord_id: user.discord_id,
        discord_username: user.discord_username,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Remove session from database
      await pool.execute(
        'DELETE FROM user_sessions WHERE token_hash = ?',
        [tokenHash]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      display_name,
      bio,
      skills,
      profile_picture,
      location,
      github_username,
      linkedin_url,
      portfolio_url
    } = req.body;

    const userId = req.user.id;

    // Check if user is verified and get current profile status
    const [users] = await pool.query(
      'SELECT is_verified, profile_completed FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!users[0].is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to update profile'
      });
    }

    // Check if this is the first time completing profile (for XP award)
    const isFirstTimeCompletion = !users[0].profile_completed;

    // Process profile picture - extract base64 data if it includes data URL prefix
    let processedProfilePicture = profile_picture;
    if (profile_picture && profile_picture.startsWith('data:image/')) {
      // Extract just the base64 data without the data URL prefix
      const base64Data = profile_picture.split(',')[1];
      processedProfilePicture = base64Data;
    }

    // Update user profile
    await pool.query(`
      UPDATE users SET 
        display_name = ?,
        bio = ?,
        skills = ?,
        profile_picture = ?,
        location = ?,
        github_username = ?,
        linkedin_url = ?,
        portfolio_url = ?,
        profile_completed = TRUE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      display_name,
      bio,
      JSON.stringify(skills || []),
      processedProfilePicture,
      location,
      github_username,
      linkedin_url,
      portfolio_url,
      userId
    ]);

    // Award profile completion XP if this is the first time
    if (isFirstTimeCompletion) {
      await awardXP(userId, 50, 'Profile completion');
      
      // Add profile completion activity
      await pool.execute(`
        INSERT INTO activity_feed (user_id, action_type, description, data)
        VALUES (?, 'profile_completed', ?, ?)
      `, [
        userId,
        `${display_name || req.user.username} completed their profile!`,
        JSON.stringify({ display_name, skills })
      ]);
    }

    // Fetch updated user data
    const [updatedUsers] = await pool.execute(`
      SELECT id, username, email, first_name, last_name, display_name, bio, skills,
             profile_picture, location, github_username, linkedin_url, portfolio_url,
             level, total_xp as xp, current_xp, next_level_xp, is_verified, profile_completed
      FROM users WHERE id = ?
    `, [userId]);

    const user = updatedUsers[0];
    if (user.skills) {
      user.skills = parseSkills(user.skills);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile picture
router.get('/profile-picture/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [users] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].profile_picture) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    }

    const profilePicture = users[0].profile_picture;
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(profilePicture, 'base64');
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=86400' // Cache for 1 day
    });
    
    res.send(imageBuffer);
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== DISCORD INTEGRATION ROUTES =====

const axios = require('axios');
const { getDiscordUser, addUserToServer } = require('../services/discord');

// Discord OAuth - Start authentication
router.get('/discord', authenticateToken, (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join`;
  
  // Store user ID in session/state for callback
  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
  
  res.redirect(`${discordAuthUrl}&state=${state}`);
});

// Discord OAuth - Handle callback
router.get('/discord/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Decode state to get user ID
    let userId;
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = decodedState.userId;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // Get Discord user info
    const discordUser = await getDiscordUser(access_token);

    // Add user to Discord server
    try {
      await addUserToServer(access_token, discordUser.id);
      console.log(`✅ Added user ${discordUser.username} to Discord server`);
    } catch (error) {
      console.log(`ℹ️  User ${discordUser.username} might already be in server`);
    }

    // Update user with Discord info in database
    await pool.execute(
      'UPDATE users SET discord_id = ?, discord_username = ? WHERE id = ?',
      [discordUser.id, discordUser.username, userId]
    );

    console.log(`✅ Linked Discord account for user ${userId}: ${discordUser.username}`);

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?discord=success`);

  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?discord=error`);
  }
});

// Get Discord connection status
router.get('/discord/status', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT discord_id, discord_username FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];
    
    res.json({
      connected: !!user.discord_id,
      discord_username: user.discord_username || null
    });
  } catch (error) {
    console.error('Error checking Discord status:', error);
    res.status(500).json({ error: 'Failed to check Discord status' });
  }
});

// Disconnect Discord account
router.post('/discord/disconnect', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE users SET discord_id = NULL, discord_username = NULL WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Discord account disconnected' });
  } catch (error) {
    console.error('Error disconnecting Discord:', error);
    res.status(500).json({ error: 'Failed to disconnect Discord account' });
  }
});

module.exports = router;
