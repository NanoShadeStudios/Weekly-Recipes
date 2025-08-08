/**
 * Enhanced AI Recommendation Engine
 * Advanced recommendation system with cuisine preference learning, seasonal suggestions,
 * cooking skill adaptation, and time-based meal recommendations.
 */

export class EnhancedAIRecommendationEngine {
    constructor() {
        this.userPreferences = this.loadUserPreferences();
        this.cuisineWeights = new Map();
        this.seasonalPatterns = new Map();
        this.skillLevelData = new Map();
        this.timeBasedPreferences = new Map();
        this.recipeComplexityDatabase = new Map();
        
        // Learning parameters
        this.learningRate = 0.1;
        this.decayFactor = 0.95;
        this.seasonalWeight = 0.3;
        this.timeWeight = 0.25;
        this.skillWeight = 0.2;
        
        this.initializeRecommendationEngine();
        console.log('Enhanced AI Recommendation Engine initialized');
    }

    /**
     * Initialize the recommendation engine with default data
     */
    initializeRecommendationEngine() {
        this.loadCuisineDatabase();
        this.loadSeasonalIngredients();
        this.loadRecipeComplexityData();
        this.initializeUserSkillAssessment();
        this.setupTimeBasedCategories();
    }

    /**
     * Load comprehensive cuisine preference database
     */
    loadCuisineDatabase() {
        const cuisineData = {
            'Italian': {
                characteristics: ['pasta', 'tomatoes', 'basil', 'mozzarella', 'olive oil', 'garlic'],
                spiceLevel: 'mild',
                cookingMethods: ['sautéing', 'baking', 'grilling'],
                popularIngredients: ['parmesan', 'oregano', 'rosemary', 'balsamic vinegar']
            },
            'Mexican': {
                characteristics: ['cilantro', 'lime', 'cumin', 'chili peppers', 'avocado', 'beans'],
                spiceLevel: 'medium-hot',
                cookingMethods: ['grilling', 'sautéing', 'roasting'],
                popularIngredients: ['jalapeños', 'onions', 'tomatoes', 'corn']
            },
            'Asian': {
                characteristics: ['soy sauce', 'ginger', 'garlic', 'rice', 'sesame oil', 'green onions'],
                spiceLevel: 'mild-medium',
                cookingMethods: ['stir-frying', 'steaming', 'braising'],
                popularIngredients: ['mushrooms', 'bok choy', 'tofu', 'noodles']
            },
            'Mediterranean': {
                characteristics: ['olive oil', 'lemon', 'herbs', 'olives', 'feta cheese', 'fish'],
                spiceLevel: 'mild',
                cookingMethods: ['grilling', 'roasting', 'braising'],
                popularIngredients: ['cucumber', 'tomatoes', 'chickpeas', 'yogurt']
            },
            'Indian': {
                characteristics: ['curry spices', 'turmeric', 'cumin', 'coriander', 'garam masala', 'rice'],
                spiceLevel: 'medium-hot',
                cookingMethods: ['sautéing', 'simmering', 'roasting'],
                popularIngredients: ['onions', 'garlic', 'ginger', 'coconut milk']
            },
            'American': {
                characteristics: ['ground beef', 'cheese', 'potatoes', 'bacon', 'barbecue sauce'],
                spiceLevel: 'mild',
                cookingMethods: ['grilling', 'frying', 'baking'],
                popularIngredients: ['lettuce', 'tomatoes', 'onions', 'corn']
            },
            'French': {
                characteristics: ['butter', 'cream', 'wine', 'herbs', 'cheese', 'onions'],
                spiceLevel: 'mild',
                cookingMethods: ['braising', 'sautéing', 'roasting'],
                popularIngredients: ['mushrooms', 'garlic', 'thyme', 'bay leaves']
            }
        };

        for (const [cuisine, data] of Object.entries(cuisineData)) {
            this.cuisineWeights.set(cuisine, {
                preference: 0.5, // Neutral starting point
                characteristics: data.characteristics,
                spiceLevel: data.spiceLevel,
                cookingMethods: data.cookingMethods,
                popularIngredients: data.popularIngredients,
                timesRecommended: 0,
                timesAccepted: 0,
                lastRecommended: null
            });
        }
    }

