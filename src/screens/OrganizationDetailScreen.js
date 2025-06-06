import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Linking,
  Share,
  FlatList,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Divider } from 'react-native-paper';
import apiService from '../services/apiService';
import UniversalCard from '../components/UniversalCard';
import OrganizationForm from '../components/OrganizationForm';
import { useBackHandler } from '../utils/useBackHandler';
import { useToast } from '../contexts/ToastContext';
import { getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function OrganizationDetailScreen({ route, navigation }) {
  const { organizationId, mode, returnTo } = route.params || {};
  
  const [organization, setOrganization] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  // Toast for feedback
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (mode === 'add') {
      // If in add mode, show the form immediately
      setShowForm(true);
      setIsLoading(false);
    } else if (organizationId) {
      fetchOrganizationDetails();
    } else {
      setError('ID udruženja nije prosleđen. Molimo pokušajte ponovo.');
      setIsLoading(false);
    }
  }, [organizationId, mode]);

  const fetchOrganizationDetails = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch organization details
      const organizationData = await apiService.getOrganizationById(organizationId);
      setOrganization(organizationData);

      // Fetch lectures by this organization
      const allLectures = await apiService.getLectures();
      const organizationLectures = allLectures.filter(lecture => {
        return lecture.organizationId === organizationId || 
               lecture.organization === organizationId ||
               lecture.organization === organizationData.name;
      });
      setLectures(organizationLectures);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Došlo je do greške pri dohvaćanju detalja udruženja.');
      if (isRefreshing) {
        showError('Greška pri osvježavanju podataka');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrganizationDetails();
  };

  const handleContactPress = () => {
    if (!organization?.contactInfo) return;
    
    // Try to detect if it's a phone number or email
    if (organization.contactInfo.includes('@')) {
      Linking.openURL(`mailto:${organization.contactInfo}`).catch(err => {
        console.error('Error opening email:', err);
        Alert.alert('Greška', 'Nije moguće otvoriti email aplikaciju.');
      });
    } else if (organization.contactInfo.match(/[\d\s\+\-\(\)]/)) {
      Linking.openURL(`tel:${organization.contactInfo.replace(/\s/g, '')}`).catch(err => {
        console.error('Error opening phone:', err);
        Alert.alert('Greška', 'Nije moguće pokrenuti poziv.');
      });
    }
  };

  const handleLocationPress = () => {
    if (!organization?.address && !organization?.city) return;
    
    const location = `${organization.address || ''}, ${organization.city || ''}`.replace(/^, |, $/, '');
    const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Greška', 'Nije moguće otvoriti mapu.');
    });
  };

  const navigateToLectureDetail = (lecture) => {
    navigation.navigate('LectureDetail', { lectureId: lecture._id });
  };

  const getImageUrl = (imagePath) => {
    return getImageDisplayUri(imagePath) || `${SERVER_URL}/uploads/default-organization.webp`;
  };

  const handleFormSuccess = (newOrganization) => {
    showSuccess('Udruženje je uspešno dodano!');
    setShowForm(false);
    
    // Navigate back to the return screen or admin dashboard
    if (returnTo) {
      navigation.navigate(returnTo === 'AdminDashboard' ? 'AdminDashboardMain' : returnTo);
    } else {
      navigation.goBack();
    }
  };

  const handleFormDismiss = () => {
    setShowForm(false);
    
    // Navigate back to the return screen or admin dashboard
    if (returnTo) {
      navigation.navigate(returnTo === 'AdminDashboard' ? 'AdminDashboardMain' : returnTo);
    } else {
      navigation.goBack();
    }
  };

  // If in add mode, show the form
  if (mode === 'add') {
    return (
      <SafeAreaView style={styles.container}>
        <OrganizationForm
          visible={showForm}
          onDismiss={handleFormDismiss}
          onSuccess={handleFormSuccess}
          organization={null}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#022C43" />
        <Text style={styles.loadingText}>Učitavam detalje...</Text>
      </View>
    );
  }

  if (error || !organization) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Udruženje nije pronađeno'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrganizationDetails}>
            <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#022C43']}
            tintColor="#022C43"
          />
        }
      >
        {/* Header with back button only */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(organization.image) }}
            style={styles.organizationImage}
            onError={() => setImageError(true)}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{organization.name}</Text>

          {/* Description */}
          {organization.description && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>O udruženju</Text>
                <Text style={styles.description}>{organization.description}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Additional Details */}
          {(organization.shortDescription || organization.city || organization.address) && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Informacije</Text>
                
                {organization.shortDescription && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kratak opis:</Text>
                    <Text style={styles.detailValue}>{organization.shortDescription}</Text>
                  </View>
                )}

                {organization.city && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Grad:</Text>
                    <Text style={styles.detailValue}>{organization.city}</Text>
                  </View>
                )}

                {organization.address && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Adresa:</Text>
                    <Text style={styles.detailValue}>{organization.address}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Lectures Section */}
          {lectures.length > 0 && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Dersovi ({lectures.length})</Text>
                {lectures.slice(0, 5).map((lecture) => {
                  const infoRows = [
                    {
                      icon: 'person-outline',
                      text: lecture.speaker || 'Nepoznato',
                      highlightSearch: false
                    },
                    {
                      icon: 'calendar-outline',
                      text: new Date(lecture.date).toLocaleDateString('en-GB').replace(/\//g, '.'),
                      highlightSearch: false
                    },
                    lecture.time && {
                      icon: 'time-outline',
                      text: lecture.time,
                      highlightSearch: false
                    },
                    {
                      icon: 'location-outline',
                      text: `${lecture.address || lecture.location || ''}, ${lecture.city || ''}`.replace(/^, |, $/, ''),
                      highlightSearch: false
                    }
                  ].filter(Boolean);

                  return (
                    <View key={lecture._id} style={styles.lectureItem}>
                      <UniversalCard
                        title={lecture.title}
                        infoRows={infoRows}
                        rightContentType="image"
                        imageUrl={lecture.image}
                        onPress={() => navigateToLectureDetail(lecture)}
                        titleStyle={{ textTransform: 'uppercase' }}
                        serverUrl={SERVER_URL}
                        defaultImagePath="/uploads/images/predavanjeslika.jpg"
                      />
                    </View>
                  );
                })}
                {lectures.length > 5 && (
                  <TouchableOpacity 
                    style={styles.seeAllButton}
                    onPress={() => navigation.navigate('Lectures')}
                  >
                    <Text style={styles.seeAllText}>Vidi sva predavanja ({lectures.length})</Text>
                    <Ionicons name="chevron-forward" size={16} color="#022C43" />
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons - only contact button */}
          {organization.contactInfo && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleContactPress}>
                <Ionicons name="call-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Kontakt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  organizationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerButtons: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    marginTop: -20,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contactText: {
    color: '#022C43',
    textDecorationLine: 'underline',
  },
  locationText: {
    color: '#022C43',
    textDecorationLine: 'underline',
  },
  divider: {
    backgroundColor: '#eee',
    height: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  linkText: {
    color: '#022C43',
    textDecorationLine: 'underline',
  },
  lectureItem: {
    marginBottom: 10,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  seeAllText: {
    fontSize: 16,
    color: '#022C43',
    fontWeight: '600',
    marginRight: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#022C43',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#022C43',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 