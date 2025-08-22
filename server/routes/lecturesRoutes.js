const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lecture = require('../models/Lecture');
const User = require('../models/User');
const Organization = require('../models/Organization'); // Add Organization model
const Daija = require('../models/Daija'); // Add Daija model
const { authMiddleware: authenticateToken } = require('../utils/jwt');
const { isAdminOrSuperAdmin, optionalAuth } = require('../middleware/auth');
const { calculateLecturesStatus } = require('../utils/lectureStatus');
const { parseLocalDate, addDays } = require('../utils/dateHelpers');

// 🔧 Debug: Test if both functions are loaded correctly

// Make lectures endpoint public (remove authentication requirement)
router.get('/public', async (req, res) => {
  
  const startTime = Date.now();
  
  // Get status filter from query parameters
  const { status } = req.query;
  
  let statusFilter = { status: 'approved' }; // Default to approved only
  
  if (status) {
    if (status === 'all') {
      // Updated to catch all possible cancelled lectures
      statusFilter = { 
        $or: [
          { status: 'approved' },
          { status: 'cancelled' },
          { status: 'canceled' }, // in case of typo
          { isCancelled: true }    // additional check for isCancelled field
        ]
      };
    } else if (Array.isArray(status)) {
      statusFilter = { status: { $in: status } };
    } else {
      statusFilter = { status: status };
    }
  }
  
  
  try {
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    if (dbState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Debug: Start query timing
    const queryStartTime = Date.now();
    
    // 🚀 SUPER-OPTIMIZED QUERY with forced index usage and minimal data transfer
    
    // First, let's debug what's in the database
    const allLectures = await Lecture.find({}).select('status').lean();
    const statusCounts = {};
    allLectures.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    
    // Method 1: Try with hint to force index usage
    let lectures;
    
    // CRITICAL DEBUG: Let's see what's in the database
    const testCancelled = await Lecture.findOne({ status: 'cancelled' });
    if (testCancelled) {
    } else {
    }
    
    try {
      lectures = await Lecture.find(statusFilter)
        .select('title speaker daija organization organizationId address city date time shortDescription image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
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
        // .hint({ status: 1, date: 1 }) // 🚀 Force index usage - DISABLED
        .lean()
        .exec();
      
      
      // Debug first lecture
      if (lectures.length > 0) {
        const firstLecture = lectures[0];
      }
    } catch (hintError) {
      
      // Fallback: Regular optimized query
      lectures = await Lecture.find(statusFilter)
        .select('title speaker daija organization organizationId address city date time shortDescription image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
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
    
    // CRITICAL: Check what statuses we got
    const lectureStatusCounts = {};
    lectures.forEach(l => {
      lectureStatusCounts[l.status] = (lectureStatusCounts[l.status] || 0) + 1;
    });
    
    // IMMEDIATE DEBUG: Check what came from DB
    if (lectures.length > 0) {
      const firstLecture = lectures[0];
      
      // Check a specific weekly lecture
      const weeklyOne = lectures.find(l => l.title && l.title.includes('Ramazan'));
      if (weeklyOne) {
      }
    }

    // 🔍 RAW DEBUG - Check what's coming from database
    if (lectures.length > 0) {
      const firstLecture = lectures[0];
      
      // Find Ramazan lecture specifically
      const ramazanLecture = lectures.find(l => l.title && l.title.includes('Ramazan'));
      if (ramazanLecture) {
      }
    }
    
    // Debug: Check if weekly fields are present before transformation
    const weeklyLecture = lectures.find(l => l.title && l.title.includes('TEST SEDMIČNO'));
    if (weeklyLecture) {
    } else {
      // Show first few titles
      lectures.slice(0, 3).forEach(l => {
      });
    }
    
    // Debug: Check raw lecture data
    const testLecture = lectures.find(l => l.title && l.title.includes('TEST SEDMIČNO PREDAVANJE'));
    if (testLecture) {
    } else {
    }
    
    // Debug: Check cancelled lectures
    const cancelledLectures = lectures.filter(l => l.status === 'cancelled' || l.isCancelled);
    if (cancelledLectures.length > 0) {
    }
    
    // CRITICAL: Check for Diskriminacija lecture
    const diskriminacijaLecture = lectures.find(l => l.title && l.title.toLowerCase().includes('diskriminacija'));
    if (diskriminacijaLecture) {
    } else {
      // Let's check if it exists at all
      const diskriminacijaInDB = await Lecture.findOne({ title: { $regex: 'diskriminacija', $options: 'i' } });
      if (diskriminacijaInDB) {
      }
    }
    
    // Debug: Check test weekly lectures
    const testLectures = lectures.filter(l => l.title && l.title.toLowerCase().includes('test'));
    testLectures.forEach((lecture, i) => {
    });
    
    // Debug: Start transformation timing
    const transformStartTime = Date.now();
    if (lectures.length > 0) {
    }
    
    // 🚀 LIGHTNING-FAST transformation - pre-allocate array for better performance
    const transformedLectures = new Array(lectures.length);
    
    // Debug cancelled lectures before transformation
    const cancelledBeforeTransform = lectures.filter(l => l.status === 'cancelled' || l.isCancelled);
    
    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      
      // Debug cancelled lecture transformation
      if (lecture.status === 'cancelled' || lecture.isCancelled) {
      }
      
      // Debug first test lecture
      if (i === 0 && lecture.title?.toLowerCase().includes('test')) {
      }
      
      // Use Object.assign to ensure all properties are copied
      transformedLectures[i] = Object.assign({}, lecture, {
        daijaId: lecture.daija ? lecture.daija._id : null,
        speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
          ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
          : lecture.speaker,
        // Explicitly include weekly lecture fields
        isWeeklyLecture: lecture.isWeeklyLecture,
        weekNumber: lecture.weekNumber,
        totalWeeks: lecture.totalWeeks,
        weeklySeriesId: lecture.weeklySeriesId,
        // Explicitly include cancellation fields
        isCancelled: lecture.isCancelled,
        cancelledAt: lecture.cancelledAt,
        cancellationReason: lecture.cancellationReason
      });
      
      // Debug cancelled lecture after transformation
      if (lecture.status === 'cancelled' || lecture.isCancelled) {
      }
      
      // Debug first test lecture after transform
      if (i === 0 && lecture.title?.toLowerCase().includes('test')) {
      }
    }
    
    // Debug cancelled lectures after transformation
    const cancelledAfterTransform = transformedLectures.filter(l => l && (l.status === 'cancelled' || l.isCancelled));

    const transformEndTime = Date.now();
    const transformDuration = transformEndTime - transformStartTime;
    
    // Debug: Check weekly lectures after transformation
    const weeklyAfterTransform = transformedLectures.filter(l => l.isWeeklyLecture);
    
    // 🚀 CUSTOM SORTING: Future lectures first (ascending date), then past lectures (descending date)
    const sortStartTime = Date.now();
    
    const now = new Date();
    const futureLectures = [];
    const pastLectures = [];
    
    // Separate future and past lectures
    for (let i = 0; i < transformedLectures.length; i++) {
      const lecture = transformedLectures[i];
      const lectureDate = new Date(lecture.date);
      
      // Debug cancelled lectures during sorting
      if (lecture.status === 'cancelled' || lecture.isCancelled) {
      }
      
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
    
    // Debug: Check cancelled lectures in final sorted array
    const cancelledInSorted = sortedLectures.filter(l => l.status === 'cancelled' || l.isCancelled);
    if (cancelledInSorted.length > 0) {
    }
    
    const sortEndTime = Date.now();
    const sortDuration = sortEndTime - sortStartTime;
    
    // Debug: Total endpoint timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    
    // Performance improvement metrics
    const performanceGrade = totalDuration < 50 ? 'EXCELLENT' : 
                           totalDuration < 100 ? 'VERY_GOOD' :
                           totalDuration < 300 ? 'GOOD' : 
                           totalDuration < 500 ? 'MODERATE' : 'SLOW';
    
    
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

    // Debug: Final check before sending
    const finalWeeklyCount = sortedLectures.filter(l => l.isWeeklyLecture).length;
    
// 🔍 COMPREHENSIVE DEBUG LOGGING
    
    // Check first lecture in detail
    if (sortedLectures.length > 0) {
      const firstLecture = sortedLectures[0];
    }
    
    // Check Ramazan lectures specifically
    const ramazanLectures = sortedLectures.filter(l => l.title && l.title.includes('Ramazan'));
    if (ramazanLectures.length > 0) {
      const ramLec = ramazanLectures[0];
    }
    
    // FINAL DEBUG: Check exactly what we're sending
    const testWeeklyLecture = sortedLectures.find(l => l.isWeeklyLecture === true);
    if (testWeeklyLecture) {
      // Test serialization
      const testJson = JSON.stringify(testWeeklyLecture);
      const parsed = JSON.parse(testJson);
    } else {
    }
    
    res.json(sortedLectures);
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    
    
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
  
  try {
    // Debug: Database connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    if (dbState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    // Query start timing
    const queryStartTime = Date.now();
    
    // Get approved and cancelled lectures with all necessary fields including duration
    const lectures = await Lecture.find({ 
      status: { $in: ['approved', 'cancelled'] }
    })
      .select('title speaker daija organization organizationId address city date time duration shortDescription image status createdAt isCancelled cancelledAt cancellationReason isWeeklyLecture weekNumber totalWeeks weeklySeriesId')
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
    
    // Transform lectures with speaker info
    const transformStartTime = Date.now();
    
    const transformedLectures = lectures.map(lecture => ({
      ...lecture,
      daijaId: lecture.daija ? lecture.daija._id : null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač',
      // Explicitly include weekly lecture fields
      isWeeklyLecture: lecture.isWeeklyLecture,
      weekNumber: lecture.weekNumber,
      totalWeeks: lecture.totalWeeks,
      weeklySeriesId: lecture.weeklySeriesId,
      // Explicitly include cancellation fields
      isCancelled: lecture.isCancelled,
      cancelledAt: lecture.cancelledAt,
      cancellationReason: lecture.cancellationReason
    }));

    const transformEndTime = Date.now();
    const transformDuration = transformEndTime - transformStartTime;
    
    // Calculate status for all lectures
    const statusStartTime = Date.now();
    
    const lecturesWithStatus = calculateLecturesStatus(transformedLectures);
    
    const statusEndTime = Date.now();
    const statusDuration = statusEndTime - statusStartTime;
    
    // Sort by status priority: active -> upcoming -> past
    const sortStartTime = Date.now();
    
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
    
    // Total timing
    const totalEndTime = Date.now();
    const totalDuration = totalEndTime - startTime;
    
    
    // Performance grade
    const performanceGrade = totalDuration < 100 ? 'EXCELLENT' : 
                           totalDuration < 200 ? 'VERY_GOOD' :
                           totalDuration < 400 ? 'GOOD' : 
                           totalDuration < 600 ? 'MODERATE' : 'SLOW';
    
    
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

// Create new lecture
router.post('/', authenticateToken, async (req, res) => {
  try {
    
    const {
      title,
      type = 'Predavanje',
      daija,
      speaker,
      organization,
      organizationId,
      address,
      city,
      date,
      time,
      duration = 60,
      shortDescription,
      description,
      image,
      status = 'approved',
      isWeeklyLecture = false,
      totalWeeks = 2
    } = req.body;

    // Validation
    if (!title || !address || !city || !date || !time) {
      return res.status(400).json({ 
        message: 'Naslov, adresa, grad, datum i vrijeme su obavezni.' 
      });
    }

    // Validate date is not in the past
    // Koristi parseLocalDate da izbjegne timezone probleme
    const lectureDate = parseLocalDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lectureDate < today) {
      return res.status(400).json({ 
        message: 'Datum predavanja ne može biti u prošlosti.' 
      });
    }

    // If it's a weekly lecture, validate totalWeeks
    if (isWeeklyLecture) {
      if (totalWeeks < 2 || totalWeeks > 12) {
        return res.status(400).json({ 
          message: 'Broj sedmica mora biti između 2 i 12.' 
        });
      }
    }

    if (isWeeklyLecture) {
      // Create all lectures in the series at once
      const weeklySeriesId = `WL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const lectures = [];
      
      for (let week = 1; week <= totalWeeks; week++) {
        // Koristi addDays umjesto direktnog manipulisanja datuma
        const weekDate = addDays(lectureDate, (week - 1) * 7);
        
        const lectureData = {
          type,
          title: title,
          daija,
          speaker,
          organization,
          organizationId,
          address,
          city,
          date: weekDate,
          time,
          duration,
          shortDescription,
          description,
          image,
          status,
          createdBy: req.user.id,
          isWeeklyLecture: true,
          weeklySeriesId,
          weekNumber: week,
          totalWeeks,
          parentLectureId: week === 1 ? null : undefined,
          lecturePart: req.body.lecturePart ? req.body.lecturePart + (week - 1) : null
        };
        
        const newLecture = new Lecture(lectureData);
        const savedLecture = await newLecture.save();
        
        // Set parentLectureId for subsequent lectures
        if (week === 1) {
          lectures.forEach((l, i) => {
            if (i > 0) l.parentLectureId = savedLecture._id;
          });
        }
        
        lectures.push(savedLecture);
      }
      
      
      // Return the first lecture with info about the series
      res.status(201).json({
        message: `Uspješno kreirano ${totalWeeks} sedmičnih predavanja`,
        lecture: lectures[0],
        seriesInfo: {
          weeklySeriesId,
          totalWeeks,
          createdLectures: lectures.length,
          lectureIds: lectures.map(l => l._id)
        }
      });
      
    } else {
      // Create single lecture
      const lectureData = {
        type,
        title,
        daija,
        speaker,
        organization,
        organizationId,
        address,
        city,
        date: lectureDate,
        time,
        duration,
        shortDescription,
        description,
        image,
        status,
        createdBy: req.user.id
      };
      
      const newLecture = new Lecture(lectureData);
      const savedLecture = await newLecture.save();
      
      res.status(201).json({
        message: 'Predavanje uspješno kreirano',
        lecture: savedLecture
      });
    }
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Greška pri kreiranju predavanja',
      error: error.message 
    });
  }
});

// Get lecture statistics by month and year
router.get('/statistics', async (req, res) => {
  console.log('Statistics endpoint hit!');
  try {
    const { year, startYear, endYear } = req.query;
    
    // Build date filter
    let dateFilter = { status: 'approved' };
    
    if (year) {
      // Specific year
      const yearInt = parseInt(year);
      dateFilter.date = {
        $gte: new Date(yearInt, 0, 1),
        $lt: new Date(yearInt + 1, 0, 1)
      };
    } else if (startYear && endYear) {
      // Date range
      dateFilter.date = {
        $gte: new Date(parseInt(startYear), 0, 1),
        $lt: new Date(parseInt(endYear) + 1, 0, 1)
      };
    }
    
    // Get all lectures matching the filter
    const lectures = await Lecture.find(dateFilter).select('date title daija organization');
    
    // Process statistics
    const monthlyStats = {};
    const yearlyStats = {};
    let totalCount = 0;
    
    lectures.forEach(lecture => {
      if (!lecture.date) return;
      
      const date = new Date(lecture.date);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      // Monthly stats
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          year,
          month: month + 1,
          count: 0,
          lectures: []
        };
      }
      monthlyStats[monthKey].count++;
      monthlyStats[monthKey].lectures.push({
        id: lecture._id,
        title: lecture.title,
        date: lecture.date,
        daija: lecture.daija,
        organization: lecture.organization
      });
      
      // Yearly stats
      if (!yearlyStats[year]) {
        yearlyStats[year] = {
          year,
          count: 0,
          monthlyBreakdown: {}
        };
      }
      yearlyStats[year].count++;
      
      if (!yearlyStats[year].monthlyBreakdown[month + 1]) {
        yearlyStats[year].monthlyBreakdown[month + 1] = 0;
      }
      yearlyStats[year].monthlyBreakdown[month + 1]++;
      
      totalCount++;
    });
    
    // Calculate averages and find peak month
    const monthlyArray = Object.values(monthlyStats);
    const averagePerMonth = monthlyArray.length > 0 
      ? (totalCount / monthlyArray.length).toFixed(1) 
      : 0;
    
    const peakMonth = monthlyArray.reduce((max, current) => 
      current.count > (max?.count || 0) ? current : max, 
      null
    );
    
    // Get available years for filter
    const availableYears = [...new Set(lectures.map(l => 
      new Date(l.date).getFullYear()
    ))].sort((a, b) => b - a);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalLectures: totalCount,
          averagePerMonth,
          peakMonth: peakMonth ? {
            year: peakMonth.year,
            month: peakMonth.month,
            count: peakMonth.count
          } : null,
          totalMonths: monthlyArray.length,
          totalYears: Object.keys(yearlyStats).length
        },
        monthlyStats: monthlyArray.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        }),
        yearlyStats: Object.values(yearlyStats).sort((a, b) => b.year - a.year),
        availableYears
      }
    });
    
  } catch (error) {
    console.error('Error fetching lecture statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Greška pri dohvaćanju statistika predavanja',
      error: error.message 
    });
  }
});

// Get lectures by daija ID
router.get('/daija/:daijaId', async (req, res) => {
  try {
    
    const lectures = await Lecture.find({ 
      daija: req.params.daijaId,
      status: { $in: ['approved', 'cancelled'] }  // Show approved and cancelled lectures
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('organizationId', 'name')
      .populate('daija', 'name title image');
    
    
    // Transform lectures to include daijaId for frontend compatibility
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
// TEST ENDPOINT - Get public lectures without populate to debug
router.get('/public-test', async (req, res) => {
  
  try {
    const { status } = req.query;
    
    let statusFilter = { status: 'approved' };
    
    if (status === 'all') {
      statusFilter = { status: { $in: ['approved', 'cancelled'] } };
    }
    
    
    // Simple query without populate
    const lectures = await Lecture.find(statusFilter)
      .select('title speaker status isCancelled date')
      .lean();
    
    const cancelled = lectures.filter(l => l.status === 'cancelled');
    
    if (cancelled.length > 0) {
    }
    
    res.json({
      total: lectures.length,
      cancelled: cancelled.length,
      lectures: lectures
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ message: 'Greška pri dohvaćanju serije predavanja' });
  }
});

// Get single lecture by ID
router.get('/:id', async (req, res) => {
  try {
    // Skip if this is the statistics route (fallback for deployment issues)
    if (req.params.id === 'statistics') {
      const { year, startYear, endYear } = req.query;
      
      // Build date filter
      let dateFilter = { status: 'approved' };
      
      if (year) {
        // Specific year
        const yearInt = parseInt(year);
        dateFilter.date = {
          $gte: new Date(yearInt, 0, 1),
          $lt: new Date(yearInt + 1, 0, 1)
        };
      } else if (startYear && endYear) {
        // Date range
        dateFilter.date = {
          $gte: new Date(parseInt(startYear), 0, 1),
          $lt: new Date(parseInt(endYear) + 1, 0, 1)
        };
      }
      
      // Get all lectures matching the filter
      const lectures = await Lecture.find(dateFilter).select('date title daija organization');
      
      // Process statistics
      const monthlyStats = {};
      const yearlyStats = {};
      let totalCount = 0;
      
      lectures.forEach(lecture => {
        if (!lecture.date) return;
        
        const date = new Date(lecture.date);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        // Monthly stats
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            year,
            month: month + 1,
            count: 0,
            lectures: []
          };
        }
        monthlyStats[monthKey].count++;
        
        // Yearly stats
        if (!yearlyStats[year]) {
          yearlyStats[year] = {
            year,
            count: 0,
            monthlyBreakdown: {}
          };
        }
        yearlyStats[year].count++;
        
        if (!yearlyStats[year].monthlyBreakdown[month + 1]) {
          yearlyStats[year].monthlyBreakdown[month + 1] = 0;
        }
        yearlyStats[year].monthlyBreakdown[month + 1]++;
        
        totalCount++;
      });
      
      // Calculate averages and find peak month
      const monthlyArray = Object.values(monthlyStats);
      const averagePerMonth = monthlyArray.length > 0 
        ? (totalCount / monthlyArray.length).toFixed(1) 
        : 0;
      
      const peakMonth = monthlyArray.reduce((max, current) => 
        current.count > (max?.count || 0) ? current : max, 
        null
      );
      
      return res.json({
        success: true,
        data: {
          summary: {
            totalLectures: totalCount,
            averagePerMonth,
            peakMonth: peakMonth ? {
              year: peakMonth.year,
              month: peakMonth.month,
              count: peakMonth.count
            } : null
          },
          monthlyStats: monthlyArray,
          yearlyStats: Object.values(yearlyStats)
        }
      });
    }
    
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








// Cancellation endpoints
// Report lecture cancellation
router.post('/:id/report-cancellation', optionalAuth, async (req, res) => {
  try {
    
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
    res.status(500).json({ message: 'Greška pri mijenjanju status otkazivanja' });
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
    res.status(500).json({ message: 'Greška pri brisanju prijava za započeta predavanja' });
  }
});

// Process weekly lectures - creates next lecture in series
router.post('/process-weekly', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    
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

        } else {
        }
      } catch (error) {
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
    res.status(500).json({ message: 'Greška pri procesiranju sedmičnih predavanja' });
  }
});



module.exports = router; 