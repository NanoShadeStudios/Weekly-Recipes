/**
 * Enhanced Nutrition Goals UI Manager
 * Provides comprehensive UI for nutrition goal setting, tracking, and analytics
 */

export class EnhancedNutritionUI {
    constructor(nutritionTracker) {
        this.nutritionTracker = nutritionTracker;
        this.currentView = 'overview';
        this.charts = {};
        this.animationCallbacks = [];
    }

    /**
     * Initialize the enhanced nutrition UI
     */
    async initialize() {
        console.log('🎨 Initializing Enhanced Nutrition UI...');
        
        await this.setupNutritionTab();
        this.setupEventListeners();
        this.createGoalSetupModal();
        this.createProgressModal();
        this.createInsightsModal();
        
        console.log('✅ Enhanced Nutrition UI initialized');
    }

    /**
     * Setup the enhanced nutrition tab content
     */
    async setupNutritionTab() {
        const nutritionTab = document.getElementById('nutrition');
        if (!nutritionTab) return;

        // Replace existing content with enhanced version
        nutritionTab.innerHTML = `
            <section class="enhanced-nutrition-section" aria-labelledby="nutrition-heading">
                <div class="nutrition-header">
                    <h2 id="nutrition-heading">📊 Enhanced Nutrition Tracking</h2>
                    <p>Personalized nutrition goals with comprehensive tracking and insights</p>
                </div>

                <!-- Quick Stats Dashboard -->
                <div class="nutrition-quick-stats">
                    <div class="stat-card calories-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <h3>Today's Calories</h3>
                            <div class="stat-value" id="todayCalories">0</div>
                            <div class="stat-target">/ <span id="calorieTarget">2000</span></div>
                            <div class="stat-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="calorieProgress" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card protein-card">
                        <div class="stat-icon">💪</div>
                        <div class="stat-content">
                            <h3>Protein</h3>
                            <div class="stat-value" id="todayProtein">0g</div>
                            <div class="stat-target">/ <span id="proteinTarget">50g</span></div>
                            <div class="stat-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill protein-fill" id="proteinProgress" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card fiber-card">
                        <div class="stat-icon">🌾</div>
                        <div class="stat-content">
                            <h3>Fiber</h3>
                            <div class="stat-value" id="todayFiber">0g</div>
                            <div class="stat-target">/ <span id="fiberTarget">25g</span></div>
                            <div class="stat-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill fiber-fill" id="fiberProgress" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card score-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <h3>Nutrition Score</h3>
                            <div class="stat-value score-value" id="nutritionScore">85</div>
                            <div class="stat-target">/ 100</div>
                            <div class="score-ring">
                                <div class="score-circle" id="scoreCircle"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="nutrition-nav-tabs">
                    <button class="nutrition-tab-btn active" data-view="overview">📈 Overview</button>
                    <button class="nutrition-tab-btn" data-view="goals">🎯 Goals</button>
                    <button class="nutrition-tab-btn" data-view="progress">📊 Progress</button>
                    <button class="nutrition-tab-btn" data-view="insights">💡 Insights</button>
                    <button class="nutrition-tab-btn" data-view="micronutrients">🧪 Micronutrients</button>
                </div>

                <!-- Overview Tab Content -->
                <div class="nutrition-tab-content active" id="overview-content">
                    <div class="overview-grid">
                        <!-- Weekly Progress Chart -->
                        <div class="chart-container">
                            <h3>📈 Weekly Progress</h3>
                            <div class="chart-wrapper">
                                <canvas id="weeklyProgressChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-legend" id="weeklyLegend"></div>
                        </div>

                        <!-- Macronutrient Breakdown -->
                        <div class="macro-breakdown">
                            <h3>🥗 Today's Macros</h3>
                            <div class="macro-circle-chart">
                                <div class="macro-circle" id="macroChart">
                                    <div class="macro-center">
                                        <span class="macro-calories" id="macroCenterCalories">1,850</span>
                                        <span class="macro-label">calories</span>
                                    </div>
                                </div>
                            </div>
                            <div class="macro-legend">
                                <div class="macro-item">
                                    <span class="macro-color carbs-color"></span>
                                    <span>Carbs: <span id="macroCarbs">45%</span></span>
                                </div>
                                <div class="macro-item">
                                    <span class="macro-color protein-color"></span>
                                    <span>Protein: <span id="macroProtein">30%</span></span>
                                </div>
                                <div class="macro-item">
                                    <span class="macro-color fat-color"></span>
                                    <span>Fat: <span id="macroFat">25%</span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Achievements -->
                        <div class="achievements-preview">
                            <h3>🏆 Recent Achievements</h3>
                            <div class="achievement-list" id="recentAchievements">
                                <div class="achievement-item">
                                    <span class="achievement-icon">💪</span>
                                    <div class="achievement-content">
                                        <h4>Protein Power Week</h4>
                                        <p>Met protein goals for 7 days!</p>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-secondary view-all-achievements">View All Achievements</button>
                        </div>

                        <!-- Quick Actions -->
                        <div class="quick-actions">
                            <h3>⚡ Quick Actions</h3>
                            <div class="action-buttons">
                                <button class="action-btn" id="setGoalsBtn">
                                    <span class="action-icon">🎯</span>
                                    <span>Set New Goals</span>
                                </button>
                                <button class="action-btn" id="viewProgressBtn">
                                    <span class="action-icon">📊</span>
                                    <span>View Progress</span>
                                </button>
                                <button class="action-btn" id="getInsightsBtn">
                                    <span class="action-icon">💡</span>
                                    <span>Get Insights</span>
                                </button>
                                <button class="action-btn" id="exportDataBtn">
                                    <span class="action-icon">📤</span>
                                    <span>Export Data</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Goals Tab Content -->
                <div class="nutrition-tab-content" id="goals-content">
                    <div class="goals-management">
                        <div class="goals-header">
                            <h3>🎯 Nutrition Goals Management</h3>
                            <button class="btn btn-primary" id="createNewGoalsBtn">Create New Goals</button>
                        </div>

                        <!-- Current Goals Display -->
                        <div class="current-goals" id="currentGoalsDisplay">
                            <h4>Current Goals</h4>
                            <div class="goals-grid" id="goalsGrid">
                                <!-- Goals will be populated here -->
                            </div>
                        </div>

                        <!-- Goal Templates -->
                        <div class="goal-templates">
                            <h4>🎨 Goal Templates</h4>
                            <div class="template-grid">
                                <div class="template-card" data-template="weight_loss">
                                    <div class="template-icon">⚖️</div>
                                    <h5>Weight Loss</h5>
                                    <p>Sustainable weight loss with balanced nutrition</p>
                                    <div class="template-preview">
                                        <span>1,500 cal • 90g protein • 35g fiber</span>
                                    </div>
                                </div>

                                <div class="template-card" data-template="muscle_gain">
                                    <div class="template-icon">💪</div>
                                    <h5>Muscle Building</h5>
                                    <p>High protein intake for lean muscle development</p>
                                    <div class="template-preview">
                                        <span>2,700 cal • 140g protein • 350g carbs</span>
                                    </div>
                                </div>

                                <div class="template-card" data-template="heart_healthy">
                                    <div class="template-icon">❤️</div>
                                    <h5>Heart Health</h5>
                                    <p>Cardiovascular-focused nutrition plan</p>
                                    <div class="template-preview">
                                        <span>2,000 cal • Low sodium • High fiber</span>
                                    </div>
                                </div>

                                <div class="template-card" data-template="diabetes_management">
                                    <div class="template-icon">🩸</div>
                                    <h5>Diabetes Management</h5>
                                    <p>Blood sugar-conscious nutrition plan</p>
                                    <div class="template-preview">
                                        <span>1,800 cal • Low sugar • High fiber</span>
                                    </div>
                                </div>

                                <div class="template-card" data-template="athletic_performance">
                                    <div class="template-icon">🏃‍♀️</div>
                                    <h5>Athletic Performance</h5>
                                    <p>Optimized nutrition for active individuals</p>
                                    <div class="template-preview">
                                        <span>3,200 cal • 160g protein • High carbs</span>
                                    </div>
                                </div>

                                <div class="template-card" data-template="plant_based">
                                    <div class="template-icon">🌱</div>
                                    <h5>Plant-Based</h5>
                                    <p>Balanced plant-based nutrition plan</p>
                                    <div class="template-preview">
                                        <span>2,000 cal • Plant proteins • High fiber</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Progress Tab Content -->
                <div class="nutrition-tab-content" id="progress-content">
                    <div class="progress-analysis">
                        <div class="progress-header">
                            <h3>📊 Progress Analysis</h3>
                            <div class="time-range-selector">
                                <button class="time-btn active" data-range="7">7 Days</button>
                                <button class="time-btn" data-range="30">30 Days</button>
                                <button class="time-btn" data-range="90">90 Days</button>
                            </div>
                        </div>

                        <!-- Progress Charts -->
                        <div class="progress-charts">
                            <div class="chart-container">
                                <h4>📈 Nutrient Trends</h4>
                                <canvas id="nutrientTrendsChart" width="600" height="300"></canvas>
                            </div>

                            <div class="chart-container">
                                <h4>🎯 Goal Achievement Rate</h4>
                                <canvas id="goalAchievementChart" width="600" height="300"></canvas>
                            </div>
                        </div>

                        <!-- Streaks and Milestones -->
                        <div class="streaks-section">
                            <h4>🔥 Current Streaks</h4>
                            <div class="streaks-grid" id="streaksGrid">
                                <!-- Streaks will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Insights Tab Content -->
                <div class="nutrition-tab-content" id="insights-content">
                    <div class="insights-dashboard">
                        <h3>💡 Personalized Insights</h3>
                        
                        <!-- AI Recommendations -->
                        <div class="recommendations-section">
                            <h4>🤖 AI Recommendations</h4>
                            <div class="recommendation-cards" id="recommendationCards">
                                <!-- Recommendations will be populated here -->
                            </div>
                        </div>

                        <!-- Nutrition Alerts -->
                        <div class="alerts-section">
                            <h4>⚠️ Nutrition Alerts</h4>
                            <div class="alert-list" id="nutritionAlerts">
                                <!-- Alerts will be populated here -->
                            </div>
                        </div>

                        <!-- Weekly Summary -->
                        <div class="weekly-summary">
                            <h4>📋 Weekly Summary</h4>
                            <div class="summary-content" id="weeklySummary">
                                <!-- Summary will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Micronutrients Tab Content -->
                <div class="nutrition-tab-content" id="micronutrients-content">
                    <div class="micronutrients-dashboard">
                        <h3>🧪 Micronutrient Tracking</h3>
                        
                        <!-- Vitamin Tracking -->
                        <div class="vitamins-section">
                            <h4>🍊 Vitamins</h4>
                            <div class="vitamin-grid" id="vitaminGrid">
                                <!-- Vitamin progress bars will be populated here -->
                            </div>
                        </div>

                        <!-- Mineral Tracking -->
                        <div class="minerals-section">
                            <h4>⚗️ Minerals</h4>
                            <div class="mineral-grid" id="mineralGrid">
                                <!-- Mineral progress bars will be populated here -->
                            </div>
                        </div>

                        <!-- Micronutrient Recommendations -->
                        <div class="micro-recommendations">
                            <h4>💊 Micronutrient Recommendations</h4>
                            <div class="micro-rec-list" id="microRecommendations">
                                <!-- Recommendations will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Setup event listeners for the nutrition UI
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nutrition-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Quick actions
        const setGoalsBtn = document.getElementById('setGoalsBtn');
        if (setGoalsBtn) {
            setGoalsBtn.addEventListener('click', () => this.showGoalSetupModal());
        }

        const viewProgressBtn = document.getElementById('viewProgressBtn');
        if (viewProgressBtn) {
            viewProgressBtn.addEventListener('click', () => this.showProgressModal());
        }

        const getInsightsBtn = document.getElementById('getInsightsBtn');
        if (getInsightsBtn) {
            getInsightsBtn.addEventListener('click', () => this.showInsightsModal());
        }

        // Goal template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.getAttribute('data-template');
                this.selectGoalTemplate(template);
            });
        });

        // Time range selector
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const range = parseInt(e.target.getAttribute('data-range'));
                this.updateProgressTimeRange(range);
            });
        });
    }

    /**
     * Switch between different nutrition views
     */
    switchView(view) {
        // Update tab buttons
        document.querySelectorAll('.nutrition-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.nutrition-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}-content`).classList.add('active');

