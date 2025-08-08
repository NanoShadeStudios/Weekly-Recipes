// Debug: App.js module loading
console.log('🚀 App.js: Module loading started');

// Import Firebase functions using module syntax
import { getFirebaseInstance, setupAuthListeners, setupDatabaseListeners } from './firebase.js';
// Import UI functions
import { showInitializationError, renderPlan, showMLStatusIndicator } from './uiManager.js';
// Import enhanced UI state management
import './uiStateManager.js';
// Import meal planning functions
import { generatePlan, generateSingleMeal } from './mealGenerator.js';
// Import AI engine
import { MealPlanningAI } from './aiEngine.js';
// Import shopping list generator
import { shoppingListGenerator } from './shoppingListGenerator.js';
// Import nutrition tracker
import { nutritionTracker } from './nutritionTracker.js';
// Import data management functions
import { 
  loadUserData, 
  saveWeeklyPlan, 
  updateUserData,
  batchUpdateUserData,
  syncOfflineData,
  getOfflineStatus 
} from './dataManager.js';
// Import food management functions
import { addFood } from './foodManager.js';
// Import preferences functions
import { savePreferences, preferencesManager } from './savePreferences.js';
// Import AI services
import { firebaseAI } from './aiService.js';
// Import error handling first
import { errorBoundary, ErrorBoundary } from './errorBoundary.js';
// Import modular components
import { appInitializer } from './appInitializer.js';
import { themeManager } from './themeManager.js';
import { aiFeatureManager } from './aiFeatureManager.js';

// Import performance optimization systems
import { advancedImageOptimizer } from './advancedImageOptimizer.js';
import { progressiveLoadingManager } from './progressiveLoadingManager.js';
import SimplifiedFirebaseOptimizer from './simplifiedFirebaseOptimizer.js';


// Global performance optimization variables
let firebaseQueryOptimizer = null;

// Import community features
let communityManager = null;
let communityUI = null;
async function loadCommunityFeatures() {
  try {
    console.log('Loading community manager and UI...');
    
    // Load the modules
    const communityManagerModule = await import('./communityManager.js');
    const communityUIModule = await import('./communityUI.js');
    
    console.log('Community modules loaded:', {
      manager: !!communityManagerModule,
      ui: !!communityUIModule,
      managerDefault: !!communityManagerModule.default,
      managerNamed: !!communityManagerModule.CommunityManager,
      uiDefault: !!communityUIModule.default,
      uiNamed: !!communityUIModule.CommunityUI
    });
    
    // Get the classes (try default export first, then named export)
    const CommunityManager = communityManagerModule.default || communityManagerModule.CommunityManager;
    const CommunityUI = communityUIModule.default || communityUIModule.CommunityUI;
    
    if (!CommunityManager) {
      throw new Error('CommunityManager class not found in module');
    }
    
    if (!CommunityUI) {
      throw new Error('CommunityUI class not found in module');
    }
    
    // Create instances
    communityManager = new CommunityManager();
    communityUI = new CommunityUI(communityManager);
    
    console.log('Community instances created:', {
      manager: !!communityManager,
      ui: !!communityUI
    });
    
    return { communityManager, communityUI };
  } catch (error) {
    console.error('Community features loading failed:', error);
    // Create fallback objects
    communityManager = {
      setCurrentUser: () => {},
      getCommunityStats: () => ({ totalPlans: 0, activeUsers: 0, averageRating: 0 }),
      initializeDefaultData: () => {},
      sharedPlans: []
    };
    communityUI = {
      setCurrentUser: () => {},
      initialize: () => {
        console.log('Using fallback community UI');
        populateFallbackCommunityContent();
      }
    };
    return { communityManager, communityUI };
  }
}

// Import family features
let familyManager = null;
let familyUIManager = null;
async function loadFamilyFeatures() {
  try {
    console.log('Loading family manager and UI...');
    
    // Load the modules
    const familyManagerModule = await import('./familyManager.js');
    const familyUIManagerModule = await import('./familyUIManager.js');
    
    console.log('Family modules loaded:', {
      manager: !!familyManagerModule,
      ui: !!familyUIManagerModule,
      managerDefault: !!familyManagerModule.default,
      managerNamed: !!familyManagerModule.FamilyManager,
      uiDefault: !!familyUIManagerModule.default,
      uiNamed: !!familyUIManagerModule.FamilyUIManager
    });
    
    // Get the classes (try default export first, then named export)
    const FamilyManager = familyManagerModule.default || familyManagerModule.FamilyManager;
    const FamilyUIManager = familyUIManagerModule.default || familyUIManagerModule.FamilyUIManager;
    
    if (!FamilyManager) {
      throw new Error('FamilyManager class not found in module');
    }
    
    if (!FamilyUIManager) {
      throw new Error('FamilyUIManager class not found in module');
    }
    
    // Create instances
    familyManager = new FamilyManager();
    familyUIManager = new FamilyUIManager(familyManager);
    
    console.log('Family instances created:', {
      manager: !!familyManager,
      ui: !!familyUIManager
    });
    
    return { familyManager, familyUIManager };
  } catch (error) {
    console.error('Family features loading failed:', error);
    // Create fallback objects
    familyManager = {
      setCurrentUser: () => {},
      getCurrentFamily: () => null,
      initialize: () => {}
    };
    familyUIManager = {
      setCurrentUser: () => {},
      initialize: () => {
        console.log('Using fallback family UI');
      }
    };
    return { familyManager, familyUIManager };
  }
}

// Import calendar integration features
let calendarManager = null;
let calendarUI = null;
let enhancedCalendarManager = null;
let enhancedCalendarUI = null;

async function loadCalendarIntegration() {
  try {
    console.log('Loading calendar manager and UI...');
    
    // Load the modules - both regular and enhanced
    const calendarManagerModule = await import('./calendarIntegration.js');
    const calendarUIModule = await import('./calendarUI.js');
    const enhancedCalendarManagerModule = await import('./enhancedCalendarManager.js');
    const enhancedCalendarUIModule = await import('./enhancedCalendarUI.js');
    
    console.log('Calendar modules loaded:', {
      manager: !!calendarManagerModule,
      ui: !!calendarUIModule,
      enhancedManager: !!enhancedCalendarManagerModule,
      enhancedUI: !!enhancedCalendarUIModule
    });
    
    // Get the classes (try default export first, then named export)
    const CalendarManager = calendarManagerModule.default || calendarManagerModule.CalendarManager;
    const CalendarUI = calendarUIModule.default || calendarUIModule.CalendarUI;
    const EnhancedCalendarManager = enhancedCalendarManagerModule.default || enhancedCalendarManagerModule.EnhancedCalendarManager;
    const EnhancedCalendarUI = enhancedCalendarUIModule.default || enhancedCalendarUIModule.EnhancedCalendarUI;
    
    if (!CalendarManager) {
      throw new Error('CalendarManager class not found in module');
    }
    
    if (!CalendarUI) {
      throw new Error('CalendarUI class not found in module');
    }
    
    // Create instances
    calendarManager = new CalendarManager();
    calendarUI = new CalendarUI(calendarManager);
    
    // Load enhanced calendar features if available
    if (EnhancedCalendarManager && EnhancedCalendarUI) {
      enhancedCalendarManager = EnhancedCalendarManager;
      enhancedCalendarUI = EnhancedCalendarUI;
      console.log('Enhanced calendar features loaded successfully');
      
      // Initialize enhanced calendar
      if (enhancedCalendarManager && typeof enhancedCalendarManager.initializeEnhancedCalendar === 'function') {
        await enhancedCalendarManager.initializeEnhancedCalendar();
      }
    } else {
      console.warn('Enhanced calendar features not available, using basic calendar only');
    }
    
    console.log('Calendar instances created:', {
      manager: !!calendarManager,
      ui: !!calendarUI,
      enhancedManager: !!enhancedCalendarManager,
      enhancedUI: !!enhancedCalendarUI
    });
    
    return { calendarManager, calendarUI, enhancedCalendarManager, enhancedCalendarUI };
  } catch (error) {
    console.error('Calendar integration loading failed:', error);
    // Create fallback objects
    calendarManager = {
      addMealPlanToCalendar: () => ({ success: false, message: 'Calendar not available' }),
      getUpcomingMeals: () => [],
      getCurrentViewTitle: () => 'Calendar',
      getMonthGrid: () => [],
      next: () => {},
      previous: () => {},
      goToToday: () => {},
      setViewMode: () => {}
    };
    calendarUI = {
      init: () => {
        console.log('Using fallback calendar UI');
        populateFallbackCalendarContent();
      },
      refresh: () => {},
      showNotification: () => {}
    };
    return { calendarManager, calendarUI };
  }
}

// Import authentication with fallback handling
let authManager = null;
async function loadAuthManager() {
  try {
    const authModule = await import('./auth.js');
    authManager = authModule.authManager;
    window.authManager = authManager; // Also make it globally available
    console.log('Auth manager loaded successfully');
    
    // Set up auth state handler now that auth manager is available
    if (typeof setupAuthStateHandler === 'function') {
      console.log('Setting up auth state handler after auth manager load');
      setupAuthStateHandler();
    }
    
    return authManager;
  } catch (error) {
    console.error('Failed to load auth manager:', error);
    errorBoundary.handleError(error, 'module');
    // Create a fallback auth manager
    authManager = {
      initialize: async () => { console.warn('Auth manager fallback - no authentication available'); },
      signIn: async () => { throw new Error('Authentication not available'); },
      signOut: async () => { console.warn('Sign out not available'); },
      onAuthStateChanged: () => () => {},
      getCurrentUser: () => null,
      isAuthenticated: () => false
    };
    return authManager;
  }
}

// Import loading manager
let loadingManager = null;
async function loadLoadingManager() {
  try {
    const loadingModule = await import('./loadingManager.js');
    loadingManager = loadingModule.loadingManager;
    console.log('Loading manager loaded successfully');
    return loadingManager;
  } catch (error) {
    console.warn('Loading manager not available:', error);
    // Create a simple fallback
    loadingManager = {
      showGlobalLoader: () => {},
      hideGlobalLoader: () => {},
      withLoading: async (fn) => await fn()
    };

// Import loading manager
    return loadingManager;
  }
}

// Debug functions for testing (can be called from browser console)
window.debugAuth = {
  checkCurrentUser: () => {
    console.log('Current user:', currentUser);
    console.log('Auth manager:', authManager);
    console.log('Auth manager current user:', authManager?.getCurrentUser());
    console.log('Pending action:', window.pendingAction);
  },
  
  testSignIn: async (email = 'test@example.com', password = 'testpass') => {
    console.log('Testing sign-in with:', email);
    try {
      if (!authManager) {
        await loadAuthManager();
      }
      await authManager.signIn(email, password);
      console.log('Sign-in test successful');
    } catch (error) {
      console.error('Sign-in test failed:', error);
    }
  },
  
  testMealPlan: () => {
    console.log('Testing meal plan generation');
    generatePlanWrapper();
  },
  
  testFormSubmission: () => {
    console.log('Testing direct form submission');
    const form = document.getElementById('signInForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    console.log('Form found:', !!form);
    console.log('Email field found:', !!email);
    console.log('Password field found:', !!password);
    
    if (form && email && password) {
      email.value = 'test@example.com';
      password.value = 'testpass';
      console.log('Values set, calling handleSignInClick...');
      handleSignInClick({ preventDefault: () => {}, stopPropagation: () => {} });
    } else {
      console.error('Form elements not found');
      console.log('Available forms:', document.querySelectorAll('form'));
      console.log('Available inputs:', document.querySelectorAll('input'));
    }
  },
  
  checkFormElements: () => {
    const form = document.getElementById('signInForm');
    const button = document.getElementById('signInBtn');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    console.log('Form:', form);
    console.log('Button:', button);
    console.log('Email input:', email);
    console.log('Password input:', password);
    console.log('Form onsubmit:', form?.getAttribute('onsubmit'));
    console.log('Button onclick:', button?.getAttribute('onclick'));
    console.log('Button type:', button?.type);
    
    // Test if global function is available
    console.log('Global handleSignInClick:', typeof window.handleSignInClick);
    
    // Try clicking the button
    if (button) {
      console.log('Simulating button click...');
      button.click();
    }
  }
};

console.log('App.js: Debug functions available at window.debugAuth');

// Theme management
function initializeTheme() {
  // Default to dark mode, but check localStorage for user preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleIcon(newTheme);
}

/**
 * Update theme toggle icon and tooltip based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

/**
 * Initialize UI components and set up event listeners
 * Handles both immediate setup and DOMContentLoaded events
 */
function initializeUI() {
  // Set up DOM event listeners
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - setting up UI');
    setupUIElements();
  });
  
  // Also try to set up immediately in case DOM is already loaded
  if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded');
  } else {
    console.log('DOM already loaded, setting up UI immediately');
    setupUIElements();
  }
}

/**
 * Initialize preferences system and load user preferences
 * @async
 * @returns {Promise<void>}
 */
async function initializePreferences() {
  try {
    console.log('Initializing preferences system');
    
    // Load preferences
    await preferencesManager.loadPreferences();
    
    // Set up preference change listener for AI integration
    preferencesManager.addListener((changedPrefs, allPrefs) => {
      console.log('Preferences changed:', changedPrefs);
      
      // Update global preferences for other modules
      window.userPreferences = allPrefs;
      
      // Trigger meal plan regeneration if dietary preferences changed
      if (changedPrefs.dietary) {
        console.log('Dietary preferences changed, may need to regenerate meal plan');
      }
      
      // Update UI theme if changed
      if (changedPrefs.ui && changedPrefs.ui.theme) {
        applyTheme(changedPrefs.ui.theme);
      }
    });
    
    // Make preferences available globally
    window.userPreferences = preferencesManager.getPreferences();
    window.recordMealRating = (mealId, rating) => preferencesManager.recordMealRating(mealId, rating);
    window.recordSkippedMeal = (mealId) => preferencesManager.recordSkippedMeal(mealId);
    window.recordRepeatedMeal = (mealId) => preferencesManager.recordRepeatedMeal(mealId);
    window.recordCookingActivity = (mealId, cookingTime, difficulty) => 
      preferencesManager.recordCookingActivity(mealId, cookingTime, difficulty);
    
    // Populate preference form fields if they exist
    populatePreferenceForm();
    
    console.log('Preferences system initialized successfully');
  } catch (error) {
    console.error('Error initializing preferences:', error);
  }
}

// Populate preference form with current values
function populatePreferenceForm() {
  const prefs = preferencesManager.getPreferences();
  
  // Dietary preferences
  const setCheckbox = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.checked = value;
  };
  
  setCheckbox('vegetarianPref', prefs.dietary.vegetarian);
  setCheckbox('veganPref', prefs.dietary.vegan);
  setCheckbox('glutenFreePref', prefs.dietary.glutenFree);
  setCheckbox('dairyFreePref', prefs.dietary.dairyFree);
  setCheckbox('nutFreePref', prefs.dietary.nutFree);
  
  // Meal preferences
  setCheckbox('easyMealsPref', prefs.meals.easyMeals);
  setCheckbox('quickMealsPref', prefs.meals.quickMeals);
  setCheckbox('mealPrepPref', prefs.meals.mealPrepFriendly);
  setCheckbox('budgetPref', prefs.meals.budgetFriendly);
  
  // Cooking preferences
  const setSelect = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  };
  
  setSelect('skillLevelPref', prefs.cooking.skillLevel);
  setSelect('spiceLevelPref', prefs.cooking.spiceLevel);
  
  const setNumber = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  };
  
  setNumber('maxCookTimePref', prefs.cooking.maxCookTime);
}