    /**
     * Load seasonal ingredient patterns
     */
    loadSeasonalIngredients() {
        const seasonalData = {
            'Spring': {
                ingredients: ['asparagus', 'artichokes', 'peas', 'spring onions', 'lettuce', 'radishes', 'strawberries'],
                characteristics: ['fresh', 'light', 'green vegetables', 'citrus'],
                recommendationBoost: 1.2
            },
            'Summer': {
                ingredients: ['tomatoes', 'zucchini', 'corn', 'berries', 'peaches', 'cucumbers', 'basil'],
                characteristics: ['grilled', 'cold dishes', 'salads', 'fresh fruits'],
                recommendationBoost: 1.3
            },
            'Fall': {
                ingredients: ['pumpkin', 'squash', 'apples', 'Brussels sprouts', 'sweet potatoes', 'cranberries'],
                characteristics: ['roasted', 'hearty', 'warm spices', 'comfort food'],
                recommendationBoost: 1.1
            },
            'Winter': {
                ingredients: ['root vegetables', 'citrus fruits', 'cabbage', 'potatoes', 'onions', 'garlic'],
                characteristics: ['stews', 'soups', 'braised dishes', 'warming spices'],
                recommendationBoost: 1.0
            }
        };

        for (const [season, data] of Object.entries(seasonalData)) {
            this.seasonalPatterns.set(season, data);
        }
    }

    /**
     * Load recipe complexity and skill level data
     */
    loadRecipeComplexityData() {
        const complexityLevels = {
            'Beginner': {
                maxIngredients: 8,
                maxSteps: 5,
                maxCookTime: 30,
                techniques: ['boiling', 'baking', 'simple sautéing'],
                equipmentRequired: ['basic pots', 'oven', 'stovetop'],
                difficultyScore: 1
            },
            'Intermediate': {
                maxIngredients: 12,
                maxSteps: 8,
                maxCookTime: 60,
                techniques: ['braising', 'roasting', 'marinating', 'knife skills'],
                equipmentRequired: ['cast iron', 'thermometer', 'multiple pans'],
                difficultyScore: 2
            },
            'Advanced': {
                maxIngredients: 15,
                maxSteps: 12,
                maxCookTime: 120,
                techniques: ['sous vide', 'fermentation', 'complex sauces', 'pastry'],
                equipmentRequired: ['specialized tools', 'food processor', 'stand mixer'],
                difficultyScore: 3
            },
            'Expert': {
                maxIngredients: 20,
                maxSteps: 20,
                maxCookTime: 180,
                techniques: ['molecular gastronomy', 'advanced pastry', 'charcuterie'],
                equipmentRequired: ['professional equipment', 'specialized tools'],
                difficultyScore: 4
            }
        };

        for (const [level, data] of Object.entries(complexityLevels)) {
            this.skillLevelData.set(level, data);
        }
    }

    /**
     * Initialize user skill assessment
     */
    initializeUserSkillAssessment() {
        const defaultSkillProfile = {
            currentLevel: 'Beginner',
            experiencePoints: 0,
            successfulRecipes: 0,
            failedRecipes: 0,
            preferredTechniques: [],
            avoidedTechniques: [],
            timePreferences: {
                weekday: 30, // max minutes
                weekend: 60  // max minutes
            },
            equipmentAvailable: ['basic pots', 'oven', 'stovetop', 'microwave']
        };

        this.userSkillProfile = this.loadFromStorage('userSkillProfile') || defaultSkillProfile;
    }

