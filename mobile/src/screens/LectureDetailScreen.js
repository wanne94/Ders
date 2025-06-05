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
  Share,
  Linking,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Divider } from 'react-native-paper';
import apiService from '../services/apiService';
import LectureForm from '../components/LectureForm';
import { useBackHandler } from '../utils/useBackHandler';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { useToast } from '../contexts/ToastContext';
import OfflineBanner from '../components/OfflineBanner';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function LectureDetailScreen({ route, navigation }) {
  const { lectureId, mode, isAdmin, approvalEnabled, returnTo } = route.params || {};
  const [lecture, setLecture] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [daija, setDaija] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Network status and toast
  const { isConnected, isOffline } = useNetworkStatus();
  const { showError, showSuccess, showWarning } = useToast();

  // Add back handler for keyboard dismissal
  useBackHandler(navigation);

  useEffect(() => {
    if (mode === 'add') {
      // If in add mode, show the form immediately
      setShowForm(true);
      setIsLoading(false);
    } else if (mode === 'edit' && lectureId) {
      // If in edit mode, fetch lecture data first, then show form
      fetchLectureDetails().then(() => {
        setShowForm(true);
      });
    } else if (lectureId) {
      fetchLectureDetails();
      
      // Show skeleton only if loading takes longer than 300ms
      const skeletonTimeout = setTimeout(() => {
        if (isLoading) {
          setShowSkeleton(true);
        }
      }, 300);
      
      // Maximum skeleton display time - force hide after 2 seconds
      const maxSkeletonTimeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setShowSkeleton(false);
        }
      }, 2000);

      return () => {
        clearTimeout(skeletonTimeout);
        clearTimeout(maxSkeletonTimeout);
      };
    }
  }, [lectureId, mode]);

  // Show offline warning when connection is lost
  useEffect(() => {
    if (isOffline && lecture) {
      showWarning('Nema internetske veze. Prikazuju se sačuvani podaci.');
    }
  }, [isOffline]);

  const fetchLectureDetails = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
        setShowSkeleton(false);
      }
      setError(null);
      
      // Minimum loading time to prevent flashing
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 150));
      
      // Check network connection
      if (isOffline) {
        throw new Error('Nema internetske veze');
      }

      const lectureData = await apiService.getLectureById(lectureId);
      
      // Wait for minimum loading time
      await minLoadingTime;
      
      setLecture(lectureData);

      // Fetch related organization if exists
      if (lectureData.organizationId) {
        try {
          const orgData = await apiService.getOrganizationById(lectureData.organizationId);
          setOrganization(orgData);
        } catch (orgError) {
          console.log('Organization not found:', orgError);
        }
      }

      // Fetch related daija if exists
      if (lectureData.daijaId) {
        try {
          const daijaData = await apiService.getDaijaById(lectureData.daijaId);
          setDaija(daijaData);
        } catch (daijaError) {
          console.log('Daija not found:', daijaError);
        }
      }
    } catch (error) {
      console.error('Error fetching lecture details:', error);
      const errorMessage = error.message || 'Greška pri dohvaćanju detalja predavanja';
      setError(errorMessage);
      
      if (isOffline) {
        showWarning('Nema internetske veze. Prikazuju se sačuvani podaci.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setShowSkeleton(false);
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Datum nije specificiran';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDaijaName = (daija) => {
    if (!daija) return null;
    const firstName = daija.firstName || '';
    const lastName = daija.lastName || '';
    const title = daija.title || '';
    
    if (title.toLowerCase() === 'prof' || title.toLowerCase() === 'prof.') {
      return `${firstName} ${lastName} prof.`.trim();
    } else if (title) {
      const titleWithPeriod = title.includes('.') ? title : `${title}.`;
      return `${titleWithPeriod} ${firstName} ${lastName}`.trim();
    } else {
      return `${firstName} ${lastName}`.trim();
    }
  };

  const handleShare = async () => {
    if (!lecture) return;
    
    try {
      const shareMessage = `${lecture.title}\n\nDaija: ${lecture.speaker}\nDatum: ${formatDate(lecture.date)}\nVreme: ${lecture.time || 'Nije specificirano'}\nLokacija: ${lecture.address || lecture.location}, ${lecture.city}\n\nVia DERS aplikacija`;
      
      await Share.share({
        message: shareMessage,
        title: lecture.title,
      });
      
      showSuccess('Predavanje je uspješno podijeljeno');
    } catch (error) {
      console.error('Error sharing:', error);
      showError('Greška pri dijeljenju predavanja');
    }
  };

  const handleLocationPress = () => {
    if (!lecture?.address && !lecture?.location) return;
    
    const location = `${lecture.address || lecture.location}, ${lecture.city || ''}`.trim();
    const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      showError('Nije moguće otvoriti mapu.');
    });
  };

  const getImageUrl = (imagePath) => {
    return getImageDisplayUri(imagePath) || `${SERVER_URL}/uploads/images/predavanjeslika.jpg`;
  };

  const handleFormSuccess = (updatedLecture) => {
    const successMessage = mode === 'edit' ? 'Predavanje je uspešno ažurirano!' : 'Predavanje je uspešno dodano!';
    showSuccess(successMessage);
    setShowForm(false);
    
    // If in edit mode, update the local lecture data
    if (mode === 'edit') {
      setLecture(updatedLecture);
    }
    
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLectureDetails();
  };

  // If in add or edit mode, show the form
  if (mode === 'add' || mode === 'edit') {
    return (
      <SafeAreaView style={styles.container}>
        <LectureForm
          visible={showForm}
          onDismiss={handleFormDismiss}
          onSuccess={handleFormSuccess}
          lecture={mode === 'edit' ? lecture : null}
        />
      </SafeAreaView>
    );
  }

  if (isLoading && showSkeleton) {
    return (
      <SafeAreaView style={styles.container}>
        <OfflineBanner isVisible={isOffline} />
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !lecture) {
    return (
      <SafeAreaView style={styles.container}>
        <OfflineBanner isVisible={isOffline} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Predavanje nije pronađeno'}</Text>
          {!isOffline && (
            <TouchableOpacity style={styles.retryButton} onPress={fetchLectureDetails}>
              <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner isVisible={isOffline} />
      <ScrollView 
        style={[styles.scrollView, isOffline && { marginTop: 40 }]}
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
        {/* Header with Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(lecture.image) }}
            style={styles.lectureImage}
            resizeMode="cover"
            onError={() => {
              // Only set error state if we have an image and haven't already set error
              if (lecture.image && !imageError) {
                setImageError(true);
              }
            }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <View style={styles.headerButtons}>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{lecture.title}</Text>

          {/* Basic Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#022C43" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Daija</Text>
                  <Text style={styles.infoValue}>{lecture.speaker || 'Nepoznato'}</Text>
                  {daija && (
                    <Text style={styles.infoSubtext}>
                      {daija.specialization && `Specijalizacija: ${daija.specialization}`}
                    </Text>
                  )}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#022C43" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Datum</Text>
                  <Text style={styles.infoValue}>{formatDate(lecture.date)}</Text>
                </View>
              </View>

              {lecture.time && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color="#022C43" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Vreme</Text>
                      <Text style={styles.infoValue}>{lecture.time}</Text>
                    </View>
                  </View>
                </>
              )}

              <Divider style={styles.divider} />

              <TouchableOpacity style={styles.infoRow} onPress={handleLocationPress}>
                <Ionicons name="location-outline" size={20} color="#022C43" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Lokacija</Text>
                  <Text style={[styles.infoValue, styles.locationText]}>
                    {`${lecture.address || lecture.location || ''}, ${lecture.city || ''}`.replace(/^, |, $/, '')}
                  </Text>
                  <Text style={styles.infoSubtext}>Dodirnite za otvaranje na mapi</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Description */}
          {lecture.description && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Opis predavanja</Text>
                <Text style={styles.description}>{lecture.description}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Organization Info */}
          {organization && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Udruženje</Text>
                <View style={styles.organizationContainer}>
                  {organization.image && (
                    <Image
                      source={{ uri: getImageUrl(organization.image) }}
                      style={styles.organizationImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.organizationInfo}>
                    <Text style={styles.organizationName}>{organization.name}</Text>
                    {organization.shortDescription && (
                      <Text style={styles.organizationDescription}>
                        {organization.shortDescription}
                      </Text>
                    )}
                    {organization.city && (
                      <Text style={styles.organizationLocation}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        {' '}{organization.city}
                      </Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Additional Details */}
          {(lecture.topic || lecture.language || lecture.duration || lecture.capacity || lecture.price || lecture.contactInfo) && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Dodatne informacije</Text>
                
                {lecture.topic && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tema:</Text>
                    <Text style={styles.detailValue}>{lecture.topic}</Text>
                  </View>
                )}

                {lecture.language && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Jezik:</Text>
                    <Text style={styles.detailValue}>{lecture.language}</Text>
                  </View>
                )}

                {lecture.duration && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Trajanje:</Text>
                    <Text style={styles.detailValue}>{lecture.duration}</Text>
                  </View>
                )}

                {lecture.capacity && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kapacitet:</Text>
                    <Text style={styles.detailValue}>{lecture.capacity} osoba</Text>
                  </View>
                )}

                {lecture.price && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cena:</Text>
                    <Text style={styles.detailValue}>{lecture.price}</Text>
                  </View>
                )}

                {lecture.contactInfo && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kontakt:</Text>
                    <Text style={styles.detailValue}>{lecture.contactInfo}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Podijeli</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleLocationPress}>
              <Ionicons name="map-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Lokacija</Text>
            </TouchableOpacity>
          </View>
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
  lectureImage: {
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
    textTransform: 'uppercase',
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
  organizationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  organizationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  organizationInfo: {
    flex: 1,
  },
  organizationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  organizationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  organizationLocation: {
    fontSize: 12,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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