function setupUIElements() {
  console.log('Setting up UI elements');
  
  // Initialize theme
  initializeTheme();
  
  // Initialize preferences system
  initializePreferences();
  
  // Preload auth manager for better responsiveness
  loadAuthManager().catch(error => {
    console.warn('Failed to preload auth manager:', error);
  });
  
  // Preload community features
  loadCommunityFeatures().catch(error => {
    console.warn('Failed to preload community features:', error);
  });
  
  // Preload calendar integration features
  loadCalendarIntegration().catch(error => {
    console.warn('Failed to preload calendar integration features:', error);
  });
  
  // Set up theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  const generateMealBtn = document.getElementById('generateMealBtn');
  console.log('🔍 Generate button found:', !!generateMealBtn);
  if (generateMealBtn) {
    console.log('✅ Adding click listener to generate button');
    generateMealBtn.addEventListener('click', (event) => {
      console.log('🖱️ Generate button clicked!', event);
      generatePlanWrapper();
    });
    console.log('✅ Generate button listener added');
    
    // Test if button is responsive
    setTimeout(() => {
      console.log('🧪 Testing button responsiveness...');
      console.log('Button disabled:', generateMealBtn.disabled);
      console.log('Button display:', getComputedStyle(generateMealBtn).display);
      console.log('Button pointer-events:', getComputedStyle(generateMealBtn).pointerEvents);
    }, 1000);
  } else {
    console.error('❌ Generate button not found in DOM');
  }
  
  // Set up preferences save button
  const savePreferencesBtn = document.getElementById('savePreferencesBtn');
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', savePreferences);
  }
  
  // Set up sign-in form with more robust event handling
  setupSignInForm();
  
  // Set up tab navigation (handled by UI state manager)
  document.getElementById('weeklyPlan-btn')?.addEventListener('click', () => showTab('weeklyPlan'));
  document.getElementById('myFoods-btn')?.addEventListener('click', () => showTab('myFoods'));
  document.getElementById('preferences-btn')?.addEventListener('click', () => showTab('preferences'));
  document.getElementById('shoppingList-btn')?.addEventListener('click', () => showTab('shoppingList'));
  document.getElementById('nutrition-btn')?.addEventListener('click', () => showTab('nutrition'));
  document.getElementById('seasonal-btn')?.addEventListener('click', () => showTab('seasonal'));
  document.getElementById('calendar-btn')?.addEventListener('click', () => {
    showTab('calendar');
    // Initialize calendar integration when tab is first opened
    initializeCalendarIfNeeded();
  });
  document.getElementById('community-btn')?.addEventListener('click', () => {
    showTab('community');
    // Initialize community features when tab is first opened
    initializeCommunityIfNeeded();
  });
  document.getElementById('family-btn')?.addEventListener('click', () => {
    showTab('family');
    // Initialize family features when tab is first opened
    initializeFamilyIfNeeded();
  });
  document.getElementById('profile-btn')?.addEventListener('click', () => showTab('profile'));
  
  // Set up enhanced navigation
  setupEnhancedNavigation();
  
  // Set up search functionality
  setupSearchFunctionality();
  
  // Set up AI preferences handlers
  setupAIPreferencesHandlers();
  
  // Set up profile handlers
  setupProfileHandlers();
  
  // Set up food form handler
  addFoodFormHandler();
  
  console.log('UI elements setup completed');
}

/**
 * Initialize community features when needed
 * @returns {Promise<void>}
 */
async function initializeCommunityIfNeeded() {
  console.log('Checking if community features need initialization...');
  
  try {
    // Load community features if not already loaded
    if (!communityManager || !communityUI) {
      console.log('Loading community features...');
      await loadCommunityFeatures();
    }
    
    // Check if community content exists and is populated
    const communityGrid = document.getElementById('communityPlansGrid');
    if (communityGrid && communityGrid.innerHTML.trim() === '<div class="loading-placeholder">Loading community meal plans...</div>') {
      console.log('Initializing community UI...');
      if (communityUI && typeof communityUI.initialize === 'function') {
        communityUI.initialize();
      } else {
        console.warn('Community UI not properly loaded');
        // Fallback: Create basic community content
        populateFallbackCommunityContent();
      }
    }
  } catch (error) {
    console.error('Error initializing community features:', error);
    populateFallbackCommunityContent();
  }
}

/**
 * Populate fallback community content if main system fails
 * @returns {void}
 */
function populateFallbackCommunityContent() {
  console.log('Creating fallback community content...');
  
  const communityGrid = document.getElementById('communityPlansGrid');
  if (communityGrid) {
    communityGrid.innerHTML = `
      <div class="meal-plan-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin: 10px;">
        <h3>🏗️ Community Features Loading</h3>
        <p>The community features are being set up. Please try refreshing the page or check the browser console for any errors.</p>
        <div style="margin-top: 15px;">
          <strong>Expected Features:</strong>
          <ul style="margin-top: 10px;">
            <li>Browse shared meal plans</li>
            <li>Share your own meal plans</li>
            <li>Rate and review community plans</li>
            <li>View trending meal plans</li>
          </ul>
        </div>
      </div>
    `;
  }
}

/**
 * Initialize family management features when needed
 * @returns {Promise<void>}
 */
async function initializeFamilyIfNeeded() {
  console.log('Checking if family features need initialization...');
  
  try {
    // Load family features if not already loaded
    if (!familyManager || !familyUIManager) {
      console.log('Loading family features...');
      await loadFamilyFeatures();
    }
    
    // Initialize family UI if loaded successfully
    if (familyUIManager && typeof familyUIManager.initialize === 'function') {
      console.log('Initializing family UI...');
      familyUIManager.initialize();
    } else {
      console.warn('Family UI not properly loaded');
    }
    
    // Set current user for family features
    if (window.currentUser && familyManager && familyUIManager) {
      familyManager.setCurrentUser(window.currentUser);
      familyUIManager.setCurrentUser(window.currentUser);
    }
    
  } catch (error) {
    console.error('Error initializing family features:', error);
  }
}

/**
 * Initialize calendar integration features when needed
 * @returns {Promise<void>}
 */
async function initializeCalendarIfNeeded() {
  console.log('Checking if calendar integration needs initialization...');
  
  try {
    // Load calendar features if not already loaded
    if (!calendarManager || !calendarUI) {
      console.log('Loading calendar integration features...');
      await loadCalendarIntegration();
    }
    
    // Check if calendar content exists and needs to be populated
    const calendarContent = document.getElementById('calendar');
    if (calendarContent && !calendarContent.querySelector('.calendar-integration-container')) {
      console.log('Initializing calendar integration UI...');
      if (calendarUI && typeof calendarUI.init === 'function') {
        calendarUI.init();
        
        // Update calendar services grid with available services
        if (typeof calendarUI.updateCalendarServicesGrid === 'function') {
          calendarUI.updateCalendarServicesGrid();
        }
        
        // Load current settings
        if (typeof calendarUI.loadCurrentSettings === 'function') {
          calendarUI.loadCurrentSettings();
        }
      } else {
        console.warn('Calendar UI not properly loaded');
        // Fallback: Create basic calendar content
        populateFallbackCalendarContent();
      }
    }
  } catch (error) {
    console.error('Error initializing calendar integration features:', error);
    populateFallbackCalendarContent();
  }
}

/**
 * Populate fallback calendar content if main system fails
 * @returns {void}
 */
