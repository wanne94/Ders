/**
 * Shared user validation for web and mobile applications
 * Provides consistent user data validation across all platforms
 */

import { USER_ROLES } from '../constants/roles.js';

// Validation rules configuration
export const USER_VALIDATION_RULES = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    messages: {
      required: 'Korisničko ime je obavezno',
      minLength: 'Korisničko ime mora imati najmanje 3 karaktera',
      maxLength: 'Korisničko ime ne može imati više od 50 karaktera',
      pattern: 'Korisničko ime može sadržavati samo slova, brojeve, _ i -'
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: 'Email je obavezan',
      pattern: 'Email nije valjan'
    }
  },
  password: {
    requiredForNew: true,
    minLength: 6,
    maxLength: 100,
    messages: {
      required: 'Šifra je obavezna',
      minLength: 'Šifra mora imati najmanje 6 karaktera',
      maxLength: 'Šifra ne može imati više od 100 karaktera'
    }
  },
  firstName: {
    required: false,
    maxLength: 50,
    messages: {
      maxLength: 'Ime ne može imati više od 50 karaktera'
    }
  },
  phone: {
    required: false,
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    messages: {
      pattern: 'Broj telefona nije valjan'
    }
  },
  role: {
    required: true,
    validValues: Object.values(USER_ROLES),
    messages: {
      required: 'Uloga je obavezna',
      invalid: 'Nevažeća uloga korisnika'
    }
  }
};

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {Object} options - Additional options (e.g., { isNewUser: true })
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value, options = {}) => {
  const rules = USER_VALIDATION_RULES[fieldName];
  if (!rules) return null;

  // Check required
  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.messages.required;
  }

  // Check required for new (password specific)
  if (fieldName === 'password' && options.isNewUser && rules.requiredForNew && !value) {
    return rules.messages.required;
  }

  // If field is empty and not required, skip other validations
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const trimmedValue = value.toString().trim();

  // Check min length
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.messages.minLength;
  }

  // Check max length
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.messages.maxLength;
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.messages.pattern;
  }

  // Check valid values (for role)
  if (rules.validValues && !rules.validValues.includes(value)) {
    return rules.messages.invalid;
  }

  return null;
};

/**
 * Validate all user form fields
 * @param {Object} formData - Form data to validate
 * @param {Object} options - Additional options (e.g., { isNewUser: true })
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateUserForm = (formData, options = {}) => {
  const errors = {};

  // Validate each field
  Object.keys(USER_VALIDATION_RULES).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], options);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if user form is valid
 * @param {Object} formData - Form data to validate
 * @param {Object} options - Additional options
 * @returns {boolean} True if form is valid
 */
export const isUserFormValid = (formData, options = {}) => {
  const errors = validateUserForm(formData, options);
  return Object.keys(errors).length === 0;
};

/**
 * Sanitize user input
 * @param {Object} formData - Raw form data
 * @returns {Object} Sanitized form data
 */
export const sanitizeUserData = (formData) => {
  const sanitized = {};

  // Trim all string fields
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  });

  // Remove password if empty (for updates)
  if (sanitized.password === '') {
    delete sanitized.password;
  }

  // Ensure email is lowercase
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();
  }

  return sanitized;
};

/**
 * Get password strength
 * @param {string} password - Password to check
 * @returns {Object} Strength level and message
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { level: 'none', message: '' };
  }

  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  if (length >= 8) strength++;
  if (length >= 12) strength++;
  if (hasUpperCase && hasLowerCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecial) strength++;

  if (strength <= 1) {
    return { level: 'weak', message: 'Slaba šifra', color: '#f44336' };
  } else if (strength <= 3) {
    return { level: 'medium', message: 'Srednja šifra', color: '#ff9800' };
  } else {
    return { level: 'strong', message: 'Jaka šifra', color: '#4caf50' };
  }
};

// Export all functions as default
export default {
  USER_VALIDATION_RULES,
  validateField,
  validateUserForm,
  isUserFormValid,
  sanitizeUserData,
  getPasswordStrength
};