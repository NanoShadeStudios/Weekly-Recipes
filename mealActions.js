import { updatePinnedMealsInDB, updateAIPreferencesInDB, updateDislikedMealsInDB } from './dataManager.js';
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

// AI feedback functionality - learn from user preferences
export const giveMealFeedback = async (dayIndex, feedbackType, currentUser) => {
  try {
    const mealText = getMealText(dayIndex);
    if (!mealText) return;

    // Train AI with user feedback
    if (window.mealPlanningAI) {
      try {
        switch (feedbackType) {
          case 'love':
            await window.mealPlanningAI.learnFromPin(mealText);
            showFeedbackMessage('🧠 AI learned you love this meal!');
            break;
          case 'like':
            await window.mealPlanningAI.learnFromLike(mealText);
            showFeedbackMessage('👍 AI noted your preference!');
            break;
          case 'dislike':
            await window.mealPlanningAI.learnFromDislike(mealText);
            showFeedbackMessage('👎 AI will avoid similar meals');
            break;
        }
      } catch (error) {
        console.warn('Error training AI with feedback:', error);
        showFeedbackMessage('Feedback received!');
      }
    } else {
      showFeedbackMessage('Feedback received!');
    }

  } catch (error) {
    console.error('Error processing meal feedback:', error);
    showFeedbackMessage('Error processing feedback. Please try again.');
  }
}

function showFeedbackMessage(message) {
  const msg = document.getElementById('saveMealMsg');
  if (msg) {
    msg.textContent = message;
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
  }
}

// Dislike/undislike meal functionality
export const dislikeMeal = async (dayIndex, currentUser, dislikedMeals, generateSingleMealCallback) => {
  try {
    const mealText = getMealText(dayIndex);
    if (!mealText) return dislikedMeals;

    const { db } = await getFirebaseInstance();
    
    const mealIndex = dislikedMeals.indexOf(mealText);
    let updatedDislikedMeals;
    
    if (mealIndex === -1) {
      // Add to disliked meals
      updatedDislikedMeals = [...dislikedMeals, mealText];
      
      // Train AI that this meal was disliked
      if (window.mealPlanningAI) {
        try {
          await window.mealPlanningAI.learnFromDislike(mealText);
        } catch (error) {
          console.warn('Error training AI with dislike:', error);
        }
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

// AI feedback function for recipe cards
export const giveMealFeedbackByName = async (mealName, feedbackType, currentUser) => {
  try {
    const { auth } = await getFirebaseInstance();
    const user = auth.currentUser;
    if (!user) return;

    // Train AI with user feedback
    if (window.mealPlanningAI) {
      try {
        switch (feedbackType) {
          case 'love':
            await window.mealPlanningAI.learnFromPin(mealName);
            console.log(`AI learned you love "${mealName}"`);
            break;
          case 'like':
            await window.mealPlanningAI.learnFromLike(mealName);
            console.log(`AI noted you like "${mealName}"`);
            break;
          case 'dislike':
            await window.mealPlanningAI.learnFromDislike(mealName);
            console.log(`AI will avoid meals similar to "${mealName}"`);
            break;
        }
      } catch (error) {
        console.warn('Error training AI with feedback:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error processing meal feedback:', error);
    return false;
  }
};

// Simplified dislike meal function for recipe cards
export const dislikeMealByName = async (mealName, currentUser) => {
  try {
    const { auth } = await getFirebaseInstance();
    const user = auth.currentUser;
    if (!user) return;

    // Get current disliked meals from localStorage or initialize empty array
    let dislikedMeals = JSON.parse(localStorage.getItem('dislikedMeals') || '[]');
    let likedMeals = JSON.parse(localStorage.getItem('likedMeals') || '[]');
    
    const mealIndex = dislikedMeals.indexOf(mealName);
    
    if (mealIndex === -1) {
      // Add to disliked meals (permanently excluded)
      dislikedMeals.push(mealName);
      
      // Remove from liked meals if present
      const likedIndex = likedMeals.indexOf(mealName);
      if (likedIndex !== -1) {
        likedMeals.splice(likedIndex, 1);
        localStorage.setItem('likedMeals', JSON.stringify(likedMeals));
        await updateLikedMealsInDB(user.uid, likedMeals);
      }
      
      console.log(`Meal "${mealName}" permanently excluded from future meal plans`);
      
      // Save disliked meals immediately
      localStorage.setItem('dislikedMeals', JSON.stringify(dislikedMeals));
      await updateDislikedMealsInDB(user.uid, dislikedMeals);
      
      // Generate a replacement meal and update the UI
      await generateReplacementMeal(mealName);
      
    } else {
      // Remove from disliked meals (allow it to appear again)
      dislikedMeals.splice(mealIndex, 1);
      localStorage.setItem('dislikedMeals', JSON.stringify(dislikedMeals));
      await updateDislikedMealsInDB(user.uid, dislikedMeals);
      console.log(`Meal "${mealName}" can now appear in meal plans again`);
    }

    return dislikedMeals;
  } catch (error) {
    console.error('Error disliking meal:', error);
    return [];
  }
};

// Function to generate and replace a disliked meal
async function generateReplacementMeal(dislikedMealName) {
  try {
    // Import generateReplacementMeal function
    const { generateReplacementMeal } = await import('./mealGenerator.js');
    
    // Get current user foods and preferences
    const foods = JSON.parse(localStorage.getItem('foods') || '[]');
    const dislikedMeals = JSON.parse(localStorage.getItem('dislikedMeals') || '[]');
    const likedMeals = JSON.parse(localStorage.getItem('likedMeals') || '[]');
    
    // Generate a replacement meal
    const replacementMeal = await generateReplacementMeal(foods, dislikedMeals, likedMeals);
    
    // Find and replace the meal in the current plan display
    const mealCards = document.querySelectorAll('.recipe-card');
    mealCards.forEach(card => {
      const mealNameElement = card.querySelector('.recipe-name');
      if (mealNameElement && mealNameElement.textContent.trim() === dislikedMealName) {
        // Replace the meal name and regenerate details
        mealNameElement.textContent = replacementMeal.name;
        
        // Update prep time
        const timeElement = card.querySelector('.recipe-detail-item');
        if (timeElement) {
          timeElement.innerHTML = `<span class="emoji">⏱️</span> ${replacementMeal.prepTime} min`;
        }
        
        // Update ingredients
        const ingredientList = card.querySelector('.ingredient-list');
        if (ingredientList) {
          ingredientList.innerHTML = '';
          replacementMeal.ingredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.textContent = ingredient;
            ingredientList.appendChild(tag);
          });
        }
        
        console.log(`Replaced "${dislikedMealName}" with "${replacementMeal.name}"`);
      }
    });
    
  } catch (error) {
    console.error('Error generating replacement meal:', error);
  }
}