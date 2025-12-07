const { authMiddleware, verifyToken } = require('../utils/jwt');

// Optional authentication - allows both authenticated and guest users
// Fixed: Now properly continues as guest when token is invalid/expired
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Directly verify token instead of using authMiddleware
      // This prevents authMiddleware from returning 401 response
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // Token invalid/expired - continue as guest
      req.user = null;
    }
  } else {
    // No token provided - continue as guest
    req.user = null;
  }
  next();
};

const isAdminOrSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.role) {
      return res.status(403).json({ message: 'Korisničke dozvole nisu pronađene. Molimo prijavite se ponovo.' });
    }

    const allowedRoles = ['admin', 'super_admin'];

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Potrebne su administratorske dozvole za pristup ovoj funkciji.' });
    }
  } catch (error) {
    console.error('Error in isAdminOrSuperAdmin middleware:', error);
    res.status(500).json({ message: 'Greška pri provjeri dozvola. Molimo pokušajte ponovo.' });
  }
};

// Middleware za provjeru je li korisnik moderator ili viši (moderator, admin, super_admin)
const isModeratorOrHigher = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.role) {
      return res.status(403).json({ message: 'Korisničke dozvole nisu pronađene. Molimo prijavite se ponovo.' });
    }

    const allowedRoles = ['moderator', 'admin', 'super_admin'];

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Potrebne su moderatorske dozvole za pristup ovoj funkciji.' });
    }
  } catch (error) {
    console.error('Error in isModeratorOrHigher middleware:', error);
    res.status(500).json({ message: 'Greška pri provjeri dozvola. Molimo pokušajte ponovo.' });
  }
};

module.exports = {
  isAdminOrSuperAdmin,
  isModeratorOrHigher,
  optionalAuth
}; 