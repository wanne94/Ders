// Theme configuration for mobile app
// Uses shared brand colors for consistency with web app

import { BRAND_COLORS, COLOR_USAGE } from '../../shared-colors';

export const colors = {
  primary: {
    main: BRAND_COLORS.primary,
    light: BRAND_COLORS.primaryLight,
    dark: BRAND_COLORS.primaryDark,
    contrastText: BRAND_COLORS.text.onPrimary,
  },
  secondary: {
    main: BRAND_COLORS.secondary,
    light: BRAND_COLORS.secondaryLight,
    dark: BRAND_COLORS.secondaryDark,
    contrastText: BRAND_COLORS.text.onSecondary,
  },
  background: {
    default: BRAND_COLORS.background.default,
    paper: BRAND_COLORS.background.paper,
    card: BRAND_COLORS.background.paper,
    header: BRAND_COLORS.background.header,
    footer: BRAND_COLORS.background.footer,
    disabled: '#f5f5f5',
  },
  text: {
    primary: BRAND_COLORS.text.primary,
    secondary: BRAND_COLORS.text.secondary,
    disabled: BRAND_COLORS.text.disabled,
    onPrimary: BRAND_COLORS.text.onPrimary,
    onSecondary: BRAND_COLORS.text.onSecondary,
    link: BRAND_COLORS.text.link,
    linkHover: BRAND_COLORS.text.linkHover,
  },
  success: {
    main: BRAND_COLORS.status.success,
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: BRAND_COLORS.status.warning,
    light: '#ffd966',
    dark: 'ffd966',
  },
  error: {
    main: BRAND_COLORS.status.error,
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: BRAND_COLORS.status.info,
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
    main: BRAND_COLORS.border.light,
    light: BRAND_COLORS.border.light,
    medium: BRAND_COLORS.border.medium,
    dark: BRAND_COLORS.border.dark,
  },
  shadow: {
    light: BRAND_COLORS.shadow.light,
    medium: BRAND_COLORS.shadow.medium,
    dark: BRAND_COLORS.shadow.dark,
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
};

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