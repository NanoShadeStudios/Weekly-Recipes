// Import Firebase functions using module syntax
import { getFirebaseInstance } from './firebase.js';

// Use dynamic import for Firebase to ensure proper module loading


// Use global Firebase instance
// Ensure we only declare once
if (typeof getFirebaseInstance === 'undefined') {
  const { getFirebaseInstance } = window;
}

// Use global db and auth from window

// Load user data from Firestore
function loadUserData() {
  // Get current user
  const user = auth.currentUser;

  if (user) {
    const userDocRef = db.collection('users').doc(user.uid);

    userDocRef.get()
      .then((docSnap) => {
        if (docSnap.exists) {
          // Process user data
          console.log('User data loaded successfully');
        } else {
          // Create new user document
          userDocRef.set({
            meals: {},
            preferences: {},
            createdAt: new Date()
          });
        }
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
      });
  }
}

// Function to update liked meals in database
export const updateLikedMealsInDB = async (userId, likedMeals) => {
  try {
    const { db } = await getFirebaseInstance();
    if (userId) {
      const userDocRef = db.collection('users').doc(userId);
      const update = {
        likedMeals: likedMeals,
        lastUpdated: new Date()
      };
      
      await userDocRef.update(update);
      console.log('Liked meals updated successfully');
    }
  } catch (error) {
    console.error('Error updating liked meals:', error);
    // Handle error (e.g., show error message to user)
  }
};

// Function to update disliked meals in database
export const updateDislikedMealsInDB = async (userId, dislikedMeals) => {
  try {
    const { db } = await getFirebaseInstance();
    if (userId) {
      const userDocRef = db.collection('users').doc(userId);
      const update = {
        dislikedMeals: dislikedMeals,
        lastUpdated: new Date()
      };
      
      await userDocRef.update(update);
      console.log('Disliked meals updated successfully');
    }
  } catch (error) {
    console.error('Error updating disliked meals:', error);
    // Handle error (e.g., show error message to user)
  }
};

// Function to update pinned meals in database
export const updatePinnedMealsInDB = async (userId, pinnedMeals) => {
  try {
    const { db } = await getFirebaseInstance();
    if (userId) {
      const userDocRef = db.collection('users').doc(userId);
      const update = {
        pinnedMeals: pinnedMeals,
        lastUpdated: new Date()
      };
      
      await userDocRef.update(update);
      console.log('Pinned meals updated successfully');
    }
  } catch (error) {
    console.error('Error updating pinned meals:', error);
    // Handle error (e.g., show error message to user)
  }
};

// Function to save weekly plan to Firestore
export const saveWeeklyPlan = async (userId, foods, weeklyPlan) => {
  try {
    const { db } = await getFirebaseInstance();
    // Get current user
    const user = auth.currentUser;

    if (user) {
      const userDocRef = db.collection('users').doc(user.uid);

      const update = {};
      update[`meals.${weekStartDate}`] = meals;
      userDocRef.update(update);
    }
  } catch (error) {
    console.error('Error saving weekly plan:', error);
    // Handle error (e.g., show error message to user)
  }
};



// Add global exports for non-module compatibility
if (typeof window !== 'undefined') {
  window.loadUserData = loadUserData;
  window.saveWeeklyPlan = saveWeeklyPlan;
  window.updateLikedMealsInDB = updateLikedMealsInDB;
  window.updateDislikedMealsInDB = updateDislikedMealsInDB;
  window.updatePinnedMealsInDB = updatePinnedMealsInDB;
}
