import { useEffect, useRef, useState } from 'react';
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
import LectureForm from './forms/LectureForm.jsx';
import DaijaForm from './forms/DaijaForm.jsx';
import OrganizationForm from './forms/OrganizationForm.jsx';
import SuggestionForm from './forms/SuggestionForm.jsx';

const { height: screenHeight } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  background: '#f8fafc',
  border: '#e2e8f0',
};

const AddContentPopup = ({ visible, onClose, onSuccess, initialType = null }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [selectedType, setSelectedType] = useState(initialType);
  
  const contentTypes = [
    {
      id: 'lecture',
      title: 'Dodaj ders',
      description: 'Objavi novi ders',
      icon: 'book-outline',
      color: COLORS.primary
    },
    {
      id: 'daija',
      title: 'Dodaj Daiju',
      description: 'Dodaj novog daiju',
      icon: 'person-outline',
      color: COLORS.secondary
    },
    {
      id: 'organization',
      title: 'Dodaj Udruženje',
      description: 'Dodaj novo udruženje',
      icon: 'business-outline',
      color: COLORS.success
    },
    {
      id: 'suggestion',
      title: 'Prijedlog ili Izmjena',
      description: 'Predloži izmjenu ili poboljšanje',
      icon: 'bulb-outline',
      color: COLORS.warning
    }
  ];

  useEffect(() => {
    if (visible) {
      setSelectedType(initialType);
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
      // Reset selected type when closing
      setTimeout(() => setSelectedType(null), 300);
    }
  }, [visible, slideAnim, initialType]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleBackdropPress = () => {
    if (!selectedType) {
      onClose();
    }
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSuccess = () => {
    setSelectedType(null);
    onClose();
    // Call onSuccess callback to refresh data in parent component
    if (onSuccess) {
      onSuccess();
    }
  };

  const renderTypeSelection = () => (
    <Animated.View 
      style={[
        styles.bottomSheet,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Dodaj sadržaj</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardGrid}>
        {contentTypes.map((type) => (
          <TouchableOpacity 
            key={type.id} 
            style={styles.optionCard} 
            onPress={() => handleTypeSelect(type.id)}
          >
            <Ionicons name={type.icon} size={32} color={COLORS.gray} />
            <Text style={styles.cardTitle}>{type.title}</Text>
            <Text style={styles.cardDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderForm = () => {
    switch (selectedType) {
      case 'lecture':
        return <LectureForm onBack={handleBack} onSuccess={handleSuccess} />;
      case 'daija':
        return <DaijaForm onBack={handleBack} onSuccess={handleSuccess} />;
      case 'organization':
        return <OrganizationForm onBack={handleBack} onSuccess={handleSuccess} />;
      case 'suggestion':
        return <SuggestionForm onBack={handleBack} onSuccess={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={selectedType ? false : true}
      animationType="none"
      onRequestClose={selectedType ? handleBack : onClose}
    >
      {selectedType ? (
        renderForm()
      ) : (
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          {renderTypeSelection()}
        </View>
      )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.5,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
    gap: 12,
  },
  optionCard: {
    width: '45%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default AddContentPopup; 