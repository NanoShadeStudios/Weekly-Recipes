/**
 * Advanced Ingredient Substitution System
 * Provides intelligent ingredient alternatives based on dietary restrictions, allergies, and availability
 */

class IngredientSubstitutionManager {
    constructor() {
        this.substitutionDatabase = {};
        this.allergyDatabase = {};
        this.dietaryDatabase = {};
        this.nutritionalDatabase = {};
        this.pantryInventory = new Set();
        this.priceDatabase = {};
        this.seasonalDatabase = {};
        
        this.initializeDatabase();
    }

    /**
     * Public initialize method for app initialization
     */
    async initialize() {
        console.log('IngredientSubstitutionManager: Initializing...');
        // Database is already initialized in constructor
        // This method can be used for future async initialization if needed
        return Promise.resolve();
    }

    initializeDatabase() {
        this.buildSubstitutionDatabase();
        this.buildAllergyDatabase();
        this.buildDietaryDatabase();
        this.buildNutritionalDatabase();
        this.buildSeasonalDatabase();
    }

    buildSubstitutionDatabase() {
        this.substitutionDatabase = {
            // Proteins
            'chicken breast': {
                alternatives: [
                    { name: 'turkey breast', ratio: 1, similarity: 0.95, category: 'protein' },
                    { name: 'pork tenderloin', ratio: 1, similarity: 0.85, category: 'protein' },
                    { name: 'firm tofu', ratio: 1, similarity: 0.7, category: 'protein', dietary: ['vegetarian', 'vegan'] },
                    { name: 'tempeh', ratio: 0.8, similarity: 0.65, category: 'protein', dietary: ['vegetarian', 'vegan'] },
                    { name: 'seitan', ratio: 0.9, similarity: 0.6, category: 'protein', dietary: ['vegetarian', 'vegan'] },
                    { name: 'cauliflower steaks', ratio: 1.2, similarity: 0.4, category: 'vegetable', dietary: ['vegetarian', 'vegan'] }
                ],
                cookingAdjustments: {
                    'firm tofu': 'Press tofu and marinate for extra flavor',
                    'tempeh': 'Steam tempeh before cooking to reduce bitterness',
                    'seitan': 'Reduce cooking time as seitan cooks faster'
                }
            },
            'ground beef': {
                alternatives: [
                    { name: 'ground turkey', ratio: 1, similarity: 0.9, category: 'protein' },
                    { name: 'ground chicken', ratio: 1, similarity: 0.85, category: 'protein' },
                    { name: 'ground pork', ratio: 1, similarity: 0.8, category: 'protein' },
                    { name: 'lentils', ratio: 0.75, similarity: 0.6, category: 'legume', dietary: ['vegetarian', 'vegan'] },
                    { name: 'mushroom mince', ratio: 1, similarity: 0.55, category: 'vegetable', dietary: ['vegetarian', 'vegan'] },
                    { name: 'black beans', ratio: 0.8, similarity: 0.5, category: 'legume', dietary: ['vegetarian', 'vegan'] }
                ],
                cookingAdjustments: {
                    'lentils': 'Pre-cook lentils and add extra seasoning',
                    'mushroom mince': 'Sauté mushrooms to remove excess moisture',
                    'black beans': 'Mash partially for better texture'
                }
            },
            'salmon': {
                alternatives: [
                    { name: 'arctic char', ratio: 1, similarity: 0.9, category: 'fish' },
                    { name: 'rainbow trout', ratio: 1, similarity: 0.85, category: 'fish' },
                    { name: 'mackerel', ratio: 1, similarity: 0.8, category: 'fish' },
                    { name: 'portobello mushrooms', ratio: 1, similarity: 0.4, category: 'vegetable', dietary: ['vegetarian', 'vegan'] },
                    { name: 'marinated tofu', ratio: 1, similarity: 0.35, category: 'protein', dietary: ['vegetarian', 'vegan'] }
                ]
            },

            // Dairy
            'milk': {
                alternatives: [
                    { name: 'almond milk', ratio: 1, similarity: 0.8, category: 'plant-milk', dietary: ['lactose-free', 'vegan'] },
                    { name: 'oat milk', ratio: 1, similarity: 0.85, category: 'plant-milk', dietary: ['lactose-free', 'vegan'] },
                    { name: 'soy milk', ratio: 1, similarity: 0.9, category: 'plant-milk', dietary: ['lactose-free', 'vegan'] },
                    { name: 'coconut milk', ratio: 1, similarity: 0.75, category: 'plant-milk', dietary: ['lactose-free', 'vegan'] },
                    { name: 'cashew milk', ratio: 1, similarity: 0.8, category: 'plant-milk', dietary: ['lactose-free', 'vegan'] },
                    { name: 'lactose-free milk', ratio: 1, similarity: 0.95, category: 'dairy', dietary: ['lactose-free'] }
                ],
                cookingAdjustments: {
                    'coconut milk': 'Use light coconut milk for less richness',
                    'almond milk': 'May need to reduce liquid in recipe slightly',
                    'oat milk': 'Best for baking and coffee drinks'
                }
            },
            'butter': {
                alternatives: [
                    { name: 'vegan butter', ratio: 1, similarity: 0.9, category: 'fat', dietary: ['vegan', 'lactose-free'] },
                    { name: 'coconut oil', ratio: 0.75, similarity: 0.75, category: 'fat', dietary: ['vegan', 'lactose-free'] },
                    { name: 'olive oil', ratio: 0.75, similarity: 0.6, category: 'fat', dietary: ['vegan', 'lactose-free'] },
                    { name: 'avocado oil', ratio: 0.75, similarity: 0.65, category: 'fat', dietary: ['vegan', 'lactose-free'] },
                    { name: 'applesauce', ratio: 0.5, similarity: 0.4, category: 'fruit', dietary: ['vegan', 'low-fat'] }
                ],
                cookingAdjustments: {
                    'coconut oil': 'Use solid coconut oil for baking',
                    'applesauce': 'Reduce other liquids and expect denser texture',
                    'olive oil': 'Best for savory dishes'
                }
            },
            'cheese': {
                alternatives: [
                    { name: 'nutritional yeast', ratio: 0.25, similarity: 0.6, category: 'seasoning', dietary: ['vegan'] },
                    { name: 'cashew cheese', ratio: 1, similarity: 0.7, category: 'plant-cheese', dietary: ['vegan'] },
                    { name: 'almond cheese', ratio: 1, similarity: 0.65, category: 'plant-cheese', dietary: ['vegan'] },
                    { name: 'coconut cheese', ratio: 1, similarity: 0.6, category: 'plant-cheese', dietary: ['vegan'] },
                    { name: 'lactose-free cheese', ratio: 1, similarity: 0.9, category: 'dairy', dietary: ['lactose-free'] }
                ]
            },

            // Eggs
            'eggs': {
                alternatives: [
                    { name: 'applesauce', ratio: 0.25, similarity: 0.6, category: 'fruit', dietary: ['vegan'], use: 'baking' },
                    { name: 'mashed banana', ratio: 0.5, similarity: 0.55, category: 'fruit', dietary: ['vegan'], use: 'baking' },
                    { name: 'flax eggs', ratio: 1, similarity: 0.7, category: 'seed', dietary: ['vegan'], use: 'baking' },
                    { name: 'chia eggs', ratio: 1, similarity: 0.7, category: 'seed', dietary: ['vegan'], use: 'baking' },
                    { name: 'aquafaba', ratio: 3, similarity: 0.75, category: 'liquid', dietary: ['vegan'], use: 'whipping' },
                    { name: 'tofu scramble', ratio: 0.5, similarity: 0.6, category: 'protein', dietary: ['vegan'], use: 'scrambling' },
                    { name: 'chickpea flour', ratio: 0.25, similarity: 0.5, category: 'flour', dietary: ['vegan'], use: 'binding' }
                ],
                cookingAdjustments: {
                    'flax eggs': 'Mix 1 tbsp ground flaxseed with 3 tbsp water, let sit 5 minutes',
                    'chia eggs': 'Mix 1 tbsp chia seeds with 3 tbsp water, let sit 10 minutes',
                    'aquafaba': 'Whip chilled aquafaba for best results',
                    'tofu scramble': 'Crumble firm tofu and season with turmeric for color'
                }
            },

            // Grains and Starches
            'white rice': {
                alternatives: [
                    { name: 'brown rice', ratio: 1, similarity: 0.9, category: 'grain', dietary: ['whole-grain'] },
                    { name: 'quinoa', ratio: 1, similarity: 0.75, category: 'grain', dietary: ['gluten-free', 'protein-rich'] },
                    { name: 'cauliflower rice', ratio: 1, similarity: 0.6, category: 'vegetable', dietary: ['low-carb', 'keto'] },
                    { name: 'wild rice', ratio: 1, similarity: 0.8, category: 'grain', dietary: ['whole-grain'] },
                    { name: 'barley', ratio: 1, similarity: 0.7, category: 'grain' },
                    { name: 'bulgur wheat', ratio: 1, similarity: 0.75, category: 'grain' }
                ],
                cookingAdjustments: {
                    'brown rice': 'Increase cooking time by 15-20 minutes',
                    'quinoa': 'Rinse thoroughly before cooking',
                    'cauliflower rice': 'Sauté for 5-7 minutes, don\'t overcook'
                }
            },
            'wheat flour': {
                alternatives: [
                    { name: 'almond flour', ratio: 1, similarity: 0.6, category: 'nut-flour', dietary: ['gluten-free', 'low-carb'] },
                    { name: 'coconut flour', ratio: 0.25, similarity: 0.5, category: 'plant-flour', dietary: ['gluten-free', 'low-carb'] },
                    { name: 'rice flour', ratio: 1, similarity: 0.7, category: 'grain-flour', dietary: ['gluten-free'] },
                    { name: 'oat flour', ratio: 1, similarity: 0.8, category: 'grain-flour', dietary: ['gluten-free'] },
                    { name: 'chickpea flour', ratio: 0.75, similarity: 0.6, category: 'legume-flour', dietary: ['gluten-free', 'protein-rich'] },
                    { name: 'spelt flour', ratio: 1, similarity: 0.85, category: 'grain-flour', dietary: ['ancient-grain'] }
                ],
                cookingAdjustments: {
                    'coconut flour': 'Highly absorbent, increase liquid content',
                    'almond flour': 'May need binding agent, produces denser texture',
                    'chickpea flour': 'Best for savory applications'
                }
            },

            // Vegetables
            'onion': {
                alternatives: [
                    { name: 'shallots', ratio: 0.75, similarity: 0.9, category: 'allium' },
                    { name: 'leeks', ratio: 1, similarity: 0.8, category: 'allium' },
                    { name: 'green onions', ratio: 1.5, similarity: 0.7, category: 'allium' },
                    { name: 'chives', ratio: 0.5, similarity: 0.6, category: 'herb' },
                    { name: 'fennel', ratio: 1, similarity: 0.5, category: 'vegetable' },
                    { name: 'celery', ratio: 1, similarity: 0.4, category: 'vegetable' }
                ],
                cookingAdjustments: {
                    'leeks': 'Use white and light green parts only',
                    'green onions': 'Add towards end of cooking for best flavor',
                    'fennel': 'Provides subtle anise flavor'
                }
            },
            'garlic': {
                alternatives: [
                    { name: 'garlic powder', ratio: 0.125, similarity: 0.8, category: 'spice' },
                    { name: 'shallots', ratio: 1, similarity: 0.6, category: 'allium' },
                    { name: 'green garlic', ratio: 1, similarity: 0.9, category: 'allium' },
                    { name: 'garlic scapes', ratio: 1, similarity: 0.85, category: 'allium' },
                    { name: 'asafoetida', ratio: 0.1, similarity: 0.7, category: 'spice' }
                ],
                cookingAdjustments: {
                    'garlic powder': '1/8 tsp powder = 1 clove fresh garlic',
                    'asafoetida': 'Very potent, use sparingly'
                }
            },

            // Sweeteners
            'sugar': {
                alternatives: [
                    { name: 'honey', ratio: 0.75, similarity: 0.8, category: 'natural-sweetener' },
                    { name: 'maple syrup', ratio: 0.75, similarity: 0.75, category: 'natural-sweetener', dietary: ['vegan'] },
                    { name: 'agave nectar', ratio: 0.75, similarity: 0.7, category: 'natural-sweetener', dietary: ['vegan'] },
                    { name: 'coconut sugar', ratio: 1, similarity: 0.85, category: 'natural-sweetener', dietary: ['vegan'] },
                    { name: 'stevia', ratio: 0.1, similarity: 0.6, category: 'artificial-sweetener', dietary: ['low-calorie'] },
                    { name: 'dates', ratio: 1.5, similarity: 0.7, category: 'fruit', dietary: ['vegan', 'whole-food'] }
                ],
                cookingAdjustments: {
                    'honey': 'Reduce liquid in recipe by 1/4 cup per cup of honey',
                    'maple syrup': 'Reduce liquid by 3 tbsp per cup of syrup',
                    'stevia': 'Much sweeter than sugar, adjust to taste',
                    'dates': 'Blend with water to make paste'
                }
            }
        };
    }

