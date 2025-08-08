/**
 * Enhanced Social Features Manager
 * Advanced social functionality including meal plan rating, recipe sharing,
 * cooking challenges, competitions, and social meal planning for events.
 */

export class EnhancedSocialFeaturesManager {
    constructor() {
        this.currentUser = null;
        this.socialData = new Map();
        this.challenges = new Map();
        this.competitions = new Map();
        this.socialEvents = new Map();
        this.userConnections = new Map();
        this.activityFeed = [];
        
        // Social engagement metrics
        this.engagementMetrics = {
            totalRatings: 0,
            totalShares: 0,
            totalChallenges: 0,
            totalCompetitions: 0,
            totalEvents: 0
        };
        
        this.initializeSocialFeatures();
        console.log('Enhanced Social Features Manager initialized');
    }

    /**
     * Initialize enhanced social features
     */
    initializeSocialFeatures() {
        this.loadSocialData();
        this.setupSocialEventListeners();
        this.initializeChallengeSystem();
        this.initializeCompetitionSystem();
        this.initializeEventPlanning();
    }

    /**
     * Set current user for social features
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.loadUserSocialProfile();
        this.updateSocialConnections();
    }

    /**
     * MEAL PLAN RATING AND REVIEW SYSTEM
     */

    /**
     * Rate a meal plan
     */
    async rateMealPlan(planId, rating, review = '') {
        try {
            const ratingData = {
                id: this.generateId(),
                planId: planId,
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                rating: Math.max(1, Math.min(5, rating)), // 1-5 stars
                review: review,
                timestamp: new Date(),
                helpfulVotes: 0,
                reportedCount: 0
            };

            // Store rating
            const planRatings = this.socialData.get(`ratings_${planId}`) || [];
            planRatings.push(ratingData);
            this.socialData.set(`ratings_${planId}`, planRatings);

            // Update plan aggregate rating
            await this.updatePlanAggregateRating(planId);

            // Record activity
            this.recordSocialActivity({
                type: 'meal_rating',
                userId: this.currentUser?.uid,
                data: { planId, rating, hasReview: review.length > 0 },
                timestamp: new Date()
            });

            this.engagementMetrics.totalRatings++;
            this.saveSocialData();

            return ratingData;

        } catch (error) {
            console.error('Error rating meal plan:', error);
            throw error;
        }
    }

    /**
     * Get ratings for a meal plan
     */
    getMealPlanRatings(planId) {
        return this.socialData.get(`ratings_${planId}`) || [];
    }

    /**
     * Update aggregate rating for a plan
     */
    async updatePlanAggregateRating(planId) {
        const ratings = this.getMealPlanRatings(planId);
        
        if (ratings.length === 0) return;

        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;
        
        const aggregateData = {
            averageRating: averageRating,
            totalRatings: ratings.length,
            ratingDistribution: this.calculateRatingDistribution(ratings),
            lastUpdated: new Date()
        };

        this.socialData.set(`aggregate_${planId}`, aggregateData);
        return aggregateData;
    }

