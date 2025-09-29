/**
 * Normalizes API response data to ensure it's always an array
 * @param {Array|Object} data - The direct data from API (already parsed JSON)
 * @param {string} field - The field to extract from the data (optional)
 * @returns {Array} - Normalized array of data
 */
export const normalizeToArray = (data, field) => {
  console.log('🔧 normalizeToArray called with:', { data: data, field });
  
  // Handle null/undefined data
  if (!data) {
    console.log('🔧 No data provided, returning empty array');
    return [];
  }
  
  // If field is provided, try to extract data using the field
  if (field) {
    const fieldData = data[field];
    console.log(`🔧 Extracting field "${field}":`, fieldData);
    if (Array.isArray(fieldData)) {
      console.log(`✅ Field "${field}" is array with ${fieldData.length} items`);
      return fieldData;
    }
    if (fieldData) {
      console.log(`🔧 Field "${field}" is not array, wrapping in array`);
      return [fieldData];
    }
    console.log(`❌ Field "${field}" not found, returning empty array`);
    return [];
  }
  
  // Handle direct array response
  if (Array.isArray(data)) {
    console.log(`✅ Direct array response with ${data.length} items`);
    return data;
  }
  
  // Check if it's an object with common array field names
  if (data && typeof data === 'object') {
    const commonFields = ['data', 'items', 'results', 'lectures', 'daije', 'organizations', 'users'];
    for (const fieldName of commonFields) {
      if (data[fieldName] && Array.isArray(data[fieldName])) {
        console.log(`🔧 Found array in field "${fieldName}" with ${data[fieldName].length} items`);
        return data[fieldName];
      }
    }
    
    // Check if it's an error response
    if (data.message || data.error) {
      console.error('❌ API returned error response:', data);
      return [];
    }
    
    // If it's a single object, wrap it in array
    console.log('🔧 Single object response, wrapping in array');
    return [data];
  }
  
  // For any other data type, wrap in array
  if (data) {
    console.log('🔧 Non-object data, wrapping in array');
    return [data];
  }
  
  console.log('🔧 No valid data found, returning empty array');
  return [];
};

/**
 * Safe API call wrapper that handles errors and normalizes responses
 * @param {Function} apiCall - The API call function
 * @param {string} fallbackValue - The fallback value to return on error (default: [])
 * @param {string} field - Optional field to extract from response
 * @returns {Promise} - Promise that resolves to normalized data
 */
export const safeApiCall = async (apiCall, fallbackValue = [], field = null) => {
  try {
    console.log('🔄 Making safe API call...');
    const data = await apiCall(); // Already parsed JSON data from fetch API
    console.log('✅ API call successful:', data);
    
    // Check if data looks like an error (direct error response)
    if (data?.message && !Array.isArray(data) && !data.data && !data.items && !data.results) {
      console.error('❌ API returned error message:', data);
      return fallbackValue;
    }
    
    // Normalize the response
    if (Array.isArray(fallbackValue)) {
      return normalizeToArray(data, field);
    } else {
      // For non-array fallback values, return the data directly
      return data || fallbackValue;
    }
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('❌ Error details:', error.response?.data || error.message);
    return fallbackValue;
  }
};

/**
 * Formats a date string to dd.MM.yyyy format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string (dd.MM.yyyy)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Formats a date string to dd.MM.yyyy. (DanUSedmici)
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string (dd.MM.yyyy. (DanUSedmici))
 */
export const formatDateWithDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Dan u sedmici na bosanskom/hrvatskom
  const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  const dayOfWeek = days[date.getDay()];

  return `${day}.${month}.${year} (${dayOfWeek})`;
};

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Generates URL-friendly slug from daija name
 * @param {Object} daija - Daija object with name field
 * @returns {string} - URL-friendly slug
 */
