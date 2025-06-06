// Theme configuration for mobile app
// Uses shared brand colors for consistency with web app

import { BRAND_COLORS, COLOR_USAGE } from '../../shared-colors';
import { MD3LightTheme } from 'react-native-paper';

// Create a deep clone to avoid readonly property issues with Hermes
const cloneDeep = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => cloneDeep(item));
  
  // For objects, create a completely new object with cloned properties
  const clonedObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Ensure string values are properly cloned for Hermes compatibility
      if (typeof value === 'string') {
        clonedObj[key] = String(value); // Force string creation
      } else {
        clonedObj[key] = cloneDeep(value);
      }
    }
  }
  return clonedObj;
};

const safeBrandColors = cloneDeep(BRAND_COLORS);

// Create a completely mutable colors object for Hermes compatibility
const createMutableColors = () => ({
  primary: {
    main: safeBrandColors.primary,
    light: safeBrandColors.primaryLight,
    dark: safeBrandColors.primaryDark,
    contrastText: safeBrandColors.text.onPrimary,
  },
  secondary: {
    main: safeBrandColors.secondary,
    light: safeBrandColors.secondaryLight,
    dark: safeBrandColors.secondaryDark,
    contrastText: safeBrandColors.text.onSecondary,
  },
  background: {
    default: safeBrandColors.background.default,
    paper: safeBrandColors.background.paper,
    card: safeBrandColors.background.paper,
    header: safeBrandColors.background.header,
    footer: safeBrandColors.background.footer,
    disabled: '#f5f5f5',
  },
  text: {
    primary: safeBrandColors.text.primary,
    secondary: safeBrandColors.text.secondary,
    disabled: safeBrandColors.text.disabled,
    onPrimary: safeBrandColors.text.onPrimary,
    onSecondary: safeBrandColors.text.onSecondary,
    link: safeBrandColors.text.link,
    linkHover: safeBrandColors.text.linkHover,
  },
  success: {
    main: safeBrandColors.status.success,
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: safeBrandColors.status.warning,
    light: '#ffd966',
    dark: 'ffd966',
  },
  error: {
    main: safeBrandColors.status.error,
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: safeBrandColors.status.info,
    light: '#64B5F6',
    dark: '#1976D2',
  },
  purple: {
    main: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
  },
  divider: '#e0e0e0',
  border: {
    main: safeBrandColors.border.light,
    light: safeBrandColors.border.light,
    medium: safeBrandColors.border.medium,
    dark: safeBrandColors.border.dark,
  },
  shadow: {
    light: safeBrandColors.shadow.light,
    medium: safeBrandColors.shadow.medium,
    dark: safeBrandColors.shadow.dark,
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
});

// Export the mutable colors object
export const colors = createMutableColors();

// Create Paper theme
const paperThemeBase = cloneDeep(MD3LightTheme);

export const paperTheme = {
  ...paperThemeBase,
  colors: {
    ...paperThemeBase.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    surface: colors.background.paper,
    background: colors.background.default,
    error: colors.error.main,
    onPrimary: colors.text.onPrimary,
    onSecondary: colors.text.onSecondary,
    onSurface: colors.text.primary,
    onBackground: colors.text.primary,
  },
};

// Ensure the colors object is completely mutable for Hermes compatibility
// This prevents any "property is not writable" errors
try {
  // Test if we can write to the object
  const testKey = '__hermes_test__';
  colors[testKey] = 'test';
  delete colors[testKey];
} catch (error) {
  console.warn('Colors object may have readonly properties:', error);
}

// Export color usage guidelines for easy access
export { COLOR_USAGE };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
}; 