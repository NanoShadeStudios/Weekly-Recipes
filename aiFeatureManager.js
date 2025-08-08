/**
 * AI Feature Manager Module
 * Manages AI-related features, status tracking, and fallback handling
 */

import { firebaseAI } from './aiService.js';

export class AIFeatureManager {
    constructor() {
        this.isInitialized = false;
        this.aiStatus = 'offline';
        this.features = new Map();
        this.statusListeners = [];
    }

    /**
     * Initialize AI features
     */
    async initialize() {
        console.log('AIFeatureManager: Initializing AI features...');
        
        try {
            // Check AI service availability
            await this.checkAIAvailability();
            
            // Set up AI features based on availability
            if (this.aiStatus === 'online') {
                await this.enableAdvancedFeatures();
            } else {
                this.enableBasicFeatures();
            }
            
            // Add status indicator to UI
            this.addStatusIndicator();
            
            // Set up status monitoring
            this.setupStatusMonitoring();
            
            this.isInitialized = true;
            console.log('AIFeatureManager: Initialization complete. Status:', this.aiStatus);
            
        } catch (error) {
            console.error('AIFeatureManager: Initialization failed:', error);
            this.aiStatus = 'error';
            this.enableBasicFeatures();
        }
    }

    /**
     * Check AI service availability
     */
    async checkAIAvailability() {
        console.log('AIFeatureManager: Checking AI availability...');
        
        try {
            if (firebaseAI && (firebaseAI.isInitialized || firebaseAI.fallbackMode)) {
                if (firebaseAI.isInitialized) {
                    this.aiStatus = 'online';
                    console.log('AIFeatureManager: AI service is online');
                } else {
                    this.aiStatus = 'fallback';
                    console.log('AIFeatureManager: AI service in fallback mode');
                }
            } else {
                this.aiStatus = 'offline';
                console.log('AIFeatureManager: AI service not available');
            }
        } catch (error) {
            console.error('AIFeatureManager: Error checking AI availability:', error);
            this.aiStatus = 'error';
        }
    }

    /**
     * Enable advanced AI features
     */
    async enableAdvancedFeatures() {
        console.log('AIFeatureManager: Enabling advanced AI features...');
        
        const advancedFeatures = [
            { name: 'aiInsights', handler: this.setupAIInsights.bind(this) },
            { name: 'smartMealGeneration', handler: this.setupSmartMealGeneration.bind(this) },
            { name: 'nutritionAnalysis', handler: this.setupNutritionAnalysis.bind(this) },
            { name: 'personalization', handler: this.setupPersonalization.bind(this) }
        ];

        for (const feature of advancedFeatures) {
            try {
                await feature.handler();
                this.features.set(feature.name, { status: 'enabled', type: 'advanced' });
                console.log(`AIFeatureManager: Enabled ${feature.name}`);
            } catch (error) {
                console.warn(`AIFeatureManager: Failed to enable ${feature.name}:`, error);
                this.features.set(feature.name, { status: 'error', type: 'advanced', error });
            }
        }
    }

    /**
     * Enable basic features when AI is not available
     */
    enableBasicFeatures() {
        console.log('AIFeatureManager: Enabling basic feature set...');
        
        const basicFeatures = [
            { name: 'basicMealGeneration', handler: this.setupBasicMealGeneration.bind(this) },
            { name: 'templateMeals', handler: this.setupTemplateMeals.bind(this) },
            { name: 'basicNutrition', handler: this.setupBasicNutrition.bind(this) }
        ];

        for (const feature of basicFeatures) {
            try {
                feature.handler();
                this.features.set(feature.name, { status: 'enabled', type: 'basic' });
                console.log(`AIFeatureManager: Enabled ${feature.name}`);
            } catch (error) {
                console.warn(`AIFeatureManager: Failed to enable ${feature.name}:`, error);
                this.features.set(feature.name, { status: 'error', type: 'basic', error });
            }
        }

        // Add basic mode indicator
        this.addBasicModeIndicator();
    }

