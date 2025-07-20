import React from 'react';
import { TouchableOpacity, Text, Share, Linking, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ShareButton = ({ profileData, type, style = {}, textStyle = {} }) => {
  if (!profileData) return null;
  
  const id = profileData._id || profileData.id;
  const shareUrl = `https://ders.ba/profile/${type}/${id}`;
  
  let shareText = '';
  
  if (type === 'lecture') {
    shareText = `${profileData.title}\nDatum: ${new Date(profileData.date).toLocaleDateString('sr-RS')} u ${profileData.time}\nAdresa: ${profileData.address}, ${profileData.city}`;
  } else if (type === 'daija') {
    shareText = `${profileData.name}${profileData.title ? ' - ' + profileData.title : ''}\n${profileData.biography || ''}`;
  } else if (type === 'organization') {
    shareText = `${profileData.name}\n${profileData.description || ''}\nAdresa: ${profileData.address}, ${profileData.city}`;
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
    
    let url;
    
    switch (platform) {
      case 'whatsapp':
        url = `whatsapp://send?text=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'viber':
        url = `viber://forward?text=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'telegram':
        url = `tg://msg?text=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'facebook':
        url = `fb://facewebmodal/f?href=${encodedUrl}`;
        break;
      default:
        handleShare();
        return;
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        handleShare(); // Fallback to native share
      }
    }).catch(() => {
      handleShare(); // Fallback to native share
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 25,
          gap: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
          borderWidth: 0.5,
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        style
      ]}
      activeOpacity={0.75}
    >
      <Ionicons name="share-outline" size={18} color="#374151" />
      <Text style={[{ 
        color: '#374151', 
        fontSize: 15, 
        fontWeight: '600',
        letterSpacing: 0.2
      }, textStyle]}>
        Podijeli
      </Text>
    </TouchableOpacity>
  );
};

export default ShareButton;