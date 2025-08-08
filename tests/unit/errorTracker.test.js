/**
 * Unit tests for errorTracker.js
 */

let ErrorTracker;

beforeAll(() => {
  // Mock localStorage
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

  // Mock performance
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => [])
  };

  // Import after mocking
  jest.isolateModules(() => {
    ErrorTracker = require('../../errorTracker.js').ErrorTracker;
  });
});

describe('ErrorTracker', () => {
  let errorTracker;

  beforeEach(() => {
    errorTracker = new ErrorTracker();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(errorTracker).toBeDefined();
      expect(errorTracker.sessionId).toBeDefined();
      expect(Array.isArray(errorTracker.errors)).toBe(true);
      expect(typeof errorTracker.userActions).toBe('object');
    });

    test('should generate unique session IDs', () => {
      const tracker1 = new ErrorTracker();
      const tracker2 = new ErrorTracker();
      
      expect(tracker1.sessionId).not.toBe(tracker2.sessionId);
    });
  });

  describe('logError', () => {
    test('should log error with all required fields', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      errorTracker.logError(error, context);
      
      expect(errorTracker.errors.length).toBe(1);
      
      const loggedError = errorTracker.errors[0];
      expect(loggedError.message).toBe('Test error');
      expect(loggedError.context).toEqual(context);
      expect(loggedError.timestamp).toBeDefined();
      expect(loggedError.sessionId).toBe(errorTracker.sessionId);
      expect(loggedError.stack).toBeDefined();
    });

    test('should handle string errors', () => {
      errorTracker.logError('String error message');
      
      expect(errorTracker.errors.length).toBe(1);
      expect(errorTracker.errors[0].message).toBe('String error message');
    });

    test('should handle null/undefined errors', () => {
      errorTracker.logError(null);
      errorTracker.logError(undefined);
      
      expect(errorTracker.errors.length).toBe(2);
      expect(errorTracker.errors[0].message).toBe('Unknown error');
      expect(errorTracker.errors[1].message).toBe('Unknown error');
    });

    test('should persist errors to localStorage', () => {
      const error = new Error('Persistent error');
      errorTracker.logError(error);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'weekly_recipes_errors',
        expect.any(String)
      );
    });
  });

  describe('trackUserAction', () => {
    test('should track user action with timestamp', () => {
      const action = 'button_click';
      const details = { button: 'save', page: 'preferences' };
      
      errorTracker.trackUserAction(action, details);
      
      expect(errorTracker.userActions[action]).toBeDefined();
      expect(errorTracker.userActions[action].count).toBe(1);
      expect(errorTracker.userActions[action].lastUsed).toBeDefined();
      expect(errorTracker.userActions[action].details).toEqual(details);
    });

    test('should increment count for repeated actions', () => {
      errorTracker.trackUserAction('repeated_action');
      errorTracker.trackUserAction('repeated_action');
      errorTracker.trackUserAction('repeated_action');
      
      expect(errorTracker.userActions.repeated_action.count).toBe(3);
    });

    test('should update lastUsed timestamp', () => {
      const firstTime = Date.now();
      errorTracker.trackUserAction('timed_action');
      
      // Simulate time passing
      jest.spyOn(Date, 'now').mockReturnValue(firstTime + 1000);
      
      errorTracker.trackUserAction('timed_action');
      
      expect(errorTracker.userActions.timed_action.lastUsed).toBeGreaterThan(firstTime);
    });
  });

  describe('getErrorStats', () => {
    test('should return correct error statistics', () => {
      // Add some test errors
      errorTracker.logError(new Error('Error 1'), { severity: 'high' });
      errorTracker.logError(new Error('Error 2'), { severity: 'medium' });
      errorTracker.logError(new Error('Error 3'), { severity: 'high' });
      
      const stats = errorTracker.getErrorStats();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.sessionId).toBe(errorTracker.sessionId);
      expect(stats.timeRange.start).toBeDefined();
      expect(stats.timeRange.end).toBeDefined();
      expect(stats.errorsByType).toBeDefined();
      expect(stats.severityBreakdown).toBeDefined();
    });

    test('should handle empty error list', () => {
      const stats = errorTracker.getErrorStats();
      
      expect(stats.totalErrors).toBe(0);
      expect(Object.keys(stats.errorsByType)).toHaveLength(0);
    });
  });

  describe('exportErrorData', () => {
    test('should export error data in correct format', () => {
      errorTracker.logError(new Error('Export test error'));
      errorTracker.trackUserAction('test_action', { test: true });
      
      const exportData = errorTracker.exportErrorData();
      
      expect(exportData).toBeDefined();
      expect(exportData.errors).toBeDefined();
      expect(exportData.userActions).toBeDefined();
      expect(exportData.sessionInfo).toBeDefined();
      expect(exportData.exportTime).toBeDefined();
      
      // Validate structure
      expect(Array.isArray(exportData.errors)).toBe(true);
      expect(typeof exportData.userActions).toBe('object');
      expect(typeof exportData.sessionInfo).toBe('object');
    });

    test('should include session information', () => {
      const exportData = errorTracker.exportErrorData();
      
      expect(exportData.sessionInfo.sessionId).toBe(errorTracker.sessionId);
      expect(exportData.sessionInfo.userAgent).toBeDefined();
      expect(exportData.sessionInfo.url).toBeDefined();
      expect(exportData.sessionInfo.timestamp).toBeDefined();
    });
  });

  describe('clearErrors', () => {
    test('should clear all errors and reset counters', () => {
      // Add some test data
      errorTracker.logError(new Error('Test error'));
      errorTracker.trackUserAction('test_action');
      
      expect(errorTracker.errors.length).toBe(1);
      expect(Object.keys(errorTracker.userActions)).toHaveLength(1);
      
      errorTracker.clearErrors();
      
      expect(errorTracker.errors.length).toBe(0);
      expect(Object.keys(errorTracker.userActions)).toHaveLength(0);
    });

    test('should clear localStorage', () => {
      errorTracker.logError(new Error('Test error'));
      errorTracker.clearErrors();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('weekly_recipes_errors');
      expect(localStorage.removeItem).toHaveBeenCalledWith('weekly_recipes_user_actions');
    });
  });

  describe('loadStoredErrors', () => {
    test('should load errors from localStorage', () => {
      const storedErrors = [
        {
          message: 'Stored error',
          timestamp: Date.now(),
          sessionId: 'test-session'
        }
      ];
      
      localStorage.setItem('weekly_recipes_errors', JSON.stringify(storedErrors));
      
      errorTracker.loadStoredErrors();
      
      expect(errorTracker.errors.length).toBe(1);
      expect(errorTracker.errors[0].message).toBe('Stored error');
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem('weekly_recipes_errors', 'invalid json');
      
      expect(() => errorTracker.loadStoredErrors()).not.toThrow();
      expect(errorTracker.errors.length).toBe(0);
    });
  });

  describe('performance tracking', () => {
    test('should track performance metrics', () => {
      const metrics = {
        loadTime: 1500,
        renderTime: 300,
        memoryUsage: 50000000
      };
      
      errorTracker.trackPerformance(metrics);
      
      expect(errorTracker.performanceMetrics).toBeDefined();
      expect(errorTracker.performanceMetrics.loadTime).toBe(1500);
    });

    test('should include performance data in export', () => {
      errorTracker.trackPerformance({ loadTime: 1000 });
      
      const exportData = errorTracker.exportErrorData();
      
      expect(exportData.performanceMetrics).toBeDefined();
      expect(exportData.performanceMetrics.loadTime).toBe(1000);
    });
  });

  describe('global error handlers', () => {
    test('should set up global error handlers', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      errorTracker.setupGlobalHandlers();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });
});
