// Firebase AI and ML service integration
import { getFirebaseInstance } from './firebase.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

export class FirebaseAIService {
  constructor() {
    console.log('AIService: Constructor called');
    this.isInitialized = false;
    this.isInitializing = false; // Prevent multiple initialization attempts
    this.fallbackMode = false;
    this.generativeModel = null;
    this.functions = null;
    this.mlCache = new Map(); // Cache for ML predictions
    this.maxCacheSize = 50; // Maximum number of cached items
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.userContext = {
      preferences: {},
      mealHistory: [],
      dietaryRestrictions: [],
      healthGoals: []
    };
    
    // Set up periodic cache cleanup
    this.setupCacheCleanup();
    
    console.log('AIService: Constructor completed');
  }

  async initialize() {
    console.log('AIService: Initialize called');
    
    // Prevent multiple simultaneous initialization attempts
    if (this.isInitializing) {
      console.log('AIService: Already initializing, waiting...');
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }
    
    if (this.isInitialized) {
      console.log('AIService: Already initialized');
      return;
    }
    
    this.isInitializing = true;
    
    try {
      console.log('AIService: Getting Firebase instance...');
      const firebaseInstance = await getFirebaseInstance();
      console.log('AIService: Firebase instance obtained:', firebaseInstance);
      
      // Check if AI services are available
      if (firebaseInstance.generativeModel && firebaseInstance.functions) {
        console.log('AIService: AI services available, setting up...');
        this.generativeModel = firebaseInstance.generativeModel;
        this.functions = firebaseInstance.functions;
        this.isInitialized = true;
        console.log('AIService: Firebase AI Service initialized successfully');
      } else {
        console.log('AIService: Vertex AI not available, using fallback mode');
        this.isInitialized = false;
        this.fallbackMode = true;
      }
    } catch (error) {
      console.warn('AIService: Firebase AI Service initialization failed, using fallback mode:', error);
      // Don't throw error, just set to fallback mode
      this.isInitialized = false;
      this.fallbackMode = true;
    } finally {
      this.isInitializing = false;
      console.log('AIService: Initialize completed. isInitialized:', this.isInitialized, 'fallbackMode:', this.fallbackMode);
    }
  }

  // Advanced meal planning using Vertex AI
  async generateIntelligentMealPlan(userFoods, preferences, constraints = {}) {
    // Always use fallback mode for now to avoid infinite loading
    if (this.fallbackMode || !this.isInitialized) {
      console.log('Using fallback meal planning');
      return this.getFallbackMealPlan(userFoods, preferences);
    }

    try {
      const prompt = this.buildMealPlanPrompt(userFoods, preferences, constraints);
      
      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      const mealPlan = this.parseMealPlanResponse(response.text());
      
      // Cache the result for offline use
      this.setCachedPrediction(`mealplan_${Date.now()}`, mealPlan);
      
      return mealPlan;
    } catch (error) {
      console.error('Error generating intelligent meal plan:', error);
      return this.getFallbackMealPlan(userFoods, preferences);
    }
  }

  buildMealPlanPrompt(userFoods, preferences, constraints) {
    const context = {
      availableIngredients: userFoods,
      dietaryPreferences: preferences.dietaryRestrictions || [],
      cuisinePreferences: preferences.cuisineScores || {},
      cookingMethods: preferences.cookingMethodScores || {},
      healthGoals: constraints.healthGoals || [],
      servingSize: constraints.servingSize || 4,
      budgetRange: constraints.budget || 'moderate',
      timeConstraints: constraints.timeConstraints || 'moderate'
    };

    return `
    As a professional chef and nutritionist, create a weekly meal plan based on the following:

    Available Ingredients: ${JSON.stringify(context.availableIngredients)}
    Dietary Restrictions: ${JSON.stringify(context.dietaryPreferences)}
    Cuisine Preferences: ${JSON.stringify(context.cuisinePreferences)}
    Preferred Cooking Methods: ${JSON.stringify(context.cookingMethods)}
    Health Goals: ${JSON.stringify(context.healthGoals)}
    Serving Size: ${context.servingSize} people
    Budget: ${context.budgetRange}
    Time Constraints: ${context.timeConstraints}

    Please provide:
    1. 7 unique, balanced meals for the week
    2. Each meal should include: main dish, protein, carbs, vegetables
    3. Nutritional benefits for each meal
    4. Estimated cooking time and difficulty
    5. Shopping list for missing ingredients
    6. Recipe adaptations for dietary restrictions

    Format the response as a structured JSON object with the following schema:
    {
      "weeklyPlan": {
        "monday": { "meal": "", "nutrition": "", "cookingTime": "", "difficulty": "" },
        "tuesday": { "meal": "", "nutrition": "", "cookingTime": "", "difficulty": "" },
        ...
      },
      "shoppingList": ["ingredient1", "ingredient2", ...],
      "nutritionSummary": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "recommendations": ["tip1", "tip2", ...]
    }
    `;
  }

