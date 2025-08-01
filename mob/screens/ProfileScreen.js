import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usersService } from '../services/usersService';
import { formatDateWithDay } from '../utils/dateUtils';
import { getUserData, getToken, clearAllAuthData } from '../utils/authHelpers';
import DeleteProfileDialog from '../components/DeleteProfileDialog';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e0e0e0',
  warning: '#FFA726',
  success: '#66BB6A',
  error: '#ef5350',
  textSecondary: '#999999',
  danger: '#dc3545',
};

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const [deleteProfileLoading, setDeleteProfileLoading] = useState(false);
  
  // Form states
  const [emailForm, setEmailForm] = useState({ email: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  // Refs to track component lifecycle and timeouts
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigation.navigate('auth');
      return;
    }
    
    loadUserProfile();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
      // Clear all timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      if (isMountedRef.current) { setLoading(true); }
      const userData = await getUserData();
      if (userData) {
        if (isMountedRef.current) { setUser(userData); }
        if (isMountedRef.current) { setEmailForm({ email: userData.email || '', currentPassword: '' }); }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (isMountedRef.current) { setError('Greška pri učitavanju profila.'); }
    } finally {
      if (isMountedRef.current) { setLoading(false); }
    }
  };

  const handleEmailUpdate = async () => {
    if (!emailForm.email || !emailForm.currentPassword) {
      if (isMountedRef.current) { setError('Email i trenutna lozinka su obavezni.'); }
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await usersService.updateProfile({
        email: emailForm.email,
        currentPassword: emailForm.currentPassword
      });

      if (response.success) {
        if (isMountedRef.current) {
          setSuccess('Email je uspješno ažuriran.');
          setUser(response.user);
          setEmailDialogOpen(false);
          setEmailForm({ email: response.user.email, currentPassword: '' });
          
          // Auto-clear success message after 3 seconds
          const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
              setSuccess('');
            }
          }, 3000);
          timeoutsRef.current.push(timeoutId);
        }
      } else {
        if (isMountedRef.current) {
          setError(response.message || 'Greška pri ažuriranju email-a.');
        }
      }
    } catch (error) {
      console.error('Error updating email:', error);
      if (isMountedRef.current) {
        setError('Greška pri ažuriranju email-a.');
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Sva polja su obavezna.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Nova lozinka i potvrda se ne slažu.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Nova lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await usersService.changePassword(passwordForm);

      if (response.success) {
        if (isMountedRef.current) {
          setSuccess('Lozinka je uspješno promijenjena.');
          setPasswordDialogOpen(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          
          // Auto-clear success message after 3 seconds
          const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
              setSuccess('');
            }
          }, 3000);
          timeoutsRef.current.push(timeoutId);
        }
      } else {
        if (isMountedRef.current) {
          setError(response.message || 'Greška pri promjeni lozinke.');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (isMountedRef.current) {
        setError('Greška pri promjeni lozinke.');
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };



  const handleDeleteProfile = async (currentPassword) => {
    try {
      setDeleteProfileLoading(true);
      setError('');
      
      const response = await usersService.deleteOwnProfile(currentPassword);
      
      if (response.success) {
        // Clear all local data
        await clearAllAuthData();
        
        // Navigate to auth screen with success message
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'auth', 
            params: { 
              message: 'Vaš profil je uspješno obrisan.' 
            } 
          }],
        });
      } else {
        setError(response.message || 'Greška pri brisanju profila.');
        setDeleteProfileDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError('Greška pri brisanju profila. Molimo pokušajte ponovo.');
      setDeleteProfileDialogOpen(false);
    } finally {
      setDeleteProfileLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return COLORS.error;
      case 'admin': return COLORS.warning;
      case 'user': return COLORS.primary;
      default: return COLORS.gray;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'user': return 'Korisnik';
      default: return role;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section - No duplicate header with navigation */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role) }]}>
                <Text style={styles.roleBadgeText}>{getRoleLabel(user?.role)}</Text>
              </View>
              <View style={styles.ridBadge}>
                <Ionicons name="card-outline" size={14} color={COLORS.gray} />
                <Text style={styles.ridBadgeText}>RID: {user?.rid}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Success/Error Messages */}
      {success ? (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.cardsContainer}>
        {/* Account Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Osnovne informacije</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>Email adresa</Text>
              <Text style={styles.value}>{user?.email || 'Nije postavljen'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEmailDialogOpen(true)}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Promijeni</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>Lozinka</Text>
              <Text style={styles.value}>••••••••</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setPasswordDialogOpen(true)}
            >
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Promijeni</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRowLast}>
            <View>
              <Text style={styles.label}>Član od</Text>
              <Text style={styles.value}>
                {user?.createdAt ? formatDateWithDay(user.createdAt) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>


        {/* Delete Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.cardTitle, { color: COLORS.danger }]}>Opasna zona</Text>
          </View>
          <View style={styles.divider} />
          
          <Text style={styles.dangerDescription}>
            Brisanje profila je trajna akcija koja ne može biti poništena. 
            Svi vaši podaci će biti nepovratno obrisani.
          </Text>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setDeleteProfileDialogOpen(true)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={styles.deleteButtonText}>Obriši profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Email Change Dialog */}
      <Modal
        visible={emailDialogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEmailDialogOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Promjena email adrese</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nova email adresa"
              
              placeholderTextColor={COLORS.textSecondary}
              value={emailForm.email}
              onChangeText={(text) => setEmailForm({ ...emailForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Trenutna lozinka"
              placeholderTextColor={COLORS.textSecondary}
              value={emailForm.currentPassword}
              onChangeText={(text) => setEmailForm({ ...emailForm, currentPassword: text })}
              secureTextEntry
            />
            
            <Text style={styles.helperText}>
              Potrebna je trenutna lozinka za potvrdu promjene
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setEmailDialogOpen(false);
                  setError('');
                }}
              >
                <Text style={styles.modalCancelText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleEmailUpdate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Sačuvaj</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Password Change Dialog */}
      <Modal
        visible={passwordDialogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordDialogOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Promjena lozinke</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Trenutna lozinka"
              placeholderTextColor={COLORS.textSecondary}
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nova lozinka"
              placeholderTextColor={COLORS.textSecondary}
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Potvrdi novu lozinku"
              placeholderTextColor={COLORS.textSecondary}
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
              secureTextEntry
            />
            
            <Text style={styles.helperText}>
              Najmanje 6 karaktera
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setPasswordDialogOpen(false);
                  setError('');
                }}
              >
                <Text style={styles.modalCancelText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handlePasswordChange}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Promijeni</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Profile Dialog */}
      <DeleteProfileDialog
        visible={deleteProfileDialogOpen}
        onClose={() => setDeleteProfileDialogOpen(false)}
        onConfirm={handleDeleteProfile}
        loading={deleteProfileLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  ridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  ridBadgeText: {
    color: COLORS.gray,
    fontSize: 12,
  },
  successMessage: {
    backgroundColor: COLORS.success,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  successText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: COLORS.error,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.gray,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;