import { test, expect } from '@playwright/test';

test.describe('Weekly Recipes Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('#app', { state: 'visible' });
  });

  test('should load the main application', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Weekly Recipes/);
    
    // Check main elements are present
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('should display meal planning interface', async ({ page }) => {
    // Check meal planning container
    await expect(page.locator('#meal-plan-container')).toBeVisible();
    
    // Check generate button
    await expect(page.locator('#generate-plan-btn')).toBeVisible();
    
    // Check that button is clickable
    const generateBtn = page.locator('#generate-plan-btn');
    await expect(generateBtn).toBeEnabled();
  });

  test('should generate a meal plan', async ({ page }) => {
    // Click generate plan button
    await page.click('#generate-plan-btn');
    
    // Wait for loading to start
    await expect(page.locator('#loading-meals')).toBeVisible();
    
    // Wait for meal plan to be generated (with timeout)
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Check that meals are displayed
    const mealCards = page.locator('.meal-card');
    await expect(mealCards.first()).toBeVisible();
    
    // Should have meals for multiple days
    const mealCount = await mealCards.count();
    expect(mealCount).toBeGreaterThan(0);
  });

  test('should navigate between tabs', async ({ page }) => {
    // Check tab navigation
    const tabs = page.locator('.nav-tab');
    
    // Should have multiple tabs
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1);
    
    // Click on preferences tab
    await page.click('[data-tab="preferences"]');
    await expect(page.locator('#preferences-form')).toBeVisible();
    
    // Click on calendar tab
    await page.click('[data-tab="calendar"]');
    await expect(page.locator('#calendar-container')).toBeVisible();
    
    // Return to meal planning tab
    await page.click('[data-tab="meal-planning"]');
    await expect(page.locator('#meal-plan-container')).toBeVisible();
  });

  test('should save and load preferences', async ({ page }) => {
    // Navigate to preferences
    await page.click('[data-tab="preferences"]');
    
    // Set dietary preferences
    await page.check('#vegetarian');
    await page.fill('#target-calories', '2200');
    
    // Save preferences
    await page.click('#save-preferences-btn');
    
    // Wait for success message
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Reload page and check preferences are persisted
    await page.reload();
    await page.click('[data-tab="preferences"]');
    
    // Verify preferences are still set
    await expect(page.locator('#vegetarian')).toBeChecked();
    await expect(page.locator('#target-calories')).toHaveValue('2200');
  });

  test('should display calendar view', async ({ page }) => {
    // Navigate to calendar
    await page.click('[data-tab="calendar"]');
    
    // Check calendar elements
    await expect(page.locator('#calendar-container')).toBeVisible();
    await expect(page.locator('.calendar-grid')).toBeVisible();
    
    // Check month navigation
    await expect(page.locator('#prev-month')).toBeVisible();
    await expect(page.locator('#next-month')).toBeVisible();
    await expect(page.locator('#current-month')).toBeVisible();
    
    // Test month navigation
    const currentMonth = await page.textContent('#current-month');
    await page.click('#next-month');
    
    const nextMonth = await page.textContent('#current-month');
    expect(nextMonth).not.toBe(currentMonth);
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile layout is applied
    const sidebar = page.locator('#sidebar');
    const mobileNav = page.locator('#mobile-nav');
    
    // On mobile, sidebar might be hidden and mobile nav visible
    // Or tabs might be in horizontal scroll layout
    const tabContainer = page.locator('.tab-container');
    await expect(tabContainer).toBeVisible();
    
    // Test meal plan generation on mobile
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Verify meal cards are properly sized for mobile
    const mealCard = page.locator('.meal-card').first();
    await expect(mealCard).toBeVisible();
  });
});
