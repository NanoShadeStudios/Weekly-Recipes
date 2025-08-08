// Enhanced Data Manager with comprehensive CRUD operations, validation, and offline support
import { getFirebaseInstance } from './firebase.js';
import { 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Data validation schemas
const VALIDATION_SCHEMAS = {
  userData: {
    required: ['uid'],
    optional: ['meals', 'preferences', 'foods', 'weeklyPlan', 'aiPreferences', 'likedMeals', 'dislikedMeals', 'pinnedMeals', 'mealRatings', 'learningData'],
    types: {
      uid: 'string',
      meals: 'object',
      preferences: 'object',
      foods: 'array',
      weeklyPlan: 'object',
      aiPreferences: 'object',
      likedMeals: 'array',
      dislikedMeals: 'array',
      pinnedMeals: 'array',
      mealRatings: 'object',
      learningData: 'object'
    }
  },
  meal: {
    required: ['name', 'ingredients'],
    optional: ['category', 'cookTime', 'servings', 'difficulty', 'nutrition', 'tags'],
    types: {
      name: 'string',
      ingredients: 'array',
      category: 'string',
      cookTime: 'number',
      servings: 'number',
      difficulty: 'string',
      nutrition: 'object',
      tags: 'array'
    }
  },
  preferences: {
    required: [],
    optional: ['dietaryRestrictions', 'allergens', 'favoriteIngredients', 'cookingTime', 'servingSize', 'spiceLevel'],
    types: {
      dietaryRestrictions: 'array',
      allergens: 'array',
      favoriteIngredients: 'array',
      cookingTime: 'string',
      servingSize: 'number',
      spiceLevel: 'string'
    }
  }
};

// Offline storage management
class OfflineStorageManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = JSON.parse(localStorage.getItem('pendingOperations') || '[]');
    this.setupOnlineListener();
  }

  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  addPendingOperation(operation) {
    this.pendingOperations.push({
      ...operation,
      timestamp: Date.now(),
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
  }

  async syncPendingOperations() {
    if (!this.isOnline || this.pendingOperations.length === 0) return;

    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        console.log(`Synced pending operation: ${operation.type}`);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        // Re-add failed operation
        this.pendingOperations.push(operation);
      }
    }

    if (this.pendingOperations.length > 0) {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    }
  }

  async executeOperation(operation) {
    const { db } = await getFirebaseInstance();
    const { type, collection: collectionName, docId, data } = operation;

    const docRef = doc(db, collectionName, docId);

    switch (type) {
      case 'create':
      case 'update':
        await setDoc(docRef, { ...data, lastUpdated: serverTimestamp() }, { merge: true });
        break;
      case 'delete':
        await deleteDoc(docRef);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  storeOfflineData(key, data) {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  getOfflineData(key) {
    const stored = localStorage.getItem(`offline_${key}`);
    return stored ? JSON.parse(stored) : null;
  }
}

// Initialize offline storage manager
const offlineManager = new OfflineStorageManager();

// Data validation utilities
function validateData(data, schema) {
  const errors = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check data types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (field in data && data[field] !== null && data[field] !== undefined) {
      const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
      if (actualType !== expectedType) {
        errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Check for unknown fields (warn but don't error)
  const allowedFields = [...schema.required, ...schema.optional];
  for (const field of Object.keys(data)) {
    if (!allowedFields.includes(field)) {
      console.warn(`Unknown field in data: ${field}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return true;
}

function sanitizeData(data) {
  // Remove any undefined values and sanitize strings
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (Array.isArray(value)) {
        sanitized[key] = value.filter(item => item !== null && item !== undefined);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

// Enhanced CRUD Operations with validation and offline support

// CREATE: Create new user data
export async function createUserData(userData) {
  try {
    validateData(userData, VALIDATION_SCHEMAS.userData);
    const sanitizedData = sanitizeData(userData);
    
    const { db, auth } = await getFirebaseInstance();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const newUserData = {
      ...sanitizedData,
      uid: user.uid,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    if (offlineManager.isOnline) {
      await setDoc(userDocRef, newUserData);
      console.log('User data created successfully');
    } else {
      offlineManager.addPendingOperation({
        type: 'create',
        collection: 'users',
        docId: user.uid,
        data: newUserData
      });
      offlineManager.storeOfflineData(`user_${user.uid}`, newUserData);
      console.log('User data queued for creation (offline)');
    }

    return newUserData;
  } catch (error) {
    console.error('Error creating user data:', error);
    throw error;
  }
}

// READ: Load user data from Firestore with offline fallback
export async function loadUserData() {
  try {
    const { db, auth } = await getFirebaseInstance();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    if (offlineManager.isOnline) {
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Cache data for offline use
          offlineManager.storeOfflineData(`user_${user.uid}`, userData);
          console.log('User data loaded successfully');
          return userData;
        } else {
          // Create new user document
          const newUserData = {
            uid: user.uid,
            meals: {},
            preferences: {},
            foods: [],
            weeklyPlan: {},
            aiPreferences: {},
            likedMeals: [],
            dislikedMeals: [],
            pinnedMeals: [],
            createdAt: serverTimestamp()
          };
          await setDoc(userDocRef, newUserData);
          console.log('New user document created');
          return newUserData;
        }
      } catch (error) {
        console.warn('Failed to load from Firestore, checking offline cache:', error);
        const offlineData = offlineManager.getOfflineData(`user_${user.uid}`);
        if (offlineData) {
          console.log('Using offline cached data');
          return offlineData.data;
        }
        throw error;
      }
    } else {
      // Offline mode - use cached data
      const offlineData = offlineManager.getOfflineData(`user_${user.uid}`);
      if (offlineData) {
        console.log('Loading user data from offline cache');
        return offlineData.data;
      } else {
        throw new Error('No offline data available');
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

// UPDATE: Update user data with validation
export async function updateUserData(userId, updateData) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate partial data
    const sanitizedData = sanitizeData(updateData);
    
    const { db } = await getFirebaseInstance();
    const userDocRef = doc(db, 'users', userId);
    
    const update = {
      ...sanitizedData,
      lastUpdated: serverTimestamp()
    };

    if (offlineManager.isOnline) {
      await updateDoc(userDocRef, update);
      console.log('User data updated successfully');
    } else {
      offlineManager.addPendingOperation({
        type: 'update',
        collection: 'users',
        docId: userId,
        data: update
      });
      
      // Update offline cache
      const cached = offlineManager.getOfflineData(`user_${userId}`);
      if (cached) {
        offlineManager.storeOfflineData(`user_${userId}`, { ...cached.data, ...update });
      }
      console.log('User data update queued (offline)');
    }

    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

// DELETE: Delete user data
export async function deleteUserData(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { db } = await getFirebaseInstance();
    const userDocRef = doc(db, 'users', userId);

    if (offlineManager.isOnline) {
      await deleteDoc(userDocRef);
      console.log('User data deleted successfully');
    } else {
      offlineManager.addPendingOperation({
        type: 'delete',
        collection: 'users',
        docId: userId
      });
      console.log('User data deletion queued (offline)');
    }

    // Clear offline cache
    localStorage.removeItem(`offline_user_${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

// Specialized update functions with validation and offline support

// Update foods in database
export const updateFoodsInDB = async (user, foods) => {
  try {
    if (!Array.isArray(foods)) {
      throw new Error('Foods must be an array');
    }

    const userId = user?.uid || user;
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await updateUserData(userId, { foods });
  } catch (error) {
    console.error('Error updating foods in database:', error);
    throw error;
  }
};

// Update AI preferences in database  
export const updateAIPreferencesInDB = async (userId, aiPreferences) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (typeof aiPreferences !== 'object' || aiPreferences === null) {
      throw new Error('AI preferences must be an object');
    }

    return await updateUserData(userId, { aiPreferences });
  } catch (error) {
    console.error('Error updating AI preferences in database:', error);
    throw error;
  }
};

// Update liked meals in database
export const updateLikedMealsInDB = async (userId, likedMeals) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(likedMeals)) {
      throw new Error('Liked meals must be an array');
    }

    return await updateUserData(userId, { likedMeals });
  } catch (error) {
    console.error('Error updating liked meals:', error);
    throw error;
  }
};

// Update disliked meals in database
export const updateDislikedMealsInDB = async (userId, dislikedMeals) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(dislikedMeals)) {
      throw new Error('Disliked meals must be an array');
    }

    return await updateUserData(userId, { dislikedMeals });
  } catch (error) {
    console.error('Error updating disliked meals:', error);
    throw error;
  }
};

// Update pinned meals in database
export const updatePinnedMealsInDB = async (userId, pinnedMeals) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(pinnedMeals)) {
      throw new Error('Pinned meals must be an array');
    }

    return await updateUserData(userId, { pinnedMeals });
  } catch (error) {
    console.error('Error updating pinned meals:', error);
    throw error;
  }
};

