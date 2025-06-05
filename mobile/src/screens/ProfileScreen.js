import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Avatar,
  Divider,
  ActivityIndicator,
  Portal,
  Modal,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { SECURITY_QUESTIONS } from '../data/securityQuestions';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateName 
} from '../utils/authHelpers';
import { useBackHandler } from '../utils/useBackHandler';

const ProfileScreen = ({ navigation }) => {
  const { 
    user, 
    updateProfile, 
    getUserDisplayName, 
    getUserInitials,
    changePassword,
    changeSecurityQuestion,
    logout
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Security question change state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    securityQuestionIndex: '',
    securityAnswer: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    console.log('🔍 ProfileScreen - user object:', user);
    console.log('🔍 ProfileScreen - user keys:', user ? Object.keys(user) : 'no user');
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
      console.log('🔍 ProfileScreen - profileData set:', {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Clear error and success messages on component mount
  useEffect(() => {
    setError('');
    setSuccess('');
  }, []);

  // Clear error and success messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setError('');
      setSuccess('');
    }, [])
  );

  // Monitor user state for automatic logout navigation
  useEffect(() => {
    if (!isLoading && !user && navigation) {
      console.log('👤 User logged out, navigating to Auth screen');
      // Navigate to Auth screen when user is logged out
      try {
        navigation.navigate('Auth');
      } catch (navError) {
        console.error('❌ Navigation error in ProfileScreen:', navError);
        // If navigation fails, we can't do much here since user is already logged out
      }
    }
  }, [user, isLoading, navigation]);

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    clearMessages();
    
    // Validation
    if (!validateName(profileData.firstName)) {
      setError('Ime mora imati najmanje 2 karaktera');
      return;
    }
    
    if (!validateName(profileData.lastName)) {
      setError('Prezime mora imati najmanje 2 karaktera');
      return;
    }
    
    if (!validateEmail(profileData.email)) {
      setError('Molimo unesite valjan email');
      return;
    }

    setIsLoading(true);
    
    try {
      await updateProfile(profileData);
      setSuccess('Profil je uspješno ažuriran!');
      setIsEditing(false);
    } catch (error) {
      console.log('Greška prilikom ažuriranja profila:', error);
      
      // Get error message with priority hierarchy
      const errorMessage = error?.response?.data?.message || error?.message;
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        if (errorMessage?.includes('dozvolu') || errorMessage?.includes('administratorske')) {
          setError('Nemate dozvolu za izmjenu ovog profila.');
        } else if (errorMessage?.includes('token') || errorMessage?.includes('Token')) {
          setError('Vaša sesija je istekla. Molimo prijavite se ponovo.');
        } else {
          setError('Nemate dozvolu za ovu akciju.');
        }
      } else if (error?.response?.status === 401) {
        setError('Niste prijavljeni. Molimo prijavite se ponovo.');
      } else if (error?.response?.status === 400) {
        if (errorMessage?.includes('email') && errorMessage?.includes('upotrebi')) {
          setError('Email adresa je već u upotrebi od strane drugog korisnika.');
        } else {
          setError(errorMessage || 'Neispravni podaci. Molimo provjerite unos.');
        }
      } else if (error?.response?.status === 404) {
        setError('Korisnik nije pronađen. Molimo prijavite se ponovo.');
      } else if (error?.response?.status >= 500) {
        setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
      } else {
        // Fallback for any other errors
        setError(errorMessage || 'Došlo je do neočekivane greške prilikom ažuriranja profila.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    clearMessages();
    
    if (!passwordData.currentPassword) {
      setError('Molimo unesite trenutnu lozinku');
      return;
    }
    
    if (!validatePassword(passwordData.newPassword)) {
      setError('Nova lozinka mora imati najmanje 6 karaktera');
      return;
    }
    
    if (!validatePasswordMatch(passwordData.newPassword, passwordData.confirmNewPassword)) {
      setError('Nove lozinke se ne poklapaju');
      return;
    }

    setIsLoading(true);
    
    try {
      await changePassword(passwordData);
      setSuccess('Lozinka je uspješno promijenjena!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      console.log('Greška prilikom promjene lozinke:', error);
      
      // Get error message with priority hierarchy
      const errorMessage = error?.response?.data?.message || error?.message;
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        if (errorMessage?.includes('dozvolu') || errorMessage?.includes('administratorske')) {
          setError('Nemate dozvolu za promjenu lozinke.');
        } else if (errorMessage?.includes('token') || errorMessage?.includes('Token')) {
          setError('Vaša sesija je istekla. Molimo prijavite se ponovo.');
        } else {
          setError('Nemate dozvolu za ovu akciju.');
        }
      } else if (error?.response?.status === 401) {
        setError('Niste prijavljeni. Molimo prijavite se ponovo.');
      } else if (error?.response?.status === 400) {
        if (errorMessage?.includes('trenutna') && errorMessage?.includes('tačna')) {
          setError('Trenutna lozinka nije tačna. Molimo pokušajte ponovo.');
        } else {
          setError(errorMessage || 'Neispravni podaci. Molimo provjerite unos.');
        }
      } else if (error?.response?.status === 404) {
        setError('Korisnik nije pronađen. Molimo prijavite se ponovo.');
      } else if (error?.response?.status >= 500) {
        setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
      } else {
        // Fallback for any other errors
        setError(errorMessage || 'Došlo je do neočekivane greške prilikom promjene lozinke.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSecurityQuestion = async () => {
    clearMessages();
    
    if (!securityData.currentPassword) {
      setError('Molimo unesite trenutnu lozinku');
      return;
    }
    
    if (securityData.securityQuestionIndex === '') {
      setError('Molimo odaberite sigurnosno pitanje');
      return;
    }
    
    if (!securityData.securityAnswer.trim()) {
      setError('Molimo unesite odgovor na sigurnosno pitanje');
      return;
    }

    setIsLoading(true);
    
    try {
      await changeSecurityQuestion(securityData);
      setSuccess('Sigurnosno pitanje je uspješno promijenjeno!');
      setShowSecurityModal(false);
      setSecurityData({
        currentPassword: '',
        securityQuestionIndex: '',
        securityAnswer: ''
      });
    } catch (error) {
      console.log('Greška prilikom promjene sigurnosnog pitanja:', error);
      
      // Get error message with priority hierarchy
      const errorMessage = error?.response?.data?.message || error?.message;
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        if (errorMessage?.includes('dozvolu') || errorMessage?.includes('administratorske')) {
          setError('Nemate dozvolu za promjenu sigurnosnog pitanja.');
        } else if (errorMessage?.includes('token') || errorMessage?.includes('Token')) {
          setError('Vaša sesija je istekla. Molimo prijavite se ponovo.');
        } else {
          setError('Nemate dozvolu za ovu akciju.');
        }
      } else if (error?.response?.status === 401) {
        setError('Niste prijavljeni. Molimo prijavite se ponovo.');
      } else if (error?.response?.status === 400) {
        if (errorMessage?.includes('trenutna') && errorMessage?.includes('tačna')) {
          setError('Trenutna lozinka nije tačna. Molimo pokušajte ponovo.');
        } else if (errorMessage?.includes('indeks')) {
          setError('Nevaljan izbor sigurnosnog pitanja. Molimo odaberite ponovo.');
        } else {
          setError(errorMessage || 'Neispravni podaci. Molimo provjerite unos.');
        }
      } else if (error?.response?.status === 404) {
        setError('Korisnik nije pronađen. Molimo prijavite se ponovo.');
      } else if (error?.response?.status >= 500) {
        setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
      } else {
        // Fallback for any other errors
        setError(errorMessage || 'Došlo je do neočekivane greške prilikom promjene sigurnosnog pitanja.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileInfo = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{getUserDisplayName(user) || 'Korisnik'}</Title>
            <Text style={styles.userEmail}>{user?.email || 'Nema email adrese'}</Text>
            {user?.role && user.role !== 'user' && (
              <Text style={styles.userRole}>
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'super_admin' ? 'Super Administrator' : user.role}
              </Text>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderProfileForm = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Osnovne informacije</Title>
          {!isEditing ? (
            <Button
              mode="outlined"
              onPress={() => setIsEditing(true)}
              compact
            >
              Uredi
            </Button>
          ) : (
            <View style={styles.editButtons}>
              <Button
                mode="text"
                onPress={() => {
                  setIsEditing(false);
                  // Reset to original data
                  setProfileData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || ''
                  });
                }}
                compact
              >
                Otkaži
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={isLoading}
                disabled={isLoading}
                compact
              >
                Sačuvaj
              </Button>
            </View>
          )}
        </View>

        <TextInput
          label="Ime"
          value={profileData.firstName || ''}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
          mode="outlined"
          style={styles.input}
          disabled={!isEditing || isLoading}
          autoCorrect={false}
          placeholder="Unesite vaše ime"
        />

        <TextInput
          label="Prezime"
          value={profileData.lastName || ''}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
          mode="outlined"
          style={styles.input}
          disabled={!isEditing || isLoading}
          autoCorrect={false}
          placeholder="Unesite vaše prezime"
        />

        <TextInput
          label="Email ili Ime"
          value={profileData.email || ''}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          disabled={!isEditing || isLoading}
          placeholder="Unesite email ili korisničko ime"
        />
      </Card.Content>
    </Card>
  );

  const renderSecurityOptions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>Sigurnost</Title>
        
        <List.Item
          title="Promijeni lozinku"
          description="Osvježi svoju lozinku"
          left={(props) => <List.Icon {...props} icon="lock-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowPasswordModal(true)}
          style={styles.listItem}
        />

        <Divider />

        <List.Item
          title="Promijeni sigurnosno pitanje"
          description="Osvježi sigurnosno pitanje za resetovanje lozinke"
          left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowSecurityModal(true)}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  const renderPasswordModal = () => (
    <Portal>
      <Modal
        visible={showPasswordModal}
        onDismiss={() => setShowPasswordModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Title style={styles.modalTitle}>Promijeni lozinku</Title>

            <TextInput
              label="Trenutna šifra"
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              mode="outlined"
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? "eye-off" : "eye"}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            />

            <TextInput
              label="Nova šifra"
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              mode="outlined"
              secureTextEntry={!showNewPassword}
              style={styles.input}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? "eye-off" : "eye"}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />

            <TextInput
              label="Potvrdi novu lozinku"
              value={passwordData.confirmNewPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmNewPassword: text }))}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              disabled={isLoading}
              error={passwordData.confirmNewPassword !== '' && passwordData.newPassword !== passwordData.confirmNewPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <View style={styles.modalButtons}>
              <Button
                mode="text"
                onPress={() => setShowPasswordModal(false)}
                disabled={isLoading}
              >
                Otkaži
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={isLoading}
                disabled={isLoading}
              >
                Promijeni
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderSecurityModal = () => (
    <Portal>
      <Modal
        visible={showSecurityModal}
        onDismiss={() => setShowSecurityModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Title style={styles.modalTitle}>Promijeni sigurnosno pitanje</Title>

            <TextInput
              label="Trenutna lozinka"
              value={securityData.currentPassword}
              onChangeText={(text) => setSecurityData(prev => ({ ...prev, currentPassword: text }))}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              disabled={isLoading}
            />

            <Text style={styles.selectLabel}>Novo sigurnosno pitanje:</Text>
            <ScrollView style={styles.questionsList}>
              {SECURITY_QUESTIONS.map((question, index) => (
                <List.Item
                  key={index}
                  title={question}
                  onPress={() => setSecurityData(prev => ({ ...prev, securityQuestionIndex: index }))}
                  style={[
                    styles.questionItem,
                    securityData.securityQuestionIndex === index && styles.selectedQuestion
                  ]}
                  titleNumberOfLines={2}
                />
              ))}
            </ScrollView>

            <TextInput
              label="Novi odgovor"
              value={securityData.securityAnswer}
              onChangeText={(text) => setSecurityData(prev => ({ ...prev, securityAnswer: text }))}
              mode="outlined"
              style={styles.input}
              disabled={isLoading}
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="text"
                onPress={() => setShowSecurityModal(false)}
                disabled={isLoading}
              >
                Otkaži
              </Button>
              <Button
                mode="contained"
                onPress={handleChangeSecurityQuestion}
                loading={isLoading}
                disabled={isLoading}
              >
                Promijeni
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Učitavanje profila...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <Card style={[styles.messageCard, styles.errorCard]}>
              <Card.Content>
                <View style={styles.messageContent}>
                  <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </Card.Content>
            </Card>
          ) : null}

          {success ? (
            <Card style={[styles.messageCard, styles.successCard]}>
              <Card.Content>
                <View style={styles.messageContent}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              </Card.Content>
            </Card>
          ) : null}

          {renderProfileInfo()}
          {renderProfileForm()}
          {renderSecurityOptions()}
        </ScrollView>

        {renderPasswordModal()}
        {renderSecurityModal()}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.background.paper,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  userSection: {
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background.paper,
  },
  listItem: {
    paddingVertical: 8,
  },
  messageCard: {
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: colors.error.light,
  },
  successCard: {
    backgroundColor: colors.success.light,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  successText: {
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  questionsList: {
    maxHeight: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 4,
  },
  questionItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  selectedQuestion: {
    backgroundColor: colors.primary.light,
  },
});

export default ProfileScreen; 