    buildAllergyDatabase() {
        this.allergyDatabase = {
            'nuts': {
                avoid: ['almonds', 'walnuts', 'pecans', 'cashews', 'pistachios', 'hazelnuts', 'brazil nuts', 'macadamia nuts'],
                alternatives: {
                    'almond flour': ['oat flour', 'rice flour', 'coconut flour'],
                    'almond milk': ['oat milk', 'rice milk', 'soy milk'],
                    'cashew cheese': ['coconut cheese', 'soy cheese'],
                    'peanut butter': ['sunflower seed butter', 'soy butter', 'tahini']
                }
            },
            'dairy': {
                avoid: ['milk', 'butter', 'cheese', 'yogurt', 'cream', 'ice cream', 'whey', 'casein'],
                alternatives: {
                    'milk': ['almond milk', 'oat milk', 'soy milk', 'coconut milk'],
                    'butter': ['vegan butter', 'coconut oil', 'olive oil'],
                    'cheese': ['nutritional yeast', 'cashew cheese', 'coconut cheese'],
                    'yogurt': ['coconut yogurt', 'almond yogurt', 'soy yogurt']
                }
            },
            'gluten': {
                avoid: ['wheat', 'barley', 'rye', 'spelt', 'triticale', 'wheat flour', 'bread crumbs'],
                alternatives: {
                    'wheat flour': ['rice flour', 'almond flour', 'coconut flour', 'oat flour'],
                    'bread crumbs': ['crushed rice crackers', 'ground nuts', 'gluten-free breadcrumbs'],
                    'soy sauce': ['tamari', 'coconut aminos'],
                    'pasta': ['rice pasta', 'quinoa pasta', 'zucchini noodles']
                }
            },
            'eggs': {
                avoid: ['eggs', 'egg whites', 'egg yolks', 'mayonnaise'],
                alternatives: {
                    'eggs': ['flax eggs', 'chia eggs', 'applesauce', 'mashed banana'],
                    'mayonnaise': ['vegan mayo', 'avocado', 'tahini'],
                    'egg wash': ['plant milk', 'aquafaba']
                }
            },
            'soy': {
                avoid: ['soybeans', 'soy sauce', 'tofu', 'tempeh', 'soy milk', 'edamame'],
                alternatives: {
                    'soy sauce': ['coconut aminos', 'liquid aminos'],
                    'tofu': ['chicken', 'cauliflower', 'mushrooms'],
                    'soy milk': ['almond milk', 'oat milk', 'rice milk'],
                    'tempeh': ['mushrooms', 'lentils', 'chickpeas']
                }
            },
            'shellfish': {
                avoid: ['shrimp', 'crab', 'lobster', 'mussels', 'clams', 'oysters', 'scallops'],
                alternatives: {
                    'shrimp': ['chicken', 'mushrooms', 'hearts of palm'],
                    'crab': ['mushrooms', 'jackfruit'],
                    'scallops': ['king oyster mushrooms', 'cauliflower']
                }
            },
            'fish': {
                avoid: ['salmon', 'tuna', 'cod', 'halibut', 'sardines', 'anchovies'],
                alternatives: {
                    'salmon': ['chicken', 'portobello mushrooms', 'tofu'],
                    'tuna': ['chickpeas', 'jackfruit', 'mushrooms'],
                    'anchovies': ['capers', 'olives', 'seaweed']
                }
            }
        };
    }

