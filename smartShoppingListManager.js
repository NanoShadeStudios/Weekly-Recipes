/**
 * Smart Shopping List Manager
 * Advanced shopping list intelligence with quantity estimation, store organization,
 * budget management, family sharing, and AI-powered recommendations.
 */

export class SmartShoppingListManager {
    constructor() {
        this.priceDatabase = new Map();
        this.storeLayouts = new Map();
        this.userPreferences = {};
        this.familyMembers = [];
        this.budgetLimits = {};
        this.shoppingHistory = [];
        this.couponDatabase = [];
        this.seasonalPrices = {};
        
        this.initializeDatabase();
        this.loadUserData();
    }

    /**
     * Initialize comprehensive databases for intelligent shopping
     */
    initializeDatabase() {
        // Price database with seasonal variations
        this.priceDatabase = new Map([
            // Proteins (prices per lb/unit)
            ['chicken breast', { base: 6.99, seasonal: { winter: 0.9, spring: 1.0, summer: 1.1, fall: 0.95 }, unit: 'lb' }],
            ['ground beef', { base: 5.49, seasonal: { winter: 1.0, spring: 1.05, summer: 1.15, fall: 0.9 }, unit: 'lb' }],
            ['salmon fillet', { base: 12.99, seasonal: { winter: 1.1, spring: 0.95, summer: 0.85, fall: 1.0 }, unit: 'lb' }],
            ['eggs', { base: 3.29, seasonal: { winter: 1.2, spring: 0.8, summer: 0.9, fall: 1.0 }, unit: 'dozen' }],
            ['tofu', { base: 2.99, seasonal: { winter: 1.0, spring: 1.0, summer: 1.0, fall: 1.0 }, unit: 'block' }],
            
            // Vegetables (prices per lb/unit)
            ['tomatoes', { base: 2.49, seasonal: { winter: 1.5, spring: 1.0, summer: 0.7, fall: 0.9 }, unit: 'lb' }],
            ['onions', { base: 1.29, seasonal: { winter: 1.1, spring: 0.9, summer: 0.8, fall: 1.0 }, unit: 'lb' }],
            ['carrots', { base: 1.49, seasonal: { winter: 1.0, spring: 0.9, summer: 1.1, fall: 0.8 }, unit: 'lb' }],
            ['broccoli', { base: 2.99, seasonal: { winter: 1.2, spring: 0.8, summer: 1.1, fall: 0.9 }, unit: 'lb' }],
            ['spinach', { base: 3.49, seasonal: { winter: 1.1, spring: 0.9, summer: 1.0, fall: 0.9 }, unit: 'bag' }],
            
            // Grains & Carbs
            ['rice', { base: 2.99, seasonal: { winter: 1.0, spring: 1.0, summer: 1.0, fall: 1.0 }, unit: '2lb bag' }],
            ['pasta', { base: 1.49, seasonal: { winter: 1.0, spring: 1.0, summer: 1.0, fall: 1.0 }, unit: 'box' }],
            ['bread', { base: 2.49, seasonal: { winter: 1.0, spring: 1.0, summer: 1.0, fall: 1.0 }, unit: 'loaf' }],
            
            // Dairy
            ['milk', { base: 3.79, seasonal: { winter: 1.1, spring: 1.0, summer: 0.95, fall: 1.0 }, unit: 'gallon' }],
            ['cheese', { base: 4.99, seasonal: { winter: 1.0, spring: 1.0, summer: 1.05, fall: 0.95 }, unit: 'package' }],
            ['butter', { base: 4.49, seasonal: { winter: 1.2, spring: 1.0, summer: 0.9, fall: 1.0 }, unit: 'stick pack' }]
        ]);

        // Store layouts with aisle mapping
        this.storeLayouts = new Map([
            ['Walmart', {
                aisles: {
                    1: ['bread', 'bakery items'],
                    2: ['milk', 'dairy', 'eggs', 'butter', 'cheese'],
                    3: ['meat', 'chicken', 'beef', 'pork', 'seafood', 'salmon'],
                    4: ['frozen foods', 'ice cream'],
                    5: ['produce', 'vegetables', 'fruits', 'tomatoes', 'onions', 'carrots'],
                    6: ['pantry', 'canned goods', 'pasta', 'rice'],
                    7: ['spices', 'condiments', 'oils'],
                    8: ['beverages', 'water', 'juice'],
                    9: ['cleaning supplies'],
                    10: ['pharmacy', 'health']
                },
                shoppingRoute: [5, 3, 2, 1, 6, 7, 4, 8, 9, 10]
            }],
            ['Target', {
                aisles: {
                    'A': ['produce', 'vegetables', 'fruits', 'tomatoes', 'onions', 'carrots'],
                    'B': ['meat', 'chicken', 'beef', 'pork', 'seafood', 'salmon'],
                    'C': ['dairy', 'milk', 'eggs', 'butter', 'cheese'],
                    'D': ['frozen foods', 'ice cream'],
                    'E': ['bread', 'bakery items'],
                    'F': ['pantry', 'canned goods', 'pasta', 'rice'],
                    'G': ['beverages', 'water', 'juice'],
                    'H': ['spices', 'condiments', 'oils']
                },
                shoppingRoute: ['A', 'B', 'C', 'E', 'F', 'H', 'D', 'G']
            }],
            ['Kroger', {
                aisles: {
                    1: ['produce', 'vegetables', 'fruits'],
                    2: ['bakery', 'bread'],
                    3: ['meat', 'seafood'],
                    4: ['dairy', 'eggs'],
                    5: ['frozen'],
                    6: ['pantry', 'canned'],
                    7: ['beverages'],
                    8: ['household']
                },
                shoppingRoute: [1, 3, 4, 2, 6, 5, 7, 8]
            }]
        ]);

        // Household size quantity multipliers
        this.householdMultipliers = {
            1: 0.5,
            2: 0.8,
            3: 1.0,
            4: 1.3,
            5: 1.6,
            6: 1.9,
            '7+': 2.2
        };

        // Base quantities per serving
        this.baseQuantities = new Map([
            ['chicken breast', 0.25], // lbs per serving
            ['ground beef', 0.2],
            ['salmon fillet', 0.2],
            ['eggs', 0.5], // eggs per serving
            ['tomatoes', 0.15],
            ['onions', 0.1],
            ['carrots', 0.1],
            ['rice', 0.25], // cups per serving
            ['pasta', 0.25],
            ['milk', 0.5], // cups per serving
            ['cheese', 1], // oz per serving
            ['bread', 1] // slices per serving
        ]);
    }

