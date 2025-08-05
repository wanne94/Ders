import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  textDark: '#333333',
};

const UpdateBanner = ({ 
  currentVersion, 
  latestVersion, 
  onUpdate, 
  onDismiss 
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.iconWrapper}>
            <Ionicons name="cloud-download-outline" size={24} color={COLORS.white} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Nova verzija {latestVersion}</Text>
            <Text style={styles.subtitle}>Dodirnite za ažuriranje</Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Ažuriraj</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdateBanner;