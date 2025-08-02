import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const COLORS = {
  primary: '#022C43',
  lightGray: '#f5f5f5',
};

const SearchScreen = ({ onBack, onNavigate }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (results) => {
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleItemPress = (type, item) => {
    // Navigate to appropriate detail screen based on type
    switch (type) {
      case 'lecture':
        onNavigate && onNavigate('lecture-detail', { lecture: item });
        break;
      case 'daija':
        onNavigate && onNavigate('daija-detail', { daija: item });
        break;
      case 'organization':
        onNavigate && onNavigate('organization-detail', { organization: item });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SearchBar
          onSearch={handleSearch}
          onClose={onBack}
          placeholder="Pretraži predavanja, daije, udruženja..."
        />
        
        <SearchResults
          results={searchResults}
          onItemPress={handleItemPress}
          isLoading={isSearching}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  keyboardAvoid: {
    flex: 1,
  },
});

export default SearchScreen;