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
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PageLayout from '@/components/PageLayout';
import DashSidebar from '@/components/DashSidebar';

import DataTable from '@/components/DataTable';
import Settings from '@/components/dashboard/Settings';
import LectureForm from '@/components/LectureForm';
import DaijaForm from '@/components/DaijaForm';
import OrganizationForm from '@/components/OrganizationForm';
import UserForm from '@/components/UserForm';

import axiosInstance from '@/utils/axiosConfig';

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
  // fetchData funkcija i useEffect su dodani iznad
  const [dialogs, setDialogs] = useState({
    deleteDialog: false,
    statusDialog: false,
    rejectDialog: false,
    addUser: false,
    addOrganization: false,
    addDaija: false,
    addLecture: false
  });

  const [rejectReason, setRejectReason] = useState('');

  // Deklaracija fetchData mora biti iznad useEffect!
  const fetchData = useCallback(async () => {
    setUi(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [usersRes, lecturesRes, daijeRes, orgsRes, suggestionsRes, archivedSuggestionsRes, suggestionsCountRes] = await Promise.all([
        axiosInstance.get('/users/public'),
        axiosInstance.get('/admin/lectures/all'),
        axiosInstance.get('/admin/daije/all'),
        axiosInstance.get('/admin/organizations/all'),
        axiosInstance.get('/suggestions/public'),
        axiosInstance.get('/suggestions/archived/public'),
        axiosInstance.get('/suggestions/count/public')
      ]);

      const suggestionsData = Array.isArray(suggestionsRes.data) ? suggestionsRes.data : suggestionsRes.data.suggestions || [];
      const archivedSuggestionsData = Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : archivedSuggestionsRes.data.archivedSuggestions || [];
      
      setData({
        users: Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [],
        lectures: Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [],
        daije: Array.isArray(daijeRes.data) ? daijeRes.data : daijeRes.data.daije || [],
        organizations: Array.isArray(orgsRes.data) ? orgsRes.data : orgsRes.data.organizations || [],
        suggestions: suggestionsData,
        archivedSuggestions: archivedSuggestionsData,
        suggestionsCount: suggestionsCountRes.data || { total: 0, pending: 0, approved: 0, rejected: 0 }
      });

      // Ažuriraj broj aktivnih prijedloga
      setCounts(prev => ({
        ...prev,
        pendingSuggestions: suggestionsData.filter(s => s.status !== 'archived').length
      }));
      setUi(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (error) {
      setUi(prev => ({ ...prev, isLoading: false, error: 'Greška pri dohvaćanju podataka.' }));
    }
  }, []);

  // Pozovi fetchData na mountu
  useEffect(() => {
    fetchData();
  }, [fetchData]);
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
    users: ''
  });

  const [activeSuggestionsSubsection, setActiveSuggestionsSubsection] = useState('aktivni');

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
        case 'suggestion':
          return item.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.submitterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.submitterEmail?.toLowerCase().includes(searchQuery.toLowerCase());
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
      'za-odobrenje': 'lecture',
      organizations: 'organization',
      odbijeno: 'lecture', // Default to lecture for rejected section
      prijedlozi: 'suggestion'
    };
    return map[section] || '';
  };

  const getTypeDisplayName = (type) => {
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

  const confirmDuplicate = useCallback(async () => {
    if (!itemToDuplicate || duplicateCount < 1) return;

    try {
      const endpoints = {
        lecture: '/lectures',
        daija: '/daije',
        organization: '/organizations'
      };

      const promises = [];
      
      for (let i = 0; i < duplicateCount; i++) {
        const duplicatedItem = { ...itemToDuplicate };
        delete duplicatedItem._id;
        delete duplicatedItem.type;
        
        // Postaviti status na pending
        duplicatedItem.status = 'pending';
        
        // Dodati (kopija X) u naziv/ime
        if (duplicatedItem.title) {
          duplicatedItem.title = `${duplicatedItem.title} (kopija ${i + 1})`;
        } else if (duplicatedItem.firstName) {
          duplicatedItem.firstName = `${duplicatedItem.firstName} (kopija ${i + 1})`;
        } else if (duplicatedItem.name) {
          duplicatedItem.name = `${duplicatedItem.name} (kopija ${i + 1})`;
        }
        
        promises.push(
          axiosInstance.post(endpoints[itemToDuplicate.type], duplicatedItem)
        );
      }

      const responses = await Promise.all(promises);
      
      const dataKey = itemToDuplicate.type === 'daija' ? 'daije' : 
                     itemToDuplicate.type === 'organization' ? 'organizations' : 
                     `${itemToDuplicate.type}s`;
      
      setData(prev => ({
        ...prev,
        [dataKey]: [...prev[dataKey], ...responses.map(response => response.data)]
      }));
      
      await fetchData();
      showSnackbar(`${duplicateCount} ${getTypeDisplayName(itemToDuplicate.type).toLowerCase()}${duplicateCount > 1 ? 'a' : ''} je uspješno duplirano`);
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

  const renderSection = (sectionType, items, title, type = null, showRejectionReason = false) => (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
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
          showRejectionReason={showRejectionReason}
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

    let content;

    switch (activeSection) {
      case 'za-odobrenje': {
        const pendingLectures = filterData(
          (data.lectures || []).filter(l => l.status === 'pending'),
          searchQueries.lectures,
          'lecture'
        );
        content = (
          <Box>
            {renderSection('all', pendingLectures, 'Predavanja za odobrenje', 'lecture')}
          </Box>
        );
        break;
      }
      case 'korisnici': {
        const filteredUsers = filterData(data.users, searchQueries.users, 'user');
        content = (
          <Box sx={{ mb: 4, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Korisnici
            </Typography>
            {filteredUsers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', width: '100%' }}>
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
        const approvedLectures = filterData(
          (data.lectures || []).filter(l => l.status === 'approved'),
          searchQueries.lectures,
          'lecture'
        );
        content = renderSection('approved', approvedLectures, 'Odobrena predavanja (Dersovi)', 'lecture');
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
              pendingCount={(data.lectures || []).filter(l => l.status === 'pending').length}
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
              Da li ste sigurni da želite promeniti status stavke na "
              {statusChange.value === 'approved' ? 'Odobreno' : 
               statusChange.value === 'pending' ? 'Na čekanju' : 
               statusChange.value}"?
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
              Koliko kopija želite napraviti od "{itemToDuplicate?.title || itemToDuplicate?.firstName || itemToDuplicate?.name}"?
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

        {/* Duplicate Lecture Dialog */}
        <LectureForm
          open={duplicateDialogOpen}
          onClose={() => setDuplicateDialogOpen(false)}
          onSuccess={(newLecture) => {
            setData(prev => ({
              ...prev,
              lectures: [...prev.lectures, newLecture]
            }));
            setDuplicateDialogOpen(false);
            showSnackbar('Predavanje uspješno duplirano');
          }}
          lecture={lectureToDuplicate ? { ...lectureToDuplicate, _id: undefined, title: `${lectureToDuplicate.title} (kopija)` } : null}
          approvalEnabled={approvalSettings.lecture}
        />

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
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Dashboard; 