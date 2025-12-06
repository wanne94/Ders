const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
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
const { isAdminOrSuperAdmin, isModeratorOrHigher } = require('../middleware/auth');

// GET /api/organizations/public - Get public organizations with lecture count
router.get('/public', async (req, res) => {
  try {
    logger.info('Fetching public organizations for dashboard');
    
    const organizations = await Organization.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${organizations.length} approved organizations for public endpoint`);
    
    const organizationsWithLectureCount = await Promise.all(
      organizations.map(async (organization) => {
        const lectureCount = await Lecture.countDocuments({
          organizationId: organization._id,
          status: 'approved'
        });
        
        return {
          ...organization.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    res.json(organizationsWithLectureCount);
  } catch (error) {
    logger.error('Error fetching public organizations:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju udruženja' });
  }
});

// GET /api/organizations/with-active-lectures - Get organizations with their active lectures
router.get('/with-active-lectures', async (req, res) => {
  try {
    logger.info('Fetching organizations with active lectures');
    
    const organizations = await Organization.find().sort({ name: 1 });
    
    const organizationsWithLectures = await Promise.all(
      organizations.map(async (organization) => {
        const lectures = await Lecture.find({ 
          organization: organization._id, 
          status: 'approved',
          date: { $gte: new Date() }
        }).sort({ date: 1 });
        
        return {
          ...organization.toObject(),
          lectures: lectures.map(lecture => ({
            ...lecture.toObject(),
            organizationId: lecture.organization || null
          }))
        };
      })
    );
    
    logger.info(`Found ${organizationsWithLectures.length} organizations with lectures`);
    res.json(organizationsWithLectures);
  } catch (error) {
    logger.error('Error fetching organizations with active lectures:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju udruženja sa predavanjima' });
  }
});

// POST /api/organizations/bulk/approve - Bulk approve organizations (Moderator and higher)
router.post('/bulk/approve', authenticateToken, isModeratorOrHigher, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Organization.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'approved' } }
    );
    
    res.json({
      message: `Successfully approved ${result.modifiedCount} organizations`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Bulk approve organizations error:', error);
    res.status(500).json({ message: 'Error approving organizations', error: error.message });
  }
});

// POST /api/organizations/bulk/reject - Bulk reject organizations (Moderator and higher)
router.post('/bulk/reject', authenticateToken, isModeratorOrHigher, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Organization.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'rejected' } }
    );
    
    res.json({
      message: `Successfully rejected ${result.modifiedCount} organizations`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Bulk reject organizations error:', error);
    res.status(500).json({ message: 'Error rejecting organizations', error: error.message });
  }
});

// POST /api/organizations/bulk/delete - Bulk delete organizations
router.post('/bulk/delete', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required' });
    }
    
    const result = await Organization.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} organizations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Bulk delete organizations error:', error);
    res.status(500).json({ message: 'Error deleting organizations', error: error.message });
  }
});

// GET /api/organizations - Get all approved organizations with lecture count
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all organizations');
    const organizations = await Organization.find({ status: 'approved' }).sort({ name: 1 });
    logger.info(`Found ${organizations.length} approved organizations`);
    
    const organizationsWithLectureCount = await Promise.all(
      organizations.map(async (organization) => {
        const lectureCount = await Lecture.countDocuments({
          organizationId: organization._id,
          status: 'approved'
        });
        
        return {
          ...organization.toObject(),
          lectureCount: lectureCount
        };
      })
    );
    
    logger.info(`Processed ${organizationsWithLectureCount.length} organizations with lecture counts`);
    res.json(organizationsWithLectureCount);
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju udruženja' });
  }
});

// GET /api/organizations/search - Search organizations
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    logger.info('Searching organizations with query:', query);
    
    const organizations = await Organization.find({ 
      status: 'approved',
      $text: { $search: query.trim() }
    }, {
      score: { $meta: 'textScore' }
    })
      .select('name description contactInfo address city website image status createdAt')
      .sort({ score: { $meta: 'textScore' }, name: 1 })
      .lean()
      .exec();
    
    logger.info(`Found ${organizations.length} organizations matching search query: "${query}"`);
    res.json(organizations);
  } catch (error) {
    logger.error('Error searching organizations:', error);
    res.status(500).json({ message: 'Greška pri pretraživanju udruženja' });
  }
});

// GET /api/organizations/:id - Get single organization by ID
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid organization ID format' });
    }
    
    logger.info('Fetching organization by ID:', req.params.id);
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      logger.warn('Organization not found:', req.params.id);
      return res.status(404).json({ message: 'Udruženje nije pronađeno' });
    }
    
    logger.info('Organization found:', { id: organization._id, name: organization.name });
    res.json(organization);
  } catch (error) {
    logger.error('Error fetching organization by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/organizations - Add new organization
router.post('/', authenticateToken, async (req, res) => {
  try {
    logger.info('Adding new organization - Request body:', { body: req.body, user: req.user });

    const approvalSettings = await Settings.findOne({ key: 'approvalSettings' });
    const autoApproveOrganizations = approvalSettings?.value?.organization !== false;

    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const finalStatus = (isAdminUser && req.body.status)
      ? req.body.status
      : (autoApproveOrganizations ? 'approved' : 'pending');

    const organizationData = {
      name: req.body.name || '',
      description: req.body.description || '',
      contactInfo: req.body.contactInfo || {},
      address: req.body.address || '',
      city: req.body.city || '',
      website: req.body.website || '',
      image: req.body.image || '',
      status: finalStatus
    };
    
    logger.info('Using approval settings:', {
      autoApproveOrganizations,
      setting: approvalSettings?.value?.organization,
      isAdminUser,
      requestedStatus: req.body.status,
      finalStatus: organizationData.status
    });
    
    logger.info('Creating organization with data:', organizationData);
    const organization = new Organization(organizationData);
    
    const savedOrganization = await organization.save();
    logger.info('New organization saved successfully:', {
      id: savedOrganization._id,
      name: savedOrganization.name,
      status: savedOrganization.status
    });
    
    res.status(201).json(savedOrganization);
  } catch (error) {
    logger.error('Error adding organization:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/organizations/:id - Update organization (full update)
router.put('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating organization:', { id: req.params.id, body: req.body, user: req.user });

    const existingOrganization = await Organization.findById(req.params.id);
    if (!existingOrganization) {
      return res.status(404).json({ message: 'Udruženje nije pronađeno' });
    }

    const updateData = {
      name: req.body.name || '',
      description: req.body.description || '',
      contactInfo: req.body.contactInfo || {},
      address: req.body.address || '',
      city: req.body.city || '',
      website: req.body.website || '',
      image: req.body.image || '',
      status: req.body.status || existingOrganization.status,
      updatedAt: new Date()
    };

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Organization updated:', { 
      id: organization._id, 
      name: organization.name,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(organization);
  } catch (error) {
    logger.error('Error updating organization:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID udruženja' });
    }
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/organizations/:id - Update organization (partial update)
router.patch('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    logger.info('Updating organization status:', { id: req.params.id, body: req.body, user: req.user });

    const existingOrganization = await Organization.findById(req.params.id);
    if (!existingOrganization) {
      return res.status(404).json({ message: 'Udruženje nije pronađeno' });
    }

    const updateData = { updatedAt: new Date() };
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.contactInfo !== undefined) updateData.contactInfo = req.body.contactInfo;
    if (req.body.address !== undefined) updateData.address = req.body.address;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.website !== undefined) updateData.website = req.body.website;
    if (req.body.image !== undefined) updateData.image = req.body.image;

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Organization updated via PATCH:', { 
      id: organization._id, 
      name: organization.name,
      status: organization.status,
      updatedBy: req.user.id,
      userRole: req.user.role
    });
    
    res.json(organization);
  } catch (error) {
    logger.error('Error updating organization:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Nevaljan ID udruženja' });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    logger.info('Organization deleted:', { id: req.params.id, name: organization.name });
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logger.error('Error deleting organization:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
