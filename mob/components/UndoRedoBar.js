import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
};

const UndoRedoBar = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo,
  message,
  visible = false
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          {message && (
            <Text style={styles.message} numberOfLines={1}>
              {message}
            </Text>
          )}
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              !canUndo && styles.buttonDisabled
            ]}
            onPress={onUndo}
            disabled={!canUndo}
          >
            <Ionicons 
              name="arrow-undo" 
              size={20} 
              color={canUndo ? COLORS.primary : COLORS.gray} 
            />
            <Text style={[
              styles.buttonText,
              !canUndo && styles.buttonTextDisabled
            ]}>
              Poništi
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.button,
              !canRedo && styles.buttonDisabled
            ]}
            onPress={onRedo}
            disabled={!canRedo}
          >
            <Ionicons 
              name="arrow-redo" 
              size={20} 
              color={canRedo ? COLORS.primary : COLORS.gray} 
            />
            <Text style={[
              styles.buttonText,
              !canRedo && styles.buttonTextDisabled
            ]}>
              Ponovi
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flex: 1,
    marginRight: 16,
  },
  message: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: COLORS.gray,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
});

export default UndoRedoBar;