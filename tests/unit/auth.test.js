/**
 * Unit tests for the AuthManager
 * Tests authentication functionality and user management
 */

import { AuthManager } from '../auth.js';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  })),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

describe('AuthManager', () => {
  let authManager;
  let mockAuth;
  let mockAuthFunctions;

  beforeEach(() => {
    mockAuth = {
      currentUser: null,
      signInWithEmailAndPassword: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      signOut: jest.fn()
    };

    mockAuthFunctions = {
      signInWithEmailAndPassword: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChanged: jest.fn()
    };

    authManager = new AuthManager(mockAuth, mockAuthFunctions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with auth and functions', () => {
      expect(authManager.auth).toBe(mockAuth);
      expect(authManager.isInitialized).toBe(false);
    });

    test('should initialize successfully', async () => {
      await authManager.initialize();
      
      expect(authManager.isInitialized).toBe(true);
      expect(mockAuthFunctions.onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      await authManager.initialize();
    });

    test('should sign in with valid credentials', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockAuthFunctions.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      });

      const result = await authManager.signIn('test@example.com', 'password123');

      expect(mockAuthFunctions.signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
      expect(result).toBe(mockUser);
    });

    test('should handle invalid credentials', async () => {
      mockAuthFunctions.signInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/invalid-credential')
      );

      await expect(authManager.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password. Please check your credentials.');
    });

    test('should handle user not found', async () => {
      mockAuthFunctions.signInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/user-not-found')
      );

      await expect(authManager.signIn('nonexistent@example.com', 'password'))
        .rejects.toThrow('No account found with this email address.');
    });

    test('should validate email format', async () => {
      await expect(authManager.signIn('invalid-email', 'password'))
        .rejects.toThrow('Please enter a valid email address.');
    });

    test('should validate password length', async () => {
      await expect(authManager.signIn('test@example.com', '123'))
        .rejects.toThrow('Password must be at least 6 characters long.');
    });
  });

  describe('signUp', () => {
    beforeEach(async () => {
      await authManager.initialize();
    });

    test('should create new user account', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      mockAuthFunctions.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      });

      const result = await authManager.signUp('new@example.com', 'password123');

      expect(mockAuthFunctions.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'new@example.com',
        'password123'
      );
      expect(result).toBe(mockUser);
    });

    test('should handle email already in use', async () => {
      mockAuthFunctions.createUserWithEmailAndPassword.mockRejectedValue(
        new Error('auth/email-already-in-use')
      );

      await expect(authManager.signUp('existing@example.com', 'password123'))
        .rejects.toThrow('An account with this email address already exists.');
    });

    test('should handle weak password', async () => {
      mockAuthFunctions.createUserWithEmailAndPassword.mockRejectedValue(
        new Error('auth/weak-password')
      );

      await expect(authManager.signUp('test@example.com', 'weak'))
        .rejects.toThrow('Password is too weak. Please choose a stronger password.');
    });
  });

  describe('signOut', () => {
    beforeEach(async () => {
      await authManager.initialize();
    });

    test('should sign out user', async () => {
      mockAuthFunctions.signOut.mockResolvedValue();

      await authManager.signOut();

      expect(mockAuthFunctions.signOut).toHaveBeenCalledWith(mockAuth);
    });

    test('should handle sign out errors', async () => {
      mockAuthFunctions.signOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(authManager.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    test('should return current user', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      authManager.currentUser = mockUser;

      expect(authManager.getCurrentUser()).toBe(mockUser);
    });

    test('should return null when no user', () => {
      expect(authManager.getCurrentUser()).toBeNull();
    });
  });

  describe('auth state changes', () => {
    test('should add auth state change listener', async () => {
      const callback = jest.fn();
      
      await authManager.initialize();
      authManager.onAuthStateChanged(callback);

      expect(authManager.authStateListeners).toContain(callback);
    });

    test('should notify listeners on auth state change', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };

      await authManager.initialize();
      authManager.onAuthStateChanged(callback1);
      authManager.onAuthStateChanged(callback2);

      // Simulate auth state change
      authManager.currentUser = mockUser;
      authManager.authStateListeners.forEach(listener => listener(mockUser));

      expect(callback1).toHaveBeenCalledWith(mockUser);
      expect(callback2).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('error handling', () => {
    test('should handle initialization without auth functions', async () => {
      const authManagerWithoutFunctions = new AuthManager(mockAuth, null);

      await expect(authManagerWithoutFunctions.initialize())
        .rejects.toThrow('Firebase Auth functions not available');
    });

    test('should handle missing auth instance', () => {
      expect(() => new AuthManager(null, mockAuthFunctions))
        .toThrow('Firebase Auth instance is required');
    });
  });
});
