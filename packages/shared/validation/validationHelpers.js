/**
 * Shared validation helper functions for web and mobile applications
 * Provides common validation utilities used across different validators
 */

/**
 * Check if a value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Check if phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone);
};

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @param {boolean} requireProtocol - Whether protocol is required
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url, requireProtocol = false) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // If protocol is required, check if it exists
    if (requireProtocol && !url.match(/^https?:\/\//i)) {
      return false;
    }
    
    // Add protocol if missing for URL validation
    const urlToValidate = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    const urlObject = new URL(urlToValidate);
    
    // Basic validation passed
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a string contains only alphanumeric characters and specified allowed characters
 * @param {string} value - Value to check
 * @param {string} allowedChars - Additional allowed characters (e.g., '-_')
 * @returns {boolean} True if valid
 */
export const isAlphanumeric = (value, allowedChars = '') => {
  if (!value || typeof value !== 'string') return false;
  const escapedChars = allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^[a-zA-Z0-9${escapedChars}]+$`);
  return regex.test(value);
};

/**
 * Check if a string is within length limits
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if within limits
 */
export const isLengthValid = (value, min = 0, max = Infinity) => {
  if (!value || typeof value !== 'string') return min === 0;
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * Sanitize input by removing dangerous characters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Convert field name to user-friendly label
 * @param {string} fieldName - Field name (e.g., 'firstName')
 * @returns {string} User-friendly label (e.g., 'Ime')
 */
export const fieldNameToLabel = (fieldName) => {
  const labels = {
    username: 'Korisničko ime',
    email: 'Email',
    password: 'Šifra',
    firstName: 'Ime',
    lastName: 'Prezime',
    phone: 'Telefon',
    role: 'Uloga',
    name: 'Naziv',
    description: 'Opis',
    city: 'Grad',
    address: 'Adresa',
    website: 'Web stranica',
    facebook: 'Facebook',
    instagram: 'Instagram',
    telegram: 'Telegram',
    viber: 'Viber',
    title: 'Naslov',
    content: 'Sadržaj',
    date: 'Datum',
    time: 'Vrijeme',
    location: 'Lokacija',
    status: 'Status'
  };
  
  return labels[fieldName] || fieldName;
};

/**
 * Create a validation error object
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @returns {Object} Error object
 */
export const createError = (field, message) => ({
  field,
  message,
  timestamp: new Date().toISOString()
});

/**
 * Merge multiple error objects
 * @param {...Object} errorObjects - Error objects to merge
 * @returns {Object} Merged error object
 */
export const mergeErrors = (...errorObjects) => {
  const merged = {};
  
  errorObjects.forEach(errors => {
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        if (errors[field]) {
          merged[field] = errors[field];
        }
      });
    }
  });
  
  return merged;
};

/**
 * Check if form has errors
 * @param {Object} errors - Error object
 * @returns {boolean} True if there are errors
 */
export const hasErrors = (errors) => {
  return errors && typeof errors === 'object' && Object.keys(errors).length > 0;
};

/**
 * Get first error message from errors object
 * @param {Object} errors - Error object
 * @returns {string|null} First error message or null
 */
export const getFirstError = (errors) => {
  if (!hasErrors(errors)) return null;
  
  const firstField = Object.keys(errors)[0];
  return errors[firstField] || null;
};

/**
 * Format validation errors for display
 * @param {Object} errors - Error object
 * @returns {string[]} Array of formatted error messages
 */
export const formatErrors = (errors) => {
  if (!hasErrors(errors)) return [];
  
  return Object.entries(errors).map(([field, message]) => {
    const label = fieldNameToLabel(field);
    return `${label}: ${message}`;
  });
};

// Export all functions as default
export default {
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isAlphanumeric,
  isLengthValid,
  sanitizeInput,
  fieldNameToLabel,
  createError,
  mergeErrors,
  hasErrors,
  getFirstError,
  formatErrors
};