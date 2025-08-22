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
import DraggableDataTable from '@/components/DraggableDataTable';
import Settings from '@/components/dashboard/Settings';
import LectureForm from '@/components/LectureForm';
import DaijaForm from '@/components/DaijaForm';
import OrganizationForm from '@/components/OrganizationForm';
import UserForm from '@/components/UserForm';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import SearchBar from '@/components/SearchBar';
import AdvancedFilters, { FilterButton } from '@/components/AdvancedFilters';
import UndoRedoBar from '@/components/UndoRedoBar';
import useUndoRedo from '@/hooks/useUndoRedo';

import { predavanjaService, daijeService, udruzenjaService, suggestionsService, usersService, settingsService } from '@/services';
import axiosInstance from '@/utils/axiosConfig';
import { getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { isValid, parseISO } from 'date-fns';

const Dashboard = () => {
  // ... (ostali stateovi ostaju)

  

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeSection, setActiveSection] = useState('predavanja');
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });

  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
    }
  }, []);
  
  const canDelete = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  
  const [data, setData] = useState({
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: [],
    suggestionsCount: { total: 0, pending: 0, approved: 0, rejected: 0 },
    cancellationReports: { total: 0, pending: 0, autoCancelled: 0, manuallyCancelled: 0, lectures: [] }
  });
  const [counts, setCounts] = useState({
    pendingSuggestions: 0
  });
  const [ui, setUi] = useState({
    isLoading: true,
    error: null,
    snackbar: { open: false, message: '', severity: 'success' }
  });
  // fetchData funkcija i useEffect su dodani iznad
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

  // Deklaracija fetchData mora biti iznad useEffect!
  const fetchData = useCallback(async () => {
    console.log('📊 Dashboard fetchData: Starting data fetch...');
    console.log('📊 isAdmin:', isAdmin);
    console.log('📊 currentUser:', currentUser);
    console.log('📊 token:', !!token);
    
    setUi(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Only call admin endpoints if user is admin
      const promises = [];
      
      if (isAdmin) {
        console.log('📊 User is admin, calling admin endpoints...');
        promises.push(
          usersService.getAllUsers(),
          predavanjaService.getAllPredavanjaForAdmin(),
          daijeService.getAllDaijeForAdmin(),
          udruzenjaService.getAllUdruzenjaForAdmin(),
          suggestionsService.getAllSuggestions(),
          suggestionsService.getArchivedSuggestions(),
          suggestionsService.getSuggestionsCount(),
          axiosInstance.get('/lectures/admin/cancellation-reports').then(res => res.data) // Fetch cancellation reports
        );
      } else {
        console.log('📊 User is not admin, using public endpoints...');
        // For non-admin users, use public endpoints or return empty data
        promises.push(
          Promise.resolve([]), // users
          predavanjaService.getAllPredavanja(), // public lectures
          daijeService.getAllDaije(), // public daije
          udruzenjaService.getAllUdruzenja(), // public organizations
          Promise.resolve([]), // suggestions
          Promise.resolve([]), // archived suggestions
          Promise.resolve({ total: 0, pending: 0, approved: 0, rejected: 0 }), // suggestions count
          Promise.resolve({ total: 0, pending: 0, autoCancelled: 0, manuallyCancelled: 0, lectures: [] }) // cancellation reports
        );
      }
      
      console.log('📊 Executing API calls...');
      const [usersRes, lecturesRes, daijeRes, orgsRes, suggestionsRes, archivedSuggestionsRes, suggestionsCountRes, cancellationReportsRes] = await Promise.all(promises);

      console.log('📊 API responses received:');
      console.log('📊 Users:', usersRes);
      console.log('📊 Lectures:', lecturesRes);
      console.log('📊 Daije:', daijeRes);
      console.log('📊 Organizations:', orgsRes);
      console.log('📊 Cancellation Reports Response:', cancellationReportsRes);

      const suggestionsData = Array.isArray(suggestionsRes) ? suggestionsRes : [];
      const archivedSuggestionsData = Array.isArray(archivedSuggestionsRes) ? archivedSuggestionsRes : [];
      
      // Debug logging za suggestions
      console.log('🔍 Fetched suggestions data:', suggestionsData);
      console.log('🔍 Suggestions count:', suggestionsData.length);
      if (suggestionsData.length > 0) {
        console.log('🔍 Sample suggestion:', suggestionsData[0]);
        console.log('🔍 All suggestion statuses:', suggestionsData.map(s => s.status));
      }
      
      setData({
        users: Array.isArray(usersRes) ? usersRes : usersRes.users || [],
        lectures: Array.isArray(lecturesRes) ? lecturesRes : [],
        daije: Array.isArray(daijeRes) ? daijeRes : [],
        organizations: Array.isArray(orgsRes) ? orgsRes : [],
        suggestions: suggestionsData,
        archivedSuggestions: archivedSuggestionsData,
        suggestionsCount: suggestionsCountRes || { total: 0, pending: 0, approved: 0, rejected: 0 },
        cancellationReports: cancellationReportsRes || { total: 0, pending: 0, autoCancelled: 0, manuallyCancelled: 0, lectures: [] }
      });

      // Ažuriraj broj aktivnih prijedloga
      setCounts(prev => ({
        ...prev,
        pendingSuggestions: suggestionsData.filter(s => s.status !== 'archived').length
      }));
      console.log('📊 Data set successfully');
      setUi(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (error) {
      console.error('📊 Error fetching dashboard data:', error);
      setUi(prev => ({ ...prev, isLoading: false, error: 'Greška pri dohvaćanju podataka.' }));
    }
  }, [isAdmin, currentUser, token]);

  // Uklonjen duplikat useEffect - koristimo samo onaj ispod sa fetchDataCalledRef
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
  
  // Drag & Drop state
  const [dragMode, setDragMode] = useState(false);
  
  // Undo/Redo state
  const [dataHistory, setDataHistory, undoRedoControls] = useUndoRedo(null);
  const [lastAction, setLastAction] = useState('');

  const fetchDataCalledRef = useRef(false);

  const filterData = (items, searchQuery, type) => {
    let filteredItems = [...items];
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      filteredItems = filteredItems.filter(item => {
        switch (type) {
          case 'lecture':
            return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.organization?.toLowerCase().includes(searchQuery.toLowerCase());
          case 'user':
            return item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.email?.toLowerCase().includes(searchQuery.toLowerCase());
          case 'organization':
            return item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.city?.toLowerCase().includes(searchQuery.toLowerCase());
          case 'daija':
            return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.description?.toLowerCase().includes(searchQuery.toLowerCase());
          case 'suggestion':
            return item.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.submitterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.submitterEmail?.toLowerCase().includes(searchQuery.toLowerCase());
          default:
            return true;
        }
      });
    }
    
    // Apply advanced filters
    if (Object.keys(activeFilters).length > 0) {
      // Date filters
      if (activeFilters.dateFrom) {
        const fromDate = new Date(activeFilters.dateFrom);
        filteredItems = filteredItems.filter(item => {
          const itemDate = item.date ? new Date(item.date) : null;
          return itemDate && itemDate >= fromDate;
        });
      }
      
      if (activeFilters.dateTo) {
        const toDate = new Date(activeFilters.dateTo);
        filteredItems = filteredItems.filter(item => {
          const itemDate = item.date ? new Date(item.date) : null;
          return itemDate && itemDate <= toDate;
        });
      }
      
      // Status filter
      if (activeFilters.status) {
        filteredItems = filteredItems.filter(item => item.status === activeFilters.status);
      }
      
      // City filter
      if (activeFilters.city) {
        filteredItems = filteredItems.filter(item => item.city === activeFilters.city);
      }
      
      // Organization filter
      if (activeFilters.organization) {
        filteredItems = filteredItems.filter(item => item.organization === activeFilters.organization);
      }
      
      // Speaker filter
      if (activeFilters.speaker) {
        filteredItems = filteredItems.filter(item => item.speaker === activeFilters.speaker);
      }
      
      // Has image filter
      if (activeFilters.hasImage === true) {
        filteredItems = filteredItems.filter(item => item.imageUrl && item.imageUrl !== '');
      }
      
      // Sort
      if (activeFilters.sortBy) {
        filteredItems.sort((a, b) => {
          let aVal = a[activeFilters.sortBy];
          let bVal = b[activeFilters.sortBy];
          
          // Handle dates
          if (activeFilters.sortBy === 'date' || activeFilters.sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }
          
          if (activeFilters.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
      }
    }
    
    return filteredItems;
  };
  
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setFiltersOpen(false);
  };
  
  const handleReorder = useCallback((reorderedItems, type) => {
    // Update local state with reordered items
    const dataKey = type === 'daija' ? 'daije' : 
                   type === 'organization' ? 'organizations' : 
                   type === 'user' ? 'users' : 
                   type === 'lecture' ? 'lectures' : type;
    
    setData(prev => {
      const newData = {
        ...prev,
        [dataKey]: reorderedItems
      };
      
      // Add to undo/redo history
      setDataHistory(newData, `Reorganizovano ${dataKey}`);
      setLastAction(`Reorganizovano ${dataKey}`);
      
      return newData;
    });
  }, [setDataHistory]);
  
  const handleUndo = useCallback(() => {
    const action = undoRedoControls.undo();
    if (action && dataHistory) {
      setData(dataHistory);
      setLastAction(`Poništeno: ${action}`);
    }
  }, [undoRedoControls, dataHistory]);
  
  const handleRedo = useCallback(() => {
    const action = undoRedoControls.redo();
    if (action && dataHistory) {
      setData(dataHistory);
      setLastAction(`Ponovljeno: ${action}`);
    }
  }, [undoRedoControls, dataHistory]);

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

  useEffect(() => {
    console.log('📊 Dashboard fetchData useEffect triggered');
    console.log('📊 currentUser:', currentUser);
    console.log('📊 fetchDataCalledRef.current:', fetchDataCalledRef.current);
    
    if (!currentUser || fetchDataCalledRef.current) {
      console.log('📊 Skipping fetchData - conditions not met');
      return;
    }
    
    console.log('📊 Calling fetchData...');
    fetchDataCalledRef.current = true;
    fetchData();
  }, [currentUser, fetchData]);

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

  const handleStatusChange = useCallback((item, type, newStatus) => {
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
      const endpoints = {
        user: '/users',
        users: '/users',
        lecture: '/lectures',
        daija: '/daije',
        organization: '/organizations'
      };

      await axiosInstance.delete(`${endpoints[selectedItem.type]}/${selectedItem._id}`);
      
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
      const endpoints = {
        users: '/users',
        user: '/users',
        lecture: '/lectures',
        lectures: '/lectures',
        daija: '/daije',
        organization: '/organizations',
        suggestion: '/suggestions',
        suggestions: '/suggestions'
      };

      const actualType = itemType || getTypeFromSection(activeSection);
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

  const renderSection = (sectionType, items, title, type = null, showRejectionReason = false) => {
    const sectionKey = type || getTypeFromSection(activeSection);
    
    return (
      <Box sx={{ mb: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={dragMode}
                  onChange={(e) => setDragMode(e.target.checked)}
                  size="small"
                />
              }
              label="Reorganizuj"
              sx={{ mr: 2 }}
            />
            <SearchBar
              placeholder={`Pretraži ${title.toLowerCase()}...`}
              onSearch={(value) => handleSearchChange(sectionKey, value)}
              value={searchQueries[sectionKey] || ''}
              fullWidth={false}
              sx={{ width: 300 }}
            />
            <FilterButton
              onClick={() => setFiltersOpen(true)}
              activeCount={Object.keys(activeFilters).length}
            />
          </Box>
        </Box>
        
        {items.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
            <Typography color="text.secondary" variant="h6">
              Nema {title.toLowerCase()}
            </Typography>
          </Paper>
        ) : (
          <DraggableDataTable
            data={items}
            type={type || getTypeFromSection(activeSection)}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={canDelete ? handleDelete : undefined}
            onDuplicate={handleDuplicate}
            onCancel={(type === 'lecture' || type === 'lectures') && isAdmin ? handleCancelLecture : undefined}
            onStatusChange={isAdmin ? (item, newStatus) => handleStatusChange(item, type || getTypeFromSection(activeSection), newStatus) : undefined}
            onBulkStatusChange={isAdmin ? handleBulkStatusChange : undefined}
            onBulkDelete={canDelete ? handleBulkDelete : undefined}
            onReorder={(reorderedItems) => handleReorder(reorderedItems, type || getTypeFromSection(activeSection))}
            hideActions={!isAdmin}
            showActions={true}
            showStatus={true}
            showRejectionReason={showRejectionReason}
            dragEnabled={dragMode}
          />
        )}
      </Box>
    );
  };

  const renderContent = () => {
    if (ui.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

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

    // Show message for non-admin users
    if (!isAdmin) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Nemate dozvole za pristup dashboard-u. Potrebne su administratorske dozvole.
          </Alert>
        </Box>
      );
    }

    let content;

    switch (activeSection) {
      case 'za-odobrenje': {
        // Lectures no longer need approval - automatically approved
        const pendingLectures = [];
        
        const pendingDaije = filterData(
          (data.daije || []).filter(d => d.status === 'pending'),
          searchQueries.lectures,
          'daija'
        );
        
        const pendingOrganizations = filterData(
          (data.organizations || []).filter(o => o.status === 'pending'),
          searchQueries.lectures,
          'organization'
        );
        
        return (
          <>
            {pendingDaije.length > 0 && renderSection('pending', pendingDaije, 'Daije za odobrenje', 'daija')}
            {pendingOrganizations.length > 0 && renderSection('pending', pendingOrganizations, 'Udruženja za odobrenje', 'organization')}
            {pendingDaije.length === 0 && pendingOrganizations.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Nema sadržaja za odobrenje
                </Typography>
              </Box>
            )}
          </>
        );
      }
      case 'korisnici': {
        const filteredUsers = filterData(data.users, searchQueries.users, 'user');
        content = (
          <Box sx={{ mb: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Korisnici
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <SearchBar
                  placeholder="Pretraži korisnike..."
                  onSearch={(value) => handleSearchChange('users', value)}
                  value={searchQueries.users || ''}
                  fullWidth={false}
                  sx={{ width: 300 }}
                />
                <FilterButton
                  onClick={() => setFiltersOpen(true)}
                  activeCount={Object.keys(activeFilters).length}
                />
              </Box>
            </Box>
            {filteredUsers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
                <Typography color="text.secondary" variant="h6">
                  Nema korisnika
                </Typography>
              </Paper>
            ) : (
              <DraggableDataTable
                data={filteredUsers}
                type="users"
                onEdit={isAdmin ? handleEdit : undefined}
                onDelete={canDelete ? handleDelete : undefined}
                onBulkDelete={canDelete ? handleBulkDelete : undefined}
                onReorder={(reorderedItems) => handleReorder(reorderedItems, 'users')}
                hideActions={!isAdmin}
                showActions={true}
                showStatus={false}
                dragEnabled={dragMode}
              />
            )}
          </Box>
        );
        break;
      }
      case 'daije': {
        const approvedDaije = filterData(
          (data.daije || []).filter(d => d.status === 'approved'),
          searchQueries.lectures,
          'daija'
        );
        content = (
          <Box>
            {renderSection('approved', approvedDaije, 'Odobrene daije', 'daija')}
          </Box>
        );
        break;
      }
      case 'organizations': {
        const approvedOrganizations = filterData(
          (data.organizations || []).filter(o => o.status === 'approved'),
          searchQueries.lectures,
          'organization'
        );
        content = (
          <Box>
            {renderSection('approved', approvedOrganizations, 'Odobrena udruženja', 'organization')}
          </Box>
        );
        break;
      }
      case 'odbijeno': {
        // Samo super admin može da vidi odbijene stavke
        if (currentUser?.role !== 'super_admin') {
          setActiveSection('predavanja');
          return null;
        }
        const rejectedLectures = filterData(
          (data.lectures || []).filter(l => l.status === 'rejected'),
          searchQueries.lectures,
          'lecture'
        );
        const rejectedDaije = filterData(
          (data.daije || []).filter(d => d.status === 'rejected'),
          searchQueries.lectures,
          'daija'
        );
        const rejectedOrganizations = filterData(
          (data.organizations || []).filter(o => o.status === 'rejected'),
          searchQueries.lectures,
          'organization'
        );
        
        content = (
          <Box>
            {rejectedLectures.length > 0 && renderSection('rejected', rejectedLectures, 'Odbačena predavanja', 'lecture', true)}
            {rejectedDaije.length > 0 && renderSection('rejected', rejectedDaije, 'Odbačene daije', 'daija', true)}
            {rejectedOrganizations.length > 0 && renderSection('rejected', rejectedOrganizations, 'Odbačena udruženja', 'organization', true)}
            {rejectedLectures.length === 0 && rejectedDaije.length === 0 && rejectedOrganizations.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography color="text.secondary" variant="h6">
                  Nema odbačenih stavki
                </Typography>
              </Paper>
            )}
          </Box>
        );
        break;
      }

      case 'prijave-otkazivanje': {
        const cancellationReports = data.cancellationReports || { lectures: [] };
        console.log('🔍 Cancellation Reports Data:', cancellationReports);
        console.log('🔍 Lectures in reports:', cancellationReports.lectures);
        const filteredReports = filterData(
          cancellationReports.lectures || [],
          searchQueries.lectures,
          'lecture'
        );
        console.log('🔍 Filtered Reports:', filteredReports);

        content = (
          <Box sx={{ mb: 4, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Prijave za otkazivanje
            </Typography>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
              <Paper sx={{ p: 3, bgcolor: 'warning.light', color: 'warning.dark' }}>
                <Typography variant="h6">{cancellationReports.total || 0}</Typography>
                <Typography variant="body2">Ukupno prijava</Typography>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.dark' }}>
                <Typography variant="h6">{cancellationReports.pending || 0}</Typography>
                <Typography variant="body2">Na čekanju</Typography>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
                <Typography variant="h6">{cancellationReports.autoCancelled || 0}</Typography>
                <Typography variant="body2">Automatski otkazano</Typography>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: 'grey.300', color: 'grey.800' }}>
                <Typography variant="h6">{cancellationReports.manuallyCancelled || 0}</Typography>
                <Typography variant="body2">Ručno otkazano</Typography>
              </Paper>
            </Box>

            {/* Search Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Pretraži predavanja"
                value={searchQueries.lectures}
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
        break;
      }

      case 'prijedlozi': {
        const activeSuggestions = filterData(
          (data.suggestions || []).filter(s => s.status !== 'archived'),
          searchQueries.lectures,
          'suggestion'
        );
        const archivedSuggestions = filterData(
          (data.archivedSuggestions || []),
          searchQueries.lectures,
          'suggestion'
        );
        
        // Debug logging za prijedlozi sekciju
        console.log('🔍 Raw suggestions data:', data.suggestions);
        console.log('🔍 Filtered active suggestions:', activeSuggestions);
        console.log('🔍 Active suggestions length:', activeSuggestions.length);
        console.log('🔍 Archived suggestions length:', archivedSuggestions.length);
        
        content = (
          <Box sx={{ mb: 4, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Prijedlozi
            </Typography>
            
            {/* Subsection Navigation */}
            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={activeSuggestionsSubsection === 'aktivni' ? 'contained' : 'text'}
                  onClick={() => setActiveSuggestionsSubsection('aktivni')}
                  sx={{ 
                    borderRadius: '8px 8px 0 0',
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Aktivni prijedlozi ({activeSuggestions.length})
                </Button>
                <Button
                  variant={activeSuggestionsSubsection === 'arhivirani' ? 'contained' : 'text'}
                  onClick={() => setActiveSuggestionsSubsection('arhivirani')}
                  sx={{ 
                    borderRadius: '8px 8px 0 0',
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Arhivirani prijedlozi ({archivedSuggestions.length})
                </Button>
              </Box>
            </Box>

            {/* Content based on active subsection */}
            {activeSuggestionsSubsection === 'aktivni' ? (
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
              archivedSuggestions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
                  <Typography color="text.secondary" variant="h6">
                    Nema arhiviranih prijedloga
                  </Typography>
                </Paper>
              ) : (
                <DataTable
                  data={archivedSuggestions}
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
        break;
      }
      case 'postavke': {
        content = (
          <Settings 
            approvalSettings={approvalSettings}
            setApprovalSettings={updateApprovalSettings}
          />
        );
        break;
      }
      case 'predavanja':
      default: {
        // Show all lectures (approved and cancelled)
        const allLectures = filterData(
          (data.lectures || []),
          searchQueries.lectures,
          'lecture'
        );
        content = renderSection('all', allLectures, 'Svi Dersovi', 'lecture');
        break;
      }
    }

    return content;
  };

  const setSection = (section) => {
    setActiveSection(section);
  };

  return (
    <ProtectedRoute>
      <PageLayout>
                  <Box sx={{ display: 'flex', maxWidth: '1900px', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          {!isMobile && (
            <DashSidebar 
              activeSection={activeSection} 
              onSectionChange={setSection}
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
                  
                  {/* Undo/Redo Bar */}
                  <UndoRedoBar
                    canUndo={undoRedoControls.canUndo}
                    canRedo={undoRedoControls.canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onReset={undoRedoControls.reset}
                    lastAction={lastAction}
                    visible={isAdmin}
                  />
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
                    Datum: {new Date(cancellationItem.date).toLocaleDateString('hr-HR')}
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
        <LectureForm
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
          approvalEnabled={approvalSettings.lecture}
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
        <DaijaForm
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
          daija={daijaToEdit}
          approvalEnabled={approvalSettings.daija}
        />

        {/* Edit Organization Dialog */}
        <OrganizationForm
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
          organization={organizationToEdit}
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