/**
 * Service configuration
 * Direct configuration for service layer
 */

// Get API base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api';

// Define API endpoints
const API_ENDPOINTS = {
  // Auth
  AUTH: `${API_BASE_URL}/users/auth`,
  REGISTER: `${API_BASE_URL}/users/register`,

  // Resources
  PREDAVANJA: `${API_BASE_URL}/lectures`,
  USERS: `${API_BASE_URL}/users`,
  DAIJE: `${API_BASE_URL}/daije`,
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
  SUGGESTIONS: `${API_BASE_URL}/suggestions`,
  SETTINGS: `${API_BASE_URL}/settings`,

  // Admin
  ADMIN: {
    PREDAVANJA: `${API_BASE_URL}/admin/lectures`,
    USERS: `${API_BASE_URL}/admin/users`,
    DAIJE: `${API_BASE_URL}/admin/daije`,
    ORGANIZATIONS: `${API_BASE_URL}/admin/organizations`,
  }
};

// Environment configuration
const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: API_BASE_URL,
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5004',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  API_ENDPOINTS,
  // Add other necessary ENV properties as needed
};

export { ENV };
export default ENV;