    buildDietaryDatabase() {
        this.dietaryDatabase = {
            'vegetarian': {
                avoid: ['beef', 'pork', 'chicken', 'turkey', 'fish', 'seafood', 'gelatin'],
                prefer: ['vegetables', 'fruits', 'grains', 'legumes', 'nuts', 'seeds', 'dairy', 'eggs']
            },
            'vegan': {
                avoid: ['beef', 'pork', 'chicken', 'turkey', 'fish', 'seafood', 'dairy', 'eggs', 'honey', 'gelatin'],
                prefer: ['vegetables', 'fruits', 'grains', 'legumes', 'nuts', 'seeds', 'plant-based proteins']
            },
            'keto': {
                avoid: ['rice', 'pasta', 'bread', 'potatoes', 'sugar', 'fruits', 'grains'],
                prefer: ['meat', 'fish', 'eggs', 'cheese', 'oils', 'nuts', 'low-carb vegetables']
            },
            'paleo': {
                avoid: ['grains', 'legumes', 'dairy', 'processed foods', 'sugar'],
                prefer: ['meat', 'fish', 'eggs', 'vegetables', 'fruits', 'nuts', 'seeds']
            },
            'mediterranean': {
                prefer: ['olive oil', 'fish', 'vegetables', 'fruits', 'whole grains', 'legumes', 'nuts']
            },
            'low-carb': {
                avoid: ['rice', 'pasta', 'bread', 'potatoes', 'sugar', 'grains'],
                prefer: ['protein', 'vegetables', 'healthy fats']
            },
            'low-fat': {
                avoid: ['butter', 'oils', 'nuts', 'fatty meats'],
                prefer: ['lean proteins', 'vegetables', 'fruits', 'whole grains']
            },
            'high-protein': {
                prefer: ['lean meats', 'fish', 'eggs', 'legumes', 'protein powder', 'Greek yogurt']
            }
        };
    }

