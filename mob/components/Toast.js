import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',
};

const Toast = ({ visible, message, type = 'success', duration = 3000, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle-outline',
        };
      case 'error':
        return {
          backgroundColor: COLORS.error,
          icon: 'close-circle-outline',
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: 'warning-outline',
        };
      case 'info':
        return {
          backgroundColor: COLORS.info,
          icon: 'information-circle-outline',
        };
      default:
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle-outline',
        };
    }
  };

  useEffect(() => {
    if (visible) {
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
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, opacityAnim, slideAnim]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={config.icon} size={24} color={COLORS.white} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 12,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default Toast; 