    /**
     * Generate intelligent shopping list with advanced features
     */
    async generateIntelligentList(mealPlan, options = {}) {
        console.log('🧠 Generating intelligent shopping list...');
        
        const {
            householdSize = 4,
            budget = null,
            preferredStores = ['Walmart'],
            includeSubstitutions = true,
            optimizeForBulk = true,
            includeCoupons = true,
            shareWithFamily = false
        } = options;

        try {
            // Extract and analyze ingredients
            const ingredients = await this.extractIngredientsWithAnalysis(mealPlan);
            
            // Calculate intelligent quantities
            const quantifiedIngredients = this.calculateIntelligentQuantities(
                ingredients, householdSize, mealPlan.length
            );
            
            // Estimate costs with seasonal adjustments
            const costsWithPricing = await this.calculateCostsWithSeasonalPricing(quantifiedIngredients);
            
            // Organize by preferred stores
            const storeOrganizedLists = this.organizeByStores(costsWithPricing, preferredStores);
            
            // Apply budget management
            const budgetOptimizedLists = budget 
                ? this.optimizeForBudget(storeOrganizedLists, budget)
                : storeOrganizedLists;
            
            // Add bulk buying suggestions
            const bulkOptimizedLists = optimizeForBulk 
                ? this.addBulkBuyingSuggestions(budgetOptimizedLists)
                : budgetOptimizedLists;
            
            // Find applicable coupons
            const couponsAndDeals = includeCoupons 
                ? await this.findApplicableCoupons(bulkOptimizedLists)
                : {};
            
            // Generate smart substitutions
            const substitutions = includeSubstitutions 
                ? this.generateSmartSubstitutions(bulkOptimizedLists)
                : {};
            
            // Create comprehensive shopping list
            const intelligentList = {
                id: this.generateListId(),
                generated: new Date().toISOString(),
                metadata: {
                    householdSize,
                    budget,
                    preferredStores,
                    totalMeals: mealPlan.length,
                    estimatedShoppingTime: this.estimateShoppingTime(bulkOptimizedLists)
                },
                stores: bulkOptimizedLists,
                budget: {
                    total: this.calculateTotalCost(bulkOptimizedLists),
                    byStore: this.calculateCostsByStore(bulkOptimizedLists),
                    savings: couponsAndDeals.totalSavings || 0,
                    breakdown: this.generateCostBreakdown(bulkOptimizedLists)
                },
                coupons: couponsAndDeals,
                substitutions,
                recommendations: this.generateShoppingRecommendations(bulkOptimizedLists, options),
                sharing: shareWithFamily ? await this.setupFamilySharing(intelligentList) : null
            };

            // Save to database
            await this.saveShoppingList(intelligentList);
            
            console.log('✅ Intelligent shopping list generated:', intelligentList);
            return intelligentList;
            
        } catch (error) {
            console.error('❌ Error generating intelligent shopping list:', error);
            throw error;
        }
    }

