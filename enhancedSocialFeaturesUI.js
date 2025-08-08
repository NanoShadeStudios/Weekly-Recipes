/**
 * Enhanced Social Features UI
 * Comprehensive user interface for all social functionality including
 * ratings, sharing, challenges, competitions, and social events.
 */

import { enhancedSocialFeaturesManager } from './enhancedSocialFeaturesManager.js';

export class EnhancedSocialFeaturesUI {
    constructor() {
        this.socialManager = enhancedSocialFeaturesManager;
        this.currentView = 'feed';
        this.activeModals = new Set();
        
        this.initializeUI();
        console.log('Enhanced Social Features UI initialized');
    }

    /**
     * Initialize the social features UI
     */
    initializeUI() {
        this.createSocialTab();
        this.setupEventListeners();
        this.renderSocialFeed();
    }

    /**
     * Create the main social features tab
     */
    createSocialTab() {
        const existingTab = document.querySelector('.social-features-tab');
        if (existingTab) {
            existingTab.remove();
        }

        // Add to navigation
        const navContainer = document.querySelector('.nav-tabs') || document.querySelector('nav') || document.body;
        
        const socialTab = document.createElement('div');
        socialTab.className = 'nav-tab social-features-tab';
        socialTab.innerHTML = `
            <button class="nav-button" data-tab="social">
                <span class="nav-icon">👥</span>
                <span class="nav-text">Social</span>
                <span class="social-notification-badge" style="display: none;">0</span>
            </button>
        `;

        navContainer.appendChild(socialTab);

        // Create main social container
        this.createSocialContainer();
    }

    /**
     * Create the main social features container
     */
    createSocialContainer() {
        const existingContainer = document.getElementById('social-features-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'social-features-container';
        container.className = 'tab-content social-features-container';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="social-header">
                <h2 class="social-title">Social Features</h2>
                <div class="social-navigation">
                    <button class="social-nav-btn active" data-view="feed">
                        <span class="icon">📱</span> Feed
                    </button>
                    <button class="social-nav-btn" data-view="challenges">
                        <span class="icon">🏆</span> Challenges
                    </button>
                    <button class="social-nav-btn" data-view="competitions">
                        <span class="icon">🥇</span> Competitions
                    </button>
                    <button class="social-nav-btn" data-view="events">
                        <span class="icon">🎉</span> Events
                    </button>
                    <button class="social-nav-btn" data-view="shared">
                        <span class="icon">📤</span> Shared
                    </button>
                </div>
                <div class="social-actions">
                    <button class="btn-primary create-content-btn">
                        <span class="icon">➕</span> Create
                    </button>
                </div>
            </div>

            <div class="social-content">
                <div id="social-feed-view" class="social-view active">
                    <div class="feed-container">
                        <div class="activity-feed" id="activity-feed">
                            <!-- Activity feed will be populated here -->
                        </div>
                    </div>
                </div>

                <div id="social-challenges-view" class="social-view">
                    <div class="challenges-container">
                        <div class="challenges-header">
                            <h3>Cooking Challenges</h3>
                            <button class="btn-primary create-challenge-btn">Create Challenge</button>
                        </div>
                        <div class="challenges-grid" id="challenges-grid">
                            <!-- Challenges will be populated here -->
                        </div>
                    </div>
                </div>

                <div id="social-competitions-view" class="social-view">
                    <div class="competitions-container">
                        <div class="competitions-header">
                            <h3>Meal Competitions</h3>
                            <button class="btn-primary create-competition-btn">Create Competition</button>
                        </div>
                        <div class="competitions-grid" id="competitions-grid">
                            <!-- Competitions will be populated here -->
                        </div>
                    </div>
                </div>

                <div id="social-events-view" class="social-view">
                    <div class="events-container">
                        <div class="events-header">
                            <h3>Social Meal Events</h3>
                            <button class="btn-primary create-event-btn">Create Event</button>
                        </div>
                        <div class="events-grid" id="events-grid">
                            <!-- Events will be populated here -->
                        </div>
                    </div>
                </div>

                <div id="social-shared-view" class="social-view">
                    <div class="shared-container">
                        <div class="shared-header">
                            <h3>Shared Recipes</h3>
                            <div class="shared-filters">
                                <select id="shared-filter-type">
                                    <option value="all">All Recipes</option>
                                    <option value="my-shares">My Shares</option>
                                    <option value="modified">With Modifications</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
                        </div>
                        <div class="shared-recipes-grid" id="shared-recipes-grid">
                            <!-- Shared recipes will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('content') || document.body;
        mainContent.appendChild(container);
    }

    /**
     * Setup event listeners for social features
     */
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.social-nav-btn')) {
                this.switchSocialView(e.target.dataset.view);
            }

