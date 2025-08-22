import { useState, useCallback } from 'react';

const useUndoRedo = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((newState) => {
    const updatedHistory = history.slice(0, currentIndex + 1);
    updatedHistory.push(newState);
    
    // Limit history to 50 items to prevent memory issues
    if (updatedHistory.length > 50) {
      updatedHistory.shift();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    
    setHistory(updatedHistory);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [history, currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const current = history[currentIndex];

  const reset = useCallback(() => {
    setHistory([initialState]);
    setCurrentIndex(0);
  }, [initialState]);

  return {
    state: current,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: history.length,
    currentIndex
  };
};

export default useUndoRedo;