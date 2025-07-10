import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { predavanjaService, daijeService, udruzenjaService } from '../services';
import { getImageUrl } from '../utils/imageUtils';
import { formatDateWithDay } from '../utils/dateUtils';
import ShareButton from './ShareButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const UniversalProfile = ({ route, navigation }) => {
  const { type, id } = route.params;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [type, id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (type === 'lecture') {
        data = await predavanjaService.getPredavanjeById(id);
      } else if (type === 'daija') {
        data = await daijeService.getDaijaById(id);
      } else if (type === 'organization') {
        data = await udruzenjaService.getUdruzenjeById(id);
      } else {
        throw new Error('Nepoznat tip profila');
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Greška pri učitavanju profila');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (type === 'daija') {
      return profile.title ? `${profile.name} - ${profile.title}` : profile.name;
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

  const openSocialLink = (url) => {
    Linking.openURL(url);
  };

  const goBack = () => {
    navigation.goBack();
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <TouchableOpacity 
          style={[
            styles.imageContainer,
            type === 'daija' && styles.circularImage
          ]}
          onPress={() => setImageModalVisible(true)}
        >
          <Image
            source={
              profile.image 
                ? { uri: getImageUrl(profile.image) }
                : { uri: 'https://via.placeholder.com/150?text=No+Image' }
            }
            style={[
              styles.profileImage,
              type === 'daija' && styles.circularImage
            ]}
            onError={() => {
              // Handle image error - could set a state to use default image
            }}
          />
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
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color="white" />
              <Text style={styles.metaText}>{formatDateWithDay(profile.date)}</Text>
            </View>
          )}

          {type === 'lecture' && profile.time && (
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color="white" />
              <Text style={styles.metaText}>{profile.time}</Text>
            </View>
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
            <TouchableOpacity style={styles.actionButton} onPress={openLocation}>
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.actionText}>Lokacija</Text>
            </TouchableOpacity>
          )}
          
          <ShareButton profileData={profile} type={type} />
        </View>
      </View>

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
            source={
              profile.image 
                ? { uri: getImageUrl(profile.image) }
                : { uri: 'https://via.placeholder.com/150?text=No+Image' }
            }
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  heroSection: {
    background: 'linear-gradient(135deg, #022C43 0%, #055A87 100%)',
    backgroundColor: '#022C43',
    padding: 20,
    paddingTop: 80,
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
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circularImage: {
    borderRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
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
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  metaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
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
    fontSize: 14,
    lineHeight: 20,
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
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#022C43',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
});

export default UniversalProfile;