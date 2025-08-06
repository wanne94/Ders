// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expects a title "to contain" a substring.
  await expect(page).toHaveTitle(/Ders/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Početna' }).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*početna/);
});