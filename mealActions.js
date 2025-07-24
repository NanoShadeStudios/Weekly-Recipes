import { updatePinnedMealsInDB, updateLikedMealsInDB, updateDislikedMealsInDB } from './dataManager.js';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { db } from './firebase.js';

// Google search functionality
export function searchRecipe(mealName) {
  const searchQuery = encodeURIComponent(mealName + ' recipe');
  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
  window.open(googleSearchUrl, '_blank');
}

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
export function likeMeal(dayIndex, currentUser, likedMeals, renderLikedMealsCallback) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  const msg = document.getElementById('saveMealMsg');

  // Check if meal is already liked
  const mealIndex = likedMeals.indexOf(mealText);

  if (mealIndex === -1) {
    // Add to liked meals
    likedMeals.push(mealText);
    msg.textContent = `Meal liked!`;
  } else {
    // Remove from liked meals
    likedMeals.splice(mealIndex, 1);
    msg.textContent = `Like removed!`;
  }

  // Save to database
  updateLikedMealsInDB(currentUser, likedMeals);

  // Show feedback
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 2000);

  // Update liked meals display if on that tab
  renderLikedMealsCallback();

  return likedMeals;
}

// Dislike/undislike meal functionality
export function dislikeMeal(dayIndex, currentUser, dislikedMeals, likedMeals, generateSingleMealCallback) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  const msg = document.getElementById('saveMealMsg');

  // Check if meal is already disliked
  const mealIndex = dislikedMeals.indexOf(mealText);

  if (mealIndex === -1) {
    // Add to disliked meals
    dislikedMeals.push(mealText);
    msg.textContent = `Meal disliked!`;

    // Remove from liked meals if present
    const likedIndex = likedMeals.indexOf(mealText);
    if (likedIndex > -1) {
      likedMeals.splice(likedIndex, 1);
      updateLikedMealsInDB(currentUser, likedMeals);
    }

    // Generate a new meal for this day
    generateSingleMealCallback(dayIndex);
  } else {
    // Remove from disliked meals
    dislikedMeals.splice(mealIndex, 1);
    msg.textContent = `Dislike removed!`;
  }

  // Save to database
  updateDislikedMealsInDB(currentUser, dislikedMeals);

  // Show feedback
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 2000);

  return dislikedMeals;
}

// Update pin button appearance
export function updatePinButton(dayIndex, pinnedMeals) {
  const pinBtn = document.querySelector(`[onclick="togglePinMeal(${dayIndex})"]`);
  const isPinned = pinnedMeals.some(pinned => pinned.dayIndex === dayIndex);

  if (pinBtn) {
    pinBtn.textContent = isPinned ? '📌' : '📍';
    pinBtn.style.background = isPinned ? '#ffd700' : '#e0e7ff';
    pinBtn.title = isPinned ? 'Unpin meal' : 'Pin meal';
  }
}

// Get current plan from the UI
export function getCurrentPlan() {
  const plan = [];
  let dayIndex = 0;
  while (document.getElementById('mealText' + dayIndex)) {
    plan.push(document.getElementById('mealText' + dayIndex).textContent);
    dayIndex++;
  }
  return plan;
}