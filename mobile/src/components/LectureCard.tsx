import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Lecture } from '../types';

interface LectureCardProps {
  lecture: Lecture;
  onPress: () => void;
}

const LectureCard: React.FC<LectureCardProps> = ({ lecture, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Odobreno';
      case 'pending':
        return 'Na čekanju';
      case 'rejected':
        return 'Odbačeno';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {lecture.image && (
        <Image source={{ uri: lecture.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {lecture.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(lecture.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(lecture.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>
          {lecture.description}
        </Text>
        
        <View style={styles.details}>
          <Text style={styles.detailText}>
            📅 {formatDate(lecture.date)} u {lecture.time}
          </Text>
          <Text style={styles.detailText}>
            📍 {lecture.location}
          </Text>
          <Text style={styles.detailText}>
            👨‍🏫 {lecture.lecturer}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
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
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default LectureCard; 