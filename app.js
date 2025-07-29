// Import Firebase functions using module syntax
import { getFirebaseInstance } from './firebase.js';
// Import UI functions
import { showInitializationError } from './uiManager.js';

// Initialize Firebase when the app starts
const initializeApp = async () => {
  try {
    const { auth, db } = await getFirebaseInstance();
    // Set up authentication listeners and other initialization logic
    setupAuthListeners(auth);
    setupDatabaseListeners(db);
    // Initialize other components
    initializeUI();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showInitializationError();
  }
};

// Start the application
initializeApp();

// Main application file - coordinates all modules
/**
 * Ensures text containers wrap content properly without breaking layout.
 * @param {string} selector - CSS selector of elements to apply wrapping to
 */
function optimizeTextWrapping(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.wordBreak = 'break-word';
    el.style.whiteSpace = 'pre-wrap';
  });
}

// Wrapper functions for database operations
function saveWeeklyPlanWrapper(foods, plan) {
  window.saveWeeklyPlan(window.auth.currentUser, foods, plan, pinnedMeals, dislikedMeals, likedMeals);
}

function generateSingleMealWrapper(dayIndex) {
  window.generateSingleMeal(dayIndex, window.auth.currentUser, foodsArr, dislikedMeals, saveWeeklyPlanWrapper);
}

function generatePlanWrapper() {
  window.generatePlan(window.auth.currentUser, foodsArr, pinnedMeals, dislikedMeals, likedMeals, renderPlanWrapper);
}

function renderPlanWrapper(plan) {
  window.renderPlan(plan, pinnedMeals);
}

function renderLikedMealsWrapper() {
  window.renderLikedMeals(window.auth.currentUser, likedMeals, renderLikedMealsList);
}

// Add food form submission
document.getElementById('addFoodForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const newFood = document.getElementById('newFood').value.trim();
  foodsArr = window.addFood(newFood, window.auth.currentUser, foodsArr, renderFoodsListWrapper);
});

// Add preferences save functionality
document.getElementById('savePreferencesBtn').addEventListener('click', savePreferences);

// Modal close logic
document.getElementById('closeModal').onclick = function() {
  document.getElementById('loginModal').style.display = 'none';
};
window.onclick = function(event) {
  if (event.target == document.getElementById('loginModal')) {
    document.getElementById('loginModal').style.display = 'none';
  }
};

// Tab navigation functionality
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all tabs
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked tab
    button.classList.add('active');

    // Hide all content areas
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Show corresponding content area
    const targetId = button.id.replace('-btn', '');
    document.getElementById(targetId).classList.add('active');
  });
});

// Initialize active tab
function initializeActiveTab() {
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    const targetId = activeTab.id.replace('-btn', '');
    document.getElementById(targetId).classList.add('active');
  }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeActiveTab);

// Export functions for external access
window.loadUserData = window.loadUserData;
window.renderPlan = renderPlanWrapper;

// Add event listener for Generate Meal button
document.getElementById('generateMealBtn').addEventListener('click', function() {
  if (typeof window.generatePlan === 'function') {
    // Use dummy arguments for now, or fetch from global state if available
    const user = window.auth ? window.auth.currentUser : null;
    const foods = window.foodsArr || [];
    const pinnedMeals = window.pinnedMeals || [];
    const dislikedMeals = window.dislikedMeals || [];
    const likedMeals = window.likedMeals || [];
    window.generatePlan(user, foods, pinnedMeals, dislikedMeals, likedMeals, function(plan) {
      // Render the plan in the calendar-container
      if (window.renderPlan) {
        window.renderPlan(plan, pinnedMeals);
      } else {
        // Fallback: simple rendering
        const container = document.getElementById('calendar-container');
        container.innerHTML = '<pre>' + JSON.stringify(plan, null, 2) + '</pre>';
      }
    });
  } else {
    alert('Meal generation is not available.');
  }
});

// Profile tab logic
document.getElementById('profile-btn').addEventListener('click', function() {
  // Show the profile tab
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById('profile').classList.add('active');
  // Set user email
  if (window.auth && window.auth.currentUser) {
    document.getElementById('profileEmail').textContent = window.auth.currentUser.email;
  }
});

document.getElementById('profileSignOutBtn').addEventListener('click', function() {
  if (window.auth) {
    window.auth.signOut();
    location.reload();
  }
});
