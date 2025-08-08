// UI management and rendering functions
import { searchRecipe, dislikeMealByName, giveMealFeedbackByName } from './mealActions.js';
import { uiStateManager } from './uiStateManager.js';

export function showTab(tab) {
  // Use the enhanced state manager for better tab handling
  if (uiStateManager) {
    uiStateManager.showTab(tab);
  } else {
    // Fallback to simple implementation
    document.querySelectorAll('.tab-content').forEach(div => {
      div.style.display = 'none';
      div.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetContent = document.getElementById(tab);
    const targetButton = document.getElementById(tab + '-btn');
    
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
    }
    if (targetButton) {
      targetButton.classList.add('active');
    }
  }
}

/**
 * Renders a meal plan with recipe cards
 * @param {Array} plan - The weekly meal plan
 * @param {Array} pinnedMeals - Currently pinned meals
 */
export function renderPlan(plan, pinnedMeals) {
  const calendarContainer = document.getElementById('calendar-container');
  if (!calendarContainer || !plan) return;

  console.log('renderPlan called with plan:', plan);
  console.log('pinnedMeals:', pinnedMeals);

  // Clear existing content
  calendarContainer.innerHTML = '';

  // Create calendar grid
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid';
  
  plan.forEach((day, index) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    
    // Show full day names starting from Monday
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    dayNumber.textContent = dayNames[index] || `Day ${index + 1}`;
    
    const mealsContainer = document.createElement('div');
    mealsContainer.className = 'meals-container';
    
    day.meals.forEach(meal => {
      // Convert meal string to recipe object if needed
      const recipeObj = typeof meal === 'string' ? convertMealStringToRecipe(meal) : meal;
      const recipeCard = createRecipeCard(recipeObj, pinnedMeals);
      mealsContainer.appendChild(recipeCard);
    });
    
    dayColumn.appendChild(dayNumber);
    dayColumn.appendChild(mealsContainer);
    calendarGrid.appendChild(dayColumn);
  });
  
  calendarContainer.appendChild(calendarGrid);
}

/**
 * Converts a meal string to a recipe object
 * @param {string} mealString - Simple meal name
 * @returns {Object} Recipe object with required properties
 */
function convertMealStringToRecipe(mealString) {
  // Extract ingredients from meal name using simple parsing
  const ingredients = extractIngredientsFromMealName(mealString);
  
  // Determine if vegetarian based on ingredients
  const isVegetarian = !meatKeywords.some(meat => 
    mealString.toLowerCase().includes(meat.toLowerCase())
  );
  
  // Determine difficulty based on complexity
  const difficulty = ingredients.length <= 3 ? 'easy' : 
                    ingredients.length <= 5 ? 'medium' : 'hard';
  
  const recipe = {
    name: mealString,
    ingredients: ingredients,
    isVegetarian: isVegetarian,
    difficulty: difficulty,
    cookTime: estimateCookTime(mealString),
    servings: 4 // default servings
  };
  
  console.log(`Converted meal "${mealString}" to recipe:`, recipe);
  return recipe;
}

/**
 * Extract ingredients from meal name using simple parsing
 * @param {string} mealName - Name of the meal
 * @returns {Array} Array of ingredient strings
 */
function extractIngredientsFromMealName(mealName) {
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey',
    'rice', 'pasta', 'noodles', 'bread', 'quinoa', 'potatoes',
    'vegetables', 'broccoli', 'carrots', 'spinach', 'lettuce', 'tomatoes',
    'cheese', 'eggs', 'beans', 'lentils', 'tofu',
    'onions', 'garlic', 'peppers', 'mushrooms', 'corn',
    'olive oil', 'butter', 'salt', 'pepper'
  ];
  
  const mealLower = mealName.toLowerCase();
  const foundIngredients = [];
  
  // Find ingredients mentioned in the meal name
  commonIngredients.forEach(ingredient => {
    if (mealLower.includes(ingredient)) {
      foundIngredients.push(ingredient.charAt(0).toUpperCase() + ingredient.slice(1));
    }
  });
  
  // If no specific ingredients found, create generic ones based on meal type
  if (foundIngredients.length === 0) {
    if (mealLower.includes('stir') || mealLower.includes('fry')) {
      foundIngredients.push('Vegetables', 'Oil', 'Seasonings');
    } else if (mealLower.includes('soup') || mealLower.includes('stew')) {
      foundIngredients.push('Broth', 'Vegetables', 'Seasonings');
    } else if (mealLower.includes('salad')) {
      foundIngredients.push('Lettuce', 'Vegetables', 'Dressing');
    } else {
      foundIngredients.push('Main ingredient', 'Side ingredients', 'Seasonings');
    }
  }
  
  return foundIngredients;
}

