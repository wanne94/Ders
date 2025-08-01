const cron = require('node-cron');

// Schedule cleanup of old cancellation reports
const scheduleCleanupJobs = () => {
  // Run every day at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Running cleanup jobs...');
    
    try {
      const Lecture = require('../models/Lecture');
      const now = new Date();
      
      // Find lectures that have started and have cancellation reports
      const lectures = await Lecture.find({
        'cancellationReports.0': { $exists: true },
        isCancelled: { $ne: true }
      });
      
      let clearedCount = 0;
      
      for (const lecture of lectures) {
        const lectureDate = new Date(lecture.date);
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDate.setHours(hours, minutes, 0, 0);
        
        // If lecture has started, clear cancellation reports
        if (lectureDate <= now) {
          clearedCount += lecture.cancellationReports.length;
          lecture.cancellationReports = [];
          await lecture.save();
        }
      }
      
      console.log(`✅ Cleared ${clearedCount} cancellation reports from started lectures`);
    } catch (error) {
      console.error('Error running cleanup jobs:', error);
    }
  });
  
  console.log('✅ Cleanup cron job scheduled');
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  scheduleCleanupJobs();
  console.log('✅ All cron jobs initialized');
};

module.exports = {
  initializeCronJobs
};