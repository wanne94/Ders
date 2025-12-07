const express = require('express');
const router = express.Router();
const Daija = require('../models/Daija');
const Lecture = require('../models/Lecture');
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
const { isAdminOrSuperAdmin, isModeratorOrHigher, optionalAuth } = require('../middleware/auth');

// GET /api/daije/public - Get public daije with lecture count
router.get('/public', optionalAuth, async (req, res) => {
  try {
    logger.info('Fetching public daije for dashboard');
    
    const daije = await Daija.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${daije.length} approved daije for public endpoint`);
    
    const daijeWithLectureCount = await Promise.all(
      daije.map(async (daija) => {
        const lectureCount = await Lecture.countDocuments({ 
          daija: daija._id, 
          status: 'approved' 
        });
        
        return {
          ...daija.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    res.json(daijeWithLectureCount);
  } catch (error) {
    logger.error('Error fetching public daije:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija' });
  }
});

// GET /api/daije/with-active-lectures - Get daije with their active lectures
router.get('/with-active-lectures', optionalAuth, async (req, res) => {
  try {
    logger.info('Fetching daije with active lectures');
    
    const daije = await Daija.find().sort({ name: 1 });
    
    const daijeWithLectures = await Promise.all(
      daije.map(async (daija) => {
        const lectures = await Lecture.find({ 
          daija: daija._id, 
          status: 'approved',
          date: { $gte: new Date() }
        }).sort({ date: 1 });
        
        return {
          ...daija.toObject(),
          lectures: lectures.map(lecture => ({
            ...lecture.toObject(),
            daijaId: lecture.daija || null
          }))
        };
      })
    );
    
    logger.info(`Found ${daijeWithLectures.length} daije with lectures`);
    res.json(daijeWithLectures);
  } catch (error) {
    logger.error('Error fetching daije with active lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija sa predavanjima' });
  }
});

// POST /api/daije/bulk/approve - Bulk approve daije (Moderator and higher)
router.post('/bulk/approve', authenticateToken, isModeratorOrHigher, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Daija.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'approved' } }
    );
    
    res.json({
      message: `Successfully approved ${result.modifiedCount} daije`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Bulk approve daije error:', error);
    res.status(500).json({ message: 'Error approving daije', error: error.message });
  }
});

// POST /api/daije/bulk/reject - Bulk reject daije (Moderator and higher)
router.post('/bulk/reject', authenticateToken, isModeratorOrHigher, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Daija.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'rejected' } }
    );
    
    res.json({
      message: `Successfully rejected ${result.modifiedCount} daije`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Bulk reject daije error:', error);
    res.status(500).json({ message: 'Error rejecting daije', error: error.message });
  }
});

// POST /api/daije/bulk/delete - Bulk delete daije
router.post('/bulk/delete', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Daija.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} daije`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Bulk delete daije error:', error);
    res.status(500).json({ message: 'Error deleting daije', error: error.message });
  }
});