// Update user preferences with validation
export const updateUserPreferences = async (userId, preferences) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    validateData(preferences, VALIDATION_SCHEMAS.preferences);
    return await updateUserData(userId, { preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Save weekly plan to Firestore with validation
export const saveWeeklyPlan = async (userId, foods, weeklyPlan) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(foods)) {
      throw new Error('Foods must be an array');
    }

    if (typeof weeklyPlan !== 'object' || weeklyPlan === null) {
      throw new Error('Weekly plan must be an object');
    }

    return await updateUserData(userId, { 
      foods, 
      weeklyPlan,
      weeklyPlanLastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving weekly plan:', error);
    throw error;
  }
};

// Batch operations for better performance
export const batchUpdateUserData = async (userId, updates) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (typeof updates !== 'object' || updates === null) {
      throw new Error('Updates must be an object');
    }

    // Validate each update separately
    const sanitizedUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'preferences':
          validateData(value, VALIDATION_SCHEMAS.preferences);
          sanitizedUpdates[key] = sanitizeData(value);
          break;
        case 'foods':
        case 'likedMeals':
        case 'dislikedMeals':
        case 'pinnedMeals':
          if (!Array.isArray(value)) {
            throw new Error(`${key} must be an array`);
          }
          sanitizedUpdates[key] = value;
          break;
        case 'weeklyPlan':
        case 'aiPreferences':
          if (typeof value !== 'object' || value === null) {
            throw new Error(`${key} must be an object`);
          }
          sanitizedUpdates[key] = sanitizeData(value);
          break;
        default:
          sanitizedUpdates[key] = value;
      }
    }

    return await updateUserData(userId, sanitizedUpdates);
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};

