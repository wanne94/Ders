const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/predavanje/i);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual testing
    await page.screenshot({ path: 'tests/screenshots/homepage.png' });
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation is present
    const navigation = page.locator('nav').first();
    await expect(navigation).toBeVisible();
    
    // Check for common navigation elements
    // Adjust these selectors based on your actual navigation structure
    const homeLink = page.getByRole('link', { name: /home|početna|naslovna/i });
    if (await homeLink.count() > 0) {
      await expect(homeLink).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if page renders properly on mobile
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/homepage-mobile.png' });
    
    // Check if mobile navigation (hamburger menu) is present if applicable
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Allow some time for any async operations to complete
    await page.waitForTimeout(2000);
    
    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Page should still load even if API calls fail
    await expect(page).toHaveTitle(/predavanje/i);
    
    // Check if error handling is in place
    // This depends on your error handling implementation
    const errorMessage = page.locator('[data-testid="error-message"], .error-message');
    if (await errorMessage.count() > 0) {
      // If error messages are shown, they should be user-friendly
      await expect(errorMessage).toBeVisible();
    }
  });
}); 