  parseMealPlanResponse(responseText) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON isn't properly formatted
      return this.parseUnstructuredResponse(responseText);
    } catch (error) {
      console.error('Error parsing meal plan response:', error);
      return this.getDefaultMealPlan();
    }
  }

  parseUnstructuredResponse(text) {
    // Parse unstructured text response into meal plan format
    const meals = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentMeal = {};
    for (const line of lines) {
      if (line.includes('Day') || line.includes('Monday') || line.includes('Tuesday') || 
          line.includes('Wednesday') || line.includes('Thursday') || line.includes('Friday') ||
          line.includes('Saturday') || line.includes('Sunday')) {
        if (currentMeal.meal) meals.push(currentMeal);
        currentMeal = { meal: line.trim() };
      } else if (line.includes('Nutrition:') || line.includes('nutrition')) {
        currentMeal.nutrition = line.replace(/.*nutrition:?/i, '').trim();
      } else if (line.includes('Time:') || line.includes('cooking')) {
        currentMeal.cookingTime = line.replace(/.*time:?/i, '').trim();
      }
    }
    
    if (currentMeal.meal) meals.push(currentMeal);
    
    return {
      weeklyPlan: this.convertMealsToWeekly(meals),
      shoppingList: this.extractIngredients(text),
      nutritionSummary: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
      recommendations: this.extractRecommendations(text)
    };
  }

  convertMealsToWeekly(meals) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyPlan = {};
    
    meals.forEach((meal, index) => {
      if (index < days.length) {
        weeklyPlan[days[index]] = meal;
      }
    });
    
    return weeklyPlan;
  }

  extractIngredients(text) {
    const ingredientSection = text.match(/shopping list:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    if (ingredientSection) {
      return ingredientSection[1]
        .split(/[,\n-]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    return [];
  }

  extractRecommendations(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('tip') || line.includes('recommendation') || line.includes('note')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Prep ingredients in advance for quicker cooking',
      'Double recipes and freeze portions for later',
      'Use seasonal ingredients for better flavor and cost'
    ];
  }

  // Intelligent recipe analysis and enhancement
  async analyzeRecipe(recipe) {
    // Use fallback mode for now
    if (this.fallbackMode || !this.isInitialized) {
      return this.getDefaultRecipeAnalysis();
    }

    try {
      const prompt = `
      Analyze this recipe and provide nutritional information, cooking tips, and potential improvements:
      
      Recipe: ${recipe}
      
      Please provide:
      1. Estimated nutritional information (calories, protein, carbs, fat)
      2. Cooking difficulty level (1-5)
      3. Preparation and cooking time
      4. Dietary tags (vegetarian, gluten-free, etc.)
      5. Cost estimate (low, medium, high)
      6. Flavor profile
      7. Suggested improvements or variations
      8. Health benefits of key ingredients
      
      Format as JSON.
      `;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      
      return this.parseRecipeAnalysis(response.text());
    } catch (error) {
      console.error('Error analyzing recipe:', error);
      return this.getDefaultRecipeAnalysis();
    }
  }

  parseRecipeAnalysis(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getDefaultRecipeAnalysis();
    } catch (error) {
      console.error('Error parsing recipe analysis:', error);
      return this.getDefaultRecipeAnalysis();
    }
  }

  // Personalized nutrition recommendations
  async getNutritionRecommendations(userProfile, mealHistory) {
    if (!this.isInitialized) await this.initialize();

    try {
      const prompt = `
      Based on this user profile and meal history, provide personalized nutrition recommendations:
      
      User Profile: ${JSON.stringify(userProfile)}
      Recent Meals: ${JSON.stringify(mealHistory)}
      
      Analyze:
      1. Nutritional gaps in current diet
      2. Recommended daily intake adjustments
      3. Suggested food additions or substitutions
      4. Health goal alignment
      5. Meal timing optimization
      6. Supplement recommendations (if needed)
      
      Provide actionable, science-based recommendations in JSON format.
      `;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      
      return this.parseNutritionRecommendations(response.text());
    } catch (error) {
      console.error('Error getting nutrition recommendations:', error);
      return this.getDefaultNutritionRecommendations();
    }
  }

  // Smart ingredient substitution
  async suggestSubstitutions(recipe, unavailableIngredients, dietaryRestrictions = []) {
    if (!this.isInitialized) await this.initialize();

    try {
      const prompt = `
      Suggest ingredient substitutions for this recipe:
      
      Recipe: ${recipe}
      Unavailable Ingredients: ${JSON.stringify(unavailableIngredients)}
      Dietary Restrictions: ${JSON.stringify(dietaryRestrictions)}
      
      For each unavailable ingredient, provide:
      1. Best substitute option
      2. Flavor impact (minimal, moderate, significant)
      3. Texture changes
      4. Quantity adjustments needed
      5. Alternative cooking instructions if needed
      
      Also suggest complete recipe variations if major substitutions are needed.
      Format as JSON.
      `;

      const result = await this.generativeModel.generateContent(prompt);
      const response = await result.response;
      
      return this.parseSubstitutions(response.text());
    } catch (error) {
      console.error('Error suggesting substitutions:', error);
      return this.getDefaultSubstitutions();
    }
  }

  // Cloud Functions integration for complex ML tasks
  async processComplexMLTask(taskType, data) {
    try {
      const mlFunction = httpsCallable(this.functions, 'processMLTask');
      const result = await mlFunction({
        task: taskType,
        data: data,
        timestamp: Date.now()
      });
      
      return result.data;
    } catch (error) {
      console.error(`Error processing ML task ${taskType}:`, error);
      return null;
    }
  }

  // Meal preference learning with ML
  async updatePreferencesWithML(userInteractions) {
    try {
      const mlUpdateFunction = httpsCallable(this.functions, 'updateUserPreferencesML');
      const result = await mlUpdateFunction({
        interactions: userInteractions,
        userId: this.getCurrentUserId(),
        timestamp: Date.now()
      });
      
      return result.data.updatedPreferences;
    } catch (error) {
      console.error('Error updating preferences with ML:', error);
      return null;
    }
  }

  // Predictive meal planning
  async predictOptimalMeals(userContext, timeframe = 7) {
    try {
      const predictionFunction = httpsCallable(this.functions, 'predictOptimalMeals');
      const result = await predictionFunction({
        userContext,
        timeframe,
        timestamp: Date.now()
      });
      
      return result.data.predictions;
    } catch (error) {
      console.error('Error predicting optimal meals:', error);
      return this.getFallbackPredictions(userContext, timeframe);
    }
  }

  // Fallback methods for offline functionality
  getFallbackMealPlan(userFoods, preferences) {
    console.log('AIService: Generating fallback meal plan with user foods and preferences');
    
    // Create a more intelligent fallback based on available foods and preferences
    const availableFoods = userFoods || [];
    const dietaryRestrictions = preferences?.dietaryRestrictions || [];
    const cuisinePrefs = preferences?.cuisineScores || {};
    
    // Base meal templates that can be customized
    const mealTemplates = [
      { name: "Protein Bowl", protein: true, difficulty: "Easy", time: "20 mins" },
      { name: "Pasta Dish", carbs: true, difficulty: "Easy", time: "25 mins" },
      { name: "Stir Fry", vegetables: true, difficulty: "Easy", time: "20 mins" },
      { name: "Soup & Bread", comfort: true, difficulty: "Medium", time: "35 mins" },
      { name: "Salad & Protein", healthy: true, difficulty: "Easy", time: "15 mins" },
      { name: "Rice Bowl", filling: true, difficulty: "Easy", time: "30 mins" },
      { name: "Sandwich & Sides", quick: true, difficulty: "Easy", time: "10 mins" }
    ];
    
    // Filter meals based on dietary restrictions
    let filteredMeals = mealTemplates;
    if (dietaryRestrictions.includes('vegetarian')) {
      // Modify protein sources for vegetarian meals
    }
    if (dietaryRestrictions.includes('vegan')) {
      // Modify for vegan requirements
    }
    
    // Generate weekly plan
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyPlan = {};
    
    weekDays.forEach((day, index) => {
      const template = filteredMeals[index % filteredMeals.length];
      weeklyPlan[day] = {
        meal: this.customizeMealTemplate(template, availableFoods, dietaryRestrictions),
        nutrition: this.estimateNutrition(template),
        cookingTime: template.time,
        difficulty: template.difficulty,
        ingredients: this.suggestIngredients(template, availableFoods)
      };
    });
    
    // Generate shopping list from available foods
    const shoppingList = this.generateShoppingList(weeklyPlan, availableFoods);
    
    return {
      weeklyPlan,
      shoppingList,
      nutritionSummary: this.calculateWeeklyNutrition(weeklyPlan),
      recommendations: this.generateRecommendations(availableFoods, preferences),
      source: 'fallback-enhanced'
    };
  }
  
  customizeMealTemplate(template, availableFoods, restrictions) {
    // Match available foods to template requirements
    const proteins = availableFoods.filter(food => 
      ['chicken', 'beef', 'fish', 'tofu', 'beans', 'eggs'].some(p => 
        food.toLowerCase().includes(p)
      )
    );
    
    const vegetables = availableFoods.filter(food => 
      ['carrot', 'broccoli', 'spinach', 'tomato', 'onion', 'pepper'].some(v => 
        food.toLowerCase().includes(v)
      )
    );
    
    let mealName = template.name;
    
    if (template.protein && proteins.length > 0) {
      mealName = `${proteins[0]} ${template.name}`;
    }
    
    if (template.vegetables && vegetables.length > 0) {
      mealName = `${template.name} with ${vegetables[0]}`;
    }
    
    return mealName;
  }
  
  estimateNutrition(template) {
    const baseNutrition = {
      protein: template.protein ? "High protein" : "Moderate protein",
      carbs: template.carbs ? "High carbs" : "Moderate carbs",
      vegetables: template.vegetables ? "High fiber" : "Moderate fiber"
    };
    
    return Object.values(baseNutrition).join(", ");
  }
  
  suggestIngredients(template, availableFoods) {
    // Suggest 3-5 key ingredients for the meal
    const suggestions = [];
    
    if (template.protein) {
      suggestions.push(availableFoods.find(f => f.toLowerCase().includes('chicken')) || 'protein source');
    }
    if (template.carbs) {
      suggestions.push(availableFoods.find(f => f.toLowerCase().includes('rice')) || 'carbohydrate');
    }
    if (template.vegetables) {
      suggestions.push(availableFoods.find(f => f.toLowerCase().includes('vegetable')) || 'vegetables');
    }
    
    return suggestions.slice(0, 4);
  }
  
  generateShoppingList(weeklyPlan, availableFoods) {
    const commonIngredients = ['onions', 'garlic', 'olive oil', 'salt', 'pepper', 'herbs'];
    const plannedIngredients = Object.values(weeklyPlan)
      .flatMap(day => day.ingredients || [])
      .filter(ingredient => !availableFoods.includes(ingredient));
    
    return [...new Set([...commonIngredients, ...plannedIngredients])];
  }
  
  calculateWeeklyNutrition(weeklyPlan) {
    // Estimate weekly nutrition totals
    const dailyAverage = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
    return {
      calories: dailyAverage.calories * 7,
      protein: dailyAverage.protein * 7,
      carbs: dailyAverage.carbs * 7,
      fat: dailyAverage.fat * 7
    };
  }
  
  generateRecommendations(availableFoods, preferences) {
    const recommendations = ["Plan meals ahead of time"];
    
    if (availableFoods.length < 5) {
      recommendations.push("Consider stocking up on versatile ingredients");
    }
    
    if (preferences?.dietaryRestrictions?.length > 0) {
      recommendations.push("Great job following your dietary preferences!");
    }
    
    recommendations.push("Try batch cooking for time efficiency");
    recommendations.push("Use seasonal ingredients when possible");
    
    return recommendations;
  }

  getDefaultMealPlan() {
    return this.getFallbackMealPlan([], {});
  }

  getDefaultRecipeAnalysis() {
    return {
      nutrition: { calories: 400, protein: 25, carbs: 45, fat: 15 },
      difficulty: 3,
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      dietaryTags: ["balanced"],
      cost: "medium",
      flavorProfile: "savory",
      improvements: ["Add more vegetables", "Consider herbs for flavor"],
      healthBenefits: ["Good source of protein", "Contains essential nutrients"]
    };
  }

  getDefaultNutritionRecommendations() {
    return {
      recommendations: [
        "Increase vegetable intake",
        "Ensure adequate protein with each meal",
        "Stay hydrated throughout the day",
        "Consider meal timing for energy levels"
      ],
      nutritionalGaps: ["fiber", "vitamin D"],
      dailyTargets: { calories: 2000, protein: 150, carbs: 250, fat: 65 }
    };
  }

  getDefaultSubstitutions() {
    return {
      substitutions: {},
      recipeVariations: [],
      notes: ["No substitutions needed"]
    };
  }

  getFallbackPredictions(userContext, timeframe) {
    return {
      optimalMeals: [],
      confidence: 0.5,
      reasoning: "Using fallback prediction logic"
    };
  }

  getCurrentUserId() {
    // Get current user ID from Firebase Auth
    return window.auth?.currentUser?.uid || 'anonymous';
  }

  // Cache management with memory leak prevention
  setupCacheCleanup() {
    // Clean cache every 10 minutes
    setInterval(() => {
      this.cleanExpiredCache();
    }, 10 * 60 * 1000);
  }

  cleanExpiredCache() {
    const now = Date.now();
    const itemsToDelete = [];
    
    for (const [key, value] of this.mlCache.entries()) {
      if (value.timestamp && (now - value.timestamp) > this.cacheTimeout) {
        itemsToDelete.push(key);
      }
    }
    
    itemsToDelete.forEach(key => this.mlCache.delete(key));
    
    if (itemsToDelete.length > 0) {
      console.log(`AIService: Cleaned ${itemsToDelete.length} expired cache entries`);
    }
    
    // If cache is still too large, remove oldest entries
    if (this.mlCache.size > this.maxCacheSize) {
      const entries = Array.from(this.mlCache.entries());
      const sortedByTime = entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
      const toRemove = sortedByTime.slice(0, this.mlCache.size - this.maxCacheSize);
      
      toRemove.forEach(([key]) => this.mlCache.delete(key));
      console.log(`AIService: Removed ${toRemove.length} old cache entries to maintain size limit`);
    }
  }

  clearCache() {
    this.mlCache.clear();
    console.log('AIService: Cache cleared manually');
  }

  getCachedPrediction(key) {
    const cached = this.mlCache.get(key);
    if (cached && cached.timestamp) {
      const age = Date.now() - cached.timestamp;
      if (age > this.cacheTimeout) {
        this.mlCache.delete(key);
        return null;
      }
      return cached.data;
    }
    return cached;
  }

  setCachedPrediction(key, value) {
    // Check cache size limit before adding
    if (this.mlCache.size >= this.maxCacheSize) {
      this.cleanExpiredCache();
    }
    
    this.mlCache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const firebaseAI = new FirebaseAIService();
console.log('AIService: Singleton exported:', firebaseAI);

// Global access for non-module scripts
if (typeof window !== 'undefined') {
  window.firebaseAI = firebaseAI;
  console.log('AIService: Added to window global');
}
