import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import DataTable from '@/components/DataTable';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Suggestions section component for dashboard
 * Displays active and archived suggestions with tab navigation
 */
const SuggestionsSection = ({
  suggestions,
  archivedSuggestions,
  searchQueries,
  activeFilters,
  isAdmin,
  canDelete,
  handleArchiveSuggestion,
  handleDeleteSuggestion,
  handleBulkDelete
}) => {
  const [activeSubsection, setActiveSubsection] = useState('aktivni');

  // Filter suggestions
  const activeSuggestions = filterData(
    (suggestions || []).filter(s => s.status !== 'archived'),
    searchQueries.lectures,
    'suggestion',
    activeFilters
  );

  const filteredArchivedSuggestions = filterData(
    archivedSuggestions || [],
    searchQueries.lectures,
    'suggestion',
    activeFilters
  );

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Prijedlozi
      </Typography>

      {/* Subsection Navigation */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={activeSubsection === 'aktivni' ? 'contained' : 'text'}
            onClick={() => setActiveSubsection('aktivni')}
            sx={{
              borderRadius: '8px 8px 0 0',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Aktivni prijedlozi ({activeSuggestions.length})
          </Button>
          <Button
            variant={activeSubsection === 'arhivirani' ? 'contained' : 'text'}
            onClick={() => setActiveSubsection('arhivirani')}
            sx={{
              borderRadius: '8px 8px 0 0',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Arhivirani prijedlozi ({filteredArchivedSuggestions.length})
          </Button>
        </Box>
      </Box>

      {/* Content based on active subsection */}
      {activeSubsection === 'aktivni' ? (
        activeSuggestions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
            <Typography color="text.secondary" variant="h6">
              Nema aktivnih prijedloga
            </Typography>
          </Paper>
        ) : (
          <DataTable
            data={activeSuggestions}
            type="suggestions"
            onArchive={handleArchiveSuggestion}
            onDelete={canDelete ? (item) => handleDeleteSuggestion(item, false) : undefined}
            onBulkDelete={canDelete ? handleBulkDelete : undefined}
            hideActions={!isAdmin}
            showActions={true}
            showStatus={false}
          />
        )
      ) : (
        filteredArchivedSuggestions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
            <Typography color="text.secondary" variant="h6">
              Nema arhiviranih prijedloga
            </Typography>
          </Paper>
        ) : (
          <DataTable
            data={filteredArchivedSuggestions}
            type="suggestions"
            onDelete={canDelete ? (item) => handleDeleteSuggestion(item, true) : undefined}
            onBulkDelete={canDelete ? handleBulkDelete : undefined}
            hideActions={!isAdmin}
            showActions={true}
            showStatus={false}
          />
        )
      )}
    </Box>
  );
};

export default SuggestionsSection;