    /**
     * Set up AI insights feature
     */
    async setupAIInsights() {
        // Add AI insights to the UI
        const insightsContainer = document.getElementById('aiInsights');
        if (insightsContainer) {
            const insights = await this.generateAIInsights();
            this.displayInsights(insights, insightsContainer);
        }
    }

    /**
     * Set up smart meal generation
     */
    setupSmartMealGeneration() {
        // Enhance meal generation with AI
        const generateButton = document.getElementById('generatePlanBtn');
        if (generateButton) {
            generateButton.innerHTML = '🤖 Generate Smart Plan';
            generateButton.title = 'AI-powered meal planning with personalized recommendations';
        }
    }

    /**
     * Set up nutrition analysis feature
     */
    setupNutritionAnalysis() {
        // Add advanced nutrition analysis
        const nutritionSection = document.getElementById('nutrition-tracking');
        if (nutritionSection) {
            const aiAnalysisBtn = document.createElement('button');
            aiAnalysisBtn.innerHTML = '🔬 AI Nutrition Analysis';
            aiAnalysisBtn.className = 'btn btn-secondary';
            aiAnalysisBtn.onclick = () => this.runAINutritionAnalysis();
            nutritionSection.appendChild(aiAnalysisBtn);
        }
    }

    /**
     * Set up personalization features
     */
    setupPersonalization() {
        // Add personalization based on user history
        console.log('AIFeatureManager: Setting up AI personalization...');
        
        // This would implement learning from user preferences
        this.setupPreferenceLearning();
    }

    /**
     * Set up basic meal generation
     */
    setupBasicMealGeneration() {
        const generateButton = document.getElementById('generatePlanBtn');
        if (generateButton) {
            generateButton.innerHTML = '📋 Generate Plan (Basic)';
            generateButton.title = 'Basic meal planning using templates';
        }
    }

    /**
     * Set up template meals
     */
    setupTemplateMeals() {
        console.log('AIFeatureManager: Setting up template-based meals...');
        // This would set up fallback meal templates
    }

    /**
     * Set up basic nutrition tracking
     */
    setupBasicNutrition() {
        console.log('AIFeatureManager: Setting up basic nutrition tracking...');
        // This would implement basic nutrition calculations
    }

    /**
     * Add AI status indicator to UI
     */
    addStatusIndicator() {
        const statusContainer = document.getElementById('aiStatus') || this.createStatusContainer();
        
        const indicator = document.createElement('div');
        indicator.className = `ai-status-indicator ai-status-${this.aiStatus}`;
        indicator.innerHTML = this.getStatusHTML();
        
        statusContainer.innerHTML = '';
        statusContainer.appendChild(indicator);
    }

    /**
     * Create status container if it doesn't exist
     */
    createStatusContainer() {
        const container = document.createElement('div');
        container.id = 'aiStatus';
        container.className = 'ai-status-container';
        
        // Add to header or main navigation
        const header = document.querySelector('header') || document.querySelector('.main-nav');
        if (header) {
            header.appendChild(container);
        }
        
        return container;
    }

    /**
     * Get HTML for status indicator
     */
    getStatusHTML() {
        const statusConfig = {
            online: {
                icon: '🤖',
                text: 'AI Online',
                color: '#4caf50',
                description: 'Advanced AI features available'
            },
            fallback: {
                icon: '⚠️',
                text: 'AI Limited',
                color: '#ff9800',
                description: 'Basic AI features available'
            },
            offline: {
                icon: '🔧',
                text: 'Basic Mode',
                color: '#9e9e9e',
                description: 'Using template-based planning'
            },
            error: {
                icon: '❌',
                text: 'AI Error',
                color: '#f44336',
                description: 'AI service unavailable'
            }
        };

        const config = statusConfig[this.aiStatus] || statusConfig.offline;
        
        return `
            <span class="ai-status-icon">${config.icon}</span>
            <span class="ai-status-text">${config.text}</span>
            <span class="ai-status-description" title="${config.description}">${config.description}</span>
        `;
    }

