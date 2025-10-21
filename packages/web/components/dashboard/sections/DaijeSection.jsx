import React from 'react';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Daije section component for dashboard
 * Displays all daije (speakers/scholars)
 */
const DaijeSection = ({
  daije,
  searchQueries,
  handleSearchChange,
  setFiltersOpen,
  activeFilters,
  isAdmin,
  canDelete,
  handleEdit,
  handleDelete,
  handleDuplicate,
  handleStatusChange,
  handleBulkStatusChange,
  handleBulkDelete
}) => {
  const filteredDaije = filterData(
    daije || [],
    searchQueries.lectures,
    'daija',
    activeFilters
  );

  return (
    <DataSection
      title="Daije"
      items={filteredDaije}
      type="daija"
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
      handleCancelLecture={undefined}
      handleStatusChange={handleStatusChange}
      handleBulkStatusChange={handleBulkStatusChange}
      handleBulkDelete={handleBulkDelete}
      showRejectionReason={false}
    />
  );
};

export default DaijeSection;