    /**
     * Setup time-based meal categories
     */
    setupTimeBasedCategories() {
        const timeCategories = {
            'Quick Weekday': {
                maxTime: 30,
                characteristics: ['one-pot', 'minimal prep', 'simple techniques'],
                preferredMealtimes: ['dinner', 'lunch'],
                urgency: 'high',
                complexityLimit: 'Beginner'
            },
            'Weekend Cooking': {
                maxTime: 90,
                characteristics: ['elaborate', 'multiple components', 'advanced techniques'],
                preferredMealtimes: ['dinner', 'brunch'],
                urgency: 'low',
                complexityLimit: 'Advanced'
            },
            'Meal Prep': {
                maxTime: 60,
                characteristics: ['batch cooking', 'freezer-friendly', 'reheatable'],
                preferredMealtimes: ['lunch', 'dinner'],
                urgency: 'medium',
                complexityLimit: 'Intermediate'
            },
            'Special Occasion': {
                maxTime: 120,
                characteristics: ['impressive', 'restaurant-quality', 'complex flavors'],
                preferredMealtimes: ['dinner'],
                urgency: 'low',
                complexityLimit: 'Expert'
            },
            'Breakfast Quick': {
                maxTime: 15,
                characteristics: ['minimal cooking', 'grab-and-go', 'nutritious'],
                preferredMealtimes: ['breakfast'],
                urgency: 'high',
                complexityLimit: 'Beginner'
            }
        };

        for (const [category, data] of Object.entries(timeCategories)) {
            this.timeBasedPreferences.set(category, {
                ...data,
                usageCount: 0,
                lastUsed: null,
                userRating: 0.5
            });
        }
    }

    /**
     * Generate enhanced AI recommendations based on multiple factors
     */
    async generateEnhancedRecommendations(context = {}) {
        console.log('🧠 Generating enhanced AI recommendations...');
        
        const {
            mealType = 'dinner',
            timeAvailable = 30,
            currentSeason = this.getCurrentSeason(),
            dayType = this.getDayType(),
            availableIngredients = [],
            dietaryRestrictions = [],
            groupSize = 1
        } = context;

        try {
            // Get base food database
            const foods = window.foodsArr || [];
            
            // Generate scoring for each food item
            const scoredRecommendations = foods.map(food => {
                const score = this.calculateRecommendationScore(food, {
                    mealType,
                    timeAvailable,
                    currentSeason,
                    dayType,
                    availableIngredients,
                    dietaryRestrictions,
                    groupSize
                });
                
                return {
                    ...food,
                    aiScore: score,
                    reasoning: this.generateRecommendationReasoning(food, score, context)
                };
            });

            // Sort by AI score and return top recommendations
            const topRecommendations = scoredRecommendations
                .sort((a, b) => b.aiScore - a.aiScore)
                .slice(0, 10);

            // Learn from current preferences
            this.updateLearningFromRecommendations(topRecommendations, context);

            return {
                recommendations: topRecommendations,
                context: context,
                explanations: this.generateContextualExplanations(context),
                alternativeSuggestions: this.generateAlternativeSuggestions(context)
            };

        } catch (error) {
            console.error('Enhanced recommendation generation failed:', error);
            return this.getFallbackRecommendations();
        }
    }

    /**
     * Calculate comprehensive recommendation score
     */
    calculateRecommendationScore(food, context) {
        let baseScore = 0.5;
        const factors = [];

        // Cuisine preference factor
        const cuisineScore = this.calculateCuisineScore(food);
        baseScore += cuisineScore * 0.25;
        factors.push({ factor: 'cuisine', score: cuisineScore, weight: 0.25 });

        // Seasonal factor
        const seasonalScore = this.calculateSeasonalScore(food, context.currentSeason);
        baseScore += seasonalScore * this.seasonalWeight;
        factors.push({ factor: 'seasonal', score: seasonalScore, weight: this.seasonalWeight });

        // Time-based factor
        const timeScore = this.calculateTimeBasedScore(food, context);
        baseScore += timeScore * this.timeWeight;
        factors.push({ factor: 'time', score: timeScore, weight: this.timeWeight });

        // Skill level factor
        const skillScore = this.calculateSkillLevelScore(food);
        baseScore += skillScore * this.skillWeight;
        factors.push({ factor: 'skill', score: skillScore, weight: this.skillWeight });

        // User preference history
        const historyScore = this.calculateUserHistoryScore(food);
        baseScore += historyScore * 0.15;
        factors.push({ factor: 'history', score: historyScore, weight: 0.15 });

        // Ingredient availability
        const availabilityScore = this.calculateIngredientAvailabilityScore(food, context.availableIngredients);
        baseScore += availabilityScore * 0.1;
        factors.push({ factor: 'availability', score: availabilityScore, weight: 0.1 });

        // Dietary restrictions compliance
        const dietaryScore = this.calculateDietaryComplianceScore(food, context.dietaryRestrictions);
        baseScore += dietaryScore * 0.05;
        factors.push({ factor: 'dietary', score: dietaryScore, weight: 0.05 });

        // Store factor breakdown for reasoning
        food.scoringFactors = factors;

        return Math.max(0, Math.min(1, baseScore));
    }