    buildNutritionalDatabase() {
        this.nutritionalDatabase = {
            'chicken breast': { protein: 31, carbs: 0, fat: 3.6, calories: 165, fiber: 0 },
            'ground beef': { protein: 26, carbs: 0, fat: 20, calories: 254, fiber: 0 },
            'salmon': { protein: 25, carbs: 0, fat: 12, calories: 206, fiber: 0 },
            'tofu': { protein: 8, carbs: 2, fat: 4, calories: 70, fiber: 1 },
            'lentils': { protein: 9, carbs: 20, fat: 0.4, calories: 116, fiber: 8 },
            'quinoa': { protein: 4.4, carbs: 22, fat: 1.9, calories: 120, fiber: 2.8 },
            'brown rice': { protein: 2.6, carbs: 23, fat: 0.9, calories: 112, fiber: 1.8 },
            'almond milk': { protein: 1, carbs: 1, fat: 2.5, calories: 30, fiber: 0 },
            'oat milk': { protein: 3, carbs: 16, fat: 5, calories: 120, fiber: 2 }
        };
    }

    buildSeasonalDatabase() {
        this.seasonalDatabase = {
            'spring': ['asparagus', 'peas', 'lettuce', 'spinach', 'radishes', 'strawberries'],
            'summer': ['tomatoes', 'corn', 'zucchini', 'berries', 'stone fruits', 'herbs'],
            'fall': ['pumpkin', 'squash', 'apples', 'root vegetables', 'brussels sprouts'],
            'winter': ['citrus', 'cabbage', 'potatoes', 'stored squash', 'dried goods']
        };
    }

