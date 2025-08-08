// Enhanced User Preferences Management System
import { 
  updateUserPreferences, 
  updateUserData, 
  loadUserData,
  getOfflineStatus 
} from './dataManager.js';
import { getFirebaseInstance } from './firebase.js';

// Comprehensive preference structure
const DEFAULT_PREFERENCES = {
  // Dietary preferences
  dietary: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
    keto: false,
    paleo: false,
    lowCarb: false,
    lowSodium: false
  },
  
  // Meal preferences
  meals: {
    easyMeals: false,
    quickMeals: false, // Under 30 minutes
    mealPrepFriendly: false,
    budgetFriendly: false,
    familyFriendly: false,
    singleServing: false
  },
  
  // Cooking preferences
  cooking: {
    skillLevel: 'beginner', // beginner, intermediate, advanced
    maxCookTime: 60, // minutes
    preferredCookingMethods: [], // baking, frying, grilling, steaming, etc.
    kitchenEquipment: [], // oven, stovetop, microwave, airFryer, etc.
    spiceLevel: 'mild' // mild, medium, hot
  },
  
  // Nutrition preferences
  nutrition: {
    calorieTarget: null, // daily calorie target
    proteinFocus: false,
    lowCalorie: false,
    highFiber: false,
    heartHealthy: false,
    diabeticFriendly: false
  },
  
  // Ingredient preferences
  ingredients: {
    favoriteIngredients: [],
    dislikedIngredients: [],
    allergens: [],
    organicPreferred: false,
    localIngredients: false
  },
  
  // AI learning preferences
  aiLearning: {
    learnFromRatings: true,
    learnFromSkips: true,
    learnFromRepeats: true,
    autoAdjustDifficulty: true,
    suggestSimilarMeals: true,
    adaptToSeason: true
  },
  
  // UI preferences
  ui: {
    theme: 'auto', // light, dark, auto
    compactView: false,
    showNutritionInfo: true,
    showCookingTips: true,
    defaultView: 'calendar' // calendar, list, grid
  }
};

