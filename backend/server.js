const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database and services
const { connectDatabase } = require('./db');
const { verifyEmailService } = require('./services/emailService');
const { cleanExpiredSessions } = require('./utils/auth');
const { startCleanupScheduler } = require('./services/cleanupService');
const { initializeDiscordBot } = require('./services/discord');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const { router: notificationRoutes } = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

// Profile picture endpoint to serve images from database
app.get('/api/profile-picture/:userId', async (req, res) => {
  const { pool } = require('./db');
  
  try {
    const userId = req.params.userId;
    console.log('Serving profile picture for user ID:', userId);
    
    const [users] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || !users[0].profile_picture) {
      console.log('No profile picture found for user:', userId);
      return res.status(404).json({ error: 'Profile picture not found' });
    }
    
    let imageData = users[0].profile_picture;
    console.log('Found profile picture data, length:', imageData?.length || 0);
    
    // Handle base64 data URL format
    if (imageData.startsWith('data:image/')) {
      const matches = imageData.match(/data:image\/([a-zA-Z]*);base64,(.*)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        res.set('Content-Type', `image/${imageType}`);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        return res.send(buffer);
      }
    }
    
    // If it's already binary data or base64 without data URL prefix
    try {
      const buffer = Buffer.from(imageData, 'base64');
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch (bufferError) {
      console.error('Error converting to buffer:', bufferError);
      return res.status(500).json({ error: 'Invalid image data' });
    }
    
  } catch (error) {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ProdigiousHub API is running! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ProdigiousHub API! 🎮',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Cleanup expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    console.log('🔧 Initializing database connection...');
    await connectDatabase();
    
    // Verify email service
    console.log('📧 Verifying email service...');
    await verifyEmailService();
    
    // Start cleanup scheduler for unverified accounts
    console.log('🧹 Starting cleanup scheduler...');
    startCleanupScheduler();
    
    // Initialize Discord bot
    console.log('🤖 Initializing Discord bot...');
    await initializeDiscordBot();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('🚀 ProdigiousHub API Server Started!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: ProdigiousHub on port 3001`);
      console.log('');
      console.log('🎮 Ready for gamified project collaboration!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
