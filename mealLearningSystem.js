/**
 * Enhanced Meal Rating and Learning System
 * Advanced AI learning from user feedback with temporal, contextual, and pattern-based analysis
 * @fileoverview Comprehensive meal preference learning with persistence and analytics
 * @module MealLearningSystem
 */

/**
 * MealLearningSystem - Advanced learning engine for meal preferences
 * Features:
 * - Multi-dimensional preference scoring
 * - Temporal pattern analysis
 * - Contextual learning (time of day, season, mood)
 * - Ingredient combination learning
 * - Preference decay and relevance scoring
 * - Learning confidence tracking
 */
export class MealLearningSystem {
  constructor() {
    this.preferences = {
      // Core preference scores
      ingredientScores: {},      // Individual ingredient preferences
      cuisineScores: {},         // Cuisine type preferences
      cookingMethodScores: {},   // Cooking method preferences
      combinationScores: {},     // Ingredient combination preferences
      templateScores: {},        // Meal template preferences
      
      // Contextual preferences
      timeOfDayPreferences: {    // Breakfast, lunch, dinner preferences
        breakfast: {},
        lunch: {},
        dinner: {},
        snack: {}
      },
      seasonalPreferences: {},   // Seasonal meal preferences
      moodPreferences: {},       // Comfort food, healthy, etc.
      
      // Nutritional preferences
      nutritionPreferences: {    // Preferred nutrition profiles
        highProtein: 0,
        lowCarb: 0,
        highFiber: 0,
        lowCalorie: 0,
        balanced: 0
      },
      
      // Meta-learning data
      learningConfidence: {},    // Confidence in each preference
      preferenceHistory: [],     // Historical preference changes
      ratingPatterns: {},        // Patterns in rating behavior
      lastUpdated: Date.now()
    };
    
    this.ratingHistory = [];     // Detailed rating history
    this.learningStats = {       // Learning system statistics
      totalRatings: 0,
      accuratePredictions: 0,
      learningAccuracy: 0,
      lastAccuracyUpdate: Date.now()
    };
    
    // Learning parameters
    this.learningRate = 0.1;     // How fast preferences change
    this.decayRate = 0.02;       // How fast old preferences decay
    this.confidenceThreshold = 0.7; // Minimum confidence for strong preferences
    this.temporalWeight = 0.3;   // Weight for temporal patterns
    
    this.initializeSystem();
  }

  /**
   * Initialize the learning system with saved data
   */
  async initializeSystem() {
    try {
      // Load saved preferences
      await this.loadPreferences();
      
      // Clean up old data
      this.cleanupOldData();
      
      // Update preference decay
      this.applyPreferenceDecay();
      
      console.log('🧠 Meal Learning System initialized with', this.ratingHistory.length, 'historical ratings');
    } catch (error) {
      console.error('Error initializing learning system:', error);
      this.initializeDefaultPreferences();
    }
  }