// Preference management class
class PreferencesManager {
  constructor() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.isLoading = false;
    this.listeners = [];
    this.aiLearningData = {
      mealRatings: {},
      skippedMeals: [],
      repeatedMeals: [],
      cookingHistory: []
    };
  }

  // Add preference change listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove preference change listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of preference changes
  notifyListeners(changedPreferences) {
    this.listeners.forEach(listener => {
      try {
        listener(changedPreferences, this.preferences);
      } catch (error) {
        console.error('Error in preference listener:', error);
      }
    });
  }

  // Load preferences from database and localStorage
  async loadPreferences() {
    try {
      this.isLoading = true;
      
      const { auth } = await getFirebaseInstance();
      const user = auth.currentUser;
      
      if (user) {
        // Try to load from database first
        const userData = await loadUserData();
        if (userData && userData.preferences) {
          this.preferences = this.mergePreferences(userData.preferences);
          
          // Also sync with localStorage
          this.saveToLocalStorage();
          console.log('Preferences loaded from database');
        } else {
          // Fall back to localStorage
          this.loadFromLocalStorage();
          console.log('Preferences loaded from localStorage');
        }
        
        // Load AI learning data
        if (userData && userData.aiLearningData) {
          this.aiLearningData = userData.aiLearningData;
        }
      } else {
        // User not logged in, use localStorage only
        this.loadFromLocalStorage();
        console.log('Preferences loaded from localStorage (not logged in)');
      }
      
      return this.preferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      this.loadFromLocalStorage();
      return this.preferences;
    } finally {
      this.isLoading = false;
    }
  }

  // Save preferences to database and localStorage
  async savePreferences(newPreferences = null) {
    try {
      if (newPreferences) {
        const changedPrefs = this.updatePreferences(newPreferences);
        this.notifyListeners(changedPrefs);
      }

      // Save to localStorage immediately
      this.saveToLocalStorage();

      const { auth } = await getFirebaseInstance();
      const user = auth.currentUser;
      
      if (user) {
        // Save to database
        await updateUserPreferences(user.uid, this.preferences);
        
        // Also save AI learning data
        await updateUserData(user.uid, { 
          aiLearningData: this.aiLearningData 
        });
        
        console.log('Preferences saved to database');
        
        // Show success message
        this.showSaveMessage('Preferences saved successfully!', 'success');
      } else {
        console.log('Preferences saved to localStorage (not logged in)');
        this.showSaveMessage('Preferences saved locally', 'info');
      }

      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      this.showSaveMessage('Failed to save preferences', 'error');
      return false;
    }
  }

  // Update specific preferences
  updatePreferences(newPreferences) {
    const changedPrefs = {};
    
    for (const [category, values] of Object.entries(newPreferences)) {
      if (this.preferences[category]) {
        for (const [key, value] of Object.entries(values)) {
          if (this.preferences[category][key] !== value) {
            if (!changedPrefs[category]) changedPrefs[category] = {};
            changedPrefs[category][key] = value;
            this.preferences[category][key] = value;
          }
        }
      }
    }
    
    return changedPrefs;
  }

  // Merge preferences with defaults
  mergePreferences(loadedPreferences) {
    const merged = JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
    
    for (const [category, values] of Object.entries(loadedPreferences)) {
      if (merged[category] && typeof values === 'object') {
        merged[category] = { ...merged[category], ...values };
      }
    }
    
    return merged;
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
      localStorage.setItem('aiLearningData', JSON.stringify(this.aiLearningData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const loadedPrefs = JSON.parse(saved);
        this.preferences = this.mergePreferences(loadedPrefs);
      }
      
      const aiData = localStorage.getItem('aiLearningData');
      if (aiData) {
        this.aiLearningData = JSON.parse(aiData);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.preferences = { ...DEFAULT_PREFERENCES };
    }
  }

  // Show save message to user
  showSaveMessage(message, type = 'success') {
    const saveMsg = document.createElement('div');
    saveMsg.className = `save-message save-message-${type}`;
    saveMsg.textContent = message;
    saveMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    `;
    
    document.body.appendChild(saveMsg);
    setTimeout(() => {
      saveMsg.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => saveMsg.remove(), 300);
    }, 2000);
  }

  // AI Learning methods
  recordMealRating(mealId, rating) {
    if (this.preferences.aiLearning.learnFromRatings) {
      this.aiLearningData.mealRatings[mealId] = {
        rating,
        timestamp: Date.now()
      };
      this.savePreferences();
    }
  }

  recordSkippedMeal(mealId) {
    if (this.preferences.aiLearning.learnFromSkips) {
      this.aiLearningData.skippedMeals.push({
        mealId,
        timestamp: Date.now()
      });
      this.savePreferences();
    }
  }

  recordRepeatedMeal(mealId) {
    if (this.preferences.aiLearning.learnFromRepeats) {
      this.aiLearningData.repeatedMeals.push({
        mealId,
        timestamp: Date.now()
      });
      this.savePreferences();
    }
  }

  recordCookingActivity(mealId, cookingTime, difficulty) {
    this.aiLearningData.cookingHistory.push({
      mealId,
      cookingTime,
      difficulty,
      timestamp: Date.now()
    });
    
    // Auto-adjust difficulty preference based on cooking history
    if (this.preferences.aiLearning.autoAdjustDifficulty) {
      this.autoAdjustDifficultyPreference();
    }
    
    this.savePreferences();
  }

  autoAdjustDifficultyPreference() {
    const recentHistory = this.aiLearningData.cookingHistory
      .filter(entry => Date.now() - entry.timestamp < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .slice(-20); // Last 20 cooking sessions
    
    if (recentHistory.length < 5) return;
    
    const avgDifficulty = recentHistory.reduce((sum, entry) => {
      const difficultyScore = { easy: 1, medium: 2, hard: 3 }[entry.difficulty] || 2;
      return sum + difficultyScore;
    }, 0) / recentHistory.length;
    
    let newSkillLevel = 'beginner';
    if (avgDifficulty > 2.5) newSkillLevel = 'advanced';
    else if (avgDifficulty > 1.5) newSkillLevel = 'intermediate';
    
    if (this.preferences.cooking.skillLevel !== newSkillLevel) {
      this.updatePreferences({
        cooking: { skillLevel: newSkillLevel }
      });
      console.log(`Auto-adjusted skill level to: ${newSkillLevel}`);
    }
  }

  // Get AI-enhanced meal suggestions based on learning data
  getAIEnhancedSuggestions() {
    const suggestions = {
      preferredIngredients: [],
      avoidIngredients: [],
      preferredDifficulty: this.preferences.cooking.skillLevel,
      preferredCookingTime: this.preferences.cooking.maxCookTime
    };

    // Analyze meal ratings to find preferred ingredients
    const highRatedMeals = Object.entries(this.aiLearningData.mealRatings)
      .filter(([_, data]) => data.rating >= 4)
      .map(([mealId, _]) => mealId);

    // Analyze skipped meals to find avoided ingredients
    const skippedMealIds = this.aiLearningData.skippedMeals
      .filter(entry => Date.now() - entry.timestamp < 60 * 24 * 60 * 60 * 1000) // Last 60 days
      .map(entry => entry.mealId);

    return suggestions;
  }

  // Get current preferences
  getPreferences() {
    return { ...this.preferences };
  }

  // Get specific preference category
  getCategory(category) {
    return this.preferences[category] ? { ...this.preferences[category] } : {};
  }

  // Reset preferences to defaults
  resetPreferences() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.aiLearningData = {
      mealRatings: {},
      skippedMeals: [],
      repeatedMeals: [],
      cookingHistory: []
    };
    this.savePreferences();
    this.notifyListeners({}, this.preferences);
  }
}

// Create global preferences manager instance
const preferencesManager = new PreferencesManager();

// Enhanced savePreferences function for backward compatibility
export async function savePreferences() {
  try {
    // Collect preferences from form elements
    const formPreferences = {
      dietary: {
        vegetarian: document.getElementById('vegetarianPref')?.checked || false,
        vegan: document.getElementById('veganPref')?.checked || false,
        glutenFree: document.getElementById('glutenFreePref')?.checked || false,
        dairyFree: document.getElementById('dairyFreePref')?.checked || false,
        nutFree: document.getElementById('nutFreePref')?.checked || false
      },
      meals: {
        easyMeals: document.getElementById('easyMealsPref')?.checked || false,
        quickMeals: document.getElementById('quickMealsPref')?.checked || false,
        mealPrepFriendly: document.getElementById('mealPrepPref')?.checked || false,
        budgetFriendly: document.getElementById('budgetPref')?.checked || false
      },
      cooking: {
        skillLevel: document.getElementById('skillLevelPref')?.value || 'beginner',
        maxCookTime: parseInt(document.getElementById('maxCookTimePref')?.value) || 60,
        spiceLevel: document.getElementById('spiceLevelPref')?.value || 'mild'
      }
    };

    await preferencesManager.savePreferences(formPreferences);
    return true;
  } catch (error) {
    console.error('Error in savePreferences:', error);
    return false;
  }
}

// Export the preferences manager and helper functions
export { preferencesManager, DEFAULT_PREFERENCES };

// Enhanced global exports
if (typeof window !== 'undefined') {
  window.savePreferences = savePreferences;
  window.preferencesManager = preferencesManager;
  window.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
} 