    /**
     * Extract ingredients with nutritional and usage analysis
     */
    async extractIngredientsWithAnalysis(mealPlan) {
        const ingredients = [];
        const ingredientUsage = new Map();
        
        mealPlan.forEach((day, dayIndex) => {
            if (day && day.meals) {
                day.meals.forEach((meal, mealIndex) => {
                    const mealName = typeof meal === 'string' ? meal : meal.name;
                    const mealIngredients = this.extractIngredientsFromMeal(meal);
                    
                    mealIngredients.forEach(ingredient => {
                        const key = ingredient.toLowerCase();
                        
                        // Track usage frequency
                        if (!ingredientUsage.has(key)) {
                            ingredientUsage.set(key, {
                                count: 0,
                                meals: [],
                                days: new Set()
                            });
                        }
                        
                        const usage = ingredientUsage.get(key);
                        usage.count++;
                        usage.meals.push(mealName);
                        usage.days.add(dayIndex);
                        
                        ingredients.push({
                            name: ingredient,
                            normalizedName: key,
                            source: mealName,
                            day: dayIndex + 1,
                            mealIndex: mealIndex + 1,
                            complexity: this.analyzeMealComplexity(mealName)
                        });
                    });
                });
            }
        });
        
        // Add usage analysis to ingredients
        return ingredients.map(ingredient => ({
            ...ingredient,
            usage: ingredientUsage.get(ingredient.normalizedName)
        }));
    }

    /**
     * Calculate intelligent quantities based on multiple factors
     */
    calculateIntelligentQuantities(ingredients, householdSize, mealPlanDays) {
        const consolidatedIngredients = new Map();
        
        ingredients.forEach(ingredient => {
            const key = ingredient.normalizedName;
            const baseQuantity = this.baseQuantities.get(key) || 0.25;
            const householdMultiplier = this.householdMultipliers[householdSize] || 1.0;
            const complexityMultiplier = this.getComplexityMultiplier(ingredient.complexity);
            const usageMultiplier = this.getUsageMultiplier(ingredient.usage);
            
            const calculatedQuantity = baseQuantity * householdMultiplier * 
                                     complexityMultiplier * usageMultiplier;
            
            if (!consolidatedIngredients.has(key)) {
                consolidatedIngredients.set(key, {
                    name: ingredient.name,
                    normalizedName: key,
                    quantity: 0,
                    unit: this.getOptimalUnit(key),
                    sources: [],
                    usage: ingredient.usage,
                    estimatedCost: 0
                });
            }
            
            const item = consolidatedIngredients.get(key);
            item.quantity += calculatedQuantity;
            item.sources.push(ingredient.source);
        });
        
        // Round quantities to practical amounts
        return Array.from(consolidatedIngredients.values()).map(item => ({
            ...item,
            quantity: this.roundToPracticalQuantity(item.quantity, item.unit),
            sources: [...new Set(item.sources)]
        }));
    }

