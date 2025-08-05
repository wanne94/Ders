import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import UniverzalCard from './UniverzalCard';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  textLight: '#999999',
  border: '#e0e0e0'
};

const SearchResults = ({ results, onItemPress, isLoading, onAdd }) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Pretraživanje...</Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Unesite pojam za pretragu</Text>
      </View>
    );
  }

  if (results.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{results.error}</Text>
      </View>
    );
  }

  const hasResults = (results.lectures?.length > 0) || 
                    (results.daije?.length > 0) || 
                    (results.organizations?.length > 0);

  if (!hasResults) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Nema rezultata pretrage</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Lectures Section */}
      {results.lectures?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREDAVANJA ({results.lectures.length})</Text>
          {results.lectures.map((lecture) => (
            <View key={lecture._id || lecture.id} style={styles.cardWrapper}>
              <UniverzalCard
                data={{ ...lecture, type: 'predavanje' }}
                onPress={() => onItemPress('lecture', lecture)}
                onAdd={onAdd}
              />
            </View>
          ))}
        </View>
      )}

      {/* Daije Section */}
      {results.daije?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAIJE ({results.daije.length})</Text>
          {results.daije.map((daija) => (
            <View key={daija._id || daija.id} style={styles.cardWrapper}>
              <UniverzalCard
                data={{ ...daija, type: 'daija' }}
                onPress={() => onItemPress('daija', daija)}
                onAdd={onAdd}
              />
            </View>
          ))}
        </View>
      )}

      {/* Organizations Section */}
      {results.organizations?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UDRUŽENJA ({results.organizations.length})</Text>
          {results.organizations.map((org) => (
            <View key={org._id || org.id} style={styles.cardWrapper}>
              <UniverzalCard
                data={{ ...org, type: 'udruženje' }}
                onPress={() => onItemPress('organization', org)}
                onAdd={onAdd}
              />
            </View>
          ))}
        </View>
      )}

      {/* Total Results */}
      <View style={styles.totalResults}>
        <Text style={styles.totalResultsText}>
          Ukupno pronađeno: {results.totalResults || 0} rezultata
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  cardWrapper: {
    marginBottom: 10,
  },
  totalResults: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalResultsText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default SearchResults;