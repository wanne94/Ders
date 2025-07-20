/**
 * Test utilities and edge case scenarios for lecture status system
 */

import { calculateLectureStatus, formatTimeUntilStart, formatTimeUntilEnd, formatTimeSinceEnd } from './dataHelpers';

/**
 * Generate test lecture data for various scenarios
 */
export const generateTestLectures = () => {
  const now = new Date();
  
  return {
    // Edge Case 1: Lecture starting in 5 minutes
    upcomingIn5Minutes: {
      _id: 'test-1',
      title: 'Test Lecture - Starting Soon',
      date: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
      time: '14:30',
      duration: 60
    },
    
    // Edge Case 2: Lecture that started 10 minutes ago
    activeFor10Minutes: {
      _id: 'test-2',
      title: 'Test Lecture - Currently Active',
      date: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      time: '14:00',
      duration: 60
    },
    
    // Edge Case 3: Lecture that ended 2 hours ago
    endedTwoHoursAgo: {
      _id: 'test-3',
      title: 'Test Lecture - Recently Ended',
      date: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      time: '11:00',
      duration: 60
    },
    
    // Edge Case 4: Midnight crossover - lecture at 23:30 for 2 hours
    midnightCrossover: {
      _id: 'test-4',
      title: 'Test Lecture - Midnight Crossover',
      date: new Date(now.getTime()).toISOString(),
      time: '23:30',
      duration: 120
    },
    
    // Edge Case 5: Very long lecture (4 hours)
    longLecture: {
      _id: 'test-5',
      title: 'Test Lecture - Long Duration',
      date: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      time: '09:00',
      duration: 240
    },
    
    // Edge Case 6: Lecture with no time specified
    noTimeSpecified: {
      _id: 'test-6',
      title: 'Test Lecture - No Time',
      date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      time: null,
      duration: 60
    },
    
    // Edge Case 7: Lecture with invalid time format
    invalidTime: {
      _id: 'test-7',
      title: 'Test Lecture - Invalid Time',
      date: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      time: 'invalid:time',
      duration: 60
    },
    
    // Edge Case 8: Lecture far in the future (1 month)
    farFuture: {
      _id: 'test-8',
      title: 'Test Lecture - Far Future',
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      time: '15:00',
      duration: 60
    },
    
    // Edge Case 9: Lecture with no duration (should default to 60)
    noDuration: {
      _id: 'test-9',
      title: 'Test Lecture - No Duration',
      date: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      time: '16:00',
      duration: undefined
    },
    
    // Edge Case 10: Lecture with zero duration
    zeroDuration: {
      _id: 'test-10',
      title: 'Test Lecture - Zero Duration',
      date: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      time: '17:00',
      duration: 0
    }
  };
};

/**
 * Test all edge cases and return results
 */
