/**
 * Built-in Calendar UI Manager
 * Handles the user interface for the built-in calendar functionality
 * @fileoverview UI management for built-in calendar features
 * @module CalendarUI
 */

/**
 * CalendarUI - Manages built-in calendar user interface
 * @class CalendarUI
 */
class CalendarUI {
  /**
   * Initialize the calendar UI manager
   * @constructor
   * @param {CalendarManager} calendarManager - Calendar manager instance
   */
  constructor(calendarManager) {
    this.calendarManager = calendarManager;
    this.isInitialized = false;
    
    console.log('Calendar UI initialized');
  }

  /**
   * Initialize the calendar UI
   * @returns {void}
   */
  init() {
    if (this.isInitialized) return;
    
    this.createCalendarTab();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('Calendar UI fully initialized');
  }

  /**
   * Create the calendar tab content
   * @returns {void}
   */
  createCalendarTab() {
    const calendarTab = document.getElementById('calendar');
    if (!calendarTab) {
      console.error('Calendar tab container not found');
      return;
    }

    calendarTab.innerHTML = this.generateCalendarHTML();
    this.updateCalendarView();
  }

  /**
   * Generate HTML for calendar tab
   * @returns {string} HTML content for calendar tab
   */
  generateCalendarHTML() {
    return `
      <div class="calendar-container">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <h2>🗓️ Meal Planning Calendar</h2>
          <p class="calendar-subtitle">Plan and schedule your meals with our built-in calendar</p>
        </div>

        <!-- Calendar Controls -->
        <div class="calendar-controls">
          <div class="calendar-navigation">
            <button id="prevPeriod" class="nav-btn" aria-label="Previous">
              <span>◀</span>
            </button>
            
            <div class="period-selector">
              <h3 id="currentPeriod" class="period-title">Loading...</h3>
              <button id="todayBtn" class="today-btn">Today</button>
            </div>
            
            <button id="nextPeriod" class="nav-btn" aria-label="Next">
              <span>▶</span>
            </button>
          </div>

          <div class="view-controls">
            <div class="view-mode-selector">
              <button id="monthViewBtn" class="view-btn active" data-view="month">Month</button>
              <button id="weekViewBtn" class="view-btn" data-view="week">Week</button>
              <button id="dayViewBtn" class="view-btn" data-view="day">Day</button>
            </div>
          </div>
        </div>

        <!-- Calendar Actions -->
        <div class="calendar-actions">
          <button id="addMealPlanBtn" class="action-btn primary">
            <span class="btn-icon">📅</span>
            Add Current Meal Plan
          </button>
          <button id="addReminderBtn" class="action-btn secondary">
            <span class="btn-icon">⏰</span>
            Add Reminder
          </button>
          <button id="clearCalendarBtn" class="action-btn secondary">
            <span class="btn-icon">🗑️</span>
            Clear Calendar
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid-container">
          <div id="calendarGrid" class="calendar-grid">
            <!-- Calendar will be rendered here -->
          </div>
        </div>

        <!-- Event Details Panel -->
        <div id="eventDetailsPanel" class="event-details-panel" style="display: none;">
          <div class="panel-header">
            <h4>Event Details</h4>
            <button id="closeEventPanel" class="close-panel-btn">&times;</button>
          </div>
          <div id="eventDetailsContent" class="panel-content">
            <!-- Event details will be shown here -->
          </div>
        </div>

        <!-- Upcoming Meals Section -->
        <div class="upcoming-meals-section">
          <h3>🍽️ Upcoming Meals</h3>
          <div id="upcomingMealsList" class="upcoming-meals-list">
            <!-- Upcoming meals will be listed here -->
          </div>
        </div>

        <!-- Quick Add Modal -->
        <div id="quickAddModal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h4 id="modalTitle">Add Event</h4>
              <button id="closeModal" class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
              <form id="quickAddForm">
                <div class="form-group">
                  <label for="eventTitle">Event Title:</label>
                  <input type="text" id="eventTitle" required>
                </div>
                
                <div class="form-group">
                  <label for="eventDate">Date:</label>
                  <input type="date" id="eventDate" required>
                </div>
                
                <div class="form-group">
                  <label for="eventTime">Time:</label>
                  <input type="time" id="eventTime" value="18:00">
                </div>
                
                <div class="form-group">
                  <label for="eventType">Type:</label>
                  <select id="eventType">
                    <option value="meal">Meal</option>
                    <option value="cooking">Cooking Reminder</option>
                    <option value="shopping">Shopping Reminder</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="eventDescription">Description (optional):</label>
                  <textarea id="eventDescription" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                  <button type="button" id="cancelAdd" class="btn secondary">Cancel</button>
                  <button type="submit" id="confirmAdd" class="btn primary">Add Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update the calendar view based on current settings
   * @returns {void}
   */
  updateCalendarView() {
    const currentPeriodElement = document.getElementById('currentPeriod');
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (!currentPeriodElement || !calendarGrid) return;

    // Update period title
    currentPeriodElement.textContent = this.calendarManager.getCurrentViewTitle();

    // Generate calendar grid based on view mode
    if (this.calendarManager.viewMode === 'month') {
      this.renderMonthView(calendarGrid);
    } else if (this.calendarManager.viewMode === 'week') {
      this.renderWeekView(calendarGrid);
    } else if (this.calendarManager.viewMode === 'day') {
      this.renderDayView(calendarGrid);
    }

    // Update upcoming meals
    this.updateUpcomingMeals();
  }

  /**
   * Render month view
   * @param {HTMLElement} container - Container element
   * @returns {void}
   */
  renderMonthView(container) {
    const monthGrid = this.calendarManager.getMonthGrid();
    
    let html = `
      <div class="calendar-month-view">
        <div class="calendar-weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>
        
        <div class="calendar-days">
    `;
    
    monthGrid.forEach(week => {
      week.forEach(day => {
        const dayClasses = [
          'calendar-day',
          day.isCurrentMonth ? 'current-month' : 'other-month',
          day.isToday ? 'today' : '',
          day.isSelected ? 'selected' : '',
          day.hasEvents ? 'has-events' : ''
        ].filter(cls => cls).join(' ');
        
        html += `
          <div class="${dayClasses}" data-date="${day.dateKey}">
            <div class="day-number">${day.dayNumber}</div>
            <div class="day-events">
              ${this.renderDayEvents(day.events)}
            </div>
          </div>
        `;
      });
    });
    
    html += `
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  /**
   * Render week view
   * @param {HTMLElement} container - Container element
   * @returns {void}
   */
  renderWeekView(container) {
    const weekDays = this.calendarManager.getWeekView();
    
    let html = `
      <div class="calendar-week-view">
        <div class="week-days">
    `;
    
    weekDays.forEach(day => {
      const dayClasses = [
        'week-day',
        day.isToday ? 'today' : '',
        day.isSelected ? 'selected' : '',
        day.hasEvents ? 'has-events' : ''
      ].filter(cls => cls).join(' ');
      
      html += `
        <div class="${dayClasses}" data-date="${day.dateKey}">
          <div class="day-header">
            <div class="day-name">${day.dayName}</div>
            <div class="day-number">${day.dayNumber}</div>
          </div>
          <div class="day-events-list">
            ${this.renderDetailedDayEvents(day.events)}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  /**
   * Render day view
   * @param {HTMLElement} container - Container element
   * @returns {void}
   */
  renderDayView(container) {
    const selectedDate = this.calendarManager.selectedDate;
    const events = this.calendarManager.getEventsForDate(selectedDate);
    
    const html = `
      <div class="calendar-day-view">
        <div class="day-view-header">
          <h3>${selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
        </div>
        
        <div class="day-view-content">
          <div class="time-slots">
            ${this.renderTimeSlots(events)}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  /**
   * Render events for a day (compact view)
   * @param {Object} events - Day events
   * @returns {string} HTML for day events
   */
  renderDayEvents(events) {
    let html = '';
    
    // Show meals first
    events.meals.forEach(meal => {
      html += `
        <div class="event-dot meal-event" title="${meal.title} at ${meal.time}">
          🍽️
        </div>
      `;
    });
    
    // Show reminders
    events.reminders.forEach(reminder => {
      const icon = reminder.type === 'cooking' ? '👨‍🍳' : '⏰';
      html += `
        <div class="event-dot reminder-event" title="${reminder.title} at ${reminder.time}">
          ${icon}
        </div>
      `;
    });
    
    return html;
  }

  /**
   * Render detailed events for a day
   * @param {Object} events - Day events
   * @returns {string} HTML for detailed day events
   */
  renderDetailedDayEvents(events) {
    let html = '';
    
    // Combine and sort all events by time
    const allEvents = [
      ...events.meals.map(event => ({...event, category: 'meal'})),
      ...events.reminders.map(event => ({...event, category: 'reminder'}))
    ].sort((a, b) => a.time.localeCompare(b.time));
    
    allEvents.forEach(event => {
      const icon = event.category === 'meal' ? '🍽️' : 
                   event.type === 'cooking' ? '👨‍🍳' : '⏰';
      
      html += `
        <div class="event-item ${event.category}-event" data-event-id="${event.id}">
          <div class="event-time">${event.time}</div>
          <div class="event-content">
            <span class="event-icon">${icon}</span>
            <span class="event-title">${event.title}</span>
          </div>
        </div>
      `;
    });
    
    if (html === '') {
      html = '<div class="no-events">No events</div>';
    }
    
    return html;
  }

  /**
   * Render time slots for day view
   * @param {Object} events - Day events
   * @returns {string} HTML for time slots
   */
  renderTimeSlots(events) {
    let html = '';
    
    // Create time slots from 6 AM to 11 PM
    for (let hour = 6; hour <= 23; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const displayTime = hour > 12 ? `${hour - 12}:00 PM` : 
                         hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
      
      // Find events for this time slot
      const slotEvents = [
        ...events.meals.filter(event => event.time.startsWith(timeString.slice(0, 2))),
        ...events.reminders.filter(event => event.time.startsWith(timeString.slice(0, 2)))
      ];
      
      html += `
        <div class="time-slot" data-time="${timeString}">
          <div class="time-label">${displayTime}</div>
          <div class="slot-events">
            ${slotEvents.map(event => `
              <div class="slot-event ${event.type || 'meal'}-event" data-event-id="${event.id}">
                <span class="event-title">${event.title}</span>
                ${event.description ? `<span class="event-description">${event.description}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Update upcoming meals list
   * @returns {void}
   */
  updateUpcomingMeals() {
    const upcomingMealsList = document.getElementById('upcomingMealsList');
    if (!upcomingMealsList) return;

    const upcomingMeals = this.calendarManager.getUpcomingMeals();
    
    if (upcomingMeals.length === 0) {
      upcomingMealsList.innerHTML = `
        <div class="no-upcoming-meals">
          <p>No upcoming meals scheduled</p>
          <p>Add your meal plan to the calendar to see upcoming meals here!</p>
        </div>
      `;
      return;
    }

    const html = upcomingMeals.slice(0, 5).map(meal => {
      const date = new Date(meal.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      return `
        <div class="upcoming-meal-item">
          <div class="meal-date">${formattedDate}</div>
          <div class="meal-info">
            <div class="meal-title">${meal.title}</div>
            <div class="meal-time">${meal.time}</div>
          </div>
        </div>
      `;
    }).join('');

    upcomingMealsList.innerHTML = html;
  }

  /**
   * Setup event listeners for calendar UI
   * @returns {void}
   */
  setupEventListeners() {
    // Navigation controls
    const prevBtn = document.getElementById('prevPeriod');
    const nextBtn = document.getElementById('nextPeriod');
    const todayBtn = document.getElementById('todayBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.calendarManager.previous();
        this.updateCalendarView();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.calendarManager.next();
        this.updateCalendarView();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.calendarManager.goToToday();
        this.updateCalendarView();
      });
    }

    // View mode buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Change view mode
        this.calendarManager.setViewMode(btn.dataset.view);
        this.updateCalendarView();
      });
    });

    // Action buttons
    const addMealPlanBtn = document.getElementById('addMealPlanBtn');
    const addReminderBtn = document.getElementById('addReminderBtn');
    const clearCalendarBtn = document.getElementById('clearCalendarBtn');

    if (addMealPlanBtn) {
      addMealPlanBtn.addEventListener('click', () => {
        this.handleAddMealPlan();
      });
    }

    if (addReminderBtn) {
      addReminderBtn.addEventListener('click', () => {
        this.showQuickAddModal('reminder');
      });
    }

    if (clearCalendarBtn) {
      clearCalendarBtn.addEventListener('click', () => {
        this.handleClearCalendar();
      });
    }

    // Calendar day clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.calendar-day')) {
        const dayElement = e.target.closest('.calendar-day');
        const dateKey = dayElement.dataset.date;
        const date = new Date(dateKey);
        this.calendarManager.selectDate(date);
        this.updateCalendarView();
      }
    });

    // Event clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.event-item, .slot-event')) {
        const eventElement = e.target.closest('.event-item, .slot-event');
        const eventId = eventElement.dataset.eventId;
        this.showEventDetails(eventId);
      }
    });

    // Modal controls
    this.setupModalListeners();
  }

  /**
   * Setup modal event listeners
   * @returns {void}
   */
  setupModalListeners() {
    const modal = document.getElementById('quickAddModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelAdd');
    const form = document.getElementById('quickAddForm');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideQuickAddModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideQuickAddModal();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleQuickAdd();
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideQuickAddModal();
        }
      });
    }
  }

  /**
   * Handle adding current meal plan to calendar
   * @returns {void}
   */
  handleAddMealPlan() {
    const currentMealPlan = window.currentMealPlan || [];
    
    if (currentMealPlan.length === 0) {
      this.showNotification('No meal plan available. Please generate a meal plan first.', 'error');
      return;
    }

    const result = this.calendarManager.addMealPlanToCalendar(currentMealPlan);
    
    if (result.success) {
      this.showNotification(result.message, 'success');
      this.updateCalendarView();
    } else {
      this.showNotification(result.message, 'error');
    }
  }

  /**
   * Handle clearing the calendar
   * @returns {void}
   */
  handleClearCalendar() {
    if (confirm('Are you sure you want to clear all events from the calendar?')) {
      this.calendarManager.clearAllEvents();
      this.updateCalendarView();
      this.showNotification('Calendar cleared successfully', 'success');
    }
  }

  /**
   * Show quick add modal
   * @param {string} type - Type of event to add
   * @returns {void}
   */
  showQuickAddModal(type = 'meal') {
    const modal = document.getElementById('quickAddModal');
    const eventTypeSelect = document.getElementById('eventType');
    const eventDateInput = document.getElementById('eventDate');
    
    if (modal) {
      // Set default date to selected date
      if (eventDateInput) {
        eventDateInput.value = this.calendarManager.getDateKey(this.calendarManager.selectedDate);
      }
      
      // Set default event type
      if (eventTypeSelect) {
        eventTypeSelect.value = type;
      }
      
      modal.style.display = 'block';
    }
  }

  /**
   * Hide quick add modal
   * @returns {void}
   */
  hideQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    const form = document.getElementById('quickAddForm');
    
    if (modal) {
      modal.style.display = 'none';
    }
    
    if (form) {
      form.reset();
    }
  }

  /**
   * Handle quick add form submission
   * @returns {void}
   */
  handleQuickAdd() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const type = document.getElementById('eventType').value;
    const description = document.getElementById('eventDescription').value;

    if (!title || !date || !time) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    const eventDate = new Date(date);
    const event = {
      title,
      type,
      time,
      description
    };

    if (type === 'meal') {
      this.calendarManager.addMealToDate(eventDate, event);
    } else {
      this.calendarManager.addReminder(eventDate, event);
    }

    this.hideQuickAddModal();
    this.updateCalendarView();
    this.showNotification('Event added successfully', 'success');
  }

  /**
   * Show event details
   * @param {string} eventId - Event ID
   * @returns {void}
   */
  showEventDetails(eventId) {
    // Implementation would show event details in a panel
    console.log('Show event details for:', eventId);
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   * @returns {void}
   */
  showNotification(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Refresh the calendar view
   * @returns {void}
   */
  refresh() {
    this.updateCalendarView();
  }
}

// Export for use in other modules
export { CalendarUI };
export default CalendarUI;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
  window.CalendarUI = CalendarUI;
}
