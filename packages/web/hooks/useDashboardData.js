import { useState, useEffect, useCallback, useRef } from 'react';
import { predavanjaService, daijeService, udruzenjaService, suggestionsService, usersService } from '@/services';
import axiosInstance from '@/utils/axiosConfig';

/**
 * Custom hook for managing dashboard data fetching and state
 *
 * @param {boolean} canAccessDashboard - Whether the current user can access dashboard (moderator, admin, super_admin)
 * @param {object} currentUser - Current user object
 * @param {string} token - Authentication token
 * @param {boolean} authChecked - Whether auth check has completed
 * @returns {object} - Dashboard data and loading states
 */
export const useDashboardData = (canAccessDashboard, currentUser, token, authChecked = false) => {
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

  const fetchDataCalledRef = useRef(false);

  const fetchData = useCallback(async () => {
    console.log('📊 Dashboard fetchData: Starting data fetch...');
    console.log('📊 canAccessDashboard:', canAccessDashboard);
    console.log('📊 currentUser:', currentUser);
    console.log('📊 token:', !!token);

    setUi(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Only call admin endpoints if user can access dashboard (moderator, admin, super_admin)
      const promises = [];

      if (canAccessDashboard && token) {
        console.log('📊 User can access dashboard, calling admin endpoints...');
        promises.push(
          usersService.getAllUsers().catch(err => {
            console.error('Error fetching users:', err);
            return [];
          }),
          predavanjaService.getAllPredavanjaForAdmin().catch(err => {
            console.error('Error fetching admin lectures:', err);
            return predavanjaService.getAllPredavanja();
          }),
          daijeService.getAllDaijeForAdmin().catch(err => {
            console.error('Error fetching admin daije:', err);
            return daijeService.getAllDaije();
          }),
          udruzenjaService.getAllUdruzenjaForAdmin().catch(err => {
            console.error('Error fetching admin orgs:', err);
            return udruzenjaService.getAllUdruzenja();
          }),
          suggestionsService.getAllSuggestions().catch(err => {
            console.error('Error fetching suggestions:', err);
            return [];
          }),
          suggestionsService.getArchivedSuggestions().catch(err => {
            console.error('Error fetching archived suggestions:', err);
            return [];
          }),
          suggestionsService.getSuggestionsCount().catch(err => {
            console.error('Error fetching suggestions count:', err);
            return { total: 0, pending: 0, approved: 0, rejected: 0 };
          }),
          axiosInstance.get('/lectures/admin/cancellation-reports').then(res => res.data).catch(err => {
            console.error('Error fetching cancellation reports:', err);
            return { total: 0, pending: 0, autoCancelled: 0, manuallyCancelled: 0, lectures: [] };
          })
        );
      } else {
        console.log('📊 User cannot access dashboard, using public endpoints...');
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
  }, [canAccessDashboard, currentUser, token]);

  useEffect(() => {
    // Wait for auth check to complete before fetching data
    if (authChecked && !fetchDataCalledRef.current) {
      fetchDataCalledRef.current = true;
      fetchData();
    }
  }, [fetchData, authChecked]);

  return {
    data,
    counts,
    ui,
    fetchData,
    setData,
    setCounts,
    setUi
  };
};
