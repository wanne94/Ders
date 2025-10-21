import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import { FilterButton } from '@/components/AdvancedFilters';

/**
 * Generic data section component used across all dashboard sections
 * Renders a table with search, filters, and actions
 *
 * @param {string} title - Section title
 * @param {Array} items - Data items to display
 * @param {string} type - Data type (lecture, daija, organization, user, suggestion)
 * @param {string} sectionKey - Key for search queries
 * @param {object} searchQueries - Current search query values
 * @param {function} handleSearchChange - Search change handler
 * @param {function} setFiltersOpen - Function to open filters dialog
 * @param {object} activeFilters - Currently active filters
 * @param {boolean} isAdmin - Whether current user is admin
 * @param {boolean} canDelete - Whether current user can delete
 * @param {function} handleEdit - Edit handler
 * @param {function} handleDelete - Delete handler
 * @param {function} handleDuplicate - Duplicate handler
 * @param {function} handleCancelLecture - Cancel lecture handler (lectures only)
 * @param {function} handleStatusChange - Status change handler
 * @param {function} handleBulkStatusChange - Bulk status change handler
 * @param {function} handleBulkDelete - Bulk delete handler
 * @param {boolean} showRejectionReason - Whether to show rejection reason column
 */
const DataSection = ({
  title,
  items,
  type,
  sectionKey,
  searchQueries,
  handleSearchChange,
  setFiltersOpen,
  activeFilters,
  isAdmin,
  canDelete,
  handleEdit,
  handleDelete,
  handleDuplicate,
  handleCancelLecture,
  handleStatusChange,
  handleBulkStatusChange,
  handleBulkDelete,
  showRejectionReason = false
}) => {
  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <SearchBar
            placeholder={`Pretraži ${title.toLowerCase()}...`}
            onSearch={(value) => handleSearchChange(sectionKey, value)}
            value={searchQueries[sectionKey] || ''}
            fullWidth={false}
            sx={{ width: 300 }}
          />
          <FilterButton
            onClick={() => setFiltersOpen(true)}
            activeCount={Object.keys(activeFilters).length}
          />
        </Box>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
          <Typography color="text.secondary" variant="h6">
            Nema {title.toLowerCase()}
          </Typography>
        </Paper>
      ) : (
        <DataTable
          data={items}
          type={type}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          onDuplicate={handleDuplicate}
          onCancel={(type === 'lecture' || type === 'lectures') && isAdmin ? handleCancelLecture : undefined}
          onStatusChange={isAdmin ? (item, newStatus) => handleStatusChange(item, newStatus, type) : undefined}
          onBulkStatusChange={isAdmin ? handleBulkStatusChange : undefined}
          onBulkDelete={canDelete ? handleBulkDelete : undefined}
          hideActions={!isAdmin}
          showActions={true}
          showStatus={true}
          showRejectionReason={showRejectionReason}
        />
      )}
    </Box>
  );
};

export default DataSection;
