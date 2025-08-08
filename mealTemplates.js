// Meal templates and generation logic

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
window.popularMealTemplates = popularMealTemplates;

// Calculate how many meals should include user foods based on quantity
function calculateUserFoodMealCount(userFoodCount, totalMeals) {
  if (userFoodCount === 0) return 0;
  // At least 1 meal, up to 50% of meals should include user foods
  const minMeals = 1;
  const maxMeals = Math.ceil(totalMeals * 0.5);
  const calculatedMeals = Math.min(Math.max(Math.ceil(userFoodCount / 3), minMeals), maxMeals);
  return calculatedMeals;
}
window.calculateUserFoodMealCount = calculateUserFoodMealCount;

// Helper function to safely get a single food item
function getSingleFood(foodArray) {
  if (!Array.isArray(foodArray) || foodArray.length === 0) {
    return null;
  }
  
  const selectedFood = foodArray[Math.floor(Math.random() * foodArray.length)];
  
  // Ensure we return a string, not an array or object
  if (typeof selectedFood === 'string') {
    return selectedFood.trim();
  } else if (Array.isArray(selectedFood)) {
    return selectedFood[0] ? selectedFood[0].toString().trim() : null;
  } else {
    return selectedFood ? selectedFood.toString().trim() : null;
  }
}

// Generate a meal using either ONLY user foods or ONLY popular foods
function generateMealFromSource(template, foodSource, dislikedMeals = [], attempts = 0) {
  if (attempts > 20) return null;
  
  let meal = template.template;
  const { meats, carbs, veggies, other } = foodSource;
  
  // Validate that we have arrays
  if (!Array.isArray(meats) || !Array.isArray(carbs) || !Array.isArray(veggies) || !Array.isArray(other)) {
    console.error('Invalid food source structure:', foodSource);
    return null;
  }
  
  // Select one meat
  if (template.needsMeat) {
    const selectedMeat = getSingleFood(meats);
    if (selectedMeat) {
      meal = meal.replace('{meat}', selectedMeat);
    } else {
      // Fallback to any available food from this source
      const allFoods = [...meats, ...carbs, ...veggies, ...other];
      const selectedFood = getSingleFood(allFoods);
      if (selectedFood) {
        meal = meal.replace('{meat}', selectedFood);
      } else {
        return null; // No foods available
      }
    }
  }
  
  // Select one carb
  if (template.needsCarb) {
    const selectedCarb = getSingleFood(carbs);
    if (selectedCarb) {
      meal = meal.replace('{carb}', selectedCarb);
    } else {
      // Fallback to any available food from this source
      const allFoods = [...meats, ...carbs, ...veggies, ...other];
      const selectedFood = getSingleFood(allFoods);
      if (selectedFood) {
        meal = meal.replace('{carb}', selectedFood);
      } else {
        return null; // No foods available
      }
    }
  }
  
  // Select veggies (1 or 2 based on template)
  if (template.needsVeggie > 0) {
    if (template.needsVeggie === 1) {
      const selectedVeggie = getSingleFood(veggies);
      if (selectedVeggie) {
        meal = meal.replace('{veggie}', selectedVeggie);
      } else {
        // Fallback to any available food from this source
        const allFoods = [...meats, ...carbs, ...veggies, ...other];
        const selectedFood = getSingleFood(allFoods);
        if (selectedFood) {
          meal = meal.replace('{veggie}', selectedFood);
        } else {
          return null; // No foods available
        }
      }
    } else if (template.needsVeggie === 2) {
      if (veggies.length >= 2) {
        const veggie1 = getSingleFood(veggies);
        let veggie2 = getSingleFood(veggies);
        
        // Ensure different veggies if possible
        let attempts = 0;
        while (veggie2 === veggie1 && veggies.length > 1 && attempts < 10) {
          veggie2 = getSingleFood(veggies);
          attempts++;
        }
        
        if (veggie1 && veggie2) {
          meal = meal.replace('{veggie}', veggie1).replace('{veggie2}', veggie2);
        } else {
          return null;
        }
      } else if (veggies.length === 1) {
        const selectedVeggie = getSingleFood(veggies);
        if (selectedVeggie) {
          meal = meal.replace('{veggie}', selectedVeggie).replace('{veggie2}', selectedVeggie);
        } else {
          return null;
        }
      } else {
        // Fallback to any available food from this source
        const allFoods = [...meats, ...carbs, ...veggies, ...other];
        const selectedFood = getSingleFood(allFoods);
        if (selectedFood) {
          meal = meal.replace('{veggie}', selectedFood).replace('{veggie2}', selectedFood);
        } else {
          return null;
        }
      }
    }
  }
  
  // Clean up any remaining placeholders
  meal = meal.replace(/\{meat\}/g, '').replace(/\{carb\}/g, '').replace(/\{veggie\}/g, '').replace(/\{veggie2\}/g, '');
  
  // Clean up extra spaces and formatting
  meal = meal.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();
  
  // Remove any double spaces or weird formatting
  meal = meal.replace(/\s+/g, ' ').trim();
  
  // Validate the final meal doesn't contain weird artifacts
  if (meal.includes('undefined') || meal.includes('[object') || meal.length > 200) {
    console.error('Generated invalid meal:', meal);
    return generateMealFromSource(template, foodSource, dislikedMeals, attempts + 1);
  }
  
  // Check if this meal is disliked
  if (dislikedMeals.includes(meal)) {
    return generateMealFromSource(template, foodSource, dislikedMeals, attempts + 1);
  }
  
  return meal;
}
window.generateMealFromSource = generateMealFromSource;

export { generateMealFromSource, popularMealTemplates, calculateUserFoodMealCount };
