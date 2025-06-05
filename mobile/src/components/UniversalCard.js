import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../config/theme';
import { getImageDisplayUri } from '../utils/imageUpload';
import { SERVER_URL } from '../config/api';

const UniversalCard = ({
  // Data props
  item,
  
  // Display props
  title,
  subtitle,
  infoRows = [],
  
  // Right content props
  rightContentType = 'image', // 'image', 'icon' (removed 'avatar')
  imageUrl,
  iconName,
  iconSize = 40,
  iconColor,
  
  // Interaction props
  onPress,
  searchQuery = '',
  
  // Style props
  cardStyle = {},
  titleStyle = {},
  subtitleStyle = {},
  
  // Server URL for images (now using config, but keeping prop for backward compatibility)
  serverUrl = SERVER_URL,
  defaultImagePath = '/uploads/images/predavanjeslika.jpg'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Function to highlight search terms
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <Text key={index} style={styles.highlightedText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  // Render right content based on type
  const renderRightContent = () => {
    switch (rightContentType) {
      case 'icon':
        return (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={iconName || 'business-outline'} 
              size={iconSize} 
              color={iconColor || colors.primary.main} 
            />
          </View>
        );
      
      case 'image':
      default:
        return (
          <View style={styles.rightContent}>
            <Image
              source={{
                uri: imageError || !imageUrl 
                  ? `${serverUrl}${defaultImagePath}`
                  : getImageDisplayUri(imageUrl) || `${serverUrl}${defaultImagePath}`
              }}
              style={styles.cardImage}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.card, cardStyle]}>
        <View style={styles.cardContent}>
          {/* Left content - main information */}
          <View style={styles.leftContent}>
            {/* Title section */}
            <View style={styles.titleSection}>
              <Title style={[styles.title, titleStyle]}>
                {highlightSearchTerm(title, searchQuery)}
              </Title>
              {subtitle && (
                <Text style={[styles.subtitle, subtitleStyle]}>
                  {subtitle}
                </Text>
              )}
            </View>
            
            {/* Info rows */}
            {infoRows.length > 0 && (
              <View style={styles.infoSection}>
                {infoRows.map((row, index) => (
                  <View key={index} style={styles.infoRow}>
                    <Ionicons 
                      name={row.icon} 
                      size={16} 
                      color={colors.text.secondary} 
                    />
                    <Text 
                      style={[styles.infoText, row.textStyle]}
                      numberOfLines={row.numberOfLines || 1}
                    >
                      {row.highlightSearch 
                        ? highlightSearchTerm(row.text, searchQuery)
                        : row.text
                      }
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right content - image/icon */}
          {renderRightContent()}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  infoSection: {
    marginTop: 4,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  rightContent: {
    width: 110,
    height: 110,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: colors.primary.main,
    backgroundColor: 'rgba(2, 44, 67, 0.1)',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
});

export default UniversalCard; 