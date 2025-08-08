/**
 * Seasonal Ingredients Manager
 * Provides intelligent seasonal ingredient suggestions based on:
 * - Current month and season
 * - Regional availability
 * - Nutritional benefits
 * - Meal planning integration
 */

class SeasonalIngredientsManager {
  constructor() {
    this.currentMonth = new Date().getMonth(); // 0-11
    this.currentSeason = this.getCurrentSeason();
    this.userLocation = this.getUserLocation();
    
    // Seasonal ingredient database
    this.seasonalData = {
      spring: {
        months: [2, 3, 4], // March, April, May
        vegetables: [
          { name: 'Asparagus', peak: [3, 4], nutrition: ['folate', 'vitamin K', 'fiber'], recipes: ['grilled asparagus', 'asparagus soup'] },
          { name: 'Artichokes', peak: [3, 4], nutrition: ['fiber', 'vitamin C', 'antioxidants'], recipes: ['stuffed artichokes', 'artichoke dip'] },
          { name: 'Spring Onions', peak: [2, 3, 4], nutrition: ['vitamin C', 'sulfur compounds'], recipes: ['spring onion salad', 'stir-fry'] },
          { name: 'Lettuce', peak: [3, 4], nutrition: ['vitamin A', 'folate', 'water'], recipes: ['caesar salad', 'lettuce wraps'] },
          { name: 'Radishes', peak: [3, 4], nutrition: ['vitamin C', 'fiber'], recipes: ['radish salad', 'pickled radishes'] },
          { name: 'Peas', peak: [4, 5], nutrition: ['protein', 'fiber', 'vitamin K'], recipes: ['pea soup', 'pea and mint salad'] },
          { name: 'Spinach', peak: [3, 4], nutrition: ['iron', 'vitamin K', 'folate'], recipes: ['spinach salad', 'sautéed spinach'] }
        ],
        fruits: [
          { name: 'Strawberries', peak: [4, 5], nutrition: ['vitamin C', 'antioxidants', 'fiber'], recipes: ['strawberry salad', 'strawberry smoothie'] },
          { name: 'Rhubarb', peak: [3, 4, 5], nutrition: ['vitamin K', 'fiber'], recipes: ['rhubarb pie', 'rhubarb jam'] },
          { name: 'Apricots', peak: [4, 5], nutrition: ['vitamin A', 'vitamin C'], recipes: ['apricot chicken', 'apricot tart'] }
        ],
        herbs: [
          { name: 'Chives', peak: [3, 4, 5], nutrition: ['vitamin K', 'vitamin C'], recipes: ['herb butter', 'chive dressing'] },
          { name: 'Dill', peak: [3, 4, 5], nutrition: ['vitamin C', 'calcium'], recipes: ['dill salmon', 'cucumber dill salad'] },
          { name: 'Parsley', peak: [3, 4, 5], nutrition: ['vitamin K', 'vitamin C'], recipes: ['tabbouleh', 'herb sauce'] }
        ]
      },
      summer: {
        months: [5, 6, 7], // June, July, August
        vegetables: [
          { name: 'Tomatoes', peak: [6, 7, 8], nutrition: ['lycopene', 'vitamin C', 'potassium'], recipes: ['caprese salad', 'tomato sauce'] },
          { name: 'Zucchini', peak: [6, 7], nutrition: ['vitamin C', 'potassium', 'fiber'], recipes: ['zucchini bread', 'grilled zucchini'] },
          { name: 'Bell Peppers', peak: [6, 7, 8], nutrition: ['vitamin C', 'vitamin A'], recipes: ['stuffed peppers', 'pepper stir-fry'] },
          { name: 'Cucumber', peak: [6, 7, 8], nutrition: ['water', 'vitamin K'], recipes: ['cucumber salad', 'gazpacho'] },
          { name: 'Eggplant', peak: [6, 7, 8], nutrition: ['fiber', 'antioxidants'], recipes: ['ratatouille', 'baba ganoush'] },
          { name: 'Corn', peak: [6, 7, 8], nutrition: ['fiber', 'vitamin C'], recipes: ['corn salad', 'grilled corn'] },
          { name: 'Green Beans', peak: [6, 7], nutrition: ['vitamin K', 'fiber'], recipes: ['green bean almondine', 'bean salad'] }
        ],
        fruits: [
          { name: 'Berries', peak: [5, 6, 7], nutrition: ['antioxidants', 'vitamin C', 'fiber'], recipes: ['berry parfait', 'mixed berry pie'] },
          { name: 'Peaches', peak: [6, 7, 8], nutrition: ['vitamin A', 'vitamin C'], recipes: ['peach cobbler', 'grilled peaches'] },
          { name: 'Cherries', peak: [5, 6], nutrition: ['antioxidants', 'melatonin'], recipes: ['cherry pie', 'cherry sauce'] },
          { name: 'Melons', peak: [6, 7, 8], nutrition: ['water', 'vitamin A', 'vitamin C'], recipes: ['melon salad', 'melon smoothie'] },
          { name: 'Plums', peak: [7, 8], nutrition: ['vitamin C', 'antioxidants'], recipes: ['plum tart', 'plum sauce'] }
        ],
        herbs: [
          { name: 'Basil', peak: [6, 7, 8], nutrition: ['vitamin K', 'antioxidants'], recipes: ['pesto', 'caprese salad'] },
          { name: 'Oregano', peak: [6, 7, 8], nutrition: ['antioxidants', 'vitamin K'], recipes: ['herb seasoning', 'tomato dishes'] },
          { name: 'Thyme', peak: [6, 7, 8], nutrition: ['vitamin C', 'vitamin A'], recipes: ['herb roasted vegetables', 'thyme chicken'] }
        ]
      },
      fall: {
        months: [8, 9, 10], // September, October, November
        vegetables: [
          { name: 'Pumpkin', peak: [9, 10], nutrition: ['vitamin A', 'fiber', 'potassium'], recipes: ['pumpkin soup', 'pumpkin pie'] },
          { name: 'Sweet Potatoes', peak: [9, 10, 11], nutrition: ['vitamin A', 'fiber', 'potassium'], recipes: ['roasted sweet potato', 'sweet potato pie'] },
          { name: 'Brussels Sprouts', peak: [9, 10, 11], nutrition: ['vitamin K', 'vitamin C', 'fiber'], recipes: ['roasted brussels sprouts', 'brussels sprouts salad'] },
          { name: 'Cauliflower', peak: [9, 10], nutrition: ['vitamin C', 'fiber'], recipes: ['cauliflower rice', 'roasted cauliflower'] },
          { name: 'Cabbage', peak: [9, 10, 11], nutrition: ['vitamin K', 'vitamin C'], recipes: ['coleslaw', 'cabbage soup'] },
          { name: 'Beets', peak: [9, 10], nutrition: ['folate', 'nitrates'], recipes: ['roasted beets', 'beet salad'] },
          { name: 'Carrots', peak: [9, 10, 11], nutrition: ['vitamin A', 'fiber'], recipes: ['carrot soup', 'honey glazed carrots'] }
        ],
        fruits: [
          { name: 'Apples', peak: [8, 9, 10], nutrition: ['fiber', 'vitamin C'], recipes: ['apple pie', 'apple crisp'] },
          { name: 'Pears', peak: [8, 9, 10], nutrition: ['fiber', 'vitamin C'], recipes: ['poached pears', 'pear tart'] },
          { name: 'Cranberries', peak: [9, 10, 11], nutrition: ['vitamin C', 'antioxidants'], recipes: ['cranberry sauce', 'cranberry bread'] },
          { name: 'Pomegranates', peak: [9, 10, 11], nutrition: ['antioxidants', 'vitamin C'], recipes: ['pomegranate salad', 'pomegranate molasses'] }
        ],
        herbs: [
          { name: 'Sage', peak: [9, 10], nutrition: ['antioxidants', 'vitamin K'], recipes: ['sage butter', 'herb seasoning'] },
          { name: 'Rosemary', peak: [9, 10, 11], nutrition: ['antioxidants'], recipes: ['rosemary potatoes', 'herb bread'] }
        ]
      },
      winter: {
        months: [11, 0, 1], // December, January, February
        vegetables: [
          { name: 'Kale', peak: [11, 0, 1], nutrition: ['vitamin K', 'vitamin A', 'vitamin C'], recipes: ['kale salad', 'kale chips'] },
          { name: 'Collard Greens', peak: [11, 0, 1], nutrition: ['vitamin K', 'vitamin A'], recipes: ['braised collards', 'collard wraps'] },
          { name: 'Leeks', peak: [11, 0, 1], nutrition: ['vitamin K', 'folate'], recipes: ['leek soup', 'braised leeks'] },
          { name: 'Turnips', peak: [11, 0, 1], nutrition: ['vitamin C', 'fiber'], recipes: ['mashed turnips', 'turnip gratin'] },
          { name: 'Parsnips', peak: [11, 0, 1], nutrition: ['fiber', 'vitamin C'], recipes: ['roasted parsnips', 'parsnip soup'] },
          { name: 'Winter Squash', peak: [11, 0, 1], nutrition: ['vitamin A', 'fiber'], recipes: ['butternut squash soup', 'acorn squash'] },
          { name: 'Potatoes', peak: [0, 1], nutrition: ['potassium', 'vitamin C'], recipes: ['mashed potatoes', 'potato gratin'] }
        ],
        fruits: [
          { name: 'Citrus', peak: [11, 0, 1], nutrition: ['vitamin C', 'folate'], recipes: ['citrus salad', 'orange chicken'] },
          { name: 'Persimmons', peak: [11, 0], nutrition: ['vitamin A', 'fiber'], recipes: ['persimmon bread', 'persimmon salad'] },
          { name: 'Pineapple', peak: [0, 1], nutrition: ['vitamin C', 'bromelain'], recipes: ['pineapple upside down cake', 'tropical smoothie'] }
        ],
        herbs: [
          { name: 'Mint', peak: [11, 0, 1], nutrition: ['vitamin A', 'antioxidants'], recipes: ['mint tea', 'herb sauce'] },
          { name: 'Cilantro', peak: [11, 0, 1], nutrition: ['vitamin K', 'vitamin A'], recipes: ['cilantro lime dressing', 'herb salsa'] }
        ]
      }
    };

    // Regional modifiers
    this.regionalData = {
      northern: { tempOffset: -1, shortSeason: true },
      southern: { tempOffset: 1, longSeason: true },
      tropical: { tempOffset: 2, yearRound: true },
      mediterranean: { tempOffset: 0.5, extendedSummer: true }
    };
  }

