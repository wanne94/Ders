import { useState, useEffect, useCallback, useRef } from 'react';
import ProtectedRoute from '@/utils/ProtectedRoute';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Chip,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PageLayout from '@/components/PageLayout';
import DashSidebar from '@/components/DashSidebar';

import DataTable from '@/components/DataTable';
import Settings from '@/components/dashboard/Settings';
import LectureFormNew from '@/components/LectureFormNew';
import UnifiedFormNew from '@/components/UnifiedFormNew';
// OrganizationForm is now part of UnifiedFormNew
import UserForm from '@/components/UserForm';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import SearchBar from '@/components/SearchBar';
import AdvancedFilters, { FilterButton } from '@/components/AdvancedFilters';

// Dashboard Section Components
import LecturesSection from '@/components/dashboard/sections/LecturesSection';
import UsersSection from '@/components/dashboard/sections/UsersSection';
import DaijeSection from '@/components/dashboard/sections/DaijeSection';
import OrganizationsSection from '@/components/dashboard/sections/OrganizationsSection';
import ApprovalSection from '@/components/dashboard/sections/ApprovalSection';
import RejectedSection from '@/components/dashboard/sections/RejectedSection';
import CancellationReportsSection from '@/components/dashboard/sections/CancellationReportsSection';
import SuggestionsSection from '@/components/dashboard/sections/SuggestionsSection';

// Custom Hooks
import { useDashboardData } from '@/hooks/useDashboardData';

import { predavanjaService, daijeService, udruzenjaService, suggestionsService, usersService, settingsService } from '@/services';
import axiosInstance from '@/utils/axiosConfig';
import { getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDate } from '@/utils/dataHelpers';
import { isValid, parseISO } from 'date-fns';

