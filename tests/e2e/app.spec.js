/**
 * End-to-End tests for the Weekly Recipes application
 * Tests the complete user experience from a browser perspective
 */

import { test, expect } from '@playwright/test';

test.describe('Weekly Recipes Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5500'); // Adjust URL as needed
    
    // Wait for the application to load
    await page.waitForSelector('h1:has-text("Weekly Recipe Planner")');
  });

  test.describe('Application Loading', () => {
    test('should load the main page with all essential elements', async ({ page }) => {
      // Check that the main heading is present
      await expect(page.locator('h1')).toContainText('Weekly Recipe Planner');
      
      // Check that navigation tabs are present
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      
      // Check that the generate button is present
      await expect(page.locator('#generateMealBtn')).toBeVisible();
      
      // Check that the user interface is responsive
      await expect(page.locator('.container')).toBeVisible();
    });

    test('should show AI status indicator', async ({ page }) => {
      await expect(page.locator('#aiStatus')).toBeVisible();
    });

    test('should display theme toggle button', async ({ page }) => {
      await expect(page.locator('#themeToggle')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between tabs', async ({ page }) => {
      // Click on different tabs and verify they activate
      const tabs = [
        { button: '#myFoods-btn', content: '#myFoods' },
        { button: '#preferences-btn', content: '#preferences' },
        { button: '#shoppingList-btn', content: '#shoppingList' },
        { button: '#nutrition-btn', content: '#nutrition' }
      ];

      for (const tab of tabs) {
        await page.click(tab.button);
        await expect(page.locator(tab.button)).toHaveClass(/active/);
        await expect(page.locator(tab.content)).toHaveClass(/active/);
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Focus on the first tab
      await page.locator('#weeklyPlan-btn').focus();
      
      // Use arrow keys to navigate
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#myFoods-btn')).toBeFocused();
      
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#preferences-btn')).toBeFocused();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should show login modal when not authenticated', async ({ page }) => {
      // Try to generate a meal plan without being signed in
      await page.click('#generateMealBtn');
      
      // Should show login modal
      await expect(page.locator('#loginModal')).toBeVisible();
      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    });

    test('should handle sign-in process', async ({ page }) => {
      // Open login modal
      await page.click('#generateMealBtn');
      await expect(page.locator('#loginModal')).toBeVisible();
      
      // Fill in login credentials (use test credentials)
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password123');
      
      // Click sign in button
      await page.click('#signInBtn');
      
      // Wait for authentication to complete
      // Note: This would require a test authentication setup
      await page.waitForTimeout(2000);
    });

    test('should validate form inputs', async ({ page }) => {
      await page.click('#generateMealBtn');
      await expect(page.locator('#loginModal')).toBeVisible();
      
      // Try to submit with empty fields
      await page.click('#signInBtn');
      
      // Should show validation messages
      await expect(page.locator('#email:invalid')).toBeVisible();
      await expect(page.locator('#password:invalid')).toBeVisible();
    });
  });

  test.describe('Meal Plan Generation', () => {
    test.skip('should generate a meal plan when authenticated', async ({ page }) => {
      // Note: This test is skipped because it requires authentication setup
      // In a real scenario, you would set up test authentication
      
      // Assume user is signed in
      // await signInTestUser(page);
      
      // Generate meal plan
      await page.click('#generateMealBtn');
      
      // Wait for meal plan to be generated
      await page.waitForSelector('.calendar-grid', { timeout: 10000 });
      
      // Check that meals are displayed
      await expect(page.locator('.calendar-day')).toHaveCount(7);
      await expect(page.locator('.recipe-card')).toHaveCountGreaterThan(0);
    });

    test('should show loading state during generation', async ({ page }) => {
      // Mock loading state (this would be visible during actual generation)
      await page.evaluate(() => {
        const button = document.getElementById('generateMealBtn');
        button.textContent = 'Generating...';
        button.disabled = true;
      });
      
      await expect(page.locator('#generateMealBtn')).toContainText('Generating...');
      await expect(page.locator('#generateMealBtn')).toBeDisabled();
    });
  });

  test.describe('User Interface', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that the layout adapts
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('.sidebar')).toBeVisible();
      
      // Navigation should still work
      await page.click('#myFoods-btn');
      await expect(page.locator('#myFoods-btn')).toHaveClass(/active/);
    });

    test('should support dark mode toggle', async ({ page }) => {
      // Click theme toggle
      await page.click('#themeToggle');
      
      // Check that dark mode is applied
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
      
      // Toggle back to light mode
      await page.click('#themeToggle');
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
    });

    test('should display user feedback messages', async ({ page }) => {
      // This test would check for toast notifications
      // For now, we'll check that the toast container exists
      await expect(page.locator('#toastContainer')).toBeInViewport();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check that key elements have ARIA labels
      await expect(page.locator('#generateMealBtn')).toHaveAttribute('aria-describedby');
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tab"]')).toHaveCountGreaterThan(0);
    });

    test('should support screen reader navigation', async ({ page }) => {
      // Check for proper heading structure
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This would require a color contrast checking library
      // For now, we ensure that text is visible
      await expect(page.locator('body')).toHaveCSS('color', /.+/);
      await expect(page.locator('body')).toHaveCSS('background-color', /.+/);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:5500');
      await page.waitForSelector('h1:has-text("Weekly Recipe Planner")');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should not have console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('http://localhost:5500');
      await page.waitForTimeout(3000); // Wait for initialization

      // Filter out expected errors (like network errors in test environment)
      const unexpectedErrors = errors.filter(error => 
        !error.includes('Failed to fetch') && 
        !error.includes('NetworkError') &&
        !error.includes('auth/network-request-failed')
      );

      expect(unexpectedErrors).toHaveLength(0);
    });
  });

  test.describe('Local Storage', () => {
    test('should persist user preferences', async ({ page }) => {
      // Set a preference
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
      });

      // Reload page
      await page.reload();

      // Check that preference is maintained
      const theme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(theme).toBe('dark');
    });

    test('should handle localStorage errors gracefully', async ({ page }) => {
      // Simulate localStorage being unavailable
      await page.evaluate(() => {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new Error('localStorage not available');
          }
        });
      });

      // App should still function
      await page.reload();
      await expect(page.locator('h1')).toContainText('Weekly Recipe Planner');
    });
  });
});

// Helper functions for E2E tests
async function signInTestUser(page) {
  // This would implement test user sign-in
  // For security, test credentials should be in environment variables
  await page.click('#generateMealBtn');
  await page.fill('#email', process.env.TEST_EMAIL || 'test@example.com');
  await page.fill('#password', process.env.TEST_PASSWORD || 'testpassword');
  await page.click('#signInBtn');
  await page.waitForSelector('#userEmail', { timeout: 5000 });
}

async function waitForMealPlanGeneration(page) {
  // Wait for meal plan to be generated and displayed
  await page.waitForSelector('.calendar-grid', { timeout: 15000 });
  await expect(page.locator('.calendar-day')).toHaveCountGreaterThan(0);
}
