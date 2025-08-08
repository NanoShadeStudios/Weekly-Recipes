/**
 * Community Features - Meal Plan Sharing System
 * Enables users to share, discover, and rate meal plans from other users
 * @fileoverview Social features for meal plan sharing and community interaction
 * @module CommunityFeatures
 */

/**
 * CommunityManager - Handles all community-related features
 * @class CommunityManager
 */
class CommunityManager {
  /**
   * Initialize the community manager
   * @constructor
   */
  constructor() {
    this.sharedPlans = [];
    this.userPlans = [];
    this.ratings = {};
    this.comments = {};
    this.userProfiles = {};
    this.currentUser = null;
    
    // Load existing community data
    this.loadCommunityData();
  }

  /**
   * Load community data from localStorage with Firebase sync
   * @returns {void}
   */
  loadCommunityData() {
    try {
      this.sharedPlans = JSON.parse(localStorage.getItem('communitySharedPlans') || '[]');
      this.userPlans = JSON.parse(localStorage.getItem('communityUserPlans') || '[]');
      this.ratings = JSON.parse(localStorage.getItem('communityRatings') || '{}');
      this.comments = JSON.parse(localStorage.getItem('communityComments') || '{}');
      this.userProfiles = JSON.parse(localStorage.getItem('communityProfiles') || '{}');
      
      console.log('Community data loaded:', {
        sharedPlans: this.sharedPlans.length,
        userPlans: this.userPlans.length,
        ratings: Object.keys(this.ratings).length
      });
    } catch (error) {
      console.error('Error loading community data:', error);
      this.initializeDefaultData();
    }
  }

  /**
   * Initialize with sample community data for demo purposes
   * @returns {void}
   */
  initializeDefaultData() {
    const samplePlans = [
      {
        id: 'sample_1',
        title: 'Mediterranean Week',
        description: 'A healthy Mediterranean-inspired meal plan with fresh ingredients',
        author: 'Chef_Maria',
        authorProfile: {
          name: 'Maria Rodriguez',
          bio: 'Mediterranean cuisine enthusiast',
          avatar: '👩‍🍳',
          joinDate: '2024-01-15'
        },
        meals: [
          { day: 'Monday', name: 'Greek Salad with Grilled Chicken', ingredients: ['chicken breast', 'tomatoes', 'cucumbers', 'feta cheese', 'olives', 'olive oil'] },
          { day: 'Tuesday', name: 'Mediterranean Quinoa Bowl', ingredients: ['quinoa', 'chickpeas', 'roasted vegetables', 'tahini dressing'] },
          { day: 'Wednesday', name: 'Lemon Herb Salmon', ingredients: ['salmon fillet', 'lemon', 'herbs', 'asparagus', 'olive oil'] },
          { day: 'Thursday', name: 'Stuffed Bell Peppers', ingredients: ['bell peppers', 'ground turkey', 'rice', 'tomatoes', 'herbs'] },
          { day: 'Friday', name: 'Mediterranean Pasta', ingredients: ['whole wheat pasta', 'tomatoes', 'olives', 'capers', 'fresh basil'] },
          { day: 'Saturday', name: 'Grilled Vegetable Platter', ingredients: ['zucchini', 'eggplant', 'tomatoes', 'peppers', 'herbs'] },
          { day: 'Sunday', name: 'Mediterranean Fish Stew', ingredients: ['white fish', 'tomatoes', 'onions', 'herbs', 'olive oil'] }
        ],
        tags: ['mediterranean', 'healthy', 'pescatarian'],
        difficulty: 'Intermediate',
        prepTime: '30-45 minutes',
        servings: '4 people',
        nutrition: {
          calories: 1850,
          protein: 145,
          carbs: 180,
          fat: 75,
          fiber: 35
        },
        rating: 4.7,
        ratingCount: 23,
        dateShared: '2024-07-20',
        featured: true
      },
      {
        id: 'sample_2',
        title: 'Quick & Easy Weeknight Meals',
        description: 'Simple 30-minute meals perfect for busy weeknights',
        author: 'BusyParent123',
        authorProfile: {
          name: 'Sarah Johnson',
          bio: 'Working parent sharing quick meal solutions',
          avatar: '👩‍💼',
          joinDate: '2024-03-10'
        },
        meals: [
          { day: 'Monday', name: 'Sheet Pan Chicken & Vegetables', ingredients: ['chicken thighs', 'broccoli', 'carrots', 'potatoes'] },
          { day: 'Tuesday', name: 'Beef Stir-Fry', ingredients: ['ground beef', 'mixed vegetables', 'soy sauce', 'rice'] },
          { day: 'Wednesday', name: 'Taco Wednesday', ingredients: ['ground turkey', 'taco shells', 'lettuce', 'tomatoes', 'cheese'] },
          { day: 'Thursday', name: 'Pasta with Marinara', ingredients: ['pasta', 'marinara sauce', 'ground beef', 'parmesan'] },
          { day: 'Friday', name: 'Pizza Night', ingredients: ['pizza dough', 'sauce', 'cheese', 'pepperoni'] },
          { day: 'Saturday', name: 'Grilled Burgers', ingredients: ['ground beef', 'burger buns', 'lettuce', 'tomatoes'] },
          { day: 'Sunday', name: 'Slow Cooker Roast', ingredients: ['beef roast', 'potatoes', 'carrots', 'onions'] }
        ],
        tags: ['quick', 'family-friendly', 'easy'],
        difficulty: 'Beginner',
        prepTime: '20-30 minutes',
        servings: '4-6 people',
        nutrition: {
          calories: 2100,
          protein: 160,
          carbs: 220,
          fat: 85,
          fiber: 25
        },
        rating: 4.5,
        ratingCount: 18,
        dateShared: '2024-07-25',
        featured: false
      }
    ];

    this.sharedPlans = samplePlans;
    this.saveCommunityData();
  }

