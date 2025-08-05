import React, { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateModal from './UpdateModal';
import UpdateBanner from './UpdateBanner';

const UPDATE_CHECK_KEY = '@update_check_timestamp';
const UPDATE_DISMISSED_KEY = '@update_dismissed_version';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const UpdateChecker = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isForceUpdate, setIsForceUpdate] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      // Check if we should check for updates
      const lastCheck = await AsyncStorage.getItem(UPDATE_CHECK_KEY);
      const now = Date.now();
      
      if (lastCheck && (now - parseInt(lastCheck)) < CHECK_INTERVAL) {
        return; // Don't check too frequently
      }

      // Save current check time
      await AsyncStorage.setItem(UPDATE_CHECK_KEY, now.toString());

      // Get current version
      const currentVersion = VersionCheck.getCurrentVersion();
      
      // Get latest version from store
      const latestVersion = await VersionCheck.getLatestVersion({
        provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
        packageName: 'com.daije.mobile', // Your actual package name from app.config.js
        ignoreErrors: true,
      });

      if (!latestVersion || !latestVersion.version) {
        return;
      }

      // Compare versions
      const needUpdate = await VersionCheck.needUpdate({
        currentVersion,
        latestVersion: latestVersion.version,
      });

      if (needUpdate && needUpdate.isNeeded) {
        // Check if user already dismissed this version
        const dismissedVersion = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
        if (dismissedVersion === latestVersion.version && !isForceUpdate) {
          return;
        }

        setUpdateInfo({
          currentVersion,
          latestVersion: latestVersion.version,
          storeUrl: latestVersion.storeUrl || getStoreUrl(),
        });

        // Determine if it's a force update (major version change)
        const currentMajor = parseInt(currentVersion.split('.')[0]);
        const latestMajor = parseInt(latestVersion.version.split('.')[0]);
        
        if (latestMajor > currentMajor) {
          setIsForceUpdate(true);
          setShowModal(true);
        } else {
          setShowBanner(true);
        }
      }
    } catch (error) {
      console.error('Error checking for update:', error);
    }
  };

  const getStoreUrl = () => {
    const packageName = 'com.daije.mobile'; // Your actual package name
    if (Platform.OS === 'ios') {
      return `https://apps.apple.com/app/id${packageName}`;
    } else {
      return `https://play.google.com/store/apps/details?id=${packageName}`;
    }
  };

  const handleUpdate = () => {
    if (updateInfo && updateInfo.storeUrl) {
      Linking.openURL(updateInfo.storeUrl);
      setShowModal(false);
      setShowBanner(false);
    }
  };

  const handleDismiss = async () => {
    if (updateInfo && !isForceUpdate) {
      await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, updateInfo.latestVersion);
    }
    setShowModal(false);
    setShowBanner(false);
  };

  return (
    <>
      {showModal && updateInfo && (
        <UpdateModal
          visible={showModal}
          currentVersion={updateInfo.currentVersion}
          latestVersion={updateInfo.latestVersion}
          isForceUpdate={isForceUpdate}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}
      {showBanner && updateInfo && !showModal && (
        <UpdateBanner
          currentVersion={updateInfo.currentVersion}
          latestVersion={updateInfo.latestVersion}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
};

export default UpdateChecker;