    /**
     * Calculate cuisine preference score
     */
    calculateCuisineScore(food) {
        const detectedCuisine = this.detectFoodCuisine(food);
        if (!detectedCuisine) return 0.5;

        const cuisineData = this.cuisineWeights.get(detectedCuisine);
        if (!cuisineData) return 0.5;

        return cuisineData.preference;
    }

    /**
     * Detect cuisine type from food characteristics
     */
    detectFoodCuisine(food) {
        const foodName = food.name.toLowerCase();
        const foodIngredients = (food.ingredients || []).map(ing => ing.toLowerCase());

        for (const [cuisine, data] of this.cuisineWeights.entries()) {
            const matchingCharacteristics = data.characteristics.filter(char => 
                foodName.includes(char.toLowerCase()) || 
                foodIngredients.some(ing => ing.includes(char.toLowerCase()))
            );

            if (matchingCharacteristics.length >= 2) {
                return cuisine;
            }
        }

        return null;
    }

    /**
     * Calculate seasonal appropriateness score
     */
    calculateSeasonalScore(food, season) {
        const seasonalData = this.seasonalPatterns.get(season);
        if (!seasonalData) return 0.5;

        const foodName = food.name.toLowerCase();
        const foodIngredients = (food.ingredients || []).map(ing => ing.toLowerCase());

        const matchingIngredients = seasonalData.ingredients.filter(ingredient =>
            foodName.includes(ingredient.toLowerCase()) ||
            foodIngredients.some(ing => ing.includes(ingredient.toLowerCase()))
        );

        const characteristicMatches = seasonalData.characteristics.filter(char =>
            foodName.includes(char.toLowerCase()) ||
            (food.description && food.description.toLowerCase().includes(char.toLowerCase()))
        );

        const ingredientScore = matchingIngredients.length / seasonalData.ingredients.length;
        const characteristicScore = characteristicMatches.length / seasonalData.characteristics.length;

        return (ingredientScore + characteristicScore) / 2 * seasonalData.recommendationBoost;
    }

    /**
     * Calculate time-based appropriateness score
     */
    calculateTimeBasedScore(food, context) {
        const { timeAvailable, dayType, mealType } = context;
        const estimatedTime = this.estimateCookingTime(food);

        let timeScore = 0.5;

        // Time availability match
        if (estimatedTime <= timeAvailable) {
            timeScore += 0.3;
        } else {
            timeScore -= 0.2;
        }

        // Day type appropriateness
        const timeCategory = this.determineTimeCategory(timeAvailable, dayType);
        const categoryData = this.timeBasedPreferences.get(timeCategory);
        
        if (categoryData) {
            const matchingCharacteristics = categoryData.characteristics.filter(char =>
                food.name.toLowerCase().includes(char) ||
                (food.description && food.description.toLowerCase().includes(char))
            );
            
            timeScore += (matchingCharacteristics.length / categoryData.characteristics.length) * 0.2;
        }

        return Math.max(0, Math.min(1, timeScore));
    }

    /**
     * Calculate skill level appropriateness score
     */
    calculateSkillLevelScore(food) {
        const currentSkill = this.userSkillProfile.currentLevel;
        const skillData = this.skillLevelData.get(currentSkill);
        
        if (!skillData) return 0.5;

        const estimatedComplexity = this.estimateRecipeComplexity(food);
        const ingredientCount = (food.ingredients || []).length;
        const estimatedTime = this.estimateCookingTime(food);

        let skillScore = 0.5;

        // Ingredient count check
        if (ingredientCount <= skillData.maxIngredients) {
            skillScore += 0.2;
        } else {
            skillScore -= 0.1;
        }

        // Time complexity check
        if (estimatedTime <= skillData.maxCookTime) {
            skillScore += 0.2;
        } else {
            skillScore -= 0.1;
        }

        // Complexity level match
        if (estimatedComplexity <= skillData.difficultyScore) {
            skillScore += 0.1;
        } else {
            skillScore -= 0.2;
        }

        return Math.max(0, Math.min(1, skillScore));
    }

