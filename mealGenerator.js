/**
 * Enhanced Meal Generator with improved dietary restriction support and variety
 * Provides intelligent meal planning with nutrition balancing and preference learning
 * @module MealGenerator
 */

// Enhanced Meal Generator with improved dietary restriction support and variety
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates, calculateUserFoodMealCount, generateMealFromSource } from './mealTemplates.js';
import { saveWeeklyPlan } from './dataManager.js';
import { getCurrentPlan } from './mealActions.js';
import { getFirebaseInstance } from './firebase.js';

/**
 * Enhanced Meal Planner Class
 * Handles intelligent meal generation with dietary restrictions, nutrition tracking,
 * and preference-based recommendations
 * @class EnhancedMealPlanner
 */
class EnhancedMealPlanner {
  /**
   * Initialize the enhanced meal planner with default nutrition targets
   * @constructor
   */
  constructor() {
    this.recentMeals = [];
    this.nutritionTargets = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
      fiber: 25
    };
    this.weeklyNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
    this.dietaryRestrictions = [];
    this.mealPreferences = {};
  }

  /**
   * Set dietary restrictions for meal planning
   * @param {string[]} restrictions - Array of dietary restrictions (vegetarian, vegan, gluten-free, etc.)
   */
  setDietaryRestrictions(restrictions) {
    this.dietaryRestrictions = restrictions || [];
    console.log('Enhanced Planner: Set dietary restrictions:', this.dietaryRestrictions);
  }

  /**
   * Set user meal preferences for personalized planning
   * @param {Object} preferences - User meal preferences object
   */
  setMealPreferences(preferences) {
    this.mealPreferences = preferences || {};
    console.log('Enhanced Planner: Set meal preferences:', this.mealPreferences);
  }

  /**
   * Check if an ingredient complies with the user's dietary restrictions
   * @param {string} ingredient - The ingredient to check
   * @returns {boolean} True if ingredient is compliant, false otherwise
   */
  isIngredientCompliant(ingredient) {
    const ingredientLower = ingredient.toLowerCase();
    const restrictions = Array.isArray(this.dietaryRestrictions) ? this.dietaryRestrictions : [];
    
    for (const restriction of restrictions) {
      switch (restriction.toLowerCase()) {
        case 'vegetarian':
          if (this.isMeatProduct(ingredientLower)) return false;
          break;
        case 'vegan':
          if (this.isMeatProduct(ingredientLower) || this.isDairyProduct(ingredientLower)) return false;
          break;
        case 'gluten-free':
          if (this.containsGluten(ingredientLower)) return false;
          break;
        case 'dairy-free':
          if (this.isDairyProduct(ingredientLower)) return false;
          break;
        case 'nut-free':
          if (this.containsNuts(ingredientLower)) return false;
          break;
      }
    }
    return true;
  }

  // Helper methods for ingredient checking
  isMeatProduct(ingredient) {
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'bacon', 'ham', 'sausage'];
    return meatKeywords.some(meat => ingredient.includes(meat));
  }

  /**
   * Check if an ingredient is a dairy product
   * @param {string} ingredient - The ingredient to check
   * @returns {boolean} True if ingredient contains dairy
   */
  isDairyProduct(ingredient) {
    const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy'];
    return dairyKeywords.some(dairy => ingredient.includes(dairy));
  }

  /**
   * Check if an ingredient contains gluten
   * @param {string} ingredient - The ingredient to check
   * @returns {boolean} True if ingredient contains gluten
   */
  containsGluten(ingredient) {
    const glutenKeywords = ['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye'];
    return glutenKeywords.some(gluten => ingredient.includes(gluten));
  }

  /**
   * Check if an ingredient contains nuts
   * @param {string} ingredient - The ingredient to check
   * @returns {boolean} True if ingredient contains nuts
   */
  containsNuts(ingredient) {
    const nutKeywords = ['almond', 'peanut', 'walnut', 'cashew', 'pecan', 'hazelnut', 'nut'];
    return nutKeywords.some(nut => ingredient.includes(nut));
  }

  /**
   * Filter foods based on dietary restrictions
   * @param {string[]} foods - Array of food ingredients
   * @returns {string[]} Array of compliant foods
   */
  filterCompliantFoods(foods) {
    return foods.filter(food => this.isIngredientCompliant(food));
  }

  /**
   * Generate meal with dietary restrictions considered
   * @param {string[]} foods - Available food ingredients
   * @param {number} dayIndex - Index of the day in the week (0-6)
   * @returns {Object} Generated meal object with ingredients and details
   */
  generateMealWithDietaryRestrictions(foods, dayIndex) {
    const compliantFoods = this.filterCompliantFoods(foods);
    
    if (compliantFoods.length === 0) {
      return this.getFallbackMealForRestrictions();
    }

    // Use compliant foods to generate a meal
    const mealVariants = this.generateMealVariants(compliantFoods, dayIndex);
    return mealVariants[Math.floor(Math.random() * mealVariants.length)];
  }

  /**
   * Generate meal variants to ensure variety throughout the week
   * @param {string[]} foods - Available food ingredients
   * @param {number} dayIndex - Index of the day in the week (0-6)
   * @returns {Object[]} Array of meal variant objects
   */
  generateMealVariants(foods, dayIndex) {
    const categorized = categorizeFoods(foods);
    const variants = [];

    // Generate different meal types for variety
    const mealTypes = ['protein-focused', 'carb-focused', 'vegetable-focused', 'balanced'];
    const currentType = mealTypes[dayIndex % mealTypes.length];

    switch (currentType) {
      case 'protein-focused':
        variants.push(...this.generateProteinFocusedMeals(categorized));
        break;
      case 'carb-focused':
        variants.push(...this.generateCarbFocusedMeals(categorized));
        break;
      case 'vegetable-focused':
        variants.push(...this.generateVegetableFocusedMeals(categorized));
        break;
      case 'balanced':
        variants.push(...this.generateBalancedMeals(categorized));
        break;
    }

    return variants.length > 0 ? variants : ['Simple meal with available ingredients'];
  }

  generateProteinFocusedMeals(categorized) {
    const meals = [];
    const proteins = categorized.proteins || [];
    const vegetables = categorized.vegetables || [];
    
    if (proteins.length > 0) {
      proteins.forEach(protein => {
        if (vegetables.length > 0) {
          meals.push(`Grilled ${protein} with ${vegetables[0]}`);
          meals.push(`${protein} and ${vegetables[0]} stir fry`);
        } else {
          meals.push(`Seasoned ${protein}`);
        }
      });
    }
    
    return meals;
  }

  generateCarbFocusedMeals(categorized) {
    const meals = [];
    const carbs = categorized.carbohydrates || [];
    const vegetables = categorized.vegetables || [];
    
    if (carbs.length > 0) {
      carbs.forEach(carb => {
        if (vegetables.length > 0) {
          meals.push(`${carb} with ${vegetables[0]}`);
          meals.push(`${vegetables[0]} and ${carb} bowl`);
        } else {
          meals.push(`Seasoned ${carb}`);
        }
      });
    }
    
    return meals;
  }

  generateVegetableFocusedMeals(categorized) {
    const meals = [];
    const vegetables = categorized.vegetables || [];
    const proteins = categorized.proteins || [];
    
    if (vegetables.length > 1) {
      meals.push(`Mixed vegetable stir fry with ${vegetables[0]} and ${vegetables[1]}`);
      meals.push(`${vegetables[0]} and ${vegetables[1]} salad`);
    } else if (vegetables.length > 0) {
      if (proteins.length > 0) {
        meals.push(`${vegetables[0]} and ${proteins[0]} bowl`);
      }
      meals.push(`Roasted ${vegetables[0]}`);
    }
    
    return meals;
  }

  generateBalancedMeals(categorized) {
    const meals = [];
    const proteins = categorized.proteins || [];
    const carbs = categorized.carbohydrates || [];
    const vegetables = categorized.vegetables || [];
    
    if (proteins.length > 0 && carbs.length > 0 && vegetables.length > 0) {
      meals.push(`${proteins[0]} with ${carbs[0]} and ${vegetables[0]}`);
      meals.push(`Balanced bowl with ${proteins[0]}, ${carbs[0]}, and ${vegetables[0]}`);
    } else if (proteins.length > 0 && vegetables.length > 0) {
      meals.push(`${proteins[0]} and ${vegetables[0]} combo`);
    } else if (carbs.length > 0 && vegetables.length > 0) {
      meals.push(`${carbs[0]} and ${vegetables[0]} dish`);
    }
    
    return meals;
  }

  // Get fallback meal that complies with dietary restrictions
  getFallbackMealForRestrictions() {
    // Ensure dietaryRestrictions is an array
    const restrictions = Array.isArray(this.dietaryRestrictions) ? this.dietaryRestrictions : [];
    
    if (restrictions.includes('vegan')) {
      return 'Vegetable stir fry with rice';
    } else if (restrictions.includes('vegetarian')) {
      return 'Cheese and vegetable pasta';
    } else if (restrictions.includes('gluten-free')) {
      return 'Grilled chicken with vegetables';
    } else {
      return 'Simple protein and vegetable meal';
    }
  }

  // Calculate estimated nutrition for a meal
  estimateMealNutrition(mealName) {
    // Basic nutrition estimation based on meal components
    const nutrition = { calories: 400, protein: 25, carbs: 45, fat: 15, fiber: 5 };
    
    // Adjust based on meal type
    if (mealName.toLowerCase().includes('salad')) {
      nutrition.calories = 300;
      nutrition.carbs = 20;
      nutrition.fiber = 8;
    } else if (mealName.toLowerCase().includes('stir fry')) {
      nutrition.calories = 450;
      nutrition.protein = 30;
    } else if (mealName.toLowerCase().includes('pasta')) {
      nutrition.carbs = 60;
      nutrition.calories = 500;
    }
    
    return nutrition;
  }

  // Add meal nutrition to weekly total
  addToWeeklyNutrition(mealNutrition) {
    this.weeklyNutrition.calories += mealNutrition.calories;
    this.weeklyNutrition.protein += mealNutrition.protein;
    this.weeklyNutrition.carbs += mealNutrition.carbs;
    this.weeklyNutrition.fat += mealNutrition.fat;
    this.weeklyNutrition.fiber += mealNutrition.fiber;
  }

  // Get weekly nutrition summary
  getWeeklyNutritionSummary() {
    return {
      ...this.weeklyNutrition,
      dailyAverage: {
        calories: Math.round(this.weeklyNutrition.calories / 7),
        protein: Math.round(this.weeklyNutrition.protein / 7),
        carbs: Math.round(this.weeklyNutrition.carbs / 7),
        fat: Math.round(this.weeklyNutrition.fat / 7),
        fiber: Math.round(this.weeklyNutrition.fiber / 7)
      }
    };
  }

  // Reset weekly nutrition tracking
  resetWeeklyNutrition() {
    this.weeklyNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  // Save user preferences based on meal generation patterns
  savePreferences() {
    try {
      const preferences = {
        dietaryRestrictions: this.dietaryRestrictions,
        mealPreferences: this.mealPreferences,
        lastUpdated: Date.now()
      };
      localStorage.setItem('enhancedMealPreferences', JSON.stringify(preferences));
      console.log('Enhanced meal preferences saved');
    } catch (error) {
      console.error('Error saving enhanced preferences:', error);
    }
  }

  // Load user preferences
  loadPreferences() {
    try {
      const saved = localStorage.getItem('enhancedMealPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.setDietaryRestrictions(preferences.dietaryRestrictions);
        this.setMealPreferences(preferences.mealPreferences);
        console.log('Enhanced meal preferences loaded');
      }
    } catch (error) {
      console.error('Error loading enhanced preferences:', error);
    }
  }
}

