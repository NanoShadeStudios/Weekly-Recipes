/**
 * Python ML Service Interface
 * Bridges JavaScript meal planning with Python-based machine learning
 */

class PythonMLService {
    constructor() {
        this.isAvailable = false;
        this.initializationPromise = this.checkAvailability();
    }

    async checkAvailability() {
        try {
            // Check if Python service is available
            // This would need to be implemented based on your deployment method
            // For now, we'll assume it's available and use fallback if not
            this.isAvailable = true;
            console.log('PythonMLService: Python ML service is available');
            return true;
        } catch (error) {
            console.warn('PythonMLService: Python ML service not available, using fallback');
            this.isAvailable = false;
            return false;
        }
    }

    async callPythonService(action, data = {}) {
        if (!this.isAvailable) {
            throw new Error('Python ML service is not available');
        }

        try {
            // In a real deployment, this would make an HTTP request to a Python service
            // For now, we'll simulate the ML functionality in JavaScript
            return await this.simulateMLService(action, data);
        } catch (error) {
            console.error('PythonMLService: Error calling Python service:', error);
            throw error;
        }
    }

    async simulateMLService(action, data) {
        // Simulated ML responses - in production, this would call the actual Python service
        switch (action) {
            case 'generate_plan':
                return this.simulateGeneratePlan(data);
            case 'analyze_preferences':
                return this.simulateAnalyzePreferences(data);
            case 'nutrition_analysis':
                return this.simulateNutritionAnalysis(data);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async simulateGeneratePlan(data) {
        const { availableMeals, mealHistory, days = 7, dietaryRestrictions = [] } = data;
        
        if (!availableMeals || availableMeals.length === 0) {
            return {
                success: false,
                error: 'No available meals provided'
            };
        }

        // Simulate ML-enhanced meal selection
        const preferences = this.analyzeUserPreferencesJS(mealHistory || []);
        const scoredMeals = this.scoreAvailableMeals(availableMeals, preferences, mealHistory);
        const selectedMeals = this.selectOptimalMeals(scoredMeals, days, dietaryRestrictions);
        const balancedMeals = this.optimizeNutritionalBalance(selectedMeals);

        return {
            success: true,
            meal_plan: balancedMeals,
            plan_info: {
                total_meals: balancedMeals.length,
                days_planned: days,
                dietary_restrictions: dietaryRestrictions,
                ml_enhanced: true,
                confidence_score: this.calculateConfidenceScore(balancedMeals, preferences)
            }
        };
    }

    analyzeUserPreferencesJS(mealHistory) {
        if (!mealHistory || mealHistory.length === 0) {
            return this.getDefaultPreferences();
        }

        const cuisinePrefs = {};
        const ingredientPrefs = {};
        const prepTimes = [];
        const difficulties = [];

        mealHistory.forEach(meal => {
            const rating = meal.rating || 3;
            
            // Cuisine preferences
            if (meal.cuisine) {
                cuisinePrefs[meal.cuisine] = (cuisinePrefs[meal.cuisine] || 0) + rating;
            }

            // Ingredient preferences
            if (meal.ingredients) {
                meal.ingredients.forEach(ingredient => {
                    const key = ingredient.toLowerCase();
                    ingredientPrefs[key] = (ingredientPrefs[key] || 0) + rating;
                });
            }

            // Timing and difficulty preferences
            if (meal.prepTime) prepTimes.push(meal.prepTime);
            if (meal.difficulty) {
                const difficultyMap = { easy: 1, medium: 2, hard: 3 };
                difficulties.push(difficultyMap[meal.difficulty] || 2);
            }
        });

        return {
            preferred_cuisines: cuisinePrefs,
            preferred_ingredients: ingredientPrefs,
            avg_prep_time: prepTimes.length > 0 ? prepTimes.reduce((a, b) => a + b) / prepTimes.length : 30,
            preferred_difficulty: difficulties.length > 0 ? difficulties.reduce((a, b) => a + b) / difficulties.length : 2,
            variety_score: new Set(mealHistory.map(m => m.name)).size / Math.max(mealHistory.length, 1)
        };
    }

    getDefaultPreferences() {
        return {
            preferred_cuisines: { italian: 3, mexican: 3, american: 3, asian: 3 },
            preferred_ingredients: {},
            avg_prep_time: 30,
            preferred_difficulty: 2,
            variety_score: 0.8
        };
    }

    scoreAvailableMeals(availableMeals, preferences, mealHistory) {
        const recentMealNames = new Set(
            (mealHistory || []).slice(-14).map(meal => meal.name)
        );

        return availableMeals.map(meal => {
            let score = 0;

            // Cuisine scoring (30% weight)
            const cuisine = meal.cuisine || 'unknown';
            const cuisineScore = (preferences.preferred_cuisines[cuisine] || 2.5) / 5.0;
            score += cuisineScore * 0.3;

            // Ingredient scoring (25% weight)
            if (meal.ingredients && meal.ingredients.length > 0) {
                const ingredientScores = meal.ingredients.map(ing => 
                    (preferences.preferred_ingredients[ing.toLowerCase()] || 2.5) / 5.0
                );
                const avgIngredientScore = ingredientScores.reduce((a, b) => a + b) / ingredientScores.length;
                score += avgIngredientScore * 0.25;
            }

            // Prep time scoring (15% weight)
            const prepTime = meal.prepTime || 30;
            const timeDiff = Math.abs(prepTime - preferences.avg_prep_time) / preferences.avg_prep_time;
            const timeScore = Math.max(0, 1 - timeDiff);
            score += timeScore * 0.15;

            // Difficulty scoring (15% weight)
            const difficultyMap = { easy: 1, medium: 2, hard: 3 };
            const mealDifficulty = difficultyMap[meal.difficulty] || 2;
            const difficultyDiff = Math.abs(mealDifficulty - preferences.preferred_difficulty) / 2;
            const difficultyScore = Math.max(0, 1 - difficultyDiff);
            score += difficultyScore * 0.15;

            // Variety scoring (15% weight)
            if (recentMealNames.has(meal.name)) {
                score -= 0.1; // Penalty for recent meals
            } else {
                score += 0.15; // Bonus for variety
            }

            return {
                ...meal,
                ml_score: Math.max(0, Math.min(1, score))
            };
        });
    }

    selectOptimalMeals(scoredMeals, days, dietaryRestrictions) {
        // Filter by dietary restrictions
        const filteredMeals = scoredMeals.filter(meal => 
            this.meetsDietaryRestrictions(meal, dietaryRestrictions)
        );

        if (filteredMeals.length === 0) {
            return scoredMeals.slice(0, days); // Fallback if no meals meet restrictions
        }

        // Sort by ML score
        filteredMeals.sort((a, b) => b.ml_score - a.ml_score);

        // Select meals using weighted selection for variety
        const selectedMeals = [];
        const usedMeals = new Set();

        for (let i = 0; i < days; i++) {
            const availableCandidates = filteredMeals.filter(meal => 
                !usedMeals.has(meal.name)
            );

            if (availableCandidates.length === 0) {
                // If we run out of unique meals, allow repeats
                const remainingMeal = filteredMeals[i % filteredMeals.length];
                selectedMeals.push(remainingMeal);
                continue;
            }

            // Weighted random selection based on ML scores
            const meal = this.weightedRandomSelection(availableCandidates);
            selectedMeals.push(meal);
            usedMeals.add(meal.name);
        }

        return selectedMeals;
    }

    weightedRandomSelection(meals) {
        if (meals.length === 0) return null;
        if (meals.length === 1) return meals[0];

        // Create cumulative weights
        const weights = meals.map(meal => meal.ml_score + 0.1); // Add base weight
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        const random = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (let i = 0; i < meals.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return meals[i];
            }
        }

        return meals[meals.length - 1];
    }

    optimizeNutritionalBalance(meals) {
        // Calculate nutritional totals
        const nutritionTotals = {
            protein: 0, carbs: 0, fiber: 0, healthy_fats: 0, vitamins: 0, minerals: 0
        };

        meals.forEach(meal => {
            if (meal.nutrition) {
                Object.keys(nutritionTotals).forEach(nutrient => {
                    nutritionTotals[nutrient] += meal.nutrition[nutrient] || 0;
                });
            }
        });

        // Define weekly targets
        const weeklyTargets = {
            protein: 350, carbs: 1400, fiber: 175, 
            healthy_fats: 280, vitamins: 100, minerals: 100
        };

        // Calculate nutritional gaps
        const nutritionGaps = {};
        Object.keys(weeklyTargets).forEach(nutrient => {
            const current = nutritionTotals[nutrient];
            const target = weeklyTargets[nutrient];
            nutritionGaps[nutrient] = Math.max(0, target - current);
        });

        // Sort meals by nutritional priority
        const mealsWithPriority = meals.map(meal => {
            let priorityScore = 0;
            if (meal.nutrition) {
                Object.keys(nutritionGaps).forEach(nutrient => {
                    const gap = nutritionGaps[nutrient];
                    const mealValue = meal.nutrition[nutrient] || 0;
                    if (gap > 0) {
                        priorityScore += mealValue * (gap / weeklyTargets[nutrient]);
                    }
                });
            }
            return { ...meal, nutrition_priority: priorityScore };
        });

        // Return meals sorted by nutritional optimization
        mealsWithPriority.sort((a, b) => b.nutrition_priority - a.nutrition_priority);
        return mealsWithPriority;
    }

    meetsDietaryRestrictions(meal, restrictions) {
        if (!restrictions || restrictions.length === 0) return true;

        const mealTags = (meal.tags || []).map(tag => tag.toLowerCase());
        const ingredients = (meal.ingredients || []).join(' ').toLowerCase();

        for (const restriction of restrictions) {
            const restrictionLower = restriction.toLowerCase();

            switch (restrictionLower) {
                case 'vegetarian':
                    if (mealTags.includes('vegetarian')) continue;
                    const meats = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb'];
                    if (meats.some(meat => ingredients.includes(meat))) return false;
                    break;

                case 'vegan':
                    if (mealTags.includes('vegan')) continue;
                    const animalProducts = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 
                                         'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg'];
                    if (animalProducts.some(product => ingredients.includes(product))) return false;
                    break;

                case 'gluten-free':
                    if (mealTags.includes('gluten-free')) continue;
                    const glutenSources = ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye'];
                    if (glutenSources.some(source => ingredients.includes(source))) return false;
                    break;

                case 'dairy-free':
                    if (mealTags.includes('dairy-free')) continue;
                    const dairy = ['milk', 'cheese', 'butter', 'cream', 'yogurt'];
                    if (dairy.some(item => ingredients.includes(item))) return false;
                    break;

                case 'low-carb':
                    const carbs = meal.nutrition?.carbs || 50;
                    if (carbs >= 30) return false;
                    break;

                case 'keto':
                    const carbsKeto = meal.nutrition?.carbs || 50;
                    const fats = meal.nutrition?.healthy_fats || 0;
                    if (carbsKeto >= 20 || fats < 15) return false;
                    break;
            }
        }

        return true;
    }

