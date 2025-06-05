import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Checkbox,
  ActivityIndicator,
  Portal,
  Modal,
  List,
  Divider,
  HelperText
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { SECURITY_QUESTIONS, getQuestionByIndex } from '../data/securityQuestions';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateName 
} from '../utils/authHelpers';
import { useBackHandler } from '../utils/useBackHandler';
import { useToast } from '../contexts/ToastContext';

const { height: screenHeight } = Dimensions.get('window');

const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestionIndex: '',
    securityAnswer: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityQuestionModalVisible, setSecurityQuestionModalVisible] = useState(false);

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: security question, 3: new password
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { 
    login, 
    register, 
    forgotPasswordVerifyEmail, 
    forgotPasswordVerifyAnswer, 
    forgotPasswordReset,
    rememberedEmail,
    rememberedPassword
  } = useAuth();

  const { showSuccess, showError } = useToast();

  // Load remembered credentials on component mount
  useEffect(() => {
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
    
    if (rememberedPassword) {
      setLoginData(prev => ({ ...prev, password: rememberedPassword }));
    }
  }, [rememberedEmail, rememberedPassword]);

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearMessages();
    
    // Reset forgot password state when switching tabs
    if (tab !== 'forgot') {
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setSecurityQuestion('');
    }
  };

  const handleLogin = async () => {
    clearMessages();
    
    // Detaljana validacija
    const errors = [];
    
    if (!loginData.email || !loginData.email.trim()) {
      errors.push('Email ili ime je obavezno');
    }
    
    if (!loginData.password || !loginData.password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (loginData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }

    if (errors.length > 0) {
      showError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(loginData.email, loginData.password, rememberMe);
      
      // Show success notification
      showSuccess(`Uspješno ste se prijavili!`, 3000);
      
      // Navigation is now handled automatically in AuthContext
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      
    } catch (error) {
      showError(error.message || 'Greška pri prijavi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessages();
    
    // Detaljana validacija
    const errors = [];
    
    if (!registerData.firstName || !registerData.firstName.trim()) {
      errors.push('Ime je obavezno');
    } else if (registerData.firstName.trim().length < 2) {
      errors.push('Ime mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(registerData.firstName.trim())) {
      errors.push('Ime može sadržavati samo slova');
    }
    
    if (!registerData.lastName || !registerData.lastName.trim()) {
      errors.push('Prezime je obavezno');
    } else if (registerData.lastName.trim().length < 2) {
      errors.push('Prezime mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(registerData.lastName.trim())) {
      errors.push('Prezime može sadržavati samo slova');
    }
    
    if (registerData.email && registerData.email.trim() && !/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.push('Email format nije ispravan');
    }
    
    if (!registerData.password || !registerData.password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (registerData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(registerData.password)) {
      errors.push('Lozinka mora sadržavati najmanje jedno malo i jedno veliko slovo');
    }
    
    if (!registerData.confirmPassword || !registerData.confirmPassword.trim()) {
      errors.push('Potvrda lozinke je obavezna');
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.push('Lozinke se ne podudaraju');
    }
    
    if (registerData.securityQuestionIndex === '' || registerData.securityQuestionIndex === null || registerData.securityQuestionIndex === undefined) {
      errors.push('Sigurnosno pitanje je obavezno');
    }
    
    if (!registerData.securityAnswer || !registerData.securityAnswer.trim()) {
      errors.push('Odgovor na sigurnosno pitanje je obavezan');
    } else if (registerData.securityAnswer.trim().length < 2) {
      errors.push('Odgovor na sigurnosno pitanje mora imati najmanje 2 karaktera');
    }

    if (errors.length > 0) {
      showError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register(registerData);
      
      // Show success notification
      showSuccess('Registracija uspješna! Dobrodošli!', 3000);
      
      // Navigation is now handled automatically in AuthContext
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      
    } catch (error) {
      showError(error.message || 'Greška pri registraciji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep1 = async () => {
    clearMessages();
    
    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.email || !forgotPasswordData.email.trim()) {
      errors.push('Email ili ime je obavezno');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await forgotPasswordVerifyEmail(forgotPasswordData.email);
      setSecurityQuestion(getQuestionByIndex(result.securityQuestionIndex));
      setForgotPasswordStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep2 = async () => {
    clearMessages();
    
    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.securityAnswer || !forgotPasswordData.securityAnswer.trim()) {
      errors.push('Odgovor na sigurnosno pitanje je obavezan');
    } else if (forgotPasswordData.securityAnswer.trim().length < 1) {
      errors.push('Odgovor mora imati najmanje 1 karakter');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    setIsLoading(true);
    
    try {
      await forgotPasswordVerifyAnswer(forgotPasswordData.email, forgotPasswordData.securityAnswer);
      setForgotPasswordStep(3);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordStep3 = async () => {
    clearMessages();
    
    // Detaljana validacija
    const errors = [];
    
    if (!forgotPasswordData.newPassword || !forgotPasswordData.newPassword.trim()) {
      errors.push('Nova lozinka je obavezna');
    } else if (forgotPasswordData.newPassword.length < 6) {
      errors.push('Nova lozinka mora imati najmanje 6 karaktera');
    }
    
    if (!forgotPasswordData.confirmNewPassword || !forgotPasswordData.confirmNewPassword.trim()) {
      errors.push('Potvrda nove lozinke je obavezna');
    }
    
    if (forgotPasswordData.newPassword && forgotPasswordData.confirmNewPassword && forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      errors.push('Lozinke se ne podudaraju');
    }

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    setIsLoading(true);
    
    try {
      await forgotPasswordReset(forgotPasswordData.email, forgotPasswordData.newPassword);
      setSuccess('Lozinka je uspješno resetovana! Možete se prijaviti sa novom lozinkom.');
      setActiveTab('login');
      
      // Reset forgot password form
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setSecurityQuestion('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionSelect = (index) => {
    setRegisterData(prev => ({ ...prev, securityQuestionIndex: index }));
    setSecurityQuestionModalVisible(false);
  };

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'login' && styles.activeTab]}
        onPress={() => handleTabChange('login')}
      >
        <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
          Prijava
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'register' && styles.activeTab]}
        onPress={() => handleTabChange('register')}
      >
        <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
          Registracija
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'forgot' && styles.activeTab]}
        onPress={() => handleTabChange('forgot')}
      >
        <Text style={[styles.tabText, activeTab === 'forgot' && styles.activeTabText]}>
          Zaboravljena lozinka
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        label="Email ili Ime"
        value={loginData.email}
        onChangeText={(text) => setLoginData(prev => ({ ...prev, email: text }))}
        mode="outlined"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        disabled={isLoading}
        returnKeyType="next"
        blurOnSubmit={false}
        placeholder="Unesite email ili ime"
      />
      
      <TextInput
        label="Šifra"
        value={loginData.password}
        onChangeText={(text) => setLoginData(prev => ({ ...prev, password: text }))}
        mode="outlined"
        secureTextEntry={!showLoginPassword}
        style={styles.input}
        disabled={isLoading}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        right={
          <TextInput.Icon
            icon={showLoginPassword ? "eye-off" : "eye"}
            onPress={() => setShowLoginPassword(!showLoginPassword)}
          />
        }
      />
      
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => setRememberMe(!rememberMe)}
          color={colors.primary.main}
        />
        <Text style={styles.checkboxLabel}>Zapamti me</Text>
      </View>
      
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.submitButton}
        disabled={isLoading}
        loading={isLoading}
      >
        Prijavi se
      </Button>
      
      <Button
        mode="text"
        onPress={() => handleTabChange('forgot')}
        style={styles.linkButton}
      >
        Zaboravili ste lozinku?
      </Button>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        label="Ime *"
        value={registerData.firstName}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, firstName: text }))}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
        returnKeyType="next"
        blurOnSubmit={false}
        autoCorrect={false}
      />
      
      <TextInput
        label="Prezime *"
        value={registerData.lastName}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, lastName: text }))}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
        returnKeyType="next"
        blurOnSubmit={false}
        autoCorrect={false}
      />
      
      <TextInput
        label="Email (opcionalno)"
        value={registerData.email}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, email: text }))}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        disabled={isLoading}
        returnKeyType="next"
        blurOnSubmit={false}
        placeholder="Unesite email (nije obavezno)"
      />
      
      <TextInput
        label="Šifra *"
        value={registerData.password}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, password: text }))}
        mode="outlined"
        secureTextEntry={!showRegisterPassword}
        style={styles.input}
        disabled={isLoading}
        returnKeyType="next"
        blurOnSubmit={false}
        right={
          <TextInput.Icon
            icon={showRegisterPassword ? "eye-off" : "eye"}
            onPress={() => setShowRegisterPassword(!showRegisterPassword)}
          />
        }
      />
      
      <TextInput
        label="Potvrda lozinke *"
        value={registerData.confirmPassword}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, confirmPassword: text }))}
        mode="outlined"
        secureTextEntry={!showConfirmPassword}
        style={styles.input}
        disabled={isLoading}
        error={registerData.confirmPassword !== '' && registerData.password !== registerData.confirmPassword}
        returnKeyType="next"
        blurOnSubmit={false}
        right={
          <TextInput.Icon
            icon={showConfirmPassword ? "eye-off" : "eye"}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
      />
      
      <TouchableOpacity
        style={styles.securityQuestionButton}
        onPress={() => setSecurityQuestionModalVisible(true)}
        disabled={isLoading}
      >
        <Text style={styles.securityQuestionButtonText}>
          {registerData.securityQuestionIndex !== '' 
            ? SECURITY_QUESTIONS[registerData.securityQuestionIndex]
            : 'Odaberite sigurnosno pitanje *'
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
      
      <TextInput
        label="Odgovor na sigurnosno pitanje *"
        value={registerData.securityAnswer}
        onChangeText={(text) => setRegisterData(prev => ({ ...prev, securityAnswer: text }))}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
        placeholder="Unesite vaš odgovor"
        returnKeyType="done"
        onSubmitEditing={handleRegister}
        autoCorrect={false}
      />
      
      <Card style={styles.warningCard}>
        <Card.Content>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color={colors.warning.main} />
            <Text style={styles.warningTitle}>Važno!</Text>
          </View>
          <Text style={styles.warningText}>
            Sigurnosno pitanje je jedini način za resetovanje lozinke! 
            Molimo vas da zapamtite odgovor koji ste unijeli.
          </Text>
        </Card.Content>
      </Card>
      
      <Button
        mode="contained"
        onPress={handleRegister}
        style={styles.submitButton}
        disabled={isLoading}
        loading={isLoading}
      >
        Registriraj se
      </Button>
    </View>
  );

  const renderForgotPasswordForm = () => {
    if (forgotPasswordStep === 1) {
      return (
        <View style={styles.formContainer}>
          <Title style={styles.stepTitle}>Unesite vaš email ili ime</Title>
          
          <TextInput
            label="Email ili Ime"
            value={forgotPasswordData.email}
            onChangeText={(text) => setForgotPasswordData(prev => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            disabled={isLoading}
            returnKeyType="done"
            onSubmitEditing={handleForgotPasswordStep1}
            placeholder="Unesite email ili ime"
          />
          
          <Button
            mode="contained"
            onPress={handleForgotPasswordStep1}
            style={styles.submitButton}
            disabled={isLoading}
            loading={isLoading}
          >
            Nastavi
          </Button>
          
          <Button
            mode="text"
            onPress={() => handleTabChange('login')}
            style={styles.linkButton}
          >
            Nazad na prijavu
          </Button>
        </View>
      );
    }

    if (forgotPasswordStep === 2) {
      return (
        <View style={styles.formContainer}>
          <Title style={styles.stepTitle}>Odgovorite na sigurnosno pitanje</Title>
          
          <Card style={styles.questionCard}>
            <Card.Content>
              <Text style={styles.questionText}>{securityQuestion}</Text>
            </Card.Content>
          </Card>
          
          <TextInput
            label="Vaš odgovor"
            value={forgotPasswordData.securityAnswer}
            onChangeText={(text) => setForgotPasswordData(prev => ({ ...prev, securityAnswer: text }))}
            mode="outlined"
            style={styles.input}
            disabled={isLoading}
            returnKeyType="done"
            onSubmitEditing={handleForgotPasswordStep2}
            autoCorrect={false}
          />
          
          <Button
            mode="contained"
            onPress={handleForgotPasswordStep2}
            style={styles.submitButton}
            disabled={isLoading}
            loading={isLoading}
          >
            Potvrdi
          </Button>
          
          <Button
            mode="text"
            onPress={() => setForgotPasswordStep(1)}
            style={styles.linkButton}
          >
            Nazad
          </Button>
        </View>
      );
    }

    if (forgotPasswordStep === 3) {
      return (
        <View style={styles.formContainer}>
          <Title style={styles.stepTitle}>Unesite novu lozinku</Title>
          
          <TextInput
            label="Nova lozinka"
            value={forgotPasswordData.newPassword}
            onChangeText={(text) => setForgotPasswordData(prev => ({ ...prev, newPassword: text }))}
            mode="outlined"
            secureTextEntry={!showNewPassword}
            style={styles.input}
            disabled={isLoading}
            returnKeyType="next"
            blurOnSubmit={false}
            right={
              <TextInput.Icon
                icon={showNewPassword ? "eye-off" : "eye"}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
          />
          
          <TextInput
            label="Potvrda nove lozinke"
            value={forgotPasswordData.confirmNewPassword}
            onChangeText={(text) => setForgotPasswordData(prev => ({ ...prev, confirmNewPassword: text }))}
            mode="outlined"
            secureTextEntry={!showConfirmNewPassword}
            style={styles.input}
            disabled={isLoading}
            error={forgotPasswordData.confirmNewPassword !== '' && forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword}
            returnKeyType="done"
            onSubmitEditing={handleForgotPasswordStep3}
            right={
              <TextInput.Icon
                icon={showConfirmNewPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              />
            }
          />
          
          <Button
            mode="contained"
            onPress={handleForgotPasswordStep3}
            style={styles.submitButton}
            disabled={isLoading}
            loading={isLoading}
          >
            Resetuj lozinku
          </Button>
        </View>
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            enableOnAndroid={true}
          >
            <View style={styles.header}>
              <Title style={styles.appTitle}>DERS Aplikacija</Title>
              <Paragraph style={styles.appSubtitle}>
                Dobrodošli u aplikaciju za predavanja
              </Paragraph>
            </View>

            {renderTabButtons()}

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

            {activeTab === 'login' && renderLoginForm()}
            {activeTab === 'register' && renderRegisterForm()}
            {activeTab === 'forgot' && renderForgotPasswordForm()}
            
            {/* Add some bottom padding for keyboard */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Security Question Modal */}
        <Portal>
          <Modal
            visible={securityQuestionModalVisible}
            onDismiss={() => setSecurityQuestionModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card>
              <Card.Content>
                <Title style={styles.modalTitle}>Odaberite sigurnosno pitanje</Title>
                <ScrollView style={styles.questionsList}>
                  {SECURITY_QUESTIONS.map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.questionItem}
                      onPress={() => handleSecurityQuestionSelect(index)}
                    >
                      <Text style={styles.questionItemText}>{question}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button
                  mode="text"
                  onPress={() => setSecurityQuestionModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  Otkaži
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.text.onPrimary,
  },
  formContainer: {
    flex: 1,
    minHeight: 300,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background.paper,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text.primary,
  },
  submitButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  linkButton: {
    marginBottom: 8,
  },
  securityQuestionButton: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    minHeight: 56,
  },
  securityQuestionButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  warningCard: {
    marginBottom: 20,
    backgroundColor: colors.warning.light,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning.main,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning.dark,
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 20,
    textAlign: 'center',
  },
  questionCard: {
    marginBottom: 20,
    backgroundColor: colors.primary.light,
  },
  questionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.primary.dark,
    textAlign: 'center',
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
  questionsList: {
    maxHeight: 300,
  },
  questionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  questionItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalCloseButton: {
    marginTop: 16,
  },
  bottomPadding: {
    height: 100,
  },
});

export default AuthScreen; 