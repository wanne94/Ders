/**
 * Utility functions for calendar operations
 */

/**
 * Generate ICS (iCalendar) file content for a lecture
 * @param {Object} lecture - Lecture object
 * @returns {string} - ICS file content
 */
export const generateICS = (lecture) => {
  const { title, date, time, address, city, speaker, description } = lecture;
  
  // Parse date and time
  const eventDate = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  // End time (1 hour later by default)
  const endDate = new Date(eventDate);
  endDate.setHours(endDate.getHours() + 1);
  
  // Format dates for ICS (YYYYMMDDTHHmmss)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };
  
  // Build location string
  const location = [address, city].filter(Boolean).join(', ');
  
  // Build description
  const fullDescription = `Predavač: ${speaker || 'Nepoznat'}\\n${description || ''}`;
  
  // Generate ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DERS.ba//Predavanja//BA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${lecture._id || lecture.id}@ders.ba`,
    `DTSTART:${formatDate(eventDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    location && `LOCATION:${location}`,
    `DESCRIPTION:${fullDescription.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  
  return icsContent;
};

/**
 * Download ICS file
 * @param {Object} lecture - Lecture object
 */
export const downloadICS = (lecture) => {
  const icsContent = generateICS(lecture);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${lecture.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

/**
 * Add to Google Calendar
 * @param {Object} lecture - Lecture object
 */
export const addToGoogleCalendar = (lecture) => {
  const { title, date, time, address, city, speaker, description } = lecture;
  
  // Parse date and time
  const eventDate = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  // End time (1 hour later by default)
  const endDate = new Date(eventDate);
  endDate.setHours(endDate.getHours() + 1);
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmss)
  const formatDateGoogle = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };
  
  // Build parameters
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateGoogle(eventDate)}/${formatDateGoogle(endDate)}`,
    details: `Predavač: ${speaker || 'Nepoznat'}\n${description || ''}`,
    location: [address, city].filter(Boolean).join(', ')
  });
  
  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(url, '_blank');
};