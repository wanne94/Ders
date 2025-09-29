/**
 * Error Utility Functions for Mobile App
 * Provides detailed error analysis and user-friendly messages
 */

import { Alert } from 'react-native';

/**
 * Parse API error and return user-friendly message with specific actions
 * @param {Error} error - The error object from API request
 * @param {string} operation - The operation being performed (e.g., 'creating organization')
 * @returns {Object} - Object with title, message, actions, and technical details
 */
export const parseApiError = (error, operation = 'performing operation') => {
  const defaultResponse = {
    title: 'Greška',
    message: 'Došlo je do neočekivane greške. Pokušajte ponovo.',
    actions: ['Pokušajte ponovo za nekoliko minuta', 'Provjerite internetsku konekciju'],
    technicalDetails: error.message || 'Unknown error',
    canRetry: true
  };

  // No error object
  if (!error) {
    return defaultResponse;
  }

  // Network errors (no response from server)
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        title: 'Problem sa mrežom',
        message: 'Ne mogu da se povežem sa serverom. Molim provjerite internetsku konekciju.',
        actions: [
          'Provjerite da li ste povezani na internet',
          'Pokušajte ponovo za nekoliko sekundi',
          'Ako se problem nastavi, kontaktirajte podršku'
        ],
        technicalDetails: 'Network connectivity issue',
        canRetry: true
      };
    }

    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return {
        title: 'Zahtjev je istekao',
        message: 'Server ne odgovara. Možda je preopterećen.',
        actions: [
          'Pokušajte ponovo za nekoliko minuta',
          'Provjerite internetsku konekciju',
          'Ako se problem nastavi, pokušajte kasnije'
        ],
        technicalDetails: 'Request timeout',
        canRetry: true
      };
    }

    return {
      ...defaultResponse,
      title: 'Problem sa konekcijom',
      message: 'Ne mogu da se povežem sa serverom.',
      technicalDetails: error.message || 'Connection failed'
    };
  }

  const status = error.response.status;
  const responseData = error.response.data || {};

  switch (status) {
    case 400:
      return {
        title: 'Neispravni podaci',
        message: responseData.message || 'Neki podaci nisu ispravni. Molim provjerite unos.',
        actions: [
          'Provjerite da li su sva obavezna polja popunjena',
          'Provjerite format email adrese',
          'Provjerite format web adresa (moraju počinjati sa http:// ili https://)',
          'Provjerite da naziv nije predugačak'
        ],
        technicalDetails: responseData.details || responseData.message || 'Validation error',
        canRetry: false
      };

    case 401:
      return {
        title: 'Potrebna prijava',
        message: 'Morate biti prijavljeni za ovu akciju.',
        actions: [
          'Prijavite se u aplikaciju',
          'Ako ste prijavljeni, odjavite se i prijavite ponovo',
          'Provjerite da li je vaša sesija istekla'
        ],
        technicalDetails: 'Authentication required',
        canRetry: false
      };

    case 403:
      return {
        title: 'Nemate dozvolu',
        message: 'Nemate dozvolu za ovu akciju.',
        actions: [
          'Kontaktirajte administratora za potrebne dozvole',
          'Provjerite da li imate odgovarajuću ulogu'
        ],
        technicalDetails: 'Insufficient permissions',
        canRetry: false
      };

    case 409:
      return {
        title: 'Podaci već postoje',
        message: responseData.message || 'Entitet sa tim podacima već postoji.',
        actions: [
          'Pokušajte sa drugim nazivom',
          'Provjerite da li već postoji udruženje/daija sa tim imenom',
          'Ako mislite da je greška, kontaktirajte podršku'
        ],
        technicalDetails: responseData.message || 'Duplicate entry',
        canRetry: false
      };

    case 413:
      return {
        title: 'Slika je prevelika',
        message: 'Odabrana slika je prevelika za upload.',
        actions: [
          'Odaberite manju sliku (manje od 5MB)',
          'Kompresujte sliku prije uploada',
          'Pokušajte sa drugom slikom'
        ],
        technicalDetails: 'File too large',
        canRetry: false
      };

    case 422:
      return {
        title: 'Podaci nisu validni',
        message: responseData.message || 'Neki podaci nisu u ispravnom formatu.',
        actions: [
          'Provjerite format email adrese',
          'Provjerite format telefona (uključite pozivni broj)',
          'Provjerite da web adrese počinju sa http:// ili https://',
          'Provjerite da svi tekstovi nisu predugački'
        ],
        technicalDetails: responseData.details || 'Validation failed',
        canRetry: false
      };

    case 429:
      return {
        title: 'Previše zahtjeva',
        message: 'Poslali ste previše zahtjeva u kratkom vremenu.',
        actions: [
          'Sačekajte nekoliko minuta prije ponovnog pokušaja',
          'Ne klikcajte dugme nekoliko puta uzastopno'
        ],
        technicalDetails: 'Rate limit exceeded',
        canRetry: true
      };

    case 500:
      return {
        title: 'Greška na serveru',
        message: 'Došlo je do greške na serveru. Ovo nije vaša greška.',
        actions: [
          'Pokušajte ponovo za nekoliko minuta',
          'Ako se problem nastavi, kontaktirajte podršku',
          'Vaši podaci nisu izgubljeni'
        ],
        technicalDetails: responseData.message || 'Internal server error',
        canRetry: true
      };

    case 502:
    case 503:
    case 504:
      return {
        title: 'Server nije dostupan',
        message: 'Server trenutno nije dostupan. Molim pokušajte kasnije.',
        actions: [
          'Pokušajte ponovo za 5-10 minuta',
          'Server možda prolazi kroz održavanje',
          'Kontaktirajte podršku ako se problem nastavi'
        ],
        technicalDetails: 'Server unavailable',
        canRetry: true
      };

    default:
      return {
        ...defaultResponse,
        title: 'Neočekivana greška',
        message: responseData.message || `Dogodila se greška sa kodom ${status}.`,
        technicalDetails: responseData.message || `HTTP ${status}`,
        canRetry: status >= 500
      };
  }
};

