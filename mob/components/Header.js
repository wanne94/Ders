import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
};

const SERVER_URL = 'https://ders.ba';

const Header = ({ onMenuPress, title }) => {
  const insets = useSafeAreaInsets();

  const toggleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity style={styles.logoContainer}>
        <Image 
          source={{ uri: `${SERVER_URL}/uploads/logo.jpg` }}
          style={styles.logo}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}

      <TouchableOpacity 
        onPress={toggleMenu} 
        style={styles.menuButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <View style={styles.menuIcon}>
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#c89b3c',
    backgroundColor: '#0d2c3b',
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  menuButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuBar: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
});

export default Header;