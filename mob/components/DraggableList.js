import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  OpacityDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../utils/imageUtils';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e2e8f0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
};

const DraggableList = ({ 
  data, 
  onReorder, 
  onItemPress, 
  onEdit, 
  onDelete,
  itemType = 'lecture',
  refreshing = false,
  onRefresh
}) => {
  const [items, setItems] = useState(data);

  // Handle drag end
  const handleDragEnd = useCallback(({ data: reorderedData }) => {
    setItems(reorderedData);
    if (onReorder) {
      onReorder(reorderedData);
    }
  }, [onReorder]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Render item
  const renderItem = useCallback(({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <OpacityDecorator activeOpacity={0.5}>
          <ShadowDecorator>
            <TouchableOpacity
              style={[
                styles.itemContainer,
                isActive && styles.itemActive
              ]}
              onPress={() => onItemPress && onItemPress(item)}
              onLongPress={drag}
              disabled={isActive}
            >
              <View style={styles.dragHandle}>
                <Ionicons name="reorder-three" size={24} color={COLORS.gray} />
              </View>

              <View style={styles.itemContent}>
                {item.image && (
                  <Image 
                    source={{ uri: getImageUrl(item.image) }} 
                    style={styles.itemImage}
                  />
                )}
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title || item.name || 'Bez naziva'}
                  </Text>
                  
                  {itemType === 'lecture' && (
                    <>
                      <Text style={styles.itemSubtitle}>
                        {item.speaker || 'Nema predavača'}
                      </Text>
                      <Text style={styles.itemInfo}>
                        {formatDate(item.date)} • {item.time || 'Nema vremena'}
                      </Text>
                      <Text style={styles.itemInfo}>
                        {item.city || 'Nema mjesta'}
                      </Text>
                    </>
                  )}
                  
                  {itemType === 'daija' && (
                    <>
                      <Text style={styles.itemSubtitle}>
                        {item.organization || 'Nema organizacije'}
                      </Text>
                      <Text style={styles.itemInfo}>
                        {item.education || 'Nema obrazovanja'}
                      </Text>
                    </>
                  )}
                  
                  {itemType === 'organization' && (
                    <>
                      <Text style={styles.itemSubtitle}>
                        {item.city || 'Nema grada'}
                      </Text>
                      <Text style={styles.itemInfo}>
                        {item.address || 'Nema adrese'}
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.itemActions}>
                  {onEdit && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => onEdit(item)}
                    >
                      <Ionicons name="create-outline" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => onDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </ShadowDecorator>
        </OpacityDecorator>
      </ScaleDecorator>
    );
  }, [onItemPress, onEdit, onDelete, itemType]);

  return (
    <DraggableFlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      onDragEnd={handleDragEnd}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: 'hidden',
  },
  itemActive: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  itemInfo: {
    fontSize: 12,
    color: COLORS.gray,
  },
  itemActions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primaryLight,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
});

export default DraggableList;