/**
 * Shared organization validation for web and mobile applications
 * Provides consistent organization data validation across all platforms
 */

import { CONTENT_STATUS } from '../constants/statuses.js';

// Validation rules configuration
export const ORGANIZATION_VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    messages: {
      required: 'Naziv udruženja je obavezan',
      minLength: 'Naziv mora imati najmanje 3 karaktera',
      maxLength: 'Naziv ne može imati više od 100 karaktera'
    }
  },
  description: {
    required: false,
    minLength: 10,
    maxLength: 2000,
    messages: {
      minLength: 'Opis mora imati najmanje 10 karaktera',
      maxLength: 'Opis ne može imati više od 2000 karaktera'
    }
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
    messages: {
      required: 'Mjesto je obavezno',
      minLength: 'Mjesto mora imati najmanje 2 karaktera',
      maxLength: 'Mjesto ne može imati više od 50 karaktera'
    }
  },
  address: {
    required: false,
    maxLength: 200,
    messages: {
      maxLength: 'Adresa ne može imati više od 200 karaktera'
    }
  },
  phone: {
    required: false,
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    messages: {
      pattern: 'Broj telefona nije valjan'
    }
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      pattern: 'Email nije valjan'
    }
  },
  website: {
    required: false,
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    messages: {
      pattern: 'Web stranica nije validna'
    }
  },
  facebook: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+$/i,
    messages: {
      pattern: 'Facebook link nije valjan'
    }
  },
  instagram: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i,
    messages: {
      pattern: 'Instagram link nije valjan'
    }
  },
  telegram: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/.+$/i,
    messages: {
      pattern: 'Telegram link nije valjan'
    }
  },
  viber: {
    required: false,
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    messages: {
      pattern: 'Viber broj nije valjan'
    }
  },
  status: {
    required: false,
    validValues: Object.values(CONTENT_STATUS),
    default: CONTENT_STATUS.PENDING,
    messages: {
      invalid: 'Nevažeći status'
    }
  }
};

// Image validation rules
export const ORGANIZATION_IMAGE_RULES = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  messages: {
    tooLarge: 'Slika je prevelika. Maksimalna veličina je 5MB.',
    invalidType: 'Nepodržan format slike. Koristite JPG, PNG, GIF ili WebP.'
  }
};

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value) => {
  const rules = ORGANIZATION_VALIDATION_RULES[fieldName];
  if (!rules) return null;

  // Check required
  if (rules.required && (!value || value.toString().trim() === '')) {
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

  // Check valid values
  if (rules.validValues && !rules.validValues.includes(value)) {
    return rules.messages.invalid;
  }

  return null;
};

/**
 * Validate all organization form fields
 * @param {Object} formData - Form data to validate
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateOrganizationForm = (formData) => {
  const errors = {};

  // Validate each field
  Object.keys(ORGANIZATION_VALIDATION_RULES).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if organization form is valid
 * @param {Object} formData - Form data to validate
 * @returns {boolean} True if form is valid
 */
export const isOrganizationFormValid = (formData) => {
  const errors = validateOrganizationForm(formData);
  return Object.keys(errors).length === 0;
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateOrganizationImage = (file) => {
  if (!file) return null;

  // Check file size
  if (file.size > ORGANIZATION_IMAGE_RULES.maxSize) {
    return ORGANIZATION_IMAGE_RULES.messages.tooLarge;
  }

  // Check file type
  const fileType = file.type.toLowerCase();
  if (!ORGANIZATION_IMAGE_RULES.allowedTypes.includes(fileType)) {
    return ORGANIZATION_IMAGE_RULES.messages.invalidType;
  }

  // Check file extension as backup
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ORGANIZATION_IMAGE_RULES.allowedExtensions.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return ORGANIZATION_IMAGE_RULES.messages.invalidType;
  }

  return null;
};

/**
 * Sanitize organization data
 * @param {Object} formData - Raw form data
 * @returns {Object} Sanitized form data
 */
export const sanitizeOrganizationData = (formData) => {
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

  // Set default status if not provided
  if (!sanitized.status) {
    sanitized.status = ORGANIZATION_VALIDATION_RULES.status.default;
  }

  // Clean up social media links (ensure they have protocol)
  ['facebook', 'instagram', 'telegram'].forEach(field => {
    if (sanitized[field] && !sanitized[field].startsWith('http')) {
      if (field === 'telegram') {
        sanitized[field] = `https://t.me/${sanitized[field].replace(/^@/, '')}`;
      } else {
        sanitized[field] = `https://www.${field}.com/${sanitized[field]}`;
      }
    }
  });

  // Clean up website URL
  if (sanitized.website && !sanitized.website.startsWith('http')) {
    sanitized.website = `https://${sanitized.website}`;
  }

  // Remove empty optional fields
  Object.keys(sanitized).forEach(key => {
    if (!ORGANIZATION_VALIDATION_RULES[key]?.required && !sanitized[key]) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

// Export all functions as default
export default {
  ORGANIZATION_VALIDATION_RULES,
  ORGANIZATION_IMAGE_RULES,
  validateField,
  validateOrganizationForm,
  isOrganizationFormValid,
  validateOrganizationImage,
  sanitizeOrganizationData
};