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
   * Initialize the calendar integration UI
   * @returns {void}
   */
  init() {
    if (this.isInitialized) return;
    
    this.createCalendarTab();
    this.updateCalendarServicesGrid();
    this.loadCurrentSettings();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('Calendar Integration UI fully initialized');
  }

  /**
   * Create the calendar integration tab content
   * @returns {void}
   */
  createCalendarTab() {
    const calendarTab = document.getElementById('calendar');
    if (!calendarTab) {
      console.error('Calendar tab container not found');
      return;
    }

    calendarTab.innerHTML = this.generateCalendarTabHTML();
    this.updateIntegrationList();
  }

  /**
   * Generate HTML for calendar integration tab
   * @returns {string} HTML content for calendar tab
   */
  generateCalendarTabHTML() {
    return `
      <div class="calendar-integration-container">
        <!-- Header Section -->
        <div class="calendar-header">
          <h2>📅 Calendar Integration</h2>
          <p class="calendar-subtitle">Sync your meal plans with your favorite calendar apps</p>
        </div>

        <!-- Integration Status Section -->
        <div class="integration-status-section">
          <h3>Active Integrations</h3>
          <div class="active-integrations-list" id="active-integrations-list">
            <!-- Dynamic content will be inserted here -->
          </div>
        </div>

        <!-- Available Calendars Section -->
        <div class="available-calendars-section">
          <h3>Available Calendar Services</h3>
          <div class="calendar-services-grid" id="calendar-services-grid">
            <!-- Dynamic content will be inserted here -->
          </div>
        </div>

        <!-- Sync Settings Section -->
        <div class="sync-settings-section">
          <h3>⚙️ Sync Settings</h3>
          <div class="settings-grid">
            <div class="setting-group">
              <label class="setting-label">
                <input type="checkbox" id="auto-sync-checkbox" class="setting-checkbox">
                <span class="checkmark"></span>
                Auto-sync meal plans to calendar
              </label>
              <p class="setting-description">Automatically add new meal plans to your calendar</p>
            </div>

            <div class="setting-group">
              <label class="setting-label">Sync Direction:</label>
              <select id="sync-direction-select" class="setting-select">
                <option value="meal-to-calendar">Meals → Calendar</option>
                <option value="calendar-to-meal">Calendar → Meals</option>
                <option value="bidirectional">Bidirectional</option>
              </select>
              <p class="setting-description">Choose how data syncs between apps</p>
            </div>

            <div class="setting-group">
              <label class="setting-label">
                <input type="checkbox" id="prep-reminder-checkbox" class="setting-checkbox">
                <span class="checkmark"></span>
                Preparation reminders
              </label>
              <div class="sub-setting">
                <label>Remind me 
                  <select id="prep-reminder-time" class="time-select">
                    <option value="15">15 minutes</option>
                    <option value="30" selected>30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                  before meal time
                </label>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">
                <input type="checkbox" id="shopping-reminder-checkbox" class="setting-checkbox">
                <span class="checkmark"></span>
                Shopping reminders
              </label>
              <div class="sub-setting">
                <label>Remind me 
                  <select id="shopping-reminder-days" class="time-select">
                    <option value="1" selected>1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                  </select>
                  before meal plan starts
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Sync Actions Section -->
        <div class="sync-actions-section">
          <h3>🔄 Sync Actions</h3>
          <div class="action-buttons">
            <button id="sync-current-plan-btn" class="action-btn primary">
              <span class="btn-icon">📅</span>
              Sync Current Meal Plan
            </button>
            <button id="export-ical-btn" class="action-btn secondary">
              <span class="btn-icon">📋</span>
              Export as iCal File
            </button>
            <button id="manual-sync-btn" class="action-btn secondary">
              <span class="btn-icon">🔄</span>
              Manual Sync Now
            </button>
          </div>
        </div>

        <!-- Sync History Section -->
        <div class="sync-history-section">
          <h3>📋 Sync History</h3>
          <div class="sync-history-list" id="sync-history-list">
            <p class="no-history">No sync history available</p>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <h3>❓ How Calendar Integration Works</h3>
          <div class="help-content">
            <div class="help-item">
              <strong>🔗 Connect Your Calendar:</strong>
              <p>Choose your preferred calendar service and authorize the connection.</p>
            </div>
            <div class="help-item">
              <strong>⚙️ Configure Settings:</strong>
              <p>Set up automatic syncing, reminders, and sync preferences.</p>
            </div>
            <div class="help-item">
              <strong>📅 Automatic Sync:</strong>
              <p>Your meal plans will automatically appear in your calendar with cooking reminders.</p>
            </div>
            <div class="help-item">
              <strong>🛒 Shopping Reminders:</strong>
              <p>Get notified when it's time to buy groceries for your upcoming meals.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update the list of active integrations
   * @returns {void}
   */
  updateIntegrationList() {
    const container = document.getElementById('active-integrations-list');
    if (!container) return;

    const integrations = this.calendarManager.activeIntegrations;
    
    if (integrations.length === 0) {
      container.innerHTML = `
        <div class="no-integrations">
          <p>📋 No calendar integrations active</p>
          <p class="sub-text">Connect a calendar service below to get started</p>
        </div>
      `;
      return;
    }

    container.innerHTML = integrations.map(integration => this.createIntegrationCard(integration)).join('');
  }

  /**
   * Create HTML for an integration card
   * @param {Object} integration - Integration data
   * @returns {string} HTML for integration card
   */
  createIntegrationCard(integration) {
    const lastSync = integration.lastSync 
      ? new Date(integration.lastSync).toLocaleString()
      : 'Never';

    return `
      <div class="integration-card ${integration.enabled ? 'enabled' : 'disabled'}" data-calendar-id="${integration.calendarId}">
        <div class="integration-header">
          <div class="integration-info">
            <span class="calendar-icon">${this.calendarManager.getCalendarIcon(integration.calendarId)}</span>
            <div class="integration-details">
              <h4 class="integration-name">${integration.name}</h4>
              <p class="integration-status ${integration.enabled ? 'active' : 'inactive'}">
                ${integration.enabled ? '✅ Connected' : '❌ Disconnected'}
              </p>
            </div>
          </div>
          <div class="integration-actions">
            <button class="toggle-integration-btn" data-calendar-id="${integration.calendarId}">
              ${integration.enabled ? 'Disconnect' : 'Reconnect'}
            </button>
          </div>
        </div>
        <div class="integration-details-expanded">
          <div class="detail-item">
            <span class="detail-label">Last Sync:</span>
            <span class="detail-value">${lastSync}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Setup Date:</span>
            <span class="detail-value">${new Date(integration.setupDate).toLocaleDateString()}</span>
          </div>
          ${integration.calendarName ? `
            <div class="detail-item">
              <span class="detail-label">Calendar:</span>
              <span class="detail-value">${integration.calendarName}</span>
            </div>
          ` : ''}
          ${integration.note ? `
            <div class="detail-item">
              <span class="detail-label">Note:</span>
              <span class="detail-value">${integration.note}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Update the available calendar services grid
   * @returns {void}
   */
  updateCalendarServicesGrid() {
    const container = document.getElementById('calendar-services-grid');
    if (!container) return;

    const supportedCalendars = this.calendarManager.getSupportedCalendars();
    
    container.innerHTML = supportedCalendars.map(calendar => this.createCalendarServiceCard(calendar)).join('');
  }

  /**
   * Create HTML for a calendar service card
   * @param {Object} calendar - Calendar service data
   * @returns {string} HTML for calendar service card
   */
  createCalendarServiceCard(calendar) {
    const isConnected = this.calendarManager.activeIntegrations.some(
      integration => integration.calendarId === calendar.id && integration.enabled
    );

    return `
      <div class="calendar-service-card ${isConnected ? 'connected' : ''}" data-calendar-id="${calendar.id}">
        <div class="service-icon">${calendar.icon}</div>
        <div class="service-info">
          <h4 class="service-name">${calendar.name}</h4>
          <p class="service-description">${calendar.description}</p>
          ${calendar.requiresAuth ? '<p class="auth-note">⚠️ Requires authentication</p>' : ''}
        </div>
        <div class="service-actions">
          <button class="connect-service-btn ${isConnected ? 'connected' : ''}" 
                  data-calendar-id="${calendar.id}"
                  ${isConnected ? 'disabled' : ''}>
            ${isConnected ? '✅ Connected' : '🔗 Connect'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners for calendar integration UI
   * @returns {void}
   */
  setupEventListeners() {
    // Connect service buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('connect-service-btn') && !e.target.disabled) {
        const calendarId = e.target.dataset.calendarId;
        this.handleConnectService(calendarId);
      }
    });

    // Toggle integration buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle-integration-btn')) {
        const calendarId = e.target.dataset.calendarId;
        this.handleToggleIntegration(calendarId);
      }
    });

    // Settings changes
    const autoSyncCheckbox = document.getElementById('auto-sync-checkbox');
    if (autoSyncCheckbox) {
      autoSyncCheckbox.addEventListener('change', () => {
        this.updateSyncSettings();
      });
    }

    const syncDirectionSelect = document.getElementById('sync-direction-select');
    if (syncDirectionSelect) {
      syncDirectionSelect.addEventListener('change', () => {
        this.updateSyncSettings();
      });
    }

    // Reminder settings
    const reminderCheckboxes = document.querySelectorAll('.setting-checkbox');
    reminderCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateSyncSettings();
      });
    });

    const timeSelects = document.querySelectorAll('.time-select');
    timeSelects.forEach(select => {
      select.addEventListener('change', () => {
        this.updateSyncSettings();
      });
    });

    // Action buttons
    const syncCurrentPlanBtn = document.getElementById('sync-current-plan-btn');
    if (syncCurrentPlanBtn) {
      syncCurrentPlanBtn.addEventListener('click', () => {
        this.handleSyncCurrentPlan();
      });
    }

    const exportICalBtn = document.getElementById('export-ical-btn');
    if (exportICalBtn) {
      exportICalBtn.addEventListener('click', () => {
        this.handleExportICal();
      });
    }

    const manualSyncBtn = document.getElementById('manual-sync-btn');
    if (manualSyncBtn) {
      manualSyncBtn.addEventListener('click', () => {
        this.handleManualSync();
      });
    }
  }

  /**
   * Handle connecting to a calendar service
   * @param {string} calendarId - Calendar service ID
   * @returns {Promise<void>}
   */
  async handleConnectService(calendarId) {
    try {
      console.log(`Connecting to ${calendarId}...`);
      
      // Show loading state
      this.showLoadingState(`Connecting to ${this.calendarManager.getCalendarDisplayName(calendarId)}...`);
      
      // Attempt to enable integration
      const result = await this.calendarManager.enableIntegration(calendarId);
      
      if (result.success) {
        this.showSuccess(result.message);
        this.updateIntegrationList();
        this.updateCalendarServicesGrid();
      } else {
        this.showError(result.message);
      }
      
    } catch (error) {
      console.error('Error connecting to calendar service:', error);
      this.showError('Failed to connect to calendar service');
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * Handle toggling an integration
   * @param {string} calendarId - Calendar service ID
   * @returns {void}
   */
  handleToggleIntegration(calendarId) {
    const result = this.calendarManager.disableIntegration(calendarId);
    
    if (result.success) {
      this.showSuccess(result.message);
      this.updateIntegrationList();
      this.updateCalendarServicesGrid();
    } else {
      this.showError(result.message);
    }
  }

  /**
   * Update sync settings based on UI inputs
   * @returns {void}
   */
  updateSyncSettings() {
    const autoSync = document.getElementById('auto-sync-checkbox')?.checked || false;
    const syncDirection = document.getElementById('sync-direction-select')?.value || 'meal-to-calendar';
    const prepReminder = document.getElementById('prep-reminder-checkbox')?.checked || false;
    const prepReminderTime = parseInt(document.getElementById('prep-reminder-time')?.value) || 30;
    const shoppingReminder = document.getElementById('shopping-reminder-checkbox')?.checked || false;
    const shoppingReminderDays = parseInt(document.getElementById('shopping-reminder-days')?.value) || 1;

    const newSettings = {
      autoSync,
      syncDirection,
      reminderSettings: {
        prepReminder,
        prepReminderTime,
        shoppingReminder,
        shoppingReminderDays
      }
    };

    this.calendarManager.updateSettings(newSettings);
    this.showSuccess('Settings updated successfully');
  }

  /**
   * Load current settings into UI
   * @returns {void}
   */
  loadCurrentSettings() {
    const settings = this.calendarManager.getSettings();
    
    // Load sync settings
    const autoSyncCheckbox = document.getElementById('auto-sync-checkbox');
    if (autoSyncCheckbox) {
      autoSyncCheckbox.checked = settings.syncSettings.autoSync;
    }

    const syncDirectionSelect = document.getElementById('sync-direction-select');
    if (syncDirectionSelect) {
      syncDirectionSelect.value = settings.syncSettings.syncDirection;
    }

    // Load reminder settings
    const prepReminderCheckbox = document.getElementById('prep-reminder-checkbox');
    if (prepReminderCheckbox) {
      prepReminderCheckbox.checked = settings.syncSettings.reminderSettings.prepReminder;
    }

    const prepReminderTime = document.getElementById('prep-reminder-time');
    if (prepReminderTime) {
      prepReminderTime.value = settings.syncSettings.reminderSettings.prepReminderTime;
    }

    const shoppingReminderCheckbox = document.getElementById('shopping-reminder-checkbox');
    if (shoppingReminderCheckbox) {
      shoppingReminderCheckbox.checked = settings.syncSettings.reminderSettings.shoppingReminder;
    }

    const shoppingReminderDays = document.getElementById('shopping-reminder-days');
    if (shoppingReminderDays) {
      shoppingReminderDays.value = settings.syncSettings.reminderSettings.shoppingReminderDays;
    }
  }

  /**
   * Handle syncing current meal plan
   * @returns {Promise<void>}
   */
  async handleSyncCurrentPlan() {
    try {
      // Get current meal plan from the main app
      const currentMealPlan = window.currentMealPlan || [];
      
      if (currentMealPlan.length === 0) {
        this.showError('No meal plan available to sync. Please generate a meal plan first.');
        return;
      }

      this.showLoadingState('Syncing meal plan to calendar...');
      
      const result = await this.calendarManager.syncMealPlanToCalendar(currentMealPlan);
      
      if (result.success) {
        this.showSuccess(result.message);
        this.updateSyncHistory(result);
      } else {
        this.showError(result.message);
      }
      
    } catch (error) {
      console.error('Error syncing meal plan:', error);
      this.showError('Failed to sync meal plan');
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * Handle exporting to iCal format
   * @returns {Promise<void>}
   */
  async handleExportICal() {
    try {
      const currentMealPlan = window.currentMealPlan || [];
      
      if (currentMealPlan.length === 0) {
        this.showError('No meal plan available to export. Please generate a meal plan first.');
        return;
      }

      this.showLoadingState('Exporting to iCal format...');
      
      // Force iCal export
      const result = await this.calendarManager.exportToICalFormat({
        calendarId: 'ical',
        type: 'ical'
      }, currentMealPlan);
      
      if (result.success) {
        this.showSuccess(result.message);
      } else {
        this.showError(result.message);
      }
      
    } catch (error) {
      console.error('Error exporting to iCal:', error);
      this.showError('Failed to export iCal file');
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * Handle manual sync
   * @returns {Promise<void>}
   */
  async handleManualSync() {
    await this.handleSyncCurrentPlan();
  }

  /**
   * Update sync history display
   * @param {Object} syncResult - Result from sync operation
   * @returns {void}
   */
  updateSyncHistory(syncResult) {
    const historyContainer = document.getElementById('sync-history-list');
    if (!historyContainer) return;

    const historyItem = document.createElement('div');
    historyItem.className = 'sync-history-item';
    historyItem.innerHTML = `
      <div class="history-header">
        <span class="history-date">${new Date().toLocaleString()}</span>
        <span class="history-status ${syncResult.success ? 'success' : 'error'}">
          ${syncResult.success ? '✅ Success' : '❌ Failed'}
        </span>
      </div>
      <div class="history-details">
        <p>${syncResult.message}</p>
        ${syncResult.results ? `
          <ul class="sync-results">
            ${syncResult.results.map(result => 
              `<li>${this.calendarManager.getCalendarDisplayName(result.calendarId)}: ${result.message}</li>`
            ).join('')}
          </ul>
        ` : ''}
      </div>
    `;

    // Remove "no history" message if it exists
    const noHistory = historyContainer.querySelector('.no-history');
    if (noHistory) {
      noHistory.remove();
    }

    // Add new item at the top
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    // Keep only last 10 items
    const items = historyContainer.querySelectorAll('.sync-history-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  /**
   * Show loading state
   * @param {string} message - Loading message
   * @returns {void}
   */
  showLoadingState(message) {
    // Implementation depends on your existing loading system
    console.log('Loading:', message);
    
    // You could show a modal, toast, or update button states here
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
  }

  /**
   * Hide loading state
   * @returns {void}
   */
  hideLoadingState() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }

  /**
   * Show success message
   * @param {string} message - Success message
   * @returns {void}
   */
  showSuccess(message) {
    console.log('Success:', message);
    // Implementation depends on your existing notification system
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   * @param {string} message - Error message
   * @returns {void}
   */
  showError(message) {
    console.error('Error:', message);
    this.showNotification(message, 'error');
  }

  /**
   * Show notification (placeholder for your notification system)
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
   * Refresh the entire calendar integration UI
   * @returns {void}
   */
  refresh() {
    this.updateIntegrationList();
    this.updateCalendarServicesGrid();
    this.loadCurrentSettings();
  }
}

// Export for use in other modules
export { CalendarIntegrationUI };
export default CalendarIntegrationUI;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
  window.CalendarIntegrationUI = CalendarIntegrationUI;
}
