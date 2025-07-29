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

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

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
