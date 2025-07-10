const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lecture = require('../models/Lecture');
const { authMiddleware: authenticateToken } = require('../utils/jwt');
const { isAdminOrSuperAdmin } = require('../middleware/auth');

// 🔧 Debug: Test if both functions are loaded correctly
console.log('🔍 [DEBUG] authenticateToken:', typeof authenticateToken, authenticateToken);
console.log('🔍 [DEBUG] isAdminOrSuperAdmin:', typeof isAdminOrSuperAdmin, isAdminOrSuperAdmin);

// Make lectures endpoint public (remove authentication requirement)
router.get('/public', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 [PERFORMANCE] /lectures/public endpoint called at:', new Date().toISOString());
  
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
    
    // Method 1: Try with hint to force index usage
    let lectures;
    try {
      lectures = await Lecture.find({ 
        status: 'approved'
        // Removed date filter to show all lectures including past ones
      })
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
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
      lectures = await Lecture.find({ 
        status: 'approved'
        // Removed date filter to show all lectures including past ones
      })
        .select('title speaker daija organization organizationId address city date time shortDescription description image status createdAt')
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
      status: 'approved'  // Only show approved lectures to public
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
      status: 'approved'  // Only show approved lectures to public
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

module.exports = router; 