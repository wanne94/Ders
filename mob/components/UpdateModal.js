import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

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

const UpdateModal = ({ 
  visible, 
  currentVersion, 
  latestVersion, 
  isForceUpdate, 
  onUpdate, 
  onDismiss 
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={!isForceUpdate ? onDismiss : undefined}
      onBackButtonPress={!isForceUpdate ? onDismiss : undefined}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Ionicons name="cloud-download" size={48} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>
          {isForceUpdate ? 'Obavezno ažuriranje' : 'Nova verzija dostupna'}
        </Text>

        <Text style={styles.description}>
          {isForceUpdate 
            ? 'Molimo ažurirajte aplikaciju da biste nastavili koristiti Ders.ba'
            : 'Dostupna je nova verzija aplikacije sa poboljšanjima i ispravkama'}
        </Text>

        <View style={styles.versionInfo}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Trenutna verzija:</Text>
            <Text style={styles.versionValue}>{currentVersion}</Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Nova verzija:</Text>
            <Text style={[styles.versionValue, styles.newVersion]}>{latestVersion}</Text>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Što je novo:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Poboljšane performanse</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Ispravke grešaka</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Novi sadržaji i funkcionalnosti</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Ažuriraj sada</Text>
          </TouchableOpacity>

          {!isForceUpdate && (
            <TouchableOpacity
              style={[styles.button, styles.laterButton]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.laterButtonText}>Kasnije</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: screenWidth - 40,
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  versionInfo: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  newVersion: {
    color: COLORS.success,
  },
  features: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
  },
  buttons: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    backgroundColor: COLORS.lightGray,
  },
  laterButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UpdateModal;