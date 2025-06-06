import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Mock User model - replace with actual import when User model exists
// import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // For now, we'll use the decoded token data directly
      // Later replace with: req.user = await User.findById(decoded.id).select('-password');
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  
  res.status(403).json({ 
    message: 'Forbidden: super_admin access required',
    userRole: req.user?.role || 'unknown'
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    return next();
  }
  
  res.status(403).json({ 
    message: 'Forbidden: admin access required',
    userRole: req.user?.role || 'unknown'
  });
}; 