// Data synchronization utilities
export const syncOfflineData = async () => {
  try {
    await offlineManager.syncPendingOperations();
    console.log('Offline data synchronized successfully');
  } catch (error) {
    console.error('Error syncing offline data:', error);
    throw error;
  }
};

export const getOfflineStatus = () => {
  return {
    isOnline: offlineManager.isOnline,
    pendingOperations: offlineManager.pendingOperations.length
  };
};

// Connection management
export const enableOfflineMode = async () => {
  try {
    const { db } = await getFirebaseInstance();
    await disableNetwork(db);
    console.log('Offline mode enabled');
  } catch (error) {
    console.error('Error enabling offline mode:', error);
  }
};

export const enableOnlineMode = async () => {
  try {
    const { db } = await getFirebaseInstance();
    await enableNetwork(db);
    await syncOfflineData();
    console.log('Online mode enabled');
  } catch (error) {
    console.error('Error enabling online mode:', error);
  }
};



// Enhanced global exports for non-module compatibility
if (typeof window !== 'undefined') {
  // Core CRUD operations
  window.createUserData = createUserData;
  window.loadUserData = loadUserData;
  window.updateUserData = updateUserData;
  window.deleteUserData = deleteUserData;
  
  // Specialized update functions
  window.updateFoodsInDB = updateFoodsInDB;
  window.updateAIPreferencesInDB = updateAIPreferencesInDB;
  window.updateLikedMealsInDB = updateLikedMealsInDB;
  window.updateDislikedMealsInDB = updateDislikedMealsInDB;
  window.updatePinnedMealsInDB = updatePinnedMealsInDB;
  window.updateUserPreferences = updateUserPreferences;
  window.saveWeeklyPlan = saveWeeklyPlan;
  
  // Batch and utility functions
  window.batchUpdateUserData = batchUpdateUserData;
  window.syncOfflineData = syncOfflineData;
  window.getOfflineStatus = getOfflineStatus;
  window.enableOfflineMode = enableOfflineMode;
  window.enableOnlineMode = enableOnlineMode;
  
  // Validation utilities (for external use)
  window.validateUserData = (data) => validateData(data, VALIDATION_SCHEMAS.userData);
  window.validateMeal = (data) => validateData(data, VALIDATION_SCHEMAS.meal);
  window.validatePreferences = (data) => validateData(data, VALIDATION_SCHEMAS.preferences);
}

