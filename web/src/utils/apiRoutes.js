const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  // Auth routes
  LOGIN: `${API_BASE_URL}/users/auth`,
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // User routes
  USERS: `${API_BASE_URL}/users`,
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Lecture routes
  LECTURES: `${API_BASE_URL}/lectures`,
  LECTURE_BY_ID: (id) => `${API_BASE_URL}/lectures/${id}`,
  
  // Daija routes
  DAIJE: `${API_BASE_URL}/daije`,
  DAIJA_BY_ID: (id) => `${API_BASE_URL}/daije/${id}`,
  
  // Organization routes
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
  ORGANIZATION_BY_ID: (id) => `${API_BASE_URL}/organizations/${id}`,
  
  // Upload routes
  UPLOAD_IMAGE: `${API_BASE_URL}/upload-image`,
};

/**
 * Gets the API route for a specific resource
 * @param {string} resource - The resource name (e.g., 'lectures', 'users')
 * @param {string} [id] - Optional resource ID
 * @returns {string} - The complete API route
 */
export const getApiRoute = (resource, id = null) => {
  const baseRoute = API_ROUTES[resource.toUpperCase()];
  if (!baseRoute) {
    throw new Error(`Invalid resource: ${resource}`);
  }
  
  return id ? `${baseRoute}/${id}` : baseRoute;
}; 