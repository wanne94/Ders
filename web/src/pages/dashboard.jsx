import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/utils/ProtectedRoute';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  // Dialog components moved to @shared/dashboard
  Button,
  TextField,
  Alert,
  Snackbar,
  Container,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Grid,
  Switch,
  Chip,
  FormControl,
  Select,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Stack
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Using default English (US) locale
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { debounce } from 'lodash';

// Components
import Navigation from '@/components/Navigation';
import PageLayout from '@/components/PageLayout';
import DashSidebar from '@/components/DashSidebar';

import OrganizationCard from '@/components/OrganizationCard';
import DataTable from '@/components/DataTable';
import LectureCard from '@/components/LectureCard';
import Settings from '@/components/dashboard/Settings';

import axiosInstance from '@/utils/axiosConfig';
import { normalizeToArray } from '@/utils/dataHelpers';
import { getApiRoute } from '@/utils/apiRoutes';

const Dashboard = () => {
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
        const response = await axiosInstance.get('/settings/public');
        const settings = response.data;
        
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
      await axiosInstance.put('/settings/approval-settings', settings);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      
      if (storedToken) {
        try {
          const decodedUser = jwtDecode(storedToken);
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
    suggestionsCount: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [counts, setCounts] = useState({
    pendingSuggestions: 0
  });
  const [ui, setUi] = useState({
    isLoading: true,
    error: null,
    snackbar: { open: false, message: '', severity: 'success' }
  });
  const [dialogs, setDialogs] = useState({
    deleteDialog: false,
    statusDialog: false,
    addUser: false,
    addOrganization: false,
    addDaija: false,
    addLecture: false
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusChange, setStatusChange] = useState({ item: null, type: '', value: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [lectureToDuplicate, setLectureToDuplicate] = useState(null);
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
    users: ''
  });

  const fetchDataCalledRef = useRef(false);

  const filterData = (items, searchQuery, type) => {
    if (!searchQuery.trim()) return items;
    
    return items.filter(item => {
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
        default:
          return true;
      }
    });
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
      organizations: 'organization'
    };
    return map[section] || '';
  };

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

  const fetchData = useCallback(async () => {
    setUi(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [usersRes, lecturesRes, daijeRes, orgsRes, suggestionsRes, archivedSuggestionsRes, suggestionsCountRes] = await Promise.all([
        axiosInstance.get('/users/public'),
        axiosInstance.get('/lectures/public'),
        axiosInstance.get('/daije/public'),
        axiosInstance.get('/organizations/public'),
        axiosInstance.get('/suggestions/public'),
        axiosInstance.get('/suggestions/archived/public'),
        axiosInstance.get('/suggestions/count/public')
      ]);

      setData({
        users: Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [],
        lectures: Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [],
        daije: Array.isArray(daijeRes.data) ? daijeRes.data : daijeRes.data.daije || [],
        organizations: Array.isArray(orgsRes.data) ? orgsRes.data : orgsRes.data.organizations || [],
        suggestions: Array.isArray(suggestionsRes.data) ? suggestionsRes.data : suggestionsRes.data.suggestions || [],
        archivedSuggestions: Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : archivedSuggestionsRes.data.suggestions || [],
        suggestionsCount: suggestionsCountRes.data || { total: 0, pending: 0, approved: 0, rejected: 0 }
      });

      setUi(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setUi(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Greška pri učitavanju podataka. Molimo pokušajte ponovo.' 
      }));
    }
  }, []);

  useEffect(() => {
    if (fetchDataCalledRef.current) return;
    fetchDataCalledRef.current = true;
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (item, type) => {
    switch (type) {
      case 'lecture':
        setLectureToEdit(item);
        setEditLectureDialogOpen(true);
        break;
      case 'daija':
        setDaijaToEdit(item);
        setEditDaijaDialogOpen(true);
        break;
      case 'organization':
        setOrganizationToEdit(item);
        setEditOrganizationDialogOpen(true);
        break;
      case 'user':
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
    openDialog('statusDialog');
  }, [openDialog]);

  const handleDuplicate = useCallback((item, type) => {
    if (type === 'lecture') {
      setLectureToDuplicate(item);
      setDuplicateDialogOpen(true);
    }
  }, []);

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
      
      showSnackbar(selectedItem.type + " uspješno obrisan");
    } catch (error) {
      console.error('Error deleting:', error);
      showSnackbar('Greška pri brisanju', 'error');
    } finally {
      closeDialog('deleteDialog');
      setSelectedItem(null);
    }
  }, [selectedItem, showSnackbar, closeDialog]);

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
    
    showSnackbar(type + " uspješno dodan");
    closeDialog(`add${type.charAt(0).toUpperCase() + type.slice(1)}`);
  }, [showSnackbar, closeDialog]);

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

  const renderSection = (sectionType, items, title, type = null) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography color="text.secondary" variant="h6">
            Nema {title.toLowerCase()}
          </Typography>
        </Paper>
      ) : (
        <DataTable
          data={items}
          type={type || getTypeFromSection(activeSection)}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          onDuplicate={handleDuplicate}
          onStatusChange={isAdmin ? (item, newStatus) => handleStatusChange(item, type || getTypeFromSection(activeSection), newStatus) : undefined}
          onBulkStatusChange={isAdmin ? handleBulkStatusChange : undefined}
          onBulkDelete={canDelete ? handleBulkDelete : undefined}
          hideActions={!isAdmin}
          showActions={true}
          showStatus={true}
        />
      )}
    </Box>
  );

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

    const addButtons = {
      predavanja: { key: 'addLecture', label: 'Dodaj' },
      daije: { key: 'addDaija', label: 'Dodaj' },
      organizations: { key: 'addOrganization', label: 'Dodaj' }
    };

    const currentButton = addButtons[activeSection];

    switch (activeSection) {
      case 'predavanja':
        const filteredLectures = filterData(data.lectures, searchQueries.lectures, 'lecture');
        
        return (
          <Box>
            {renderSection('all', filteredLectures, 'Sva predavanja')}
          </Box>
        );

      case 'korisnici':
        const filteredUsers = filterData(data.users, searchQueries.users, 'user');
        
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Korisnici
              </Typography>
              {filteredUsers.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary" variant="h6">
                    Nema korisnika
                  </Typography>
                </Paper>
              ) : (
                <DataTable
                  data={filteredUsers}
                  type="users"
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                  onBulkDelete={canDelete ? handleBulkDelete : undefined}
                  hideActions={!isAdmin}
                  showActions={true}
                  showStatus={false}
                />
              )}
            </Box>
          </Box>
        );

      case 'daije':
        return (
          <Box>
            {renderSection('approved', data.daije, 'Odobrene daije')}
          </Box>
        );

      case 'organizations':
        return (
          <Box>
            {renderSection('approved', data.organizations, 'Odobrena udruženja')}
          </Box>
        );

      case 'za-odobrenje':
        return (
          <Box>
            {renderSection('pending', data.lectures.filter(l => l?.status === 'pending'), 'Dersovi na odobrenju', 'lecture')}
            {renderSection('pending', data.daije.filter(d => d?.status === 'pending'), 'Daije na odobrenju', 'daija')}
            {renderSection('pending', data.organizations.filter(o => o?.status === 'pending'), 'Udruženja na odobrenju', 'organization')}
          </Box>
        );

      case 'prijedlozi':
        return (
          <Box>
            <Box sx={{ mt: 0 }}>
              <Typography variant="h6" gutterBottom>Aktivni prijedlozi</Typography>
              {data.suggestions.filter(s => s?.status === 'pending').length === 0 ? (
                <Typography color="text.secondary">
                  Nema prijedloga na čekanju
                </Typography>
              ) : (
                <DataTable
                  data={data.suggestions.filter(s => s?.status === 'pending')}
                  type="suggestion"
                  onEdit={undefined}
                  onDelete={canDelete ? (suggestion) => handleDeleteSuggestion(suggestion, false) : undefined}
                  onArchive={isAdmin ? handleArchiveSuggestion : undefined}
                  onBulkDelete={canDelete ? handleBulkDelete : undefined}
                  hideActions={!isAdmin}
                  showActions={true}
                  showStatus={false}
                />
              )}
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Arhivirani prijedlozi</Typography>
              {data.archivedSuggestions.length === 0 ? (
                <Typography color="text.secondary">
                  Nema arhiviranih prijedloga
                </Typography>
              ) : (
                <DataTable
                  data={data.archivedSuggestions}
                  type="suggestion"
                  onEdit={undefined}
                  onDelete={canDelete ? (suggestion) => handleDeleteSuggestion(suggestion, true) : undefined}
                  onBulkDelete={canDelete ? handleBulkDelete : undefined}
                  hideActions={!canDelete}
                  showActions={true}
                  showStatus={false}
                />
              )}
            </Box>
          </Box>
        );

      case 'postavke':
        return (
          <Settings
            approvalSettings={approvalSettings}
            setApprovalSettings={updateApprovalSettings}
          />
        );

      default:
        return null;
    }
  };

  const getItemName = (item, type) => {
    const names = {
      user: item?.username || item?.email,
      lecture: item?.title,
      daija: item?.firstName,
      organization: item?.name,
      suggestion: `prijedlog za ${item?.targetName}`
    };
    return names[type] || 'stavku';
  };

  const getStatusLabel = (status) => {
    const labels = {
      approved: 'Odobreno',
      pending: 'Na čekanju',
      rejected: 'Odbijeno',
      archived: 'Arhivirano'
    };
    return labels[status] || status;
  };

  return (
    <ProtectedRoute requireAdmin>
      <PageLayout 
        showFooter={false}
        disableGutters
        maxWidth={false}
        sx={{ minHeight: '100vh' }}
        containerSx={{ p: 0, m: 0, maxWidth: 'none !important' }}
        contentSx={{ mt: '30px' }}
      >
        <Box sx={{ display: 'flex', width: '100%' }}>
          {!isMobile && (
            <DashSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              pendingCount={
                data.lectures.filter(l => l?.status === 'pending').length +
                data.daije.filter(d => d?.status === 'pending').length +
                data.organizations.filter(o => o?.status === 'pending').length
              }
              pendingSuggestionsCount={counts.pendingSuggestions}
              approvalToggles={approvalSettings}
              setApprovalToggles={updateApprovalSettings}
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
                <>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    width: '100%',
                    mb: 3
                  }}>
                    {renderContent()}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>

          

        

        

        

        {/* Duplicate Lecture Dialog */}
        

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
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Dashboard; 