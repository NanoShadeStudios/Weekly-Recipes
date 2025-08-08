/**
 * Built-in Calendar Manager
 * Handles internal calendar functionality for meal planning
 * @fileoverview Built-in calendar for meal planning and scheduling
 * @module Calendar
 */

/**
 * CalendarManager - Manages built-in calendar functionality
 * @class CalendarManager
 */
class CalendarManager {
  /**
   * Initialize the calendar manager
   * @constructor
   */
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.mealEvents = new Map(); // Store meal events by date
    this.reminderEvents = new Map(); // Store reminders by date
    this.viewMode = 'month'; // 'month', 'week', 'day'
    this.weekStartsOnMonday = true;
    
    // Load saved events from localStorage
    this.loadEvents();
    
    console.log('Calendar Manager initialized');
  }

  /**
   * Load calendar events from localStorage
   * @returns {void}
   */
  loadEvents() {
    try {
      const savedMealEvents = localStorage.getItem('calendarMealEvents');
      const savedReminderEvents = localStorage.getItem('calendarReminderEvents');
      
      if (savedMealEvents) {
        const mealData = JSON.parse(savedMealEvents);
        this.mealEvents = new Map(mealData);
      }
      
      if (savedReminderEvents) {
        const reminderData = JSON.parse(savedReminderEvents);
        this.reminderEvents = new Map(reminderData);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }

  /**
   * Save calendar events to localStorage
   * @returns {void}
   */
  saveEvents() {
    try {
      localStorage.setItem('calendarMealEvents', JSON.stringify([...this.mealEvents]));
      localStorage.setItem('calendarReminderEvents', JSON.stringify([...this.reminderEvents]));
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  }

  /**
   * Add meal plan to calendar
   * @param {Array} mealPlan - Weekly meal plan
   * @param {Date} startDate - Starting date for the meal plan
   * @returns {Object} Result of the operation
   */
  addMealPlanToCalendar(mealPlan, startDate = new Date()) {
    try {
      console.log('Adding meal plan to calendar starting:', startDate);
      
      mealPlan.forEach((dayMeals, index) => {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + index);
        const dateKey = this.getDateKey(eventDate);
        
        // Extract meals from different possible formats
        let meals = [];
        if (Array.isArray(dayMeals)) {
          meals = dayMeals.map(meal => typeof meal === 'string' ? meal : meal.name);
        } else if (dayMeals && dayMeals.meals) {
          meals = dayMeals.meals.map(meal => typeof meal === 'string' ? meal : meal.name);
        } else if (typeof dayMeals === 'string') {
          meals = [dayMeals];
        } else if (dayMeals && dayMeals.name) {
          meals = [dayMeals.name];
        }
        
        if (meals.length > 0) {
          // Store meal events
          if (!this.mealEvents.has(dateKey)) {
            this.mealEvents.set(dateKey, []);
          }
          
          const existingMeals = this.mealEvents.get(dateKey);
          meals.forEach(meal => {
            if (meal && !existingMeals.some(existing => existing.title === meal)) {
              existingMeals.push({
                title: meal,
                type: 'meal',
                time: '18:00', // Default dinner time
                id: `meal-${Date.now()}-${Math.random()}`
              });
            }
          });
          
          // Add cooking reminder (30 minutes before)
          this.addReminder(eventDate, {
            title: `Cook: ${meals[0]}`,
            type: 'cooking',
            time: '17:30',
            description: `Time to start cooking ${meals[0]}`
          });
        }
      });
      
      this.saveEvents();
      
      return {
        success: true,
        message: `Meal plan added to calendar starting ${startDate.toDateString()}`
      };
      
    } catch (error) {
      console.error('Error adding meal plan to calendar:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Add a reminder to the calendar
   * @param {Date} date - Date for the reminder
   * @param {Object} reminder - Reminder details
   * @returns {void}
   */
  addReminder(date, reminder) {
    const dateKey = this.getDateKey(date);
    
    if (!this.reminderEvents.has(dateKey)) {
      this.reminderEvents.set(dateKey, []);
    }
    
    const reminders = this.reminderEvents.get(dateKey);
    reminders.push({
      id: `reminder-${Date.now()}-${Math.random()}`,
      ...reminder
    });
    
    this.saveEvents();
  }

  /**
   * Get events for a specific date
   * @param {Date} date - Date to get events for
   * @returns {Object} Events for the date
   */
  getEventsForDate(date) {
    const dateKey = this.getDateKey(date);
    
    return {
      meals: this.mealEvents.get(dateKey) || [],
      reminders: this.reminderEvents.get(dateKey) || []
    };
  }

  /**
   * Get events for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Map} Events grouped by date
   */
  getEventsForRange(startDate, endDate) {
    const events = new Map();
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = this.getDateKey(currentDate);
      const dayEvents = this.getEventsForDate(currentDate);
      
      if (dayEvents.meals.length > 0 || dayEvents.reminders.length > 0) {
        events.set(dateKey, dayEvents);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }

  /**
   * Remove event by ID
   * @param {string} eventId - ID of the event to remove
   * @returns {boolean} Success status
   */
  removeEvent(eventId) {
    // Check meal events
    for (const [dateKey, events] of this.mealEvents) {
      const index = events.findIndex(event => event.id === eventId);
      if (index !== -1) {
        events.splice(index, 1);
        if (events.length === 0) {
          this.mealEvents.delete(dateKey);
        }
        this.saveEvents();
        return true;
      }
    }
    
    // Check reminder events
    for (const [dateKey, events] of this.reminderEvents) {
      const index = events.findIndex(event => event.id === eventId);
      if (index !== -1) {
        events.splice(index, 1);
        if (events.length === 0) {
          this.reminderEvents.delete(dateKey);
        }
        this.saveEvents();
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get formatted date key for storage
   * @param {Date} date - Date to format
   * @returns {string} Formatted date key
   */
  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get calendar grid for current month
   * @returns {Array} Calendar grid data
   */
  getMonthGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    let dayOffset = firstDay.getDay();
    if (this.weekStartsOnMonday) {
      dayOffset = dayOffset === 0 ? 6 : dayOffset - 1;
    }
    startDate.setDate(firstDay.getDate() - dayOffset);
    
    // Generate 6 weeks (42 days) to ensure full calendar grid
    const grid = [];
    const currentDate = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const dateKey = this.getDateKey(currentDate);
        const events = this.getEventsForDate(currentDate);
        
        weekDays.push({
          date: new Date(currentDate),
          dateKey,
          dayNumber: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: this.isToday(currentDate),
          isSelected: this.isSameDate(currentDate, this.selectedDate),
          events: events,
          hasEvents: events.meals.length > 0 || events.reminders.length > 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      grid.push(weekDays);
    }
    
    return grid;
  }

  /**
   * Get week view data
   * @returns {Array} Week data
   */
  getWeekView() {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const events = this.getEventsForDate(date);
      
      weekDays.push({
        date: new Date(date),
        dateKey: this.getDateKey(date),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: this.isToday(date),
        isSelected: this.isSameDate(date, this.selectedDate),
        events: events,
        hasEvents: events.meals.length > 0 || events.reminders.length > 0
      });
    }
    
    return weekDays;
  }

  /**
   * Navigate to next period (month/week)
   * @returns {void}
   */
  next() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
  }

  /**
   * Navigate to previous period (month/week)
   * @returns {void}
   */
  previous() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
  }

  /**
   * Go to today
   * @returns {void}
   */
  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  /**
   * Set view mode
   * @param {string} mode - View mode ('month', 'week', 'day')
   * @returns {void}
   */
  setViewMode(mode) {
    if (['month', 'week', 'day'].includes(mode)) {
      this.viewMode = mode;
    }
  }

  /**
   * Select a date
   * @param {Date} date - Date to select
   * @returns {void}
   */
  selectDate(date) {
    this.selectedDate = new Date(date);
  }

  /**
   * Get start of week for a given date
   * @param {Date} date - Reference date
   * @returns {Date} Start of week
   */
  getStartOfWeek(date) {
    const start = new Date(date);
    let dayOffset = start.getDay();
    
    if (this.weekStartsOnMonday) {
      dayOffset = dayOffset === 0 ? 6 : dayOffset - 1;
    }
    
    start.setDate(start.getDate() - dayOffset);
    return start;
  }

  /**
   * Check if date is today
   * @param {Date} date - Date to check
   * @returns {boolean} Is today
   */
  isToday(date) {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  /**
   * Check if two dates are the same day
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} Are same day
   */
  isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Get current view title
   * @returns {string} Current view title
   */
  getCurrentViewTitle() {
    if (this.viewMode === 'month') {
      return this.currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (this.viewMode === 'week') {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })}`;
    } else {
      return this.currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  /**
   * Clear all events from calendar
   * @returns {void}
   */
  clearAllEvents() {
    this.mealEvents.clear();
    this.reminderEvents.clear();
    this.saveEvents();
  }

  /**
   * Get upcoming meals (next 7 days)
   * @returns {Array} Upcoming meals
   */
  getUpcomingMeals() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingMeals = [];
    const events = this.getEventsForRange(today, nextWeek);
    
    for (const [dateKey, dayEvents] of events) {
      dayEvents.meals.forEach(meal => {
        upcomingMeals.push({
          date: dateKey,
          ...meal
        });
      });
    }
    
    return upcomingMeals.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

}

// Export for use in other modules
export { CalendarManager };
export default CalendarManager;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
  window.CalendarManager = CalendarManager;
}
