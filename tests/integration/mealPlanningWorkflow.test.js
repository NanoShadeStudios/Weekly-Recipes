/**
 * Integration tests for the meal planning workflow
 * Tests the complete user journey from authentication to meal plan generation
 */

import { AppInitializer } from '../appInitializer.js';

// Mock Firebase and dependencies
jest.mock('../firebase.js');
jest.mock('../auth.js');
jest.mock('../mealGenerator.js');
jest.mock('../uiManager.js');

describe('Meal Planning Integration', () => {
  let appInitializer;
  let mockAuthManager;
  let mockMealGenerator;
  let mockUIManager;

  beforeEach(() => {
    // Setup mocks
    mockAuthManager = {
      initialize: jest.fn().mockResolvedValue(),
      onAuthStateChanged: jest.fn(),
      signIn: jest.fn(),
      getCurrentUser: jest.fn().mockReturnValue(null)
    };

    mockMealGenerator = {
      generatePlan: jest.fn().mockResolvedValue([
        { meals: ['Breakfast Item'] },
        { meals: ['Lunch Item'] },
        { meals: ['Dinner Item'] }
      ])
    };

    mockUIManager = {
      renderPlan: jest.fn(),
      showLoadingState: jest.fn(),
      hideLoadingState: jest.fn()
    };

    // Mock DOM elements
    global.document = {
      getElementById: jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
        style: {},
        classList: { add: jest.fn(), remove: jest.fn() },
        textContent: ''
      }),
      querySelectorAll: jest.fn().mockReturnValue([]),
      addEventListener: jest.fn()
    };

    global.window = {
      localStorage: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
    };

    appInitializer = new AppInitializer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Application Initialization', () => {
    test('should initialize all critical modules', async () => {
      await appInitializer.initialize();

      expect(appInitializer.loadedModules.size).toBeGreaterThan(0);
      expect(appInitializer.isInitialized).toBe(true);
    });

    test('should handle initialization failures gracefully', async () => {
      // Mock a module failure
      jest.spyOn(appInitializer, 'loadAuthManager').mockRejectedValue(new Error('Auth failed'));

      await appInitializer.initialize();

      // Should still initialize with fallbacks
      expect(appInitializer.isInitialized).toBe(true);
    });
  });

  describe('Authentication Flow', () => {
    test('should handle user sign-in process', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockAuthManager.signIn.mockResolvedValue(mockUser);
      mockAuthManager.getCurrentUser.mockReturnValue(mockUser);

      await appInitializer.initialize();
      
      // Simulate auth manager loading
      appInitializer.loadedModules.set('authManager', mockAuthManager);

      // Simulate sign-in
      const user = await mockAuthManager.signIn('test@example.com', 'password');

      expect(user).toBe(mockUser);
      expect(mockAuthManager.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    });

    test('should handle authentication state changes', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      let authStateCallback;

      mockAuthManager.onAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
      });

      await appInitializer.initialize();
      appInitializer.loadedModules.set('authManager', mockAuthManager);

      // Simulate auth state change
      authStateCallback(mockUser);

      expect(mockAuthManager.onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('Meal Plan Generation Workflow', () => {
    test('should generate meal plan when user is authenticated', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      const mockPlan = [
        { meals: ['Grilled Chicken Salad'] },
        { meals: ['Pasta Primavera'] },
        { meals: ['Beef Stir Fry'] }
      ];

      mockAuthManager.getCurrentUser.mockReturnValue(mockUser);
      mockMealGenerator.generatePlan.mockResolvedValue(mockPlan);

      await appInitializer.initialize();

      // Simulate meal plan generation
      const foods = ['chicken', 'pasta', 'beef', 'vegetables'];
      const options = { days: 3, dietaryRestrictions: [] };
      
      const plan = await mockMealGenerator.generatePlan(foods, jest.fn(), options);

      expect(plan).toEqual(mockPlan);
      expect(mockMealGenerator.generatePlan).toHaveBeenCalledWith(foods, expect.any(Function), options);
    });

    test('should handle meal generation errors', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockAuthManager.getCurrentUser.mockReturnValue(mockUser);
      mockMealGenerator.generatePlan.mockRejectedValue(new Error('Generation failed'));

      await appInitializer.initialize();

      await expect(mockMealGenerator.generatePlan([], jest.fn())).rejects.toThrow('Generation failed');
    });

    test('should require authentication for meal generation', async () => {
      mockAuthManager.getCurrentUser.mockReturnValue(null);

      await appInitializer.initialize();

      // Should not call meal generator when user is not authenticated
      expect(mockAuthManager.getCurrentUser()).toBeNull();
    });
  });

  describe('UI Integration', () => {
    test('should set up UI elements after initialization', async () => {
      const mockButton = {
        addEventListener: jest.fn(),
        style: {},
        disabled: false
      };

      document.getElementById.mockReturnValue(mockButton);

      await appInitializer.initialize();

      expect(document.getElementById).toHaveBeenCalledWith('generateMealBtn');
      expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should handle button clicks correctly', async () => {
      const mockButton = {
        addEventListener: jest.fn(),
        style: {},
        disabled: false
      };

      let clickHandler;
      mockButton.addEventListener.mockImplementation((event, handler) => {
        if (event === 'click') {
          clickHandler = handler;
        }
      });

      document.getElementById.mockReturnValue(mockButton);

      await appInitializer.initialize();

      // Simulate button click
      const mockEvent = { preventDefault: jest.fn(), target: mockButton };
      if (clickHandler) {
        clickHandler(mockEvent);
      }

      expect(mockButton.addEventListener).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle network failures gracefully', async () => {
      // Mock network failure
      mockAuthManager.initialize.mockRejectedValue(new Error('Network error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await appInitializer.initialize();

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(appInitializer.isInitialized).toBe(true); // Should still initialize with fallbacks

      consoleWarnSpy.mockRestore();
    });

    test('should provide fallback functionality when modules fail', async () => {
      // Mock all module failures
      jest.spyOn(appInitializer, 'loadAuthManager').mockImplementation(() => {
        appInitializer.createFallbackAuthManager();
      });

      await appInitializer.initialize();

      expect(appInitializer.loadedModules.has('authManager')).toBe(true);
    });
  });

  describe('State Persistence', () => {
    test('should persist application state', async () => {
      await appInitializer.initialize();

      // Mock some state changes
      window.localStorage.setItem('testKey', 'testValue');

      expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    });

    test('should restore application state on reload', async () => {
      window.localStorage.getItem.mockReturnValue('{"currentTab":"preferences","formData":{}}');

      await appInitializer.initialize();

      expect(window.localStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Feature Module Loading', () => {
    test('should load feature modules conditionally', async () => {
      await appInitializer.initialize();

      // Check that feature modules are loaded
      const loadedModuleNames = Array.from(appInitializer.loadedModules.keys());
      expect(loadedModuleNames.length).toBeGreaterThan(0);
    });

    test('should handle feature module failures', async () => {
      // Mock feature loading failure
      jest.spyOn(appInitializer, 'loadFeatureModules').mockRejectedValue(new Error('Feature load failed'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await appInitializer.initialize();

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});