function populateFallbackCalendarContent() {
  console.log('Creating fallback calendar content...');
  
  const calendarContent = document.getElementById('calendar');
  if (calendarContent) {
    calendarContent.innerHTML = `
      <div class="calendar-integration-container">
        <div class="calendar-header">
          <h2>📅 Calendar Integration</h2>
          <p class="calendar-subtitle">Calendar integration features are being set up</p>
        </div>
        
        <div class="integration-status-section">
          <h3>🏗️ Feature Loading</h3>
          <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <p>The calendar integration features are being initialized. Please try refreshing the page or check the browser console for any errors.</p>
            <div style="margin-top: 15px;">
              <strong>Expected Features:</strong>
              <ul style="margin-top: 10px;">
                <li>Connect to Google Calendar, Outlook, Apple Calendar</li>
                <li>Sync meal plans automatically to your calendar</li>
                <li>Set up cooking and shopping reminders</li>
                <li>Export meal plans as .ics files</li>
                <li>Bidirectional calendar synchronization</li>
              </ul>
            </div>
            <div style="margin-top: 20px;">
              <button onclick="location.reload()" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function setupSignInForm() {
  console.log('Setting up sign-in form');
  
  const signInForm = document.getElementById('signInForm');
  const signInBtn = document.getElementById('signInBtn');
  
  console.log('Form found:', !!signInForm);
  console.log('Button found:', !!signInBtn);
  
  if (signInForm && signInBtn) {
    console.log('Setting up sign-in form event listeners');
    
    // Remove any existing event listeners first
    signInForm.removeEventListener('submit', handleSignIn);
    signInBtn.removeEventListener('click', handleSignInClick);
    
    // Handle form submission (as backup)
    signInForm.addEventListener('submit', handleSignIn);
    
    // Handle button click (primary method)
    signInBtn.addEventListener('click', handleSignInClick);
    
    // Also handle Enter key in form fields
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField) {
      emailField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSignInClick(e);
        }
      });
    }
    
    if (passwordField) {
      passwordField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSignInClick(e);
        }
      });
    }
    
    // Prevent any default form submission behavior
    signInForm.setAttribute('onsubmit', 'return false;');
    
    console.log('Sign-in form event listeners attached successfully');
    console.log('Button onclick handler:', signInBtn.onclick);
    console.log('Button event listeners should be attached');
    
  } else {
    console.warn('Sign-in form or button not found in DOM');
    console.log('Available forms:', document.querySelectorAll('form'));
    console.log('Available buttons:', document.querySelectorAll('button'));
    
    // Try again after a delay
    setTimeout(() => {
      console.log('Retrying sign-in form setup after delay...');
      setupSignInForm();
    }, 1000);
  }
}

// Initialize AI features with proper error handling
async function initializeAIFeatures() {
  console.log('App.js: initializeAIFeatures called');
  try {
    // Check if AI service is ready (don't re-initialize)
    if (firebaseAI && (firebaseAI.isInitialized || firebaseAI.fallbackMode)) {
      console.log('App.js: AI service ready, setting up features...');
      
      if (firebaseAI.isInitialized) {
        console.log('App.js: AI features are available and enabled');
        
        // Add AI insights to the UI
        await addAIInsightsToUI();
        
        // Set up AI-powered meal generation
        setupAIMealGeneration();
        
        // Enable smart features
        enableSmartFeatures();
        
        // Update status indicator
        addAIStatusIndicator('online');
      } else {
        console.log('App.js: AI in fallback mode, using basic features');
        enableBasicFeatures();
        addAIStatusIndicator('offline');
      }
    } else {
      console.log('App.js: AI service not ready, using basic features');
      enableBasicFeatures();
      addAIStatusIndicator('offline');
    }
  } catch (error) {
    console.warn('App.js: AI feature setup failed:', error);
    errorBoundary.handleError(error, 'ai');
    enableBasicFeatures();
    addAIStatusIndicator('offline');
  }
}

// Initialize conversational AI features
async function initializeConversationalAI() {
  console.log('Initializing conversational AI features...');
  try {
    await loadConversationalAI();
    console.log('Conversational AI initialization complete');
  } catch (error) {
    console.warn('Conversational AI initialization failed:', error);
    errorBoundary.handleError(error, 'ai');
  }
}

// Import conversational AI features  
let nlpService = null;
let conversationalAI = null;
async function loadConversationalAI() {
  try {
    console.log('Loading conversational AI...');
    
    // Import the modules using named imports
    const { NLPService } = await import('./nlpService.js');
    const { ConversationalAI } = await import('./conversationalAI.js');
    
    console.log('AI modules loaded:', {
      NLPService: !!NLPService,
      ConversationalAI: !!ConversationalAI
    });
    
    if (!NLPService || !ConversationalAI) {
      throw new Error('AI classes not found in modules');
    }
    
    // Initialize instances (we need mealAI to be available first)
    nlpService = new NLPService();
    
    // Check if mealAI is available
    if (typeof mealAI === 'undefined' || !mealAI) {
      console.warn('MealAI not available yet for conversational AI');
      // Create a simple fallback meal generator for the ConversationalAI
      const fallbackMealGenerator = {
        getAvailableMeals: () => [
          'Chicken Stir Fry',
          'Vegetable Pasta',
          'Grilled Salmon',
          'Caesar Salad',
          'Beef Tacos'
        ]
      };
      conversationalAI = new ConversationalAI(fallbackMealGenerator, nlpService);
    } else {
      conversationalAI = new ConversationalAI(mealAI, nlpService);
    }
    
    console.log('Conversational AI loaded successfully:', {
      nlp: !!nlpService,
      conversational: !!conversationalAI
    });
    
    // Set up chat toggle button
    setupChatToggle();
    
    return { nlpService, conversationalAI };
    
  } catch (error) {
    console.error('Error loading conversational AI:', error);
    
    // Create fallback objects
    nlpService = {
      isAvailable: () => false,
      processMealRequest: () => Promise.resolve({ confidence: 0 })
    };
    conversationalAI = {
      isAvailable: () => false,
      showChat: () => console.log('Conversational AI not available'),
      hideChat: () => {}
    };
    
    return { nlpService, conversationalAI };
  }
}

// Set up chat toggle functionality
function setupChatToggle() {
  const chatToggle = document.getElementById('ai-chat-toggle');
  if (chatToggle && conversationalAI) {
    chatToggle.addEventListener('click', () => {
      if (conversationalAI.isActive) {
        conversationalAI.hideChat();
        chatToggle.classList.remove('active');
      } else {
        conversationalAI.showChat();
        chatToggle.classList.add('active');
      }
    });
  }
}

// Enable basic features when AI is not available
function enableBasicFeatures() {
  console.log('App.js: Running in basic mode without AI features');
  
  // Add a basic mode indicator
  addBasicModeIndicator();
  
  // Ensure the existing meal planning functionality works
  setupBasicMealGeneration();
  
  // Add basic feature buttons
  addBasicFeatureButtons();
}

// Add basic mode indicator
function addBasicModeIndicator() {
  const header = document.querySelector('.app-header');
  if (header && !header.querySelector('.basic-mode-indicator')) {
    const indicator = document.createElement('div');
    indicator.className = 'basic-mode-indicator';
    indicator.innerHTML = `
      <span class="ai-status offline">
        🔧 Basic Mode - AI features will be available when Firebase ML is configured
      </span>
    `;
    header.appendChild(indicator);
  }
}

// Setup basic meal generation (ensure it works without AI)
function setupBasicMealGeneration() {
  // Make sure the original generatePlan function works
  if (!window.generatePlan) {
    console.warn('generatePlan function not found, meal planning may not work');
  } else {
    console.log('Basic meal generation is available');
  }
}

// Add basic feature buttons
function addBasicFeatureButtons() {
  const controlsContainer = document.querySelector('.controls') || document.body;
  
  // Add enhanced meal planning button
  if (!controlsContainer.querySelector('.enhanced-basic-button')) {
    const enhancedButton = document.createElement('button');
    enhancedButton.textContent = '✨ Generate Smart Plan (Basic Mode)';
    enhancedButton.className = 'ai-feature-button enhanced-basic-button';
    enhancedButton.onclick = async () => {
      console.log('Generating enhanced basic meal plan...');
      if (window.mealPlanningAI) {
        try {
          const userFoods = window.foodsArr || [];
          const plan = await window.mealPlanningAI.generateAIWeeklyPlan(userFoods, {
            basicMode: true
          });
          
          if (plan) {
            updateUIWithAIPlan(plan);
            showBasicPlanNotification();
          }
        } catch (error) {
          console.error('Enhanced basic planning failed:', error);
        }
      }
    };
    
    controlsContainer.appendChild(enhancedButton);
  }
  
  // Add a refresh AI button
  if (!controlsContainer.querySelector('.refresh-ai-button')) {
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 Check AI Status';
    refreshButton.className = 'ai-feature-button refresh-ai-button';
    refreshButton.onclick = async () => {
      console.log('Checking AI status...');
      if (window.mealPlanningAI) {
        await window.mealPlanningAI.initializeAI();
        const status = await window.mealPlanningAI.getAIServiceStatus();
        console.log('Updated AI status:', status);
        
        if (status.available) {
          location.reload(); // Reload to enable AI features
        } else {
          alert(`AI Status: ${status.statusMessage || 'Still not available'}`);
        }
      }
    };
    
    controlsContainer.appendChild(refreshButton);
  }
}

// Show notification for basic plan generation
function showBasicPlanNotification() {
  const notification = document.createElement('div');
  notification.className = 'basic-plan-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h4>🎉 Smart Plan Generated!</h4>
      <p>Created using enhanced local planning with preference learning</p>
      <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Add AI insights to the UI
async function addAIInsightsToUI() {
  try {
    const insights = await window.mealPlanningAI?.getInsights();
    
    if (insights && insights.length > 0) {
      // Create AI insights section
      const insightsContainer = document.createElement('div');
      insightsContainer.id = 'ai-insights';
      insightsContainer.className = 'ai-insights-container';
      insightsContainer.innerHTML = `
        <h3>🤖 AI Insights <span class="ai-status online">Online</span></h3>
        <div class="insights-list">
          ${insights.map(insight => `<p class="insight-item">${insight}</p>`).join('')}
        </div>
      `;
      
      // Add to the main container
      const mainContainer = document.querySelector('.container') || document.body;
      mainContainer.appendChild(insightsContainer);
    }
  } catch (error) {
    console.warn('Failed to add AI insights to UI:', error);
    addAIStatusIndicator('offline');
  }
}

// Add AI status indicator
function addAIStatusIndicator(status = 'offline') {
  const header = document.querySelector('.app-header');
  if (header && !header.querySelector('.ai-status-indicator')) {
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'ai-status-indicator';
    statusIndicator.innerHTML = `
      <span class="ai-status ${status}">
        AI ${status === 'online' ? '🟢' : '🔴'} ${status}
      </span>
    `;
    header.appendChild(statusIndicator);
  }
}

// Set up AI-powered meal generation
function setupAIMealGeneration() {
  // Override the existing meal generation with AI-powered version
  const originalGeneratePlan = window.generatePlan;
  
  window.generatePlan = async function(user, foods, pinnedMeals, dislikedMeals, callback) {
    try {
      if (window.mealPlanningAI) {
        const aiPlan = await window.mealPlanningAI.generateAIWeeklyPlan(foods, {
          pinnedMeals,
          dislikedMeals,
          aiPreferences,
          user
        });
        
        if (aiPlan && aiPlan.weeklyPlan) {
          // Update UI with AI-generated plan
          updateUIWithAIPlan(aiPlan);
          
          // Update user stats
          userStats.totalMealsGenerated += Object.keys(aiPlan.weeklyPlan).length;
          if (aiPlan.mlEnhanced) {
            userStats.mlEnhancedCount++;
          }
          updateProfileStats();
          
          callback(aiPlan);
          return;
        }
      }
      
      // Fallback to original method
      if (originalGeneratePlan) {
        originalGeneratePlan(user, foods, pinnedMeals, dislikedMeals, callback);
      }
    } catch (error) {
      console.warn('AI meal generation failed, using fallback:', error);
      if (originalGeneratePlan) {
        originalGeneratePlan(user, foods, pinnedMeals, dislikedMeals, callback);
      }
    }
  };
}

// Update UI with AI-generated plan
function updateUIWithAIPlan(aiPlan) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach((day, index) => {
    const dayPlan = aiPlan.weeklyPlan[day];
    if (dayPlan) {
      const mealElement = document.getElementById(`mealText${index}`);
      if (mealElement) {
        mealElement.textContent = dayPlan.meal;
        
        // Add AI metadata
        mealElement.setAttribute('data-cooking-time', dayPlan.cookingTime || '');
        mealElement.setAttribute('data-difficulty', dayPlan.difficulty || '');
        mealElement.setAttribute('data-nutrition', dayPlan.nutrition || '');
        
        // Add ML enhancement indicator
        if (dayPlan.mlEnhanced || aiPlan.mlEnhanced) {
          const mlIndicator = document.createElement('span');
          mlIndicator.className = 'ml-indicator';
          mlIndicator.innerHTML = '🧠 ML';
          mlIndicator.title = `ML Score: ${Math.round((dayPlan.mlScore || 0.85) * 100)}% - Enhanced by machine learning`;
          
          // Clear existing indicators
          const existingIndicator = mealElement.parentNode.querySelector('.ml-indicator');
          if (existingIndicator) {
            existingIndicator.remove();
          }
          
          mealElement.parentNode.appendChild(mlIndicator);
        }
      }
    }
  });
  
  // Update shopping list if available
  if (aiPlan.shoppingList) {
    updateShoppingListUI(aiPlan.shoppingList);
  }
  
  // Show AI recommendations with ML insights
  if (aiPlan.recommendations) {
    showAIRecommendations(aiPlan.recommendations, aiPlan.mlEnhanced, aiPlan.confidenceScore);
  }
  
  // Show nutrition analysis if available
  if (aiPlan.nutritionSummary && aiPlan.nutritionSummary.balanceScore) {
    showNutritionAnalysis(aiPlan.nutritionSummary);
  }
}

// Update shopping list UI
function updateShoppingListUI(shoppingList) {
  let shoppingContainer = document.getElementById('ai-shopping-list');
  
  if (!shoppingContainer) {
    shoppingContainer = document.createElement('div');
    shoppingContainer.id = 'ai-shopping-list';
    shoppingContainer.className = 'ai-shopping-container';
    
    const mainContainer = document.querySelector('.container') || document.body;
    mainContainer.appendChild(shoppingContainer);
  }
  
  shoppingContainer.innerHTML = `
    <h3>🛒 AI-Generated Shopping List</h3>
    <div class="shopping-list">
      ${shoppingList.map(item => `<div class="shopping-item">${item}</div>`).join('')}
    </div>
  `;
}

// Show AI recommendations with ML enhancements
function showAIRecommendations(recommendations, mlEnhanced = false, confidenceScore = null) {
  let recommendationsContainer = document.getElementById('ai-recommendations');
  
  if (!recommendationsContainer) {
    recommendationsContainer = document.createElement('div');
    recommendationsContainer.id = 'ai-recommendations';
    recommendationsContainer.className = 'ai-recommendations-container';
    
    const mainContainer = document.querySelector('.container') || document.body;
    mainContainer.appendChild(recommendationsContainer);
  }
  
  let headerText = '💡 AI Recommendations';
  let headerClass = '';
  
  if (mlEnhanced) {
    headerText = '🧠 ML-Enhanced Recommendations';
    headerClass = ' ml-enhanced';
  }
  
  let confidenceDisplay = '';
  if (confidenceScore) {
    const percentage = Math.round(confidenceScore * 100);
    confidenceDisplay = `<div class="confidence-score">Confidence: ${percentage}%</div>`;
  }
  
  recommendationsContainer.innerHTML = `
    <h3 class="recommendations-header${headerClass}">${headerText}</h3>
    ${confidenceDisplay}
    <div class="recommendations-list">
      ${recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('')}
    </div>
  `;
}

// Show nutrition analysis
function showNutritionAnalysis(nutritionSummary) {
  let nutritionContainer = document.getElementById('nutrition-analysis');
  
  if (!nutritionContainer) {
    nutritionContainer = document.createElement('div');
    nutritionContainer.id = 'nutrition-analysis';
    nutritionContainer.className = 'nutrition-analysis-container';
    
    const recommendationsContainer = document.getElementById('ai-recommendations');
    if (recommendationsContainer) {
      recommendationsContainer.parentNode.insertBefore(nutritionContainer, recommendationsContainer.nextSibling);
    } else {
      const mainContainer = document.querySelector('.container') || document.body;
      mainContainer.appendChild(nutritionContainer);
    }
  }
  
  const balanceScore = nutritionSummary.balanceScore || 0;
  const balanceClass = balanceScore >= 80 ? 'excellent' : balanceScore >= 60 ? 'good' : 'needs-improvement';
  
  let gapsDisplay = '';
  if (nutritionSummary.gaps && nutritionSummary.gaps.length > 0) {
    gapsDisplay = `<div class="nutrition-gaps">⚠️ Consider adding: ${nutritionSummary.gaps.join(', ')}</div>`;
  }
  
  nutritionContainer.innerHTML = `
    <h3>📊 Nutrition Analysis</h3>
    <div class="nutrition-balance">
      <div class="balance-score ${balanceClass}">
        Balance Score: ${balanceScore}%
      </div>
    </div>
    ${gapsDisplay}
  `;
}

// Enable smart features
function enableSmartFeatures() {
  // Add smart substitution button
  addSmartSubstitutionFeature();
  
  // Add recipe enhancement feature
  addRecipeEnhancementFeature();
  
  // Add nutrition guidance feature
  addNutritionGuidanceFeature();
}

// Add smart substitution feature
function addSmartSubstitutionFeature() {
  const mealElements = document.querySelectorAll('[id^="mealText"]');
  
  mealElements.forEach((element, index) => {
    const substitutionButton = document.createElement('button');
    substitutionButton.textContent = '🔄 Smart Substitutions';
    substitutionButton.className = 'ai-feature-button';
    substitutionButton.onclick = () => handleSmartSubstitutions(index);
    
    element.parentNode.appendChild(substitutionButton);
  });
}

// Handle smart substitutions
async function handleSmartSubstitutions(dayIndex) {
  try {
    const mealText = document.getElementById(`mealText${dayIndex}`).textContent;
    const unavailableIngredients = prompt('Enter unavailable ingredients (comma-separated):');
    
    if (unavailableIngredients && window.mealPlanningAI) {
      const substitutions = await window.mealPlanningAI.getSmartSubstitutions(
        mealText,
        unavailableIngredients.split(',').map(s => s.trim())
      );
      
      if (substitutions) {
        showSubstitutionModal(substitutions);
      }
    }
  } catch (error) {
    console.error('Smart substitution failed:', error);
  }
}

// Show substitution modal
function showSubstitutionModal(substitutions) {
  const modal = document.createElement('div');
  modal.className = 'ai-modal';
  modal.innerHTML = `
    <div class="ai-modal-content">
      <h3>Smart Substitutions</h3>
      <div class="substitutions-list">
        ${Object.entries(substitutions.substitutions || {}).map(([original, substitute]) => 
          `<div class="substitution-item">
            <strong>${original}</strong> → ${substitute}
          </div>`
        ).join('')}
      </div>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Add recipe enhancement feature
function addRecipeEnhancementFeature() {
  const enhanceButton = document.createElement('button');
  enhanceButton.textContent = '✨ Enhance Recipes';
  enhanceButton.className = 'ai-feature-button global-ai-button';
  enhanceButton.onclick = handleRecipeEnhancement;
  
  const controlsContainer = document.querySelector('.controls') || document.body;
  controlsContainer.appendChild(enhanceButton);
}

// Handle recipe enhancement
async function handleRecipeEnhancement() {
  try {
    const recipe = prompt('Enter a recipe to enhance:');
    
    if (recipe && window.mealPlanningAI) {
      const enhancement = await window.mealPlanningAI.enhanceRecipe(recipe);
      
      if (enhancement) {
        showEnhancementModal(enhancement);
      }
    }
  } catch (error) {
    console.error('Recipe enhancement failed:', error);
  }
}

// Show enhancement modal
function showEnhancementModal(enhancement) {
  const modal = document.createElement('div');
  modal.className = 'ai-modal';
  modal.innerHTML = `
    <div class="ai-modal-content">
      <h3>Recipe Enhancement</h3>
      <div class="enhancement-details">
        <p><strong>Difficulty:</strong> ${enhancement.difficulty || 'N/A'}/5</p>
        <p><strong>Prep Time:</strong> ${enhancement.prepTime || 'N/A'}</p>
        <p><strong>Cook Time:</strong> ${enhancement.cookTime || 'N/A'}</p>
        <p><strong>Cost:</strong> ${enhancement.cost || 'N/A'}</p>
        <div class="improvements">
          <h4>Suggested Improvements:</h4>
          ${(enhancement.improvements || []).map(imp => `<p>• ${imp}</p>`).join('')}
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Add nutrition guidance feature
function addNutritionGuidanceFeature() {
  const nutritionButton = document.createElement('button');
  nutritionButton.textContent = '🥗 Nutrition Guidance';
  nutritionButton.className = 'ai-feature-button global-ai-button';
  nutritionButton.onclick = handleNutritionGuidance;
  
  const controlsContainer = document.querySelector('.controls') || document.body;
  controlsContainer.appendChild(nutritionButton);
}

// Handle nutrition guidance
async function handleNutritionGuidance() {
  try {
    if (window.mealPlanningAI) {
      const guidance = await window.mealPlanningAI.getNutritionGuidance();
      
      if (guidance) {
        showNutritionGuidanceModal(guidance);
      }
    }
  } catch (error) {
    console.error('Nutrition guidance failed:', error);
  }
}

// Show nutrition guidance modal
function showNutritionGuidanceModal(guidance) {
  const modal = document.createElement('div');
  modal.className = 'ai-modal';
  modal.innerHTML = `
    <div class="ai-modal-content">
      <h3>Nutrition Guidance</h3>
      <div class="nutrition-recommendations">
        <h4>Recommendations:</h4>
        ${(guidance.recommendations || []).map(rec => `<p>• ${rec}</p>`).join('')}
      </div>
      <div class="daily-targets">
        <h4>Daily Targets:</h4>
        <p>Calories: ${guidance.dailyTargets?.calories || 'N/A'}</p>
        <p>Protein: ${guidance.dailyTargets?.protein || 'N/A'}g</p>
        <p>Carbs: ${guidance.dailyTargets?.carbs || 'N/A'}g</p>
        <p>Fat: ${guidance.dailyTargets?.fat || 'N/A'}g</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Initialize Firebase when the app starts
/**
 * Initialize performance optimization systems
 * Sets up advanced image optimization, progressive loading, and Firebase query optimization
 */

    // Setup progressive loading for existing content
    setupProgressiveContentLoading();

    // Setup image optimization for existing images
    setupImageOptimization();

    // Setup performance monitoring integration
    if (typeof setupPerformanceMonitoringIntegration === 'function') {
      setupPerformanceMonitoringIntegration();
    } else {
      console.log('Performance monitoring integration not available');
    }




/**
 * Setup progressive content loading for meal suggestions and other content
 */
function setupProgressiveContentLoading() {
  try {
    // Register meal suggestion containers for progressive loading
    const mealContainers = document.querySelectorAll('[data-content-type="meals"]');
    mealContainers.forEach(container => {
      progressiveLoadingManager.registerContent(container, 'meals', {
        priority: 'high',
        useCache: true,
        prefetch: true
      });
    });

    // Register recipe detail containers
    const recipeContainers = document.querySelectorAll('[data-content-type="recipe"]');
    recipeContainers.forEach(container => {
      progressiveLoadingManager.registerContent(container, 'recipe', {
        priority: 'normal',
        useCache: true
      });
    });

    // Register nutrition data containers
    const nutritionContainers = document.querySelectorAll('[data-content-type="nutrition"]');
    nutritionContainers.forEach(container => {
      progressiveLoadingManager.registerContent(container, 'nutrition', {
        priority: 'normal',
        useCache: true,
        cacheTTL: 600000 // 10 minutes
      });
    });

    // Register shopping list containers
    const shoppingContainers = document.querySelectorAll('[data-content-type="shopping"]');
    shoppingContainers.forEach(container => {
      progressiveLoadingManager.registerContent(container, 'shopping', {
        priority: 'normal',
        useCache: true,
        cacheTTL: 120000 // 2 minutes
      });
    });

    console.log('Progressive content loading setup complete');

  } catch (error) {
    console.error('Failed to setup progressive content loading:', error);
  }
}

/**
 * Setup image optimization for existing and new images
 */
function setupImageOptimization() {
  try {
    // Mark critical images (hero images, above-the-fold content)
    const heroImages = document.querySelectorAll('.hero-image, .main-image, .featured-image');
    heroImages.forEach(img => {
      img.setAttribute('data-critical', 'true');
    });

    // Setup responsive images for meal cards
    const mealImages = document.querySelectorAll('.meal-card img, .recipe-image');
    mealImages.forEach(img => {
      img.setAttribute('data-responsive', 'true');
    });

    // The image optimizer automatically processes all images on the page
    console.log('Image optimization setup complete');

  } catch (error) {
    console.error('Failed to setup image optimization:', error);
  }
}


const initializeApp = async () => {
  console.log('App.js: Starting modular app initialization...');
  try {
    // Initialize Firebase
    console.log('App.js: Getting Firebase instance...');
    const { auth, db, functions, generativeModel } = await getFirebaseInstance();
    console.log('App.js: Firebase instance obtained', { auth: !!auth, db: !!db });
    
    // Initialize AI services in background
    console.log('App.js: Starting AI initialization...');
    firebaseAI.initialize().then(() => {
      console.log('App.js: AI initialization completed successfully');
    }).catch(error => {
      console.warn('App.js: AI service initialization failed, continuing without AI:', error);
    });
    
    // Set up authentication listeners
    console.log('App.js: Setting up auth and database listeners...');
    setupAuthListeners(auth);
    setupDatabaseListeners(db);
    
    // Use the new modular app initializer
    console.log('App.js: Delegating to modular app initializer...');
    await appInitializer.initialize();
    
    
    
    // Auth state handler is now set up in appInitializer
    
    // Show ML status indicator
    console.log('App.js: Showing ML status...');
    showMLStatusIndicator();
    
    console.log('App.js: Modular app initialized successfully');
  } catch (error) {
    console.error('App.js: Failed to initialize app:', error);
    showInitializationError();
  }
};

// Helper function to update loading message
function updateLoadingMessage(message) {
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Initialize the app with loading states
const initializeAppWithLoading = async () => {
  // Show initial loading overlay
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
  
  try {
    updateLoadingMessage('Starting application...');
    await initializeApp();
    
    // Hide loading overlay with a slight delay for smooth transition
    updateLoadingMessage('Ready!');
    setTimeout(() => {
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 500);
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    updateLoadingMessage('Initialization failed. Please refresh the page.');
  }
};

// Start the application
initializeAppWithLoading();

// Enhanced Navigation Functions
function setupEnhancedNavigation() {
  console.log('Setting up enhanced navigation...');
  
  // Add keyboard navigation for tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((button, index) => {
    button.addEventListener('keydown', (e) => {
      let targetIndex = index;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (index + 1) % tabButtons.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
          break;
        case 'Home':
          e.preventDefault();
          targetIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          targetIndex = tabButtons.length - 1;
          break;
        default:
          return;
      }
      
      tabButtons[targetIndex].focus();
      tabButtons[targetIndex].click();
    });
  });
  
  // Add visual feedback for active states
  updateActiveTabIndicator();
}

function updateActiveTabIndicator() {
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'tab-ripple';
    activeTab.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentElement) {
        ripple.remove();
      }
    }, 600);
  }
}

