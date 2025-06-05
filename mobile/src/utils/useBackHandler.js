import { useEffect } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export const useBackHandler = (navigation) => {
  useFocusEffect(() => {
    const onBackPress = () => {
      // Check if keyboard is visible
      if (Keyboard.isVisible()) {
        // Dismiss keyboard and prevent default back action
        Keyboard.dismiss();
        return true; // Prevent default back action
      }
      
      // If keyboard is not visible, allow default back action
      return false; // Allow default back action
    };

    // Add event listener
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Cleanup function
    return () => subscription.remove();
  });
}; 