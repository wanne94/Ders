console.log('🚨🚨🚨 LOADING lecturesRoutes.js FILE! 🚨🚨🚨');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lecture = require('../models/Lecture');
const User = require('../models/User');
const { authMiddleware: authenticateToken } = require('../utils/jwt');
const { isAdminOrSuperAdmin, optionalAuth } = require('../middleware/auth');
const { calculateLecturesStatus } = require('../utils/lectureStatus');

// 🔧 Debug: Test if both functions are loaded correctly
console.log('🔍 [DEBUG] authenticateToken:', typeof authenticateToken, authenticateToken);
console.log('🔍 [DEBUG] isAdminOrSuperAdmin:', typeof isAdminOrSuperAdmin, isAdminOrSuperAdmin);

// Make lectures endpoint public (remove authentication requirement)
router.get('/public', async (req, res) => {
  console.log('🔥🔥🔥 PUBLIC LECTURES ENDPOINT HIT! 🔥🔥🔥');
  console.log('🔍 [SERVER] Request URL:', req.url);
  console.log('🔍 [SERVER] Query params:', req.query);
  console.log('🔍 [SERVER] Status param value:', req.query.status);
  console.log('🔍 [SERVER] Status param type:', typeof req.query.status);
  
  const startTime = Date.now();
  console.log('🚀 [PERFORMANCE] /lectures/public endpoint called at:', new Date().toISOString());
  
  // Get status filter from query parameters
  const { status } = req.query;
  console.log('🔍 [SERVER] Destructured status:', status);
  console.log('🔍 [SERVER] /lectures/public query params:', req.query);
  console.log('🔍 [SERVER] status parameter:', status);
  
  let statusFilter = { status: 'approved' }; // Default to approved only
  
  if (status) {
    if (status === 'all') {
      statusFilter = { status: { $in: ['approved', 'cancelled'] } };
      console.log('✅ [SERVER] Using ALL filter (approved + cancelled)');
    } else if (Array.isArray(status)) {
      statusFilter = { status: { $in: status } };
    } else {
      statusFilter = { status: status };
    }
  }
  
  console.log('🔍 [SERVER] Final statusFilter:', statusFilter);
  
  try {
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    console.log(`📊 [PERFORMANCE] Database state: ${dbStates[dbState]} (${dbState})`);
    
    if (dbState !== 1) {
      console.error('❌ [PERFORMANCE] Database not connected! State:', dbStates[dbState]);
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Debug: Start query timing
    const queryStartTime = Date.now();
    console.log('🔍 [PERFORMANCE] Starting super-optimized database query...');
    
    // 🚀 SUPER-OPTIMIZED QUERY with forced index usage and minimal data transfer
    
    // First, let's debug what's in the database
    const allLectures = await Lecture.find({}).select('status').lean();
    console.log('🔍 [DEBUG] Total lectures in DB:', allLectures.length);
    const statusCounts = {};
    allLectures.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    console.log('🔍 [DEBUG] Status breakdown:', statusCounts);
    
    // Method 1: Try with hint to force index usage
    let lectures;
    try {
      lectures = await Lecture.find(statusFilter)
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
        .populate({
          path: 'organizationId',
          select: 'name',
          strictPopulate: false
        })
        .populate({
          path: 'daija',
          select: 'name title image',
          strictPopulate: false
        })
        .hint({ status: 1, date: 1 }) // 🚀 Force index usage
        .lean()
        .exec();
      
      console.log('✅ [PERFORMANCE] Used hint-forced query');
    } catch (hintError) {
      console.log('⚠️ [PERFORMANCE] Hint failed, falling back to regular query:', hintError.message);
      
      // Fallback: Regular optimized query
      lectures = await Lecture.find(statusFilter)
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
        .populate({
          path: 'organizationId',
          select: 'name',
          strictPopulate: false
        })
        .populate({
          path: 'daija',
          select: 'name title image',
          strictPopulate: false
        })
        .lean()
        .exec();
    }

    const queryEndTime = Date.now();
    const queryDuration = queryEndTime - queryStartTime;
    console.log(`⚡ [PERFORMANCE] Super-optimized database query completed in: ${queryDuration}ms`);
    console.log(`📊 [PERFORMANCE] Found ${lectures.length} public lectures`);
    
    // Debug: Check cancelled lectures
    const cancelledLectures = lectures.filter(l => l.status === 'cancelled' || l.isCancelled);
    console.log(`❌ [SERVER] Found ${cancelledLectures.length} cancelled lectures in query result`);
    if (cancelledLectures.length > 0) {
      console.log('❌ [SERVER] Sample cancelled lecture:', cancelledLectures[0]);
    }
    
    // Debug: Start transformation timing
    const transformStartTime = Date.now();
    console.log('🔄 [PERFORMANCE] Starting lightning-fast data transformation...');
    
    // 🚀 LIGHTNING-FAST transformation - pre-allocate array for better performance
    const transformedLectures = new Array(lectures.length);
    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      
      transformedLectures[i] = {
        ...lecture,
        daijaId: lecture.daija ? lecture.daija._id : null,
        speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
          ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
          : lecture.speaker || 'Nepoznat predavač'
      };
    }

    const transformEndTime = Date.now();
    const transformDuration = transformEndTime - transformStartTime;
    console.log(`⚡ [PERFORMANCE] Lightning-fast data transformation completed in: ${transformDuration}ms`);
    
    // 🚀 CUSTOM SORTING: Future lectures first (ascending date), then past lectures (descending date)
    const sortStartTime = Date.now();
    console.log('📅 [PERFORMANCE] Starting custom date-based sorting...');
    
    const now = new Date();
    const futureLectures = [];
    const pastLectures = [];
    
    // Separate future and past lectures
    for (let i = 0; i < transformedLectures.length; i++) {
      const lecture = transformedLectures[i];
      const lectureDate = new Date(lecture.date);
      
      if (lectureDate >= now) {
        futureLectures.push(lecture);
      } else {
        pastLectures.push(lecture);
      }
    }
    
    // Sort future lectures by date ascending (earliest first)
    futureLectures.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort past lectures by date descending (most recent first)
    pastLectures.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Combine: future lectures first, then past lectures
    const sortedLectures = [...futureLectures, ...pastLectures];
    
    const sortEndTime = Date.now();
    const sortDuration = sortEndTime - sortStartTime;
    console.log(`📅 [PERFORMANCE] Custom sorting completed in: ${sortDuration}ms`);
    console.log(`📊 [PERFORMANCE] Future lectures: ${futureLectures.length}, Past lectures: ${pastLectures.length}`);
    
    // Debug: Total endpoint timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    console.log('📈 [PERFORMANCE] Super-optimized endpoint timing breakdown:');
    console.log(`  - Database query: ${queryDuration}ms (${((queryDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Data transformation: ${transformDuration}ms (${((transformDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Custom sorting: ${sortDuration}ms (${((sortDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Total endpoint time: ${totalDuration}ms`);
    
    // Performance improvement metrics
    const performanceGrade = totalDuration < 50 ? 'EXCELLENT' : 
                           totalDuration < 100 ? 'VERY_GOOD' :
                           totalDuration < 300 ? 'GOOD' : 
                           totalDuration < 500 ? 'MODERATE' : 'SLOW';
    
    console.log(`🎯 [PERFORMANCE] Performance grade: ${performanceGrade} (${totalDuration}ms)`);
    
    // Add performance headers
    res.set({
      'X-Query-Time': `${queryDuration}ms`,
      'X-Transform-Time': `${transformDuration}ms`,
      'X-Sort-Time': `${sortDuration}ms`,
      'X-Total-Time': `${totalDuration}ms`,
      'X-Lecture-Count': lectures.length,
      'X-Future-Count': futureLectures.length,
      'X-Past-Count': pastLectures.length,
      'X-Performance-Grade': performanceGrade,
      'X-Optimized': 'super-optimized-with-custom-sort',
      'X-Index-Hint': 'forced'
    });

    res.json(sortedLectures);
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    
    console.error('❌ [PERFORMANCE] Error in super-optimized /lectures/public after:', errorDuration + 'ms');
    console.error('❌ [PERFORMANCE] Error details:', error.message);
    console.error('❌ [PERFORMANCE] Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju javnih predavanja',
      debug: {
        duration: errorDuration + 'ms',
        error: error.message,
        optimized: 'super-optimized'
      }
    });
  }
});