/**
 * Estimate cooking time based on meal complexity
 * @param {string} mealName - Name of the meal
 * @returns {number} Estimated cooking time in minutes
 */
function estimateCookTime(mealName) {
  const mealLower = mealName.toLowerCase();
  
  if (mealLower.includes('salad') || mealLower.includes('sandwich')) {
    return 15;
  } else if (mealLower.includes('pasta') || mealLower.includes('stir')) {
    return 25;
  } else if (mealLower.includes('grilled') || mealLower.includes('baked')) {
    return 35;
  } else if (mealLower.includes('stew') || mealLower.includes('roast')) {
    return 60;
  } else {
    return 30; // default
  }
}

// Keywords for detecting meat products
const meatKeywords = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish', 
  'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'bacon', 'ham'
];

/**
 * Creates a recipe card element for display
 * @param {Object} recipe - Recipe data
 * @param {Array} pinnedMeals - Array of pinned meals
 * @returns {HTMLElement} Recipe card element
 */
function createRecipeCard(recipe, pinnedMeals) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  
  // Create header with name and badges
  const header = document.createElement('div');
  header.className = 'recipe-header';
  
  const name = document.createElement('h4');
  name.className = 'recipe-name';
  name.textContent = recipe.name;
  
  const badges = document.createElement('div');
  badges.className = 'recipe-badges';
  
  if (recipe.isVegetarian) {
    const badge = document.createElement('span');
    badge.className = 'recipe-badge vegetarian-badge';
    badge.textContent = 'Vegan';
    badges.appendChild(badge);
  }
  
  if (recipe.difficulty === 'easy') {
    const badge = document.createElement('span');
    badge.className = 'recipe-badge easy-badge';
    badge.textContent = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    badges.appendChild(badge);
  }
  
  header.appendChild(name);
  header.appendChild(badges);
  
  // Create details section
  const details = document.createElement('div');
  details.className = 'recipe-details';
  
  const timeDetail = document.createElement('div');
  timeDetail.className = 'recipe-detail-item';
  timeDetail.innerHTML = `<span class="emoji">⏱️</span> ${recipe.cookTime || recipe.prepTime || 30} min`;
  
  details.appendChild(timeDetail);
  
  // Create ingredients section
  const ingredientsSection = document.createElement('div');
  ingredientsSection.className = 'recipe-ingredients';
  
  const ingredientsTitle = document.createElement('h4');
  ingredientsTitle.textContent = 'Ingredients:';
  
  const ingredientList = document.createElement('div');
  ingredientList.className = 'ingredient-list';
  
  recipe.ingredients.forEach(ingredient => {
    const tag = document.createElement('div');
    tag.className = 'ingredient-tag';
    tag.textContent = ingredient;
    ingredientList.appendChild(tag);
  });
  
  ingredientsSection.appendChild(ingredientsTitle);
  ingredientsSection.appendChild(ingredientList);
  
  // Create actions section
  const actions = document.createElement('div');
  actions.className = 'recipe-actions';
  
  // Rating section
  const ratingSection = document.createElement('div');
  ratingSection.className = 'recipe-rating';
  
  const ratingLabel = document.createElement('span');
  ratingLabel.className = 'rating-label';
  ratingLabel.textContent = 'Rate: ';
  
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  starsContainer.setAttribute('role', 'radiogroup');
  starsContainer.setAttribute('aria-label', 'Rate this meal from 1 to 5 stars');
  
  // Get current rating from localStorage
  const mealRatings = JSON.parse(localStorage.getItem('mealRatings') || '{}');
  const currentRating = mealRatings[recipe.name] || 0;
  
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('button');
    star.className = `star-btn ${i <= currentRating ? 'active' : ''}`;
    star.innerHTML = '⭐';
    star.setAttribute('data-rating', i);
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', i <= currentRating ? 'true' : 'false');
    star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    star.onclick = (e) => {
      e.stopPropagation();
      rateMeal(recipe.name, i, starsContainer);
    };
    starsContainer.appendChild(star);
  }
  
  ratingSection.appendChild(ratingLabel);
  ratingSection.appendChild(starsContainer);
  
  // Action buttons section
  const actionButtons = document.createElement('div');
  actionButtons.className = 'recipe-action-buttons';
  
  // Like button
  const likeBtn = document.createElement('button');
  likeBtn.className = 'recipe-action-btn like-btn';
  likeBtn.innerHTML = '❤️';
  likeBtn.setAttribute('aria-label', 'Like this meal');
  likeBtn.onclick = () => {
    // Get current meal name from the DOM
    const currentMealName = card.querySelector('.recipe-name').textContent.trim();
    handleLike({ name: currentMealName });
  };
  
  // Dislike button
  const dislikeBtn = document.createElement('button');
  dislikeBtn.className = 'recipe-action-btn dislike-btn';
  dislikeBtn.innerHTML = '👎';
  dislikeBtn.setAttribute('aria-label', 'Dislike this meal');
  dislikeBtn.onclick = () => {
    // Get current meal name from the DOM
    const currentMealName = card.querySelector('.recipe-name').textContent.trim();
    handleDislike({ name: currentMealName });
  };
  
  // Pin button
  const pinBtn = document.createElement('button');
  pinBtn.className = 'recipe-action-btn pin-btn';
  const isPinned = pinnedMeals && pinnedMeals.some(meal => meal.name === recipe.name);
  pinBtn.innerHTML = isPinned ? '📌' : '📍';
  pinBtn.setAttribute('aria-label', isPinned ? 'Unpin this meal' : 'Pin this meal');
  pinBtn.onclick = () => {
    const currentMealName = card.querySelector('.recipe-name').textContent.trim();
    handlePinToggle({ name: currentMealName }, pinBtn);
  };
  
  actionButtons.appendChild(likeBtn);
  actionButtons.appendChild(dislikeBtn);
  actionButtons.appendChild(pinBtn);
  
  actions.appendChild(ratingSection);
  actions.appendChild(actionButtons);
  
  // Assemble card
  card.appendChild(header);
  card.appendChild(details);
  card.appendChild(ingredientsSection);
  card.appendChild(actions);
  
  return card;
}

