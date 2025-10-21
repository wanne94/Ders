import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../utils/imageUtils';
import RoleBadge from '../RoleBadge';
import {
  formatDate,
  getDaijaName,
  getStatusColor,
  getStatusText,
  getTypeText,
  COLORS
} from './utils/dashboardHelpers';

/**
 * DataItem Component
 * Reusable item component for dashboard lists
 * Handles different item types: lecture, daija, organization, user, suggestion, cancelled_report
 */
const DataItem = ({
  item,
  itemType: propItemType,
  activeSection,
  bulkMode = false,
  isSelected = false,
  userRole = 'admin',
  daijeList = [],
  isMixed = false,
  onPress,
  onLongPress,
  onApprove,
  onReject,
  onArchive,
  onCancel,
  onReactivate,
  onEdit,
  onDelete
}) => {
  // Determine item type
  let itemType = propItemType || (isMixed ? item.type : null);

  // Map plural types to singular
  if (itemType === 'lectures') itemType = 'lecture';
  if (itemType === 'organizations') itemType = 'organization';
  if (itemType === 'daije') itemType = 'daija';

  const canEdit = userRole === 'admin' || userRole === 'super_admin';
  const canDelete = userRole === 'super_admin';
  const canApprove = userRole === 'admin' || userRole === 'super_admin';

  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress(item, itemType);
    }
  };

  // Handle long press
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(item);
    }
  };

  // Determine if item should show image
  const shouldShowImage = (
    ((itemType === 'lecture' || activeSection === 'predavanja') ||
     (itemType === 'daija' || activeSection === 'daije') ||
     (itemType === 'organization' || activeSection === 'organizations')) &&
    item.image
  );

  // Render title based on item type
  const renderTitle = () => {
    if (itemType === 'user') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.dataItemTitle, { flex: 1 }]} numberOfLines={2}>
            {item.firstName || item.username || item.email}
          </Text>
          <RoleBadge role={item.role || 'user'} size="small" />
        </View>
      );
    }

    return (
      <Text style={styles.dataItemTitle} numberOfLines={2}>
        {itemType === 'daija'
          ? `${item.title || ''} ${item.name || ''}`.trim() || 'Bez naziva'
          : item.title || item.name || item.username}
      </Text>
    );
  };

  // Render info based on item type
  const renderInfo = () => {
    if (itemType === 'lecture' || activeSection === 'predavanja') {
      const daijaName = getDaijaName(item.daijaId, item.daija, daijeList);
      return (
        <>
          <Text style={styles.dataItemSubtitle}>
            {daijaName || item.speaker || 'Nema predavača'}
          </Text>
          <Text style={styles.dataItemDetail}>
            {item.organization || 'Nema organizacije'} • {item.city || 'Nema mjesta'}
          </Text>
          <Text style={styles.dataItemDetail}>
            {item.date ? formatDate(item.date) : 'Nema datuma'} • {item.time || 'Nema vremena'}
          </Text>
        </>
      );
    }

    if (itemType === 'daija') {
      return (
        <>
          <Text style={styles.dataItemSubtitle}>{item.organization || 'Nema organizacije'}</Text>
          <Text style={styles.dataItemDetail}>{item.education || 'Nema obrazovanja'}</Text>
        </>
      );
    }

    if (itemType === 'organization') {
      return (
        <>
          <Text style={styles.dataItemSubtitle}>{item.city}</Text>
          <Text style={styles.dataItemDetail}>{item.address}</Text>
        </>
      );
    }

    if (itemType === 'user') {
      return <Text style={styles.dataItemSubtitle}>{item.email}</Text>;
    }

    if (itemType === 'suggestion') {
      return (
        <>
          <Text style={styles.dataItemSubtitle}>{item.submitterName}</Text>
          <Text style={styles.dataItemDetail}>{item.reason}</Text>
        </>
      );
    }

    if (itemType === 'cancelled_report') {
      return (
        <>
          <Text style={styles.dataItemSubtitle}>
            {item.lecture_id?.title || 'N/A'}
          </Text>
          <Text style={styles.dataItemDetail}>
            Korisnik: {item.user_id ? `${item.user_id.firstName || ''} ${item.user_id.lastName || ''}`.trim() || item.user_id.email : 'N/A'}
          </Text>
          <Text style={styles.dataItemDetail}>
            Platforma: {item.platform === 'web' ? 'Web' : 'Mobilna'} • {formatDate(item.createdAt || item.timestamp)}
          </Text>
          {item.reason && (
            <Text style={styles.dataItemDetail} numberOfLines={2}>
              Razlog: {item.reason}
            </Text>
          )}
        </>
      );
    }

    return null;
  };

  // Render action buttons
  const renderActions = () => {
    return (
      <View style={styles.dataItemActions}>
        {/* Approve/Reject buttons for pending items */}
        {((activeSection === 'za-odobrenje' || item.status === 'pending') ||
          (activeSection === 'otkazivanja' && item.status === 'pending')) && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove && onApprove(item)}
            >
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject && onReject(item)}
            >
              <Ionicons name="close" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </>
        )}

        {/* Archive button for suggestions */}
        {activeSection === 'prijedlozi' && !item.archived && (
          <TouchableOpacity
            style={[styles.actionButton, styles.archiveButton]}
            onPress={() => onArchive && onArchive(item)}
          >
            <Ionicons name="archive-outline" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* Edit/Delete buttons for main sections */}
        {(activeSection === 'predavanja' || activeSection === 'daije' || activeSection === 'organizations') && (
          <>
            {/* Cancel button for lectures only */}
            {(itemType === 'lecture' || activeSection === 'predavanja') && !item.cancelled && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onCancel && onCancel(item)}
              >
                <Ionicons name="close-circle-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {/* Reactivate button for cancelled lectures only */}
            {(itemType === 'lecture' || activeSection === 'predavanja') && item.cancelled && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reactivateButton]}
                onPress={() => onReactivate && onReactivate(item)}
              >
                <Ionicons name="refresh-circle-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit && onEdit(item, itemType)}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete && onDelete(item, itemType)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.dataItem,
        bulkMode && isSelected && styles.dataItemSelected
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View style={styles.dataItemHeader}>
        {/* Bulk mode checkbox */}
        {bulkMode && (
          <View style={styles.bulkCheckbox}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={isSelected ? COLORS.primary : COLORS.gray}
            />
          </View>
        )}

        <View style={styles.dataItemTitleContainer}>
          {/* Item image */}
          {shouldShowImage && (
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={styles.dataItemImage}
              onError={(e) => {
                console.log('Image load error:', e.nativeEvent.error);
              }}
            />
          )}

          <View style={styles.dataItemTextContainer}>
            {renderTitle()}
          </View>
        </View>

        {renderActions()}
      </View>

      <View style={styles.dataItemInfo}>
        {renderInfo()}
      </View>

      <View style={styles.dataItemFooter}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>

        {isMixed && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{getTypeText(item.type)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  dataItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulkCheckbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  dataItemTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dataItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.lightGray,
  },
  dataItemTextContainer: {
    flex: 1,
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  dataItemActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  archiveButton: {
    backgroundColor: COLORS.info,
  },
  cancelButton: {
    backgroundColor: COLORS.warning,
  },
  reactivateButton: {
    backgroundColor: COLORS.success,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  dataItemInfo: {
    marginBottom: 12,
  },
  dataItemSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    marginBottom: 4,
  },
  dataItemDetail: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  dataItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.info + '20',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.info,
  },
});

export default DataItem;