// Search Functionality
function setupSearchFunctionality() {
  console.log('Setting up search functionality...');
  
  const searchInput = document.getElementById('mealSearch');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput || !searchResults) {
    console.warn('Search elements not found');
    return;
  }
  
  let searchTimeout;
  let mealHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  
  // Load meal database for search
  const searchDatabase = [
    ...mealHistory,
    // Add some common meals for demonstration
    { name: 'Chicken Stir Fry', type: 'Asian', ingredients: ['chicken', 'vegetables', 'soy sauce'], cookTime: 20 },
    { name: 'Spaghetti Carbonara', type: 'Italian', ingredients: ['pasta', 'eggs', 'bacon', 'cheese'], cookTime: 25 },
    { name: 'Greek Salad', type: 'Mediterranean', ingredients: ['lettuce', 'tomatoes', 'olives', 'feta'], cookTime: 10 },
    { name: 'Beef Tacos', type: 'Mexican', ingredients: ['ground beef', 'tortillas', 'cheese', 'lettuce'], cookTime: 15 },
    { name: 'Caesar Salad', type: 'American', ingredients: ['romaine', 'croutons', 'parmesan', 'caesar dressing'], cookTime: 10 },
    { name: 'Pad Thai', type: 'Asian', ingredients: ['noodles', 'shrimp', 'peanuts', 'lime'], cookTime: 30 },
    { name: 'Margherita Pizza', type: 'Italian', ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil'], cookTime: 45 },
    { name: 'Chicken Curry', type: 'Indian', ingredients: ['chicken', 'curry spices', 'coconut milk', 'rice'], cookTime: 40 }
  ];
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    if (query.length === 0) {
      hideSearchResults();
      return;
    }
    
    if (query.length < 2) {
      return; // Wait for at least 2 characters
    }
    
    // Show clear button
    clearSearchBtn.style.display = 'flex';
    
    // Debounce search
    searchTimeout = setTimeout(() => {
      performSearch(query, searchDatabase);
    }, 300);
  });
  
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    hideSearchResults();
    searchInput.focus();
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideSearchResults();
    }
  });
}

