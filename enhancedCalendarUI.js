/**
 * Enhanced Calendar UI Manager
 * Advanced user interface for enhanced calendar features including conflict resolution,
 * intelligent suggestions, meal prep planning, and grocery scheduling.
 */

export class EnhancedCalendarUI {
    constructor() {
        this.currentView = 'month';
        this.selectedDate = new Date();
        this.conflictResolutionMode = false;
        this.suggestionsPanelOpen = false;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize enhanced calendar UI event listeners
     */
    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindEnhancedCalendarEvents();
            this.initializeCalendarEnhancements();
        });
    }

    /**
     * Bind all enhanced calendar event handlers
     */
    bindEnhancedCalendarEvents() {
        // Enhanced calendar controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.enhanced-calendar-btn')) {
                this.showEnhancedCalendarModal();
            }
            if (e.target.matches('.conflict-resolution-btn')) {
                this.openConflictResolutionPanel();
            }
            if (e.target.matches('.suggestions-panel-btn')) {
                this.toggleSuggestionsPanel();
            }
            if (e.target.matches('.meal-prep-planner-btn')) {
                this.showMealPrepPlannerModal();
            }
            if (e.target.matches('.grocery-scheduler-btn')) {
                this.showGrocerySchedulerModal();
            }
            if (e.target.matches('.calendar-preferences-btn')) {
                this.showCalendarPreferencesModal();
            }
        });

        // Calendar view switching
        document.addEventListener('change', (e) => {
            if (e.target.matches('.calendar-view-selector')) {
                this.switchCalendarView(e.target.value);
            }
        });
    }

    /**
     * Initialize calendar enhancements in the existing UI
     */
    initializeCalendarEnhancements() {
        const calendarSection = document.querySelector('#calendar');
        if (calendarSection) {
            this.addEnhancedCalendarControls(calendarSection);
            this.addConflictIndicators();
            this.addSuggestionsPanel();
        }
    }

    /**
     * Add enhanced calendar controls to existing calendar
     */
    addEnhancedCalendarControls(calendarSection) {
        const existingHeader = calendarSection.querySelector('h2');
        if (existingHeader) {
            const enhancedControls = document.createElement('div');
            enhancedControls.className = 'enhanced-calendar-controls';
            enhancedControls.innerHTML = `
                <div class="calendar-control-group">
                    <button class="btn btn-primary enhanced-calendar-btn">
                        🧠 Smart Calendar
                    </button>
                    <button class="btn btn-secondary conflict-resolution-btn">
                        ⚠️ Conflicts (<span id="conflict-count">0</span>)
                    </button>
                    <button class="btn btn-info suggestions-panel-btn">
                        💡 Suggestions
                    </button>
                </div>
                
                <div class="calendar-view-controls">
                    <select class="calendar-view-selector">
                        <option value="month">Month View</option>
                        <option value="week">Week View</option>
                        <option value="agenda">Agenda View</option>
                    </select>
                </div>
            `;
            
            existingHeader.parentNode.insertBefore(enhancedControls, existingHeader.nextSibling);
        }
    }

    /**
     * Add conflict indicators to calendar
     */
    addConflictIndicators() {
        const conflictIndicator = document.createElement('div');
        conflictIndicator.id = 'calendar-conflict-indicator';
        conflictIndicator.className = 'conflict-indicator hidden';
        conflictIndicator.innerHTML = `
            <div class="conflict-alert">
                <span class="conflict-icon">⚠️</span>
                <span class="conflict-message">Scheduling conflicts detected</span>
                <button class="btn btn-sm btn-primary resolve-conflicts-btn">Resolve</button>
            </div>
        `;
        
        const calendarContainer = document.querySelector('#calendar .calendar-container') || 
                                 document.querySelector('#calendar');
        if (calendarContainer) {
            calendarContainer.appendChild(conflictIndicator);
        }
    }

    /**
     * Add suggestions panel to calendar
     */
    addSuggestionsPanel() {
        const suggestionsPanel = document.createElement('div');
        suggestionsPanel.id = 'calendar-suggestions-panel';
        suggestionsPanel.className = 'suggestions-panel collapsed';
        suggestionsPanel.innerHTML = `
            <div class="panel-header">
                <h3>💡 Smart Suggestions</h3>
                <button class="panel-toggle">−</button>
            </div>
            
            <div class="panel-content">
                <div class="suggestion-categories">
                    <div class="suggestion-category" data-category="grocery">
                        <h4>🛒 Grocery Shopping</h4>
                        <div class="suggestions-list" id="grocery-suggestions"></div>
                    </div>
                    
                    <div class="suggestion-category" data-category="meal-prep">
                        <h4>👨‍🍳 Meal Prep</h4>
                        <div class="suggestions-list" id="meal-prep-suggestions"></div>
                    </div>
                    
                    <div class="suggestion-category" data-category="scheduling">
                        <h4>⏰ Scheduling</h4>
                        <div class="suggestions-list" id="scheduling-suggestions"></div>
                    </div>
                </div>
            </div>
        `;
        
        const calendarSection = document.querySelector('#calendar');
        if (calendarSection) {
            calendarSection.appendChild(suggestionsPanel);
        }
    }

    /**
     * Show enhanced calendar modal with full features
     */
    showEnhancedCalendarModal() {
        const modal = document.createElement('div');
        modal.className = 'enhanced-calendar-modal';
        modal.innerHTML = `
            <div class="modal-content enhanced-calendar-content">
                <div class="modal-header">
                    <h2>🧠 Enhanced Calendar Management</h2>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="calendar-features-tabs">
                    <button class="tab-btn active" data-tab="overview">📊 Overview</button>
                    <button class="tab-btn" data-tab="conflicts">⚠️ Conflicts</button>
                    <button class="tab-btn" data-tab="suggestions">💡 Suggestions</button>
                    <button class="tab-btn" data-tab="meal-prep">👨‍🍳 Meal Prep</button>
                    <button class="tab-btn" data-tab="grocery">🛒 Grocery</button>
                    <button class="tab-btn" data-tab="preferences">⚙️ Preferences</button>
                </div>
                
                <!-- Overview Tab -->
                <div class="tab-content active" data-tab="overview">
                    ${this.renderCalendarOverview()}
                </div>
                
                <!-- Conflicts Tab -->
                <div class="tab-content" data-tab="conflicts">
                    ${this.renderConflictsManagement()}
                </div>
                
                <!-- Suggestions Tab -->
                <div class="tab-content" data-tab="suggestions">
                    ${this.renderSuggestionsManagement()}
                </div>
                
                <!-- Meal Prep Tab -->
                <div class="tab-content" data-tab="meal-prep">
                    ${this.renderMealPrepPlanning()}
                </div>
                
                <!-- Grocery Tab -->
                <div class="tab-content" data-tab="grocery">
                    ${this.renderGroceryScheduling()}
                </div>
                
                <!-- Preferences Tab -->
                <div class="tab-content" data-tab="preferences">
                    ${this.renderCalendarPreferences()}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.enhanced-calendar-modal').remove()">
                        Close
                    </button>
                    <button class="btn btn-primary save-calendar-settings-btn">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindModalEventListeners(modal);
    }

    /**
     * Render calendar overview tab
     */
    renderCalendarOverview() {
        return `
            <div class="calendar-overview">
                <div class="overview-stats">
                    <div class="stat-card">
                        <h4>📅 This Week</h4>
                        <div class="stat-content">
                            <div class="stat-item">
                                <span class="stat-label">Meals Planned:</span>
                                <span class="stat-value" id="meals-planned-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Prep Sessions:</span>
                                <span class="stat-value" id="prep-sessions-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Shopping Trips:</span>
                                <span class="stat-value" id="shopping-trips-count">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>⚠️ Issues</h4>
                        <div class="stat-content">
                            <div class="stat-item">
                                <span class="stat-label">Conflicts:</span>
                                <span class="stat-value conflicts" id="total-conflicts">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Missing Prep:</span>
                                <span class="stat-value warnings" id="missing-prep-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">No Grocery Time:</span>
                                <span class="stat-value warnings" id="no-grocery-time">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>💡 Optimization</h4>
                        <div class="stat-content">
                            <div class="stat-item">
                                <span class="stat-label">Time Saved:</span>
                                <span class="stat-value success" id="time-saved">0 min</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Efficiency Score:</span>
                                <span class="stat-value success" id="efficiency-score">85%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activities">
                    <h4>📋 Recent Activities</h4>
                    <div class="activities-list" id="recent-activities-list">
                        <!-- Activities will be populated dynamically -->
                    </div>
                </div>
                
                <div class="upcoming-events">
                    <h4>⏰ Upcoming Events</h4>
                    <div class="events-timeline" id="upcoming-events-timeline">
                        <!-- Events will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render conflicts management tab
     */
    renderConflictsManagement() {
        return `
            <div class="conflicts-management">
                <div class="conflicts-header">
                    <h4>⚠️ Scheduling Conflicts</h4>
                    <div class="conflicts-actions">
                        <button class="btn btn-secondary refresh-conflicts-btn">🔄 Refresh</button>
                        <button class="btn btn-primary auto-resolve-all-btn">✨ Auto-Resolve All</button>
                    </div>
                </div>
                
                <div class="conflicts-filter">
                    <select class="conflict-filter-select">
                        <option value="all">All Conflicts</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                    
                    <select class="conflict-type-filter">
                        <option value="all">All Types</option>
                        <option value="time_overlap">Time Overlaps</option>
                        <option value="resource_conflict">Resource Conflicts</option>
                        <option value="prep_time">Prep Time Issues</option>
                    </select>
                </div>
                
                <div class="conflicts-list" id="conflicts-list">
                    <!-- Conflicts will be populated dynamically -->
                </div>
                
                <div class="conflict-resolution-suggestions">
                    <h4>💡 Resolution Suggestions</h4>
                    <div class="suggestions-grid" id="resolution-suggestions">
                        <!-- Suggestions will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render suggestions management tab
     */
    renderSuggestionsManagement() {
        return `
            <div class="suggestions-management">
                <div class="suggestions-header">
                    <h4>💡 Smart Suggestions</h4>
                    <div class="suggestions-actions">
                        <button class="btn btn-secondary generate-suggestions-btn">🔄 Generate New</button>
                        <button class="btn btn-primary apply-all-suggestions-btn">✅ Apply All</button>
                    </div>
                </div>
                
                <div class="suggestions-categories-grid">
                    <div class="suggestion-category-card">
                        <h5>🛒 Grocery Shopping</h5>
                        <div class="category-suggestions" id="grocery-suggestions-detailed">
                            <!-- Grocery suggestions -->
                        </div>
                    </div>
                    
                    <div class="suggestion-category-card">
                        <h5>👨‍🍳 Meal Prep</h5>
                        <div class="category-suggestions" id="meal-prep-suggestions-detailed">
                            <!-- Meal prep suggestions -->
                        </div>
                    </div>
                    
                    <div class="suggestion-category-card">
                        <h5>⏰ Scheduling</h5>
                        <div class="category-suggestions" id="scheduling-suggestions-detailed">
                            <!-- Scheduling suggestions -->
                        </div>
                    </div>
                    
                    <div class="suggestion-category-card">
                        <h5>🎯 Optimization</h5>
                        <div class="category-suggestions" id="optimization-suggestions-detailed">
                            <!-- Optimization suggestions -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render meal prep planning tab
     */
    renderMealPrepPlanning() {
        return `
            <div class="meal-prep-planning">
                <div class="prep-header">
                    <h4>👨‍🍳 Meal Prep Planning</h4>
                    <button class="btn btn-primary create-prep-session-btn">➕ Create Prep Session</button>
                </div>
                
                <div class="prep-preferences">
                    <h5>⚙️ Prep Preferences</h5>
                    <div class="preferences-grid">
                        <div class="preference-item">
                            <label>Preferred Prep Day:</label>
                            <select id="prep-day-preference">
                                <option value="Sunday">Sunday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Monday">Monday</option>
                            </select>
                        </div>
                        
                        <div class="preference-item">
                            <label>Prep Session Duration:</label>
                            <select id="prep-duration-preference">
                                <option value="60">1 Hour</option>
                                <option value="90">1.5 Hours</option>
                                <option value="120">2 Hours</option>
                                <option value="180">3 Hours</option>
                            </select>
                        </div>
                        
                        <div class="preference-item">
                            <label>Prep Start Time:</label>
                            <input type="time" id="prep-start-time" value="14:00">
                        </div>
                    </div>
                </div>
                
                <div class="prep-sessions">
                    <h5>📅 Scheduled Prep Sessions</h5>
                    <div class="prep-sessions-list" id="prep-sessions-list">
                        <!-- Prep sessions will be populated dynamically -->
                    </div>
                </div>
                
                <div class="prep-recommendations">
                    <h5>💡 Prep Recommendations</h5>
                    <div class="recommendations-list" id="prep-recommendations-list">
                        <!-- Recommendations will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render grocery scheduling tab
     */
    renderGroceryScheduling() {
        return `
            <div class="grocery-scheduling">
                <div class="grocery-header">
                    <h4>🛒 Grocery Shopping Scheduler</h4>
                    <button class="btn btn-primary optimize-grocery-schedule-btn">✨ Optimize Schedule</button>
                </div>
                
                <div class="grocery-preferences">
                    <h5>⚙️ Shopping Preferences</h5>
                    <div class="preferences-grid">
                        <div class="preference-item">
                            <label>Preferred Shopping Day:</label>
                            <select id="grocery-day-preference">
                                <option value="Sunday">Sunday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Friday">Friday</option>
                                <option value="Monday">Monday</option>
                            </select>
                        </div>
                        
                        <div class="preference-item">
                            <label>Shopping Time:</label>
                            <input type="time" id="grocery-time-preference" value="10:00">
                        </div>
                        
                        <div class="preference-item">
                            <label>Preferred Store:</label>
                            <select id="preferred-store">
                                <option value="walmart">Walmart</option>
                                <option value="target">Target</option>
                                <option value="kroger">Kroger</option>
                                <option value="whole-foods">Whole Foods</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="grocery-schedule">
                    <h5>📅 Shopping Schedule</h5>
                    <div class="schedule-calendar" id="grocery-schedule-calendar">
                        <!-- Grocery schedule will be populated dynamically -->
                    </div>
                </div>
                
                <div class="grocery-optimization">
                    <h5>🎯 Shopping Optimization</h5>
                    <div class="optimization-suggestions" id="grocery-optimization-suggestions">
                        <!-- Optimization suggestions will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render calendar preferences tab
     */
    renderCalendarPreferences() {
        return `
            <div class="calendar-preferences">
                <h4>⚙️ Calendar Preferences</h4>
                
                <div class="preferences-sections">
                    <div class="preference-section">
                        <h5>🍽️ Meal Times</h5>
                        <div class="meal-times-grid">
                            <div class="meal-time-item">
                                <label>Breakfast:</label>
                                <input type="time" id="breakfast-time" value="08:00">
                            </div>
                            <div class="meal-time-item">
                                <label>Lunch:</label>
                                <input type="time" id="lunch-time" value="12:00">
                            </div>
                            <div class="meal-time-item">
                                <label>Dinner:</label>
                                <input type="time" id="dinner-time" value="18:00">
                            </div>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h5>⏰ Reminders</h5>
                        <div class="reminder-preferences">
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="meal-prep-reminders" checked>
                                    Meal prep reminders
                                </label>
                            </div>
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="cooking-reminders" checked>
                                    Cooking reminders
                                </label>
                            </div>
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="grocery-reminders" checked>
                                    Grocery shopping reminders
                                </label>
                            </div>
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="conflict-alerts" checked>
                                    Conflict alerts
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h5>🔧 Advanced Settings</h5>
                        <div class="advanced-settings">
                            <div class="preference-item">
                                <label>Prep time advance (minutes):</label>
                                <input type="number" id="prep-time-advance" value="30" min="15" max="120">
                            </div>
                            <div class="preference-item">
                                <label>Conflict threshold (minutes):</label>
                                <input type="number" id="conflict-threshold" value="60" min="15" max="180">
                            </div>
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="auto-conflict-resolution" checked>
                                    Auto-resolve minor conflicts
                                </label>
                            </div>
                            <div class="preference-item">
                                <label>
                                    <input type="checkbox" id="smart-suggestions" checked>
                                    Enable smart suggestions
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind modal event listeners
     */
    bindModalEventListeners(modal) {
        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchModalTab(modal, tabName);
            });
        });
        
        // Close modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Save settings
        modal.querySelector('.save-calendar-settings-btn').addEventListener('click', () => {
            this.saveCalendarSettings(modal);
        });
    }

    /**
     * Switch modal tab
     */
    switchModalTab(modal, tabName) {
        // Update tab buttons
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }

    /**
     * Toggle suggestions panel
     */
    toggleSuggestionsPanel() {
        const panel = document.getElementById('calendar-suggestions-panel');
        if (panel) {
            panel.classList.toggle('collapsed');
            this.suggestionsPanelOpen = !panel.classList.contains('collapsed');
            
            if (this.suggestionsPanelOpen) {
                this.loadSuggestions();
            }
        }
    }

    /**
     * Load and display suggestions
     */
    async loadSuggestions() {
        try {
            // Import enhanced calendar manager
            const { enhancedCalendarManager } = await import('./enhancedCalendarManager.js');
            
            // Get suggestions for next 7 days
            const suggestions = await enhancedCalendarManager.generateDailySuggestions();
            
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    /**
     * Display suggestions in the panel
     */
    displaySuggestions(suggestions) {
        const groceryList = document.getElementById('grocery-suggestions');
        const mealPrepList = document.getElementById('meal-prep-suggestions');
        const schedulingList = document.getElementById('scheduling-suggestions');
        
        if (groceryList) {
            groceryList.innerHTML = suggestions.grocery.map(suggestion => `
                <div class="suggestion-item">
                    <span class="suggestion-text">${suggestion.text}</span>
                    <button class="btn btn-sm btn-primary apply-suggestion-btn" data-suggestion-id="${suggestion.id}">
                        Apply
                    </button>
                </div>
            `).join('');
        }
        
        // Similar for other categories...
    }

    /**
     * Save calendar settings
     */
    async saveCalendarSettings(modal) {
        try {
            const settings = this.collectCalendarSettings(modal);
            
            // Import enhanced calendar manager
            const { enhancedCalendarManager } = await import('./enhancedCalendarManager.js');
            
            // Update preferences
            enhancedCalendarManager.preferences = { ...enhancedCalendarManager.preferences, ...settings.preferences };
            enhancedCalendarManager.notificationSettings = { ...enhancedCalendarManager.notificationSettings, ...settings.notifications };
            
            // Save to storage
            enhancedCalendarManager.saveEnhancedEvents();
            
            // Show success message
            this.showSuccessMessage('Calendar settings saved successfully!');
            
            modal.remove();
        } catch (error) {
            console.error('Error saving calendar settings:', error);
            this.showErrorMessage('Failed to save calendar settings');
        }
    }

    /**
     * Collect settings from modal
     */
    collectCalendarSettings(modal) {
        return {
            preferences: {
                defaultMealTimes: {
                    breakfast: modal.querySelector('#breakfast-time')?.value || '08:00',
                    lunch: modal.querySelector('#lunch-time')?.value || '12:00',
                    dinner: modal.querySelector('#dinner-time')?.value || '18:00'
                },
                prepTimeAdvance: parseInt(modal.querySelector('#prep-time-advance')?.value) || 30,
                conflictThreshold: parseInt(modal.querySelector('#conflict-threshold')?.value) || 60,
                groceryDayPreference: modal.querySelector('#grocery-day-preference')?.value || 'Sunday',
                mealPrepDay: modal.querySelector('#prep-day-preference')?.value || 'Sunday'
            },
            notifications: {
                mealPrepReminders: modal.querySelector('#meal-prep-reminders')?.checked || false,
                groceryReminders: modal.querySelector('#grocery-reminders')?.checked || false,
                conflictAlerts: modal.querySelector('#conflict-alerts')?.checked || false,
                suggestionNotifications: modal.querySelector('#smart-suggestions')?.checked || false
            }
        };
    }

    // Helper methods
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `calendar-message ${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => messageEl.remove(), 3000);
    }
}

// Export singleton instance
export const enhancedCalendarUI = new EnhancedCalendarUI();
