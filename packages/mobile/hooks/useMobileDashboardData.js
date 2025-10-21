import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';
import { usersService } from '../services/usersService';
import suggestionsService from '../services/suggestionsService';
import { getApiUrl } from '../config';
import { getToken } from '../utils/authHelpers';
import { appEvents, AUTH_EVENTS } from '../utils/eventEmitter';

/**
 * useMobileDashboardData Hook
 * Custom hook for managing dashboard data fetching, state, and operations
 */
const useMobileDashboardData = ({ onBack, onDataChange }) => {
  // Data states
  const [data, setData] = useState({
    users: [],
    lectures: [],
    daije: [],
    organizations: [],
    suggestions: [],
    archivedSuggestions: [],
    cancelledReports: []
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Counts for badges
  const [counts, setCounts] = useState({
    pendingDaije: 0,
    pendingOrganizations: 0,
    pendingSuggestions: 0,
    rejectedItems: 0,
    pendingCancelledReports: 0
  });

  // Approval settings
  const [approvalSettings, setApprovalSettings] = useState({
    lecture: true,
    daija: true,
    organization: true
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        usersRes,
        lecturesRes,
        daijeRes,
        orgsRes,
        suggestionsRes,
        archivedSuggestionsRes,
        cancelledReportsRes,
        settingsRes
      ] = await Promise.all([
        usersService?.getAllUsers ? usersService.getAllUsers() : Promise.resolve([]),
        predavanjaService.getAllPredavanjaForAdmin(),
        daijeService.getAllDaijeForAdmin(),
        udruzenjaService.getAllUdruzenjaForAdmin(),
        suggestionsService?.getAllSuggestions ? suggestionsService.getAllSuggestions() : Promise.resolve([]),
        suggestionsService?.getArchivedSuggestions ? suggestionsService.getArchivedSuggestions() : Promise.resolve([]),
        predavanjaService.getCancelledReports('all').catch(() => ({ reports: [] })),
        // Load approval settings from server
        fetch(`${getApiUrl()}/settings/public`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => res.json()).catch(() => ({ approvalSettings: { lecture: true, daija: true, organization: true } }))
      ]);

      const newData = {
        users: Array.isArray(usersRes) ? usersRes : (usersRes?.data ? (Array.isArray(usersRes.data) ? usersRes.data : []) : []),
        lectures: Array.isArray(lecturesRes) ? lecturesRes : (lecturesRes?.data ? (Array.isArray(lecturesRes.data) ? lecturesRes.data : []) : []),
        daije: Array.isArray(daijeRes) ? daijeRes : (daijeRes?.data ? (Array.isArray(daijeRes.data) ? daijeRes.data : []) : []),
        organizations: Array.isArray(orgsRes) ? orgsRes : (orgsRes?.data ? (Array.isArray(orgsRes.data) ? orgsRes.data : []) : []),
        suggestions: Array.isArray(suggestionsRes) ? suggestionsRes : (suggestionsRes?.data ? (Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []) : []),
        archivedSuggestions: Array.isArray(archivedSuggestionsRes) ? archivedSuggestionsRes : (archivedSuggestionsRes?.data ? (Array.isArray(archivedSuggestionsRes.data) ? archivedSuggestionsRes.data : []) : []),
        cancelledReports: Array.isArray(cancelledReportsRes?.reports) ? cancelledReportsRes.reports : (Array.isArray(cancelledReportsRes) ? cancelledReportsRes : [])
      };

      setData(newData);

      // Update approval settings from server
      if (settingsRes && settingsRes.approvalSettings) {
        setApprovalSettings(settingsRes.approvalSettings);
      }

      // Calculate counts
      const newCounts = {
        pendingDaije: (newData.daije || []).filter(d => d.status === 'pending').length,
        pendingOrganizations: (newData.organizations || []).filter(o => o.status === 'pending').length,
        pendingSuggestions: (newData.suggestions || []).filter(s => s.status === 'pending').length,
        pendingCancelledReports: (newData.cancelledReports || []).filter(r => r.status === 'pending').length,
        rejectedItems: [
          ...(newData.lectures || []).filter(l => l.status === 'rejected'),
          ...(newData.daije || []).filter(d => d.status === 'rejected'),
          ...(newData.organizations || []).filter(o => o.status === 'rejected')
        ].length
      };

      setCounts(newCounts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // Check if it's an authentication error
      if (error.response?.status === 403 || error.response?.status === 401) {
        Alert.alert(
          'Greška autentifikacije',
          'Molimo prijavite se ponovo.',
          [{ text: 'OK', onPress: onBack }]
        );
      } else {
        Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja podataka');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onBack]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Handle data changes (after approval/rejection/etc.)
  const handleDataChange = useCallback(async () => {
    await fetchData();
    // Notify parent component if callback provided
    if (onDataChange) {
      onDataChange();
    }
  }, [fetchData, onDataChange]);

  // Save approval settings to server
  const saveApprovalSettings = useCallback(async (newSettings) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return false;
      }

      const response = await fetch(`${getApiUrl()}/settings/approval-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        setApprovalSettings(newSettings);
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert('Greška', errorData.message || 'Greška pri spremanju postavki');
        return false;
      }
    } catch (error) {
      console.error('Error saving approval settings:', error);
      Alert.alert('Greška', 'Greška pri spremanju postavki');
      return false;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for auth events
  useEffect(() => {
    const unsubscribe = appEvents.on(AUTH_EVENTS.LOGIN_REQUIRED, () => {
      Alert.alert(
        'Sesija istekla',
        'Vaša sesija je istekla. Molimo prijavite se ponovo.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onBack) {
                onBack();
              }
            }
          }
        ],
        { cancelable: false }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [onBack]);

  return {
    // Data
    data,
    counts,
    approvalSettings,

    // UI States
    isLoading,
    refreshing,

    // Functions
    fetchData,
    onRefresh,
    handleDataChange,
    saveApprovalSettings,
    setApprovalSettings
  };
};

export default useMobileDashboardData;
