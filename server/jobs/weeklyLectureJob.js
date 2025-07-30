const cron = require('node-cron');
const Lecture = require('../models/Lecture');
const logger = require('../utils/logger');

const createNextWeeklyLecture = async (lecture) => {
  try {
    // Calculate next lecture date (7 days later)
    const nextDate = new Date(lecture.date);
    nextDate.setDate(nextDate.getDate() + 7);

    // Create new lecture data
    const newLectureData = {
      title: lecture.title,
      speaker: lecture.speaker,
      daija: lecture.daija,
      organization: lecture.organization,
      organizationId: lecture.organizationId,
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

    logger.info(`Created next weekly lecture: ${newLecture.title} (Week ${newLecture.weekNumber}/${newLecture.totalWeeks})`);
    return newLecture;
  } catch (error) {
    logger.error('Error creating next weekly lecture:', error);
    throw error;
  }
};

const processWeeklyLectures = async () => {
  try {
    // Log memory usage at start
    const startMemory = process.memoryUsage();
    logger.info(`Cron job starting - Memory: ${Math.round(startMemory.heapUsed / 1024 / 1024)} MB`);
    logger.info('Starting weekly lecture cron job...');
    
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

    logger.info(`Found ${passedWeeklyLectures.length} weekly lectures to process`);

    for (const lecture of passedWeeklyLectures) {
      if (lecture.weekNumber < lecture.totalWeeks) {
        // Check if next lecture already exists
        const existingNextLecture = await Lecture.findOne({
          weeklySeriesId: lecture.weeklySeriesId,
          weekNumber: lecture.weekNumber + 1
        });

        if (!existingNextLecture) {
          await createNextWeeklyLecture(lecture);
        } else {
          logger.info(`Next lecture already exists for series ${lecture.weeklySeriesId}, week ${lecture.weekNumber + 1}`);
        }
      }
    }

    // Log memory usage at end and force garbage collection if available
    const endMemory = process.memoryUsage();
    logger.info(`Cron job completed - Memory: ${Math.round(endMemory.heapUsed / 1024 / 1024)} MB`);
    
    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
      logger.info('Garbage collection triggered');
    }
  } catch (error) {
    logger.error('Error in weekly lecture cron job:', error);
  }
};

// Schedule cron job to run every day at 2:00 AM
const startWeeklyLectureCron = () => {
  cron.schedule('0 2 * * *', processWeeklyLectures, {
    timezone: 'Europe/Sarajevo' // Adjust timezone as needed
  });
  
  logger.info('Weekly lecture cron job scheduled for 2:00 AM daily');
};

// Export for testing and manual execution
module.exports = {
  startWeeklyLectureCron,
  processWeeklyLectures,
  createNextWeeklyLecture
};