// Enhanced meal generation function
export async function generatePlan(foods, callback, options = {}) {
  console.log('Enhanced meal generation started with foods:', foods);
  console.log('Options:', options);
  
  try {
    // Ensure foods is an array
    const foodsArray = Array.isArray(foods) ? foods : [];
    const user = options.user;
    const userID = user?.uid || 'anonymous';
    const pinnedMeals = options.pinnedMeals || [];
    const dislikedMeals = options.dislikedMeals || [];
    
    // Initialize enhanced planner with foods
    const enhancedPlanner = new EnhancedMealPlanner(foodsArray);
    enhancedPlanner.loadPreferences();
    
    // Set dietary restrictions from options or user preferences
    let dietaryRestrictions = options.dietaryRestrictions || 
                              JSON.parse(localStorage.getItem('dietaryRestrictions') || '[]');
    
    // Convert dietary preferences object to array if needed
    if (dietaryRestrictions && typeof dietaryRestrictions === 'object' && !Array.isArray(dietaryRestrictions)) {
      console.log('Converting dietary restrictions object to array:', dietaryRestrictions);
      dietaryRestrictions = Object.entries(dietaryRestrictions)
        .filter(([key, value]) => value === true)
        .map(([key, value]) => key);
      console.log('Converted dietary restrictions:', dietaryRestrictions);
    }
    
    enhancedPlanner.setDietaryRestrictions(dietaryRestrictions);
    
    // Reset nutrition tracking for new week
    enhancedPlanner.resetWeeklyNutrition();
    
    const days = options.days || 7;
    const plan = [];
    
    console.log('Generating enhanced meal plan for', days, 'days');
    
    // Generate meals for each day
    for (let i = 0; i < days; i++) {
      let meal = null;
      
      // Get preferred meals (liked meals that haven't been used recently)
      const preferredMeals = getPreferredMeals(userID);
      
      // First try to use a preferred meal (40% chance if available)
      if (preferredMeals.length > 0 && Math.random() < 0.4) {
        const randomPreferred = preferredMeals[Math.floor(Math.random() * preferredMeals.length)];
        if (!shouldExcludeMeal(randomPreferred, userID)) {
          meal = randomPreferred;
          addMealToRecentUsage(generateMealId(meal), userID);
        }
      }
      
      // If no preferred meal was selected, try template-based generation
      if (!meal) {
        // Try to generate from templates (70% chance to use templates)
        if (Math.random() < 0.7) {
          const templates = Object.keys(popularMealTemplates);
          const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
          const categorizedFoods = categorizeFoods(foodsArray);
          const candidateMeal = generateMealFromSource(popularMealTemplates[randomTemplate], categorizedFoods.popular);
          
          if (candidateMeal && !shouldExcludeMeal(candidateMeal, userID)) {
            meal = candidateMeal;
            addMealToRecentUsage(generateMealId(meal), userID);
          }
        }
      }
      
      // If still no meal, try intelligent generation with dietary restrictions
      if (!meal) {
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!meal && attempts < maxAttempts) {
          const candidateMeal = enhancedPlanner.generateMealWithDietaryRestrictions(foodsArray, i);
          
          // Check if this meal should be excluded (disliked or recently used)
          if (candidateMeal && !shouldExcludeMeal(candidateMeal, userID)) {
            meal = candidateMeal;
            addMealToRecentUsage(generateMealId(meal), userID);
          }
          
          attempts++;
        }
      }
      
      // Fallback if we couldn't generate a meal
      if (!meal) {
        meal = enhancedPlanner.getFallbackMealForRestrictions();
        addMealToRecentUsage(generateMealId(meal), userID);
      }
      
      // Add nutrition tracking
      const mealNutrition = enhancedPlanner.estimateMealNutrition(meal);
      enhancedPlanner.addToWeeklyNutrition(mealNutrition);
      
      // Push meal in the format expected by renderPlan
      plan.push({
        meals: [meal]
      });
    }

    // Generate nutrition summary
    const nutritionSummary = enhancedPlanner.getWeeklyNutritionSummary();
    console.log('Weekly Nutrition Summary:', nutritionSummary);
    
    // Add nutrition summary to the UI
    displayNutritionSummary(nutritionSummary);
    
    // Save enhanced preferences
    enhancedPlanner.savePreferences();

    console.log('Generated meal plan structure:', plan);
    
    // Call the callback with the generated plan
    if (typeof callback === 'function') {
      callback(plan);
    }
    
    return plan;
    
  } catch (error) {
    console.error('Error generating enhanced meal plan:', error);
    
    // Fallback to simple generation
    const fallbackPlan = generateSimpleFallbackPlan(options.days || 7);
    if (typeof callback === 'function') {
      callback(fallbackPlan);
    }
    return fallbackPlan;
  }
}

