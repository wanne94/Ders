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
      badgeText: `Uskoro • ${timeInfo}`,
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
      badgeText: `U toku • ${timeInfo}`,
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
      badgeText: 'Prošlo',
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
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    if (days === 1) {
      return hours > 0 ? `1 dan ${hours}h` : '1 dan';
    }
    return hours > 0 ? `${days} dana ${hours}h` : `${days} dana`;
  } else if (hours > 0) {
    if (hours === 1) {
      return minutes > 0 ? `1h ${minutes}min` : '1h';
    }
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}min`;
  } else {
    return 'uskoro';
  }
};

/**
 * Formats time until lecture ends (for active lectures)
 * @param {number} milliseconds - Time in milliseconds until end
 * @returns {string} - Formatted time string
 */
const formatTimeUntilEnd = (milliseconds) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return minutes > 0 ? `završava za ${hours}h ${minutes}min` : `završava za ${hours}h`;
  } else if (minutes > 0) {
    return `završava za ${minutes}min`;
  } else {
    return 'završava uskoro';
  }
};

/**
 * Formats time since lecture ended
 * @param {number} milliseconds - Time in milliseconds since end
 * @returns {string} - Formatted time string
 */
const formatTimeSinceEnd = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    if (days === 1) {
      return 'završeno jučer';
    } else if (days < 7) {
      return `završeno prije ${days} dana`;
    } else {
      return 'završeno';
    }
  } else if (hours > 0) {
    if (hours === 1) {
      return 'završeno prije 1h';
    }
    return `završeno prije ${hours}h`;
  } else {
    return 'završeno';
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