import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics, isAnalyticsAvailable } from '@/config/firebase';

// Custom event names
export const ANALYTICS_EVENTS = {
  // Lecture events
  VIEW_LECTURE: 'view_lecture',
  SHARE_LECTURE: 'share_lecture',
  BOOKMARK_LECTURE: 'bookmark_lecture',
  
  // Daija events
  VIEW_DAIJA_PROFILE: 'view_daija_profile',
  
  // Organization events
  VIEW_ORGANIZATION: 'view_organization',
  
  // Search events
  SEARCH_PERFORMED: 'search',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  
  // User engagement
  USER_ENGAGEMENT: 'user_engagement',
  PAGE_SCROLL: 'page_scroll',
  
  // Auth events
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  LOGOUT: 'logout',
  
  // Navigation
  NAVIGATION_CLICK: 'navigation_click',
  TAB_SWITCH: 'tab_switch',
  
  // Social
  SOCIAL_SHARE: 'share'
};

// Helper function to safely log events
export const logEvent = (eventName, parameters = {}) => {
  try {
    if (isAnalyticsAvailable()) {
      // Add timestamp to all events
      const enrichedParams = {
        ...parameters,
        timestamp: new Date().toISOString(),
        platform: 'web'
      };
      
      firebaseLogEvent(analytics, eventName, enrichedParams);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', eventName, enrichedParams);
      }
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Specific event logging functions
export const logLectureView = (lectureId, lectureTitle, organizationId = null, daijaId = null) => {
  logEvent(ANALYTICS_EVENTS.VIEW_LECTURE, {
    lecture_id: lectureId,
    lecture_title: lectureTitle,
    organization_id: organizationId,
    daija_id: daijaId,
    content_type: 'lecture'
  });
};

export const logDaijaProfileView = (daijaId, daijaName) => {
  logEvent(ANALYTICS_EVENTS.VIEW_DAIJA_PROFILE, {
    daija_id: daijaId,
    daija_name: daijaName,
    content_type: 'daija'
  });
};

export const logOrganizationView = (organizationId, organizationName) => {
  logEvent(ANALYTICS_EVENTS.VIEW_ORGANIZATION, {
    organization_id: organizationId,
    organization_name: organizationName,
    content_type: 'organization'
  });
};

export const logSearch = (searchTerm, resultsCount = 0, searchType = 'all') => {
  logEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
    search_term: searchTerm,
    results_count: resultsCount,
    search_type: searchType
  });
};

export const logUserEngagement = (engagementType, duration = null) => {
  logEvent(ANALYTICS_EVENTS.USER_ENGAGEMENT, {
    engagement_type: engagementType,
    duration_seconds: duration
  });
};

export const logPageScroll = (scrollPercentage) => {
  logEvent(ANALYTICS_EVENTS.PAGE_SCROLL, {
    scroll_percentage: Math.round(scrollPercentage),
    page_path: window.location.pathname
  });
};

export const logAuth = (method, isNewUser = false) => {
  const eventName = isNewUser ? ANALYTICS_EVENTS.SIGNUP : ANALYTICS_EVENTS.LOGIN;
  logEvent(eventName, {
    method: method
  });
};

export const logNavigation = (item, section = 'main_nav') => {
  logEvent(ANALYTICS_EVENTS.NAVIGATION_CLICK, {
    item_name: item,
    section: section
  });
};

export const logSocialShare = (contentType, contentId, platform) => {
  logEvent(ANALYTICS_EVENTS.SOCIAL_SHARE, {
    content_type: contentType,
    content_id: contentId,
    method: platform
  });
};

// Initialize page view tracking
export const initPageViewTracking = () => {
  if (typeof window !== 'undefined' && isAnalyticsAvailable()) {
    // Log initial page view
    logEvent('page_view', {
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
};

const analyticsService = {
  logEvent,
  logLectureView,
  logDaijaProfileView,
  logOrganizationView,
  logSearch,
  logUserEngagement,
  logPageScroll,
  logAuth,
  logNavigation,
  logSocialShare,
  initPageViewTracking,
  ANALYTICS_EVENTS
};

export default analyticsService;