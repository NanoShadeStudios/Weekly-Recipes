import { test, expect } from '@playwright/test';

test.describe('Advanced User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#app', { state: 'visible' });
  });

  test('complete meal planning workflow', async ({ page }) => {
    // Step 1: Set preferences
    await page.click('[data-tab="preferences"]');
    
    // Set dietary restrictions
    await page.check('#vegetarian');
    await page.check('#gluten-free');
    
    // Set nutrition goals
    await page.fill('#target-calories', '1800');
    await page.selectOption('#cooking-difficulty', 'intermediate');
    
    // Save preferences
    await page.click('#save-preferences-btn');
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Step 2: Generate meal plan
    await page.click('[data-tab="meal-planning"]');
    await page.click('#generate-plan-btn');
    
    // Wait for generation
    await page.waitForSelector('.meal-card', { timeout: 15000 });
    
    // Step 3: Verify meals respect preferences
    const mealCards = page.locator('.meal-card');
    const firstMeal = mealCards.first();
    
    // Click on first meal to view details
    await firstMeal.click();
    
    // Check meal details modal
    await expect(page.locator('.meal-details-modal')).toBeVisible();
    
    // Verify dietary tags
    const dietaryTags = page.locator('.dietary-tag');
    await expect(dietaryTags).toContainText(['Vegetarian', 'Gluten-Free']);
    
    // Close modal
    await page.click('.modal-close');
    
    // Step 4: Rate a meal
    await page.hover('.meal-card:first-child');
    await page.click('.rating-star:nth-child(4)'); // 4-star rating
    
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Step 5: Add to calendar
    await page.click('.add-to-calendar-btn:first-child');
    
    // Select date in calendar picker
    await page.click('.calendar-date[data-date="2024-01-15"]');
    await page.click('#confirm-calendar-add');
    
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Step 6: Verify in calendar view
    await page.click('[data-tab="calendar"]');
    
    // Navigate to correct month if needed
    const calendarDay = page.locator('[data-date="2024-01-15"]');
    await expect(calendarDay.locator('.meal-indicator')).toBeVisible();
  });

  test('meal search and filtering workflow', async ({ page }) => {
    // Generate initial meal plan
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('#meal-search');
    await searchInput.fill('pasta');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const visibleMeals = page.locator('.meal-card:visible');
    const mealTitles = await visibleMeals.allTextContents();
    
    // At least one meal should contain "pasta"
    const hasMatchingMeal = mealTitles.some(title => 
      title.toLowerCase().includes('pasta')
    );
    expect(hasMatchingMeal).toBe(true);
    
    // Clear search
    await searchInput.clear();
    
    // Test cuisine filter
    await page.selectOption('#cuisine-filter', 'Italian');
    await page.waitForTimeout(500);
    
    // Verify Italian meals are shown
    const italianMeals = page.locator('.meal-card:visible');
    await expect(italianMeals.first()).toBeVisible();
    
    // Test meal type filter
    await page.selectOption('#meal-type-filter', 'dinner');
    await page.waitForTimeout(500);
    
    // Verify only dinner meals are shown
    const dinnerMeals = page.locator('.meal-card:visible');
    const dinnerCount = await dinnerMeals.count();
    expect(dinnerCount).toBeGreaterThan(0);
  });

  test('shopping list generation workflow', async ({ page }) => {
    // Generate meal plan first
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Select multiple meals for shopping list
    await page.click('.meal-card:nth-child(1) .select-meal-checkbox');
    await page.click('.meal-card:nth-child(3) .select-meal-checkbox');
    await page.click('.meal-card:nth-child(5) .select-meal-checkbox');
    
    // Generate shopping list
    await page.click('#generate-shopping-list-btn');
    
    // Wait for shopping list modal
    await expect(page.locator('.shopping-list-modal')).toBeVisible();
    
    // Verify ingredients are listed
    const ingredients = page.locator('.ingredient-item');
    const ingredientCount = await ingredients.count();
    expect(ingredientCount).toBeGreaterThan(0);
    
    // Test ingredient grouping
    await expect(page.locator('.ingredient-category')).toContainText([
      'Produce', 'Dairy', 'Meat', 'Pantry'
    ]);
    
    // Test quantity adjustment
    const firstIngredient = ingredients.first();
    await firstIngredient.locator('.quantity-input').fill('2');
    
    // Check/uncheck items
    await firstIngredient.locator('.ingredient-checkbox').check();
    
    // Export shopping list
    await page.click('#export-shopping-list');
    
    // Verify download or copy functionality
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Close modal
    await page.click('.shopping-list-modal .modal-close');
  });

  test('meal sharing and community workflow', async ({ page }) => {
    // Navigate to community tab
    await page.click('[data-tab="community"]');
    
    // Browse community meal plans
    await expect(page.locator('.community-plan')).toBeVisible();
    
    // Test search in community
    await page.fill('#community-search', 'Mediterranean');
    await page.waitForTimeout(500);
    
    // View a community plan
    await page.click('.community-plan:first-child .view-plan-btn');
    
    // Verify plan details
    await expect(page.locator('.plan-details-modal')).toBeVisible();
    await expect(page.locator('.plan-rating')).toBeVisible();
    await expect(page.locator('.plan-meals')).toBeVisible();
    
    // Clone the plan
    await page.click('#clone-plan-btn');
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Close modal
    await page.click('.plan-details-modal .modal-close');
    
    // Go back to meal planning to see cloned plan
    await page.click('[data-tab="meal-planning"]');
    
    // Should see the cloned plan in recent plans
    await expect(page.locator('.recent-plans')).toContainText('Mediterranean');
    
    // Test sharing own plan
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Open share modal
    await page.click('#share-plan-btn');
    await expect(page.locator('.share-plan-modal')).toBeVisible();
    
    // Fill share details
    await page.fill('#plan-name', 'My Custom Meal Plan');
    await page.fill('#plan-description', 'A great weekly meal plan for busy professionals');
    await page.selectOption('#plan-category', 'Quick & Easy');
    
    // Add tags
    await page.click('#add-tag-btn');
    await page.fill('.tag-input:last-child', 'healthy');
    
    // Share plan
    await page.click('#confirm-share-btn');
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('nutrition analysis workflow', async ({ page }) => {
    // Generate meal plan
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // View nutrition analysis
    await page.click('#view-nutrition-btn');
    
    // Verify nutrition modal
    await expect(page.locator('.nutrition-analysis-modal')).toBeVisible();
    
    // Check daily breakdown
    await expect(page.locator('.daily-nutrition')).toBeVisible();
    await expect(page.locator('.nutrition-chart')).toBeVisible();
    
    // Test different view modes
    await page.click('#weekly-view-btn');
    await expect(page.locator('.weekly-nutrition')).toBeVisible();
    
    await page.click('#macro-breakdown-btn');
    await expect(page.locator('.macro-chart')).toBeVisible();
    
    // Test nutrition goals comparison
    await expect(page.locator('.goal-comparison')).toBeVisible();
    
    // Verify goal indicators
    const goalIndicators = page.locator('.goal-indicator');
    await expect(goalIndicators).toHaveCount(4); // Calories, Protein, Carbs, Fat
    
    // Test export nutrition data
    await page.click('#export-nutrition-btn');
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Close modal
    await page.click('.nutrition-analysis-modal .modal-close');
  });

  test('offline functionality workflow', async ({ page }) => {
    // Generate initial meal plan while online
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Set preferences
    await page.click('[data-tab="preferences"]');
    await page.check('#vegetarian');
    await page.click('#save-preferences-btn');
    
    // Simulate going offline
    await page.context().setOffline(true);
    
    // Try to generate new meal plan (should use offline fallback)
    await page.click('[data-tab="meal-planning"]');
    await page.click('#generate-plan-btn');
    
    // Should show offline indicator
    await expect(page.locator('.offline-indicator')).toBeVisible();
    
    // Should still generate plan using cached data
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Test offline preferences change
    await page.click('[data-tab="preferences"]');
    await page.uncheck('#vegetarian');
    await page.click('#save-preferences-btn');
    
    // Should show queued message
    await expect(page.locator('.toast-info')).toContainText('queued');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should sync queued changes
    await page.waitForSelector('.online-indicator', { timeout: 5000 });
    await expect(page.locator('.toast-success')).toContainText('synced');
  });

  test('accessibility navigation workflow', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Navigate to meal planning tab using keyboard
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    
    // Test skip links
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    
    // Test meal card keyboard interaction
    await page.click('#generate-plan-btn');
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Focus on first meal card
    await page.locator('.meal-card:first-child').focus();
    await page.keyboard.press('Enter');
    
    // Should open meal details
    await expect(page.locator('.meal-details-modal')).toBeVisible();
    
    // Test modal keyboard navigation
    await page.keyboard.press('Escape');
    await expect(page.locator('.meal-details-modal')).not.toBeVisible();
    
    // Test screen reader announcements
    await page.click('#generate-plan-btn');
    
    // Should have aria-live regions for announcements
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    await expect(page.locator('[aria-live="assertive"]')).toBeVisible();
  });
});
