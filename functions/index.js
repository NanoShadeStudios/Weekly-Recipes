const {onRequest, onCall} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ML model imports
const {aiplatform} = require("@google-cloud/aiplatform");

// Initialize Vertex AI client
const {PredictionServiceClient} = aiplatform.v1;
const predictionClient = new PredictionServiceClient({
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
});

/**
 * Process ML tasks for meal planning
 */
exports.processMLTask = onCall(async (request) => {
  const {task, data} = request.data;
  
  try {
    switch (task) {
      case "meal_analysis":
        return await analyzeMeal(data);
      case "nutrition_prediction":
        return await predictNutrition(data);
      case "preference_modeling":
        return await modelUserPreferences(data);
      default:
        throw new Error(`Unknown ML task: ${task}`);
    }
  } catch (error) {
    logger.error("ML task processing failed:", error);
    throw new Error("ML processing failed");
  }
});

/**
 * Update user preferences using machine learning
 */
exports.updateUserPreferencesML = onCall(async (request) => {
  const {interactions, userId} = request.data;
  
  try {
    // Analyze user interactions using ML
    const analysisResults = await analyzeUserInteractions(interactions);
    
    // Update preferences in Firestore
    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.update({
      mlPreferences: analysisResults.preferences,
      lastMLUpdate: admin.firestore.FieldValue.serverTimestamp(),
      confidenceScore: analysisResults.confidence,
    });
    
    return {
      success: true,
      updatedPreferences: analysisResults.preferences,
      confidence: analysisResults.confidence,
    };
  } catch (error) {
    logger.error("ML preference update failed:", error);
    throw new Error("Preference update failed");
  }
});

/**
 * Predict optimal meals for users
 */
exports.predictOptimalMeals = onCall(async (request) => {
  const {userContext, timeframe} = request.data;
  
  try {
    // Use ML model to predict optimal meals
    const predictions = await generateMealPredictions(userContext, timeframe);
    
    return {
      success: true,
      predictions: predictions,
      timestamp: Date.now(),
    };
  } catch (error) {
    logger.error("Meal prediction failed:", error);
    throw new Error("Meal prediction failed");
  }
});

/**
 * Batch process nutrition analysis
 */
exports.batchNutritionAnalysis = onCall(async (request) => {
  const {recipes} = request.data;
  
  try {
    const results = await Promise.all(
        recipes.map(async (recipe) => {
          const analysis = await analyzeRecipeNutrition(recipe);
          return {
            recipe: recipe,
            analysis: analysis,
          };
        })
    );
    
    return {
      success: true,
      results: results,
    };
  } catch (error) {
    logger.error("Batch nutrition analysis failed:", error);
    throw new Error("Batch analysis failed");
  }
});

/**
 * Real-time meal recommendation engine
 */
exports.realTimeMealRecommendations = onCall(async (request) => {
  const {userId, context} = request.data;
  
  try {
    // Get user's latest preferences
    const userDoc = await admin.firestore()
        .collection("users")
        .doc(userId)
        .get();
    
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const preferences = userData.mlPreferences || {};
    
    // Generate real-time recommendations
    const recommendations = await generateRealTimeRecommendations(
        preferences,
        context
    );
    
    return {
      success: true,
      recommendations: recommendations,
      timestamp: Date.now(),
    };
  } catch (error) {
    logger.error("Real-time recommendations failed:", error);
    throw new Error("Recommendation generation failed");
  }
});

// ML Helper Functions

async function analyzeMeal(mealData) {
  // Implement meal analysis using Vertex AI
  const features = extractMealFeatures(mealData.meal);
  
  // Simulate ML model prediction
  const analysis = {
    cuisineType: features.cuisine || "unknown",
    difficulty: Math.floor(Math.random() * 5) + 1,
    healthScore: Math.floor(Math.random() * 100),
    ingredients: features.ingredients,
    cookingMethods: features.cookingMethods,
    nutritionScore: {
      calories: Math.floor(Math.random() * 800) + 200,
      protein: Math.floor(Math.random() * 50) + 10,
      carbs: Math.floor(Math.random() * 60) + 20,
      fat: Math.floor(Math.random() * 30) + 5,
    },
  };
  
  return analysis;
}

async function predictNutrition(recipeData) {
  // Extract ingredients and portions
  const ingredients = recipeData.ingredients || [];
  
  // Simulate nutrition prediction
  const nutrition = {
    totalCalories: ingredients.length * 120 + Math.floor(Math.random() * 200),
    macros: {
      protein: Math.floor(Math.random() * 40) + 15,
      carbs: Math.floor(Math.random() * 50) + 25,
      fat: Math.floor(Math.random() * 25) + 10,
    },
    micronutrients: {
      fiber: Math.floor(Math.random() * 15) + 5,
      sodium: Math.floor(Math.random() * 1000) + 300,
      sugar: Math.floor(Math.random() * 30) + 5,
    },
    healthScore: Math.floor(Math.random() * 100),
  };
  
  return nutrition;
}

