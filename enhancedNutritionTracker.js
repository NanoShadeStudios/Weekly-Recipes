/**
 * Enhanced Nutrition Goals Tracking System
 * Provides personalized nutrition goal setting, progress tracking, and analytics
 */

export class EnhancedNutritionTracker {
    constructor() {
        this.userId = null;
        this.userProfile = null;
        this.nutritionGoals = {};
        this.nutritionHistory = [];
        this.progressData = {};
        this.achievements = [];
        
        // Enhanced nutrition database with micronutrients
        this.enhancedNutritionDatabase = {
            // Proteins with enhanced data
            'chicken_breast': { 
                calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, sugar: 0,
                vitaminA: 6, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.27, vitaminK: 0.4,
                calcium: 15, iron: 1, magnesium: 29, potassium: 256, zinc: 1,
                omega3: 0.06, omega6: 0.8, cholesterol: 85
            },
            'salmon': {
                calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59, sugar: 0,
                vitaminA: 12, vitaminC: 0, vitaminD: 11, vitaminE: 1.2, vitaminK: 0.1,
                calcium: 9, iron: 0.25, magnesium: 30, potassium: 363, zinc: 0.64,
                omega3: 2.3, omega6: 0.9, cholesterol: 59
            },
            'tofu': {
                calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sodium: 7, sugar: 0.6,
                vitaminA: 0, vitaminC: 0.1, vitaminD: 0, vitaminE: 0.04, vitaminK: 2.4,
                calcium: 350, iron: 5.4, magnesium: 30, potassium: 121, zinc: 0.8,
                omega3: 0.6, omega6: 2.7, cholesterol: 0
            },
            
            // Vegetables with enhanced data
            'broccoli': {
                calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33, sugar: 1.5,
                vitaminA: 31, vitaminC: 89, vitaminD: 0, vitaminE: 0.78, vitaminK: 102,
                calcium: 47, iron: 0.73, magnesium: 21, potassium: 316, zinc: 0.41,
                omega3: 0.1, omega6: 0.1, cholesterol: 0
            },
            'spinach': {
                calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79, sugar: 0.4,
                vitaminA: 469, vitaminC: 28, vitaminD: 0, vitaminE: 2, vitaminK: 483,
                calcium: 99, iron: 2.7, magnesium: 79, potassium: 558, zinc: 0.53,
                omega3: 0.1, omega6: 0.03, cholesterol: 0
            },
            'kale': {
                calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 3.6, sodium: 38, sugar: 2.3,
                vitaminA: 681, vitaminC: 120, vitaminD: 0, vitaminE: 1.5, vitaminK: 705,
                calcium: 150, iron: 1.5, magnesium: 47, potassium: 491, zinc: 0.56,
                omega3: 0.18, omega6: 0.14, cholesterol: 0
            },
            
            // Fruits with enhanced data
            'blueberries': {
                calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sodium: 1, sugar: 10,
                vitaminA: 3, vitaminC: 10, vitaminD: 0, vitaminE: 0.57, vitaminK: 19,
                calcium: 6, iron: 0.28, magnesium: 6, potassium: 77, zinc: 0.16,
                omega3: 0.06, omega6: 0.09, cholesterol: 0
            },
            'avocado': {
                calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sodium: 7, sugar: 0.7,
                vitaminA: 7, vitaminC: 10, vitaminD: 0, vitaminE: 2.1, vitaminK: 21,
                calcium: 12, iron: 0.55, magnesium: 29, potassium: 485, zinc: 0.64,
                omega3: 0.11, omega6: 1.7, cholesterol: 0
            },
            
            // Whole grains with enhanced data
            'quinoa': {
                calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sodium: 7, sugar: 0.9,
                vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.63, vitaminK: 0,
                calcium: 17, iron: 1.5, magnesium: 64, potassium: 172, zinc: 1.1,
                omega3: 0.09, omega6: 0.97, cholesterol: 0
            },
            'brown_rice': {
                calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sodium: 5, sugar: 0.4,
                vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.05, vitaminK: 0.9,
                calcium: 23, iron: 0.4, magnesium: 43, potassium: 43, zinc: 0.6,
                omega3: 0.01, omega6: 0.34, cholesterol: 0
            }
        };

        // Comprehensive goal templates for different user profiles
        this.goalTemplates = {
            'weight_loss': {
                name: 'Weight Loss',
                description: 'Sustainable weight loss with balanced nutrition',
                targets: {
                    calories: { min: 1200, target: 1500, max: 1800 },
                    protein: { min: 70, target: 90, max: 120 },
                    carbs: { min: 100, target: 150, max: 200 },
                    fat: { min: 40, target: 55, max: 70 },
                    fiber: { min: 25, target: 35, max: 45 },
                    sodium: { min: 1000, target: 1500, max: 2000 },
                    sugar: { min: 15, target: 25, max: 35 }
                },
                micronutrients: {
                    vitaminC: { min: 75, target: 90, max: 120 },
                    vitaminD: { min: 15, target: 20, max: 25 },
                    calcium: { min: 800, target: 1000, max: 1200 },
                    iron: { min: 15, target: 18, max: 25 },
                    magnesium: { min: 300, target: 400, max: 500 },
                    potassium: { min: 3000, target: 3500, max: 4000 }
                }
            },
            'muscle_gain': {
                name: 'Muscle Building',
                description: 'High protein intake for lean muscle development',
                targets: {
                    calories: { min: 2200, target: 2700, max: 3200 },
                    protein: { min: 100, target: 140, max: 180 },
                    carbs: { min: 250, target: 350, max: 450 },
                    fat: { min: 70, target: 90, max: 110 },
                    fiber: { min: 25, target: 35, max: 45 },
                    sodium: { min: 1500, target: 2000, max: 2500 },
                    sugar: { min: 30, target: 50, max: 70 }
                },
                micronutrients: {
                    vitaminC: { min: 90, target: 120, max: 150 },
                    vitaminD: { min: 15, target: 25, max: 35 },
                    calcium: { min: 1000, target: 1200, max: 1500 },
                    iron: { min: 15, target: 20, max: 30 },
                    magnesium: { min: 400, target: 500, max: 600 },
                    potassium: { min: 3500, target: 4000, max: 4500 }
                }
            },
            'heart_healthy': {
                name: 'Heart Health',
                description: 'Cardiovascular-focused nutrition plan',
                targets: {
                    calories: { min: 1600, target: 2000, max: 2400 },
                    protein: { min: 50, target: 70, max: 90 },
                    carbs: { min: 200, target: 275, max: 350 },
                    fat: { min: 45, target: 65, max: 85 },
                    fiber: { min: 30, target: 40, max: 50 },
                    sodium: { min: 800, target: 1200, max: 1500 },
                    sugar: { min: 15, target: 25, max: 35 }
                },
                micronutrients: {
                    vitaminC: { min: 75, target: 100, max: 125 },
                    vitaminD: { min: 15, target: 20, max: 25 },
                    calcium: { min: 800, target: 1000, max: 1200 },
                    iron: { min: 10, target: 15, max: 20 },
                    magnesium: { min: 350, target: 450, max: 550 },
                    potassium: { min: 3500, target: 4000, max: 4700 },
                    omega3: { min: 1, target: 2, max: 3 }
                }
            },
            'diabetes_management': {
                name: 'Diabetes Management',
                description: 'Blood sugar-conscious nutrition plan',
                targets: {
                    calories: { min: 1400, target: 1800, max: 2200 },
                    protein: { min: 60, target: 80, max: 100 },
                    carbs: { min: 120, target: 180, max: 240 },
                    fat: { min: 50, target: 70, max: 90 },
                    fiber: { min: 35, target: 45, max: 55 },
                    sodium: { min: 1000, target: 1500, max: 2000 },
                    sugar: { min: 10, target: 20, max: 30 }
                },
                micronutrients: {
                    vitaminC: { min: 75, target: 90, max: 110 },
                    vitaminD: { min: 15, target: 20, max: 25 },
                    calcium: { min: 800, target: 1000, max: 1200 },
                    iron: { min: 15, target: 18, max: 25 },
                    magnesium: { min: 350, target: 450, max: 550 },
                    potassium: { min: 3000, target: 3500, max: 4000 }
                }
            },
            'athletic_performance': {
                name: 'Athletic Performance',
                description: 'Optimized nutrition for active individuals',
                targets: {
                    calories: { min: 2500, target: 3200, max: 4000 },
                    protein: { min: 120, target: 160, max: 200 },
                    carbs: { min: 350, target: 500, max: 650 },
                    fat: { min: 80, target: 110, max: 140 },
                    fiber: { min: 30, target: 40, max: 50 },
                    sodium: { min: 2000, target: 2500, max: 3000 },
                    sugar: { min: 40, target: 70, max: 100 }
                },
                micronutrients: {
                    vitaminC: { min: 100, target: 150, max: 200 },
                    vitaminD: { min: 20, target: 30, max: 40 },
                    calcium: { min: 1000, target: 1300, max: 1600 },
                    iron: { min: 18, target: 25, max: 35 },
                    magnesium: { min: 400, target: 550, max: 700 },
                    potassium: { min: 3500, target: 4500, max: 5500 }
                }
            },
            'plant_based': {
                name: 'Plant-Based Nutrition',
                description: 'Balanced plant-based nutrition plan',
                targets: {
                    calories: { min: 1600, target: 2000, max: 2400 },
                    protein: { min: 50, target: 70, max: 90 },
                    carbs: { min: 250, target: 325, max: 400 },
                    fat: { min: 50, target: 70, max: 90 },
                    fiber: { min: 35, target: 50, max: 65 },
                    sodium: { min: 1000, target: 1500, max: 2000 },
                    sugar: { min: 20, target: 35, max: 50 }
                },
                micronutrients: {
                    vitaminC: { min: 90, target: 120, max: 150 },
                    vitaminD: { min: 15, target: 20, max: 25 },
                    calcium: { min: 800, target: 1000, max: 1200 },
                    iron: { min: 18, target: 25, max: 35 },
                    magnesium: { min: 350, target: 450, max: 550 },
                    potassium: { min: 3500, target: 4000, max: 4700 },
                    vitaminB12: { min: 2, target: 3, max: 5 }
                }
            }
        };

        this.achievementTemplates = [
            {
                id: 'protein_week',
                name: 'Protein Power Week',
                description: 'Met protein goals for 7 consecutive days',
                icon: '💪',
                condition: 'protein_streak_7'
            },
            {
                id: 'fiber_champion',
                name: 'Fiber Champion',
                description: 'Exceeded fiber goals for 5 days in a row',
                icon: '🌾',
                condition: 'fiber_streak_5'
            },
            {
                id: 'balanced_nutrition',
                name: 'Balanced Nutrition Master',
                description: 'Met all macro goals in a single day',
                icon: '⚖️',
                condition: 'all_macros_day'
            },
            {
                id: 'vitamin_c_boost',
                name: 'Vitamin C Boost',
                description: 'Exceeded vitamin C goals for 3 days',
                icon: '🍊',
                condition: 'vitaminC_streak_3'
            },
            {
                id: 'hydration_hero',
                name: 'Hydration Hero',
                description: 'Maintained proper sodium balance for a week',
                icon: '💧',
                condition: 'sodium_balance_7'
            }
        ];
    }

