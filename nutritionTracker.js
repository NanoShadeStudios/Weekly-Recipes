/**
 * Nutrition Tracker and Analysis Module
 * Provides comprehensive nutrition tracking, analysis, and recommendations
 * for meal plans with dietary goal tracking and health insights.
 */

/**
 * Main nutrition tracking and analysis class
 */
export class NutritionTracker {
  constructor() {
    // USDA-based nutrition database (simplified)
    this.nutritionDatabase = {
      // Proteins (per 100g)
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, sugar: 0 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, sodium: 72, sugar: 0 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59, sugar: 0 },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124, sugar: 1.1 },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sodium: 7, sugar: 0.6 },
      
      // Carbohydrates (per 100g)
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1, sugar: 0.1 },
      'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sodium: 6, sugar: 0.6 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sodium: 491, sugar: 5 },
      'potatoes': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sodium: 6, sugar: 0.8 },
      'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sodium: 7, sugar: 0.9 },
      
      // Vegetables (per 100g)
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33, sugar: 1.5 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79, sugar: 0.4 },
      'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sodium: 69, sugar: 4.7 },
      'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5, sugar: 2.6 },
      'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sodium: 28, sugar: 0.8 },
      
      // Fruits (per 100g)
      'apples': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sodium: 1, sugar: 10 },
      'bananas': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1, sugar: 12 },
      'berries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sodium: 1, sugar: 10 },
      
      // Dairy (per 100g)
      'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sodium: 44, sugar: 4.8 },
      'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sodium: 215, sugar: 1 },
      'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sodium: 36, sugar: 3.2 }
    };

    // Daily recommended values (based on 2000 calorie diet)
    this.dailyRecommendations = {
      calories: 2000,
      protein: 50,    // grams
      carbs: 300,     // grams  
      fat: 65,        // grams
      fiber: 25,      // grams
      sodium: 2300,   // mg
      sugar: 50       // grams (added sugars)
    };

    // Nutritional goals for different dietary preferences
    this.dietaryGoals = {
      'weight-loss': {
        calories: 1500,
        protein: 60,
        carbs: 150,
        fat: 50,
        fiber: 30,
        sodium: 1500,
        sugar: 25
      },
      'muscle-gain': {
        calories: 2500,
        protein: 80,
        carbs: 350,
        fat: 80,
        fiber: 25,
        sodium: 2300,
        sugar: 40
      },
      'heart-healthy': {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 55,
        fiber: 35,
        sodium: 1500,
        sugar: 30
      },
      'diabetic-friendly': {
        calories: 1800,
        protein: 55,
        carbs: 200,
        fat: 60,
        fiber: 40,
        sodium: 1500,
        sugar: 15
      }
    };
  }

  /**
   * Analyze nutrition for a single meal
   * @param {Object} meal - Meal object with ingredients
   * @returns {Object} Nutrition analysis for the meal
   */
  analyzeMealNutrition(meal) {
    console.log('🔬 Analyzing nutrition for meal:', meal.name);
    
    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      console.warn('No ingredients found for meal:', meal.name);
      return this.getEmptyNutrition();
    }

    let totalNutrition = this.getEmptyNutrition();
    const ingredientAnalysis = [];

    meal.ingredients.forEach(ingredient => {
      const nutrition = this.getIngredientNutrition(ingredient);
      const servingSize = this.estimateServingSize(ingredient, meal.servings || 4);
      
      // Calculate nutrition for serving size
      const servingNutrition = this.scaleNutrition(nutrition, servingSize / 100); // servingSize in grams, nutrition per 100g
      
      // Add to total
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += servingNutrition[key];
      });
      
      ingredientAnalysis.push({
        ingredient,
        nutrition: servingNutrition,
        servingSize
      });
    });

    return {
      totalNutrition,
      ingredientAnalysis,
      mealName: meal.name,
      servings: meal.servings || 4,
      nutritionPerServing: this.scaleNutrition(totalNutrition, 1 / (meal.servings || 4))
    };
  }

  /**
   * Analyze nutrition for entire meal plan
   * @param {Array} mealPlan - Weekly meal plan
   * @returns {Object} Comprehensive nutrition analysis
   */
  analyzeMealPlanNutrition(mealPlan) {
    console.log('📊 Analyzing nutrition for entire meal plan...');
    
    const dailyAnalysis = [];
    let weeklyTotals = this.getEmptyNutrition();
    
    mealPlan.forEach((day, index) => {
      let dailyNutrition = this.getEmptyNutrition();
      const mealAnalyses = [];
      
      day.meals.forEach(meal => {
        const mealObj = typeof meal === 'string' ? this.createMealObject(meal) : meal;
        const mealNutrition = this.analyzeMealNutrition(mealObj);
        
        // Add to daily total
        Object.keys(dailyNutrition).forEach(key => {
          dailyNutrition[key] += mealNutrition.totalNutrition[key];
        });
        
        mealAnalyses.push(mealNutrition);
      });
      
      // Add to weekly total
      Object.keys(weeklyTotals).forEach(key => {
        weeklyTotals[key] += dailyNutrition[key];
      });
      
      dailyAnalysis.push({
        day: index + 1,
        dayName: this.getDayName(index),
        dailyNutrition,
        meals: mealAnalyses,
        recommendations: this.getDailyRecommendations(dailyNutrition)
      });
    });
    
    const weeklyAverages = this.scaleNutrition(weeklyTotals, 1/7);
    
    return {
      dailyAnalysis,
      weeklyTotals,
      weeklyAverages,
      nutritionScore: this.calculateNutritionScore(weeklyAverages),
      recommendations: this.getWeeklyRecommendations(weeklyAverages),
      goals: this.getUserNutritionGoals()
    };
  }

  /**
   * Get nutrition data for an ingredient
   * @param {string} ingredient - Ingredient name
   * @returns {Object} Nutrition data per 100g
   */
  getIngredientNutrition(ingredient) {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Direct match
    if (this.nutritionDatabase[lowerIngredient]) {
      return { ...this.nutritionDatabase[lowerIngredient] };
    }
    
    // Partial match
    for (const [food, nutrition] of Object.entries(this.nutritionDatabase)) {
      if (lowerIngredient.includes(food) || food.includes(lowerIngredient)) {
        return { ...nutrition };
      }
    }
    
    // Default nutrition for unknown ingredients
    console.warn(`Nutrition data not found for: ${ingredient}, using defaults`);
    return { calories: 50, protein: 2, carbs: 8, fat: 1, fiber: 1, sodium: 10, sugar: 2 };
  }

  /**
   * Estimate serving size for an ingredient
   * @param {string} ingredient - Ingredient name
   * @param {number} servings - Number of servings
   * @returns {number} Estimated serving size in grams
   */
  estimateServingSize(ingredient, servings) {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Protein portions (per serving)
    if (['chicken', 'beef', 'fish', 'salmon', 'turkey'].some(meat => lowerIngredient.includes(meat))) {
      return (120 / servings) * servings; // 120g per serving
    }
    
    // Carbohydrate portions
    if (['rice', 'pasta', 'quinoa'].some(carb => lowerIngredient.includes(carb))) {
      return (80 / servings) * servings; // 80g per serving (dry weight)
    }
    
    // Vegetable portions
    if (['broccoli', 'spinach', 'carrots', 'tomatoes'].some(veg => lowerIngredient.includes(veg))) {
      return (100 / servings) * servings; // 100g per serving
    }
    
    // Default portion
    return (75 / servings) * servings; // 75g per serving
  }

  /**
   * Scale nutrition values by a factor
   * @param {Object} nutrition - Nutrition object
   * @param {number} factor - Scaling factor
   * @returns {Object} Scaled nutrition
   */
  scaleNutrition(nutrition, factor) {
    const scaled = {};
    Object.keys(nutrition).forEach(key => {
      scaled[key] = Math.round((nutrition[key] * factor) * 10) / 10; // Round to 1 decimal
    });
    return scaled;
  }

  /**
   * Get empty nutrition object
   * @returns {Object} Empty nutrition values
   */
  getEmptyNutrition() {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0
    };
  }

  /**
   * Create meal object from string
   * @param {string} mealName - Name of the meal
   * @returns {Object} Meal object
   */
  createMealObject(mealName) {
    // Extract ingredients from meal name (simplified)
    const ingredients = this.extractIngredientsFromMealName(mealName);
    return {
      name: mealName,
      ingredients,
      servings: 4
    };
  }

  /**
   * Extract ingredients from meal name
   * @param {string} mealName - Name of the meal
   * @returns {Array} Array of ingredient names
   */
  extractIngredientsFromMealName(mealName) {
    const allIngredients = Object.keys(this.nutritionDatabase);
    const found = [];
    
    const mealLower = mealName.toLowerCase();
    
    allIngredients.forEach(ingredient => {
      if (mealLower.includes(ingredient)) {
        found.push(ingredient.charAt(0).toUpperCase() + ingredient.slice(1));
      }
    });
    
    // Add some common combinations based on meal type
    if (mealLower.includes('salad')) {
      found.push('lettuce', 'tomatoes', 'carrots');
    } else if (mealLower.includes('pasta')) {
      found.push('pasta', 'tomatoes');
    } else if (mealLower.includes('rice')) {
      found.push('rice');
    }
    
    return found.length > 0 ? found : ['chicken', 'rice', 'broccoli']; // Default ingredients
  }

  /**
   * Calculate nutrition score (0-100)
   * @param {Object} nutrition - Average daily nutrition
   * @returns {number} Nutrition score
   */
  calculateNutritionScore(nutrition) {
    const goals = this.getUserNutritionGoals();
    let score = 0;
    let factors = 0;
    
    // Score each nutrient (closer to goal = higher score)
    Object.keys(goals).forEach(nutrient => {
      if (nutrition[nutrient] !== undefined) {
        const ratio = nutrition[nutrient] / goals[nutrient];
        let nutrientScore;
        
        if (nutrient === 'sodium' || nutrient === 'sugar') {
          // Lower is better for sodium and sugar
          nutrientScore = ratio <= 1 ? 100 * (1 - ratio * 0.5) : Math.max(0, 100 - (ratio - 1) * 50);
        } else {
          // Target range scoring (80-120% of goal is optimal)
          if (ratio >= 0.8 && ratio <= 1.2) {
            nutrientScore = 100;
          } else if (ratio >= 0.6 && ratio <= 1.5) {
            nutrientScore = 80;
          } else if (ratio >= 0.4 && ratio <= 2.0) {
            nutrientScore = 60;
          } else {
            nutrientScore = Math.max(0, 40 - Math.abs(ratio - 1) * 20);
          }
        }
        
        score += nutrientScore;
        factors++;
      }
    });
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }

  /**
   * Get daily recommendations based on nutrition
   * @param {Object} dailyNutrition - Day's nutrition totals
   * @returns {Array} Array of recommendation objects
   */
  getDailyRecommendations(dailyNutrition) {
    const recommendations = [];
    const goals = this.getUserNutritionGoals();
    
    // Check protein
    if (dailyNutrition.protein < goals.protein * 0.8) {
      recommendations.push({
        type: 'increase',
        nutrient: 'protein',
        message: '💪 Consider adding more protein-rich foods like chicken, fish, or legumes.',
        priority: 'medium'
      });
    }
    
    // Check fiber
    if (dailyNutrition.fiber < goals.fiber * 0.6) {
      recommendations.push({
        type: 'increase',
        nutrient: 'fiber',
        message: '🥬 Add more fiber with vegetables, fruits, and whole grains.',
        priority: 'high'
      });
    }
    
    // Check sodium
    if (dailyNutrition.sodium > goals.sodium * 1.2) {
      recommendations.push({
        type: 'decrease',
        nutrient: 'sodium',
        message: '🧂 Try to reduce sodium by using herbs and spices instead of salt.',
        priority: 'medium'
      });
    }
    
    // Check calories
    if (dailyNutrition.calories < goals.calories * 0.7) {
      recommendations.push({
        type: 'increase',
        nutrient: 'calories',
        message: '🍽️ You may need more calories to meet your energy needs.',
        priority: 'high'
      });
    } else if (dailyNutrition.calories > goals.calories * 1.3) {
      recommendations.push({
        type: 'decrease',
        nutrient: 'calories',
        message: '⚖️ Consider smaller portions or lighter meal options.',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Get weekly recommendations
   * @param {Object} weeklyAverages - Average daily nutrition for the week
   * @returns {Array} Array of weekly recommendations
   */
  getWeeklyRecommendations(weeklyAverages) {
    const recommendations = [];
    const goals = this.getUserNutritionGoals();
    
    // Macro balance analysis
    const proteinCals = weeklyAverages.protein * 4;
    const carbCals = weeklyAverages.carbs * 4;
    const fatCals = weeklyAverages.fat * 9;
    const totalMacroCals = proteinCals + carbCals + fatCals;
    
    if (totalMacroCals > 0) {
      const proteinPercent = (proteinCals / totalMacroCals) * 100;
      const carbPercent = (carbCals / totalMacroCals) * 100;
      const fatPercent = (fatCals / totalMacroCals) * 100;
      
      if (proteinPercent < 15) {
        recommendations.push({
          type: 'balance',
          message: '🥩 Your protein intake is low. Aim for 15-25% of calories from protein.',
          priority: 'medium'
        });
      }
      
      if (fatPercent > 35) {
        recommendations.push({
          type: 'balance',
          message: '🥑 Consider reducing fat intake to 20-35% of total calories.',
          priority: 'medium'
        });
      }
    }
    
    // Weekly variety recommendation
    recommendations.push({
      type: 'variety',
      message: '🌈 Try to include a variety of colorful fruits and vegetables throughout the week.',
      priority: 'low'
    });
    
    return recommendations;
  }

  /**
   * Get user's nutrition goals
   * @returns {Object} Current nutrition goals
   */
  getUserNutritionGoals() {
    const savedGoal = localStorage.getItem('nutritionGoal');
    if (savedGoal && this.dietaryGoals[savedGoal]) {
      return this.dietaryGoals[savedGoal];
    }
    return this.dailyRecommendations;
  }

  /**
   * Set user's nutrition goal
   * @param {string} goalType - Type of goal (weight-loss, muscle-gain, etc.)
   */
  setNutritionGoal(goalType) {
    if (this.dietaryGoals[goalType]) {
      localStorage.setItem('nutritionGoal', goalType);
      console.log(`Nutrition goal set to: ${goalType}`);
    }
  }

  /**
   * Get day name by index
   * @param {number} index - Day index (0-6)
   * @returns {string} Day name
   */
  getDayName(index) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index] || `Day ${index + 1}`;
  }

  /**
   * Save nutrition analysis to history
   * @param {Object} analysis - Nutrition analysis data
   */
  saveNutritionAnalysis(analysis) {
    const history = JSON.parse(localStorage.getItem('nutritionHistory') || '[]');
    
    const analysisEntry = {
      ...analysis,
      id: Date.now(),
      savedDate: new Date().toISOString(),
      goalType: localStorage.getItem('nutritionGoal') || 'default'
    };
    
    history.unshift(analysisEntry);
    
    // Keep only last 10 analyses
    if (history.length > 10) {
      history.splice(10);
    }
    
    localStorage.setItem('nutritionHistory', JSON.stringify(history));
  }

  /**
   * Get nutrition analysis history
   * @returns {Array} Historical nutrition analyses
   */
  getNutritionHistory() {
    return JSON.parse(localStorage.getItem('nutritionHistory') || '[]');
  }

  /**
   * Generate nutrition insights and trends
   * @returns {Object} Nutrition insights
   */
  generateNutritionInsights() {
    const history = this.getNutritionHistory();
    
    if (history.length < 2) {
      return {
        trends: [],
        insights: ['📊 Track more meal plans to see nutrition trends and insights!']
      };
    }
    
    const trends = [];
    const insights = [];
    
    // Analyze trends over time
    const recent = history.slice(0, 3);
    const avgCalories = recent.reduce((sum, analysis) => sum + analysis.weeklyAverages.calories, 0) / recent.length;
    const avgProtein = recent.reduce((sum, analysis) => sum + analysis.weeklyAverages.protein, 0) / recent.length;
    const avgScore = recent.reduce((sum, analysis) => sum + analysis.nutritionScore, 0) / recent.length;
    
    // Score trend
    if (recent.length >= 2) {
      const scoreChange = recent[0].nutritionScore - recent[1].nutritionScore;
      if (scoreChange > 5) {
        insights.push('📈 Your nutrition score is improving! Keep up the great work.');
      } else if (scoreChange < -5) {
        insights.push('📉 Your nutrition score has decreased. Consider reviewing your meal choices.');
      }
    }
    
    // Protein trend
    const goals = this.getUserNutritionGoals();
    if (avgProtein < goals.protein * 0.8) {
      insights.push('💪 You consistently need more protein in your diet.');
    }
    
    return {
      trends,
      insights,
      averages: {
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein * 10) / 10,
        score: Math.round(avgScore)
      }
    };
  }
}

// Export singleton instance
export const nutritionTracker = new NutritionTracker();