// Get public lectures with calculated status information
router.get('/public/with-status', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 [STATUS] /lectures/public/with-status endpoint called at:', new Date().toISOString());
  
  try {
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    console.log(`📊 [STATUS] Database state: ${dbStates[dbState]} (${dbState})`);
    
    if (dbState !== 1) {
      console.error('❌ [STATUS] Database not connected! State:', dbStates[dbState]);
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Query start timing
    const queryStartTime = Date.now();
    console.log('🔍 [STATUS] Starting optimized database query with status calculation...');
    
    // Get approved and cancelled lectures with all necessary fields including duration
    const lectures = await Lecture.find({ 
      status: { $in: ['approved', 'cancelled'] }
    })
      .select('title speaker daija organization organizationId address city date time duration shortDescription description image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
      .populate({
        path: 'organizationId',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'daija',
        select: 'name title image',
        strictPopulate: false
      })
      .exec();

    const queryEndTime = Date.now();
    const queryDuration = queryEndTime - queryStartTime;
    console.log(`⚡ [STATUS] Database query completed in: ${queryDuration}ms`);
    console.log(`📊 [STATUS] Found ${lectures.length} lectures`);
    
    // Transform lectures with speaker info
    const transformStartTime = Date.now();
    console.log('🔄 [STATUS] Starting data transformation...');
    
    const transformedLectures = lectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija ? lecture.daija._id : null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač'
    }));

    const transformEndTime = Date.now();
    const transformDuration = transformEndTime - transformStartTime;
    console.log(`⚡ [STATUS] Data transformation completed in: ${transformDuration}ms`);
    
    // Calculate status for all lectures
    const statusStartTime = Date.now();
    console.log('⏱️ [STATUS] Starting status calculation...');
    
    const lecturesWithStatus = calculateLecturesStatus(transformedLectures);
    
    const statusEndTime = Date.now();
    const statusDuration = statusEndTime - statusStartTime;
    console.log(`⚡ [STATUS] Status calculation completed in: ${statusDuration}ms`);
    
    // Sort by status priority: active -> upcoming -> past
    const sortStartTime = Date.now();
    console.log('📅 [STATUS] Starting status-based sorting...');
    
    const activeLectures = [];
    const upcomingLectures = [];
    const pastLectures = [];
    
    // Separate lectures by status
    lecturesWithStatus.forEach(lecture => {
      switch (lecture.statusInfo.status) {
        case 'active':
          activeLectures.push(lecture);
          break;
        case 'upcoming':
          upcomingLectures.push(lecture);
          break;
        case 'past':
          pastLectures.push(lecture);
          break;
        default:
          pastLectures.push(lecture);
      }
    });
    
    // Sort active by time remaining (shortest first)
    activeLectures.sort((a, b) => (a.statusInfo.timeToEnd || 0) - (b.statusInfo.timeToEnd || 0));
    
    // Sort upcoming by start time (earliest first)
    upcomingLectures.sort((a, b) => (a.statusInfo.timeToStart || 0) - (b.statusInfo.timeToStart || 0));
    
    // Sort past by end time (most recent first)
    pastLectures.sort((a, b) => (a.statusInfo.timeSinceEnd || 0) - (b.statusInfo.timeSinceEnd || 0));
    
    // Combine: active -> upcoming -> past
    const sortedLecturesWithStatus = [...activeLectures, ...upcomingLectures, ...pastLectures];
    
    const sortEndTime = Date.now();
    const sortDuration = sortEndTime - sortStartTime;
    console.log(`📅 [STATUS] Status-based sorting completed in: ${sortDuration}ms`);
    console.log(`📊 [STATUS] Active: ${activeLectures.length}, Upcoming: ${upcomingLectures.length}, Past: ${pastLectures.length}`);
    
    // Total timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    console.log('📈 [STATUS] Status-enhanced endpoint timing breakdown:');
    console.log(`  - Database query: ${queryDuration}ms (${((queryDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Data transformation: ${transformDuration}ms (${((transformDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Status calculation: ${statusDuration}ms (${((statusDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Status-based sorting: ${sortDuration}ms (${((sortDuration/totalDuration)*100).toFixed(1)}%)`);
    console.log(`  - Total endpoint time: ${totalDuration}ms`);
    
    // Performance grade
    const performanceGrade = totalDuration < 100 ? 'EXCELLENT' : 
                           totalDuration < 200 ? 'VERY_GOOD' :
                           totalDuration < 400 ? 'GOOD' : 
                           totalDuration < 600 ? 'MODERATE' : 'SLOW';
    
    console.log(`🎯 [STATUS] Performance grade: ${performanceGrade} (${totalDuration}ms)`);
    
    // Add performance and status headers
    res.set({
      'X-Query-Time': `${queryDuration}ms`,
      'X-Transform-Time': `${transformDuration}ms`,
      'X-Status-Time': `${statusDuration}ms`,
      'X-Sort-Time': `${sortDuration}ms`,
      'X-Total-Time': `${totalDuration}ms`,
      'X-Lecture-Count': lectures.length,
      'X-Active-Count': activeLectures.length,
      'X-Upcoming-Count': upcomingLectures.length,
      'X-Past-Count': pastLectures.length,
      'X-Performance-Grade': performanceGrade,
      'X-Feature': 'status-enhanced',
      'X-Optimized': 'status-calculation-included'
    });

    res.json(sortedLecturesWithStatus);
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    
    console.error('❌ [STATUS] Error in status-enhanced /lectures/public/with-status after:', errorDuration + 'ms');
    console.error('❌ [STATUS] Error details:', error.message);
    console.error('❌ [STATUS] Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Greška pri dohvaćanju predavanja sa statusom',
      debug: {
        duration: errorDuration + 'ms',
        error: error.message,
        feature: 'status-enhanced'
      }
    });
  }
});

