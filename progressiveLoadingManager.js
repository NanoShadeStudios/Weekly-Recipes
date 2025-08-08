/**
 * Progressive Loading System
 * Advanced progressive loading for meal suggestions, recipes, and content
 * with intelligent prioritization, skeleton screens, and smooth transitions.
 */

export class ProgressiveLoadingManager {
    constructor() {
        this.loadingQueue = new Map();
        this.loadingStrategies = {
            critical: { priority: 1, batchSize: 3, delay: 0 },
            high: { priority: 2, batchSize: 5, delay: 100 },
            normal: { priority: 3, batchSize: 8, delay: 200 },
            low: { priority: 4, batchSize: 10, delay: 500 },
            background: { priority: 5, batchSize: 15, delay: 1000 }
        };
        
        this.skeletonConfigs = {
            mealCard: {
                template: 'meal-card-skeleton',
                elements: ['image', 'title', 'description', 'tags', 'rating']
            },
            recipeDetail: {
                template: 'recipe-detail-skeleton',
                elements: ['hero-image', 'title', 'ingredients', 'instructions', 'nutrition']
            },
            mealList: {
                template: 'meal-list-skeleton',
                elements: ['grid-items']
            },
            nutritionChart: {
                template: 'chart-skeleton',
                elements: ['chart-area', 'legend']
            }
        };
        
        this.contentLoaders = new Map();
        this.loadingStates = new Map();
        this.intersectionObservers = new Map();
        this.retryAttempts = new Map();
        this.loadingMetrics = {
            totalRequests: 0,
            successfulLoads: 0,
            failedLoads: 0,
            averageLoadTime: 0,
            cacheHits: 0
        };
        
        this.cache = new Map();
        this.prefetchQueue = [];
        this.isOnline = navigator.onLine;
        
        this.initializeProgressiveLoading();
        console.log('Progressive Loading Manager initialized');
    }

    /**
     * Initialize progressive loading system
     */
    initializeProgressiveLoading() {
        // Setup intersection observers for different loading strategies
        this.setupIntersectionObservers();
        
        // Setup content loaders
        this.setupContentLoaders();
        
        // Setup skeleton screen system
        this.setupSkeletonScreens();
        
        // Setup offline handling
        this.setupOfflineHandling();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup prefetching system
        this.setupPrefetchingSystem();
        
        // Setup retry mechanisms
        this.setupRetryMechanisms();
        
        console.log('Progressive loading system ready');
    }

    /**
     * Setup intersection observers for different loading strategies
     */
    setupIntersectionObservers() {
        // Critical content observer (immediate loading)
        const criticalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target, 'critical');
                    criticalObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px 0px', threshold: 0.1 });