            if (e.target.matches('.nav-button[data-tab="social"]') || 
                e.target.closest('.nav-button[data-tab="social"]')) {
                this.showSocialTab();
            }

            // Create content buttons
            if (e.target.matches('.create-challenge-btn')) {
                this.showCreateChallengeModal();
            }

            if (e.target.matches('.create-competition-btn')) {
                this.showCreateCompetitionModal();
            }

            if (e.target.matches('.create-event-btn')) {
                this.showCreateEventModal();
            }

            if (e.target.matches('.create-content-btn')) {
                this.showCreateContentMenu();
            }

            // Rating interactions
            if (e.target.matches('.rating-star')) {
                this.handleRatingClick(e.target);
            }

            // Share recipe button
            if (e.target.matches('.share-recipe-btn')) {
                this.showShareRecipeModal(e.target.dataset.recipeId);
            }

            // View details buttons
            if (e.target.matches('.view-challenge-btn')) {
                this.showChallengeDetails(e.target.dataset.challengeId);
            }

            if (e.target.matches('.view-competition-btn')) {
                this.showCompetitionDetails(e.target.dataset.competitionId);
            }

            if (e.target.matches('.view-event-btn')) {
                this.showEventDetails(e.target.dataset.eventId);
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('#shared-filter-type')) {
                this.filterSharedRecipes(e.target.value);
            }
        });
    }

    /**
     * Switch between social views
     */
    switchSocialView(viewName) {
        // Update navigation
        document.querySelectorAll('.social-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.social-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`social-${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Load content for the view
        switch (viewName) {
            case 'feed':
                this.renderSocialFeed();
                break;
            case 'challenges':
                this.renderChallenges();
                break;
            case 'competitions':
                this.renderCompetitions();
                break;
            case 'events':
                this.renderEvents();
                break;
            case 'shared':
                this.renderSharedRecipes();
                break;
        }
    }

    /**
     * Show social tab
     */
    showSocialTab() {
        // Hide other tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Show social container
        const socialContainer = document.getElementById('social-features-container');
        if (socialContainer) {
            socialContainer.style.display = 'block';
            this.renderCurrentView();
        }

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('.social-features-tab').classList.add('active');
    }

    /**
     * Render the social activity feed
     */
    renderSocialFeed() {
        const feedContainer = document.getElementById('activity-feed');
        if (!feedContainer) return;

        const activities = this.socialManager.getPersonalizedActivityFeed();

        if (activities.length === 0) {
            feedContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📱</div>
                    <h3>Welcome to Social Features!</h3>
                    <p>Share recipes, join challenges, and connect with other food enthusiasts.</p>
                    <button class="btn-primary get-started-btn">Get Started</button>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = activities.map(activity => this.renderActivityItem(activity)).join('');
    }

    /**
     * Render individual activity item
     */
    renderActivityItem(activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);
        
        switch (activity.type) {
            case 'meal_rating':
                return `
                    <div class="activity-item rating-activity">
                        <div class="activity-avatar">⭐</div>
                        <div class="activity-content">
                            <p><strong>Someone</strong> rated a meal plan</p>
                            <div class="rating-display">
                                ${this.renderStars(activity.data.rating)}
                            </div>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                `;

            case 'recipe_share':
                return `
                    <div class="activity-item share-activity">
                        <div class="activity-avatar">📤</div>
                        <div class="activity-content">
                            <p><strong>Someone</strong> shared a recipe with modifications</p>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                `;

            case 'challenge_created':
                return `
                    <div class="activity-item challenge-activity">
                        <div class="activity-avatar">🏆</div>
                        <div class="activity-content">
                            <p><strong>Someone</strong> created a new cooking challenge</p>
                            <p class="activity-details">"${activity.data.challengeTitle}"</p>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="activity-item generic-activity">
                        <div class="activity-avatar">📱</div>
                        <div class="activity-content">
                            <p>Social activity</p>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                `;
        }
    }

    /**
     * Render challenges
     */
    renderChallenges() {
        const challengesGrid = document.getElementById('challenges-grid');
        if (!challengesGrid) return;

        const challenges = this.socialManager.getActiveCookingChallenges();

        if (challenges.length === 0) {
            challengesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏆</div>
                    <h3>No Active Challenges</h3>
                    <p>Create the first cooking challenge and inspire others!</p>
                    <button class="btn-primary create-challenge-btn">Create Challenge</button>
                </div>
            `;
            return;
        }

        challengesGrid.innerHTML = challenges.map(challenge => `
            <div class="challenge-card" data-challenge-id="${challenge.id}">
                <div class="challenge-header">
                    <h4 class="challenge-title">${challenge.title}</h4>
                    <span class="challenge-status ${challenge.status}">${challenge.status.replace('_', ' ')}</span>
                </div>
                <div class="challenge-description">
                    <p>${challenge.description}</p>
                </div>
                <div class="challenge-stats">
                    <div class="stat">
                        <span class="stat-label">Participants</span>
                        <span class="stat-value">${challenge.participants.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Submissions</span>
                        <span class="stat-value">${challenge.submissions.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Days Left</span>
                        <span class="stat-value">${this.getDaysLeft(challenge.duration.endDate)}</span>
                    </div>
                </div>
                <div class="challenge-actions">
                    <button class="btn-secondary view-challenge-btn" data-challenge-id="${challenge.id}">
                        View Details
                    </button>
                    <button class="btn-primary join-challenge-btn" data-challenge-id="${challenge.id}">
                        Join Challenge
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render competitions
     */
    renderCompetitions() {
        const competitionsGrid = document.getElementById('competitions-grid');
        if (!competitionsGrid) return;

        const competitions = Array.from(this.socialManager.competitions.values());

        if (competitions.length === 0) {
            competitionsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🥇</div>
                    <h3>No Active Competitions</h3>
                    <p>Start a meal competition and let the culinary battle begin!</p>
                    <button class="btn-primary create-competition-btn">Create Competition</button>
                </div>
            `;
            return;
        }

        competitionsGrid.innerHTML = competitions.map(competition => `
            <div class="competition-card" data-competition-id="${competition.id}">
                <div class="competition-header">
                    <h4 class="competition-title">${competition.title}</h4>
                    <span class="competition-category">${competition.category}</span>
                </div>
                <div class="competition-theme">
                    <p><strong>Theme:</strong> ${competition.theme}</p>
                </div>
                <div class="competition-stats">
                    <div class="stat">
                        <span class="stat-label">Participants</span>
                        <span class="stat-value">${competition.participants.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Status</span>
                        <span class="stat-value">${competition.status.replace('_', ' ')}</span>
                    </div>
                </div>
                <div class="competition-prizes">
                    <p><strong>Prizes:</strong> ${competition.prizes.slice(0, 2).join(', ')}${competition.prizes.length > 2 ? '...' : ''}</p>
                </div>
                <div class="competition-actions">
                    <button class="btn-secondary view-competition-btn" data-competition-id="${competition.id}">
                        View Details
                    </button>
                    <button class="btn-primary register-competition-btn" data-competition-id="${competition.id}">
                        Register
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render social events
     */
    renderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;

        const events = Array.from(this.socialManager.socialEvents.values());

        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎉</div>
                    <h3>No Upcoming Events</h3>
                    <p>Plan a social meal event and bring people together through food!</p>
                    <button class="btn-primary create-event-btn">Create Event</button>
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-header">
                    <h4 class="event-title">${event.title}</h4>
                    <span class="event-type">${event.eventType.replace('_', ' ')}</span>
                </div>
                <div class="event-date">
                    <p><strong>Date:</strong> ${new Date(event.schedule.eventDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.schedule.startTime} - ${event.schedule.endTime}</p>
                </div>
                <div class="event-stats">
                    <div class="stat">
                        <span class="stat-label">Participants</span>
                        <span class="stat-value">${event.participants.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Meal Plans</span>
                        <span class="stat-value">${event.mealAssignments.length}</span>
                    </div>
                </div>
                <div class="event-location">
                    <p><strong>Location:</strong> ${event.location.venue || event.location.address || 'TBD'}</p>
                </div>
                <div class="event-actions">
                    <button class="btn-secondary view-event-btn" data-event-id="${event.id}">
                        View Details
                    </button>
                    <button class="btn-primary join-event-btn" data-event-id="${event.id}">
                        Join Event
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render shared recipes
     */
    renderSharedRecipes() {
        const sharedGrid = document.getElementById('shared-recipes-grid');
        if (!sharedGrid) return;

        const sharedRecipes = this.socialManager.getSharedRecipesFeed();

        if (sharedRecipes.length === 0) {
            sharedGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📤</div>
                    <h3>No Shared Recipes</h3>
                    <p>Be the first to share a recipe with your modifications!</p>
                    <button class="btn-primary share-recipe-btn">Share Recipe</button>
                </div>
            `;
            return;
        }

        sharedGrid.innerHTML = sharedRecipes.map(recipe => `
            <div class="shared-recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-header">
                    <h4 class="recipe-title">${recipe.originalRecipeName}</h4>
                    <div class="shared-by">
                        <span>by ${recipe.sharedBy.userName}</span>
                        <span class="share-time">${this.getTimeAgo(recipe.timestamp)}</span>
                    </div>
                </div>
                <div class="recipe-modifications">
                    <p><strong>Modifications:</strong></p>
                    <ul>
                        ${recipe.modifications.ingredientChanges.slice(0, 2).map(change => 
                            `<li>${change.original} → ${change.modified}</li>`
                        ).join('')}
                        ${recipe.modifications.ingredientChanges.length > 2 ? 
                            `<li>...and ${recipe.modifications.ingredientChanges.length - 2} more</li>` : ''}
                    </ul>
                </div>
                <div class="recipe-engagement">
                    <div class="engagement-stats">
                        <span class="stat">❤️ ${recipe.engagement.likes}</span>
                        <span class="stat">📤 ${recipe.engagement.shares}</span>
                        <span class="stat">💬 ${recipe.engagement.comments.length}</span>
                        <span class="stat">👀 ${recipe.engagement.views}</span>
                    </div>
                </div>
                <div class="recipe-actions">
                    <button class="btn-secondary view-recipe-btn" data-recipe-id="${recipe.id}">
                        View Recipe
                    </button>
                    <button class="btn-primary try-recipe-btn" data-recipe-id="${recipe.id}">
                        Try Recipe
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show create challenge modal
     */
    showCreateChallengeModal() {
        const modal = this.createModal('create-challenge', 'Create Cooking Challenge', `
            <form id="create-challenge-form" class="modal-form">
                <div class="form-group">
                    <label for="challenge-title">Challenge Title</label>
                    <input type="text" id="challenge-title" name="title" required 
                           placeholder="e.g., 30-Minute Meal Challenge">
                </div>
                
                <div class="form-group">
                    <label for="challenge-description">Description</label>
                    <textarea id="challenge-description" name="description" required 
                              placeholder="Describe your challenge..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="challenge-start-date">Start Date</label>
                        <input type="date" id="challenge-start-date" name="startDate" required>
                    </div>
                    <div class="form-group">
                        <label for="challenge-end-date">End Date</label>
                        <input type="date" id="challenge-end-date" name="endDate" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="challenge-constraints">Constraints</label>
                    <div class="constraints-options">
                        <div class="constraint-item">
                            <label>Time Limit</label>
                            <input type="number" name="timeLimit" placeholder="Minutes">
                        </div>
                        <div class="constraint-item">
                            <label>Budget Limit</label>
                            <input type="number" name="budget" placeholder="$">
                        </div>
                        <div class="constraint-item">
                            <label>Ingredients</label>
                            <input type="text" name="ingredients" placeholder="Required or forbidden ingredients">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Create Challenge</button>
                </div>
            </form>
        `);

        this.showModal(modal);
    }

    /**
     * Show create competition modal
     */
    showCreateCompetitionModal() {
        const modal = this.createModal('create-competition', 'Create Meal Competition', `
            <form id="create-competition-form" class="modal-form">
                <div class="form-group">
                    <label for="competition-title">Competition Title</label>
                    <input type="text" id="competition-title" name="title" required 
                           placeholder="e.g., Best Breakfast Battle">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="competition-category">Category</label>
                        <select id="competition-category" name="category" required>
                            <option value="">Select Category</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="dessert">Dessert</option>
                            <option value="appetizer">Appetizer</option>
                            <option value="budget-friendly">Budget Friendly</option>
                            <option value="healthy">Healthy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="competition-theme">Theme</label>
                        <input type="text" id="competition-theme" name="theme" 
                               placeholder="e.g., Farm to Table">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="competition-description">Description</label>
                    <textarea id="competition-description" name="description" required 
                              placeholder="Describe your competition..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Competition Schedule</label>
                    <div class="schedule-grid">
                        <div class="schedule-item">
                            <label>Registration Start</label>
                            <input type="date" name="registrationStart" required>
                        </div>
                        <div class="schedule-item">
                            <label>Registration End</label>
                            <input type="date" name="registrationEnd" required>
                        </div>
                        <div class="schedule-item">
                            <label>Competition Start</label>
                            <input type="date" name="competitionStart" required>
                        </div>
                        <div class="schedule-item">
                            <label>Competition End</label>
                            <input type="date" name="competitionEnd" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="competition-prizes">Prizes (one per line)</label>
                    <textarea id="competition-prizes" name="prizes" 
                              placeholder="1st Place: $100 gift card&#10;2nd Place: $50 gift card&#10;3rd Place: $25 gift card"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Create Competition</button>
                </div>
            </form>
        `);

        this.showModal(modal);
    }

    /**
     * Show create event modal
     */
    showCreateEventModal() {
        const modal = this.createModal('create-event', 'Create Social Meal Event', `
            <form id="create-event-form" class="modal-form">
                <div class="form-group">
                    <label for="event-title">Event Title</label>
                    <input type="text" id="event-title" name="title" required 
                           placeholder="e.g., Summer Potluck Party">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="event-type">Event Type</label>
                        <select id="event-type" name="eventType" required>
                            <option value="">Select Type</option>
                            <option value="potluck">Potluck</option>
                            <option value="dinner_party">Dinner Party</option>
                            <option value="picnic">Picnic</option>
                            <option value="holiday">Holiday Celebration</option>
                            <option value="birthday">Birthday Party</option>
                            <option value="cooking_party">Cooking Party</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="event-date">Event Date</label>
                        <input type="date" id="event-date" name="eventDate" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="event-start-time">Start Time</label>
                        <input type="time" id="event-start-time" name="startTime" required>
                    </div>
                    <div class="form-group">
                        <label for="event-end-time">End Time</label>
                        <input type="time" id="event-end-time" name="endTime" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="event-description">Description</label>
                    <textarea id="event-description" name="description" required 
                              placeholder="Describe your event..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="event-location">Location</label>
                    <input type="text" id="event-location" name="location" required 
                           placeholder="Enter address or venue name">
                </div>
                
                <div class="form-group">
                    <label for="event-serving-size">Expected Guests</label>
                    <input type="number" id="event-serving-size" name="servingSize" 
                           min="1" placeholder="Number of people">
                </div>
                
                <div class="form-group">
                    <label>Meal Types</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="mealTypes" value="breakfast"> Breakfast</label>
                        <label><input type="checkbox" name="mealTypes" value="lunch"> Lunch</label>
                        <label><input type="checkbox" name="mealTypes" value="dinner" checked> Dinner</label>
                        <label><input type="checkbox" name="mealTypes" value="snacks"> Snacks</label>
                        <label><input type="checkbox" name="mealTypes" value="desserts"> Desserts</label>
                        <label><input type="checkbox" name="mealTypes" value="beverages"> Beverages</label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Create Event</button>
                </div>
            </form>
        `);

        this.showModal(modal);
    }

    /**
     * Show share recipe modal
     */
    showShareRecipeModal(recipeId) {
        const modal = this.createModal('share-recipe', 'Share Recipe with Modifications', `
            <form id="share-recipe-form" class="modal-form">
                <div class="form-group">
                    <label>Recipe to Share</label>
                    <div class="recipe-preview" data-recipe-id="${recipeId}">
                        <!-- Recipe preview will be loaded here -->
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="share-modifications">Your Modifications</label>
                    <textarea id="share-modifications" name="modifications" 
                              placeholder="Describe what changes you made and why..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="share-ingredient-changes">Ingredient Changes</label>
                    <div id="ingredient-changes-container">
                        <div class="ingredient-change-item">
                            <input type="text" placeholder="Original ingredient" name="originalIngredient">
                            <span>→</span>
                            <input type="text" placeholder="Your substitution" name="modifiedIngredient">
                            <button type="button" class="remove-change">×</button>
                        </div>
                    </div>
                    <button type="button" class="btn-secondary add-ingredient-change">Add Change</button>
                </div>
                
                <div class="form-group">
                    <label for="share-cooking-changes">Cooking Method Changes</label>
                    <textarea id="share-cooking-changes" name="cookingChanges" 
                              placeholder="Describe any changes to cooking methods, times, temperatures..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Share Settings</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="isPublic" checked> Make public</label>
                        <label><input type="checkbox" name="allowComments" checked> Allow comments</label>
                        <label><input type="checkbox" name="allowModifications" checked> Allow further modifications</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="share-tags">Tags</label>
                    <input type="text" id="share-tags" name="tags" 
                           placeholder="healthy, quick, budget-friendly (comma separated)">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Share Recipe</button>
                </div>
            </form>
        `);

        this.showModal(modal);
    }

    /**
     * Create and show rating interface for meal plans
     */
    showMealRatingInterface(mealPlan) {
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'meal-rating-interface';
        ratingContainer.innerHTML = `
            <div class="rating-header">
                <h4>Rate this meal plan</h4>
                <p>${mealPlan.name || 'Generated Meal Plan'}</p>
            </div>
            <div class="rating-stars" data-meal-id="${mealPlan.id}">
                ${[1, 2, 3, 4, 5].map(star => 
                    `<span class="rating-star" data-rating="${star}">⭐</span>`
                ).join('')}
            </div>
            <div class="rating-review">
                <textarea placeholder="Share your thoughts about this meal plan (optional)..." 
                          id="rating-review-text"></textarea>
            </div>
            <div class="rating-actions">
                <button class="btn-secondary cancel-rating">Skip</button>
                <button class="btn-primary submit-rating" data-meal-id="${mealPlan.id}">Submit Rating</button>
            </div>
        `;

        // Add to appropriate container or show as overlay
        const container = document.querySelector('.meal-content') || document.body;
        container.appendChild(ratingContainer);

        return ratingContainer;
    }

    /**
     * Handle rating star clicks
     */
    handleRatingClick(starElement) {
        const rating = parseInt(starElement.dataset.rating);
        const starsContainer = starElement.parentElement;
        const stars = starsContainer.querySelectorAll('.rating-star');
        
        // Update visual state
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        // Store rating value
        starsContainer.dataset.selectedRating = rating;
    }

    /**
     * Utility methods
     */

    /**
     * Render star rating display
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '⭐'.repeat(fullStars) + 
               (hasHalfStar ? '⭐' : '') + 
               '☆'.repeat(emptyStars);
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return time.toLocaleDateString();
    }

    /**
     * Get days left until date
     */
    getDaysLeft(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diffInDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffInDays);
    }

    /**
     * Create modal
     */
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal social-modal';
        modal.id = `modal-${id}`;
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close close-modal">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Show modal
     */
    showModal(modal) {
        document.body.appendChild(modal);
        this.activeModals.add(modal.id);
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                this.hideModal(modal);
            }
        });
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    /**
     * Hide modal
     */
    hideModal(modal) {
        modal.classList.remove('active');
        this.activeModals.delete(modal.id);
        
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Render current view
     */
    renderCurrentView() {
        switch (this.currentView) {
            case 'feed':
                this.renderSocialFeed();
                break;
            case 'challenges':
                this.renderChallenges();
                break;
            case 'competitions':
                this.renderCompetitions();
                break;
            case 'events':
                this.renderEvents();
                break;
            case 'shared':
                this.renderSharedRecipes();
                break;
        }
    }

    /**
     * Filter shared recipes
     */
    filterSharedRecipes(filterType) {
        const filters = {};
        
        switch (filterType) {
            case 'my-shares':
                filters.userId = this.socialManager.currentUser?.uid;
                break;
            case 'modified':
                filters.hasModifications = true;
                break;
            case 'popular':
                // This would sort by engagement
                break;
        }
        
        const filteredRecipes = this.socialManager.getSharedRecipesFeed(filters);
        this.renderFilteredSharedRecipes(filteredRecipes);
    }

    /**
     * Render filtered shared recipes
     */
    renderFilteredSharedRecipes(recipes) {
        const sharedGrid = document.getElementById('shared-recipes-grid');
        if (!sharedGrid) return;

        sharedGrid.innerHTML = recipes.map(recipe => `
            <!-- Same structure as renderSharedRecipes but with filtered data -->
        `).join('');
    }

    /**
     * Show create content menu
     */
    showCreateContentMenu() {
        // This would show a dropdown or modal with options to create different types of content
    }

    /**
     * Show challenge details
     */
    showChallengeDetails(challengeId) {
        // This would show a detailed view of the challenge
    }

    /**
     * Show competition details
     */
    showCompetitionDetails(competitionId) {
        // This would show a detailed view of the competition
    }

    /**
     * Show event details
     */
    showEventDetails(eventId) {
        // This would show a detailed view of the event
    }
}

// Export singleton instance
export const enhancedSocialFeaturesUI = new EnhancedSocialFeaturesUI();
