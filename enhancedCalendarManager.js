/**
 * Enhanced Calendar Integration Manager
 * Advanced calendar functionality with meal prep reminders, grocery suggestions,
 * conflict detection, and intelligent scheduling features.
 */

export class EnhancedCalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.mealEvents = new Map();
        this.reminderEvents = new Map();
        this.groceryEvents = new Map();
        this.prepEvents = new Map();
        this.conflictDetection = true;
        this.smartSuggestions = true;
        
        // Notification settings
        this.notificationSettings = {
            mealPrepReminders: true,
            groceryReminders: true,
            conflictAlerts: true,
            suggestionNotifications: true
        };
        
        // User preferences for timing
        this.preferences = {
            defaultMealTimes: {
                breakfast: '08:00',
                lunch: '12:00',
                dinner: '18:00'
            },
            prepTimeAdvance: 30, // minutes before cooking
            groceryDayPreference: 'Sunday',
            mealPrepDay: 'Sunday',
            conflictThreshold: 60 // minutes
        };
        
        this.loadEnhancedEvents();
        this.initializeEnhancedFeatures();
        
        console.log('Enhanced Calendar Manager initialized');
    }

    /**
     * Load all enhanced calendar events and settings
     */
    loadEnhancedEvents() {
        try {
            // Load existing events
            const savedMealEvents = localStorage.getItem('enhancedCalendarMealEvents');
            const savedReminderEvents = localStorage.getItem('enhancedCalendarReminderEvents');
            const savedGroceryEvents = localStorage.getItem('enhancedCalendarGroceryEvents');
            const savedPrepEvents = localStorage.getItem('enhancedCalendarPrepEvents');
            const savedPreferences = localStorage.getItem('enhancedCalendarPreferences');
            const savedNotificationSettings = localStorage.getItem('enhancedCalendarNotifications');
            
            if (savedMealEvents) this.mealEvents = new Map(JSON.parse(savedMealEvents));
            if (savedReminderEvents) this.reminderEvents = new Map(JSON.parse(savedReminderEvents));
            if (savedGroceryEvents) this.groceryEvents = new Map(JSON.parse(savedGroceryEvents));
            if (savedPrepEvents) this.prepEvents = new Map(JSON.parse(savedPrepEvents));
            if (savedPreferences) this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
            if (savedNotificationSettings) this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(savedNotificationSettings) };
            
        } catch (error) {
            console.error('Error loading enhanced calendar events:', error);
        }
    }

    /**
     * Save all enhanced calendar data
     */
    saveEnhancedEvents() {
        try {
            localStorage.setItem('enhancedCalendarMealEvents', JSON.stringify([...this.mealEvents]));
            localStorage.setItem('enhancedCalendarReminderEvents', JSON.stringify([...this.reminderEvents]));
            localStorage.setItem('enhancedCalendarGroceryEvents', JSON.stringify([...this.groceryEvents]));
            localStorage.setItem('enhancedCalendarPrepEvents', JSON.stringify([...this.prepEvents]));
            localStorage.setItem('enhancedCalendarPreferences', JSON.stringify(this.preferences));
            localStorage.setItem('enhancedCalendarNotifications', JSON.stringify(this.notificationSettings));
        } catch (error) {
            console.error('Error saving enhanced calendar events:', error);
        }
    }

    /**
     * Initialize enhanced calendar features
     */
    initializeEnhancedFeatures() {
        // Set up periodic conflict detection
        setInterval(() => this.detectAndResolveConflicts(), 5 * 60 * 1000); // Every 5 minutes
        
        // Set up daily suggestion generation
        this.scheduleDailySuggestions();
        
        // Initialize notification system
        this.initializeNotifications();
    }

    /**
     * Public API method for external initialization
     */
    async initializeEnhancedCalendar() {
        try {
            this.initializeEnhancedFeatures();
            console.log('Enhanced Calendar: External initialization completed');
        } catch (error) {
            console.error('Enhanced Calendar: External initialization failed:', error);
        }
    }

    /**
     * Add enhanced meal plan with intelligent scheduling
     */
    async addEnhancedMealPlan(mealPlan, startDate = new Date()) {
        console.log('🗓️ Adding enhanced meal plan with intelligent scheduling...');
        
        try {
            const conflicts = [];
            const suggestions = [];
            const addedEvents = [];
            
            for (let i = 0; i < mealPlan.length; i++) {
                const day = mealPlan[i];
                const eventDate = new Date(startDate);
                eventDate.setDate(startDate.getDate() + i);
                const dateKey = this.getDateKey(eventDate);
                
                if (!this.mealEvents.has(dateKey)) {
                    this.mealEvents.set(dateKey, []);
                }
                
                // Add meals with conflict detection
                const dayConflicts = await this.addMealsWithConflictDetection(eventDate, day.meals);
                conflicts.push(...dayConflicts);
                
                // Generate prep reminders
                const prepReminders = this.generateMealPrepReminders(eventDate, day.meals);
                addedEvents.push(...prepReminders);
                
                // Add cooking reminders
                const cookingReminders = this.generateCookingReminders(eventDate, day.meals);
                addedEvents.push(...cookingReminders);
            }
            
            // Generate grocery shopping suggestions
            const grocerySuggestions = this.generateGroceryShoppingSuggestions(mealPlan, startDate);
            suggestions.push(...grocerySuggestions);
            
            // Generate meal prep day suggestions
            const mealPrepSuggestions = this.generateMealPrepSuggestions(mealPlan, startDate);
            suggestions.push(...mealPrepSuggestions);
            
            this.saveEnhancedEvents();
            
            return {
                success: true,
                conflicts,
                suggestions,
                addedEvents: addedEvents.length,
                message: `Enhanced meal plan added with ${addedEvents.length} intelligent reminders`
            };
            
        } catch (error) {
            console.error('❌ Error adding enhanced meal plan:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Add meals with intelligent conflict detection
     */
    async addMealsWithConflictDetection(date, meals) {
        const dateKey = this.getDateKey(date);
        const conflicts = [];
        const existingMeals = this.mealEvents.get(dateKey) || [];
        
        meals.forEach((meal, index) => {
            if (!meal) return;
            
            const mealType = this.getMealType(index);
            const defaultTime = this.preferences.defaultMealTimes[mealType] || '18:00';
            
            // Check for time conflicts
            const conflict = this.detectTimeConflict(date, defaultTime, meal);
            if (conflict) {
                conflicts.push(conflict);
                // Suggest alternative time
                const alternativeTime = this.suggestAlternativeTime(date, defaultTime);
                conflict.suggestedTime = alternativeTime;
            }
            
            // Add meal event
            const mealEvent = {
                id: `enhanced-meal-${Date.now()}-${Math.random()}`,
                title: meal,
                type: 'meal',
                mealType,
                time: conflict ? conflict.suggestedTime : defaultTime,
                date: dateKey,
                cookingTime: this.estimateCookingTime(meal),
                prepTime: this.estimatePrepTime(meal),
                difficulty: this.estimateDifficulty(meal)
            };
            
            existingMeals.push(mealEvent);
        });
        
        this.mealEvents.set(dateKey, existingMeals);
        return conflicts;
    }

    /**
     * Detect time conflicts for meal scheduling
     */
    detectTimeConflict(date, proposedTime, mealName) {
        const dateKey = this.getDateKey(date);
        const existingEvents = [
            ...(this.mealEvents.get(dateKey) || []),
            ...(this.reminderEvents.get(dateKey) || []),
            ...(this.prepEvents.get(dateKey) || [])
        ];
        
        const proposedDateTime = this.parseDateTime(date, proposedTime);
        const cookingTime = this.estimateCookingTime(mealName);
        const prepTime = this.estimatePrepTime(mealName);
        const totalTime = cookingTime + prepTime;
        
        for (const event of existingEvents) {
            const eventDateTime = this.parseDateTime(date, event.time);
            const eventDuration = event.duration || 60; // Default 1 hour
            
            // Check if times overlap
            const timeDiff = Math.abs(proposedDateTime - eventDateTime);
            if (timeDiff < this.preferences.conflictThreshold * 60 * 1000) {
                return {
                    type: 'time_conflict',
                    conflictingEvent: event,
                    proposedTime,
                    conflictingTime: event.time,
                    mealName,
                    severity: this.calculateConflictSeverity(timeDiff, totalTime)
                };
            }
        }
        
        return null;
    }

    /**
     * Suggest alternative time to avoid conflicts
     */
    suggestAlternativeTime(date, originalTime) {
        const originalDateTime = this.parseDateTime(date, originalTime);
        const timeSlots = this.generateTimeSlots();
        
        for (const timeSlot of timeSlots) {
            const slotDateTime = this.parseDateTime(date, timeSlot);
            const timeDiff = Math.abs(slotDateTime - originalDateTime);
            
            // Find closest available time slot
            if (timeDiff > this.preferences.conflictThreshold * 60 * 1000) {
                if (!this.detectTimeConflict(date, timeSlot, 'temp')) {
                    return timeSlot;
                }
            }
        }
        
        // If no slots available, suggest next day
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        return originalTime; // Return original time for next day
    }

    /**
     * Generate meal prep reminders
     */
    generateMealPrepReminders(date, meals) {
        const prepReminders = [];
        const dateKey = this.getDateKey(date);
        
        if (!this.prepEvents.has(dateKey)) {
            this.prepEvents.set(dateKey, []);
        }
        
        meals.forEach((meal, index) => {
            if (!meal) return;
            
            const prepTime = this.estimatePrepTime(meal);
            const difficulty = this.estimateDifficulty(meal);
            
            // Create prep reminder if meal requires significant prep
            if (prepTime > 15 || difficulty > 2) {
                const reminderTime = this.calculatePrepReminderTime(date, meal, index);
                
                const prepReminder = {
                    id: `prep-${Date.now()}-${Math.random()}`,
                    title: `Prep: ${meal}`,
                    type: 'meal_prep',
                    time: reminderTime,
                    date: dateKey,
                    description: this.generatePrepInstructions(meal, prepTime),
                    priority: difficulty > 3 ? 'high' : 'medium',
                    estimatedDuration: prepTime
                };
                
                this.prepEvents.get(dateKey).push(prepReminder);
                prepReminders.push(prepReminder);
            }
        });
        
        return prepReminders;
    }

    /**
     * Generate cooking reminders
     */
    generateCookingReminders(date, meals) {
        const cookingReminders = [];
        const dateKey = this.getDateKey(date);
        
        if (!this.reminderEvents.has(dateKey)) {
            this.reminderEvents.set(dateKey, []);
        }
        
        meals.forEach((meal, index) => {
            if (!meal) return;
            
            const mealType = this.getMealType(index);
            const mealTime = this.preferences.defaultMealTimes[mealType];
            const cookingTime = this.estimateCookingTime(meal);
            const prepAdvance = this.preferences.prepTimeAdvance;
            
            // Calculate reminder time (prep time + cooking time before meal)
            const reminderTime = this.calculateCookingReminderTime(mealTime, cookingTime, prepAdvance);
            
            const cookingReminder = {
                id: `cooking-${Date.now()}-${Math.random()}`,
                title: `Start Cooking: ${meal}`,
                type: 'cooking_reminder',
                time: reminderTime,
                date: dateKey,
                description: `Time to start cooking ${meal} for ${mealType}`,
                mealType,
                estimatedCookingTime: cookingTime,
                priority: 'medium'
            };
            
            this.reminderEvents.get(dateKey).push(cookingReminder);
            cookingReminders.push(cookingReminder);
        });
        
        return cookingReminders;
    }

    /**
     * Generate grocery shopping suggestions
     */
    generateGroceryShoppingSuggestions(mealPlan, startDate) {
        const suggestions = [];
        
        // Calculate best grocery shopping day
        const bestGroceryDay = this.calculateBestGroceryDay(mealPlan, startDate);
        const groceryDate = this.getGroceryShoppingDate(bestGroceryDay, startDate);
        const dateKey = this.getDateKey(groceryDate);
        
        if (!this.groceryEvents.has(dateKey)) {
            this.groceryEvents.set(dateKey, []);
        }
        
        // Analyze meal plan for grocery needs
        const groceryAnalysis = this.analyzeMealPlanForGroceries(mealPlan);
        
        const grocerySuggestion = {
            id: `grocery-${Date.now()}-${Math.random()}`,
            title: '🛒 Grocery Shopping',
            type: 'grocery_shopping',
            time: '10:00', // Morning shopping
            date: dateKey,
            description: `Shop for ${groceryAnalysis.totalItems} items for the week`,
            priority: 'high',
            estimatedDuration: groceryAnalysis.estimatedShoppingTime,
            categories: groceryAnalysis.categories,
            specialItems: groceryAnalysis.specialItems,
            budgetEstimate: groceryAnalysis.budgetEstimate
        };
        
        this.groceryEvents.get(dateKey).push(grocerySuggestion);
        suggestions.push({
            type: 'grocery_shopping',
            date: groceryDate,
            suggestion: grocerySuggestion,
            reasoning: `Best day for grocery shopping based on meal plan and your preferences`
        });
        
        return suggestions;
    }

    /**
     * Generate meal prep suggestions
     */
    generateMealPrepSuggestions(mealPlan, startDate) {
        const suggestions = [];
        const mealPrepDay = this.preferences.mealPrepDay;
        const prepDate = this.getMealPrepDate(mealPrepDay, startDate);
        const dateKey = this.getDateKey(prepDate);
        
        if (!this.prepEvents.has(dateKey)) {
            this.prepEvents.set(dateKey, []);
        }
        
        // Analyze which meals benefit from advance prep
        const prepAnalysis = this.analyzeMealPlanForPrep(mealPlan);
        
        if (prepAnalysis.preppableMeals.length > 0) {
            const mealPrepSuggestion = {
                id: `meal-prep-${Date.now()}-${Math.random()}`,
                title: '👨‍🍳 Weekly Meal Prep',
                type: 'meal_prep_session',
                time: '14:00', // Afternoon prep
                date: dateKey,
                description: `Prep ${prepAnalysis.preppableMeals.length} meals for the week`,
                priority: 'medium',
                estimatedDuration: prepAnalysis.totalPrepTime,
                meals: prepAnalysis.preppableMeals,
                instructions: prepAnalysis.prepInstructions,
                tools: prepAnalysis.requiredTools
            };
            
            this.prepEvents.get(dateKey).push(mealPrepSuggestion);
            suggestions.push({
                type: 'meal_prep_session',
                date: prepDate,
                suggestion: mealPrepSuggestion,
                reasoning: `Meal prep day to save time during the week`
            });
        }
        
        return suggestions;
    }

    /**
     * Detect and resolve calendar conflicts
     */
    detectAndResolveConflicts() {
        const conflicts = [];
        const today = new Date();
        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);
        
        // Check next 7 days for conflicts
        for (let d = new Date(today); d <= oneWeekFromNow; d.setDate(d.getDate() + 1)) {
            const dayConflicts = this.detectDayConflicts(d);
            conflicts.push(...dayConflicts);
        }
        
        if (conflicts.length > 0 && this.notificationSettings.conflictAlerts) {
            this.showConflictNotification(conflicts);
        }
        
        return conflicts;
    }

    /**
     * Detect conflicts for a specific day
     */
    detectDayConflicts(date) {
        const dateKey = this.getDateKey(date);
        const conflicts = [];
        
        const allEvents = [
            ...(this.mealEvents.get(dateKey) || []).map(e => ({ ...e, category: 'meal' })),
            ...(this.reminderEvents.get(dateKey) || []).map(e => ({ ...e, category: 'reminder' })),
            ...(this.prepEvents.get(dateKey) || []).map(e => ({ ...e, category: 'prep' })),
            ...(this.groceryEvents.get(dateKey) || []).map(e => ({ ...e, category: 'grocery' }))
        ];
        
        // Sort events by time
        allEvents.sort((a, b) => this.parseDateTime(date, a.time) - this.parseDateTime(date, b.time));
        
        // Check for overlapping events
        for (let i = 0; i < allEvents.length - 1; i++) {
            const currentEvent = allEvents[i];
            const nextEvent = allEvents[i + 1];
            
            const currentEnd = this.calculateEventEndTime(date, currentEvent);
            const nextStart = this.parseDateTime(date, nextEvent.time);
            
            if (currentEnd > nextStart) {
                conflicts.push({
                    type: 'overlap_conflict',
                    date: dateKey,
                    event1: currentEvent,
                    event2: nextEvent,
                    overlapDuration: (currentEnd - nextStart) / (1000 * 60), // minutes
                    severity: this.calculateConflictSeverity(currentEnd - nextStart, 30)
                });
            }
        }
        
        return conflicts;
    }

    /**
     * Show conflict notification to user
     */
    showConflictNotification(conflicts) {
        const highPriorityConflicts = conflicts.filter(c => c.severity === 'high');
        
        if (highPriorityConflicts.length > 0) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'calendar-conflict-notification high-priority';
            notification.innerHTML = `
                <div class="notification-header">
                    ⚠️ Calendar Conflicts Detected
                    <button class="notification-close">&times;</button>
                </div>
                <div class="notification-body">
                    <p>Found ${conflicts.length} scheduling conflicts in your meal plan.</p>
                    <button class="btn btn-primary view-conflicts-btn">View & Resolve</button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => notification.remove(), 10000);
            
            // Add event listeners
            notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
            notification.querySelector('.view-conflicts-btn').addEventListener('click', () => {
                this.showConflictResolutionModal(conflicts);
                notification.remove();
            });
        }
    }

    /**
     * Show conflict resolution modal
     */
    showConflictResolutionModal(conflicts) {
        const modal = document.createElement('div');
        modal.className = 'calendar-conflict-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Resolve Calendar Conflicts</h2>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="conflicts-list">
                    ${conflicts.map(conflict => this.renderConflictItem(conflict)).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary auto-resolve-btn">Auto-Resolve All</button>
                    <button class="btn btn-primary manual-resolve-btn">Resolve Manually</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.auto-resolve-btn').addEventListener('click', () => {
            this.autoResolveConflicts(conflicts);
            modal.remove();
        });
    }

    // Helper methods
    getMealType(index) {
        const types = ['breakfast', 'lunch', 'dinner'];
        return types[index] || 'dinner';
    }

    estimateCookingTime(meal) {
        // Simple heuristic based on meal complexity
        const complexWords = ['roast', 'bake', 'braise', 'slow', 'marinade'];
        const quickWords = ['salad', 'sandwich', 'wrap', 'smoothie'];
        
        const mealLower = meal.toLowerCase();
        
        if (quickWords.some(word => mealLower.includes(word))) return 15;
        if (complexWords.some(word => mealLower.includes(word))) return 90;
        
        return 45; // Default cooking time
    }

    estimatePrepTime(meal) {
        const mealLower = meal.toLowerCase();
        
        if (mealLower.includes('salad')) return 20;
        if (mealLower.includes('stir fry')) return 25;
        if (mealLower.includes('roast')) return 30;
        
        return 15; // Default prep time
    }

    estimateDifficulty(meal) {
        const complexWords = ['gourmet', 'stuffed', 'marinated', 'braised'];
        const simpleWords = ['simple', 'easy', 'quick'];
        
        const mealLower = meal.toLowerCase();
        
        if (simpleWords.some(word => mealLower.includes(word))) return 1;
        if (complexWords.some(word => mealLower.includes(word))) return 4;
        
        return 2; // Default difficulty
    }

    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    parseDateTime(date, timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);
        return dateTime;
    }

    calculateConflictSeverity(timeDiff, duration) {
        const overlapPercentage = (timeDiff / (duration * 60 * 1000)) * 100;
        
        if (overlapPercentage > 50) return 'high';
        if (overlapPercentage > 25) return 'medium';
        return 'low';
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 6; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return slots;
    }

    initializeNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    scheduleDailySuggestions() {
        // Schedule daily suggestion generation
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0); // 8 AM tomorrow
        
        const timeUntilTomorrow = tomorrow - now;
        
        setTimeout(() => {
            this.generateDailySuggestions();
            // Repeat every 24 hours
            setInterval(() => this.generateDailySuggestions(), 24 * 60 * 60 * 1000);
        }, timeUntilTomorrow);
    }

    generateDailySuggestions() {
        // Generate daily meal and shopping suggestions
        console.log('Generating daily suggestions...');
        // Implementation would go here
    }
}

// Export singleton instance
export const enhancedCalendarManager = new EnhancedCalendarManager();
