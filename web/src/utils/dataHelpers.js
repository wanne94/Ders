/**
 * Normalizes API response data to ensure it's always an array
 * @param {Object} response - The API response object
 * @param {string} field - The field to extract from the response (optional)
 * @returns {Array} - Normalized array of data
 */
export const normalizeToArray = (response, field) => {
  console.log('🔧 normalizeToArray called with:', { response: response?.data, field });
  
  if (!response?.data) {
    console.log('🔧 No response.data, returning empty array');
    return [];
  }
  
  // If field is provided, try to extract data using the field
  if (field) {
    const data = response.data[field];
    console.log(`🔧 Extracting field "${field}":`, data);
    if (Array.isArray(data)) {
      console.log(`✅ Field "${field}" is array with ${data.length} items`);
      return data;
    }
    if (data) {
      console.log(`🔧 Field "${field}" is not array, wrapping in array`);
      return [data];
    }
    console.log(`❌ Field "${field}" not found, returning empty array`);
    return [];
  }
  
  // If no field is provided, use the data directly
  const data = response.data;
  console.log('🔧 Using response.data directly:', typeof data, Array.isArray(data));
  
  if (Array.isArray(data)) {
    console.log(`✅ Response.data is array with ${data.length} items`);
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
    const response = await apiCall();
    console.log('✅ API call successful:', response?.data);
    
    // Check if response looks like an error
    if (response?.data?.message && !Array.isArray(response.data) && !response.data.data) {
      console.error('❌ API returned error message:', response.data);
      return fallbackValue;
    }
    
    // Normalize the response
    if (Array.isArray(fallbackValue)) {
      return normalizeToArray(response, field);
    } else {
      return response?.data || fallbackValue;
    }
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('❌ Error details:', error.response?.data);
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
  
  return `${day}.${month}.${year}.`;
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

  return `${day}.${month}.${year}. (${dayOfWeek})`;
};

/** 
 * Counts the number of lectures for a given daija
 * @param {string} daijaId - The daija ID
 * @param {Array} lectures - Array of all lectures
 * @returns {number} - The number of lectures
 */
export const countDaijaLectures = (daijaId, lectures) => {
  if (!daijaId || !Array.isArray(lectures)) return 0;
  return lectures.filter(lecture => 
    lecture.daija === daijaId || lecture.daijaId === daijaId
  ).length;
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
 * @param {Object} daija - Daija object with firstName
 * @returns {string} - URL-friendly slug
 */
export const generateDaijaSlug = (daija) => {
  if (!daija || !daija.firstName) return '';
  
  const firstName = daija.firstName || '';
  
  return firstName
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
        if (daija.firstName && lecture.speaker.includes(daija.firstName)) {
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
    .sort((a, b) => {
      // First priority: daije with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
}; 