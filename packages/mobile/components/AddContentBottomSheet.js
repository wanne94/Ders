import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
};

const AddContentBottomSheet = ({ visible, onClose, onOptionSelect }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  
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
      title: 'Prijedlog / Izmjena',
      icon: 'bulb-outline',
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleOptionPress = (option) => {
    onOptionSelect(option.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.handle} />
          
          <View style={styles.content}>
            {contentOptions.map((option, index) => (
              <TouchableOpacity 
                key={option.id} 
                style={[
                  styles.optionItem,
                  index === contentOptions.length - 1 && styles.lastOption
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <Ionicons name={option.icon} size={20} color={COLORS.gray} />
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray} style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area for iPhone
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 12,
    fontWeight: '400',
  },
  chevron: {
    opacity: 0.5,
  },
});

export default AddContentBottomSheet;