    /**
     * Initialize the enhanced nutrition tracker
     */
    async initialize() {
        console.log('🚀 Initializing Enhanced Nutrition Tracker...');
        
        try {
            await this.loadUserProfile();
            await this.loadNutritionGoals();
            await this.loadNutritionHistory();
            this.calculateProgressData();
            
            console.log('✅ Enhanced Nutrition Tracker initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Nutrition Tracker:', error);
        }
    }

    /**
     * Load user profile and preferences
     */
    async loadUserProfile() {
        const user = window.currentUser;
        if (!user) return;

        this.userId = user.uid;
        
        // Load user profile from Firebase
        if (window.db) {
            try {
                const doc = await window.db.collection('userProfiles').doc(this.userId).get();
                if (doc.exists) {
                    this.userProfile = doc.data();
                } else {
                    // Create default profile
                    this.userProfile = this.createDefaultProfile();
                    await this.saveUserProfile();
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                this.userProfile = this.createDefaultProfile();
            }
        }
    }

    /**
     * Create default user profile
     */
    createDefaultProfile() {
        return {
            age: 30,
            gender: 'other',
            weight: 70, // kg
            height: 170, // cm
            activityLevel: 'moderate',
            healthConditions: [],
            dietaryPreferences: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    /**
     * Set personalized nutrition goals
     */
    async setNutritionGoals(goalType, customModifications = {}) {
        console.log(`🎯 Setting nutrition goals: ${goalType}`);
        
        const template = this.goalTemplates[goalType];
        if (!template) {
            throw new Error(`Unknown goal type: ${goalType}`);
        }

        // Apply personalization based on user profile
        const personalizedGoals = this.personalizeGoals(template, customModifications);
        
        this.nutritionGoals = {
            type: goalType,
            template: template.name,
            description: template.description,
            ...personalizedGoals,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.saveNutritionGoals();
        return this.nutritionGoals;
    }

    /**
     * Personalize goals based on user profile
     */
    personalizeGoals(template, customModifications) {
        const goals = JSON.parse(JSON.stringify(template)); // Deep copy
        
        if (!this.userProfile) return goals;

        // Adjust calories based on BMR and activity level
        const bmr = this.calculateBMR();
        const tdee = this.calculateTDEE(bmr);
        
        // Adjust calorie targets
        const calorieAdjustment = tdee / 2000; // Base template is for 2000 calories
        ['calories', 'protein', 'carbs', 'fat'].forEach(nutrient => {
            if (goals.targets[nutrient]) {
                goals.targets[nutrient].min = Math.round(goals.targets[nutrient].min * calorieAdjustment);
                goals.targets[nutrient].target = Math.round(goals.targets[nutrient].target * calorieAdjustment);
                goals.targets[nutrient].max = Math.round(goals.targets[nutrient].max * calorieAdjustment);
            }
        });

        // Apply custom modifications
        Object.keys(customModifications).forEach(nutrient => {
            if (goals.targets[nutrient]) {
                Object.assign(goals.targets[nutrient], customModifications[nutrient]);
            }
        });

        return goals;
    }

    /**
     * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
     */
    calculateBMR() {
        const { weight, height, age, gender } = this.userProfile;
        
        let bmr = 10 * weight + 6.25 * height - 5 * age;
        
        if (gender === 'male') {
            bmr += 5;
        } else if (gender === 'female') {
            bmr -= 161;
        } else {
            bmr -= 78; // Average for other/non-binary
        }
        
        return bmr;
    }

    /**
     * Calculate Total Daily Energy Expenditure
     */
    calculateTDEE(bmr) {
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderate': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        };
        
        const multiplier = activityMultipliers[this.userProfile.activityLevel] || 1.55;
        return bmr * multiplier;
    }

    /**
     * Track daily nutrition intake
     */
    async trackDailyNutrition(date, meals) {
        console.log(`📊 Tracking nutrition for ${date}`);
        
        const dailyNutrition = this.calculateDailyNutrition(meals);
        const progress = this.calculateDailyProgress(dailyNutrition);
        const insights = this.generateDailyInsights(dailyNutrition, progress);
        
        const nutritionRecord = {
            date,
            nutrition: dailyNutrition,
            progress,
            insights,
            meals: meals.map(meal => ({
                name: meal.name,
                nutrition: this.calculateMealNutrition(meal)
            })),
            timestamp: new Date()
        };

        // Add to history
        this.nutritionHistory.push(nutritionRecord);
        
        // Save to Firebase
        await this.saveNutritionRecord(nutritionRecord);
        
        // Check for achievements
        this.checkAchievements();
        
        return nutritionRecord;
    }

    /**
     * Calculate nutrition for a single meal
     */
    calculateMealNutrition(meal) {
        let totalNutrition = this.getEmptyNutrition();
        
        if (!meal.ingredients) return totalNutrition;

        meal.ingredients.forEach(ingredientName => {
            const nutrition = this.getIngredientNutrition(ingredientName);
            const servingSize = this.estimateServingSize(ingredientName, meal.servings || 4);
            const scaledNutrition = this.scaleNutrition(nutrition, servingSize / 100);
            
            Object.keys(totalNutrition).forEach(key => {
                totalNutrition[key] = (totalNutrition[key] || 0) + (scaledNutrition[key] || 0);
            });
        });

        return totalNutrition;
    }

    /**
     * Calculate total daily nutrition from all meals
     */
    calculateDailyNutrition(meals) {
        let dailyTotal = this.getEmptyNutrition();
        
        meals.forEach(meal => {
            const mealNutrition = this.calculateMealNutrition(meal);
            Object.keys(dailyTotal).forEach(key => {
                dailyTotal[key] = (dailyTotal[key] || 0) + (mealNutrition[key] || 0);
            });
        });

        return dailyTotal;
    }

    /**
     * Calculate daily progress against goals
     */
    calculateDailyProgress(dailyNutrition) {
        if (!this.nutritionGoals.targets) return {};

        const progress = {};
        
        // Calculate macro progress
        Object.keys(this.nutritionGoals.targets).forEach(nutrient => {
            const target = this.nutritionGoals.targets[nutrient];
            const actual = dailyNutrition[nutrient] || 0;
            
            progress[nutrient] = {
                actual,
                target: target.target,
                min: target.min,
                max: target.max,
                percentage: Math.round((actual / target.target) * 100),
                status: this.getProgressStatus(actual, target)
            };
        });

        // Calculate micronutrient progress
        if (this.nutritionGoals.micronutrients) {
            progress.micronutrients = {};
            Object.keys(this.nutritionGoals.micronutrients).forEach(nutrient => {
                const target = this.nutritionGoals.micronutrients[nutrient];
                const actual = dailyNutrition[nutrient] || 0;
                
                progress.micronutrients[nutrient] = {
                    actual,
                    target: target.target,
                    min: target.min,
                    max: target.max,
                    percentage: Math.round((actual / target.target) * 100),
                    status: this.getProgressStatus(actual, target)
                };
            });
        }

        return progress;
    }

    /**
     * Determine progress status for a nutrient
     */
    getProgressStatus(actual, target) {
        if (actual < target.min) return 'low';
        if (actual > target.max) return 'high';
        if (actual >= target.min && actual <= target.target) return 'good';
        if (actual > target.target && actual <= target.max) return 'excellent';
        return 'optimal';
    }

    /**
     * Generate daily insights and recommendations
     */
    generateDailyInsights(nutrition, progress) {
        const insights = {
            achievements: [],
            recommendations: [],
            warnings: [],
            highlights: []
        };

        // Check for achievements
        Object.keys(progress).forEach(nutrient => {
            if (nutrient === 'micronutrients') return;
            
            const nutrientProgress = progress[nutrient];
            if (nutrientProgress.status === 'excellent' || nutrientProgress.status === 'optimal') {
                insights.achievements.push(`Great job meeting your ${nutrient} goal! 🎯`);
            }
        });

        // Generate recommendations
        Object.keys(progress).forEach(nutrient => {
            if (nutrient === 'micronutrients') return;
            
            const nutrientProgress = progress[nutrient];
            if (nutrientProgress.status === 'low') {
                insights.recommendations.push(this.getDeficiencyRecommendation(nutrient));
            } else if (nutrientProgress.status === 'high') {
                insights.warnings.push(this.getExcessWarning(nutrient));
            }
        });

        // Micronutrient insights
        if (progress.micronutrients) {
            Object.keys(progress.micronutrients).forEach(nutrient => {
                const nutrientProgress = progress.micronutrients[nutrient];
                if (nutrientProgress.status === 'low') {
                    insights.recommendations.push(this.getMicronutrientRecommendation(nutrient));
                }
            });
        }

        return insights;
    }

    /**
     * Get recommendation for nutrient deficiency
     */
    getDeficiencyRecommendation(nutrient) {
        const recommendations = {
            protein: 'Add lean proteins like chicken, fish, tofu, or legumes to your meals.',
            carbs: 'Include healthy carbs like quinoa, brown rice, or sweet potatoes.',
            fat: 'Add healthy fats like avocado, nuts, seeds, or olive oil.',
            fiber: 'Increase fruits, vegetables, and whole grains in your diet.',
            calcium: 'Include dairy products, leafy greens, or fortified foods.',
            iron: 'Add iron-rich foods like spinach, lean meat, or legumes.',
            vitaminC: 'Eat more citrus fruits, berries, or bell peppers.',
            potassium: 'Include bananas, potatoes, or leafy greens in your meals.'
        };
        
        return recommendations[nutrient] || `Consider increasing your ${nutrient} intake.`;
    }

    /**
     * Get warning for nutrient excess
     */
    getExcessWarning(nutrient) {
        const warnings = {
            sodium: 'High sodium intake detected. Consider reducing processed foods.',
            sugar: 'Sugar intake is above target. Try reducing sweetened foods and drinks.',
            fat: 'Fat intake is high. Focus on lean proteins and cooking methods.',
            calories: 'Calorie intake exceeds goals. Consider portion control.'
        };
        
        return warnings[nutrient] || `${nutrient} intake is above recommended levels.`;
    }

    /**
     * Get micronutrient recommendation
     */
    getMicronutrientRecommendation(nutrient) {
        const recommendations = {
            vitaminA: 'Add colorful vegetables like carrots, sweet potatoes, or leafy greens.',
            vitaminC: 'Include citrus fruits, strawberries, or bell peppers.',
            vitaminD: 'Consider fortified foods or safe sun exposure.',
            calcium: 'Include dairy, leafy greens, or fortified plant milks.',
            iron: 'Add spinach, lean meats, or fortified cereals.',
            magnesium: 'Include nuts, seeds, or whole grains.',
            potassium: 'Add bananas, potatoes, or avocados.',
            omega3: 'Include fatty fish, walnuts, or flax seeds.'
        };
        
        return recommendations[nutrient] || `Consider foods rich in ${nutrient}.`;
    }

    /**
     * Generate weekly nutrition analysis
     */
    generateWeeklyAnalysis(weekData) {
        const weeklyTotals = this.getEmptyNutrition();
        const dailyAverages = {};
        const progressTrends = {};
        
        // Calculate weekly totals and averages
        weekData.forEach(day => {
            Object.keys(day.nutrition).forEach(nutrient => {
                weeklyTotals[nutrient] = (weeklyTotals[nutrient] || 0) + (day.nutrition[nutrient] || 0);
            });
        });

        // Calculate daily averages
        Object.keys(weeklyTotals).forEach(nutrient => {
            dailyAverages[nutrient] = Math.round(weeklyTotals[nutrient] / 7);
        });

        // Calculate progress trends
        Object.keys(this.nutritionGoals.targets || {}).forEach(nutrient => {
            const target = this.nutritionGoals.targets[nutrient].target;
            const average = dailyAverages[nutrient] || 0;
            const percentage = Math.round((average / target) * 100);
            
            progressTrends[nutrient] = {
                average,
                target,
                percentage,
                trend: this.calculateTrend(weekData.map(d => d.nutrition[nutrient] || 0))
            };
        });

        return {
            weeklyTotals,
            dailyAverages,
            progressTrends,
            overallScore: this.calculateOverallScore(progressTrends),
            recommendations: this.generateWeeklyRecommendations(progressTrends)
        };
    }

    /**
     * Calculate trend direction for a week of data
     */
    calculateTrend(weekValues) {
        if (weekValues.length < 2) return 'stable';
        
        const firstHalf = weekValues.slice(0, Math.floor(weekValues.length / 2));
        const secondHalf = weekValues.slice(Math.floor(weekValues.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }

    /**
     * Calculate overall nutrition score
     */
    calculateOverallScore(progressTrends) {
        const scores = Object.values(progressTrends).map(trend => {
            const percentage = trend.percentage;
            if (percentage >= 90 && percentage <= 110) return 100;
            if (percentage >= 80 && percentage <= 120) return 80;
            if (percentage >= 70 && percentage <= 130) return 60;
            if (percentage >= 60 && percentage <= 140) return 40;
            return 20;
        });
        
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    /**
     * Check for achievements
     */
    checkAchievements() {
        // Implementation for checking various achievement conditions
        // This would track streaks, milestones, and other accomplishments
        console.log('🏆 Checking for new achievements...');
    }

    /**
     * Get empty nutrition object
     */
    getEmptyNutrition() {
        return {
            calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0,
            vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
            calcium: 0, iron: 0, magnesium: 0, potassium: 0, zinc: 0,
            omega3: 0, omega6: 0, cholesterol: 0
        };
    }

    /**
     * Get nutrition data for an ingredient
     */
    getIngredientNutrition(ingredientName) {
        const cleanName = ingredientName.toLowerCase().replace(/[^a-z]/g, '_');
        return this.enhancedNutritionDatabase[cleanName] || 
               this.enhancedNutritionDatabase[ingredientName.toLowerCase()] ||
               this.getEmptyNutrition();
    }

    /**
     * Scale nutrition values
     */
    scaleNutrition(nutrition, factor) {
        const scaled = {};
        Object.keys(nutrition).forEach(key => {
            scaled[key] = nutrition[key] * factor;
        });
        return scaled;
    }

    /**
     * Estimate serving size for an ingredient
     */
    estimateServingSize(ingredient, servings) {
        // Simplified serving size estimation (in grams)
        const defaultSizes = {
            'protein': 150,
            'vegetable': 100,
            'fruit': 120,
            'grain': 75,
            'dairy': 100
        };
        
        return (defaultSizes.protein || 100) / servings;
    }

    /**
     * Save user profile to Firebase
     */
    async saveUserProfile() {
        if (!this.userId || !window.db) return;
        
        try {
            await window.db.collection('userProfiles').doc(this.userId).set(this.userProfile, { merge: true });
            console.log('✅ User profile saved');
        } catch (error) {
            console.error('❌ Error saving user profile:', error);
        }
    }

    /**
     * Save nutrition goals to Firebase
     */
    async saveNutritionGoals() {
        if (!this.userId || !window.db) return;
        
        try {
            await window.db.collection('nutritionGoals').doc(this.userId).set(this.nutritionGoals, { merge: true });
            console.log('✅ Nutrition goals saved');
        } catch (error) {
            console.error('❌ Error saving nutrition goals:', error);
        }
    }

    /**
     * Load nutrition goals from Firebase
     */
    async loadNutritionGoals() {
        if (!this.userId || !window.db) return;
        
        try {
            const doc = await window.db.collection('nutritionGoals').doc(this.userId).get();
            if (doc.exists) {
                this.nutritionGoals = doc.data();
            }
        } catch (error) {
            console.error('❌ Error loading nutrition goals:', error);
        }
    }

    /**
     * Save nutrition record to Firebase
     */
    async saveNutritionRecord(record) {
        if (!this.userId || !window.db) return;
        
        try {
            const docId = `${this.userId}_${record.date}`;
            await window.db.collection('nutritionHistory').doc(docId).set(record);
            console.log('✅ Nutrition record saved');
        } catch (error) {
            console.error('❌ Error saving nutrition record:', error);
        }
    }

    /**
     * Load nutrition history from Firebase
     */
    async loadNutritionHistory(days = 30) {
        if (!this.userId || !window.db) return;
        
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
            
            const snapshot = await window.db.collection('nutritionHistory')
                .where('date', '>=', startDate.toISOString().split('T')[0])
                .where('date', '<=', endDate.toISOString().split('T')[0])
                .orderBy('date', 'desc')
                .get();
            
            this.nutritionHistory = snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('❌ Error loading nutrition history:', error);
        }
    }

    /**
     * Calculate progress data for UI display
     */
    calculateProgressData() {
        if (this.nutritionHistory.length === 0) return;
        
        // Calculate recent progress, trends, etc.
        this.progressData = {
            recentDays: this.nutritionHistory.slice(0, 7),
            weeklyAverage: this.calculateWeeklyAverage(),
            streaks: this.calculateStreaks(),
            achievements: this.achievements
        };
    }

    /**
     * Calculate weekly averages
     */
    calculateWeeklyAverage() {
        if (this.nutritionHistory.length === 0) return this.getEmptyNutrition();
        
        const weekData = this.nutritionHistory.slice(0, 7);
        const totals = this.getEmptyNutrition();
        
        weekData.forEach(day => {
            Object.keys(day.nutrition).forEach(nutrient => {
                totals[nutrient] += day.nutrition[nutrient] || 0;
            });
        });
        
        Object.keys(totals).forEach(nutrient => {
            totals[nutrient] = Math.round(totals[nutrient] / weekData.length);
        });
        
        return totals;
    }

    /**
     * Calculate nutrient streaks
     */
    calculateStreaks() {
        const streaks = {};
        
        if (!this.nutritionGoals.targets) return streaks;
        
        Object.keys(this.nutritionGoals.targets).forEach(nutrient => {
            let currentStreak = 0;
            
            for (let i = 0; i < this.nutritionHistory.length; i++) {
                const day = this.nutritionHistory[i];
                const progress = day.progress && day.progress[nutrient];
                
                if (progress && (progress.status === 'good' || progress.status === 'excellent' || progress.status === 'optimal')) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            
            streaks[nutrient] = currentStreak;
        });
        
        return streaks;
    }
}

// Export the class
export default EnhancedNutritionTracker;
