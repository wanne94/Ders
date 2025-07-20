import { useState, useEffect, useCallback } from 'react';
import { calculateLectureStatus } from '../utils/dataHelpers';

/**
 * Custom hook for real-time lecture status updates
 * @param {Object} lecture - Lecture object
 * @param {number} updateInterval - Update interval in milliseconds (default: 60000 = 1 minute)
 * @returns {Object} - Current status info with real-time updates
 */
export const useLectureStatus = (lecture, updateInterval = 60000) => {
  const [statusInfo, setStatusInfo] = useState(() => {
    if (!lecture) return null;
    return calculateLectureStatus(lecture);
  });
  
  const updateStatus = useCallback(() => {
    if (!lecture) return;
    const newStatusInfo = calculateLectureStatus(lecture);
    setStatusInfo(newStatusInfo);
  }, [lecture]);
  
  useEffect(() => {
    if (!lecture) return;
    
    // Initial calculation
    updateStatus();
    
    // Set up interval for updates
    const interval = setInterval(updateStatus, updateInterval);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [lecture, updateInterval, updateStatus]);
  
  return statusInfo;
};

/**
 * Custom hook for countdown timer functionality
 * @param {Object} statusInfo - Status info from calculateLectureStatus
 * @param {number} updateInterval - Update interval in milliseconds (default: 1000 = 1 second)
 * @returns {Object} - Countdown information with real-time updates
 */
export const useCountdownTimer = (statusInfo, updateInterval = 1000) => {
  const [countdown, setCountdown] = useState(null);
  
  const updateCountdown = useCallback(() => {
    if (!statusInfo) return;
    
    const now = new Date().getTime();
    
    if (statusInfo.status === 'upcoming' && statusInfo.lectureStartTime) {
      const timeToStart = statusInfo.lectureStartTime.getTime() - now;
      
      if (timeToStart > 0) {
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeToStart % (1000 * 60)) / 1000);
        
        setCountdown({
          type: 'upcoming',
          timeToStart,
          days,
          hours,
          minutes,
          seconds,
          formatted: days > 0 ? 
            `${days}d ${hours}h ${minutes}m` :
            hours > 0 ? 
              `${hours}h ${minutes}m ${seconds}s` :
              `${minutes}m ${seconds}s`
        });
      } else {
        // Time has passed, lecture should be active or past
        setCountdown(null);
      }
    } else if (statusInfo.status === 'active' && statusInfo.lectureEndTime) {
      const timeToEnd = statusInfo.lectureEndTime.getTime() - now;
      
      if (timeToEnd > 0) {
        const hours = Math.floor(timeToEnd / (1000 * 60 * 60));
        const minutes = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeToEnd % (1000 * 60)) / 1000);
        
        setCountdown({
          type: 'active',
          timeToEnd,
          hours,
          minutes,
          seconds,
          formatted: hours > 0 ? 
            `završava za ${hours}h ${minutes}m` :
            `završava za ${minutes}m ${seconds}s`
        });
      } else {
        // Lecture has ended
        setCountdown(null);
      }
    } else {
      setCountdown(null);
    }
  }, [statusInfo]);
  
  useEffect(() => {
    if (!statusInfo) return;
    
    // Initial calculation
    updateCountdown();
    
    // Only start interval for upcoming or active lectures
    if (statusInfo.status === 'upcoming' || statusInfo.status === 'active') {
      const interval = setInterval(updateCountdown, updateInterval);
      return () => clearInterval(interval);
    }
  }, [statusInfo, updateInterval, updateCountdown]);
  
  return countdown;
};

/**
 * Combined hook that provides both status and countdown
 * @param {Object} lecture - Lecture object
 * @param {Object} options - Configuration options
 * @returns {Object} - Combined status and countdown information
 */
export const useLectureStatusWithCountdown = (lecture, options = {}) => {
  const {
    statusUpdateInterval = 60000, // 1 minute for status updates
    countdownUpdateInterval = 1000 // 1 second for countdown updates
  } = options;
  
  const statusInfo = useLectureStatus(lecture, statusUpdateInterval);
  const countdown = useCountdownTimer(statusInfo, countdownUpdateInterval);
  
  return {
    statusInfo,
    countdown,
    isLive: statusInfo?.status === 'active',
    isUpcoming: statusInfo?.status === 'upcoming',
    isPast: statusInfo?.status === 'past'
  };
};