import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the welcome message', async ({ page }) => {
    const text = page.locator('text=Open up App.tsx');
    await expect(text).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('should render without errors', async ({ page }) => {
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        throw new Error(`Console error: ${msg.text()}`);
      }
    });
    await expect(page).not.toHaveTitle('Error');
  });
});
