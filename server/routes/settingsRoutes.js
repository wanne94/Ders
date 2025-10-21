const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const winston = require('winston');

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
const { authMiddleware: authenticateToken } = require('../utils/jwt');
const { isAdminOrSuperAdmin } = require('../middleware/auth');

// GET /api/settings/public - Get public settings
router.get('/public', async (req, res) => {
  try {
    logger.info('Fetching public settings for dashboard');

    // Try to find approval settings in the database
    const approvalSettingsDoc = await Settings.findOne({ key: 'approvalSettings' });

    const defaultSettings = {
      lecture: true,
      daija: true,
      organization: true
    };

    const settings = {
      approvalSettings: approvalSettingsDoc ? approvalSettingsDoc.value : defaultSettings
    };

    logger.info('Found settings for dashboard:', settings);
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching public settings:', error);
    res.status(500).json({
      message: 'Greška pri dohvaćanju postavki',
      approvalSettings: {
        lecture: true,
        daija: true,
        organization: true
      }
    });
  }
});

// PUT /api/settings/approval-settings - Save approval settings
router.put('/approval-settings', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Saving approval settings:', req.body);

    // Update or create the approval settings document
    const settings = await Settings.findOneAndUpdate(
      { key: 'approvalSettings' },
      {
        key: 'approvalSettings',
        value: req.body,
        description: 'Approval settings for lectures, daije, and organizations'
      },
      {
        new: true,
        upsert: true
      }
    );

    logger.info('Approval settings saved successfully:', settings);
    res.json({
      message: 'Postavke odobrenja su uspješno spremljene',
      approvalSettings: settings.value
    });
  } catch (error) {
    logger.error('Error saving approval settings:', error);
    res.status(500).json({
      message: 'Greška pri spremanju postavki odobrenja'
    });
  }
});

module.exports = router;
