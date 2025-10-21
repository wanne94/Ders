/**
 * Filter dashboard data by search query and advanced filters
 *
 * @param {Array} items - Items to filter
 * @param {string} searchQuery - Search query string
 * @param {string} type - Data type (lecture, user, organization, daija, suggestion)
 * @param {object} activeFilters - Active filter values
 * @returns {Array} - Filtered items
 */
export const filterData = (items, searchQuery, type, activeFilters = {}) => {
  let filteredItems = [...items];

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    filteredItems = filteredItems.filter(item => {
      switch (type) {
        case 'lecture':
          return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.organization?.toLowerCase().includes(searchQuery.toLowerCase());
        case 'user':
          return item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.email?.toLowerCase().includes(searchQuery.toLowerCase());
        case 'organization':
          return item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.city?.toLowerCase().includes(searchQuery.toLowerCase());
        case 'daija':
          return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        case 'suggestion':
          return item.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.submitterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.submitterEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        default:
          return true;
      }
    });
  }

  // Apply advanced filters
  if (Object.keys(activeFilters).length > 0) {
    // Date filters
    if (activeFilters.dateFrom) {
      const fromDate = new Date(activeFilters.dateFrom);
      filteredItems = filteredItems.filter(item => {
        const itemDate = item.date ? new Date(item.date) : null;
        return itemDate && itemDate >= fromDate;
      });
    }

    if (activeFilters.dateTo) {
      const toDate = new Date(activeFilters.dateTo);
      filteredItems = filteredItems.filter(item => {
        const itemDate = item.date ? new Date(item.date) : null;
        return itemDate && itemDate <= toDate;
      });
    }

    // Status filter
    if (activeFilters.status) {
      filteredItems = filteredItems.filter(item => item.status === activeFilters.status);
    }

    // City filter
    if (activeFilters.city) {
      filteredItems = filteredItems.filter(item => item.city === activeFilters.city);
    }

    // Organization filter
    if (activeFilters.organization) {
      filteredItems = filteredItems.filter(item => item.organization === activeFilters.organization);
    }

    // Speaker filter
    if (activeFilters.speaker) {
      filteredItems = filteredItems.filter(item => item.speaker === activeFilters.speaker);
    }

    // Has image filter
    if (activeFilters.hasImage === true) {
      filteredItems = filteredItems.filter(item => item.imageUrl && item.imageUrl !== '');
    }

    // Sort
    if (activeFilters.sortBy) {
      filteredItems.sort((a, b) => {
        let aVal = a[activeFilters.sortBy];
        let bVal = b[activeFilters.sortBy];

        // Handle dates
        if (activeFilters.sortBy === 'date' || activeFilters.sortBy === 'createdAt') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (activeFilters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
  }

  return filteredItems;
};
