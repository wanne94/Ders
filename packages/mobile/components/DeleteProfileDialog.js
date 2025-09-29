import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  error: '#f44336',
  background: '#f8fafc',
  border: '#e2e8f0',
  danger: '#dc3545'
};

const DeleteProfileDialog = ({ visible, onClose, onConfirm, loading = false }) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleClose = () => {
    setStep(1);
    setPassword('');
    setPasswordVisible(false);
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    if (!password.trim()) {
      Alert.alert('Greška', 'Molimo unesite vašu trenutnu lozinku.');
      return;
    }
    onConfirm(password);
  };

  const handleBackdropPress = () => {
    if (!loading) {
      handleClose();
    }
  };

  const renderStep1 = () => (
    <View style={styles.dialogContent}>
      <View style={styles.header}>
        <Ionicons name="warning" size={48} color={COLORS.danger} />
        <Text style={styles.title}>Obriši profil</Text>
      </View>
      
      <Text style={styles.warningText}>
        Ova akcija će trajno obrisati vaš profil i sve povezane podatke.
      </Text>
      
      <Text style={styles.warningSubtext}>
        • Svi vaši podaci će biti nepovratno obrisani{'\n'}
        • Nećete moći pristupiti aplikaciji{'\n'}
        • Ova akcija se ne može poništiti
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleClose}
        >
          <Text style={styles.cancelButtonText}>Otkaži</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.continueButton]} 
          onPress={handleFirstConfirm}
        >
          <Text style={styles.continueButtonText}>Nastavi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.dialogContent}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color={COLORS.danger} />
        <Text style={styles.title}>Potvrdite brisanje</Text>
      </View>
      
      <Text style={styles.passwordPrompt}>
        Da biste potvrdili brisanje profila, unesite vašu trenutnu lozinku:
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Trenutna lozinka"
          placeholderTextColor={COLORS.gray}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setPasswordVisible(!passwordVisible)}
          disabled={loading}
        >
          <Ionicons 
            name={passwordVisible ? "eye-off" : "eye"} 
            size={20} 
            color={COLORS.gray} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Nazad</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton, loading && styles.disabledButton]} 
          onPress={handleFinalConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.deleteButtonText}>Obriši profil</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={loading ? undefined : handleClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              {step === 1 ? renderStep1() : renderStep2()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  dialogContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  warningSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'left',
    lineHeight: 20,
    marginBottom: 24,
  },
  passwordPrompt: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.primary,
  },
  eyeButton: {
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DeleteProfileDialog;