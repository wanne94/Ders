// Text formatting utilities
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Daija title formatting utility
export const formatDaijaTitle = (name, title) => {
  if (!name || !title) return name || '';
  
  const lowercaseTitle = title.toLowerCase();
  
  if (title.toLowerCase() === 'prof') {
    return `${name}, ${lowercaseTitle}.`;
  }
  
  return `${lowercaseTitle}. ${name}`;
};