// GET /api/daije - Get all approved daije with lecture count
router.get('/', optionalAuth, async (req, res) => {
  try {
    logger.info('Fetching all daije');
    const daije = await Daija.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${daije.length} approved daije`);
    
    const daijeWithLectureCount = await Promise.all(
      daije.map(async (daija) => {
        const lectureCount = await Lecture.countDocuments({ 
          daija: daija._id, 
          status: 'approved' 
        });
        
        return {
          ...daija.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    logger.info(`Processed ${daijeWithLectureCount.length} daije with lecture counts`);
    res.json(daijeWithLectureCount);
  } catch (error) {
    logger.error('Error fetching daije:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju daija' });
  }
});

// GET /api/daije/search - Search daije
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    logger.info('Searching daije with query:', query);
    
    const daije = await Daija.find({ 
      status: 'approved',
      $text: { $search: query.trim() }
    }, {
      score: { $meta: 'textScore' }
    })
      .select('name title dateOfBirth biography shortDescription education image status createdAt')
      .sort({ score: { $meta: 'textScore' }, name: 1 })
      .lean()
      .exec();
    
    logger.info(`Found ${daije.length} daije matching search query: "${query}"`);
    res.json(daije);
  } catch (error) {
    logger.error('Error searching daije:', error);
    res.status(500).json({ message: 'Greška pri pretraživanju daija' });
  }
});

// GET /api/daije/:id - Get single daija by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid daija ID format' });
    }
    
    logger.info('Fetching daija by ID:', req.params.id);
    const daija = await Daija.findById(req.params.id);
    
    if (!daija) {
      logger.warn('Daija not found:', req.params.id);
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }
    
    logger.info('Daija found:', { id: daija._id, name: daija.name });
    res.json(daija);
  } catch (error) {
    logger.error('Error fetching daija by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/daije - Add new daija
router.post('/', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new daija - Request body:', { body: req.body, user: req.user });

    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const autoApproveDaije = approvalSettings?.value?.daija !== false;

    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status)
      ? req.body.status
      : (autoApproveDaije ? 'approved' : 'pending');

    const daijaData = {
      name: req.body.name || '',
      title: req.body.title,
      dateOfBirth: req.body.dateOfBirth || null,
      biography: req.body.biography || '',
      shortDescription: req.body.shortDescription || '',
      education: req.body.education || [],
      image: req.body.image || '',
      status: finalStatus
    };
    
    logger.info('Using approval settings:', {
      autoApproveDaije,
      setting: approvalSettings?.value?.daija,
      isAdminUser,
      requestedStatus: req.body.status,
      finalStatus: daijaData.status
    });
    
    logger.info('Creating daija with data:', daijaData);
    const daija = new Daija(daijaData);
    
    const savedDaija = await daija.save();
    logger.info('New daija saved successfully:', {
      id: savedDaija._id,
      name: savedDaija.name,
      status: savedDaija.status
    });
    
    res.status(201).json(savedDaija);
  } catch (error) {
    logger.error('Error adding daija:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/daije/:id - Update daija (full update)
router.put('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating daija:', { id: req.params.id, body: req.body, user: req.user });

    const existingDaija = await Daija.findById(req.params.id);
    if (!existingDaija) {
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }

    const updateData = {
      name: req.body.name || '',
      title: req.body.title,
      dateOfBirth: req.body.dateOfBirth || null,
      biography: req.body.biography || '',
      shortDescription: req.body.shortDescription || '',
      education: req.body.education || [],
      image: req.body.image || '',
      status: req.body.status || existingDaija.status,
      updatedAt: new Date()
    };

    const daija = await Daija.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Daija updated:', { 
      id: daija._id, 
      name: daija.name,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(daija);
  } catch (error) {
    logger.error('Error updating daija:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID daije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/daije/:id - Update daija (partial update)
router.patch('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating daija status:', { id: req.params.id, body: req.body, user: req.user });

    const existingDaija = await Daija.findById(req.params.id);
    if (!existingDaija) {
      return res.status(404).json({ message: 'Daija nije pronađena' });
    }

    const updateData = { updatedAt: new Date() };
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.biography !== undefined) updateData.biography = req.body.biography;
    if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
    if (req.body.education !== undefined) updateData.education = req.body.education;
    if (req.body.image !== undefined) updateData.image = req.body.image;

    const daija = await Daija.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Daija updated via PATCH:', { 
      id: daija._id, 
      name: daija.name,
      status: daija.status,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(daija);
  } catch (error) {
    logger.error('Error updating daija:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID daije' });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/daije/:id - Delete daija
router.delete('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const daija = await Daija.findByIdAndDelete(req.params.id);
    if (!daija) {
      return res.status(404).json({ message: 'Daija not found' });
    }
    logger.info('Daija deleted:', { id: req.params.id, name: daija.name });
    res.json({ message: 'Daija deleted successfully' });
  } catch (error) {
    logger.error('Error deleting daija:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
