import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.7)'
};

const LoadingOverlay = ({ 
  visible = false, 
  message = 'Učitavanje...',
  progress = null 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator 
            size="large" 
            color={COLORS.primary} 
          />
          <Text style={styles.message}>{message}</Text>
          {progress && (
            <Text style={styles.progress}>{progress}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
  progress: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
  },
});

export default LoadingOverlay;