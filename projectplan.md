# Project Plan: Update Web Project to Use Shared Constants

## Overview
This plan outlines the migration of hardcoded constants in the web project to use the shared constants from the @ders-ba/shared package. This will ensure consistency across the web and mobile applications.

## Files That Need Updates

### 1. Files Using Hardcoded Colors
The following files contain hardcoded color values that should be replaced with imports from @ders-ba/shared:

**Files with color codes (#022C43, #dc004e, etc.):**
- `/packages/web/src/providers/SimpleThemeProvider.js` - Uses #022C43, #dc004e
- `/packages/web/src/contexts/ThemeContext.jsx` - Uses #022C43, #055A87, #011929, #dc004e, #ff5983, #9a0036
- `/packages/web/pages/404.js` - Uses #022C43, #055A87 in gradient
- `/packages/web/pages/index.js` - Uses hardcoded colors
- `/packages/web/pages/index-old.js` - Uses hardcoded colors
- `/packages/web/src/components/RelatedLecturesSimple.jsx` - Uses hardcoded colors
- `/packages/web/src/components/DeleteProfileDialog.jsx` - Uses hardcoded colors
- `/packages/web/src/components/RelatedLectures.jsx` - Uses hardcoded colors
- `/packages/web/src/components/Navigation.jsx` - Uses hardcoded colors
- `/packages/web/src/components/SimplifiedStatistics.jsx` - Uses hardcoded colors
- `/packages/web/src/components/DownloadAppSection.jsx` - Uses hardcoded colors
- `/packages/web/src/components/Footer.jsx` - Uses hardcoded colors
- `/packages/web/src/components/AddressLink.jsx` - Uses hardcoded colors
- `/packages/web/src/components/SkeletonProfile.jsx` - Uses hardcoded colors
- `/packages/web/pages/profile/[type]/[[...params]].js` - Uses hardcoded colors

### 2. Files Using Hardcoded User Roles
Files that need to import USER_ROLES from @ders-ba/shared:

**Files with hardcoded role strings:**
- `/packages/web/src/components/Navigation.jsx` - Line 150: `user?.role === 'admin' || user?.role === 'super_admin'`
- Other files that check for 'admin', 'user', 'moderator', 'predavac', 'organizacija' roles

### 3. Files Using Hardcoded Sort Orders
Files that need to import SORT_ORDERS from @ders-ba/shared:

**Files with 'asc'/'desc' strings:**
- `/packages/web/src/components/DataTable.jsx` - Multiple instances of 'asc' and 'desc' strings
- Other components that implement sorting functionality

### 4. Files Using Hardcoded Theme Modes
Files that need to import THEME_MODES from @ders-ba/shared:

**Files with 'light'/'dark' strings:**
- `/packages/web/src/contexts/ThemeContext.jsx` - Line 17: `mode: 'light'`

### 5. Image Utils
- `/packages/web/src/utils/imageUtils.js` - Contains IMAGE_SERVER_URL that might need to be imported from shared constants

## Todo Tasks

- [ ] Create projectplan.md with the plan for updating web files to use shared constants
- [ ] Update files that use hardcoded colors (#022C43, #dc004e, etc.) to import from shared colors
- [ ] Update files that use hardcoded role strings ('admin', 'user', etc.) to import from shared roles  
- [ ] Update files that use hardcoded sort orders ('asc', 'desc') to import from shared UI constants
- [ ] Update files that use hardcoded theme modes ('light', 'dark') to import from shared UI constants
- [ ] Review all changes and create a summary in projectplan.md

## Implementation Strategy

1. **Update Color Constants**
   - Import `{ BRAND_COLORS, COLOR_USAGE }` from '@ders-ba/shared'
   - Replace all hardcoded hex values with the appropriate constant
   - Use COLOR_USAGE for semantic color usage

2. **Update Role Constants**
   - Import `{ USER_ROLES, isAdmin, hasPermission }` from '@ders-ba/shared'
   - Replace hardcoded role strings with USER_ROLES constants
   - Use helper functions like `isAdmin()` where appropriate

3. **Update UI Constants**
   - Import `{ THEME_MODES, SORT_ORDERS }` from '@ders-ba/shared'
   - Replace hardcoded 'light'/'dark' with THEME_MODES constants
   - Replace hardcoded 'asc'/'desc' with SORT_ORDERS constants

4. **Update Image Constants**
   - Check if IMAGE_SERVER_URL should be imported from shared endpoints
   - Ensure consistent image path handling

## Testing Strategy
- Test all updated components to ensure they still function correctly
- Verify that colors display properly
- Ensure role-based access control still works
- Test sorting functionality
- Verify theme switching (if applicable)

## Notes
- The @ders-ba/shared package is already configured in package.json
- All constants are exported from the main index.js file in the shared package
- This migration will improve consistency and maintainability across the codebase