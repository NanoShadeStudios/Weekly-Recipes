// Enhanced Weekly Recipe Planner with Popular Foods Database
import { db } from './firebase.js';
import { setupAuth } from './auth.js';
import { collection, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUser = null;
let foodsArr = [];
let pinnedMeals = [];
let dislikedMeals = [];
let likedMeals = [];

// Popular foods database
const popularFoods = {
  meats: [
    'Chicken Breast', 'Ground Beef', 'Salmon', 'Pork Chops', 'Turkey', 'Shrimp', 
    'Tuna', 'Cod', 'Tilapia', 'Ground Turkey', 'Bacon', 'Ham', 'Lamb', 
    'Chicken Thighs', 'Beef Steak', 'Pork Tenderloin', 'Crab', 'Lobster',
    'Chicken Wings', 'Ground Pork', 'Duck', 'Scallops', 'Mussels', 'Sardines'
  ],
  carbs: [
    'White Rice', 'Brown Rice', 'Pasta', 'Quinoa', 'Sweet Potato', 'Regular Potato',
    'Bread', 'Couscous', 'Barley', 'Oats', 'Noodles', 'Tortillas', 'Bagels',
    'Wild Rice', 'Bulgur', 'Farro', 'Polenta', 'Gnocchi', 'Risotto Rice',
    'Jasmine Rice', 'Basmati Rice', 'Whole Wheat Pasta', 'Rice Noodles'
  ],
  vegetables: [
    'Broccoli', 'Spinach', 'Bell Peppers', 'Carrots', 'Onions', 'Tomatoes',
    'Zucchini', 'Mushrooms', 'Asparagus', 'Green Beans', 'Cauliflower', 'Peas',
    'Corn', 'Brussels Sprouts', 'Cabbage', 'Kale', 'Lettuce', 'Cucumber',
    'Celery', 'Eggplant', 'Squash', 'Artichokes', 'Leeks', 'Bok Choy',
    'Snow Peas', 'Radishes', 'Beets', 'Turnips', 'Swiss Chard', 'Collard Greens'
  ],
  other: [
    'Eggs', 'Cheese', 'Yogurt', 'Milk', 'Butter', 'Olive Oil', 'Garlic',
    'Ginger', 'Herbs', 'Spices', 'Nuts', 'Seeds', 'Avocado', 'Beans',
    'Lentils', 'Chickpeas', 'Tofu', 'Tempeh', 'Coconut', 'Olives'
  ]
};

// Popular meal templates database
const popularMealTemplates = [
  // Classic combinations
  { template: 'Grilled {meat} with {carb} and {veggie}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'American' },
  { template: '{meat} Stir Fry with {veggie} and {veggie2}', needsMeat: true, needsCarb: false, needsVeggie: 2, cuisine: 'Asian' },
  { template: 'Roasted {meat} Bowl with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 0, cuisine: 'Modern' },
  { template: '{veggie} and {meat} Salad', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Mediterranean' },
  { template: '{carb} with {meat} and {veggie}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Classic' },
  { template: '{meat} Tacos with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Mexican' },
  { template: '{meat} and {veggie} Soup with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Comfort' },
  
  // International cuisines
  { template: '{meat} Curry with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 0, cuisine: 'Indian' },
  { template: '{meat} Teriyaki with {veggie} over {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Japanese' },
  { template: '{meat} Fajitas with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Mexican' },
  { template: '{meat} Pad Thai with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Thai' },
  { template: 'Mediterranean {meat} with {veggie} and {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Mediterranean' },
  { template: '{meat} Schnitzel with {carb} and {veggie}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'German' },
  { template: '{meat} Piccata with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 0, cuisine: 'Italian' },
  { template: 'Korean {meat} BBQ with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Korean' },
  
  // Cooking methods
  { template: 'Baked {meat} with Roasted {veggie} and {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Healthy' },
  { template: 'Pan-Seared {meat} with {veggie} Medley', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Gourmet' },
  { template: 'Slow Cooker {meat} with {veggie} and {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Comfort' },
  { template: 'Grilled {meat} and {veggie} Skewers with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'BBQ' },
  { template: 'Blackened {meat} with {veggie} Slaw', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Cajun' },
  { template: 'Honey Glazed {meat} with {carb} Pilaf', needsMeat: true, needsCarb: true, needsVeggie: 0, cuisine: 'Sweet' },
  
  // Pasta dishes
  { template: '{meat} Alfredo Pasta with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Italian' },
  { template: '{meat} Carbonara with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Italian' },
  { template: '{meat} Pesto Pasta with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Italian' },
  { template: '{meat} Marinara with {veggie} over Pasta', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Italian' },
  
  // Rice dishes
  { template: '{meat} Fried Rice with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Asian' },
  { template: '{meat} Risotto with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Italian' },
  { template: '{meat} Jambalaya with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Cajun' },
  { template: '{meat} Paella with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Spanish' },
  
  // Healthy options
  { template: 'Quinoa Bowl with {meat} and {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Healthy' },
  { template: 'Power Salad with {meat}, {veggie}, and {veggie2}', needsMeat: true, needsCarb: false, needsVeggie: 2, cuisine: 'Healthy' },
  { template: 'Cauliflower Rice with {meat} and {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Low-Carb' },
  { template: 'Zucchini Noodles with {meat} and {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Low-Carb' },
  
  // Comfort food
  { template: '{meat} Casserole with {veggie} and {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Comfort' },
  { template: '{meat} Pot Pie with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Comfort' },
  { template: '{meat} Shepherd\'s Pie with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Comfort' },
  { template: '{meat} Mac and Cheese with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Comfort' },
  
  // Sandwiches and wraps
  { template: '{meat} Sandwich with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Casual' },
  { template: '{meat} Wrap with {veggie} and {veggie2}', needsMeat: true, needsCarb: false, needsVeggie: 2, cuisine: 'Casual' },
  { template: '{meat} Panini with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Casual' },
  
  // Breakfast for dinner
  { template: '{meat} and {veggie} Omelet with {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Breakfast' },
  { template: '{meat} Hash with {veggie} and {carb}', needsMeat: true, needsCarb: true, needsVeggie: 1, cuisine: 'Breakfast' },
  { template: '{meat} Benedict with {veggie}', needsMeat: true, needsCarb: false, needsVeggie: 1, cuisine: 'Breakfast' }
];

function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tab + '-btn').classList.add('active');
}

function saveWeeklyPlan(foods, plan) {
  if (!currentUser) return;
  setDoc(doc(db, 'users', currentUser.uid), {
    foods,
    weeklyPlan: plan,
    pinnedMeals: pinnedMeals,
    dislikedMeals: dislikedMeals,
    likedMeals: likedMeals
  }, { merge: true });
  // Fix: Don't use arrayUnion with nested arrays, save as separate document or flatten
  updateDoc(doc(db, 'users', currentUser.uid), {
    savedPlans: arrayUnion({
      id: Date.now(),
      plan: plan.join('|'), // Flatten the array to a string
      createdAt: new Date().toISOString()
    })
  });
}

// Enhanced categorize foods function that separates user foods from popular foods
function categorizeFoods(userFoods) {
  const userMeats = [];
  const userCarbs = [];
  const userVeggies = [];
  const userOther = [];
  
  const popularMeats = [...popularFoods.meats];
  const popularCarbs = [...popularFoods.carbs];
  const popularVeggies = [...popularFoods.vegetables];
  const popularOther = [...popularFoods.other];
  
  const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb', 'shrimp', 'tuna', 'cod', 'tilapia'];
  const carbKeywords = ['rice', 'pasta', 'bread', 'potato', 'quinoa', 'noodles', 'couscous', 'barley', 'oats'];
  const veggieKeywords = ['broccoli', 'spinach', 'carrot', 'bell pepper', 'onion', 'tomato', 'cucumber', 'lettuce', 'zucchini', 'mushroom', 'asparagus', 'cauliflower', 'green beans', 'peas'];
  
  // Categorize user foods separately
  userFoods.forEach(food => {
    const lowerFood = food.toLowerCase();
    if (meatKeywords.some(keyword => lowerFood.includes(keyword))) {
      userMeats.push(food);
    } else if (carbKeywords.some(keyword => lowerFood.includes(keyword))) {
      userCarbs.push(food);
    } else if (veggieKeywords.some(keyword => lowerFood.includes(keyword))) {
      userVeggies.push(food);
    } else {
      userOther.push(food);
    }
  });
  
  return { 
    user: { meats: userMeats, carbs: userCarbs, veggies: userVeggies, other: userOther },
    popular: { meats: popularMeats, carbs: popularCarbs, veggies: popularVeggies, other: popularOther }
  };
}

// Calculate how many meals should include user foods based on quantity
function calculateUserFoodMealCount(userFoodCount, totalMeals) {
  if (userFoodCount === 0) return 0;
  // At least 1 meal, up to 50% of meals should include user foods
  const minMeals = 1;
  const maxMeals = Math.ceil(totalMeals * 0.5);
  const calculatedMeals = Math.min(Math.max(Math.ceil(userFoodCount / 3), minMeals), maxMeals);
  return calculatedMeals;
}

// Generate a meal using either ONLY user foods or ONLY popular foods
function generateMealFromSource(template, foodSource, attempts = 0) {
  if (attempts > 20) return null;
  
  let meal = template.template;
  const { meats, carbs, veggies, other } = foodSource;
  
  // Select one meat
  if (template.needsMeat) {
    if (meats.length > 0) {
      const selectedMeat = meats[Math.floor(Math.random() * meats.length)];
      meal = meal.replace('{meat}', selectedMeat);
    } else {
      // Fallback to any available food from this source
      const allFoods = [...meats, ...carbs, ...veggies, ...other];
      if (allFoods.length === 0) return null;
      const selectedFood = allFoods[Math.floor(Math.random() * allFoods.length)];
      meal = meal.replace('{meat}', selectedFood);
    }
  }
  
  // Select one carb
  if (template.needsCarb) {
    if (carbs.length > 0) {
      const selectedCarb = carbs[Math.floor(Math.random() * carbs.length)];
      meal = meal.replace('{carb}', selectedCarb);
    } else {
      // Fallback to any available food from this source
      const allFoods = [...meats, ...carbs, ...veggies, ...other];
      if (allFoods.length === 0) return null;
      const selectedFood = allFoods[Math.floor(Math.random() * allFoods.length)];
      meal = meal.replace('{carb}', selectedFood);
    }
  }
  
  // Select veggies (1 or 2 based on template)
  if (template.needsVeggie > 0) {
    if (template.needsVeggie === 1) {
      if (veggies.length > 0) {
        const selectedVeggie = veggies[Math.floor(Math.random() * veggies.length)];
        meal = meal.replace('{veggie}', selectedVeggie);
      } else {
        // Fallback to any available food from this source
        const allFoods = [...meats, ...carbs, ...veggies, ...other];
        if (allFoods.length === 0) return null;
        const selectedFood = allFoods[Math.floor(Math.random() * allFoods.length)];
        meal = meal.replace('{veggie}', selectedFood);
      }
    } else if (template.needsVeggie === 2) {
      if (veggies.length >= 2) {
        const veggie1 = veggies[Math.floor(Math.random() * veggies.length)];
        let veggie2 = veggies[Math.floor(Math.random() * veggies.length)];
        while (veggie2 === veggie1 && veggies.length > 1) {
          veggie2 = veggies[Math.floor(Math.random() * veggies.length)];
        }
        meal = meal.replace('{veggie}', veggie1).replace('{veggie2}', veggie2);
      } else if (veggies.length === 1) {
        const selectedVeggie = veggies[0];
        meal = meal.replace('{veggie}', selectedVeggie).replace('{veggie2}', selectedVeggie);
      } else {
        // Fallback to any available food from this source
        const allFoods = [...meats, ...carbs, ...veggies, ...other];
        if (allFoods.length === 0) return null;
        const selectedFood = allFoods[Math.floor(Math.random() * allFoods.length)];
        meal = meal.replace('{veggie}', selectedFood).replace('{veggie2}', selectedFood);
      }
    }
  }
  
  // Check if this meal is disliked
  if (dislikedMeals.includes(meal)) {
    return generateMealFromSource(template, foodSource, attempts + 1);
  }
  
  return meal;
}

// Google search functionality
window.searchRecipe = function(mealName) {
  const searchQuery = encodeURIComponent(mealName + ' recipe');
  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
  window.open(googleSearchUrl, '_blank');
}

// Pin/Unpin meal functionality
window.togglePinMeal = function(dayIndex) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  const pinnedIndex = pinnedMeals.findIndex(pinned => pinned.dayIndex === dayIndex);
  
  if (pinnedIndex > -1) {
    // Unpin the meal
    pinnedMeals.splice(pinnedIndex, 1);
  } else {
    // Pin the meal
    pinnedMeals.push({ dayIndex, meal: mealText });
  }
  
  // Update the UI
  updatePinButton(dayIndex);
  
  // Save to database
  if (currentUser) {
    updateDoc(doc(db, 'users', currentUser.uid), {
      pinnedMeals: pinnedMeals
    });
  }
}

// Like meal functionality
window.likeMeal = function(dayIndex) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  
  // Add to liked meals if not already there
  if (!likedMeals.includes(mealText)) {
    likedMeals.push(mealText);
    
    // Save to database
    if (currentUser) {
      updateDoc(doc(db, 'users', currentUser.uid), {
        likedMeals: likedMeals
      });
    }
    
    // Show feedback
    const msg = document.getElementById('saveMealMsg');
    msg.textContent = `Meal liked!`;
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
    
    // Update liked meals display if on that tab
    renderLikedMeals();
  }
}

// Dislike meal functionality
window.dislikeMeal = function(dayIndex) {
  const mealText = document.getElementById('mealText' + dayIndex).textContent;
  
  // Add to disliked meals if not already there
  if (!dislikedMeals.includes(mealText)) {
    dislikedMeals.push(mealText);
  }
  
  // Generate a new meal for this day
  generateSingleMeal(dayIndex);
  
  // Save to database
  if (currentUser) {
    updateDoc(doc(db, 'users', currentUser.uid), {
      dislikedMeals: dislikedMeals
    });
  }
}

// Generate a single new meal for a specific day
function generateSingleMeal(dayIndex) {
  const categorizedFoods = categorizeFoods(foodsArr);
  
  let newMeal = null;
  let attempts = 0;
  
  while (!newMeal && attempts < 20) {
    const template = popularMealTemplates[Math.floor(Math.random() * popularMealTemplates.length)];
    
    // Randomly decide whether to use user foods or popular foods
    const useUserFoods = Math.random() < 0.5 && foodsArr.length > 0;
    const foodSource = useUserFoods ? categorizedFoods.user : categorizedFoods.popular;
    
    newMeal = generateMealFromSource(template, foodSource);
    attempts++;
  }
  
  if (newMeal) {
    // Update the meal in the UI
    document.getElementById('mealText' + dayIndex).textContent = newMeal;
    
    // Update the current plan and save it
    const currentPlan = getCurrentPlan();
    currentPlan[dayIndex] = newMeal;
    saveWeeklyPlan(foodsArr, currentPlan);
  }
}

// Get current plan from the UI
function getCurrentPlan() {
  const plan = [];
  let dayIndex = 0;
  while (document.getElementById('mealText' + dayIndex)) {
    plan.push(document.getElementById('mealText' + dayIndex).textContent);
    dayIndex++;
  }
  return plan;
}

// Update pin button appearance
function updatePinButton(dayIndex) {
  const pinBtn = document.querySelector(`[onclick="togglePinMeal(${dayIndex})"]`);
  const isPinned = pinnedMeals.some(pinned => pinned.dayIndex === dayIndex);
  
  if (pinBtn) {
    pinBtn.textContent = isPinned ? '📌' : '📍';
    pinBtn.style.background = isPinned ? '#ffd700' : '#e0e7ff';
    pinBtn.title = isPinned ? 'Unpin meal' : 'Pin meal';
  }
}

window.editFood = function(idx) {
  window._editingFood = idx;
  renderFoodsList();
}

window.saveFoodEdit = function(idx) {
  const input = document.getElementById('editFoodInput' + idx);
  const newName = input.value.trim();
  if (newName) {
    foodsArr[idx] = newName;
    updateFoodsInDB();
    window._editingFood = null;
    renderFoodsList();
  }
}

window.cancelFoodEdit = function() {
  window._editingFood = null;
  renderFoodsList();
}

window.deleteFood = function(idx) {
  foodsArr.splice(idx, 1);
  updateFoodsInDB();
  renderFoodsList();
}

function updateFoodsInDB() {
  if (!currentUser) return;
  updateDoc(doc(db, 'users', currentUser.uid), {
    foods: foodsArr
  });
}

document.getElementById('addFoodForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const newFood = document.getElementById('newFood').value.trim();
  if (newFood && !foodsArr.includes(newFood)) {
    foodsArr.push(newFood);
    updateFoodsInDB();
    renderFoodsList();
    document.getElementById('newFood').value = '';
  }
});

function renderPlan(plan) {
  const calendarContainer = document.getElementById('calendar-container');
  if (!plan.length) {
    calendarContainer.innerHTML = '<p>No plan saved yet. Click "Generate Meal Plan" to create one!</p>';
    return;
  }
  
  const weeks = parseInt(document.getElementById('weeksSelect').value) || 1;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let planHtml = '';
  let dayCount = 0;
  
  for (let w = 0; w < weeks; w++) {
    planHtml += `<div class="calendar-week">`;
    planHtml += `<div class="week-header">Week ${w + 1}</div>`;
    
    // Add day headers
    planHtml += `<div class="calendar-grid">`;
    days.forEach(day => {
      planHtml += `<div class="day-header">${day}</div>`;
    });
    
    // Add calendar days
    for (let d = 0; d < 7; d++) {
      if (dayCount < plan.length) {
        const isPinned = pinnedMeals.some(pinned => pinned.dayIndex === dayCount);
        planHtml += `
          <div class="calendar-day">
            <div class="meal-content clickable" id="mealText${dayCount}" onclick="searchRecipe('${plan[dayCount].replace(/'/g, "\\'")}')" title="Click to search for recipe">${plan[dayCount]}</div>
            <div class="meal-actions">
              <button class="pin-btn" onclick="togglePinMeal(${dayCount})" title="${isPinned ? 'Unpin meal' : 'Pin meal'}" style="background: ${isPinned ? '#ffd700' : '#e0e7ff'};">${isPinned ? '📌' : '📍'}</button>
              <button class="like-btn" onclick="likeMeal(${dayCount})" title="Like meal">❤️</button>
              <button class="dislike-btn" onclick="dislikeMeal(${dayCount})" title="Dislike meal">👎</button>
            </div>
          </div>
        `;
        dayCount++;
      } else {
        planHtml += `<div class="calendar-day"><div class="meal-content">No meal planned</div></div>`;
      }
    }
    
    planHtml += `</div></div>`;
  }
  
  calendarContainer.innerHTML = planHtml;
}

function generatePlan() {
  const categorizedFoods = categorizeFoods(foodsArr);
  
  // Check if we have enough variety (even with popular foods)
  const totalUserFoods = categorizedFoods.user.meats.length + categorizedFoods.user.carbs.length + categorizedFoods.user.veggies.length + categorizedFoods.user.other.length;
  const totalPopularFoods = categorizedFoods.popular.meats.length + categorizedFoods.popular.carbs.length + categorizedFoods.popular.veggies.length + categorizedFoods.popular.other.length;
  
  if (totalUserFoods === 0 && totalPopularFoods === 0) {
    document.getElementById('calendar-container').innerHTML = '<p style="color:#e74c3c;">Unable to generate meals. Please add some foods in the "My Foods" tab.</p>';
    return;
  }
  
  let plan = [];
  const weeks = parseInt(document.getElementById('weeksSelect').value) || 1;
  const totalDays = weeks * 7;
  
  // Calculate how many meals should include user foods
  const userFoodMealCount = calculateUserFoodMealCount(foodsArr.length, totalDays);
  let userFoodMealsGenerated = 0;
  
  // Check if there's an existing plan and preserve pinned meals
  const existingPlan = getCurrentPlan();
  
  for (let i = 0; i < totalDays; i++) {
    // Check if this day has a pinned meal
    const pinnedMeal = pinnedMeals.find(pinned => pinned.dayIndex === i);
    
    if (pinnedMeal) {
      // Use the pinned meal
      plan.push(pinnedMeal.meal);
    } else {
      // Generate a new meal
      let meal = null;
      let attempts = 0;
      
      // Decide whether this meal should use user foods
      const shouldUseUserFoods = userFoodMealsGenerated < userFoodMealCount && totalUserFoods > 0;
      
      while (!meal && attempts < 20) {
        const template = popularMealTemplates[Math.floor(Math.random() * popularMealTemplates.length)];
        
        if (shouldUseUserFoods) {
          // Use ONLY user foods for this meal
          meal = generateMealFromSource(template, categorizedFoods.user);
          if (meal) {
            userFoodMealsGenerated++;
          }
        } else {
          // Use ONLY popular foods for this meal
          meal = generateMealFromSource(template, categorizedFoods.popular);
        }
        
        attempts++;
      }
      
      // Fallback if we couldn't generate a meal
      if (!meal) {
        meal = "Simple meal with available ingredients";
      }
      
      plan.push(meal);
    }
  }
  
  renderPlan(plan);
  saveWeeklyPlan(foodsArr, plan);
}

// Add event listener for weeks select change
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('generateMealBtn').addEventListener('click', generatePlan);
  document.getElementById('weeklyPlan-btn').addEventListener('click', () => showTab('weeklyPlan'));
  document.getElementById('myFoods-btn').addEventListener('click', () => showTab('myFoods'));
  document.getElementById('likedMeals-btn').addEventListener('click', () => showTab('likedMeals'));
  document.getElementById('preferences-btn').addEventListener('click', () => showTab('preferences'));
  
  // Add event listener for weeks select to regenerate plan when changed
  document.getElementById('weeksSelect').addEventListener('change', function() {
    if (currentUser) {
      generatePlan(); // Generate a new plan instead of just re-rendering the old one
    }
  });
});

function loadUserData() {
  if (!currentUser) return;
  getDoc(doc(db, 'users', currentUser.uid)).then(docSnap => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      foodsArr = data.foods || [];
      pinnedMeals = data.pinnedMeals || [];
      dislikedMeals = data.dislikedMeals || [];
      likedMeals = data.likedMeals || [];
      // Don't set the input field value - keep it empty for new food entry
      renderPlan(data.weeklyPlan || []);
      renderFoodsList();
      renderLikedMeals();
    }
  });
}

setupAuth(user => {
  currentUser = user;
  if (user) {
    loadUserData();
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('userEmail').style.display = 'inline-block';
    document.getElementById('signOutBtn').style.display = 'inline-block';
  } else {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('userEmail').style.display = 'none';
    document.getElementById('signOutBtn').style.display = 'none';
  }
});

// Modal close logic
document.getElementById('closeModal').onclick = function() {
  document.getElementById('loginModal').style.display = 'none';
};
window.onclick = function(event) {
  if (event.target == document.getElementById('loginModal')) {
    document.getElementById('loginModal').style.display = 'none';
  }
};
window.loadUserData = loadUserData;
window.renderPlan = renderPlan;

function renderFoodsList() {
  const foodsList = document.getElementById('foodsList');
  foodsList.innerHTML = '';
  foodsArr.forEach((food, idx) => {
    const li = document.createElement('li');
    if (window._editingFood === idx) {
      li.innerHTML = `<input type='text' id='editFoodInput${idx}' value='${food}' style='width:120px; margin-right:8px;'>`
        + `<button onclick='saveFoodEdit(${idx})' style='background:#4f8cff;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-right:4px;'>Save</button>`
        + `<button onclick='cancelFoodEdit()' style='background:#e0e7ff;color:#333;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;'>Cancel</button>`;
    } else {
      li.innerHTML = `${food} <button onclick="editFood(${idx})" style='background:#4f8cff;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-left:4px;'>Edit</button> <button onclick="deleteFood(${idx})" style='background:#e74c3c;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:0.9rem;cursor:pointer;margin-left:4px;'>Delete</button>`;
    }
    foodsList.appendChild(li);
  });
}

function renderLikedMeals() {
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

window.removeLikedMeal = function(idx) {
  likedMeals.splice(idx, 1);
  if (currentUser) {
    updateDoc(doc(db, 'users', currentUser.uid), {
      likedMeals: likedMeals
    });
  }
  renderLikedMeals();
}