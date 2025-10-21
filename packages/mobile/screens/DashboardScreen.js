import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert
} from 'react-native';
import predavanjaService from '../services/predavanjaService';
import daijeService from '../services/daijeService';
import udruzenjaService from '../services/udruzenjaService';
import suggestionsService from '../services/suggestionsService';
import apiCache from '../services/apiCache';

// Dashboard components
import Statistics from '../components/dashboard/Statistics';
import NavigationHeader from '../components/dashboard/NavigationHeader';
import SearchBar from '../components/dashboard/SearchBar';
import BulkActionsBar from '../components/dashboard/BulkActionsBar';

// Section components
import LecturesSectionMobile from '../components/dashboard/sections/LecturesSectionMobile';
import OrganizationsSectionMobile from '../components/dashboard/sections/OrganizationsSectionMobile';
import DaijeSectionMobile from '../components/dashboard/sections/DaijeSectionMobile';
import UsersSectionMobile from '../components/dashboard/sections/UsersSectionMobile';
import ApprovalSectionMobile from '../components/dashboard/sections/ApprovalSectionMobile';
import RejectedSectionMobile from '../components/dashboard/sections/RejectedSectionMobile';
import SuggestionsSectionMobile from '../components/dashboard/sections/SuggestionsSectionMobile';
import CancellationsSectionMobile from '../components/dashboard/sections/CancellationsSectionMobile';

// Modal components
import ItemDetailsModal from '../components/dashboard/modals/ItemDetailsModal';
import ApprovalModal from '../components/dashboard/modals/ApprovalModal';
import SettingsModal from '../components/dashboard/modals/SettingsModal';
import EditModal from '../components/dashboard/modals/EditModal';
import CancelModal from '../components/dashboard/modals/CancelModal';
import ReactivateModal from '../components/dashboard/modals/ReactivateModal';

// Other components
import AddContentPopup from '../components/AddContentPopup';
import AdvancedFilters from '../components/AdvancedFilters';
import UserForm from '../components/forms/UserForm';

// Custom hook
import useMobileDashboardData from '../hooks/useMobileDashboardData';

// Utils
import { COLORS } from '../components/dashboard/utils/dashboardHelpers';

