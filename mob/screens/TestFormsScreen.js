import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import enhanced forms
import LectureFormEnhanced from '../components/forms/LectureFormEnhanced';
import DaijaFormEnhanced from '../components/forms/DaijaFormEnhanced';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  background: '#f8fafc',
  border: '#e2e8f0',
};

const TestFormsScreen = () => {
  const [currentForm, setCurrentForm] = useState(null);

  const forms = [
    {
      id: 'lecture',
      title: 'Napredna forma za predavanja',
      description: 'Testiranje forme sa podrškom za više daija i sedmične opcije',
      icon: 'calendar-outline',
      component: LectureFormEnhanced
    },
    {
      id: 'daija',
      title: 'Napredna forma za daije',
      description: 'Testiranje forme sa socijalnim mrežama',
      icon: 'person-outline',
      component: DaijaFormEnhanced
    }
  ];

  const handleFormSelect = (formId) => {
    setCurrentForm(formId);
  };

  const handleBack = () => {
    setCurrentForm(null);
  };

  const handleSuccess = () => {
    console.log('Form submitted successfully!');
    setCurrentForm(null);
  };

  if (currentForm) {
    const FormComponent = forms.find(f => f.id === currentForm)?.component;
    if (FormComponent) {
      return (
        <FormComponent
          onBack={handleBack}
          onSuccess={handleSuccess}
          editMode={false}
        />
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Formi</Text>
        <Text style={styles.headerSubtitle}>Odaberite formu za testiranje</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {forms.map((form) => (
          <TouchableOpacity
            key={form.id}
            style={styles.formCard}
            onPress={() => handleFormSelect(form.id)}
          >
            <View style={styles.formIcon}>
              <Ionicons name={form.icon} size={32} color={COLORS.primary} />
            </View>
            <View style={styles.formInfo}>
              <Text style={styles.formTitle}>{form.title}</Text>
              <Text style={styles.formDescription}>{form.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Nove funkcionalnosti:</Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>✓ Combobox sa pretragom</Text>
            <Text style={styles.feature}>✓ Image Selector sa preview</Text>
            <Text style={styles.feature}>✓ Podrška za više daija</Text>
            <Text style={styles.feature}>✓ Sedmične opcije</Text>
            <Text style={styles.feature}>✓ Custom predavači</Text>
            <Text style={styles.feature}>✓ Socijalne mreže</Text>
            <Text style={styles.feature}>✓ Loading overlay</Text>
            <Text style={styles.feature}>✓ Poboljšane validacije</Text>
            <Text style={styles.feature}>✓ Izbor postojećih slika</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formInfo: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 15,
    color: COLORS.gray,
    paddingVertical: 4,
  },
});

export default TestFormsScreen;