function performSearch(query, database) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;
  
  const lowerQuery = query.toLowerCase();
  
  // Search through meals
  const results = database.filter(meal => {
    return meal.name.toLowerCase().includes(lowerQuery) ||
           meal.type?.toLowerCase().includes(lowerQuery) ||
           meal.ingredients?.some(ingredient => 
             ingredient.toLowerCase().includes(lowerQuery)
           );
  });
  
  displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;
  
  searchResults.style.display = 'block';
  
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-no-results">
        No meals found for "${query}". Try searching for ingredients or cuisine types.
      </div>
    `;
    return;
  }
  
  const resultsHTML = results.slice(0, 8).map(meal => `
    <div class="search-result-item" onclick="selectSearchResult('${meal.name}')" role="button" tabindex="0">
      <div class="search-result-icon">🍽️</div>
      <div class="search-result-content">
        <div class="search-result-title">${meal.name}</div>
        <div class="search-result-description">
          ${meal.type ? `${meal.type} cuisine` : ''}
          ${meal.cookTime ? ` • ${meal.cookTime} mins` : ''}
          ${meal.ingredients ? ` • ${meal.ingredients.slice(0, 3).join(', ')}` : ''}
        </div>
      </div>
    </div>
  `).join('');
  
  searchResults.innerHTML = resultsHTML;
  
  // Add keyboard navigation for results
  const resultItems = searchResults.querySelectorAll('.search-result-item');
  resultItems.forEach((item, index) => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      } else if (e.key === 'ArrowDown' && index < resultItems.length - 1) {
        e.preventDefault();
        resultItems[index + 1].focus();
      } else if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        resultItems[index - 1].focus();
      }
    });
  });
}

function selectSearchResult(mealName) {
  console.log('Selected meal:', mealName);
  
  // Add the meal to the current day or show details
  showToast(`🍽️ ${mealName} selected! You can now pin it to your meal plan.`);
  
  // Hide search results
  hideSearchResults();
  
  // Clear search
  const searchInput = document.getElementById('mealSearch');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.style.display = 'none';
  
  // You could extend this to actually add the meal to a specific day
  // or show a modal with meal details
}

function hideSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.style.display = 'none';
  }
}

// Enhanced tab switching with better visual feedback
function showTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  tabButtons.forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('tabindex', '-1');
  });
  
  // Show selected tab
  const selectedContent = document.getElementById(tabName);
  const selectedButton = document.getElementById(tabName + '-btn');
  
  if (selectedContent && selectedButton) {
    selectedContent.classList.add('active');
    selectedButton.classList.add('active');
    selectedButton.setAttribute('aria-selected', 'true');
    selectedButton.setAttribute('tabindex', '0');
    
    // Update visual indicator
    updateActiveTabIndicator();
    
    // Focus management for accessibility
    selectedContent.focus();
    
    // Save current tab to localStorage
    localStorage.setItem('activeTab', tabName);
    
    // Trigger any tab-specific initialization
    initializeTabContent(tabName);
  }
}

function initializeTabContent(tabName) {
  switch (tabName) {
    case 'myFoods':
      // Refresh foods list if needed
      if (typeof renderFoodsListWrapper === 'function') {
        renderFoodsListWrapper();
      }
      break;
    case 'preferences':
      // Load current preferences
      loadAIPreferences();
      break;
    case 'shoppingList':
      // Initialize shopping list functionality
      setupShoppingListFeatures();
      break;
    case 'substitutions':
      // Initialize ingredient substitution functionality
      initializeSubstitutionsIfNeeded();
      break;
    case 'nutrition':
      // Initialize enhanced nutrition tracking functionality
      initializeEnhancedNutritionIfNeeded();
      break;
    case 'seasonal':
      // Initialize seasonal ingredients functionality
      setupSeasonalFeatures();
      break;
    case 'calendar':
      // Initialize calendar integration functionality
      initializeCalendarIfNeeded();
      break;
    case 'community':
      // Initialize community functionality if needed
      initializeCommunityIfNeeded();
      break;
    case 'family':
      // Initialize family functionality if needed
      initializeFamilyIfNeeded();
      break;
    case 'profile':
      // Update profile stats and setup meal management
      updateProfileStats();
      setupMealManagement();
      break;
    default:
      break;
  }
}

function setupMealManagement() {
  console.log('Setting up meal management features...');
  
  // Setup history controls
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      if (typeof displayMealHistory === 'function') {
        // Import the function from uiManager if needed
        import('./uiManager.js').then(module => {
          module.displayMealHistory();
        });
      }
    });
  }
  
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (typeof clearMealHistory === 'function') {
        import('./uiManager.js').then(module => {
          module.clearMealHistory();
        });
      }
    });
  }
  
  // Setup bulk operations
  const bulkPinBtn = document.getElementById('bulkPinBtn');
  const bulkUnpinBtn = document.getElementById('bulkUnpinBtn');
  const bulkRateBtn = document.getElementById('bulkRateBtn');
  
  if (bulkPinBtn) {
    bulkPinBtn.addEventListener('click', () => showBulkOperationModal('pin'));
  }
  
  if (bulkUnpinBtn) {
    bulkUnpinBtn.addEventListener('click', () => showBulkOperationModal('unpin'));
  }
  
  if (bulkRateBtn) {
    bulkRateBtn.addEventListener('click', () => showBulkOperationModal('rate'));
  }
  
  // Setup bulk modal controls
  const applyBulkBtn = document.getElementById('applyBulkOperation');
  const cancelBulkBtn = document.getElementById('cancelBulkOperation');
  
  if (applyBulkBtn) {
    applyBulkBtn.addEventListener('click', applyBulkOperation);
  }
  
  if (cancelBulkBtn) {
    cancelBulkBtn.addEventListener('click', closeBulkModal);
  }
}

function showBulkOperationModal(operation) {
  const modal = document.getElementById('bulkOperationsModal');
  const content = document.getElementById('bulkOperationContent');
  const title = document.getElementById('bulk-modal-title');
  
  if (!modal || !content || !title) return;
  
  // Get current meal plan data
  const mealHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  const pinnedMeals = JSON.parse(localStorage.getItem('pinnedMeals') || '[]');
  const currentMeals = getAllCurrentMeals(); // Get meals from current week view
  
  let modalContent = '';
  
  switch (operation) {
    case 'pin':
      title.textContent = 'Bulk Pin Meals';
      modalContent = createBulkPinInterface(currentMeals, pinnedMeals);
      break;
    case 'unpin':
      title.textContent = 'Bulk Unpin Meals';
      modalContent = createBulkUnpinInterface(pinnedMeals);
      break;
    case 'rate':
      title.textContent = 'Bulk Rate Meals';
      modalContent = createBulkRateInterface(currentMeals);
      break;
  }
  
  content.innerHTML = modalContent;
  modal.style.display = 'flex';
  modal.setAttribute('data-operation', operation);
  
  // Focus management
  const firstCheckbox = modal.querySelector('input[type="checkbox"]');
  if (firstCheckbox) firstCheckbox.focus();
}

function getAllCurrentMeals() {
  // Extract meals from the current calendar view
  const mealElements = document.querySelectorAll('.recipe-name');
  const meals = [];
  
  mealElements.forEach(element => {
    const mealName = element.textContent.trim();
    if (mealName) {
      meals.push({ name: mealName });
    }
  });
  
  return meals;
}

function createBulkPinInterface(meals, pinnedMeals) {
  const pinnedNames = pinnedMeals.map(meal => meal.name);
  const unpinnedMeals = meals.filter(meal => !pinnedNames.includes(meal.name));
  
  if (unpinnedMeals.length === 0) {
    return '<p>All current meals are already pinned!</p>';
  }
  
  return `
    <p>Select meals to pin to your favorites:</p>
    <div class="bulk-meal-list">
      ${unpinnedMeals.map(meal => `
        <label class="bulk-meal-item">
          <input type="checkbox" value="${meal.name}" data-meal="${meal.name}">
          <span class="meal-name">${meal.name}</span>
        </label>
      `).join('')}
    </div>
    <div class="bulk-actions">
      <button type="button" onclick="selectAllBulkItems(true)">Select All</button>
      <button type="button" onclick="selectAllBulkItems(false)">Select None</button>
    </div>
  `;
}

function createBulkUnpinInterface(pinnedMeals) {
  if (pinnedMeals.length === 0) {
    return '<p>No pinned meals to unpin!</p>';
  }
  
  return `
    <p>Select pinned meals to remove:</p>
    <div class="bulk-meal-list">
      ${pinnedMeals.map(meal => `
        <label class="bulk-meal-item">
          <input type="checkbox" value="${meal.name}" data-meal="${meal.name}">
          <span class="meal-name">${meal.name}</span>
        </label>
      `).join('')}
    </div>
    <div class="bulk-actions">
      <button type="button" onclick="selectAllBulkItems(true)">Select All</button>
      <button type="button" onclick="selectAllBulkItems(false)">Select None</button>
    </div>
  `;
}

function createBulkRateInterface(meals) {
  const mealRatings = JSON.parse(localStorage.getItem('mealRatings') || '{}');
  
  return `
    <p>Rate multiple meals at once:</p>
    <div class="bulk-rating-section">
      <div class="rating-selector">
        <label>Rating to apply:</label>
        <select id="bulkRatingValue">
          <option value="1">⭐ 1 Star</option>
          <option value="2">⭐⭐ 2 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="4" selected>⭐⭐⭐⭐ 4 Stars</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
        </select>
      </div>
      <div class="bulk-meal-list">
        ${meals.map(meal => `
          <label class="bulk-meal-item">
            <input type="checkbox" value="${meal.name}" data-meal="${meal.name}">
            <span class="meal-name">${meal.name}</span>
            <span class="current-rating">${mealRatings[meal.name] ? '⭐'.repeat(mealRatings[meal.name]) : 'Not rated'}</span>
          </label>
        `).join('')}
      </div>
      <div class="bulk-actions">
        <button type="button" onclick="selectAllBulkItems(true)">Select All</button>
        <button type="button" onclick="selectAllBulkItems(false)">Select None</button>
      </div>
    </div>
  `;
}

function selectAllBulkItems(select) {
  const checkboxes = document.querySelectorAll('#bulkOperationContent input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = select;
  });
}

function applyBulkOperation() {
  const modal = document.getElementById('bulkOperationsModal');
  const operation = modal.getAttribute('data-operation');
  const selectedMeals = Array.from(
    document.querySelectorAll('#bulkOperationContent input[type="checkbox"]:checked')
  ).map(checkbox => checkbox.getAttribute('data-meal'));
  
  if (selectedMeals.length === 0) {
    alert('Please select at least one meal.');
    return;
  }
  
  switch (operation) {
    case 'pin':
      applyBulkPin(selectedMeals);
      break;
    case 'unpin':
      applyBulkUnpin(selectedMeals);
      break;
    case 'rate':
      const rating = document.getElementById('bulkRatingValue')?.value;
      if (rating) {
        applyBulkRating(selectedMeals, parseInt(rating));
      }
      break;
  }
  
  closeBulkModal();
}

function applyBulkPin(mealNames) {
  const pinnedMeals = JSON.parse(localStorage.getItem('pinnedMeals') || '[]');
  
  mealNames.forEach(mealName => {
    if (!pinnedMeals.some(meal => meal.name === mealName)) {
      pinnedMeals.push({ name: mealName });
      // Save to history
      saveMealToHistoryHelper(mealName, 'pinned');
    }
  });
  
  localStorage.setItem('pinnedMeals', JSON.stringify(pinnedMeals));
  showToastHelper(`📌 Pinned ${mealNames.length} meal${mealNames.length > 1 ? 's' : ''}!`);
}

function applyBulkUnpin(mealNames) {
  const pinnedMeals = JSON.parse(localStorage.getItem('pinnedMeals') || '[]');
  
  mealNames.forEach(mealName => {
    const index = pinnedMeals.findIndex(meal => meal.name === mealName);
    if (index > -1) {
      pinnedMeals.splice(index, 1);
      saveMealToHistoryHelper(mealName, 'unpinned');
    }
  });
  
  localStorage.setItem('pinnedMeals', JSON.stringify(pinnedMeals));
  showToastHelper(`📍 Unpinned ${mealNames.length} meal${mealNames.length > 1 ? 's' : ''}!`);
}

function applyBulkRating(mealNames, rating) {
  const mealRatings = JSON.parse(localStorage.getItem('mealRatings') || '{}');
  
  mealNames.forEach(mealName => {
    mealRatings[mealName] = rating;
    saveMealToHistoryHelper(mealName, 'rated', { rating });
  });
  
  localStorage.setItem('mealRatings', JSON.stringify(mealRatings));
  showToastHelper(`⭐ Rated ${mealNames.length} meal${mealNames.length > 1 ? 's' : ''} with ${rating} star${rating > 1 ? 's' : ''}!`);
}

function closeBulkModal() {
  const modal = document.getElementById('bulkOperationsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Helper functions for meal management
function saveMealToHistoryHelper(mealName, action, metadata = {}) {
  const mealHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  
  const historyEntry = {
    mealName,
    action,
    timestamp: new Date().toISOString(),
    date: new Date().toDateString(),
    ...metadata
  };
  
  mealHistory.unshift(historyEntry);
  
  if (mealHistory.length > 100) {
    mealHistory.splice(100);
  }
  
  localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
}

function showToastHelper(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Shopping List Feature Setup
function setupShoppingListFeatures() {
  console.log('Setting up shopping list features...');
  
  // Setup generate shopping list button
  const generateBtn = document.getElementById('generateShoppingListBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateShoppingListFromPlan);
  }
  
  // Setup owned items functionality
  const addOwnedBtn = document.getElementById('addOwnedItemBtn');
  const ownedInput = document.getElementById('ownedItemInput');
  
  if (addOwnedBtn && ownedInput) {
    addOwnedBtn.addEventListener('click', addOwnedItem);
    ownedInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addOwnedItem();
      }
    });
  }
  
  // Setup list action buttons
  const printBtn = document.getElementById('printListBtn');
  const shareBtn = document.getElementById('shareListBtn');
  const saveBtn = document.getElementById('saveListBtn');
  
  if (printBtn) printBtn.addEventListener('click', printShoppingList);
  if (shareBtn) shareBtn.addEventListener('click', shareShoppingList);
  if (saveBtn) saveBtn.addEventListener('click', saveShoppingListToHistory);
  
  // Load owned items and shopping history
  loadOwnedItems();
  loadShoppingHistory();
}

// Nutrition Tracking Feature Setup
function setupNutritionFeatures() {
  console.log('Setting up nutrition tracking features...');
  
  // Setup nutrition goal selection
  const goalSelect = document.getElementById('nutritionGoalSelect');
  if (goalSelect) {
    goalSelect.addEventListener('change', (e) => {
      nutritionTracker.setNutritionGoal(e.target.value);
      showToastHelper(`🎯 Nutrition goal set to: ${e.target.value.replace('-', ' ')}`, 'success');
      
      // Re-analyze current plan if available
      const currentPlan = getCurrentMealPlan();
      if (currentPlan && currentPlan.length > 0) {
        analyzeCurrentMealPlanNutrition();
      }
    });
    
    // Set current goal
    const currentGoal = localStorage.getItem('nutritionGoal') || 'default';
    goalSelect.value = currentGoal;
  }
  
  // Setup analyze nutrition button
  const analyzeBtn = document.getElementById('analyzeNutritionBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeCurrentMealPlanNutrition);
  }
  
  // Setup view history button
  const historyBtn = document.getElementById('viewNutritionHistoryBtn');
  if (historyBtn) {
    historyBtn.addEventListener('click', showNutritionHistory);
  }
  
  // Setup insights button
  const insightsBtn = document.getElementById('showNutritionInsightsBtn');
  if (insightsBtn) {
    insightsBtn.addEventListener('click', showNutritionInsights);
  }
  
  // Load existing nutrition data
  loadNutritionDashboard();
}

function analyzeCurrentMealPlanNutrition() {
  console.log('🔬 Analyzing nutrition for current meal plan...');
  
  // Get current meal plan
  const currentPlan = getCurrentMealPlan();
  
  if (!currentPlan || currentPlan.length === 0) {
    showToastHelper('❌ No meal plan found. Please generate a meal plan first!', 'error');
    return;
  }
  
  // Show loading state
  const resultsContainer = document.getElementById('nutritionResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div class="loading-spinner">🔄 Analyzing nutrition...</div>';
  }
  
  try {
    // Analyze nutrition using nutrition tracker
    const nutritionAnalysis = nutritionTracker.analyzeMealPlanNutrition(currentPlan);
    
    // Display results
    displayNutritionAnalysis(nutritionAnalysis);
    
    // Save to history
    nutritionTracker.saveNutritionAnalysis(nutritionAnalysis);
    
    showToastHelper('✅ Nutrition analysis completed!', 'success');
    
  } catch (error) {
    console.error('Error analyzing nutrition:', error);
    showToastHelper('❌ Error analyzing nutrition. Please try again.', 'error');
    
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="error-message">❌ Error analyzing nutrition</div>';
    }
  }
}

function displayNutritionAnalysis(analysis) {
  const resultsContainer = document.getElementById('nutritionResults');
  if (!resultsContainer) return;
  
  const goals = nutritionTracker.getUserNutritionGoals();
  
  // Create comprehensive nutrition display
  resultsContainer.innerHTML = `
    <div class="nutrition-analysis">
      <!-- Overall Score -->
      <div class="nutrition-score">
        <h3>📊 Overall Nutrition Score</h3>
        <div class="score-circle ${getScoreClass(analysis.nutritionScore)}">
          <span class="score-number">${analysis.nutritionScore}</span>
          <span class="score-label">/100</span>
        </div>
        <p class="score-description">${getScoreDescription(analysis.nutritionScore)}</p>
      </div>
      
      <!-- Weekly Averages -->
      <div class="weekly-averages">
        <h3>📈 Daily Averages</h3>
        <div class="nutrient-grid">
          ${Object.entries(analysis.weeklyAverages).map(([nutrient, value]) => `
            <div class="nutrient-item">
              <div class="nutrient-name">${getNutrientDisplayName(nutrient)}</div>
              <div class="nutrient-value">${formatNutrientValue(nutrient, value)}</div>
              <div class="nutrient-goal">Goal: ${formatNutrientValue(nutrient, goals[nutrient])}</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, (value / goals[nutrient]) * 100)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Recommendations -->
      <div class="nutrition-recommendations">
        <h3>💡 Recommendations</h3>
        <div class="recommendation-list">
          ${analysis.recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}">
              <p>${rec.message}</p>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Daily Breakdown -->
      <div class="daily-breakdown">
        <h3>📅 Daily Breakdown</h3>
        <div class="days-container">
          ${analysis.dailyAnalysis.map(day => `
            <div class="day-card">
              <h4>${day.dayName}</h4>
              <div class="day-nutrition">
                <div class="calories">${Math.round(day.dailyNutrition.calories)} cal</div>
                <div class="macros">
                  <span>P: ${Math.round(day.dailyNutrition.protein)}g</span>
                  <span>C: ${Math.round(day.dailyNutrition.carbs)}g</span>
                  <span>F: ${Math.round(day.dailyNutrition.fat)}g</span>
                </div>
              </div>
              ${day.recommendations.length > 0 ? `
                <div class="day-recommendations">
                  ${day.recommendations.slice(0, 2).map(rec => `
                    <small class="${rec.priority}">${rec.message}</small>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="nutrition-actions">
        <button class="btn btn-secondary" onclick="saveCurrentNutritionAnalysis()">
          💾 Save Analysis
        </button>
        <button class="btn btn-secondary" onclick="shareNutritionAnalysis()">
          📤 Share Results
        </button>
        <button class="btn btn-secondary" onclick="exportNutritionPDF()">
          📄 Export PDF
        </button>
      </div>
    </div>
  `;
}

function getScoreClass(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'needs-improvement';
}

function getScoreDescription(score) {
  if (score >= 85) return '🌟 Excellent nutrition balance!';
  if (score >= 70) return '👍 Good nutrition with room for improvement';
  if (score >= 55) return '⚠️ Fair nutrition - consider some adjustments';
  return '🔄 Nutrition needs improvement - review recommendations';
}

function getNutrientDisplayName(nutrient) {
  const names = {
    calories: '🔥 Calories',
    protein: '🥩 Protein',
    carbs: '🍞 Carbs',
    fat: '🥑 Fat',
    fiber: '🌾 Fiber',
    sodium: '🧂 Sodium',
    sugar: '🍯 Sugar'
  };
  return names[nutrient] || nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
}

function formatNutrientValue(nutrient, value) {
  if (nutrient === 'calories') {
    return `${Math.round(value)} cal`;
  } else if (nutrient === 'sodium') {
    return `${Math.round(value)} mg`;
  } else {
    return `${Math.round(value * 10) / 10}g`;
  }
}

function showNutritionHistory() {
  const history = nutritionTracker.getNutritionHistory();
  
  const modal = document.createElement('div');
  modal.className = 'modal nutrition-history-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>📊 Nutrition History</h3>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        ${history.length === 0 ? `
          <p>No nutrition analyses saved yet. Analyze a meal plan to get started!</p>
        ` : `
          <div class="history-list">
            ${history.map(analysis => `
              <div class="history-item">
                <div class="history-header">
                  <span class="history-date">${new Date(analysis.savedDate).toLocaleDateString()}</span>
                  <span class="history-score score-${getScoreClass(analysis.nutritionScore)}">
                    ${analysis.nutritionScore}/100
                  </span>
                </div>
                <div class="history-summary">
                  <span>Avg: ${Math.round(analysis.weeklyAverages.calories)} cal</span>
                  <span>${Math.round(analysis.weeklyAverages.protein)}g protein</span>
                  <span>Goal: ${analysis.goalType}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function showNutritionInsights() {
  const insights = nutritionTracker.generateNutritionInsights();
  
  const modal = document.createElement('div');
  modal.className = 'modal nutrition-insights-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>💡 Nutrition Insights</h3>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        ${insights.insights.length === 0 ? `
          <p>No insights available yet. Analyze more meal plans to see trends!</p>
        ` : `
          <div class="insights-container">
            <div class="insights-summary">
              <h4>Recent Averages</h4>
              <div class="averages-grid">
                <div class="avg-item">
                  <span class="avg-label">Calories</span>
                  <span class="avg-value">${insights.averages?.calories || 0}</span>
                </div>
                <div class="avg-item">
                  <span class="avg-label">Protein</span>
                  <span class="avg-value">${insights.averages?.protein || 0}g</span>
                </div>
                <div class="avg-item">
                  <span class="avg-label">Score</span>
                  <span class="avg-value">${insights.averages?.score || 0}/100</span>
                </div>
              </div>
            </div>
            
            <div class="insights-list">
              <h4>Key Insights</h4>
              ${insights.insights.map(insight => `
                <div class="insight-item">
                  <p>${insight}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function loadNutritionDashboard() {
  // Load recent nutrition data if available
  const history = nutritionTracker.getNutritionHistory();
  
  if (history.length > 0) {
    const latest = history[0];
    // Display quick summary
    const dashboardContainer = document.getElementById('nutritionDashboard');
    if (dashboardContainer) {
      dashboardContainer.innerHTML = `
        <div class="nutrition-summary">
          <h4>Latest Analysis</h4>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Score</span>
              <span class="stat-value">${latest.nutritionScore}/100</span>
            </div>
            <div class="stat">
              <span class="stat-label">Avg Calories</span>
              <span class="stat-value">${Math.round(latest.weeklyAverages.calories)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Date</span>
              <span class="stat-value">${new Date(latest.savedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Nutrition helper functions
function saveCurrentNutritionAnalysis() {
  showToastHelper('💾 Analysis saved to history!', 'success');
}

function shareNutritionAnalysis() {
  if (navigator.share) {
    navigator.share({
      title: 'My Nutrition Analysis',
      text: 'Check out my weekly nutrition analysis from Weekly Recipes!',
      url: window.location.href
    });
  } else {
    // Fallback for browsers without Web Share API
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToastHelper('📋 Link copied to clipboard!', 'success');
  }
}

function exportNutritionPDF() {
  showToastHelper('📄 PDF export feature coming soon!', 'info');
}

function generateShoppingListFromPlan() {
  console.log('🛒 Generating shopping list from current meal plan...');
  
  // Get current meal plan from localStorage or UI
  const currentPlan = getCurrentMealPlan();
  
  if (!currentPlan || currentPlan.length === 0) {
    showToastHelper('❌ No meal plan found. Please generate a meal plan first!', 'error');
    return;
  }
  
  // Get generation options
  const servingSize = document.getElementById('servingSize')?.value || '3-4 people';
  const includePantryItems = document.getElementById('includePantryItems')?.checked || false;
  const excludeOwnedItems = document.getElementById('excludeOwnedItems')?.checked || true;
  const smartConsolidation = document.getElementById('smartConsolidation')?.checked || true;
  
  const options = {
    servingSize,
    includePantryItems,
    excludeOwnedItems,
    smartConsolidation
  };
  
  try {
    // Generate shopping list using the shopping list generator
    const shoppingList = shoppingListGenerator.generateShoppingList(currentPlan, options);
    
    // Display the generated list
    displayShoppingList(shoppingList);
    
    showToastHelper('✅ Shopping list generated successfully!', 'success');
    
  } catch (error) {
    console.error('Error generating shopping list:', error);
    showToastHelper('❌ Failed to generate shopping list. Please try again.', 'error');
  }
}

function getCurrentMealPlan() {
  // Try to get from current week plan display first
  const calendarContainer = document.getElementById('calendar-container');
  if (calendarContainer) {
    const dayColumns = calendarContainer.querySelectorAll('.calendar-day');
    const plan = [];
    
    dayColumns.forEach((dayColumn, index) => {
      const meals = [];
      const mealElements = dayColumn.querySelectorAll('.recipe-name');
      
      mealElements.forEach(mealElement => {
        const mealName = mealElement.textContent.trim();
        if (mealName) {
          meals.push(mealName);
        }
      });
      
      plan.push({ meals });
    });
    
    if (plan.length > 0) {
      return plan;
    }
  }
  
  // Fallback to localStorage
  const storedPlan = localStorage.getItem('currentWeeklyPlan');
  if (storedPlan) {
    try {
      return JSON.parse(storedPlan);
    } catch (error) {
      console.error('Error parsing stored meal plan:', error);
    }
  }
  
  return null;
}

function displayShoppingList(shoppingList) {
  const displayContainer = document.getElementById('shoppingListDisplay');
  const categoriesContainer = document.getElementById('shoppingCategories');
  const tipsContainer = document.getElementById('shoppingTips');
  
  if (!displayContainer || !categoriesContainer || !tipsContainer) {
    console.error('Shopping list display containers not found');
    return;
  }
  
  // Show the display container
  displayContainer.style.display = 'block';
  
  // Update metadata
  document.getElementById('totalItems').textContent = `${shoppingList.totalItems} items`;
  document.getElementById('estimatedCost').textContent = `~$${shoppingList.estimatedCost}`;
  document.getElementById('generatedDate').textContent = new Date(shoppingList.generated).toLocaleDateString();
  
  // Display shopping tips
  tipsContainer.innerHTML = `
    <h4>💡 Shopping Tips</h4>
    ${shoppingList.tips.map(tip => `<div class="tip-item">${tip}</div>`).join('')}
  `;
  
  // Display categorized ingredients
  categoriesContainer.innerHTML = Object.keys(shoppingList.categories).map(category => {
    const ingredients = shoppingList.categories[category];
    return `
      <div class="category-section">
        <div class="category-header">
          <h4>${getCategoryIcon(category)} ${category}</h4>
          <span class="category-count">${ingredients.length}</span>
        </div>
        <div class="ingredient-list">
          ${ingredients.map(ingredient => `
            <div class="ingredient-item">
              <div class="ingredient-info">
                <div class="ingredient-name">${ingredient.name}</div>
                <div class="ingredient-details">
                  ${ingredient.quantity} ${ingredient.unit} • Used in: ${ingredient.usedIn || ingredient.source}
                </div>
              </div>
              <div class="ingredient-actions">
                <div class="ingredient-check" onclick="toggleIngredientCheck(this)">
                  <span class="check-mark" style="display: none;">✓</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryIcon(category) {
  const icons = {
    'Proteins': '🥩',
    'Vegetables': '🥬',
    'Grains & Carbs': '🌾',
    'Dairy': '🥛',
    'Pantry': '🧂',
    'Fruits': '🍎',
    'Frozen': '❄️',
    'Beverages': '🥤',
    'Other': '🛍️'
  };
  return icons[category] || '📦';
}

function toggleIngredientCheck(checkElement) {
  const checkMark = checkElement.querySelector('.check-mark');
  const isChecked = checkElement.classList.contains('checked');
  
  if (isChecked) {
    checkElement.classList.remove('checked');
    checkMark.style.display = 'none';
  } else {
    checkElement.classList.add('checked');
    checkMark.style.display = 'block';
  }
}

function addOwnedItem() {
  const input = document.getElementById('ownedItemInput');
  const itemName = input.value.trim();
  
  if (!itemName) return;
  
  // Get current owned items
  const ownedItems = JSON.parse(localStorage.getItem('ownedIngredients') || '[]');
  
  // Add new item if not already exists
  if (!ownedItems.includes(itemName)) {
    ownedItems.push(itemName);
    localStorage.setItem('ownedIngredients', JSON.stringify(ownedItems));
    
    // Update display
    loadOwnedItems();
    
    showToastHelper(`✅ Added "${itemName}" to owned items`, 'success');
  } else {
    showToastHelper(`ℹ️ "${itemName}" is already in your owned items`, 'info');
  }
  
  // Clear input
  input.value = '';
}

function loadOwnedItems() {
  const container = document.getElementById('ownedItemsList');
  if (!container) return;
  
  const ownedItems = JSON.parse(localStorage.getItem('ownedIngredients') || '[]');
  
  container.innerHTML = ownedItems.map(item => `
    <div class="owned-item-tag">
      <span>${item}</span>
      <button class="remove-btn" onclick="removeOwnedItem('${item}')">×</button>
    </div>
  `).join('');
}

function removeOwnedItem(itemName) {
  const ownedItems = JSON.parse(localStorage.getItem('ownedIngredients') || '[]');
  const updatedItems = ownedItems.filter(item => item !== itemName);
  
  localStorage.setItem('ownedIngredients', JSON.stringify(updatedItems));
  loadOwnedItems();
  
  showToastHelper(`🗑️ Removed "${itemName}" from owned items`, 'success');
}

function printShoppingList() {
  const listContent = document.getElementById('shoppingListDisplay');
  if (!listContent) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Shopping List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .category-section { margin-bottom: 20px; }
          .category-header h4 { color: #333; border-bottom: 2px solid #eee; }
          .ingredient-item { margin: 5px 0; padding: 5px; }
          .ingredient-name { font-weight: bold; }
          .ingredient-details { color: #666; font-size: 0.9em; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>🛒 Shopping List</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        ${document.getElementById('shoppingCategories').innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function shareShoppingList() {
  const currentList = JSON.parse(localStorage.getItem('currentShoppingList') || '{}');
  
  if (navigator.share && Object.keys(currentList).length > 0) {
    // Use Web Share API if available
    const shareText = generateShareText(currentList);
    navigator.share({
      title: 'My Shopping List',
      text: shareText,
    }).catch(console.error);
  } else {
    // Fallback to copying to clipboard
    const shareText = generateShareText(currentList);
    navigator.clipboard.writeText(shareText).then(() => {
      showToastHelper('📋 Shopping list copied to clipboard!', 'success');
    }).catch(() => {
      showToastHelper('❌ Failed to copy shopping list', 'error');
    });
  }
}

function generateShareText(shoppingList) {
  let text = `🛒 Shopping List (${shoppingList.totalItems} items)\n`;
  text += `Generated: ${new Date(shoppingList.generated).toLocaleDateString()}\n\n`;
  
  Object.keys(shoppingList.categories).forEach(category => {
    text += `${getCategoryIcon(category)} ${category}:\n`;
    shoppingList.categories[category].forEach(ingredient => {
      text += `• ${ingredient.name} (${ingredient.quantity} ${ingredient.unit})\n`;
    });
    text += '\n';
  });
  
  return text;
}

function saveShoppingListToHistory() {
  const currentList = JSON.parse(localStorage.getItem('currentShoppingList') || '{}');
  
  if (Object.keys(currentList).length > 0) {
    shoppingListGenerator.saveToHistory(currentList);
    loadShoppingHistory();
    showToastHelper('💾 Shopping list saved to history!', 'success');
  }
}

function loadShoppingHistory() {
  const container = document.getElementById('shoppingHistory');
  if (!container) return;
  
  const history = shoppingListGenerator.getShoppingHistory();
  
  if (history.length === 0) {
    container.innerHTML = '<p>No saved shopping lists yet.</p>';
    return;
  }
  
  container.innerHTML = history.map(list => `
    <div class="history-item" onclick="loadHistoricalList('${list.id}')">
      <div class="history-info">
        <div class="history-title">${list.totalItems} items • $${list.estimatedCost}</div>
        <div class="history-meta">
          Saved: ${new Date(list.savedDate).toLocaleDateString()} • 
          ${list.metadata.mealsIncluded} meals • 
          ${list.metadata.servingSize}
        </div>
      </div>
      <div class="history-actions">
        <button onclick="event.stopPropagation(); deleteHistoricalList('${list.id}')" title="Delete">🗑️</button>
        <button onclick="event.stopPropagation(); shareHistoricalList('${list.id}')" title="Share">📤</button>
      </div>
    </div>
  `).join('');
}

function loadHistoricalList(listId) {
  const history = shoppingListGenerator.getShoppingHistory();
  const list = history.find(l => l.id == listId);
  
  if (list) {
    displayShoppingList(list);
    showToastHelper('📋 Historical shopping list loaded!', 'success');
  }
}

function deleteHistoricalList(listId) {
  const history = shoppingListGenerator.getShoppingHistory();
  const updatedHistory = history.filter(l => l.id != listId);
  
  localStorage.setItem('shoppingListHistory', JSON.stringify(updatedHistory));
  loadShoppingHistory();
  showToastHelper('🗑️ Shopping list deleted from history', 'success');
}

function shareHistoricalList(listId) {
  const history = shoppingListGenerator.getShoppingHistory();
  const list = history.find(l => l.id == listId);
  
  if (list) {
    localStorage.setItem('currentShoppingList', JSON.stringify(list));
    shareShoppingList();
  }
}

// Seasonal Ingredients Feature Setup
function setupSeasonalFeatures() {
  console.log('Setting up seasonal ingredients features...');
  
  // Initialize the seasonal ingredients manager
  let seasonalManager;
  try {
    seasonalManager = new window.SeasonalIngredientsManager();
    console.log('Seasonal ingredients manager initialized');
  } catch (error) {
    console.error('Failed to initialize seasonal manager:', error);
    return;
  }
  
  // Load current seasonal suggestions
  loadSeasonalSuggestions(seasonalManager);
  
  // Setup filter buttons
  setupSeasonalFilters(seasonalManager);
  
  // Setup enhance meal plan button
  const enhanceBtn = document.getElementById('enhanceMealPlanBtn');
  if (enhanceBtn) {
    enhanceBtn.addEventListener('click', () => enhanceCurrentMealPlan(seasonalManager));
  }
  
  // Setup preferences form
  setupSeasonalPreferences(seasonalManager);
}

function loadSeasonalSuggestions(seasonalManager) {
  const suggestions = seasonalManager.getCurrentSeasonalSuggestions({
    recipeIntegration: true
  });
  
  // Update season overview
  updateSeasonOverview(suggestions);
  
  // Display seasonal ingredients
  displaySeasonalIngredients(suggestions);
  
  // Display seasonal tips
  displaySeasonalTips(suggestions.tips);
}

function updateSeasonOverview(suggestions) {
  const titleElement = document.getElementById('currentSeasonTitle');
  const descriptionElement = document.getElementById('currentSeasonDescription');
  const nutritionElement = document.getElementById('nutritionFocusText');
  
  if (titleElement) {
    const seasonEmoji = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️'
    };
    titleElement.textContent = `${seasonEmoji[suggestions.season]} ${suggestions.season.charAt(0).toUpperCase() + suggestions.season.slice(1)} - ${suggestions.month}`;
  }
  
  if (descriptionElement) {
    descriptionElement.textContent = `Discover the freshest ${suggestions.season} ingredients for optimal nutrition and flavor!`;
  }
  
  if (nutritionElement && suggestions.nutritionHighlights) {
    nutritionElement.textContent = `${suggestions.nutritionHighlights.focus} - Key nutrients: ${suggestions.nutritionHighlights.keyNutrients.join(', ')}. ${suggestions.nutritionHighlights.benefits}`;
  }
}

function displaySeasonalIngredients(suggestions) {
  displayIngredientCategory('vegetablesGrid', suggestions.suggestions.vegetables || []);
  displayIngredientCategory('fruitsGrid', suggestions.suggestions.fruits || []);
  displayIngredientCategory('herbsGrid', suggestions.suggestions.herbs || []);
}

function displayIngredientCategory(gridId, ingredients) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  
  if (ingredients.length === 0) {
    grid.innerHTML = '<p class="no-items">No items available for this season.</p>';
    return;
  }
  
  grid.innerHTML = ingredients.map(ingredient => `
    <div class="ingredient-card ${ingredient.isPeak ? 'peak-season' : ''}" data-ingredient="${ingredient.name}">
      <div class="ingredient-header">
        <div class="ingredient-name">${ingredient.name}</div>
        <div class="season-rating">${Math.round(ingredient.seasonRating * 100)}%</div>
      </div>
      
      <div class="nutrition-tags">
        ${ingredient.nutrition.map(nutrient => `
          <span class="nutrition-tag">${nutrient}</span>
        `).join('')}
      </div>
      
      <div class="recipe-suggestions">
        <h5>Recipe Ideas:</h5>
        <div class="recipe-list">
          ${ingredient.recipes.slice(0, 3).map(recipe => `
            <span class="recipe-chip">${recipe}</span>
          `).join('')}
        </div>
      </div>
      
      ${ingredient.mealSuggestions ? `
        <div class="meal-suggestions">
          <h5>Meal Ideas:</h5>
          <div class="meal-list">
            ${ingredient.mealSuggestions.slice(0, 2).map(meal => `
              <div class="meal-type">
                <strong>${meal.type}:</strong> ${meal.suggestions.slice(0, 2).join(', ')}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function displaySeasonalTips(tips) {
  const tipsContainer = document.getElementById('seasonalTipsList');
  if (!tipsContainer) return;
  
  tipsContainer.innerHTML = tips.map(tip => `
    <div class="tip-item">
      <p>${tip}</p>
    </div>
  `).join('');
}

function setupSeasonalFilters(seasonalManager) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const peakOnlyFilter = document.getElementById('peakOnlyFilter');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Apply filter
      applySeasonalFilter(seasonalManager, button.dataset.category, peakOnlyFilter?.checked);
    });
  });
  
  if (peakOnlyFilter) {
    peakOnlyFilter.addEventListener('change', () => {
      const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
      applySeasonalFilter(seasonalManager, activeCategory, peakOnlyFilter.checked);
    });
  }
}

function applySeasonalFilter(seasonalManager, category, peakOnly) {
  const suggestions = seasonalManager.getCurrentSeasonalSuggestions({
    category: category,
    peakOnly: peakOnly,
    recipeIntegration: true
  });
  
  // Show/hide categories based on filter
  const categories = ['vegetables', 'fruits', 'herbs'];
  categories.forEach(cat => {
    const categoryDiv = document.getElementById(`seasonal${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    if (categoryDiv) {
      if (category === 'all' || category === cat) {
        categoryDiv.style.display = 'block';
      } else {
        categoryDiv.style.display = 'none';
      }
    }
  });
  
  // Update displayed ingredients
  displaySeasonalIngredients(suggestions);
}

function enhanceCurrentMealPlan(seasonalManager) {
  const currentPlan = getCurrentMealPlan();
  
  if (!currentPlan || currentPlan.length === 0) {
    showToastHelper('❌ No meal plan found. Please generate a meal plan first!', 'error');
    return;
  }
  
  const enhancements = seasonalManager.enhanceMealPlanWithSeasonal(currentPlan);
  
  if (enhancements.enhancements.length === 0) {
    showToastHelper('✅ Your meal plan already includes great seasonal ingredients!', 'success');
    displayEnhancementResults({ enhancements: [], message: 'Your current meal plan is well-optimized for the season!' });
    return;
  }
  
  displayEnhancementResults(enhancements);
  showToastHelper(`🌱 Found ${enhancements.enhancements.length} seasonal enhancement opportunities!`, 'success');
}

function displayEnhancementResults(results) {
  const container = document.getElementById('mealPlanEnhancements');
  if (!container) return;
  
  if (results.message) {
    container.innerHTML = `
      <div class="enhancement-item">
        <div class="enhancement-message">
          <h4>✅ Great job!</h4>
          <p>${results.message}</p>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="enhancement-header">
      <h4>🌱 Seasonal Enhancement Suggestions</h4>
      <p>Add these seasonal ingredients to boost nutrition and flavor:</p>
    </div>
    
    ${results.enhancements.map(enhancement => `
      <div class="enhancement-item">
        <div class="enhancement-meal">${enhancement.mealName}</div>
        ${enhancement.suggestions.map(suggestion => `
          <div class="enhancement-suggestion">
            <span class="enhancement-icon">🌿</span>
            <div class="enhancement-text">
              <strong>Add ${suggestion.ingredient}:</strong> ${suggestion.suggestion}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
    
    <div class="implementation-tips">
      <h5>💡 Implementation Tips:</h5>
      <ul>
        ${results.implementationTips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>
  `;
}

function setupSeasonalPreferences(seasonalManager) {
  const regionSelect = document.getElementById('regionSelect');
  const nutritionFocusSelect = document.getElementById('nutritionFocusSelect');
  const autoEnhanceToggle = document.getElementById('autoEnhanceToggle');
  const saveButton = document.getElementById('saveSeasonalPrefsBtn');
  
  // Load existing preferences
  const existingPrefs = seasonalManager.getSeasonalPreferences();
  if (regionSelect && existingPrefs.region) {
    regionSelect.value = existingPrefs.region;
  }
  if (nutritionFocusSelect && existingPrefs.nutritionFocus) {
    nutritionFocusSelect.value = existingPrefs.nutritionFocus;
  }
  if (autoEnhanceToggle && existingPrefs.autoEnhance !== undefined) {
    autoEnhanceToggle.checked = existingPrefs.autoEnhance;
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const preferences = {
        region: regionSelect?.value || 'northern',
        nutritionFocus: nutritionFocusSelect?.value || '',
        autoEnhance: autoEnhanceToggle?.checked || false
      };
      
      seasonalManager.saveSeasonalPreferences(preferences);
      showToastHelper('💾 Seasonal preferences saved!', 'success');
      
      // Reload suggestions with new preferences
      loadSeasonalSuggestions(seasonalManager);
    });
  }
}

// Make functions globally available for inline handlers
window.toggleIngredientCheck = toggleIngredientCheck;
window.removeOwnedItem = removeOwnedItem;
window.loadHistoricalList = loadHistoricalList;
window.deleteHistoricalList = deleteHistoricalList;
window.shareHistoricalList = shareHistoricalList;

// Make functions globally available for inline handlers
window.selectAllBulkItems = selectAllBulkItems;

// Initialize global variables
let foodsArr = [];
let pinnedMeals = [];
let dislikedMeals = [];
let aiPreferences = '';
let userStats = {
  totalMealsGenerated: 0,
  favoriteFoods: 0,
  mlEnhancedCount: 0
};
let currentUser = null;

// Create a function to update currentUser and keep it synchronized
function updateCurrentUser(user) {
  currentUser = user;
  window.currentUser = user;
  console.log('🔄 Updated currentUser globally:', user ? user.email : 'null');
}

// Make currentUser and update function available globally
window.currentUser = currentUser;
window.updateCurrentUser = updateCurrentUser;

// Initialize MealPlanningAI instance
console.log('App.js: Creating MealPlanningAI instance...');
const mealAI = new MealPlanningAI();
console.log('App.js: MealPlanningAI created:', mealAI);

// Make AI available globally
window.mealPlanningAI = mealAI;
window.firebaseAI = firebaseAI;
console.log('App.js: AI instances added to window global');

// Handle authentication state changes
function setupAuthStateHandler() {
  console.log('Setting up auth state change handler');
  
  // Try to get auth manager from multiple sources
  const getAuthManager = () => {
    return authManager || window.authManager || appInitializer.getModule('authManager');
  };
  
  const activeAuthManager = getAuthManager();
  
  if (!activeAuthManager) {
    console.warn('Auth manager not available, retrying in 1 second...');
    setTimeout(setupAuthStateHandler, 1000);
    return;
  }

  console.log('Auth manager found, setting up listener');

  // Set up auth state change listener
  activeAuthManager.onAuthStateChanged((user) => {
    console.log('=== AUTH STATE CHANGED ===');
    console.log('Previous user:', currentUser ? currentUser.email : 'null');
    console.log('New user:', user ? user.email : 'null');
    console.log('Pending action:', window.pendingAction);
    
    // Update the global currentUser variable
    currentUser = user;
    console.log('✅ Updated currentUser variable:', currentUser ? currentUser.email : 'null');
    if (user) {
      // User signed in - load their data
      console.log('User authenticated:', user.email);
      
      // Hide login modal if shown
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        console.log('Hiding login modal');
        loginModal.style.display = 'none';
      }
      
      // Update UI to show user is signed in
      const userEmailElement = document.getElementById('userEmail');
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
        console.log('Updated user email display to:', user.email);
      }
      
      // Show sign out button
      const signOutBtn = document.getElementById('signOutBtn');
      if (signOutBtn) {
        signOutBtn.style.display = 'block';
        signOutBtn.onclick = async () => {
          try {
            console.log('Sign out button clicked');
            await authManager.signOut();
          } catch (error) {
            console.error('Sign out failed:', error);
          }
        };
      }
      
      // If there was a pending action, execute it
      if (window.pendingAction === 'generatePlan') {
        console.log('🎯 Executing pending meal plan generation');
        console.log('Current user before execution:', user.email);
        window.pendingAction = null;
        setTimeout(() => {
          console.log('🚀 Calling generatePlanWrapper from auth state change');
          console.log('Current user at execution time:', currentUser ? currentUser.email : 'null');
          generatePlanWrapper();
        }, 500); // Small delay to ensure UI is updated
      }
      
      // Load user data
      loadUserDataWrapper();
      
      // Set current user for community features
      if (communityManager) {
        communityManager.setCurrentUser(user);
      }
      if (communityUI) {
        communityUI.setCurrentUser(user);
      }
    } else {
      // User signed out
      console.log('User signed out - updating UI');
      
      // Show login modal
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        console.log('Showing login modal');
        loginModal.style.display = 'block';
      }
      
      // Clear user email display
      const userEmailElement = document.getElementById('userEmail');
      if (userEmailElement) {
        userEmailElement.textContent = '';
        console.log('Cleared user email display');
      }
      
      // Hide sign out button
      const signOutBtn = document.getElementById('signOutBtn');
      if (signOutBtn) {
        signOutBtn.style.display = 'none';
      }
      
      // Clear community user session
      if (communityManager) {
        communityManager.setCurrentUser(null);
      }
      if (communityUI) {
        communityUI.setCurrentUser(null);
      }
      
      // Clear any pending actions
      window.pendingAction = null;
    }
  });
}

// Legacy handler for backward compatibility (now calls the proper handler)
window.onAuthStateChange = (user) => {
  console.log('Legacy onAuthStateChange called, user:', user);
  // This is handled by the proper auth state handler above
};

// Main application file - coordinates all modules
/**
 * Ensures text containers wrap content properly without breaking layout.
 * @param {string} selector - CSS selector of elements to apply wrapping to
 */
function optimizeTextWrapping(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.wordBreak = 'break-word';
    el.style.whiteSpace = 'pre-wrap';
  });
}

// Wrapper functions for database operations
function saveWeeklyPlanWrapper(foods, plan) {
  if (!currentUser) {
    console.error('User not authenticated');
    return;
  }
  saveWeeklyPlan(currentUser.uid, foods, plan);
}

function generateSingleMealWrapper(dayIndex) {
  if (!currentUser) {
    console.error('User not authenticated');
    return;
  }
  generateSingleMeal(dayIndex, currentUser, foodsArr, dislikedMeals, saveWeeklyPlanWrapper);
}

async function generatePlanWrapper() {
  console.log('=== GENERATE PLAN WRAPPER CALLED ===');
  console.log('Current user:', currentUser ? currentUser.email : 'null');
  console.log('Current user object:', currentUser);
  console.log('Auth manager available:', !!authManager);
  console.log('Window auth manager available:', !!window.authManager);
  
  if (!currentUser) {
    console.log('🚫 User not authenticated - showing login modal and setting pending action');
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.style.display = 'block';
      console.log('✅ Login modal displayed');
    } else {
      console.error('❌ Login modal not found in DOM');
    }
    
    // Store the action to retry after login
    window.pendingAction = 'generatePlan';
    console.log('🔄 Set pending action to generatePlan');
    
    // Show a helpful message
    showAuthError('Please sign in to generate a meal plan');
    return;
  }
  
  console.log('✅ User is authenticated, proceeding with meal plan generation');
  
  // Clear any pending action since user is authenticated
  window.pendingAction = null;
  
  try {
    // Prepare the options object for generatePlan
    const options = {
      user: currentUser,
      pinnedMeals: pinnedMeals || [],
      dislikedMeals: dislikedMeals || [],
      dietaryRestrictions: window.userPreferences?.dietary || {}
    };
    
    // Use loading manager if available
    // Show skeleton loading in calendar area
    const calendarContainer = document.getElementById('calendar');
    let skeletonElement = null;
    
    if (loadingManager && calendarContainer) {
      // Clear existing content and show skeleton
      const existingContent = calendarContainer.innerHTML;
      skeletonElement = loadingManager.showSkeleton(calendarContainer, 'meal-plan');
      
      try {
        await generatePlan(foodsArr || [], renderPlanWrapper, options);
      } finally {
        // Remove skeleton
        if (skeletonElement) {
          loadingManager.hideSkeleton(skeletonElement);
        }
      }
    } else if (loadingManager) {
      // Fallback to global loading
      await loadingManager.withLoading(
        () => generatePlan(foodsArr || [], renderPlanWrapper, options),
        {
          message: 'Generating your meal plan...',
          type: 'global'
        }
      );
    } else {
      await generatePlan(foodsArr || [], renderPlanWrapper, options);
    }
    
    console.log('Meal plan generation completed successfully');
    
    // Auto-sync to calendar if enabled
    tryAutoSyncToCalendar();
  } catch (error) {
    console.error('Meal plan generation failed:', error);
    errorBoundary.handleError(error, 'meal-generation');
  }
}

// Make generatePlanWrapper available globally immediately
console.log('🔗 App.js: Assigning generatePlanWrapper to window object');
window.generatePlan = generatePlanWrapper;
window.generatePlanWrapper = generatePlanWrapper;
console.log('✅ App.js: generatePlanWrapper assigned to window:', typeof window.generatePlanWrapper);

/**
 * Automatically sync meal plan to calendar if auto-sync is enabled
 * @returns {Promise<void>}
 */
async function tryAutoSyncToCalendar() {
  try {
    // Check if calendar integration is available
    if (!calendarManager) {
      console.log('Calendar not available for auto-sync');
      return;
    }
    
    // Get the current meal plan
    const currentPlan = getCurrentMealPlan();
    if (!currentPlan || currentPlan.length === 0) {
      console.log('No meal plan available for auto-sync');
      return;
    }
    
    console.log('Auto-adding meal plan to calendar...');
    
    const result = calendarManager.addMealPlanToCalendar(currentPlan);
    
    if (result.success) {
      console.log('Meal plan auto-added to calendar successfully');
      
      // Show a subtle notification if we're on the calendar tab
      const calendarTab = document.getElementById('calendar');
      if (calendarTab && calendarTab.classList.contains('active')) {
        if (calendarUI && typeof calendarUI.showNotification === 'function') {
          calendarUI.showNotification('Meal plan added to calendar automatically', 'success');
        }
      }
    } else {
      console.warn('Auto-add to calendar failed:', result.message);
    }
    
  } catch (error) {
    console.error('Error during auto-add to calendar:', error);
  }
}

function renderPlanWrapper(plan) {

  
  // Get pinned meals from localStorage
  const pinnedMeals = JSON.parse(localStorage.getItem('pinnedMeals') || '[]');
  
  console.log('renderPlanWrapper called with plan:', plan);
  console.log('Using pinnedMeals:', pinnedMeals);
  
  renderPlan(plan, pinnedMeals);
  
  // Store the current meal plan globally for calendar integration
  if (plan && Array.isArray(plan)) {
    // Convert the plan to a more accessible format
    const formattedPlan = plan.map(dayPlan => {
      // Handle the structure from mealGenerator where each day has { meals: [...] }
      let dayMeals = dayPlan;
      if (dayPlan && dayPlan.meals && Array.isArray(dayPlan.meals)) {
        dayMeals = dayPlan.meals;
      } else if (!Array.isArray(dayPlan)) {
        dayMeals = [dayPlan];
      }
      
      if (Array.isArray(dayMeals)) {
        return dayMeals.map(meal => ({
          name: meal.name || meal,
          ingredients: meal.ingredients || [],
          prepTime: meal.prepTime || '30 minutes',
          cookTime: meal.cookTime || '30 minutes',
          difficulty: meal.difficulty || 'Medium'
        }));
      } else if (typeof dayMeals === 'object' && dayMeals.name) {
        return [{
          name: dayMeals.name,
          ingredients: dayMeals.ingredients || [],
          prepTime: dayMeals.prepTime || '30 minutes',
          cookTime: dayMeals.cookTime || '30 minutes',
          difficulty: dayMeals.difficulty || 'Medium'
        }];
      } else if (typeof dayMeals === 'string') {
        return [{
          name: dayMeals,
          ingredients: [],
          prepTime: '30 minutes',
          cookTime: '30 minutes',
          difficulty: 'Medium'
        }];
      }
      return [];
    });
    
    // Make it available globally
    window.currentMealPlan = formattedPlan;
    
    // Store in localStorage as backup
    try {
      localStorage.setItem('currentWeeklyPlan', JSON.stringify(formattedPlan));
    } catch (error) {
      console.error('Error storing meal plan in localStorage:', error);
    }

    // Dispatch meal generation event for social features integration
    const mealGeneratedEvent = new CustomEvent('mealGenerated', {
      detail: {
        meals: formattedPlan, // Use 'meals' for the array
        meal: formattedPlan, // Keep 'meal' for backward compatibility
        timestamp: new Date(),
        planType: 'weekly'
      }
    });
    document.dispatchEvent(mealGeneratedEvent);
    console.log('Dispatched mealGenerated event for social features');
    
    // Setup progressive loading for the newly rendered content
    if (typeof setupMealContentProgressiveLoading === 'function') {
      try {
        setupMealContentProgressiveLoading();
      } catch (error) {
        console.error('Error setting up progressive loading:', error);
      }
    }
  }
  
}

/**
 * Setup progressive loading for newly rendered meal content
 */
function setupMealContentProgressiveLoading() {
  try {
    // Find newly rendered meal cards and setup progressive loading
    const mealCards = document.querySelectorAll('.meal-card:not([data-progressive-setup])');
    
    mealCards.forEach(card => {
      // Mark as processed
      card.setAttribute('data-progressive-setup', 'true');
      
      // Setup image optimization
      const images = card.querySelectorAll('img');
      images.forEach(img => {
        if (!img.getAttribute('data-responsive')) {
          img.setAttribute('data-responsive', 'true');
        }
      });
      
      // Setup progressive loading for meal details
      const detailsContainer = card.querySelector('.meal-details');
      if (detailsContainer && !detailsContainer.getAttribute('data-content-type')) {
        detailsContainer.setAttribute('data-content-type', 'recipe');
        detailsContainer.setAttribute('data-recipe-id', card.getAttribute('data-meal-id') || 'unknown');
        
        progressiveLoadingManager.registerContent(detailsContainer, 'recipe', {
          priority: 'normal',
          useCache: true,
          cacheTTL: 600000 // 10 minutes
        });
      }
      
      // Setup nutrition data progressive loading
      const nutritionContainer = card.querySelector('.nutrition-info');
      if (nutritionContainer && !nutritionContainer.getAttribute('data-content-type')) {
        nutritionContainer.setAttribute('data-content-type', 'nutrition');
        nutritionContainer.setAttribute('data-meal-id', card.getAttribute('data-meal-id') || 'unknown');
        
        progressiveLoadingManager.registerContent(nutritionContainer, 'nutrition', {
          priority: 'low',
          useCache: true,
          cacheTTL: 900000 // 15 minutes
        });
      }
    });

    console.log(`Setup progressive loading for ${mealCards.length} new meal cards`);

  } catch (error) {
    console.error('Failed to setup meal content progressive loading:', error);
  }
}

function renderLikedMealsWrapper() {
  if (!currentUser) {
    console.error('User not authenticated');
    return;
  }
  // Implementation would go here
  console.log('Rendering liked meals:', likedMeals);
}

function renderFoodsListWrapper() {
  console.log('Rendering foods list:', foodsArr);
  // Simple implementation - you can enhance this
  const foodsList = document.getElementById('foodsList');
  if (foodsList) {
    foodsList.innerHTML = foodsArr.map(food => `<li>${food}</li>`).join('');
  }
}

async function loadUserDataWrapper() {
  try {
    console.log('Loading user data for:', currentUser?.email);
    
    // Show loading indicator
    const status = getOfflineStatus();
    if (!status.isOnline && status.pendingOperations > 0) {
      console.log(`Loading offline data (${status.pendingOperations} pending operations)`);
    }
    
    const userData = await loadUserData();
    if (userData) {
      // Update global variables with loaded data
      window.foodsArr = userData.foods || [];
      window.pinnedMeals = userData.pinnedMeals || [];
      window.dislikedMeals = userData.dislikedMeals || [];
      window.likedMeals = userData.likedMeals || [];
      window.userPreferences = userData.preferences || {};
      window.weeklyPlan = userData.weeklyPlan || {};
      
      console.log('User data loaded successfully:', {
        foods: window.foodsArr.length,
        pinnedMeals: window.pinnedMeals.length,
        dislikedMeals: window.dislikedMeals.length,
        preferences: Object.keys(window.userPreferences).length
      });
      
      // Sync offline data if online
      if (status.isOnline && status.pendingOperations > 0) {
        try {
          await syncOfflineData();
          console.log('Offline data synchronized');
        } catch (error) {
          console.warn('Failed to sync offline data:', error);
        }
      }
      
      return userData;
    } else {
      console.log('No user data found or failed to load');
      return null;
    }
  } catch (error) {
    console.error('Error in loadUserDataWrapper:', error);
    
    // Check if we have offline data
    const status = getOfflineStatus();
    if (!status.isOnline) {
      console.log('Attempting to load offline cached data');
      // The loadUserData function already handles offline fallback
    }
    
    return null;
  }
}

// Handle sign-in button click (primary method)
async function handleSignInClick(event) {
  console.log('=== SIGN-IN BUTTON CLICKED ===');
  console.log('Event:', event);
  
  // Prevent any default behavior
  event.preventDefault();
  event.stopPropagation();
  
  // Get button and form elements
  const button = event.target || document.getElementById('signInBtn');
  const form = document.getElementById('signInForm');
  
  if (!form) {
    console.error('Sign-in form not found');
    return;
  }
  
  try {
    // Get form data directly
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    // Use loading manager for sign-in process
    if (loadingManager && button) {
      await loadingManager.withLoading(
        async () => {
          // Ensure auth manager is available
          if (!authManager && !window.authManager) {
            console.log('Auth manager not available, trying to load...');
            const authModule = appInitializer.getModule('authManager');
            if (authModule) {
              authManager = authModule;
              window.authManager = authModule;
            } else {
              await loadAuthManager();
            }
          }
          
          // Use global auth manager if local one is not available
          const activeAuthManager = authManager || window.authManager;
          
          if (!activeAuthManager) {
            throw new Error('Authentication manager is not available. Please refresh the page and try again.');
          }
          
          // Perform sign-in
          const user = await activeAuthManager.signIn(email, password);
          console.log('Sign-in successful, user:', user);
          
          // Close modal and update UI
          try {
            closeModal();
          } catch (error) {
            console.warn('Error closing modal:', error);
          }
          return user;
        },
        {
          button: button,
          buttonText: 'Signing in...',
          type: 'button'
        }
      );
    } else {
      // Fallback without loading manager
      button.style.backgroundColor = '#4f46e5';
      button.textContent = 'Processing...';
      button.disabled = true;
      
      // Ensure auth manager is available
      if (!authManager && !window.authManager) {
        console.log('Auth manager not available, trying to load...');
        const authModule = appInitializer.getModule('authManager');
        if (authModule) {
          authManager = authModule;
          window.authManager = authModule;
        } else {
          await loadAuthManager();
        }
      }
      
      // Use global auth manager if local one is not available
      const activeAuthManager = authManager || window.authManager;
      
      if (!activeAuthManager) {
        throw new Error('Authentication manager is not available. Please refresh the page and try again.');
      }

      // Perform sign-in
      const user = await activeAuthManager.signIn(email, password);
      console.log('Sign-in successful, user:', user);
      
      // Close modal and update UI
      try {
        closeModal();
      } catch (error) {
        console.warn('Error closing modal:', error);
      }
      
      // Reset button
      button.textContent = 'Sign In';
      button.disabled = false;
      button.style.backgroundColor = '';
    }
    
  } catch (error) {
    console.error('Sign-in error:', error);
    alert('Sign-in failed: ' + error.message);
    
    // Reset button if loading manager wasn't used
    if (!loadingManager && button) {
      button.textContent = 'Sign In';
      button.disabled = false;
      button.style.backgroundColor = '';
    }
  }
}

// Make function globally available for HTML onclick
window.handleSignInClick = handleSignInClick;

// Handle sign-in form submission with enhanced error handling
async function handleSignIn(event) {
  console.log('handleSignIn called, event:', event);
  
  // CRITICAL: Prevent any form submission
  if (event.preventDefault) event.preventDefault();
  if (event.stopPropagation) event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  
  console.log('Form submission prevented');
  
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  console.log('Form data extracted - Email:', email, 'Password length:', password?.length);
  
  if (!email || !password) {
    console.log('Missing email or password');
    showAuthError('Please enter both email and password');
    return false; // Ensure no form submission
  }

  const signInBtn = document.getElementById('signInBtn') || event.target.querySelector('[type="submit"]') || event.target.querySelector('[type="button"]');
  
  try {
    // Disable the button immediately to prevent double-clicks
    if (signInBtn) {
      signInBtn.disabled = true;
      signInBtn.textContent = 'Signing in...';
    }
    
    console.log('Starting sign-in process...');
    
    // Directly call performSignIn without loading manager to avoid complications
    await performSignIn(email, password, event.target);
    
    console.log('Sign-in process completed');
    
  } catch (error) {
    console.error('Sign-in failed:', error);
    
    // Re-enable button on error
    if (signInBtn) {
      signInBtn.disabled = false;
      signInBtn.textContent = 'Sign In';
    }
  }
  
  return false; // Ensure no form submission
}

async function performSignIn(email, password, form) {
  try {
    console.log('performSignIn called with email:', email);
    
    // Ensure auth manager is loaded before using it
    if (!authManager) {
      console.log('Auth manager not loaded, loading now...');
      await loadAuthManager();
    }

    if (!authManager) {
      throw new Error('Authentication system not available');
    }

    console.log('Attempting to sign in with auth manager...');
    
    // Use the auth manager for consistent authentication
    const user = await authManager.signIn(email, password);
    
    console.log('Auth manager sign-in successful for user:', user.email);
    
    // Clear form
    if (form && form.reset) {
      form.reset();
    }
    
    // Clear any auth errors
    const authError = document.getElementById('authError');
    if (authError) {
      authError.style.display = 'none';
    }
    
    // Re-enable button
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      signInBtn.disabled = false;
      signInBtn.textContent = 'Sign In';
    }
    
    console.log('Sign-in process completed successfully');
    
  } catch (error) {
    console.error('performSignIn error:', error);
    
    // Re-enable button
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      signInBtn.disabled = false;
      signInBtn.textContent = 'Sign In';
    }
    
    errorBoundary.handleError(error, 'auth');
    showAuthError(error.message);
    throw error; // Re-throw so calling function can handle it
  }
}

// Helper function to show authentication errors
function showAuthError(message) {
  const errorElement = document.getElementById('authError') || createAuthErrorElement();
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function createAuthErrorElement() {
  const errorElement = document.createElement('div');
  errorElement.id = 'authError';
  errorElement.className = 'auth-error';
  errorElement.style.cssText = `
    color: #e74c3c;
    background: #fadbd8;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
    display: none;
    border: 1px solid #f5c6cb;
  `;
  
  const signInForm = document.getElementById('signInForm');
  if (signInForm) {
    signInForm.appendChild(errorElement);
  }
  
  return errorElement;
}

function addFoodFormHandler() {
  const addFoodForm = document.getElementById('addFoodForm');
  if (addFoodForm) {
    addFoodForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const newFood = document.getElementById('newFood').value.trim();
      if (newFood && currentUser) {
        foodsArr = addFood(newFood, currentUser, foodsArr, renderFoodsListWrapper);
      }
    });
  }
}

// Modal functions
function closeModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'none';
  }
}

function openModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'block';
  }
}

// Make modal functions available globally
window.closeModal = closeModal;
window.openModal = openModal;

// Auth mode toggle function
function toggleAuthMode(event) {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('toggleAuthMode called - switching between sign-in and sign-up');
  
  // For now, just show a message since we only have sign-in implemented
  // This can be expanded to actual sign-up functionality later
  alert('Sign-up functionality coming soon! Please use the sign-in form with existing credentials.');
}

// Make auth toggle available globally
window.toggleAuthMode = toggleAuthMode;

// Modal close logic - with DOM ready check
function setupModalCloseHandlers() {
  const closeButton = document.getElementById('closeModal');
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
      closeModal();
    }
  };
}

// Set up modal handlers when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModalCloseHandlers);
} else {
  setupModalCloseHandlers();
}

