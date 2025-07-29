// Import Firebase configuration
import { firebaseConfig } from './config.js';

// Initialize Firebase
const initializeFirebase = async () => {
  try {
    if (!firebase.apps.length) {
      await firebase.initializeApp(firebaseConfig);
    }
    // Ensure auth is initialized
    const auth = firebase.auth();
    
    // Add exponential backoff retry for Firestore initialization
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const db = firebase.firestore();
        // Verify database connection
        await db.collection("test").get();
        return { firebase, auth, db };
      } catch (dbError) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Firestore initialization failed after ${maxRetries} retries`);
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback to alternative CDN if available
    if (error.message.includes('Network error')) {
      console.log('Attempting to load Firebase from alternative CDN');
      // Logic to switch to alternative CDN would go here
    }
    throw error;
  }
};

// Create a singleton instance
let firebaseInstance = null;

const getFirebaseInstance = async () => {
  if (!firebaseInstance) {
    firebaseInstance = await initializeFirebase();
  }
  return firebaseInstance;
};

// Export both named and default exports for flexibility
export { initializeFirebase, getFirebaseInstance };

// Make firebase available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.firebase = firebase;
  // Only attach to window if it doesn't already exist
  if (!window.getFirebaseInstance) {
    window.getFirebaseInstance = getFirebaseInstance;
  }
}

export default {
  firebase,
  getFirebaseInstance
};