// AI-powered meal planning engine
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates } from './mealTemplates.js';

export class MealPlanningAI {
  constructor() {
    this.preferences = {
      cuisineScores: {},
      ingredientScores: {},
      templateScores: {},
      cookingMethodScores: {},
      combinationScores: {},
      dietaryRestrictions: {
        vegetarian: localStorage.getItem('vegetarianPref') === 'true',
        easyMeals: localStorage.getItem('easyMealsPref') === 'true'
      }
    };
  }

  // Learn from user interactions
  learnFromLike(meal) {
    this.updatePreferences(meal, 1);
  }

  learnFromDislike(meal) {
    this.updatePreferences(meal, -1);
  }

  learnFromPin(meal) {
    this.updatePreferences(meal, 2); // Higher weight for pinned meals
  }

  updatePreferences(meal, score) {
    // Extract features from the meal
    const features = this.extractMealFeatures(meal);
    
    // Update cuisine preferences
    if (features.cuisine) {
      this.preferences.cuisineScores[features.cuisine] = 
        (this.preferences.cuisineScores[features.cuisine] || 0) + score;
    }

    // Update ingredient preferences
    features.ingredients.forEach(ingredient => {
      this.preferences.ingredientScores[ingredient] = 
        (this.preferences.ingredientScores[ingredient] || 0) + score;
    });

    // Update cooking method preferences
    if (features.cookingMethod) {
      this.preferences.cookingMethodScores[features.cookingMethod] = 
        (this.preferences.cookingMethodScores[features.cookingMethod] || 0) + score;
    }

    // Update template preferences
    if (features.template) {
      this.preferences.templateScores[features.template] = 
        (this.preferences.templateScores[features.template] || 0) + score;
    }

    // Update ingredient combinations
    if (features.ingredients.length > 1) {
      const combination = features.ingredients.sort().join(' + ');
      this.preferences.combinationScores[combination] = 
        (this.preferences.combinationScores[combination] || 0) + score;
    }
  }

  extractMealFeatures(meal) {
    const features = {
      ingredients: [],
      cuisine: null,
      cookingMethod: null,
      template: null
    };

    // Extract cooking methods
    const cookingMethods = ['grilled', 'baked', 'roasted', 'pan-seared', 'stir fry', 'slow cooker', 'blackened', 'honey glazed'];
    for (const method of cookingMethods) {
      if (meal.toLowerCase().includes(method.toLowerCase())) {
        features.cookingMethod = method;
        break;
      }
    }

    // Find matching template
    const matchingTemplate = popularMealTemplates.find(template => {
      const templateWords = template.template.toLowerCase().replace(/\{.*?\}/g, '').split(' ').filter(w => w.length > 2);
      return templateWords.some(word => meal.toLowerCase().includes(word));
    });
    
    if (matchingTemplate) {
      features.cuisine = matchingTemplate.cuisine;
      features.template = matchingTemplate.template;
    }

    // Extract ingredients (simple approach - look for common food words)
    const commonFoods = [
      'chicken', 'beef', 'pork', 'salmon', 'shrimp', 'turkey', 'lamb', 'tuna', 'cod',
      'rice', 'pasta', 'quinoa', 'potato', 'bread', 'noodles',
      'broccoli', 'spinach', 'carrots', 'peppers', 'onions', 'tomatoes', 'mushrooms',
      'asparagus', 'beans', 'peas', 'corn', 'zucchini', 'cauliflower'
    ];

    commonFoods.forEach(food => {
      if (meal.toLowerCase().includes(food)) {
        features.ingredients.push(food);
      }
    });

    return features;
  }

  // Generate AI-powered meal suggestions
  generateSmartMeal(userFoods, categorizedFoods, dislikedMeals, attempts = 0) {
    if (attempts > 30) return null;

    // Score all templates based on preferences
    const scoredTemplates = this.scoreTemplates(userFoods);
    
    // Select template with weighted random selection (higher scores more likely)
    const selectedTemplate = this.weightedRandomSelect(scoredTemplates);
    
    if (!selectedTemplate) return null;

    // Generate meal using preferred ingredients
    const meal = this.generateMealWithPreferences(selectedTemplate, categorizedFoods, userFoods);
    
    if (!meal || dislikedMeals.includes(meal)) {
      return this.generateSmartMeal(userFoods, categorizedFoods, dislikedMeals, attempts + 1);
    }

    return meal;
  }

  scoreTemplates(userFoods) {
    return popularMealTemplates.map(template => {
      let score = 1; // Base score

      // Cuisine preference bonus
      const cuisineScore = this.preferences.cuisineScores[template.cuisine] || 0;
      score += cuisineScore * 0.3;

      // Template preference bonus
      const templateScore = this.preferences.templateScores[template.template] || 0;
      score += templateScore * 0.2;

      // Cooking method bonus
      const cookingMethods = ['grilled', 'baked', 'roasted', 'pan-seared', 'stir fry', 'slow cooker', 'blackened', 'honey glazed'];
      for (const method of cookingMethods) {
        if (template.template.toLowerCase().includes(method.toLowerCase())) {
          const methodScore = this.preferences.cookingMethodScores[method] || 0;
          score += methodScore * 0.2;
          break;
        }
      }

      // User food compatibility bonus
      const userFoodBonus = this.calculateUserFoodCompatibility(template, userFoods);
      score += userFoodBonus;

      return { template, score: Math.max(0.1, score) }; // Minimum score to ensure variety
    });
  }

