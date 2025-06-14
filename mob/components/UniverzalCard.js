import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { getImageUrl, getDefaultDaijaImage, getDefaultLectureImage, getDefaultOrganizationImage } from '../utils/imageUtils';
import { useState } from 'react';

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
};

// Icon components using Unicode symbols to match web icons
const Icons = {
  Person: () => <Text style={styles.icon}>👤</Text>,
  Business: () => <Text style={styles.icon}>🏢</Text>,
  Calendar: () => <Text style={styles.icon}>📅</Text>,
  Time: () => <Text style={styles.icon}>🕐</Text>,
  LocationOn: () => <Text style={styles.icon}>📍</Text>,
  LocationCity: () => <Text style={styles.icon}>🏙️</Text>,
  School: () => <Text style={styles.icon}>🎓</Text>,
  RecordVoiceOver: () => <Text style={styles.icon}>🎤</Text>,
  MenuBook: () => <Text style={styles.icon}>📚</Text>,
  Info: () => <Text style={styles.icon}>ℹ️</Text>,
  Event: () => <Text style={styles.icon}>🎉</Text>,
};

const UniverzalCard = ({ data, onPress, style }) => {
  const [imageError, setImageError] = useState(false);
  
  // Handle null or undefined data
  if (!data) {
    return null;
  }

  // Debug image URL for daije
  if (data.type === 'daija' || data.name) {
    const imageUrl = imageError || !data.image 
      ? getDefaultDaijaImage() 
      : getImageUrl(data.image);
    console.log('🖼️ Daija image debug:', {
      name: data.name,
      originalImage: data.image,
      imageError,
      finalImageUrl: imageUrl
    });
  }

  // Format date with day name
  const formatDateWithDay = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${format(date, 'd.M.yyyy.')} (${format(date, 'EEEE', { locale: bs }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: bs }).slice(1)})`;
  };

  // Determine data type and extract appropriate fields
  const getDisplayData = () => {
    // Use the explicit type field if available
    const entityType = data.type?.toLowerCase() || 'unknown';
    
    switch (entityType) {
      case 'predavanje':
        return {
          type: 'lecture',
          title: data.title,
          items: [
            { icon: "Person", text: data.daija && typeof data.daija === "object" ? `${data.daija.title || ""} ${data.daija.name || ""}`.trim() || "Nepoznat daija" : data.speaker || "Nepoznat daija" },
            data.organization && { icon: 'Business', text: data.organization },
            data.date && { icon: 'Calendar', text: formatDateWithDay(data.date) },
            data.time && { icon: 'Time', text: data.time },
            data.address && { icon: 'LocationOn', text: data.address },
            data.city && { icon: 'LocationCity', text: data.city },
          ].filter(Boolean)
        };
      
      case 'daija':
        return {
          type: 'daija',
          title: data.name || 'Nepoznata daija',
          
          items: [
            data.title && { icon: 'School', text: data.title + '.' },
            data.shortDescription && { icon: 'Description', text: data.shortDescription },
            data.lectureCount !== undefined && { icon: "MenuBook", text: `Broj predavanja: ${data.lectureCount || 0}` },
          ].filter(Boolean)
        };
      
      case 'udruženje':
        return {
          type: 'organization',
          title: data.name,
          items: [
            data.address && { icon: 'LocationOn', text: data.address },
            data.city && { icon: 'LocationCity', text: data.city },
            data.shortDescription && { icon: 'Description', text: data.shortDescription },
            data.lectureCount !== undefined && { icon: "MenuBook", text: `Broj predavanja: ${data.lectureCount || 0}` },
          ].filter(Boolean)
        };
      
      default:
        // Fallback for unknown types or when type field is not available
        if (data.title && (data.speaker || data.daija)) {
          return {
            type: 'lecture',
            title: data.title,
            items: [
              { icon: "Person", text: data.daija && typeof data.daija === "object" ? `${data.daija.title || ""} ${data.daija.name || ""}`.trim() || "Nepoznat daija" : data.speaker || "Nepoznat daija" },
              data.organization && { icon: 'Business', text: data.organization },
              data.date && { icon: 'Calendar', text: formatDateWithDay(data.date) },
              data.time && { icon: 'Time', text: data.time },
              data.address && { icon: 'LocationOn', text: data.address },
              data.city && { icon: 'LocationCity', text: data.city },
            ].filter(Boolean)
          };
        }
        
        if ((data.title && data.name) || (data.name && data.title)) {
          return {
            type: 'daija',
            title: data.name || 'Nepoznata daija',
            titlePrefix: data.title?.toUpperCase(),
            items: [
              data.title && { icon: 'School', text: data.title.toUpperCase() },
              data.shortDescription && { icon: 'Description', text: data.shortDescription }
            ].filter(Boolean)
          };
        }
        
        if (data.name && !data.speaker && !data.daija && !data.title) {
          return {
            type: 'organization',
            title: data.name,
            items: [
              data.address && { icon: 'LocationOn', text: data.address },
              data.city && { icon: 'LocationCity', text: data.city },
              data.shortDescription && { icon: 'Description', text: data.shortDescription },
              data.lectureCount !== undefined && { icon: "MenuBook", text: `Broj predavanja: ${data.lectureCount || 0}` },
            ].filter(Boolean)
          };
        }
        
        return {
          type: 'unknown',
          title: data.title || data.name || 'Bez naziva',
          items: []
        };
    }
  };

  const displayData = getDisplayData();

  console.log('Image URL:', data.image ? getImageUrl(data.image) : 'Using default image');

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Card Title - Above both columns */}
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {displayData.title}
        </Text>
      </View>
      
      {/* Content Row - Left and Right columns */}
      <View style={styles.contentRow}>
        {/* Left Column - Information */}
        <View style={styles.infoColumn}>
          {/* Title prefix (for daija titles like "prof.") */}
          {displayData.titlePrefix && (
            <Text style={styles.titlePrefix}>
              {displayData.titlePrefix}
            </Text>
          )}
        
        {/* Subtitle (lecture count for daija/organization) */}
        {displayData.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {displayData.subtitle}
          </Text>
        )}
        
        {/* Info items with icons */}
        <View style={styles.infoItemsContainer}>
          {displayData.items.map((item, index) => (
            <View key={`info-${index}`} style={styles.infoItem}>
              {item.icon && renderIcon(item.icon)}
              <Text style={styles.infoText} numberOfLines={1}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

        {/* Right Column - Image */}
        <View style={styles.imageColumn}>
          <Image
            source={{ uri: 
              imageError || !data.image 
                ? (displayData.type === 'daija' 
                  ? getDefaultDaijaImage() 
                  : displayData.type === 'organization'
                  ? getDefaultOrganizationImage()
                  : getDefaultLectureImage())
                : getImageUrl(data.image)
            }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9, // 90% širine ekrana
    height: 230,
    alignSelf: 'center', // centriraj karticu
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    justifyContent: 'center',
    marginBottom: 6,
    // Removed minHeight to allow dynamic height based on content
  },
  cardTitleContainer: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 24,
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center', // Center content vertically
  },
  titlePrefix: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
    lineHeight: 14,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 8,
    lineHeight: 16,
  },
  infoItemsContainer: {
    gap: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 16,
    flex: 1,
  },
  imageColumn: {
    width: 100,
    justifyContent: 'center', // Center image vertically
    alignItems: 'center',
    alignSelf: 'center', // Center the entire image column vertically
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: COLORS.gray,
  },
});

export default UniverzalCard;