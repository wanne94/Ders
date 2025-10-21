import { useState, useEffect, useCallback, useRef } from 'react';
import { predavanjaService, daijeService, udruzenjaService, suggestionsService, usersService } from '@/services';
import axiosInstance from '@/utils/axiosConfig';

/**
 * Custom hook for managing dashboard data fetching and state
 *
 * @param {boolean} isAdmin - Whether the current user is an admin
 * @param {object} currentUser - Current user object
 * @param {string} token - Authentication token
 * @returns {object} - Dashboard data and loading states
 */
export const useDashboardData = (isAdmin, currentUser, token) => {
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
    console.log('📊 isAdmin:', isAdmin);
    console.log('📊 currentUser:', currentUser);
    console.log('📊 token:', !!token);

    setUi(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Extract data fetching logic from dashboard.jsx
      // This will be filled in during refactoring

      setUi(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (error) {
      console.error('📊 Error fetching dashboard data:', error);
      setUi(prev => ({ ...prev, isLoading: false, error: 'Greška pri dohvaćanju podataka.' }));
    }
  }, [isAdmin, currentUser, token]);

  useEffect(() => {
    if (!fetchDataCalledRef.current) {
      fetchDataCalledRef.current = true;
      fetchData();
    }
  }, [fetchData]);

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
