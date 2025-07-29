const { authMiddleware } = require('../utils/jwt');

// Optional authentication - allows both authenticated and guest users
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // User has provided token - try to authenticate
    authMiddleware(req, res, (err) => {
      if (err) {
        // Token invalid but continue as guest
        req.user = null;
      }
      next();
    });
  } else {
    // No token provided - continue as guest
    req.user = null;
    next();
  }
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

module.exports = {
  isAdminOrSuperAdmin,
  optionalAuth
}; 