import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { predavanjaService, daijeService, udruzenjaService } from '../services';
import { getImageUrl } from '../utils/imageUtils';
import { formatDateWithDay } from '../utils/dateUtils';
import { formatDaijaTitle } from '../utils';
import ShareButton from './ShareButton';
import CancellationReportButton from './CancellationReportButton';
import UniverzalCard from './UniverzalCard';
import { sortLecturesByTime } from '../utils/sortingUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const UniversalProfile = ({ data, type, onBack, onProfileOpen }) => {
  const id = data?._id || data?.id;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [relatedLectures, setRelatedLectures] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [profileLectures, setProfileLectures] = useState([]);
  const [loadingProfileLectures, setLoadingProfileLectures] = useState(false);

  useEffect(() => {
    // If data is passed directly, use it
    if (data) {
      setProfile(data);
      setLoading(false);
      return;
    }

    // Otherwise fetch it by id
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedData;
        if (type === 'lecture') {
          fetchedData = await predavanjaService.getPredavanjeById(id);
        } else if (type === 'daija') {
          fetchedData = await daijeService.getDaijaById(id);
        } else if (type === 'organization') {
          fetchedData = await udruzenjaService.getUdruzenjeById(id);
        } else {
          throw new Error('Nepoznat tip profila');
        }

        setProfile(fetchedData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Greška pri učitavanju profila');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    } else {
      setError('Nema podataka za prikaz');
      setLoading(false);
    }
  }, [type, id, data]);

  // Fetch related lectures when viewing a lecture profile
  useEffect(() => {
    const fetchRelatedLectures = async () => {
      if (type !== 'lecture' || !profile) return;
      
      try {
        setLoadingRelated(true);
        
        // Fetch all lectures
        const response = await predavanjaService.getAllPredavanja();
        const allLectures = Array.isArray(response) ? response : (response.lectures || response.data || []);
        
        // Filter out the current lecture and only keep approved lectures
        const otherLectures = allLectures
          .filter(lecture => lecture._id !== profile._id && lecture.status === 'approved')
          .map(lecture => ({
            ...lecture,
            type: 'predavanje'
          }));
        
        // Sort lectures by time (upcoming first, then recent past)
        const sortedLectures = sortLecturesByTime(otherLectures);
        
        // Take only first 5 lectures
        setRelatedLectures(sortedLectures.slice(0, 5));
      } catch (err) {
        console.error('Error fetching related lectures:', err);
      } finally {
        setLoadingRelated(false);
      }
    };
    
    if (profile && type === 'lecture') {
      fetchRelatedLectures();
    }
  }, [profile, type]);

  // Fetch lectures for daija or organization profiles
  useEffect(() => {
    const fetchProfileLectures = async () => {
      if (!profile || type === 'lecture') return;
      
      try {
        setLoadingProfileLectures(true);
        
        let lectures = [];
        if (type === 'daija' && profile._id) {
          lectures = await predavanjaService.getPredavanjaByDaija(profile._id);
        } else if (type === 'organization' && profile._id) {
          lectures = await predavanjaService.getPredavanjaByOrganization(profile._id);
        }
        
        // Ensure lectures is an array
        const lecturesArray = Array.isArray(lectures) ? lectures : 
                            (lectures.lectures || lectures.data || []);
        
        // Add type to each lecture
        const lecturesWithType = lecturesArray.map(lecture => ({
          ...lecture,
          type: 'predavanje'
        }));
        
        // Sort lectures by time (upcoming first, then recent past)
        const sortedLectures = sortLecturesByTime(lecturesWithType);
        
        // Take only first 10 lectures
        setProfileLectures(sortedLectures.slice(0, 10));
      } catch (err) {
        console.error('Error fetching profile lectures:', err);
      } finally {
        setLoadingProfileLectures(false);
      }
    };
    
    if (profile && (type === 'daija' || type === 'organization')) {
      fetchProfileLectures();
    }
  }, [profile, type]);

  const getTitle = () => {
    if (type === 'daija') {
      return formatDaijaTitle(profile.name, profile.title);
    }
    if (type === 'organization') {
      return profile.name;
    }
    return profile.title;
  };


  const openLocation = () => {
    const address = [profile.address, profile.city].filter(Boolean).join(', ');
    const encoded = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?daddr=${encoded}`;
    Linking.openURL(url);
  };


  const handleReportSuccess = (response) => {
    // Refresh profile data if lecture was cancelled
    if (response.isCancelled && type === 'lecture') {
      // Update local profile state
      setProfile(prevProfile => ({
        ...prevProfile,
        isCancelled: true,
        status: 'cancelled'
      }));
      
      // Profile will be refreshed on next mount
    }
  };

  const openSocialLink = (url) => {
    Linking.openURL(url);
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup kalendaru.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Greška', 'Nije pronađen kalendar.');
        return;
      }

      // Parse date and time
      const eventDate = new Date(profile.date);
      if (profile.time) {
        const [hours, minutes] = profile.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      // End time (1 hour later by default)
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1);

      const eventDetails = {
        title: profile.title,
        startDate: eventDate,
        endDate: endDate,
        location: [profile.address, profile.city].filter(Boolean).join(', '),
        notes: `Predavač: ${profile.speaker}\n${profile.description || ''}`,
        calendarId: defaultCalendar.id,
      };

      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      Alert.alert('Uspjeh', 'Događaj je dodat u kalendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Greška', 'Nije moguće dodati događaj u kalendar.');
    }
  };

  const onDateTimePress = () => {
    Alert.alert(
      'Dodaj u kalendar',
      `Želite li da dodate "${profile.title}" u svoj kalendar?`,
      [
        { text: 'Ne', style: 'cancel' },
        { text: 'Da', onPress: addToCalendar }
      ]
    );
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getImageSource = () => {
    if (imageError || !profile.image) {
      return { uri: 'https://via.placeholder.com/400x300/022C43/ffffff?text=Plakat+nije+dostupan' };
    }
    return { uri: getImageUrl(profile.image) };
  };

  const goBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#022C43" />
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Nazad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil nije pronađen</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Nazad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.imageContainer,
            type === 'daija' && styles.circularImage,
            type === 'lecture' && styles.fullWidthImageContainer
          ]}
          onPress={() => setImageModalVisible(true)}
        >
          {imageLoading && type === 'lecture' && (
            <View style={[styles.imageLoader, styles.fullWidthImage]}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.imageLoadingText}>Učitavanje plakata...</Text>
            </View>
          )}
          <Image
            source={type === 'lecture' ? getImageSource() : (
              profile.image 
                ? { uri: getImageUrl(profile.image) }
                : { uri: 'https://via.placeholder.com/150?text=No+Image' }
            )}
            style={[
              styles.profileImage,
              type === 'daija' && styles.circularImage,
              type === 'lecture' && styles.fullWidthImage,
              imageLoading && type === 'lecture' && { opacity: 0 }
            ]}
            onLoad={type === 'lecture' ? handleImageLoad : undefined}
            onError={type === 'lecture' ? handleImageError : undefined}
            onLoadStart={() => type === 'lecture' && setImageLoading(true)}
            cache="force-cache"
            resizeMode={type === 'lecture' ? 'contain' : 'cover'}
          />
          {/* Diagonal "OTKAZANO" label for cancelled lectures */}
          {type === 'lecture' && (profile.isCancelled || profile.status === 'cancelled') && (
            <View style={styles.cancelledOverlay}>
              <View style={styles.cancelledLabel}>
                <Text style={styles.cancelledText}>OTKAZANO</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        <Text style={[
          styles.title,
          type === 'lecture' && styles.lectureTitle
        ]}>
          {getTitle()}
        </Text>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          {type === 'lecture' && profile.date && (
            <TouchableOpacity style={styles.metaItem} onPress={onDateTimePress}>
              <Ionicons name="calendar" size={16} color="white" />
              <Text style={styles.metaText}>{formatDateWithDay(profile.date)}</Text>
            </TouchableOpacity>
          )}

          {type === 'lecture' && profile.time && (
            <TouchableOpacity style={styles.metaItem} onPress={onDateTimePress}>
              <Ionicons name="time" size={16} color="white" />
              <Text style={styles.metaText}>{profile.time}</Text>
            </TouchableOpacity>
          )}

          {type === 'lecture' && profile.speaker && (
            <View style={styles.metaItem}>
              <Ionicons name="person" size={16} color="white" />
              <Text style={styles.metaText}>{profile.speaker}</Text>
            </View>
          )}

          {type === 'lecture' && profile.organization && (
            <View style={styles.metaItem}>
              <Ionicons name="business" size={16} color="white" />
              <Text style={styles.metaText}>{profile.organization}</Text>
            </View>
          )}

          {(profile.address || profile.city) && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={styles.metaText}>
                {[profile.address, profile.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {(profile.description || profile.biography) && (
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionHeader}>
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.descriptionTitle}>
                {type === 'organization' ? 'O udruženju' : type === 'daija' ? 'Biografija' : 'Opis predavanja'}
              </Text>
            </View>
            <Text style={styles.descriptionText}>
              {profile.description || profile.biography}
            </Text>
          </View>
        )}

        {/* Social Media Links */}
        {type === 'organization' && (profile.facebook || profile.instagram || profile.telegram || profile.viber) && (
          <View style={styles.socialContainer}>
            {profile.facebook && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink(profile.facebook)}
              >
                <Ionicons name="logo-facebook" size={20} color="white" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            )}
            {profile.instagram && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink(profile.instagram)}
              >
                <Ionicons name="logo-instagram" size={20} color="white" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
            )}
            {profile.telegram && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink(profile.telegram)}
              >
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.socialText}>Telegram</Text>
              </TouchableOpacity>
            )}
            {profile.viber && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink(profile.viber)}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={styles.socialText}>Viber</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {(type === 'lecture' || type === 'organization') && (profile.address || profile.city) && (
            <TouchableOpacity style={styles.glassButton} onPress={openLocation}>
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.glassButtonText}>Lokacija</Text>
            </TouchableOpacity>
          )}
          
          <ShareButton profileData={profile} type={type} />
          
          {/* Report Cancellation Button - Only for lectures and non-cancelled */}
          {type === 'lecture' && !profile.isCancelled && profile.status !== 'cancelled' && (
            <CancellationReportButton
              lectureId={profile._id}
              lectureTitle={profile.title}
              isAlreadyCancelled={profile.isCancelled || profile.status === 'cancelled'}
              onReportSuccess={handleReportSuccess}
              variant="contained"
              size="medium"
              style={styles.cancellationButton}
            />
          )}
        </View>
      </View>

      {/* Lectures Section - For daija and organization profiles */}
      {(type === 'daija' || type === 'organization') && profileLectures.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Predavanja</Text>
          {loadingProfileLectures ? (
            <ActivityIndicator size="small" color="#022C43" style={styles.relatedLoader} />
          ) : (
            <View style={styles.relatedList}>
              {profileLectures.map((lecture) => (
                <UniverzalCard
                  key={lecture._id}
                  data={lecture}
                  onPress={() => {
                    // Navigate to the lecture profile
                    if (onProfileOpen) {
                      onProfileOpen(lecture, 'lecture');
                    }
                  }}
                  style={styles.relatedCard}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={type === 'lecture' ? getImageSource() : (
              profile.image 
                ? { uri: getImageUrl(profile.image) }
                : { uri: 'https://via.placeholder.com/150?text=No+Image' }
            )}
            style={styles.modalImage}
            resizeMode="contain"
            cache="force-cache"
          />
        </View>
      </Modal>

      {/* Related Lectures Section - Only for lecture profiles */}
      {type === 'lecture' && relatedLectures.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Ostala predavanja</Text>
          {loadingRelated ? (
            <ActivityIndicator size="small" color="#022C43" style={styles.relatedLoader} />
          ) : (
            <View style={styles.relatedList}>
              {relatedLectures.map((lecture) => (
                <UniverzalCard
                  key={lecture._id}
                  data={lecture}
                  onPress={() => {
                    // Navigate to the lecture profile
                    if (onProfileOpen) {
                      onProfileOpen(lecture, 'lecture');
                    }
                  }}
                  style={styles.relatedCard}
                />
              ))}
            </View>
          )}
        </View>
      )}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContentContainer: {
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroSection: {
    background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
    backgroundColor: '#022C43',
    padding: screenWidth > 600 ? 30 : 20,
    paddingTop: screenWidth > 600 ? 30 : 20,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circularImage: {
    borderRadius: 100,
  },
  fullWidthImageContainer: {
    width: '100%',
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 15,
    position: 'relative',
  },
  fullWidthImage: {
    width: '100%',
    minHeight: 200,
    maxHeight: screenWidth > 600 ? 600 : screenWidth * 1.2,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: screenWidth > 600 ? 28 : 22,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: screenWidth > 600 ? 40 : 20,
  },
  lectureTitle: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: screenWidth > 600 ? 15 : 10,
    paddingHorizontal: screenWidth > 600 ? 20 : 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: screenWidth > 600 ? 16 : 12,
    paddingVertical: screenWidth > 600 ? 10 : 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: screenWidth > 600 ? 140 : 'auto',
  },
  metaText: {
    color: 'white',
    fontSize: screenWidth > 600 ? 16 : 14,
    fontWeight: '500',
    marginLeft: screenWidth > 600 ? 8 : 5,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: screenWidth > 600 ? 20 : 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    maxWidth: screenWidth > 600 ? 600 : '100%',
    alignSelf: 'center',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  descriptionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionText: {
    color: 'white',
    fontSize: screenWidth > 600 ? 16 : 14,
    lineHeight: screenWidth > 600 ? 24 : 20,
    opacity: 0.95,
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  socialText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  glassButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  glassButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  cancellationButton: {
    marginTop: 0,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
  },
  modalImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.8,
  },
  relatedSection: {
    backgroundColor: '#f5f5f5',
    padding: screenWidth > 600 ? 30 : 20,
    paddingTop: screenWidth > 600 ? 40 : 30,
    paddingBottom: 100, // Extra padding for bottom navigation
    maxWidth: screenWidth > 600 ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  relatedTitle: {
    fontSize: screenWidth > 600 ? 24 : 20,
    fontWeight: 'bold',
    color: '#022C43',
    marginBottom: screenWidth > 600 ? 25 : 20,
    textAlign: 'center',
  },
  relatedLoader: {
    marginTop: 20,
  },
  relatedList: {
    gap: 15,
  },
  relatedCard: {
    marginBottom: 15,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 67, 0.8)',
    borderRadius: 15,
    zIndex: 1,
    minHeight: 200,
    maxHeight: screenWidth > 600 ? 600 : screenWidth * 1.2,
  },
  imageLoadingText: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  cancelledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  cancelledLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300, // Šira traka za veću sliku
    height: 40,
    backgroundColor: '#f44336',
    transform: [
      { translateX: -150 }, // Pola širine
      { translateY: -20 },  // Pola visine
      { rotate: '-45deg' }
    ],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelledText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default UniversalProfile;