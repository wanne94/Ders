import React, { useState, useEffect, memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, getDefaultDaijaImage, getDefaultLectureImage, getDefaultOrganizationImage } from '../utils/imageUtils';
import { formatDaijaTitle } from '../utils';
import { calculateLectureStatus, getStatusBadgeColors } from '../utils/lectureStatusHelpers';
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
  const [statusInfo, setStatusInfo] = useState(null);
  
  // Calculate status for lectures - only once on mount
  useEffect(() => {
    if (data && (data.type?.toLowerCase() === 'predavanje' || (data.title && (data.speaker || data.daija)))) {
      const calculatedStatus = data.statusInfo || calculateLectureStatus(data);
      setStatusInfo(calculatedStatus);
      
      // Only set up interval for active lectures with much longer interval
      let interval;
      if (calculatedStatus.status === 'active') {
        interval = setInterval(() => {
          const newStatus = calculateLectureStatus(data);
          setStatusInfo(newStatus);
        }, 60000); // Update only every minute for active lectures
      }
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [data]);

  // Handle null or undefined data
  if (!data) {
    return null;
  }

  // Comment out debug logs for production
  // if (__DEV__ && (data.type === 'daija' || data.name)) {
  //   const imageUrl = imageError || !data.image 
  //     ? getDefaultDaijaImage() 
  //     : getImageUrl(data.image);
  //   console.log('🖼️ Daija image debug:', {
  //     name: data.name,
  //     originalImage: data.image,
  //     imageError,
  //     finalImageUrl: imageUrl
  //   });
  // }

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
        // Check if lecture is cancelled
        const isCancelled = data.cancelled || data.status === 'cancelled';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          statusInfo,
          isCancelled,
          items: [
            { icon: "Person", text: data.daija && typeof data.daija === "object" ? formatDaijaTitle(data.daija.name, data.daija.title) || "Nepoznat daija" : data.speaker || "Nepoznat daija" },
            data.organization && { icon: 'Business', text: data.organization },
            // Show date/time for all lectures including cancelled ones
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
          return {
            type: 'lecture',
            title: data.title?.toUpperCase() || '',
            statusInfo,
            items: [
              { icon: "Person", text: data.daija && typeof data.daija === "object" ? formatDaijaTitle(data.daija.name, data.daija.title) || "Nepoznat daija" : data.speaker || "Nepoznat daija" },
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

  // console.log('Image URL:', data.image ? getImageUrl(data.image) : 'Using default image');

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        style,
        // Add slight transparency for cancelled lectures
        displayData.type === 'lecture' && displayData.isCancelled && { opacity: 0.85 }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >

      {/* Weekly lecture badge - left side */}
      {displayData.type === 'lecture' && data.isWeeklyLecture && (
        <View style={styles.weeklyBadge}>
          <Text style={styles.weeklyBadgeText}>Sedmično</Text>
        </View>
      )}

      {/* Status Badge for all lectures */}
      {displayData.type === 'lecture' && displayData.statusInfo && (
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: getStatusBadgeColors(displayData.statusInfo.badgeColor).backgroundColor,
          }
        ]}>
          <Text style={[
            styles.statusBadgeText,
            { color: getStatusBadgeColors(displayData.statusInfo.badgeColor).textColor }
          ]}>
            {displayData.statusInfo.badgeText}
          </Text>
        </View>
      )}
      
      {/* Live Indicator for active lectures */}
      {displayData.type === 'lecture' && displayData.statusInfo?.status === 'active' && (
        <View style={styles.liveIndicator}>
          <Text style={styles.liveIndicatorText}>🔴 UŽIVO</Text>
        </View>
      )}
      
      {/* Card Title - Above both columns, only for lectures */}
      {displayData.type === 'lecture' && (
        <View style={styles.cardTitleContainer}>
          <Text style={[
            styles.cardTitle,
            styles.lectureTitle
          ]} numberOfLines={2}>
            {displayData.title}
            {data.lecturePart && ` (dio ${data.lecturePart}.)`}
          </Text>
        </View>
      )}
      
      {/* Content Row - Left and Right columns */}
      <View style={styles.contentRow}>
        {/* Left Column - Information */}
        <View style={styles.infoColumn}>
          {/* Title for non-lecture types */}
          {displayData.type !== 'lecture' && (
            <>
              {displayData.titlePrefix && (
                <Text style={styles.titlePrefix}>
                  {displayData.titlePrefix}
                </Text>
              )}
              <Text style={styles.nonLectureTitle} numberOfLines={2}>
                {displayData.title}
              </Text>
            </>
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
          <View style={[
            styles.imageContainer,
            displayData.type === 'daija' && { width: 100, height: 100 },
            displayData.type === 'organization' && { width: 100, height: 100 },
          ]}>
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
            {/* Diagonal "OTKAZANO" label for cancelled lectures - only over image */}
            {displayData.type === 'lecture' && displayData.isCancelled && (
              <View style={styles.cancelledOverlay}>
                <View style={styles.cancelledLabel}>
                  <Text style={styles.cancelledText}>OTKAZANO</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.card.borderRadius,
    padding: SPACING.card.padding,
    flexDirection: 'column',
    ...{
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    marginBottom: SPACING.sm, // Smanjen sa card.margin (8) na sm (8) - može se smanjiti na xs (4) ako treba
  },
  cardTitleContainer: {
    marginBottom: SPACING.xs,
    paddingTop: 35, // Space for badges
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 23,
    textAlign: 'left',
  },
  lectureTitle: {
    textTransform: 'uppercase',
  },
  nonLectureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
    textAlign: 'left',
  },
  contentRow: {
    flexDirection: 'row',
    flex: 1,
    marginTop: SPACING.xs,
  },
  infoColumn: {
    flex: 1,
    marginRight: SPACING.lg, // Povećan razmak sa md (16) na lg (24)
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
    gap: SPACING.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.gap.md,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    flex: 1,
    textAlign: 'left',
    paddingRight: 8, // Dodajemo padding desno
  },
  imageColumn: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 130, // Taller for lectures
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageDaija: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageOrganization: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: 180,
    zIndex: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  liveIndicator: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: '#ff1744',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  liveIndicatorText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 40,
    transform: [
      { translateX: -50 },
      { translateY: -50 },
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
  },
  weeklyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 3,
  },
  weeklyBadgeText: {
    color: '#1565c0',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Memoize component to prevent unnecessary re-renders
export default memo(UniverzalCard, (prevProps, nextProps) => {
  // Custom comparison function
  // Re-render only if data or onPress changes
  return (
    prevProps.data?._id === nextProps.data?._id &&
    prevProps.data?.id === nextProps.data?.id &&
    prevProps.data?.title === nextProps.data?.title &&
    prevProps.data?.status === nextProps.data?.status &&
    prevProps.data?.cancelled === nextProps.data?.cancelled &&
    prevProps.data?.date === nextProps.data?.date &&
    prevProps.data?.time === nextProps.data?.time &&
    prevProps.onPress === nextProps.onPress
  );
});