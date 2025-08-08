/**
 * Enhanced AI Recommendation Engine UI
 * User interface for advanced AI recommendations with cuisine learning,
 * seasonal suggestions, skill adaptation, and time-based recommendations.
 */

export class EnhancedAIRecommendationUI {
    constructor() {
        this.currentRecommendations = null;
        this.recommendationContext = {};
        this.isLoading = false;
        
        this.initializeUI();
        console.log('Enhanced AI Recommendation UI initialized');
    }

    /**
     * Initialize the AI recommendation UI
     */
    initializeUI() {
        this.addAIRecommendationControls();
        this.bindEventListeners();
        this.loadUserInterface();
    }

    /**
     * Add AI recommendation controls to the existing UI
     */
    addAIRecommendationControls() {
        // Add to main navigation if not already present
        const mainNav = document.querySelector('.main-nav') || document.querySelector('.tab-buttons');
        if (mainNav && !mainNav.querySelector('.ai-recommendations-tab')) {
            const aiTab = document.createElement('button');
            aiTab.className = 'tab-button ai-recommendations-tab';
            aiTab.textContent = '🧠 AI Recommendations';
            aiTab.onclick = () => this.showAIRecommendationsTab();
            mainNav.appendChild(aiTab);
        }

        // Add enhanced AI button to meal generation controls
        const controlsContainer = document.querySelector('.controls') || document.querySelector('.meal-controls');
        if (controlsContainer && !controlsContainer.querySelector('.enhanced-ai-recommendations-btn')) {
            const aiButton = document.createElement('button');
            aiButton.className = 'btn btn-primary enhanced-ai-recommendations-btn';
            aiButton.innerHTML = '✨ Smart AI Recommendations';
            aiButton.onclick = () => this.showAIRecommendationsModal();
            controlsContainer.appendChild(aiButton);
        }
    }

