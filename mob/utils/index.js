// Text formatting utilities
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Daija title formatting utility
export const formatDaijaTitle = (name, title) => {
  if (!name) return '';
  if (!title || title.trim() === '') return name;
  
  const lowercaseTitle = title.toLowerCase().trim();
  
  // Special case for "prof." - goes after the name
  if (lowercaseTitle === 'prof' || lowercaseTitle === 'prof.') {
    return `${name} prof.`;
  }
  
  // All other titles go before the name
  // Ensure title ends with a dot
  const formattedTitle = lowercaseTitle.endsWith('.') ? lowercaseTitle : `${lowercaseTitle}.`;
  
  return `${formattedTitle} ${name}`;
};