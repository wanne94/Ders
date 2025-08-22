import { useState, useCallback } from 'react';

const useUndoRedo = (initialState) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([{ state: initialState, description: 'Initial state' }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const set = useCallback((newState, actionDescription = '') => {
    const resolvedState = typeof newState === 'function' ? newState(state) : newState;
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ state: resolvedState, description: actionDescription });
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setState(resolvedState);
  }, [state, history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex].state || history[newIndex]);
      return history[currentIndex].description;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex].state || history[newIndex]);
      return history[newIndex].description;
    }
    return null;
  }, [currentIndex, history]);

  const reset = useCallback(() => {
    setHistory([{ state: initialState, description: 'Initial state' }]);
    setCurrentIndex(0);
    setState(initialState);
  }, [initialState]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return [
    state,
    set,
    {
      undo,
      redo,
      reset,
      canUndo,
      canRedo,
      history: history.map(h => h && h.description ? h.description : 'Action'),
      currentIndex
    }
  ];
};

export default useUndoRedo;