export const generateDaijaSlug = (daija) => {
  if (!daija || !daija.name) return '';
  
  // Use name field
  const fullName = daija.name || '';
  
  // Convert to lowercase and handle special characters
  return fullName
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Parses slug to find matching daija
 * @param {string} slug - URL slug
 * @param {Array} daije - Array of daija objects
 * @returns {Object|null} - Matching daija or null
 */
export const findDaijaBySlug = (slug, daije) => {
  if (!slug || !Array.isArray(daije)) return null;
  
  return daije.find(daija => generateDaijaSlug(daija) === slug) || null;
};

/**
 * Simple helper function to get value from object
 * @param {Object} item - Object to get value from
 * @param {string} key - Key to extract
 * @returns {any} - Value or fallback
 */
export const getValue = (item, key) => {
  if (!item || !key) return 'N/A';
  return item[key] || 'N/A';
};

/**
 * Generates safe key for React components
 * @param {string} prefix - Key prefix
 * @param {number|string} index - Index or identifier
 * @returns {string} - Safe key
 */
export const getSafeKey = (prefix, index) => {
  return `${prefix}-${index || 0}`;
};

/**
 * Sorts lectures by proximity to current time (date + time)
 * @param {Array} lectures - Array of lecture objects
 * @returns {Array} - Sorted array of lectures by time proximity
 */
export const sortLecturesByTimeProximity = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const now = new Date();
  
  return lectures
    .map(lecture => {
      const lectureDateTime = new Date(lecture.date);
      
      // If lecture has time, parse and add it to the date
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // If no time specified, assume it's at noon
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      // Calculate difference in milliseconds (positive for future, negative for past)
      const timeDifference = lectureDateTime - now;
      const absoluteTimeDifference = Math.abs(timeDifference);
      const isFuture = timeDifference > 0;
      
      return {
        ...lecture,
        lectureDateTime,
        timeDifference,
        absoluteTimeDifference,
        isFuture
      };
    })
    .sort((a, b) => {
      // First priority: future lectures come before past lectures
      if (a.isFuture && !b.isFuture) return -1;
      if (!a.isFuture && b.isFuture) return 1;
      
      // Second priority: within same category (future/past), sort by proximity
      return a.absoluteTimeDifference - b.absoluteTimeDifference;
    });
};

/**
 * Sorts lectures by proximity to today's date
 * Today's lectures come first, followed by closest future dates, then past dates
 * @param {Array} lectures - Array of lecture objects
 * @returns {Array} - Sorted array of lectures
 */
export const sortLecturesByDateProximity = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day
  
  return lectures.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);
    
    // Check if dates are today
    const isAToday = dateA.getTime() === today.getTime();
    const isBToday = dateB.getTime() === today.getTime();
    
    // Today's lectures come first
    if (isAToday && !isBToday) return -1;
    if (!isAToday && isBToday) return 1;
    if (isAToday && isBToday) return 0; // Both today, maintain order
    
    // For non-today lectures, calculate proximity to today
    const diffA = Math.abs(dateA.getTime() - today.getTime());
    const diffB = Math.abs(dateB.getTime() - today.getTime());
    
    // If both are future or both are past, sort by proximity
    const isAFuture = dateA > today;
    const isBFuture = dateB > today;
    
    if (isAFuture && isBFuture) {
      // Both future - closest date first
      return dateA - dateB;
    } else if (!isAFuture && !isBFuture) {
      // Both past - most recent first
      return dateB - dateA;
    } else {
      // One future, one past - future comes first
      return isAFuture ? -1 : 1;
    }
  });
};

/**
 * Filters and sorts upcoming lectures (today and future)
 * @param {Array} lectures - Array of lecture objects
 * @returns {Array} - Filtered and sorted array of upcoming lectures
 */
export const getUpcomingLecturesSorted = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingLectures = lectures.filter(lecture => {
    if (!lecture.date) return false;
    
    const lectureDate = new Date(lecture.date);
    lectureDate.setHours(0, 0, 0, 0);
    
    return lectureDate >= today;
  });
  
  return sortLecturesByDateProximity(upcomingLectures);
};

/**
 * Generates URL-friendly slug from organization name
 * @param {Object} organization - Organization object with name
 * @returns {string} - URL-friendly slug
 */
export const generateOrganizationSlug = (organization) => {
  if (!organization || !organization.name) return '';
  
  const name = organization.name || '';
  
  return name
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Parses slug to find matching organization
 * @param {string} slug - URL slug
 * @param {Array} organizations - Array of organization objects
 * @returns {Object|null} - Matching organization or null
 */
export const findOrganizationBySlug = (slug, organizations) => {
  if (!slug || !Array.isArray(organizations)) return null;
  
  return organizations.find(org => generateOrganizationSlug(org) === slug) || null;
};

/**
 * Generates URL-friendly slug from lecture title
 * @param {Object} lecture - Lecture object with title
 * @returns {string} - URL-friendly slug
 */
export const generateLectureSlug = (lecture) => {
  if (!lecture || !lecture.title) return '';
  
  const title = lecture.title || '';
  
  return title
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50); // Limit length for URLs
};