  getCurrentSeason() {
    const month = this.currentMonth;
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getUserLocation() {
    // For now, return default. Could be enhanced with geolocation API
    return localStorage.getItem('userRegion') || 'northern';
  }

  /**
   * Get seasonal suggestions for current month
   * @param {Object} options - Filtering options
   * @returns {Object} Seasonal suggestions organized by category
   */
  getCurrentSeasonalSuggestions(options = {}) {
    const {
      category = 'all', // 'vegetables', 'fruits', 'herbs', 'all'
      peakOnly = false,
      nutritionFocus = null, // e.g., 'vitamin C', 'fiber'
      recipeIntegration = true
    } = options;

    const currentSeasonData = this.seasonalData[this.currentSeason];
    let suggestions = {};

    if (category === 'all') {
      suggestions = {
        vegetables: this.filterBySeason(currentSeasonData.vegetables, peakOnly, nutritionFocus),
        fruits: this.filterBySeason(currentSeasonData.fruits, peakOnly, nutritionFocus),
        herbs: this.filterBySeason(currentSeasonData.herbs, peakOnly, nutritionFocus)
      };
    } else {
      suggestions[category] = this.filterBySeason(currentSeasonData[category], peakOnly, nutritionFocus);
    }

    if (recipeIntegration) {
      suggestions = this.addRecipeIntegration(suggestions);
    }

    return {
      season: this.currentSeason,
      month: new Date().toLocaleString('default', { month: 'long' }),
      suggestions,
      tips: this.getSeasonalTips(),
      nutritionHighlights: this.getNutritionHighlights()
    };
  }

  /**
   * Filter ingredients by season, peak timing, and nutrition
   */
  filterBySeason(ingredients, peakOnly, nutritionFocus) {
    return ingredients.filter(ingredient => {
      // Check if ingredient is in season
      const inSeason = ingredient.peak.includes(this.currentMonth);
      
      if (peakOnly && !inSeason) return false;

      // Check nutrition focus
      if (nutritionFocus) {
        return ingredient.nutrition.some(nutrient => 
          nutrient.toLowerCase().includes(nutritionFocus.toLowerCase())
        );
      }

      return true;
    }).map(ingredient => ({
      ...ingredient,
      isPeak: ingredient.peak.includes(this.currentMonth),
      seasonRating: this.calculateSeasonRating(ingredient)
    }));
  }

  /**
   * Calculate how well-suited an ingredient is for current season
   */
  calculateSeasonRating(ingredient) {
    let rating = 0.5; // Base rating

    // Boost for peak season
    if (ingredient.peak.includes(this.currentMonth)) {
      rating += 0.3;
    }

    // Boost for adjacent months
    const adjacentMonths = [
      (this.currentMonth - 1 + 12) % 12,
      (this.currentMonth + 1) % 12
    ];
    
    if (ingredient.peak.some(month => adjacentMonths.includes(month))) {
      rating += 0.1;
    }

    // Nutrition relevance (seasonal needs)
    const seasonalNeeds = this.getSeasonalNutritionalNeeds();
    const matchingNutrients = ingredient.nutrition.filter(nutrient => 
      seasonalNeeds.includes(nutrient)
    );
    rating += matchingNutrients.length * 0.1;

    return Math.min(rating, 1.0);
  }

  /**
   * Get nutritional needs based on season
   */
  getSeasonalNutritionalNeeds() {
    const needs = {
      spring: ['vitamin C', 'fiber', 'detox'],
      summer: ['water', 'antioxidants', 'vitamin A'],
      fall: ['fiber', 'vitamin A', 'immune support'],
      winter: ['vitamin C', 'vitamin D', 'iron']
    };
    return needs[this.currentSeason] || [];
  }

  /**
   * Add recipe integration suggestions
   */
  addRecipeIntegration(suggestions) {
    Object.keys(suggestions).forEach(category => {
      suggestions[category] = suggestions[category].map(ingredient => ({
        ...ingredient,
        mealSuggestions: this.generateMealSuggestions(ingredient),
        pairingTips: this.generatePairingTips(ingredient)
      }));
    });
    return suggestions;
  }

  /**
   * Generate meal suggestions for an ingredient
   */
  generateMealSuggestions(ingredient) {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    return mealTypes.map(mealType => ({
      type: mealType,
      suggestions: this.getMealSuggestionsForIngredient(ingredient, mealType)
    })).filter(meal => meal.suggestions.length > 0);
  }

  getMealSuggestionsForIngredient(ingredient, mealType) {
    const suggestions = {
      breakfast: {
        vegetables: [`${ingredient.name} omelet`, `${ingredient.name} hash`],
        fruits: [`${ingredient.name} smoothie`, `${ingredient.name} parfait`],
        herbs: [`Herb-infused ${ingredient.name} scramble`]
      },
      lunch: {
        vegetables: [`${ingredient.name} salad`, `${ingredient.name} soup`],
        fruits: [`${ingredient.name} salad`, `${ingredient.name} sandwich`],
        herbs: [`${ingredient.name} pesto pasta`]
      },
      dinner: {
        vegetables: [`Roasted ${ingredient.name}`, `${ingredient.name} stir-fry`],
        fruits: [`${ingredient.name} glazed protein`, `${ingredient.name} chutney`],
        herbs: [`${ingredient.name} crusted fish`]
      },
      snack: {
        vegetables: [`${ingredient.name} chips`, `${ingredient.name} dip`],
        fruits: [`Fresh ${ingredient.name}`, `${ingredient.name} smoothie`],
        herbs: [`${ingredient.name} tea`]
      }
    };

    // Determine category
    let category = 'vegetables';
    Object.keys(this.seasonalData[this.currentSeason]).forEach(cat => {
      if (this.seasonalData[this.currentSeason][cat].some(item => item.name === ingredient.name)) {
        category = cat;
      }
    });

    return suggestions[mealType][category] || ingredient.recipes || [];
  }

  /**
   * Generate pairing tips for ingredients
   */
  generatePairingTips(ingredient) {
    const commonPairings = {
      vegetables: ['olive oil', 'garlic', 'herbs', 'lemon'],
      fruits: ['yogurt', 'nuts', 'honey', 'cinnamon'],
      herbs: ['lemon', 'olive oil', 'garlic', 'protein']
    };

    let category = 'vegetables';
    Object.keys(this.seasonalData[this.currentSeason]).forEach(cat => {
      if (this.seasonalData[this.currentSeason][cat].some(item => item.name === ingredient.name)) {
        category = cat;
      }
    });

    return commonPairings[category] || [];
  }

  /**
   * Get seasonal cooking tips
   */
  getSeasonalTips() {
    const tips = {
      spring: [
        "Focus on light, fresh preparations to complement spring's natural energy",
        "Try quick cooking methods like steaming to preserve delicate spring vegetables",
        "Incorporate fresh herbs for natural detox benefits"
      ],
      summer: [
        "Use minimal cooking to keep cool - try raw preparations and cold soups",
        "Grill vegetables and fruits to enhance their natural sweetness",
        "Stay hydrated with water-rich fruits and vegetables"
      ],
      fall: [
        "Embrace warming cooking methods like roasting and braising",
        "Focus on hearty, fiber-rich meals to support immune system",
        "Preserve the harvest with fermentation and pickling"
      ],
      winter: [
        "Use slow cooking methods to create warming, comforting meals",
        "Focus on vitamin C-rich foods to support immune health",
        "Incorporate warming spices like ginger and cinnamon"
      ]
    };
    return tips[this.currentSeason] || [];
  }

  /**
   * Get nutrition highlights for the season
   */
  getNutritionHighlights() {
    const highlights = {
      spring: {
        focus: "Detoxification and renewal",
        keyNutrients: ["vitamin C", "folate", "fiber"],
        benefits: "Support liver detox and boost energy"
      },
      summer: {
        focus: "Hydration and antioxidant protection",
        keyNutrients: ["water", "vitamin A", "antioxidants"],
        benefits: "Protect skin from sun damage and stay hydrated"
      },
      fall: {
        focus: "Immune system preparation",
        keyNutrients: ["vitamin A", "fiber", "antioxidants"],
        benefits: "Build immune reserves for winter months"
      },
      winter: {
        focus: "Immune support and warmth",
        keyNutrients: ["vitamin C", "vitamin D", "iron"],
        benefits: "Fight off winter illnesses and maintain energy"
      }
    };
    return highlights[this.currentSeason] || {};
  }

  /**
   * Get seasonal ingredient suggestions for meal planning
   * @param {Array} plannedMeals - Current meal plan
   * @returns {Object} Suggestions to enhance meal plan with seasonal ingredients
   */
  enhanceMealPlanWithSeasonal(plannedMeals) {
    const seasonalSuggestions = this.getCurrentSeasonalSuggestions();
    const enhancements = [];

    plannedMeals.forEach((meal, index) => {
      const mealEnhancements = this.analyzeMealForSeasonalOpportunities(meal, seasonalSuggestions);
      if (mealEnhancements.length > 0) {
        enhancements.push({
          mealIndex: index,
          mealName: meal.name,
          suggestions: mealEnhancements
        });
      }
    });

    return {
      enhancements,
      seasonalFocus: seasonalSuggestions.nutritionHighlights,
      implementationTips: this.getImplementationTips()
    };
  }

  /**
   * Analyze individual meal for seasonal enhancement opportunities
   */
  analyzeMealForSeasonalOpportunities(meal, seasonalSuggestions) {
    const opportunities = [];
    
    // Check if meal could benefit from seasonal vegetables
    if (meal.ingredients) {
      const vegetables = seasonalSuggestions.suggestions.vegetables || [];
      const fruits = seasonalSuggestions.suggestions.fruits || [];
      const herbs = seasonalSuggestions.suggestions.herbs || [];

      vegetables.forEach(veggie => {
        if (veggie.isPeak && !meal.ingredients.some(ing => 
          ing.toLowerCase().includes(veggie.name.toLowerCase())
        )) {
          opportunities.push({
            type: 'add_vegetable',
            ingredient: veggie.name,
            suggestion: `Add ${veggie.name} for peak seasonal flavor and ${veggie.nutrition.join(', ')}`,
            implementation: veggie.mealSuggestions || []
          });
        }
      });

      // Similar logic for fruits and herbs...
    }

    return opportunities.slice(0, 3); // Limit to 3 suggestions per meal
  }

  /**
   * Get practical tips for implementing seasonal ingredients
   */
  getImplementationTips() {
    return [
      "Start with one seasonal ingredient per meal to avoid overwhelming changes",
      "Visit local farmers markets for the freshest seasonal options",
      "Try seasonal ingredient swaps in familiar recipes",
      "Batch prep seasonal vegetables for easy meal additions",
      "Freeze or preserve peak season ingredients for later use"
    ];
  }

  /**
   * Save user preferences for seasonal suggestions
   */
  saveSeasonalPreferences(preferences) {
    const existingPrefs = JSON.parse(localStorage.getItem('seasonalPreferences') || '{}');
    const updatedPrefs = { ...existingPrefs, ...preferences };
    localStorage.setItem('seasonalPreferences', JSON.stringify(updatedPrefs));
    return updatedPrefs;
  }

  /**
   * Get user's seasonal preferences
   */
  getSeasonalPreferences() {
    return JSON.parse(localStorage.getItem('seasonalPreferences') || '{}');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeasonalIngredientsManager;
} else {
  window.SeasonalIngredientsManager = SeasonalIngredientsManager;
}
