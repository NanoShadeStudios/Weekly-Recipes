/**
 * App Initializer Module
 * Handles the main application initialization and module loading
 */


export class AppInitializer {
    constructor() {
        this.loadedModules = new Map();
        this.initializationSteps = [];
    }

    /**
     * Initialize the application with all required modules
     */
    async initialize() {
        console.log('AppInitializer: Starting application initialization...');
        
        try {
            // Step 1: Load critical modules
            await this.loadCriticalModules();
            
            // Step 2: Initialize theme system
            await this.initializeTheme();
            
            // Step 3: Load authentication
            await this.loadAuthManager();
            
            // Step 4: Initialize UI components
            await this.initializeUI();
            
            // Step 5: Load feature modules
            await this.loadFeatureModules();
            
            // Step 6: Initialize AI features
            await this.initializeAIFeatures();
            
            // Step 7: Schedule enhanced feature initializations
            this.scheduleEnhancedInitializations();
            
            console.log('AppInitializer: Application initialized successfully');
            
        } catch (error) {
            console.error('AppInitializer: Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Load critical modules required for basic app functionality
     */
    async loadCriticalModules() {
        console.log('AppInitializer: Loading critical modules...');
        
        const criticalModules = [
            { name: 'loadingManager', path: './loadingManager.js' },
            { name: 'uiStateManager', path: './uiStateManager.js' }
        ];

        for (const module of criticalModules) {
            try {
                const loadedModule = await import(module.path);
                this.loadedModules.set(module.name, loadedModule);
                console.log(`AppInitializer: Loaded ${module.name}`);
            } catch (error) {
                console.warn(`AppInitializer: Failed to load ${module.name}:`, error);
                // Create fallback for critical modules
                this.createFallbackModule(module.name);
            }
        }
    }

    /**
     * Load authentication manager
     */
    async loadAuthManager() {
        console.log('AppInitializer: Loading authentication manager...');
        
        try {
            const authModule = await import('./auth.js');
            const authManager = authModule.authManager;
            
            if (authManager) {
                await authManager.initialize();
                this.loadedModules.set('authManager', authManager);
                
                // Make it available globally for compatibility
                window.authManager = authManager;
                
                // Set up auth state handler to update app.js currentUser
                this.setupAuthStateHandler(authManager);
                
                console.log('AppInitializer: Auth manager loaded successfully');
            }
        } catch (error) {
            console.warn('AppInitializer: Auth manager loading failed:', error);
            this.createFallbackAuthManager();
        }
    }

    /**
     * Initialize theme system
     */
    async initializeTheme() {
        console.log('AppInitializer: Initializing theme system...');
        
        try {
            const { ThemeManager } = await import('./themeManager.js');
            const themeManager = new ThemeManager();
            await themeManager.initialize();
            this.loadedModules.set('themeManager', themeManager);
        } catch (error) {
            console.warn('AppInitializer: Theme manager not available, using basic theme');
            this.initializeBasicTheme();
        }
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        console.log('AppInitializer: Initializing UI components...');
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            console.log('AppInitializer: DOM Content Loaded - setting up UI');
            this.setupUIElements();
        });
        
        // Also try to set up immediately in case DOM is already loaded
        if (document.readyState === 'loading') {
            console.log('AppInitializer: DOM still loading, waiting for DOMContentLoaded');
        } else {
            console.log('AppInitializer: DOM already loaded, setting up UI immediately');
            this.setupUIElements();
        }
    }

    /**
     * Load feature modules (community, calendar, AI, etc.)
     */
    async loadFeatureModules() {
        console.log('AppInitializer: Loading feature modules...');
        
        const featureModules = [
            { name: 'community', loader: () => this.loadCommunityFeatures() },
            { name: 'calendar', loader: () => this.loadCalendarIntegration() },
            { name: 'conversationalAI', loader: () => this.loadConversationalAI() },
            { name: 'ingredientSubstitution', loader: () => this.loadIngredientSubstitution() },
            { name: 'enhancedNutrition', loader: () => this.loadEnhancedNutrition() },
            { name: 'smartShopping', loader: () => this.loadSmartShopping() },
            { name: 'enhancedAI', loader: () => this.loadEnhancedAIRecommendations() },
            { name: 'enhancedSocial', loader: () => this.loadEnhancedSocialFeatures() }
        ];

        // Load features in parallel for better performance
        const modulePromises = featureModules.map(async (feature) => {
            try {
                const result = await feature.loader();
                this.loadedModules.set(feature.name, result);
                console.log(`AppInitializer: Loaded ${feature.name} features`);
                return { name: feature.name, success: true, result };
            } catch (error) {
                console.warn(`AppInitializer: Failed to load ${feature.name}:`, error);
                return { name: feature.name, success: false, error };
            }
        });

        const results = await Promise.allSettled(modulePromises);
        console.log('AppInitializer: Feature module loading complete:', results);
    }

    /**
     * Load community features
     */
    async loadCommunityFeatures() {
        console.log('AppInitializer: Loading community features...');
        
        const communityManagerModule = await import('./communityManager.js');
        const communityUIModule = await import('./communityUI.js');
        
        const CommunityManager = communityManagerModule.default || communityManagerModule.CommunityManager;
        const CommunityUI = communityUIModule.default || communityUIModule.CommunityUI;
        
        if (!CommunityManager || !CommunityUI) {
            throw new Error('Community classes not found in modules');
        }
        
        const communityManager = new CommunityManager();
        const communityUI = new CommunityUI(communityManager);
        
        return { communityManager, communityUI };
    }

    /**
     * Load calendar integration
     */
    async loadCalendarIntegration() {
        console.log('AppInitializer: Loading calendar integration...');
        
        const calendarManagerModule = await import('./calendarIntegration.js');
        const calendarUIModule = await import('./calendarUI.js');
        
        const CalendarManager = calendarManagerModule.default || calendarManagerModule.CalendarManager;
        const CalendarUI = calendarUIModule.default || calendarUIModule.CalendarUI;
        
        if (!CalendarManager || !CalendarUI) {
            throw new Error('Calendar classes not found in modules');
        }
        
        const calendarManager = new CalendarManager();
        const calendarUI = new CalendarUI(calendarManager);
        
        calendarUI.init();
        
        // Load enhanced calendar features
        try {
            const enhancedCalendarManagerModule = await import('./enhancedCalendarManager.js');
            const enhancedCalendarUIModule = await import('./enhancedCalendarUI.js');
            
            const enhancedCalendarManager = enhancedCalendarManagerModule.default || enhancedCalendarManagerModule.enhancedCalendarManager;
            const enhancedCalendarUI = enhancedCalendarUIModule.default || enhancedCalendarUIModule.enhancedCalendarUI;
            
            if (enhancedCalendarManager && enhancedCalendarUI) {
                console.log('AppInitializer: Enhanced calendar features available');
                
                // Initialize enhanced calendar
                if (typeof enhancedCalendarManager.initializeEnhancedCalendar === 'function') {
                    await enhancedCalendarManager.initializeEnhancedCalendar();
                }
                
                // Make available globally for integration
                window.enhancedCalendarManager = enhancedCalendarManager;
                window.enhancedCalendarUI = enhancedCalendarUI;
                
                return { calendarManager, calendarUI, enhancedCalendarManager, enhancedCalendarUI };
            }
        } catch (error) {
            console.warn('AppInitializer: Enhanced calendar features not available:', error);
        }
        
        return { calendarManager, calendarUI };
    }

    /**
     * Load conversational AI features  
     */
    async loadConversationalAI() {
        console.log('AppInitializer: Loading conversational AI...');
        
        const nlpServiceModule = await import('./nlpService.js');
        const conversationalAIModule = await import('./conversationalAI.js');
        
        const NLPService = nlpServiceModule.default;
        const ConversationalAI = conversationalAIModule.default;
        
        if (!NLPService || !ConversationalAI) {
            throw new Error('AI classes not found in modules');
        }
        
        // Get mealAI from global scope (set up in app.js)
        const mealAI = window.mealPlanningAI;
        
        const nlpService = new NLPService();
        const conversationalAI = new ConversationalAI(mealAI, nlpService);
        
        this.setupChatToggle(conversationalAI);
        
        return { nlpService, conversationalAI };
    }

    /**
     * Load ingredient substitution features
     */
    async loadIngredientSubstitution() {
        console.log('AppInitializer: Loading ingredient substitution system...');
        
        const substitutionManagerModule = await import('./ingredientSubstitutionManager.js');
        const substitutionUIModule = await import('./ingredientSubstitutionUI.js');
        
        const IngredientSubstitutionManager = substitutionManagerModule.default || substitutionManagerModule.IngredientSubstitutionManager;
        const IngredientSubstitutionUI = substitutionUIModule.default || substitutionUIModule.IngredientSubstitutionUI;
        
        if (!IngredientSubstitutionManager || !IngredientSubstitutionUI) {
            throw new Error('Ingredient substitution classes not found in modules');
        }
        
        const substitutionManager = new IngredientSubstitutionManager();
        const substitutionUI = new IngredientSubstitutionUI(substitutionManager);
        
        // Initialize the system
        await substitutionManager.initialize();
        await substitutionUI.initialize();
        
        // Make available globally for integration with meal generator
        window.ingredientSubstitutionManager = substitutionManager;
        window.ingredientSubstitutionUI = substitutionUI;
        
        return { substitutionManager, substitutionUI };
    }

    /**
     * Load enhanced nutrition tracking features
     */
    async loadEnhancedNutrition() {
        console.log('AppInitializer: Loading enhanced nutrition tracking...');
        
        const nutritionTrackerModule = await import('./enhancedNutritionTracker.js');
        const nutritionUIModule = await import('./enhancedNutritionUI.js');
        
        const EnhancedNutritionTracker = nutritionTrackerModule.default || nutritionTrackerModule.EnhancedNutritionTracker;
        const EnhancedNutritionUI = nutritionUIModule.default || nutritionUIModule.EnhancedNutritionUI;
        
        if (!EnhancedNutritionTracker || !EnhancedNutritionUI) {
            throw new Error('Enhanced nutrition classes not found in modules');
        }
        
        const nutritionTracker = new EnhancedNutritionTracker();
        const nutritionUI = new EnhancedNutritionUI(nutritionTracker);
        
            // Initialize the systems
            await nutritionTracker.initialize();
            await nutritionUI.initialize();
            
            // Make available globally for integration
            window.enhancedNutritionTracker = nutritionTracker;
            window.enhancedNutritionUI = nutritionUI;
            
            return { nutritionTracker, nutritionUI };
        }
        
        /**
         * Schedule enhanced feature initializations
         */
        scheduleEnhancedInitializations() {
            // Initialize enhanced calendar if needed
            setTimeout(() => {
                if (window.initializeEnhancedCalendarIfNeeded) {
                    window.initializeEnhancedCalendarIfNeeded();
                }
            }, 1000);
            
            // Initialize enhanced AI recommendations
            setTimeout(() => {
                if (window.initializeEnhancedAIIfNeeded) {
                    window.initializeEnhancedAIIfNeeded();
                }
            }, 1200);
        }

        /**
         * Load enhanced AI recommendation features
         */
        async loadEnhancedAIRecommendations() {
            console.log('AppInitializer: Loading enhanced AI recommendation engine...');
            
            const aiEngineModule = await import('./enhancedAIRecommendationEngine.js');
            const aiUIModule = await import('./enhancedAIRecommendationUI.js');
            
            const enhancedAIEngine = aiEngineModule.default || aiEngineModule.enhancedAIRecommendationEngine;
            const enhancedAIUI = aiUIModule.default || aiUIModule.enhancedAIRecommendationUI;
            
            if (!enhancedAIEngine || !enhancedAIUI) {
                throw new Error('Enhanced AI recommendation classes not found in modules');
            }
            
            // Make available globally for integration
            window.enhancedAIRecommendationEngine = enhancedAIEngine;
            window.enhancedAIRecommendationUI = enhancedAIUI;
            
            console.log('AppInitializer: Enhanced AI recommendation engine loaded successfully');
            
            return { enhancedAIEngine, enhancedAIUI };
        }

        /**
         * Load enhanced social features
         */
        async loadEnhancedSocialFeatures() {
            console.log('AppInitializer: Loading enhanced social features...');
            
            try {
                const [managerModule, uiModule] = await Promise.all([
                    import('./enhancedSocialFeaturesManager.js'),
                    import('./enhancedSocialFeaturesUI.js')
                ]);
                
                const { enhancedSocialFeaturesManager } = managerModule;
                const { enhancedSocialFeaturesUI } = uiModule;
                
                if (!enhancedSocialFeaturesManager || !enhancedSocialFeaturesUI) {
                    throw new Error('Enhanced social features classes not found');
                }

                // Make available globally for integration
                window.enhancedSocialFeaturesManager = enhancedSocialFeaturesManager;
                window.enhancedSocialFeaturesUI = enhancedSocialFeaturesUI;
                
                console.log('AppInitializer: Enhanced social features loaded successfully');
                
                return { enhancedSocialFeaturesManager, enhancedSocialFeaturesUI };
                
            } catch (error) {
                console.error('AppInitializer: Failed to load enhanced social features:', error);
                throw error;
            }
        }

        async loadSmartShopping() {
        try {
            const shoppingManagerModule = await import('./smartShoppingListManager.js');
            const shoppingUIModule = await import('./smartShoppingListUI.js');
            
            const SmartShoppingListManager = shoppingManagerModule.default || shoppingManagerModule.SmartShoppingListManager;
            const SmartShoppingListUI = shoppingUIModule.default || shoppingUIModule.SmartShoppingListUI;
            
            if (!SmartShoppingListManager || !SmartShoppingListUI) {
                throw new Error('Smart shopping classes not found in modules');
            }
            
            const shoppingManager = new SmartShoppingListManager();
            const shoppingUI = new SmartShoppingListUI();
            
            // Initialize smart shopping features
            await this.initializeSmartShoppingFeatures(shoppingManager, shoppingUI);
            
            // Store globally
            window.smartShoppingListManager = shoppingManager;
            window.smartShoppingListUI = shoppingUI;
            
            console.log('✅ Smart shopping system loaded successfully');
            return { shoppingManager, shoppingUI };
        } catch (error) {
            console.error('❌ Error loading smart shopping system:', error);
            throw error;
        }
    }

    async initializeSmartShoppingFeatures(shoppingManager, shoppingUI) {
        // Set up smart shopping button event
        const smartListBtn = document.getElementById('generateSmartListBtn');
        if (smartListBtn) {
            smartListBtn.addEventListener('click', () => {
                shoppingUI.showSmartListGenerator();
            });
        }
        
        console.log('Smart shopping features initialized');
    }

    /**
     * Initialize AI features
     */
    async initializeAIFeatures() {
        console.log('AppInitializer: Initializing AI features...');
        
        try {
            const { AIFeatureManager } = await import('./aiFeatureManager.js');
            const aiFeatureManager = new AIFeatureManager();
            await aiFeatureManager.initialize();
            this.loadedModules.set('aiFeatureManager', aiFeatureManager);
        } catch (error) {
            console.warn('AppInitializer: AI features not available:', error);
            this.enableBasicFeatures();
        }
    }

    /**
     * Set up chat toggle functionality
     */
    setupChatToggle(conversationalAI) {
        const chatToggle = document.getElementById('ai-chat-toggle');
        if (chatToggle && conversationalAI) {
            chatToggle.addEventListener('click', () => {
                if (conversationalAI.isActive) {
                    conversationalAI.hideChat();
                    chatToggle.classList.remove('active');
                } else {
                    conversationalAI.showChat();
                    chatToggle.classList.add('active');
                }
            });
        }
    }

    /**
     * Set up auth state handler to sync with app.js currentUser variable
     */
    setupAuthStateHandler(authManager) {
        console.log('AppInitializer: Setting up auth state handler...');
        
        authManager.onAuthStateChanged((user) => {
            console.log('🔄 [AppInitializer] Auth state changed:', user ? user.email : 'null');
            
            // Update the currentUser using the global update function
            if (window.updateCurrentUser) {
                window.updateCurrentUser(user);
            } else {
                // Fallback: update directly
                if (window.currentUser !== undefined) {
                    window.currentUser = user;
                    console.log('✅ [AppInitializer] Updated window.currentUser (fallback):', user ? user.email : 'null');
                }
            }
            
            // Handle pending actions
            if (user && window.pendingAction === 'generatePlan') {
                console.log('🎯 [AppInitializer] Executing pending meal plan generation');
                window.pendingAction = null;
                setTimeout(() => {
                    if (window.generatePlanWrapper) {
                        window.generatePlanWrapper();
                    }
                }, 500);
            }
        });
    }

    /**
     * Set up basic UI elements
     */
    setupUIElements() {
        console.log('AppInitializer: Setting up UI elements...');
        
        // Set up generate meal plan button
        const generateMealBtn = document.getElementById('generateMealBtn');
        console.log('🔍 [AppInitializer] Generate button found:', !!generateMealBtn);
        if (generateMealBtn) {
            console.log('✅ [AppInitializer] Adding click listener to generate button');
            generateMealBtn.addEventListener('click', (event) => {
                console.log('🖱️ [AppInitializer] Generate button clicked!', event);
                if (window.generatePlanWrapper) {
                    window.generatePlanWrapper();
                } else {
                    console.error('❌ generatePlanWrapper not found on window');
                }
            });
            console.log('✅ [AppInitializer] Generate button listener added');
        } else {
            console.error('❌ [AppInitializer] Generate button not found in DOM');
        }
        
        // Set up other UI elements as needed
        // (This can be expanded for other buttons and UI components)
    }

    /**
     * Enable basic features when advanced features are not available
     */
    enableBasicFeatures() {
        console.log('AppInitializer: Enabling basic feature set...');
        // This would implement basic meal planning without AI
    }

    /**
     * Initialize basic theme when advanced theme manager is not available
     */
    initializeBasicTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    /**
     * Create fallback modules for critical functionality
     */
    createFallbackModule(moduleName) {
        const fallbacks = {
            loadingManager: {
                showGlobalLoader: () => {},
                hideGlobalLoader: () => {},
                withLoading: async (fn) => await fn()
            },
            uiStateManager: {
                saveState: () => {},
                restoreState: () => {},
                addStateListener: () => {}
            }
        };

        this.loadedModules.set(moduleName, fallbacks[moduleName] || {});
    }

    /**
     * Create fallback authentication manager
     */
    createFallbackAuthManager() {
        const fallbackAuth = {
            initialize: async () => console.warn('Auth manager fallback - no authentication available'),
            signIn: async () => { throw new Error('Authentication not available'); },
            signOut: async () => console.warn('Sign out not available'),
            onAuthStateChanged: () => () => {},
            getCurrentUser: () => null,
            isAuthenticated: () => false
        };
        
        this.loadedModules.set('authManager', fallbackAuth);
        window.authManager = fallbackAuth;
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('AppInitializer: Initialization failed:', error);
        
        // Show error to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'initialization-error';
        errorMessage.innerHTML = `
            <h3>Initialization Error</h3>
            <p>The application failed to initialize properly. Please refresh the page.</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        document.body.prepend(errorMessage);
    }

    /**
     * Get a loaded module
     */
    getModule(name) {
        return this.loadedModules.get(name);
    }

    /**
     * Check if a module is loaded
     */
    hasModule(name) {
        return this.loadedModules.has(name);
    }
}

// Create and export a singleton instance
export const appInitializer = new AppInitializer();