  /**
   * Save community data to localStorage
   * @returns {void}
   */
  saveCommunityData() {
    try {
      localStorage.setItem('communitySharedPlans', JSON.stringify(this.sharedPlans));
      localStorage.setItem('communityUserPlans', JSON.stringify(this.userPlans));
      localStorage.setItem('communityRatings', JSON.stringify(this.ratings));
      localStorage.setItem('communityComments', JSON.stringify(this.comments));
      localStorage.setItem('communityProfiles', JSON.stringify(this.userProfiles));
    } catch (error) {
      console.error('Error saving community data:', error);
    }
  }

  /**
   * Share a meal plan with the community
   * @param {Object} mealPlan - The meal plan to share
   * @param {Object} shareOptions - Sharing options (title, description, tags, etc.)
   * @returns {Object} The shared plan object
   */
  shareMealPlan(mealPlan, shareOptions) {
    const sharedPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: shareOptions.title || 'My Meal Plan',
      description: shareOptions.description || 'A delicious meal plan to try!',
      author: this.currentUser?.displayName || 'Anonymous',
      authorProfile: this.getUserProfile(),
      meals: mealPlan,
      tags: shareOptions.tags || [],
      difficulty: shareOptions.difficulty || 'Intermediate',
      prepTime: shareOptions.prepTime || '30-45 minutes',
      servings: shareOptions.servings || '4 people',
      nutrition: shareOptions.nutrition || {},
      rating: 0,
      ratingCount: 0,
      dateShared: new Date().toISOString().split('T')[0],
      featured: false
    };

    this.sharedPlans.unshift(sharedPlan);
    this.userPlans.unshift(sharedPlan);
    this.saveCommunityData();