    /**
     * Calculate user history and preference score
     */
    calculateUserHistoryScore(food) {
        const preferences = this.userPreferences;
        let historyScore = 0.5;

        // Check liked ingredients
        if (preferences.likedIngredients) {
            const foodIngredients = (food.ingredients || []).map(ing => ing.toLowerCase());
            const likedMatches = preferences.likedIngredients.filter(liked =>
                foodIngredients.some(ing => ing.includes(liked.toLowerCase()))
            );
            historyScore += (likedMatches.length / Math.max(foodIngredients.length, 1)) * 0.3;
        }

        // Check disliked ingredients
        if (preferences.dislikedIngredients) {
            const foodIngredients = (food.ingredients || []).map(ing => ing.toLowerCase());
            const dislikedMatches = preferences.dislikedIngredients.filter(disliked =>
                foodIngredients.some(ing => ing.includes(disliked.toLowerCase()))
            );
            historyScore -= (dislikedMatches.length / Math.max(foodIngredients.length, 1)) * 0.4;
        }

        return Math.max(0, Math.min(1, historyScore));
    }

    /**
     * Calculate ingredient availability score
     */
    calculateIngredientAvailabilityScore(food, availableIngredients) {
        if (!availableIngredients || availableIngredients.length === 0) return 0.5;

        const foodIngredients = (food.ingredients || []).map(ing => ing.toLowerCase());
        const available = availableIngredients.map(ing => ing.toLowerCase());

        const matchingIngredients = foodIngredients.filter(ingredient =>
            available.some(avail => avail.includes(ingredient) || ingredient.includes(avail))
        );

        return matchingIngredients.length / Math.max(foodIngredients.length, 1);
    }

    /**
     * Calculate dietary compliance score
     */
    calculateDietaryComplianceScore(food, dietaryRestrictions) {
        if (!dietaryRestrictions || dietaryRestrictions.length === 0) return 1.0;

        const foodName = food.name.toLowerCase();
        const foodIngredients = (food.ingredients || []).join(' ').toLowerCase();
        const foodDescription = (food.description || '').toLowerCase();
        const fullFoodText = `${foodName} ${foodIngredients} ${foodDescription}`;

        const restrictionViolations = dietaryRestrictions.filter(restriction => {
            const restrictionWords = this.getDietaryRestrictionKeywords(restriction);
            return restrictionWords.some(word => fullFoodText.includes(word.toLowerCase()));
        });

        return restrictionViolations.length === 0 ? 1.0 : 0.0;
    }

    /**
     * Get dietary restriction keywords
     */
    getDietaryRestrictionKeywords(restriction) {
        const keywords = {
            'vegetarian': ['meat', 'beef', 'pork', 'chicken', 'fish', 'seafood'],
            'vegan': ['meat', 'beef', 'pork', 'chicken', 'fish', 'seafood', 'dairy', 'cheese', 'milk', 'eggs'],
            'gluten-free': ['wheat', 'gluten', 'flour', 'bread', 'pasta'],
            'dairy-free': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
            'nut-free': ['nuts', 'peanuts', 'almonds', 'walnuts', 'cashews']
        };

        return keywords[restriction.toLowerCase()] || [];
    }

    /**
     * Helper methods for estimation and calculation
     */
    estimateCookingTime(food) {
        // Basic time estimation based on food characteristics
        const name = food.name.toLowerCase();
        
        if (name.includes('salad') || name.includes('sandwich')) return 10;
        if (name.includes('soup') || name.includes('stew')) return 45;
        if (name.includes('roast') || name.includes('baked')) return 60;
        if (name.includes('pasta') || name.includes('stir')) return 20;
        
        return 30; // Default
    }

    estimateRecipeComplexity(food) {
        const ingredientCount = (food.ingredients || []).length;
        const name = food.name.toLowerCase();
        
        let complexity = 1;
        
        if (ingredientCount > 10) complexity += 1;
        if (ingredientCount > 15) complexity += 1;
        
        if (name.includes('braised') || name.includes('marinated')) complexity += 1;
        if (name.includes('sous vide') || name.includes('molecular')) complexity += 2;
        
        return Math.min(4, complexity);
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Fall';
        return 'Winter';
    }

