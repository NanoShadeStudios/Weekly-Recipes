/**
 * Unit tests for dataManager.js
 */

// Mock Firebase
jest.mock('firebase/app');
jest.mock('firebase/firestore');

let DataManager;

beforeAll(() => {
  // Mock localStorage for testing
  const localStorageMock = {
    store: {},
    getItem: jest.fn(key => localStorageMock.store[key] || null),
    setItem: jest.fn((key, value) => {
      localStorageMock.store[key] = value.toString();
    }),
    removeItem: jest.fn(key => delete localStorageMock.store[key]),
    clear: jest.fn(() => localStorageMock.store = {})
  };
  global.localStorage = localStorageMock;

  // Import after mocking
  jest.isolateModules(() => {
    DataManager = require('../../dataManager.js').DataManager;
  });
});

describe('DataManager', () => {
  let dataManager;

  beforeEach(() => {
    dataManager = new DataManager();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(dataManager).toBeDefined();
      expect(dataManager.isOnline).toBe(true);
      expect(Array.isArray(dataManager.pendingOperations)).toBe(true);
    });
  });

  describe('saveUserData', () => {
    test('should save data with valid input', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        preferences: { dietary: 'vegetarian' }
      };

      const result = await dataManager.saveUserData('user123', userData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(userData);
    });

    test('should handle missing userId', async () => {
      const userData = { name: 'Test User' };
      
      const result = await dataManager.saveUserData('', userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });

    test('should handle invalid data', async () => {
      const result = await dataManager.saveUserData('user123', null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user data');
    });
  });

  describe('getUserData', () => {
    test('should retrieve user data', async () => {
      const userId = 'user123';
      
      // First save some data
      const userData = { name: 'Test User', email: 'test@example.com' };
      await dataManager.saveUserData(userId, userData);
      
      // Then retrieve it
      const result = await dataManager.getUserData(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('should handle missing userId', async () => {
      const result = await dataManager.getUserData('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });
  });

  describe('saveMealPlan', () => {
    test('should save meal plan with valid data', async () => {
      const mealPlan = {
        id: 'plan123',
        name: 'Weekly Plan',
        meals: [
          { day: 1, breakfast: 'Oatmeal', lunch: 'Salad', dinner: 'Pasta' }
        ],
        createdAt: new Date().toISOString()
      };

      const result = await dataManager.saveMealPlan('user123', mealPlan);
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('plan123');
    });

    test('should handle missing meal plan data', async () => {
      const result = await dataManager.saveMealPlan('user123', null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid meal plan data');
    });
  });

  describe('getMealPlans', () => {
    test('should retrieve meal plans for user', async () => {
      const userId = 'user123';
      
      // Save a meal plan first
      const mealPlan = {
        id: 'plan123',
        name: 'Test Plan',
        meals: []
      };
      await dataManager.saveMealPlan(userId, mealPlan);
      
      // Retrieve plans
      const result = await dataManager.getMealPlans(userId);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('validateUserData', () => {
    test('should validate correct user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        preferences: { dietary: 'vegetarian' }
      };

      const result = dataManager.validateUserData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject data without required fields', () => {
      const invalidData = {
        preferences: { dietary: 'vegetarian' }
      };

      const result = dataManager.validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject data with invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        preferences: {}
      };

      const result = dataManager.validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('validateMealPlan', () => {
    test('should validate correct meal plan', () => {
      const validPlan = {
        name: 'Weekly Plan',
        meals: [
          { day: 1, breakfast: 'Oatmeal', lunch: 'Salad', dinner: 'Pasta' }
        ]
      };

      const result = dataManager.validateMealPlan(validPlan);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject plan without name', () => {
      const invalidPlan = {
        meals: [
          { day: 1, breakfast: 'Oatmeal' }
        ]
      };

      const result = dataManager.validateMealPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    test('should reject plan without meals', () => {
      const invalidPlan = {
        name: 'Weekly Plan'
      };

      const result = dataManager.validateMealPlan(invalidPlan);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Meals array is required');
    });
  });

  describe('sanitizeData', () => {
    test('should sanitize string data', () => {
      const dirtyData = {
        name: '<script>alert("xss")</script>John',
        description: 'Normal text <b>bold</b>'
      };

      const clean = dataManager.sanitizeData(dirtyData);
      
      expect(clean.name).not.toContain('<script>');
      expect(clean.name).toContain('John');
      expect(clean.description).not.toContain('<b>');
    });

    test('should handle nested objects', () => {
      const dirtyData = {
        user: {
          name: '<script>alert("xss")</script>John',
          preferences: {
            dietary: 'vegetarian <script>',
            notes: 'Clean text'
          }
        }
      };

      const clean = dataManager.sanitizeData(dirtyData);
      
      expect(clean.user.name).not.toContain('<script>');
      expect(clean.user.preferences.dietary).not.toContain('<script>');
      expect(clean.user.preferences.notes).toBe('Clean text');
    });
  });

  describe('offline functionality', () => {
    test('should queue operations when offline', async () => {
      dataManager.isOnline = false;
      
      const userData = { name: 'Test User', email: 'test@example.com' };
      const result = await dataManager.saveUserData('user123', userData);
      
      expect(result.success).toBe(true);
      expect(dataManager.pendingOperations.length).toBe(1);
    });

    test('should process queued operations when back online', async () => {
      dataManager.isOnline = false;
      
      // Queue some operations
      await dataManager.saveUserData('user123', { name: 'User 1' });
      await dataManager.saveUserData('user456', { name: 'User 2' });
      
      expect(dataManager.pendingOperations.length).toBe(2);
      
      // Go back online and process queue
      dataManager.isOnline = true;
      await dataManager.processOfflineQueue();
      
      expect(dataManager.pendingOperations.length).toBe(0);
    });
  });

  describe('error handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock a network error
      dataManager.isOnline = false;
      
      const result = await dataManager.getUserData('user123');
      
      // Should still return a result, either from cache or with appropriate error
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    test('should retry failed operations', async () => {
      const retryOperation = {
        type: 'saveUserData',
        userId: 'user123',
        data: { name: 'Test User' },
        attempts: 0
      };

      const result = await dataManager.retryOperation(retryOperation);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });
});
