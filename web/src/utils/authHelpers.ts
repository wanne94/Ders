// Web Auth Helpers for Remember Me functionality

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REMEMBERED_EMAIL: 'rememberedEmail',
  REMEMBERED_PASSWORD: 'rememberedPassword'
} as const;

type StorageKeys = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

interface UserData {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface RememberedCredentials {
  email: string | null;
  password: string | null;
}

// Remember email functionality
export const getRememberedEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  }
  return null;
};

export const setRememberedEmail = (email: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
  }
};

export const removeRememberedEmail = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  }
};

// Remember password functionality
export const getRememberedPassword = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
  return null;
};

export const setRememberedPassword = (password: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
  }
};

export const removeRememberedPassword = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
};

// Clear all remembered credentials
export const clearRememberedCredentials = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
};

// Set remembered credentials
export const setRememberedCredentials = (email: string, password: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
  }
};

// Get remembered credentials
export const getRememberedCredentials = (): RememberedCredentials => {
  if (typeof window !== 'undefined') {
    return {
      email: localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL),
      password: localStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD)
    };
  }
  return { email: null, password: null };
};

// Auth data management
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('❌ Failed to parse userData from localStorage:', e);
        return null;
      }
    }
    return null;
  }
  return null;
};

export const setUserData = (user: UserData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};

export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const clearAllData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
  }
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} je obavezan`;
  }
  return null;
};

export const validateMinLength = (value: string | number, minLength: number, fieldName: string): string | null => {
  if (value && value.toString().trim().length < minLength) {
    return `${fieldName} mora imati najmanje ${minLength} karaktera`;
  }
  return null;
};

export const validateMaxLength = (value: string | number, maxLength: number, fieldName: string): string | null => {
  if (value && value.toString().trim().length > maxLength) {
    return `${fieldName} ne može biti duži od ${maxLength} karaktera`;
  }
  return null;
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  return 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
}; 