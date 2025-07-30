const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');

// Test endpoint for weekly lectures
router.get('/test-weekly', async (req, res) => {
  try {
    console.log('🔍 Test weekly endpoint called');
    
    // Find test weekly lecture
    const lecture = await Lecture.findOne({ 
      title: { $regex: 'TEST SEDMIČNO' } 
    }).lean();
    
    if (lecture) {
      console.log('✅ Found test lecture:', {
        title: lecture.title,
        isWeeklyLecture: lecture.isWeeklyLecture,
        weekNumber: lecture.weekNumber,
        totalWeeks: lecture.totalWeeks
      });
      
      res.json({
        success: true,
        lecture: {
          _id: lecture._id,
          title: lecture.title,
          isWeeklyLecture: lecture.isWeeklyLecture,
          weekNumber: lecture.weekNumber,
          totalWeeks: lecture.totalWeeks,
          weeklySeriesId: lecture.weeklySeriesId,
          date: lecture.date,
          time: lecture.time,
          address: lecture.address,
          city: lecture.city,
          status: lecture.status
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Test weekly lecture not found'
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;