import { updatePinnedMealsInDB, updateLikedMealsInDB, updateDislikedMealsInDB } from './dataManager.js';
import { getFirebaseInstance } from './firebase.js';

// Google search functionality
export const searchRecipe = (mealName) => {
  const searchQuery = encodeURIComponent(mealName + ' recipe');
  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
  window.open(googleSearchUrl, '_blank');
};

// Pin/Unpin meal functionality
export function togglePinMeal(dayIndex, currentUser, pinnedMeals, updatePinButtonCallback) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  const pinnedIndex = pinnedMeals.findIndex(pinned => pinned.dayIndex === dayIndex);

  if (pinnedIndex > -1) {
    // Unpin the meal
    pinnedMeals.splice(pinnedIndex, 1);
  } else {
    // Pin the meal
    pinnedMeals.push({ dayIndex, meal: mealText });
  }

  // Update the UI
  updatePinButtonCallback(dayIndex, pinnedMeals);

  // Save to database
  updatePinnedMealsInDB(currentUser, pinnedMeals);

  return pinnedMeals;
}

// Like/unlike meal functionality
export const likeMeal = async (dayIndex, currentUser, likedMeals, renderLikedMealsCallback) => {
  try {
    const mealText = getMealText(dayIndex);
    if (!mealText) return likedMeals;

    const { db } = await getFirebaseInstance();
    
    const mealIndex = likedMeals.indexOf(mealText);
    let updatedLikedMeals;
    
    if (mealIndex === -1) {
      // Add to liked meals
      updatedLikedMeals = [...likedMeals, mealText];
    } else {
      // Remove from liked meals
      updatedLikedMeals = [
        ...likedMeals.slice(0, mealIndex),
        ...likedMeals.slice(mealIndex + 1)
      ];
    }

    // Save to database
    await updateLikedMealsInDB(currentUser, updatedLikedMeals);

    // Show feedback
    const msg = document.getElementById('saveMealMsg');
    if (msg) {
      msg.textContent = mealIndex === -1 ? 'Meal liked!' : 'Like removed!';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    }

    // Update liked meals display if on that tab
    renderLikedMealsCallback();

    return updatedLikedMeals;
  } catch (error) {
    console.error('Error liking meal:', error);
    // Show error message to user
    const msg = document.getElementById('saveMealMsg');
    if (msg) {
      msg.textContent = 'Error updating meal like status. Please try again.';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
    return likedMeals;
  }
};

// Dislike/undislike meal functionality
export const dislikeMeal = async (dayIndex, currentUser, dislikedMeals, likedMeals, generateSingleMealCallback) => {
  try {
    const mealText = getMealText(dayIndex);
    if (!mealText) return dislikedMeals;

    const { db } = await getFirebaseInstance();
    
    const mealIndex = dislikedMeals.indexOf(mealText);
    let updatedDislikedMeals;
    let updatedLikedMeals = likedMeals;
    
    if (mealIndex === -1) {
      // Add to disliked meals
      updatedDislikedMeals = [...dislikedMeals, mealText];
      
      // Remove from liked meals if present
      const likedIndex = likedMeals.indexOf(mealText);
      if (likedIndex > -1) {
        updatedLikedMeals = [
          ...likedMeals.slice(0, likedIndex),
          ...likedMeals.slice(likedIndex + 1)
        ];
        await updateLikedMealsInDB(currentUser, updatedLikedMeals);
      }

      // Generate a new meal for this day
      generateSingleMealCallback(dayIndex);
    } else {
      // Remove from disliked meals
      updatedDislikedMeals = [
        ...dislikedMeals.slice(0, mealIndex),
        ...dislikedMeals.slice(mealIndex + 1)
      ];
    }

    // Save to database
    await updateDislikedMealsInDB(currentUser, updatedDislikedMeals);

    // Show feedback
    const msg = document.getElementById('saveMealMsg');
    if (msg) {
      msg.textContent = mealIndex === -1 ? 'Meal disliked!' : 'Dislike removed!';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    }

    return updatedDislikedMeals;
  } catch (error) {
    console.error('Error disliking meal:', error);
    // Show error message to user
    const msg = document.getElementById('saveMealMsg');
    if (msg) {
      msg.textContent = 'Error updating meal dislike status. Please try again.';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
    return dislikedMeals;
  }
};

// Update pin button appearance
export const updatePinButton = (dayIndex, pinnedMeals) => {
  const pinBtn = document.querySelector(`[onclick="togglePinMeal(${dayIndex})"]`);
  const isPinned = pinnedMeals.some(pinned => pinned.dayIndex === dayIndex);

  if (pinBtn) {
    pinBtn.textContent = isPinned ? '📌' : '📍';
    pinBtn.style.background = isPinned ? '#ffd700' : '#e0e7ff';
    pinBtn.title = isPinned ? 'Unpin meal' : 'Pin meal';
  }
};

// Get current plan from the UI
export const getCurrentPlan = () => {
  const plan = [];
  let dayIndex = 0;
  while (document.getElementById('mealText' + dayIndex)) {
    const mealText = document.getElementById('mealText' + dayIndex).textContent;
    if (mealText) plan.push(mealText);
    dayIndex++;
  }
  return plan;
};