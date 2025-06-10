import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, getDefaultDaijaImage, getDefaultLectureImage, getDefaultOrganizationImage } from '../utils/imageUtils';
import UniverzalCard from './UniverzalCard';
import predavanjaService from '../services/predavanjaService';
const { Linking } = require('react-native');

const { width } = Dimensions.get('window');

// Colors matching the app theme
const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  purple: '#9C27B0',
  background: '#fafafa',
  text: '#333333',
  textLight: '#888888',
};

const UniversalProfile = ({ data, type, onBack }) => {
  const [relatedLectures, setRelatedLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format date with day name
  const formatDateWithDay = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${format(date, 'd.M.yyyy.')} (${format(date, 'EEEE', { locale: bs }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: bs }).slice(1)})`;
  };

  // Fetch related lectures based on profile type
  useEffect(() => {
    const fetchRelatedLectures = async () => {
      if (!data || !data._id) return;
      
      setIsLoading(true);
      try {
        let lectures = [];
        
        switch (type) {
          case 'daija':
            lectures = await predavanjaService.getPredavanjaByDaija(data._id);
            break;
          case 'organization':
            lectures = await predavanjaService.getPredavanjaByOrganization(data._id);
            break;
          case 'lecture':
            // For lectures, get other lectures by same daija or organization
            const allLectures = await predavanjaService.getAllPredavanja();
            lectures = allLectures.filter(lecture => 
              lecture._id !== data._id && 
              (lecture.daija === data.daija || lecture.organizationId === data.organizationId)
            );
            break;
        }
        
        const approvedLectures = Array.isArray(lectures) ? lectures.filter(l => l.status === 'approved') : [];
        // Apply centralized sorting to related lectures
        const sortedLectures = sortLecturesByTime(approvedLectures);
        setRelatedLectures(sortedLectures);
      } catch (error) {
        console.error('Error fetching related lectures:', error);
        setRelatedLectures([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedLectures();
  }, [data, type]);

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profil nije pronađen</Text>
      </View>
    );
  }

  const getProfileImage = () => {
    switch (type) {
      case 'daija':
        return getImageUrl(data.image) || getDefaultDaijaImage();
      case 'organization':
        return getImageUrl(data.image) || getDefaultOrganizationImage();
      case 'lecture':
        return getImageUrl(data.image) || getDefaultLectureImage();
      default:
        return getDefaultLectureImage();
    }
  };

  const getProfileTitle = () => {
    switch (type) {
      case 'daija':
        return data.name || 'Nepoznat daija';
      case 'organization':
        return data.name || 'Nepoznata organizacija';
      case 'lecture':
        return data.title || 'Nepoznat ders';
      default:
        return 'Nepoznat profil';
    }
  };

  // Function to extract username/id from social media URLs
  const extractSocialMediaIdentifier = (url, platform) => {
    if (!url) return null;
    
    // Remove protocol and common prefixes
    let cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        // Extract from facebook.com/username or facebook.com/pages/name/id
        if (cleanUrl.includes('facebook.com/')) {
          const parts = cleanUrl.split('facebook.com/')[1];
          return parts.split('/')[0];
        }
        break;
      case 'instagram':
        // Extract from instagram.com/username
        if (cleanUrl.includes('instagram.com/')) {
          const username = cleanUrl.split('instagram.com/')[1].split('/')[0];
          return username.replace('@', '');
        }
        break;
      case 'twitter':
        // Extract from twitter.com/username or x.com/username
        if (cleanUrl.includes('twitter.com/') || cleanUrl.includes('x.com/')) {
          const parts = cleanUrl.includes('twitter.com/') ? 
            cleanUrl.split('twitter.com/')[1] : 
            cleanUrl.split('x.com/')[1];
          return parts.split('/')[0].replace('@', '');
        }
        break;
      case 'youtube':
        // Extract from youtube.com/channel/id or youtube.com/user/username or youtube.com/@username
        if (cleanUrl.includes('youtube.com/')) {
          const parts = cleanUrl.split('youtube.com/')[1];
          if (parts.startsWith('channel/')) {
            return parts.split('channel/')[1].split('/')[0];
          } else if (parts.startsWith('user/')) {
            return parts.split('user/')[1].split('/')[0];
          } else if (parts.startsWith('@')) {
            return parts.split('@')[1].split('/')[0];
          }
        }
        break;
      case 'linkedin':
        // Extract from linkedin.com/in/username or linkedin.com/company/name
        if (cleanUrl.includes('linkedin.com/')) {
          const parts = cleanUrl.split('linkedin.com/')[1];
          if (parts.startsWith('in/')) {
            return parts.split('in/')[1].split('/')[0];
          } else if (parts.startsWith('company/')) {
            return parts.split('company/')[1].split('/')[0];
          }
        }
        break;
      case 'telegram':
        // Extract from t.me/username or telegram.me/username
        if (cleanUrl.includes('t.me/') || cleanUrl.includes('telegram.me/')) {
          const parts = cleanUrl.includes('t.me/') ? 
            cleanUrl.split('t.me/')[1] : 
            cleanUrl.split('telegram.me/')[1];
          return parts.split('/')[0].replace('@', '');
        }
        break;
    }
    
    return null;
  };

  // Function to handle opening social media links
  const handleSocialMediaPress = async (url, platform) => {
    try {
      let appUrl = null;
      let webUrl = url;
      
      // Ensure web URL has proper protocol
      if (!webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
        webUrl = `https://${webUrl}`;
      }

      // Extract identifier for app-specific URLs
      const identifier = extractSocialMediaIdentifier(url, platform);

      // Generate app-specific URLs
      switch (platform.toLowerCase()) {
        case 'facebook':
          if (identifier) {
            appUrl = `fb://profile/${identifier}`;
          }
          break;
        case 'instagram':
          if (identifier) {
            appUrl = `instagram://user?username=${identifier}`;
          }
          break;
        case 'twitter':
          if (identifier) {
            appUrl = `twitter://user?screen_name=${identifier}`;
          }
          break;
        case 'youtube':
          if (identifier) {
            appUrl = `youtube://channel/${identifier}`;
          }
          break;
        case 'linkedin':
          if (identifier) {
            appUrl = `linkedin://profile/${identifier}`;
          }
          break;
        case 'telegram':
          if (identifier) {
            appUrl = `tg://resolve?domain=${identifier}`;
          }
          break;
        case 'whatsapp':
          // For WhatsApp, assume the URL contains phone number
          if (identifier) {
            appUrl = `whatsapp://send?phone=${identifier}`;
          }
          break;
        case 'tiktok':
          if (identifier) {
            appUrl = `tiktok://user?username=${identifier}`;
          }
          break;
      }

      // Try to open in app first, then fallback to web
      if (appUrl) {
        const canOpenApp = await Linking.canOpenURL(appUrl);
        if (canOpenApp) {
          await Linking.openURL(appUrl);
          return;
        }
      }

      // Fallback to web URL
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
      } else {
        Alert.alert('Greška', `Ne mogu otvoriti ${platform} link.`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Greška', `Ne mogu otvoriti ${platform} link.`);
    }
  };

  const renderInfoSection = (title, icon, content, color = COLORS.primary) => {
    if (!content) return null;

    return (
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {content}
        </View>
      </View>
    );
  };

  const renderAllInformation = () => {
    const informationItems = [];
    
    // Contact information
    if (data.email) informationItems.push({ icon: 'mail-outline', text: data.email, type: 'email' });
    if (data.phone) informationItems.push({ icon: 'call-outline', text: data.phone, type: 'phone' });
    if (data.address) informationItems.push({ icon: 'location-outline', text: data.address, type: 'address' });
    if (data.city) informationItems.push({ icon: 'business-outline', text: data.city, type: 'city' });
    
    // Lecture specific information
    if (type === 'lecture') {
      if (data.speaker) informationItems.push({ icon: 'person-outline', text: `Predavač: ${data.speaker}`, type: 'speaker' });
      if (data.organization) informationItems.push({ icon: 'business-outline', text: `Udruženje: ${data.organization}`, type: 'organization' });
      if (data.date) informationItems.push({ icon: 'calendar-outline', text: `Datum: ${formatDateWithDay(data.date)}`, type: 'date' });
      if (data.time) informationItems.push({ icon: 'time-outline', text: `Vrijeme: ${data.time}`, type: 'time' });
    }

    if (informationItems.length === 0) return null;

    const content = (
      <View style={styles.contactList}>
        {informationItems.map((item, index) => (
          <View key={index} style={styles.contactItem}>
            <Ionicons name={item.icon} size={18} color={COLORS.textLight} />
            <Text style={styles.contactText}>{item.text}</Text>
          </View>
        ))}
      </View>
    );

    return renderInfoSection('Informacije', 'information-circle-outline', content, COLORS.info);
  };

  const renderBiographyDescription = () => {
    if (!data.biography && !data.description) return null;

    let sectionTitle = 'Opis';
    let sectionIcon = 'document-text-outline';
    
    if (type === 'daija') {
      sectionTitle = 'Biografija';
      sectionIcon = 'person-circle-outline';
    } else if (type === 'organization') {
      sectionTitle = 'Kratki opis';
      sectionIcon = 'information-outline';
    }

    const content = (
      <Text style={styles.biographyText}>
        {data.biography || data.description}
      </Text>
    );

    return renderInfoSection(sectionTitle, sectionIcon, content, COLORS.gray);
  };

  const renderSocialMedia = () => {
    const socialItems = [];
    
    // Check all possible social media platforms and add them if they exist and are not empty
    if (data.linkedin && data.linkedin.trim()) {
      socialItems.push({ icon: 'logo-linkedin', text: 'LinkedIn', url: data.linkedin });
    }
    if (data.facebook && data.facebook.trim()) {
      socialItems.push({ icon: 'logo-facebook', text: 'Facebook', url: data.facebook });
    }
    if (data.twitter && data.twitter.trim()) {
      socialItems.push({ icon: 'logo-twitter', text: 'Twitter', url: data.twitter });
    }
    if (data.instagram && data.instagram.trim()) {
      socialItems.push({ icon: 'logo-instagram', text: 'Instagram', url: data.instagram });
    }
    if (data.youtube && data.youtube.trim()) {
      socialItems.push({ icon: 'logo-youtube', text: 'YouTube', url: data.youtube });
    }
    if (data.tiktok && data.tiktok.trim()) {
      socialItems.push({ icon: 'logo-tiktok', text: 'TikTok', url: data.tiktok });
    }
    if (data.telegram && data.telegram.trim()) {
      socialItems.push({ icon: 'paper-plane-outline', text: 'Telegram', url: data.telegram });
    }
    if (data.whatsapp && data.whatsapp.trim()) {
      socialItems.push({ icon: 'logo-whatsapp', text: 'WhatsApp', url: data.whatsapp });
    }
    if (data.website && data.website.trim()) {
      socialItems.push({ icon: 'globe-outline', text: 'Website', url: data.website });
    }
    if (data.blog && data.blog.trim()) {
      socialItems.push({ icon: 'document-text-outline', text: 'Blog', url: data.blog });
    }

    // Don't render anything if no social media links are provided
    if (socialItems.length === 0) return null;

    return (
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>Društvene mreže</Text>
        <View style={styles.socialGrid}>
          {socialItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.socialButton}
              onPress={() => handleSocialMediaPress(item.url, item.text)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.white} />
              <Text style={styles.socialButtonText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEducationExperience = () => {
    if (type !== 'daija') return null;

    const sections = [];

    if (data.education && data.education.length > 0) {
      const educationContent = (
        <View style={styles.listContainer}>
          {data.education.map((item, index) => (
            <View key={`education-${index}`} style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
      sections.push(
        <View key="education-section">
          {renderInfoSection('Obrazovanje', 'school-outline', educationContent, COLORS.primary)}
        </View>
      );
    }

    if (data.experience && data.experience.length > 0) {
      const experienceContent = (
        <View style={styles.listContainer}>
          {data.experience.map((item, index) => (
            <View key={`experience-${index}`} style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
      sections.push(
        <View key="experience-section">
          {renderInfoSection('Iskustvo', 'briefcase-outline', experienceContent, COLORS.secondary)}
        </View>
      );
    }

    return sections;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getProfileImage() }}
              style={[
                styles.profileImage,
                type === 'daija' ? styles.circularImage : styles.rectangularImage
              ]}
              resizeMode="cover"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileTitle}>{getProfileTitle()}</Text>
            
            {type === 'daija' && data.title && (
              <Text style={styles.profileSubtitle}>{data.title}</Text>
            )}
            
            {data.shortDescription && (
              <Text style={styles.profileDescription}>{data.shortDescription}</Text>
            )}
          </View>

          {renderSocialMedia()}
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {/* Education & Experience for Daija */}
          {renderEducationExperience()}

          {/* All Information (Contact + Lecture details) */}
          {renderAllInformation()}

          {/* Biography/Description */}
          {renderBiographyDescription()}

          {/* Related Lectures */}
          {relatedLectures.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Povezana predavanja</Text>
              <View style={styles.relatedList}>
                {relatedLectures.map((lecture) => (
                  <UniverzalCard
                    key={lecture._id}
                    data={{ ...lecture, type: 'predavanje' }}
                    onPress={() => Alert.alert('Predavanje', lecture.title)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* No lectures message */}
          {relatedLectures.length === 0 && type !== 'lecture' && (
            <View style={styles.emptyState}>
              <Ionicons name="information-circle-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyStateText}>
                {type === 'daija' ? 'Daija još nema predavanja na platformi' :
                 type === 'organization' ? 'Udruženje još nema predavanja na platformi' :
                 'Nema povezanih predavanja'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  backButton: {
    padding: 15,
  },
  heroSection: {
    paddingTop: 0,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1 / 1, // prilagodi ako znaš odnos širina/visina
    borderRadius: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
  },
  circularImage: {
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rectangularImage: {
    borderRadius: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  profileDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width - 60,
  },
  socialContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 100, // Safe area for bottom navigation (80px height + 20px extra space)
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionContent: {
    gap: 8,
  },
  contactList: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  detailsList: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  biographyText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'justify',
  },
  relatedSection: {
    marginTop: 8,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  relatedList: {
    gap: 8,
  },
  emptyState: {
    backgroundColor: COLORS.info,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 50,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    flex: 1,
  },
});

export default UniversalProfile;