/**
 * Parse image upload error specifically
 * @param {Error} error - Upload error
 * @returns {Object} - Detailed error information for image upload
 */
export const parseImageUploadError = (error) => {
  const defaultResponse = {
    title: 'Greška sa slikom',
    message: 'Došlo je do greške prilikom uploada slike.',
    actions: ['Pokušajte sa drugom slikom', 'Provjerite internetsku konekciju'],
    canContinueWithoutImage: true
  };

  if (!error) return defaultResponse;

  if (!error.response) {
    return {
      title: 'Problem sa konekcijom',
      message: 'Ne mogu da se povežem sa serverom za upload slike.',
      actions: [
        'Provjerite internetsku konekciju',
        'Pokušajte ponovo za nekoliko sekundi',
        'Možete nastavити bez slike'
      ],
      canContinueWithoutImage: true
    };
  }

  const status = error.response?.status;
  const responseData = error.response?.data || {};

  switch (status) {
    case 413:
      return {
        title: 'Slika je prevelika',
        message: 'Odabrana slika je prevelika za upload (maksimalno 5MB).',
        actions: [
          'Odaberite manju sliku',
          'Kompresujte sliku prije uploada',
          'Pokušajte sa slikom u JPG formatu'
        ],
        canContinueWithoutImage: true
      };

    case 415:
      return {
        title: 'Nepodržan format slike',
        message: 'Format slike nije podržan. Koristite JPG, PNG ili GIF.',
        actions: [
          'Odaberite sliku u JPG, PNG ili GIF formatu',
          'Konvertujte sliku u podržan format'
        ],
        canContinueWithoutImage: true
      };

    case 400:
      return {
        title: 'Problem sa slikom',
        message: responseData.message || 'Slika nije ispravna ili je oštećena.',
        actions: [
          'Pokušajte sa drugom slikom',
          'Provjerite da li je slika oštećena',
          'Možete nastaviti bez slike'
        ],
        canContinueWithoutImage: true
      };

    default:
      return {
        ...defaultResponse,
        message: responseData.message || 'Upload slike nije uspjeo.',
        actions: [
          'Pokušajte ponovo',
          'Pokušajte sa drugom slikom',
          'Provjerite internetsku konekciju',
          'Možete nastaviti bez slike'
        ]
      };
  }
};

/**
 * Format error for display in Alert
 * @param {Object} errorInfo - Parsed error information
 * @returns {Object} - Formatted for Alert.alert()
 */
export const formatErrorForAlert = (errorInfo) => {
  const actionsText = errorInfo.actions?.join('\n• ') || '';
  const message = `${errorInfo.message}\n\nŠta da pokušate:\n• ${actionsText}`;
  
  return {
    title: errorInfo.title || 'Greška',
    message: message,
    canRetry: errorInfo.canRetry || false
  };
};

/**
 * Show detailed error alert with retry option
 * @param {Object} errorInfo - Parsed error information  
 * @param {Function} onRetry - Function to call when user wants to retry
 * @param {Function} onCancel - Function to call when user cancels
 */
export const showDetailedErrorAlert = (errorInfo, onRetry = null, onCancel = null) => {
  const formatted = formatErrorForAlert(errorInfo);
  
  const buttons = [];
  
  if (onCancel) {
    buttons.push({ text: 'Otkaži', style: 'cancel', onPress: onCancel });
  }
  
  if (errorInfo.canRetry && onRetry) {
    buttons.push({ text: 'Pokušaj ponovo', onPress: onRetry });
  } else {
    buttons.push({ text: 'OK', onPress: onCancel });
  }

  Alert.alert(formatted.title, formatted.message, buttons);
};

export default {
  parseApiError,
  parseImageUploadError,
  formatErrorForAlert,
  showDetailedErrorAlert
};