    getDayType() {
        const day = new Date().getDay();
        return (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    determineTimeCategory(timeAvailable, dayType) {
        if (timeAvailable <= 15) return 'Breakfast Quick';
        if (timeAvailable <= 30 && dayType === 'weekday') return 'Quick Weekday';
        if (timeAvailable <= 60 && dayType === 'weekday') return 'Meal Prep';
        if (timeAvailable <= 90 && dayType === 'weekend') return 'Weekend Cooking';
        return 'Special Occasion';
    }

    /**
     * Generate recommendation reasoning
     */
    generateRecommendationReasoning(food, score, context) {
        const reasons = [];
        
        if (food.scoringFactors) {
            food.scoringFactors.forEach(factor => {
                if (factor.score > 0.7) {
                    switch (factor.factor) {
                        case 'seasonal':
                            reasons.push(`Perfect for ${context.currentSeason.toLowerCase()} season`);
                            break;
                        case 'time':
                            reasons.push(`Great fit for your ${context.timeAvailable}-minute timeframe`);
                            break;
                        case 'skill':
                            reasons.push(`Matches your ${this.userSkillProfile.currentLevel.toLowerCase()} cooking level`);
                            break;
                        case 'cuisine':
                            reasons.push(`Aligns with your cuisine preferences`);
                            break;
                        case 'history':
                            reasons.push(`Based on your previous likes`);
                            break;
                    }
                }
            });
        }
        
        if (reasons.length === 0) {
            reasons.push('A well-rounded choice for your meal');
        }
        
        return reasons;
    }

    /**
     * Update learning from user interactions
     */
    async updateLearningFromRecommendations(recommendations, context) {
        // This would be called when user interacts with recommendations
        recommendations.forEach(rec => {
            const cuisine = this.detectFoodCuisine(rec);
            if (cuisine) {
                const cuisineData = this.cuisineWeights.get(cuisine);
                if (cuisineData) {
                    cuisineData.timesRecommended++;
                    cuisineData.lastRecommended = new Date();
                }
            }
        });
    }

    /**
     * Learn from user feedback (like/dislike)
     */
    async learnFromUserFeedback(food, feedback, context) {
        console.log('🎓 Learning from user feedback:', feedback);
        
        try {
            // Update cuisine preferences
            const cuisine = this.detectFoodCuisine(food);
            if (cuisine) {
                const cuisineData = this.cuisineWeights.get(cuisine);
                if (cuisineData) {
                    if (feedback === 'like') {
                        cuisineData.preference = Math.min(1.0, cuisineData.preference + this.learningRate);
                        cuisineData.timesAccepted++;
                    } else if (feedback === 'dislike') {
                        cuisineData.preference = Math.max(0.0, cuisineData.preference - this.learningRate);
                    }
                }
            }

            // Update skill level based on successful completion
            if (feedback === 'completed_successfully') {
                this.userSkillProfile.successfulRecipes++;
                this.userSkillProfile.experiencePoints += 10;
                this.checkForSkillLevelUp();
            } else if (feedback === 'too_difficult') {
                this.userSkillProfile.failedRecipes++;
                // Add to avoided techniques
                const complexity = this.estimateRecipeComplexity(food);
                if (complexity > 2) {
                    this.userSkillProfile.avoidedTechniques.push(food.name);
                }
            }

            // Update time preferences
            if (context && context.timeAvailable) {
                const timeCategory = this.determineTimeCategory(context.timeAvailable, context.dayType);
                const categoryData = this.timeBasedPreferences.get(timeCategory);
                if (categoryData) {
                    if (feedback === 'like') {
                        categoryData.userRating = Math.min(1.0, categoryData.userRating + this.learningRate);
                    } else if (feedback === 'dislike') {
                        categoryData.userRating = Math.max(0.0, categoryData.userRating - this.learningRate);
                    }
                    categoryData.usageCount++;
                    categoryData.lastUsed = new Date();
                }
            }

            // Save updated preferences
            this.saveUserPreferences();
            this.saveToStorage('userSkillProfile', this.userSkillProfile);

        } catch (error) {
            console.error('Error learning from user feedback:', error);
        }
    }

    /**
     * Check if user should level up in cooking skill
     */
    checkForSkillLevelUp() {
        const currentLevel = this.userSkillProfile.currentLevel;
        const experience = this.userSkillProfile.experiencePoints;
        const successRate = this.userSkillProfile.successfulRecipes / 
                           Math.max(1, this.userSkillProfile.successfulRecipes + this.userSkillProfile.failedRecipes);

        const levelRequirements = {
            'Beginner': { nextLevel: 'Intermediate', expRequired: 100, successRateRequired: 0.7 },
            'Intermediate': { nextLevel: 'Advanced', expRequired: 250, successRateRequired: 0.75 },
            'Advanced': { nextLevel: 'Expert', expRequired: 500, successRateRequired: 0.8 }
        };

        const requirement = levelRequirements[currentLevel];
        if (requirement && experience >= requirement.expRequired && successRate >= requirement.successRateRequired) {
            this.userSkillProfile.currentLevel = requirement.nextLevel;
            console.log(`🎉 Skill level up! Now ${requirement.nextLevel}`);
            
            // Show skill level up notification
            this.showSkillLevelUpNotification(requirement.nextLevel);
        }
    }

    /**
     * Generate contextual explanations
     */
    generateContextualExplanations(context) {
        const explanations = [];
        
        explanations.push({
            type: 'seasonal',
            title: `${context.currentSeason} Seasonal Focus`,
            description: `Recommendations emphasize fresh ${context.currentSeason.toLowerCase()} ingredients and appropriate cooking methods.`
        });
        
        explanations.push({
            type: 'time',
            title: `${context.timeAvailable}-Minute Meals`,
            description: `All suggestions are designed to fit within your available cooking time.`
        });
        
        explanations.push({
            type: 'skill',
            title: `${this.userSkillProfile.currentLevel} Level Cooking`,
            description: `Recipes are matched to your current cooking skill level for the best experience.`
        });
        
        return explanations;
    }

    /**
     * Generate alternative suggestions
     */
    generateAlternativeSuggestions(context) {
        const alternatives = [];
        
        // Quick alternatives
        if (context.timeAvailable > 15) {
            alternatives.push({
                type: 'faster',
                title: 'Quick 15-Minute Options',
                description: 'Need something faster? Try these quick alternatives.'
            });
        }
        
        // Weekend alternatives
        if (context.dayType === 'weekday') {
            alternatives.push({
                type: 'weekend',
                title: 'Save for Weekend',
                description: 'Some great options that would be perfect for weekend cooking.'
            });
        }
        
        // Skill building alternatives
        alternatives.push({
            type: 'skill_building',
            title: 'Skill Building Options',
            description: 'Try these recipes to develop new cooking techniques.'
        });
        
        return alternatives;
    }

    /**
     * Storage and utility methods
     */
    loadUserPreferences() {
        const defaultPreferences = {
            likedIngredients: [],
            dislikedIngredients: [],
            preferredCuisines: [],
            avoidedCuisines: [],
            dietaryRestrictions: [],
            spicePreference: 'medium'
        };
        
        return this.loadFromStorage('enhancedAIPreferences') || defaultPreferences;
    }

    saveUserPreferences() {
        this.saveToStorage('enhancedAIPreferences', this.userPreferences);
        
        // Also save cuisine weights
        const cuisineWeightsObject = {};
        for (const [cuisine, data] of this.cuisineWeights.entries()) {
            cuisineWeightsObject[cuisine] = data;
        }
        this.saveToStorage('cuisineWeights', cuisineWeightsObject);
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    }

    getFallbackRecommendations() {
        return {
            recommendations: [],
            context: {},
            explanations: [{ type: 'error', title: 'Error', description: 'Unable to generate AI recommendations' }],
            alternativeSuggestions: []
        };
    }

    showSkillLevelUpNotification(newLevel) {
        // This would trigger a UI notification
        if (window.showNotification) {
            window.showNotification(`🎉 Congratulations! You've reached ${newLevel} cooking level!`, 'success');
        }
    }
}

// Export singleton instance
export const enhancedAIRecommendationEngine = new EnhancedAIRecommendationEngine();
