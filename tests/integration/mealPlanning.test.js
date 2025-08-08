/**
 * Integration tests for meal planning workflow
 */

// Mock Firebase and other dependencies
jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('firebase/auth');

let MealGenerator, DataManager, UIManager;

beforeAll(() => {
  // Setup DOM elements for integration tests
  document.body.innerHTML = `
    <div id="app">
      <div id="meal-plan-container">
        <div id="meal-grid"></div>
        <button id="generate-plan-btn">Generate Plan</button>
        <div id="loading-meals" style="display: none;"></div>
      </div>
      <div id="preferences-form">
        <select id="dietary-restrictions"></select>
        <input id="target-calories" type="number" value="2000">
        <button id="save-preferences-btn">Save Preferences</button>
      </div>
      <div id="toast-container"></div>
    </div>
  `;

  // Mock modules
  jest.isolateModules(() => {
    MealGenerator = require('../../mealGenerator.js').MealGenerator;
    DataManager = require('../../dataManager.js').DataManager;
    UIManager = require('../../uiManager.js').UIManager;
  });
});

describe('Meal Planning Integration', () => {
  let mealGenerator, dataManager, uiManager;

  beforeEach(() => {
    mealGenerator = new MealGenerator();
    dataManager = new DataManager();
    uiManager = new UIManager();
    
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('End-to-End Meal Planning Flow', () => {
    test('should complete full meal planning workflow', async () => {
      // Step 1: User sets preferences
      const preferences = {
        dietary: { vegetarian: true, glutenFree: false },
        nutrition: { targetCalories: 2000 },
        cooking: { difficulty: 'medium', maxPrepTime: 45 }
      };

      // Save preferences through data manager
      const saveResult = await dataManager.saveUserData('test-user', {
        preferences: preferences
      });
      expect(saveResult.success).toBe(true);

      // Step 2: Update meal generator with preferences
      mealGenerator.setPreferences(preferences);
      expect(mealGenerator.preferences).toEqual(preferences);

      // Step 3: Generate meal plan
      const mealPlan = await mealGenerator.generateMealPlan(7);
      expect(mealPlan).toBeDefined();
      expect(mealPlan.length).toBe(7);

      // Step 4: Validate generated meals respect preferences
      mealPlan.forEach(day => {
        Object.values(day.meals).forEach(meal => {
          // Should not contain meat if vegetarian
          if (preferences.dietary.vegetarian) {
            expect(meal.name.toLowerCase()).not.toMatch(/chicken|beef|pork|fish/);
          }
        });
      });

      // Step 5: Save meal plan
      const planData = {
        id: 'test-plan-' + Date.now(),
        name: 'Weekly Meal Plan',
        meals: mealPlan,
        preferences: preferences,
        createdAt: new Date().toISOString()
      };

      const savePlanResult = await dataManager.saveMealPlan('test-user', planData);
      expect(savePlanResult.success).toBe(true);

      // Step 6: Retrieve saved plan
      const retrievedPlans = await dataManager.getMealPlans('test-user');
      expect(retrievedPlans.success).toBe(true);
      expect(retrievedPlans.data.length).toBeGreaterThan(0);
    });

    test('should handle user preference changes', async () => {
      // Initial preferences
      const initialPrefs = {
        dietary: { vegetarian: false },
        nutrition: { targetCalories: 2000 }
      };

      // Updated preferences
      const updatedPrefs = {
        dietary: { vegetarian: true, vegan: true },
        nutrition: { targetCalories: 1800 }
      };

      // Generate plan with initial preferences
      mealGenerator.setPreferences(initialPrefs);
      const initialPlan = await mealGenerator.generateMealPlan(3);

      // Update preferences and generate new plan
      mealGenerator.setPreferences(updatedPrefs);
      const updatedPlan = await mealGenerator.generateMealPlan(3);

      // Plans should be different and respect new preferences
      expect(initialPlan).not.toEqual(updatedPlan);
      
      // Updated plan should respect vegan preferences
      updatedPlan.forEach(day => {
        Object.values(day.meals).forEach(meal => {
          expect(meal.name.toLowerCase()).not.toMatch(/meat|chicken|beef|cheese|milk/);
        });
      });
    });
  });

  describe('Data Persistence Integration', () => {
    test('should maintain data consistency across sessions', async () => {
      const userId = 'persistent-user';
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        preferences: {
          dietary: { vegetarian: true },
          nutrition: { targetCalories: 2200 }
        }
      };

      // Save user data
      await dataManager.saveUserData(userId, userData);

      // Simulate session restart by creating new data manager
      const newDataManager = new DataManager();
      
      // Retrieve data with new manager
      const retrievedData = await newDataManager.getUserData(userId);
      
      expect(retrievedData.success).toBe(true);
      expect(retrievedData.data.preferences).toEqual(userData.preferences);
    });

    test('should handle offline-to-online synchronization', async () => {
      const userId = 'sync-user';
      
      // Simulate offline mode
      dataManager.isOnline = false;
      
      // Queue operations while offline
      await dataManager.saveUserData(userId, { name: 'Offline User' });
      expect(dataManager.pendingOperations.length).toBe(1);
      
      // Go back online
      dataManager.isOnline = true;
      
      // Process offline queue
      await dataManager.processOfflineQueue();
      
      // Queue should be empty after processing
      expect(dataManager.pendingOperations.length).toBe(0);
    });
  });

  describe('UI Integration', () => {
    test('should update UI when meal plan is generated', async () => {
      const mealPlan = await mealGenerator.generateMealPlan(7);
      
      // Simulate UI update
      const mealGrid = document.getElementById('meal-grid');
      
      // UI manager should populate the grid
      uiManager.displayMealPlan(mealPlan);
      
      // Check that meals are displayed in the UI
      const mealElements = mealGrid.querySelectorAll('.meal-card');
      expect(mealElements.length).toBeGreaterThan(0);
    });

    test('should show loading states during plan generation', async () => {
      const loadingElement = document.getElementById('loading-meals');
      const generateButton = document.getElementById('generate-plan-btn');
      
      // Should show loading state
      uiManager.setLoadingState('meals', true);
      expect(loadingElement.style.display).not.toBe('none');
      expect(generateButton.disabled).toBe(true);
      
      // Generate plan
      await mealGenerator.generateMealPlan(7);
      
      // Should hide loading state
      uiManager.setLoadingState('meals', false);
      expect(loadingElement.style.display).toBe('none');
      expect(generateButton.disabled).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle and recover from generation errors', async () => {
      // Mock a failure in meal generation
      const originalMethod = mealGenerator.generateDayMeals;
      mealGenerator.generateDayMeals = jest.fn(() => {
        throw new Error('Mock generation error');
      });

      // Should handle error gracefully
      const result = await mealGenerator.generateMealPlan(3);
      
      // Should return fallback plan or empty array
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Restore original method
      mealGenerator.generateDayMeals = originalMethod;
    });

    test('should handle data save failures with offline fallback', async () => {
      // Mock network failure
      dataManager.isOnline = false;
      
      const result = await dataManager.saveUserData('test-user', {
        name: 'Test User'
      });
      
      // Should still succeed by queuing for later
      expect(result.success).toBe(true);
      expect(dataManager.pendingOperations.length).toBe(1);
    });
  });

  describe('Performance Integration', () => {
    test('should generate meal plan within reasonable time', async () => {
      const startTime = performance.now();
      
      await mealGenerator.generateMealPlan(7);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    test('should handle large meal plans efficiently', async () => {
      const startTime = performance.now();
      
      // Generate plan for a month
      await mealGenerator.generateMealPlan(30);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should still complete within reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical user workflow', async () => {
      const userId = 'real-user';
      
      // 1. User signs up and sets initial preferences
      const initialData = {
        name: 'New User',
        email: 'newuser@example.com',
        preferences: {
          dietary: { vegetarian: false },
          nutrition: { targetCalories: 2000 },
          cooking: { difficulty: 'beginner' }
        }
      };
      
      await dataManager.saveUserData(userId, initialData);
      
      // 2. Generate first meal plan
      mealGenerator.setPreferences(initialData.preferences);
      const firstPlan = await mealGenerator.generateMealPlan(7);
      
      await dataManager.saveMealPlan(userId, {
        id: 'plan-1',
        name: 'My First Plan',
        meals: firstPlan
      });
      
      // 3. User updates preferences after trying some meals
      const updatedPrefs = {
        ...initialData.preferences,
        dietary: { vegetarian: true },
        cooking: { difficulty: 'intermediate' }
      };
      
      await dataManager.saveUserData(userId, {
        ...initialData,
        preferences: updatedPrefs
      });
      
      // 4. Generate updated meal plan
      mealGenerator.setPreferences(updatedPrefs);
      const updatedPlan = await mealGenerator.generateMealPlan(7);
      
      await dataManager.saveMealPlan(userId, {
        id: 'plan-2',
        name: 'Updated Plan',
        meals: updatedPlan
      });
      
      // 5. Verify user has both plans
      const allPlans = await dataManager.getMealPlans(userId);
      expect(allPlans.success).toBe(true);
      expect(allPlans.data.length).toBe(2);
      
      // 6. Verify updated plan respects new preferences
      updatedPlan.forEach(day => {
        Object.values(day.meals).forEach(meal => {
          expect(meal.name.toLowerCase()).not.toMatch(/chicken|beef|pork/);
        });
      });
    });
  });
});