        this.currentView = view;
        this.loadViewData(view);
    }

    /**
     * Load data for the current view
     */
    async loadViewData(view) {
        switch (view) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'goals':
                await this.loadGoalsData();
                break;
            case 'progress':
                await this.loadProgressData();
                break;
            case 'insights':
                await this.loadInsightsData();
                break;
            case 'micronutrients':
                await this.loadMicronutrientsData();
                break;
        }
    }

    /**
     * Load overview data
     */
    async loadOverviewData() {
        console.log('📊 Loading overview data...');
        
        // Update quick stats
        await this.updateQuickStats();
        
        // Update charts
        this.createWeeklyProgressChart();
        this.createMacroChart();
        
        // Update achievements
        this.updateAchievements();
    }

    /**
     * Update quick stats display
     */
    async updateQuickStats() {
        // Get today's nutrition data
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.nutritionTracker.nutritionHistory.find(record => record.date === today);
        
        if (todayData) {
            // Update calories
            document.getElementById('todayCalories').textContent = Math.round(todayData.nutrition.calories || 0);
            document.getElementById('todayProtein').textContent = `${Math.round(todayData.nutrition.protein || 0)}g`;
            document.getElementById('todayFiber').textContent = `${Math.round(todayData.nutrition.fiber || 0)}g`;
            
            // Update progress bars
            if (todayData.progress) {
                this.updateProgressBar('calorieProgress', todayData.progress.calories?.percentage || 0);
                this.updateProgressBar('proteinProgress', todayData.progress.protein?.percentage || 0);
                this.updateProgressBar('fiberProgress', todayData.progress.fiber?.percentage || 0);
            }
        }

        // Update nutrition score
        const score = this.calculateNutritionScore();
        document.getElementById('nutritionScore').textContent = score;
        this.updateScoreRing(score);
    }

    /**
     * Update progress bar
     */
    updateProgressBar(elementId, percentage) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            progressBar.style.width = `${Math.min(percentage, 100)}%`;
            
            // Add color coding
            progressBar.className = 'progress-fill';
            if (percentage >= 90) progressBar.classList.add('excellent');
            else if (percentage >= 70) progressBar.classList.add('good');
            else if (percentage >= 50) progressBar.classList.add('fair');
            else progressBar.classList.add('low');
        }
    }

    /**
     * Calculate overall nutrition score
     */
    calculateNutritionScore() {
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.nutritionTracker.nutritionHistory.find(record => record.date === today);
        
        if (!todayData || !todayData.progress) return 75; // Default score
        
        const progress = todayData.progress;
        const scores = [];
        
        Object.keys(progress).forEach(nutrient => {
            if (nutrient === 'micronutrients') return;
            
            const nutrientProgress = progress[nutrient];
            if (nutrientProgress.status === 'excellent') scores.push(100);
            else if (nutrientProgress.status === 'good') scores.push(85);
            else if (nutrientProgress.status === 'optimal') scores.push(90);
            else if (nutrientProgress.percentage >= 50) scores.push(70);
            else scores.push(40);
        });
        
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 75;
    }

    /**
     * Update score ring visualization
     */
    updateScoreRing(score) {
        const scoreCircle = document.getElementById('scoreCircle');
        if (scoreCircle) {
            const circumference = 2 * Math.PI * 35; // radius of 35
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (score / 100) * circumference;
            
            scoreCircle.style.strokeDasharray = strokeDasharray;
            scoreCircle.style.strokeDashoffset = strokeDashoffset;
        }
    }

    /**
     * Create weekly progress chart
     */
    createWeeklyProgressChart() {
        const canvas = document.getElementById('weeklyProgressChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const weekData = this.nutritionTracker.nutritionHistory.slice(0, 7);
        
        // Simple line chart implementation
        this.drawLineChart(ctx, weekData, canvas.width, canvas.height);
    }

    /**
     * Create macro breakdown chart
     */
    createMacroChart() {
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.nutritionTracker.nutritionHistory.find(record => record.date === today);
        
        if (!todayData) return;
        
        const nutrition = todayData.nutrition;
        const totalCalories = nutrition.calories || 1;
        
        const carbsPercent = Math.round((nutrition.carbs * 4 / totalCalories) * 100);
        const proteinPercent = Math.round((nutrition.protein * 4 / totalCalories) * 100);
        const fatPercent = Math.round((nutrition.fat * 9 / totalCalories) * 100);
        
        document.getElementById('macroCarbs').textContent = `${carbsPercent}%`;
        document.getElementById('macroProtein').textContent = `${proteinPercent}%`;
        document.getElementById('macroFat').textContent = `${fatPercent}%`;
        
        // Update circular chart (simplified implementation)
        this.updateMacroCircle(carbsPercent, proteinPercent, fatPercent);
    }

    /**
     * Update macro circle chart
     */
    updateMacroCircle(carbs, protein, fat) {
        const macroChart = document.getElementById('macroChart');
        if (!macroChart) return;
        
        // Create CSS conic gradient
        const gradient = `conic-gradient(
            #3b82f6 0deg ${carbs * 3.6}deg,
            #10b981 ${carbs * 3.6}deg ${(carbs + protein) * 3.6}deg,
            #f59e0b ${(carbs + protein) * 3.6}deg 360deg
        )`;
        
        macroChart.style.background = gradient;
    }

    /**
     * Simple line chart drawing function
     */
    drawLineChart(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        // Chart margins
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 6; i++) {
            const x = margin.left + (i * chartWidth / 6);
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, height - margin.bottom);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = margin.top + (i * chartHeight / 4);
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();
        }
        
        // Draw calorie line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((day, index) => {
            const x = margin.left + (index * chartWidth / (data.length - 1));
            const calories = day.nutrition.calories || 0;
            const y = height - margin.bottom - (calories / 3000) * chartHeight; // Scale to 3000 cal max
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    /**
     * Show goal setup modal
     */
    showGoalSetupModal() {
        // Implementation for goal setup modal
        console.log('🎯 Opening goal setup modal...');
        this.switchView('goals');
    }

    /**
     * Show progress modal
     */
    showProgressModal() {
        console.log('📊 Opening progress modal...');
        this.switchView('progress');
    }

    /**
     * Show insights modal
     */
    showInsightsModal() {
        console.log('💡 Opening insights modal...');
        this.switchView('insights');
    }

    /**
     * Select a goal template
     */
    async selectGoalTemplate(template) {
        console.log(`🎨 Selecting goal template: ${template}`);
        
        // Highlight selected template
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-template="${template}"]`).classList.add('selected');
        
        // Set goals using the template
        try {
            await this.nutritionTracker.setNutritionGoals(template);
            this.showToast('Goals updated successfully! 🎯', 'success');
            await this.loadGoalsData();
        } catch (error) {
            console.error('Error setting goals:', error);
            this.showToast('Failed to set goals. Please try again.', 'error');
        }
    }

    /**
     * Load goals data
     */
    async loadGoalsData() {
        const goalsGrid = document.getElementById('goalsGrid');
        if (!goalsGrid || !this.nutritionTracker.nutritionGoals.targets) return;
        
        goalsGrid.innerHTML = Object.keys(this.nutritionTracker.nutritionGoals.targets).map(nutrient => {
            const target = this.nutritionTracker.nutritionGoals.targets[nutrient];
            return `
                <div class="goal-item">
                    <h5>${this.getNutrientDisplayName(nutrient)}</h5>
                    <div class="goal-range">
                        <span class="goal-min">${target.min}</span>
                        <span class="goal-target">${target.target}</span>
                        <span class="goal-max">${target.max}</span>
                    </div>
                    <div class="goal-bar">
                        <div class="goal-range-bar">
                            <div class="goal-optimal" style="left: ${(target.min/target.max)*100}%; width: ${((target.target-target.min)/target.max)*100}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get display name for nutrient
     */
    getNutrientDisplayName(nutrient) {
        const names = {
            calories: 'Calories',
            protein: 'Protein (g)',
            carbs: 'Carbohydrates (g)',
            fat: 'Fat (g)',
            fiber: 'Fiber (g)',
            sodium: 'Sodium (mg)',
            sugar: 'Sugar (g)'
        };
        return names[nutrient] || nutrient;
    }

    /**
     * Load progress data
     */
    async loadProgressData() {
        console.log('📊 Loading progress data...');
        this.updateStreaksDisplay();
    }

    /**
     * Update streaks display
     */
    updateStreaksDisplay() {
        const streaksGrid = document.getElementById('streaksGrid');
        if (!streaksGrid) return;
        
        const streaks = this.nutritionTracker.progressData?.streaks || {};
        
        streaksGrid.innerHTML = Object.keys(streaks).map(nutrient => `
            <div class="streak-item">
                <div class="streak-icon">${this.getNutrientEmoji(nutrient)}</div>
                <div class="streak-content">
                    <h5>${this.getNutrientDisplayName(nutrient)}</h5>
                    <div class="streak-count">${streaks[nutrient]} days</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get emoji for nutrient
     */
    getNutrientEmoji(nutrient) {
        const emojis = {
            calories: '🔥',
            protein: '💪',
            carbs: '🍞',
            fat: '🥑',
            fiber: '🌾',
            sodium: '🧂',
            sugar: '🍯'
        };
        return emojis[nutrient] || '📊';
    }

    /**
     * Load insights data
     */
    async loadInsightsData() {
        console.log('💡 Loading insights data...');
        // Implementation for insights loading
    }

    /**
     * Load micronutrients data
     */
    async loadMicronutrientsData() {
        console.log('🧪 Loading micronutrients data...');
        // Implementation for micronutrients loading
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    /**
     * Create goal setup modal
     */
    createGoalSetupModal() {
        // Implementation for goal setup modal creation
    }

    /**
     * Create progress modal
     */
    createProgressModal() {
        // Implementation for progress modal creation
    }

    /**
     * Create insights modal
     */
    createInsightsModal() {
        // Implementation for insights modal creation
    }

    /**
     * Update achievements display
     */
    updateAchievements() {
        const achievementsList = document.getElementById('recentAchievements');
        if (!achievementsList) return;
        
        // Show recent achievements
        const achievements = this.nutritionTracker.achievements || [];
        
        if (achievements.length === 0) {
            achievementsList.innerHTML = `
                <div class="no-achievements">
                    <span class="no-achievements-icon">🎯</span>
                    <p>Keep tracking your nutrition to earn achievements!</p>
                </div>
            `;
        } else {
            achievementsList.innerHTML = achievements.slice(0, 3).map(achievement => `
                <div class="achievement-item">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <div class="achievement-content">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    /**
     * Update progress time range
     */
    updateProgressTimeRange(days) {
        // Update active button
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-range="${days}"]`).classList.add('active');
        
        // Reload progress data for the new time range
        this.loadProgressData();
    }
}

// Export the class
export default EnhancedNutritionUI;
