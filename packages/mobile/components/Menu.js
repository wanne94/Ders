import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
};

// Menu items based on web app
const menuItems = [
  {
    text: 'Početna',
    icon: 'home-outline',
    path: 'home'
  },
  {
    text: 'Dersovi',
    icon: 'book-outline',
    path: 'lectures'
  },
  {
    text: 'Udruženja',
    icon: 'business-outline',
    path: 'organizations'
  },
  {
    text: 'Daije',
    icon: 'person-outline',
    path: 'speakers'
  }
];


const adminMenuItems = [
  {
    text: 'Admin Panel',
    icon: 'shield-outline',
    path: 'dashboard'
  }
];


const Menu = ({ isOpen, onClose, onNavigate, isAuthenticated, user, onAuthNavigate, onLogout, onAddContent, onProfileNavigate }) => {
  const slideAnim = useState(new Animated.Value(width))[0];
  const overlayOpacity = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (isOpen) {
      // Opening animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Closing animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      
    }
  }, [isOpen, slideAnim, overlayOpacity]);


  const handleMenuItemPress = (item) => {
    // Smooth close animation before navigation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      if (onNavigate) {
        onNavigate(item.path);
      }
    });
  };


  const toggleAddMenu = () => {
    if (onAddContent) {
      onAddContent();
      onClose(); // Zatvori sidebar nakon što se otvori AddContentMenu
    }
  };

  const handleOverlayPress = () => {
    // Smooth close animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Animated Overlay */}
      <Animated.View 
        style={[
          styles.overlay, 
          { opacity: overlayOpacity }
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={handleOverlayPress} />
      </Animated.View>
      
      {/* Animated Menu Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { 
            transform: [{ 
              translateX: slideAnim.interpolate({
                inputRange: [0, width],
                outputRange: [0, width],
                extrapolate: 'clamp'
              })
            }] 
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Menu</Text>
              {isAuthenticated && user && (
                <Text style={styles.userInfo}>
                  {user.username} ({user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Korisnik'})
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleOverlayPress} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Main Menu */}
          <View style={styles.section}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={COLORS.white} 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>{item.text}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Admin Menu Section - Only show for admin/super_admin */}
          {isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin') && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Admin funkcije</Text>
              </View>

              <View style={styles.section}>
                {adminMenuItems.map((item, index) => (
                  <TouchableOpacity
                    key={`admin-${index}`}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={COLORS.white} 
                        style={styles.menuIcon}
                      />
                      <Text style={styles.menuItemText}>{item.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider} />
            </>
          )}

          {/* Auth/User Menu Section */}
          {isAuthenticated ? (
            <>

              {/* Add Menu Toggle */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleAddMenu}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name="add-outline" 
                    size={20} 
                    color={COLORS.white} 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>Dodaj</Text>
                </View>
              </TouchableOpacity>


              {/* Profile Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleOverlayPress();
                  if (onProfileNavigate) {
                    onProfileNavigate();
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name="person-circle-outline" 
                    size={20} 
                    color={COLORS.white} 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>Moj profil</Text>
                </View>
              </TouchableOpacity>

              {/* Logout Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleOverlayPress();
                  onLogout();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name="log-out-outline" 
                    size={20} 
                    color={COLORS.white} 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>Odjavi se</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Auth Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Autentifikacija</Text>
              </View>
              
              {/* Login Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleOverlayPress();
                  onAuthNavigate();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name="log-in-outline" 
                    size={20} 
                    color={COLORS.white} 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>Prijavi se</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 280,
    height: height,
    backgroundColor: COLORS.primary,
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    paddingVertical: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
    width: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.white,
    flex: 1,
  },
});

export default Menu; 