/**
 * Shopping List Generator Module
 * Generates smart shopping lists from meal plans with ingredient consolidation,
 * quantity estimation, and categorization.
 */

/**
 * Main class for generating shopping lists from meal plans
 */
export class ShoppingListGenerator {
  constructor() {
    this.ingredientCategories = {
      'Proteins': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'tofu', 'beans', 'lentils', 'eggs'],
      'Vegetables': ['broccoli', 'carrots', 'spinach', 'lettuce', 'tomatoes', 'onions', 'garlic', 'peppers', 'mushrooms', 'corn', 'potatoes'],
      'Grains & Carbs': ['rice', 'pasta', 'bread', 'quinoa', 'noodles', 'flour', 'oats'],
      'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
      'Pantry': ['olive oil', 'salt', 'pepper', 'sugar', 'spices', 'herbs', 'vinegar', 'soy sauce'],
      'Fruits': ['apples', 'bananas', 'berries', 'lemon', 'lime', 'oranges'],
      'Frozen': ['frozen vegetables', 'frozen fruits', 'ice cream'],
      'Beverages': ['water', 'juice', 'coffee', 'tea']
    };

    this.servingAdjustments = {
      '1-2 people': 0.5,
      '3-4 people': 1.0,
      '5-6 people': 1.5,
      '7+ people': 2.0
    };
  }

  /**
   * Generate shopping list from meal plan
   * @param {Array} mealPlan - Weekly meal plan
   * @param {Object} options - Options for list generation
   * @returns {Object} Organized shopping list
   */
  generateShoppingList(mealPlan, options = {}) {
    console.log('🛒 Generating shopping list from meal plan...');
    
    const {
      servingSize = '3-4 people',
      includePantryItems = false,
      excludeOwned = true,
      smartConsolidation = true
    } = options;

    try {
      // Extract all ingredients from meal plan
      const allIngredients = this.extractIngredientsFromPlan(mealPlan);
      
      // Consolidate duplicate ingredients
      const consolidatedIngredients = smartConsolidation 
        ? this.consolidateIngredients(allIngredients)
        : allIngredients;
      
      // Adjust quantities based on serving size
      const adjustedIngredients = this.adjustQuantities(consolidatedIngredients, servingSize);
      
      // Filter out pantry items if requested
      const filteredIngredients = includePantryItems 
        ? adjustedIngredients 
        : this.filterPantryItems(adjustedIngredients);
      
      // Remove owned items if user has specified them
      const finalIngredients = excludeOwned 
        ? this.excludeOwnedItems(filteredIngredients)
        : filteredIngredients;
      
      // Categorize ingredients for better shopping organization
      const categorizedList = this.categorizeIngredients(finalIngredients);
      
      // Generate shopping tips and recommendations
      const shoppingTips = this.generateShoppingTips(categorizedList, mealPlan);
      
      const shoppingList = {
        generated: new Date().toISOString(),
        totalItems: finalIngredients.length,
        estimatedCost: this.estimateCost(finalIngredients),
        categories: categorizedList,
        tips: shoppingTips,
        metadata: {
          servingSize,
          includePantryItems,
          smartConsolidation,
          mealsIncluded: mealPlan.length
        }
      };

      // Save to localStorage for persistence
      localStorage.setItem('currentShoppingList', JSON.stringify(shoppingList));
      
      console.log('✅ Shopping list generated successfully:', shoppingList);
      return shoppingList;
      
    } catch (error) {
      console.error('❌ Error generating shopping list:', error);
      throw new Error('Failed to generate shopping list');
    }
  }

  /**
   * Extract ingredients from meal plan
   * @param {Array} mealPlan - Weekly meal plan
   * @returns {Array} List of ingredients with meal sources
   */
  extractIngredientsFromPlan(mealPlan) {
    const ingredients = [];
    
    mealPlan.forEach((day, dayIndex) => {
      day.meals.forEach((meal, mealIndex) => {
        const mealName = typeof meal === 'string' ? meal : meal.name;
        const mealIngredients = typeof meal === 'string' 
          ? this.extractIngredientsFromMealName(mealName)
          : meal.ingredients || this.extractIngredientsFromMealName(mealName);
        
        mealIngredients.forEach(ingredient => {
          ingredients.push({
            name: ingredient,
            source: mealName,
            day: dayIndex + 1,
            meal: mealIndex + 1,
            quantity: this.estimateQuantity(ingredient, mealName),
            unit: this.getDefaultUnit(ingredient)
          });
        });
      });
    });
    
    return ingredients;
  }

  /**
   * Consolidate duplicate ingredients
   * @param {Array} ingredients - List of ingredients
   * @returns {Array} Consolidated ingredients with combined quantities
   */
  consolidateIngredients(ingredients) {
    const consolidated = {};
    
    ingredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase();
      
      if (consolidated[key]) {
        // Combine quantities
        consolidated[key].quantity += ingredient.quantity;
        consolidated[key].sources.push(ingredient.source);
        consolidated[key].usedIn += `, ${ingredient.source}`;
      } else {
        consolidated[key] = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          sources: [ingredient.source],
          usedIn: ingredient.source
        };
      }
    });
    
    return Object.values(consolidated);
  }

  /**
   * Adjust quantities based on serving size
   * @param {Array} ingredients - List of ingredients
   * @param {string} servingSize - Target serving size
   * @returns {Array} Ingredients with adjusted quantities
   */
  adjustQuantities(ingredients, servingSize) {
    const multiplier = this.servingAdjustments[servingSize] || 1.0;
    
    return ingredients.map(ingredient => ({
      ...ingredient,
      quantity: Math.ceil(ingredient.quantity * multiplier),
      originalQuantity: ingredient.quantity
    }));
  }

  /**
   * Filter out common pantry items
   * @param {Array} ingredients - List of ingredients
   * @returns {Array} Filtered ingredients
   */
  filterPantryItems(ingredients) {
    const pantryItems = this.ingredientCategories['Pantry'];
    
    return ingredients.filter(ingredient => {
      const isCommonPantryItem = pantryItems.some(pantryItem => 
        ingredient.name.toLowerCase().includes(pantryItem.toLowerCase())
      );
      return !isCommonPantryItem;
    });
  }

  /**
   * Exclude user-owned items
   * @param {Array} ingredients - List of ingredients
   * @returns {Array} Filtered ingredients
   */
  excludeOwnedItems(ingredients) {
    const ownedItems = JSON.parse(localStorage.getItem('ownedIngredients') || '[]');
    const ownedNames = ownedItems.map(item => item.toLowerCase());
    
    return ingredients.filter(ingredient => 
      !ownedNames.includes(ingredient.name.toLowerCase())
    );
  }

  /**
   * Categorize ingredients for organized shopping
   * @param {Array} ingredients - List of ingredients
   * @returns {Object} Categorized ingredients
   */
  categorizeIngredients(ingredients) {
    const categorized = {};
    
    // Initialize categories
    Object.keys(this.ingredientCategories).forEach(category => {
      categorized[category] = [];
    });
    categorized['Other'] = [];
    
    ingredients.forEach(ingredient => {
      let categorized_flag = false;
      
      Object.keys(this.ingredientCategories).forEach(category => {
        if (categorized_flag) return;
        
        const categoryItems = this.ingredientCategories[category];
        const belongsToCategory = categoryItems.some(categoryItem => 
          ingredient.name.toLowerCase().includes(categoryItem.toLowerCase()) ||
          categoryItem.toLowerCase().includes(ingredient.name.toLowerCase())
        );
        
        if (belongsToCategory) {
          categorized[category].push(ingredient);
          categorized_flag = true;
        }
      });
      
      if (!categorized_flag) {
        categorized['Other'].push(ingredient);
      }
    });
    
    // Remove empty categories
    Object.keys(categorized).forEach(category => {
      if (categorized[category].length === 0) {
        delete categorized[category];
      }
    });
    
    return categorized;
  }

  /**
   * Generate helpful shopping tips
   * @param {Object} categorizedList - Categorized shopping list
   * @param {Array} mealPlan - Original meal plan
   * @returns {Array} Shopping tips and recommendations
   */
  generateShoppingTips(categorizedList, mealPlan) {
    const tips = [];
    
    // Seasonal recommendations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) { // Spring
      tips.push("🌱 Spring tip: Look for fresh asparagus, peas, and leafy greens in season!");
    } else if (currentMonth >= 5 && currentMonth <= 7) { // Summer  
      tips.push("☀️ Summer tip: Take advantage of fresh berries, tomatoes, and corn!");
    } else if (currentMonth >= 8 && currentMonth <= 10) { // Fall
      tips.push("🍂 Fall tip: Perfect time for squash, apples, and root vegetables!");
    } else { // Winter
      tips.push("❄️ Winter tip: Stock up on citrus fruits and hearty vegetables!");
    }
    
    // Budget tips
    if (categorizedList['Proteins'] && categorizedList['Proteins'].length > 3) {
      tips.push("💰 Budget tip: Buy proteins in bulk and freeze portions for later use.");
    }
    
    // Meal prep suggestions
    const totalMeals = mealPlan.reduce((total, day) => total + day.meals.length, 0);
    if (totalMeals > 10) {
      tips.push("🥘 Meal prep tip: Consider batch cooking grains and proteins to save time.");
    }
    
    // Storage tips
    if (categorizedList['Vegetables'] && categorizedList['Vegetables'].length > 5) {
      tips.push("🥬 Storage tip: Store leafy greens with a paper towel to keep them fresh longer.");
    }
    
    return tips;
  }

  /**
   * Estimate cost of shopping list
   * @param {Array} ingredients - List of ingredients
   * @returns {number} Estimated total cost
   */
  estimateCost(ingredients) {
    // Simple cost estimation based on ingredient types
    const costMap = {
      'chicken': 8, 'beef': 12, 'pork': 7, 'fish': 10, 'salmon': 15,
      'rice': 3, 'pasta': 2, 'bread': 4, 'vegetables': 2, 'fruits': 3,
      'milk': 4, 'cheese': 6, 'eggs': 3
    };
    
    let totalCost = 0;
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      let itemCost = 3; // default cost
      
      Object.keys(costMap).forEach(key => {
        if (name.includes(key)) {
          itemCost = costMap[key];
        }
      });
      
      totalCost += itemCost * (ingredient.quantity || 1) * 0.1; // Scale down
    });
    
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Extract ingredients from meal name using AI-like parsing
   * @param {string} mealName - Name of the meal
   * @returns {Array} Array of ingredient names
   */
  extractIngredientsFromMealName(mealName) {
    // This is a simplified version - in a real app, you'd use NLP or a more sophisticated approach
    const allKnownIngredients = Object.values(this.ingredientCategories).flat();
    const found = [];
    
    const mealLower = mealName.toLowerCase();
    
    allKnownIngredients.forEach(ingredient => {
      if (mealLower.includes(ingredient.toLowerCase())) {
        found.push(ingredient.charAt(0).toUpperCase() + ingredient.slice(1));
      }
    });
    
    // Add some common combinations
    if (mealLower.includes('stir fry') || mealLower.includes('stir-fry')) {
      found.push('Soy sauce', 'Garlic', 'Ginger');
    }
    
    if (mealLower.includes('pasta')) {
      found.push('Pasta sauce', 'Parmesan cheese');
    }
    
    if (mealLower.includes('salad')) {
      found.push('Salad dressing', 'Lettuce');
    }
    
    return found.length > 0 ? found : ['Main ingredients', 'Seasonings'];
  }

  /**
   * Estimate quantity needed for an ingredient
   * @param {string} ingredient - Ingredient name
   * @param {string} mealName - Meal context
   * @returns {number} Estimated quantity
   */
  estimateQuantity(ingredient, mealName) {
    const ingredientLower = ingredient.toLowerCase();
    
    // Proteins typically need more quantity
    if (this.ingredientCategories['Proteins'].some(p => ingredientLower.includes(p))) {
      return 1; // 1 portion per meal
    }
    
    // Vegetables vary
    if (this.ingredientCategories['Vegetables'].some(v => ingredientLower.includes(v))) {
      return 1; // 1 serving
    }
    
    // Pantry items are usually smaller quantities
    if (this.ingredientCategories['Pantry'].some(p => ingredientLower.includes(p))) {
      return 0.5; // Half serving for seasonings, etc.
    }
    
    return 1; // Default
  }

  /**
   * Get default unit for ingredient
   * @param {string} ingredient - Ingredient name
   * @returns {string} Default unit
   */
  getDefaultUnit(ingredient) {
    const ingredientLower = ingredient.toLowerCase();
    
    if (ingredientLower.includes('milk') || ingredientLower.includes('oil')) {
      return 'cups';
    }
    
    if (ingredientLower.includes('salt') || ingredientLower.includes('pepper') || ingredientLower.includes('spice')) {
      return 'tsp';
    }
    
    if (this.ingredientCategories['Proteins'].some(p => ingredientLower.includes(p))) {
      return 'lbs';
    }
    
    return 'items';
  }

  /**
   * Save user's owned ingredients for future exclusion
   * @param {Array} ownedItems - List of ingredients user already has
   */
  saveOwnedIngredients(ownedItems) {
    localStorage.setItem('ownedIngredients', JSON.stringify(ownedItems));
  }

  /**
   * Get saved shopping lists
   * @returns {Array} Historical shopping lists
   */
  getShoppingHistory() {
    return JSON.parse(localStorage.getItem('shoppingListHistory') || '[]');
  }

  /**
   * Save current shopping list to history
   * @param {Object} shoppingList - Shopping list to save
   */
  saveToHistory(shoppingList) {
    const history = this.getShoppingHistory();
    history.unshift({
      ...shoppingList,
      id: Date.now(),
      savedDate: new Date().toISOString()
    });
    
    // Keep only last 10 lists
    if (history.length > 10) {
      history.splice(10);
    }
    
    localStorage.setItem('shoppingListHistory', JSON.stringify(history));
  }
}

// Export singleton instance
export const shoppingListGenerator = new ShoppingListGenerator();
