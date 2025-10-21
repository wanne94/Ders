/**
 * Dashboard Helper Functions
 * Utility functions used across dashboard components
 */

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  background: '#f8fafc',
  border: '#e2e8f0',
};

/**
 * Format date string to DD.MM.YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Get daija name by ID or from object
 */
export const getDaijaName = (daijaId, daijaObject = null, daijeList = []) => {
  // If daija object is already provided (from populated data), use it
  if (daijaObject && typeof daijaObject === 'object') {
    return `${daijaObject.title || ''} ${daijaObject.name || ''}`.trim();
  }

  // Otherwise, look up by ID in the daije array
  if (!daijaId || !daijeList) return null;
  const daija = daijeList.find(d => d._id === daijaId);
  if (!daija) return null;
  return `${daija.title || ''} ${daija.name || ''}`.trim();
};

/**
 * Get status badge background color
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return COLORS.success + '20';
    case 'rejected': return COLORS.error + '20';
    case 'pending': return COLORS.warning + '20';
    default: return COLORS.gray + '20';
  }
};

/**
 * Get status text in Bosnian
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'approved': return 'Odobreno';
    case 'rejected': return 'Odbačeno';
    case 'pending': return 'Na čekanju';
    default: return 'Nepoznato';
  }
};

/**
 * Get status text color
 */
export const getStatusTextColor = (status) => {
  switch (status) {
    case 'approved': return COLORS.success;
    case 'rejected': return COLORS.error;
    case 'pending': return COLORS.warning;
    default: return COLORS.gray;
  }
};

/**
 * Get type text in Bosnian
 */
export const getTypeText = (type) => {
  switch (type) {
    case 'lecture': return 'Ders';
    case 'daija': return 'Daija';
    case 'organization': return 'Udruženje';
    case 'user': return 'Korisnik';
    case 'suggestion': return 'Prijedlog';
    case 'cancelled_report': return 'Prijava otkazivanja';
    default: return type;
  }
};

export { COLORS };
