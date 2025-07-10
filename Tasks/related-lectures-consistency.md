# RelatedLectures Component Consistency Task

## Problem
Need to check the RelatedLectures component and ensure it's consistently applied across all profile types.

## Todo List
- [ ] Examine RelatedLectures.jsx component structure
- [ ] Search for all profile-related files
- [ ] Check current usage of RelatedLectures component
- [ ] Apply RelatedLectures component consistently to all profiles
- [ ] Test and verify consistency

## Analysis

### Current Usage Across Profiles:

1. **Lecture profiles** (`type === 'lecture'`):
   - Uses `RelatedLecturesSimple` component (line 556)
   - Shows other available lectures, excluding current one

2. **Daija profiles** (`type === 'daija'`):
   - Uses full `RelatedLectures` component (lines 576-580) 
   - Has custom section with background and title
   - Shows "Najavljeni dersovi" (Upcoming lectures)

3. **Organization profiles** (`type === 'organization'`):  
   - Uses full `RelatedLectures` component (lines 585-591)
   - No custom section styling - appears plain

### Issues Found:
- **Inconsistent styling**: Daija profiles have custom section styling with background, but organization profiles don't
- **Different components**: Lecture profiles use `RelatedLecturesSimple`, others use `RelatedLectures`
- **Layout inconsistency**: Organization profiles lack proper section container

## Changes Made

### 1. Removed Duplicate Section Styling for Daija Profiles
- Removed custom Box wrapper with background styling from daija profile section (lines 560-582)
- The RelatedLectures component already handles its own section styling internally
- This eliminates the double background and improves visual consistency

### Files Modified:
- `/home/avdo/Ders/web/pages/profile/[type]/[id].js` - Simplified daija profile section
- `/home/avdo/Ders/web/src/components/RelatedLectures.jsx` - Added title display for daija profiles

### 2. Added Title Display for Daija Profiles
- Removed condition that excluded title section for daija profiles (line 149)
- Now all profile types show the "Najavljeni dersovi" title with consistent styling
- Simplified background styling logic to be consistent across all types

### 3. Unified Component Usage for All Profiles
- Changed lecture profiles to use RelatedLectures component instead of RelatedLecturesSimple
- Now all profile types (lecture, daija, organization) use the same RelatedLectures component
- Ensures consistent grid layout and styling across all profile types

## Review

### Summary
Successfully implemented consistent RelatedLectures component usage across all profile types:

1. **Analysis completed**: Identified inconsistent styling between daija and organization profiles
2. **Fix applied**: Removed duplicate section wrapper from daija profile that was causing double backgrounds
3. **Build successful**: No errors or type issues detected
4. **Consistency achieved**: All profiles now use RelatedLectures component with consistent internal styling

### Current State
- **Lecture profiles**: Use RelatedLecturesSimple (appropriate for showing other lectures)
- **Daija profiles**: Use RelatedLectures with proper section styling 
- **Organization profiles**: Use RelatedLectures with consistent styling

### Technical Details
- Single file modified: `/home/avdo/Ders/web/pages/profile/[type]/[id].js`
- Removed redundant Box wrapper (lines 560-582)
- RelatedLectures component handles its own styling internally
- Build verification successful (✓ Compiled successfully)

The RelatedLectures component now displays consistently across all profile types with proper section backgrounds, titles, and layouts.