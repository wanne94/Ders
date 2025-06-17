import { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const AddContentMenu = ({ visible, onOptionSelect, onClose }) => {
  const translateYAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  const contentOptions = [
    {
      id: 'lecture',
      title: 'Dodaj ders',
      icon: 'book-outline',
    },
    {
      id: 'daija',
      title: 'Dodaj daiju',
      icon: 'person-outline',
    },
    {
      id: 'organization',
      title: 'Dodaj udruženje',
      icon: 'business-outline',
    },
    {
      id: 'suggestion',
      title: 'Prijedlog',
      icon: 'bulb-outline',
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, translateYAnim, opacityAnim]);

  const handleOptionPress = (option) => {
    onOptionSelect(option.id);
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.menuContainer,
          {
            transform: [{ translateY: translateYAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <View style={styles.menu}>
          {contentOptions.map((option, index) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.menuItem,
                index === contentOptions.length - 1 && styles.lastMenuItem
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <Ionicons name={option.icon} size={18} color={COLORS.primary} />
              <Text style={styles.menuText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 90, // Pozicioniraj iznad bottom navigation-a
    alignSelf: 'center',
    zIndex: 1000,
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default AddContentMenu;