// Tab navigation is now handled by UIStateManager

// Export functions for external access
window.loadUserData = loadUserDataWrapper;
// generatePlan and generatePlanWrapper already assigned after function definition
window.generateSingleMeal = generateSingleMealWrapper;
window.renderPlan = renderPlanWrapper;
window.saveWeeklyPlan = saveWeeklyPlanWrapper;
window.addFood = addFood;
window.mealAI = mealAI;

// Add event listener for Generate Meal button
// Legacy event listener removed - now handled by generatePlanWrapper in the main initialization

// Profile tab logic
document.getElementById('profile-btn').addEventListener('click', function() {
  // Show the profile tab
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById('profile').classList.add('active');
  // Set user email
  if (window.auth && window.auth.currentUser) {
    document.getElementById('profileEmail').textContent = window.auth.currentUser.email;
  }
});

document.getElementById('profileSignOutBtn').addEventListener('click', function() {
  if (window.auth) {
    window.auth.signOut();
    location.reload();
  }
});

// AI Preferences Setup
function setupAIPreferencesHandlers() {
  // Save AI preferences
  const saveAIPreferencesBtn = document.getElementById('saveAIPreferencesBtn');
  if (saveAIPreferencesBtn) {
    saveAIPreferencesBtn.addEventListener('click', saveAIPreferences);
  }
  
  // Clear AI preferences
  const clearAIPreferencesBtn = document.getElementById('clearAIPreferencesBtn');
  if (clearAIPreferencesBtn) {
    clearAIPreferencesBtn.addEventListener('click', clearAIPreferences);
  }
  
  // Load saved preferences
  loadAIPreferences();
}