    /**
     * Calculate costs with seasonal pricing adjustments
     */
    async calculateCostsWithSeasonalPricing(ingredients) {
        const currentSeason = this.getCurrentSeason();
        
        return ingredients.map(ingredient => {
            const priceInfo = this.priceDatabase.get(ingredient.normalizedName);
            
            if (priceInfo) {
                const seasonalMultiplier = priceInfo.seasonal[currentSeason] || 1.0;
                const basePrice = priceInfo.base;
                const adjustedPrice = basePrice * seasonalMultiplier;
                const totalCost = adjustedPrice * ingredient.quantity;
                
                return {
                    ...ingredient,
                    pricePerUnit: adjustedPrice,
                    estimatedCost: Math.round(totalCost * 100) / 100,
                    seasonalAdjustment: seasonalMultiplier,
                    priceHistory: this.getPriceHistory(ingredient.normalizedName)
                };
            }
            
            // Fallback estimation for unknown items
            return {
                ...ingredient,
                pricePerUnit: 2.99,
                estimatedCost: Math.round(ingredient.quantity * 2.99 * 100) / 100,
                seasonalAdjustment: 1.0,
                estimated: true
            };
        });
    }

    /**
     * Organize shopping list by stores with aisle mapping
     */
    organizeByStores(ingredients, preferredStores) {
        const storeLists = {};
        
        preferredStores.forEach(storeName => {
            const storeLayout = this.storeLayouts.get(storeName);
            if (!storeLayout) return;
            
            const aisleMap = {};
            const unassignedItems = [];
            
            // Organize ingredients by aisle
            ingredients.forEach(ingredient => {
                let assigned = false;
                
                for (const [aisle, aisleItems] of Object.entries(storeLayout.aisles)) {
                    if (aisleItems.some(item => 
                        ingredient.normalizedName.includes(item.toLowerCase()) ||
                        item.toLowerCase().includes(ingredient.normalizedName)
                    )) {
                        if (!aisleMap[aisle]) {
                            aisleMap[aisle] = [];
                        }
                        aisleMap[aisle].push(ingredient);
                        assigned = true;
                        break;
                    }
                }
                
                if (!assigned) {
                    unassignedItems.push(ingredient);
                }
            });
            
            // Create optimized shopping route
            const shoppingRoute = this.createOptimizedRoute(aisleMap, storeLayout.shoppingRoute);
            
            storeList[storeName] = {
                name: storeName,
                aisles: aisleMap,
                unassignedItems,
                shoppingRoute,
                totalItems: ingredients.length,
                estimatedCost: ingredients.reduce((sum, item) => sum + item.estimatedCost, 0),
                estimatedTime: this.estimateStoreShoppingTime(ingredients.length)
            };
        });
        
        return storeList;
    }