// Get single lecture by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid lecture ID format' });
    }
    
    const lecture = await Lecture.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    // Transform lecture to include daijaId for frontend compatibility
    const transformedLecture = {
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    };
    
    res.json(transformedLecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lectures by daija ID
router.get('/daija/:daijaId', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Getting lectures for daija:', req.params.daijaId);
    
    const lectures = await Lecture.find({ 
      daija: req.params.daijaId,
      status: { $in: ['approved', 'cancelled'] }  // Show approved and cancelled lectures
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('organizationId', 'name')
      .populate('daija', 'name title image');
    
    console.log('🔍 [DEBUG] Found lectures:', lectures.length);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač'
    }));
    
    console.log('🔍 [DEBUG] Transformed lectures:', transformedLectures.length);
    res.json(transformedLectures);
  } catch (error) {
    console.error('❌ [DEBUG] Error getting daija lectures:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get lectures by organization ID
router.get('/organization/:organizationId', async (req, res) => {
  try {
    const lectures = await Lecture.find({ 
      organizationId: req.params.organizationId,
      status: { $in: ['approved', 'cancelled'] }  // Show approved and cancelled lectures
    })
      .populate('createdBy', 'firstName lastName email');
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin endpoint - Get all lectures with cancellation reports for dashboard
router.get('/admin/cancellation-reports', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    // Find all lectures that have at least one cancellation report
    const lectures = await Lecture.find({
      'cancellationReports.0': { $exists: true } // Has at least one report
    })
      .select('title date time address city speaker organization cancellationReports isCancelled cancelledAt cancellationReason status image')
      .populate('organizationId', 'name')
      .populate('daija', 'name title')
      .sort({ 'cancellationReports.reportedAt': -1 }); // Sort by most recent report

    // Format the response
    const formattedLectures = await Promise.all(lectures.map(async (lecture) => {
      const speaker = lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač';

      return {
        _id: lecture._id,
        title: lecture.title,
        date: lecture.date,
        time: lecture.time,
        address: lecture.address,
        city: lecture.city,
        speaker: speaker,
        organization: lecture.organizationId?.name || lecture.organization || '',
        status: lecture.status,
        image: lecture.image,
        isCancelled: lecture.isCancelled,
        cancelledAt: lecture.cancelledAt,
        cancellationReason: lecture.cancellationReason,
        reportCount: lecture.cancellationReports.length,
        reportsNeeded: Math.max(0, 3 - lecture.cancellationReports.length),
        reports: await Promise.all(lecture.cancellationReports.map(async (report) => {
          let userData = null;
          
          // Try to populate user data if userId is ObjectId
          if (report.userId && mongoose.Types.ObjectId.isValid(report.userId)) {
            try {
              const user = await User.findById(report.userId).select('username email');
              if (user) {
                userData = {
                  username: user.username,
                  email: user.email
                };
              }
            } catch (err) {
              console.log('Could not populate user:', err);
            }
          }
          
          return {
            _id: report._id,
            reportedAt: report.reportedAt,
            reason: report.reason,
            howFound: report.howFound,
            additionalInfo: report.additionalInfo,
            proofImage: report.proofImage,
            ipAddress: report.ipAddress,
            user: userData || {
              type: 'guest',
              id: report.userId
            }
          };
        }))
      };
    }));

    // Separate into categories
    const autoCancelled = formattedLectures.filter(l => l.isCancelled && l.reportCount >= 3);
    const pending = formattedLectures.filter(l => !l.isCancelled);
    const manuallyCancelled = formattedLectures.filter(l => l.isCancelled && l.reportCount < 3);

    res.json({
      total: formattedLectures.length,
      autoCancelled: autoCancelled.length,
      pending: pending.length,
      manuallyCancelled: manuallyCancelled.length,
      lectures: formattedLectures
    });

  } catch (error) {
    console.error('Error getting all cancellation reports:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju prijava otkazivanja' });
  }
});

// Get all lectures for admin (including cancelled)
router.get('/', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lectures = await Lecture.find({})
      .populate('createdBy', 'firstName lastName email')
      .populate('organizationId', 'name')
      .populate('daija', 'name title image')
      .sort({ createdAt: -1 });
    
    // Transform lectures to include daijaId and speaker for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač'
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending lectures (admin only)
router.get('/pending', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lectures = await Lecture.find({ status: 'pending' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get approved lectures
router.get('/approved', async (req, res) => {
  try {
    const lectures = await Lecture.find({ status: 'approved' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1 });
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest lectures
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lectures = await Lecture.find({ status: 'approved' })
      .sort({ date: -1 })
      .limit(limit);
    
    // Transform lectures to include daijaId for frontend compatibility
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija || null
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancellation endpoints
// Report lecture cancellation
router.post('/:id/report-cancellation', optionalAuth, async (req, res) => {
  try {
    console.log('🟢 Report cancellation request started:', {
      lectureId: req.params.id,
      userId: req.user?.id || 'guest',
      userRole: req.user?.role || 'guest',
      isAuthenticated: !!req.user,
      body: req.body
    });
    
    const lectureId = req.params.id;
    const userId = req.user?.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userIP = req.ip || req.connection.remoteAddress;
    const { reason, howFound, additionalInfo, proof_image } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: 'Neispravna ID predavanja' });
    }

    // Find the lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Check if lecture is already cancelled
    if (lecture.isCancelled) {
      return res.status(400).json({ message: 'Predavanje je već otkazano' });
    }

    // Check if user already reported this lecture (rate limiting)
    let existingReport;
    if (req.user) {
      // Authenticated user - check by userId
      existingReport = lecture.cancellationReports.find(
        report => report.userId.toString() === userId
      );
    } else {
      // Guest user - check by IP address (last 24 hours)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      existingReport = lecture.cancellationReports.find(
        report => report.ipAddress === userIP && report.reportedAt > last24Hours
      );
    }
    
    if (existingReport) {
      return res.status(400).json({ 
        message: req.user ? 
          'Već ste prijavili da je ovo predavanje otkazano' :
          'Sa ovom IP adresom je već prijavljena otkazivanje u zadnja 24 sata'
      });
    }

    // Add cancellation report
    lecture.cancellationReports.push({
      userId: userId,
      reportedAt: new Date(),
      ipAddress: userIP,
      reason: reason || 'Nije specificiran razlog',
      howFound: howFound || 'Nije specificiran način saznavanje',
      additionalInfo: additionalInfo || null,
      proofImage: proof_image || null
    });

    // Check if we have 3 or more reports - auto-cancel
    if (lecture.cancellationReports.length >= 3) {
      lecture.isCancelled = true;
      lecture.cancelledAt = new Date();
      lecture.cancellationReason = 'Otkazano na osnovu prijava korisnika';
      lecture.status = 'cancelled';
    }

    await lecture.save();

    // Response message based on action taken
    const responseMessage = lecture.isCancelled 
      ? 'Predavanje je automatski otkazano zbog dovoljnog broja prijava'
      : `Prijava zabilježena. Potrebno je još ${3 - lecture.cancellationReports.length} prijav(a) za automatsko otkazivanje.`;

    res.json({ 
      message: responseMessage,
      reportCount: lecture.cancellationReports.length,
      isCancelled: lecture.isCancelled
    });

  } catch (error) {
    console.error('🔴 Error reporting cancellation:', error);
    console.error('🔴 Error details:', {
      message: error.message,
      stack: error.stack,
      lectureId: req.params.id,
      userId: req.user?.id,
      userIP: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ 
      message: 'Greška pri prijavljuvanju otkazivanja',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get cancellation statistics for a lecture
router.get('/:id/cancellation-stats', async (req, res) => {
  try {
    const lectureId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: 'Neispravna ID predavanja' });
    }

    const lecture = await Lecture.findById(lectureId)
      .select('cancellationReports isCancelled cancelledAt cancellationReason');

    if (!lecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    res.json({
      reportCount: lecture.cancellationReports.length,
      isCancelled: lecture.isCancelled,
      cancelledAt: lecture.cancelledAt,
      cancellationReason: lecture.cancellationReason,
      reportsNeeded: Math.max(0, 3 - lecture.cancellationReports.length)
    });

  } catch (error) {
    console.error('Error getting cancellation stats:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju statistika otkazivanja' });
  }
});

// Admin endpoint - Get detailed cancellation reports for a lecture
router.get('/:id/cancellation-reports', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lectureId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: 'Neispravna ID predavanja' });
    }

    const lecture = await Lecture.findById(lectureId)
      .select('title date time cancellationReports isCancelled cancelledAt cancellationReason')
      .populate('cancellationReports.userId', 'username email', 'User');

    if (!lecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Format reports for admin view
    const formattedReports = lecture.cancellationReports.map(report => ({
      _id: report._id,
      reportedAt: report.reportedAt,
      reason: report.reason,
      howFound: report.howFound,
      additionalInfo: report.additionalInfo,
      proofImage: report.proofImage,
      ipAddress: report.ipAddress,
      user: report.userId && typeof report.userId === 'object' ? {
        username: report.userId.username,
        email: report.userId.email
      } : {
        type: 'guest',
        id: report.userId
      }
    }));

    res.json({
      lectureInfo: {
        _id: lecture._id,
        title: lecture.title,
        date: lecture.date,
        time: lecture.time,
        isCancelled: lecture.isCancelled,
        cancelledAt: lecture.cancelledAt,
        cancellationReason: lecture.cancellationReason
      },
      reports: formattedReports,
      reportCount: lecture.cancellationReports.length,
      reportsNeeded: Math.max(0, 3 - lecture.cancellationReports.length)
    });

  } catch (error) {
    console.error('Error getting cancellation reports:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju prijava otkazivanja' });
  }
});

// Admin endpoint - Override cancellation status
router.post('/:id/override-cancellation', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lectureId = req.params.id;
    const { isCancelled, reason } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: 'Neispravna ID predavanja' });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Update cancellation status
    lecture.isCancelled = isCancelled;
    lecture.cancelledAt = isCancelled ? new Date() : null;
    lecture.cancellationReason = isCancelled 
      ? (reason || 'Otkazano od strane administratora')
      : null;
    
    // Also update the status field to 'cancelled' when cancelling
    if (isCancelled) {
      lecture.status = 'cancelled';
    }

    await lecture.save();

    res.json({ 
      message: isCancelled 
        ? 'Predavanje je označeno kao otkazano'
        : 'Status otkazivanja je uklonjen',
      isCancelled: lecture.isCancelled
    });

  } catch (error) {
    console.error('Error overriding cancellation:', error);
    res.status(500).json({ message: 'Greška pri mijenjanju status otkazivanja' });
  }
});