    // Main substitution method
    async getSubstitutions(ingredient, options = {}) {
        const {
            allergies = [],
            dietaryRestrictions = [],
            pantryItems = [],
            preferences = {},
            nutritionalGoals = {},
            season = this.getCurrentSeason(),
            priceRange = 'any',
            useCase = 'general'
        } = options;

        const substitutions = [];
        const ingredient_lower = ingredient.toLowerCase();

        // Check if ingredient is in our database
        if (this.substitutionDatabase[ingredient_lower]) {
            const alternatives = this.substitutionDatabase[ingredient_lower].alternatives;
            
            for (const alt of alternatives) {
                const substitution = await this.evaluateSubstitution(
                    ingredient, alt, allergies, dietaryRestrictions, 
                    pantryItems, nutritionalGoals, season, useCase
                );
                
                if (substitution.suitable) {
                    substitutions.push(substitution);
                }
            }
        }

        // Sort by compatibility score
        substitutions.sort((a, b) => b.score - a.score);

        return {
            original: ingredient,
            substitutions: substitutions.slice(0, 5), // Top 5 substitutions
            cookingTips: this.getCookingTips(ingredient, substitutions[0]),
            nutritionalComparison: this.getNutritionalComparison(ingredient, substitutions[0]),
            seasonalNote: this.getSeasonalNote(ingredient, season)
        };
    }