/**
 * Parses slug to find matching lecture
 * @param {string} slug - URL slug
 * @param {Array} lectures - Array of lecture objects
 * @returns {Object|null} - Matching lecture or null
 */
export const findLectureBySlug = (slug, lectures) => {
  if (!slug || !Array.isArray(lectures)) return null;
  
  return lectures.find(lecture => generateLectureSlug(lecture) === slug) || null;
};

/**
 * Sorts organizations by the time proximity of their closest lecture
 * @param {Array} organizations - Array of organization objects
 * @param {Array} lectures - Array of all lectures
 * @returns {Array} - Sorted array of organizations
 */
export const sortOrganizationsByLectureProximity = (organizations, lectures) => {
  if (!Array.isArray(organizations) || !Array.isArray(lectures)) return organizations || [];
  
  console.log('sortOrganizationsByLectureProximity called with:', {
    organizationsCount: organizations.length,
    lecturesCount: lectures.length
  });
  
  const now = new Date();
  
  // Create a lookup map for better performance - O(n) instead of O(n²)
  const orgLecturesMap = new Map();
  
  // Group lectures by organization in a single pass
  lectures.forEach(lecture => {
    const orgKeys = [
      lecture.organizationId,
      lecture.organization,
      typeof lecture.organization === 'object' ? lecture.organization?._id : null
    ].filter(Boolean);
    
    orgKeys.forEach(key => {
      if (!orgLecturesMap.has(key)) {
        orgLecturesMap.set(key, []);
      }
      orgLecturesMap.get(key).push(lecture);
    });
  });
  
  return organizations
    .map(organization => {
      // Get lectures for this organization from the lookup map
      const orgLectures = [
        ...(orgLecturesMap.get(organization._id) || []),
        ...(orgLecturesMap.get(organization.name) || [])
      ];
      
      // Remove duplicates
      const uniqueLectures = orgLectures.filter((lecture, index, arr) => 
        arr.findIndex(l => l._id === lecture._id) === index
      );
      
      console.log(`Organization ${organization.name}: found ${uniqueLectures.length} lectures`);
      
      if (uniqueLectures.length === 0) {
        return {
          ...organization,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      uniqueLectures.forEach(lecture => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime - now;
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures: if we have a future lecture and current closest is past, replace it
        // Or if both are future/past, choose the one with smaller absolute difference
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...organization,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: uniqueLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort((a, b) => {
      // First priority: organizations with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
};

/**
 * Sorts daije by the time proximity of their closest lecture
 * @param {Array} daije - Array of daija objects
 * @param {Array} lectures - Array of all lectures
 * @returns {Array} - Sorted array of daije
 */
export const sortDaijeByLectureProximity = (daije, lectures) => {
  if (!Array.isArray(daije) || !Array.isArray(lectures)) return daije || [];
  
  const now = new Date();
  
  // Create a lookup map for better performance - O(n) instead of O(n²)
  const daijaLecturesMap = new Map();
  
  // Group lectures by daija in a single pass
  lectures.forEach(lecture => {
    const daijaKeys = [
      lecture.daija,
      lecture.daijaId,
      typeof lecture.daija === 'object' ? lecture.daija?._id : null
    ].filter(Boolean);
    
    daijaKeys.forEach(key => {
      if (!daijaLecturesMap.has(key)) {
        daijaLecturesMap.set(key, []);
      }
      daijaLecturesMap.get(key).push(lecture);
    });
    
    // Also check speaker field for name matches (less precise but useful)
    if (lecture.speaker) {
      daije.forEach(daija => {
        if (daija.name && lecture.speaker.includes(daija.name)) {
          if (!daijaLecturesMap.has(daija._id)) {
            daijaLecturesMap.set(daija._id, []);
          }
          daijaLecturesMap.get(daija._id).push(lecture);
        }
      });
    }
  });
  
  return daije
    .map(daija => {
      // Get lectures for this daija from the lookup map
      const daijaLectures = daijaLecturesMap.get(daija._id) || [];
      
      // Remove duplicates
      const uniqueLectures = daijaLectures.filter((lecture, index, arr) => 
        arr.findIndex(l => l._id === lecture._id) === index
      );
      
      if (uniqueLectures.length === 0) {
        return {
          ...daija,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      uniqueLectures.forEach(lecture => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime - now;
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures: if we have a future lecture and current closest is past, replace it
        // Or if both are future/past, choose the one with smaller absolute difference
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...daija,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: uniqueLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort(() => Math.random() - 0.5);
};

/**
 * Sorts all approved daije with random arrangement, prioritizing those with active lectures
 * @param {Array} daije - Array of daija objects
 * @param {Array} lectures - Array of all lectures
 * @returns {Array} - Randomly sorted array of all approved daije with active lecture priority
 */
export const sortAllDaijeWithActivePriority = (daije, lectures) => {
  if (!Array.isArray(daije) || !Array.isArray(lectures)) return daije || [];
  
  // Filter only approved daije
  const approvedDaije = daije.filter(daija => daija.status === 'approved');
  
  const now = new Date();
  
  // Create a lookup map for better performance
  const daijaLecturesMap = new Map();
  
  // Group lectures by daija in a single pass
  lectures.forEach(lecture => {
    // Only consider approved lectures
    if (lecture.status !== 'approved') return;
    
    const daijaKeys = [
      lecture.daija,
      lecture.daijaId,
      typeof lecture.daija === 'object' ? lecture.daija?._id : null
    ].filter(Boolean);
    
    daijaKeys.forEach(key => {
      if (!daijaLecturesMap.has(key)) {
        daijaLecturesMap.set(key, []);
      }
      daijaLecturesMap.get(key).push(lecture);
    });
    
    // Also check speaker field for name matches
    if (lecture.speaker) {
      approvedDaije.forEach(daija => {
        if (daija.name && lecture.speaker.includes(daija.name)) {
          if (!daijaLecturesMap.has(daija._id)) {
            daijaLecturesMap.set(daija._id, []);
          }
          daijaLecturesMap.get(daija._id).push(lecture);
        }
      });
    }
  });
  
  // Categorize daije into those with active lectures and those without
  const daijeWithActiveLectures = [];
  const daijeWithoutActiveLectures = [];
  
  approvedDaije.forEach(daija => {
    const daijaLectures = daijaLecturesMap.get(daija._id) || [];
    
    // Remove duplicates
    const uniqueLectures = daijaLectures.filter((lecture, index, arr) => 
      arr.findIndex(l => l._id === lecture._id) === index
    );
    
    // Check if daija has any active (future) lectures
    const hasActiveLecture = uniqueLectures.some(lecture => {
      const lectureDateTime = new Date(lecture.date);
      
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      return lectureDateTime.getTime() > now.getTime();
    });
    
    const daijaWithMetadata = {
      ...daija,
      lectureCount: uniqueLectures.length,
      hasActiveLecture,
      randomSeed: Math.random() // For random sorting within categories
    };
    
    if (hasActiveLecture) {
      daijeWithActiveLectures.push(daijaWithMetadata);
    } else {
      daijeWithoutActiveLectures.push(daijaWithMetadata);
    }
  });
  
  // Randomly shuffle both categories
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const shuffledWithActive = shuffleArray(daijeWithActiveLectures);
  const shuffledWithoutActive = shuffleArray(daijeWithoutActiveLectures);
  
  // Return daije with active lectures first, then those without
  return [...shuffledWithActive, ...shuffledWithoutActive];
};

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

  // Check if lecture is cancelled
  if (lecture.isCancelled === true || lecture.status === 'cancelled') {
    return {
      status: 'cancelled',
      timeInfo: '',
      badgeText: 'Otkazano',
      badgeColor: 'red'
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
export const formatTimeUntilEnd = (milliseconds) => {
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
export const formatTimeSinceEnd = (milliseconds) => {
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
export const calculateLecturesStatus = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  return lectures.map(lecture => ({
    ...lecture,
    statusInfo: calculateLectureStatus(lecture)
  }));
};

/**
 * Filters lectures by status
 * @param {Array} lectures - Array of lectures with calculated status
 * @param {string} status - Status to filter by ('upcoming', 'active', 'past')
 * @returns {Array} - Filtered lectures
 */
export const filterLecturesByStatus = (lectures, status) => {
  if (!Array.isArray(lectures) || !status) return lectures;
  
  return lectures.filter(lecture => 
    lecture.statusInfo && lecture.statusInfo.status === status
  );
}; 