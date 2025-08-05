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

const SearchScreen = ({ onBack, onNavigate, onAddContent, onProfileOpen }) => {
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
    // Use the same profile navigation as other screens
    if (onProfileOpen) {
      onProfileOpen(item, type);
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
          onAdd={onAddContent}
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