async function saveAIPreferences() {
  const textarea = document.getElementById('aiPreferencesText');
  const saveButton = document.getElementById('saveAIPreferencesBtn');
  
  if (!textarea) return;
  
  const preferences = textarea.value.trim();
  
  try {
    // Use loading manager for save operation
    if (loadingManager && saveButton) {
      await loadingManager.withLoading(
        async () => {
          aiPreferences = preferences;
          
          // Save to localStorage
          localStorage.setItem('aiPreferences', aiPreferences);
          
          // Save to database if user is logged in
          if (currentUser && currentUser.uid) {
            // You can implement database saving here if needed
            console.log('AI preferences saved for user:', currentUser.uid);
          }
          
          // Train the AI with new preferences
          if (window.mealPlanningAI && typeof window.mealPlanningAI.updatePreferencesFromText === 'function') {
            await window.mealPlanningAI.updatePreferencesFromText(aiPreferences);
            console.log('AI trained with new preferences');
          }
          
          return true;
        },
        {
          button: saveButton,
          buttonText: 'Saving...',
          type: 'button'
        }
      );
    } else {
      // Fallback without loading manager
      aiPreferences = preferences;
      localStorage.setItem('aiPreferences', aiPreferences);
      
      if (currentUser && currentUser.uid) {
        console.log('AI preferences saved for user:', currentUser.uid);
      }
      
      if (window.mealPlanningAI && typeof window.mealPlanningAI.updatePreferencesFromText === 'function') {
        await window.mealPlanningAI.updatePreferencesFromText(aiPreferences);
        console.log('AI trained with new preferences');
      }
    }
    
    // Show success message
    showToast('🧠 AI preferences saved successfully!');
    
  } catch (error) {
    console.error('Error saving AI preferences:', error);
    showToast('❌ Failed to save AI preferences');
  }
}

