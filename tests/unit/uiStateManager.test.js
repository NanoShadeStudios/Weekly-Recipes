/**
 * Unit tests for UIStateManager
 * Tests UI state management, tab switching, and form persistence
 */

import { UIStateManager } from '../uiStateManager.js';

// Mock DOM methods
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

// Mock DOM elements
const mockElements = {
  tab1: { classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
  tab2: { classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
  content1: { classList: { add: jest.fn(), remove: jest.fn() } },
  content2: { classList: { add: jest.fn(), remove: jest.fn() } }
};

global.document = {
  getElementById: jest.fn((id) => mockElements[id] || null),
  querySelectorAll: jest.fn(() => Object.values(mockElements)),
  addEventListener: jest.fn()
};

describe('UIStateManager', () => {
  let uiManager;

  beforeEach(() => {
    uiManager = new UIStateManager();
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('initialization', () => {
    test('should initialize with default values', () => {
      expect(uiManager.currentTab).toBe('weeklyPlan');
      expect(uiManager.formData).toEqual({});
      expect(uiManager.initialized).toBe(false);
    });

    test('should load saved state from localStorage', () => {
      const savedState = {
        currentTab: 'myFoods',
        formData: { testField: 'testValue' }
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const manager = new UIStateManager();
      manager.init();

      expect(manager.currentTab).toBe('myFoods');
      expect(manager.formData.testField).toBe('testValue');
    });
  });

  describe('tab management', () => {
    beforeEach(() => {
      uiManager.init();
    });

    test('should switch to valid tab', () => {
      uiManager.showTab('myFoods');

      expect(uiManager.currentTab).toBe('myFoods');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'uiState',
        expect.stringContaining('"currentTab":"myFoods"')
      );
    });

    test('should not switch to invalid tab', () => {
      const originalTab = uiManager.currentTab;
      uiManager.showTab('invalidTab');

      expect(uiManager.currentTab).toBe(originalTab);
    });

    test('should notify observers on tab change', () => {
      const observer = jest.fn();
      uiManager.addObserver(observer);

      uiManager.showTab('preferences');

      expect(observer).toHaveBeenCalledWith({
        type: 'tabChanged',
        previousTab: 'weeklyPlan',
        currentTab: 'preferences'
      });
    });

    test('should activate correct tab elements', () => {
      // Mock elements exist
      document.getElementById.mockImplementation((id) => {
        if (id === 'myFoods-btn') return mockElements.tab1;
        if (id === 'myFoods') return mockElements.content1;
        if (id === 'weeklyPlan-btn') return mockElements.tab2;
        if (id === 'weeklyPlan') return mockElements.content2;
        return null;
      });

      uiManager.showTab('myFoods');

      expect(mockElements.tab1.classList.add).toHaveBeenCalledWith('active');
      expect(mockElements.content1.classList.add).toHaveBeenCalledWith('active');
    });
  });

  describe('form data persistence', () => {
    beforeEach(() => {
      uiManager.init();
    });

    test('should save form data', () => {
      const formData = { email: 'test@example.com', preferences: ['vegetarian'] };

      uiManager.saveFormData('userPreferences', formData);

      expect(uiManager.formData.userPreferences).toEqual(formData);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should restore form data', () => {
      const formData = { email: 'test@example.com' };
      uiManager.formData.loginForm = formData;

      const restored = uiManager.getFormData('loginForm');

      expect(restored).toEqual(formData);
    });

    test('should return empty object for non-existent form data', () => {
      const restored = uiManager.getFormData('nonExistentForm');

      expect(restored).toEqual({});
    });

    test('should clear form data', () => {
      uiManager.formData.testForm = { field1: 'value1' };

      uiManager.clearFormData('testForm');

      expect(uiManager.formData.testForm).toBeUndefined();
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('observer pattern', () => {
    beforeEach(() => {
      uiManager.init();
    });

    test('should add observers', () => {
      const observer = jest.fn();

      uiManager.addObserver(observer);

      expect(uiManager.observers).toContain(observer);
    });

    test('should remove observers', () => {
      const observer = jest.fn();
      uiManager.addObserver(observer);

      uiManager.removeObserver(observer);

      expect(uiManager.observers).not.toContain(observer);
    });

    test('should notify all observers', () => {
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const event = { type: 'test', data: 'testData' };

      uiManager.addObserver(observer1);
      uiManager.addObserver(observer2);
      uiManager.notifyObservers(event);

      expect(observer1).toHaveBeenCalledWith(event);
      expect(observer2).toHaveBeenCalledWith(event);
    });

    test('should handle observer errors gracefully', () => {
      const goodObserver = jest.fn();
      const badObserver = jest.fn(() => { throw new Error('Observer error'); });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      uiManager.addObserver(goodObserver);
      uiManager.addObserver(badObserver);
      uiManager.notifyObservers({ type: 'test' });

      expect(goodObserver).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('responsive design', () => {
    test('should detect mobile viewport', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      expect(uiManager.isMobile()).toBe(true);
    });

    test('should detect desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      expect(uiManager.isMobile()).toBe(false);
    });

    test('should update layout on resize', () => {
      const observer = jest.fn();
      uiManager.addObserver(observer);

      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      uiManager.handleResize();

      expect(observer).toHaveBeenCalledWith({
        type: 'layoutChanged',
        isMobile: true,
        width: 500
      });
    });
  });

  describe('error handling', () => {
    test('should handle localStorage errors', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      uiManager.saveFormData('test', { data: 'test' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('should handle invalid JSON in localStorage', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      const manager = new UIStateManager();
      manager.init();

      // Should use default values
      expect(manager.currentTab).toBe('weeklyPlan');
      expect(manager.formData).toEqual({});
    });
  });

  describe('state persistence', () => {
    test('should persist state to localStorage', () => {
      uiManager.currentTab = 'preferences';
      uiManager.formData = { test: 'data' };

      uiManager.persistState();

      const expectedState = JSON.stringify({
        currentTab: 'preferences',
        formData: { test: 'data' },
        timestamp: expect.any(Number)
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('uiState', expectedState);
    });

    test('should load state from localStorage', () => {
      const savedState = {
        currentTab: 'nutrition',
        formData: { nutrition: { calories: 2000 } },
        timestamp: Date.now()
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      uiManager.loadState();

      expect(uiManager.currentTab).toBe('nutrition');
      expect(uiManager.formData.nutrition).toEqual({ calories: 2000 });
    });
  });
});
