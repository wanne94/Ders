import { useState, useEffect } from 'react';
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
import PageLayout from '../components/PageLayout';
import UniversalCard from '../components/UniversalCard';
import LectureForm from '../components/LectureForm';
import DaijaForm from '../components/DaijaForm';
import OrganizationForm from '../components/OrganizationForm';
import { safeApiCall, normalizeToArray } from '../utils/dataHelpers';
import { useDebounce } from '../utils/useDebounce';
import { DaijeGrid, LecturesGrid, OrganizationsGrid } from '@/components/GridLayout';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';

const ElementPage = ({ type }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const itemsPerPage = 20;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Configuration based on type
  const getConfig = () => {
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
  };

  const config = getConfig();

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
      
      setItems(dataWithType);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Greška pri dohvaćanju ${config.title.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on type and search
  const filterItems = () => {
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

    setFilteredItems(filtered);
    setPage(1); // Reset to first page when filtering
  };

  // Effects
  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [type]);

  useEffect(() => {
    filterItems();
  }, [items, debouncedSearchTerm]);

  // Pagination
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchData();
  };

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
          Dodaj novo
        </Button>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
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