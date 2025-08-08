/**
 * AI-powered meal planning engine with Firebase ML integration
 * Provides intelligent meal recommendations, preference learning, and adaptive planning
 * @fileoverview Advanced AI engine for personalized meal planning
 * @module AIEngine
 */

// AI-powered meal planning engine with Firebase ML integration
import { categorizeFoods } from './foodData.js';
import { popularMealTemplates } from './mealTemplates.js';
import { firebaseAI } from './aiService.js';
import { PythonMLService } from './pythonMLService.js';
import { MealLearningSystem } from './mealLearningSystem.js';
import { MealRatingUI } from './mealRatingUI.js';

/**
 * MealPlanningAI Class - Core AI engine for intelligent meal planning
 * Handles preference learning, meal recommendations, and adaptive planning
 * @class MealPlanningAI
 */
export class MealPlanningAI {
  /**
   * Initialize the AI engine with default preferences and services
   * @constructor
   */
  constructor() {
    console.log('AIEngine: Constructor called');
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
    this.aiService = firebaseAI;
    this.pythonMLService = new PythonMLService();
    this.isAIEnabled = false; // Start with AI disabled to avoid loading issues
    this.isMLEnhanced = false; // Track if Python ML is available
    this.learningHistory = [];
    
    // Initialize enhanced learning system
    this.learningSystem = new MealLearningSystem();
    this.ratingUI = null; // Will be initialized after DOM is ready
    
    console.log('AIEngine: Starting AI initialization...');
    // Try to initialize AI in the background
    this.initializeAI();
    console.log('AIEngine: Constructor completed');
  }

