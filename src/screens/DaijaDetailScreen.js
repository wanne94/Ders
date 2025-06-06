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
import DaijaForm from '../components/DaijaForm';
import { useBackHandler } from '../utils/useBackHandler';
import { useToast } from '../contexts/ToastContext';
import { getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function DaijaDetailScreen({ route, navigation }) {
  const { daijaId, mode, returnTo } = route.params || {};
  
  const [daija, setDaija] = useState(null);
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
    console.log('🔍 DaijaDetailScreen - Route params:', route.params);
    console.log('🔍 DaijaDetailScreen - daijaId:', daijaId);
    console.log('🔍 DaijaDetailScreen - mode:', mode);
    
    if (mode === 'add') {
      // If in add mode, show the form immediately
      setShowForm(true);
      setIsLoading(false);
    } else if (daijaId) {
      if (!daijaId || daijaId === 'undefined' || daijaId === 'null') {
        console.error('❌ DaijaDetailScreen - Invalid daijaId:', daijaId);
        setError('Nevaljan ID daije. Molimo pokušajte ponovo.');
        setIsLoading(false);
        return;
      }
      
      fetchDaijaDetails();
    } else {
      console.error('❌ DaijaDetailScreen - No daijaId provided');
      setError('ID daije nije prosleđen. Molimo pokušajte ponovo.');
      setIsLoading(false);
    }
  }, [daijaId, mode]);

  const fetchDaijaDetails = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 DaijaDetailScreen - Fetching daija details for ID:', daijaId);
      
      // Fetch daija details
      const daijaData = await apiService.getDaijaById(daijaId);
      console.log('✅ DaijaDetailScreen - Daija data received:', daijaData);
      setDaija(daijaData);

      // Fetch lectures by this daija
      const allLectures = await apiService.getLectures();
      const daijaLectures = allLectures.filter(lecture => {
        const fullName = `${daijaData.title || ''} ${daijaData.firstName || ''} ${daijaData.lastName || ''}`.trim();
        return lecture.daijaId === daijaId || 
               lecture.daija === daijaId ||
               lecture.speaker === fullName ||
               lecture.speaker?.includes(daijaData.firstName) ||
               lecture.speaker?.includes(daijaData.lastName);
      });
      setLectures(daijaLectures);
    } catch (err) {
      console.error('❌ DaijaDetailScreen - Error fetching daija details:', err);
      console.error('❌ DaijaDetailScreen - Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        daijaId: daijaId
      });
      setError('Došlo je do greške pri dohvaćanju detalja daije.');
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
    fetchDaijaDetails();
  };

  const formatDaijaName = (daija) => {
    if (!daija) return '';
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

  const handleContactPress = () => {
    if (!daija?.contactInfo) return;
    
    // Try to detect if it's a phone number or email
    if (daija.contactInfo.includes('@')) {
      Linking.openURL(`mailto:${daija.contactInfo}`).catch(err => {
        console.error('Error opening email:', err);
        Alert.alert('Greška', 'Nije moguće otvoriti email aplikaciju.');
      });
    } else if (daija.contactInfo.match(/[\d\s\+\-\(\)]/)) {
      Linking.openURL(`tel:${daija.contactInfo.replace(/\s/g, '')}`).catch(err => {
        console.error('Error opening phone:', err);
        Alert.alert('Greška', 'Nije moguće pokrenuti poziv.');
      });
    }
  };

  const navigateToLectureDetail = (lecture) => {
    navigation.navigate('LectureDetail', { lectureId: lecture._id });
  };

  const getImageUrl = (imagePath) => {
    return getImageDisplayUri(imagePath) || `${SERVER_URL}/uploads/images/daijaslika.jpg`;
  };

  const handleFormSuccess = (newDaija) => {
    showSuccess('Daija je uspešno dodana!');
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
        <DaijaForm
          visible={showForm}
          onDismiss={handleFormDismiss}
          onSuccess={handleFormSuccess}
          daija={null}
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

  if (error || !daija) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Daija nije pronađena'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDaijaDetails}>
            <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = formatDaijaName(daija);

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
            source={{ uri: getImageUrl(daija.image) }}
            style={styles.daijaImage}
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
          <Text style={styles.title}>{fullName}</Text>

          {/* Biography */}
          {daija.biography && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Biografija</Text>
                <Text style={styles.description}>{daija.biography}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Additional Details */}
          {(daija.education || daija.specialization || daija.city) && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Informacije</Text>
                
                {daija.education && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Obrazovanje:</Text>
                    <Text style={styles.detailValue}>{daija.education}</Text>
                  </View>
                )}

                {daija.specialization && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Specijalizacija:</Text>
                    <Text style={styles.detailValue}>{daija.specialization}</Text>
                  </View>
                )}

                {daija.city && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mjesto:</Text>
                    <Text style={styles.detailValue}>{daija.city}</Text>
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
          {daija.contactInfo && (
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
  daijaImage: {
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