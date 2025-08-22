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
  
  // Parsira 'YYYY-MM-DD' format
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Kreira datum sa eksplicitnim vremenom 12:00 lokalno
  // Ovo osigurava da datum ostaje isti bez obzira na timezone
  return new Date(year, month - 1, day, 12, 0, 0, 0);
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