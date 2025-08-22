/**
 * Utility function to format Daija name with title
 * Rules:
 * - Title "prof." goes AFTER the name with comma
 * - All other titles go BEFORE the name
 * - Titles are lowercase with dot at the end
 * 
 * @param {string} name - The name of the daija
 * @param {string} title - The title (e.g., "prof", "dr", "mr", etc.)
 * @returns {string} - Formatted name with title
 */
function formatDaijaTitle(name, title) {
  // If no name, return empty string
  if (!name) return '';
  
  // If no title or empty title, return just the name
  if (!title || title.trim() === '') return name;
  
  // Normalize the title to lowercase and trim
  const lowercaseTitle = title.toLowerCase().trim();
  
  // Remove any existing dots and add one at the end
  const titleWithDot = lowercaseTitle.replace(/\.$/, '') + '.';
  
  // Special case for "prof." - goes after the name with comma
  if (lowercaseTitle === 'prof' || lowercaseTitle === 'prof.') {
    return `${name}, prof.`;
  }
  
  // For combinations like "prof. dr." - prof goes after, others before
  if (lowercaseTitle.includes('prof')) {
    // Extract other titles (everything that's not prof)
    const parts = lowercaseTitle.split(/[\s.]+/).filter(p => p);
    const otherTitles = parts.filter(p => p !== 'prof').map(p => p + '.').join(' ');
    
    if (otherTitles) {
      return `${otherTitles} ${name}, prof.`;
    }
    return `${name}, prof.`;
  }
  
  // All other titles go before the name
  return `${titleWithDot} ${name}`;
}

module.exports = {
  formatDaijaTitle
};