    /**
     * Add basic mode indicator
     */
    addBasicModeIndicator() {
        const modeIndicator = document.createElement('div');
        modeIndicator.className = 'basic-mode-banner';
        modeIndicator.innerHTML = `
            <span class="basic-mode-icon">🔧</span>
            <span class="basic-mode-text">Running in Basic Mode - Advanced AI features unavailable</span>
            <button class="basic-mode-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.prepend(modeIndicator);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (modeIndicator.parentElement) {
                modeIndicator.remove();
            }
        }, 10000);
    }

    /**
     * Set up status monitoring
     */
    setupStatusMonitoring() {
        // Periodically check AI status
        setInterval(() => {
            this.checkAIAvailability();
        }, 30000); // Check every 30 seconds
        
        // Listen for network changes
        window.addEventListener('online', () => {
            console.log('AIFeatureManager: Network back online, rechecking AI...');
            setTimeout(() => this.checkAIAvailability(), 1000);
        });
    }

    /**
     * Generate AI insights
     */
    async generateAIInsights() {
        try {
            if (firebaseAI && firebaseAI.isInitialized) {
                // This would call the actual AI service for insights
                return {
                    mealRecommendations: await this.getMealRecommendations(),
                    nutritionTips: await this.getNutritionTips(),
                    preferences: await this.getPersonalizedPreferences()
                };
            }
        } catch (error) {
            console.warn('AIFeatureManager: Error generating insights:', error);
        }
        
        return null;
    }

    /**
     * Display AI insights in container
     */
    displayInsights(insights, container) {
        if (!insights) return;
        
        container.innerHTML = `
            <div class="ai-insights">
                <h3>🤖 AI Insights</h3>
                <div class="insights-content">
                    <div class="insight-section">
                        <h4>Recommended for You</h4>
                        <p>${insights.mealRecommendations || 'No recommendations available'}</p>
                    </div>
                    <div class="insight-section">
                        <h4>Nutrition Tips</h4>
                        <p>${insights.nutritionTips || 'No tips available'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Run AI nutrition analysis
     */
    async runAINutritionAnalysis() {
        console.log('AIFeatureManager: Running AI nutrition analysis...');
        // This would implement advanced nutrition analysis
    }

    /**
     * Set up preference learning
     */
    setupPreferenceLearning() {
        // This would implement AI-based preference learning
        console.log('AIFeatureManager: Setting up preference learning...');
    }

    /**
     * Get meal recommendations
     */
    async getMealRecommendations() {
        // Placeholder for AI meal recommendations
        return "Based on your preferences, try Mediterranean dishes this week!";
    }

    /**
     * Get nutrition tips
     */
    async getNutritionTips() {
        // Placeholder for AI nutrition tips
        return "Consider adding more leafy greens to boost your iron intake.";
    }

    /**
     * Get personalized preferences
     */
    async getPersonalizedPreferences() {
        // Placeholder for AI-generated preferences
        return {};
    }

    /**
     * Get current AI status
     */
    getStatus() {
        return this.aiStatus;
    }

    /**
     * Get enabled features
     */
    getEnabledFeatures() {
        return Array.from(this.features.entries()).filter(([name, config]) => config.status === 'enabled');
    }

    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(featureName) {
        const feature = this.features.get(featureName);
        return feature && feature.status === 'enabled';
    }

    /**
     * Add status change listener
     */
    addStatusListener(callback) {
        this.statusListeners.push(callback);
    }

    /**
     * Notify status listeners
     */
    notifyStatusChange(oldStatus, newStatus) {
        this.statusListeners.forEach(callback => {
            try {
                callback(oldStatus, newStatus);
            } catch (error) {
                console.error('AIFeatureManager: Error in status listener:', error);
            }
        });
    }
}

// Create and export singleton
export const aiFeatureManager = new AIFeatureManager();