// TEST ENDPOINT - Get public lectures without populate to debug
router.get('/public-test', async (req, res) => {
  console.log('🔍 TEST ENDPOINT HIT - /lectures/public-test');
  
  try {
    const { status } = req.query;
    console.log('🔍 Query params:', req.query);
    
    let statusFilter = { status: 'approved' };
    
    if (status === 'all') {
      statusFilter = { status: { $in: ['approved', 'cancelled'] } };
      console.log('✅ Using ALL filter');
    }
    
    console.log('🔍 Status filter:', statusFilter);
    
    // Simple query without populate
    const lectures = await Lecture.find(statusFilter)
      .select('title speaker status isCancelled date')
      .lean();
    
    console.log('📊 Found lectures:', lectures.length);
    const cancelled = lectures.filter(l => l.status === 'cancelled');
    console.log('❌ Cancelled lectures:', cancelled.length);
    
    if (cancelled.length > 0) {
      console.log('❌ Sample cancelled:', cancelled[0]);
    }
    
    res.json({
      total: lectures.length,
      cancelled: cancelled.length,
      lectures: lectures
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint - Reset cancellation reports
router.delete('/:id/reset-cancellation', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const lectureId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: 'Neispravna ID predavanja' });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Predavanje nije pronađeno' });
    }

    // Reset all cancellation data
    lecture.cancellationReports = [];
    lecture.isCancelled = false;
    lecture.cancelledAt = null;
    lecture.cancellationReason = null;

    await lecture.save();

    res.json({ 
      message: 'Svi podaci o otkazivanju su resetovani',
      reportCount: 0,
      isCancelled: false
    });

  } catch (error) {
    console.error('Error resetting cancellation:', error);
    res.status(500).json({ message: 'Greška pri resetovanju podataka o otkazivanju' });
  }
});

