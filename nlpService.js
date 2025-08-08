/**
 * Natural Language Processing Service for Meal Requests
 * Processes user natural language input and converts it to meal preferences
 */

class NLPService {
    constructor() {
        this.keywords = this.initializeKeywords();
        this.patterns = this.initializePatterns();
        this.contextMemory = new Map(); // Remember conversation context
        this.lastRequest = null;
    }

    /**
     * Initialize keyword mappings for different categories
     */
    initializeKeywords() {
        return {
            // Meal types
            mealTypes: {
                'breakfast': ['breakfast', 'morning', 'brunch', 'cereal', 'eggs', 'pancakes', 'toast'],
                'lunch': ['lunch', 'midday', 'sandwich', 'salad', 'soup'],
                'dinner': ['dinner', 'evening', 'supper', 'main course'],
                'snack': ['snack', 'light', 'appetizer', 'finger food'],
                'dessert': ['dessert', 'sweet', 'cake', 'cookies', 'ice cream']
            },

            // Cuisines
            cuisines: {
                'italian': ['italian', 'pasta', 'pizza', 'risotto', 'lasagna', 'spaghetti'],
                'mexican': ['mexican', 'tacos', 'burrito', 'enchilada', 'quesadilla', 'salsa'],
                'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean', 'sushi', 'stir fry', 'ramen'],
                'indian': ['indian', 'curry', 'tandoori', 'biryani', 'masala', 'naan'],
                'mediterranean': ['mediterranean', 'greek', 'hummus', 'olives', 'feta', 'tzatziki'],
                'american': ['american', 'burger', 'bbq', 'wings', 'mac and cheese'],
                'french': ['french', 'croissant', 'baguette', 'coq au vin', 'ratatouille']
            },

            // Dietary restrictions
            dietary: {
                'vegetarian': ['vegetarian', 'veggie', 'no meat', 'plant based'],
                'vegan': ['vegan', 'no dairy', 'no eggs', 'plant only'],
                'gluten-free': ['gluten free', 'no gluten', 'celiac', 'wheat free'],
                'dairy-free': ['dairy free', 'lactose free', 'no milk', 'no cheese'],
                'nut-free': ['nut free', 'no nuts', 'allergy'],
                'low-carb': ['low carb', 'keto', 'no carbs', 'atkins'],
                'low-fat': ['low fat', 'lean', 'light']
            },

            // Cooking methods
            cookingMethods: {
                'quick': ['quick', 'fast', 'easy', 'simple', '15 minutes', '20 minutes', 'no cook'],
                'slow': ['slow cooked', 'braised', 'stewed', 'slow cooker', 'crockpot'],
                'grilled': ['grilled', 'bbq', 'barbecue', 'charred'],
                'baked': ['baked', 'roasted', 'oven'],
                'fried': ['fried', 'crispy', 'golden'],
                'steamed': ['steamed', 'healthy', 'light']
            },

            // Ingredients
            proteins: {
                'chicken': ['chicken', 'poultry'],
                'beef': ['beef', 'steak', 'ground beef'],
                'pork': ['pork', 'bacon', 'ham'],
                'fish': ['fish', 'salmon', 'tuna', 'cod'],
                'seafood': ['seafood', 'shrimp', 'crab', 'lobster'],
                'tofu': ['tofu', 'tempeh', 'seitan'],
                'beans': ['beans', 'lentils', 'chickpeas', 'legumes']
            },

            // Mood/preference indicators
            moods: {
                'healthy': ['healthy', 'nutritious', 'clean', 'wholesome', 'good for me'],
                'comfort': ['comfort', 'cozy', 'hearty', 'warming', 'satisfying'],
                'fresh': ['fresh', 'crisp', 'light', 'refreshing', 'spring'],
                'indulgent': ['indulgent', 'rich', 'decadent', 'treat', 'cheat meal'],
                'exotic': ['exotic', 'adventurous', 'unusual', 'different', 'new'],
                'familiar': ['familiar', 'classic', 'traditional', 'home style']
            },

            // Time indicators
            timeContext: {
                'today': ['today', 'tonight', 'this evening', 'now'],
                'tomorrow': ['tomorrow', 'next meal'],
                'weekend': ['weekend', 'saturday', 'sunday'],
                'week': ['this week', 'weekly', 'meal prep']
            }
        };
    }

    /**
     * Initialize regex patterns for complex parsing
     */
    initializePatterns() {
        return [
            // "I want/need/like..." patterns
            {
                pattern: /(?:i\s+(?:want|need|like|love|crave|fancy)|give\s+me|make\s+me|suggest|recommend)\s+(.+)/i,
                extractor: 'extractWantPattern'
            },
            // "Something..." patterns
            {
                pattern: /(?:something|anything)\s+(.+)/i,
                extractor: 'extractSomethingPattern'
            },
            // "What should I..." patterns
            {
                pattern: /what\s+should\s+i\s+(?:eat|cook|make|have)\s*(?:for\s+)?(.+)?/i,
                extractor: 'extractWhatShouldPattern'
            },
            // Time-specific patterns
            {
                pattern: /(?:for\s+)?(breakfast|lunch|dinner|snack|dessert)/i,
                extractor: 'extractMealTimePattern'
            },
            // Ingredient-based patterns
            {
                pattern: /(?:with|using|containing)\s+(.+)/i,
                extractor: 'extractIngredientPattern'
            }
        ];
    }

    /**
     * Main method to process natural language meal requests
     * @param {string} userInput - The user's natural language input
     * @param {Object} context - Additional context (user preferences, available ingredients, etc.)
     * @returns {Object} Parsed meal preferences
     */
    async processMealRequest(userInput, context = {}) {
        try {
            // Normalize input
            const normalizedInput = this.normalizeInput(userInput);
            
            // Initialize result structure
            const mealPreferences = {
                mealType: null,
                cuisine: null,
                dietary: [],
                cookingMethod: null,
                protein: null,
                mood: null,
                timeContext: null,
                ingredients: [],
                keywords: [],
                confidence: 0,
                originalInput: userInput,
                parsedComponents: []
            };

            // Apply pattern matching
            this.applyPatterns(normalizedInput, mealPreferences);

            // Extract keywords
            this.extractKeywords(normalizedInput, mealPreferences);

            // Calculate confidence score
            mealPreferences.confidence = this.calculateConfidence(mealPreferences);

            // Apply context and memory
            this.applyContext(mealPreferences, context);

            // Store this request for future context
            this.lastRequest = mealPreferences;

            console.log('NLP Service processed request:', {
                input: userInput,
                preferences: mealPreferences
            });

            return mealPreferences;

        } catch (error) {
            console.error('Error processing meal request:', error);
            return this.getDefaultPreferences(userInput);
        }
    }

    /**
     * Normalize user input for better processing
     */
    normalizeInput(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize spaces
    }

    /**
     * Apply pattern matching to extract structured information
     */
    applyPatterns(input, preferences) {
        for (const pattern of this.patterns) {
            const match = input.match(pattern.pattern);
            if (match) {
                this[pattern.extractor](match, preferences);
                preferences.parsedComponents.push({
                    pattern: pattern.pattern.toString(),
                    match: match[0],
                    extracted: match[1] || ''
                });
            }
        }
    }

    /**
     * Extract keywords from all categories
     */
    extractKeywords(input, preferences) {
        const words = input.split(' ');
        
        // Check each category
        Object.entries(this.keywords).forEach(([category, subcategories]) => {
            Object.entries(subcategories).forEach(([subcategory, keywords]) => {
                keywords.forEach(keyword => {
                    if (input.includes(keyword)) {
                        preferences.keywords.push(keyword);
                        
                        // Assign to appropriate preference category
                        switch (category) {
                            case 'mealTypes':
                                preferences.mealType = subcategory;
                                break;
                            case 'cuisines':
                                preferences.cuisine = subcategory;
                                break;
                            case 'dietary':
                                if (!preferences.dietary.includes(subcategory)) {
                                    preferences.dietary.push(subcategory);
                                }
                                break;
                            case 'cookingMethods':
                                preferences.cookingMethod = subcategory;
                                break;
                            case 'proteins':
                                preferences.protein = subcategory;
                                break;
                            case 'moods':
                                preferences.mood = subcategory;
                                break;
                            case 'timeContext':
                                preferences.timeContext = subcategory;
                                break;
                        }
                    }
                });
            });
        });
    }

    /**
     * Pattern extractors
     */
    extractWantPattern(match, preferences) {
        const wantText = match[1];
        // Re-process the "want" text for more specific patterns
        this.extractKeywords(wantText, preferences);
    }

    extractSomethingPattern(match, preferences) {
        const somethingText = match[1];
        this.extractKeywords(somethingText, preferences);
    }

    extractWhatShouldPattern(match, preferences) {
        const context = match[1] || '';
        if (context) {
            this.extractKeywords(context, preferences);
        }
    }

    extractMealTimePattern(match, preferences) {
        preferences.mealType = match[1].toLowerCase();
    }

    extractIngredientPattern(match, preferences) {
        const ingredientText = match[1];
        // Split by common separators and add to ingredients
        const ingredients = ingredientText.split(/,|\sand\s|\sor\s/).map(i => i.trim());
        preferences.ingredients.push(...ingredients);
    }

    /**
     * Calculate confidence score based on how much we understood
     */
    calculateConfidence(preferences) {
        let score = 0;
        
        if (preferences.mealType) score += 20;
        if (preferences.cuisine) score += 20;
        if (preferences.dietary.length > 0) score += 15;
        if (preferences.cookingMethod) score += 15;
        if (preferences.protein) score += 10;
        if (preferences.mood) score += 10;
        if (preferences.ingredients.length > 0) score += 10;
        
        return Math.min(score, 100);
    }

    /**
     * Apply additional context from user preferences and history
     */
    applyContext(preferences, context) {
        // Apply user's saved dietary restrictions
        if (context.userDietary && context.userDietary.length > 0) {
            context.userDietary.forEach(restriction => {
                if (!preferences.dietary.includes(restriction)) {
                    preferences.dietary.push(restriction);
                }
            });
        }

        // Consider available ingredients
        if (context.availableIngredients && preferences.ingredients.length === 0) {
            // If no specific ingredients mentioned, we could suggest using available ones
            preferences.availableIngredients = context.availableIngredients;
        }

        // Apply time context
        if (!preferences.timeContext && context.currentTime) {
            const hour = new Date(context.currentTime).getHours();
            if (hour < 10) preferences.mealType = 'breakfast';
            else if (hour < 14) preferences.mealType = 'lunch';
            else if (hour < 18) preferences.mealType = 'snack';
            else preferences.mealType = 'dinner';
        }
    }

    /**
     * Generate human-readable interpretation of the request
     */
    generateInterpretation(preferences) {
        const parts = [];
        
        if (preferences.mealType) {
            parts.push(`a ${preferences.mealType}`);
        }
        
        if (preferences.mood) {
            parts.push(`that's ${preferences.mood}`);
        }
        
        if (preferences.cuisine) {
            parts.push(`with ${preferences.cuisine} flavors`);
        }
        
        if (preferences.cookingMethod) {
            parts.push(`that's ${preferences.cookingMethod} to make`);
        }
        
        if (preferences.protein) {
            parts.push(`featuring ${preferences.protein}`);
        }
        
        if (preferences.dietary.length > 0) {
            parts.push(`that's ${preferences.dietary.join(' and ')}`);
        }
        
        if (preferences.ingredients.length > 0) {
            parts.push(`using ${preferences.ingredients.join(', ')}`);
        }
        
        return parts.length > 0 ? 
            `I understand you want ${parts.join(' ')}.` :
            "I'll help you find a great meal!";
    }

    /**
     * Get default preferences when parsing fails
     */
    getDefaultPreferences(originalInput) {
        return {
            mealType: null,
            cuisine: null,
            dietary: [],
            cookingMethod: null,
            protein: null,
            mood: null,
            timeContext: null,
            ingredients: [],
            keywords: [],
            confidence: 0,
            originalInput: originalInput,
            parsedComponents: []
        };
    }

    /**
     * Get suggestions for improving unclear requests
     */
    getSuggestions(preferences) {
        const suggestions = [];
        
        if (preferences.confidence < 30) {
            suggestions.push("Try being more specific about what type of meal you want");
        }
        
        if (!preferences.mealType) {
            suggestions.push("What meal is this for? (breakfast, lunch, dinner, snack)");
        }
        
        if (!preferences.mood && !preferences.cuisine) {
            suggestions.push("What kind of flavors are you in the mood for?");
        }
        
        return suggestions;
    }
}

// Export for ES6 modules
export { NLPService };
export default NLPService;
