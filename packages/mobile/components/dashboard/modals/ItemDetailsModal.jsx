import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageUtils';
import RoleBadge from '../../RoleBadge';
import {
  formatDate,
  getDaijaName,
  getStatusColor,
  getStatusText,
  getTypeText,
  COLORS
} from '../utils/dashboardHelpers';

/**
 * ItemDetailsModal Component
 * Displays detailed information for different item types
 * Supports: lecture, daija, organization, user, suggestion, cancelled_report
 */
const ItemDetailsModal = ({
  visible = false,
  item = null,
  daijeList = [],
  onClose,
  onEdit,
  onApprove,
  onReject,
  onCancel,
  onReactivate
}) => {
  if (!item) return null;

  const itemType = item.type || item.itemType;

  // Render lecture details
  const renderLectureDetails = () => {
    const daijaName = getDaijaName(item.daijaId, item.daija, daijeList);

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{item.title || 'Bez naslova'}</Text>

        {item.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={styles.detailsImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {daijaName || item.speaker || 'Nema predavača'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.organization || 'Nema organizacije'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {item.address || 'Nema adrese'}, {item.city || 'Nema mjesta'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {item.date ? formatDate(item.date) : 'Nema datuma'} u {item.time || 'Nema vremena'}
          </Text>
        </View>

        {item.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Opis:</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        )}

        {item.cancelled && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>Ovo predavanje je otkazano</Text>
          </View>
        )}
      </View>
    );
  };

  // Render daija details
  const renderDaijaDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>
        {`${item.title || ''} ${item.name || ''}`.trim() || 'Bez naziva'}
      </Text>

      {item.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.detailsImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.detailRow}>
        <Ionicons name="business-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.organization || 'Nema organizacije'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="school-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.education || 'Nema obrazovanja'}</Text>
      </View>

      {item.biography && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Biografija:</Text>
          <Text style={styles.descriptionText}>{item.biography}</Text>
        </View>
      )}
    </View>
  );

  // Render organization details
  const renderOrganizationDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>{item.name || 'Bez naziva'}</Text>

      {item.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.detailsImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.city || 'Nema mjesta'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="map-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.address || 'Nema adrese'}</Text>
      </View>

      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Opis:</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      )}
    </View>
  );

  // Render user details
  const renderUserDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.userHeader}>
        <Text style={styles.detailsTitle}>
          {item.firstName || item.username || item.email}
        </Text>
        <RoleBadge role={item.role || 'user'} />
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.email || 'Nema email-a'}</Text>
      </View>

      {item.username && (
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.username}</Text>
        </View>
      )}

      <View style={styles.detailRow}>
        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>Uloga: {item.role || 'user'}</Text>
      </View>
    </View>
  );

  // Render suggestion details
  const renderSuggestionDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>{item.title || item.name || 'Prijedlog'}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>{item.submitterName || 'Nepoznato'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>Tip: {getTypeText(item.type)}</Text>
      </View>

      {item.reason && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Razlog:</Text>
          <Text style={styles.descriptionText}>{item.reason}</Text>
        </View>
      )}
    </View>
  );

  // Render cancelled report details
  const renderCancelledReportDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Prijava za otkazivanje</Text>

      <View style={styles.detailRow}>
        <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>
          Predavanje: {item.lecture_id?.title || 'N/A'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>
          Korisnik: {item.user_id ? `${item.user_id.firstName || ''} ${item.user_id.lastName || ''}`.trim() || item.user_id.email : 'N/A'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>
          Platforma: {item.platform === 'web' ? 'Web' : 'Mobilna'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.detailText}>
          {formatDate(item.createdAt || item.timestamp)}
        </Text>
      </View>

      {item.reason && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Razlog:</Text>
          <Text style={styles.descriptionText}>{item.reason}</Text>
        </View>
      )}
    </View>
  );

  // Render details based on item type
  const renderDetails = () => {
    switch (itemType) {
      case 'lecture':
        return renderLectureDetails();
      case 'daija':
        return renderDaijaDetails();
      case 'organization':
        return renderOrganizationDetails();
      case 'user':
        return renderUserDetails();
      case 'suggestion':
        return renderSuggestionDetails();
      case 'cancelled_report':
        return renderCancelledReportDetails();
      default:
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {item.title || item.name || 'Detalji'}
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalji</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderDetails()}

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.info }]}
              onPress={() => onEdit(item, itemType)}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Uredi</Text>
            </TouchableOpacity>
          )}

          {item.status === 'pending' && onApprove && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => onApprove(item)}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Odobri</Text>
            </TouchableOpacity>
          )}

          {item.status === 'pending' && onReject && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              onPress={() => onReject(item)}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Odbij</Text>
            </TouchableOpacity>
          )}

          {itemType === 'lecture' && !item.cancelled && onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
              onPress={() => onCancel(item)}
            >
              <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Otkaži</Text>
            </TouchableOpacity>
          )}

          {itemType === 'lecture' && item.cancelled && onReactivate && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => onReactivate(item)}
            >
              <Ionicons name="refresh-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Reaktiviraj</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsImage: {
    width: '100%',
    height: 200,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray,
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.warning + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ItemDetailsModal;
