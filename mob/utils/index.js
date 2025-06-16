// Daija title formatting utility
export const formatDaijaTitle = (name, title) => {
  if (!name || !title) return name || '';
  
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  
  if (title.toLowerCase() === 'prof') {
    return `${name}, ${capitalizedTitle}.`;
  }
  
  return `${capitalizedTitle}. ${name}`;
};