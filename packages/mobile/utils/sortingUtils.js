/**
 * Centralized sorting utilities for lectures, lecturers, and associations
 * 
 * Sorting Rules:
 * 🎯 Lectures: Show active ("u toku") lectures first, then upcoming lectures (closest date/time), past lectures last
 * 🎯 Lecturers: Those with upcoming lectures first, others after
 * 🎯 Associations: Those with upcoming lectures first, others after
 */

import { calculateLectureStatus } from './lectureStatusHelpers';

/**
 * Sort lectures by status - active ("u toku") first, then future lectures, then past lectures (including cancelled)
 * This implementation matches the web version exactly for consistency
 */
export const sortLecturesByStatus = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day
  
  return lectures.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    
    // Helper function to get lecture status - matching web implementation
    const getLectureStatus = (lecture) => {
      const now = new Date();
      const lectureDateTime = new Date(lecture.date);
      
      // Set lecture time (default to 12:00 if not specified)
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
      } else {
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      // Calculate lecture end time (assuming 1 hour duration)
      const lectureEndTime = new Date(lectureDateTime.getTime() + 60 * 60 * 1000);
      
      if (now >= lectureDateTime && now <= lectureEndTime) {
        return 'utoku'; // Currently active
      } else if (lectureDateTime > now) {
        return 'uskoro'; // Future
      } else {
        return 'proslo'; // Past
      }
    };
    
    const statusA = getLectureStatus(a);
    const statusB = getLectureStatus(b);
    
    // Define priority order: utoku = 1, uskoro = 2, proslo = 3
    const statusPriority = { utoku: 1, uskoro: 2, proslo: 3 };
    
    const priorityA = statusPriority[statusA];
    const priorityB = statusPriority[statusB];
    
    // If different statuses, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Same status - sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (statusA === 'uskoro') {
      // Future lectures: earliest first
      return dateA.getTime() - dateB.getTime();
    } else if (statusA === 'proslo') {
      // Past lectures: most recent first
      return dateB.getTime() - dateA.getTime();
    } else if (statusA === 'utoku') {
      // Active lectures: sort by time if available
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    } else {
      return 0;
    }
  });
};

/**
 * Sort lectures by time proximity
 * - Future lectures first (closest date/time first)
 * - If no time specified, treat as 12:00h
 * - Past lectures last (sorted by time backwards)
 * - Cancelled lectures treated as past lectures
 */
export const sortLecturesByTime = (lectures) => {
  if (!Array.isArray(lectures)) return [];
  
  const now = new Date();
  
  return lectures
    .map(lecture => {
      if (!lecture.date) {
        return {
          ...lecture,
          lectureDateTime: null,
          timeDifference: Infinity,
          isFuture: false
        };
      }

      const lectureDateTime = new Date(lecture.date);
      
      // If time is specified, use it; otherwise default to 12:00
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
      } else {
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      const timeDifference = lectureDateTime - now;
      const isFuture = timeDifference > 0;
      
      return {
        ...lecture,
        lectureDateTime,
        timeDifference,
        isFuture
      };
    })
    .sort((a, b) => {
      // Lectures without dates go to the end
      if (!a.lectureDateTime && !b.lectureDateTime) return 0;
      if (!a.lectureDateTime) return 1;
      if (!b.lectureDateTime) return -1;
      
      // Treat cancelled lectures as past lectures for sorting purposes
      const isACancelled = a.cancelled || a.status === 'cancelled';
      const isBCancelled = b.cancelled || b.status === 'cancelled';
      const isAFuture = !isACancelled && a.isFuture;
      const isBFuture = !isBCancelled && b.isFuture;
      
      // Future lectures come first
      if (isAFuture && !isBFuture) return -1;
      if (!isAFuture && isBFuture) return 1;
      
      // Among future lectures, closest first
      if (isAFuture && isBFuture) {
        return a.timeDifference - b.timeDifference;
      }
      
      // Among past lectures (including cancelled), most recent first (reverse chronological)
      return b.timeDifference - a.timeDifference;
    });
};

/**
 * Check if an entity (lecturer or association) has upcoming lectures (excluding cancelled)
 */
const hasUpcomingLectures = (entity, allLectures) => {
  if (!Array.isArray(allLectures)) return false;
  
  const now = new Date();
  
  return allLectures.some(lecture => {
    // Skip cancelled lectures
    if (lecture.cancelled) return false;
    
    // Check if lecture belongs to this entity
    const belongsToEntity = 
      (entity.type === 'daija' && (lecture.daija === entity._id || lecture.daijaId === entity._id)) ||
      (entity.type === 'organization' && (lecture.organizationId === entity._id || lecture.organization === entity._id));
    
    if (!belongsToEntity || !lecture.date) return false;
    
    const lectureDateTime = new Date(lecture.date);
    
    // Set time (default to 12:00 if not specified)
    if (lecture.time) {
      const [hours, minutes] = lecture.time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        lectureDateTime.setHours(12, 0, 0, 0);
      }
    } else {
      lectureDateTime.setHours(12, 0, 0, 0);
    }
    
    return lectureDateTime > now;
  });
};

