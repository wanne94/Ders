import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, getDefaultDaijaImage, getDefaultLectureImage, getDefaultOrganizationImage } from '../utils/imageUtils';
import { formatDaijaTitle, toTitleCase } from '../utils';
import { useState } from 'react';
// import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  textLight: '#999999',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  card: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
  },
  gap: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  textStyles: {
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.primary,
      lineHeight: 24,
    },
    cardInfo: {
      fontSize: 13,
      color: COLORS.gray,
      lineHeight: 18,
    },
    bodySmall: {
      fontSize: 14,
      color: COLORS.gray,
      lineHeight: 20,
    },
  },
};

// Icon components using Ionicons to match web icons
const Icons = {
  Person: () => <Ionicons name="person" size={16} color={COLORS.gray} />,
  Business: () => <Ionicons name="business" size={16} color={COLORS.gray} />,
  Calendar: () => <Ionicons name="calendar" size={16} color={COLORS.gray} />,
  Time: () => <Ionicons name="time" size={16} color={COLORS.gray} />,
  LocationOn: () => <Ionicons name="location" size={16} color={COLORS.gray} />,
  LocationCity: () => <Ionicons name="location-outline" size={16} color={COLORS.gray} />,
  School: () => <Ionicons name="school" size={16} color={COLORS.gray} />,
  RecordVoiceOver: () => <Ionicons name="mic" size={16} color={COLORS.gray} />,
  MenuBook: () => <Ionicons name="book" size={16} color={COLORS.gray} />,
  Info: () => <Ionicons name="information-circle" size={16} color={COLORS.gray} />,
  Event: () => <Ionicons name="calendar" size={16} color={COLORS.gray} />,
  Description: () => <Ionicons name="document-text" size={16} color={COLORS.gray} />,
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
        // Check if lecture is in the past
        const isPastLecture = data.date ? new Date(data.date) < new Date() : false;
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          isPastLecture,
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
          title: formatDaijaTitle(data.name, data.title) || 'Nepoznata daija',
          
          items: [
            data.shortDescription && { icon: 'Description', text: data.shortDescription }
,
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
            data.shortDescription && { icon: 'Description', text: data.shortDescription }
,
            data.lectureCount !== undefined && { icon: "MenuBook", text: `Broj predavanja: ${data.lectureCount || 0}` },
          ].filter(Boolean)
        };
      
      default:
        // Fallback for unknown types or when type field is not available
        if (data.title && (data.speaker || data.daija)) {
          // Check if lecture is in the past
          const isPastLecture = data.date ? new Date(data.date) < new Date() : false;
          
          return {
            type: 'lecture',
            title: data.title?.toUpperCase() || '',
            isPastLecture,
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
              data.shortDescription && { icon: 'Description', text: data.shortDescription }
,
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
      {/* Status badge for lectures */}
      {displayData.type === 'lecture' && displayData.isPastLecture !== undefined && (
        <View style={styles.statusBadge}>
          <View style={styles.statusBadgeContent}>
            <Ionicons 
              name={displayData.isPastLecture ? "checkmark-circle" : "time"} 
              size={12} 
              color={displayData.isPastLecture ? '#c62828' : '#2e7d32'} 
            />
            <Text style={[
              styles.statusBadgeText, 
              displayData.isPastLecture ? styles.statusBadgePast : styles.statusBadgeFuture
            ]}>
              {displayData.isPastLecture ? 'Prošlo' : 'Uskoro'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Card Title - Above both columns */}
      <View style={styles.cardTitleContainer}>
        <Text style={[
          styles.cardTitle,
          displayData.type === 'lecture' && styles.lectureTitle
        ]} numberOfLines={2}>
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
            style={displayData.type === 'daija' ? styles.imageDaija : displayData.type === 'organization' ? styles.imageOrganization : styles.image}
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
    width: width * 0.9,
    height: 250,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.card.borderRadius,
    padding: SPACING.card.padding,
    paddingTop: 40,
    flexDirection: 'column',
    ...{
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2.84,
    },
    justifyContent: 'center',
    marginBottom: SPACING.card.margin,
  },
  cardTitleContainer: {
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  cardTitle: {
    ...TYPOGRAPHY.textStyles.cardTitle,
  },
  lectureTitle: {
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
    marginRight: SPACING.md,
    justifyContent: 'center',
  },
  titlePrefix: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
    lineHeight: 14,
  },
  subtitle: {
    ...TYPOGRAPHY.textStyles.bodySmall,
    marginBottom: SPACING.sm,
  },
  infoItemsContainer: {
    gap: SPACING.xs / 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.gap.md,
  },
  statusBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.gap.sm,
  },
  infoText: {
    ...TYPOGRAPHY.textStyles.cardInfo,
    flex: 1,
  },
  imageColumn: {
    maxWidth: 100,
    maxHeight: 150,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    minHeight: 60,
  },
  imageDaija: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular for daije, smaller size
  },
  imageOrganization: {
    width: 100,
    height: 100,
    borderRadius: 8, // Square 1:1 aspect ratio for organizations
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: COLORS.gray,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadgePast: {
    color: '#c62828',
  },
  statusBadgeFuture: {
    color: '#2e7d32',
  },
});

export default UniverzalCard;