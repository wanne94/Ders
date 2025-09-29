/**
 * Shared Dashboard Business Logic
 * Contains all dashboard-related logic that can be shared between web and mobile
 */

// Dashboard state management
export const initialDashboardState = {
  activeSection: 'dashboard',
  isLoading: true,
  refreshing: false,
  searchQuery: '',
  showFilters: false,
  activeFilters: {},

  // Data
  data: {
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: [],
    suggestionsCount: { total: 0, pending: 0, approved: 0, rejected: 0 },
    cancelledReports: []
  },

  // Counts for badges
  counts: {
    pendingDaije: 0,
    pendingOrganizations: 0,
    pendingSuggestions: 0,
    rejectedItems: 0,
    pendingCancelledReports: 0,
    totalLectures: 0,
    approvedLectures: 0,
    totalUsers: 0
  },

  // Settings
  approvalSettings: {
    lecture: true,
    daija: true,
    organization: true
  }
};

// Calculate statistics from data
export const calculateStatistics = (data) => {
  const stats = {
    lectures: {
      total: data.lectures?.length || 0,
      approved: data.lectures?.filter(l => l.status === 'approved').length || 0,
      pending: data.lectures?.filter(l => l.status === 'pending').length || 0,
      cancelled: data.lectures?.filter(l => l.status === 'cancelled' || l.isCancelled).length || 0
    },
    daije: {
      total: data.daije?.length || 0,
      approved: data.daije?.filter(d => d.status === 'approved').length || 0,
      pending: data.daije?.filter(d => d.status === 'pending').length || 0
    },
    organizations: {
      total: data.organizations?.length || 0,
      approved: data.organizations?.filter(o => o.status === 'approved').length || 0,
      pending: data.organizations?.filter(o => o.status === 'pending').length || 0
    },
    users: {
      total: data.users?.length || 0,
      active: data.users?.filter(u => u.isActive).length || 0,
      admins: data.users?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0
    },
    suggestions: {
      total: data.suggestions?.length || 0,
      pending: data.suggestions?.filter(s => s.status === 'pending').length || 0,
      approved: data.suggestions?.filter(s => s.status === 'approved').length || 0,
      rejected: data.suggestions?.filter(s => s.status === 'rejected').length || 0
    }
  };

  return stats;
};

// Filter data based on search query
export const filterDataBySearch = (data, searchQuery, dataType) => {
  if (!searchQuery) return data;

  const query = searchQuery.toLowerCase();

  switch (dataType) {
    case 'lectures':
      return data.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.speaker?.toLowerCase().includes(query) ||
        item.organization?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query)
      );

    case 'daije':
      return data.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query) ||
        item.biography?.toLowerCase().includes(query)
      );

    case 'organizations':
      return data.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );

    case 'users':
      return data.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.role?.toLowerCase().includes(query)
      );

    case 'suggestions':
      return data.filter(item =>
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.userEmail?.toLowerCase().includes(query)
      );

    default:
      return data;
  }
};

// Apply advanced filters
export const applyAdvancedFilters = (data, filters, dataType) => {
  let filteredData = [...data];

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filteredData = filteredData.filter(item => item.status === filters.status);
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      if (filters.dateFrom && itemDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && itemDate > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  // City filter (for lectures and organizations)
  if (filters.city && (dataType === 'lectures' || dataType === 'organizations')) {
    filteredData = filteredData.filter(item =>
      item.city?.toLowerCase().includes(filters.city.toLowerCase())
    );
  }

  // Role filter (for users)
  if (filters.role && dataType === 'users') {
    filteredData = filteredData.filter(item => item.role === filters.role);
  }

  // Category filter (for suggestions)
  if (filters.category && dataType === 'suggestions') {
    filteredData = filteredData.filter(item => item.category === filters.category);
  }

  return filteredData;
};

// Sort data
export const sortData = (data, sortBy, sortOrder = 'asc') => {
  const sorted = [...data].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle dates
    if (sortBy === 'date' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return sorted;
};

// Validate approval/rejection
export const validateStatusChange = (item, newStatus, userRole) => {
  // Check if user has permission
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return { valid: false, error: 'Nemate dozvolu za ovu akciju' };
  }

  // Check if status change is valid
  const validTransitions = {
    'pending': ['approved', 'rejected'],
    'approved': ['rejected', 'pending'],
    'rejected': ['approved', 'pending']
  };

  const currentStatus = item.status || 'pending';
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return { valid: false, error: 'Nevažeća promjena statusa' };
  }

  return { valid: true };
};

