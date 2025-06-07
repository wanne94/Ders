import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import apiService from '../services/apiService';
import UniversalCard from '../components/UniversalCard';
import { formatLectureCard, formatDaijaCard, formatOrganizationCard } from '../helpers/cardHelpers';

const { width } = Dimensions.get('window');

interface Lecture {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: string;
  daija?: any;
  organization?: any;
}

interface Organization {
  _id: string;
  name: string;
  description: string;
}

interface Daija {
  _id: string;
  name: string;
  bio: string;
  status: string;
}

const HomeScreen: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [daije, setDaije] = useState<Daija[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const { lectures, organizations, daije } = await apiService.getAllData();

      setLectures(lectures || []);
      setOrganizations(organizations || []);
      setDaije(daije || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show alert for network errors, just use empty data
      setLectures([]);
      setOrganizations([]);
      setDaije([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const HeroSection = () => (
    <View style={styles.heroSection}>
      <Text style={styles.heroTitle}>DERS</Text>
      <View style={styles.heroDivider} />
      <Text style={styles.heroSubtitle}>
        Digitalna platforma za promociju islamskih predavanja
      </Text>
    </View>
  );

  const StatisticsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Statistika</Text>
      <View style={styles.statisticsContainer}>
        <View style={styles.statisticCard}>
          <Text style={styles.statisticNumber}>
            {lectures.filter(lecture => lecture.status === 'approved').length}
          </Text>
          <Text style={styles.statisticLabel}>Broj predavanja</Text>
        </View>
        <View style={styles.statisticCard}>
          <Text style={[styles.statisticNumber, { color: '#4caf50' }]}>
            {organizations.length}
          </Text>
          <Text style={styles.statisticLabel}>Broj udruženja</Text>
        </View>
        <View style={styles.statisticCard}>
          <Text style={[styles.statisticNumber, { color: '#ff9800' }]}>
            {daije.filter(daija => daija.status === 'approved').length}
          </Text>
          <Text style={styles.statisticLabel}>Broj daija</Text>
        </View>
      </View>
    </View>
  );

  const QuickActionsSection = () => {
    const quickActions = [
      {
        title: 'Dersovi',
        description: 'Pregledajte sva dostupna predavanja',
        color: '#4caf50',
        onPress: () => Alert.alert('Info', 'Navigacija ka predavanjima'),
      },
      {
        title: 'Udruženja',
        description: 'Istražite udruženja i njihove aktivnosti',
        color: '#2196f3',
        onPress: () => Alert.alert('Info', 'Navigacija ka udruženjima'),
      },
      {
        title: 'Daije',
        description: 'Upoznajte naše predavače',
        color: '#ff9800',
        onPress: () => Alert.alert('Info', 'Navigacija ka daijama'),
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigacija</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
              <View style={[styles.quickActionButton, { backgroundColor: action.color }]}>
                <Text style={styles.quickActionButtonText}>Otvori</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const RecentLecturesSection = () => {
    const recentLectures = lectures
      .filter(lecture => lecture.status === 'approved')
      .slice(0, 5);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Najnovija predavanja</Text>
        {recentLectures.length === 0 ? (
          <Text style={styles.emptyText}>Trenutno nema dostupnih predavanja.</Text>
        ) : (
          <View style={styles.lecturesContainer}>
            {recentLectures.map((lecture) => {
              const cardData = formatLectureCard(lecture);
              return (
                <UniversalCard
                  key={lecture._id}
                  title={cardData.title}
                  imageUrl={cardData.imageUrl}
                  infoItems={cardData.infoItems}
                  cardType="lecture"
                  onPress={() => Alert.alert('Info', `Otvaranje predavanja: ${lecture.title}`)}
                />
              );
            })}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>Prikaži sva predavanja</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const BenefitsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Zašto koristiti DERS?</Text>
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>📚 Centralizirane informacije</Text>
          <Text style={styles.benefitDescription}>
            Sve informacije o predavanjima na jednom mjestu
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>🔔 Obavještenja</Text>
          <Text style={styles.benefitDescription}>
            Budite obaviješteni o novim predavanjima
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitTitle}>👥 Zajednica</Text>
          <Text style={styles.benefitDescription}>
            Povežite se sa zajednicom vjernika
          </Text>
        </View>
      </View>
    </View>
  );

  const ActiveDaijeSection = () => {
    const activeDaije = daije
      .filter(daija => daija.status === 'approved')
      .slice(0, 3);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivne daije</Text>
        {activeDaije.length === 0 ? (
          <Text style={styles.emptyText}>Trenutno nema dostupnih daija.</Text>
        ) : (
          <View style={styles.lecturesContainer}>
            {activeDaije.map((daija) => {
              const cardData = formatDaijaCard(daija, undefined);
              return (
                <UniversalCard
                  key={daija._id}
                  title={cardData.title}
                  subtitle={cardData.subtitle}
                  imageUrl={cardData.imageUrl}
                  infoItems={cardData.infoItems}
                  cardType="daija"
                  onPress={() => Alert.alert('Info', `Otvaranje profila: ${daija.name}`)}
                />
              );
            })}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>Prikaži sve daije</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const ActiveOrganizationsSection = () => {
    const activeOrganizations = organizations.slice(0, 3);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivna udruženja</Text>
        {activeOrganizations.length === 0 ? (
          <Text style={styles.emptyText}>Trenutno nema dostupnih udruženja.</Text>
        ) : (
          <View style={styles.lecturesContainer}>
            {activeOrganizations.map((organization) => {
              const cardData = formatOrganizationCard(organization, undefined);
              return (
                <UniversalCard
                  key={organization._id}
                  title={cardData.title}
                  imageUrl={cardData.imageUrl}
                  infoItems={cardData.infoItems}
                  cardType="organization"
                  onPress={() => Alert.alert('Info', `Otvaranje profila: ${organization.name}`)}
                />
              );
            })}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>Prikaži sva udruženja</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const SocialMediaSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pratite nas</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877f2' }]}>
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#e4405f' }]}>
          <Text style={styles.socialButtonText}>Instagram</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HeroSection />
        <View style={styles.content}>
          <RecentLecturesSection />
          <BenefitsSection />
          <ActiveDaijeSection />
          <ActiveOrganizationsSection />
          <StatisticsSection />
          <QuickActionsSection />
          <SocialMediaSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  heroSection: {
    backgroundColor: '#022C43',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#ffffff',
    opacity: 0.5,
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statisticCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statisticNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  statisticLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    gap: 15,
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  quickActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  quickActionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  lecturesContainer: {
    gap: 15,
  },
  viewAllButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  benefitsContainer: {
    gap: 15,
  },
  benefitItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  socialButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default HomeScreen; 