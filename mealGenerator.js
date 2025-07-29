// Meal plan generation logic
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates, generateMealFromSource } from './mealTemplates.js';
import { saveWeeklyPlan } from './dataManager.js';
import { getCurrentPlan } from './mealActions.js';

const db = window.db;

// Generate a single new meal for a specific day
export function generateSingleMeal(dayIndex, currentUser, foodsArr, dislikedMeals, likedMeals, saveWeeklyPlanCallback) {
  const categorizedFoods = categorizeFoods(foodsArr);
  
  let newMeal = null;
  let attempts = 0;
  
  // First try to use a liked meal if available
  if (likedMeals.length > 0 && Math.random() < 0.3) {
    newMeal = likedMeals[Math.floor(Math.random() * likedMeals.length)];
  }
  
  // If no liked meal was selected or available, generate a new one
  while (!newMeal && attempts < 20) {
    const template = popularMealTemplates[Math.floor(Math.random() * popularMealTemplates.length)];
    
    // Randomly decide whether to use user foods or popular foods
    const useUserFoods = Math.random() < 0.5 && foodsArr.length > 0;
    const foodSource = useUserFoods ? categorizedFoods.user : categorizedFoods.popular;
    
    newMeal = generateMealFromSource(template, foodSource, dislikedMeals);
    attempts++;
  }
  
  if (newMeal) {
    // Update the meal in the UI
    document.getElementById('mealText' + dayIndex).textContent = newMeal;
    
    // Update the current plan and save it
    const currentPlan = getCurrentPlan();
    currentPlan[dayIndex] = newMeal;
    saveWeeklyPlanCallback(foodsArr, currentPlan);
  }
}

// Main meal plan generation function
export function generatePlan(user, foods, pinnedMeals, dislikedMeals, likedMeals, callback) {
  // Initialize all parameters with defaults if undefined
  user = user || {};
  foods = foods || [];
  pinnedMeals = pinnedMeals || [];
  dislikedMeals = dislikedMeals || [];
  likedMeals = likedMeals || [];
  callback = typeof callback === 'function' ? callback : () => {};

  // Declare variables once at the top of the function
  let categorizedFoods;
  let weeksSelect;

  try {
    // Ensure we have access to required global functions and objects
    if (typeof window.categorizeFoods !== 'function' || 
        typeof window.getCurrentPlan !== 'function' ||
        !window.allRecipes) {
      throw new Error('Missing required global dependencies for meal planning');
    }
    
    const categorizeFoods = window.categorizeFoods;
    const getCurrentPlan = window.getCurrentPlan;
    const allRecipes = window.allRecipes || [];
    
    // Categorize foods with fallback to empty categories
    categorizedFoods = categorizeFoods(foods);
    
    // Check for minimum food variety
    let totalUserFoods = 0;
    let totalPopularFoods = 0;
    
    if (categorizedFoods.user) {
      totalUserFoods = Object.values(categorizedFoods.user).reduce(
        (sum, category) => sum + (Array.isArray(category) ? category.length : 0), 0
      );
    }
    
    if (categorizedFoods.popular) {
      totalPopularFoods = Object.values(categorizedFoods.popular).reduce(
        (sum, category) => sum + (Array.isArray(category) ? category.length : 0), 0
      );
    }
    
    // Get weeks select element safely
    weeksSelect = document.getElementById('weeksSelect');
    let weeks = 1;
    let totalDays = 7;
    if (weeksSelect) {
      weeks = parseInt(weeksSelect.value) || 1;
      totalDays = weeks * 7;
    }
    
    // Check if there's an existing plan
    const existingPlan = window.getCurrentPlan ? window.getCurrentPlan() : [];
    
    // Process recipes
    const availableMeals = allRecipes.filter(recipe => 
      !dislikedMeals.some(disliked => disliked.id === recipe.id)
    );
    const scoredRecipes = availableMeals.map(recipe => {
      let score = 0;
      const ingredientsMatch = recipe.ingredients.filter(ingredient => 
        foods.some(food => food.toLowerCase() === ingredient.toLowerCase())
      ).length;
      score += ingredientsMatch * 10;
      if (preferences.vegetarian && recipe.isVegetarian) {
        score += 20;
      }
      if (preferences.easyMeals && recipe.difficulty === 'easy') {
        score += 15;
      }
      if (likedMeals.some(liked => liked.id === recipe.id)) {
        score += 25;
      }
      return { ...recipe, score };
    });
    const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);
    const weeklyPlan = Array(7).fill(null).map((_, i) => {
      const dayRecipes = sortedRecipes.slice(i * 3, (i + 1) * 3);
      return {
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        meals: dayRecipes
      };
    });
    if (user) {
      db.collection('users').doc(user.uid).update({
        weeklyPlan: weeklyPlan
      });
    }
    if (callback) {
      callback(weeklyPlan);
    }
  } catch (error) {
    console.error('Error generating meal plan:', error);
    if (callback) {
      callback([]);
    }
  }
}

// For backward compatibility with non-module scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePlan, generateSingleMeal };
}

// Add global exports for non-module compatibility
if (typeof window !== 'undefined') {
  window.generatePlan = generatePlan;
  window.generateSingleMeal = generateSingleMeal;
}
