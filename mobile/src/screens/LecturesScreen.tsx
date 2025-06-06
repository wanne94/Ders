import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { lecturesAPI } from '../services/api';
import { Lecture } from '../types';
import LectureCard from '../components/LectureCard';

const LecturesScreen: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLectures = async () => {
    try {
      const response = await lecturesAPI.getAll();
      setLectures(response.data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      Alert.alert(
        'Greška',
        'Nije moguće dohvatiti predavanja. Molimo pokušajte ponovo.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLectures();
  };

  const handleLecturePress = (lecture: Lecture) => {
    // TODO: Navigate to lecture detail screen
    Alert.alert('Predavanje', `Odabrano: ${lecture.title}`);
  };

  const renderLecture = ({ item }: { item: Lecture }) => (
    <LectureCard
      lecture={item}
      onPress={() => handleLecturePress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nema dostupnih predavanja</Text>
      <Text style={styles.emptySubtext}>
        Povucite prema dolje za osvježavanje
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Učitavanje predavanja...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Predavanja</Text>
        <Text style={styles.headerSubtitle}>
          {lectures.length} {lectures.length === 1 ? 'predavanje' : 'predavanja'}
        </Text>
      </View>
      
      <FlatList
        data={lectures}
        renderItem={renderLecture}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          lectures.length === 0 ? styles.emptyList : styles.list
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LecturesScreen; 