    /**
     * Calculate rating distribution (1-5 stars)
     */
    calculateRatingDistribution(ratings) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(rating => {
            distribution[rating.rating]++;
        });
        return distribution;
    }

    /**
     * RECIPE SHARING WITH MODIFICATIONS
     */

    /**
     * Share a recipe with modifications
     */
    async shareRecipeWithModifications(originalRecipe, modifications, shareOptions = {}) {
        try {
            const sharedRecipe = {
                id: this.generateId(),
                originalRecipeId: originalRecipe.id,
                originalRecipeName: originalRecipe.name,
                sharedBy: {
                    userId: this.currentUser?.uid,
                    userName: this.currentUser?.displayName || 'Anonymous',
                    userAvatar: this.currentUser?.photoURL || null
                },
                modifications: {
                    ingredientChanges: modifications.ingredientChanges || [],
                    cookingMethodChanges: modifications.cookingMethodChanges || [],
                    timeAdjustments: modifications.timeAdjustments || {},
                    difficultyAdjustment: modifications.difficultyAdjustment || 0,
                    personalNotes: modifications.personalNotes || '',
                    reasonForChanges: modifications.reasonForChanges || ''
                },
                shareSettings: {
                    isPublic: shareOptions.isPublic !== false,
                    allowComments: shareOptions.allowComments !== false,
                    allowFurtherModifications: shareOptions.allowFurtherModifications !== false,
                    shareWithGroups: shareOptions.shareWithGroups || [],
                    shareWithFriends: shareOptions.shareWithFriends || []
                },
                engagement: {
                    views: 0,
                    likes: 0,
                    shares: 0,
                    comments: [],
                    modifications: 0
                },
                timestamp: new Date(),
                tags: modifications.tags || []
            };

            // Store shared recipe
            const sharedRecipes = this.socialData.get('shared_recipes') || [];
            sharedRecipes.push(sharedRecipe);
            this.socialData.set('shared_recipes', sharedRecipes);

            // Record activity
            this.recordSocialActivity({
                type: 'recipe_share',
                userId: this.currentUser?.uid,
                data: { 
                    recipeId: sharedRecipe.id, 
                    originalRecipeId: originalRecipe.id,
                    hasModifications: modifications.ingredientChanges.length > 0 || 
                                    modifications.cookingMethodChanges.length > 0
                },
                timestamp: new Date()
            });

            this.engagementMetrics.totalShares++;
            this.saveSocialData();

            return sharedRecipe;

        } catch (error) {
            console.error('Error sharing recipe:', error);
            throw error;
        }
    }

    /**
     * Get shared recipes feed
     */
    getSharedRecipesFeed(filters = {}) {
        const sharedRecipes = this.socialData.get('shared_recipes') || [];
        
        let filteredRecipes = [...sharedRecipes];

        // Apply filters
        if (filters.userId) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.sharedBy.userId === filters.userId
            );
        }

        if (filters.tags && filters.tags.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                recipe.tags.some(tag => filters.tags.includes(tag))
            );
        }

        if (filters.hasModifications) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                recipe.modifications.ingredientChanges.length > 0 ||
                recipe.modifications.cookingMethodChanges.length > 0
            );
        }

        // Sort by engagement and recency
        return filteredRecipes.sort((a, b) => {
            const scoreA = this.calculateRecipeEngagementScore(a);
            const scoreB = this.calculateRecipeEngagementScore(b);
            return scoreB - scoreA;
        });
    }

    /**
     * Calculate recipe engagement score
     */
    calculateRecipeEngagementScore(recipe) {
        const ageInDays = (new Date() - new Date(recipe.timestamp)) / (1000 * 60 * 60 * 24);
        const engagementWeight = recipe.engagement.likes * 3 + 
                               recipe.engagement.shares * 5 + 
                               recipe.engagement.comments.length * 2 +
                               recipe.engagement.views * 0.1;
        
        // Decay score over time
        const timeDecay = Math.max(0.1, 1 - (ageInDays / 30));
        
        return engagementWeight * timeDecay;
    }

    /**
     * COOKING CHALLENGES SYSTEM
     */

    /**
     * Create a cooking challenge
     */
    async createCookingChallenge(challengeData) {
        try {
            const challenge = {
                id: this.generateId(),
                title: challengeData.title,
                description: challengeData.description,
                rules: challengeData.rules || [],
                constraints: {
                    ingredients: challengeData.constraints?.ingredients || [],
                    cookingMethods: challengeData.constraints?.cookingMethods || [],
                    timeLimit: challengeData.constraints?.timeLimit || null,
                    budget: challengeData.constraints?.budget || null,
                    difficulty: challengeData.constraints?.difficulty || 'any'
                },
                createdBy: {
                    userId: this.currentUser?.uid,
                    userName: this.currentUser?.displayName || 'Anonymous'
                },
                duration: {
                    startDate: new Date(challengeData.startDate),
                    endDate: new Date(challengeData.endDate),
                    submissionDeadline: new Date(challengeData.submissionDeadline)
                },
                prizes: challengeData.prizes || [],
                participants: [],
                submissions: [],
                votingEnabled: challengeData.votingEnabled !== false,
                maxParticipants: challengeData.maxParticipants || null,
                status: 'upcoming',
                tags: challengeData.tags || [],
                timestamp: new Date()
            };

            this.challenges.set(challenge.id, challenge);
            
            // Record activity
            this.recordSocialActivity({
                type: 'challenge_created',
                userId: this.currentUser?.uid,
                data: { challengeId: challenge.id, challengeTitle: challenge.title },
                timestamp: new Date()
            });

            this.engagementMetrics.totalChallenges++;
            this.saveSocialData();

            return challenge;

        } catch (error) {
            console.error('Error creating cooking challenge:', error);
            throw error;
        }
    }

    /**
     * Join a cooking challenge
     */
    async joinCookingChallenge(challengeId) {
        try {
            const challenge = this.challenges.get(challengeId);
            if (!challenge) throw new Error('Challenge not found');

            if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
                throw new Error('Challenge is full');
            }

            const participant = {
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                joinedAt: new Date(),
                submissionCount: 0,
                status: 'active'
            };

            challenge.participants.push(participant);
            this.challenges.set(challengeId, challenge);

            // Record activity
            this.recordSocialActivity({
                type: 'challenge_joined',
                userId: this.currentUser?.uid,
                data: { challengeId, challengeTitle: challenge.title },
                timestamp: new Date()
            });

            this.saveSocialData();
            return participant;

        } catch (error) {
            console.error('Error joining challenge:', error);
            throw error;
        }
    }

    /**
     * Submit to cooking challenge
     */
    async submitToCookingChallenge(challengeId, submission) {
        try {
            const challenge = this.challenges.get(challengeId);
            if (!challenge) throw new Error('Challenge not found');

            const submissionData = {
                id: this.generateId(),
                challengeId: challengeId,
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                recipe: submission.recipe,
                photos: submission.photos || [],
                description: submission.description || '',
                cookingProcess: submission.cookingProcess || '',
                ingredientsList: submission.ingredientsList || [],
                cookingTime: submission.cookingTime || null,
                estimatedCost: submission.estimatedCost || null,
                difficultyRating: submission.difficultyRating || null,
                votes: 0,
                comments: [],
                timestamp: new Date()
            };

            challenge.submissions.push(submissionData);
            this.challenges.set(challengeId, challenge);

            // Update participant submission count
            const participant = challenge.participants.find(p => p.userId === this.currentUser?.uid);
            if (participant) {
                participant.submissionCount++;
            }

            // Record activity
            this.recordSocialActivity({
                type: 'challenge_submission',
                userId: this.currentUser?.uid,
                data: { 
                    challengeId, 
                    submissionId: submissionData.id,
                    challengeTitle: challenge.title 
                },
                timestamp: new Date()
            });

            this.saveSocialData();
            return submissionData;

        } catch (error) {
            console.error('Error submitting to challenge:', error);
            throw error;
        }
    }

    /**
     * Get active cooking challenges
     */
    getActiveCookingChallenges() {
        const now = new Date();
        return Array.from(this.challenges.values()).filter(challenge => {
            const startDate = new Date(challenge.duration.startDate);
            const endDate = new Date(challenge.duration.endDate);
            return startDate <= now && endDate >= now;
        });
    }

    /**
     * MEAL COMPETITIONS SYSTEM
     */

    /**
     * Create a meal competition
     */
    async createMealCompetition(competitionData) {
        try {
            const competition = {
                id: this.generateId(),
                title: competitionData.title,
                description: competitionData.description,
                category: competitionData.category, // e.g., 'breakfast', 'dessert', 'budget-friendly'
                theme: competitionData.theme || '',
                rules: competitionData.rules || [],
                judgingCriteria: competitionData.judgingCriteria || [
                    'Taste', 'Presentation', 'Creativity', 'Following Theme'
                ],
                createdBy: {
                    userId: this.currentUser?.uid,
                    userName: this.currentUser?.displayName || 'Anonymous'
                },
                schedule: {
                    registrationStart: new Date(competitionData.registrationStart),
                    registrationEnd: new Date(competitionData.registrationEnd),
                    competitionStart: new Date(competitionData.competitionStart),
                    competitionEnd: new Date(competitionData.competitionEnd),
                    votingEnd: new Date(competitionData.votingEnd),
                    resultsAnnouncement: new Date(competitionData.resultsAnnouncement)
                },
                prizes: competitionData.prizes || [],
                participants: [],
                entries: [],
                judges: competitionData.judges || [],
                voting: {
                    type: competitionData.votingType || 'public', // 'public', 'judges', 'mixed'
                    votesPerUser: competitionData.votesPerUser || 1
                },
                status: 'registration_open',
                maxParticipants: competitionData.maxParticipants || null,
                entryFee: competitionData.entryFee || null,
                tags: competitionData.tags || [],
                timestamp: new Date()
            };

            this.competitions.set(competition.id, competition);

            // Record activity
            this.recordSocialActivity({
                type: 'competition_created',
                userId: this.currentUser?.uid,
                data: { 
                    competitionId: competition.id, 
                    competitionTitle: competition.title,
                    category: competition.category 
                },
                timestamp: new Date()
            });

            this.engagementMetrics.totalCompetitions++;
            this.saveSocialData();

            return competition;

        } catch (error) {
            console.error('Error creating meal competition:', error);
            throw error;
        }
    }

    /**
     * Register for meal competition
     */
    async registerForMealCompetition(competitionId) {
        try {
            const competition = this.competitions.get(competitionId);
            if (!competition) throw new Error('Competition not found');

            if (competition.status !== 'registration_open') {
                throw new Error('Registration is not open');
            }

            const participant = {
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                userAvatar: this.currentUser?.photoURL || null,
                registeredAt: new Date(),
                entrySubmitted: false,
                status: 'registered'
            };

            competition.participants.push(participant);
            this.competitions.set(competitionId, competition);

            // Record activity
            this.recordSocialActivity({
                type: 'competition_registered',
                userId: this.currentUser?.uid,
                data: { competitionId, competitionTitle: competition.title },
                timestamp: new Date()
            });

            this.saveSocialData();
            return participant;

        } catch (error) {
            console.error('Error registering for competition:', error);
            throw error;
        }
    }

    /**
     * SOCIAL MEAL PLANNING FOR EVENTS
     */

    /**
     * Create a social meal planning event
     */
    async createSocialMealEvent(eventData) {
        try {
            const socialEvent = {
                id: this.generateId(),
                title: eventData.title,
                description: eventData.description,
                eventType: eventData.eventType, // 'potluck', 'dinner_party', 'picnic', 'holiday', 'birthday'
                organizer: {
                    userId: this.currentUser?.uid,
                    userName: this.currentUser?.displayName || 'Anonymous'
                },
                schedule: {
                    eventDate: new Date(eventData.eventDate),
                    startTime: eventData.startTime,
                    endTime: eventData.endTime,
                    rsvpDeadline: new Date(eventData.rsvpDeadline)
                },
                location: {
                    address: eventData.location?.address || '',
                    venue: eventData.location?.venue || '',
                    isVirtual: eventData.location?.isVirtual || false
                },
                mealPlanning: {
                    mealTypes: eventData.mealTypes || ['dinner'], // breakfast, lunch, dinner, snacks, desserts
                    dietaryRestrictions: eventData.dietaryRestrictions || [],
                    servingSize: eventData.servingSize || 1,
                    budget: eventData.budget || null,
                    theme: eventData.theme || ''
                },
                coordination: {
                    assignmentMethod: eventData.assignmentMethod || 'volunteer', // 'volunteer', 'assigned', 'suggested'
                    allowDuplicates: eventData.allowDuplicates || false,
                    signupDeadline: new Date(eventData.signupDeadline)
                },
                participants: [],
                mealAssignments: [],
                discussions: [],
                status: 'planning',
                privacy: eventData.privacy || 'friends', // 'public', 'friends', 'invite_only'
                tags: eventData.tags || [],
                timestamp: new Date()
            };

            this.socialEvents.set(socialEvent.id, socialEvent);

            // Record activity
            this.recordSocialActivity({
                type: 'social_event_created',
                userId: this.currentUser?.uid,
                data: { 
                    eventId: socialEvent.id, 
                    eventTitle: socialEvent.title,
                    eventType: socialEvent.eventType 
                },
                timestamp: new Date()
            });

            this.engagementMetrics.totalEvents++;
            this.saveSocialData();

            return socialEvent;

        } catch (error) {
            console.error('Error creating social meal event:', error);
            throw error;
        }
    }

    /**
     * Join social meal planning event
     */
    async joinSocialMealEvent(eventId, participantData = {}) {
        try {
            const socialEvent = this.socialEvents.get(eventId);
            if (!socialEvent) throw new Error('Event not found');

            const participant = {
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                userAvatar: this.currentUser?.photoURL || null,
                joinedAt: new Date(),
                dietaryRestrictions: participantData.dietaryRestrictions || [],
                allergies: participantData.allergies || [],
                specialRequests: participantData.specialRequests || '',
                canBring: participantData.canBring || [], // What they can contribute
                preferredMealTypes: participantData.preferredMealTypes || [],
                status: 'confirmed'
            };

            socialEvent.participants.push(participant);
            this.socialEvents.set(eventId, socialEvent);

            // Record activity
            this.recordSocialActivity({
                type: 'social_event_joined',
                userId: this.currentUser?.uid,
                data: { eventId, eventTitle: socialEvent.title },
                timestamp: new Date()
            });

            this.saveSocialData();
            return participant;

        } catch (error) {
            console.error('Error joining social meal event:', error);
            throw error;
        }
    }

    /**
     * Assign or volunteer for meal contribution
     */
    async assignMealContribution(eventId, assignmentData) {
        try {
            const socialEvent = this.socialEvents.get(eventId);
            if (!socialEvent) throw new Error('Event not found');

            const assignment = {
                id: this.generateId(),
                eventId: eventId,
                userId: this.currentUser?.uid,
                userName: this.currentUser?.displayName || 'Anonymous',
                mealType: assignmentData.mealType, // 'main', 'appetizer', 'side', 'dessert', 'beverage'
                dishName: assignmentData.dishName || '',
                servingSize: assignmentData.servingSize || socialEvent.mealPlanning.servingSize,
                estimatedCost: assignmentData.estimatedCost || null,
                specialDietaryInfo: assignmentData.specialDietaryInfo || '',
                preparationTime: assignmentData.preparationTime || null,
                bringTime: assignmentData.bringTime || null,
                status: 'committed',
                notes: assignmentData.notes || '',
                timestamp: new Date()
            };

            socialEvent.mealAssignments.push(assignment);
            this.socialEvents.set(eventId, socialEvent);

            this.saveSocialData();
            return assignment;

        } catch (error) {
            console.error('Error assigning meal contribution:', error);
            throw error;
        }
    }

    /**
     * SOCIAL ACTIVITY AND FEED MANAGEMENT
     */

    /**
     * Record social activity
     */
    recordSocialActivity(activity) {
        this.activityFeed.unshift(activity);
        
        // Keep only last 1000 activities
        if (this.activityFeed.length > 1000) {
            this.activityFeed = this.activityFeed.slice(0, 1000);
        }
    }

    /**
     * Get personalized activity feed
     */
    getPersonalizedActivityFeed(limit = 50) {
        const userConnections = this.getUserConnections();
        const relevantActivities = this.activityFeed.filter(activity => {
            // Include own activities
            if (activity.userId === this.currentUser?.uid) return true;
            
            // Include activities from connections
            if (userConnections.includes(activity.userId)) return true;
            
            // Include public activities with high engagement
            if (activity.type === 'recipe_share' || activity.type === 'challenge_created') {
                return true;
            }
            
            return false;
        });

        return relevantActivities.slice(0, limit);
    }

    /**
     * UTILITY METHODS
     */

    /**
     * Generate unique ID
     */
    generateId() {
        return 'social_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Load social data from storage
     */
    loadSocialData() {
        try {
            const stored = localStorage.getItem('enhancedSocialData');
            if (stored) {
                const data = JSON.parse(stored);
                this.socialData = new Map(data.socialData || []);
                this.challenges = new Map(data.challenges || []);
                this.competitions = new Map(data.competitions || []);
                this.socialEvents = new Map(data.socialEvents || []);
                this.activityFeed = data.activityFeed || [];
                this.engagementMetrics = data.engagementMetrics || this.engagementMetrics;
            }
        } catch (error) {
            console.error('Error loading social data:', error);
        }
    }

    /**
     * Save social data to storage
     */
    saveSocialData() {
        try {
            const dataToSave = {
                socialData: Array.from(this.socialData.entries()),
                challenges: Array.from(this.challenges.entries()),
                competitions: Array.from(this.competitions.entries()),
                socialEvents: Array.from(this.socialEvents.entries()),
                activityFeed: this.activityFeed,
                engagementMetrics: this.engagementMetrics,
                lastSaved: new Date()
            };
            
            localStorage.setItem('enhancedSocialData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving social data:', error);
        }
    }

    /**
     * Setup social event listeners
     */
    setupSocialEventListeners() {
        // Listen for meal generation events to suggest sharing
        document.addEventListener('mealGenerated', (e) => {
            if (e.detail && e.detail.meal) {
                this.suggestSocialSharing(e.detail.meal);
            }
        });
    }

    /**
     * Load user social profile
     */
    loadUserSocialProfile() {
        if (!this.currentUser) return;
        
        // Load user's social profile data
        const userProfile = this.socialData.get(`profile_${this.currentUser.uid}`) || {
            totalRatings: 0,
            totalShares: 0,
            challengesWon: 0,
            competitionsWon: 0,
            eventsOrganized: 0,
            reputation: 0,
            badges: [],
            preferences: {
                shareByDefault: false,
                allowDirectMessages: true,
                showInLeaderboards: true
            }
        };
        
        this.socialData.set(`profile_${this.currentUser.uid}`, userProfile);
    }

    /**
     * Update social connections
     */
    updateSocialConnections() {
        // This would integrate with existing community features
        // to build a network of connected users
    }

    /**
     * Get user connections
     */
    getUserConnections() {
        return this.userConnections.get(this.currentUser?.uid) || [];
    }

    /**
     * Suggest social sharing for generated meals
     */
    suggestSocialSharing(meal) {
        // This could show a subtle prompt to share the meal if it's particularly good
        // or if the user has been active in social features
    }

    /**
     * Initialize challenge system defaults
     */
    initializeChallengeSystem() {
        // Set up default challenge types and templates
    }

    /**
     * Initialize competition system defaults
     */
    initializeCompetitionSystem() {
        // Set up default competition categories and rules
    }

    /**
     * Initialize event planning defaults
     */
    initializeEventPlanning() {
        // Set up default event types and templates
    }

    /**
     * Get social metrics summary
     */
    getSocialMetrics() {
        return {
            ...this.engagementMetrics,
            totalChallenges: this.challenges.size,
            totalCompetitions: this.competitions.size,
            totalEvents: this.socialEvents.size,
            activeFeedItems: this.activityFeed.length
        };
    }
}

// Export singleton instance
export const enhancedSocialFeaturesManager = new EnhancedSocialFeaturesManager();