    async evaluateSubstitution(original, alternative, allergies, dietaryRestrictions, pantryItems, nutritionalGoals, season, useCase) {
        let score = alternative.similarity * 100;
        let suitable = true;
        let reasons = [];

        // Check allergies
        for (const allergy of allergies) {
            if (this.allergyDatabase[allergy] && 
                this.allergyDatabase[allergy].avoid.includes(alternative.name.toLowerCase())) {
                suitable = false;
                reasons.push(`Contains ${allergy} allergen`);
                score = 0;
                break;
            }
        }

        if (!suitable) {
            return { ...alternative, suitable, score, reasons };
        }

        // Check dietary restrictions
        for (const diet of dietaryRestrictions) {
            if (this.dietaryDatabase[diet]) {
                const dietInfo = this.dietaryDatabase[diet];
                
                if (dietInfo.avoid && dietInfo.avoid.includes(alternative.name.toLowerCase())) {
                    score -= 30;
                    reasons.push(`Not suitable for ${diet} diet`);
                } else if (dietInfo.prefer && dietInfo.prefer.includes(alternative.category)) {
                    score += 20;
                    reasons.push(`Great for ${diet} diet`);
                }
            }
        }

        // Check if in pantry
        if (pantryItems.includes(alternative.name.toLowerCase())) {
            score += 30;
            reasons.push('Available in your pantry');
        }

        // Check use case compatibility
        if (alternative.use && alternative.use !== useCase && useCase !== 'general') {
            score -= 20;
            reasons.push(`Better suited for ${alternative.use}`);
        }

        // Seasonal bonus
        const currentSeasonItems = this.seasonalDatabase[season] || [];
        if (currentSeasonItems.includes(alternative.name.toLowerCase())) {
            score += 15;
            reasons.push('In season now');
        }

        // Nutritional matching
        if (nutritionalGoals && Object.keys(nutritionalGoals).length > 0) {
            const nutritionalScore = this.evaluateNutritionalMatch(alternative.name, nutritionalGoals);
            score += nutritionalScore;
            if (nutritionalScore > 0) {
                reasons.push('Matches your nutritional goals');
            }
        }

        return {
            ...alternative,
            suitable: score > 20, // Minimum threshold
            score: Math.max(0, Math.min(100, score)),
            reasons,
            availability: pantryItems.includes(alternative.name.toLowerCase()) ? 'in-pantry' : 'need-to-buy',
            seasonality: currentSeasonItems.includes(alternative.name.toLowerCase()) ? 'in-season' : 'out-of-season'
        };
    }