    return sharedPlan;
  }

  /**
   * Get user profile information
   * @returns {Object} User profile data
   */
  getUserProfile() {
    const userId = this.currentUser?.uid || 'anonymous';
    return this.userProfiles[userId] || {
      name: this.currentUser?.displayName || 'Anonymous User',
      bio: 'Meal planning enthusiast',
      avatar: '👤',
      joinDate: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Update user profile
   * @param {Object} profileData - New profile information
   * @returns {void}
   */
  updateUserProfile(profileData) {
    const userId = this.currentUser?.uid || 'anonymous';
    this.userProfiles[userId] = {
      ...this.getUserProfile(),
      ...profileData
    };
    this.saveCommunityData();
  }

  /**
   * Get all shared meal plans with filtering options
   * @param {Object} filters - Filter options (tags, difficulty, rating, etc.)
   * @returns {Array} Filtered meal plans
   */
  getSharedPlans(filters = {}) {
    let plans = [...this.sharedPlans];

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      plans = plans.filter(plan => 
        filters.tags.some(tag => plan.tags.includes(tag))
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      plans = plans.filter(plan => plan.difficulty === filters.difficulty);
    }

    // Filter by minimum rating
    if (filters.minRating) {
      plans = plans.filter(plan => plan.rating >= filters.minRating);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      plans = plans.filter(plan => 
        plan.title.toLowerCase().includes(searchLower) ||
        plan.description.toLowerCase().includes(searchLower) ||
        plan.author.toLowerCase().includes(searchLower)
      );
    }

    // Sort options
    switch (filters.sortBy) {
      case 'rating':
        plans.sort((a, b) => b.rating - a.rating);
        break;
      case 'date':
        plans.sort((a, b) => new Date(b.dateShared) - new Date(a.dateShared));
        break;
      case 'popular':
        plans.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      default:
        // Featured plans first, then by date
        plans.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.dateShared) - new Date(a.dateShared);
        });
    }

    return plans;
  }

  /**
   * Get a specific shared meal plan by ID
   * @param {string} planId - The plan ID to retrieve
   * @returns {Object|null} The meal plan or null if not found
   */
  getSharedPlan(planId) {
    return this.sharedPlans.find(plan => plan.id === planId) || null;
  }

  /**
   * Rate a shared meal plan
   * @param {string} planId - The plan ID to rate
   * @param {number} rating - Rating from 1 to 5
   * @returns {Object} Updated plan with new rating
   */
  ratePlan(planId, rating) {
    const plan = this.getSharedPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const userId = this.currentUser?.uid || 'anonymous';
    const userRatingKey = `${planId}_${userId}`;

    // Check if user has already rated this plan
    const existingRating = this.ratings[userRatingKey];
    
    if (existingRating) {
      // Update existing rating
      const totalRating = (plan.rating * plan.ratingCount) - existingRating + rating;
      plan.rating = Math.round((totalRating / plan.ratingCount) * 10) / 10;
    } else {
      // Add new rating
      const totalRating = (plan.rating * plan.ratingCount) + rating;
      plan.ratingCount += 1;
      plan.rating = Math.round((totalRating / plan.ratingCount) * 10) / 10;
    }

    this.ratings[userRatingKey] = rating;
    this.saveCommunityData();

    return plan;
  }

  /**
   * Add a comment to a shared meal plan
   * @param {string} planId - The plan ID to comment on
   * @param {string} comment - The comment text
   * @returns {Object} The new comment object
   */
  addComment(planId, comment) {
    const plan = this.getSharedPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const commentObj = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      planId,
      author: this.currentUser?.displayName || 'Anonymous',
      authorProfile: this.getUserProfile(),
      text: comment,
      date: new Date().toISOString(),
      likes: 0
    };

    if (!this.comments[planId]) {
      this.comments[planId] = [];
    }

    this.comments[planId].unshift(commentObj);
    this.saveCommunityData();

    return commentObj;
  }

  /**
   * Get comments for a specific meal plan
   * @param {string} planId - The plan ID to get comments for
   * @returns {Array} Array of comment objects
   */
  getComments(planId) {
    return this.comments[planId] || [];
  }

  /**
   * Clone a shared meal plan to user's personal collection
   * @param {string} planId - The plan ID to clone
   * @returns {Object} The cloned plan
   */
  clonePlan(planId) {
    const originalPlan = this.getSharedPlan(planId);
    if (!originalPlan) {
      throw new Error('Plan not found');
    }

    const clonedPlan = {
      ...originalPlan,
      id: `cloned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${originalPlan.title} (Copy)`,
      author: this.currentUser?.displayName || 'Anonymous',
      authorProfile: this.getUserProfile(),
      dateShared: new Date().toISOString().split('T')[0],
      rating: 0,
      ratingCount: 0,
      featured: false
    };

    // Add to user's personal plans
    this.userPlans.unshift(clonedPlan);
    this.saveCommunityData();

    return clonedPlan;
  }

  /**
   * Get user's shared plans
   * @returns {Array} Array of user's shared meal plans
   */
  getUserSharedPlans() {
    const currentUserName = this.currentUser?.displayName || 'Anonymous';
    return this.sharedPlans.filter(plan => plan.author === currentUserName);
  }

  /**
   * Delete a user's shared plan
   * @param {string} planId - The plan ID to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteSharedPlan(planId) {
    const planIndex = this.sharedPlans.findIndex(plan => plan.id === planId);
    if (planIndex === -1) {
      return false;
    }

    const plan = this.sharedPlans[planIndex];
    const currentUserName = this.currentUser?.displayName || 'Anonymous';
    
    // Only allow deletion if user is the author
    if (plan.author !== currentUserName) {
      throw new Error('Not authorized to delete this plan');
    }

    this.sharedPlans.splice(planIndex, 1);
    
    // Also remove from user plans
    const userPlanIndex = this.userPlans.findIndex(p => p.id === planId);
    if (userPlanIndex !== -1) {
      this.userPlans.splice(userPlanIndex, 1);
    }

    // Clean up ratings and comments
    delete this.comments[planId];
    Object.keys(this.ratings).forEach(key => {
      if (key.startsWith(`${planId}_`)) {
        delete this.ratings[key];
      }
    });

    this.saveCommunityData();
    return true;
  }

  /**
   * Get trending meal plans based on recent ratings and views
   * @returns {Array} Array of trending meal plans
   */
  getTrendingPlans() {
    return this.sharedPlans
      .filter(plan => plan.ratingCount >= 3) // At least 3 ratings
      .sort((a, b) => {
        // Score based on rating and recency
        const aScore = a.rating * Math.log(a.ratingCount + 1);
        const bScore = b.rating * Math.log(b.ratingCount + 1);
        return bScore - aScore;
      })
      .slice(0, 6);
  }

  /**
   * Set current user for community features
   * @param {Object} user - User object from authentication
   * @returns {void}
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Get community statistics
   * @returns {Object} Community stats object
   */
  getCommunityStats() {
    return {
      totalPlans: this.sharedPlans.length,
      totalRatings: Object.keys(this.ratings).length,
      totalComments: Object.values(this.comments).reduce((sum, comments) => sum + comments.length, 0),
      activeUsers: new Set(this.sharedPlans.map(plan => plan.author)).size,
      averageRating: this.sharedPlans.reduce((sum, plan) => sum + plan.rating, 0) / this.sharedPlans.length || 0
    };
  }
}

// Export for use in other modules
export { CommunityManager };
export default CommunityManager;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
  window.CommunityManager = CommunityManager;
}
