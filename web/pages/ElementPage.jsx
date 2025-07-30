import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { jwtDecode } from 'jwt-decode';
import PageLayout from '@/components/PageLayout';
import UniversalCard from '@/components/UniversalCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import LectureForm from '@/components/LectureForm';
import DaijaForm from '@/components/DaijaForm';
import OrganizationForm from '@/components/OrganizationForm';
import LecturesSection from '@/components/LecturesSection';
import { safeApiCall, normalizeToArray } from '@/utils/dataHelpers';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';
import { useDebounce } from '@/utils/useDebounce';
import { DaijeGrid, LecturesGrid, OrganizationsGrid } from '@/components/GridLayout';
import predavanjaService from '@/services/predavanjaService';
import daijeService from '@/services/daijeService';
import udruzenjaService from '@/services/udruzenjaService';

const ElementPage = ({ type }) => {
  const router = useRouter();
  
  // Combined state for better performance
  const [state, setState] = useState({
    items: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    page: 1,
    isFormOpen: false,
    statusFilter: 'all' // 'all', 'active', 'cancelled'
  });
  
  const itemsPerPage = 20;
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
  
  // Destructure for easier access
  const { items, isLoading, error, searchTerm, page, isFormOpen, statusFilter } = state;

  // Memoized configuration based on type
  const config = useMemo(() => {
    switch (type) {
      case 'lectures':
        return {
          title: 'Dersovi',
          expectedType: 'Predavanje'
        };
      case 'daije':
        return {
          title: 'Daije',
          expectedType: 'Daija'
        };
      case 'organizations':
        return {
          title: 'Udruženja',
          expectedType: 'Udruženje'
        };
      default:
        return null;
    }
  }, [type]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let response;
      switch (type) {
        case 'lectures':
          // Use the same endpoint as dashboard - get ALL lectures
          console.log('🔍 [ElementPage] Fetching ALL lectures (same as dashboard)');
          // Check if user is admin
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          let isAdmin = false;
          if (token) {
            try {
              const decodedUser = jwtDecode(token);
              isAdmin = decodedUser.role === 'admin' || decodedUser.role === 'super_admin';
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
          
          if (isAdmin) {
            // For admin users, use admin endpoint (same as dashboard)
            response = await safeApiCall(() => predavanjaService.getAllPredavanjaForAdmin(), []);
            console.log('📊 [ElementPage] Admin: Received ALL lectures:', response.length);
          } else {
            // For regular users, use public endpoint
            console.log('🔍 [ElementPage] Calling getAllPredavanja with status=all');
            response = await safeApiCall(() => predavanjaService.getAllPredavanja(1, 1000, 'all'), []);
            console.log('📊 [ElementPage] Public: Received lectures:', response.length);
            console.log('🔍 [ElementPage] Sample lectures:', response.slice(0, 3));
          }
          
          const cancelledCount = response.filter(l => l.status === 'cancelled' || l.isCancelled).length;
          console.log('❌ [ElementPage] Cancelled lectures count:', cancelledCount);
          
          // Debug: Check for Diskriminacija lecture specifically
          const diskriminacijaLecture = response.find(l => l.title && l.title.toLowerCase().includes('diskriminacija'));
          if (diskriminacijaLecture) {
            console.log('🔍 [ElementPage] Found Diskriminacija lecture:', {
              title: diskriminacijaLecture.title,
              status: diskriminacijaLecture.status,
              isCancelled: diskriminacijaLecture.isCancelled,
              hasStatus: 'status' in diskriminacijaLecture,
              hasIsCancelled: 'isCancelled' in diskriminacijaLecture
            });
          } else {
            console.log('❌ [ElementPage] Diskriminacija lecture NOT found in response');
          }
          break;
        case 'daije':
          response = await safeApiCall(() => daijeService.getAllDaije(), []);
          break;
        case 'organizations':
          response = await safeApiCall(() => udruzenjaService.getAllUdruzenja(), []);
          break;
        default:
          response = [];
      }
      
      const normalizedData = normalizeToArray(response);
      
      // Debug raw response
      if (type === 'lectures') {
        console.log('🎯 [ElementPage] Raw response:', response);
        console.log('🎯 [ElementPage] Normalized data:', normalizedData);
        const cancelledInRaw = normalizedData.filter(l => l.status === 'cancelled' || l.isCancelled).length;
        console.log('❌ [ElementPage] Cancelled in raw response:', cancelledInRaw);
        if (cancelledInRaw > 0) {
          console.log('❌ [ElementPage] Sample cancelled lecture:', normalizedData.find(l => l.status === 'cancelled' || l.isCancelled));
        }
      }
      
      // Add type field based on the page type
      const dataWithType = normalizedData.map(item => ({
        ...item,
        type: config.expectedType
      }));
      
      // Debug log for type='lectures'
      if (type === 'lectures') {
        console.log('🔍 [ElementPage] Data with type added:', dataWithType.length);
        const cancelledInData = dataWithType.filter(l => l.status === 'cancelled' || l.isCancelled).length;
        console.log('❌ [ElementPage] Cancelled in dataWithType:', cancelledInData);
      }
      
      setState(prev => ({ ...prev, items: dataWithType }));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setState(prev => ({ ...prev, error: `Greška pri dohvaćanju ${config.title.toLowerCase()}` }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [type, config?.title, config?.expectedType]);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Debug log before filtering
    if (type === 'lectures') {
      console.log('🔍 [ElementPage] Items before filtering:', items.length);
      const cancelledBeforeFilter = items.filter(l => l.status === 'cancelled' || l.isCancelled).length;
      console.log('❌ [ElementPage] Cancelled before filtering:', cancelledBeforeFilter);
    }

    // Filter by type first
    filtered = filtered.filter(item => {
      switch (type) {
        case 'lectures':
          return item.type === 'Predavanje';
        case 'daije':
          return item.type === 'Daija';
        case 'organizations':
          return item.type === 'Udruženje';
        default:
          return true;
      }
    });

    // Debug log after type filtering
    if (type === 'lectures') {
      console.log('🔍 [ElementPage] Items after type filtering:', filtered.length);
      const cancelledAfterFilter = filtered.filter(l => l.status === 'cancelled' || l.isCancelled).length;
      console.log('❌ [ElementPage] Cancelled after type filtering:', cancelledAfterFilter);
    }

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableFields = [];
        
        switch (item.type) {
          case 'Predavanje':
            searchableFields.push(
              item.title,
              item.speaker,
              item.organization,
              item.city,
              item.address,
              item.shortDescription
            );
            break;
          case 'Daija':
            searchableFields.push(
              item.name,
              item.title,
              item.biography,
              item.shortDescription,
              (item.education || []).join(' ')
            );
            break;
          case 'Udruženje':
            searchableFields.push(
              item.name,
              item.description,
              item.shortDescription,
              item.city,
              item.address
            );
            break;
        }
        
        return searchableFields
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(searchLower));
      });
    }

    // Apply status filter for lectures
    if (type === 'lectures' && statusFilter !== 'all') {
      if (statusFilter === 'cancelled') {
        filtered = filtered.filter(item => item.status === 'cancelled' || item.isCancelled === true);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(item => item.status === 'approved' && item.isCancelled !== true);
      }
    }

    // Apply sorting for lectures
    if (type === 'lectures') {
      filtered = sortLecturesByStatus(filtered);
    }

    return filtered;
  }, [items, debouncedSearchTerm, type, statusFilter]);

  // Reset page when search changes
  useEffect(() => {
    setState(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm]);

  // Effects
  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [type, config, fetchData]);

  // Memoized pagination
  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentItems: filteredItems.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredItems.length / itemsPerPage)
    };
  }, [filteredItems, page, itemsPerPage]);

  const handlePageChange = useCallback((event, value) => {
    setState(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchChange = useCallback((event) => {
    setState(prev => ({ ...prev, searchTerm: event.target.value }));
  }, []);

  const handleStatusFilterChange = useCallback((event) => {
    setState(prev => ({ ...prev, statusFilter: event.target.value, page: 1 }));
  }, []);

  const handleAddClick = useCallback(() => {
    setState(prev => ({ ...prev, isFormOpen: true }));
  }, []);

  const handleFormClose = useCallback(() => {
    setState(prev => ({ ...prev, isFormOpen: false }));
  }, []);

  const handleFormSuccess = useCallback(() => {
    setState(prev => ({ ...prev, isFormOpen: false }));
    fetchData();
  }, [fetchData]);

  // Get the appropriate form component based on type
  const getFormComponent = () => {
    switch (type) {
      case 'lectures':
        return (
          <LectureForm
            open={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        );
      case 'daije':
        return (
          <DaijaForm
            open={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        );
      case 'organizations':
        return (
          <OrganizationForm
            open={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        );
      default:
        return null;
    }
  };

  if (!config) {
    return (
      <PageLayout>
        <Alert severity="error">Nepoznat tip stranice</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout sx={{ paddingTop: '20px' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {config.title}
        </Typography>
      </Box>

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          fullWidth={type !== 'lectures'}
          variant="outlined"
          placeholder="Pretraži..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flex: type === 'lectures' ? 1 : 'auto' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Status filter for lectures */}
        {type === 'lectures' && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Prikaži</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Prikaži"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Sva predavanja</MenuItem>
              <MenuItem value="active">Aktivna predavanja</MenuItem>
              <MenuItem value="cancelled">Otkazana predavanja</MenuItem>
            </Select>
          </FormControl>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ 
            whiteSpace: 'nowrap',
            px: 5,
            py: 1
          }}
        >
          Dodaj
        </Button>
      </Box>

      {/* Content */}
      {type === 'lectures' ? (
        <LecturesSection 
          lectures={currentItems}
          isLoading={isLoading}
          title={config.title}
          emptyMessage={
            debouncedSearchTerm
              ? 'Nema rezultata za vašu pretragu'
              : `Nema dostupnih ${config.title.toLowerCase()}`
          }
        />
      ) : (
        isLoading ? (
          <SkeletonGrid 
            count={12} 
            type={type === 'daije' ? 'daija' : 'organization'} 
          />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !currentItems.length ? (
          <Alert severity="info">
            {debouncedSearchTerm
              ? 'Nema rezultata za vašu pretragu'
              : `Nema dostupnih ${config.title.toLowerCase()}`}
          </Alert>
        ) : (
          <>
            {type === 'daije' && (
              <DaijeGrid>
                {currentItems.map((item) => (
                  <Box key={item._id} sx={{ height: '200px' }}>
                    <UniversalCard data={item} />
                  </Box>
                ))}
              </DaijeGrid>
            )}
            {type === 'organizations' && (
              <OrganizationsGrid>
                {currentItems.map((item) => (
                  <Box key={item._id} sx={{ height: '200px' }}>
                    <UniversalCard data={item} />
                  </Box>
                ))}
              </OrganizationsGrid>
            )}
          </>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Form Dialog */}
      {getFormComponent()}
    </PageLayout>
  );
};

export default ElementPage; 