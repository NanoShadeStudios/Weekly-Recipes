/**
 * Voice Command Processor
 * Natural language processing for voice commands
 * Integrates with existing AI systems and app functionality
 */

class VoiceCommandProcessor {
    constructor(voiceControl, aiEngine) {
        this.voiceControl = voiceControl;
        this.aiEngine = aiEngine;
        this.commandHistory = [];
        this.contextStack = [];
        this.entityRecognition = new Map();
        this.isProcessing = false;
        
        this.initializeEntityRecognition();
    }

    initializeEntityRecognition() {
        // Food categories and types
        this.entityRecognition.set('cuisines', [
            'italian', 'mexican', 'chinese', 'indian', 'thai', 'japanese',
            'mediterranean', 'american', 'french', 'spanish', 'korean',
            'vietnamese', 'greek', 'moroccan', 'middle eastern', 'german'
        ]);

        this.entityRecognition.set('meals', [
            'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer',
            'brunch', 'late night', 'midnight snack'
        ]);

        this.entityRecognition.set('dietary', [
            'vegetarian', 'vegan', 'gluten free', 'dairy free', 'keto',
            'paleo', 'low carb', 'low fat', 'healthy', 'organic',
            'sugar free', 'nut free', 'soy free'
        ]);

        this.entityRecognition.set('ingredients', [
            'chicken', 'beef', 'pork', 'fish', 'salmon', 'pasta', 'rice',
            'potatoes', 'tomatoes', 'onions', 'garlic', 'cheese', 'eggs',
            'beans', 'quinoa', 'spinach', 'mushrooms', 'peppers', 'carrots'
        ]);

        this.entityRecognition.set('cooking_methods', [
            'grilled', 'baked', 'fried', 'steamed', 'roasted', 'sautéed',
            'boiled', 'slow cooked', 'instant pot', 'air fried', 'raw'
        ]);

        this.entityRecognition.set('time_constraints', [
            'quick', 'fast', 'slow', 'easy', 'simple', 'complex',
            '30 minutes', 'one hour', 'overnight', 'make ahead'
        ]);
    }

    async processCommand(transcript, confidence) {
        if (this.isProcessing) {
            return { success: false, message: 'Already processing a command' };
        }

        this.isProcessing = true;
        
        try {
            // Normalize the transcript
            const normalizedCommand = this.normalizeCommand(transcript);
            
            // Extract entities from the command
            const entities = this.extractEntities(normalizedCommand);
            
            // Determine the intent
            const intent = this.determineIntent(normalizedCommand, entities);
            
            // Process the command based on intent
            const result = await this.executeIntent(intent, entities, normalizedCommand);
            
            // Store in command history
            this.commandHistory.push({
                timestamp: Date.now(),
                transcript,
                confidence,
                intent,
                entities,
                result
            });

            return result;
        } catch (error) {
            this.log('Command processing error:', error);
            return { 
                success: false, 
                message: 'Sorry, I encountered an error processing that command.' 
            };
        } finally {
            this.isProcessing = false;
        }
    }

    // Internal logging methods
    log(message, ...args) {
        if (window.logger && window.logger.info) {
            window.logger.info(message, ...args);
        } else {
            console.log('[Voice Processor]', message, ...args);
        }
    }

    logError(message, ...args) {
        if (window.logger && window.logger.error) {
            window.logger.error(message, ...args);
        } else {
            console.error('[Voice Processor]', message, ...args);
        }
    }