// Admin endpoint - Clear cancellation reports for started lectures
router.post('/clear-started-reports', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const now = new Date();
    
    // Find lectures that have started (date + time is in the past) and have cancellation reports
    const lectures = await Lecture.find({
      'cancellationReports.0': { $exists: true }, // Has at least one report
      isCancelled: { $ne: true } // Not manually cancelled
    });

    let clearedCount = 0;
    const clearedLectures = [];

    for (const lecture of lectures) {
      // Parse lecture date and time
      const lectureDate = new Date(lecture.date);
      const [hours, minutes] = lecture.time.split(':').map(Number);
      lectureDate.setHours(hours, minutes, 0, 0);
      
      // If lecture has started, clear cancellation reports
      if (lectureDate <= now) {
        const reportsCount = lecture.cancellationReports.length;
        lecture.cancellationReports = [];
        await lecture.save();
        
        clearedCount += reportsCount;
        clearedLectures.push({
          _id: lecture._id,
          title: lecture.title,
          date: lecture.date,
          time: lecture.time,
          reportsCleared: reportsCount
        });
      }
    }

    res.json({
      message: `Obrisane su prijave za ${clearedLectures.length} započetih predavanja`,
      totalReportsCleared: clearedCount,
      clearedLectures: clearedLectures
    });

  } catch (error) {
    console.error('Error clearing started lecture reports:', error);
    res.status(500).json({ message: 'Greška pri brisanju prijava za započeta predavanja' });
  }
});

