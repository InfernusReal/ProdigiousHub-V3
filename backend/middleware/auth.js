const { verifyToken, validateSession } = require('../utils/auth');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Validate session in database
    const session = await validateSession(token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check if user is verified
    if (!session.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this resource'
      });
    }

    // Add user info to request
    req.user = {
      id: session.id,
      username: session.username,
      email: session.email,
      is_verified: session.is_verified
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const session = await validateSession(token);
      
      if (session && session.is_verified) {
        req.user = {
          id: session.id,
          username: session.username,
          email: session.email,
          isVerified: session.is_verified
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  requireVerification,
  optionalAuth
};