    normalizeCommand(transcript) {
        return transcript
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    extractEntities(command) {
        const entities = {
            cuisines: [],
            meals: [],
            dietary: [],
            ingredients: [],
            cooking_methods: [],
            time_constraints: [],
            numbers: [],
            actions: []
        };

        // Extract numbers
        const numberMatches = command.match(/\b\d+\b/g);
        if (numberMatches) {
            entities.numbers = numberMatches.map(n => parseInt(n));
        }

        // Extract entities by category
        for (const [category, items] of this.entityRecognition) {
            for (const item of items) {
                if (command.includes(item)) {
                    entities[category].push(item);
                }
            }
        }

        // Extract action verbs
        const actionVerbs = [
            'find', 'search', 'show', 'get', 'make', 'create', 'generate',
            'add', 'remove', 'delete', 'like', 'dislike', 'save', 'pin',
            'rate', 'review', 'suggest', 'recommend', 'plan', 'schedule'
        ];

        for (const verb of actionVerbs) {
            if (command.includes(verb)) {
                entities.actions.push(verb);
            }
        }

        return entities;
    }

    determineIntent(command, entities) {
        const intents = [
            {
                name: 'SEARCH_MEALS',
                patterns: [/search|find|show|look for/],
                entities: ['cuisines', 'ingredients', 'dietary', 'cooking_methods']
            },
            {
                name: 'GENERATE_MEAL_PLAN',
                patterns: [/generate|create|make.*plan|plan.*meal/],
                entities: ['meals', 'time_constraints']
            },
            {
                name: 'MEAL_PREFERENCE',
                patterns: [/like|love|favorite|prefer/],
                entities: ['cuisines', 'ingredients', 'cooking_methods']
            },
            {
                name: 'MEAL_DISLIKE',
                patterns: [/dislike|hate|don't like|avoid/],
                entities: ['cuisines', 'ingredients', 'cooking_methods']
            },
            {
                name: 'RATE_MEAL',
                patterns: [/rate|rating|stars|score/],
                entities: ['numbers']
            },
            {
                name: 'SHOPPING_LIST',
                patterns: [/shopping|buy|grocery|store/],
                entities: ['ingredients']
            },
            {
                name: 'NAVIGATION',
                patterns: [/go to|show|open|navigate/],
                entities: []
            },
            {
                name: 'NUTRITION_INFO',
                patterns: [/nutrition|calories|protein|carbs|fat/],
                entities: ['numbers']
            },
            {
                name: 'AI_SUGGESTION',
                patterns: [/suggest|recommend|what should|advice/],
                entities: ['meals', 'time_constraints']
            }
        ];

        for (const intent of intents) {
            // Check if command matches any patterns
            const matchesPattern = intent.patterns.some(pattern => pattern.test(command));
            
            if (matchesPattern) {
                // Calculate confidence based on entity presence
                const entityScore = intent.entities.length > 0 ? 
                    intent.entities.reduce((score, entityType) => 
                        score + (entities[entityType]?.length > 0 ? 1 : 0), 0) / intent.entities.length 
                    : 1;

                return {
                    name: intent.name,
                    confidence: entityScore,
                    matchedPattern: intent.patterns.find(p => p.test(command))
                };
            }
        }

        return { name: 'UNKNOWN', confidence: 0 };
    }

    async executeIntent(intent, entities, command) {
        switch (intent.name) {
            case 'SEARCH_MEALS':
                return this.handleSearchMeals(entities, command);
            
            case 'GENERATE_MEAL_PLAN':
                return this.handleGenerateMealPlan(entities, command);
            
            case 'MEAL_PREFERENCE':
                return this.handleMealPreference(entities, command, true);
            
            case 'MEAL_DISLIKE':
                return this.handleMealPreference(entities, command, false);
            
            case 'RATE_MEAL':
                return this.handleRateMeal(entities, command);
            
            case 'SHOPPING_LIST':
                return this.handleShoppingList(entities, command);
            
            case 'NAVIGATION':
                return this.handleNavigation(entities, command);
            
            case 'NUTRITION_INFO':
                return this.handleNutritionInfo(entities, command);
            
            case 'AI_SUGGESTION':
                return this.handleAISuggestion(entities, command);
            
            default:
                return this.handleUnknownIntent(command);
        }
    }

    async handleSearchMeals(entities, command) {
        const searchTerms = [];
        
        // Build search query from entities
        if (entities.cuisines.length > 0) {
            searchTerms.push(...entities.cuisines);
        }
        if (entities.ingredients.length > 0) {
            searchTerms.push(...entities.ingredients);
        }
        if (entities.dietary.length > 0) {
            searchTerms.push(...entities.dietary);
        }
        if (entities.cooking_methods.length > 0) {
            searchTerms.push(...entities.cooking_methods);
        }

        const searchQuery = searchTerms.join(' ');
        
        try {
            // Perform the search
            const results = await this.performMealSearch(searchQuery);
            
            const responseMessage = searchTerms.length > 0 
                ? `Found ${results.length} ${searchQuery} recipes.`
                : `Found ${results.length} recipes matching your request.`;

            return {
                success: true,
                message: responseMessage,
                data: { results, searchQuery }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, I couldn\'t search for meals right now.'
            };
        }
    }

    async handleGenerateMealPlan(entities, command) {
        try {
            const preferences = {
                mealTypes: entities.meals,
                timeConstraints: entities.time_constraints,
                includeFavorites: true
            };

            // Navigate to weekly plan
            this.voiceControl.navigateToTab('weeklyPlan');
            
            // Wait for navigation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate meal plan
            if (window.generateMeals) {
                await window.generateMeals(preferences);
                return {
                    success: true,
                    message: 'Your personalized meal plan has been generated!'
                };
            } else {
                return {
                    success: false,
                    message: 'Meal generation is not available right now.'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, I couldn\'t generate a meal plan right now.'
            };
        }
    }

    async handleMealPreference(entities, command, isLike) {
        try {
            const preferences = {
                cuisines: entities.cuisines,
                ingredients: entities.ingredients,
                cooking_methods: entities.cooking_methods
            };

            if (this.aiEngine) {
                // Update AI preferences
                for (const cuisine of preferences.cuisines) {
                    if (isLike) {
                        await this.aiEngine.learnFromLike({ cuisine });
                    } else {
                        await this.aiEngine.learnFromDislike({ cuisine });
                    }
                }

                for (const ingredient of preferences.ingredients) {
                    if (isLike) {
                        await this.aiEngine.learnFromLike({ mainIngredient: ingredient });
                    } else {
                        await this.aiEngine.learnFromDislike({ mainIngredient: ingredient });
                    }
                }
            }

            const action = isLike ? 'added to favorites' : 'added to dislikes';
            const items = [...preferences.cuisines, ...preferences.ingredients, ...preferences.cooking_methods];
            
            return {
                success: true,
                message: `${items.join(', ')} ${action}. I'll remember your preferences!`
            };
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, I couldn\'t update your preferences right now.'
            };
        }
    }

    async handleRateMeal(entities, command) {
        try {
            const rating = entities.numbers.length > 0 ? entities.numbers[0] : null;
            
            if (rating && rating >= 1 && rating <= 5) {
                // Find current meal and rate it
                const currentMeal = this.getCurrentMeal();
                
                if (currentMeal && window.mealRatingUI) {
                    await window.mealRatingUI.submitRating(currentMeal.id, rating, 'Voice command rating');
                    return {
                        success: true,
                        message: `Rated the meal ${rating} stars. Thanks for the feedback!`
                    };
                } else {
                    return {
                        success: false,
                        message: 'Please select a meal first, then try rating it.'
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'Please specify a rating from 1 to 5 stars.'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, I couldn\'t rate the meal right now.'
            };
        }
    }

    async handleShoppingList(entities, command) {
        try {
            const ingredients = entities.ingredients;
            
            if (ingredients.length > 0) {
                // Navigate to shopping list
                this.voiceControl.navigateToTab('shoppingList');
                
                // Add ingredients
                for (const ingredient of ingredients) {
                    await this.addToShoppingList(ingredient);
                }
                
                return {
                    success: true,
                    message: `Added ${ingredients.join(', ')} to your shopping list.`
                };
            } else {
                return {
                    success: false,
                    message: 'Please specify what ingredients to add to the shopping list.'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, I couldn\'t update your shopping list right now.'
            };
        }
    }

    async handleNavigation(entities, command) {
        const navigationMap = {
            'weekly plan': 'weeklyPlan',
            'my foods': 'myFoods',
            'favorite foods': 'myFoods',
            'preferences': 'preferences',
            'ai preferences': 'preferences',
            'shopping list': 'shoppingList',
            'shopping': 'shoppingList',
            'nutrition': 'nutrition',
            'ratings': 'ratings',
            'meal ratings': 'ratings',
            'seasonal': 'seasonal',
            'calendar': 'calendar',
            'community': 'community',
            'profile': 'profile'
        };

        for (const [phrase, tabId] of Object.entries(navigationMap)) {
            if (command.includes(phrase)) {
                this.voiceControl.navigateToTab(tabId);
                return {
                    success: true,
                    message: `Navigated to ${phrase}.`
                };
            }
        }

        return {
            success: false,
            message: 'I couldn\'t determine where you want to navigate.'
        };
    }

    async handleAISuggestion(entities, command) {
        try {
            if (this.aiEngine) {
                const suggestion = await this.aiEngine.generatePersonalizedSuggestion({
                    mealType: entities.meals[0],
                    timeConstraint: entities.time_constraints[0]
                });

                if (suggestion) {
                    return {
                        success: true,
                        message: `I suggest ${suggestion.name}. It's ${suggestion.description}. ${suggestion.reason}`,
                        data: suggestion
                    };
                }
            }

            return {
                success: false,
                message: 'I couldn\'t generate a suggestion right now. Please try again.'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Sorry, the AI suggestion service is not available.'
            };
        }
    }

    handleUnknownIntent(command) {
        // Try to provide helpful feedback
        const suggestions = [
            'Try saying "generate meals" to create a meal plan',
            'Say "search for Italian food" to find recipes',
            'Try "go to shopping list" to navigate',
            'Say "help" to see all available commands'
        ];

        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        return {
            success: false,
            message: `I didn't understand that command. ${randomSuggestion}`
        };
    }

    // Helper methods
    async performMealSearch(query) {
        // This would integrate with the existing search functionality
        if (window.searchMeals) {
            return await window.searchMeals(query);
        }
        return [];
    }

    getCurrentMeal() {
        // Get the currently selected or focused meal
        const selectedMeal = document.querySelector('.meal-card.selected');
        if (selectedMeal) {
            return {
                id: selectedMeal.dataset.mealId,
                name: selectedMeal.querySelector('.meal-name')?.textContent
            };
        }
        return null;
    }

    async addToShoppingList(ingredient) {
        // This would integrate with the existing shopping list functionality
        if (window.addToShoppingList) {
            return await window.addToShoppingList(ingredient);
        }
    }

    getCommandHistory() {
        return this.commandHistory;
    }

    clearHistory() {
        this.commandHistory = [];
    }

    // Context management for multi-turn conversations
    pushContext(context) {
        this.contextStack.push(context);
    }

    popContext() {
        return this.contextStack.pop();
    }

    getCurrentContext() {
        return this.contextStack[this.contextStack.length - 1] || null;
    }
}

// Export for use with voice control
if (typeof window !== 'undefined') {
    window.VoiceCommandProcessor = VoiceCommandProcessor;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceCommandProcessor;
}