    evaluateNutritionalMatch(ingredient, nutritionalGoals) {
        const nutrition = this.nutritionalDatabase[ingredient.toLowerCase()];
        if (!nutrition) return 0;

        let score = 0;
        
        if (nutritionalGoals.highProtein && nutrition.protein > 15) score += 10;
        if (nutritionalGoals.lowCarb && nutrition.carbs < 10) score += 10;
        if (nutritionalGoals.lowFat && nutrition.fat < 5) score += 10;
        if (nutritionalGoals.highFiber && nutrition.fiber > 5) score += 10;
        if (nutritionalGoals.lowCalorie && nutrition.calories < 100) score += 10;

        return score;
    }

    getCookingTips(original, bestSubstitution) {
        if (!bestSubstitution) return [];

        const tips = [];
        const originalLower = original.toLowerCase();
        const database = this.substitutionDatabase[originalLower];
        
        if (database && database.cookingAdjustments && database.cookingAdjustments[bestSubstitution.name]) {
            tips.push(database.cookingAdjustments[bestSubstitution.name]);
        }

        // Add ratio-based tips
        if (bestSubstitution.ratio !== 1) {
            if (bestSubstitution.ratio < 1) {
                tips.push(`Use ${bestSubstitution.ratio} times the amount (e.g., ${bestSubstitution.ratio} cup instead of 1 cup)`);
            } else {
                tips.push(`Use ${bestSubstitution.ratio} times the amount (e.g., ${bestSubstitution.ratio} cups instead of 1 cup)`);
            }
        }

        return tips;
    }

    getNutritionalComparison(original, substitute) {
        if (!substitute) return null;

        const originalNutrition = this.nutritionalDatabase[original.toLowerCase()];
        const substituteNutrition = this.nutritionalDatabase[substitute.name.toLowerCase()];

        if (!originalNutrition || !substituteNutrition) return null;

        return {
            original: originalNutrition,
            substitute: substituteNutrition,
            differences: {
                calories: substituteNutrition.calories - originalNutrition.calories,
                protein: substituteNutrition.protein - originalNutrition.protein,
                carbs: substituteNutrition.carbs - originalNutrition.carbs,
                fat: substituteNutrition.fat - originalNutrition.fat,
                fiber: substituteNutrition.fiber - originalNutrition.fiber
            }
        };
    }