export function renderAIPreferences(preferences) {
  const aiPreferencesText = document.getElementById('aiPreferencesText');
  if (aiPreferencesText && preferences) {
    aiPreferencesText.value = preferences;
  }
}

export function showMLStatusIndicator(isEnhanced) {
  // Create or update ML status indicator
  let statusIndicator = document.getElementById('ml-status-indicator');
  
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'ml-status-indicator';
    statusIndicator.className = 'ml-status';
    
    const header = document.querySelector('.app-header .user-nav');
    if (header) {
      header.insertBefore(statusIndicator, header.firstChild);
    }
  }
  
  statusIndicator.className = `ml-status ${isEnhanced ? 'enabled' : 'disabled'}`;
  statusIndicator.innerHTML = `
    <span class="ml-status-icon">${isEnhanced ? '🧠' : '⚡'}</span>
    <span>${isEnhanced ? 'ML Enhanced' : 'Basic Mode'}</span>
  `;
}

/**
 * Displays an initialization error message to the user
 * @param {string} message - The error message to display
 */
export const showInitializationError = (message = '无法初始化应用。请检查您的网络连接并重试。') => {
  // Create error element if it doesn't exist
  let errorDiv = document.getElementById('initialization-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'initialization-error';
    errorDiv.className = 'error-message';
    document.body.appendChild(errorDiv);
  }
  
  // Update and display error message
  errorDiv.textContent = message;
  errorDiv.style.opacity = '1';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.opacity = '0';
  }, 5000);
};

