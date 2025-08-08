/**
 * Advanced Voice Control System
 * Provides comprehensive voice interface for the Recipe Planner app
 * Features: Speech recognition, synthesis, natural language processing
 */

class VoiceControlManager {
    constructor() {
        this.isListening = false;
        this.isEnabled = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.commands = new Map();
        this.context = {
            currentTab: 'weeklyPlan',
            lastMeal: null,
            listeningForResponse: false,
            conversationMode: false
        };
        this.feedbackEnabled = true;
        this.wakePhrases = ['hey recipe', 'recipe assistant', 'meal planner'];
        this.isWakeWordMode = false;
        
        this.initialize();
    }

    // Internal logging methods
    log(message, ...args) {
        if (window.logger && window.logger.info) {
            window.logger.info(message, ...args);
        } else {
            console.log('[Voice Control]', message, ...args);
        }
    }

    logError(message, ...args) {
        if (window.logger && window.logger.error) {
            window.logger.error(message, ...args);
        } else {
            console.error('[Voice Control]', message, ...args);
        }
    }

    logWarn(message, ...args) {
        if (window.logger && window.logger.warn) {
            window.logger.warn(message, ...args);
        } else {
            console.warn('[Voice Control]', message, ...args);
        }
    }

    async initialize() {
        try {
            // Check for basic browser support
            if (typeof window === 'undefined') {
                this.logWarn('Voice control not available: not in browser environment');
                return;
            }

            // Check for Speech Recognition support
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                this.logWarn('Speech Recognition not supported in this browser');
                this.showVoiceError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
                return;
            }

            // Check for Speech Synthesis support
            if (!('speechSynthesis' in window)) {
                this.logWarn('Speech Synthesis not supported in this browser');
                this.showVoiceError('Speech synthesis is not supported in your browser.');
                return;
            }

            this.setupSpeechRecognition();
            this.setupSpeechSynthesis();
            this.registerCommands();
            this.createVoiceUI();
            
            // Initialize command processor
            this.initializeCommandProcessor();
            
            this.isEnabled = true;
            
            this.log('Voice Control System initialized successfully');
        } catch (error) {
            this.logError('Voice Control initialization failed:', error);
            this.showVoiceError('Voice control initialization failed. Some voice features may not work.');
        }
    }

    initializeCommandProcessor() {
        // Wait for VoiceCommandProcessor to be available
        if (window.VoiceCommandProcessor) {
            this.commandProcessor = new window.VoiceCommandProcessor(this, window.aiEngine);
        } else {
            // Retry after a delay
            setTimeout(() => this.initializeCommandProcessor(), 1000);
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI();
            this.showVoiceStatus('Listening...', 'listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceUI();
            this.hideVoiceStatus();
            
            // Restart if in wake word mode
            if (this.isWakeWordMode) {
                setTimeout(() => this.startWakeWordListening(), 1000);
            }
        };

        this.recognition.onerror = (event) => {
            this.logError('Speech recognition error:', event.error);
            this.handleRecognitionError(event.error);
        };

        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
    }

    setupSpeechSynthesis() {
        // Wait for voices to load
        if (this.synthesis.getVoices().length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.selectBestVoice();
            });
        } else {
            this.selectBestVoice();
        }
    }

    selectBestVoice() {
        const voices = this.synthesis.getVoices();
        // Prefer natural-sounding voices
        const preferredVoices = [
            'Google UK English Female',
            'Microsoft Zira - English (United States)',
            'Samantha',
            'Karen',
            'Moira'
        ];
        
        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name === preferred);
            if (voice) {
                this.currentVoice = voice;
                return;
            }
        }
        
        // Fallback to first English voice
        this.currentVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    registerCommands() {
        // Navigation Commands
        this.addCommand(['go to weekly plan', 'show weekly plan', 'weekly plan'], 
            () => this.navigateToTab('weeklyPlan'));
        this.addCommand(['go to my foods', 'show my foods', 'favourite foods'], 
            () => this.navigateToTab('myFoods'));
        this.addCommand(['go to preferences', 'show preferences', 'ai preferences'], 
            () => this.navigateToTab('preferences'));
        this.addCommand(['go to shopping list', 'show shopping list', 'shopping'], 
            () => this.navigateToTab('shoppingList'));
        this.addCommand(['go to nutrition', 'show nutrition', 'nutrition tracker'], 
            () => this.navigateToTab('nutrition'));
        this.addCommand(['go to ratings', 'show ratings', 'meal ratings'], 
            () => this.navigateToTab('ratings'));

        // Meal Generation Commands
        this.addCommand(['generate meals', 'create meal plan', 'make meal plan', 'plan my meals'], 
            () => this.generateMealPlan());
        this.addCommand(['suggest a meal', 'recommend a meal', 'what should I eat'], 
            () => this.suggestMeal());
        this.addCommand(['regenerate meals', 'new meal plan', 'different meals'], 
            () => this.regenerateMeals());

        // Food Preference Commands
        this.addCommand(['add to favourites', 'like this meal', 'I like this'], 
            () => this.likeMeal());
        this.addCommand(['remove from favourites', 'dislike this meal', 'I don\'t like this'], 
            () => this.dislikeMeal());
        this.addCommand(['pin this meal', 'save this meal', 'keep this meal'], 
            () => this.pinMeal());

        // Search Commands
        this.addCommand(['search for', 'find', 'look for'], 
            (params) => this.searchMeals(params));
        this.addCommand(['show me * recipes', 'find * meals'], 
            (params) => this.searchByCategory(params));

        // Shopping List Commands
        this.addCommand(['add to shopping list', 'buy this', 'add ingredient'], 
            (params) => this.addToShoppingList(params));
        this.addCommand(['remove from shopping list', 'don\'t buy', 'remove ingredient'], 
            (params) => this.removeFromShoppingList(params));
        this.addCommand(['clear shopping list', 'empty shopping list'], 
            () => this.clearShoppingList());

        // Utility Commands
        this.addCommand(['help', 'what can you do', 'voice commands'], 
            () => this.showVoiceHelp());
        this.addCommand(['stop listening', 'turn off voice', 'disable voice'], 
            () => this.stopVoiceControl());
        this.addCommand(['start wake word', 'always listen', 'wake word mode'], 
            () => this.enableWakeWordMode());
        this.addCommand(['stop wake word', 'stop always listening'], 
            () => this.disableWakeWordMode());

        // Nutrition Commands
        this.addCommand(['show nutrition info', 'nutrition details', 'calories'], 
            () => this.showNutritionInfo());
        this.addCommand(['set nutrition goal', 'nutrition target'], 
            (params) => this.setNutritionGoal(params));

        // Rating Commands
        this.addCommand(['rate this meal', 'give rating', 'rate meal'], 
            () => this.rateMeal());
        this.addCommand(['this is * stars', 'I give this * stars', 'rating *'], 
            (params) => this.rateWithStars(params));
    }

    addCommand(phrases, action) {
        phrases.forEach(phrase => {
            this.commands.set(phrase.toLowerCase(), action);
        });
    }

    createVoiceUI() {
        // Create voice control button
        const voiceButton = document.createElement('button');
        voiceButton.id = 'voiceControlBtn';
        voiceButton.className = 'voice-control-btn';
        voiceButton.innerHTML = '🎤';
        voiceButton.title = 'Voice Control (Click to speak)';
        voiceButton.setAttribute('aria-label', 'Activate voice control');
        
        voiceButton.addEventListener('click', () => this.toggleVoiceControl());
        
        // Add to header
        const userNav = document.querySelector('.user-nav');
        if (userNav) {
            userNav.insertBefore(voiceButton, userNav.firstChild);
        }

        // Create voice status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'voiceStatus';
        statusIndicator.className = 'voice-status hidden';
        statusIndicator.innerHTML = `
            <div class="voice-status-content">
                <div class="voice-animation">
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                </div>
                <span class="voice-status-text">Listening...</span>
            </div>
        `;
        
        document.body.appendChild(statusIndicator);

        // Create voice help overlay
        this.createVoiceHelpOverlay();
    }

    createVoiceHelpOverlay() {
        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'voiceHelpOverlay';
        helpOverlay.className = 'voice-help-overlay hidden';
        helpOverlay.innerHTML = `
            <div class="voice-help-content">
                <div class="voice-help-header">
                    <h3>🎤 Voice Commands</h3>
                    <button class="close-voice-help" aria-label="Close voice help">×</button>
                </div>
                <div class="voice-help-body">
                    <div class="command-category">
                        <h4>Navigation</h4>
                        <ul>
                            <li>"Go to weekly plan"</li>
                            <li>"Show my foods"</li>
                            <li>"Go to shopping list"</li>
                            <li>"Show nutrition"</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>Meal Planning</h4>
                        <ul>
                            <li>"Generate meals"</li>
                            <li>"Suggest a meal"</li>
                            <li>"What should I eat?"</li>
                            <li>"Regenerate meals"</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>Preferences</h4>
                        <ul>
                            <li>"Like this meal"</li>
                            <li>"I don't like this"</li>
                            <li>"Pin this meal"</li>
                            <li>"Rate this meal"</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>Search & Shopping</h4>
                        <ul>
                            <li>"Search for pasta recipes"</li>
                            <li>"Add to shopping list"</li>
                            <li>"Show me Italian meals"</li>
                            <li>"Clear shopping list"</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>Control</h4>
                        <ul>
                            <li>"Help" - Show this guide</li>
                            <li>"Stop listening"</li>
                            <li>"Start wake word" - Always listen</li>
                        </ul>
                    </div>
                </div>
                <div class="voice-help-footer">
                    <p><strong>Tip:</strong> You can also say "Hey Recipe" to start commands hands-free!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpOverlay);
        
        // Event listeners
        helpOverlay.querySelector('.close-voice-help').addEventListener('click', () => {
            this.hideVoiceHelp();
        });
        
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                this.hideVoiceHelp();
            }
        });
    }

    toggleVoiceControl() {
        if (!this.isEnabled) {
            this.speak('Voice control is not available in your browser.');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.isEnabled || this.isListening) return;
        
        try {
            this.recognition.start();
        } catch (error) {
            this.logError('Failed to start speech recognition:', error);
            this.showVoiceError('Failed to start voice recognition. Please try again.');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    startWakeWordListening() {
        if (!this.isEnabled) return;
        
        this.isWakeWordMode = true;
        this.recognition.continuous = true;
        this.startListening();
    }

    enableWakeWordMode() {
        this.speak('Wake word mode enabled. You can now say "Hey Recipe" to start commands.');
        this.startWakeWordListening();
    }

    disableWakeWordMode() {
        this.isWakeWordMode = false;
        this.recognition.continuous = false;
        this.stopListening();
        this.speak('Wake word mode disabled.');
    }

    handleSpeechResult(event) {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        
        if (!latestResult.isFinal) {
            // Show interim results
            this.showVoiceStatus(`Hearing: "${latestResult[0].transcript}"`, 'processing');
            return;
        }

        const transcript = latestResult[0].transcript.toLowerCase().trim();
        const confidence = latestResult[0].confidence;
        
        this.log('Voice command received:', transcript, 'Confidence:', confidence);
        
        // Check for wake phrases if in wake word mode
        if (this.isWakeWordMode) {
            const hasWakePhrase = this.wakePhrases.some(phrase => 
                transcript.includes(phrase.toLowerCase())
            );
            
            if (!hasWakePhrase) {
                return; // Ignore non-wake phrase commands
            }
            
            // Remove wake phrase from command
            let command = transcript;
            this.wakePhrases.forEach(phrase => {
                command = command.replace(phrase.toLowerCase(), '').trim();
            });
            
            if (command) {
                this.processCommand(command, confidence);
            } else {
                this.speak('Yes? How can I help you with your meals?');
                this.context.listeningForResponse = true;
                setTimeout(() => this.startListening(), 1000);
            }
        } else {
            this.processCommand(transcript, confidence);
        }
    }

    async processCommand(transcript, confidence) {
        // Use advanced command processor if available
        if (this.commandProcessor) {
            try {
                const result = await this.commandProcessor.processCommand(transcript, confidence);
                
                if (result.success) {
                    this.speak(result.message);
                    return result;
                } else {
                    this.speak(result.message);
                    return result;
                }
            } catch (error) {
                logger?.error('Advanced command processing failed:', error);
                // Fall back to basic processing
                return this.processBasicCommand(transcript, confidence);
            }
        } else {
            // Use basic command processing
            return this.processBasicCommand(transcript, confidence);
        }
    }

    processBasicCommand(transcript, confidence) {
        // Low confidence handling
        if (confidence < 0.7) {
            this.speak(`I'm not sure I heard that correctly. Did you say "${transcript}"?`);
            return { success: false, message: 'Low confidence' };
        }

        // Find matching command
        let matchedCommand = null;
        let commandParams = null;

        // Direct phrase matching
        for (const [phrase, action] of this.commands) {
            if (transcript === phrase) {
                matchedCommand = action;
                break;
            }
        }

        // Pattern matching for parameterized commands
        if (!matchedCommand) {
            const result = this.findParameterizedCommand(transcript);
            if (result) {
                matchedCommand = result.action;
                commandParams = result.params;
            }
        }

        // Fuzzy matching for close commands
        if (!matchedCommand) {
            matchedCommand = this.findFuzzyMatch(transcript);
        }

        // Execute command
        if (matchedCommand) {
            try {
                this.showVoiceStatus('Processing command...', 'processing');
                setTimeout(() => {
                    matchedCommand(commandParams);
                    this.hideVoiceStatus();
                }, 500);
                return { success: true, message: 'Command executed' };
            } catch (error) {
                this.logError('Command execution error:', error);
                this.speak('Sorry, I encountered an error while processing that command.');
                return { success: false, message: 'Execution error' };
            }
        } else {
            this.speak(`I didn't understand "${transcript}". Try saying "help" to see available commands.`);
            return { success: false, message: 'Command not understood' };
        }
    }

    findParameterizedCommand(transcript) {
        // Search commands with parameters
        const searchPatterns = [
            { pattern: /search for (.+)/, action: this.commands.get('search for') },
            { pattern: /find (.+)/, action: this.commands.get('find') },
            { pattern: /show me (.+) recipes/, action: this.commands.get('show me * recipes') },
            { pattern: /add (.+) to shopping list/, action: this.commands.get('add to shopping list') },
            { pattern: /this is (\d+) stars?/, action: this.commands.get('this is * stars') },
            { pattern: /rating (\d+)/, action: this.commands.get('rating *') }
        ];

        for (const { pattern, action } of searchPatterns) {
            const match = transcript.match(pattern);
            if (match && action) {
                return { action, params: match[1] };
            }
        }

        return null;
    }

    findFuzzyMatch(transcript) {
        const words = transcript.split(' ');
        let bestMatch = null;
        let bestScore = 0;

        for (const [phrase, action] of this.commands) {
            const score = this.calculateSimilarity(transcript, phrase);
            if (score > bestScore && score > 0.6) {
                bestScore = score;
                bestMatch = action;
            }
        }

        return bestMatch;
    }

    calculateSimilarity(str1, str2) {
        const words1 = str1.split(' ');
        const words2 = str2.split(' ');
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
    }

    // Command Implementation Methods
    navigateToTab(tabId) {
        const tabButton = document.getElementById(`${tabId}-btn`);
        if (tabButton) {
            tabButton.click();
            this.context.currentTab = tabId;
            this.speak(`Navigated to ${tabId.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        } else {
            this.speak('Sorry, I couldn\'t find that section.');
        }
    }

    async generateMealPlan() {
        this.speak('Generating your meal plan. This might take a moment.');
        try {
            // Navigate to weekly plan if not already there
            if (this.context.currentTab !== 'weeklyPlan') {
                this.navigateToTab('weeklyPlan');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Trigger meal generation
            const generateBtn = document.querySelector('.generate-meals-btn') || 
                               document.querySelector('[onclick*="generateMeals"]');
            
            if (generateBtn) {
                generateBtn.click();
                this.speak('Your meal plan is being generated with AI recommendations.');
            } else {
                this.speak('I couldn\'t find the meal generation button. Please try manually.');
            }
        } catch (error) {
            this.speak('Sorry, I encountered an error while generating meals.');
        }
    }

    async suggestMeal() {
        this.speak('Let me suggest a meal for you.');
        try {
            // Use AI engine to get suggestion
            if (window.aiEngine) {
                const suggestion = await window.aiEngine.generateSingleMeal();
                if (suggestion) {
                    this.speak(`I suggest ${suggestion.name}. It's a ${suggestion.cuisine} dish with ${suggestion.mainIngredient}. Would you like me to add it to your plan?`);
                    this.context.lastMeal = suggestion;
                    this.context.listeningForResponse = true;
                } else {
                    this.speak('I couldn\'t generate a suggestion right now. Please try again.');
                }
            }
        } catch (error) {
            this.speak('Sorry, I couldn\'t generate a meal suggestion at the moment.');
        }
    }

    likeMeal() {
        try {
            // Find currently selected or visible meal
            const selectedMeal = document.querySelector('.meal-card.selected') || 
                               document.querySelector('.meal-card:hover') ||
                               document.querySelector('.meal-card');
            
            if (selectedMeal) {
                const likeBtn = selectedMeal.querySelector('.like-btn, .favorite-btn');
                if (likeBtn) {
                    likeBtn.click();
                    this.speak('Added to your favorites. I\'ll remember you like this type of meal.');
                } else {
                    this.speak('I couldn\'t find the like button for this meal.');
                }
            } else {
                this.speak('Please select a meal first, then try the voice command.');
            }
        } catch (error) {
            this.speak('Sorry, I couldn\'t like that meal right now.');
        }
    }

    dislikeMeal() {
        try {
            const selectedMeal = document.querySelector('.meal-card.selected') || 
                               document.querySelector('.meal-card:hover') ||
                               document.querySelector('.meal-card');
            
            if (selectedMeal) {
                const dislikeBtn = selectedMeal.querySelector('.dislike-btn');
                if (dislikeBtn) {
                    dislikeBtn.click();
                    this.speak('I\'ll remember you don\'t like this type of meal and avoid similar suggestions.');
                } else {
                    this.speak('I couldn\'t find the dislike button for this meal.');
                }
            } else {
                this.speak('Please select a meal first, then try the voice command.');
            }
        } catch (error) {
            this.speak('Sorry, I couldn\'t dislike that meal right now.');
        }
    }

    searchMeals(query) {
        this.speak(`Searching for ${query} recipes.`);
        try {
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]');
            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                const searchBtn = document.querySelector('.search-btn') ||
                                document.querySelector('button[type="submit"]');
                if (searchBtn) {
                    searchBtn.click();
                }
                
                this.speak(`Found recipes for ${query}.`);
            } else {
                this.speak('I couldn\'t find the search function. Please try manually.');
            }
        } catch (error) {
            this.speak('Sorry, search is not available right now.');
        }
    }

    addToShoppingList(item) {
        this.speak(`Adding ${item} to your shopping list.`);
        try {
            // Navigate to shopping list if needed
            if (this.context.currentTab !== 'shoppingList') {
                this.navigateToTab('shoppingList');
            }
            
            // Add item logic would go here
            // This would depend on the specific shopping list implementation
            this.speak(`${item} has been added to your shopping list.`);
        } catch (error) {
            this.speak('Sorry, I couldn\'t add that to your shopping list.');
        }
    }

    showVoiceHelp() {
        this.speak('Showing voice command help. You can also ask me to navigate, generate meals, or manage your preferences.');
        document.getElementById('voiceHelpOverlay').classList.remove('hidden');
    }

    hideVoiceHelp() {
        document.getElementById('voiceHelpOverlay').classList.add('hidden');
    }

    stopVoiceControl() {
        this.stopListening();
        this.disableWakeWordMode();
        this.speak('Voice control stopped.');
    }

    // Speech Synthesis Methods
    speak(text, options = {}) {
        if (!this.feedbackEnabled || !this.synthesis) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 0.8;

        utterance.onstart = () => {
            this.showVoiceStatus('AI is speaking...', 'speaking');
        };

        utterance.onend = () => {
            this.hideVoiceStatus();
            if (this.context.listeningForResponse) {
                setTimeout(() => {
                    this.startListening();
                    this.context.listeningForResponse = false;
                }, 500);
            }
        };

        this.synthesis.speak(utterance);
    }

    // UI Update Methods
    updateVoiceUI() {
        const voiceBtn = document.getElementById('voiceControlBtn');
        if (voiceBtn) {
            if (this.isListening) {
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '🔴';
                voiceBtn.title = 'Stop listening';
            } else {
                voiceBtn.classList.remove('listening');
                voiceBtn.innerHTML = '🎤';
                voiceBtn.title = 'Start voice control';
            }
        }
    }

    showVoiceStatus(message, type = 'default') {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.querySelector('.voice-status-text').textContent = message;
            statusEl.className = `voice-status ${type}`;
            statusEl.classList.remove('hidden');
        }
    }

    hideVoiceStatus() {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.classList.add('hidden');
        }
    }

    showVoiceError(message) {
        this.logError('Voice Error:', message);
        
        // Try to speak the error if synthesis is available
        if (this.synthesis && this.feedbackEnabled) {
            try {
                this.speak(message);
            } catch (error) {
                this.logError('Failed to speak error message:', error);
            }
        }
        
        // Could also show visual error notification
        // Create a simple toast notification
        this.showErrorToast(message);
    }

    showErrorToast(message) {
        // Create a simple error toast
        const toast = document.createElement('div');
        toast.className = 'voice-error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10003;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            line-height: 1.4;
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    handleRecognitionError(error) {
        let message = 'Voice recognition error occurred.';
        
        switch (error) {
            case 'no-speech':
                message = 'No speech was detected. Please try again.';
                break;
            case 'audio-capture':
                message = 'Microphone access is required for voice control.';
                break;
            case 'not-allowed':
                message = 'Microphone permission denied. Please enable microphone access.';
                break;
            case 'network':
                message = 'Network error occurred. Voice recognition requires internet connection.';
                break;
            default:
                message = `Voice recognition error: ${error}`;
        }
        
        this.showVoiceError(message);
    }

    // Settings Methods
    setFeedbackEnabled(enabled) {
        this.feedbackEnabled = enabled;
        if (enabled) {
            this.speak('Voice feedback enabled.');
        }
    }

    setVoiceRate(rate) {
        this.voiceRate = Math.max(0.5, Math.min(2.0, rate));
    }

    // Integration Methods
    integrateWithAI(aiEngine) {
        this.aiEngine = aiEngine;
        
        // Add voice-specific commands to AI
        this.addCommand(['what do you recommend', 'ai suggestion', 'smart suggestion'], 
            async () => {
                const suggestion = await aiEngine.getPersonalizedSuggestion();
                this.speak(`Based on your preferences, I recommend ${suggestion.name}. ${suggestion.reason}`);
            });
    }

    // Cleanup
    destroy() {
        if (this.recognition) {
            this.recognition.stop();
        }
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        
        // Remove UI elements
        const voiceBtn = document.getElementById('voiceControlBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        const voiceHelp = document.getElementById('voiceHelpOverlay');
        
        [voiceBtn, voiceStatus, voiceHelp].forEach(el => {
            if (el) el.remove();
        });
    }
}

// Global voice control instance
let voiceControl = null;

// Initialize voice control when DOM is ready and other dependencies are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization to ensure other modules are loaded
    setTimeout(() => {
        try {
            voiceControl = new VoiceControlManager();
            
            // Make available globally
            window.voiceControl = voiceControl;
        } catch (error) {
            console.error('Failed to initialize voice control:', error);
        }
    }, 2000); // Wait 2 seconds for other modules to load
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceControlManager;
}
