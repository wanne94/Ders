import React from 'react';
import { Box, Typography } from '@mui/material';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Approval section component for dashboard
 * Displays pending daije and organizations waiting for approval
 */
const ApprovalSection = ({
  daije,
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
  // Filter pending daije
  const pendingDaije = filterData(
    (daije || []).filter(d => d.status === 'pending'),
    searchQueries.lectures,
    'daija',
    activeFilters
  );

  // Filter pending organizations
  const pendingOrganizations = filterData(
    (organizations || []).filter(o => o.status === 'pending'),
    searchQueries.lectures,
    'organization',
    activeFilters
  );

  const hasNoPendingItems = pendingDaije.length === 0 && pendingOrganizations.length === 0;

  return (
    <>
      {pendingDaije.length > 0 && (
        <DataSection
          title="Daije za odobrenje"
          items={pendingDaije}
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
      )}

      {pendingOrganizations.length > 0 && (
        <DataSection
          title="Udruženja za odobrenje"
          items={pendingOrganizations}
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
      )}

      {hasNoPendingItems && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Nema sadržaja za odobrenje
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ApprovalSection;
