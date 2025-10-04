import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import apiClient from '../services/apiClient';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';

const defaultValue = {
  lectures: [],
  daije: [],
  organizations: [],
  loading: true,
  error: null,
  refresh: async () => {}
};

const AppDataContext = createContext(defaultValue);

export const AppDataProvider = ({ children }) => {
  const [state, setState] = useState({
    lectures: [],
    daije: [],
    organizations: [],
    loading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [lecturesResponse, daijeResponse, organizationsResponse] = await Promise.all([
        apiClient.get('/lectures/public?status=all'),
        daijeService.getAllDaije(),
        udruzenjaService.getAllUdruzenja()
      ]);

      const lecturesData = Array.isArray(lecturesResponse?.data)
        ? lecturesResponse.data
        : Array.isArray(lecturesResponse)
          ? lecturesResponse
          : [];

      const lectures = lecturesData.map(lecture => ({
        ...lecture,
        type: 'predavanje'
      }));

      const daije = Array.isArray(daijeResponse) ? daijeResponse : [];
      const organizations = Array.isArray(organizationsResponse) ? organizationsResponse : [];

      setState({
        lectures,
        daije,
        organizations,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('AppDataProvider load error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Greška pri učitavanju podataka'
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = useMemo(() => ({
    ...state,
    refresh: loadData
  }), [state, loadData]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);

export default AppDataContext;
