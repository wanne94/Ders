interface ApiResponse {
  data?: any;
  message?: string;
  error?: string;
}

/**
 * Normalizes API response data to ensure it's always an array
 * @param {ApiResponse} response - The API response object
 * @param {string} field - The field to extract from the response (optional)
 * @returns {Array} - Normalized array of data
 */
export const normalizeToArray = (response: ApiResponse | null, field?: string): any[] => {
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
 * @param {any} fallbackValue - The fallback value to return on error (default: [])
 * @param {string} field - Optional field to extract from response
 * @returns {Promise<any>} - Promise that resolves to normalized data
 */
export const safeApiCall = async (
  apiCall: () => Promise<ApiResponse>, 
  fallbackValue: any = [], 
  field: string | null = null
): Promise<any> => {
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
      return normalizeToArray(response, field || undefined);
    } else {
      return response?.data || fallbackValue;
    }
  } catch (error: any) {
    console.error('❌ API call failed:', error);
    console.error('❌ Error details:', error.response?.data);
    return fallbackValue;
  }
};

/** 
 * Counts the number of lectures for a given daija
 * @param {string} daijaId - The daija ID
 * @param {Array} lectures - Array of all lectures
 * @returns {number} - The number of lectures
 */
export const countDaijaLectures = (daijaId: string, lectures: any[]): number => {
  if (!daijaId || !Array.isArray(lectures)) return 0;
  return lectures.filter(lecture => 
    lecture.daija === daijaId || lecture.daijaId === daijaId
  ).length;
}; 