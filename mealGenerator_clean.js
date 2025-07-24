// Meal plan generation logic
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates, calculateUserFoodMealCount, generateMealFromSource } from './mealTemplates.js';
import { saveWeeklyPlan } from './dataManager.js';
import { getCurrentPlan } from './mealActions.js';
import { updateDoc, doc } from './firebase.js';

export class MealPlanningAI {
  constructor() {
    this.preferences = {
      dietaryRestrictions: {
        vegetarian: false,
        easyMeals: false
      }
    };
  }

  applyDietaryRestrictions(categorizedFoods) {
    if (this.preferences.dietaryRestrictions.vegetarian) {
      categorizedFoods.proteins = categorizedFoods.proteins.filter(f => 
        !f.toLowerCase().includes('chicken') && 
        !f.toLowerCase().includes('beef') && 
        !f.toLowerCase().includes('fish')
      );
    }
    if (this.preferences.dietaryRestrictions.easyMeals) {
      categorizedFoods.sides = categorizedFoods.sides.filter(f => f.difficulty === 'easy');
    }
    return categorizedFoods;
  }

  savePreferences() {
    if (this.user) {
      updateDoc(doc(db, 'users', this.user.uid), {
        preferences: this.preferences
      });
    }
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

// Main meal plan generation function
export function generatePlan(currentUser, foodsArr, pinnedMeals, dislikedMeals, likedMeals, renderPlanCallback) {
  let categorizedFoods = categorizeFoods(foodsArr);

  // Apply dietary restrictions
  const mealAI = new MealPlanningAI();
  // Note: this.preferences is not available in this context, need to pass it as parameter
  // For now, skipping dietary restrictions until preferences are properly passed
  // categorizedFoods = mealAI.applyDietaryRestrictions(categorizedFoods);
  
  // Check if we have enough variety (even with popular foods)
  const totalUserFoods = categorizedFoods.user.meats.length + categorizedFoods.user.carbs.length + categorizedFoods.user.veggies.length + categorizedFoods.user.other.length;
  const totalPopularFoods = categorizedFoods.popular.meats.length + categorizedFoods.popular.carbs.length + categorizedFoods.popular.veggies.length + categorizedFoods.popular.other.length;
  
  if (totalUserFoods === 0 && totalPopularFoods === 0) {
    document.getElementById('calendar-container').innerHTML = '<p style="color:#e74c3c;">Unable to generate meals. Please add some foods in the "My Foods" tab.</p>';
    return;
  }
  
  let plan = [];
  const weeks = parseInt(document.getElementById('weeksSelect').value) || 1;
  const totalDays = weeks * 7;
  
  // Calculate how many meals should include user foods
  const userFoodMealCount = calculateUserFoodMealCount(foodsArr.length, totalDays);
  let userFoodMealsGenerated = 0;
  
  // Check if there's an existing plan and preserve pinned meals
  const existingPlan = getCurrentPlan();
  
  for (let i = 0; i < totalDays; i++) {
    // Check if this day has a pinned meal
    const pinnedMeal = pinnedMeals.find(pinned => pinned.dayIndex === i);
    
    if (pinnedMeal) {
      // Use the pinned meal
      plan.push(pinnedMeal.meal);
    } else {
      // Generate a new meal
      let meal = null;
      let attempts = 0;
      
      // First try to use a liked meal if available (30% chance)
      if (likedMeals.length > 0 && Math.random() < 0.3) {
        meal = likedMeals[Math.floor(Math.random() * likedMeals.length)];
      }
      
      // If no liked meal was selected or available, generate a new one
      while (!meal && attempts < 20) {
        const template = popularMealTemplates[Math.floor(Math.random() * popularMealTemplates.length)];
        
        // Decide whether this meal should use user foods
        const shouldUseUserFoods = userFoodMealsGenerated < userFoodMealCount && totalUserFoods > 0;
        
        if (shouldUseUserFoods) {
          // Use ONLY user foods for this meal
          meal = generateMealFromSource(template, categorizedFoods.user, dislikedMeals);
          if (meal) {
            userFoodMealsGenerated++;
          }
        } else {
          // Use ONLY popular foods for this meal
          meal = generateMealFromSource(template, categorizedFoods.popular, dislikedMeals);
        }
        
        attempts++;
      }
      
      // Fallback if we couldn't generate a meal
      if (!meal) {
        meal = "Simple meal with available ingredients";
      }
      
      plan.push(meal);
    }
  }
  
  renderPlanCallback(plan);
  saveWeeklyPlan(currentUser, foodsArr, plan, pinnedMeals, dislikedMeals, likedMeals);
}