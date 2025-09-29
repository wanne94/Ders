import { useEffect } from 'react';
import { trace } from 'firebase/performance';
import { performance, isPerformanceAvailable } from '@/config/firebase';

export const usePerformanceTracking = (traceName) => {
  useEffect(() => {
    if (!isPerformanceAvailable()) return;

    let performanceTrace;
    
    const startTrace = async () => {
      try {
        performanceTrace = trace(performance, traceName);
        performanceTrace.start();
      } catch (error) {
        console.error('Error starting performance trace:', error);
      }
    };

    const stopTrace = () => {
      if (performanceTrace) {
        try {
          performanceTrace.stop();
        } catch (error) {
          console.error('Error stopping performance trace:', error);
        }
      }
    };

    startTrace();

    return () => {
      stopTrace();
    };
  }, [traceName]);
};

// Custom hook for measuring component mount time
export const useComponentMountTime = (componentName) => {
  useEffect(() => {
    if (!isPerformanceAvailable()) return;

    const mountTrace = trace(performance, `${componentName}_mount`);
    mountTrace.start();

    // Component mounted
    mountTrace.stop();
  }, [componentName]);
};

// Helper to measure async operations
export const measureAsyncOperation = async (operationName, operation) => {
  if (!isPerformanceAvailable()) {
    return await operation();
  }

  const operationTrace = trace(performance, operationName);
  operationTrace.start();

  try {
    const result = await operation();
    operationTrace.putAttribute('success', 'true');
    return result;
  } catch (error) {
    operationTrace.putAttribute('success', 'false');
    operationTrace.putAttribute('error', error.message);
    throw error;
  } finally {
    operationTrace.stop();
  }
};