const Dashboard = () => {
  // ... (ostali stateovi ostaju)

  

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeSection, setActiveSection] = useState('predavanja');
  const [sectionAction, setSectionAction] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });

  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadApprovalSettings = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        
        if (settings.approvalSettings) {
          setApprovalSettings(settings.approvalSettings);
        }
      } catch (error) {
        console.error('Error loading approval settings:', error);
        setApprovalSettings({
          lecture: true,
          daija: true,
          organization: true
        });
      }
    };

    loadApprovalSettings();
  }, []);

  const saveApprovalSettings = async (settingsToSave = null) => {
    try {
      const settings = settingsToSave || approvalSettings;
      await settingsService.updateApprovalSettings(settings);
      showSnackbar('Postavke odobrenja su uspješno spremljene!');
    } catch (error) {
      console.error('Error saving approval settings:', error);
      showSnackbar('Greška pri spremanju postavki odobrenja', 'error');
    }
  };

  const updateApprovalSettings = async (newSettings) => {
    setApprovalSettings(newSettings);
    await saveApprovalSettings(newSettings);
  };

  // Simple setter for the Settings component to avoid immediate saves
  const setApprovalSettingsOnly = (newSettings) => {
    setApprovalSettings(newSettings);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { getToken, getUserData } = require('@/utils/authHelpers');
      const storedToken = getToken();
      const userData = getUserData();

      console.log('📊 Dashboard useEffect: Setting token and user');
      console.log('📊 Stored token:', !!storedToken);
      console.log('📊 User data:', userData);

      setToken(storedToken);

      if (storedToken) {
        try {
          const decodedUser = jwtDecode(storedToken);
          console.log('📊 Decoded user from token:', decodedUser);
          setCurrentUser(decodedUser);
        } catch (error) {
          console.error('Error decoding token:', error);
          setCurrentUser(null);
        }
      }
      setAuthChecked(true);
    }
  }, []);
  
  const canDelete = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isModerator = currentUser?.role === 'moderator';
  const canAccessDashboard = ['moderator', 'admin', 'super_admin'].includes(currentUser?.role);

  // Use custom hook for data fetching and state management
  const { data, counts, ui, fetchData, setData, setCounts, setUi } = useDashboardData(canAccessDashboard, currentUser, token, authChecked);
  const [dialogs, setDialogs] = useState({
    deleteDialog: false,
    statusDialog: false,
    rejectDialog: false,
    addUser: false,
    addOrganization: false,
    addDaija: false,
    addLecture: false,
    manageCancellationDialog: false
  });

  const [rejectReason, setRejectReason] = useState('');
  const [cancellationItem, setCancellationItem] = useState(null);

  // Note: fetchData is now provided by useDashboardData hook
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusChange, setStatusChange] = useState({ item: null, type: '', value: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [lectureToDuplicate, setLectureToDuplicate] = useState(null);
  const [duplicateCountDialogOpen, setDuplicateCountDialogOpen] = useState(false);
  const [itemToDuplicate, setItemToDuplicate] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [editDaijaDialogOpen, setEditDaijaDialogOpen] = useState(false);
  const [daijaToEdit, setDaijaToEdit] = useState(null);
  const [editLectureDialogOpen, setEditLectureDialogOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState(null);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editOrganizationDialogOpen, setEditOrganizationDialogOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState(null);

  const [searchQueries, setSearchQueries] = useState({
    lectures: '',
    users: '',
    daije: '',
    organizations: '',
    suggestions: ''
  });

  const [activeSuggestionsSubsection, setActiveSuggestionsSubsection] = useState('aktivni');
  
  // Advanced filters state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  
  

  // Note: fetchDataCalledRef is now managed by useDashboardData hook

  // Note: filterData is now in utils/dashboardFilters.js and used by section components

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setFiltersOpen(false);
  };
  
  

  const handleSearchChange = (section, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const getTypeFromSection = (section) => {
    const map = {
      korisnici: 'users',
      daije: 'daija',
      predavanja: 'lecture',
      'za-odobrenje': 'lecture',
      'prijave-otkazivanje': 'cancellation-reports',
      organizations: 'organization',
      odbijeno: 'lecture', // Default to lecture for rejected section
      prijedlozi: 'suggestion'
    };
    return map[section] || '';
  };

  const getTypeDisplayName = useCallback((type) => {
    const map = {
      'lecture': 'Predavanje',
      'lectures': 'Predavanje',
      'daija': 'Daija',
      'organization': 'Udruženje',
      'organizations': 'Udruženje',
      'user': 'Korisnik',
      'users': 'Korisnik',
      'suggestion': 'Prijedlog'
    };
    return map[type] || type;
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setUi(prev => ({
      ...prev,
      snackbar: { open: true, message, severity }
    }));
  }, []);

  const closeDialog = useCallback((dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  }, []);

  const openDialog = useCallback((dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
  }, []);

  // Note: Data fetching is now handled by useDashboardData hook

  // Event listener za osvežavanje kada se kreira nova suggestion
  useEffect(() => {
    const handleSuggestionCreated = () => {
      console.log('🔄 Refreshing dashboard after suggestion created');
      fetchData();
    };

    window.addEventListener('suggestionCreated', handleSuggestionCreated);
    
    return () => {
      window.removeEventListener('suggestionCreated', handleSuggestionCreated);
    };
  }, [fetchData]);

  const handleEdit = (item, type) => {
    switch (type) {
      case 'lecture':
      case 'lectures':
        setLectureToEdit(item);
        setEditLectureDialogOpen(true);
        break;
      case 'daija':
      case 'daije':
        setDaijaToEdit(item);
        setEditDaijaDialogOpen(true);
        break;
      case 'organization':
      case 'organizations':
        setOrganizationToEdit(item);
        setEditOrganizationDialogOpen(true);
        break;
      case 'user':
      case 'users':
        setUserToEdit(item);
        setEditUserDialogOpen(true);
        break;
      default:
        console.warn('Unknown edit type:', type);
    }
  };

  const handleDelete = useCallback((item, type) => {
    setSelectedItem({ ...item, type });
    openDialog('deleteDialog');
  }, [openDialog]);

  const handleStatusChange = useCallback((item, newStatus, type) => {
    setStatusChange({ item, type, value: newStatus });
    if (newStatus === 'rejected') {
      openDialog('rejectDialog');
    } else {
      openDialog('statusDialog');
    }
  }, [openDialog]);

  const handleDuplicate = useCallback((item, type) => {
    setItemToDuplicate({ ...item, type });
    setDuplicateCount(1);
    setDuplicateCountDialogOpen(true);
  }, []);
  const handleResetCancellationReports = useCallback(async (item) => {
    console.log('🔄 Resetting cancellation reports for:', item);
    try {
      await axiosInstance.delete(`/lectures/${item._id}/reset-cancellation`);
      
      showSnackbar('Prijave otkazivanja su uspješno poništene');
      await fetchData(); // Refresh podataka
    } catch (error) {
      console.error('Error resetting cancellation reports:', error);
      showSnackbar('Greška pri poništavanju prijava', 'error');
    }
  }, [showSnackbar, fetchData]);

  const handleCancelLecture = useCallback(async (item) => {
    console.log('🚫 handleCancelLecture called with item:', item);
    try {
      const reason = window.prompt('Unesite razlog otkazivanja:');
      
      if (reason === null) {
        // Korisnik je kliknuo Cancel
        return;
      }

      await axiosInstance.post(`/lectures/${item._id}/override-cancellation`, {
        isCancelled: true,
        reason: reason || 'Otkazano od strane administratora'
      });
      
      // Ažuriraj lokalni state
      setData(prev => ({
        ...prev,
        lectures: prev.lectures.map(lecture => 
          lecture._id === item._id 
            ? { ...lecture, isCancelled: true, status: 'cancelled' }
            : lecture
        )
      }));
      
      showSnackbar('Predavanje je uspješno otkazano');
      await fetchData(); // Refresh podataka
    } catch (error) {
      console.error('Error cancelling lecture:', error);
      showSnackbar('Greška pri otkazivanju predavanja', 'error');
    }
  }, [showSnackbar, fetchData]);

  const confirmDelete = useCallback(async () => {
    if (!selectedItem) return;

    try {
      // Use appropriate service for each type
      if (selectedItem.type === 'user' || selectedItem.type === 'users') {
        await usersService.deleteUser(selectedItem._id);
      } else {
        const endpoints = {
          lecture: '/lectures',
          daija: '/daije',
          organization: '/organizations'
        };
        await axiosInstance.delete(`${endpoints[selectedItem.type]}/${selectedItem._id}`);
      }
      
      const dataKey = selectedItem.type === 'daija' ? 'daije' : 
                     selectedItem.type === 'organization' ? 'organizations' : 
                     (selectedItem.type === 'users' || selectedItem.type === 'user') ? 'users' :
                     `${selectedItem.type}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: prev[dataKey].filter(item => item._id !== selectedItem._id)
      }));
      
      showSnackbar(getTypeDisplayName(selectedItem.type) + " je uspješno obrisano");
    } catch (error) {
      console.error('Error deleting:', error);
      showSnackbar('Greška pri brisanju', 'error');
    } finally {
      closeDialog('deleteDialog');
      setSelectedItem(null);
    }
  }, [selectedItem, showSnackbar, closeDialog, getTypeDisplayName]);

  const confirmStatusChange = useCallback(async () => {
    try {
      const endpoints = {
        lecture: '/lectures',
        daija: '/daije',
        organization: '/organizations',
        suggestion: '/suggestions'
      };

      await axiosInstance.patch(
        `${endpoints[statusChange.type]}/${statusChange.item._id}`,
        { status: statusChange.value }
      );
      
      const dataKey = statusChange.type === 'daija' ? 'daije' : 
                     statusChange.type === 'organization' ? 'organizations' : 
                     `${statusChange.type}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: prev[dataKey].map(item => 
          item._id === statusChange.item._id 
            ? { ...item, status: statusChange.value }
            : item
        )
      }));
      
      await fetchData();
      showSnackbar('Status uspješno ažuriran');
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Greška pri ažuriranju statusa', 'error');
      await fetchData();
    } finally {
      closeDialog('statusDialog');
    }
  }, [statusChange, fetchData, showSnackbar, closeDialog]);

  const confirmReject = useCallback(async () => {
    try {
      const endpoints = {
        lecture: '/lectures',
        daija: '/daije',
        organization: '/organizations',
        suggestion: '/suggestions'
      };

      // Pošaljemo status i razlog odbijanja
      await axiosInstance.patch(
        `${endpoints[statusChange.type]}/${statusChange.item._id}`,
        { 
          status: 'rejected',
          rejectionReason: rejectReason.trim() || 'Nije naveden razlog'
        }
      );
      
      const dataKey = statusChange.type === 'daija' ? 'daije' : 
                     statusChange.type === 'organization' ? 'organizations' : 
                     `${statusChange.type}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: prev[dataKey].map(item => 
          item._id === statusChange.item._id 
            ? { ...item, status: 'rejected', rejectionReason: rejectReason.trim() || 'Nije naveden razlog' }
            : item
        )
      }));
      
      await fetchData();
      showSnackbar('Stavka je uspješno odbačena');
    } catch (error) {
      console.error('Error rejecting item:', error);
      showSnackbar('Greška pri odbacivanju stavke', 'error');
      await fetchData();
    } finally {
      closeDialog('rejectDialog');
      setRejectReason('');
    }
  }, [statusChange, rejectReason, fetchData, showSnackbar, closeDialog]);

  const duplicate = async (item, type, count = 1) => {
    const serviceMap = {
      lecture: predavanjaService.createPredavanje,
      organization: udruzenjaService.createUdruzenje,
      daija: daijeService.createDaija
    };
    const keyMap = {
      lecture: 'lectures',
      organization: 'organizations',
      daija: 'daije'
    };
    const defaultImageMap = {
      lecture: getDefaultLectureImage(),
      organization: getDefaultOrganizationImage(),
      daija: getDefaultDaijaImage()
    };
    const results = [];
    for (let i = 0; i < count; i++) {
      let data = { ...item };
      delete data._id;
      delete data.type;
      delete data.createdAt;
      delete data.updatedAt;
      data.status = 'pending';
      // Kopiraj sliku ili postavi default ako nema slike
      if (!data.image) {
        data.image = defaultImageMap[type];
      }
      if (type === 'daija') {
        if (data.name) data.name = `${item.name} (kopija ${i + 1})`;
      } else if (type === 'lecture' && data.title) {
        data.title = `${item.title} (kopija ${i + 1})`;
        // Validacija i logovanje datuma
        if (data.date) {
          console.log('📅 Date before sending:', data.date);
          let parsedDate = null;
          if (typeof data.date === 'string') {
            const iso = parseISO(data.date);
            if (isValid(iso)) {
              parsedDate = iso;
            } else {
              const d = new Date(data.date);
              if (!isNaN(d.getTime())) {
                parsedDate = d;
              }
            }
          } else if (data.date instanceof Date && isValid(data.date)) {
            parsedDate = data.date;
          }
          if (!parsedDate) {
            console.error('❌ Invalid or unrecognized date format:', data.date);
            parsedDate = new Date(); // fallback na danasnji datum
          }
          data.date = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        }
      } else if (type === 'organization' && data.name) {
        data.name = `${item.name} (kopija ${i + 1})`;
      }
      const res = await serviceMap[type](data);
      results.push(res.data || res);
    }
    return { key: keyMap[type], items: results };
  };

  const confirmDuplicate = useCallback(async () => {
    if (!itemToDuplicate || duplicateCount < 1) return;
    try {
      const type = itemToDuplicate.type;
      const { key, items } = await duplicate(itemToDuplicate, type, duplicateCount);
      setData(prev => ({
        ...prev,
        [key]: [...prev[key], ...items]
      }));
      await fetchData();
      showSnackbar(`${duplicateCount} ${getTypeDisplayName(type).toLowerCase()}${duplicateCount > 1 ? 'a' : ''} je uspješno duplirano`);
    } catch (error) {
      console.error('Error duplicating:', error);
      showSnackbar('Greška pri dupliranju', 'error');
      await fetchData();
    } finally {
      setDuplicateCountDialogOpen(false);
      setItemToDuplicate(null);
      setDuplicateCount(1);
    }
  }, [itemToDuplicate, duplicateCount, fetchData, showSnackbar, getTypeDisplayName]);

  const handleAddSuccess = useCallback((newItem, type) => {
    const dataKey = type === 'daija' ? 'daije' : 
                   type === 'organization' ? 'organizations' : 
                   `${type}s`;
    
    setData(prev => {
      const newData = {
        ...prev,
        [dataKey]: [...prev[dataKey], newItem]
      };
      
      return newData;
    });
    
    showSnackbar(getTypeDisplayName(type) + " je uspješno dodano");
    closeDialog(`add${type.charAt(0).toUpperCase() + type.slice(1)}`);
  }, [showSnackbar, closeDialog, getTypeDisplayName]);

  const handleArchiveSuggestion = useCallback(async (suggestion) => {
    try {
      await axiosInstance.patch(`/suggestions/${suggestion._id}`, { status: 'archived' });
      
      setData(prev => ({
        ...prev,
        suggestions: prev.suggestions.filter(s => s._id !== suggestion._id),
        archivedSuggestions: [...prev.archivedSuggestions, { ...suggestion, status: 'archived' }]
      }));

      setCounts(prev => ({
        ...prev,
        pendingSuggestions: Math.max(0, prev.pendingSuggestions - 1)
      }));
      
      showSnackbar('Prijedlog uspješno arhiviran');
    } catch (error) {
      console.error('Error archiving suggestion:', error);
      showSnackbar('Greška pri arhiviranju prijedloga', 'error');
    }
  }, [showSnackbar]);

  const handleDeleteSuggestion = useCallback(async (suggestion, isArchived = false) => {
    try {
      await axiosInstance.delete(`/suggestions/${suggestion._id}`);
      
      if (isArchived) {
        setData(prev => ({
          ...prev,
          archivedSuggestions: prev.archivedSuggestions.filter(s => s._id !== suggestion._id)
        }));
      } else {
        setData(prev => ({
          ...prev,
          suggestions: prev.suggestions.filter(s => s._id !== suggestion._id)
        }));
        
        setCounts(prev => ({
          ...prev,
          pendingSuggestions: Math.max(0, prev.pendingSuggestions - 1)
        }));
      }
      
      showSnackbar('Prijedlog uspješno obrisan');
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      showSnackbar('Greška pri brisanju prijedloga', 'error');
    }
  }, [showSnackbar]);

  const handleBulkStatusChange = useCallback(async (selectedIds, newStatus, itemType = null) => {
    try {
      const endpoints = {
        lecture: '/lectures',
        lectures: '/lectures',
        daija: '/daije',
        organization: '/organizations'
      };

      const actualType = itemType || getTypeFromSection(activeSection);
      const endpoint = endpoints[actualType];
      
      if (!endpoint) return;

      await Promise.all(
        selectedIds.map(id => 
          axiosInstance.patch(`${endpoint}/${id}`, { status: newStatus })
        )
      );

      const dataKey = actualType === 'daija' ? 'daije' : 
                     actualType === 'organization' ? 'organizations' : 
                     (actualType === 'lecture' || actualType === 'lectures') ? 'lectures' :
                     `${actualType}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: prev[dataKey].map(item => 
          selectedIds.includes(item._id) 
            ? { ...item, status: newStatus }
            : item
        )
      }));

      showSnackbar(`${selectedIds.length} stavki uspješno ažurirano`);
      
      await fetchData();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      showSnackbar('Greška pri ažuriranju statusa', 'error');
      await fetchData();
    }
  }, [activeSection, fetchData, showSnackbar]);

  const handleBulkDelete = useCallback(async (selectedIds, itemType = null) => {
    try {
      const actualType = itemType || getTypeFromSection(activeSection);
      
      if (actualType === 'users' || actualType === 'user') {
        // Use usersService for users
        await Promise.all(
          selectedIds.map(id => usersService.deleteUser(id))
        );
      } else {
        const endpoints = {
          lecture: '/lectures',
          lectures: '/lectures',
          daija: '/daije',
          organization: '/organizations',
          suggestion: '/suggestions',
          suggestions: '/suggestions'
        };

        const endpoint = endpoints[actualType];
        
        if (!endpoint) {
          console.error('No endpoint found for type:', actualType);
          return;
        }

        await Promise.all(
          selectedIds.map(id => 
            axiosInstance.delete(`${endpoint}/${id}`)
          )
        );
      }

      const dataKey = actualType === 'daija' ? 'daije' : 
                     actualType === 'organization' ? 'organizations' : 
                     (actualType === 'users' || actualType === 'user') ? 'users' :
                     (actualType === 'suggestion' || actualType === 'suggestions') ? 'suggestions' :
                     (actualType === 'lecture' || actualType === 'lectures') ? 'lectures' :
                     `${actualType}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: prev[dataKey].filter(item => !selectedIds.includes(item._id))
      }));

      showSnackbar(`${selectedIds.length} stavki uspješno obrisano`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showSnackbar('Greška pri brisanju', 'error');
    }
  }, [activeSection, showSnackbar]);

  // Note: renderSection logic is now in DataSection component

  const renderContent = () => {
    // Loading state
    if (ui.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    // Error state
    if (ui.error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{ui.error}</Alert>
          <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
            Pokušaj ponovo
          </Button>
        </Box>
      );
    }

    // Non-admin users
    if (!isAdmin) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Nemate dozvole za pristup dashboard-u. Potrebne su administratorske dozvole.
          </Alert>
        </Box>
      );
    }

    // Shared props for all sections
    const commonSectionProps = {
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
    };

    // Render section based on activeSection
    switch (activeSection) {
      case 'predavanja':
        return (
          <LecturesSection
            lectures={data.lectures}
            handleCancelLecture={handleCancelLecture}
            {...commonSectionProps}
          />
        );

      case 'za-odobrenje':
        return (
          <ApprovalSection
            daije={data.daije}
            organizations={data.organizations}
            {...commonSectionProps}
          />
        );

      case 'korisnici':
        return (
          <UsersSection
            users={data.users}
            {...commonSectionProps}
          />
        );

      case 'daije':
        return (
          <DaijeSection
            daije={data.daije}
            {...commonSectionProps}
          />
        );

      case 'organizations':
        return (
          <OrganizationsSection
            organizations={data.organizations}
            {...commonSectionProps}
          />
        );

      case 'odbijeno':
        return (
          <RejectedSection
            lectures={data.lectures}
            daije={data.daije}
            organizations={data.organizations}
            handleCancelLecture={handleCancelLecture}
            currentUser={currentUser}
            setActiveSection={setActiveSection}
            {...commonSectionProps}
          />
        );

      case 'prijave-otkazivanje':
        return (
          <CancellationReportsSection
            cancellationReports={data.cancellationReports}
            setCancellationItem={setCancellationItem}
            openDialog={openDialog}
            {...commonSectionProps}
          />
        );

      case 'prijedlozi':
        return (
          <SuggestionsSection
            suggestions={data.suggestions}
            archivedSuggestions={data.archivedSuggestions}
            handleArchiveSuggestion={handleArchiveSuggestion}
            handleDeleteSuggestion={handleDeleteSuggestion}
            {...commonSectionProps}
          />
        );

      case 'postavke':
        return (
          <Settings
            approvalSettings={approvalSettings}
            setApprovalSettings={updateApprovalSettings}
          />
        );

      default:
        // Default to lectures section
        return (
          <LecturesSection
            lectures={data.lectures}
            handleCancelLecture={handleCancelLecture}
            {...commonSectionProps}
          />
        );
    }
  };

  const handleQuickAdd = useCallback(async (type, data) => {
    try {
      if (type === 'predavanja') {
        // Create a lecture with minimal data
        const lectureData = {
          title: data.title,
          speaker: data.speaker,
          date: data.date,
          status: approvalSettings.lecture ? 'approved' : 'pending',
          image: getDefaultLectureImage()
        };
        await predavanjaService.createPredavanje(lectureData);
        showSnackbar('Ders uspješno dodan!');
        if (fetchData) await fetchData(); // Reload data
      } else if (type === 'organizations') {
        const orgData = {
          name: data.name,
          description: data.description,
          status: approvalSettings.organization ? 'approved' : 'pending',
          image: getDefaultOrganizationImage()
        };
        await udruzenjaService.createUdruzenje(orgData);
        showSnackbar('Udruženje uspješno dodano!');
        if (fetchData) await fetchData();
      } else if (type === 'daije') {
        const daijaData = {
          name: data.name,
          title: data.title,
          status: approvalSettings.daija ? 'approved' : 'pending',
          image: getDefaultDaijaImage()
        };
        await daijeService.createDaija(daijaData);
        showSnackbar('Daija uspješno dodana!');
        if (fetchData) await fetchData();
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      showSnackbar(`Greška pri dodavanju: ${error.message}`, 'error');
    }
  }, [approvalSettings, showSnackbar, fetchData]);

  const setSection = (section, action) => {
    // Handle mobile sub-actions
    if (action) {
      setActiveSection(section);
      if (action === 'add') {
        // Open appropriate dialog for adding new items
        if (section === 'predavanja') {
          handleAddPredavanje();
        } else if (section === 'organizations') {
          setOrganizationDialogOpen(true);
        } else if (section === 'daije') {
          setDaijaDialogOpen(true);
        }
      }
      // 'list' action just switches to the section view
    } else {
      setActiveSection(section);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
                  <Box sx={{ display: 'flex', maxWidth: '1900px', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          {!isMobile && (
            <DashSidebar 
              activeSection={activeSection} 
              onSectionChange={setSection}
              onQuickAdd={handleQuickAdd}
              pendingCount={
                (data.daije || []).filter(d => d.status === 'pending').length +
                (data.organizations || []).filter(o => o.status === 'pending').length
              }
              pendingSuggestionsCount={counts.pendingSuggestions}
              approvalToggles={approvalSettings}
              setApprovalToggles={updateApprovalSettings}
              userRole={currentUser?.role}
            />
          )}
          <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
            <Box sx={{ 
              p: isMobile ? 1 : 0.625, 
              m: 0, 
              width: '100%',
              bgcolor: 'background.default',
              minHeight: 'calc(100vh - 64px)'
            }}>
              {isMobile ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'calc(100vh - 200px)'
                }}>
                  <DashboardIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Dashboard nije dostupan na mobilnom
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
                    Admin dashboard je dostupan samo na desktop računarima i u mobilnoj aplikaciji.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      💻 Koristite desktop verziju
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📱 Ili preuzmite mobilnu aplikaciju
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  width: '100%',
                  maxWidth: '1900px',
                  p: 2
                }}>
                  {renderContent()}
                  
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={ui.snackbar.open}
          autoHideDuration={6000}
          onClose={() => setUi(prev => ({ ...prev, snackbar: { ...prev.snackbar, open: false } }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setUi(prev => ({ ...prev, snackbar: { ...prev.snackbar, open: false } }))}
            severity={ui.snackbar.severity}
          >
            {ui.snackbar.message}
          </Alert>
        </Snackbar>

        {/* Delete Dialog */}
        <Dialog
          open={dialogs.deleteDialog}
          onClose={() => closeDialog('deleteDialog')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Brisanje stavke
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Da li ste sigurni da želite obrisati ovu stavku? Ova akcija se ne može poništiti.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => closeDialog('deleteDialog')}
            >
              Otkaži
            </Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
            >
              Obriši
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog
          open={dialogs.statusDialog}
          onClose={() => closeDialog('statusDialog')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Promena statusa
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Da li ste sigurni da želite promeniti status stavke na &quot;
              {statusChange.value === 'approved' ? 'Odobreno' : 
               statusChange.value === 'pending' ? 'Na čekanju' : 
               statusChange.value}&quot;?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => closeDialog('statusDialog')}
            >
              Otkaži
            </Button>
            <Button
              onClick={confirmStatusChange}
              color="primary"
              variant="contained"
            >
              Potvrdi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={dialogs.rejectDialog}
          onClose={() => closeDialog('rejectDialog')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Odbacivanje stavke
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Da li ste sigurni da želite odbaciti ovu stavku?
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Razlog odbacivanja"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Unesite razlog odbacivanja (opcionalno)"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                closeDialog('rejectDialog');
                setRejectReason('');
              }}
            >
              Otkaži
            </Button>
            <Button
              onClick={confirmReject}
              color="error"
              variant="contained"
            >
              Odbaci
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manage Cancellation Reports Dialog */}
        <Dialog
          open={dialogs.manageCancellationDialog}
          onClose={() => closeDialog('manageCancellationDialog')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Upravljanje prijavama otkazivanja
          </DialogTitle>
          <DialogContent>
            {cancellationItem && (
              <>
                <Typography variant="h6" gutterBottom>
                  {cancellationItem.title}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Predavač: {cancellationItem.speaker}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Datum: {formatDate(cancellationItem.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vrijeme: {cancellationItem.time}
                  </Typography>
                </Box>
                <Alert severity={cancellationItem.reportCount >= 3 ? "error" : "warning"} sx={{ mb: 3 }}>
                  Ovo predavanje ima <strong>{cancellationItem.reportCount}</strong> prijav{cancellationItem.reportCount === 1 ? 'u' : 'a/e'} za otkazivanje.
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Izaberite jednu od opcija:
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Prihvati prijavu</strong> - Predavanje će biti OTKAZANO
                  </Alert>
                  <Alert severity="info">
                    <strong>Odbij prijavu</strong> - Sve prijave će biti OBRISANE
                  </Alert>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
            <Button
              onClick={() => {
                if (window.confirm('Da li ste sigurni da želite ODBITI prijave i obrisati ih?')) {
                  handleResetCancellationReports(cancellationItem);
                  closeDialog('manageCancellationDialog');
                }
              }}
              color="error"
              variant="outlined"
              size="large"
            >
              Odbij prijavu
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => closeDialog('manageCancellationDialog')}
                variant="text"
              >
                Odustani
              </Button>
              <Button
                onClick={() => {
                  if (window.confirm('Da li ste sigurni da želite PRIHVATITI prijavu i otkazati predavanje?')) {
                    handleCancelLecture(cancellationItem);
                    closeDialog('manageCancellationDialog');
                  }
                }}
                color="success"
                variant="contained"
                disabled={cancellationItem?.isCancelled}
                size="large"
              >
                Prihvati prijavu
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Edit Lecture Dialog */}
        <LectureFormNew
          open={editLectureDialogOpen}
          onClose={() => setEditLectureDialogOpen(false)}
          onSuccess={(updatedLecture) => {
            setData(prev => ({
              ...prev,
              lectures: prev.lectures.map(lecture => 
                lecture._id === updatedLecture._id ? updatedLecture : lecture
              )
            }));
            setEditLectureDialogOpen(false);
            showSnackbar('Predavanje uspješno ažurirano');
          }}
          lecture={lectureToEdit}
        />

        {/* Duplicate Count Dialog */}
        <Dialog
          open={duplicateCountDialogOpen}
          onClose={() => setDuplicateCountDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Dupliranje stavke
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
                              Koliko kopija želite napraviti od &quot;{itemToDuplicate?.title || itemToDuplicate?.name}&quot;?
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Broj kopija"
              type="number"
              fullWidth
              variant="outlined"
              value={duplicateCount}
              onChange={(e) => setDuplicateCount(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 50 }}
              helperText="Sve kopije će imati status 'Na čekanju'"
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDuplicateCountDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button
              onClick={confirmDuplicate}
              color="primary"
              variant="contained"
              disabled={duplicateCount < 1}
            >
              Dupliraj {duplicateCount} {duplicateCount === 1 ? 'kopiju' : 'kopija'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Daija Dialog */}
        <UnifiedFormNew
          type="daija"
          open={editDaijaDialogOpen}
          onClose={() => setEditDaijaDialogOpen(false)}
          onSuccess={(updatedDaija) => {
            setData(prev => ({
              ...prev,
              daije: prev.daije.map(daija => 
                daija._id === updatedDaija._id ? updatedDaija : daija
              )
            }));
            setEditDaijaDialogOpen(false);
            showSnackbar('Daija uspješno ažurirana');
          }}
          data={daijaToEdit}
          approvalEnabled={approvalSettings.daija}
        />

        {/* Edit Organization Dialog */}
        <UnifiedFormNew
          type="organization"
          open={editOrganizationDialogOpen}
          onClose={() => setEditOrganizationDialogOpen(false)}
          onSuccess={(updatedOrganization) => {
            setData(prev => ({
              ...prev,
              organizations: prev.organizations.map(org => 
                org._id === updatedOrganization._id ? updatedOrganization : org
              )
            }));
            setEditOrganizationDialogOpen(false);
            showSnackbar('Udruženje uspješno ažurirano');
          }}
          data={organizationToEdit}
          approvalEnabled={approvalSettings.organization}
        />

        {/* Edit User Dialog */}
        <UserForm
          open={editUserDialogOpen}
          onClose={() => setEditUserDialogOpen(false)}
          onSuccess={(updatedUser) => {
            setData(prev => ({
              ...prev,
              users: prev.users.map(user =>
                user._id === updatedUser._id ? updatedUser : user
              )
            }));
            setEditUserDialogOpen(false);
            showSnackbar('Korisnik uspješno ažuriran');
          }}
          user={userToEdit}
          currentUser={currentUser}
        />
        
        {/* Advanced Filters Dialog */}
        <AdvancedFilters
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onApply={handleApplyFilters}
          data={[...data.lectures, ...data.daije, ...data.organizations]}
          currentFilters={activeFilters}
          filterConfig={{
            showStatus: true,
            showSpeaker: activeSection === 'predavanja' || activeSection === 'za-odobrenje'
          }}
        />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Dashboard; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}