  /**
   * Initialize AI services in the background with graceful fallback
   * Sets up Firebase AI and Python ML services with error handling
   * @async
   * @returns {Promise<void>}
   */
  async initializeAI() {
    console.log('AIEngine: initializeAI called');
    try {
      console.log('AIEngine: Calling aiService.initialize()...');
      await this.aiService.initialize();
      console.log('AIEngine: aiService.initialize() completed');
      
      if (this.aiService.isInitialized && !this.aiService.fallbackMode) {
        this.isAIEnabled = true;
        console.log('AIEngine: AI features enabled');
      } else {
        console.log('AIEngine: AI features running in fallback mode');
        this.isAIEnabled = false;
      }
    } catch (error) {
      console.warn('AIEngine: AI initialization failed, using local methods only:', error);
      this.isAIEnabled = false;
    }
    
    // Initialize Python ML service
    try {
      console.log('AIEngine: Initializing Python ML service...');
      await this.pythonMLService.initializationPromise;
      if (this.pythonMLService.isAvailable) {
        this.isMLEnhanced = true;
        console.log('AIEngine: Python ML service enabled - enhanced meal planning available');
      } else {
        console.log('AIEngine: Python ML service not available - using JavaScript ML fallback');
        this.isMLEnhanced = false;
      }
    } catch (error) {
      console.warn('AIEngine: Python ML service initialization failed:', error);
      this.isMLEnhanced = false;
    }
    
    // Initialize enhanced learning system
    try {
      console.log('AIEngine: Initializing enhanced learning system...');
      await this.learningSystem.initializeSystem();
      console.log('AIEngine: Enhanced learning system initialized successfully');
    } catch (error) {
      console.warn('AIEngine: Enhanced learning system initialization failed:', error);
    }
    
    // Initialize rating UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeRatingUI();
      });
    } else {
      this.initializeRatingUI();
    }
    
    console.log('AIEngine: initializeAI completed. isAIEnabled:', this.isAIEnabled, 'isMLEnhanced:', this.isMLEnhanced);
  }

  /**
   * Initialize the rating UI system
   */
  initializeRatingUI() {
    try {
      this.ratingUI = new MealRatingUI(this.learningSystem);
      console.log('AIEngine: Rating UI initialized successfully');
      
      // Make rating UI globally available for meal interactions
      window.mealRatingUI = this.ratingUI;
      window.mealLearningSystem = this.learningSystem;
    } catch (error) {
      console.warn('AIEngine: Rating UI initialization failed:', error);
    }
  }

  // Process and learn from user's text preferences
  async updatePreferencesFromText(preferencesText) {
    console.log('AIEngine: Processing text preferences:', preferencesText);
    
    if (!preferencesText || preferencesText.trim().length === 0) {
      console.log('AIEngine: No preferences text provided');
      return;
    }
    
    try {
      // Parse preferences text for common patterns
      const parsedPreferences = this.parsePreferencesText(preferencesText);
      
      // Update internal preferences
      this.updatePreferencesFromParsed(parsedPreferences);
      
      // If ML service is available, send to it for advanced processing
      if (this.isMLEnhanced) {
        try {
          const result = await this.pythonMLService.analyzeUserPreferences([{
            name: 'User Preferences Text',
            rating: 5,
            cuisine: parsedPreferences.preferredCuisines[0] || 'mixed',
            ingredients: parsedPreferences.preferredIngredients,
            preferences: preferencesText,
            timestamp: Date.now()
          }]);
          
          if (result.success) {
            console.log('AIEngine: ML service processed preferences successfully');
          }
        } catch (error) {
          console.warn('AIEngine: ML service preference processing failed:', error);
        }
      }
      
      console.log('AIEngine: Preferences updated successfully');
    } catch (error) {
      console.error('AIEngine: Error processing preferences text:', error);
    }
  }

  // Parse user preferences text into structured data
  parsePreferencesText(text) {
    const textLower = text.toLowerCase();
    const preferences = {
      preferredCuisines: [],
      preferredIngredients: [],
      avoidedIngredients: [],
      dietaryRestrictions: [],
      cookingTimePreference: null,
      difficultyPreference: null,
      spiceLevel: null
    };
    
    // Cuisine detection
    const cuisines = {
      'italian': ['italian', 'pasta', 'pizza', 'mediterranean'],
      'mexican': ['mexican', 'tacos', 'burrito', 'spicy'],
      'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean', 'sushi', 'stir fry'],
      'indian': ['indian', 'curry', 'spicy'],
      'american': ['american', 'bbq', 'burgers', 'grilled'],
      'mediterranean': ['mediterranean', 'greek', 'olive', 'fresh']
    };
    
    Object.entries(cuisines).forEach(([cuisine, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        preferences.preferredCuisines.push(cuisine);
      }
    });
    
    // Dietary restrictions detection
    const dietaryTerms = {
      'vegetarian': ['vegetarian', 'veggie', 'no meat'],
      'vegan': ['vegan', 'plant-based'],
      'gluten-free': ['gluten-free', 'no gluten', 'celiac'],
      'dairy-free': ['dairy-free', 'no dairy', 'lactose'],
      'low-carb': ['low-carb', 'keto', 'no carbs'],
      'keto': ['keto', 'ketogenic']
    };
    
    Object.entries(dietaryTerms).forEach(([restriction, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        preferences.dietaryRestrictions.push(restriction);
      }
    });
    
    // Ingredient preferences
    const commonIngredients = [
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey',
      'vegetables', 'broccoli', 'spinach', 'carrots', 'peppers',
      'rice', 'pasta', 'quinoa', 'potatoes', 'bread',
      'cheese', 'garlic', 'onions', 'tomatoes', 'mushrooms'
    ];
    
    commonIngredients.forEach(ingredient => {
      if (textLower.includes(ingredient)) {
        preferences.preferredIngredients.push(ingredient);
      }
    });
    
    // Avoided ingredients
    const avoidancePatterns = [
      /don't like ([^,\.!]+)/g,
      /hate ([^,\.!]+)/g,
      /no ([^,\.!]+)/g,
      /avoid ([^,\.!]+)/g,
      /allergic to ([^,\.!]+)/g
    ];
    
    avoidancePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(textLower)) !== null) {
        const avoided = match[1].trim();
        if (avoided.length > 2 && avoided.length < 20) {
          preferences.avoidedIngredients.push(avoided);
        }
      }
    });
    
    // Time preferences
    if (textLower.includes('quick') || textLower.includes('fast') || textLower.includes('under 30')) {
      preferences.cookingTimePreference = 'quick';
    } else if (textLower.includes('slow') || textLower.includes('long') || textLower.includes('elaborate')) {
      preferences.cookingTimePreference = 'slow';
    }
    
    // Difficulty preferences
    if (textLower.includes('easy') || textLower.includes('simple') || textLower.includes('beginner')) {
      preferences.difficultyPreference = 'easy';
    } else if (textLower.includes('complex') || textLower.includes('challenging') || textLower.includes('advanced')) {
      preferences.difficultyPreference = 'hard';
    }
    
    // Spice level
    if (textLower.includes('spicy') || textLower.includes('hot') || textLower.includes('spice')) {
      preferences.spiceLevel = 'high';
    } else if (textLower.includes('mild') || textLower.includes('no spice')) {
      preferences.spiceLevel = 'low';
    }
    
    return preferences;
  }

  // Update internal preferences from parsed data
  updatePreferencesFromParsed(parsedPreferences) {
    // Update cuisine preferences
    parsedPreferences.preferredCuisines.forEach(cuisine => {
      this.preferences.cuisineScores[cuisine] = 
        (this.preferences.cuisineScores[cuisine] || 0) + 2;
    });
    
    // Update ingredient preferences
    parsedPreferences.preferredIngredients.forEach(ingredient => {
      this.preferences.ingredientScores[ingredient] = 
        (this.preferences.ingredientScores[ingredient] || 0) + 2;
    });
    
    // Update avoided ingredients (negative scores)
    parsedPreferences.avoidedIngredients.forEach(ingredient => {
      this.preferences.ingredientScores[ingredient] = 
        (this.preferences.ingredientScores[ingredient] || 0) - 3;
    });
    
    // Update dietary restrictions
    parsedPreferences.dietaryRestrictions.forEach(restriction => {
      if (restriction === 'vegetarian') {
        this.preferences.dietaryRestrictions.vegetarian = true;
      }
      if (restriction === 'low-carb' || restriction === 'keto') {
        this.preferences.dietaryRestrictions.easyMeals = false; // Prefer more complex low-carb meals
      }
    });
    
    // Store raw preferences for future reference
    this.preferences.rawTextPreferences = parsedPreferences;
  }

  // Learn from user interactions with enhanced ML system
  async learnFromLike(meal) {
    console.log('AIEngine: Learning from LIKE:', meal);
    
    // Use enhanced learning system
    try {
      const result = await this.learningSystem.rateMeal(meal, 4, {
        source: 'like_button',
        method: 'binary_feedback'
      });
      
      if (result.success) {
        console.log('AIEngine: Enhanced learning from like successful:', result.learningFeedback);
      }
    } catch (error) {
      console.warn('AIEngine: Enhanced learning failed, using fallback:', error);
    }
    
    // Fallback to original system
    this.updatePreferences(meal, 1);
    this.learningHistory.push({ action: 'like', meal, timestamp: Date.now() });
    
    if (this.isAIEnabled) {
      try {
        // Use Firebase AI to enhance learning
        await this.aiService.updatePreferencesWithML([
          { type: 'like', meal, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.warn('AI learning enhancement failed, using local learning:', error);
      }
    }
  }

  async learnFromDislike(meal) {
    console.log('AIEngine: Learning from DISLIKE:', meal);
    
    // Use enhanced learning system
    try {
      const result = await this.learningSystem.rateMeal(meal, 2, {
        source: 'dislike_button',
        method: 'binary_feedback'
      });
      
      if (result.success) {
        console.log('AIEngine: Enhanced learning from dislike successful:', result.learningFeedback);
      }
    } catch (error) {
      console.warn('AIEngine: Enhanced learning failed, using fallback:', error);
    }
    
    // Fallback to original system
    this.updatePreferences(meal, -1);
    this.learningHistory.push({ action: 'dislike', meal, timestamp: Date.now() });
    
    if (this.isAIEnabled) {
      try {
        await this.aiService.updatePreferencesWithML([
          { type: 'dislike', meal, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.warn('AI learning enhancement failed, using local learning:', error);
      }
    }
  }

  async learnFromPin(meal) {
    console.log('AIEngine: Learning from PIN (love):', meal);
    
    // Use enhanced learning system
    try {
      const result = await this.learningSystem.rateMeal(meal, 5, {
        source: 'pin_button',
        method: 'binary_feedback'
      });
      
      if (result.success) {
        console.log('AIEngine: Enhanced learning from pin successful:', result.learningFeedback);
      }
    } catch (error) {
      console.warn('AIEngine: Enhanced learning failed, using fallback:', error);
    }
    
    // Fallback to original system (Higher weight for pinned meals)
    this.updatePreferences(meal, 2); 
    this.learningHistory.push({ action: 'pin', meal, timestamp: Date.now() });
    
    if (this.isAIEnabled) {
      try {
        await this.aiService.updatePreferencesWithML([
          { type: 'pin', meal, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.warn('AI learning enhancement failed, using local learning:', error);
      }
    }
  }

  /**
   * Enhanced meal rating method with full 1-5 scale
   * @param {string} meal - Meal name
   * @param {number} rating - Rating from 1-5
   * @param {Object} context - Additional context
   */
  async rateMeal(meal, rating, context = {}) {
    console.log(`AIEngine: Rating meal "${meal}" with ${rating}/5 stars`);
    
    try {
      const result = await this.learningSystem.rateMeal(meal, rating, {
        ...context,
        source: 'manual_rating'
      });
      
      if (result.success) {
        console.log('AIEngine: Enhanced meal rating successful:', result);
        
        // Update legacy preferences for compatibility
        const normalizedScore = (rating - 3) * 0.67; // Convert to -2 to +2 scale
        this.updatePreferences(meal, normalizedScore);
        
        this.learningHistory.push({ 
          action: 'rate', 
          meal, 
          rating, 
          timestamp: Date.now(),
          result 
        });
        
        return result;
      }
    } catch (error) {
      console.error('AIEngine: Enhanced meal rating failed:', error);
    }
    
    // Fallback to simple preference update
    const normalizedScore = (rating - 3) * 0.67;
    this.updatePreferences(meal, normalizedScore);
    
    return { success: false, error: 'Rating saved locally only' };
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

  // Generate AI-powered meal suggestions with Firebase ML
  async generateSmartMeal(userFoods, categorizedFoods, dislikedMeals, attempts = 0) {
    if (attempts > 30) return null;

    // Try Firebase AI first for intelligent meal generation
    if (this.isAIEnabled && attempts === 0) {
      try {
        const aiMealPlan = await this.aiService.generateIntelligentMealPlan(
          userFoods,
          this.preferences,
          { 
            dislikedMeals,
            singleMeal: true,
            complexity: this.preferences.dietaryRestrictions.easyMeals ? 'simple' : 'varied'
          }
        );
        
        if (aiMealPlan && aiMealPlan.weeklyPlan) {
          const firstMeal = Object.values(aiMealPlan.weeklyPlan)[0];
          if (firstMeal && firstMeal.meal && !dislikedMeals.includes(firstMeal.meal)) {
            return firstMeal.meal;
          }
        }
      } catch (error) {
        console.warn('AI meal generation failed, falling back to local generation:', error);
      }
    }

    // Fallback to local generation
    const scoredTemplates = this.scoreTemplates(userFoods);
    const selectedTemplate = this.weightedRandomSelect(scoredTemplates);
    
    if (!selectedTemplate) return null;

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

  // Get AI insights for the user with ML enhancement
  async getInsights() {
    const insights = [];

    // Local insights
    const topCuisines = Object.entries(this.preferences.cuisineScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3);

    if (topCuisines.length > 0) {
      insights.push(`Your favorite cuisines: ${topCuisines.map(([cuisine]) => cuisine).join(', ')}`);
    }

    const topIngredients = Object.entries(this.preferences.ingredientScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);

    if (topIngredients.length > 0) {
      insights.push(`Your favorite ingredients: ${topIngredients.map(([ingredient]) => ingredient).join(', ')}`);
    }

    const topMethods = Object.entries(this.preferences.cookingMethodScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3);

    if (topMethods.length > 0) {
      insights.push(`Your preferred cooking methods: ${topMethods.map(([method]) => method).join(', ')}`);
    }

    // Enhanced AI insights
    if (this.isAIEnabled && this.learningHistory.length > 0) {
      try {
        const aiRecommendations = await this.aiService.getNutritionRecommendations(
          { 
            preferences: this.preferences,
            dietaryRestrictions: this.preferences.dietaryRestrictions
          },
          this.learningHistory.slice(-20) // Last 20 interactions
        );
        
        if (aiRecommendations && aiRecommendations.recommendations) {
          insights.push(...aiRecommendations.recommendations.map(rec => `AI Insight: ${rec}`));
        }
      } catch (error) {
        console.warn('AI insights failed, using local insights only:', error);
      }
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

  // New AI-powered methods

  // Generate complete weekly meal plan with AI
  async generateAIWeeklyPlan(userFoods, constraints = {}) {
    console.log('AIEngine: generateAIWeeklyPlan called with constraints:', constraints);
    
    // Process AI preferences if provided
    if (constraints.aiPreferences && constraints.aiPreferences.trim().length > 0) {
      console.log('AIEngine: Processing AI preferences from constraints');
      await this.updatePreferencesFromText(constraints.aiPreferences);
    }
    
    if (!this.isAIEnabled) {
      return this.generateLocalWeeklyPlan(userFoods, constraints);
    }

    try {
      const aiMealPlan = await this.aiService.generateIntelligentMealPlan(
        userFoods,
        this.preferences,
        constraints
      );
      
      return aiMealPlan;
    } catch (error) {
      console.warn('AI weekly plan generation failed, using local generation:', error);
      return this.generateLocalWeeklyPlan(userFoods, constraints);
    }
  }

  // Analyze and enhance existing recipes
  async enhanceRecipe(recipe) {
    if (!this.isAIEnabled) return null;

    try {
      const analysis = await this.aiService.analyzeRecipe(recipe);
      return analysis;
    } catch (error) {
      console.warn('Recipe analysis failed:', error);
      return null;
    }
  }

  // Smart ingredient substitution
  async getSmartSubstitutions(recipe, unavailableIngredients) {
    if (!this.isAIEnabled) return this.getBasicSubstitutions(unavailableIngredients);

    try {
      const substitutions = await this.aiService.suggestSubstitutions(
        recipe,
        unavailableIngredients,
        Object.keys(this.preferences.dietaryRestrictions).filter(
          key => this.preferences.dietaryRestrictions[key]
        )
      );
      
      return substitutions;
    } catch (error) {
      console.warn('Smart substitutions failed:', error);
      return this.getBasicSubstitutions(unavailableIngredients);
    }
  }

  // Predict optimal meals for future planning
  async predictOptimalMeals(timeframe = 7) {
    if (!this.isAIEnabled) return null;

    try {
      const userContext = {
        preferences: this.preferences,
        learningHistory: this.learningHistory,
        dietaryRestrictions: this.preferences.dietaryRestrictions
      };

      const predictions = await this.aiService.predictOptimalMeals(userContext, timeframe);
      return predictions;
    } catch (error) {
      console.warn('Meal prediction failed:', error);
      return null;
    }
  }

  // Get personalized nutrition recommendations
  async getNutritionGuidance() {
    if (!this.isAIEnabled) return this.getBasicNutritionTips();

    try {
      const recommendations = await this.aiService.getNutritionRecommendations(
        { 
          preferences: this.preferences,
          dietaryRestrictions: this.preferences.dietaryRestrictions
        },
        this.learningHistory
      );
      
      return recommendations;
    } catch (error) {
      console.warn('Nutrition guidance failed:', error);
      return this.getBasicNutritionTips();
    }
  }

  // Enhanced local meal planning with ML capabilities
  async generateLocalWeeklyPlan(userFoods, constraints) {
    console.log('AIEngine: generateLocalWeeklyPlan called with ML enhancement:', this.isMLEnhanced);
    
    // If ML service is available, use intelligent meal planning
    if (this.isMLEnhanced) {
      try {
        return await this.generateMLEnhancedPlan(userFoods, constraints);
      } catch (error) {
        console.warn('AIEngine: ML-enhanced planning failed, falling back to basic planning:', error);
      }
    }
    
    // Fallback to enhanced local planning
    return this.generateBasicLocalPlan(userFoods, constraints);
  }

  async generateMLEnhancedPlan(userFoods, constraints) {
    console.log('AIEngine: Using ML-enhanced meal planning');
    
    // Convert user foods to meal objects
    const availableMeals = this.convertFoodsToMeals(userFoods);
    
    // Get user's meal history for learning
    const mealHistory = this.getMealHistoryForML();
    
    // Extract dietary restrictions
    const dietaryRestrictions = this.extractDietaryRestrictions(constraints);
    
    // Call Python ML service for intelligent meal planning
    const mlResult = await this.pythonMLService.generateSmartMealPlan(
      availableMeals,
      mealHistory,
      7, // 7 days
      dietaryRestrictions
    );
    
    if (mlResult.success && mlResult.meal_plan) {
      console.log('AIEngine: ML service returned', mlResult.meal_plan.length, 'meals');
      
      // Convert ML results to our expected format
      const plan = this.convertMLResultToPlan(mlResult.meal_plan);
      
      // Get nutrition analysis
      const nutritionAnalysis = await this.pythonMLService.analyzeNutrition(mlResult.meal_plan);
      
      return {
        weeklyPlan: plan,
        shoppingList: this.generateShoppingList(userFoods, plan),
        nutritionSummary: this.generateEnhancedNutritionSummary(nutritionAnalysis),
        recommendations: this.generateMLRecommendations(mlResult, nutritionAnalysis),
        mlEnhanced: true,
        confidenceScore: mlResult.plan_info?.confidence_score || 0.85
      };
    } else {
      throw new Error('ML service did not return valid meal plan');
    }
  }

  generateBasicLocalPlan(userFoods, constraints) {
    console.log('AIEngine: Using basic local meal planning with enhanced algorithms');
    
    const { user, popular } = categorizeFoods(userFoods);
    const plan = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Enhanced template selection with variety algorithm
    const usedTemplates = new Set();
    
    days.forEach((day, index) => {
      // Use preference-based template selection even in local mode
      const availableTemplates = popularMealTemplates.filter(template => {
        // Check if we have ingredients for this template
        const hasRequiredIngredients = this.checkIngredientAvailability(template, user, popular);
        // Ensure variety by avoiding recently used templates
        const isNotRecentlyUsed = !usedTemplates.has(template.name) || usedTemplates.size >= popularMealTemplates.length;
        return hasRequiredIngredients && isNotRecentlyUsed;
      });
      
      const template = availableTemplates.length > 0 ? 
        this.selectPreferredTemplate(availableTemplates) :
        popularMealTemplates[index % popularMealTemplates.length];
        
      usedTemplates.add(template.name);
      
      const meal = this.generateMealWithPreferences(template, { user, popular }, userFoods);
      
      plan[day] = {
        meal: meal || `${template.cuisine} Style Meal`,
        nutrition: this.estimateEnhancedNutrition(meal, template),
        cookingTime: this.estimateCookingTime(template),
        difficulty: this.estimateDifficulty(template),
        ingredients: this.extractMealIngredients(meal, template, userFoods)
      };
    });
    
    return {
      weeklyPlan: plan,
      shoppingList: this.generateShoppingList(userFoods, plan),
      nutritionSummary: this.generateNutritionSummary(plan),
      recommendations: this.generateLocalRecommendations(userFoods, plan),
      mlEnhanced: false
    };
  }

  // Helper methods for ML-enhanced planning
  convertFoodsToMeals(userFoods) {
    const { user, popular } = categorizeFoods(userFoods);
    const meals = [];
    
    // Generate meal objects from available ingredients and templates
    popularMealTemplates.forEach(template => {
      if (this.checkIngredientAvailability(template, user, popular)) {
        const meal = {
          name: `${template.cuisine} Style ${template.protein || 'Meal'}`,
          cuisine: template.cuisine,
          difficulty: template.difficulty || 'medium',
          prepTime: template.cookingTime || 30,
          ingredients: this.getTemplateIngredients(template, user, popular),
          tags: this.getTemplateTags(template),
          nutrition: this.estimateTemplateNutrition(template)
        };
        meals.push(meal);
      }
    });
    
    return meals;
  }

  getMealHistoryForML() {
    // Get meal history from learning history and localStorage
    const history = this.learningHistory.map(entry => ({
      name: entry.meal,
      rating: entry.action === 'like' ? 4 : entry.action === 'pin' ? 5 : entry.action === 'dislike' ? 2 : 3,
      timestamp: entry.timestamp,
      cuisine: this.extractCuisineFromMeal(entry.meal),
      ingredients: this.extractIngredientsFromMeal(entry.meal)
    }));
    
    // Add some default preferences if history is empty
    if (history.length === 0) {
      return [
        { name: 'Grilled Chicken', rating: 4, cuisine: 'american', ingredients: ['chicken', 'vegetables'] },
        { name: 'Pasta Marinara', rating: 4, cuisine: 'italian', ingredients: ['pasta', 'tomato', 'basil'] },
        { name: 'Beef Stir Fry', rating: 3, cuisine: 'asian', ingredients: ['beef', 'vegetables', 'rice'] }
      ];
    }
    
    return history;
  }

  extractDietaryRestrictions(constraints) {
    const restrictions = [];
    
    if (this.preferences.dietaryRestrictions.vegetarian) {
      restrictions.push('vegetarian');
    }
    
    if (constraints?.vegetarian) restrictions.push('vegetarian');
    if (constraints?.vegan) restrictions.push('vegan');
    if (constraints?.glutenFree) restrictions.push('gluten-free');
    if (constraints?.dairyFree) restrictions.push('dairy-free');
    if (constraints?.lowCarb) restrictions.push('low-carb');
    if (constraints?.keto) restrictions.push('keto');
    
    return restrictions;
  }

  convertMLResultToPlan(mlMeals) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const plan = {};
    
    days.forEach((day, index) => {
      const meal = mlMeals[index] || mlMeals[index % mlMeals.length];
      plan[day] = {
        meal: meal.name,
        nutrition: this.formatMLNutrition(meal.nutrition),
        cookingTime: meal.prepTime || 30,
        difficulty: meal.difficulty || 'medium',
        ingredients: meal.ingredients || [],
        mlScore: meal.ml_score || 0,
        mlEnhanced: true
      };
    });
    
    return plan;
  }

  generateEnhancedNutritionSummary(nutritionAnalysis) {
    if (!nutritionAnalysis?.success) {
      return this.generateNutritionSummary({});
    }
    
    const analysis = nutritionAnalysis.nutrition_analysis;
    const summary = {
      weeklyTotals: analysis.current_totals,
      recommendations: analysis.recommendations,
      balanceScore: Math.round(analysis.balance_score * 100),
      gaps: Object.keys(analysis.gaps),
      excesses: Object.keys(analysis.excesses)
    };
    
    return summary;
  }

  generateMLRecommendations(mlResult, nutritionAnalysis) {
    const recommendations = [];
    
    if (mlResult.plan_info?.confidence_score) {
      const confidence = Math.round(mlResult.plan_info.confidence_score * 100);
      recommendations.push(`Plan confidence: ${confidence}% - Based on your preferences and ML analysis`);
    }
    
    if (nutritionAnalysis?.success) {
      const analysis = nutritionAnalysis.nutrition_analysis;
      if (analysis.balance_score > 0.8) {
        recommendations.push('Excellent nutritional balance across the week!');
      } else if (Object.keys(analysis.gaps).length > 0) {
        recommendations.push(`Consider adding foods rich in: ${Object.keys(analysis.gaps).join(', ')}`);
      }
    }
    
    recommendations.push('Meal plan optimized using machine learning algorithms');
    
    return recommendations;
  }

  getTemplateIngredients(template, userFoods, popularFoods) {
    const ingredients = [];
    const allFoods = [...(userFoods.meats || []), ...(userFoods.carbs || []), 
                     ...(userFoods.veggies || []), ...(popularFoods.meats || []),
                     ...(popularFoods.carbs || []), ...(popularFoods.veggies || [])];
    
    // Add primary protein
    if (template.needsMeat) {
      const meat = allFoods.find(f => 
        ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey'].some(meat => 
          f.toLowerCase().includes(meat)));
      if (meat) ingredients.push(meat);
    }
    
    // Add carbohydrate
    if (template.needsCarb) {
      const carb = allFoods.find(f => 
        ['rice', 'pasta', 'bread', 'potato', 'quinoa'].some(carb => 
          f.toLowerCase().includes(carb)));
      if (carb) ingredients.push(carb);
    }
    
    // Add vegetables
    const veggies = allFoods.filter(f => 
      (userFoods.veggies || []).includes(f) || (popularFoods.veggies || []).includes(f)
    ).slice(0, 3);
    ingredients.push(...veggies);
    
    return ingredients;
  }

  getTemplateTags(template) {
    const tags = [template.cuisine];
    
    if (template.difficulty) tags.push(template.difficulty);
    if (template.cookingTime <= 20) tags.push('quick');
    if (template.cookingTime >= 60) tags.push('slow-cook');
    if (!template.needsMeat) tags.push('vegetarian');
    
    return tags;
  }

  estimateTemplateNutrition(template) {
    // Basic nutrition estimation based on template characteristics
    return {
      protein: template.needsMeat ? 25 : 10,
      carbs: template.needsCarb ? 45 : 20,
      fiber: 8,
      healthy_fats: 12,
      vitamins: 15,
      minerals: 10
    };
  }

  extractCuisineFromMeal(meal) {
    const cuisines = ['italian', 'mexican', 'asian', 'american', 'indian', 'mediterranean'];
    const mealLower = meal.toLowerCase();
    
    for (const cuisine of cuisines) {
      if (mealLower.includes(cuisine)) return cuisine;
    }
    
    return 'american'; // default
  }

  extractIngredientsFromMeal(meal) {
    const commonIngredients = ['chicken', 'beef', 'pork', 'fish', 'pasta', 'rice', 'vegetables', 'cheese', 'tomato'];
    const mealLower = meal.toLowerCase();
    
    return commonIngredients.filter(ingredient => mealLower.includes(ingredient));
  }

  formatMLNutrition(nutrition) {
    if (!nutrition) return 'Balanced nutrition';
    
    const highlights = [];
    if (nutrition.protein > 20) highlights.push('High protein');
    if (nutrition.fiber > 10) highlights.push('High fiber');
    if (nutrition.healthy_fats > 15) highlights.push('Healthy fats');
    
    return highlights.length > 0 ? highlights.join(', ') : 'Balanced nutrition';
  }

  estimateEnhancedNutrition(meal, template) {
    if (!meal) return 'Balanced nutrition';
    
    const mealLower = meal.toLowerCase();
    let nutrition = [];
    
    // Enhanced nutrition analysis
    if (mealLower.includes('chicken') || mealLower.includes('fish') || mealLower.includes('turkey')) {
      nutrition.push('Lean protein');
    } else if (mealLower.includes('beef') || mealLower.includes('pork')) {
      nutrition.push('Rich protein');
    }
    
    if (mealLower.includes('vegetable') || mealLower.includes('salad') || mealLower.includes('greens')) {
      nutrition.push('Vitamin-rich');
    }
    
    if (mealLower.includes('whole') || mealLower.includes('brown') || mealLower.includes('quinoa')) {
      nutrition.push('High fiber');
    }
    
    if (mealLower.includes('avocado') || mealLower.includes('nuts') || mealLower.includes('olive')) {
      nutrition.push('Healthy fats');
    }
    
    // Add template-based nutrition
    if (template?.cuisine === 'mediterranean') {
      nutrition.push('Heart-healthy');
    }
    
    return nutrition.length > 0 ? nutrition.join(', ') : 'Balanced nutrition';
  }

  extractMealIngredients(meal, template, userFoods) {
    return this.getTemplateIngredients(template, categorizeFoods(userFoods).user, categorizeFoods(userFoods).popular);
  }

  // Select template based on local preferences
  selectPreferredTemplate(templates) {
    const scoredTemplates = templates.map(template => {
      let score = 1;
      
      // Apply preference scoring if available
      if (this.preferences.cuisineScores[template.cuisine]) {
        score += this.preferences.cuisineScores[template.cuisine] * 0.3;
      }
      
      return { template, score };
    });
    
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0].template;
  }

  // Check if ingredients are available for a template
  checkIngredientAvailability(template, userFoods, popularFoods) {
    const allFoods = [...(userFoods.meats || []), ...(userFoods.carbs || []), 
                     ...(userFoods.veggies || []), ...(popularFoods.meats || []),
                     ...(popularFoods.carbs || []), ...(popularFoods.veggies || [])];
    
    let available = true;
    
    if (template.needsMeat && !allFoods.some(f => 
      ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey'].some(meat => 
        f.toLowerCase().includes(meat)))) {
      available = false;
    }
    
    if (template.needsCarb && !allFoods.some(f => 
      ['rice', 'pasta', 'bread', 'potato', 'quinoa'].some(carb => 
        f.toLowerCase().includes(carb)))) {
      available = false;
    }
    
    return available;
  }

  // Estimate nutrition for basic mode
  estimateNutrition(meal) {
    if (!meal) return 'Balanced nutrition';
    
    const mealLower = meal.toLowerCase();
    let nutrition = [];
    
    if (mealLower.includes('chicken') || mealLower.includes('fish')) {
      nutrition.push('High protein');
    }
    if (mealLower.includes('vegetable') || mealLower.includes('salad')) {
      nutrition.push('Rich in vitamins');
    }
    if (mealLower.includes('whole') || mealLower.includes('brown')) {
      nutrition.push('High fiber');
    }
    
    return nutrition.length > 0 ? nutrition.join(', ') : 'Balanced nutrition';
  }

  // Estimate cooking time
  estimateCookingTime(template) {
    const complexWords = ['slow', 'roast', 'braised', 'marinated'];
    const quickWords = ['stir', 'pan', 'grilled', 'sauteed'];
    
    const templateLower = template.template.toLowerCase();
    
    if (complexWords.some(word => templateLower.includes(word))) {
      return '45-60 mins';
    } else if (quickWords.some(word => templateLower.includes(word))) {
      return '15-25 mins';
    }
    
    return '25-35 mins';
  }

  // Estimate difficulty
  estimateDifficulty(template) {
    const complexWords = ['braised', 'sous vide', 'marinated', 'stuffed'];
    const easyWords = ['grilled', 'baked', 'pan', 'simple'];
    
    const templateLower = template.template.toLowerCase();
    
    if (complexWords.some(word => templateLower.includes(word))) {
      return 'Advanced';
    } else if (easyWords.some(word => templateLower.includes(word))) {
      return 'Easy';
    }
    
    return 'Medium';
  }

  // Generate nutrition summary
  generateNutritionSummary(plan) {
    const days = Object.keys(plan).length;
    return {
      calories: Math.round(1800 + (days * 50)), // Rough estimate
      protein: Math.round(120 + (days * 10)),
      carbs: Math.round(200 + (days * 15)),
      fat: Math.round(60 + (days * 8))
    };
  }

  // Generate local recommendations
  generateLocalRecommendations(userFoods, plan) {
    const recommendations = [];
    
    const mealNames = Object.values(plan).map(day => day.meal);
    const uniqueCuisines = [...new Set(mealNames.map(meal => {
      if (meal.toLowerCase().includes('italian')) return 'italian';
      if (meal.toLowerCase().includes('asian')) return 'asian';
      if (meal.toLowerCase().includes('mexican')) return 'mexican';
      return 'varied';
    }))];
    
    if (uniqueCuisines.length < 3) {
      recommendations.push('Try adding more cuisine variety to your meal plan');
    }
    
    if (userFoods.length < 5) {
      recommendations.push('Consider stocking more fresh ingredients for better meal options');
    }
    
    const proteinCount = mealNames.filter(meal => 
      ['chicken', 'fish', 'beef', 'pork'].some(protein => 
        meal.toLowerCase().includes(protein))).length;
    
    if (proteinCount < 4) {
      recommendations.push('Consider adding more protein variety to your weekly meals');
    }
    
    recommendations.push('Prep ingredients in advance for quicker cooking');
    recommendations.push('Try cooking larger portions and saving leftovers');
    
    return recommendations;
  }

  getBasicSubstitutions(unavailableIngredients) {
    const basicSubs = {
      'chicken': 'turkey',
      'beef': 'pork',
      'milk': 'almond milk',
      'butter': 'olive oil',
      'eggs': 'applesauce',
      'onion': 'shallots',
      'garlic': 'garlic powder'
    };
    
    const substitutions = {};
    unavailableIngredients.forEach(ingredient => {
      if (basicSubs[ingredient.toLowerCase()]) {
        substitutions[ingredient] = basicSubs[ingredient.toLowerCase()];
      }
    });
    
    return {
      substitutions,
      recipeVariations: [],
      notes: ["Basic substitutions provided"]
    };
  }

  getBasicNutritionTips() {
    return {
      recommendations: [
        "Eat a variety of colorful vegetables",
        "Include lean protein in every meal",
        "Choose whole grains over refined carbs",
        "Stay hydrated throughout the day",
        "Practice portion control"
      ],
      nutritionalGaps: [],
      dailyTargets: { calories: 2000, protein: 150, carbs: 250, fat: 65 }
    };
  }

  generateShoppingList(userFoods, plan) {
    const allIngredients = [];
    const mealIngredients = Object.values(plan).map(day => day.meal);
    
    // Extract ingredients from meal names (basic extraction)
    mealIngredients.forEach(meal => {
      const words = meal.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3 && !userFoods.includes(word)) {
          allIngredients.push(word);
        }
      });
    });
    
    return [...new Set(allIngredients)]; // Remove duplicates
  }

  // Enable/disable AI features
  setAIEnabled(enabled) {
    this.isAIEnabled = enabled;
    console.log(`AI features ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get AI service status
  async getAIServiceStatus() {
    try {
      // Don't try to initialize if not already done
      return {
        available: this.isAIEnabled,
        initialized: this.aiService.isInitialized,
        enabled: this.isAIEnabled,
        fallbackMode: this.aiService.fallbackMode || false,
        statusMessage: this.getStatusMessage()
      };
    } catch (error) {
      return {
        available: false,
        initialized: false,
        enabled: false,
        fallbackMode: true,
        statusMessage: 'AI service error: ' + error.message,
        error: error.message
      };
    }
  }

  // Get human-readable status message
  getStatusMessage() {
    if (this.isAIEnabled) {
      return 'AI features are fully operational';
    } else if (this.aiService.fallbackMode) {
      return 'Running in basic mode - AI features are not configured';
    } else {
      return 'AI service is initializing...';
    }
  }
}