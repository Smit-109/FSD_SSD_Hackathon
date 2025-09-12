import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

// Session-based authentication middleware for web routes
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=Please login to access this page');
  }
  next();
};

// Middleware to prevent logged-in users from accessing auth pages
export const preventAuthAccess = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/?success=You are already logged in');
  }
  next();
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=Please login to access this page');
  }
  
  if (req.session.user.role !== 'admin') {
    return res.redirect('/?error=Access denied. Admin privileges required.');
  }
  
  next();
};

// Protect routes middleware for API
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Account verification required. Please contact admin.'
    });
  }
};
