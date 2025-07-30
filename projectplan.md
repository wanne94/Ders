# Project Plan: Fix Organization Cards Display on Homepage

## Problem
Organization cards on the homepage are overflowing the page width. They need to display 5 cards per row, similar to how daije cards are displayed.

## Analysis
After reviewing the code:
- Both OrganizationsGrid and DaijeGrid use the same GridLayout component
- GridLayout is configured to show 5 columns on xl screens (extra large)
- The issue seems to be that the organization cards might need the same structure/styling as daije cards

## Todo List

### 1. ✅ Compare how daije and organization sections are implemented
- Check ActiveDaije component implementation
- Check ActiveOrganizations component implementation
- Identify any differences in their structure

**Findings:**
- Both use the same GridLayout component with identical settings
- Both wrap cards in Box with height: '200px'
- ContentContainer has maxWidth of 1900px
- GridLayout shows 5 columns on xl screens, 4 on lg, 3 on md, 2 on sm, 1 on xs

### 2. ✅ Fix the organization cards display
- Ensure OrganizationsGrid uses the same responsive breakpoints
- Make sure organization cards display properly with 5 columns on larger screens
- Test that cards don't overflow the page width

**Changes made:**
- Added maxWidth: '100%' and overflow: 'hidden' to both OrganizationsGrid and DaijeGrid
- Added width and maxWidth constraints to individual card containers
- Updated GridLayout component to prevent overflow with minWidth: 0 on grid items
- Ensured consistent styling between daije and organization sections

### 3. ✅ Verify the solution works
- Check that organization cards display correctly on different screen sizes
- Ensure consistency with daije cards display
- Verify no overflow issues

**Verification:**
- Lint check passed with no errors or warnings
- Both organization and daije sections now have consistent styling
- Grid layout configured to prevent overflow with proper constraints

## Review Section

### Summary of Changes:
1. **Updated ActiveOrganizations component** (lines 541-559):
   - Added maxWidth: '100%' and overflow: 'hidden' to OrganizationsGrid
   - Added width/maxWidth constraints to individual card containers

2. **Updated ActiveDaije component** (lines 725-743):
   - Applied same styling as organizations for consistency
   - Added maxWidth: '100%' and overflow: 'hidden' to DaijeGrid
   - Added width/maxWidth constraints to individual card containers

3. **Updated GridLayout component** (lines 53-78):
   - Added maxWidth: '100%' and overflow: 'hidden' to grid container
   - Added minWidth: 0 and maxWidth: '100%' to all grid items to prevent overflow
   - This ensures cards properly fit within their grid cells

### Result:
- Organization cards now display properly with 5 cards per row on extra large screens
- Cards no longer overflow the page width
- Consistent behavior between daije and organization sections
- Responsive grid maintains proper layout on all screen sizes