// Format date for display
export const formatDateForDisplay = (date) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    approved: '#4CAF50',
    pending: '#FF9800',
    rejected: '#f44336',
    active: '#4CAF50',
    inactive: '#9E9E9E',
    cancelled: '#f44336'
  };

  return colors[status] || '#9E9E9E';
};

// Get user role badge color
export const getRoleColor = (role) => {
  const colors = {
    super_admin: '#9C27B0',
    admin: '#2196F3',
    moderator: '#00BCD4',
    user: '#4CAF50'
  };

  return colors[role] || '#9E9E9E';
};

// Prepare data for export
export const prepareDataForExport = (data, dataType) => {
  switch (dataType) {
    case 'lectures':
      return data.map(item => ({
        'Naslov': item.title,
        'Datum': formatDateForDisplay(item.date),
        'Vrijeme': item.time,
        'Lokacija': `${item.address}, ${item.city}`,
        'Govornik': item.speaker,
        'Organizacija': item.organization,
        'Status': item.status
      }));

    case 'daije':
      return data.map(item => ({
        'Ime': item.name,
        'Titula': item.title,
        'Status': item.status,
        'Datum kreiranja': formatDateForDisplay(item.createdAt)
      }));

    case 'organizations':
      return data.map(item => ({
        'Naziv': item.name,
        'Grad': item.city,
        'Adresa': item.address,
        'Status': item.status,
        'Datum kreiranja': formatDateForDisplay(item.createdAt)
      }));

    case 'users':
      return data.map(item => ({
        'Ime': item.name,
        'Email': item.email,
        'Uloga': item.role,
        'Status': item.isActive ? 'Aktivan' : 'Neaktivan',
        'Datum registracije': formatDateForDisplay(item.createdAt)
      }));

    default:
      return data;
  }
};

// Dashboard action types
export const DASHBOARD_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DATA: 'SET_DATA',
  SET_ACTIVE_SECTION: 'SET_ACTIVE_SECTION',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  SET_APPROVAL_SETTINGS: 'SET_APPROVAL_SETTINGS',
  SET_COUNTS: 'SET_COUNTS',
  SET_REFRESHING: 'SET_REFRESHING'
};

// Dashboard reducer
export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case DASHBOARD_ACTIONS.SET_DATA:
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        isLoading: false
      };

    case DASHBOARD_ACTIONS.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };

    case DASHBOARD_ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case DASHBOARD_ACTIONS.SET_FILTERS:
      return { ...state, activeFilters: action.payload };

    case DASHBOARD_ACTIONS.UPDATE_ITEM:
      const { dataType, itemId, updates } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [dataType]: state.data[dataType].map(item =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        }
      };

    case DASHBOARD_ACTIONS.DELETE_ITEM:
      const { dataType: deleteType, itemId: deleteId } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [deleteType]: state.data[deleteType].filter(item => item._id !== deleteId)
        }
      };

    case DASHBOARD_ACTIONS.SET_APPROVAL_SETTINGS:
      return { ...state, approvalSettings: action.payload };

    case DASHBOARD_ACTIONS.SET_COUNTS:
      return { ...state, counts: action.payload };

    case DASHBOARD_ACTIONS.SET_REFRESHING:
      return { ...state, refreshing: action.payload };

    default:
      return state;
  }
};

export default {
  initialDashboardState,
  calculateStatistics,
  filterDataBySearch,
  applyAdvancedFilters,
  sortData,
  validateStatusChange,
  formatDateForDisplay,
  getStatusColor,
  getRoleColor,
  prepareDataForExport,
  DASHBOARD_ACTIONS,
  dashboardReducer
};