// Simple fallback plan generator
function generateSimpleFallbackPlan(days) {
  const simpleMeals = [
    "Grilled Chicken with Rice",
    "Pasta with Vegetables", 
    "Fish Tacos",
    "Vegetable Stir Fry",
    "Beef Stew",
    "Chicken Salad",
    "Rice Bowl"
  ];
  
  const plan = [];
  for (let i = 0; i < days; i++) {
    plan.push({
      meals: [simpleMeals[i % simpleMeals.length]]
    });
  }
  return plan;
}

// Helper function to generate a unique meal ID based on meal name
function generateMealId(mealName) {
  // Create a simple hash from the meal name for consistent IDs
  let hash = 0;
  for (let i = 0; i < mealName.length; i++) {
    const char = mealName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Helper function to check if a meal was recently used
function wasMealRecentlyUsed(mealId, userId) {
  try {
    const recentMeals = JSON.parse(localStorage.getItem(`recentMeals_${userId}`) || '[]');
    return recentMeals.includes(mealId);
  } catch (error) {
    console.error('Error checking recent meals:', error);
    return false;
  }
}

// Helper function to add meal to recent usage
function addMealToRecentUsage(mealId, userId) {
  try {
    let recentMeals = JSON.parse(localStorage.getItem(`recentMeals_${userId}`) || '[]');
    
    // Add new meal to the beginning
    recentMeals.unshift(mealId);
    
    // Keep only last 10 meals to prevent too much repetition
    recentMeals = recentMeals.slice(0, 10);
    
    localStorage.setItem(`recentMeals_${userId}`, JSON.stringify(recentMeals));
  } catch (error) {
    console.error('Error adding meal to recent usage:', error);
  }
}

// Helper function to get preferred meals for a user
function getPreferredMeals(userId) {
  try {
    const pinnedMeals = JSON.parse(localStorage.getItem(`pinnedMeals_${userId}`) || '[]');
    return pinnedMeals;
  } catch (error) {
    console.error('Error getting preferred meals:', error);
    return [];
  }
}

// Helper function to check if a meal should be excluded
function shouldExcludeMeal(meal, userId) {
  const mealId = generateMealId(meal);
  
  // Check if meal is disliked
  try {
    const dislikedMeals = JSON.parse(localStorage.getItem(`dislikedMeals_${userId}`) || '[]');
    if (dislikedMeals.includes(mealId)) {
      return true;
    }
  } catch (error) {
    console.error('Error checking disliked meals:', error);
  }
  
  // Check if meal was used recently
  return wasMealRecentlyUsed(mealId, userId);
}

// Function to display nutrition summary in UI
function displayNutritionSummary(nutritionSummary) {
  try {
    const summaryElement = document.getElementById('nutritionSummary');
    if (summaryElement) {
      summaryElement.innerHTML = `
        <h3>Weekly Nutrition Summary</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="label">Calories:</span>
            <span class="value">${nutritionSummary.calories} (${nutritionSummary.dailyAverage.calories}/day)</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Protein:</span>
            <span class="value">${nutritionSummary.protein}g (${nutritionSummary.dailyAverage.protein}g/day)</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Carbs:</span>
            <span class="value">${nutritionSummary.carbs}g (${nutritionSummary.dailyAverage.carbs}g/day)</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Fat:</span>
            <span class="value">${nutritionSummary.fat}g (${nutritionSummary.dailyAverage.fat}g/day)</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Fiber:</span>
            <span class="value">${nutritionSummary.fiber}g (${nutritionSummary.dailyAverage.fiber}g/day)</span>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error displaying nutrition summary:', error);
  }
}

// Generate a single meal for a specific day (enhanced version)
export async function generateSingleMeal(dayIndex, currentUser, foodsArr, dislikedMeals, saveWeeklyPlanCallback) {
  try {
    console.log(`Generating single meal for day ${dayIndex}`);
    
    // Use the enhanced meal planner
    const planner = new EnhancedMealPlanner(foodsArr);
    
    // Get user preferences if available
    const userPreferences = window.userPreferences || {};
    const dietaryRestrictions = userPreferences.dietary || {};
    
    // Convert disliked meals to avoid list
    const avoidMeals = Array.isArray(dislikedMeals) ? dislikedMeals : [];
    
    // Generate meal options
    const mealOptions = await planner.generateMealVariants(1, dietaryRestrictions, avoidMeals);
    
    if (mealOptions && mealOptions.length > 0) {
      const newMeal = mealOptions[0];
      
      // Update the meal in the UI
      const mealElement = document.getElementById('mealText' + dayIndex);
      if (mealElement) {
        mealElement.textContent = newMeal.name || newMeal;
      }
      
      // Update the current plan and save it
      const currentPlan = getCurrentWeeklyPlan();
      const dayKey = `day${dayIndex}`;
      currentPlan[dayKey] = newMeal;
      
      // Save the updated plan
      if (saveWeeklyPlanCallback && typeof saveWeeklyPlanCallback === 'function') {
        await saveWeeklyPlanCallback(foodsArr, currentPlan);
      }
      
      console.log(`Successfully generated meal for day ${dayIndex}:`, newMeal);
      return newMeal;
    } else {
      console.warn(`No meal options generated for day ${dayIndex}`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating single meal for day ${dayIndex}:`, error);
    
    // Fallback to simple meal generation
    try {
      const fallbackMeal = generateFallbackMeal(foodsArr, dislikedMeals);
      
      // Update UI with fallback meal
      const mealElement = document.getElementById('mealText' + dayIndex);
      if (mealElement) {
        mealElement.textContent = fallbackMeal;
      }
      
      return fallbackMeal;
    } catch (fallbackError) {
      console.error('Fallback meal generation also failed:', fallbackError);
      return null;
    }
  }
}

// Get current weekly plan from UI or global state
function getCurrentWeeklyPlan() {
  // Try to get from global state first
  if (window.weeklyPlan && typeof window.weeklyPlan === 'object') {
    return { ...window.weeklyPlan };
  }
  
  // Fallback: extract from UI elements
  const plan = {};
  for (let i = 0; i < 7; i++) {
    const mealElement = document.getElementById('mealText' + i);
    if (mealElement && mealElement.textContent) {
      plan[`day${i}`] = mealElement.textContent;
    }
  }
  
  return plan;
}

// Generate fallback meal when enhanced generation fails
function generateFallbackMeal(foodsArr = [], dislikedMeals = []) {
  const fallbackMeals = [
    "Chicken and Rice",
    "Pasta with Marinara Sauce",
    "Grilled Salmon with Vegetables",
    "Beef Stir Fry",
    "Vegetable Curry with Rice",
    "Turkey Sandwich with Side Salad",
    "Baked Potato with Toppings",
    "Egg Fried Rice",
    "Chicken Caesar Salad",
    "Tomato Soup with Grilled Cheese"
  ];
  
  // Filter out disliked meals
  const availableMeals = fallbackMeals.filter(meal => 
    !dislikedMeals.some(disliked => 
      meal.toLowerCase().includes(disliked.toLowerCase())
    )
  );
  
  // If we have user foods, try to create a meal with them
  if (foodsArr && foodsArr.length > 0) {
    const randomFood = foodsArr[Math.floor(Math.random() * foodsArr.length)];
    const preparations = ["Grilled", "Baked", "Sautéed", "Roasted", "Steamed"];
    const sides = ["with Rice", "with Pasta", "with Vegetables", "with Salad", "with Bread"];
    
    const preparation = preparations[Math.floor(Math.random() * preparations.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    
    return `${preparation} ${randomFood} ${side}`;
  }
  
  // Return random fallback meal
  return availableMeals.length > 0 
    ? availableMeals[Math.floor(Math.random() * availableMeals.length)]
    : "Simple Pasta with Olive Oil";
}

// Export the enhanced planner class and functions for external use
export { EnhancedMealPlanner };