// Process weekly lectures - creates next lecture in series
router.post('/process-weekly', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    console.log('🔄 Processing weekly lectures...');
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);

    // Find weekly lectures that have passed and need next lecture created
    const passedWeeklyLectures = await Lecture.find({
      isWeeklyLecture: true,
      date: { $gte: yesterday, $lte: today },
      $expr: { $lt: ['$weekNumber', '$totalWeeks'] }, // weekNumber < totalWeeks
      status: { $ne: 'cancelled' }
    }).populate('daija organizationId');

    console.log(`Found ${passedWeeklyLectures.length} weekly lectures to process`);

    const processedLectures = [];
    const errors = [];

    for (const lecture of passedWeeklyLectures) {
      try {
        // Check if next lecture already exists
        const existingNextLecture = await Lecture.findOne({
          weeklySeriesId: lecture.weeklySeriesId,
          weekNumber: lecture.weekNumber + 1
        });

        if (!existingNextLecture) {
          // Calculate next lecture date (7 days later)
          const nextDate = new Date(lecture.date);
          nextDate.setDate(nextDate.getDate() + 7);

          // Create new lecture data
          const newLectureData = {
            title: lecture.title,
            speaker: lecture.speaker,
            daija: lecture.daija?._id || lecture.daija,
            organization: lecture.organization,
            organizationId: lecture.organizationId?._id || lecture.organizationId,
            date: nextDate,
            time: lecture.time,
            address: lecture.address,
            city: lecture.city,
            shortDescription: lecture.shortDescription,
            description: lecture.description,
            image: lecture.image,
            status: lecture.status, // Keep same status as parent
            createdBy: lecture.createdBy,
            // Weekly lecture specific fields
            isWeeklyLecture: true,
            weeklySeriesId: lecture.weeklySeriesId,
            weekNumber: lecture.weekNumber + 1,
            totalWeeks: lecture.totalWeeks,
            parentLectureId: lecture.parentLectureId || lecture._id
          };

          const newLecture = new Lecture(newLectureData);
          await newLecture.save();

          processedLectures.push({
            originalLecture: {
              _id: lecture._id,
              title: lecture.title,
              date: lecture.date,
              weekNumber: lecture.weekNumber
            },
            newLecture: {
              _id: newLecture._id,
              title: newLecture.title,
              date: newLecture.date,
              weekNumber: newLecture.weekNumber
            }
          });

          console.log(`Created next weekly lecture: ${newLecture.title} (Week ${newLecture.weekNumber}/${newLecture.totalWeeks})`);
        } else {
          console.log(`Next lecture already exists for series ${lecture.weeklySeriesId}, week ${lecture.weekNumber + 1}`);
        }
      } catch (error) {
        console.error(`Error processing lecture ${lecture._id}:`, error);
        errors.push({
          lectureId: lecture._id,
          title: lecture.title,
          error: error.message
        });
      }
    }

    res.json({
      message: `Processed ${processedLectures.length} weekly lectures`,
      processedCount: processedLectures.length,
      errorCount: errors.length,
      processedLectures,
      errors
    });

  } catch (error) {
    console.error('Error processing weekly lectures:', error);
    res.status(500).json({ message: 'Greška pri procesiranju sedmičnih predavanja' });
  }
});

// Get weekly lecture series
router.get('/weekly-series/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    
    const lectures = await Lecture.find({ 
      weeklySeriesId: seriesId 
    })
      .populate('daija', 'name title')
      .populate('organizationId', 'name')
      .sort({ weekNumber: 1 });

    if (lectures.length === 0) {
      return res.status(404).json({ message: 'Serija predavanja nije pronađena' });
    }

    // Get series info from first lecture
    const seriesInfo = {
      seriesId: seriesId,
      title: lectures[0].title,
      totalWeeks: lectures[0].totalWeeks,
      createdLectures: lectures.length,
      remainingLectures: lectures[0].totalWeeks - lectures.length,
      lectures: lectures.map(lecture => ({
        _id: lecture._id,
        weekNumber: lecture.weekNumber,
        date: lecture.date,
        time: lecture.time,
        status: lecture.status,
        isCancelled: lecture.isCancelled,
        speaker: lecture.daija ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim() : lecture.speaker,
        organization: lecture.organizationId?.name || lecture.organization,
        address: lecture.address,
        city: lecture.city
      }))
    };

    res.json(seriesInfo);

  } catch (error) {
    console.error('Error getting weekly series:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju serije predavanja' });
  }
});

module.exports = router; 