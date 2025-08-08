/**
 * Conversational AI Interface for Meal Planning
 * Provides natural language interaction for meal requests and planning
 */

class ConversationalAI {
    constructor(mealGenerator, nlpService) {
        this.mealGenerator = mealGenerator;
        this.nlpService = nlpService;
        this.conversationHistory = [];
        this.currentContext = {};
        this.isActive = false;
        
        this.initializeUI();
    }

    /**
     * Initialize the conversational UI components
     */
    initializeUI() {
        this.createChatInterface();
        this.attachEventListeners();
    }

    /**
     * Create the chat interface HTML
     */
    createChatInterface() {
        const chatHTML = `
            <div id="conversational-ai" class="conversational-ai hidden">
                <div class="chat-header">
                    <h3>🤖 Meal Planning Assistant</h3>
                    <button id="close-chat" class="close-chat-btn" aria-label="Close chat">×</button>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <div class="message ai-message">
                        <div class="message-content">
                            Hi! I'm your meal planning assistant. You can ask me things like:
                            <ul>
                                <li>"I want something healthy for dinner"</li>
                                <li>"Give me a quick vegetarian lunch"</li>
                                <li>"What should I cook with chicken?"</li>
                                <li>"I need a comfort food recipe"</li>
                            </ul>
                            What can I help you find today?
                        </div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="input-group">
                        <input 
                            type="text" 
                            id="chat-input" 
                            placeholder="Ask me about meals... (e.g., 'I want something healthy for dinner')"
                            autocomplete="off"
                        >
                        <button id="send-message" class="send-btn" aria-label="Send message">
                            <span class="send-icon">➤</span>
                        </button>
                    </div>
                    <div class="quick-suggestions" id="quick-suggestions">
                        <button class="suggestion-btn" data-suggestion="I want something healthy">Something healthy</button>
                        <button class="suggestion-btn" data-suggestion="Give me a quick meal">Quick meal</button>
                        <button class="suggestion-btn" data-suggestion="What's for dinner tonight?">Dinner ideas</button>
                        <button class="suggestion-btn" data-suggestion="I need comfort food">Comfort food</button>
                    </div>
                </div>
                
                <div class="typing-indicator hidden" id="typing-indicator">
                    <span>AI is thinking...</span>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        // Add to the main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', chatHTML);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const closeButton = document.getElementById('close-chat');
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideChat());
        }

        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                chatInput.value = suggestion;
                this.sendMessage();
            });
        });
    }

    /**
     * Show the chat interface
     */
    showChat() {
        const chatContainer = document.getElementById('conversational-ai');
        if (chatContainer) {
            chatContainer.classList.remove('hidden');
            this.isActive = true;
            
            // Focus on input
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }
    }

    /**
     * Hide the chat interface
     */
    hideChat() {
        const chatContainer = document.getElementById('conversational-ai');
        if (chatContainer) {
            chatContainer.classList.add('hidden');
            this.isActive = false;
        }
    }

    /**
     * Send a message to the AI
     */
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput?.value.trim();

        if (!message) return;

        // Clear input
        chatInput.value = '';

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Process the message
            const response = await this.processUserMessage(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response.message, 'ai', response.data);

        } catch (error) {
            console.error('Error processing message:', error);
            this.hideTypingIndicator();
            this.addMessage("I'm sorry, I had trouble understanding that. Could you try rephrasing your request?", 'ai');
        }
    }

    /**
     * Process user message and generate response
     */
    async processUserMessage(message) {
        // Store the conversation
        this.conversationHistory.push({
            type: 'user',
            message: message,
            timestamp: new Date()
        });

        // Parse the message with NLP
        const mealPreferences = await this.nlpService.processMealRequest(message, {
            userDietary: this.getUserDietaryRestrictions(),
            availableIngredients: this.getAvailableIngredients(),
            currentTime: new Date()
        });

        // Generate interpretation
        const interpretation = this.nlpService.generateInterpretation(mealPreferences);

        // If confidence is too low, ask for clarification
        if (mealPreferences.confidence < 30) {
            const suggestions = this.nlpService.getSuggestions(mealPreferences);
            return {
                message: `I'm not sure I fully understood your request. ${suggestions.join(' ')} Could you be more specific?`,
                data: { preferences: mealPreferences, needsClarity: true }
            };
        }

        // Generate meal suggestions based on preferences
        const mealSuggestions = await this.generateMealSuggestions(mealPreferences);

        if (mealSuggestions.length === 0) {
            return {
                message: `${interpretation} Unfortunately, I couldn't find any meals matching your criteria. Would you like to try with different requirements?`,
                data: { preferences: mealPreferences, noResults: true }
            };
        }

        // Create response with meal suggestions
        const responseMessage = this.createMealSuggestionsResponse(interpretation, mealSuggestions, mealPreferences);

        return {
            message: responseMessage,
            data: { 
                preferences: mealPreferences, 
                meals: mealSuggestions,
                interpretation: interpretation
            }
        };
    }

    /**
     * Generate meal suggestions based on parsed preferences
     */
    async generateMealSuggestions(preferences) {
        try {
            // Convert NLP preferences to meal generator format
            const generatorPreferences = this.convertToGeneratorFormat(preferences);
            
            // Get available meals
            let availableMeals = [];
            if (this.mealGenerator && typeof this.mealGenerator.getAvailableMeals === 'function') {
                availableMeals = this.mealGenerator.getAvailableMeals();
            } else if (Array.isArray(this.mealGenerator)) {
                availableMeals = this.mealGenerator;
            } else {
                // Fallback meal list
                availableMeals = [
                    { name: 'Chicken Stir Fry', cuisine: 'asian', ingredients: ['chicken', 'vegetables'], prepTime: '25' },
                    { name: 'Vegetable Pasta', cuisine: 'italian', ingredients: ['pasta', 'vegetables'], prepTime: '20' },
                    { name: 'Grilled Salmon', cuisine: 'american', ingredients: ['salmon', 'lemon'], prepTime: '30' },
                    { name: 'Caesar Salad', cuisine: 'american', ingredients: ['lettuce', 'cheese'], prepTime: '15' },
                    { name: 'Beef Tacos', cuisine: 'mexican', ingredients: ['beef', 'tortillas'], prepTime: '20' },
                    { name: 'Vegetable Curry', cuisine: 'indian', ingredients: ['vegetables', 'curry'], prepTime: '35' },
                    { name: 'Greek Yogurt Bowl', cuisine: 'mediterranean', ingredients: ['yogurt', 'berries'], prepTime: '5' }
                ];
            }
            
            // Filter meals based on preferences
            const filteredMeals = this.filterMealsByPreferences(availableMeals, preferences);
            
            // Return top 3-5 suggestions
            return filteredMeals.slice(0, 5);

        } catch (error) {
            console.error('Error generating meal suggestions:', error);
            return this.getFallbackMeals().slice(0, 3);
        }
    }

    /**
     * Get fallback meals when no meal generator is available
     */
    getFallbackMeals() {
        return [
            { name: 'Chicken Stir Fry', cuisine: 'asian', ingredients: ['chicken', 'vegetables'], prepTime: '25', difficulty: 'easy' },
            { name: 'Vegetable Pasta', cuisine: 'italian', ingredients: ['pasta', 'vegetables'], prepTime: '20', difficulty: 'easy' },
            { name: 'Grilled Salmon', cuisine: 'american', ingredients: ['salmon', 'lemon'], prepTime: '30', difficulty: 'medium' },
            { name: 'Caesar Salad', cuisine: 'american', ingredients: ['lettuce', 'cheese'], prepTime: '15', difficulty: 'easy' },
            { name: 'Beef Tacos', cuisine: 'mexican', ingredients: ['beef', 'tortillas'], prepTime: '20', difficulty: 'easy' },
            { name: 'Vegetable Curry', cuisine: 'indian', ingredients: ['vegetables', 'curry'], prepTime: '35', difficulty: 'medium' },
            { name: 'Greek Yogurt Bowl', cuisine: 'mediterranean', ingredients: ['yogurt', 'berries'], prepTime: '5', difficulty: 'easy' },
            { name: 'Quinoa Bowl', cuisine: 'mediterranean', ingredients: ['quinoa', 'vegetables'], prepTime: '25', difficulty: 'easy' },
            { name: 'Smoothie Bowl', cuisine: 'american', ingredients: ['berries', 'yogurt', 'granola'], prepTime: '10', difficulty: 'easy' },
            { name: 'Pancakes', cuisine: 'american', ingredients: ['flour', 'eggs', 'milk'], prepTime: '20', difficulty: 'easy' }
        ];
    }

    /**
     * Convert NLP preferences to meal generator format
     */
    convertToGeneratorFormat(nlpPrefs) {
        return {
            dietaryRestrictions: nlpPrefs.dietary,
            preferredCuisine: nlpPrefs.cuisine,
            mealType: nlpPrefs.mealType,
            cookingMethod: nlpPrefs.cookingMethod,
            protein: nlpPrefs.protein,
            ingredients: nlpPrefs.ingredients,
            mood: nlpPrefs.mood
        };
    }

    /**
     * Filter meals based on NLP preferences
     */
    filterMealsByPreferences(meals, preferences) {
        let filteredMeals = meals.filter(meal => {
            // Apply dietary restrictions
            if (preferences.dietary.length > 0) {
                const meetsRestrictions = preferences.dietary.every(restriction => {
                    switch (restriction) {
                        case 'vegetarian':
                            return !meal.ingredients?.some(ing => 
                                ['chicken', 'beef', 'pork', 'fish', 'meat'].some(meat => 
                                    ing.toLowerCase().includes(meat)
                                )
                            );
                        case 'vegan':
                            return !meal.ingredients?.some(ing => {
                                const ingredient = ing.toLowerCase();
                                return ['chicken', 'beef', 'pork', 'fish', 'meat', 'cheese', 'milk', 'eggs', 'yogurt', 'butter'].some(animal => 
                                    ingredient.includes(animal)
                                );
                            });
                        case 'gluten-free':
                            return !meal.ingredients?.some(ing => 
                                ['wheat', 'flour', 'pasta', 'bread'].some(gluten => 
                                    ing.toLowerCase().includes(gluten)
                                )
                            );
                        default:
                            return true;
                    }
                });
                if (!meetsRestrictions) return false;
            }

            // Filter by cuisine
            if (preferences.cuisine && meal.cuisine) {
                if (meal.cuisine.toLowerCase() !== preferences.cuisine.toLowerCase()) {
                    return false;
                }
            }

            // Filter by protein
            if (preferences.protein && meal.ingredients) {
                const hasProtein = meal.ingredients.some(ing => 
                    ing.toLowerCase().includes(preferences.protein.toLowerCase())
                );
                if (!hasProtein) return false;
            }

            // Filter by cooking method (if available in meal data)
            if (preferences.cookingMethod === 'quick' && meal.prepTime) {
                const prepTime = parseInt(meal.prepTime);
                if (prepTime > 30) return false;
            }

            return true;
        });

        // If no meals match the criteria, return a subset of all meals
        if (filteredMeals.length === 0) {
            console.log('No meals matched criteria, returning subset of all meals');
            filteredMeals = meals.slice(0, 3);
        }

        return filteredMeals;
    }

    /**
     * Create response message with meal suggestions
     */
    createMealSuggestionsResponse(interpretation, meals, preferences) {
        let response = `${interpretation}\n\nHere are some great options for you:\n\n`;

        meals.forEach((meal, index) => {
            response += `**${index + 1}. ${meal.name || meal}**\n`;
            if (meal.cuisine) response += `• Cuisine: ${this.capitalizeFirst(meal.cuisine)}\n`;
            if (meal.prepTime) response += `• Prep time: ${meal.prepTime} minutes\n`;
            if (meal.difficulty) response += `• Difficulty: ${this.capitalizeFirst(meal.difficulty)}\n`;
            if (meal.ingredients && meal.ingredients.length > 0) {
                response += `• Key ingredients: ${meal.ingredients.slice(0, 3).join(', ')}\n`;
            }
            response += '\n';
        });

        response += "Would you like me to add any of these to your meal plan, or would you prefer different suggestions?";

        return response;
    }

    /**
     * Capitalize first letter of a string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Add message to chat interface
     */
    addMessage(message, sender, data = null) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        const formattedMessage = this.formatMessage(message);
        const timestamp = new Date().toLocaleTimeString();

        messageElement.innerHTML = `
            <div class="message-content">${formattedMessage}</div>
            <div class="message-time">${timestamp}</div>
        `;

        // Add action buttons for AI messages with meal suggestions
        if (sender === 'ai' && data && data.meals) {
            const actionsElement = document.createElement('div');
            actionsElement.className = 'message-actions';
            
            data.meals.forEach((meal, index) => {
                const addButton = document.createElement('button');
                addButton.className = 'action-btn add-meal-btn';
                addButton.textContent = `Add ${meal.name || meal} to plan`;
                addButton.onclick = () => this.addMealToPlan(meal);
                actionsElement.appendChild(addButton);
            });

            messageElement.appendChild(actionsElement);
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({
            type: sender,
            message: message,
            data: data,
            timestamp: new Date()
        });
    }

    /**
     * Format message text (simple markdown-like formatting)
     */
    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    /**
     * Add meal to plan from chat
     */
    addMealToPlan(meal) {
        try {
            console.log('Adding meal to plan:', meal);
            
            // Try to get the current meal plan
            let currentPlan = [];
            try {
                currentPlan = JSON.parse(localStorage.getItem('weeklyPlan') || '[]');
            } catch (error) {
                currentPlan = [];
            }

            // Find an empty day to add the meal
            const mealName = meal.name || meal;
            let added = false;

            for (let i = 0; i < 7; i++) {
                if (!currentPlan[i] || !currentPlan[i].meals || currentPlan[i].meals.length === 0) {
                    if (!currentPlan[i]) currentPlan[i] = { meals: [] };
                    if (!currentPlan[i].meals) currentPlan[i].meals = [];
                    
                    currentPlan[i].meals.push(mealName);
                    added = true;
                    break;
                }
            }

            if (!added) {
                // If all days are full, add to the first day
                if (!currentPlan[0]) currentPlan[0] = { meals: [] };
                if (!currentPlan[0].meals) currentPlan[0].meals = [];
                currentPlan[0].meals.push(mealName);
                added = true;
            }

            if (added) {
                // Save the updated plan
                localStorage.setItem('weeklyPlan', JSON.stringify(currentPlan));
                
                // Update the UI if the meal plan tab is visible
                if (typeof window.renderPlan === 'function') {
                    window.renderPlan(currentPlan);
                }
                
                // Show success message
                this.addMessage(`Great! I've added "${mealName}" to your meal plan.`, 'ai');
                
                console.log('Meal added successfully to plan');
            } else {
                throw new Error('Could not add meal to plan');
            }
            
        } catch (error) {
            console.error('Error adding meal to plan:', error);
            this.addMessage("Sorry, I had trouble adding that meal to your plan. You can try adding it manually from the Meal Plan tab.", 'ai');
        }
    }

    /**
     * Get user's dietary restrictions from preferences
     */
    getUserDietaryRestrictions() {
        // This would integrate with your existing preferences system
        try {
            const savedPreferences = JSON.parse(localStorage.getItem('mealPreferences') || '{}');
            return savedPreferences.dietaryRestrictions || [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Get available ingredients from user's pantry
     */
    getAvailableIngredients() {
        // This would integrate with your existing ingredients system
        try {
            const savedIngredients = JSON.parse(localStorage.getItem('availableIngredients') || '[]');
            return savedIngredients;
        } catch (error) {
            return [];
        }
    }

    /**
     * Clear conversation history
     */
    clearConversation() {
        this.conversationHistory = [];
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            // Keep only the initial welcome message
            const welcomeMessage = messagesContainer.querySelector('.ai-message');
            messagesContainer.innerHTML = '';
            if (welcomeMessage) {
                messagesContainer.appendChild(welcomeMessage);
            }
        }
    }

    /**
     * Get conversation context for better responses
     */
    getConversationContext() {
        return {
            history: this.conversationHistory,
            currentPreferences: this.currentContext
        };
    }
}

// Export for ES6 modules
export { ConversationalAI };
export default ConversationalAI;
