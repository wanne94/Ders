import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: 'rgba(0, 0, 0, 0.8)',
};

// Create Toast Context
const ToastContext = createContext(null);

// Toast Component
const ToastComponent = ({ toast, onHide }) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (toast) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!toast) return null;

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: COLORS.error,
          icon: 'close-circle',
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: COLORS.info,
          icon: 'information-circle',
        };
      default:
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[styles.toast, { backgroundColor: config.backgroundColor }]}
      >
        <Ionicons name={config.icon} size={24} color={COLORS.white} />
        <Text style={styles.message} numberOfLines={3}>
          {toast.message}
        </Text>
        {toast.action && (
          <TouchableOpacity
            onPress={() => {
              toast.action.onPress();
              hideToast();
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{toast.action.text}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', options = {}) => {
    setToast({
      message,
      type,
      duration: options.duration || 3000,
      action: options.action || null,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const contextValue = {
    showToast,
    hideToast,
    showSuccess: (message, options) => showToast(message, 'success', options),
    showError: (message, options) => showToast(message, 'error', options),
    showWarning: (message, options) => showToast(message, 'warning', options),
    showInfo: (message, options) => showToast(message, 'info', options),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastComponent toast={toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

// Hook to use Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '90%',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default ToastContext;