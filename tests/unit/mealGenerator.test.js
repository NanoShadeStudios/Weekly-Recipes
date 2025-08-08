/**
 * Unit tests for mealGenerator.js
 */

// Mock dependencies
const mockFoodData = {
  cuisines: ['Italian', 'Asian', 'Mexican'],
  mealTypes: ['breakfast', 'lunch', 'dinner'],
  ingredients: ['chicken', 'rice', 'vegetables'],
  getMealsByType: jest.fn(() => [
    { id: 1, name: 'Test Meal', type: 'dinner', cuisine: 'Italian' },
    { id: 2, name: 'Another Meal', type: 'lunch', cuisine: 'Asian' }
  ])
};

const mockPreferences = {
  dietary: { vegetarian: false, vegan: false },
  nutrition: { calories: 2000 },
  cooking: { difficulty: 'medium' }
};

// Import the module to test
let MealGenerator;
let EnhancedMealPlanner;

beforeAll(() => {
  // Mock global dependencies
  global.foodData = mockFoodData;
  global.userPreferences = mockPreferences;
  
  // Import modules after mocking globals
  jest.isolateModules(() => {
    MealGenerator = require('../../mealGenerator.js').MealGenerator;
    EnhancedMealPlanner = require('../../mealGenerator.js').EnhancedMealPlanner;
  });
});

describe('MealGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new MealGenerator();
    mockFoodData.getMealsByType.mockClear();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(generator).toBeDefined();
      expect(generator.preferences).toEqual({});
      expect(generator.generatedMeals).toEqual([]);
    });
  });

  describe('setPreferences', () => {
    test('should update preferences', () => {
      const newPrefs = { dietary: { vegetarian: true } };
      generator.setPreferences(newPrefs);
      expect(generator.preferences).toEqual(newPrefs);
    });

    test('should handle null preferences', () => {
      generator.setPreferences(null);
      expect(generator.preferences).toEqual({});
    });
  });

  describe('generateMealPlan', () => {
    test('should generate meals for specified days', async () => {
      const days = 3;
      const plan = await generator.generateMealPlan(days);
      
      expect(plan).toBeDefined();
      expect(Array.isArray(plan)).toBe(true);
      expect(plan.length).toBe(days);
    });

    test('should handle invalid day count', async () => {
      const plan = await generator.generateMealPlan(0);
      expect(plan).toEqual([]);
    });

    test('should handle negative day count', async () => {
      const plan = await generator.generateMealPlan(-1);
      expect(plan).toEqual([]);
    });
  });

  describe('generateDayMeals', () => {
    test('should generate meals for all meal types', () => {
      const dayMeals = generator.generateDayMeals(1);
      
      expect(dayMeals).toBeDefined();
      expect(dayMeals.day).toBe(1);
      expect(dayMeals.meals).toBeDefined();
      expect(Object.keys(dayMeals.meals)).toContain('breakfast');
      expect(Object.keys(dayMeals.meals)).toContain('lunch');
      expect(Object.keys(dayMeals.meals)).toContain('dinner');
    });
  });

  describe('getRandomMeal', () => {
    test('should return a meal object', () => {
      const mealType = 'dinner';
      const meal = generator.getRandomMeal(mealType);
      
      expect(meal).toBeDefined();
      expect(meal.name).toBeDefined();
      expect(meal.type).toBeDefined();
    });

    test('should respect dietary preferences', () => {
      generator.setPreferences({ dietary: { vegetarian: true } });
      const meal = generator.getRandomMeal('dinner');
      
      // Should not return meat-based meals
      expect(meal.name).not.toMatch(/chicken|beef|pork/i);
    });
  });

  describe('calculateNutrition', () => {
    test('should return nutrition object', () => {
      const meal = { name: 'Test Meal', type: 'dinner' };
      const nutrition = generator.calculateNutrition(meal);
      
      expect(nutrition).toBeDefined();
      expect(nutrition.calories).toBeDefined();
      expect(nutrition.protein).toBeDefined();
      expect(nutrition.carbs).toBeDefined();
      expect(nutrition.fat).toBeDefined();
      expect(typeof nutrition.calories).toBe('number');
    });

    test('should return default values for unknown meals', () => {
      const meal = { name: 'Unknown Meal', type: 'dinner' };
      const nutrition = generator.calculateNutrition(meal);
      
      expect(nutrition.calories).toBeGreaterThan(0);
      expect(nutrition.protein).toBeGreaterThan(0);
      expect(nutrition.carbs).toBeGreaterThan(0);
      expect(nutrition.fat).toBeGreaterThan(0);
    });
  });
});

describe('EnhancedMealPlanner', () => {
  let planner;

  beforeEach(() => {
    planner = new EnhancedMealPlanner();
  });

  describe('constructor', () => {
    test('should initialize with empty meal history', () => {
      expect(planner.recentMeals).toEqual([]);
      expect(planner.mealVariety).toEqual({});
    });
  });

  describe('generateWeeklyPlan', () => {
    test('should generate 7 days of meals', async () => {
      const plan = await planner.generateWeeklyPlan();
      
      expect(plan).toBeDefined();
      expect(Array.isArray(plan)).toBe(true);
      expect(plan.length).toBe(7);
      
      // Each day should have all meal types
      plan.forEach(day => {
        expect(day.meals.breakfast).toBeDefined();
        expect(day.meals.lunch).toBeDefined();
        expect(day.meals.dinner).toBeDefined();
      });
    });
  });

  describe('ensureMealVariety', () => {
    test('should track meal variety', () => {
      const meals = [
        { name: 'Pasta', cuisine: 'Italian' },
        { name: 'Sushi', cuisine: 'Japanese' },
        { name: 'Pizza', cuisine: 'Italian' }
      ];
      
      planner.ensureMealVariety(meals);
      
      expect(planner.mealVariety.Italian).toBe(2);
      expect(planner.mealVariety.Japanese).toBe(1);
    });
  });

  describe('avoidRecentMeals', () => {
    test('should filter out recently used meals', () => {
      const availableMeals = [
        { id: 1, name: 'Meal 1' },
        { id: 2, name: 'Meal 2' },
        { id: 3, name: 'Meal 3' }
      ];
      
      planner.recentMeals = [1, 2]; // Recently used meal IDs
      
      const filtered = planner.avoidRecentMeals(availableMeals);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(3);
    });

    test('should return all meals if none are recent', () => {
      const availableMeals = [
        { id: 1, name: 'Meal 1' },
        { id: 2, name: 'Meal 2' }
      ];
      
      planner.recentMeals = [];
      
      const filtered = planner.avoidRecentMeals(availableMeals);
      
      expect(filtered.length).toBe(2);
    });
  });

  describe('balanceNutrition', () => {
    test('should return nutrition balance object', () => {
      const meals = [
        { name: 'High Protein Meal', type: 'breakfast' },
        { name: 'Balanced Meal', type: 'lunch' },
        { name: 'Light Meal', type: 'dinner' }
      ];
      
      const balance = planner.balanceNutrition(meals);
      
      expect(balance).toBeDefined();
      expect(balance.totalCalories).toBeDefined();
      expect(balance.totalProtein).toBeDefined();
      expect(balance.totalCarbs).toBeDefined();
      expect(balance.totalFat).toBeDefined();
      expect(typeof balance.totalCalories).toBe('number');
    });
  });
});
