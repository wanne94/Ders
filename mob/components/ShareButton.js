import React from 'react';
import { TouchableOpacity, Text, Share, Linking, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../utils/imageUtils';
import { formatDateWithDay } from '../utils/dateUtils';

const ShareButton = ({ profileData, type, style = {}, textStyle = {} }) => {
  if (!profileData) return null;
  
  const id = profileData._id || profileData.id;
  const shareUrl = `https://ders.ba/profile/${type}/${id}`;
  
  let shareText = '';
  let imageUrl = '';
  
  if (type === 'lecture') {
    shareText = `🎓 ${profileData.title}

📅 ${formatDateWithDay(profileData.date)} u ${profileData.time}
📍 ${profileData.address}, ${profileData.city}${profileData.organization ? `
🏛️ ${profileData.organization}` : ''}${profileData.speaker ? `
👤 ${profileData.speaker}` : ''}`;
    imageUrl = profileData.image ? getImageUrl(profileData.image) : 'https://ders.ba/uploads/images/default.jpg';
  } else if (type === 'daija') {
    shareText = `👤 ${profileData.name}${profileData.title ? ' - ' + profileData.title : ''}

${profileData.biography || ''}`;
    imageUrl = profileData.image ? getImageUrl(profileData.image) : 'https://ders.ba/uploads/images/default.jpg';
  } else if (type === 'organization') {
    shareText = `🏛️ ${profileData.name}

${profileData.description || ''}
📍 ${profileData.address}, ${profileData.city}`;
    imageUrl = profileData.image ? getImageUrl(profileData.image) : 'https://ders.ba/uploads/images/default.jpg';
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${shareText}\n\n${shareUrl}`,
        url: shareUrl,
        title: type === 'lecture' ? profileData.title : profileData.name
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom deljenja.');
    }
  };

  const handleSpecificShare = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const fullMessage = encodeURIComponent(`${shareText}

${shareUrl}`);
    
    let url;
    let webFallbackUrl;
    
    switch (platform) {
      case 'whatsapp':
        // Use web.whatsapp.com for better compatibility
        url = `whatsapp://send?text=${fullMessage}`;
        webFallbackUrl = `https://api.whatsapp.com/send?text=${fullMessage}`;
        break;
      case 'viber':
        // Viber doesn't support images via URL scheme
        url = `viber://forward?text=${fullMessage}`;
        webFallbackUrl = null;
        break;
      case 'telegram':
        // Use Telegram web share for better compatibility
        url = `tg://msg?text=${fullMessage}`;
        webFallbackUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        // Use Facebook share dialog which supports Open Graph tags
        url = `fb://facewebmodal/f?href=${encodedUrl}`;
        webFallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      default:
        handleShare();
        return;
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else if (webFallbackUrl) {
        // Try web fallback
        Linking.openURL(webFallbackUrl).catch(() => {
          handleShare(); // Final fallback to native share
        });
      } else {
        handleShare(); // Fallback to native share
      }
    }).catch(() => {
      if (webFallbackUrl) {
        Linking.openURL(webFallbackUrl).catch(() => {
          handleShare(); // Final fallback
        });
      } else {
        handleShare(); // Fallback to native share
      }
    });
  };

  const showShareOptions = () => {
    const options = ['WhatsApp', 'Facebook', 'Viber', 'Telegram', 'Više opcija', 'Zatvori'];
    const actions = [
      () => handleSpecificShare('whatsapp'),
      () => handleSpecificShare('facebook'),
      () => handleSpecificShare('viber'),
      () => handleSpecificShare('telegram'),
      handleShare,
      () => {} // Cancel action
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 5,
          title: 'Podijeli ders',
          message: 'Izaberi opciju za dijeljenje'
        },
        (buttonIndex) => {
          if (buttonIndex !== 5) { // Not cancel
            actions[buttonIndex]();
          }
        }
      );
    } else {
      // For Android, use Alert but make it more touch-friendly
      Alert.alert(
        'Podijeli ders',
        'Izaberi opciju za dijeljenje',
        [
          {
            text: 'WhatsApp',
            onPress: () => handleSpecificShare('whatsapp')
          },
          {
            text: 'Facebook',
            onPress: () => handleSpecificShare('facebook')
          },
          {
            text: 'Viber',
            onPress: () => handleSpecificShare('viber')
          },
          {
            text: 'Telegram',
            onPress: () => handleSpecificShare('telegram')
          },
          {
            text: 'Više opcija',
            onPress: handleShare
          },
          {
            text: 'Zatvori',
            style: 'cancel'
          }
        ],
        { 
          cancelable: true,
          onDismiss: () => {
            // Handle dismissal when user taps outside
            console.log('Share dialog dismissed');
          }
        }
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={showShareOptions}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 15,
          gap: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style
      ]}
      activeOpacity={0.75}
    >
      <Ionicons name="share-outline" size={20} color="white" />
      <Text style={[{ 
        color: 'white', 
        fontSize: 16, 
        fontWeight: '500',
        letterSpacing: 0.2
      }, textStyle]}>
        Podijeli
      </Text>
    </TouchableOpacity>
  );
};

export default ShareButton;