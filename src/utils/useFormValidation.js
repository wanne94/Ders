import { useState, useRef } from 'react';
import { Keyboard } from 'react-native';

export const useFormValidation = (validationRules = {}) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const scrollViewRef = useRef(null);
  const fieldRefs = useRef({});

  // Register field reference for auto scroll
  const registerField = (fieldName, ref) => {
    fieldRefs.current[fieldName] = ref;
  };

  // Validate single field
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  // Validate all fields
  const validateForm = (formData) => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);

    // Auto scroll to first error
    if (hasErrors) {
      scrollToFirstError(newErrors);
    }

    return !hasErrors;
  };

  // Scroll to first error field
  const scrollToFirstError = (errorObj = errors) => {
    const firstErrorField = Object.keys(errorObj)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      // Dismiss keyboard first
      Keyboard.dismiss();
      
      // Small delay to ensure keyboard is dismissed
      setTimeout(() => {
        const fieldRef = fieldRefs.current[firstErrorField];
        
        // If field has measureLayout method (for measuring position)
        if (fieldRef && fieldRef.measureLayout && scrollViewRef.current) {
          fieldRef.measureLayout(
            scrollViewRef.current,
            (x, y, width, height) => {
              scrollViewRef.current.scrollTo({
                y: Math.max(0, y - 100), // Scroll with some offset
                animated: true,
              });
            },
            () => {
              // Fallback: just focus the field
              if (fieldRef.focus) {
                fieldRef.focus();
              }
            }
          );
        } else if (fieldRef && fieldRef.focus) {
          // Fallback: just focus the field
          fieldRef.focus();
        }
      }, 300);
    }
  };

  // Clear specific field error
  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors({});
    setIsValid(true);
  };

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearFieldError,
    clearErrors,
    registerField,
    scrollViewRef,
    scrollToFirstError,
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'Ovo polje je obavezno') => (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (message = 'Unesite validnu email adresu') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Minimalno ${min} karaktera`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Maksimalno ${max} karaktera`;
    }
    return null;
  },

  phone: (message = 'Unesite valjan broj telefona') => (value) => {
    if (value && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(value)) {
      return message;
    }
    return null;
  },

  url: (message = 'Unesite validnu URL adresu') => (value) => {
    if (value && !/^https?:\/\/.+\..+/.test(value)) {
      return message;
    }
    return null;
  },

  date: (message = 'Unesite valjan datum') => (value) => {
    if (value && isNaN(Date.parse(value))) {
      return message;
    }
    return null;
  },

  time: (message = 'Unesite validno vrijeme (HH:MM)') => (value) => {
    if (value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      return message;
    }
    return null;
  },
}; 