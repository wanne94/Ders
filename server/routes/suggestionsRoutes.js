const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const Daija = require('../models/Daija');
const Organization = require('../models/Organization');
const User = require('../models/User');
const winston = require('winston');
const jwt = require('jsonwebtoken');

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

// GET /api/suggestions/public - Get all non-archived suggestions
router.get('/public', async (req, res) => {
  try {
    logger.info('Fetching public suggestions for dashboard');

    const suggestions = await Suggestion.find({ status: { $ne: 'archived' } })
      .sort({ createdAt: -1 });

    logger.info(`Found ${suggestions.length} suggestions for dashboard`);
    res.json(suggestions);
  } catch (error) {
    logger.error('Error fetching public suggestions:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju prijedloga' });
  }
});

// GET /api/suggestions/archived/public - Get archived suggestions
router.get('/archived/public', async (req, res) => {
  try {
    logger.info('Fetching public archived suggestions for dashboard');

    const archivedSuggestions = await Suggestion.find({ status: 'archived' })
      .sort({ createdAt: -1 });

    logger.info(`Found ${archivedSuggestions.length} archived suggestions for dashboard`);
    res.json(archivedSuggestions);
  } catch (error) {
    logger.error('Error fetching public archived suggestions:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju arhiviranih prijedloga' });
  }
});

// GET /api/suggestions/count/public - Get suggestions count by status
router.get('/count/public', async (req, res) => {
  try {
    logger.info('Fetching public suggestions count for dashboard');

    const total = await Suggestion.countDocuments();
    const pending = await Suggestion.countDocuments({ status: 'pending' });
    const approved = await Suggestion.countDocuments({ status: 'approved' });
    const rejected = await Suggestion.countDocuments({ status: 'rejected' });

    const count = { total, pending, approved, rejected };

    logger.info('Found suggestions count for dashboard:', count);
    res.json(count);
  } catch (error) {
    logger.error('Error fetching public suggestions count:', error);
    res.status(500).json({
      message: 'Greška pri dohvaćanju broja prijedloga',
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    });
  }
});

// POST /api/suggestions - Create new suggestion (public - no auth required)
router.post('/', async (req, res) => {
  try {
    logger.info('Creating new suggestion:', req.body);

    const { title, description, referenceType, referenceId } = req.body;

    // Validation
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Opis prijedloga je obavezan' });
    }

    // Map frontend types to backend types
    let targetType = 'general';
    let targetName = 'Općeniti prijedlog';
    let targetId = null;

    if (referenceType && referenceId) {
      switch (referenceType) {
        case 'daija':
          targetType = 'daija';
          // Try to fetch daija name
          try {
            const daija = await Daija.findById(referenceId);
            if (daija) {
              targetName = daija.name || 'Nepoznat daija';
              targetId = referenceId;
            }
          } catch (error) {
            logger.warn('Could not fetch daija for suggestion:', error);
          }
          break;
        case 'udruženje':
        case 'organization':
          targetType = 'organization';
          // Try to fetch organization name
          try {
            const organization = await Organization.findById(referenceId);
            if (organization) {
              targetName = organization.name || 'Nepoznato udruženje';
              targetId = referenceId;
            }
          } catch (error) {
            logger.warn('Could not fetch organization for suggestion:', error);
          }
          break;
        case 'stranica':
          targetType = 'general';
          targetName = 'Stranica';
          break;
        case 'općenito':
        default:
          targetType = 'general';
          targetName = 'Općeniti prijedlog';
          break;
      }
    }

    // Get user info if authenticated
    let submittedBy = null;
    let submitterName = null;
    let submitterEmail = null;

    // Check if user is authenticated (optional)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        submittedBy = decoded.id;

        // Get user details
        const user = await User.findById(decoded.id);
        if (user) {
          submitterName = user.username;
          submitterEmail = user.email;
        }
      } catch (error) {
        // Token invalid, but that's okay for suggestions
        logger.info('Invalid token for suggestion, proceeding as anonymous');
      }
    }

    const suggestionData = {
      targetType,
      targetId,
      targetName,
      suggestedChanges: {
        description: description.trim(),
        title: title?.trim() || null
      },
      reason: description.trim(),
      submittedBy,
      submitterName,
      submitterEmail,
      status: 'pending'
    };

    logger.info('Creating suggestion with data:', suggestionData);
    const suggestion = new Suggestion(suggestionData);

    const savedSuggestion = await suggestion.save();
    logger.info('New suggestion saved successfully:', {
      id: savedSuggestion._id,
      targetType: savedSuggestion.targetType,
      targetName: savedSuggestion.targetName
    });

    res.status(201).json(savedSuggestion);
  } catch (error) {
    logger.error('Error creating suggestion:', error);
    res.status(400).json({ message: error.message || 'Greška pri kreiranju prijedloga' });
  }
});

// PATCH /api/suggestions/:id - Update suggestion status (admin only)
router.patch('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating suggestion status:', { id: req.params.id, body: req.body });

    const { status, reviewNote } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Nevaljan status' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (reviewNote) updateData.reviewNote = reviewNote;

    // Add review info
    updateData.reviewedBy = req.user.id;
    updateData.reviewedAt = new Date();

    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({ message: 'Prijedlog nije pronađen' });
    }

    logger.info('Suggestion updated successfully:', {
      id: suggestion._id,
      status: suggestion.status,
      reviewedBy: req.user.username
    });

    res.json(suggestion);
  } catch (error) {
    logger.error('Error updating suggestion:', error);
    res.status(400).json({ message: error.message || 'Greška pri ažuriranju prijedloga' });
  }
});

// DELETE /api/suggestions/:id - Delete suggestion (admin only)
router.delete('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Deleting suggestion:', { id: req.params.id, user: req.user.username });

    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);

    if (!suggestion) {
      return res.status(404).json({ message: 'Prijedlog nije pronađen' });
    }

    logger.info('Suggestion deleted successfully:', {
      id: req.params.id,
      targetType: suggestion.targetType,
      deletedBy: req.user.username
    });

    res.json({ message: 'Prijedlog je uspješno obrisan' });
  } catch (error) {
    logger.error('Error deleting suggestion:', error);
    res.status(500).json({ message: 'Greška pri brisanju prijedloga' });
  }
});

module.exports = router;