function clearAIPreferences() {
  const textarea = document.getElementById('aiPreferencesText');
  if (textarea) {
    textarea.value = '';
    aiPreferences = '';
    localStorage.removeItem('aiPreferences');
    showToast('🗑️ AI preferences cleared');
  }
}

function loadAIPreferences() {
  const textarea = document.getElementById('aiPreferencesText');
  if (textarea) {
    const saved = localStorage.getItem('aiPreferences') || '';
    textarea.value = saved;
    aiPreferences = saved;
  }
}

// Profile Setup
function setupProfileHandlers() {
  // Export data
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportUserData);
  }
  
  // Reset preferences
  const resetPreferencesBtn = document.getElementById('resetPreferencesBtn');
  if (resetPreferencesBtn) {
    resetPreferencesBtn.addEventListener('click', resetAllPreferences);
  }
  
  // Dark mode toggle (if different from header toggle)
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      document.documentElement.setAttribute('data-theme', this.checked ? 'dark' : 'light');
      localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
    
    // Set initial state
    const currentTheme = localStorage.getItem('theme') || 'light';
    darkModeToggle.checked = currentTheme === 'dark';
  }
  
  // Load profile stats
  updateProfileStats();
}

function updateProfileStats() {
  // Update favorite foods count
  userStats.favoriteFoods = foodsArr.length;
  
  // Update DOM elements
  const totalMealsElement = document.getElementById('totalMealsGenerated');
  if (totalMealsElement) {
    totalMealsElement.textContent = userStats.totalMealsGenerated;
  }
  
  const favoriteFoodsElement = document.getElementById('favoritefoods');
  if (favoriteFoodsElement) {
    favoriteFoodsElement.textContent = userStats.favoriteFoods;
  }
  
  const mlEnhancedElement = document.getElementById('mlEnhancedCount');
  if (mlEnhancedElement) {
    mlEnhancedElement.textContent = userStats.mlEnhancedCount;
  }
  
  // Update profile name
  const profileNameElement = document.getElementById('profileName');
  if (profileNameElement && currentUser) {
    const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
    profileNameElement.textContent = `Hello, ${name}!`;
  }
}

function exportUserData() {
  const data = {
    foods: foodsArr,
    aiPreferences: aiPreferences,
    stats: userStats,
    preferences: {
      vegetarian: localStorage.getItem('vegetarianPref') === 'true',
      easyMeals: localStorage.getItem('easyMealsPref') === 'true'
    },
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meal-planner-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('📊 Data exported successfully!');
}

function resetAllPreferences() {
  if (confirm('Are you sure you want to reset all preferences? This cannot be undone.')) {
    // Clear AI preferences
    aiPreferences = '';
    localStorage.removeItem('aiPreferences');
    const textarea = document.getElementById('aiPreferencesText');
    if (textarea) textarea.value = '';
    
    // Clear quick settings
    const vegetarianPref = document.getElementById('vegetarianPref');
    if (vegetarianPref) {
      vegetarianPref.checked = false;
      localStorage.removeItem('vegetarianPref');
    }
    
    const easyMealsPref = document.getElementById('easyMealsPref');
    if (easyMealsPref) {
      easyMealsPref.checked = false;
      localStorage.removeItem('easyMealsPref');
    }
    
    // Reset stats (keep foods)
    userStats.totalMealsGenerated = 0;
    userStats.mlEnhancedCount = 0;
    
    updateProfileStats();
    showToast('🔄 All preferences reset successfully!');
  }
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--ai-primary) 0%, #4f46e5 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Initialize enhanced nutrition tracking functionality
function initializeEnhancedNutritionIfNeeded() {
  console.log('🧬 Initializing enhanced nutrition tracking...');
  
  // Check if enhanced nutrition tracker is available
  if (window.enhancedNutritionTracker && window.enhancedNutritionUI) {
    // Trigger any necessary updates for the nutrition tracking
    if (typeof window.enhancedNutritionUI.loadOverviewData === 'function') {
      window.enhancedNutritionUI.loadOverviewData();
    }
    console.log('✅ Enhanced nutrition tracking initialized');
  } else {
    console.log('⏳ Enhanced nutrition not yet available, will retry...');
    setTimeout(() => initializeEnhancedNutritionIfNeeded(), 500);
  }
}

// Initialize enhanced calendar functionality
function initializeEnhancedCalendarIfNeeded() {
  console.log('📅 Initializing enhanced calendar features...');
  
  // Check if enhanced calendar is available
  if (window.enhancedCalendarManager && window.enhancedCalendarUI) {
    // Trigger any necessary updates for the calendar
    if (typeof window.enhancedCalendarManager.initializeEnhancedCalendar === 'function') {
      window.enhancedCalendarManager.initializeEnhancedCalendar();
    }
    console.log('✅ Enhanced calendar features initialized');
  } else {
    console.log('⏳ Enhanced calendar not yet available, will retry...');
    setTimeout(() => initializeEnhancedCalendarIfNeeded(), 500);
  }
}

// Initialize enhanced AI recommendation functionality
function initializeEnhancedAIIfNeeded() {
  console.log('🧠 Initializing enhanced AI recommendation engine...');
  
  // Check if enhanced AI is available
  if (window.enhancedAIRecommendationEngine && window.enhancedAIRecommendationUI) {
    // The AI engine is already initialized in its constructor
    console.log('✅ Enhanced AI recommendation engine initialized');
    
    // Optionally trigger any additional setup
    if (typeof window.enhancedAIRecommendationEngine.loadUserPreferences === 'function') {
      window.enhancedAIRecommendationEngine.loadUserPreferences();
    }
  } else {
    console.log('⏳ Enhanced AI not yet available, will retry...');
    setTimeout(() => initializeEnhancedAIIfNeeded(), 500);
  }
}

// Initialize substitutions tab functionality
function initializeSubstitutionsIfNeeded() {
  console.log('🔄 Initializing substitutions tab...');
  
  // Check if ingredient substitution UI is available
  if (window.ingredientSubstitutionUI) {
    // Trigger any necessary updates for the substitution tab
    if (typeof window.ingredientSubstitutionUI.initializeSubstitutionTab === 'function') {
      window.ingredientSubstitutionUI.initializeSubstitutionTab();
    }
    console.log('✅ Substitutions tab initialized');
  } else {
    console.log('⏳ Substitution UI not yet available, will retry...');
    setTimeout(() => initializeSubstitutionsIfNeeded(), 500);
  }
}

// Page tracking for debugging (can be removed after testing)
window.addEventListener('beforeunload', (event) => {
  console.log('🚨 PAGE UNLOAD - User:', currentUser ? currentUser.email : 'null', 'Pending:', window.pendingAction);
});

// Ensure generatePlanWrapper is available ASAP
console.log('🔗 App.js: Final assignment of generatePlanWrapper to window');
window.generatePlanWrapper = generatePlanWrapper;
window.generatePlan = generatePlanWrapper;
console.log('✅ App.js: Final assignment complete - generatePlanWrapper type:', typeof window.generatePlanWrapper);

// Backup: Assign when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔗 App.js: DOM ready - ensuring generatePlanWrapper is available');
  if (typeof generatePlanWrapper === 'function') {
    window.generatePlanWrapper = generatePlanWrapper;
    window.generatePlan = generatePlanWrapper;
    console.log('✅ App.js: DOM ready assignment complete');
  } else {
    console.error('❌ App.js: generatePlanWrapper function not found at DOM ready');
  }
});

console.log('📋 App.js loaded - Authentication debug mode active');
