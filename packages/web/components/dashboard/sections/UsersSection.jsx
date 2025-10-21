import React from 'react';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Users section component for dashboard
 * Displays all users in the system
 */
const UsersSection = ({
  users,
  searchQueries,
  handleSearchChange,
  setFiltersOpen,
  activeFilters,
  isAdmin,
  canDelete,
  handleEdit,
  handleDelete,
  handleBulkDelete
}) => {
  const filteredUsers = filterData(
    users || [],
    searchQueries.users,
    'user',
    activeFilters
  );

  return (
    <DataSection
      title="Korisnici"
      items={filteredUsers}
      type="users"
      sectionKey="users"
      searchQueries={searchQueries}
      handleSearchChange={handleSearchChange}
      setFiltersOpen={setFiltersOpen}
      activeFilters={activeFilters}
      isAdmin={isAdmin}
      canDelete={canDelete}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleDuplicate={undefined}
      handleCancelLecture={undefined}
      handleStatusChange={undefined}
      handleBulkStatusChange={undefined}
      handleBulkDelete={handleBulkDelete}
      showRejectionReason={false}
    />
  );
};

export default UsersSection;
