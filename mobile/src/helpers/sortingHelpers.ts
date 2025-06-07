// Sorting helper functions for lectures, daije, and organizations

// Sort lectures by proximity to current time (date + time)
export const sortLecturesByTimeProximity = (lectures: any[]): any[] => {
  if (!Array.isArray(lectures)) return [];
  
  const now = new Date();
  
  return lectures
    .map(lecture => {
      const lectureDateTime = new Date(lecture.date);
      
      // If lecture has time, parse and add it to the date
      if (lecture.time) {
        const [hours, minutes] = lecture.time.split(':').map(Number);
        lectureDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // If no time specified, assume it's at noon
        lectureDateTime.setHours(12, 0, 0, 0);
      }
      
      // Calculate difference in milliseconds (positive for future, negative for past)
      const timeDifference = lectureDateTime.getTime() - now.getTime();
      const absoluteTimeDifference = Math.abs(timeDifference);
      const isFuture = timeDifference > 0;
      
      return {
        ...lecture,
        lectureDateTime,
        timeDifference,
        absoluteTimeDifference,
        isFuture
      };
    })
    .sort((a, b) => {
      // First priority: future lectures come before past lectures
      if (a.isFuture && !b.isFuture) return -1;
      if (!a.isFuture && b.isFuture) return 1;
      
      // Second priority: within same category (future/past), sort by proximity
      return a.absoluteTimeDifference - b.absoluteTimeDifference;
    });
};

// Sort lectures by proximity to today's date
export const sortLecturesByDateProximity = (lectures: any[]): any[] => {
  if (!Array.isArray(lectures)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day
  
  return lectures.sort((a: any, b: any) => {
    if (!a.date || !b.date) return 0;
    
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);
    
    // Check if dates are today
    const isAToday = dateA.getTime() === today.getTime();
    const isBToday = dateB.getTime() === today.getTime();
    
    // Today's lectures come first
    if (isAToday && !isBToday) return -1;
    if (!isAToday && isBToday) return 1;
    if (isAToday && isBToday) return 0; // Both today, maintain order
    
    // For non-today lectures, calculate proximity to today
    const diffA = Math.abs(dateA.getTime() - today.getTime());
    const diffB = Math.abs(dateB.getTime() - today.getTime());
    
    // If both are future or both are past, sort by proximity
    const isAFuture = dateA > today;
    const isBFuture = dateB > today;
    
    if (isAFuture && isBFuture) {
      // Both future - closest date first
      return dateA.getTime() - dateB.getTime();
    } else if (!isAFuture && !isBFuture) {
      // Both past - most recent first
      return dateB.getTime() - dateA.getTime();
    } else {
      // One future, one past - future comes first
      return isAFuture ? -1 : 1;
    }
  });
};

// Filter and sort upcoming lectures (today and future)
export const getUpcomingLecturesSorted = (lectures: any[]): any[] => {
  if (!Array.isArray(lectures)) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingLectures = lectures.filter(lecture => {
    if (!lecture.date) return false;
    
    const lectureDate = new Date(lecture.date);
    lectureDate.setHours(0, 0, 0, 0);
    
    return lectureDate >= today;
  });
  
  return sortLecturesByDateProximity(upcomingLectures);
};

// Sort organizations by the time proximity of their closest lecture
export const sortOrganizationsByLectureProximity = (organizations: any[], lectures: any[]): any[] => {
  if (!Array.isArray(organizations) || !Array.isArray(lectures)) return organizations || [];
  
  const now = new Date();
  
  // Create a lookup map for better performance
  const orgLecturesMap = new Map();
  
  // Group lectures by organization in a single pass
  lectures.forEach(lecture => {
    const orgKeys = [
      lecture.organizationId,
      lecture.organization,
      typeof lecture.organization === 'object' ? lecture.organization?._id : null
    ].filter(Boolean);
    
    orgKeys.forEach(key => {
      if (!orgLecturesMap.has(key)) {
        orgLecturesMap.set(key, []);
      }
      orgLecturesMap.get(key).push(lecture);
    });
  });
  
  return organizations
    .map(organization => {
      // Get lectures for this organization from the lookup map
      const orgLectures = orgLecturesMap.get(organization._id) || [];
      
      // Remove duplicates
      const uniqueLectures = orgLectures.filter((lecture: any, index: number, arr: any[]) => 
        arr.findIndex(l => l._id === lecture._id) === index
      );
      
      if (uniqueLectures.length === 0) {
        return {
          ...organization,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      uniqueLectures.forEach((lecture: any) => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime.getTime() - now.getTime();
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...organization,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: uniqueLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort((a, b) => {
      // First priority: organizations with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
};

// Sort daije by the time proximity of their closest lecture
export const sortDaijeByLectureProximity = (daije: any[], lectures: any[]): any[] => {
  if (!Array.isArray(daije) || !Array.isArray(lectures)) return daije || [];
  
  const now = new Date();
  
  // Create a lookup map for better performance
  const daijaLecturesMap = new Map();
  
  // Group lectures by daija in a single pass
  lectures.forEach(lecture => {
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
    
    // Also check speaker field for name matches (less precise but useful)
    if (lecture.speaker) {
      daije.forEach(daija => {
        if (daija.firstName && lecture.speaker.includes(daija.firstName)) {
          if (!daijaLecturesMap.has(daija._id)) {
            daijaLecturesMap.set(daija._id, []);
          }
          daijaLecturesMap.get(daija._id).push(lecture);
        }
      });
    }
  });
  
  return daije
    .map(daija => {
      // Get lectures for this daija from the lookup map
      const daijaLectures = daijaLecturesMap.get(daija._id) || [];
      
      // Remove duplicates
      const uniqueLectures = daijaLectures.filter((lecture: any, index: number, arr: any[]) => 
        arr.findIndex(l => l._id === lecture._id) === index
      );
      
      if (uniqueLectures.length === 0) {
        return {
          ...daija,
          closestLectureTime: Infinity,
          lectureCount: 0,
          hasFutureLecture: false
        };
      }
      
      // Find the lecture closest to current time, prioritizing future lectures
      let closestTime = Infinity;
      let hasFutureLecture = false;
      
      uniqueLectures.forEach((lecture: any) => {
        const lectureDateTime = new Date(lecture.date);
        
        if (lecture.time) {
          const [hours, minutes] = lecture.time.split(':').map(Number);
          lectureDateTime.setHours(hours, minutes, 0, 0);
        } else {
          lectureDateTime.setHours(12, 0, 0, 0);
        }
        
        const timeDifference = lectureDateTime.getTime() - now.getTime();
        const absoluteTimeDifference = Math.abs(timeDifference);
        const isFuture = timeDifference > 0;
        
        if (isFuture) {
          hasFutureLecture = true;
        }
        
        // Prioritize future lectures
        if ((isFuture && closestTime === Infinity) || 
            (isFuture && !hasFutureLecture) ||
            (isFuture === (closestTime < Infinity) && absoluteTimeDifference < Math.abs(closestTime))) {
          closestTime = timeDifference;
        }
      });
      
      return {
        ...daija,
        closestLectureTime: Math.abs(closestTime),
        lectureCount: uniqueLectures.length,
        hasFutureLecture,
        actualClosestTime: closestTime
      };
    })
    .sort((a, b) => {
      // First priority: daije with future lectures come first
      if (a.hasFutureLecture && !b.hasFutureLecture) return -1;
      if (!a.hasFutureLecture && b.hasFutureLecture) return 1;
      
      // Second priority: within same category, sort by proximity
      return a.closestLectureTime - b.closestLectureTime;
    });
}; 