export const runEdgeCaseTests = () => {
  const testLectures = generateTestLectures();
  const results = {};
  
  console.log('🧪 Running Lecture Status Edge Case Tests...');
  console.log('📅 Current time:', new Date().toISOString());
  
  Object.entries(testLectures).forEach(([key, lecture]) => {
    try {
      const statusInfo = calculateLectureStatus(lecture);
      results[key] = {
        success: true,
        lecture,
        statusInfo,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ ${key}:`, {
        status: statusInfo.status,
        badgeText: statusInfo.badgeText,
        timeInfo: statusInfo.timeInfo
      });
    } catch (error) {
      results[key] = {
        success: false,
        lecture,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error(`❌ ${key}:`, error.message);
    }
  });
  
  return results;
};

/**
 * Test timezone edge cases
 */
export const testTimezoneEdgeCases = () => {
  console.log('🌍 Testing Timezone Edge Cases...');
  
  const timezones = [
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
  
  const results = {};
  
  timezones.forEach(timezone => {
    try {
      // Create a date in different timezone
      const now = new Date();
      const lectureTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      
      const testLecture = {
        _id: `tz-test-${timezone}`,
        title: `Timezone Test - ${timezone}`,
        date: lectureTime.toISOString(),
        time: '14:00',
        duration: 60
      };
      
      const statusInfo = calculateLectureStatus(testLecture);
      
      results[timezone] = {
        success: true,
        statusInfo,
        localTime: lectureTime.toLocaleString(),
        utcTime: lectureTime.toISOString()
      };
      
      console.log(`✅ ${timezone}:`, statusInfo.badgeText);
    } catch (error) {
      results[timezone] = {
        success: false,
        error: error.message
      };
      
      console.error(`❌ ${timezone}:`, error.message);
    }
  });
  
  return results;
};

/**
 * Test performance with large datasets
 */
export const testPerformance = (numberOfLectures = 1000) => {
  console.log(`⚡ Testing Performance with ${numberOfLectures} lectures...`);
  
  const startTime = performance.now();
  
  // Generate large dataset
  const lectures = Array.from({ length: numberOfLectures }, (_, index) => {
    const randomOffset = (Math.random() - 0.5) * 7 * 24 * 60 * 60 * 1000; // ±3.5 days
    const date = new Date(Date.now() + randomOffset);
    
    return {
      _id: `perf-test-${index}`,
      title: `Performance Test Lecture ${index}`,
      date: date.toISOString(),
      time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      duration: 60 + Math.floor(Math.random() * 120) // 60-180 minutes
    };
  });
  
  const setupTime = performance.now();
  
  // Calculate status for all lectures
  const statusResults = lectures.map(lecture => calculateLectureStatus(lecture));
  
  const calculationTime = performance.now();
  
  // Group by status
  const statusGroups = statusResults.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});
  
  const groupingTime = performance.now();
  
  const results = {
    totalLectures: numberOfLectures,
    timings: {
      setup: setupTime - startTime,
      calculation: calculationTime - setupTime,
      grouping: groupingTime - calculationTime,
      total: groupingTime - startTime
    },
    averagePerLecture: (calculationTime - setupTime) / numberOfLectures,
    statusDistribution: statusGroups,
    performance: {
      rating: (calculationTime - setupTime) < 100 ? 'Excellent' :
               (calculationTime - setupTime) < 500 ? 'Good' :
               (calculationTime - setupTime) < 1000 ? 'Fair' : 'Poor',
      msPerLecture: ((calculationTime - setupTime) / numberOfLectures).toFixed(3)
    }
  };
  
  console.log('📊 Performance Results:', results);
  
  return results;
};

/**
 * Test memory usage patterns
 */
export const testMemoryUsage = () => {
  console.log('💾 Testing Memory Usage...');
  
  if (!performance.memory) {
    console.warn('⚠️ Performance memory API not available in this browser');
    return { available: false };
  }
  
  const initialMemory = {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit
  };
  
  // Create and process many lectures
  const heavyLoad = Array.from({ length: 10000 }, (_, index) => {
    const lecture = {
      _id: `memory-test-${index}`,
      title: `Memory Test Lecture ${index}`,
      date: new Date().toISOString(),
      time: '14:00',
      duration: 60
    };
    
    return calculateLectureStatus(lecture);
  });
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
  
  const finalMemory = {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit
  };
  
  const results = {
    available: true,
    initialMemory,
    finalMemory,
    memoryIncrease: finalMemory.used - initialMemory.used,
    dataProcessed: heavyLoad.length,
    memoryPerItem: (finalMemory.used - initialMemory.used) / heavyLoad.length
  };
  
  console.log('💾 Memory Usage Results:', results);
  
  return results;
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log('🚀 Running Complete Lecture Status Test Suite...');
  
  const results = {
    timestamp: new Date().toISOString(),
    edgeCases: runEdgeCaseTests(),
    timezones: testTimezoneEdgeCases(),
    performance: testPerformance(1000),
    memory: testMemoryUsage()
  };
  
  console.log('✅ All tests completed!');
  
  return results;
};