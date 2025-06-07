import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { getDefaultImageByType, getImageUrl } from '../utils/imageUtils';

interface InfoItem {
  icon: string;
  text: string;
  color?: string;
}

interface UniversalCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  infoItems: InfoItem[];
  onPress?: () => void;
  cardType?: 'lecture' | 'daija' | 'organization';
  badge?: {
    text: string;
    color: string;
  };
}

const UniversalCard: React.FC<UniversalCardProps> = ({
  title,
  subtitle,
  imageUrl,
  infoItems,
  onPress,
  cardType = 'lecture',
  badge,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDefaultImage = () => {
    return getDefaultImageByType(cardType);
  };

  const getImageStyle = () => {
    return cardType === 'daija' 
      ? [styles.image, styles.circularImage] 
      : styles.image;
  };

  const getImageSource = () => {
    console.log('=== UniversalCard Debug ===');
    console.log('imageUrl:', imageUrl);
    console.log('imageError:', imageError);
    console.log('cardType:', cardType);
    console.log('getDefaultImage():', getDefaultImage());
    
    // If there's an error loading the image or no imageUrl provided, use default
    if (imageError || !imageUrl || imageUrl === null || imageUrl === undefined) {
      const defaultImg = getDefaultImage();
      console.log('Using default image:', defaultImg);
      return { uri: defaultImg };
    }
    
    // Process the imageUrl through shared getImageUrl function for proper environment handling
    const processedImageUrl = getImageUrl(imageUrl);
    console.log('Processed image URL:', processedImageUrl);
    
    // If processed URL is null, use default image
    if (!processedImageUrl) {
      const defaultImg = getDefaultImage();
      console.log('Processed URL is null, using default image:', defaultImg);
      return { uri: defaultImg };
    }
    
    console.log('Using processed image:', processedImageUrl);
    return { uri: processedImageUrl };
  };

  const handleImageError = (error: any) => {
    console.log('Image loading error:', error);
    console.log('Failed to load image:', imageUrl);
    console.log('Switching to default image:', getDefaultImage());
    setImageError(true);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left side - Content */}
        <View style={styles.leftContent}>
          {/* Subtitle (for daija title like "prof.") */}
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.color }]}>
                <Text style={styles.badgeText}>
                  {badge.text}
                </Text>
              </View>
            )}
          </View>

          {/* Info section */}
          <View style={styles.infoSection}>
            {infoItems.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <Text 
                  style={[
                    styles.infoText, 
                    item.color && { color: item.color }
                  ]} 
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right side - Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={getImageStyle()}
            onError={handleImageError}
            resizeMode="cover"
            defaultSource={{ uri: getDefaultImage() }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 120,
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'lowercase',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
    width: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  circularImage: {
    borderRadius: 40, // Half of width/height for circular image
  },
});

export default UniversalCard; 