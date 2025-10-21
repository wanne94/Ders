import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './utils/dashboardHelpers';

/**
 * BulkActionsBar Component
 * Shows bulk selection controls and action buttons when bulk mode is active
 */
const BulkActionsBar = ({
  visible = false,
  selectedCount = 0,
  userRole = 'admin',
  onSelectAll,
  onDeselectAll,
  onApprove,
  onReject,
  onDelete
}) => {
  if (!visible || selectedCount === 0) return null;

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <View style={styles.bulkActionsBar}>
      <View style={styles.bulkActionsLeft}>
        <Text style={styles.bulkSelectionText}>
          {selectedCount} odabrano
        </Text>
        <TouchableOpacity onPress={onSelectAll}>
          <Text style={styles.bulkActionLink}>Odaberi sve</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDeselectAll}>
          <Text style={styles.bulkActionLink}>Poništi odabir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bulkActionsRight}>
        {onApprove && (
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkApproveButton]}
            onPress={onApprove}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.bulkActionButtonText}>Odobri</Text>
          </TouchableOpacity>
        )}

        {onReject && (
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkRejectButton]}
            onPress={onReject}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.white} />
            <Text style={styles.bulkActionButtonText}>Odbaci</Text>
          </TouchableOpacity>
        )}

        {isSuperAdmin && onDelete && (
          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkDeleteButton]}
            onPress={onDelete}
          >
            <Ionicons name="trash" size={20} color={COLORS.white} />
            <Text style={styles.bulkActionButtonText}>Obriši</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bulkActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bulkSelectionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActionLink: {
    color: COLORS.white,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  bulkActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkApproveButton: {
    backgroundColor: COLORS.success,
  },
  bulkRejectButton: {
    backgroundColor: COLORS.error,
  },
  bulkDeleteButton: {
    backgroundColor: COLORS.error + 'CC',
  },
  bulkActionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BulkActionsBar;
