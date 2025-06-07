// Common helper functions

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Web app style date formatting (dd.MM.yyyy.)
export const formatDateWeb = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}.`;
};

// Date with day of week formatting
export const formatDateWithDay = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Day of week in Bosnian/Croatian
  const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  const dayOfWeek = days[date.getDay()];

  return `${day}.${month}.${year}. (${dayOfWeek})`;
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('sr-RS', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Text utilities
export const truncateText = (text: string, length: number = 100): string => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: any; // Using any instead of NodeJS.Timeout for React Native compatibility
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Simple helper function to get value from object
export const getValue = (item: any, key: string): any => {
  if (!item || !key) return 'N/A';
  return item[key] || 'N/A';
};

// Export card helpers
export * from './cardHelpers';

// Export slug helpers
export * from './slugHelpers';

// Export sorting helpers
export * from './sortingHelpers'; 