/**
 * Sort entities (lecturers or associations) by upcoming lectures
 * - Entities with upcoming lectures first
 * - Others after
 * - Within each group, maintain alphabetical order by name
 */
export const sortEntitiesByUpcomingLecture = (entities, allLectures = []) => {
  if (!Array.isArray(entities)) return [];
  
  return entities
    .map(entity => ({
      ...entity,
      hasUpcoming: hasUpcomingLectures(entity, allLectures)
    }))
    .sort(() => Math.random() - 0.5);
};

/**
 * Sort lecturers specifically
 */
export const sortLecturers = (lecturers, allLectures = []) => {
  const lecturersWithType = lecturers.map(lecturer => ({
    ...lecturer,
    type: 'daija'
  }));
  
  return sortEntitiesByUpcomingLecture(lecturersWithType, allLectures);
};

/**
 * Sort associations specifically
 */
export const sortAssociations = (associations, allLectures = []) => {
  const associationsWithType = associations.map(association => ({
    ...association,
    type: 'organization'
  }));
  
  return sortEntitiesByUpcomingLecture(associationsWithType, allLectures);
};

/**
 * Apply sorting to mixed data (for dashboard and universal pages)
 */
export const applySorting = (data, type, allLectures = []) => {
  switch (type) {
    case 'lectures':
      return sortLecturesByStatus(data);
    case 'lecturers':
    case 'daije':
      return sortLecturers(data, allLectures);
    case 'associations':
    case 'organizations':
    case 'udruzenja':
      return sortAssociations(data, allLectures);
    default:
      return data;
  }
};

/**
 * Sort all approved daije with random arrangement, prioritizing those with active lectures
 */
export const sortAllDaijeWithActivePriority = (daije, lectures) => {
  if (!Array.isArray(daije) || !Array.isArray(lectures)) return daije || [];
  
  // Filter only approved daije
  const approvedDaije = daije.filter(daija => daija.status === 'approved');
  
  const now = new Date();
  
  // Create a lookup map for better performance
  const daijaLecturesMap = new Map();
  
  // Group lectures by daija in a single pass
  lectures.forEach(lecture => {
    // Only consider approved and non-cancelled lectures
    if (lecture.status !== 'approved' || lecture.cancelled) return;
    
    const daijaKeys = [
      lecture.daija,
      lecture.daijaId,
      typeof lecture.daija === 'object' ? lecture.daija?._id : null
    ].filter(Boolean);
    
    daijaKeys.forEach(key => {
      if (!daijaLecturesMap.has(key)) {
        daijaLecturesMap.set(key, []);
      }
      daijaLecturesMap.get(key).push(lecture);
    });
    
    // Also check speaker field for name matches
    if (lecture.speaker) {
      approvedDaije.forEach(daija => {
        if (daija.name && lecture.speaker.includes(daija.name)) {
          if (!daijaLecturesMap.has(daija._id)) {
            daijaLecturesMap.set(daija._id, []);
          }
          daijaLecturesMap.get(daija._id).push(lecture);
        }
      });
    }
  });
  
  // Categorize daije into those with active lectures and those without
  const daijeWithActiveLectures = [];
  const daijeWithoutActiveLectures = [];
  
  approvedDaije.forEach(daija => {
    const daijaLectures = daijaLecturesMap.get(daija._id) || [];
    
    // Remove duplicates
    const uniqueLectures = daijaLectures.filter((lecture, index, arr) => 
      arr.findIndex(l => l._id === lecture._id) === index
    );
    
    // Check if daija has any active (future) lectures
    const hasActiveLecture = uniqueLectures.some(lecture => {
      const lectureDateTime = new Date(lecture.date);
      
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      return lectureDateTime.getTime() > now.getTime();
    });
    
    const daijaWithMetadata = {
      ...daija,
      lectureCount: uniqueLectures.length,
      hasActiveLecture,
      randomSeed: Math.random() // For random sorting within categories
    };
    
    if (hasActiveLecture) {
      daijeWithActiveLectures.push(daijaWithMetadata);
    } else {
      daijeWithoutActiveLectures.push(daijaWithMetadata);
    }
  });
  
  // Randomly shuffle both categories
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const shuffledWithActive = shuffleArray(daijeWithActiveLectures);
  const shuffledWithoutActive = shuffleArray(daijeWithoutActiveLectures);
  
  // Return daije with active lectures first, then those without
  return [...shuffledWithActive, ...shuffledWithoutActive];
}; 