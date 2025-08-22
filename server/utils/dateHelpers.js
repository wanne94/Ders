/**
 * Helper funkcije za rad sa datumima
 * Rješava problem sa timezone konverzijama
 */

/**
 * Parsira datum string u formatu 'YYYY-MM-DD' bez timezone konverzije
 * Postavlja vrijeme na 12:00 lokalno da izbjegne probleme sa pomjeranjem datuma
 * @param {string} dateString - Datum u formatu 'YYYY-MM-DD'
 * @returns {Date} - Date objekat sa vremenom postavljenim na 12:00
 */
function parseLocalDate(dateString) {
  if (!dateString) return null;
  
  console.log('📅 [PRODUCTION FIX] parseLocalDate input:', {
    dateString,
    type: typeof dateString,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // Handle ISO date strings (with 'T') by extracting just the date part
  if (typeof dateString === 'string' && dateString.includes('T')) {
    dateString = dateString.split('T')[0];
    console.log('📅 [PRODUCTION FIX] Extracted date from ISO:', dateString);
  }
  
  // Ensure it's a string
  if (typeof dateString !== 'string') {
    console.error('[PRODUCTION FIX] parseLocalDate expects string, got:', typeof dateString);
    return null;
  }
  
  // Parsira 'YYYY-MM-DD' format
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    console.error('[PRODUCTION FIX] Invalid date format:', dateString);
    return null;
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('[PRODUCTION FIX] Invalid date parts:', { year, month, day });
    return null;
  }
  
  // CRITICAL: Kreira datum sa eksplicitnim vremenom 12:00 lokalno
  // Ovo je KLJUČNO za izbjegavanje timezone problema
  const date = new Date(year, month, day, 12, 0, 0, 0);
  
  console.log('📅 [PRODUCTION FIX] parseLocalDate created:', {
    input: dateString,
    outputString: date.toString(),
    outputISO: date.toISOString(),
    localString: date.toLocaleString(),
    components: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes()
    },
    timezoneOffset: date.getTimezoneOffset()
  });
  
  // Verify the date components match
  if (date.getFullYear() !== year || 
      date.getMonth() !== month || 
      date.getDate() !== day) {
    console.error('[PRODUCTION FIX] Date mismatch after creation!', {
      expected: { year, month: month + 1, day },
      got: { 
        year: date.getFullYear(), 
        month: date.getMonth() + 1, 
        day: date.getDate() 
      }
    });
  }
  
  return date;
}

/**
 * Formatira Date objekat u 'YYYY-MM-DD' string
 * @param {Date} date - Date objekat
 * @returns {string} - Datum u formatu 'YYYY-MM-DD'
 */
function formatDateToString(date) {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Dodaje dane na datum
 * @param {Date} date - Početni datum
 * @param {number} days - Broj dana za dodati
 * @returns {Date} - Novi datum
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  parseLocalDate,
  formatDateToString,
  addDays
};