    /**
     * Optimize shopping list for budget constraints
     */
    optimizeForBudget(storeLists, budget) {
        const optimizedLists = {};
        
        Object.entries(storeLists).forEach(([storeName, storeData]) => {
            const totalCost = storeData.estimatedCost;
            
            if (totalCost <= budget) {
                optimizedLists[storeName] = storeData;
                return;
            }
            
            // Budget optimization needed
            const prioritizedItems = this.prioritizeItemsForBudget(storeData);
            const budgetItems = this.selectItemsWithinBudget(prioritizedItems, budget);
            const removedItems = prioritizedItems.filter(item => !budgetItems.includes(item));
            
            optimizedLists[storeName] = {
                ...storeData,
                budgetOptimized: true,
                selectedItems: budgetItems,
                removedItems,
                budgetWarning: `Removed ${removedItems.length} items to stay within budget`,
                actualCost: budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0)
            };
        });
        
        return optimizedLists;
    }

    /**
     * Add bulk buying suggestions for cost savings
     */
    addBulkBuyingSuggestions(storeLists) {
        const bulkOptimizedLists = {};
        
        Object.entries(storeLists).forEach(([storeName, storeData]) => {
            const bulkSuggestions = [];
            
            // Analyze ingredients for bulk buying opportunities
            Object.values(storeData.aisles).flat().forEach(ingredient => {
                const bulkOpportunity = this.analyzeBulkOpportunity(ingredient);
                if (bulkOpportunity.recommended) {
                    bulkSuggestions.push(bulkOpportunity);
                }
            });
            
            bulkOptimizedLists[storeName] = {
                ...storeData,
                bulkSuggestions,
                potentialSavings: bulkSuggestions.reduce((sum, suggestion) => 
                    sum + suggestion.savings, 0)
            };
        });
        
        return bulkOptimizedLists;
    }

    /**
     * Find applicable coupons and deals
     */
    async findApplicableCoupons(storeLists) {
        const allIngredients = Object.values(storeLists)
            .flatMap(store => Object.values(store.aisles).flat());
        
        const applicableCoupons = [];
        let totalSavings = 0;
        
        // Mock coupon database lookup
        this.couponDatabase.forEach(coupon => {
            const matchingItems = allIngredients.filter(ingredient =>
                coupon.applicableItems.includes(ingredient.normalizedName)
            );
            
            if (matchingItems.length > 0) {
                const savings = this.calculateCouponSavings(coupon, matchingItems);
                applicableCoupons.push({
                    ...coupon,
                    matchingItems,
                    savings
                });
                totalSavings += savings;
            }
        });
        
        return {
            coupons: applicableCoupons,
            totalSavings,
            recommendations: this.generateCouponRecommendations(applicableCoupons)
        };
    }

    /**
     * Generate smart substitutions for better value or availability
     */
    generateSmartSubstitutions(storeLists) {
        const substitutions = {};
        
        Object.entries(storeLists).forEach(([storeName, storeData]) => {
            const storeSubstitutions = [];
            
            Object.values(storeData.aisles).flat().forEach(ingredient => {
                const alternatives = this.findSubstitutionAlternatives(ingredient);
                if (alternatives.length > 0) {
                    storeSubstitutions.push({
                        original: ingredient,
                        alternatives: alternatives.map(alt => ({
                            ...alt,
                            costDifference: alt.estimatedCost - ingredient.estimatedCost,
                            reason: this.getSubstitutionReason(ingredient, alt)
                        }))
                    });
                }
            });
            
            substitutions[storeName] = storeSubstitutions;
        });
        
        return substitutions;
    }

    /**
     * Setup family sharing for collaborative shopping
     */
    async setupFamilySharing(shoppingList) {
        return {
            enabled: true,
            shareCode: this.generateShareCode(),
            familyMembers: this.familyMembers,
            assignments: this.assignShoppingTasks(shoppingList),
            realTimeSync: true,
            notifications: {
                itemCompleted: true,
                listUpdated: true,
                budgetAlert: true
            }
        };
    }

    /**
     * Generate comprehensive shopping recommendations
     */
    generateShoppingRecommendations(storeLists, options) {
        const recommendations = [];
        
        // Time-based recommendations
        recommendations.push({
            type: 'timing',
            message: `Best shopping time: ${this.getBestShoppingTime()}`,
            priority: 'medium'
        });
        
        // Budget recommendations
        if (options.budget) {
            const totalCost = Object.values(storeLists)
                .reduce((sum, store) => sum + store.estimatedCost, 0);
            
            if (totalCost > options.budget * 0.9) {
                recommendations.push({
                    type: 'budget',
                    message: 'Consider store brands or bulk buying to save money',
                    priority: 'high'
                });
            }
        }
        
        // Seasonal recommendations
        const seasonalRecs = this.getSeasonalRecommendations(storeLists);
        recommendations.push(...seasonalRecs);
        
        return recommendations;
    }

    // Helper methods
    extractIngredientsFromMeal(meal) {
        // Simplified ingredient extraction
        const mealName = typeof meal === 'string' ? meal : meal.name;
        return this.extractBasicIngredients(mealName);
    }

    extractBasicIngredients(mealName) {
        const ingredients = [];
        const commonIngredients = [
            'chicken', 'beef', 'pork', 'fish', 'salmon', 'eggs', 'tofu',
            'rice', 'pasta', 'bread', 'potatoes', 'noodles',
            'tomatoes', 'onions', 'garlic', 'carrots', 'broccoli', 'spinach',
            'milk', 'cheese', 'butter', 'oil', 'salt', 'pepper'
        ];
        
        commonIngredients.forEach(ingredient => {
            if (mealName.toLowerCase().includes(ingredient)) {
                ingredients.push(ingredient);
            }
        });
        
        return ingredients.length > 0 ? ingredients : ['misc ingredients'];
    }

    analyzeMealComplexity(mealName) {
        const complexWords = ['gourmet', 'deluxe', 'premium', 'special', 'stuffed'];
        const simpleWords = ['simple', 'easy', 'quick', 'basic'];
        
        if (complexWords.some(word => mealName.toLowerCase().includes(word))) {
            return 'high';
        } else if (simpleWords.some(word => mealName.toLowerCase().includes(word))) {
            return 'low';
        }
        return 'medium';
    }

    getComplexityMultiplier(complexity) {
        const multipliers = { low: 0.8, medium: 1.0, high: 1.3 };
        return multipliers[complexity] || 1.0;
    }

    getUsageMultiplier(usage) {
        if (!usage) return 1.0;
        return Math.min(1.5, 1.0 + (usage.count - 1) * 0.1);
    }

    getOptimalUnit(ingredient) {
        const unitMap = {
            'chicken': 'lbs', 'beef': 'lbs', 'salmon': 'lbs',
            'eggs': 'dozen', 'milk': 'gallon', 'cheese': 'package',
            'rice': 'bag', 'pasta': 'box', 'bread': 'loaf'
        };
        return unitMap[ingredient] || 'unit';
    }

    roundToPracticalQuantity(quantity, unit) {
        if (unit === 'dozen') return Math.ceil(quantity / 12) * 12;
        if (unit === 'gallon') return Math.ceil(quantity);
        if (unit === 'lbs') return Math.round(quantity * 4) / 4; // Quarter pound increments
        return Math.ceil(quantity);
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    generateListId() {
        return 'smart_list_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateShareCode() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Additional helper methods would continue here...
    // (Implementing remaining functionality for brevity)

    async saveShoppingList(list) {
        try {
            const savedLists = JSON.parse(localStorage.getItem('smartShoppingLists') || '[]');
            savedLists.push(list);
            localStorage.setItem('smartShoppingLists', JSON.stringify(savedLists));
            localStorage.setItem('currentSmartShoppingList', JSON.stringify(list));
        } catch (error) {
            console.error('Error saving shopping list:', error);
        }
    }

    async loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('shoppingUserData') || '{}');
            this.userPreferences = userData.preferences || {};
            this.familyMembers = userData.familyMembers || [];
            this.budgetLimits = userData.budgetLimits || {};
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Export singleton instance
export const smartShoppingListManager = new SmartShoppingListManager();
