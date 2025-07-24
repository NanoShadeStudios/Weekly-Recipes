// Meal plan generation logic
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates, calculateUserFoodMealCount, generateMealFromSource } from './mealTemplates.js';
import { setupAuth } from './auth.js';
import { loadUserData, saveWeeklyPlan } from './dataManager.js';
import { searchRecipe, togglePinMeal, likeMeal, dislikeMeal, updatePinButton } from './mealActions.js';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc } from 'https://unpkg.com/firebase@9.23.0/dist/index.esm.js';

// Use the globally initialized Firebase instance
const db = window.firebase.firestore();

export class MealPlanningAI {
  constructor(userPreferences = {}) {
    this.preferences = {
      dietaryRestrictions: {
        vegetarian: false,
        easyMeals: false
      },
      ...userPreferences
    };
  }

  applyDietaryRestrictions(categorizedFoods) {
    // Apply vegetarian restriction
    if (this.preferences.dietaryRestrictions.vegetarian) {
      categorizedFoods.proteins = categorizedFoods.proteins.filter(f => 
        !f.toLowerCase().includes('chicken') && 
        !f.toLowerCase().includes('beef') && 
        !f.toLowerCase().includes('fish')
      );
    }
    
    // Apply easy meals restriction
    if (this.preferences.dietaryRestrictions.easyMeals) {
      categorizedFoods.sides = categorizedFoods.sides.filter(f => f.difficulty === 'easy');
    }
    
    return categorizedFoods;
  }

  analyzeIngredientUsage(foodsArr) {
    // Analyze which ingredients are used most frequently in user's recipes
    const ingredientFrequency = {};
    
    foodsArr.forEach(food => {
      if (food.recipes && Array.isArray(food.recipes)) {
        food.recipes.forEach(recipeId => {
          ingredientFrequency[recipeId] = (ingredientFrequency[recipeId] || 0) + 1;
        });
      }
    });
    
    // Sort by frequency
    return Object.entries(ingredientFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([recipeId]) => recipeId);
  }

  async savePreferences(userId) {
    if (userId && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          'preferences.mealPreferences': this.preferences
        });
        return true;
      } catch (error) {
        console.error("Error saving preferences:", error);
        return false;
      }
    }
    return false;
  }
}

// Generate a single new meal for a specific day
export function generateSingleMeal(dayIndex, currentUser, foodsArr, dislikedMeals, likedMeals, saveWeeklyPlanCallback) {
  let categorizedFoods = categorizeFoods(foodsArr);

  // Apply dietary restrictions
  const mealAI = new MealPlanningAI();
  // Note: this.preferences is not available in this context, need to pass it as parameter
  // For now, skipping dietary restrictions until preferences are properly passed
  // categorizedFoods = mealAI.applyDietaryRestrictions(categorizedFoods);
  
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

export function generatePlan(user, foods, pinnedMeals, dislikedMeals, likedMeals, callback) {
  // Get user preferences
  const preferences = user?.preferences || {};
  
  // Initialize all variables at the top
  let categorizedFoods;
  let userFoodMealCount;
  let userFoodMealsGenerated = 0;
  let dislikedRecipeIds;
  let availableRecipes;
  let weeklyPlan;
  
  try {
    // Try to get values from UI if available
    const weeksSelect = document.getElementById('weeksSelect');
    let weeks = 1;
    let totalDays = 7;
    
    if (weeksSelect) {
      weeks = parseInt(weeksSelect.value) || 1;
      totalDays = weeks * 7;
    }
    
    // Filter out disliked meals
    const availableMeals = allRecipes.filter(recipe => 
      !dislikedMeals.some(disliked => disliked.id === recipe.id)
    );
    
    // Score recipes based on user preferences and ingredients
    const scoredRecipes = availableMeals.map(recipe => {
      let score = 0;
      
      // Ingredient match scoring
      const ingredientsMatch = recipe.ingredients.filter(ingredient => 
        foods.some(food => food.toLowerCase() === ingredient.toLowerCase())
      ).length;
      score += ingredientsMatch * 10;
      
      // Preference scoring
      if (preferences.vegetarian && recipe.isVegetarian) {
        score += 20;
      }
      
      if (preferences.easyMeals && recipe.difficulty === 'easy') {
        score += 15;
      }
      
      // Recently liked meals boost
      if (likedMeals.some(liked => liked.id === recipe.id)) {
        score += 25;
      }
      
      return { ...recipe, score };
    });
    
    // Sort by score and select top meals
    const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Generate weekly plan (basic 7-day structure)
    weeklyPlan = Array(7).fill(null).map((_, i) => {
      const dayRecipes = sortedRecipes.slice(i * 3, (i + 1) * 3);
      return {
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        meals: dayRecipes
      };
    });
    
    // Save to database
    if (user) {
      updateDoc(doc(db, 'users', user.uid), {
        weeklyPlan: weeklyPlan
      });
    }
    
    // Call callback with generated plan
    callback(weeklyPlan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    // Ensure we call the callback even if there's an error
    if (callback) {
      callback([]);
    }
  }
}

// Sample recipe data structure
const allRecipes = [
  {
    id: 1,
    name: 'Vegetarian Chili',
    ingredients: ['beans', 'tomatoes', 'onions', 'bell peppers'],
    isVegetarian: true,
    difficulty: 'medium',
    prepTime: 45
  },
  {
    id: 2,
    name: 'Easy Stir Fry',
    ingredients: ['chicken', 'broccoli', 'soy sauce', 'rice'],
    isVegetarian: false,
    difficulty: 'easy',
    prepTime: 30
  }
  // More recipes would be added here
];