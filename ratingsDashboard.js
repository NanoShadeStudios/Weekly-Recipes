/**
 * Meal Rating Dashboard Controller
 * Manages the rating dashboard UI, statistics, and interactions
 * @fileoverview Dashboard for visualizing meal rating data and learning progress
 * @module RatingsDashboard
 */

/**
 * RatingsDashboard - Controller for the ratings dashboard interface
 * Features:
 * - Real-time statistics updates
 * - Rating distribution visualization
 * - Recent ratings display
 * - Preference insights
 * - Interactive demos and tutorials
 */
export class RatingsDashboard {
  constructor(learningSystem, ratingUI) {
    this.learningSystem = learningSystem;
    this.ratingUI = ratingUI;
    this.isInitialized = false;
    this.updateInterval = null;
    
    this.initializeDashboard();
  }

  /**
   * Initialize the dashboard
   */
  async initializeDashboard() {
    try {
      await this.setupEventListeners();
      await this.updateAllStats();
      this.startAutoUpdate();
      this.isInitialized = true;
      console.log('📊 Ratings Dashboard initialized');
    } catch (error) {
      console.error('Error initializing ratings dashboard:', error);
    }
  }

  /**
   * Setup event listeners for dashboard interactions
   */
  async setupEventListeners() {
    // Test AI Prediction button
    const testPredictionBtn = document.getElementById('testPredictionBtn');
    if (testPredictionBtn) {
      testPredictionBtn.addEventListener('click', () => this.testAIPrediction());
    }

    // Export ratings button
    const exportRatingsBtn = document.getElementById('exportRatingsBtn');
    if (exportRatingsBtn) {
      exportRatingsBtn.addEventListener('click', () => this.exportRatings());
    }

    // Reset ratings button
    const resetRatingsBtn = document.getElementById('resetRatingsBtn');
    if (resetRatingsBtn) {
      resetRatingsBtn.addEventListener('click', () => this.resetRatings());
    }

    // Listen for rating events to update dashboard
    document.addEventListener('mealRated', () => {
      this.updateAllStats();
    });

    // Listen for tab visibility to update when dashboard becomes visible
    document.addEventListener('tabChange', (event) => {
      if (event.detail?.tabId === 'ratings') {
        this.updateAllStats();
      }
    });
  }

