import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateLectureStatus } from '../utils/dataHelpers';

/**
 * Debounce utility function
 */
const useDebounce = (callback, delay) => {
  const debounceTimer = useRef();
  
  return useCallback((...args) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

/**
 * Optimized hook for lecture status with performance enhancements
 */
export const useOptimizedLectureStatus = (lecture, options = {}) => {
  const {
    updateInterval = 60000, // 1 minute default
    enableRealTime = true,
    debounceDelay = 100
  } = options;

  // Memoize initial status calculation
  const initialStatus = useMemo(() => {
    if (!lecture) return null;
    return calculateLectureStatus(lecture);
  }, [lecture]);

  const [statusInfo, setStatusInfo] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef();
  const lastUpdateRef = useRef(Date.now());

  // Debounced status update function
  const debouncedUpdate = useDebounce(useCallback(() => {
    if (!lecture) return;
    
    setIsUpdating(true);
    const newStatus = calculateLectureStatus(lecture);
    setStatusInfo(newStatus);
    setIsUpdating(false);
    lastUpdateRef.current = Date.now();
  }, [lecture]), debounceDelay);

  // Check if status needs updating based on lecture timing
  const shouldUpdate = useCallback(() => {
    if (!statusInfo) return true;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Force update if it's been too long
    if (timeSinceLastUpdate > updateInterval) return true;
    
    // More frequent updates for active or upcoming lectures
    if (statusInfo.status === 'active') {
      return timeSinceLastUpdate > 5000; // 5 seconds for active
    }
    
    if (statusInfo.status === 'upcoming' && statusInfo.timeToStart < 3600000) {
      return timeSinceLastUpdate > 30000; // 30 seconds if starting within 1 hour
    }
    
    return false;
  }, [statusInfo, updateInterval]);

  // Optimized update function
  const updateStatus = useCallback(() => {
    if (!enableRealTime || !shouldUpdate()) return;
    debouncedUpdate();
  }, [enableRealTime, shouldUpdate, debouncedUpdate]);

  // Effect for regular updates
  useEffect(() => {
    if (!lecture || !enableRealTime) return;

    // Initial update
    updateStatus();

    // Dynamic interval based on lecture status
    const getUpdateInterval = () => {
      if (!statusInfo) return updateInterval;
      
      switch (statusInfo.status) {
        case 'active':
          return 5000; // 5 seconds for active lectures
        case 'upcoming':
          if (statusInfo.timeToStart < 3600000) return 30000; // 30 seconds if starting within 1 hour
          if (statusInfo.timeToStart < 86400000) return 300000; // 5 minutes if starting within 24 hours
          return updateInterval;
        default:
          return updateInterval;
      }
    };

    const interval = setInterval(updateStatus, getUpdateInterval());
    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lecture, enableRealTime, statusInfo, updateInterval, updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    statusInfo,
    isUpdating,
    lastUpdate: lastUpdateRef.current,
    updateStatus: debouncedUpdate,
    isLive: statusInfo?.status === 'active',
    isUpcoming: statusInfo?.status === 'upcoming',
    isPast: statusInfo?.status === 'past'
  };
};

/**
 * Optimized countdown hook with frame-rate optimization
 */
export const useOptimizedCountdown = (statusInfo, options = {}) => {
  const {
    updateInterval = 1000,
    enableAnimation = true
  } = options;

  const [countdown, setCountdown] = useState(null);
  const animationFrameRef = useRef();
  const lastFrameTimeRef = useRef(0);

  const updateCountdown = useCallback(() => {
    if (!statusInfo) {
      setCountdown(null);
      return;
    }

    const now = Date.now();
    
    // Frame rate limiting for smooth animation
    if (enableAnimation && now - lastFrameTimeRef.current < updateInterval) {
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
      return;
    }
    
    lastFrameTimeRef.current = now;

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
              `${minutes}m ${seconds}s`,
          percentage: Math.max(0, Math.min(100, 100 - (timeToStart / (7 * 24 * 60 * 60 * 1000)) * 100))
        });
      } else {
        setCountdown(null);
      }
    } else if (statusInfo.status === 'active' && statusInfo.lectureEndTime) {
      const timeToEnd = statusInfo.lectureEndTime.getTime() - now;
      
      if (timeToEnd > 0) {
        const hours = Math.floor(timeToEnd / (1000 * 60 * 60));
        const minutes = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeToEnd % (1000 * 60)) / 1000);
        
        const totalDuration = statusInfo.lectureEndTime.getTime() - statusInfo.lectureStartTime.getTime();
        const elapsed = totalDuration - timeToEnd;
        const percentage = Math.min(100, (elapsed / totalDuration) * 100);
        
        setCountdown({
          type: 'active',
          timeToEnd,
          hours,
          minutes,
          seconds,
          formatted: hours > 0 ? 
            `završava za ${hours}h ${minutes}m` :
            `završava za ${minutes}m ${seconds}s`,
          percentage
        });
      } else {
        setCountdown(null);
      }
    } else {
      setCountdown(null);
    }

    if (enableAnimation) {
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    }
  }, [statusInfo, updateInterval, enableAnimation]);

  useEffect(() => {
    if (!statusInfo) return;

    if (statusInfo.status === 'upcoming' || statusInfo.status === 'active') {
      if (enableAnimation) {
        animationFrameRef.current = requestAnimationFrame(updateCountdown);
      } else {
        const interval = setInterval(updateCountdown, updateInterval);
        return () => clearInterval(interval);
      }
    } else {
      setCountdown(null);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [statusInfo, updateInterval, enableAnimation, updateCountdown]);

  return countdown;
};

/**
 * Combined optimized hook
 */
export const useOptimizedLectureStatusWithCountdown = (lecture, options = {}) => {
  const statusResult = useOptimizedLectureStatus(lecture, options);
  const countdown = useOptimizedCountdown(statusResult.statusInfo, options);

  return {
    ...statusResult,
    countdown
  };
};