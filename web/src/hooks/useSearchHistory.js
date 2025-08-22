import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dashboard_search_history';
const MAX_HISTORY_ITEMS = 10;

const useSearchHistory = (sectionKey) => {
  const [history, setHistory] = useState([]);
  
  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(parsed[sectionKey] || []);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    
    loadHistory();
  }, [sectionKey]);
  
  // Save search term to history
  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    
    setHistory(prev => {
      // Remove duplicates and add to beginning
      const filtered = prev.filter(item => item.toLowerCase() !== searchTerm.toLowerCase());
      const newHistory = [searchTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allHistory = stored ? JSON.parse(stored) : {};
        allHistory[sectionKey] = newHistory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return newHistory;
    });
  }, [sectionKey]);
  
  // Clear history for current section
  const clearHistory = useCallback(() => {
    setHistory([]);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allHistory = stored ? JSON.parse(stored) : {};
      delete allHistory[sectionKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, [sectionKey]);
  
  // Remove specific item from history
  const removeFromHistory = useCallback((searchTerm) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== searchTerm);
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allHistory = stored ? JSON.parse(stored) : {};
        allHistory[sectionKey] = newHistory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
      } catch (error) {
        console.error('Error removing from search history:', error);
      }
      
      return newHistory;
    });
  }, [sectionKey]);
  
  // Get suggestions based on partial input
  const getSuggestions = useCallback((input) => {
    if (!input || input.length < 1) return [];
    
    return history.filter(item => 
      item.toLowerCase().includes(input.toLowerCase())
    );
  }, [history]);
  
  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getSuggestions
  };
};

export default useSearchHistory;