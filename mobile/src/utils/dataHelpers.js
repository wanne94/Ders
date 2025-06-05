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
 * Generates a slug for a daija object
 * @param {Object} daija - The daija object
 * @returns {string} - The generated slug
 */
export const generateDaijaSlug = (daija) => {
  if (!daija) return '';
  
  const name = daija.name || '';
  const id = daija._id || daija.id || '';
  
  const nameSlug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  
  return `${nameSlug}-${id}`;
};

/**
 * Finds a daija by slug
 * @param {string} slug - The slug to search for
 * @param {Array} daije - Array of daija objects
 * @returns {Object|null} - Found daija or null
 */
export const findDaijaBySlug = (slug, daije) => {
  if (!slug || !Array.isArray(daije)) return null;
  
  return daije.find(daija => generateDaijaSlug(daija) === slug) || null;
};

/**
 * Safely gets a value from an object
 * @param {Object} item - The object to get value from
 * @param {string} key - The key to get
 * @returns {any} - The value or empty string
 */
export const getValue = (item, key) => {
  return item && item[key] ? item[key] : '';
};

/**
 * Generates a safe key for React components
 * @param {string} prefix - The prefix for the key
 * @param {number} index - The index
 * @returns {string} - Safe key
 */
export const getSafeKey = (prefix, index) => {
  return `${prefix}-${index}`;
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