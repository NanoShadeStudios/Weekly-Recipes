/**
 * Enhanced Meal Rating UI System
 * Interactive feedback interface with multiple rating methods and visual feedback
 * @fileoverview Advanced UI for meal rating and preference learning
 * @module MealRatingUI
 */

/**
 * MealRatingUI - Interactive rating interface for meals
 * Features:
 * - Multiple rating methods (stars, thumbs, emoji)
 * - Quick feedback buttons
 * - Post-meal rating reminders
 * - Rating history visualization
 * - Learning progress indicators
 */
export class MealRatingUI {
  constructor(learningSystem) {
    this.learningSystem = learningSystem;
    this.activeRatings = new Map(); // Track active rating sessions
    this.ratingHistory = [];
    this.feedbackQueue = []; // Queue for post-meal reminders
    
    this.initializeUI();
    this.setupEventListeners();
  }

  /**
   * Initialize the rating UI components
   */
  initializeUI() {
    this.createRatingStyles();
    this.createRatingComponents();
    this.createFeedbackModal();
    this.createLearningProgressIndicator();
    this.setupPostMealReminders();
  }

  /**
   * Create CSS styles for rating components
   */
  createRatingStyles() {
    const styles = `
      <style id="meal-rating-styles">
        /* Rating Component Styles */
        .meal-rating-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .meal-rating-container:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        /* Star Rating */
        .star-rating {
          display: flex;
          gap: 2px;
        }

        .star-rating .star {
          font-size: 20px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .star-rating .star:hover,
        .star-rating .star.active {
          color: #ffd700;
          transform: scale(1.1);
        }

        .star-rating .star:hover ~ .star {
          color: #666;
        }

        /* Quick Rating Buttons */
        .quick-rating {
          display: flex;
          gap: 6px;
        }

        .quick-rating-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 20px;
          padding: 6px 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .quick-rating-btn:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.2);
        }

        .quick-rating-btn.love { background: rgba(255, 20, 147, 0.3); }
        .quick-rating-btn.like { background: rgba(34, 197, 94, 0.3); }
        .quick-rating-btn.neutral { background: rgba(156, 163, 175, 0.3); }
        .quick-rating-btn.dislike { background: rgba(239, 68, 68, 0.3); }
        .quick-rating-btn.hate { background: rgba(127, 29, 29, 0.3); }

        /* Emoji Rating */
        .emoji-rating {
          display: flex;
          gap: 8px;
        }

        .emoji-rating .emoji {
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
          opacity: 0.6;
        }

        .emoji-rating .emoji:hover,
        .emoji-rating .emoji.active {
          opacity: 1;
          transform: scale(1.2);
        }

        /* Feedback Modal */
        .rating-feedback-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .rating-feedback-content {
          background: var(--card-bg, #1f2937);
          padding: 24px;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        .rating-feedback-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .rating-feedback-meal-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #f9fafb);
          margin-bottom: 8px;
        }

        .rating-feedback-subtitle {
          color: var(--text-secondary, #9ca3af);
          font-size: 14px;
        }

        .rating-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .rating-method {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .rating-method:hover {
          border-color: var(--primary-color, #3b82f6);
          background: rgba(255, 255, 255, 0.1);
        }

        .rating-method-title {
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary, #f9fafb);
        }

        .context-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .context-tag {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .context-tag:hover,
        .context-tag.active {
          background: rgba(59, 130, 246, 0.4);
          transform: scale(1.05);
        }

        .feedback-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .feedback-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .feedback-btn.primary {
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .feedback-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary, #f9fafb);
        }

        .feedback-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Learning Progress Indicator */
        .learning-progress {
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--card-bg, #1f2937);
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: none;
          align-items: center;
          gap: 8px;
          z-index: 1000;
        }

        .learning-progress.show {
          display: flex;
          animation: slideInRight 0.3s ease;
        }

        .learning-brain {
          font-size: 20px;
          animation: pulse 2s infinite;
        }

        .learning-text {
          color: var(--text-primary, #f9fafb);
          font-size: 14px;
          font-weight: 500;
        }

        .learning-accuracy {
          background: rgba(34, 197, 94, 0.2);
          color: #10b981;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Post-Meal Reminder */
        .post-meal-reminder {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--card-bg, #1f2937);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          display: none;
          max-width: 300px;
          z-index: 1000;
          border-left: 4px solid var(--primary-color, #3b82f6);
        }

        .post-meal-reminder.show {
          display: block;
          animation: slideInUp 0.3s ease;
        }

        .reminder-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .reminder-title {
          font-weight: 600;
          color: var(--text-primary, #f9fafb);
        }

        .reminder-message {
          color: var(--text-secondary, #9ca3af);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .reminder-actions {
          display: flex;
          gap: 8px;
        }

        .reminder-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .rating-feedback-content {
            margin: 20px;
            max-width: none;
          }

          .learning-progress {
            top: 10px;
            right: 10px;
            font-size: 12px;
          }

          .post-meal-reminder {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .quick-rating {
            flex-wrap: wrap;
          }

          .quick-rating-btn {
            font-size: 14px;
            padding: 4px 8px;
          }
        }
      </style>
    `;

    // Remove existing styles and add new ones
    const existingStyles = document.getElementById('meal-rating-styles');
    if (existingStyles) {
      existingStyles.remove();
    }

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Create rating components for meal cards
   */
  createRatingComponents() {
    // This will be called when rendering meal cards
    console.log('🎨 Rating UI components initialized');
  }

  /**
   * Add rating interface to a meal element
   * @param {HTMLElement} mealElement - The meal card element
   * @param {string} mealName - Name of the meal
   * @param {Object} options - Configuration options
   */
  addRatingToMeal(mealElement, mealName, options = {}) {
    const {
      showStars = true,
      showQuickButtons = true,
      showEmojis = false,
      compact = false
    } = options;

    // Check if rating already exists
    if (mealElement.querySelector('.meal-rating-container')) {
      return;
    }

    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'meal-rating-container';
    ratingContainer.innerHTML = this.generateRatingHTML(mealName, {
      showStars,
      showQuickButtons,
      showEmojis,
      compact
    });

    // Insert rating container
    const insertPosition = mealElement.querySelector('.meal-actions') || 
                          mealElement.querySelector('.meal-content') || 
                          mealElement;
    
    if (insertPosition === mealElement) {
      insertPosition.appendChild(ratingContainer);
    } else {
      insertPosition.parentNode.insertBefore(ratingContainer, insertPosition.nextSibling);
    }

    // Setup event listeners for this rating component
    this.setupRatingEventListeners(ratingContainer, mealName);
  }

  /**
   * Generate HTML for rating interface
   * @param {string} mealName - Name of the meal
   * @param {Object} options - Display options
   * @returns {string} HTML string
   */
  generateRatingHTML(mealName, options) {
    const { showStars, showQuickButtons, showEmojis, compact } = options;

    let html = '';

    if (showStars && !compact) {
      html += `
        <div class="star-rating" data-meal="${mealName}">
          ${[1, 2, 3, 4, 5].map(rating => 
            `<span class="star" data-rating="${rating}">⭐</span>`
          ).join('')}
        </div>
      `;
    }

    if (showQuickButtons) {
      html += `
        <div class="quick-rating" data-meal="${mealName}">
          <button class="quick-rating-btn love" data-rating="5" title="Love it!">
            💖 ${compact ? '' : 'Love'}
          </button>
          <button class="quick-rating-btn like" data-rating="4" title="Like it">
            👍 ${compact ? '' : 'Like'}
          </button>
          <button class="quick-rating-btn neutral" data-rating="3" title="It's okay">
            😐 ${compact ? '' : 'OK'}
          </button>
          <button class="quick-rating-btn dislike" data-rating="2" title="Don't like">
            👎 ${compact ? '' : 'Nah'}
          </button>
          <button class="quick-rating-btn hate" data-rating="1" title="Hate it">
            🤮 ${compact ? '' : 'Hate'}
          </button>
        </div>
      `;
    }

    if (showEmojis && !compact) {
      html += `
        <div class="emoji-rating" data-meal="${mealName}">
          <span class="emoji" data-rating="5" title="Amazing!">🤩</span>
          <span class="emoji" data-rating="4" title="Good">😋</span>
          <span class="emoji" data-rating="3" title="Okay">😐</span>
          <span class="emoji" data-rating="2" title="Meh">😕</span>
          <span class="emoji" data-rating="1" title="Awful">🤢</span>
        </div>
      `;
    }

    return html;
  }

  /**
   * Setup event listeners for rating components
   * @param {HTMLElement} container - Rating container element
   * @param {string} mealName - Name of the meal
   */
  setupRatingEventListeners(container, mealName) {
    // Star rating listeners
    const stars = container.querySelectorAll('.star-rating .star');
    stars.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => {
          s.classList.toggle('active', i <= index);
        });
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('active'));
      });

      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.submitRating(mealName, rating, { method: 'stars' });
      });
    });

    // Quick button listeners
    const quickButtons = container.querySelectorAll('.quick-rating-btn');
    quickButtons.forEach(button => {
      button.addEventListener('click', () => {
        const rating = parseInt(button.dataset.rating);
        this.submitRating(mealName, rating, { method: 'quick' });
        
        // Visual feedback
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = '';
        }, 200);
      });
    });

    // Emoji rating listeners
    const emojis = container.querySelectorAll('.emoji-rating .emoji');
    emojis.forEach(emoji => {
      emoji.addEventListener('click', () => {
        const rating = parseInt(emoji.dataset.rating);
        this.submitRating(mealName, rating, { method: 'emoji' });
        
        // Visual feedback
        emojis.forEach(e => e.classList.remove('active'));
        emoji.classList.add('active');
      });
    });
  }

  /**
   * Submit a meal rating
   * @param {string} mealName - Name of the meal
   * @param {number} rating - Rating value (1-5)
   * @param {Object} context - Additional context
   */
  async submitRating(mealName, rating, context = {}) {
    try {
      // Show loading state
      this.showLearningProgress('Learning from your feedback...');

      // Submit to learning system
      const result = await this.learningSystem.rateMeal(mealName, rating, {
        ...context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        source: 'manual_rating'
      });

      if (result.success) {
        // Show success feedback
        this.showRatingFeedback(mealName, rating, result);
        
        // Update UI
        this.updateRatingDisplay(mealName, rating);
        
        // Track in local history
        this.ratingHistory.push({
          mealName,
          rating,
          timestamp: Date.now(),
          result
        });

        console.log(`✅ Rating submitted: ${mealName} = ${rating}/5`);
      } else {
        throw new Error(result.error || 'Rating submission failed');
      }

    } catch (error) {
      console.error('Error submitting rating:', error);
      this.showErrorFeedback('Failed to save rating. Please try again.');
    } finally {
      // Hide loading state
      setTimeout(() => this.hideLearningProgress(), 2000);
    }
  }

  /**
   * Show detailed rating feedback modal
   * @param {string} mealName - Name of the meal
   * @param {number} rating - Rating value
   * @param {Object} result - Learning result
   */
  showRatingFeedback(mealName, rating, result) {
    const modal = document.getElementById('rating-feedback-modal');
    if (modal) {
      const content = modal.querySelector('.rating-feedback-content');
      content.innerHTML = `
        <div class="rating-feedback-header">
          <div class="rating-feedback-meal-name">${mealName}</div>
          <div class="rating-feedback-subtitle">Rated ${rating}/5 stars</div>
        </div>
        
        <div class="feedback-message">
          <div class="feedback-icon">${this.getRatingEmoji(rating)}</div>
          <div class="feedback-text">
            ${result.learningFeedback || 'Thanks for your feedback!'}
          </div>
        </div>
        
        ${result.prediction ? `
          <div class="prediction-info">
            <strong>AI Prediction Accuracy:</strong> 
            ${result.accuracy ? (result.accuracy * 100).toFixed(0) + '%' : 'N/A'}
            <br>
            <small>Predicted: ${result.prediction.rating.toFixed(1)}/5 (Confidence: ${(result.prediction.confidence * 100).toFixed(0)}%)</small>
          </div>
        ` : ''}
        
        <div class="learning-stats">
          <div class="stat">
            <span class="stat-label">Total Ratings:</span>
            <span class="stat-value">${result.totalRatings}</span>
          </div>
          <div class="stat">
            <span class="stat-label">System Accuracy:</span>
            <span class="stat-value">${(result.systemAccuracy * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div class="feedback-actions">
          <button class="feedback-btn secondary" onclick="document.getElementById('rating-feedback-modal').style.display='none'">
            Close
          </button>
        </div>
      `;
      
      modal.style.display = 'flex';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        modal.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Create feedback modal
   */
  createFeedbackModal() {
    const modal = document.createElement('div');
    modal.id = 'rating-feedback-modal';
    modal.className = 'rating-feedback-modal';
    modal.innerHTML = `
      <div class="rating-feedback-content">
        <!-- Content will be dynamically inserted -->
      </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    document.body.appendChild(modal);
  }

  /**
   * Create learning progress indicator
   */
  createLearningProgressIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'learning-progress';
    indicator.className = 'learning-progress';
    indicator.innerHTML = `
      <div class="learning-brain">🧠</div>
      <div class="learning-text">Learning...</div>
      <div class="learning-accuracy">95%</div>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Show learning progress
   * @param {string} message - Progress message
   */
  showLearningProgress(message = 'Learning...') {
    const indicator = document.getElementById('learning-progress');
    if (indicator) {
      indicator.querySelector('.learning-text').textContent = message;
      indicator.classList.add('show');
    }
  }

  /**
   * Hide learning progress
   */
  hideLearningProgress() {
    const indicator = document.getElementById('learning-progress');
    if (indicator) {
      indicator.classList.remove('show');
    }
  }

  /**
   * Update learning accuracy display
   * @param {number} accuracy - Accuracy percentage (0-1)
   */
  updateLearningAccuracy(accuracy) {
    const indicator = document.getElementById('learning-progress');
    if (indicator) {
      const accuracyElement = indicator.querySelector('.learning-accuracy');
      accuracyElement.textContent = `${(accuracy * 100).toFixed(0)}%`;
    }
  }

  /**
   * Setup post-meal reminders
   */
  setupPostMealReminders() {
    // Check for meal generation events to queue reminders
    document.addEventListener('mealGenerated', (event) => {
      try {
        console.log('mealGenerated event received:', event.detail);
        const { meal, meals } = event.detail || {};
        
        let mealList = [];
        if (meals && Array.isArray(meals)) {
          mealList = meals;
        } else if (meal && Array.isArray(meal)) {
          mealList = meal;
        } else if (meal) {
          mealList = [meal];
        }
        
        console.log('Processing meal list:', mealList);
        if (mealList && Array.isArray(mealList) && mealList.length > 0) {
          mealList.forEach((mealItem, index) => {
            if (mealItem) {
              // Handle different meal item structures
              const mealName = typeof mealItem === 'string' ? mealItem : 
                              (mealItem.name || mealItem.meal || String(mealItem));
              if (mealName) {
                this.queuePostMealReminder(mealName, index);
              }
            }
          });
        } else {
          console.log('No valid meal list found for reminder setup');
        }
      } catch (error) {
        console.error('Error in mealGenerated event listener:', error);
      }
    });

    // Create reminder element
    const reminder = document.createElement('div');
    reminder.id = 'post-meal-reminder';
    reminder.className = 'post-meal-reminder';
    document.body.appendChild(reminder);
  }

  /**
   * Queue a post-meal reminder
   * @param {string} mealName - Name of the meal
   * @param {number} dayIndex - Day index for the meal
   */
  queuePostMealReminder(mealName, dayIndex) {
    // Calculate reminder time (e.g., 2 hours after typical meal times)
    const now = new Date();
    const reminderTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now

    this.feedbackQueue.push({
      mealName,
      dayIndex,
      reminderTime,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Set up the reminder
    setTimeout(() => {
      this.showPostMealReminder(mealName, dayIndex);
    }, reminderTime.getTime() - now.getTime());
  }

  /**
   * Show post-meal reminder
   * @param {string} mealName - Name of the meal
   * @param {number} dayIndex - Day index
   */
  showPostMealReminder(mealName, dayIndex) {
    const reminder = document.getElementById('post-meal-reminder');
    if (reminder) {
      reminder.innerHTML = `
        <div class="reminder-header">
          <span>🍽️</span>
          <span class="reminder-title">How was your meal?</span>
        </div>
        <div class="reminder-message">
          Rate "${mealName}" to help us learn your preferences!
        </div>
        <div class="reminder-actions">
          <button class="reminder-btn" style="background: #ef4444; color: white;" 
                  onclick="window.mealRatingUI.quickRate('${mealName}', 2); this.parentElement.parentElement.parentElement.classList.remove('show');">
            👎 Didn't like
          </button>
          <button class="reminder-btn" style="background: #10b981; color: white;"
                  onclick="window.mealRatingUI.quickRate('${mealName}', 4); this.parentElement.parentElement.parentElement.classList.remove('show');">
            👍 Enjoyed it
          </button>
          <button class="reminder-btn" style="background: #6b7280; color: white;"
                  onclick="this.parentElement.parentElement.parentElement.classList.remove('show');">
            Later
          </button>
        </div>
      `;

      reminder.classList.add('show');

      // Auto-hide after 30 seconds
      setTimeout(() => {
        reminder.classList.remove('show');
      }, 30000);
    }
  }

  /**
   * Quick rate a meal from reminder
   * @param {string} mealName - Name of the meal
   * @param {number} rating - Rating value
   */
  async quickRate(mealName, rating) {
    await this.submitRating(mealName, rating, { 
      method: 'reminder',
      source: 'post_meal_reminder' 
    });
  }

  /**
   * Update rating display after submission
   * @param {string} mealName - Name of the meal
   * @param {number} rating - Rating value
   */
  updateRatingDisplay(mealName, rating) {
    // Find all rating components for this meal
    const ratingContainers = document.querySelectorAll(`[data-meal="${mealName}"]`);
    
    ratingContainers.forEach(container => {
      // Update visual state
      container.style.opacity = '0.7';
      
      // Add a "rated" indicator
      if (!container.querySelector('.rated-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'rated-indicator';
        indicator.innerHTML = `✅ Rated ${rating}/5`;
        indicator.style.cssText = `
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
          margin-top: 4px;
        `;
        container.appendChild(indicator);
      }
    });
  }

  /**
   * Show error feedback
   * @param {string} message - Error message
   */
  showErrorFeedback(message) {
    // Show error toast or notification
    const errorToast = document.createElement('div');
    errorToast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc2626;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ">
        ❌ ${message}
      </div>
    `;
    
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
      errorToast.remove();
    }, 3000);
  }

  /**
   * Get appropriate emoji for rating
   * @param {number} rating - Rating value (1-5)
   * @returns {string} Emoji
   */
  getRatingEmoji(rating) {
    const emojis = {
      1: '🤢',
      2: '😕',
      3: '😐',
      4: '😋',
      5: '🤩'
    };
    return emojis[rating] || '😐';
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Listen for meal generation events
    document.addEventListener('mealsGenerated', (event) => {
      setTimeout(() => {
        this.addRatingToAllMeals();
      }, 1000);
    });

    // Listen for escape key to close modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const modal = document.getElementById('rating-feedback-modal');
        if (modal && modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      }
    });

    // Expose quick rate function globally
    window.mealRatingUI = this;
  }

  /**
   * Add rating interface to all visible meals
   */
  addRatingToAllMeals() {
    // Find all meal elements
    const mealElements = document.querySelectorAll('.meal-card, .meal-item, [id^="mealText"]');
    
    mealElements.forEach(element => {
      const mealName = this.extractMealNameFromElement(element);
      if (mealName) {
        this.addRatingToMeal(element, mealName, { compact: true });
      }
    });
  }

  /**
   * Extract meal name from element
   * @param {HTMLElement} element - Meal element
   * @returns {string|null} Meal name
   */
  extractMealNameFromElement(element) {
    // Try various methods to extract meal name
    return element.textContent?.trim() || 
           element.querySelector('.meal-name')?.textContent?.trim() ||
           element.querySelector('h3')?.textContent?.trim() ||
           element.querySelector('h4')?.textContent?.trim() ||
           element.dataset.meal ||
           null;
  }

  /**
   * Get rating statistics
   * @returns {Object} Rating statistics
   */
  getRatingStats() {
    return {
      totalRatings: this.ratingHistory.length,
      averageRating: this.ratingHistory.length > 0 ? 
        this.ratingHistory.reduce((sum, r) => sum + r.rating, 0) / this.ratingHistory.length : 0,
      ratingDistribution: this.calculateRatingDistribution(),
      recentRatings: this.ratingHistory.slice(-10),
      learningAccuracy: this.learningSystem.learningStats.learningAccuracy
    };
  }

  /**
   * Calculate rating distribution
   * @returns {Object} Distribution of ratings
   */
  calculateRatingDistribution() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.ratingHistory.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return distribution;
  }
}
