import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

// Import Firebase configuration
import { firebaseConfig } from './config.js';

// Initialize Firebase
const initializeFirebase = async () => {
  console.log('Firebase: initializeFirebase called');
  try {
    if (!getApps().length) {
      console.log('Firebase: Initializing Firebase app...');
      initializeApp(firebaseConfig);
      console.log('Firebase: Firebase app initialized');
    } else {
      console.log('Firebase: Firebase app already initialized');
    }
    
    // Ensure auth is initialized
    console.log('Firebase: Getting auth...');
    const auth = getAuth();
    console.log('Firebase: Auth obtained');
    
    // Initialize Cloud Functions for ML processing
    console.log('Firebase: Getting functions...');
    const functions = getFunctions();
    console.log('Firebase: Functions obtained');
    
    // Add exponential backoff retry for Firestore initialization
    let retryCount = 0;
    const maxRetries = 3;
    
    console.log('Firebase: Initializing Firestore...');
    while (retryCount < maxRetries) {
      try {
        const db = getFirestore();
        console.log('Firebase: Firestore initialized successfully');
        const result = { auth, db, functions };
        console.log('Firebase: Returning Firebase instance:', result);
        return result;
      } catch (dbError) {
        retryCount++;
        console.warn(`Firebase: Firestore initialization attempt ${retryCount} failed:`, dbError);
        if (retryCount === maxRetries) {
          throw new Error(`Firestore initialization failed after ${maxRetries} retries`);
        }
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Firebase: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (error) {
    console.error('Firebase: Firebase initialization error:', error);
    // Fallback to alternative CDN if available
    if (error.message.includes('Network error')) {
      console.log('Firebase: Attempting to load Firebase from alternative CDN');
      // Logic to switch to alternative CDN would go here
    }
    throw error;
  }
};

// Create a singleton instance
let firebaseInstance = null;

const getFirebaseInstance = async () => {
  console.log('Firebase: getFirebaseInstance called');
  if (!firebaseInstance) {
    console.log('Firebase: Creating new Firebase instance...');
    firebaseInstance = await initializeFirebase();
    console.log('Firebase: Firebase instance created');
  } else {
    console.log('Firebase: Using existing Firebase instance');
  }
  return firebaseInstance;
};

export { initializeFirebase, getFirebaseInstance, setupAuthListeners, setupDatabaseListeners };

// Set up authentication listeners
const setupAuthListeners = (auth) => {
  // Set persistence to LOCAL so auth persists across browser sessions
  setPersistence(auth, browserLocalPersistence).then(() => {
    console.log('Auth persistence set to LOCAL');
  }).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

  // Note: Auth state change handling is now managed by the AuthManager in auth.js
  // This avoids conflicts and provides better error handling
  console.log('Firebase auth listeners setup completed - state changes handled by AuthManager');
};

// Set up database listeners (example: listen to a collection)
const setupDatabaseListeners = (db) => {
  const foodsCollection = collection(db, 'foods');
  onSnapshot(foodsCollection, (snapshot) => {
    const foods = [];
    snapshot.forEach(doc => {
      foods.push({ id: doc.id, ...doc.data() });
    });
    console.log('Foods collection updated:', foods);
    window.foodsArr = foods;
    // Additional logic to update UI or state can be added here
  });
};

// Remove global window pollution - use proper module exports only
export default {
  getFirebaseInstance
};