  calculateUserFoodCompatibility(template, userFoods) {
    let bonus = 0;
    const { user } = categorizeFoods(userFoods);
    
    // Bonus for templates that can use user's foods
    if (template.needsMeat && user.meats.length > 0) bonus += 0.5;
    if (template.needsCarb && user.carbs.length > 0) bonus += 0.5;
    if (template.needsVeggie && user.veggies.length > 0) bonus += 0.5;

    // Extra bonus for preferred ingredients
    userFoods.forEach(food => {
      const ingredientScore = this.preferences.ingredientScores[food.toLowerCase()] || 0;
      if (ingredientScore > 0) bonus += ingredientScore * 0.1;
    });

    return bonus;
  }

  weightedRandomSelect(scoredTemplates) {
    const totalScore = scoredTemplates.reduce((sum, item) => sum + item.score, 0);
    let random = Math.random() * totalScore;
    
    for (const item of scoredTemplates) {
      random -= item.score;
      if (random <= 0) {
        return item.template;
      }
    }
    
    return scoredTemplates[0]?.template; // Fallback
  }

  generateMealWithPreferences(template, categorizedFoods, userFoods) {
    let meal = template.template;
    const { user, popular } = categorizedFoods;

    // Smart ingredient selection based on preferences
    if (template.needsMeat) {
      const meat = this.selectPreferredIngredient(
        [...user.meats, ...popular.meats], 
        'meat'
      );
      if (meat) meal = meal.replace('{meat}', meat);
    }

    if (template.needsCarb) {
      const carb = this.selectPreferredIngredient(
        [...user.carbs, ...popular.carbs], 
        'carb'
      );
      if (carb) meal = meal.replace('{carb}', carb);
    }

    if (template.needsVeggie > 0) {
      const veggies = [...user.veggies, ...popular.veggies];
      
      if (template.needsVeggie === 1) {
        const veggie = this.selectPreferredIngredient(veggies, 'veggie');
        if (veggie) meal = meal.replace('{veggie}', veggie);
      } else if (template.needsVeggie === 2) {
        const veggie1 = this.selectPreferredIngredient(veggies, 'veggie');
        const veggie2 = this.selectPreferredIngredient(
          veggies.filter(v => v !== veggie1), 
          'veggie'
        );
        if (veggie1) meal = meal.replace('{veggie}', veggie1);
        if (veggie2) meal = meal.replace('{veggie2}', veggie2);
      }
    }

    // Clean up any remaining placeholders
    meal = meal.replace(/\{meat\}/g, '').replace(/\{carb\}/g, '').replace(/\{veggie\}/g, '').replace(/\{veggie2\}/g, '');
    meal = meal.replace(/\s+/g, ' ').trim();

    return meal;
  }

  selectPreferredIngredient(ingredients, type) {
    if (!ingredients.length) return null;

    // Score ingredients based on preferences
    const scoredIngredients = ingredients.map(ingredient => {
      let score = 1; // Base score
      
      // Individual ingredient preference
      const ingredientScore = this.preferences.ingredientScores[ingredient.toLowerCase()] || 0;
      score += ingredientScore * 0.5;

      // Randomness to ensure variety
      score += Math.random() * 0.3;

      return { ingredient, score };
    });

    // Sort by score and add some randomness
    scoredIngredients.sort((a, b) => b.score - a.score);
    
    // Select from top 3 to maintain variety while preferring liked ingredients
    const topChoices = scoredIngredients.slice(0, Math.min(3, scoredIngredients.length));
    const selected = topChoices[Math.floor(Math.random() * topChoices.length)];
    
    return selected.ingredient;
  }

  // Get AI insights for the user
  getInsights() {
    const insights = [];

    // Favorite cuisines
    const topCuisines = Object.entries(this.preferences.cuisineScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3);

    if (topCuisines.length > 0) {
      insights.push(`Your favorite cuisines: ${topCuisines.map(([cuisine]) => cuisine).join(', ')}`);
    }

    // Favorite ingredients
    const topIngredients = Object.entries(this.preferences.ingredientScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);

    if (topIngredients.length > 0) {
      insights.push(`Your favorite ingredients: ${topIngredients.map(([ingredient]) => ingredient).join(', ')}`);
    }

    // Cooking methods
    const topMethods = Object.entries(this.preferences.cookingMethodScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3);

    if (topMethods.length > 0) {
      insights.push(`Your preferred cooking methods: ${topMethods.map(([method]) => method).join(', ')}`);
    }

    return insights;
  }

  // Export preferences for storage
  exportPreferences() {
    return JSON.stringify(this.preferences);
  }

  // Import preferences from storage
  importPreferences(preferencesJson) {
    try {
      this.preferences = JSON.parse(preferencesJson);
    } catch (error) {
      console.error('Failed to import AI preferences:', error);
    }
  }

  savePreferences() {
    localStorage.setItem('vegetarianPref', this.preferences.dietaryRestrictions.vegetarian);
    localStorage.setItem('easyMealsPref', this.preferences.dietaryRestrictions.easyMeals);
  }

  generateMealPlan() {
    const filteredMeals = this.filterByDietaryRestrictions(allMeals);
    const scoredMeals = filteredMeals.map(meal => ({
      ...meal,
      score: this.calculatePreferenceScore(meal)
    }));
    // ... existing scoring logic ...
  }

  filterByDietaryRestrictions(meals) {
    return meals.filter(meal => {
      const isVegetarian = !this.preferences.dietaryRestrictions.vegetarian || 
        meal.tags.includes('vegetarian');
      const isEasy = !this.preferences.dietaryRestrictions.easyMeals ||
        meal.difficulty <= 2;
      return isVegetarian && isEasy;
    });
  }

  validatePreferences() {
    const validateScore = (score) => typeof score === 'number' && !isNaN(score);
    return Object.values(this.preferences).every(category =>
      Object.values(category).every(validateScore)
    );
  }
}