async function modelUserPreferences(userData) {
  const {interactions, currentPreferences} = userData;
  
  // Analyze interaction patterns
  const likeCounts = {};
  const dislikeCounts = {};
  
  interactions.forEach((interaction) => {
    const features = extractMealFeatures(interaction.meal);
    
    if (interaction.type === "like") {
      features.ingredients.forEach((ingredient) => {
        likeCounts[ingredient] = (likeCounts[ingredient] || 0) + 1;
      });
    } else if (interaction.type === "dislike") {
      features.ingredients.forEach((ingredient) => {
        dislikeCounts[ingredient] = (dislikeCounts[ingredient] || 0) + 1;
      });
    }
  });
  
  // Calculate preference scores
  const preferences = {};
  
  Object.keys({...likeCounts, ...dislikeCounts}).forEach((ingredient) => {
    const likes = likeCounts[ingredient] || 0;
    const dislikes = dislikeCounts[ingredient] || 0;
    const total = likes + dislikes;
    
    if (total > 0) {
      preferences[ingredient] = (likes - dislikes) / total;
    }
  });
  
  return {
    preferences: preferences,
    confidence: Math.min(interactions.length / 20, 1), // Higher confidence with more data
  };
}

async function analyzeUserInteractions(interactions) {
  // Process user interactions to extract patterns
  const patterns = {
    cuisinePreferences: {},
    ingredientPreferences: {},
    timePreferences: {},
    complexityPreferences: {},
  };
  
  interactions.forEach((interaction) => {
    const features = extractMealFeatures(interaction.meal);
    const weight = interaction.type === "like" ? 1 : 
                  interaction.type === "pin" ? 2 : -1;
    
    // Update cuisine preferences
    if (features.cuisine) {
      patterns.cuisinePreferences[features.cuisine] = 
        (patterns.cuisinePreferences[features.cuisine] || 0) + weight;
    }
    
    // Update ingredient preferences
    features.ingredients.forEach((ingredient) => {
      patterns.ingredientPreferences[ingredient] = 
        (patterns.ingredientPreferences[ingredient] || 0) + weight;
    });
  });
  
  const confidence = Math.min(interactions.length / 15, 1);
  
  return {
    preferences: patterns,
    confidence: confidence,
  };
}

async function generateMealPredictions(userContext, timeframe) {
  const {preferences, learningHistory} = userContext;
  
  // Simulate ML-based meal prediction
  const predictions = [];
  
  for (let day = 0; day < timeframe; day++) {
    const prediction = {
      day: day + 1,
      recommendedMeal: generateMealBasedOnPreferences(preferences),
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      reasoning: "Based on your preference patterns and seasonal availability",
      alternatives: [
        generateMealBasedOnPreferences(preferences),
        generateMealBasedOnPreferences(preferences),
      ],
    };
    
    predictions.push(prediction);
  }
  
  return predictions;
}

async function generateRealTimeRecommendations(preferences, context) {
  const recommendations = [];
  
  // Generate recommendations based on time of day, weather, etc.
  const timeOfDay = new Date().getHours();
  const mealType = timeOfDay < 10 ? "breakfast" : 
                  timeOfDay < 15 ? "lunch" : "dinner";
  
  for (let i = 0; i < 3; i++) {
    recommendations.push({
      meal: generateMealBasedOnPreferences(preferences, mealType),
      reason: `Perfect for ${mealType} based on your preferences`,
      confidence: Math.random() * 0.3 + 0.7,
      estimatedTime: Math.floor(Math.random() * 40) + 15,
    });
  }
  
  return recommendations;
}

async function analyzeRecipeNutrition(recipe) {
  // Simulate recipe nutrition analysis
  return {
    calories: Math.floor(Math.random() * 600) + 200,
    protein: Math.floor(Math.random() * 35) + 10,
    carbs: Math.floor(Math.random() * 45) + 15,
    fat: Math.floor(Math.random() * 20) + 5,
    fiber: Math.floor(Math.random() * 12) + 3,
    sugar: Math.floor(Math.random() * 25) + 5,
    healthScore: Math.floor(Math.random() * 100),
  };
}

// Utility Functions

function extractMealFeatures(meal) {
  const mealLower = meal.toLowerCase();
  
  const cuisines = ["italian", "chinese", "mexican", "indian", "american", "thai"];
  const ingredients = ["chicken", "beef", "pork", "fish", "rice", "pasta", 
                      "vegetables", "cheese", "tomato", "onion"];
  const cookingMethods = ["grilled", "baked", "fried", "steamed", "roasted"];
  
  return {
    cuisine: cuisines.find((c) => mealLower.includes(c)) || null,
    ingredients: ingredients.filter((i) => mealLower.includes(i)),
    cookingMethods: cookingMethods.filter((m) => mealLower.includes(m)),
  };
}

function generateMealBasedOnPreferences(preferences, mealType = "dinner") {
  const mealTemplates = {
    breakfast: ["Scrambled Eggs with Toast", "Oatmeal with Fruit", "Pancakes"],
    lunch: ["Grilled Chicken Salad", "Sandwich", "Soup and Bread"],
    dinner: ["Grilled Salmon with Rice", "Pasta with Vegetables", "Stir Fry"],
  };
  
  const templates = mealTemplates[mealType] || mealTemplates.dinner;
  return templates[Math.floor(Math.random() * templates.length)];
}