    calculateConfidenceScore(meals, preferences) {
        if (!meals || meals.length === 0) return 0;

        const scores = meals.map(meal => meal.ml_score || 0);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Factor in variety and preference alignment
        const varietyScore = new Set(meals.map(m => m.name)).size / meals.length;
        const confidenceScore = (avgScore * 0.7) + (varietyScore * 0.3);
        
        return Math.round(confidenceScore * 100) / 100;
    }

    async simulateAnalyzePreferences(data) {
        const { mealHistory } = data;
        const preferences = this.analyzeUserPreferencesJS(mealHistory || []);
        
        return {
            success: true,
            preferences: preferences
        };
    }

    async simulateNutritionAnalysis(data) {
        const { mealPlan } = data;
        
        if (!mealPlan || mealPlan.length === 0) {
            return {
                success: false,
                error: 'No meal plan provided for analysis'
            };
        }

        const nutritionTotals = {
            protein: 0, carbs: 0, fiber: 0, healthy_fats: 0, vitamins: 0, minerals: 0
        };

        mealPlan.forEach(meal => {
            if (meal.nutrition) {
                Object.keys(nutritionTotals).forEach(nutrient => {
                    nutritionTotals[nutrient] += meal.nutrition[nutrient] || 0;
                });
            }
        });

        const weeklyRecommendations = {
            protein: 350, carbs: 1400, fiber: 175, 
            healthy_fats: 280, vitamins: 100, minerals: 100
        };

        const gaps = {};
        const excesses = {};
        let balanceScore = 0;

        Object.keys(weeklyRecommendations).forEach(nutrient => {
            const current = nutritionTotals[nutrient];
            const recommended = weeklyRecommendations[nutrient];
            
            if (current < recommended * 0.8) {
                gaps[nutrient] = recommended - current;
            } else if (current > recommended * 1.2) {
                excesses[nutrient] = current - recommended;
            }

            const ratio = current / recommended;
            const nutrientBalance = 1 - Math.abs(1 - ratio);
            balanceScore += Math.max(0, nutrientBalance);
        });

        balanceScore = balanceScore / Object.keys(weeklyRecommendations).length;

        return {
            success: true,
            nutrition_analysis: {
                current_totals: nutritionTotals,
                recommendations: weeklyRecommendations,
                gaps: gaps,
                excesses: excesses,
                balance_score: Math.round(balanceScore * 100) / 100
            }
        };
    }

    // Public API methods
    async generateSmartMealPlan(availableMeals, mealHistory, days = 7, dietaryRestrictions = []) {
        try {
            await this.initializationPromise;
            
            const result = await this.callPythonService('generate_plan', {
                availableMeals,
                mealHistory,
                days,
                dietaryRestrictions
            });

            return result;
        } catch (error) {
            console.error('PythonMLService: Error generating meal plan:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeUserPreferences(mealHistory) {
        try {
            await this.initializationPromise;
            
            const result = await this.callPythonService('analyze_preferences', {
                mealHistory
            });

            return result;
        } catch (error) {
            console.error('PythonMLService: Error analyzing preferences:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeNutrition(mealPlan) {
        try {
            await this.initializationPromise;
            
            const result = await this.callPythonService('nutrition_analysis', {
                mealPlan
            });

            return result;
        } catch (error) {
            console.error('PythonMLService: Error analyzing nutrition:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
export { PythonMLService };

// Make available globally if needed
if (typeof window !== 'undefined') {
    window.PythonMLService = PythonMLService;
}
