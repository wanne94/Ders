import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CancellationReportForm from './CancellationReportForm';
import apiClient from '../services/apiClient';

const COLORS = {
  primary: '#022C43',
  warning: '#ff9800',
  warningDark: '#f57c00',
  white: '#ffffff',
  gray: '#666666',
  disabled: '#cccccc',
};

const CancellationReportButton = ({
  lectureId,
  lectureTitle = '',
  isAlreadyCancelled = false,
  onReportSuccess,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  style = {}
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReportClick = () => {
    if (isAlreadyCancelled) {
      Alert.alert('Informacija', 'Ovo predavanje je već otkazano.');
      return;
    }

    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!lectureId) {
      Alert.alert('Greška', 'ID predavanja nije valjan.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(`/lectures/${lectureId}/report-cancellation`, {
        reason: formData.reason,
        howFound: formData.howFound,
        additionalInfo: formData.additionalInfo
      });

      Alert.alert(
        'Uspjeh',
        response.data.message || 'Prijava je uspješno poslana.',
        [{ text: 'OK' }]
      );

      if (onReportSuccess) {
        onReportSuccess(response.data);
      }

      setFormOpen(false);
    } catch (error) {
      let errorMessage = 'Greška pri slanju prijave otkazivanja.';

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Vaša sesija je istekla. Molimo prijavite se ponovo.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Zahtev je prekoračio vrijeme - server je možda spor.';
      } else if (!error.response) {
        errorMessage = 'Nema konekcije sa serverom. Proverite internet konekciju.';
      }

      Alert.alert('Greška', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyCancelled) {
    return null;
  }

  const buttonStyle = [
    styles.button,
    variant === 'contained' ? styles.containedButton : styles.outlinedButton,
    size === 'small' ? styles.smallButton : styles.mediumButton,
    fullWidth && styles.fullWidthButton,
    loading && styles.disabledButton,
    style
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'contained' ? styles.containedText : styles.outlinedText,
    size === 'small' && styles.smallText
  ];

  return (
    <>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handleReportClick}
        disabled={loading}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Ionicons 
            name="warning" 
            size={size === 'small' ? 16 : 20} 
            color={variant === 'contained' ? COLORS.white : COLORS.warning} 
            style={styles.icon}
          />
          <Text style={textStyle}>
            {loading ? 'Slanje...' : 'Prijavi otkazivanje'}
          </Text>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={variant === 'contained' ? COLORS.white : COLORS.warning}
              style={styles.loader}
            />
          )}
        </View>
      </TouchableOpacity>

      <CancellationReportForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        lectureId={lectureId}
        lectureTitle={lectureTitle}
        onSubmit={handleFormSubmit}
        loading={loading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containedButton: {
    backgroundColor: COLORS.warning,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fullWidthButton: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  containedText: {
    color: COLORS.white,
  },
  outlinedText: {
    color: COLORS.warning,
  },
  smallText: {
    fontSize: 14,
  },
  loader: {
    marginLeft: 8,
  },
});

export default CancellationReportButton;