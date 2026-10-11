import { test, expect } from '@playwright/test';

test('Dashboard loads without infinite loading spinner', async ({ page }) => {
  // Capture console logs for debugging
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait a bit for React to hydrate and initial load
  await page.waitForTimeout(2000);

  // Check if loading spinner is visible initially
  const loadingSpinner = page.locator('.dashboard-loading');
  const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false);
  console.log('Loading spinner initially visible:', isLoadingVisible);

  // Check that loading spinner is NOT visible (should have resolved)
  // Wait up to 20 seconds for loading to complete
  await expect(loadingSpinner).not.toBeVisible({ timeout: 20000 });

  // Check that dashboard grid/content is visible
  const dashboardGrid = page.locator('.dashboard-grid, .dashboard-empty-state');
  await expect(dashboardGrid).toBeVisible({ timeout: 10000 });

  // Check for widget content
  const widgets = page.locator('.widget');
  await expect(widgets.first()).toBeVisible({ timeout: 10000 });

  console.log('Dashboard loaded successfully!');
});

test('Sidebar navigation order is correct', async ({ page }) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait for React to render navigation
  await page.waitForTimeout(1000);

  // Check desktop navigation order
  const navLinks = page.locator('.site-header__nav a');
  const linkTexts = await navLinks.allTextContents();

  // Expected order: Home, Search, Chat, Watchlist, History
  expect(linkTexts).toEqual(['Home', 'Search', 'Chat', 'Watchlist', 'History']);

  console.log('Navigation order verified:', linkTexts);
});