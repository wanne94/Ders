/**
 * Shared validation rules for lectures
 */

export const lectureValidationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: {
      required: 'Naslov je obavezan',
      minLength: 'Naslov mora imati najmanje 3 karaktera',
      maxLength: 'Naslov ne smije biti duži od 200 karaktera'
    }
  },

  description: {
    required: false,
    maxLength: 2000,
    message: {
      maxLength: 'Opis ne smije biti duži od 2000 karaktera'
    }
  },

  date: {
    required: true,
    minDate: () => new Date(), // Must be future date
    message: {
      required: 'Datum je obavezan',
      minDate: 'Datum mora biti u budućnosti'
    }
  },

  time: {
    required: true,
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message: {
      required: 'Vrijeme je obavezno',
      pattern: 'Vrijeme mora biti u formatu HH:MM'
    }
  },

  address: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: {
      required: 'Adresa je obavezna',
      minLength: 'Adresa mora imati najmanje 3 karaktera',
      maxLength: 'Adresa ne smije biti duža od 200 karaktera'
    }
  },

  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: {
      required: 'Grad je obavezan',
      minLength: 'Grad mora imati najmanje 2 karaktera',
      maxLength: 'Grad ne smije biti duži od 100 karaktera'
    }
  },

  speaker: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: {
      required: 'Govornik je obavezan',
      minLength: 'Ime govornika mora imati najmanje 3 karaktera',
      maxLength: 'Ime govornika ne smije biti duže od 100 karaktera'
    }
  },

  organization: {
    required: false,
    maxLength: 200,
    message: {
      maxLength: 'Naziv organizacije ne smije biti duži od 200 karaktera'
    }
  },

  image: {
    required: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    message: {
      maxSize: 'Slika ne smije biti veća od 5MB',
      allowedTypes: 'Dozvoljen format: JPG, PNG, WebP'
    }
  }
};

// Validate single field
export const validateLectureField = (field, value) => {
  const rules = lectureValidationRules[field];
  if (!rules) return { valid: true };

  const errors = [];

  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(rules.message.required);
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) return { valid: true };

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(rules.message.minLength);
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(rules.message.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message.pattern);
  }

  // Date validation
  if (rules.minDate && field === 'date') {
    const dateValue = new Date(value);
    const minDate = typeof rules.minDate === 'function' ? rules.minDate() : rules.minDate;
    if (dateValue < minDate) {
      errors.push(rules.message.minDate);
    }
  }

  // File validation
  if (field === 'image' && value) {
    if (value.size && rules.maxSize && value.size > rules.maxSize) {
      errors.push(rules.message.maxSize);
    }
    if (value.type && rules.allowedTypes && !rules.allowedTypes.includes(value.type)) {
      errors.push(rules.message.allowedTypes);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validate entire lecture form
export const validateLectureForm = (formData) => {
  const errors = {};
  let isValid = true;

  Object.keys(lectureValidationRules).forEach(field => {
    const validation = validateLectureField(field, formData[field]);
    if (!validation.valid) {
      errors[field] = validation.errors[0]; // Take first error
      isValid = false;
    }
  });

  return {
    valid: isValid,
    errors
  };
};

// Sanitize lecture data before submission
export const sanitizeLectureData = (data) => {
  const sanitized = {};

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      // Trim string values
      if (typeof data[key] === 'string') {
        sanitized[key] = data[key].trim();
      } else {
        sanitized[key] = data[key];
      }
    }
  });

  return sanitized;
};