  /**
   * Rate a meal and learn from the rating
   * @param {string} mealName - Name of the meal
   * @param {number} rating - Rating from 1-5 (1=hate, 2=dislike, 3=neutral, 4=like, 5=love)
   * @param {Object} context - Additional context (timeOfDay, season, mood, etc.)
   * @returns {Object} Learning feedback and prediction accuracy
   */
  async rateMeal(mealName, rating, context = {}) {
    try {
      // Validate input
      if (!mealName || typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Invalid meal rating parameters');
      }

      // Extract meal features
      const mealFeatures = this.extractMealFeatures(mealName);
      
      // Create rating record
      const ratingRecord = {
        id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mealName,
        rating,
        features: mealFeatures,
        context: {
          timeOfDay: context.timeOfDay || this.getCurrentTimeOfDay(),
          season: context.season || this.getCurrentSeason(),
          mood: context.mood || 'neutral',
          dayOfWeek: new Date().getDay(),
          timestamp: Date.now()
        },
        prediction: null, // Will be filled by prediction system
        accuracy: null    // Will be calculated later
      };

      // Get prediction before learning (for accuracy tracking)
      const prediction = this.predictRating(mealName, ratingRecord.context);
      ratingRecord.prediction = prediction;
      
      // Calculate prediction accuracy
      if (prediction.confidence > this.confidenceThreshold) {
        const accuracyScore = 1 - Math.abs(prediction.rating - rating) / 4;
        ratingRecord.accuracy = accuracyScore;
        this.updateAccuracyStats(accuracyScore);
      }

      // Learn from the rating
      await this.learnFromRating(ratingRecord);
      
      // Save rating history
      this.ratingHistory.push(ratingRecord);
      await this.saveRatingHistory();
      
      // Update learning statistics
      this.learningStats.totalRatings++;
      await this.savePreferences();
      
      console.log(`🧠 Learned from rating: ${mealName} = ${rating}/5 (predicted: ${prediction.rating.toFixed(1)}, confidence: ${prediction.confidence.toFixed(2)})`);
      
      return {
        success: true,
        prediction,
        accuracy: ratingRecord.accuracy,
        learningFeedback: this.generateLearningFeedback(ratingRecord),
        totalRatings: this.learningStats.totalRatings,
        systemAccuracy: this.learningStats.learningAccuracy
      };
      
    } catch (error) {
      console.error('Error rating meal:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Learn from a rating record using advanced algorithms
   * @param {Object} ratingRecord - Complete rating record
   */
  async learnFromRating(ratingRecord) {
    const { rating, features, context } = ratingRecord;
    
    // Calculate learning weights based on context and confidence
    const learningWeight = this.calculateLearningWeight(ratingRecord);
    
    // Update ingredient preferences
    features.ingredients.forEach(ingredient => {
      this.updatePreferenceScore('ingredientScores', ingredient, rating, learningWeight);
    });
    
    // Update cuisine preferences
    if (features.cuisine) {
      this.updatePreferenceScore('cuisineScores', features.cuisine, rating, learningWeight);
    }
    
    // Update cooking method preferences
    if (features.cookingMethod) {
      this.updatePreferenceScore('cookingMethodScores', features.cookingMethod, rating, learningWeight);
    }
    
    // Update ingredient combination preferences
    if (features.ingredients.length > 1) {
      const combinations = this.generateCombinations(features.ingredients);
      combinations.forEach(combo => {
        this.updatePreferenceScore('combinationScores', combo, rating, learningWeight);
      });
    }
    
    // Update contextual preferences
    this.updateContextualPreferences(ratingRecord);
    
    // Update nutritional preferences
    this.updateNutritionalPreferences(ratingRecord);
    
    // Update template preferences
    if (features.template) {
      this.updatePreferenceScore('templateScores', features.template, rating, learningWeight);
    }
    
    // Record preference change
    this.preferences.preferenceHistory.push({
      timestamp: Date.now(),
      change: `Rated "${ratingRecord.mealName}" as ${rating}/5`,
      context: context
    });
    
    this.preferences.lastUpdated = Date.now();
  }

  /**
   * Update a specific preference score with advanced weighting
   * @param {string} category - Preference category
   * @param {string} key - Preference key
   * @param {number} rating - User rating (1-5)
   * @param {number} learningWeight - Learning weight multiplier
   */
  updatePreferenceScore(category, key, rating, learningWeight) {
    if (!this.preferences[category]) {
      this.preferences[category] = {};
    }
    
    const currentScore = this.preferences[category][key] || 0;
    const currentConfidence = this.preferences.learningConfidence[key] || 0;
    
    // Convert rating to preference score (-2 to +2)
    const preferenceScore = (rating - 3) * 0.67;
    
    // Apply learning rate with diminishing returns
    const adaptiveLearningRate = this.learningRate * learningWeight * (1 - currentConfidence * 0.5);
    
    // Update score using weighted average
    const newScore = currentScore + (preferenceScore - currentScore) * adaptiveLearningRate;
    
    // Update confidence (increases with more data)
    const newConfidence = Math.min(1, currentConfidence + 0.1 * learningWeight);
    
    this.preferences[category][key] = Math.max(-2, Math.min(2, newScore));
    this.preferences.learningConfidence[key] = newConfidence;
  }

  /**
   * Calculate learning weight based on various factors
   * @param {Object} ratingRecord - Rating record
   * @returns {number} Learning weight multiplier
   */
  calculateLearningWeight(ratingRecord) {
    let weight = 1.0;
    
    // Increase weight for extreme ratings (1,2 or 4,5)
    if (ratingRecord.rating <= 2 || ratingRecord.rating >= 4) {
      weight *= 1.3;
    }
    
    // Increase weight for recent ratings
    const daysSinceRating = (Date.now() - ratingRecord.context.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceRating < 7) {
      weight *= 1.2;
    }
    
    // Increase weight for consistent ratings
    const recentSimilarRatings = this.getRecentSimilarRatings(ratingRecord.mealName, 30);
    if (recentSimilarRatings.length > 1) {
      const ratingConsistency = this.calculateRatingConsistency(recentSimilarRatings);
      weight *= (0.8 + ratingConsistency * 0.4);
    }
    
    return weight;
  }

  /**
   * Update contextual preferences based on rating
   * @param {Object} ratingRecord - Rating record
   */
  updateContextualPreferences(ratingRecord) {
    const { rating, context, features } = ratingRecord;
    const timeOfDay = context.timeOfDay;
    
    // Update time-of-day preferences
    if (timeOfDay && this.preferences.timeOfDayPreferences[timeOfDay]) {
      features.ingredients.forEach(ingredient => {
        if (!this.preferences.timeOfDayPreferences[timeOfDay][ingredient]) {
          this.preferences.timeOfDayPreferences[timeOfDay][ingredient] = 0;
        }
        const currentScore = this.preferences.timeOfDayPreferences[timeOfDay][ingredient];
        const preferenceScore = (rating - 3) * 0.5;
        this.preferences.timeOfDayPreferences[timeOfDay][ingredient] = 
          currentScore + (preferenceScore - currentScore) * this.learningRate;
      });
    }
    
    // Update seasonal preferences
    const season = context.season;
    if (season) {
      if (!this.preferences.seasonalPreferences[season]) {
        this.preferences.seasonalPreferences[season] = {};
      }
      features.ingredients.forEach(ingredient => {
        if (!this.preferences.seasonalPreferences[season][ingredient]) {
          this.preferences.seasonalPreferences[season][ingredient] = 0;
        }
        const currentScore = this.preferences.seasonalPreferences[season][ingredient];
        const preferenceScore = (rating - 3) * 0.3;
        this.preferences.seasonalPreferences[season][ingredient] = 
          currentScore + (preferenceScore - currentScore) * this.learningRate;
      });
    }
    
    // Update mood preferences
    const mood = context.mood;
    if (mood && mood !== 'neutral') {
      if (!this.preferences.moodPreferences[mood]) {
        this.preferences.moodPreferences[mood] = {};
      }
      features.ingredients.forEach(ingredient => {
        if (!this.preferences.moodPreferences[mood][ingredient]) {
          this.preferences.moodPreferences[mood][ingredient] = 0;
        }
        const currentScore = this.preferences.moodPreferences[mood][ingredient];
        const preferenceScore = (rating - 3) * 0.4;
        this.preferences.moodPreferences[mood][ingredient] = 
          currentScore + (preferenceScore - currentScore) * this.learningRate;
      });
    }
  }

  /**
   * Predict rating for a meal based on learned preferences
   * @param {string} mealName - Name of the meal
   * @param {Object} context - Context for prediction
   * @returns {Object} Prediction with rating and confidence
   */
  predictRating(mealName, context = {}) {
    try {
      const features = this.extractMealFeatures(mealName);
      const currentContext = {
        timeOfDay: context.timeOfDay || this.getCurrentTimeOfDay(),
        season: context.season || this.getCurrentSeason(),
        mood: context.mood || 'neutral',
        ...context
      };
      
      let totalScore = 0;
      let totalWeight = 0;
      let confidenceFactors = [];
      
      // Base preference score from ingredients
      features.ingredients.forEach(ingredient => {
        const score = this.preferences.ingredientScores[ingredient] || 0;
        const confidence = this.preferences.learningConfidence[ingredient] || 0;
        const weight = 1.0 + confidence;
        
        totalScore += score * weight;
        totalWeight += weight;
        confidenceFactors.push(confidence);
      });
      
      // Cuisine preference score
      if (features.cuisine) {
        const score = this.preferences.cuisineScores[features.cuisine] || 0;
        const confidence = this.preferences.learningConfidence[features.cuisine] || 0;
        const weight = 0.8 + confidence;
        
        totalScore += score * weight;
        totalWeight += weight;
        confidenceFactors.push(confidence);
      }
      
      // Cooking method preference score
      if (features.cookingMethod) {
        const score = this.preferences.cookingMethodScores[features.cookingMethod] || 0;
        const confidence = this.preferences.learningConfidence[features.cookingMethod] || 0;
        const weight = 0.6 + confidence;
        
        totalScore += score * weight;
        totalWeight += weight;
        confidenceFactors.push(confidence);
      }
      
      // Contextual adjustments
      const contextualAdjustment = this.calculateContextualAdjustment(features, currentContext);
      totalScore += contextualAdjustment.score;
      totalWeight += contextualAdjustment.weight;
      confidenceFactors.push(contextualAdjustment.confidence);
      
      // Calculate final prediction
      const baseRating = totalWeight > 0 ? totalScore / totalWeight : 0;
      const finalRating = Math.max(1, Math.min(5, 3 + baseRating * 1.5)); // Convert to 1-5 scale
      
      // Calculate confidence
      const averageConfidence = confidenceFactors.length > 0 ? 
        confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length : 0;
      const dataConfidence = Math.min(1, this.learningStats.totalRatings / 50); // More data = more confidence
      const finalConfidence = (averageConfidence + dataConfidence) / 2;
      
      return {
        rating: finalRating,
        confidence: finalConfidence,
        breakdown: {
          ingredientScore: features.ingredients.reduce((sum, ing) => 
            sum + (this.preferences.ingredientScores[ing] || 0), 0),
          cuisineScore: features.cuisine ? (this.preferences.cuisineScores[features.cuisine] || 0) : 0,
          cookingMethodScore: features.cookingMethod ? (this.preferences.cookingMethodScores[features.cookingMethod] || 0) : 0,
          contextualScore: contextualAdjustment.score
        }
      };
      
    } catch (error) {
      console.error('Error predicting meal rating:', error);
      return { rating: 3, confidence: 0, error: error.message };
    }
  }

  /**
   * Extract comprehensive features from meal name
   * @param {string} mealName - Name of the meal
   * @returns {Object} Extracted features
   */
  extractMealFeatures(mealName) {
    const mealLower = mealName.toLowerCase();
    
    // Enhanced ingredient detection
    const ingredients = this.detectIngredients(mealLower);
    
    // Enhanced cuisine detection
    const cuisine = this.detectCuisine(mealLower);
    
    // Enhanced cooking method detection
    const cookingMethod = this.detectCookingMethod(mealLower);
    
    // Template detection
    const template = this.detectTemplate(mealLower);
    
    // Nutrition profile estimation
    const nutritionProfile = this.estimateNutritionProfile(ingredients, cookingMethod);
    
    return {
      ingredients,
      cuisine,
      cookingMethod,
      template,
      nutritionProfile,
      complexity: this.estimateComplexity(mealName),
      spiceLevel: this.estimateSpiceLevel(mealLower)
    };
  }

  /**
   * Detect ingredients from meal name using comprehensive database
   * @param {string} mealLower - Lowercase meal name
   * @returns {Array} Detected ingredients
   */
  detectIngredients(mealLower) {
    const ingredientDatabase = {
      // Proteins
      proteins: ['chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'turkey', 'lamb', 'duck', 'fish', 'tofu', 'tempeh', 'seitan', 'beans', 'lentils', 'chickpeas', 'eggs'],
      
      // Vegetables
      vegetables: ['broccoli', 'spinach', 'carrots', 'peppers', 'onions', 'tomatoes', 'mushrooms', 'asparagus', 'zucchini', 'cauliflower', 'brussels sprouts', 'kale', 'cabbage', 'lettuce', 'cucumber', 'celery', 'potatoes', 'sweet potatoes'],
      
      // Grains & Starches
      grains: ['rice', 'pasta', 'quinoa', 'bread', 'noodles', 'oats', 'barley', 'couscous', 'bulgur', 'farro'],
      
      // Dairy & Alternatives
      dairy: ['cheese', 'milk', 'yogurt', 'cream', 'butter', 'mozzarella', 'parmesan', 'cheddar', 'feta'],
      
      // Fruits
      fruits: ['apples', 'bananas', 'berries', 'strawberries', 'blueberries', 'oranges', 'lemons', 'limes', 'avocado', 'mango', 'pineapple'],
      
      // Herbs & Spices
      herbs: ['basil', 'oregano', 'thyme', 'rosemary', 'cilantro', 'parsley', 'garlic', 'ginger', 'cumin', 'paprika', 'turmeric', 'curry']
    };
    
    const detectedIngredients = [];
    
    Object.values(ingredientDatabase).forEach(category => {
      category.forEach(ingredient => {
        if (mealLower.includes(ingredient)) {
          detectedIngredients.push(ingredient);
        }
      });
    });
    
    return [...new Set(detectedIngredients)]; // Remove duplicates
  }

  /**
   * Enhanced cuisine detection
   * @param {string} mealLower - Lowercase meal name
   * @returns {string|null} Detected cuisine
   */
  detectCuisine(mealLower) {
    const cuisineKeywords = {
      'italian': ['pasta', 'pizza', 'risotto', 'parmesan', 'marinara', 'pesto', 'gnocchi', 'lasagna'],
      'mexican': ['tacos', 'burrito', 'quesadilla', 'salsa', 'guacamole', 'enchilada', 'fajita', 'nachos'],
      'asian': ['stir fry', 'fried rice', 'soy sauce', 'teriyaki', 'sesame', 'ginger', 'ramen', 'sushi'],
      'chinese': ['orange chicken', 'sweet and sour', 'lo mein', 'chow mein', 'kung pao', 'general tso'],
      'indian': ['curry', 'tikka', 'masala', 'biryani', 'naan', 'dal', 'turmeric', 'cumin'],
      'mediterranean': ['olive oil', 'feta', 'olives', 'hummus', 'tzatziki', 'pita', 'greek'],
      'american': ['burger', 'bbq', 'wings', 'mac and cheese', 'meatloaf', 'pancakes', 'sandwich']
    };
    
    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => mealLower.includes(keyword))) {
        return cuisine;
      }
    }
    
    return null;
  }

  /**
   * Enhanced cooking method detection
   * @param {string} mealLower - Lowercase meal name
   * @returns {string|null} Detected cooking method
   */
  detectCookingMethod(mealLower) {
    const cookingMethods = {
      'grilled': ['grilled', 'barbecue', 'bbq'],
      'baked': ['baked', 'roasted', 'oven'],
      'fried': ['fried', 'crispy', 'breaded'],
      'sauteed': ['sauteed', 'pan-seared', 'stir fry'],
      'steamed': ['steamed'],
      'braised': ['braised', 'slow cooked', 'stewed'],
      'raw': ['salad', 'sushi', 'ceviche'],
      'boiled': ['boiled', 'poached', 'soup']
    };
    
    for (const [method, keywords] of Object.entries(cookingMethods)) {
      if (keywords.some(keyword => mealLower.includes(keyword))) {
        return method;
      }
    }
    
    return null;
  }

  // Helper methods for context and utility functions...
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  /**
   * Generate learning feedback for user
   * @param {Object} ratingRecord - Rating record
   * @returns {string} Human-readable learning feedback
   */
  generateLearningFeedback(ratingRecord) {
    const { rating, features, context, prediction } = ratingRecord;
    
    if (rating >= 4) {
      return `Great! I'm learning that you enjoy ${features.cuisine || 'this type of'} cuisine with ${features.ingredients.slice(0, 2).join(' and ')}.`;
    } else if (rating <= 2) {
      return `Noted! I'll avoid suggesting similar combinations of ${features.ingredients.slice(0, 2).join(' and ')} in the future.`;
    } else {
      return `Thanks for the feedback! I'm building a better understanding of your preferences.`;
    }
  }

  /**
   * Save preferences to persistent storage (localStorage + Firebase)
   */
  async savePreferences() {
    try {
      // Save to localStorage for quick access
      localStorage.setItem('mealLearningPreferences', JSON.stringify(this.preferences));
      localStorage.setItem('mealLearningStats', JSON.stringify(this.learningStats));
      
      // Save to Firebase if user is authenticated
      if (typeof window !== 'undefined' && window.updateLearningDataInDB) {
        try {
          const { getFirebaseInstance } = await import('./firebase.js');
          const { auth } = await getFirebaseInstance();
          const user = auth.currentUser;
          
          if (user) {
            await window.updateLearningDataInDB(user.uid, {
              preferences: this.preferences,
              stats: this.learningStats,
              lastSync: Date.now()
            });
            console.log('🧠 Preferences synced to Firebase');
          }
        } catch (error) {
          console.warn('🧠 Firebase sync failed, saved locally only:', error);
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Save rating history to persistent storage (localStorage + Firebase)
   */
  async saveRatingHistory() {
    try {
      // Keep only recent history to prevent storage bloat
      const recentHistory = this.ratingHistory.slice(-200);
      this.ratingHistory = recentHistory;
      
      // Save to localStorage
      localStorage.setItem('mealRatingHistory', JSON.stringify(recentHistory));
      
      // Save to Firebase if available
      if (typeof window !== 'undefined' && window.updateMealRatingsInDB) {
        try {
          const { getFirebaseInstance } = await import('./firebase.js');
          const { auth } = await getFirebaseInstance();
          const user = auth.currentUser;
          
          if (user) {
            // Convert ratings to a more efficient format for Firebase
            const ratingsMap = {};
            recentHistory.forEach(rating => {
              ratingsMap[rating.id] = {
                mealName: rating.mealName,
                rating: rating.rating,
                timestamp: rating.context.timestamp,
                context: rating.context
              };
            });
            
            await window.updateMealRatingsInDB(user.uid, ratingsMap);
            console.log('🧠 Rating history synced to Firebase');
          }
        } catch (error) {
          console.warn('🧠 Firebase rating sync failed, saved locally only:', error);
        }
      }
    } catch (error) {
      console.error('Error saving rating history:', error);
    }
  }

  /**
   * Load preferences from persistent storage (Firebase + localStorage fallback)
   */
  async loadPreferences() {
    try {
      let preferencesLoaded = false;
      
      // Try to load from Firebase first if user is authenticated
      if (typeof window !== 'undefined' && window.loadLearningDataFromDB) {
        try {
          const { getFirebaseInstance } = await import('./firebase.js');
          const { auth } = await getFirebaseInstance();
          const user = auth.currentUser;
          
          if (user) {
            const firebaseData = await window.loadLearningDataFromDB(user.uid);
            if (firebaseData && firebaseData.preferences) {
              this.preferences = { ...this.preferences, ...firebaseData.preferences };
              if (firebaseData.stats) {
                this.learningStats = { ...this.learningStats, ...firebaseData.stats };
              }
              preferencesLoaded = true;
              console.log('🧠 Preferences loaded from Firebase');
            }
          }
        } catch (error) {
          console.warn('🧠 Failed to load from Firebase, trying localStorage:', error);
        }
      }
      
      // Fallback to localStorage if Firebase failed or unavailable
      if (!preferencesLoaded) {
        const savedPreferences = localStorage.getItem('mealLearningPreferences');
        const savedStats = localStorage.getItem('mealLearningStats');
        
        if (savedPreferences) {
          this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
          console.log('🧠 Preferences loaded from localStorage');
        }
        
        if (savedStats) {
          this.learningStats = { ...this.learningStats, ...JSON.parse(savedStats) };
        }
      }
      
      // Load rating history
      await this.loadRatingHistory();
      
    } catch (error) {
      console.error('Error loading preferences:', error);
      this.initializeDefaultPreferences();
    }
  }

  /**
   * Load rating history from persistent storage
   */
  async loadRatingHistory() {
    try {
      let historyLoaded = false;
      
      // Try Firebase first
      if (typeof window !== 'undefined' && window.loadMealRatingsFromDB) {
        try {
          const { getFirebaseInstance } = await import('./firebase.js');
          const { auth } = await getFirebaseInstance();
          const user = auth.currentUser;
          
          if (user) {
            const firebaseRatings = await window.loadMealRatingsFromDB(user.uid);
            if (firebaseRatings && typeof firebaseRatings === 'object') {
              // Convert Firebase format back to array
              this.ratingHistory = Object.values(firebaseRatings).map(rating => ({
                id: rating.id || `rating_${rating.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                mealName: rating.mealName,
                rating: rating.rating,
                context: rating.context || { timestamp: rating.timestamp },
                prediction: null,
                accuracy: null,
                features: this.extractMealFeatures(rating.mealName)
              }));
              historyLoaded = true;
              console.log('🧠 Rating history loaded from Firebase:', this.ratingHistory.length, 'ratings');
            }
          }
        } catch (error) {
          console.warn('🧠 Failed to load rating history from Firebase:', error);
        }
      }
      
      // Fallback to localStorage
      if (!historyLoaded) {
        const savedHistory = localStorage.getItem('mealRatingHistory');
        if (savedHistory) {
          this.ratingHistory = JSON.parse(savedHistory);
          console.log('🧠 Rating history loaded from localStorage:', this.ratingHistory.length, 'ratings');
        }
      }
      
    } catch (error) {
      console.error('Error loading rating history:', error);
      this.ratingHistory = [];
    }
  }

  /**
   * Initialize default preferences structure
   */
  initializeDefaultPreferences() {
    // Already initialized in constructor
    console.log('🧠 Initialized default preferences for new user');
  }

  /**
   * Clean up old preference data
   */
  cleanupOldData() {
    const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
    
    // Remove old rating history
    this.ratingHistory = this.ratingHistory.filter(rating => 
      rating.context.timestamp > cutoffTime
    );
    
    // Remove old preference history
    this.preferences.preferenceHistory = this.preferences.preferenceHistory.filter(entry =>
      entry.timestamp > cutoffTime
    );
  }

  /**
   * Apply preference decay over time
   */
  applyPreferenceDecay() {
    const daysSinceUpdate = (Date.now() - this.preferences.lastUpdated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 7) { // Apply decay if more than a week old
      const decayFactor = Math.pow(1 - this.decayRate, daysSinceUpdate);
      
      // Decay all preference scores
      ['ingredientScores', 'cuisineScores', 'cookingMethodScores', 'combinationScores'].forEach(category => {
        Object.keys(this.preferences[category]).forEach(key => {
          this.preferences[category][key] *= decayFactor;
        });
      });
      
      console.log(`🧠 Applied preference decay factor: ${decayFactor.toFixed(3)}`);
    }
  }

  // Additional utility methods...
  updateAccuracyStats(accuracyScore) {
    this.learningStats.accuratePredictions += accuracyScore;
    this.learningStats.learningAccuracy = this.learningStats.totalRatings > 0 ? 
      this.learningStats.accuratePredictions / this.learningStats.totalRatings : 0;
    this.learningStats.lastAccuracyUpdate = Date.now();
  }

  getRecentSimilarRatings(mealName, days) {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.ratingHistory.filter(rating => 
      rating.context.timestamp > cutoffTime && 
      rating.mealName.toLowerCase().includes(mealName.toLowerCase())
    );
  }

  calculateRatingConsistency(ratings) {
    if (ratings.length < 2) return 0;
    
    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r.rating - average, 2), 0) / ratings.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - standardDeviation / 2); // Normalize to 0-1
  }

  generateCombinations(ingredients) {
    const combinations = [];
    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        combinations.push([ingredients[i], ingredients[j]].sort().join(' + '));
      }
    }
    return combinations;
  }

  calculateContextualAdjustment(features, context) {
    let score = 0;
    let weight = 0;
    let confidence = 0;
    
    // Time of day adjustment
    if (context.timeOfDay && this.preferences.timeOfDayPreferences[context.timeOfDay]) {
      const timePrefs = this.preferences.timeOfDayPreferences[context.timeOfDay];
      features.ingredients.forEach(ingredient => {
        if (timePrefs[ingredient]) {
          score += timePrefs[ingredient] * this.temporalWeight;
          weight += this.temporalWeight;
          confidence += 0.1;
        }
      });
    }
    
    // Seasonal adjustment
    if (context.season && this.preferences.seasonalPreferences[context.season]) {
      const seasonalPrefs = this.preferences.seasonalPreferences[context.season];
      features.ingredients.forEach(ingredient => {
        if (seasonalPrefs[ingredient]) {
          score += seasonalPrefs[ingredient] * this.temporalWeight;
          weight += this.temporalWeight;
          confidence += 0.1;
        }
      });
    }
    
    return { score, weight, confidence: Math.min(1, confidence) };
  }

  estimateNutritionProfile(ingredients, cookingMethod) {
    // Simplified nutrition estimation
    let protein = 0, carbs = 0, fat = 0, fiber = 0;
    
    ingredients.forEach(ingredient => {
      // Basic nutrition estimation logic
      if (['chicken', 'beef', 'fish', 'tofu', 'eggs'].some(p => ingredient.includes(p))) {
        protein += 20;
      }
      if (['rice', 'pasta', 'bread', 'potato'].some(c => ingredient.includes(c))) {
        carbs += 30;
      }
      if (['avocado', 'nuts', 'cheese'].some(f => ingredient.includes(f))) {
        fat += 15;
      }
      if (['vegetables', 'beans', 'fruit'].some(f => ingredient.includes(f))) {
        fiber += 5;
      }
    });
    
    return { protein, carbs, fat, fiber };
  }

  estimateComplexity(mealName) {
    const complexWords = ['stuffed', 'marinated', 'glazed', 'braised', 'reduction', 'sous vide'];
    const simpleWords = ['simple', 'easy', 'quick', 'basic'];
    
    if (complexWords.some(word => mealName.toLowerCase().includes(word))) return 'complex';
    if (simpleWords.some(word => mealName.toLowerCase().includes(word))) return 'simple';
    return 'moderate';
  }

  estimateSpiceLevel(mealLower) {
    const spicyWords = ['spicy', 'hot', 'jalapeño', 'chipotle', 'curry', 'chili'];
    const mildWords = ['mild', 'sweet', 'cream'];
    
    if (spicyWords.some(word => mealLower.includes(word))) return 'high';
    if (mildWords.some(word => mealLower.includes(word))) return 'low';
    return 'medium';
  }

  detectTemplate(mealLower) {
    const templates = [
      'grilled {protein} with {vegetable}',
      '{protein} stir fry',
      '{protein} salad',
      'baked {protein} and {starch}',
      '{cuisine} {protein} bowl'
    ];
    
    for (const template of templates) {
      const templateWords = template.replace(/\{.*?\}/g, '').trim().split(' ');
      if (templateWords.every(word => mealLower.includes(word.toLowerCase()))) {
        return template;
      }
    }
    
    return null;
  }

  updateNutritionalPreferences(ratingRecord) {
    const { rating, features } = ratingRecord;
    const nutrition = features.nutritionProfile;
    
    // Update nutritional preferences based on rating
    if (nutrition.protein > 15) {
      this.preferences.nutritionPreferences.highProtein += (rating - 3) * 0.1;
    }
    if (nutrition.carbs < 20) {
      this.preferences.nutritionPreferences.lowCarb += (rating - 3) * 0.1;
    }
    if (nutrition.fiber > 8) {
      this.preferences.nutritionPreferences.highFiber += (rating - 3) * 0.1;
    }
    
    // Normalize preferences
    Object.keys(this.preferences.nutritionPreferences).forEach(key => {
      this.preferences.nutritionPreferences[key] = Math.max(-2, Math.min(2, this.preferences.nutritionPreferences[key]));
    });
  }
}
