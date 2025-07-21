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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PageLayout from '@/components/PageLayout';
import UniversalCard from '@/components/UniversalCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import LectureForm from '@/components/LectureForm';
import DaijaForm from '@/components/DaijaForm';
import OrganizationForm from '@/components/OrganizationForm';
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
    isFormOpen: false
  });
  
  const itemsPerPage = 20;
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
  
  // Destructure for easier access
  const { items, isLoading, error, searchTerm, page, isFormOpen } = state;

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
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
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
      
      // Add type field based on the page type
      const dataWithType = normalizedData.map(item => ({
        ...item,
        type: config.expectedType
      }));
      
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

    // Apply sorting for lectures
    if (type === 'lectures') {
      filtered = sortLecturesByStatus(filtered);
    }

    return filtered;
  }, [items, debouncedSearchTerm, type]);

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
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pretraži..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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
      {isLoading ? (
        <SkeletonGrid 
          count={12} 
          type={type === 'lectures' ? 'lecture' : type === 'daije' ? 'daija' : 'organization'} 
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
          {type === 'lectures' && (
            <LecturesGrid>
              {currentItems.map((item) => (
                <Box key={item._id} sx={{ height: '300px' }}>
                  <UniversalCard data={item} />
                </Box>
              ))}
            </LecturesGrid>
          )}
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