// Update meal ratings in database
export const updateMealRatingsInDB = async (userId, mealRatings) => {
  console.log('Updating meal ratings in database for user:', userId);
  
  try {
    if (!mealRatings || typeof mealRatings !== 'object') {
      throw new Error('Meal ratings must be an object');
    }
    
    return await updateUserData(userId, { mealRatings });
  } catch (error) {
    console.error('Error updating meal ratings in database:', error);
    throw error;
  }
};

// Update learning data in database
export const updateLearningDataInDB = async (userId, learningData) => {
  console.log('Updating learning data in database for user:', userId);
  
  try {
    if (!learningData || typeof learningData !== 'object') {
      throw new Error('Learning data must be an object');
    }
    
    return await updateUserData(userId, { learningData });
  } catch (error) {
    console.error('Error updating learning data in database:', error);
    throw error;
  }
};

// Batch update meal learning data (ratings + preferences + history)
export const updateMealLearningDataInDB = async (userId, learningUpdate) => {
  console.log('Batch updating meal learning data for user:', userId);
  
  try {
    const updateData = {};
    
    if (learningUpdate.mealRatings) {
      updateData.mealRatings = learningUpdate.mealRatings;
    }
    
    if (learningUpdate.learningData) {
      updateData.learningData = learningUpdate.learningData;
    }
    
    if (learningUpdate.aiPreferences) {
      updateData.aiPreferences = learningUpdate.aiPreferences;
    }
    
    return await batchUpdateUserData(userId, updateData);
  } catch (error) {
    console.error('Error batch updating meal learning data:', error);
    throw error;
  }
};

// Load meal ratings from database
export const loadMealRatingsFromDB = async (userId) => {
  console.log('Loading meal ratings from database for user:', userId);
  
  try {
    const userData = await loadUserData(userId);
    return userData?.mealRatings || {};
  } catch (error) {
    console.error('Error loading meal ratings from database:', error);
    return {};
  }
};

// Load learning data from database
export const loadLearningDataFromDB = async (userId) => {
  console.log('Loading learning data from database for user:', userId);
  
  try {
    const userData = await loadUserData(userId);
    return userData?.learningData || {};
  } catch (error) {
    console.error('Error loading learning data from database:', error);
    return {};
  }
};

// Make enhanced functions globally available
if (typeof window !== 'undefined') {
  window.updateMealRatingsInDB = updateMealRatingsInDB;
  window.updateLearningDataInDB = updateLearningDataInDB;
  window.updateMealLearningDataInDB = updateMealLearningDataInDB;
  window.loadMealRatingsFromDB = loadMealRatingsFromDB;
  window.loadLearningDataFromDB = loadLearningDataFromDB;
}
