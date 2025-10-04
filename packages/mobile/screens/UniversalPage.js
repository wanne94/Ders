import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniverzalCard from '../components/UniverzalCard';
import Menu from '../components/Menu';
import { formatDateWithDay } from '../utils/dateUtils';
import { sortLecturesByStatus } from '../utils/sortingUtils';
import { SkeletonCardList } from '../components/SkeletonCard';
import { useAppData } from '../context/AppDataContext';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5'
};

const ITEMS_PER_PAGE = 8;

const UniversalPage = ({
  type = 'lectures',
  onBack,
  onProfileOpen,
  onNavigate,
  user,
  isAuthenticated,
  scrollRef
}) => {
  const { lectures, daije, organizations, loading, refresh } = useAppData();
  const [data, setData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lectureDataset = useMemo(() => {
    if (!Array.isArray(lectures)) {
      return [];
    }

    const normalized = lectures.map(lecture => ({
      ...lecture,
      type: lecture.type || 'predavanje'
    }));

    return sortLecturesByStatus(normalized);
  }, [lectures]);

  const daijeDataset = useMemo(() => (
    Array.isArray(daije) ? daije : []
  ), [daije]);

  const organizationDataset = useMemo(() => {
    if (!Array.isArray(organizations)) {
      return [];
    }

    return organizations.filter(org => {
      if (org.status !== 'approved') {
        return false;
      }

      if (typeof org.lectureCount === 'number') {
        return org.lectureCount > 0;
      }

      return lectureDataset.some(lecture => {
        if (!lecture || lecture.status !== 'approved' || !lecture.organization) {
          return false;
        }

        if (typeof lecture.organization === 'string') {
          return lecture.organization === org.name;
        }

        return lecture.organization._id === org._id || lecture.organization.name === org.name;
      });
    });
  }, [organizations, lectureDataset]);

  const pageConfig = useMemo(() => {
    switch (type) {
      case 'lectures':
        return {
          title: 'Dersovi',
          subtitle: 'Svi dostupni dersovi',
          dataset: lectureDataset,
          itemType: 'predavanje',
          cardConfig: {
            titleKey: 'title',
            subtitleKey: 'speaker',
            descriptionKeys: ['organization', 'date', 'time', 'address'],
            formatDescription: (item) => {
              if (!item) return '';
              const date = formatDateWithDay(item.date);
              return `${item.organization || ''}\n${date} ${item.time || ''}\n${item.address || ''}, ${item.city || ''}`.trim();
            }
          }
        };
      case 'speakers':
        return {
          title: 'Daije',
          subtitle: 'Naši daije',
          dataset: daijeDataset,
          itemType: 'daija',
          cardConfig: {
            titleKey: 'name',
            subtitleKey: 'title',
            descriptionKeys: ['title'],
            formatDescription: (item) => item?.title ? item.title.toUpperCase() : ''
          }
        };
      case 'organizations':
        return {
          title: 'Udruženja',
          subtitle: 'Naši partneri',
          dataset: organizationDataset,
          itemType: 'udruženje',
          cardConfig: {
            titleKey: 'name',
            subtitleKey: 'city',
            descriptionKeys: ['address', 'city'],
            formatDescription: (item) => {
              if (!item) return '';
              return `${item.address || ''}, ${item.city || ''}`.trim();
            }
          }
        };
      default:
        return {
          title: 'Sadržaj',
          subtitle: 'Sav sadržaj',
          dataset: lectureDataset,
          itemType: 'predavanje',
          cardConfig: {
            titleKey: 'title',
            subtitleKey: 'type',
            descriptionKeys: [],
            formatDescription: () => ''
          }
        };
    }
  }, [type, lectureDataset, daijeDataset, organizationDataset]);

  useEffect(() => {
    const baseData = Array.isArray(pageConfig.dataset) ? pageConfig.dataset : [];
    setData(baseData);
    setCurrentPage(1);
    setDisplayedData(baseData.slice(0, ITEMS_PER_PAGE));
  }, [pageConfig.dataset]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const loadMoreItems = () => {
    const nextPage = currentPage + 1;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    setDisplayedData(data.slice(0, endIndex));
    setCurrentPage(nextPage);
  };

  const hasMoreItems = displayedData.length < data.length;
  const isInitialLoading = loading && data.length === 0;

  const handleItemPress = (item) => {
    if (!item) return;

    if (onProfileOpen) {
      let profileType = 'predavanje';
      if (type === 'speakers') profileType = 'daija';
      if (type === 'organizations') profileType = 'organization';
      onProfileOpen(item, profileType);
    } else {
      let message = '';
      switch (type) {
        case 'lectures':
          message = `${item.title || ''}\nPredavač: ${item.speaker || ''}\nOrganizacija: ${item.organization || ''}\nDatum: ${formatDateWithDay(item.date)}\nVrijeme: ${item.time || ''}`;
          break;
        case 'speakers':
          message = `${item.name || ''}\n${item.title || ''}\n${item.specialty || ''}\n${item.organization || ''}\nKontakt: ${item.contact || ''}`;
          break;
        case 'organizations':
          message = `${item.name || ''}\n${item.address || ''}, ${item.city || ''}\nTel: ${item.contact || ''}\nEmail: ${item.email || ''}`;
          break;
        default:
          message = item.title || '';
      }
      Alert.alert(pageConfig.title, message.trim());
    }
  };

  const handleSearch = () => {
    onNavigate?.('search');
  };

  const handleMenuPress = () => setMenuOpen(true);
  const handleBackPress = () => {
    onBack?.();
  };
  const handleMenuClose = () => setMenuOpen(false);
  const handleMenuNavigate = (path) => onNavigate?.(path);
  const handleAuthNavigate = () => onNavigate?.('auth');

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      onNavigate?.('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddContent = () => onNavigate?.('add-content');
  const handleAddContentWithType = (contentType) => onNavigate?.('add-content', { preselectedType: contentType });
  const handleProfileNavigate = () => onNavigate?.('profile');

  const renderItem = useCallback(({ item }) => {
    if (!item) return null;

    const rawId = item._id || item.id;
    const itemId = typeof rawId === 'object' && rawId?.toString ? rawId.toString() : String(rawId || '');

    return (
      <UniverzalCard
        key={itemId}
        data={{
          ...item,
          type: pageConfig.itemType
        }}
        onPress={() => handleItemPress(item)}
      />
    );
  }, [pageConfig.itemType, handleItemPress]);

  const keyExtractor = useCallback((item, index) => item?._id || item?.id || `${type}-${index}`, [type]);

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Trenutno nema dostupnih podataka.</Text>
    </View>
  );

  const ListFooterComponent = () => {
    if (!hasMoreItems) return null;

    return (
      <TouchableOpacity style={styles.showMoreButton} onPress={loadMoreItems} activeOpacity={0.8}>
        <Text style={styles.showMoreText}>Prikaži više</Text>
      </TouchableOpacity>
    );
  };

  if (isInitialLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.topBarButton, !onBack && styles.topBarButtonDisabled]}
            onPress={handleBackPress}
            disabled={!onBack}
          >
            <Text style={styles.topBarButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.topBarTitleWrapper}>
            <Text style={styles.topBarTitle}>{pageConfig.title}</Text>
            {pageConfig.subtitle ? (
              <Text style={styles.topBarSubtitle}>{pageConfig.subtitle}</Text>
            ) : null}
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.topBarButton} onPress={handleSearch}>
              <Text style={styles.topBarButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBarButton} onPress={handleMenuPress}>
              <Text style={styles.topBarButtonText}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <SkeletonCardList
            count={6}
            type={type === 'lectures' ? 'lecture' : type === 'speakers' ? 'daija' : 'organization'}
          />
        </View>
        <Menu
          isOpen={menuOpen}
          onClose={handleMenuClose}
          onNavigate={handleMenuNavigate}
          isAuthenticated={isAuthenticated || false}
          user={user}
          onAuthNavigate={handleAuthNavigate}
          onLogout={handleLogout}
          onAddContent={handleAddContent}
          onAddContentWithType={handleAddContentWithType}
          onProfileNavigate={handleProfileNavigate}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.topBarButton, !onBack && styles.topBarButtonDisabled]}
          onPress={handleBackPress}
          disabled={!onBack}
        >
          <Text style={styles.topBarButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitleWrapper}>
          <Text style={styles.topBarTitle}>{pageConfig.title}</Text>
          {pageConfig.subtitle ? (
            <Text style={styles.topBarSubtitle}>{pageConfig.subtitle}</Text>
          ) : null}
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.topBarButton} onPress={handleSearch}>
            <Text style={styles.topBarButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarButton} onPress={handleMenuPress}>
            <Text style={styles.topBarButtonText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={scrollRef}
        data={displayedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          displayedData.length === 0 && styles.emptyContentContainer
        ]}
        showsVerticalScrollIndicator={false}
        windowSize={3}
        initialNumToRender={4}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: 220,
          offset: 220 * index,
          index
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
      />

      <Menu
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onNavigate={handleMenuNavigate}
        isAuthenticated={isAuthenticated || false}
        user={user}
        onAuthNavigate={handleAuthNavigate}
        onLogout={handleLogout}
        onAddContent={handleAddContent}
        onAddContentWithType={handleAddContentWithType}
        onProfileNavigate={handleProfileNavigate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.lightGray,
  },
  topBarTitleWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topBarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 44, 67, 0.08)',
  },
  topBarButtonDisabled: {
    opacity: 0.4,
  },
  topBarButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 100,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptyContentContainer: {
    flex: 1,
  },
  showMoreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  showMoreText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UniversalPage;
