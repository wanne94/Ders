/**
 * Mobile utility functions for lecture status calculation
 * Mirrors the web version but optimized for React Native
 */

/**
 * Calculates the precise status of a lecture based on current time
 * @param {Object} lecture - Lecture object with date, time, and optional duration
 * @returns {Object} - Object with status, timeInfo, and additional metadata
 */
export const calculateLectureStatus = (lecture) => {
  if (!lecture || !lecture.date) {
    return {
      status: 'unknown',
      timeInfo: '',
      badgeText: 'N/A',
      badgeColor: 'gray'
    };
  }

  // Check if lecture is cancelled first
  if (lecture.cancelled || lecture.status === 'cancelled') {
    return {
      status: 'cancelled',
      timeInfo: '',
      badgeText: 'Otkazano',
      badgeColor: 'red',
      isActive: false,
      isPast: false,
      isFuture: false
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
      badgeColor: 'green',
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
      badgeText: `Prošlo • ${timeInfo}`,
      badgeColor: 'gray',
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
export const formatTimeUntilStart = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    if (days === 1) {
      return '1 dan';
    }
    return `${days} dana`;
  } else if (hours > 0) {
    if (hours === 1) {
      return '1h';
    }
    return `${hours}h`;
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
export const formatTimeUntilEnd = (milliseconds) => {
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
export const formatTimeSinceEnd = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    if (days === 1) {
      return 'prije 1 dan';
    }
    return `prije ${days} dana`;
  } else if (hours > 0) {
    if (hours === 1) {
      return 'prije 1h';
    }
    return `prije ${hours}h`;
  } else {
    return 'završeno';
  }
};

/**
 * Get status badge colors for React Native
 * @param {string} badgeColor - Badge color name
 * @returns {Object} - Color configuration for React Native
 */
export const getStatusBadgeColors = (badgeColor) => {
  switch (badgeColor) {
    case 'green':
      return {
        backgroundColor: '#e8f5e8',
        textColor: '#2e7d32'
      };
    case 'yellow':
      return {
        backgroundColor: '#fff8e1',
        textColor: '#f57f17'
      };
    case 'red':
      return {
        backgroundColor: '#ffebee',
        textColor: '#c62828'
      };
    case 'gray':
      return {
        backgroundColor: '#f5f5f5',
        textColor: '#666666'
      };
    default:
      return {
        backgroundColor: '#f5f5f5',
        textColor: '#666666'
      };
  }
};