import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SystemBars } from 'react-native-edge-to-edge';
import { Picker } from '@react-native-picker/picker';

import { authService } from '../services/authService';
import { SECURITY_QUESTIONS, getQuestionByIndex } from '../constants/securityQuestions';
import {
  setToken,
  setUserData,
  getRememberedCredentials,
  setRememberedCredentials,
  clearRememberedCredentials
} from '../utils/authHelpers';

const { width } = Dimensions.get('window');

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

const AuthScreen = ({ onBack, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(0); // 0: Login, 1: Register, 2: Forgot Password
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestionIndex: '',
    securityAnswer: ''
  });

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: security question, 3: new password
  const [securityQuestion, setSecurityQuestion] = useState('');

  // Load remembered credentials
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const { email, password } = await getRememberedCredentials();
        if (email) {
          setLoginData(prev => ({ ...prev, email }));
          setRememberMe(true);
        }
        if (password) {
          setLoginData(prev => ({ ...prev, password }));
        }
      } catch (error) {
        console.error('Error loading remembered credentials:', error);
      }
    };
    
    loadRememberedCredentials();
  }, []);

  // Handle login
  const handleLogin = async () => {
    // Detailed validation like web version
    const errors = [];
    
    if (!loginData.email || !loginData.email.trim()) {
      errors.push('Email ili korisničko ime je obavezno');
    }
    
    if (!loginData.password) {
      errors.push('Lozinka je obavezna');
    }

    if (errors.length > 0) {
      const errorMessage = 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
      Alert.alert('Greška', errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      console.log('📱 Mobile login attempt:', { email: loginData.email, password: '***' });
      
      const response = await authService.login(loginData.email, loginData.password);
      
      console.log('📱 Mobile login response:', response);
      
      const { token, user } = response;

      if (!token || !user) {
        throw new Error('Token ili korisničke informacije nisu pronađene u odgovoru');
      }

      // Store auth data
      await setToken(token);
      await setUserData(user);

      console.log('📱 Auth data stored successfully');

      // Handle remember me
      if (rememberMe) {
        await setRememberedCredentials(loginData.email, loginData.password);
      } else {
        await clearRememberedCredentials();
      }

      Alert.alert('Uspjeh', `Dobrodošli, ${user.username}!`);
      
      // Call success callback
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }

    } catch (error) {
      let errorMessage = 'Greška pri prijavi';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Neispravni podaci za prijavu';
      } else if (error.response?.status === 401) {
        errorMessage = 'Pogrešan email/korisničko ime ili lozinka';
      } else if (error.response?.status === 404) {
        errorMessage = 'Korisnik sa ovim emailom/korisničkim imenom nije pronađen';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Greška na serveru. Molimo pokušajte ponovo.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      Alert.alert('Greška', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register
  const handleRegister = async () => {
    // Detailed validation like web version
    const errors = [];
    
    if (!registerData.username || !registerData.username.trim()) {
      errors.push('Username je obavezno');
    } else if (registerData.username.trim().length < 2) {
      errors.push('Username mora imati najmanje 2 karaktera');
    } else if (!/^[a-zA-Z0-9]+$/.test(registerData.username.trim())) {
      errors.push('Username može sadržavati samo slova i brojeve');
    }
    
    if (registerData.email && registerData.email.trim() && !/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.push('Email format nije ispravan');
    }
    
    if (!registerData.password || !registerData.password.trim()) {
      errors.push('Lozinka je obavezna');
    } else if (registerData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
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
      const errorMessage = 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
      Alert.alert('Greška', errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(registerData);
      
      // Check if registration was successful
      if (response.success) {
        await setToken(response.token);
        await setUserData(response.user);
        
        Alert.alert('Uspjeh', 'Registracija je uspješna!');
        
        if (onAuthSuccess) {
          onAuthSuccess(response.user);
        }
      } else {
        Alert.alert('Greška', response.message || 'Greška pri registraciji');
      }
    } catch (error) {
      let errorMessage = 'Greška pri registraciji';
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('email')) {
          errorMessage = 'Korisnik sa ovim emailom već postoji';
        } else if (error.response?.data?.message?.includes('username')) {
          errorMessage = 'Korisnik sa ovim korisničkim imenom već postoji';
        } else {
          errorMessage = error.response?.data?.message || 'Neispravni podaci za registraciju';
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Korisnik sa ovim emailom već postoji';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Greška na serveru. Molimo pokušajte ponovo.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      Alert.alert('Greška', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password step 1
  const handleForgotPasswordStep1 = async () => {
    // Detailed validation like web version
    const errors = [];
    
    if (!forgotPasswordData.email || !forgotPasswordData.email.trim()) {
      errors.push('Email ili korisničko ime je obavezno');
    }

    if (errors.length > 0) {
      const errorMessage = 'Molimo ispravite sledeće greške:\n• ' + errors.join('\n• ');
      Alert.alert('Greška', errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmailForPasswordReset(forgotPasswordData.email);
      setSecurityQuestion(getQuestionByIndex(response.securityQuestionIndex));
      setForgotPasswordStep(2);
    } catch (error) {
      Alert.alert('Greška', error.response?.data?.message || 'Greška pri pronalaženju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password step 2
  const handleForgotPasswordStep2 = async () => {
    if (!forgotPasswordData.securityAnswer.trim()) {
      Alert.alert('Greška', 'Odgovor na sigurnosno pitanje je obavezan');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifySecurityAnswer(forgotPasswordData.email, forgotPasswordData.securityAnswer);
      setForgotPasswordStep(3);
    } catch (error) {
      Alert.alert('Greška', error.response?.data?.message || 'Netačan odgovor na sigurnosno pitanje');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password step 3
  const handleForgotPasswordStep3 = async () => {
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmNewPassword) {
      Alert.alert('Greška', 'Nova lozinka i potvrda su obavezne');
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      Alert.alert('Greška', 'Lozinke se ne podudaraju');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(forgotPasswordData.email, forgotPasswordData.newPassword);
      
      Alert.alert('Uspjeh', 'Lozinka je uspješno resetovana! Možete se prijaviti sa novom lozinkom.');
      setActiveTab(0); // Switch to login tab
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        securityAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setSecurityQuestion('');
    } catch (error) {
      Alert.alert('Greška', error.response?.data?.message || 'Greška pri resetovanju lozinke');
    } finally {
      setIsLoading(false);
    }
  };

  // Render login form
  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Prijava</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email ili korisničko ime</Text>
        <TextInput
          style={styles.textInput}
          value={loginData.email}
          onChangeText={(text) => setLoginData({ ...loginData, email: text })}
          placeholder="Unesite email ili korisničko ime"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lozinka</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={loginData.password}
            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
            placeholder="Unesite lozinku"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Zapamti me</Text>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
          thumbColor={rememberMe ? COLORS.primary : COLORS.gray}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Prijavi se</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setActiveTab(2)}
      >
        <Text style={styles.linkText}>Zaboravili ste lozinku?</Text>
      </TouchableOpacity>
    </View>
  );

  // Render register form
  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Registracija</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Korisničko ime *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.username}
          onChangeText={(text) => setRegisterData({ ...registerData, username: text })}
          placeholder="Unesite korisničko ime"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.email}
          onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
          placeholder="Unesite email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lozinka *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={registerData.password}
            onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
            placeholder="Unesite lozinku"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Potvrda lozinke *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
            placeholder="Potvrdite lozinku"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Sigurnosno pitanje *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={registerData.securityQuestionIndex}
            style={styles.picker}
            onValueChange={(itemValue) =>
              setRegisterData({ ...registerData, securityQuestionIndex: itemValue })
            }
            dropdownIconColor="#000000"
          >
            <Picker.Item label="Izaberite pitanje..." value="" color="#000000" style={{backgroundColor: '#FFFFFF'}} />
            {SECURITY_QUESTIONS.map((question, index) => (
              <Picker.Item key={index} label={question} value={index} color="#000000" style={{backgroundColor: '#FFFFFF'}} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Odgovor na sigurnosno pitanje *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.securityAnswer}
          onChangeText={(text) => setRegisterData({ ...registerData, securityAnswer: text })}
          placeholder="Unesite odgovor"
        />
        <Text style={styles.helperText}>
          ⚠️ VAŽNO: Zapamtite ovaj odgovor - trebat će vam za resetovanje lozinke!
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Registruj se</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render forgot password form
  const renderForgotPasswordForm = () => {
    if (forgotPasswordStep === 1) {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Zaboravljena lozinka</Text>
          <Text style={styles.subtitle}>Unesite vaš email ili korisničko ime</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email ili korisničko ime</Text>
            <TextInput
              style={styles.textInput}
              value={forgotPasswordData.email}
              onChangeText={(text) => setForgotPasswordData({ ...forgotPasswordData, email: text })}
              placeholder="Unesite email ili korisničko ime"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleForgotPasswordStep1}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Nastavi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setActiveTab(0)}
          >
            <Text style={styles.linkText}>Nazad na prijavu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (forgotPasswordStep === 2) {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sigurnosno pitanje</Text>
          <Text style={styles.subtitle}>{securityQuestion}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vaš odgovor</Text>
            <TextInput
              style={styles.textInput}
              value={forgotPasswordData.securityAnswer}
              onChangeText={(text) => setForgotPasswordData({ ...forgotPasswordData, securityAnswer: text })}
              placeholder="Unesite odgovor"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleForgotPasswordStep2}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Potvrdi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setForgotPasswordStep(1)}
          >
            <Text style={styles.linkText}>Nazad</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (forgotPasswordStep === 3) {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Nova lozinka</Text>
          <Text style={styles.subtitle}>Unesite novu lozinku</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nova lozinka</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={forgotPasswordData.newPassword}
                onChangeText={(text) => setForgotPasswordData({ ...forgotPasswordData, newPassword: text })}
                placeholder="Unesite novu lozinku"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Potvrda nove lozinke</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={forgotPasswordData.confirmNewPassword}
                onChangeText={(text) => setForgotPasswordData({ ...forgotPasswordData, confirmNewPassword: text })}
                placeholder="Potvrdite novu lozinku"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleForgotPasswordStep3}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Resetuj lozinku</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <SystemBars style="light" hidden={false} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tabs */}
        {activeTab !== 2 && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && styles.tabActive]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
                Prijava
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 1 && styles.tabActive]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
                Registracija
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={styles.formWrapper}>
          {activeTab === 0 && renderLoginForm()}
          {activeTab === 1 && renderRegisterForm()}
          {activeTab === 2 && renderForgotPasswordForm()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120, // Extra padding for bottom navigation
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  formWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formContainer: {
    gap: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  eyeButton: {
    padding: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default AuthScreen; 