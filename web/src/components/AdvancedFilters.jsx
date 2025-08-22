import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Stack,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Badge
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const AdvancedFilters = ({
  open,
  onClose,
  onApply,
  data = [],
  filterConfig = {},
  currentFilters = {}
}) => {
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    status: '',
    city: '',
    organization: '',
    speaker: '',
    hasImage: null,
    sortBy: 'date',
    sortOrder: 'desc',
    ...currentFilters
  });

  // Extract unique values for filters
  const getUniqueValues = (key) => {
    const values = data.map(item => item[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const cities = getUniqueValues('city');
  const organizations = getUniqueValues('organization');
  const speakers = getUniqueValues('speaker');
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

  // Update filter state
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilters = {
      dateFrom: null,
      dateTo: null,
      status: '',
      city: '',
      organization: '',
      speaker: '',
      hasImage: null,
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
  };

  // Apply filters
  const handleApply = () => {
    // Remove empty values
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onApply(activeFilters);
    onClose();
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      value => value !== null && value !== '' && value !== undefined && 
      !['sortBy', 'sortOrder'].includes(value)
    ).length;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Na čekanju',
      approved: 'Odobreno',
      rejected: 'Odbačeno',
      cancelled: 'Otkazano'
    };
    return labels[status] || status;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Napredni filteri</Typography>
            {getActiveFilterCount() > 0 && (
              <Chip
                label={`${getActiveFilterCount()} aktivno`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Date filters */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Datum
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Datum od"
                    value={filters.dateFrom}
                    onChange={(value) => handleFilterChange('dateFrom', value)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Datum do"
                    value={filters.dateTo}
                    onChange={(value) => handleFilterChange('dateTo', value)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Status filter */}
          {filterConfig.showStatus !== false && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">
                    <em>Svi</em>
                  </MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* City filter */}
          {cities.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={cities}
                value={filters.city}
                onChange={(e, value) => handleFilterChange('city', value || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Grad" size="small" />
                )}
                size="small"
              />
            </Grid>
          )}

          {/* Organization filter */}
          {organizations.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={organizations}
                value={filters.organization}
                onChange={(e, value) => handleFilterChange('organization', value || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Organizacija" size="small" />
                )}
                size="small"
              />
            </Grid>
          )}

          {/* Speaker filter */}
          {filterConfig.showSpeaker !== false && speakers.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={speakers}
                value={filters.speaker}
                onChange={(e, value) => handleFilterChange('speaker', value || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Predavač" size="small" />
                )}
                size="small"
                freeSolo
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Additional filters */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Dodatni filteri
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasImage === true}
                    onChange={(e) => handleFilterChange('hasImage', e.target.checked ? true : null)}
                  />
                }
                label="Samo sa slikom"
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Sort options */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Sortiranje
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sortiraj po</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Sortiraj po"
                  >
                    <MenuItem value="date">Datum</MenuItem>
                    <MenuItem value="title">Naslov</MenuItem>
                    <MenuItem value="city">Grad</MenuItem>
                    <MenuItem value="createdAt">Datum kreiranja</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Redosled</InputLabel>
                  <Select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    label="Redosled"
                  >
                    <MenuItem value="asc">Uzlazno (A-Z, 1-9)</MenuItem>
                    <MenuItem value="desc">Silazno (Z-A, 9-1)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleReset}
          startIcon={<ClearIcon />}
          color="inherit"
        >
          Poništi sve
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} color="inherit">
          Otkaži
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          startIcon={<FilterListIcon />}
        >
          Primjeni ({getActiveFilterCount()})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Filter button component
export const FilterButton = ({ onClick, activeCount = 0, ...props }) => {
  return (
    <IconButton onClick={onClick} {...props}>
      <Badge badgeContent={activeCount} color="primary">
        <FilterListIcon />
      </Badge>
    </IconButton>
  );
};

export default AdvancedFilters;