/**
 * Shared Navigation Configuration
 * Defines all routes and menu items for both web and mobile platforms
 */

// Main navigation items (always visible)
export const mainMenuItems = [
  {
    id: 'home',
    label: 'Početna',
    path: '/',
    icon: 'home',
    webIcon: 'Home',
    mobileIcon: 'home-outline',
    mobileIconActive: 'home'
  },
  {
    id: 'lectures',
    label: 'Dersovi',
    path: '/lectures',
    icon: 'book',
    webIcon: 'BookOpen',
    mobileIcon: 'book-outline',
    mobileIconActive: 'book'
  },
  {
    id: 'organizations',
    label: 'Udruženja',
    path: '/organizations',
    icon: 'business',
    webIcon: 'Building2',
    mobileIcon: 'business-outline',
    mobileIconActive: 'business'
  },
  {
    id: 'speakers',
    label: 'Daije',
    path: '/daije',
    icon: 'people',
    webIcon: 'User',
    mobileIcon: 'people-outline',
    mobileIconActive: 'people'
  }
];

// Add/Create menu items
export const addMenuItems = [
  {
    id: 'add-lecture',
    label: 'Dodaj ders',
    icon: 'book',
    webIcon: 'BookOpen',
    mobileIcon: 'book',
    action: 'add-lecture',
    requiresAuth: true
  },
  {
    id: 'add-daija',
    label: 'Dodaj daiju',
    icon: 'person',
    webIcon: 'User',
    mobileIcon: 'person-add',
    action: 'add-daija',
    requiresAuth: true,
    requiresRole: ['admin', 'super_admin']
  },
  {
    id: 'add-organization',
    label: 'Dodaj udruženje',
    icon: 'business',
    webIcon: 'Building2',
    mobileIcon: 'business',
    action: 'add-organization',
    requiresAuth: true,
    requiresRole: ['admin', 'super_admin']
  },
  {
    id: 'suggest-change',
    label: 'Predloži izmjenu',
    icon: 'lightbulb',
    webIcon: 'Lightbulb',
    mobileIcon: 'bulb-outline',
    action: 'suggest-change',
    requiresAuth: false
  }
];

// Admin navigation items
export const adminMenuItems = [
  {
    id: 'dashboard',
    label: 'Admin Panel',
    path: '/admin',
    icon: 'dashboard',
    webIcon: 'LayoutDashboard',
    mobileIcon: 'grid-outline',
    requiresRole: ['admin', 'super_admin']
  },
  {
    id: 'users',
    label: 'Korisnici',
    path: '/users',
    icon: 'users',
    webIcon: 'Users',
    mobileIcon: 'people',
    requiresRole: ['admin', 'super_admin']
  },
  {
    id: 'settings',
    label: 'Postavke',
    path: '/settings',
    icon: 'settings',
    webIcon: 'Settings',
    mobileIcon: 'settings-outline',
    requiresRole: ['super_admin']
  }
];

// User menu items (profile dropdown)
export const userMenuItems = [
  {
    id: 'profile',
    label: 'Profil',
    path: '/profile',
    icon: 'person',
    webIcon: 'UserCircle',
    mobileIcon: 'person-circle-outline',
    requiresAuth: true
  },
  {
    id: 'logout',
    label: 'Odjava',
    action: 'logout',
    icon: 'logout',
    webIcon: 'LogOut',
    mobileIcon: 'log-out-outline',
    requiresAuth: true
  }
];

// Helper function to get menu items based on user role
export const getMenuItemsForUser = (user) => {
  const items = [...mainMenuItems];

  if (user) {
    // Add user-specific items
    if (user.role === 'admin' || user.role === 'super_admin') {
      items.push(...adminMenuItems.filter(item =>
        !item.requiresRole || item.requiresRole.includes(user.role)
      ));
    }
  }

  return items;
};

// Helper function to get add menu items based on user role
export const getAddMenuItemsForUser = (user) => {
  return addMenuItems.filter(item => {
    if (item.requiresAuth && !user) return false;
    if (item.requiresRole && (!user || !item.requiresRole.includes(user.role))) return false;
    return true;
  });
};

// Dashboard sections configuration
export const dashboardSections = [
  {
    id: 'overview',
    label: 'Pregled',
    icon: 'dashboard',
    webIcon: 'Dashboard',
    mobileIcon: 'grid-outline'
  },
  {
    id: 'lectures',
    label: 'Dersovi',
    icon: 'book',
    webIcon: 'BookOpen',
    mobileIcon: 'book-outline'
  },
  {
    id: 'daije',
    label: 'Daije',
    icon: 'people',
    webIcon: 'User',
    mobileIcon: 'people-outline'
  },
  {
    id: 'organizations',
    label: 'Udruženja',
    icon: 'business',
    webIcon: 'Building2',
    mobileIcon: 'business-outline'
  },
  {
    id: 'users',
    label: 'Korisnici',
    icon: 'users',
    webIcon: 'Users',
    mobileIcon: 'people'
  },
  {
    id: 'suggestions',
    label: 'Prijedlozi',
    icon: 'lightbulb',
    webIcon: 'Lightbulb',
    mobileIcon: 'bulb-outline'
  },
  {
    id: 'reports',
    label: 'Prijave',
    icon: 'report',
    webIcon: 'Flag',
    mobileIcon: 'flag-outline'
  },
  {
    id: 'settings',
    label: 'Postavke',
    icon: 'settings',
    webIcon: 'Settings',
    mobileIcon: 'settings-outline',
    requiresRole: ['super_admin']
  }
];

// Routes configuration
export const routes = {
  // Public routes
  home: '/',
  lectures: '/lectures',
  lectureDetail: '/lecture/:id',
  organizations: '/organizations',
  organizationDetail: '/organization/:id',
  daije: '/daije',
  daijaDetail: '/daija/:id',

  // Auth routes
  login: '/auth',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',

  // Protected routes
  profile: '/profile',
  dashboard: '/admin',
  users: '/users',
  settings: '/settings',

  // Mobile specific routes (using state-based navigation)
  mobileRoutes: {
    home: 'home',
    lectures: 'lectures',
    organizations: 'organizations',
    speakers: 'speakers',
    add: 'add',
    profile: 'userProfile',
    dashboard: 'dashboard',
    auth: 'auth',
    search: 'search'
  }
};

export default {
  mainMenuItems,
  addMenuItems,
  adminMenuItems,
  userMenuItems,
  dashboardSections,
  routes,
  getMenuItemsForUser,
  getAddMenuItemsForUser
};