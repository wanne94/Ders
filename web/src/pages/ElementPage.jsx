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
import LectureCard from '../components/LectureCard';
import DaijaCard from '../components/DaijaCard';
import OrganizationCompactCard from '../components/OrganizationCompactCard';
import LectureForm from '../components/LectureForm';
import DaijaForm from '../components/DaijaForm';
import OrganizationForm from '../components/OrganizationForm';
import { LecturesGrid, DaijeGrid, OrganizationsGrid } from '../components/GridLayout';
import axiosInstance from '../utils/axiosConfig';
import { safeApiCall, normalizeToArray, sortLecturesByDateProximity } from '../utils/dataHelpers';

const ElementPage = ({ type }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allLectures, setAllLectures] = useState([]); // Cache lectures for count calculations
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const itemsPerPage = 20;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Configuration based on type
  const getConfig = () => {
    switch (type) {
      case 'lectures':
        return {
          title: 'Dersovi',
          apiEndpoint: '/lectures/dashboard/public',
          CardComponent: LectureCard,
          searchFields: ['title', 'speaker', 'organization', 'address', 'city']
        };
      case 'daije':
        return {
          title: 'Daije',
          apiEndpoint: '/daije',
          CardComponent: DaijaCard,
          searchFields: ['firstName', 'lastName', 'specialization', 'city']
        };
      case 'organizations':
        return {
          title: 'Udruženja',
          apiEndpoint: '/organizations',
          CardComponent: OrganizationCompactCard,
          searchFields: ['name', 'shortDescription', 'address', 'city']
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

      const endpoint = config.apiEndpoint;

      const response = await safeApiCall(
        () => axiosInstance.get(endpoint),
        []
      );

      const normalizedData = normalizeToArray({ data: response });
      
      // For daije and organizations, fetch lecture counts if not already included
      if (type === 'daije' || type === 'organizations') {
        // Fetch all lectures only if not already cached or if this is the first load
        let lectures = allLectures;
        if (lectures.length === 0) {
          const lecturesResponse = await safeApiCall(
            () => axiosInstance.get('/lectures'),
            []
          );
          lectures = normalizeToArray({ data: lecturesResponse });
          setAllLectures(lectures); // Cache for future use
        }
        
        // Add lecture counts to items
        const itemsWithCounts = normalizedData.map(item => {
          let lectureCount = 0;
          if (type === 'daije') {
            lectureCount = lectures.filter(lecture => 
              lecture.daija === item._id || lecture.daijaId === item._id
            ).length;
          } else if (type === 'organizations') {
            lectureCount = lectures.filter(lecture => 
              lecture.organizationId === item._id
            ).length;
          }
          return { ...item, lectureCount };
        });
        
        setItems(itemsWithCounts);
      } else {
        // Sort lectures by date proximity
        if (type === 'lectures') {
          const sortedData = sortLecturesByDateProximity(normalizedData);
          setItems(sortedData);
          setAllLectures(sortedData); // Cache lectures
        } else {
          setItems(normalizedData);
        }
      }

    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Greška pri dohvaćanju ${config.title.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search only
  const filterItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        config.searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchLower);
        })
      );
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
    // Refresh data after successful form submission
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
      <PageLayout 
        maxWidth="xl"
        disableGutters
        containerSx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          textAlign: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity="error">Nepoznat tip stranice</Alert>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout 
        maxWidth="xl"
        disableGutters
        containerSx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          textAlign: 'center',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        maxWidth="xl"
        disableGutters
        containerSx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          textAlign: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      </PageLayout>
    );
  }

  const { CardComponent } = config;

  return (
    <PageLayout 
      maxWidth="xl"
      disableGutters
      containerSx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        textAlign: 'center',
        alignItems: 'center'
      }}
    >
      {/* Header with Title and Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4, 
        width: '100%', 
        maxWidth: 'lg' 
      }}>
        <Typography variant="h4" component="h4" sx={{ textAlign: 'left' }}>
          {config.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="medium"
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          Dodaj
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4, width: '100%', maxWidth: 'lg' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Pretraži ${config.title.toLowerCase()}...`}
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
      </Box>

      {/* Items Grid */}
      {currentItems.length > 0 ? (
        (() => {
          // Choose the appropriate grid component based on type
          const GridComponent = type === 'lectures' ? LecturesGrid : 
                               type === 'daije' ? DaijeGrid : 
                               type === 'organizations' ? OrganizationsGrid : 
                               LecturesGrid;

          return (
            <GridComponent 
              gap={1}
              sx={{
                width: '100%',
              }}
            >
              {currentItems.map((item) => {
                // Determine the correct props based on type
                const getCardProps = () => {
                  switch (type) {
                    case 'lectures':
                      return { lecture: item };
                    case 'daije':
                      // Calculate lecture count from lectures array or use existing count
                      const daijaLectureCount = item.lectures?.length || item.lectureCount || 0;
                      return { daija: item, lectureCount: daijaLectureCount };
                    case 'organizations':
                      // Calculate lecture count from lectures array or use existing count
                      const orgLectureCount = item.lectures?.length || item.lectureCount || 0;
                      return { organization: { ...item, lectureCount: orgLectureCount } };
                    default:
                      return {};
                  }
                };

                return (
                  <Box key={item._id} sx={{ height: type === 'lectures' ? 'auto' : '200px' }}>
                    <CardComponent 
                      {...getCardProps()}
                    />
                  </Box>
                );
              })}
            </GridComponent>
          );
        })()
      ) : (
        <Box sx={{ textAlign: 'center', py: 8, width: '100%', maxWidth: 'lg' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {debouncedSearchTerm ? 'Nema rezultata pretrage' : `Nema ${config.title.toLowerCase()}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {debouncedSearchTerm 
              ? 'Pokušajte sa drugim pojmovima pretrage'
              : `Trenutno nema dostupnih ${config.title.toLowerCase()}`
            }
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, width: '100%', maxWidth: 'lg' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Form Component */}
      {getFormComponent()}
    </PageLayout>
  );
};

export default ElementPage; 