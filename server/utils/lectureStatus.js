/**
 * Server-side utility functions for calculating lecture status
 * This mirrors the frontend logic but runs on the server
 */

/**
 * Calculates the precise status of a lecture based on current time
 * @param {Object} lecture - Lecture object with date, time, and optional duration
 * @returns {Object} - Object with status, timeInfo, and additional metadata
 */
const calculateLectureStatus = (lecture) => {
  if (!lecture || !lecture.date) {
    return {
      status: 'unknown',
      timeInfo: '',
      badgeText: 'N/A',
      badgeColor: 'gray'
    };
  }

  const now = new Date();
  const lectureDate = new Date(lecture.date);
  
  // Parse lecture time (default to 12:00 if not provided)
  let hours = 12;
  let minutes = 0;
  if (lecture.time) {
    const timeParts = lecture.time.split(':');
    hours = parseInt(timeParts[0]) || 12;
    minutes = parseInt(timeParts[1]) || 0;
  }
  
  // Set lecture start time
  const lectureStartTime = new Date(lectureDate);
  lectureStartTime.setHours(hours, minutes, 0, 0);
  
  // Calculate lecture end time (duration in minutes, default 60)
  const duration = lecture.duration || 60;
  const lectureEndTime = new Date(lectureStartTime);
  lectureEndTime.setMinutes(lectureEndTime.getMinutes() + duration);
  
  // Calculate time differences
  const timeToStart = lectureStartTime.getTime() - now.getTime();
  const timeToEnd = lectureEndTime.getTime() - now.getTime();
  
  // Determine status
  if (timeToStart > 0) {
    // Future lecture - "Uskoro"
    const timeInfo = formatTimeUntilStart(timeToStart);
    return {
      status: 'upcoming',
      timeInfo,
      badgeText: timeInfo,
      badgeColor: 'yellow',
      timeToStart,
      lectureStartTime,
      lectureEndTime
    };
  } else if (timeToEnd > 0) {
    // Currently active - "U toku"
    const timeInfo = formatTimeUntilEnd(timeToEnd);
    return {
      status: 'active',
      timeInfo,
      badgeText: timeInfo,
      badgeColor: 'green',
      timeToEnd,
      lectureStartTime,
      lectureEndTime
    };
  } else {
    // Past lecture - "Prošlo"
    const timeInfo = formatTimeSinceEnd(Math.abs(timeToEnd));
    return {
      status: 'past',
      timeInfo,
      badgeText: timeInfo,
      badgeColor: 'red',
      timeSinceEnd: Math.abs(timeToEnd),
      lectureStartTime,
      lectureEndTime
    };
  }
};

/**
 * Formats time until lecture starts
 * @param {number} milliseconds - Time in milliseconds until start
 * @returns {string} - Formatted time string
 */
const formatTimeUntilStart = (milliseconds) => {
  const now = new Date();
  const lectureTime = new Date(now.getTime() + milliseconds);
  
  // Reset hours to compare just dates
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const lectureDay = new Date(lectureTime);
  lectureDay.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((lectureDay - todayStart) / (1000 * 60 * 60 * 24));
  
  const totalHours = milliseconds / (1000 * 60 * 60);
  const hours = Math.ceil(totalHours); // Round up hours
  
  // If lecture is today
  if (daysDiff === 0) {
    if (totalHours >= 1) {
      return `za ${hours}h`;
    } else {
      return 'počinje sada';
    }
  }
  // If lecture is tomorrow
  else if (daysDiff === 1) {
    return 'Sutra';
  }
  // If lecture is 2+ days away
  else {
    return `za ${daysDiff} dana`;
  }
};

/**
 * Formats time until lecture ends (for active lectures)
 * @param {number} milliseconds - Time in milliseconds until end
 * @returns {string} - Formatted time string
 */
const formatTimeUntilEnd = (milliseconds) => {
  const totalHours = milliseconds / (1000 * 60 * 60);
  const hours = Math.ceil(totalHours); // Round up hours
  
  if (totalHours >= 1) {
    return `Završava za ${hours}h`;
  } else {
    return 'Završava sada';
  }
};

/**
 * Formats time since lecture ended
 * @param {number} milliseconds - Time in milliseconds since end
 * @returns {string} - Formatted time string
 */
const formatTimeSinceEnd = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const totalHours = milliseconds / (1000 * 60 * 60);
  const hours = Math.floor(totalHours); // Round down for past time
  
  if (days > 0) {
    if (days === 1) {
      return 'prije 1 dan';
    } else if (days < 7) {
      return `prije ${days} dana`;
    } else {
      const weeks = Math.floor(days / 7);
      return `prije ${weeks} sedmica`;
    }
  } else if (totalHours >= 1) {
    return `prije ${hours}h`;
  } else {
    return 'upravo završeno';
  }
};

/**
 * Batch calculates status for multiple lectures with performance optimization
 * @param {Array} lectures - Array of lecture objects
 * @returns {Array} - Array of lectures with calculated status
 */
const calculateLecturesStatus = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  return lectures.map(lecture => ({
    ...lecture,
    statusInfo: calculateLectureStatus(lecture)
  }));
};

module.exports = {
  calculateLectureStatus,
  formatTimeUntilStart,
  formatTimeUntilEnd,
  formatTimeSinceEnd,
  calculateLecturesStatus
};