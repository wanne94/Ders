import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { calculateLecturesStatus } from '../utils/dataHelpers';

// Action types
const UPDATE_LECTURES = 'UPDATE_LECTURES';
const UPDATE_STATUS = 'UPDATE_STATUS';
const SET_UPDATE_INTERVAL = 'SET_UPDATE_INTERVAL';

// Initial state
const initialState = {
  lectures: [],
  lastUpdate: null,
  updateInterval: 60000, // 1 minute default
  isUpdating: false
};

// Reducer
const lectureStatusReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_LECTURES:
      return {
        ...state,
        lectures: action.payload,
        lastUpdate: new Date()
      };
    case UPDATE_STATUS:
      return {
        ...state,
        lectures: calculateLecturesStatus(state.lectures),
        lastUpdate: new Date(),
        isUpdating: false
      };
    case SET_UPDATE_INTERVAL:
      return {
        ...state,
        updateInterval: action.payload
      };
    default:
      return state;
  }
};

// Context
const LectureStatusContext = createContext();

// Provider component
export const LectureStatusProvider = ({ children }) => {
  const [state, dispatch] = useReducer(lectureStatusReducer, initialState);

  // Update lectures data
  const updateLectures = useCallback((lectures) => {
    const lecturesWithStatus = calculateLecturesStatus(lectures);
    dispatch({ type: UPDATE_LECTURES, payload: lecturesWithStatus });
  }, []);

  // Update status for existing lectures
  const updateStatus = useCallback(() => {
    dispatch({ type: UPDATE_STATUS });
  }, []);

  // Set update interval
  const setUpdateInterval = useCallback((interval) => {
    dispatch({ type: SET_UPDATE_INTERVAL, payload: interval });
  }, []);

  // Auto-update effect
  useEffect(() => {
    if (state.lectures.length === 0) return;

    const interval = setInterval(() => {
      updateStatus();
    }, state.updateInterval);

    return () => clearInterval(interval);
  }, [state.lectures.length, state.updateInterval, updateStatus]);

  const value = {
    lectures: state.lectures,
    lastUpdate: state.lastUpdate,
    updateInterval: state.updateInterval,
    isUpdating: state.isUpdating,
    updateLectures,
    updateStatus,
    setUpdateInterval
  };

  return (
    <LectureStatusContext.Provider value={value}>
      {children}
    </LectureStatusContext.Provider>
  );
};

// Custom hook to use the context
export const useLectureStatusContext = () => {
  const context = useContext(LectureStatusContext);
  if (!context) {
    throw new Error('useLectureStatusContext must be used within a LectureStatusProvider');
  }
  return context;
};

// Hook to get a specific lecture's status
export const useLectureById = (lectureId) => {
  const { lectures } = useLectureStatusContext();
  return lectures.find(lecture => lecture._id === lectureId) || null;
};

// Hook to get lectures by status
export const useLecturesByStatus = (status) => {
  const { lectures } = useLectureStatusContext();
  return lectures.filter(lecture => lecture.statusInfo?.status === status);
};