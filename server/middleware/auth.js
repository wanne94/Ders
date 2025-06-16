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
  isAdminOrSuperAdmin
}; 