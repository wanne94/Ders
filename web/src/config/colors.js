// Shared color configuration for web application
// This ensures consistent branding across the web platform

export const BRAND_COLORS = {
  // Primary brand color - used for headers, navigation, primary buttons
  primary: '#022C43',
  
  // Primary color variations
  primaryLight: '#055A87',
  primaryDark: '#011A2A',
  
  // Secondary brand color - used for accents, highlights, secondary buttons
  secondary: '#dc004e',
  
  // Secondary color variations
  secondaryLight: '#ff5983',
  secondaryDark: '#a7001e',
  
  // Background colors
  background: {
    default: '#f5f5f5',        // Main page background
    paper: '#ffffff',          // Card/paper background
    header: '#022C43',         // Header/navigation background
    footer: '#022C43',         // Footer background
  },
  
  // Text colors
  text: {
    primary: 'rgb(31, 31, 31)',    // Main text color (titles, headings)
    secondary: '#666666',          // Secondary text (descriptions, labels)
    disabled: '#999999',           // Disabled text
    onPrimary: '#ffffff',          // Text on primary background
    onSecondary: '#ffffff',        // Text on secondary background
    link: '#022C43',               // Link color
    linkHover: '#055A87',          // Link hover color
  },
  
  // Status colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  
  // Border and divider colors
  border: {
    light: '#e0e0e0',
    medium: '#bdbdbd',
    dark: '#757575',
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
};

// Color usage guidelines
export const COLOR_USAGE = {
  header: BRAND_COLORS.background.header,
  headerText: BRAND_COLORS.text.onPrimary,
  pageBackground: BRAND_COLORS.background.default,
  cardBackground: BRAND_COLORS.background.paper,
  titleText: BRAND_COLORS.primary,           // Card/content titles use primary color
  headingText: BRAND_COLORS.text.primary,    // Page headings use primary text color
  bodyText: BRAND_COLORS.text.secondary,
  primaryButton: BRAND_COLORS.primary,
  primaryButtonText: BRAND_COLORS.text.onPrimary,
  secondaryButton: BRAND_COLORS.secondary,
  secondaryButtonText: BRAND_COLORS.text.onSecondary,
  link: BRAND_COLORS.text.link,
  linkHover: BRAND_COLORS.text.linkHover,
};

export default BRAND_COLORS; 