const DashboardScreen = ({ onBack, userRole = 'admin', onDataChange }) => {
  // UI State
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Bulk selection states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Data hook
  const {
    data,
    counts,
    approvalSettings,
    isLoading,
    refreshing,
    onRefresh,
    handleDataChange,
    saveApprovalSettings,
    setApprovalSettings
  } = useMobileDashboardData({ onBack, onDataChange });

  // Get current section data
  const getCurrentSectionData = () => {
    let items = [];
    let type = '';

    switch (activeSection) {
      case 'predavanja':
        items = (data.lectures || []).filter(l => l.status === 'approved');
        type = 'lectures';
        break;
      case 'organizations':
        items = (data.organizations || []).filter(o => o.status === 'approved');
        type = 'organizations';
        break;
      case 'daije':
        items = (data.daije || []).filter(d => d.status === 'approved');
        type = 'daije';
        break;
      case 'korisnici':
        items = data.users || [];
        type = 'users';
        break;
      case 'za-odobrenje':
        items = [
          ...(data.lectures || []).filter(l => l.status === 'pending').map(l => ({ ...l, type: 'lecture' })),
          ...(data.daije || []).filter(d => d.status === 'pending').map(d => ({ ...d, type: 'daija' })),
          ...(data.organizations || []).filter(o => o.status === 'pending').map(o => ({ ...o, type: 'organization' }))
        ];
        type = 'mixed';
        break;
      case 'odbijeno':
        items = [
          ...(data.lectures || []).filter(l => l.status === 'rejected').map(l => ({ ...l, type: 'lecture' })),
          ...(data.daije || []).filter(d => d.status === 'rejected').map(d => ({ ...d, type: 'daija' })),
          ...(data.organizations || []).filter(o => o.status === 'rejected').map(o => ({ ...o, type: 'organization' }))
        ];
        type = 'mixed';
        break;
      case 'prijedlozi':
        items = (data.suggestions || []).filter(s => !s.archived);
        type = 'suggestions';
        break;
      case 'otkazivanja':
        items = data.cancelledReports || [];
        type = 'cancelled_reports';
        break;
      default:
        items = [];
        type = '';
    }

    return { items, type };
  };

  // Handler: Approval action
  const handleApprovalAction = (item, action) => {
    setSelectedItem({ ...item, action });
    setShowApprovalModal(true);
  };

  // Handler: Confirm approval
  const confirmApprovalAction = async (item, reason = '') => {
    if (!item) return;

    try {
      const { action, type, _id } = item;
      let service;

      switch (type) {
        case 'lecture':
          service = predavanjaService;
          break;
        case 'daija':
          service = daijeService;
          break;
        case 'organization':
          service = udruzenjaService;
          break;
        case 'cancelled_report':
          if (action === 'approve') {
            await predavanjaService.approveCancellation(_id);
          } else {
            await predavanjaService.rejectCancellation(_id, reason);
          }
          await handleDataChange();
          Alert.alert('Uspjeh', `Prijava je ${action === 'approve' ? 'odobrena' : 'odbijena'}`);
          return;
        default:
          Alert.alert('Greška', 'Nepoznat tip stavke');
          return;
      }

      if (action === 'approve') {
        await service.updateStatus(_id, 'approved');
        Alert.alert('Uspjeh', 'Stavka je odobrena');
      } else {
        await service.updateStatus(_id, 'rejected', reason);
        Alert.alert('Uspjeh', 'Stavka je odbijena');
      }

      await handleDataChange();
    } catch (error) {
      console.error('Approval error:', error);
      Alert.alert('Greška', 'Došlo je do greške');
    }
  };

  // Handler: Archive suggestion
  const handleArchiveSuggestion = async (item) => {
    try {
      await suggestionsService.archiveSuggestion(item._id);
      await handleDataChange();
      Alert.alert('Uspjeh', 'Prijedlog je arhiviran');
    } catch (error) {
      console.error('Archive error:', error);
      Alert.alert('Greška', 'Greška pri arhiviranju prijedloga');
    }
  };

  // Handler: Cancel lecture
  const handleCancelLecture = (lecture) => {
    if (lecture.cancelled) {
      Alert.alert('Greška', 'Predavanje je već otkazano');
      return;
    }
    setSelectedItem(lecture);
    setShowCancelModal(true);
  };

  // Handler: Confirm cancel
  const confirmCancelLecture = async (lecture, reason) => {
    try {
      await predavanjaService.cancelLectureDirectly(lecture._id, reason);
      await handleDataChange();
      Alert.alert('Uspjeh', `Predavanje "${lecture.title}" je uspješno otkazano`);
    } catch (error) {
      console.error('Cancel error:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom otkazivanja');
    }
  };

  // Handler: Reactivate lecture
  const handleReactivateLecture = (lecture) => {
    if (!lecture.cancelled) {
      Alert.alert('Greška', 'Predavanje nije otkazano');
      return;
    }
    setSelectedItem(lecture);
    setShowReactivateModal(true);
  };

  // Handler: Confirm reactivate
  const confirmReactivateLecture = async (lecture, reason) => {
    try {
      await predavanjaService.reactivateLecture(lecture._id, reason);
      await handleDataChange();
      Alert.alert('Uspjeh', `Predavanje "${lecture.title}" je uspješno reaktivirano`);
    } catch (error) {
      console.error('Reactivate error:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom reaktiviranja');
    }
  };

  // Handler: Edit item
  const handleEditItem = (item, itemType) => {
    setSelectedItem({ ...item, itemType });
    setShowEditModal(true);
  };

  // Handler: Navigate to edit
  const handleNavigateToEdit = (item, itemType) => {
    setShowEditModal(false);
    setShowItemModal(false);
    // AddContentPopup will be shown via the separate component below
  };

  // Handler: Delete item
  const handleDeleteItem = (item, itemType) => {
    const itemName = item.title || item.name || 'stavku';
    Alert.alert(
      'Potvrda brisanja',
      `Jeste li sigurni da želite obrisati "${itemName}"?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              let service;
              switch (itemType) {
                case 'lecture':
                  service = predavanjaService;
                  break;
                case 'daija':
                  service = daijeService;
                  break;
                case 'organization':
                  service = udruzenjaService;
                  break;
                default:
                  Alert.alert('Greška', 'Nepoznat tip stavke');
                  return;
              }

              await service.deleteItem(item._id);
              await handleDataChange();
              Alert.alert('Uspjeh', `"${itemName}" je uspješno obrisano`);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja');
            }
          }
        }
      ]
    );
  };

  // Handler: Item press
  const handleItemPress = (item, itemType) => {
    if (bulkMode) {
      toggleItemSelection(item._id);
    } else {
      setSelectedItem({ ...item, type: itemType });
      setShowItemModal(true);
    }
  };

  // Handler: Item long press
  const handleItemLongPress = (item) => {
    if (!bulkMode) {
      toggleBulkMode();
      toggleItemSelection(item._id);
    }
  };

  // Bulk mode handlers
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const selectAllItems = () => {
    const { items } = getCurrentSectionData();
    const allIds = items.map(item => item._id);
    setSelectedItems(allIds);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedItems.length === 0) {
      Alert.alert('Greška', 'Nema odabranih stavki');
      return;
    }

    try {
      const { type } = getCurrentSectionData();
      let service;

      switch (type) {
        case 'lectures':
        case 'lecture':
          service = predavanjaService;
          break;
        case 'daije':
        case 'daija':
          service = daijeService;
          break;
        case 'organizations':
        case 'organization':
          service = udruzenjaService;
          break;
        default:
          Alert.alert('Greška', 'Nepoznat tip stavke');
          return;
      }

      const promises = selectedItems.map(id => service.updateStatus(id, newStatus));
      await Promise.all(promises);

      Alert.alert('Uspjeh', `${selectedItems.length} stavki je uspješno ažurirano`);
      setSelectedItems([]);
      setBulkMode(false);
      await handleDataChange();
    } catch (error) {
      console.error('Bulk status change error:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom ažuriranja statusa');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Greška', 'Nema odabranih stavki');
      return;
    }

    Alert.alert(
      'Potvrda brisanja',
      `Jeste li sigurni da želite obrisati ${selectedItems.length} odabranih stavki?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              const { type } = getCurrentSectionData();
              let service;

              switch (type) {
                case 'lectures':
                case 'lecture':
                  service = predavanjaService;
                  await apiCache.clearCache('lectures');
                  break;
                case 'daije':
                case 'daija':
                  service = daijeService;
                  await apiCache.clearCache('daije');
                  break;
                case 'organizations':
                case 'organization':
                  service = udruzenjaService;
                  await apiCache.clearCache('organizations');
                  break;
                default:
                  Alert.alert('Greška', 'Nepoznat tip stavke');
                  return;
              }

              const promises = selectedItems.map(id => service.deleteItem(id));
              await Promise.all(promises);

              Alert.alert('Uspjeh', `${selectedItems.length} stavki je uspješno obrisano`);
              setSelectedItems([]);
              setBulkMode(false);
              await handleDataChange();
            } catch (error) {
              console.error('Bulk delete error:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja');
            }
          }
        }
      ]
    );
  };

  // Settings handlers
  const handleSettingChange = (key, value) => {
    setApprovalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (settings) => {
    const success = await saveApprovalSettings(settings);
    if (success) {
      Alert.alert('Uspjeh', 'Postavke su uspješno spremljene');
    }
  };

  // Render content based on active section
  const renderContent = () => {
    if (activeSection === 'dashboard') {
      return (
        <Statistics
          data={data}
          counts={counts}
          userRole={userRole}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      );
    }

    const commonProps = {
      isLoading,
      refreshing,
      searchQuery,
      bulkMode,
      selectedItems,
      userRole,
      daijeList: data.daije || [],
      onRefresh,
      onItemPress: handleItemPress,
      onItemLongPress: handleItemLongPress,
      onApprove: (item) => handleApprovalAction(item, 'approve'),
      onReject: (item) => handleApprovalAction(item, 'reject'),
      onEdit: handleEditItem,
      onDelete: handleDeleteItem,
      onCancel: handleCancelLecture,
      onReactivate: handleReactivateLecture,
      onArchive: handleArchiveSuggestion
    };

    switch (activeSection) {
      case 'predavanja':
        return <LecturesSectionMobile lectures={data.lectures || []} {...commonProps} />;
      case 'organizations':
        return <OrganizationsSectionMobile organizations={data.organizations || []} {...commonProps} />;
      case 'daije':
        return <DaijeSectionMobile daije={data.daije || []} {...commonProps} />;
      case 'korisnici':
        return <UsersSectionMobile users={data.users || []} {...commonProps} />;
      case 'za-odobrenje':
        return (
          <ApprovalSectionMobile
            lectures={data.lectures || []}
            daije={data.daije || []}
            organizations={data.organizations || []}
            {...commonProps}
          />
        );
      case 'odbijeno':
        return (
          <RejectedSectionMobile
            lectures={data.lectures || []}
            daije={data.daije || []}
            organizations={data.organizations || []}
            {...commonProps}
          />
        );
      case 'prijedlozi':
        return <SuggestionsSectionMobile suggestions={data.suggestions || []} {...commonProps} />;
      case 'otkazivanja':
        return <CancellationsSectionMobile cancelledReports={data.cancelledReports || []} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <NavigationHeader
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        counts={counts}
        userRole={userRole}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSettingsPress={() => setShowSettingsModal(true)}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        visible={bulkMode}
        selectedCount={selectedItems.length}
        userRole={userRole}
        onSelectAll={selectAllItems}
        onDeselectAll={deselectAllItems}
        onApprove={() => handleBulkStatusChange('approved')}
        onReject={() => handleBulkStatusChange('rejected')}
        onDelete={handleBulkDelete}
      />

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      <ItemDetailsModal
        visible={showItemModal}
        item={selectedItem}
        daijeList={data.daije || []}
        onClose={() => setShowItemModal(false)}
        onEdit={handleEditItem}
        onApprove={(item) => handleApprovalAction(item, 'approve')}
        onReject={(item) => handleApprovalAction(item, 'reject')}
        onCancel={handleCancelLecture}
        onReactivate={handleReactivateLecture}
      />

      <ApprovalModal
        visible={showApprovalModal}
        item={selectedItem}
        onClose={() => setShowApprovalModal(false)}
        onApprove={confirmApprovalAction}
        onReject={confirmApprovalAction}
      />

      <SettingsModal
        visible={showSettingsModal}
        settings={approvalSettings}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
        onSettingChange={handleSettingChange}
      />

      <EditModal
        visible={showEditModal}
        item={selectedItem}
        onClose={() => setShowEditModal(false)}
        onNavigateToEdit={handleNavigateToEdit}
      />

      <CancelModal
        visible={showCancelModal}
        lecture={selectedItem}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelLecture}
      />

      <ReactivateModal
        visible={showReactivateModal}
        lecture={selectedItem}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={confirmReactivateLecture}
      />

      {/* User Form Modal */}
      <UserForm
        visible={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setShowUserForm(false);
          setSelectedUser(null);
          handleDataChange();
        }}
        editMode={!!selectedUser}
        editData={selectedUser}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setShowFilters(false);
        }}
        activeFilters={activeFilters}
      />

      {/* Add Content Popup */}
      <AddContentPopup
        visible={showEditModal && selectedItem}
        onClose={() => setShowEditModal(false)}
        initialContentType={selectedItem?.itemType || selectedItem?.type}
        editMode={true}
        editData={selectedItem}
        onSuccess={() => {
          setShowEditModal(false);
          handleDataChange();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default DashboardScreen;