// Meal Rating and Management Functions

/**
 * Rate a meal and update the UI
 * @param {string} mealName - Name of the meal to rate
 * @param {number} rating - Rating from 1 to 5
 * @param {HTMLElement} starsContainer - Container with star buttons
 */
function rateMeal(mealName, rating, starsContainer) {
  console.log(`Rating meal "${mealName}" with ${rating} stars`);
  
  // Save rating to localStorage
  const mealRatings = JSON.parse(localStorage.getItem('mealRatings') || '{}');
  mealRatings[mealName] = rating;
  localStorage.setItem('mealRatings', JSON.stringify(mealRatings));
  
  // Update star display
  const stars = starsContainer.querySelectorAll('.star-btn');
  stars.forEach((star, index) => {
    const isActive = (index + 1) <= rating;
    star.classList.toggle('active', isActive);
    star.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
  
  // Save to meal history for analytics
  saveMealToHistory(mealName, 'rated', { rating });
  
  // Show feedback
  showToast(`⭐ Rated "${mealName}" ${rating} star${rating > 1 ? 's' : ''}!`);
  
  // Update AI learning if available
  if (window.mealPlanningAI && typeof window.mealPlanningAI.recordMealRating === 'function') {
    window.mealPlanningAI.recordMealRating(mealName, rating);
  }
}

/**
 * Handle pin/unpin toggle for meals
 * @param {Object} meal - Meal object
 * @param {HTMLElement} pinBtn - Pin button element
 */
function handlePinToggle(meal, pinBtn) {
  const pinnedMeals = JSON.parse(localStorage.getItem('pinnedMeals') || '[]');
  const mealIndex = pinnedMeals.findIndex(pinned => pinned.name === meal.name);
  
  if (mealIndex > -1) {
    // Unpin meal
    pinnedMeals.splice(mealIndex, 1);
    pinBtn.innerHTML = '📍';
    pinBtn.setAttribute('aria-label', 'Pin this meal');
    showToast(`📍 Unpinned "${meal.name}"`);
    saveMealToHistory(meal.name, 'unpinned');
  } else {
    // Pin meal
    pinnedMeals.push(meal);
    pinBtn.innerHTML = '📌';
    pinBtn.setAttribute('aria-label', 'Unpin this meal');
    showToast(`📌 Pinned "${meal.name}"`);
    saveMealToHistory(meal.name, 'pinned');
  }
  
  localStorage.setItem('pinnedMeals', JSON.stringify(pinnedMeals));
}

/**
 * Save meal action to history for analytics
 * @param {string} mealName - Name of the meal
 * @param {string} action - Action performed (rated, pinned, unpinned, liked, disliked)
 * @param {Object} metadata - Additional data (e.g., rating value)
 */
function saveMealToHistory(mealName, action, metadata = {}) {
  const mealHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  
  const historyEntry = {
    mealName,
    action,
    timestamp: new Date().toISOString(),
    date: new Date().toDateString(),
    ...metadata
  };
  
  mealHistory.unshift(historyEntry); // Add to beginning
  
  // Keep only last 100 entries
  if (mealHistory.length > 100) {
    mealHistory.splice(100);
  }
  
  localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
}

/**
 * Display meal history visualization
 */
export function displayMealHistory() {
  const historyChart = document.getElementById('mealHistoryChart');
  const recentMealsList = document.getElementById('recentMealsList');
  
  if (!historyChart || !recentMealsList) return;
  
  const mealHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  const mealRatings = JSON.parse(localStorage.getItem('mealRatings') || '{}');
  
  // Show chart container
  historyChart.style.display = 'block';
  
  // Create simple analytics
  const analytics = analyzeMealHistory(mealHistory, mealRatings);
  
  // Display chart (simple bar chart with CSS)
  historyChart.innerHTML = `
    <div class="analytics-summary">
      <h6>📊 Your Meal Analytics</h6>
      <div class="analytics-grid">
        <div class="analytics-item">
          <span class="analytics-number">${analytics.totalMeals}</span>
          <span class="analytics-label">Total Meals</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${analytics.averageRating.toFixed(1)}</span>
          <span class="analytics-label">Avg Rating</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${analytics.favoriteType}</span>
          <span class="analytics-label">Favorite Cuisine</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${analytics.pinnedCount}</span>
          <span class="analytics-label">Pinned Meals</span>
        </div>
      </div>
    </div>
    
    <div class="rating-distribution">
      <h6>⭐ Rating Distribution</h6>
      <div class="rating-bars">
        ${[5, 4, 3, 2, 1].map(rating => `
          <div class="rating-bar-container">
            <span class="rating-label">${rating}★</span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: ${(analytics.ratingDistribution[rating] || 0) * 10}%"></div>
            </div>
            <span class="rating-count">${analytics.ratingDistribution[rating] || 0}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Display recent meals
  const recentMeals = mealHistory.slice(0, 10);
  recentMealsList.innerHTML = recentMeals.map(entry => `
    <div class="recent-meal-item">
      <div class="recent-meal-info">
        <span class="recent-meal-name">${entry.mealName}</span>
        <span class="recent-meal-action ${entry.action}">${getActionIcon(entry.action)} ${entry.action}</span>
      </div>
      <div class="recent-meal-meta">
        <span class="recent-meal-date">${new Date(entry.timestamp).toLocaleDateString()}</span>
        ${entry.rating ? `<span class="recent-meal-rating">${'⭐'.repeat(entry.rating)}</span>` : ''}
      </div>
    </div>
  `).join('') || '<p class="no-history">No meal history yet. Start by rating some meals!</p>';
}

/**
 * Analyze meal history data
 * @param {Array} history - Meal history array
 * @param {Object} ratings - Meal ratings object
 * @returns {Object} Analytics data
 */
function analyzeMealHistory(history, ratings) {
  const ratedMeals = Object.keys(ratings);
  const totalRatings = ratedMeals.length;
  const averageRating = totalRatings > 0 
    ? Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / totalRatings 
    : 0;
    
  const ratingDistribution = {};
  Object.values(ratings).forEach(rating => {
    ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
  });
  
  const pinnedCount = history.filter(entry => entry.action === 'pinned').length;
  
  // Simple favorite type analysis (could be enhanced with actual cuisine data)
  const mealNames = ratedMeals.filter(name => ratings[name] >= 4);
  const favoriteType = mealNames.length > 0 ? 'Mixed' : 'None';
  
  return {
    totalMeals: ratedMeals.length,
    averageRating,
    ratingDistribution,
    pinnedCount,
    favoriteType
  };
}

/**
 * Get icon for meal action
 * @param {string} action - Action type
 * @returns {string} Emoji icon
 */
function getActionIcon(action) {
  const icons = {
    rated: '⭐',
    pinned: '📌',
    unpinned: '📍',
    liked: '❤️',
    disliked: '👎'
  };
  return icons[action] || '📝';
}

/**
 * Clear meal history
 */
export function clearMealHistory() {
  if (confirm('Are you sure you want to clear all meal history? This action cannot be undone.')) {
    localStorage.removeItem('mealHistory');
    localStorage.removeItem('mealRatings');
    showToast('🗑️ Meal history cleared');
    
    // Refresh display
    const historyChart = document.getElementById('mealHistoryChart');
    const recentMealsList = document.getElementById('recentMealsList');
    
    if (historyChart) historyChart.style.display = 'none';
    if (recentMealsList) recentMealsList.innerHTML = '<p class="no-history">No meal history yet. Start by rating some meals!</p>';
  }
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showToast(message, type = 'success') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Handles liking a recipe
 * @param {Object} recipe - Recipe to like
 */
async function handleLike(recipe) {
  try {
    await giveMealFeedbackByName(recipe.name, 'like');
    console.log(`Provided positive feedback for: ${recipe.name}`);
  } catch (error) {
    console.error('Error handling like:', error);
  }
}

/**
 * Handles disliking a recipe
 * @param {Object} recipe - Recipe to dislike
 */
async function handleDislike(recipe) {
  try {
    await dislikeMealByName(recipe.name);
  } catch (error) {
    console.error('Error handling dislike:', error);
  }
}
