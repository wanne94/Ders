import React from 'react';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Lectures section component for dashboard
 * Displays all lectures (approved and cancelled)
 *
 * @param {Array} lectures - All lectures data
 * @param {object} searchQueries - Search query values
 * @param {function} handleSearchChange - Search change handler
 * @param {function} setFiltersOpen - Function to open filters dialog
 * @param {object} activeFilters - Currently active filters
 * @param {boolean} isAdmin - Whether current user is admin
 * @param {boolean} canDelete - Whether current user can delete
 * @param {function} handleEdit - Edit handler
 * @param {function} handleDelete - Delete handler
 * @param {function} handleDuplicate - Duplicate handler
 * @param {function} handleCancelLecture - Cancel lecture handler
 * @param {function} handleStatusChange - Status change handler
 * @param {function} handleBulkStatusChange - Bulk status change handler
 * @param {function} handleBulkDelete - Bulk delete handler
 */
const LecturesSection = ({
  lectures,
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
  handleBulkDelete
}) => {
  // Filter lectures based on search and filters
  const filteredLectures = filterData(
    lectures || [],
    searchQueries.lectures,
    'lecture',
    activeFilters
  );

  return (
    <DataSection
      title="Svi Dersovi"
      items={filteredLectures}
      type="lecture"
      sectionKey="lectures"
      searchQueries={searchQueries}
      handleSearchChange={handleSearchChange}
      setFiltersOpen={setFiltersOpen}
      activeFilters={activeFilters}
      isAdmin={isAdmin}
      canDelete={canDelete}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleDuplicate={handleDuplicate}
      handleCancelLecture={handleCancelLecture}
      handleStatusChange={handleStatusChange}
      handleBulkStatusChange={handleBulkStatusChange}
      handleBulkDelete={handleBulkDelete}
      showRejectionReason={false}
    />
  );
};

export default LecturesSection;
