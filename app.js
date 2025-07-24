// No import needed; use global auth and db

// Main application file - coordinates all modules
document.addEventListener('DOMContentLoaded', async () => {
  // Verify Firebase auth is available before proceeding
  let firebaseAuthChecked = false;

  const verifyFirebaseAuth = () => {
    return new Promise((resolve, reject) => {
      if (window.auth) {
        firebaseAuthChecked = true;
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (window.auth) {
            clearInterval(checkInterval);
            firebaseAuthChecked = true;
            resolve();
          }
        }, 100);

        setTimeout(() => {
          if (!firebaseAuthChecked) {
            clearInterval(checkInterval);
            reject(new Error('Firebase auth verification timed out'));
          }
        }, 10000);
      }
    });
  };

  try {
    await verifyFirebaseAuth();

    // Initialize app with loaded modules
    window.loadUserData();
    // Setup UI event listeners
    document.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => window.showTab(tab.dataset.tab));
    });

    // Ensure searchRecipe is available before using it
    if (typeof window.searchRecipe === 'function') {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          window.searchRecipe(e.target.value);
        });
      }
    }
  } catch (error) {
    console.error('Application initialization failed:', error);
    document.getElementById('loading-error')?.removeAttribute('hidden');
  }
});

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
