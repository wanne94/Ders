const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authMiddleware: jwtAuthMiddleware } = require('../utils/jwt');

// Use the same auth middleware as in index.js
const authenticateToken = jwtAuthMiddleware;

// Middleware for admin/super_admin check (same as in index.js)
const isAdminOrSuperAdmin = (req, res, next) => {
  try {
    // Ensure user object exists and has role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Korisničke dozvole nisu pronađene. Molimo prijavite se ponovo.' });
    }

    const allowedRoles = ['admin', 'super_admin'];
    
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Potrebne su administratorske dozvole za pristup postavkama sistema.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Greška pri provjeri dozvola. Molimo pokušajte ponovo.' });
  }
};

// GET /api/settings/:key - Get specific setting
router.get('/:key', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings/:key - Update or create setting
router.put('/:key', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, description },
      { new: true, upsert: true }
    );
    
    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings - Get all settings
router.get('/', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const settings = await Settings.find();
    
    // Convert to key-value object for easier frontend consumption
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 