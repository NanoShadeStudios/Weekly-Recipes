/**
 * Community UI Manager - Handles all community interface interactions
 * Integrates with CommunityManager for data operations
 * @fileoverview UI management for community meal plan sharing features
 * @module CommunityUI
 */

/**
 * CommunityUI - Manages community feature user interface
 * @class CommunityUI
 */
class CommunityUI {
  /**
   * Initialize the community UI manager
   * @constructor
   * @param {CommunityManager} communityManager - Community data manager instance
   */
  constructor(communityManager) {
    this.communityManager = communityManager;
    this.currentView = 'browse';
    this.selectedPlanForSharing = null;
    this.currentFilters = {};
    
    // Initialize UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize all community UI components and event listeners
   * @returns {void}
   */
  initialize() {
    try {
      console.log('Initializing Community UI...');
      
      // Check if DOM elements exist
      const communitySection = document.getElementById('community');
      const communityGrid = document.getElementById('communityPlansGrid');
      
      if (!communitySection) {
        console.error('Community section not found in DOM');
        return;
      }
      
      if (!communityGrid) {
        console.error('Community plans grid not found in DOM');
        return;
      }
      
      // Initialize community data with sample data if needed
      if (this.communityManager.sharedPlans.length === 0) {
        console.log('Initializing default community data...');
        this.communityManager.initializeDefaultData();
      }
      
      this.setupEventListeners();
      this.updateCommunityStats();
      
      // Start with browse view (hide all others first)
      this.switchView('browse');
      
      console.log('Community UI initialized successfully');
    } catch (error) {
      console.error('Error initializing Community UI:', error);
      this.showFallbackContent();
    }
  }

  /**
   * Show fallback content if initialization fails
   * @returns {void}
   */
  showFallbackContent() {
    const communityGrid = document.getElementById('communityPlansGrid');
    if (communityGrid) {
      communityGrid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">⚠️</span>
          <h4>Community Features Unavailable</h4>
          <p>There was an issue loading the community features. Please refresh the page.</p>
          <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
        </div>
      `;
    }
  }

  /**
   * Set up all event listeners for community features
   * @returns {void}
   */
  setupEventListeners() {
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Search and filters
    const communitySearch = document.getElementById('communitySearch');
    if (communitySearch) {
      communitySearch.addEventListener('input', () => this.handleSearch());
    }

    const searchBtn = document.getElementById('communitySearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.handleSearch());
    }

    // Filter controls
    const filterControls = ['difficultyFilter', 'ratingFilter', 'sortFilter'];
    filterControls.forEach(filterId => {
      const control = document.getElementById(filterId);
      if (control) {
        control.addEventListener('change', () => this.handleFilterChange());
      }
    });

    // Tag filters
    const tagFilters = document.querySelectorAll('.tag-filter');
    tagFilters.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.target.classList.toggle('active');
        this.handleFilterChange();
      });
    });

    // Share form
    this.setupShareFormListeners();
  }

  /**
   * Set up event listeners for the share form
   * @returns {void}
   */
  setupShareFormListeners() {
    const shareForm = document.getElementById('sharePlanForm');
    if (shareForm) {
      shareForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleShareSubmit();
      });
    }

    const selectCurrentPlanBtn = document.getElementById('selectCurrentPlanBtn');
    if (selectCurrentPlanBtn) {
      selectCurrentPlanBtn.addEventListener('click', () => this.selectCurrentPlan());
    }

    const selectSavedPlanBtn = document.getElementById('selectSavedPlanBtn');
    if (selectSavedPlanBtn) {
      selectSavedPlanBtn.addEventListener('click', () => this.selectSavedPlan());
    }

    const cancelShareBtn = document.getElementById('cancelShareBtn');
    if (cancelShareBtn) {
      cancelShareBtn.addEventListener('click', () => this.switchView('browse'));
    }

    const shareFirstPlanBtn = document.getElementById('shareFirstPlanBtn');
    if (shareFirstPlanBtn) {
      shareFirstPlanBtn.addEventListener('click', () => this.switchView('share'));
    }
  }

  /**
   * Switch between different community views
   * @param {string} view - View name (browse, my-shared, trending, share)
   * @returns {void}
   */
  switchView(view) {
    console.log('Switching to community view:', view);
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });

    // Hide all views first
    const allViews = ['browseView', 'mySharedView', 'trendingView', 'shareView'];
    allViews.forEach(viewId => {
      const viewEl = document.getElementById(viewId);
      if (viewEl) {
        viewEl.classList.remove('active');
        viewEl.style.display = 'none';
      }
    });

    // Show selected view
    const targetViewId = `${view}View`;
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.classList.add('active');
      targetView.style.display = 'block';
    } else {
      console.warn('Target view not found:', targetViewId);
    }

    this.currentView = view;

    // Load content for the view
    switch (view) {
      case 'browse':
        this.renderBrowseView();
        break;
      case 'my-shared':
        this.renderMySharedView();
        break;
      case 'trending':
        this.renderTrendingView();
        break;
      case 'share':
        this.renderShareView();
        break;
      default:
        console.warn('Unknown view:', view);
        this.switchView('browse'); // Default to browse view
    }
  }

  /**
   * Update community statistics display
   * @returns {void}
   */
  updateCommunityStats() {
    const stats = this.communityManager.getCommunityStats();
    
    const totalPlansEl = document.getElementById('totalCommunityPlans');
    if (totalPlansEl) totalPlansEl.textContent = stats.totalPlans;
    
    const totalUsersEl = document.getElementById('totalCommunityUsers');
    if (totalUsersEl) totalUsersEl.textContent = stats.activeUsers;
    
    const avgRatingEl = document.getElementById('averageRating');
    if (avgRatingEl) avgRatingEl.textContent = stats.averageRating.toFixed(1);
  }

  /**
   * Render the browse community plans view
   * @returns {void}
   */
  renderBrowseView() {
    const grid = document.getElementById('communityPlansGrid');
    if (!grid) return;

    const filters = this.getCurrentFilters();
    const plans = this.communityManager.getSharedPlans(filters);

    if (plans.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h4>No Plans Found</h4>
          <p>Try adjusting your search or filters to find meal plans.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = plans.map(plan => this.createPlanCard(plan)).join('');
    this.attachPlanCardListeners();
  }

  /**
   * Render the user's shared plans view
   * @returns {void}
   */
  renderMySharedView() {
    const grid = document.getElementById('mySharedPlansGrid');
    if (!grid) return;

    const userPlans = this.communityManager.getUserSharedPlans();
    const noPlansMsg = grid.querySelector('.no-plans-message');

    if (userPlans.length === 0) {
      if (noPlansMsg) {
        noPlansMsg.style.display = 'block';
      }
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <h4>No Shared Plans Yet</h4>
          <p>Share your first meal plan with the community!</p>
          <button id="shareFirstPlanBtn" class="btn btn-primary">Share a Plan</button>
        </div>
      `;
      
      // Re-attach event listener
      const shareFirstPlanBtn = document.getElementById('shareFirstPlanBtn');
      if (shareFirstPlanBtn) {
        shareFirstPlanBtn.addEventListener('click', () => this.switchView('share'));
      }
      return;
    }

    if (noPlansMsg) {
      noPlansMsg.style.display = 'none';
    }

    grid.innerHTML = userPlans.map(plan => this.createPlanCard(plan, true)).join('');
    this.attachPlanCardListeners();
  }

  /**
   * Render the trending plans view
   * @returns {void}
   */
  renderTrendingView() {
    const grid = document.getElementById('trendingPlansGrid');
    if (!grid) return;

    const trendingPlans = this.communityManager.getTrendingPlans();

    if (trendingPlans.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔥</span>
          <h4>No Trending Plans Yet</h4>
          <p>Check back later for popular meal plans from the community!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = trendingPlans.map(plan => this.createPlanCard(plan)).join('');
    this.attachPlanCardListeners();
  }

  /**
   * Render the share plan view
   * @returns {void}
   */
  renderShareView() {
    // Reset form
    const form = document.getElementById('sharePlanForm');
    if (form) {
      form.reset();
    }

    // Hide plan preview
    const preview = document.getElementById('selectedPlanPreview');
    if (preview) {
      preview.style.display = 'none';
    }

    this.selectedPlanForSharing = null;
  }

  /**
   * Create HTML for a meal plan card
   * @param {Object} plan - Meal plan object
   * @param {boolean} isUserPlan - Whether this is user's own plan
   * @returns {string} HTML string for the plan card
   */
  createPlanCard(plan, isUserPlan = false) {
    const ratingStars = this.createStarRating(plan.rating);
    const difficultyClass = plan.difficulty.toLowerCase();
    
    return `
      <div class="meal-plan-card" data-plan-id="${plan.id}">
        <div class="plan-card-header">
          <div class="plan-card-title">
            ${plan.title}
            ${plan.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
          </div>
          <div class="plan-card-author">
            <div class="author-avatar">${plan.authorProfile?.avatar || '👤'}</div>
            <span class="author-name">${plan.author}</span>
          </div>
          <div class="plan-card-description">${plan.description}</div>
          <div class="plan-card-meta">
            <div class="plan-rating">
              <span class="star-rating">${ratingStars}</span>
              <span class="rating-text">${plan.rating.toFixed(1)} (${plan.ratingCount})</span>
            </div>
            <span class="plan-difficulty ${difficultyClass}">${plan.difficulty}</span>
          </div>
        </div>
        
        <div class="plan-card-body">
          <div class="plan-tags">
            ${plan.tags.map(tag => `<span class="plan-tag">${tag}</span>`).join('')}
          </div>
          
          <div class="plan-meals-preview">
            <div class="meals-preview-title">Sample Meals</div>
            <div class="meals-preview-list">
              ${plan.meals.slice(0, 3).map(meal => 
                `<div class="meal-preview-item">${meal.day}: ${meal.name}</div>`
              ).join('')}
              ${plan.meals.length > 3 ? `<div class="meal-preview-item">...and ${plan.meals.length - 3} more</div>` : ''}
            </div>
          </div>
        </div>
        
        <div class="plan-card-actions">
          <button class="plan-action-btn view-btn" data-action="view">👁️ View</button>
          <button class="plan-action-btn rate-btn" data-action="rate">⭐ Rate</button>
          <button class="plan-action-btn primary clone-btn" data-action="clone">📋 Use This Plan</button>
          ${isUserPlan ? '<button class="plan-action-btn delete-btn" data-action="delete">🗑️ Delete</button>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create star rating display
   * @param {number} rating - Rating value (0-5)
   * @returns {string} HTML string for star rating
   */
  createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  /**
   * Attach event listeners to plan cards
   * @returns {void}
   */
  attachPlanCardListeners() {
    const actionButtons = document.querySelectorAll('.plan-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = e.target.dataset.action;
        const planCard = e.target.closest('.meal-plan-card');
        const planId = planCard.dataset.planId;
        this.handlePlanAction(action, planId);
      });
    });

    // Card click to view plan
    const planCards = document.querySelectorAll('.meal-plan-card');
    planCards.forEach(card => {
      card.addEventListener('click', () => {
        const planId = card.dataset.planId;
        this.handlePlanAction('view', planId);
      });
    });
  }

  /**
   * Handle plan card actions (view, rate, clone, delete)
   * @param {string} action - Action type
   * @param {string} planId - Plan ID
   * @returns {void}
   */
  handlePlanAction(action, planId) {
    const plan = this.communityManager.getSharedPlan(planId);
    if (!plan) return;

    switch (action) {
      case 'view':
        this.showPlanDetail(plan);
        break;
      case 'rate':
        this.showRatingDialog(plan);
        break;
      case 'clone':
        this.clonePlan(plan);
        break;
      case 'delete':
        this.deletePlan(plan);
        break;
    }
  }

  /**
   * Show detailed view of a meal plan
   * @param {Object} plan - Meal plan object
   * @returns {void}
   */
  showPlanDetail(plan) {
    // This would typically open a modal or navigate to detail page
    // For now, we'll use an alert as a placeholder
    const mealsList = plan.meals.map(meal => `${meal.day}: ${meal.name}`).join('\n');
    
    alert(`📋 ${plan.title}\n\nBy: ${plan.author}\nRating: ${plan.rating}/5\nDifficulty: ${plan.difficulty}\n\nMeals:\n${mealsList}\n\nDescription:\n${plan.description}`);
  }

  /**
   * Show rating dialog for a plan
   * @param {Object} plan - Meal plan object
   * @returns {void}
   */
  showRatingDialog(plan) {
    const rating = prompt(`Rate "${plan.title}" (1-5 stars):`);
    if (rating !== null) {
      const numRating = parseInt(rating);
      if (numRating >= 1 && numRating <= 5) {
        try {
          this.communityManager.ratePlan(plan.id, numRating);
          this.showToast(`Rated "${plan.title}" ${numRating} stars!`);
          this.renderCurrentView();
          this.updateCommunityStats();
        } catch (error) {
          this.showToast('Error rating plan: ' + error.message, 'error');
        }
      } else {
        this.showToast('Please enter a rating between 1 and 5', 'error');
      }
    }
  }

  /**
   * Clone a plan to user's collection
   * @param {Object} plan - Meal plan object
   * @returns {void}
   */
  clonePlan(plan) {
    try {
      const clonedPlan = this.communityManager.clonePlan(plan.id);
      this.showToast(`"${plan.title}" has been added to your meal plans!`);
      
      // Optionally switch to weekly plan view and load the cloned plan
      // This would require integration with the main app's meal planning system
      console.log('Cloned plan:', clonedPlan);
    } catch (error) {
      this.showToast('Error cloning plan: ' + error.message, 'error');
    }
  }

  /**
   * Delete user's shared plan
   * @param {Object} plan - Meal plan object
   * @returns {void}
   */
  deletePlan(plan) {
    if (confirm(`Are you sure you want to delete "${plan.title}"? This action cannot be undone.`)) {
      try {
        this.communityManager.deleteSharedPlan(plan.id);
        this.showToast(`"${plan.title}" has been deleted.`);
        this.renderCurrentView();
        this.updateCommunityStats();
      } catch (error) {
        this.showToast('Error deleting plan: ' + error.message, 'error');
      }
    }
  }

  /**
   * Get current filter settings
   * @returns {Object} Filter object
   */
  getCurrentFilters() {
    const filters = {};
    
    const searchEl = document.getElementById('communitySearch');
    if (searchEl && searchEl.value.trim()) {
      filters.search = searchEl.value.trim();
    }
    
    const difficultyEl = document.getElementById('difficultyFilter');
    if (difficultyEl && difficultyEl.value) {
      filters.difficulty = difficultyEl.value;
    }
    
    const ratingEl = document.getElementById('ratingFilter');
    if (ratingEl && ratingEl.value) {
      filters.minRating = parseFloat(ratingEl.value);
    }
    
    const sortEl = document.getElementById('sortFilter');
    if (sortEl && sortEl.value) {
      filters.sortBy = sortEl.value;
    }
    
    const activeTags = Array.from(document.querySelectorAll('.tag-filter.active'))
      .map(tag => tag.dataset.tag);
    if (activeTags.length > 0) {
      filters.tags = activeTags;
    }
    
    return filters;
  }

  /**
   * Handle search input
   * @returns {void}
   */
  handleSearch() {
    this.renderCurrentView();
  }

  /**
   * Handle filter changes
   * @returns {void}
   */
  handleFilterChange() {
    this.renderCurrentView();
  }

  /**
   * Render the current view
   * @returns {void}
   */
  renderCurrentView() {
    switch (this.currentView) {
      case 'browse':
        this.renderBrowseView();
        break;
      case 'my-shared':
        this.renderMySharedView();
        break;
      case 'trending':
        this.renderTrendingView();
        break;
    }
  }

  /**
   * Select current week's meal plan for sharing
   * @returns {void}
   */
  selectCurrentPlan() {
    // This would integrate with the main app's meal planning system
    // For now, we'll create a sample plan
    const currentPlan = this.getCurrentWeekPlan();
    if (currentPlan && currentPlan.length > 0) {
      this.selectedPlanForSharing = currentPlan;
      this.showPlanPreview(currentPlan);
    } else {
      this.showToast('No current meal plan found. Please generate a meal plan first.', 'error');
    }
  }

  /**
   * Select from saved meal plans for sharing
   * @returns {void}
   */
  selectSavedPlan() {
    // This would show a dialog with saved plans
    // For now, we'll show an alert
    alert('This feature will allow you to select from your saved meal plans. Coming soon!');
  }

  /**
   * Get current week's meal plan (placeholder)
   * @returns {Array} Current meal plan
   */
  getCurrentWeekPlan() {
    // This should integrate with the main app's meal planning system
    // For demo purposes, return a sample plan
    return [
      { day: 'Monday', name: 'Grilled Chicken Salad', ingredients: ['chicken breast', 'mixed greens', 'tomatoes'] },
      { day: 'Tuesday', name: 'Pasta Primavera', ingredients: ['pasta', 'vegetables', 'olive oil'] },
      { day: 'Wednesday', name: 'Fish Tacos', ingredients: ['white fish', 'tortillas', 'cabbage'] },
      { day: 'Thursday', name: 'Vegetarian Stir-fry', ingredients: ['tofu', 'vegetables', 'soy sauce'] },
      { day: 'Friday', name: 'Homemade Pizza', ingredients: ['pizza dough', 'sauce', 'cheese'] },
      { day: 'Saturday', name: 'BBQ Burgers', ingredients: ['ground beef', 'buns', 'lettuce'] },
      { day: 'Sunday', name: 'Roast Chicken Dinner', ingredients: ['whole chicken', 'potatoes', 'vegetables'] }
    ];
  }

  /**
   * Show preview of selected plan
   * @param {Array} plan - Meal plan array
   * @returns {void}
   */
  showPlanPreview(plan) {
    const preview = document.getElementById('selectedPlanPreview');
    if (!preview) return;

    preview.innerHTML = `
      <div class="preview-title">📋 Selected Meal Plan Preview</div>
      <div class="preview-meals">
        ${plan.map(meal => `
          <div class="preview-day">
            <div class="preview-day-name">${meal.day}</div>
            <div class="preview-meal-name">${meal.name}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    preview.style.display = 'block';
  }

  /**
   * Handle share form submission
   * @returns {void}
   */
  handleShareSubmit() {
    if (!this.selectedPlanForSharing) {
      this.showToast('Please select a meal plan to share first.', 'error');
      return;
    }

    const form = document.getElementById('sharePlanForm');
    const formData = new FormData(form);
    
    const shareOptions = {
      title: document.getElementById('sharePlanTitle').value,
      description: document.getElementById('sharePlanDescription').value,
      difficulty: document.getElementById('sharePlanDifficulty').value,
      prepTime: document.getElementById('sharePlanPrepTime').value,
      servings: document.getElementById('sharePlanServings').value,
      tags: document.getElementById('sharePlanTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    try {
      const sharedPlan = this.communityManager.shareMealPlan(this.selectedPlanForSharing, shareOptions);
      this.showToast(`"${shareOptions.title}" has been shared with the community!`);
      this.switchView('my-shared');
      this.updateCommunityStats();
    } catch (error) {
      this.showToast('Error sharing plan: ' + error.message, 'error');
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, info)
   * @returns {void}
   */
  showToast(message, type = 'success') {
    // This should integrate with the main app's toast system
    // For now, we'll use console.log and alert for important messages
    console.log(`Toast (${type}): ${message}`);
    
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      // Create a simple toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }

  /**
   * Set current user for community features
   * @param {Object} user - User object from authentication
   * @returns {void}
   */
  setCurrentUser(user) {
    this.communityManager.setCurrentUser(user);
  }
}

// Export for use in other modules
export { CommunityUI };
export default CommunityUI;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
  window.CommunityUI = CommunityUI;
}