    /**
     * Bind event listeners for AI recommendations
     */
    bindEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.generate-ai-recommendations-btn')) {
                this.generateAIRecommendations();
            }
            if (e.target.matches('.like-ai-recommendation-btn')) {
                this.handleRecommendationFeedback(e.target.dataset.foodId, 'like');
            }
            if (e.target.matches('.dislike-ai-recommendation-btn')) {
                this.handleRecommendationFeedback(e.target.dataset.foodId, 'dislike');
            }
            if (e.target.matches('.apply-ai-recommendation-btn')) {
                this.applyAIRecommendation(e.target.dataset.foodId);
            }
            if (e.target.matches('.ai-preference-settings-btn')) {
                this.showAIPreferencesModal();
            }
        });

        // Listen for meal generation events to provide AI insights
        const self = this; // Preserve context
        document.addEventListener('mealGenerated', function(e) {
            try {
                if (e.detail && e.detail.meal) {
                    // Use preserved context and check if method exists
                    if (self.provideMealInsights && typeof self.provideMealInsights === 'function') {
                        self.provideMealInsights(e.detail.meal);
                    } else {
                        console.warn('provideMealInsights method not available on context');
                    }
                }
            } catch (error) {
                console.error('Error in mealGenerated event listener:', error);
            }
        });
    }

    /**
     * Provide AI insights for a generated meal
     */
    provideMealInsights(meal) {
        try {
            if (!meal) return;
            
            console.log('Providing AI insights for meal:', meal.name || 'Unknown meal');
            
            // Generate insights based on meal properties
            const insights = this.generateInsights(meal);
            
            // Display insights in the UI
            this.displayInsights(insights);
        } catch (error) {
            console.error('Error providing meal insights:', error);
        }
    }

    /**
     * Generate insights for a meal
     */
    generateInsights(meal) {
        const insights = [];
        
        // Nutritional insights
        if (meal.nutrition) {
            if (meal.nutrition.calories > 800) {
                insights.push({
                    type: 'nutrition',
                    message: 'This is a high-calorie meal. Consider pairing with light sides.',
                    icon: '🔥'
                });
            }
            
            if (meal.nutrition.protein > 25) {
                insights.push({
                    type: 'nutrition',
                    message: 'Excellent protein content for muscle building and satiety.',
                    icon: '💪'
                });
            }
        }
        
        // Cooking insights
        if (meal.cookTime && meal.cookTime > 45) {
            insights.push({
                type: 'cooking',
                message: 'This meal requires longer cooking time. Consider meal prep.',
                icon: '⏰'
            });
        }
        
        // Ingredient insights
        if (meal.ingredients && meal.ingredients.length > 10) {
            insights.push({
                type: 'cooking',
                message: 'Complex recipe with many ingredients. Prep ingredients beforehand.',
                icon: '📝'
            });
        }
        
        return insights;
    }

    /**
     * Display insights in the UI
     */
    displayInsights(insights) {
        let insightsContainer = document.getElementById('ai-insights-container');
        
        // Create insights container if it doesn't exist
        if (!insightsContainer) {
            insightsContainer = document.createElement('div');
            insightsContainer.id = 'ai-insights-container';
            insightsContainer.className = 'ai-insights-container';
            insightsContainer.innerHTML = '<h3>🧠 AI Meal Insights</h3>';
            
            // Try to add it to the meal plan display area
            const mealPlanDisplay = document.getElementById('meal-plan-display');
            if (mealPlanDisplay) {
                mealPlanDisplay.insertAdjacentElement('afterend', insightsContainer);
            } else {
                // Fallback: add to main content area
                const mainContent = document.querySelector('.main-content') || document.body;
                mainContent.appendChild(insightsContainer);
            }
        }
        
        // Clear existing insights (except the header)
        const existingInsights = insightsContainer.querySelectorAll('.insight-item');
        existingInsights.forEach(item => item.remove());
        
        insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = `insight-item insight-${insight.type}`;
            insightElement.innerHTML = `
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-message">${insight.message}</span>
            `;
            insightsContainer.appendChild(insightElement);
        });
    }

    /**
     * Show AI recommendations tab
     */
    showAIRecommendationsTab() {
        // Hide other tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        // Show AI recommendations tab
        let aiTab = document.getElementById('ai-recommendations-tab');
        if (!aiTab) {
            aiTab = this.createAIRecommendationsTab();
            document.querySelector('.tab-container') && document.querySelector('.tab-container').appendChild(aiTab);
        }

        aiTab.classList.add('active');
        document.querySelector('.ai-recommendations-tab').classList.add('active');

        this.loadRecommendationsDashboard();
    }

    /**
     * Create AI recommendations tab content
     */
    createAIRecommendationsTab() {
        const tabContent = document.createElement('div');
        tabContent.id = 'ai-recommendations-tab';
        tabContent.className = 'tab-content';
        tabContent.innerHTML = `
            <div class="ai-recommendations-dashboard">
                <div class="dashboard-header">
                    <h2>🧠 AI-Powered Meal Recommendations</h2>
                    <div class="dashboard-controls">
                        <button class="btn btn-secondary ai-preference-settings-btn">⚙️ Preferences</button>
                        <button class="btn btn-primary generate-ai-recommendations-btn">🔄 Generate New</button>
                    </div>
                </div>

                <div class="recommendation-context-panel">
                    <h3>📊 Current Context</h3>
                    <div class="context-grid">
                        <div class="context-item">
                            <label>Meal Type:</label>
                            <select id="ai-meal-type">
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner" selected>Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                        <div class="context-item">
                            <label>Time Available:</label>
                            <select id="ai-time-available">
                                <option value="15">15 minutes</option>
                                <option value="30" selected>30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2+ hours</option>
                            </select>
                        </div>
                        <div class="context-item">
                            <label>Group Size:</label>
                            <input type="number" id="ai-group-size" value="1" min="1" max="10">
                        </div>
                        <div class="context-item">
                            <label>Available Ingredients:</label>
                            <input type="text" id="ai-available-ingredients" placeholder="e.g., chicken, tomatoes, rice">
                        </div>
                    </div>
                </div>

                <div class="ai-insights-panel">
                    <h3>🎯 AI Insights</h3>
                    <div class="insights-content" id="ai-insights-content">
                        <div class="insight-placeholder">
                            Generate recommendations to see AI insights about your preferences and patterns.
                        </div>
                    </div>
                </div>

                <div class="recommendations-panel">
                    <h3>✨ AI Recommendations</h3>
                    <div class="recommendations-grid" id="ai-recommendations-grid">
                        <div class="recommendations-placeholder">
                            Click "Generate New" to get personalized AI recommendations.
                        </div>
                    </div>
                </div>

                <div class="learning-panel">
                    <h3>📈 AI Learning Progress</h3>
                    <div class="learning-stats" id="ai-learning-stats">
                        <!-- Learning statistics will be populated here -->
                    </div>
                </div>
            </div>
        `;

        return tabContent;
    }

    /**
     * Show AI recommendations modal
     */
    showAIRecommendationsModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-recommendations-modal';
        modal.innerHTML = `
            <div class="modal-content ai-modal-content">
                <div class="modal-header">
                    <h2>🧠 Smart AI Recommendations</h2>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="ai-modal-body">
                    <div class="quick-context">
                        <h4>📝 Quick Setup</h4>
                        <div class="quick-context-grid">
                            <div class="context-group">
                                <label>I want:</label>
                                <select id="modal-meal-type">
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner" selected>Dinner</option>
                                </select>
                            </div>
                            <div class="context-group">
                                <label>Time I have:</label>
                                <select id="modal-time-available">
                                    <option value="15">15 min (Quick)</option>
                                    <option value="30" selected>30 min (Normal)</option>
                                    <option value="60">1 hour (Relaxed)</option>
                                    <option value="90">1.5+ hours (Weekend)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="ai-recommendations-results" id="modal-ai-results">
                        <div class="loading-placeholder">
                            <p>🤖 AI is analyzing your preferences...</p>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.ai-recommendations-modal').remove()">
                        Close
                    </button>
                    <button class="btn btn-primary generate-modal-recommendations-btn">
                        🎯 Get AI Recommendations
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal-specific events
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('.generate-modal-recommendations-btn').onclick = () => {
            this.generateModalRecommendations(modal);
        };

        // Auto-generate recommendations
        setTimeout(() => this.generateModalRecommendations(modal), 500);
    }

    /**
     * Generate AI recommendations
     */
    async generateAIRecommendations() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            // Get context from UI
            const context = this.getRecommendationContext();

            // Import and use enhanced AI engine
            const { enhancedAIRecommendationEngine } = await import('./enhancedAIRecommendationEngine.js');
            
            const result = await enhancedAIRecommendationEngine.generateEnhancedRecommendations(context);
            
            this.currentRecommendations = result;
            this.displayRecommendations(result);
            this.displayAIInsights(result);

        } catch (error) {
            console.error('Error generating AI recommendations:', error);
            this.showErrorState(error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Generate recommendations for modal
     */
    async generateModalRecommendations(modal) {
        try {
            const resultsContainer = modal.querySelector('#modal-ai-results');
            resultsContainer.innerHTML = '<div class="loading-spinner">🤖 Generating recommendations...</div>';

            const context = {
                mealType: modal.querySelector('#modal-meal-type').value,
                timeAvailable: parseInt(modal.querySelector('#modal-time-available').value),
                groupSize: 1
            };

            const { enhancedAIRecommendationEngine } = await import('./enhancedAIRecommendationEngine.js');
            const result = await enhancedAIRecommendationEngine.generateEnhancedRecommendations(context);

            this.displayModalRecommendations(modal, result);

        } catch (error) {
            console.error('Error generating modal recommendations:', error);
            const resultsContainer = modal.querySelector('#modal-ai-results');
            resultsContainer.innerHTML = '<div class="error-message">Unable to generate recommendations. Please try again.</div>';
        }
    }

    /**
     * Display recommendations in modal
     */
    displayModalRecommendations(modal, result) {
        const resultsContainer = modal.querySelector('#modal-ai-results');
        
        if (!result.recommendations || result.recommendations.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No recommendations found. Try adjusting your preferences.</div>';
            return;
        }

        const top3 = result.recommendations.slice(0, 3);
        
        resultsContainer.innerHTML = `
            <div class="ai-explanations">
                <h4>🎯 Why These Recommendations?</h4>
                <div class="explanations-grid">
                    ${result.explanations.map(exp => `
                        <div class="explanation-item">
                            <strong>${exp.title}:</strong> ${exp.description}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="top-recommendations">
                <h4>✨ Top AI Recommendations</h4>
                <div class="recommendations-list">
                    ${top3.map((rec, index) => `
                        <div class="recommendation-card">
                            <div class="recommendation-header">
                                <h5>#${index + 1} ${rec.name}</h5>
                                <div class="ai-score">
                                    <span class="score-label">AI Score:</span>
                                    <span class="score-value">${(rec.aiScore * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div class="recommendation-reasoning">
                                ${rec.reasoning.map(reason => `<span class="reason-tag">• ${reason}</span>`).join('')}
                            </div>
                            <div class="recommendation-actions">
                                <button class="btn btn-sm btn-success apply-ai-recommendation-btn" data-food-id="${rec.id || index}">
                                    ✅ Use This
                                </button>
                                <button class="btn btn-sm btn-outline like-ai-recommendation-btn" data-food-id="${rec.id || index}">
                                    👍 Like
                                </button>
                                <button class="btn btn-sm btn-outline dislike-ai-recommendation-btn" data-food-id="${rec.id || index}">
                                    👎 Dislike
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${result.alternativeSuggestions.length > 0 ? `
                <div class="alternative-suggestions">
                    <h4>🔄 Alternative Options</h4>
                    <div class="alternatives-grid">
                        ${result.alternativeSuggestions.map(alt => `
                            <div class="alternative-item">
                                <strong>${alt.title}:</strong> ${alt.description}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    /**
     * Get recommendation context from UI
     */
    getRecommendationContext() {
        return {
            mealType: document.getElementById('ai-meal-type')?.value || 'dinner',
            timeAvailable: parseInt(document.getElementById('ai-time-available')?.value || '30'),
            groupSize: parseInt(document.getElementById('ai-group-size')?.value || '1'),
            availableIngredients: this.parseAvailableIngredients(),
            dayType: this.getCurrentDayType(),
            currentSeason: this.getCurrentSeason()
        };
    }

    /**
     * Parse available ingredients from input
     */
    parseAvailableIngredients() {
        const input = document.getElementById('ai-available-ingredients')?.value || '';
        return input.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    }

    /**
     * Display recommendations in dashboard
     */
    displayRecommendations(result) {
        const grid = document.getElementById('ai-recommendations-grid');
        if (!grid) return;

        if (!result.recommendations || result.recommendations.length === 0) {
            grid.innerHTML = '<div class="no-recommendations">No recommendations found. Try adjusting your context.</div>';
            return;
        }

        grid.innerHTML = result.recommendations.map((rec, index) => `
            <div class="recommendation-card detailed">
                <div class="card-header">
                    <h4>${rec.name}</h4>
                    <div class="ai-confidence">
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${rec.aiScore * 100}%"></div>
                        </div>
                        <span class="confidence-text">${(rec.aiScore * 100).toFixed(0)}% match</span>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="recommendation-details">
                        <div class="ingredients-preview">
                            <strong>Ingredients:</strong> ${(rec.ingredients || []).slice(0, 3).join(', ')}
                            ${(rec.ingredients || []).length > 3 ? '...' : ''}
                        </div>
                        
                        <div class="ai-reasoning">
                            <strong>Why this recommendation:</strong>
                            <ul>
                                ${rec.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                            </ul>
                        </div>
                        
                        ${rec.scoringFactors ? `
                            <div class="scoring-breakdown">
                                <strong>AI Analysis:</strong>
                                <div class="factors-grid">
                                    ${rec.scoringFactors.map(factor => `
                                        <div class="factor-item">
                                            <span class="factor-name">${factor.factor}:</span>
                                            <span class="factor-score ${this.getScoreClass(factor.score)}">${(factor.score * 100).toFixed(0)}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-primary apply-ai-recommendation-btn" data-food-id="${rec.id || index}">
                        🍽️ Add to Plan
                    </button>
                    <button class="btn btn-success like-ai-recommendation-btn" data-food-id="${rec.id || index}">
                        👍 Like
                    </button>
                    <button class="btn btn-danger dislike-ai-recommendation-btn" data-food-id="${rec.id || index}">
                        👎 Dislike
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Display AI insights
     */
    displayAIInsights(result) {
        const insightsContainer = document.getElementById('ai-insights-content');
        if (!insightsContainer) return;

        insightsContainer.innerHTML = `
            <div class="insights-grid">
                <div class="insight-card">
                    <h4>🎯 Current Focus</h4>
                    <div class="insight-content">
                        ${result.explanations.map(exp => `
                            <div class="insight-item">
                                <strong>${exp.title}:</strong>
                                <p>${exp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="insight-card">
                    <h4>📊 Recommendation Quality</h4>
                    <div class="quality-metrics">
                        <div class="metric">
                            <span class="metric-label">Average Confidence:</span>
                            <span class="metric-value">${this.calculateAverageConfidence(result.recommendations)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Top Match:</span>
                            <span class="metric-value">${(result.recommendations[0]?.aiScore * 100 || 0).toFixed(0)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Recommendations:</span>
                            <span class="metric-value">${result.recommendations.length}</span>
                        </div>
                    </div>
                </div>
                
                ${result.alternativeSuggestions.length > 0 ? `
                    <div class="insight-card">
                        <h4>🔄 Alternative Options</h4>
                        <div class="alternatives-list">
                            ${result.alternativeSuggestions.map(alt => `
                                <div class="alternative-suggestion">
                                    <strong>${alt.title}</strong>
                                    <p>${alt.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Handle recommendation feedback
     */
    async handleRecommendationFeedback(foodId, feedback) {
        try {
            const recommendation = this.currentRecommendations?.recommendations[foodId];
            if (!recommendation) return;

            // Import AI engine and provide feedback
            const { enhancedAIRecommendationEngine } = await import('./enhancedAIRecommendationEngine.js');
            await enhancedAIRecommendationEngine.learnFromUserFeedback(
                recommendation, 
                feedback, 
                this.recommendationContext
            );

            // Show feedback confirmation
            this.showFeedbackConfirmation(feedback);

            // Update learning stats
            this.updateLearningStats();

        } catch (error) {
            console.error('Error handling recommendation feedback:', error);
        }
    }

    /**
     * Apply AI recommendation to meal plan
     */
    async applyAIRecommendation(foodId) {
        try {
            const recommendation = this.currentRecommendations?.recommendations[foodId];
            if (!recommendation) return;

            // Add to current meal plan (integrate with existing meal generation)
            if (window.addFoodToCurrentPlan) {
                window.addFoodToCurrentPlan(recommendation);
            } else if (window.foodsArr) {
                // Add to foods array if not already there
                const exists = window.foodsArr.find(f => f.name === recommendation.name);
                if (!exists) {
                    window.foodsArr.push(recommendation);
                }
            }

            // Show success message
            this.showSuccessMessage(`Added "${recommendation.name}" to your meal plan!`);

            // Learn from this application
            await this.handleRecommendationFeedback(foodId, 'applied');

        } catch (error) {
            console.error('Error applying AI recommendation:', error);
            this.showErrorMessage('Failed to apply recommendation');
        }
    }

    /**
     * Load recommendations dashboard
     */
    loadRecommendationsDashboard() {
        this.updateLearningStats();
        this.loadContextDefaults();
    }

    /**
     * Update learning statistics display
     */
    async updateLearningStats() {
        const statsContainer = document.getElementById('ai-learning-stats');
        if (!statsContainer) return;

        try {
            const { enhancedAIRecommendationEngine } = await import('./enhancedAIRecommendationEngine.js');
            
            const skillProfile = enhancedAIRecommendationEngine.userSkillProfile;
            const cuisineWeights = enhancedAIRecommendationEngine.cuisineWeights;

            // Get top cuisines
            const topCuisines = Array.from(cuisineWeights.entries())
                .sort((a, b) => b[1].preference - a[1].preference)
                .slice(0, 3);

            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h5>👨‍🍳 Cooking Level</h5>
                        <div class="skill-info">
                            <div class="skill-level">${skillProfile.currentLevel}</div>
                            <div class="skill-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(skillProfile.experiencePoints % 100)}%"></div>
                                </div>
                                <span class="exp-text">${skillProfile.experiencePoints} XP</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h5>📊 Success Rate</h5>
                        <div class="success-rate">
                            ${this.calculateSuccessRate(skillProfile)}%
                        </div>
                        <div class="recipe-count">
                            ${skillProfile.successfulRecipes} successful recipes
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h5>🍽️ Preferred Cuisines</h5>
                        <div class="cuisine-preferences">
                            ${topCuisines.map(([cuisine, data]) => `
                                <div class="cuisine-item">
                                    <span class="cuisine-name">${cuisine}</span>
                                    <span class="cuisine-score">${(data.preference * 100).toFixed(0)}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error updating learning stats:', error);
            statsContainer.innerHTML = '<div class="stats-error">Unable to load learning statistics</div>';
        }
    }

    /**
     * Utility methods
     */
    getScoreClass(score) {
        if (score >= 0.8) return 'score-excellent';
        if (score >= 0.6) return 'score-good';
        if (score >= 0.4) return 'score-fair';
        return 'score-poor';
    }

    calculateAverageConfidence(recommendations) {
        if (!recommendations || recommendations.length === 0) return 0;
        const total = recommendations.reduce((sum, rec) => sum + rec.aiScore, 0);
        return (total / recommendations.length * 100).toFixed(0);
    }

    calculateSuccessRate(skillProfile) {
        const total = skillProfile.successfulRecipes + skillProfile.failedRecipes;
        if (total === 0) return 0;
        return ((skillProfile.successfulRecipes / total) * 100).toFixed(0);
    }

    getCurrentDayType() {
        const day = new Date().getDay();
        return (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Fall';
        return 'Winter';
    }

    loadContextDefaults() {
        // Set intelligent defaults based on current time and day
        const now = new Date();
        const hour = now.getHours();
        
        // Set meal type based on time
        const mealTypeSelect = document.getElementById('ai-meal-type');
        if (mealTypeSelect) {
            if (hour < 10) mealTypeSelect.value = 'breakfast';
            else if (hour < 15) mealTypeSelect.value = 'lunch';
            else mealTypeSelect.value = 'dinner';
        }

        // Set time based on day type
        const timeSelect = document.getElementById('ai-time-available');
        if (timeSelect) {
            const isWeekend = this.getCurrentDayType() === 'weekend';
            timeSelect.value = isWeekend ? '60' : '30';
        }
    }

    loadUserInterface() {
        // Load any saved preferences or context
        // This could be expanded to restore user's last settings
    }

    showLoadingState() {
        const grid = document.getElementById('ai-recommendations-grid');
        if (grid) {
            grid.innerHTML = '<div class="loading-recommendations">🤖 Generating AI recommendations...</div>';
        }
    }

    showErrorState(error) {
        const grid = document.getElementById('ai-recommendations-grid');
        if (grid) {
            grid.innerHTML = '<div class="error-recommendations">Unable to generate recommendations. Please try again.</div>';
        }
    }

    showFeedbackConfirmation(feedback) {
        const message = feedback === 'like' ? 'Thanks! The AI will learn from your preference.' : 
                       feedback === 'dislike' ? 'Noted! The AI will adjust future recommendations.' :
                       'Applied! The AI learned from this choice.';
        
        this.showSuccessMessage(message);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => messageEl.remove(), 3000);
    }

    /**
     * Show AI preferences modal
     */
    showAIPreferencesModal() {
        // This would open a detailed preferences modal
        // Implementation would include cuisine preferences, dietary restrictions,
        // skill level settings, time preferences, etc.
        console.log('AI Preferences modal - to be implemented');
    }
}

// Export singleton instance
export const enhancedAIRecommendationUI = new EnhancedAIRecommendationUI();