  /**
   * Update all dashboard statistics
   */
  async updateAllStats() {
    try {
      await this.updateLearningStats();
      await this.updateRatingDistribution();
      await this.updateRecentRatings();
      await this.updatePreferenceInsights();
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  }

  /**
   * Update learning system statistics
   */
  async updateLearningStats() {
    try {
      const stats = this.learningSystem.learningStats;
      const ratingStats = this.ratingUI.getRatingStats();
      
      // Total ratings
      const totalRatingsElement = document.getElementById('totalRatingsCount');
      if (totalRatingsElement) {
        totalRatingsElement.textContent = ratingStats.totalRatings || 0;
        this.animateNumber(totalRatingsElement, ratingStats.totalRatings || 0);
      }

      // Learning accuracy
      const accuracyElement = document.getElementById('learningAccuracy');
      if (accuracyElement) {
        const accuracy = Math.round((stats.learningAccuracy || 0) * 100);
        accuracyElement.textContent = `${accuracy}%`;
        this.animateNumber(accuracyElement, accuracy, '%');
      }

      // Average rating
      const avgRatingElement = document.getElementById('averageRating');
      if (avgRatingElement) {
        const avgRating = ratingStats.averageRating || 0;
        avgRatingElement.textContent = avgRating.toFixed(1);
        this.animateNumber(avgRatingElement, avgRating, '', 1);
      }

      // Preference confidence (calculated from learning data)
      const confidenceElement = document.getElementById('preferenceConfidence');
      if (confidenceElement) {
        const confidence = this.calculateOverallConfidence();
        confidenceElement.textContent = `${confidence}%`;
        this.animateNumber(confidenceElement, confidence, '%');
      }

    } catch (error) {
      console.error('Error updating learning stats:', error);
    }
  }

  /**
   * Update rating distribution visualization
   */
  async updateRatingDistribution() {
    try {
      const ratingStats = this.ratingUI.getRatingStats();
      const distribution = ratingStats.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const total = ratingStats.totalRatings || 1; // Avoid division by zero

      // Update each rating bar
      for (let rating = 1; rating <= 5; rating++) {
        const count = distribution[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        // Update bar fill
        const barFill = document.getElementById(`rating-${rating}-bar`);
        if (barFill) {
          barFill.style.width = `${percentage}%`;
          this.animateBarFill(barFill, percentage);
        }

        // Update count
        const countElement = document.getElementById(`rating-${rating}-count`);
        if (countElement) {
          countElement.textContent = count;
        }
      }

    } catch (error) {
      console.error('Error updating rating distribution:', error);
    }
  }

  /**
   * Update recent ratings list
   */
  async updateRecentRatings() {
    try {
      const ratingStats = this.ratingUI.getRatingStats();
      const recentRatings = ratingStats.recentRatings || [];
      
      const recentRatingsList = document.getElementById('recentRatingsList');
      if (!recentRatingsList) return;

      if (recentRatings.length === 0) {
        recentRatingsList.innerHTML = `
          <p class="no-ratings-message">No ratings yet! Start rating meals to see your preferences here.</p>
        `;
        return;
      }

      const ratingsHTML = recentRatings.map(rating => {
        const timeAgo = this.formatTimeAgo(rating.timestamp);
        const ratingEmoji = this.getRatingEmoji(rating.rating);
        
        return `
          <div class="recent-rating-item">
            <div class="rating-meal-info">
              <span class="meal-name">${rating.mealName}</span>
              <span class="rating-time">${timeAgo}</span>
            </div>
            <div class="rating-value">
              <span class="rating-emoji">${ratingEmoji}</span>
              <span class="rating-stars">${'⭐'.repeat(rating.rating)}</span>
            </div>
          </div>
        `;
      }).join('');

      recentRatingsList.innerHTML = ratingsHTML;

    } catch (error) {
      console.error('Error updating recent ratings:', error);
    }
  }

  /**
   * Update preference insights
   */
  async updatePreferenceInsights() {
    try {
      const preferences = this.learningSystem.preferences;
      
      // Top cuisines
      const topCuisines = this.getTopPreferences(preferences.cuisineScores, 5);
      const topCuisinesElement = document.getElementById('topCuisines');
      if (topCuisinesElement) {
        this.updatePreferenceTags(topCuisinesElement, topCuisines, 'cuisine');
      }

      // Top ingredients
      const topIngredients = this.getTopPreferences(preferences.ingredientScores, 8);
      const topIngredientsElement = document.getElementById('topIngredients');
      if (topIngredientsElement) {
        this.updatePreferenceTags(topIngredientsElement, topIngredients, 'ingredient');
      }

      // Top cooking methods
      const topCookingMethods = this.getTopPreferences(preferences.cookingMethodScores, 4);
      const topCookingMethodsElement = document.getElementById('topCookingMethods');
      if (topCookingMethodsElement) {
        this.updatePreferenceTags(topCookingMethodsElement, topCookingMethods, 'cooking-method');
      }

    } catch (error) {
      console.error('Error updating preference insights:', error);
    }
  }

  /**
   * Get top preferences from a scores object
   * @param {Object} scores - Preference scores object
   * @param {number} limit - Maximum number of preferences to return
   * @returns {Array} Top preferences with scores
   */
  getTopPreferences(scores, limit = 5) {
    return Object.entries(scores || {})
      .map(([name, score]) => ({ name, score }))
      .filter(pref => pref.score > 0.1) // Only positive preferences
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Update preference tags display
   * @param {HTMLElement} container - Container element
   * @param {Array} preferences - Preferences array
   * @param {string} type - Preference type for styling
   */
  updatePreferenceTags(container, preferences, type) {
    if (preferences.length === 0) {
      container.innerHTML = `<span class="preference-tag neutral">Rate more meals to see patterns</span>`;
      return;
    }

    const tagsHTML = preferences.map(pref => {
      const intensity = Math.min(Math.max(pref.score, 0), 2);
      const opacity = 0.3 + (intensity / 2) * 0.7; // 0.3 to 1.0
      const confidence = this.learningSystem.preferences.learningConfidence[pref.name] || 0;
      
      return `
        <span class="preference-tag ${type}" 
              style="opacity: ${opacity}"
              title="Score: ${pref.score.toFixed(2)}, Confidence: ${(confidence * 100).toFixed(0)}%">
          ${this.formatPreferenceName(pref.name)}
        </span>
      `;
    }).join('');

    container.innerHTML = tagsHTML;
  }

  /**
   * Format preference name for display
   * @param {string} name - Raw preference name
   * @returns {string} Formatted name
   */
  formatPreferenceName(name) {
    return name.split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Test AI prediction with a random meal
   */
  async testAIPrediction() {
    try {
      const testMeals = [
        'Grilled Chicken with Roasted Vegetables',
        'Spaghetti Carbonara',
        'Thai Green Curry with Jasmine Rice',
        'Mediterranean Quinoa Bowl',
        'BBQ Pulled Pork Sandwich',
        'Vegetarian Stir Fry',
        'Salmon with Lemon Herb Butter',
        'Mexican Bean and Rice Bowl',
        'Italian Margherita Pizza',
        'Asian Beef and Broccoli'
      ];

      const randomMeal = testMeals[Math.floor(Math.random() * testMeals.length)];
      const prediction = this.learningSystem.predictRating(randomMeal);
      
      // Update demo meal display
      const demoMealName = document.getElementById('demoMealName');
      const demoRatingInterface = document.getElementById('demoRatingInterface');
      
      if (demoMealName && demoRatingInterface) {
        demoMealName.innerHTML = `
          <strong>${randomMeal}</strong><br>
          <small>AI Prediction: ${prediction.rating.toFixed(1)}/5 ⭐ 
          (${(prediction.confidence * 100).toFixed(0)}% confidence)</small>
        `;

        // Add rating interface
        this.ratingUI.addRatingToMeal(demoRatingInterface, randomMeal, { 
          showQuickButtons: true, 
          compact: true 
        });
        
        demoRatingInterface.style.display = 'block';
      }

      // Show prediction breakdown
      this.showPredictionBreakdown(randomMeal, prediction);

    } catch (error) {
      console.error('Error testing AI prediction:', error);
      alert('Error testing prediction. Please try again.');
    }
  }

  /**
   * Show detailed prediction breakdown
   * @param {string} mealName - Name of the meal
   * @param {Object} prediction - Prediction result
   */
  showPredictionBreakdown(mealName, prediction) {
    const breakdown = prediction.breakdown || {};
    
    const modal = document.createElement('div');
    modal.className = 'prediction-breakdown-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔮 AI Prediction Breakdown</h3>
          <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <h4>${mealName}</h4>
          <div class="prediction-summary">
            <div class="prediction-rating">
              <span class="rating-number">${prediction.rating.toFixed(1)}</span>
              <span class="rating-stars">${'⭐'.repeat(Math.round(prediction.rating))}</span>
            </div>
            <div class="prediction-confidence">
              Confidence: ${(prediction.confidence * 100).toFixed(0)}%
            </div>
          </div>
          
          <div class="breakdown-details">
            <h5>Score Breakdown:</h5>
            <div class="score-item">
              <span>Ingredients:</span>
              <span>${breakdown.ingredientScore?.toFixed(2) || 'N/A'}</span>
            </div>
            <div class="score-item">
              <span>Cuisine:</span>
              <span>${breakdown.cuisineScore?.toFixed(2) || 'N/A'}</span>
            </div>
            <div class="score-item">
              <span>Cooking Method:</span>
              <span>${breakdown.cookingMethodScore?.toFixed(2) || 'N/A'}</span>
            </div>
            <div class="score-item">
              <span>Context:</span>
              <span>${breakdown.contextualScore?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
          
          <div class="prediction-advice">
            ${this.generatePredictionAdvice(prediction)}
          </div>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    document.body.appendChild(modal);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  }

  /**
   * Generate advice based on prediction
   * @param {Object} prediction - Prediction result
   * @returns {string} Advice text
   */
  generatePredictionAdvice(prediction) {
    if (prediction.confidence < 0.3) {
      return `
        <p><strong>💡 Low Confidence:</strong> The AI needs more rating data to make accurate predictions. 
        Rate more meals to improve prediction accuracy!</p>
      `;
    } else if (prediction.rating >= 4) {
      return `
        <p><strong>🎯 High Rating:</strong> The AI thinks you'll love this meal based on your preferences! 
        Consider adding it to your meal plan.</p>
      `;
    } else if (prediction.rating <= 2) {
      return `
        <p><strong>⚠️ Low Rating:</strong> The AI predicts you might not enjoy this meal. 
        You could try it anyway or look for similar meals with ingredients you prefer.</p>
      `;
    } else {
      return `
        <p><strong>🤔 Neutral Rating:</strong> The AI is unsure about this meal. 
        It might be worth trying to help the system learn your preferences better.</p>
      `;
    }
  }

  /**
   * Export ratings data
   */
  async exportRatings() {
    try {
      const data = {
        ratings: this.ratingUI.ratingHistory,
        preferences: this.learningSystem.preferences,
        stats: this.learningSystem.learningStats,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-ratings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccessMessage('Ratings data exported successfully!');

    } catch (error) {
      console.error('Error exporting ratings:', error);
      alert('Error exporting ratings data. Please try again.');
    }
  }

  /**
   * Reset all ratings data
   */
  async resetRatings() {
    const confirmed = confirm(
      'Are you sure you want to reset ALL rating data? This action cannot be undone!\n\n' +
      'This will delete:\n' +
      '- All meal ratings\n' +
      '- Learned preferences\n' +
      '- Learning statistics'
    );

    if (!confirmed) return;

    try {
      // Reset learning system
      this.learningSystem.preferences = {
        ingredientScores: {},
        cuisineScores: {},
        cookingMethodScores: {},
        combinationScores: {},
        templateScores: {},
        timeOfDayPreferences: { breakfast: {}, lunch: {}, dinner: {}, snack: {} },
        seasonalPreferences: {},
        moodPreferences: {},
        nutritionPreferences: { highProtein: 0, lowCarb: 0, highFiber: 0, lowCalorie: 0, balanced: 0 },
        learningConfidence: {},
        preferenceHistory: [],
        ratingPatterns: {},
        lastUpdated: Date.now()
      };

      this.learningSystem.ratingHistory = [];
      this.learningSystem.learningStats = {
        totalRatings: 0,
        accuratePredictions: 0,
        learningAccuracy: 0,
        lastAccuracyUpdate: Date.now()
      };

      // Reset rating UI
      this.ratingUI.ratingHistory = [];

      // Save reset state
      await this.learningSystem.savePreferences();
      await this.learningSystem.saveRatingHistory();

      // Update dashboard
      await this.updateAllStats();

      this.showSuccessMessage('All rating data has been reset.');

    } catch (error) {
      console.error('Error resetting ratings:', error);
      alert('Error resetting ratings data. Please try again.');
    }
  }

  /**
   * Calculate overall confidence from learning data
   * @returns {number} Confidence percentage (0-100)
   */
  calculateOverallConfidence() {
    const confidenceValues = Object.values(this.learningSystem.preferences.learningConfidence || {});
    if (confidenceValues.length === 0) return 0;
    
    const avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
    const dataBonus = Math.min(this.learningSystem.learningStats.totalRatings / 50, 0.3); // Up to 30% bonus for data volume
    
    return Math.round((avgConfidence + dataBonus) * 100);
  }

  /**
   * Get emoji for rating value
   * @param {number} rating - Rating value (1-5)
   * @returns {string} Emoji
   */
  getRatingEmoji(rating) {
    const emojis = { 1: '🤢', 2: '😕', 3: '😐', 4: '😋', 5: '🤩' };
    return emojis[rating] || '😐';
  }

  /**
   * Format time ago text
   * @param {number} timestamp - Timestamp
   * @returns {string} Time ago text
   */
  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  /**
   * Animate number changes
   * @param {HTMLElement} element - Element to animate
   * @param {number} targetValue - Target value
   * @param {string} suffix - Suffix to add
   * @param {number} decimals - Number of decimal places
   */
  animateNumber(element, targetValue, suffix = '', decimals = 0) {
    const startValue = parseFloat(element.textContent.replace(/[^\d.]/g, '')) || 0;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out
      
      const currentValue = startValue + (targetValue - startValue) * easeProgress;
      element.textContent = currentValue.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Animate bar fill
   * @param {HTMLElement} bar - Bar element
   * @param {number} percentage - Target percentage
   */
  animateBarFill(bar, percentage) {
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out
      
      const currentPercentage = percentage * easeProgress;
      bar.style.width = `${currentPercentage}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
      ">
        ✅ ${message}
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Start auto-update interval
   */
  startAutoUpdate() {
    // Update dashboard every 30 seconds when visible
    this.updateInterval = setInterval(() => {
      const ratingsTab = document.getElementById('ratings');
      if (ratingsTab && ratingsTab.classList.contains('active')) {
        this.updateAllStats();
      }
    }, 30000);
  }

  /**
   * Stop auto-update interval
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Cleanup dashboard
   */
  destroy() {
    this.stopAutoUpdate();
    this.isInitialized = false;
  }
}
