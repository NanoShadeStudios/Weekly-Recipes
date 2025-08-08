/**
 * Integration tests for authentication and user management
 */

// Mock Firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

let AuthManager, DataManager, UIManager;

beforeAll(() => {
  // Setup DOM for auth tests
  document.body.innerHTML = `
    <div id="app">
      <div id="auth-container">
        <form id="signin-form">
          <input id="email" type="email" />
          <input id="password" type="password" />
          <button id="signin-btn" type="submit">Sign In</button>
        </form>
        <form id="signup-form">
          <input id="signup-email" type="email" />
          <input id="signup-password" type="password" />
          <input id="confirm-password" type="password" />
          <button id="signup-btn" type="submit">Sign Up</button>
        </form>
        <button id="signout-btn">Sign Out</button>
      </div>
      <div id="main-content" style="display: none;"></div>
      <div id="user-profile">
        <span id="user-display-name"></span>
        <span id="user-email"></span>
      </div>
      <div id="toast-container"></div>
    </div>
  `;

  // Import modules after DOM setup
  jest.isolateModules(() => {
    AuthManager = require('../../auth.js').AuthManager;
    DataManager = require('../../dataManager.js').DataManager;
    UIManager = require('../../uiManager.js').UIManager;
  });
});

describe('Authentication Integration', () => {
  let authManager, dataManager, uiManager;

  beforeEach(() => {
    authManager = new AuthManager();
    dataManager = new DataManager();
    uiManager = new UIManager();
    
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    test('should complete full user registration', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        displayName: 'New User'
      };

      // Step 1: Register user
      const registerResult = await authManager.createUser(
        userData.email,
        userData.password,
        userData.displayName
      );

      expect(registerResult.success).toBe(true);
      expect(registerResult.user).toBeDefined();
      expect(registerResult.user.email).toBe(userData.email);

      // Step 2: User should be automatically signed in
      expect(authManager.getCurrentUser()).toBeDefined();

      // Step 3: Initialize user data
      const defaultPreferences = {
        dietary: { vegetarian: false, vegan: false, glutenFree: false },
        nutrition: { targetCalories: 2000, proteinGoal: 150 },
        cooking: { difficulty: 'beginner', maxPrepTime: 30 }
      };

      const initResult = await dataManager.saveUserData(registerResult.user.uid, {
        email: userData.email,
        displayName: userData.displayName,
        preferences: defaultPreferences,
        createdAt: new Date().toISOString()
      });

      expect(initResult.success).toBe(true);

      // Step 4: Verify user data was saved
      const retrievedData = await dataManager.getUserData(registerResult.user.uid);
      expect(retrievedData.success).toBe(true);
      expect(retrievedData.data.preferences).toEqual(defaultPreferences);
    });

    test('should handle registration validation errors', async () => {
      // Test invalid email
      const invalidEmailResult = await authManager.createUser(
        'invalid-email',
        'password123',
        'Test User'
      );
      expect(invalidEmailResult.success).toBe(false);
      expect(invalidEmailResult.error).toContain('email');

      // Test weak password
      const weakPasswordResult = await authManager.createUser(
        'test@example.com',
        '123',
        'Test User'
      );
      expect(weakPasswordResult.success).toBe(false);
      expect(weakPasswordResult.error).toContain('password');
    });
  });

  describe('User Sign-In Flow', () => {
    test('should complete sign-in and load user data', async () => {
      const userCredentials = {
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock existing user data
      const existingUserData = {
        email: userCredentials.email,
        displayName: 'Existing User',
        preferences: {
          dietary: { vegetarian: true },
          nutrition: { targetCalories: 1800 }
        },
        mealHistory: []
      };

      // Step 1: Sign in user
      const signInResult = await authManager.signInUser(
        userCredentials.email,
        userCredentials.password
      );

      expect(signInResult.success).toBe(true);
      expect(signInResult.user.email).toBe(userCredentials.email);

      // Step 2: Load user data
      const userDataResult = await dataManager.getUserData(signInResult.user.uid);
      expect(userDataResult.success).toBe(true);

      // Step 3: Update UI with user info
      const userDisplayName = document.getElementById('user-display-name');
      const userEmail = document.getElementById('user-email');
      
      uiManager.updateUserProfile(signInResult.user);
      
      expect(userDisplayName.textContent).toBe(signInResult.user.displayName || '');
      expect(userEmail.textContent).toBe(signInResult.user.email);

      // Step 4: Show authenticated content
      const authContainer = document.getElementById('auth-container');
      const mainContent = document.getElementById('main-content');
      
      uiManager.showAuthenticatedView();
      
      expect(authContainer.style.display).toBe('none');
      expect(mainContent.style.display).not.toBe('none');
    });

    test('should handle sign-in errors gracefully', async () => {
      // Test wrong password
      const wrongPasswordResult = await authManager.signInUser(
        'test@example.com',
        'wrongpassword'
      );
      expect(wrongPasswordResult.success).toBe(false);
      expect(wrongPasswordResult.error).toBeDefined();

      // Test non-existent user
      const nonExistentResult = await authManager.signInUser(
        'nonexistent@example.com',
        'password123'
      );
      expect(nonExistentResult.success).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should maintain session across page reloads', async () => {
      // Mock user sign-in
      const signInResult = await authManager.signInUser(
        'persistent@example.com',
        'password123'
      );
      expect(signInResult.success).toBe(true);

      // Simulate page reload by creating new auth manager
      const newAuthManager = new AuthManager();
      
      // Should detect existing session
      await newAuthManager.initializeAuth();
      
      const currentUser = newAuthManager.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser.email).toBe('persistent@example.com');
    });

    test('should handle session expiration', async () => {
      // Mock expired session
      const expiredAuthManager = new AuthManager();
      
      // Should handle gracefully without crashing
      await expiredAuthManager.initializeAuth();
      
      const currentUser = expiredAuthManager.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('Sign-Out Flow', () => {
    test('should complete sign-out and clear user data', async () => {
      // First sign in
      await authManager.signInUser('signout@example.com', 'password123');
      expect(authManager.getCurrentUser()).toBeDefined();

      // Sign out
      const signOutResult = await authManager.signOutUser();
      expect(signOutResult.success).toBe(true);
      expect(authManager.getCurrentUser()).toBeNull();

      // UI should return to unauthenticated state
      const authContainer = document.getElementById('auth-container');
      const mainContent = document.getElementById('main-content');
      
      uiManager.showUnauthenticatedView();
      
      expect(authContainer.style.display).not.toBe('none');
      expect(mainContent.style.display).toBe('none');

      // Clear any cached user data
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('current_meal_plan');
    });
  });

  describe('User Profile Management', () => {
    test('should update user profile information', async () => {
      // Sign in first
      const signInResult = await authManager.signInUser(
        'profile@example.com',
        'password123'
      );
      expect(signInResult.success).toBe(true);

      const userId = signInResult.user.uid;

      // Update profile
      const profileUpdates = {
        displayName: 'Updated Display Name',
        preferences: {
          dietary: { vegetarian: true, vegan: false },
          nutrition: { targetCalories: 2200 },
          cooking: { difficulty: 'advanced' }
        }
      };

      // Update auth profile
      const authUpdateResult = await authManager.updateUserProfile({
        displayName: profileUpdates.displayName
      });
      expect(authUpdateResult.success).toBe(true);

      // Update user data
      const dataUpdateResult = await dataManager.saveUserData(userId, profileUpdates);
      expect(dataUpdateResult.success).toBe(true);

      // Verify updates
      const updatedData = await dataManager.getUserData(userId);
      expect(updatedData.success).toBe(true);
      expect(updatedData.data.displayName).toBe(profileUpdates.displayName);
      expect(updatedData.data.preferences).toEqual(profileUpdates.preferences);
    });
  });

  describe('Data Synchronization', () => {
    test('should sync user data across devices', async () => {
      const userId = 'sync-user-id';
      
      // Device 1: Save user preferences
      const device1Prefs = {
        dietary: { vegetarian: true },
        nutrition: { targetCalories: 2000 }
      };
      
      await dataManager.saveUserData(userId, {
        preferences: device1Prefs,
        lastModified: Date.now()
      });

      // Device 2: Create new data manager (simulating different device)
      const device2DataManager = new DataManager();
      
      // Load data on device 2
      const syncedData = await device2DataManager.getUserData(userId);
      expect(syncedData.success).toBe(true);
      expect(syncedData.data.preferences).toEqual(device1Prefs);

      // Device 2: Update preferences
      const device2Prefs = {
        ...device1Prefs,
        cooking: { difficulty: 'intermediate' }
      };
      
      await device2DataManager.saveUserData(userId, {
        preferences: device2Prefs,
        lastModified: Date.now()
      });

      // Device 1: Sync and verify updates
      const updatedData = await dataManager.getUserData(userId);
      expect(updatedData.success).toBe(true);
      expect(updatedData.data.preferences.cooking.difficulty).toBe('intermediate');
    });
  });

  describe('Error Recovery', () => {
    test('should recover from authentication errors', async () => {
      // Mock network error during sign-in
      authManager.isOnline = false;
      
      const offlineSignIn = await authManager.signInUser(
        'offline@example.com',
        'password123'
      );
      
      // Should handle gracefully
      expect(offlineSignIn.success).toBe(false);
      expect(offlineSignIn.error).toContain('offline');

      // Recovery when back online
      authManager.isOnline = true;
      
      const onlineSignIn = await authManager.signInUser(
        'offline@example.com',
        'password123'
      );
      
      expect(onlineSignIn.success).toBe(true);
    });

    test('should handle partial data corruption', async () => {
      const userId = 'corrupted-user';
      
      // Save valid data first
      await dataManager.saveUserData(userId, {
        email: 'user@example.com',
        preferences: { dietary: { vegetarian: true } }
      });

      // Simulate data corruption in localStorage
      localStorage.setItem('user_data_' + userId, 'corrupted_json{');

      // Should handle gracefully and fall back to cloud data
      const result = await dataManager.getUserData(userId);
      expect(result.success).toBe(true);
    });
  });
});
