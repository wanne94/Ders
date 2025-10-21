import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DataSection from './DataSection';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Rejected section component for dashboard
 * Displays rejected lectures, daije and organizations (super admin only)
 */
const RejectedSection = ({
  lectures,
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
  handleCancelLecture,
  handleStatusChange,
  handleBulkStatusChange,
  handleBulkDelete,
  currentUser,
  setActiveSection
}) => {
  // Only super admin can view rejected items
  if (currentUser?.role !== 'super_admin') {
    setActiveSection('predavanja');
    return null;
  }

  // Filter rejected items
  const rejectedLectures = filterData(
    (lectures || []).filter(l => l.status === 'rejected'),
    searchQueries.lectures,
    'lecture',
    activeFilters
  );

  const rejectedDaije = filterData(
    (daije || []).filter(d => d.status === 'rejected'),
    searchQueries.lectures,
    'daija',
    activeFilters
  );

  const rejectedOrganizations = filterData(
    (organizations || []).filter(o => o.status === 'rejected'),
    searchQueries.lectures,
    'organization',
    activeFilters
  );

  const hasNoRejectedItems =
    rejectedLectures.length === 0 &&
    rejectedDaije.length === 0 &&
    rejectedOrganizations.length === 0;

  return (
    <Box>
      {rejectedLectures.length > 0 && (
        <DataSection
          title="Odbačena predavanja"
          items={rejectedLectures}
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
          showRejectionReason={true}
        />
      )}

      {rejectedDaije.length > 0 && (
        <DataSection
          title="Odbačene Daije"
          items={rejectedDaije}
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
          showRejectionReason={true}
        />
      )}

      {rejectedOrganizations.length > 0 && (
        <DataSection
          title="Odbačena udruženja"
          items={rejectedOrganizations}
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
          showRejectionReason={true}
        />
      )}

      {hasNoRejectedItems && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography color="text.secondary" variant="h6">
            Nema odbačenih stavki
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default RejectedSection;
