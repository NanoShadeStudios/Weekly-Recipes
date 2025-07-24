// Food data and categorization logic

// Popular foods database
export const popularFoods = {
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

// Enhanced categorize foods function that separates user foods from popular foods
export function categorizeFoods(userFoods) {
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