        // High priority observer (near viewport)
        const highObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target, 'high');
                    highObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });

        // Normal priority observer (approaching viewport)
        const normalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target, 'normal');
                    normalObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '400px 0px', threshold: 0.01 });

        // Background observer (preloading)
        const backgroundObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target, 'background');
                    backgroundObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '800px 0px', threshold: 0.01 });

        this.intersectionObservers.set('critical', criticalObserver);
        this.intersectionObservers.set('high', highObserver);
        this.intersectionObservers.set('normal', normalObserver);
        this.intersectionObservers.set('background', backgroundObserver);
    }

    /**
     * Setup content loaders for different types
     */
    setupContentLoaders() {
        // Meal suggestion loader
        this.contentLoaders.set('meals', {
            loader: this.loadMealSuggestions.bind(this),
            skeleton: 'mealCard',
            batchSize: 6,
            cacheTimeout: 300000 // 5 minutes
        });

        // Recipe detail loader
        this.contentLoaders.set('recipe', {
            loader: this.loadRecipeDetails.bind(this),
            skeleton: 'recipeDetail',
            batchSize: 1,
            cacheTimeout: 600000 // 10 minutes
        });

        // Meal list loader
        this.contentLoaders.set('mealList', {
            loader: this.loadMealList.bind(this),
            skeleton: 'mealList',
            batchSize: 12,
            cacheTimeout: 180000 // 3 minutes
        });

        // Nutrition data loader
        this.contentLoaders.set('nutrition', {
            loader: this.loadNutritionData.bind(this),
            skeleton: 'nutritionChart',
            batchSize: 1,
            cacheTimeout: 900000 // 15 minutes
        });

        // Shopping list loader
        this.contentLoaders.set('shopping', {
            loader: this.loadShoppingListData.bind(this),
            skeleton: 'mealList',
            batchSize: 20,
            cacheTimeout: 120000 // 2 minutes
        });
    }

    /**
     * Setup skeleton screen system
     */
    setupSkeletonScreens() {
        // Create skeleton screen templates
        this.createSkeletonTemplates();
        
        // Add skeleton CSS animations
        this.addSkeletonStyles();
    }

    /**
     * Create skeleton screen templates
     */
    createSkeletonTemplates() {
        const skeletonContainer = document.createElement('div');
        skeletonContainer.id = 'skeleton-templates';
        skeletonContainer.style.display = 'none';

        // Meal card skeleton
        skeletonContainer.innerHTML += `
            <div class="skeleton-template" data-template="meal-card-skeleton">
                <div class="meal-card skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-description"></div>
                        <div class="skeleton-tags">
                            <div class="skeleton-tag"></div>
                            <div class="skeleton-tag"></div>
                            <div class="skeleton-tag"></div>
                        </div>
                        <div class="skeleton-rating"></div>
                    </div>
                </div>
            </div>

            <div class="skeleton-template" data-template="recipe-detail-skeleton">
                <div class="recipe-detail skeleton-detail">
                    <div class="skeleton-hero-image"></div>
                    <div class="skeleton-header">
                        <div class="skeleton-title large"></div>
                        <div class="skeleton-meta">
                            <div class="skeleton-time"></div>
                            <div class="skeleton-difficulty"></div>
                            <div class="skeleton-servings"></div>
                        </div>
                    </div>
                    <div class="skeleton-sections">
                        <div class="skeleton-section">
                            <div class="skeleton-section-title"></div>
                            <div class="skeleton-ingredients">
                                <div class="skeleton-ingredient"></div>
                                <div class="skeleton-ingredient"></div>
                                <div class="skeleton-ingredient"></div>
                                <div class="skeleton-ingredient"></div>
                            </div>
                        </div>
                        <div class="skeleton-section">
                            <div class="skeleton-section-title"></div>
                            <div class="skeleton-instructions">
                                <div class="skeleton-instruction"></div>
                                <div class="skeleton-instruction"></div>
                                <div class="skeleton-instruction"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="skeleton-template" data-template="meal-list-skeleton">
                <div class="meal-grid skeleton-grid">
                    ${Array(6).fill('<div class="skeleton-grid-item"><div class="skeleton-image"></div><div class="skeleton-text"></div></div>').join('')}
                </div>
            </div>

            <div class="skeleton-template" data-template="chart-skeleton">
                <div class="chart-container skeleton-chart">
                    <div class="skeleton-chart-title"></div>
                    <div class="skeleton-chart-area"></div>
                    <div class="skeleton-chart-legend">
                        <div class="skeleton-legend-item"></div>
                        <div class="skeleton-legend-item"></div>
                        <div class="skeleton-legend-item"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(skeletonContainer);
    }

    /**
     * Add skeleton CSS animations
     */
    addSkeletonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Skeleton Loading Animations */
            .skeleton-card, .skeleton-detail, .skeleton-grid, .skeleton-chart {
                border-radius: 8px;
                overflow: hidden;
            }

            .skeleton-image, .skeleton-hero-image, .skeleton-chart-area {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-image {
                width: 100%;
                height: 200px;
            }

            .skeleton-hero-image {
                width: 100%;
                height: 300px;
                margin-bottom: 20px;
            }

            .skeleton-title, .skeleton-section-title {
                height: 20px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 10px;
            }

            .skeleton-title.large {
                height: 32px;
            }

            .skeleton-description, .skeleton-ingredient, .skeleton-instruction, .skeleton-text {
                height: 16px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 8px;
            }

            .skeleton-tags {
                display: flex;
                gap: 8px;
                margin-bottom: 10px;
            }

            .skeleton-tag {
                width: 60px;
                height: 24px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 12px;
            }

            .skeleton-rating, .skeleton-time, .skeleton-difficulty, .skeleton-servings {
                width: 80px;
                height: 20px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 10px;
            }

            .skeleton-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
            }

            .skeleton-sections {
                display: grid;
                gap: 30px;
            }

            .skeleton-section {
                padding: 20px;
                background: #fafafa;
                border-radius: 8px;
            }

            .skeleton-ingredients, .skeleton-instructions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .skeleton-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }

            .skeleton-grid-item {
                background: #fafafa;
                border-radius: 8px;
                padding: 15px;
            }

            .skeleton-chart-area {
                height: 300px;
                margin: 20px 0;
            }

            .skeleton-chart-legend {
                display: flex;
                gap: 20px;
                justify-content: center;
            }

            .skeleton-legend-item {
                width: 100px;
                height: 16px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }

            @keyframes skeleton-loading {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }

            /* Loading states */
            .progressive-loading {
                position: relative;
                overflow: hidden;
            }

            .progressive-loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .progressive-loading::after {
                content: '';
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                z-index: 11;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            /* Fade in animations */
            .progressive-loaded {
                animation: fadeIn 0.3s ease-in;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Error states */
            .progressive-error {
                background: #ffebee;
                border: 1px solid #f44336;
                border-radius: 4px;
                padding: 20px;
                text-align: center;
                color: #d32f2f;
            }

            .progressive-retry-button {
                background: #f44336;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            }

            .progressive-retry-button:hover {
                background: #d32f2f;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Register content for progressive loading
     */
    registerContent(element, contentType, options = {}) {
        const {
            priority = 'normal',
            loadImmediately = false,
            prefetch = false,
            customLoader = null,
            cacheKey = null
        } = options;

        if (loadImmediately) {
            this.loadContent(element, 'critical', contentType, customLoader, cacheKey);
        } else {
            // Show skeleton screen
            this.showSkeletonScreen(element, contentType);
            
            // Observe for intersection
            const observer = this.intersectionObservers.get(priority);
            if (observer) {
                observer.observe(element);
            }
            
            // Store metadata
            element.dataset.contentType = contentType;
            element.dataset.priority = priority;
            
            if (customLoader) {
                element.dataset.customLoader = 'true';
                this.contentLoaders.set(`custom-${Date.now()}`, {
                    loader: customLoader,
                    skeleton: this.getSkeletonForContentType(contentType),
                    batchSize: 1,
                    cacheTimeout: 300000
                });
            }
            
            if (cacheKey) {
                element.dataset.cacheKey = cacheKey;
            }
        }

        if (prefetch) {
            this.prefetchQueue.push({ element, contentType, priority: 'background' });
        }

        console.log(`Registered content: ${contentType} with priority: ${priority}`);
    }

    /**
     * Load content with progressive strategy
     */
    async loadContent(element, priority, contentType = null, customLoader = null, cacheKey = null) {
        const startTime = performance.now();
        const type = contentType || element.dataset.contentType;
        const key = cacheKey || element.dataset.cacheKey || this.generateCacheKey(element, type);
        
        try {
            // Check cache first
            if (this.cache.has(key)) {
                const cachedData = this.cache.get(key);
                if (Date.now() - cachedData.timestamp < cachedData.timeout) {
                    this.renderContent(element, cachedData.data, type);
                    this.loadingMetrics.cacheHits++;
                    console.log(`Cache hit for: ${type}`);
                    return;
                }
            }

            // Show loading state
            this.showLoadingState(element);

            // Get loader
            const loaderConfig = customLoader ? 
                { loader: customLoader, skeleton: type, batchSize: 1, cacheTimeout: 300000 } :
                this.contentLoaders.get(type);

            if (!loaderConfig) {
                throw new Error(`No loader found for content type: ${type}`);
            }

            // Load content
            const data = await loaderConfig.loader(element, priority);

            // Cache the data
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                timeout: loaderConfig.cacheTimeout
            });

            // Render content
            this.renderContent(element, data, type);

            // Update metrics
            this.loadingMetrics.successfulLoads++;
            this.updateAverageLoadTime(performance.now() - startTime);

            console.log(`Loaded content: ${type} in ${(performance.now() - startTime).toFixed(2)}ms`);

        } catch (error) {
            console.error(`Failed to load content: ${type}`, error);
            this.handleLoadingError(element, type, error);
            this.loadingMetrics.failedLoads++;
        } finally {
            this.loadingMetrics.totalRequests++;
        }
    }

    /**
     * Content loader implementations
     */

    async loadMealSuggestions(element, priority) {
        // Simulate API call with realistic delay
        const delay = this.loadingStrategies[priority].delay;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Get meal preferences from element or user settings
        const preferences = this.getMealPreferences(element);
        
        // Mock meal data (in real app, this would be an API call)
        const meals = [
            {
                id: 1,
                name: "Mediterranean Quinoa Bowl",
                image: "/images/quinoa-bowl.jpg",
                description: "Fresh quinoa with roasted vegetables and tahini dressing",
                tags: ["Vegetarian", "Healthy", "Quick"],
                rating: 4.5,
                cookTime: "25 min",
                difficulty: "Easy"
            },
            {
                id: 2,
                name: "Grilled Salmon with Asparagus",
                image: "/images/salmon-asparagus.jpg",
                description: "Perfectly grilled salmon with seasoned asparagus spears",
                tags: ["High Protein", "Keto", "Seafood"],
                rating: 4.8,
                cookTime: "20 min",
                difficulty: "Medium"
            },
            {
                id: 3,
                name: "Chicken Stir Fry",
                image: "/images/chicken-stir-fry.jpg",
                description: "Colorful vegetables and tender chicken in savory sauce",
                tags: ["Quick", "One Pan", "Asian"],
                rating: 4.3,
                cookTime: "15 min",
                difficulty: "Easy"
            }
        ];

        return { meals, preferences };
    }

    async loadRecipeDetails(element, priority) {
        const delay = this.loadingStrategies[priority].delay;
        await new Promise(resolve => setTimeout(resolve, delay));

        const recipeId = element.dataset.recipeId;
        
        // Mock recipe detail data
        const recipe = {
            id: recipeId,
            name: "Mediterranean Quinoa Bowl",
            image: "/images/quinoa-bowl-hero.jpg",
            description: "A nutritious and delicious quinoa bowl featuring roasted vegetables, fresh herbs, and a creamy tahini dressing.",
            cookTime: "25 min",
            prepTime: "15 min",
            difficulty: "Easy",
            servings: 4,
            rating: 4.5,
            ingredients: [
                { name: "Quinoa", amount: "1 cup", unit: "cup" },
                { name: "Cherry tomatoes", amount: "2 cups", unit: "cups" },
                { name: "Cucumber", amount: "1 large", unit: "piece" },
                { name: "Red onion", amount: "1/2 medium", unit: "piece" },
                { name: "Tahini", amount: "3 tbsp", unit: "tablespoons" }
            ],
            instructions: [
                "Rinse quinoa and cook according to package directions",
                "Chop vegetables and prepare tahini dressing",
                "Combine all ingredients in a bowl and toss with dressing",
                "Season with salt and pepper to taste"
            ],
            nutrition: {
                calories: 320,
                protein: 12,
                carbs: 45,
                fat: 11,
                fiber: 6
            }
        };

        return recipe;
    }

    async loadMealList(element, priority) {
        const delay = this.loadingStrategies[priority].delay;
        await new Promise(resolve => setTimeout(resolve, delay));

        const category = element.dataset.category || 'all';
        const batchSize = parseInt(element.dataset.batchSize) || 12;
        
        // Mock meal list data
        const mealList = Array.from({ length: batchSize }, (_, index) => ({
            id: index + 1,
            name: `Meal ${index + 1}`,
            image: `/images/meal-${index + 1}.jpg`,
            category: category,
            rating: Math.random() * 2 + 3, // 3-5 rating
            cookTime: `${Math.floor(Math.random() * 30) + 10} min`
        }));

        return { meals: mealList, category, total: batchSize * 3 };
    }

    async loadNutritionData(element, priority) {
        const delay = this.loadingStrategies[priority].delay;
        await new Promise(resolve => setTimeout(resolve, delay));

        const mealId = element.dataset.mealId;
        
        // Mock nutrition data
        const nutritionData = {
            mealId,
            calories: 450,
            macros: {
                protein: { amount: 25, percentage: 22 },
                carbs: { amount: 55, percentage: 49 },
                fat: { amount: 15, percentage: 29 }
            },
            micros: {
                vitamin_c: 45,
                iron: 15,
                calcium: 20,
                fiber: 8
            },
            goals: {
                dailyCalories: 2000,
                proteinGoal: 150,
                carbsGoal: 250,
                fatGoal: 67
            }
        };

        return nutritionData;
    }

    async loadShoppingListData(element, priority) {
        const delay = this.loadingStrategies[priority].delay;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Mock shopping list data
        const shoppingList = {
            categories: [
                {
                    name: "Produce",
                    items: [
                        { name: "Tomatoes", quantity: "2 lbs", checked: false },
                        { name: "Spinach", quantity: "1 bag", checked: true },
                        { name: "Onions", quantity: "3 medium", checked: false }
                    ]
                },
                {
                    name: "Proteins",
                    items: [
                        { name: "Chicken breast", quantity: "2 lbs", checked: false },
                        { name: "Salmon fillets", quantity: "4 pieces", checked: false }
                    ]
                },
                {
                    name: "Pantry",
                    items: [
                        { name: "Quinoa", quantity: "1 box", checked: true },
                        { name: "Olive oil", quantity: "1 bottle", checked: false }
                    ]
                }
            ],
            totalItems: 8,
            checkedItems: 2,
            estimatedCost: 67.50
        };

        return shoppingList;
    }

    /**
     * Show skeleton screen
     */
    showSkeletonScreen(element, contentType) {
        const skeletonType = this.getSkeletonForContentType(contentType);
        const template = document.querySelector(`[data-template="${skeletonType}"]`);
        
        if (template) {
            const skeleton = template.cloneNode(true);
            skeleton.style.display = 'block';
            skeleton.removeAttribute('data-template');
            skeleton.classList.add('progressive-skeleton');
            
            element.innerHTML = '';
            element.appendChild(skeleton);
        }
    }

    /**
     * Get skeleton type for content type
     */
    getSkeletonForContentType(contentType) {
        const skeletonMap = {
            'meals': 'meal-card-skeleton',
            'recipe': 'recipe-detail-skeleton',
            'mealList': 'meal-list-skeleton',
            'nutrition': 'chart-skeleton',
            'shopping': 'meal-list-skeleton'
        };
        
        return skeletonMap[contentType] || 'meal-card-skeleton';
    }

    /**
     * Show loading state
     */
    showLoadingState(element) {
        element.classList.add('progressive-loading');
    }

    /**
     * Hide loading state
     */
    hideLoadingState(element) {
        element.classList.remove('progressive-loading');
    }

    /**
     * Render content
     */
    renderContent(element, data, contentType) {
        this.hideLoadingState(element);
        
        // Remove skeleton
        const skeleton = element.querySelector('.progressive-skeleton');
        if (skeleton) {
            skeleton.remove();
        }
        
        // Render based on content type
        switch (contentType) {
            case 'meals':
                this.renderMealSuggestions(element, data);
                break;
            case 'recipe':
                this.renderRecipeDetails(element, data);
                break;
            case 'mealList':
                this.renderMealList(element, data);
                break;
            case 'nutrition':
                this.renderNutritionData(element, data);
                break;
            case 'shopping':
                this.renderShoppingListData(element, data);
                break;
            default:
                console.warn('Unknown content type:', contentType);
        }
        
        // Add loaded animation
        element.classList.add('progressive-loaded');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('progressive-loaded');
        }, 300);
    }

    /**
     * Content rendering methods
     */

    renderMealSuggestions(element, data) {
        const { meals } = data;
        
        const mealGrid = document.createElement('div');
        mealGrid.className = 'meal-suggestions-grid';
        
        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            mealCard.innerHTML = `
                <img src="${meal.image}" alt="${meal.name}" loading="lazy">
                <div class="meal-card-content">
                    <h3>${meal.name}</h3>
                    <p>${meal.description}</p>
                    <div class="meal-tags">
                        ${meal.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="meal-meta">
                        <span class="rating">★ ${meal.rating}</span>
                        <span class="cook-time">${meal.cookTime}</span>
                        <span class="difficulty">${meal.difficulty}</span>
                    </div>
                </div>
            `;
            
            mealGrid.appendChild(mealCard);
        });
        
        element.innerHTML = '';
        element.appendChild(mealGrid);
    }

    renderRecipeDetails(element, data) {
        const recipe = data;
        
        element.innerHTML = `
            <div class="recipe-detail">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-hero-image">
                <div class="recipe-header">
                    <h1>${recipe.name}</h1>
                    <p>${recipe.description}</p>
                    <div class="recipe-meta">
                        <span class="prep-time">Prep: ${recipe.prepTime}</span>
                        <span class="cook-time">Cook: ${recipe.cookTime}</span>
                        <span class="difficulty">${recipe.difficulty}</span>
                        <span class="servings">${recipe.servings} servings</span>
                        <span class="rating">★ ${recipe.rating}</span>
                    </div>
                </div>
                
                <div class="recipe-sections">
                    <div class="ingredients-section">
                        <h2>Ingredients</h2>
                        <ul class="ingredients-list">
                            ${recipe.ingredients.map(ing => 
                                `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="instructions-section">
                        <h2>Instructions</h2>
                        <ol class="instructions-list">
                            ${recipe.instructions.map(instruction => 
                                `<li>${instruction}</li>`
                            ).join('')}
                        </ol>
                    </div>
                    
                    <div class="nutrition-section">
                        <h2>Nutrition (per serving)</h2>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="nutrition-label">Calories</span>
                                <span class="nutrition-value">${recipe.nutrition.calories}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Protein</span>
                                <span class="nutrition-value">${recipe.nutrition.protein}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Carbs</span>
                                <span class="nutrition-value">${recipe.nutrition.carbs}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Fat</span>
                                <span class="nutrition-value">${recipe.nutrition.fat}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Fiber</span>
                                <span class="nutrition-value">${recipe.nutrition.fiber}g</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMealList(element, data) {
        const { meals, category, total } = data;
        
        const mealListContainer = document.createElement('div');
        mealListContainer.className = 'meal-list-container';
        
        const header = document.createElement('div');
        header.className = 'meal-list-header';
        header.innerHTML = `
            <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Meals</h2>
            <span class="meal-count">${meals.length} of ${total} meals</span>
        `;
        
        const mealGrid = document.createElement('div');
        mealGrid.className = 'meal-list-grid';
        
        meals.forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-list-item';
            mealItem.innerHTML = `
                <img src="${meal.image}" alt="${meal.name}" loading="lazy">
                <div class="meal-info">
                    <h3>${meal.name}</h3>
                    <div class="meal-meta">
                        <span class="rating">★ ${meal.rating.toFixed(1)}</span>
                        <span class="cook-time">${meal.cookTime}</span>
                    </div>
                </div>
            `;
            
            mealGrid.appendChild(mealItem);
        });
        
        mealListContainer.appendChild(header);
        mealListContainer.appendChild(mealGrid);
        
        element.innerHTML = '';
        element.appendChild(mealListContainer);
    }

    renderNutritionData(element, data) {
        const nutrition = data;
        
        element.innerHTML = `
            <div class="nutrition-dashboard">
                <h2>Nutrition Overview</h2>
                
                <div class="calories-section">
                    <div class="calories-main">
                        <span class="calories-value">${nutrition.calories}</span>
                        <span class="calories-label">calories</span>
                    </div>
                    <div class="calories-goal">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(nutrition.calories / nutrition.goals.dailyCalories) * 100}%"></div>
                        </div>
                        <span class="goal-text">${nutrition.calories} / ${nutrition.goals.dailyCalories} daily goal</span>
                    </div>
                </div>
                
                <div class="macros-section">
                    <h3>Macronutrients</h3>
                    <div class="macros-grid">
                        <div class="macro-item">
                            <span class="macro-label">Protein</span>
                            <span class="macro-value">${nutrition.macros.protein.amount}g</span>
                            <span class="macro-percentage">${nutrition.macros.protein.percentage}%</span>
                        </div>
                        <div class="macro-item">
                            <span class="macro-label">Carbs</span>
                            <span class="macro-value">${nutrition.macros.carbs.amount}g</span>
                            <span class="macro-percentage">${nutrition.macros.carbs.percentage}%</span>
                        </div>
                        <div class="macro-item">
                            <span class="macro-label">Fat</span>
                            <span class="macro-value">${nutrition.macros.fat.amount}g</span>
                            <span class="macro-percentage">${nutrition.macros.fat.percentage}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="micros-section">
                    <h3>Key Nutrients</h3>
                    <div class="micros-grid">
                        <div class="micro-item">
                            <span class="micro-label">Vitamin C</span>
                            <span class="micro-value">${nutrition.micros.vitamin_c}%</span>
                        </div>
                        <div class="micro-item">
                            <span class="micro-label">Iron</span>
                            <span class="micro-value">${nutrition.micros.iron}%</span>
                        </div>
                        <div class="micro-item">
                            <span class="micro-label">Calcium</span>
                            <span class="micro-value">${nutrition.micros.calcium}%</span>
                        </div>
                        <div class="micro-item">
                            <span class="micro-label">Fiber</span>
                            <span class="micro-value">${nutrition.micros.fiber}g</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderShoppingListData(element, data) {
        const shoppingList = data;
        
        const listContainer = document.createElement('div');
        listContainer.className = 'shopping-list-container';
        
        const header = document.createElement('div');
        header.className = 'shopping-list-header';
        header.innerHTML = `
            <h2>Shopping List</h2>
            <div class="shopping-summary">
                <span class="items-progress">${shoppingList.checkedItems}/${shoppingList.totalItems} items</span>
                <span class="estimated-cost">$${shoppingList.estimatedCost.toFixed(2)}</span>
            </div>
        `;
        
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'shopping-categories';
        
        shoppingList.categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'shopping-category';
            
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category.name;
            
            const itemsList = document.createElement('ul');
            itemsList.className = 'shopping-items';
            
            category.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = `shopping-item ${item.checked ? 'checked' : ''}`;
                listItem.innerHTML = `
                    <label class="shopping-item-label">
                        <input type="checkbox" ${item.checked ? 'checked' : ''}>
                        <span class="shopping-item-name">${item.name}</span>
                        <span class="shopping-item-quantity">${item.quantity}</span>
                    </label>
                `;
                
                itemsList.appendChild(listItem);
            });
            
            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(itemsList);
            categoriesContainer.appendChild(categorySection);
        });
        
        listContainer.appendChild(header);
        listContainer.appendChild(categoriesContainer);
        
        element.innerHTML = '';
        element.appendChild(listContainer);
    }

    /**
     * Handle loading errors
     */
    handleLoadingError(element, contentType, error) {
        this.hideLoadingState(element);
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'progressive-error';
        errorContainer.innerHTML = `
            <h3>Failed to load content</h3>
            <p>We couldn't load the ${contentType} content. Please try again.</p>
            <button class="progressive-retry-button" onclick="progressiveLoadingManager.retryLoad('${element.id}', '${contentType}')">
                Retry
            </button>
        `;
        
        element.innerHTML = '';
        element.appendChild(errorContainer);
        
        // Setup retry mechanism
        const retryCount = this.retryAttempts.get(element) || 0;
        this.retryAttempts.set(element, retryCount + 1);
    }

    /**
     * Retry loading content
     */
    async retryLoad(elementId, contentType) {
        const element = document.getElementById(elementId);
        if (element) {
            const retryCount = this.retryAttempts.get(element) || 0;
            
            if (retryCount < 3) {
                await this.loadContent(element, 'normal', contentType);
            } else {
                element.innerHTML = `
                    <div class="progressive-error">
                        <h3>Unable to load content</h3>
                        <p>Multiple attempts failed. Please refresh the page or try again later.</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Setup offline handling
     */
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingLoads();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Process pending loads when coming back online
     */
    processPendingLoads() {
        const pendingElements = document.querySelectorAll('.progressive-error');
        
        pendingElements.forEach(errorElement => {
            const container = errorElement.parentElement;
            const contentType = container.dataset.contentType;
            
            if (contentType) {
                this.loadContent(container, 'normal', contentType);
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor loading performance
        setInterval(() => {
            console.log('Progressive Loading Metrics:', this.getLoadingMetrics());
        }, 30000); // Log every 30 seconds
    }

    /**
     * Setup prefetching system
     */
    setupPrefetchingSystem() {
        // Process prefetch queue periodically
        setInterval(() => {
            if (this.prefetchQueue.length > 0 && this.isOnline) {
                const item = this.prefetchQueue.shift();
                this.loadContent(item.element, item.priority, item.contentType);
            }
        }, 2000);
    }

    /**
     * Setup retry mechanisms
     */
    setupRetryMechanisms() {
        // Exponential backoff for failed requests
        this.retryDelays = [1000, 2000, 4000, 8000]; // 1s, 2s, 4s, 8s
    }

    /**
     * Utility methods
     */

    getMealPreferences(element) {
        return {
            dietaryRestrictions: element.dataset.dietary?.split(',') || [],
            cuisinePreferences: element.dataset.cuisine?.split(',') || [],
            maxCookTime: parseInt(element.dataset.maxCookTime) || 60
        };
    }

    generateCacheKey(element, contentType) {
        const id = element.id || element.dataset.cacheKey || `${contentType}-${Date.now()}`;
        return `${contentType}:${id}`;
    }

    updateAverageLoadTime(loadTime) {
        const currentAvg = this.loadingMetrics.averageLoadTime;
        const totalLoads = this.loadingMetrics.successfulLoads;
        
        this.loadingMetrics.averageLoadTime = 
            ((currentAvg * (totalLoads - 1)) + loadTime) / totalLoads;
    }

    getLoadingMetrics() {
        return {
            ...this.loadingMetrics,
            cacheSize: this.cache.size,
            pendingPrefetches: this.prefetchQueue.length,
            isOnline: this.isOnline
        };
    }

    /**
     * Public API methods
     */

    prefetchContent(contentType, options = {}) {
        const element = document.createElement('div');
        element.style.display = 'none';
        document.body.appendChild(element);
        
        this.registerContent(element, contentType, {
            ...options,
            prefetch: true,
            priority: 'background'
        });
    }

    clearCache() {
        this.cache.clear();
        console.log('Progressive loading cache cleared');
    }

    updateLoadingStrategy(priority, strategy) {
        this.loadingStrategies[priority] = { ...this.loadingStrategies[priority], ...strategy };
    }

    /**
     * Cleanup
     */
    cleanup() {
        // Disconnect observers
        this.intersectionObservers.forEach(observer => observer.disconnect());
        
        // Clear cache
        this.cache.clear();
        
        // Clear queues
        this.prefetchQueue.length = 0;
        
        console.log('Progressive loading manager cleaned up');
    }
}

// Export singleton instance
export const progressiveLoadingManager = new ProgressiveLoadingManager();
