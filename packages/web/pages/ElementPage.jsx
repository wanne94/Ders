import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  Checkbox,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { jwtDecode } from 'jwt-decode';
import PageLayout from '@/components/PageLayout';
import ContentContainer from '@/components/ContentContainer';
import UniversalCard from '@/components/UniversalCard';
import SelectableCard from '@/components/SelectableCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import LectureFormNew from '@/components/LectureFormNew';
import UnifiedFormNew from '@/components/UnifiedFormNew';
import LecturesSection from '@/components/LecturesSection';
import BulkActionsToolbar from '@/components/BulkActionsToolbar';
import AuthPromptDialog from '@/components/AuthPromptDialog';
import { safeApiCall, normalizeToArray } from '@/utils/dataHelpers';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';
import { useDebounce } from '@ders-ba/shared';
import { DaijeGrid, LecturesGrid, OrganizationsGrid } from '@/components/GridLayout';
import predavanjaService from '@/services/predavanjaService';
import daijeService from '@/services/daijeService';
import udruzenjaService from '@/services/udruzenjaService';
import { useAuthCheck } from '@/utils/useAuthCheck';

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
    statusFilter: 'all', // 'all', 'active', 'cancelled'
    selectedItems: [],
    isAllSelected: false,
    isAdmin: false
  });
  
  const itemsPerPage = 20;
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
  
  // Destructure for easier access
  const { items, isLoading, error, searchTerm, page, isFormOpen, statusFilter, selectedItems, isAllSelected, isAdmin } = state;

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

  const {
    authPromptOpen,
    checkAuthAndExecute,
    handleAuthPromptClose,
    handleGoToAuth,
  } = useAuthCheck();

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
          let isAdminUser = false;
          if (token) {
            try {
              const decodedUser = jwtDecode(token);
              isAdminUser = decodedUser.role === 'admin' || decodedUser.role === 'super_admin';
              setState(prev => ({ ...prev, isAdmin: isAdminUser }));
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
          
          if (isAdminUser) {
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
    checkAuthAndExecute(() => {
      setState(prev => ({ ...prev, isFormOpen: true }));
    });
  }, [checkAuthAndExecute]);

  const handleFormClose = useCallback(() => {
    setState(prev => ({ ...prev, isFormOpen: false }));
  }, []);

  const handleFormSuccess = useCallback(() => {
    setState(prev => ({ ...prev, isFormOpen: false }));
    fetchData();
  }, [fetchData]);

  // Bulk selection handlers
  const handleSelectItem = useCallback((itemId) => {
    setState(prev => {
      const newSelectedItems = prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId];
      
      return {
        ...prev,
        selectedItems: newSelectedItems,
        isAllSelected: false
      };
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setState(prev => {
      if (prev.isAllSelected) {
        return { ...prev, selectedItems: [], isAllSelected: false };
      } else {
        const currentPageIds = currentItems.map(item => item._id);
        return { ...prev, selectedItems: currentPageIds, isAllSelected: true };
      }
    });
  }, [currentItems]);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: [], isAllSelected: false }));
  }, []);

  // Bulk action handlers
  const handleBulkApprove = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      let response;
      switch(type) {
        case 'lectures':
          response = await predavanjaService.bulkApprove(selectedItems);
          break;
        case 'daije':
          response = await daijeService.bulkApprove(selectedItems);
          break;
        case 'organizations':
          response = await udruzenjaService.bulkApprove(selectedItems);
          break;
      }
      
      clearSelection();
      fetchData(); // Refresh data
      
      // Show success message
      alert(response.message || 'Successfully approved items');
    } catch (error) {
      console.error('Bulk approve error:', error);
      alert('Error approving items');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [selectedItems, type, clearSelection, fetchData]);

  const handleBulkReject = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      let response;
      switch(type) {
        case 'lectures':
          response = await predavanjaService.bulkReject(selectedItems);
          break;
        case 'daije':
          response = await daijeService.bulkReject(selectedItems);
          break;
        case 'organizations':
          response = await udruzenjaService.bulkReject(selectedItems);
          break;
      }
      
      clearSelection();
      fetchData(); // Refresh data
      
      // Show success message
      alert(response.message || 'Successfully rejected items');
    } catch (error) {
      console.error('Bulk reject error:', error);
      alert('Error rejecting items');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [selectedItems, type, clearSelection, fetchData]);

  const handleBulkDelete = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      let response;
      switch(type) {
        case 'lectures':
          response = await predavanjaService.bulkDelete(selectedItems);
          break;
        case 'daije':
          response = await daijeService.bulkDelete(selectedItems);
          break;
        case 'organizations':
          response = await udruzenjaService.bulkDelete(selectedItems);
          break;
      }
      
      clearSelection();
      fetchData(); // Refresh data
      
      // Show success message
      alert(response.message || 'Successfully deleted items');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Error deleting items');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [selectedItems, type, clearSelection, fetchData]);

  // Get the appropriate form component based on type
  const getFormComponent = () => {
    switch (type) {
      case 'lectures':
        return (
          <LectureFormNew
            open={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        );
      case 'daije':
        return (
          <UnifiedFormNew
            type="daija"
            open={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        );
      case 'organizations':
        return (
          <UnifiedFormNew
            type="organization"
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

  // Get canonical URL and meta tags
  const getCanonicalUrl = () => {
    const baseUrl = 'https://ders.ba';
    switch (type) {
      case 'lectures':
        return `${baseUrl}/lectures`;
      case 'daije':
        return `${baseUrl}/daije`;
      case 'organizations':
        return `${baseUrl}/organizations`;
      default:
        return baseUrl;
    }
  };

  // Determine if current page should be indexed
  const shouldIndex = page === 1;

  return (
    <>
      <Head>
        {/* Add noindex for paginated pages (page > 1) */}
        {!shouldIndex && (
          <meta name="robots" content="noindex, follow" />
        )}
        
        {/* Canonical URL always points to the first page */}
        <link rel="canonical" href={getCanonicalUrl()} />
        
        {/* Add prev/next for pagination SEO */}
        {page > 1 && (
          <link rel="prev" href={`${getCanonicalUrl()}?page=${page - 1}`} />
        )}
        {page < totalPages && (
          <link rel="next" href={`${getCanonicalUrl()}?page=${page + 1}`} />
        )}
      </Head>
      <PageLayout sx={{ paddingTop: '20px' }}>
        <ContentContainer>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {config.title}
            </Typography>
          </Box>

          {/* Bulk Actions Toolbar for Admin */}
          {isAdmin && (
            <BulkActionsToolbar
              selectedCount={selectedItems.length}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
              onDelete={handleBulkDelete}
              onClear={clearSelection}
              type={type}
            />
          )}

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Select All Checkbox for Admin */}
        {isAdmin && currentItems.length > 0 && (
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={isAllSelected}
              indeterminate={selectedItems.length > 0 && selectedItems.length < currentItems.length}
              onChange={handleSelectAll}
            />
            <Typography variant="body2">
              Selektuj sve
            </Typography>
          </Box>
        )}
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
                  <SelectableCard
                    key={item._id}
                    data={item}
                    isSelected={selectedItems.includes(item._id)}
                    onSelect={handleSelectItem}
                    isAdmin={isAdmin}
                  />
                ))}
              </DaijeGrid>
            )}
            {type === 'organizations' && (
              <OrganizationsGrid>
                {currentItems.map((item) => (
                  <SelectableCard
                    key={item._id}
                    data={item}
                    isSelected={selectedItems.includes(item._id)}
                    onSelect={handleSelectItem}
                    isAdmin={isAdmin}
                  />
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

      <AuthPromptDialog
        open={authPromptOpen}
        onClose={handleAuthPromptClose}
        onGoToAuth={handleGoToAuth}
        title="Prijava potrebna"
        message="Morate biti prijavljeni da biste dodali novi sadržaj."
      />
        </ContentContainer>
      </PageLayout>
    </>
  );
};

export default ElementPage; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}
