import React from 'react';
import { Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '@/components/DataTable';
import { filterData } from '@/utils/dashboardFilters';

/**
 * Cancellation Reports section component for dashboard
 * Displays lecture cancellation reports with summary statistics
 */
const CancellationReportsSection = ({
  cancellationReports,
  searchQueries,
  handleSearchChange,
  activeFilters,
  isAdmin,
  setCancellationItem,
  openDialog
}) => {
  const filteredReports = filterData(
    cancellationReports?.lectures || [],
    searchQueries.lectures,
    'lecture',
    activeFilters
  );

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Prijave za otkazivanje
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'warning.light', color: 'warning.dark' }}>
          <Typography variant="h6">{cancellationReports?.total || 0}</Typography>
          <Typography variant="body2">Ukupno prijava</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.dark' }}>
          <Typography variant="h6">{cancellationReports?.pending || 0}</Typography>
          <Typography variant="body2">Na čekanju</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography variant="h6">{cancellationReports?.autoCancelled || 0}</Typography>
          <Typography variant="body2">Automatski otkazano</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: 'grey.300', color: 'grey.800' }}>
          <Typography variant="h6">{cancellationReports?.manuallyCancelled || 0}</Typography>
          <Typography variant="body2">Ručno otkazano</Typography>
        </Paper>
      </Box>

      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Pretraži predavanja"
          value={searchQueries.lectures || ''}
          onChange={(e) => handleSearchChange('lectures', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      {filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography color="text.secondary">
            Nema prijava za otkazivanje
          </Typography>
        </Paper>
      ) : (
        <DataTable
          data={filteredReports}
          type="cancellation-reports"
          onEdit={(item) => {
            setCancellationItem(item);
            openDialog('manageCancellationDialog');
          }}
          onCancel={(item) => {
            setCancellationItem(item);
            openDialog('manageCancellationDialog');
          }}
          hideActions={!isAdmin}
          showActions={true}
          showStatus={false}
        />
      )}
    </Box>
  );
};

export default CancellationReportsSection;
