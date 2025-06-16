import React from 'react';
import { TouchableOpacity, Text, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddressLink = ({ address, city, style = {}, textStyle = {}, showIcon = true }) => {
  const fullAddress = `${address}, ${city}`;
  
  const handleAddressPress = () => {
    const encodedAddress = encodeURIComponent(fullAddress);
    
    let mapsUrl;
    
    if (Platform.OS === 'ios') {
      // Apple Maps for iOS
      mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}&dirflg=d`;
    } else {
      // Google Maps for Android
      mapsUrl = `google.navigation:q=${encodedAddress}`;
    }
    
    // Try to open native maps app
    Linking.canOpenURL(mapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(mapsUrl);
      } else {
        // Fallback to web maps
        const webMapsUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
        Linking.openURL(webMapsUrl).catch(() => {
          Alert.alert('Greška', 'Nije moguće otvoriti mapu.');
        });
      }
    }).catch(() => {
      Alert.alert('Greška', 'Nije moguće otvoriti mapu.');
    });
  };

  const showMapsOptions = () => {
    Alert.alert(
      'Otvori lokaciju',
      'Izaberi aplikaciju za mape',
      [
        {
          text: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
          onPress: handleAddressPress
        },
        {
          text: 'Web mape',
          onPress: () => {
            const webUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`;
            Linking.openURL(webUrl);
          }
        },
        {
          text: 'Otkaži',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={showMapsOptions}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        },
        style
      ]}
    >
      {showIcon && (
        <Ionicons name="location-outline" size={16} color="#3B82F6" />
      )}
      <Text style={[{ color: '#3B82F6', fontSize: 14 }, textStyle]}>
        {fullAddress}
      </Text>
      <Ionicons name="navigate-outline" size={12} color="#3B82F6" style={{ opacity: 0.7 }} />
    </TouchableOpacity>
  );
};

export default AddressLink;