    getSeasonalNote(ingredient, season) {
        const seasonalItems = this.seasonalDatabase[season] || [];
        if (seasonalItems.includes(ingredient.toLowerCase())) {
            return `${ingredient} is in peak season during ${season}`;
        }
        return null;
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    // Pantry management
    updatePantryInventory(items) {
        this.pantryInventory = new Set(items.map(item => item.toLowerCase()));
    }

    addToPantry(item) {
        this.pantryInventory.add(item.toLowerCase());
    }

    removeFromPantry(item) {
        this.pantryInventory.delete(item.toLowerCase());
    }

    // Batch substitution for entire recipe
    async getRecipeSubstitutions(recipe, options = {}) {
        const { ingredients } = recipe;
        const substitutions = {};
        const warnings = [];
        const tips = [];

        for (const ingredient of ingredients) {
            const result = await this.getSubstitutions(ingredient.name, options);
            
            if (result.substitutions.length > 0) {
                substitutions[ingredient.name] = result;
                
                if (result.cookingTips.length > 0) {
                    tips.push(...result.cookingTips);
                }
            } else {
                warnings.push(`No suitable substitutions found for ${ingredient.name}`);
            }
        }

        return {
            substitutions,
            warnings,
            tips,
            modifiedRecipe: this.generateModifiedRecipe(recipe, substitutions)
        };
    }

    generateModifiedRecipe(originalRecipe, substitutions) {
        const modifiedRecipe = { ...originalRecipe };
        
        modifiedRecipe.ingredients = originalRecipe.ingredients.map(ingredient => {
            const substitution = substitutions[ingredient.name];
            if (substitution && substitution.substitutions.length > 0) {
                const bestSub = substitution.substitutions[0];
                return {
                    ...ingredient,
                    name: bestSub.name,
                    amount: ingredient.amount * bestSub.ratio,
                    substituted: true,
                    originalName: ingredient.name
                };
            }
            return ingredient;
        });

        return modifiedRecipe;
    }

    // Integration with shopping list
    generateShoppingListWithSubstitutions(recipe, userPreferences) {
        const shoppingList = [];
        const availableInPantry = [];
        
        recipe.ingredients.forEach(ingredient => {
            if (this.pantryInventory.has(ingredient.name.toLowerCase())) {
                availableInPantry.push(ingredient.name);
            } else {
                shoppingList.push({
                    name: ingredient.name,
                    amount: ingredient.amount,
                    unit: ingredient.unit,
                    category: this.getIngredientCategory(ingredient.name),
                    priority: 'essential'
                });
            }
        });

        return {
            needToBuy: shoppingList,
            availableInPantry,
            estimatedCost: this.estimateCost(shoppingList),
            alternativeOptions: this.getAlternativeShoppingOptions(shoppingList, userPreferences)
        };
    }

    getIngredientCategory(ingredient) {
        // Simple categorization for shopping list organization
        const categories = {
            'produce': ['onion', 'garlic', 'tomato', 'lettuce', 'carrot', 'celery'],
            'meat': ['chicken', 'beef', 'pork', 'fish', 'turkey'],
            'dairy': ['milk', 'cheese', 'butter', 'yogurt', 'eggs'],
            'pantry': ['rice', 'pasta', 'flour', 'sugar', 'oil'],
            'frozen': ['frozen vegetables', 'frozen fruit', 'ice cream']
        };

        for (const [category, items] of Object.entries(categories)) {
            if (items.some(item => ingredient.toLowerCase().includes(item))) {
                return category;
            }
        }
        return 'other';
    }

    estimateCost(shoppingList) {
        // Basic cost estimation - would integrate with actual pricing APIs
        let totalCost = 0;
        shoppingList.forEach(item => {
            const basePrice = this.priceDatabase[item.name.toLowerCase()] || 3; // Default $3
            totalCost += basePrice;
        });
        return totalCost;
    }

    getAlternativeShoppingOptions(shoppingList, userPreferences) {
        return shoppingList.map(item => {
            const alternatives = this.substitutionDatabase[item.name.toLowerCase()];
            if (alternatives) {
                return {
                    original: item,
                    alternatives: alternatives.alternatives.slice(0, 3).map(alt => ({
                        name: alt.name,
                        estimatedPrice: this.priceDatabase[alt.name.toLowerCase()] || 3,
                        savings: Math.max(0, (this.priceDatabase[item.name.toLowerCase()] || 3) - 
                                         (this.priceDatabase[alt.name.toLowerCase()] || 3))
                    }))
                };
            }
            return { original: item, alternatives: [] };
        });
    }
}

// Export the class
export default IngredientSubstitutionManager;
export { IngredientSubstitutionManager };
