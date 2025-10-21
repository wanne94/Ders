import React from 'react';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Organizations section component for dashboard
 * Displays all organizations
 */
const OrganizationsSection = ({
  organizations,
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
  const filteredOrganizations = filterData(
    organizations || [],
    searchQueries.lectures,
    'organization',
    activeFilters
  );

  return (
    <DataSection
      title="Udruženja"
      items={filteredOrganizations}
      type="organization"
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

export default OrganizationsSection;
