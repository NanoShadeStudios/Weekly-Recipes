// UI management and rendering functions
import { searchRecipe } from './mealActions.js';
import { updateLikedMealsInDB } from './dataManager.js';

export function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tab + '-btn').classList.add('active');
}

/**
 * Renders a meal plan with recipe cards
 * @param {Array} plan - The weekly meal plan
 * @param {Array} pinnedMeals - Currently pinned meals
 */
export function renderPlan(plan, pinnedMeals) {
  const calendarContainer = document.getElementById('calendar-container');
  if (!calendarContainer || !plan) return;

  // Clear existing content
  calendarContainer.innerHTML = '';

  // Create calendar grid
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid';
  
  plan.forEach(day => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
    
    const mealsContainer = document.createElement('div');
    mealsContainer.className = 'meals-container';
    
    day.meals.forEach(meal => {
      const recipeCard = createRecipeCard(meal, pinnedMeals);
      mealsContainer.appendChild(recipeCard);
    });
    
    dayColumn.appendChild(dayNumber);
    dayColumn.appendChild(mealsContainer);
    calendarGrid.appendChild(dayColumn);
  });
  
  calendarContainer.appendChild(calendarGrid);
}

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
  timeDetail.innerHTML = `<span class="emoji">⏱️</span> ${recipe.prepTime} min`;
  
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
  
  // Like button
  const likeBtn = document.createElement('button');
  likeBtn.className = 'recipe-action-btn like-btn';
  likeBtn.innerHTML = '❤️';
  likeBtn.onclick = () => handleLike(recipe);
  
  // Dislike button
  const dislikeBtn = document.createElement('button');
  dislikeBtn.className = 'recipe-action-btn dislike-btn';
  dislikeBtn.innerHTML = '👎';
  dislikeBtn.onclick = () => handleDislike(recipe);
  
  actions.appendChild(likeBtn);
  actions.appendChild(dislikeBtn);
  
  // Assemble card
  card.appendChild(header);
  card.appendChild(details);
  card.appendChild(ingredientsSection);
  card.appendChild(actions);
  
  return card;
}

export function renderLikedMeals(likedMeals) {
  const likedMealsList = document.getElementById('likedMealsList');
  if (!likedMealsList) return;
  
  likedMealsList.innerHTML = '';
  if (!likedMeals || likedMeals.length === 0) {
    likedMealsList.innerHTML = '<p>No liked meals yet. Click the ❤️ button on any meal to like it!</p>';
    return;
  }
  likedMeals.forEach((meal, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="liked-meal-name" onclick="searchRecipe('${meal.replace(/'/g, "\\'")}')" title="Click to search for recipe">${meal}</span>
      <button onclick="removeLikedMeal(${idx})" style='background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:0.8rem;cursor:pointer;margin-left:8px;'>Remove</button>
    `;
    likedMealsList.appendChild(li);
  });
}

export function removeLikedMeal(idx, currentUser, likedMeals, renderLikedMealsCallback) {
  likedMeals.splice(idx, 1);
  updateLikedMealsInDB(currentUser, likedMeals);
  renderLikedMealsCallback();
  return likedMeals;
}

/**
 * Handles liking a recipe
 * @param {Object} recipe - Recipe to like
 */
function handleLike(recipe) {
  window.likeMeal(recipe);
}

/**
 * Handles disliking a recipe
 * @param {Object} recipe - Recipe to dislike
 */
function handleDislike(recipe) {
  window.dislikeMeal(recipe);
}
