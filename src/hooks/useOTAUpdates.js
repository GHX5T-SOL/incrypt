import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

export const useOTAUpdates = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Check for updates
  const checkForUpdates = async () => {
    if (__DEV__) {
      console.log('OTA updates disabled in development');
      return;
    }

    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateAvailable(true);
        console.log('Update available:', update);
      } else {
        setUpdateAvailable(false);
        console.log('No updates available');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Fetch and apply update
  const applyUpdate = async () => {
    if (__DEV__) {
      console.log('OTA updates disabled in development');
      return;
    }

    try {
      setIsUpdating(true);
      const update = await Updates.fetchUpdateAsync();
      
      if (update.isNew) {
        // Reload the app to apply the update
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Error applying update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-check for updates on app start
  useEffect(() => {
    checkForUpdates();
  }, []);

  return {
    isChecking,
    isUpdating,
    updateAvailable,
    lastChecked,
    checkForUpdates,
    applyUpdate
  };
}; 