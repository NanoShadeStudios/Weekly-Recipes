// Enhanced Meal Generator with improved dietary restriction support and variety
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates, calculateUserFoodMealCount, generateMealFromSource } from './mealTemplates.js';
import { saveWeeklyPlan } from './dataManager.js';
import { getCurrentPlan } from './mealActions.js';
import { getFirebaseInstance } from './firebase.js';

// Enhanced Meal Planner Class
class EnhancedMealPlanner {
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

  // Set dietary restrictions for meal planning
  setDietaryRestrictions(restrictions) {
    this.dietaryRestrictions = restrictions || [];
    console.log('Enhanced Planner: Set dietary restrictions:', this.dietaryRestrictions);
  }

  // Set user meal preferences
  setMealPreferences(preferences) {
    this.mealPreferences = preferences || {};
    console.log('Enhanced Planner: Set meal preferences:', this.mealPreferences);
  }

  // Check if ingredients comply with dietary restrictions
  isIngredientCompliant(ingredient) {
    const ingredientLower = ingredient.toLowerCase();
    
    for (const restriction of this.dietaryRestrictions) {
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

  isDairyProduct(ingredient) {
    const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy'];
    return dairyKeywords.some(dairy => ingredient.includes(dairy));
  }

  containsGluten(ingredient) {
    const glutenKeywords = ['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye'];
    return glutenKeywords.some(gluten => ingredient.includes(gluten));
  }

  containsNuts(ingredient) {
    const nutKeywords = ['almond', 'peanut', 'walnut', 'cashew', 'pecan', 'hazelnut', 'nut'];
    return nutKeywords.some(nut => ingredient.includes(nut));
  }

  // Filter foods based on dietary restrictions
  filterCompliantFoods(foods) {
    return foods.filter(food => this.isIngredientCompliant(food));
  }

  // Generate meal with dietary restrictions considered
  generateMealWithDietaryRestrictions(foods, dayIndex) {
    const compliantFoods = this.filterCompliantFoods(foods);
    
    if (compliantFoods.length === 0) {
      return this.getFallbackMealForRestrictions();
    }

    // Use compliant foods to generate a meal
    const mealVariants = this.generateMealVariants(compliantFoods, dayIndex);
    return mealVariants[Math.floor(Math.random() * mealVariants.length)];
  }

  // Generate meal variants to ensure variety
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
    if (this.dietaryRestrictions.includes('vegan')) {
      return 'Vegetable stir fry with rice';
    } else if (this.dietaryRestrictions.includes('vegetarian')) {
      return 'Cheese and vegetable pasta';
    } else if (this.dietaryRestrictions.includes('gluten-free')) {
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
  
  try {
    // Initialize enhanced planner
    const enhancedPlanner = new EnhancedMealPlanner();
    enhancedPlanner.loadPreferences();
    
    // Set dietary restrictions from options or user preferences
    const dietaryRestrictions = options.dietaryRestrictions || 
                               JSON.parse(localStorage.getItem('dietaryRestrictions') || '[]');
    enhancedPlanner.setDietaryRestrictions(dietaryRestrictions);
    
    // Reset nutrition tracking for new week
    enhancedPlanner.resetWeeklyNutrition();
    
    const days = options.days || 7;
    const plan = [];
    
    // Get current user for meal tracking
    const { auth } = await getFirebaseInstance();
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : 'anonymous';
    
    console.log('Generating enhanced meal plan for', days, 'days');
    
    // Generate meals for each day
    for (let i = 0; i < days; i++) {
      let meal = null;
      
      // Get preferred meals (liked meals that haven't been used recently)
      const preferredMeals = getPreferredMeals(userId);
      
      // First try to use a preferred meal (40% chance if available)
      if (preferredMeals.length > 0 && Math.random() < 0.4) {
        const randomPreferred = preferredMeals[Math.floor(Math.random() * preferredMeals.length)];
        if (!shouldExcludeMeal(randomPreferred, userId)) {
          meal = randomPreferred;
          addMealToRecentUsage(generateMealId(meal), userId);
        }
      }
      
      // If no preferred meal was selected, try template-based generation
      if (!meal) {
        // Try to generate from templates (70% chance to use templates)
        if (Math.random() < 0.7) {
          const templates = Object.keys(popularMealTemplates);
          const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
          const categorizedFoods = categorizeFoods(foods);
          const candidateMeal = generateMealFromSource(popularMealTemplates[randomTemplate], categorizedFoods.popular);
          
          if (candidateMeal && !shouldExcludeMeal(candidateMeal, userId)) {
            meal = candidateMeal;
            addMealToRecentUsage(generateMealId(meal), userId);
          }
        }
      }
      
      // If still no meal, try intelligent generation with dietary restrictions
      if (!meal) {
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!meal && attempts < maxAttempts) {
          const candidateMeal = enhancedPlanner.generateMealWithDietaryRestrictions(foods, i);
          
          // Check if this meal should be excluded (disliked or recently used)
          if (candidateMeal && !shouldExcludeMeal(candidateMeal, userId)) {
            meal = candidateMeal;
            addMealToRecentUsage(generateMealId(meal), userId);
          }
          
          attempts++;
        }
      }
      
      // Fallback if we couldn't generate a meal
      if (!meal) {
        meal = enhancedPlanner.getFallbackMealForRestrictions();
        addMealToRecentUsage(generateMealId(meal), userId);
      }
      
      // Add nutrition tracking
      const mealNutrition = enhancedPlanner.estimateMealNutrition(meal);
      enhancedPlanner.addToWeeklyNutrition(mealNutrition);
      
      plan.push(meal);
    }

    // Generate nutrition summary
    const nutritionSummary = enhancedPlanner.getWeeklyNutritionSummary();
    console.log('Weekly Nutrition Summary:', nutritionSummary);
    
    // Add nutrition summary to the UI
    displayNutritionSummary(nutritionSummary);
    
    // Save enhanced preferences
    enhancedPlanner.savePreferences();

    // Call the callback with the generated plan
    callback(plan);
    
    return plan;
    
  } catch (error) {
    console.error('Error generating enhanced meal plan:', error);
    
    // Fallback to simple generation
    const fallbackPlan = generateSimpleFallbackPlan(foods.length || 7);
    callback(fallbackPlan);
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
    plan.push(simpleMeals[i % simpleMeals.length]);
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

// Export the enhanced planner class for external use
export { EnhancedMealPlanner };
