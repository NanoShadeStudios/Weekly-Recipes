// Enhanced UI State Manager
class UIStateManager {
  constructor() {
    this.currentTab = 'weeklyPlan';
    this.tabStates = {};
    this.isInitialized = false;
    this.observers = [];
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('UIStateManager: Initializing...');
    
    // Initialize tab content states first
    this.initializeTabStates();
    
    // Set up tab button event listeners
    this.setupTabEventListeners();
    
    // Restore saved tab state
    this.restoreTabState();
    
    // Set up window resize listener for responsive behavior
    window.addEventListener('resize', () => this.handleResize());
    
    this.isInitialized = true;
    console.log('UIStateManager: Initialized successfully');
  }

  setupTabEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
      // Remove existing listeners to prevent duplicates
      button.removeEventListener('click', this.handleTabClick);
      
      // Add new listener
      button.addEventListener('click', (event) => this.handleTabClick(event));
    });
  }

  handleTabClick = (event) => {
    event.preventDefault();
    const button = event.target;
    const tabId = button.id.replace('-btn', '');
    
    console.log('UIStateManager: Switching to tab:', tabId);
    this.showTab(tabId);
  }

  showTab(tabId) {
    // Save current tab state before switching
    this.saveCurrentTabState();
    
    // Update current tab
    this.currentTab = tabId;
    
    // Update UI
    this.updateTabUI(tabId);
    
    // Restore tab-specific state
    this.restoreTabSpecificState(tabId);
    
    // Save tab preference
    this.saveTabPreference(tabId);
    
    // Notify observers
    this.notifyObservers('tabChanged', { tabId, previousTab: this.currentTab });
    
    // Handle tab-specific initialization
    this.initializeTabContent(tabId);
  }

  updateTabUI(tabId) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Show target tab content
    const targetContent = document.getElementById(tabId);
    const targetButton = document.getElementById(tabId + '-btn');
    
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
      
      // Add smooth transition effect
      targetContent.style.opacity = '0';
      setTimeout(() => {
        targetContent.style.opacity = '1';
      }, 10);
    }
    
    if (targetButton) {
      targetButton.classList.add('active');
    }
  }

  initializeTabStates() {
    const tabs = ['weeklyPlan', 'myFoods', 'preferences', 'profile'];
    
    tabs.forEach(tabId => {
      if (!this.tabStates[tabId]) {
        this.tabStates[tabId] = {
          scrollPosition: 0,
          formData: {},
          selectedItems: [],
          filters: {},
          lastUpdated: Date.now()
        };
      }
    });
  }

  saveCurrentTabState() {
    if (!this.currentTab) return;
    
    const currentContent = document.getElementById(this.currentTab);
    if (!currentContent) return;
    
    // Ensure tab state exists
    if (!this.tabStates[this.currentTab]) {
      this.tabStates[this.currentTab] = {
        scrollPosition: 0,
        formData: {},
        selectedItems: [],
        filters: {},
        lastUpdated: Date.now()
      };
    }
    
    // Save scroll position
    this.tabStates[this.currentTab].scrollPosition = currentContent.scrollTop || 0;
    
    // Save form data for tabs with forms
    this.saveTabFormData(this.currentTab);
    
    // Save any selected items
    this.saveTabSelections(this.currentTab);
    
    this.tabStates[this.currentTab].lastUpdated = Date.now();
  }

  saveTabFormData(tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;
    
    const forms = tabContent.querySelectorAll('form');
    const formData = {};
    
    forms.forEach((form, index) => {
      const formId = form.id || `form_${index}`;
      formData[formId] = {};
      
      // Save input values
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          formData[formId][input.name || input.id] = input.checked;
        } else {
          formData[formId][input.name || input.id] = input.value;
        }
      });
    });
    
    this.tabStates[tabId].formData = formData;
  }

  saveTabSelections(tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;
    
    const selectedItems = [];
    const checkboxes = tabContent.querySelectorAll('input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
      selectedItems.push({
        id: checkbox.id,
        name: checkbox.name,
        value: checkbox.value
      });
    });
    
    this.tabStates[tabId].selectedItems = selectedItems;
  }

  restoreTabSpecificState(tabId) {
    const state = this.tabStates[tabId];
    if (!state) return;
    
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;
    
    // Restore scroll position
    setTimeout(() => {
      tabContent.scrollTop = state.scrollPosition || 0;
    }, 100);
    
    // Restore form data
    this.restoreTabFormData(tabId, state.formData);
    
    // Restore selections
    this.restoreTabSelections(tabId, state.selectedItems);
  }

  restoreTabFormData(tabId, formData) {
    if (!formData) return;
    
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;
    
    Object.keys(formData).forEach(formId => {
      const form = document.getElementById(formId) || tabContent.querySelector('form');
      if (!form) return;
      
      const fieldData = formData[formId];
      Object.keys(fieldData).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`);
        if (!field) return;
        
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = fieldData[fieldName];
        } else {
          field.value = fieldData[fieldName];
        }
      });
    });
  }

  restoreTabSelections(tabId, selectedItems) {
    if (!selectedItems) return;
    
    selectedItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element && element.type === 'checkbox') {
        element.checked = true;
      }
    });
  }

  initializeTabContent(tabId) {
    // Tab-specific initialization logic
    switch (tabId) {
      case 'weeklyPlan':
        this.initializeWeeklyPlanTab();
        break;
      case 'myFoods':
        this.initializeMyFoodsTab();
        break;
      case 'preferences':
        this.initializePreferencesTab();
        break;
      case 'profile':
        this.initializeProfileTab();
        break;
    }
  }

  initializeWeeklyPlanTab() {
    // Refresh meal plan display if needed
    if (typeof window.renderPlan === 'function' && window.currentPlan) {
      window.renderPlan(window.currentPlan, window.pinnedMeals || []);
    }
    
    // Set up calendar responsiveness
    this.setupCalendarResponsiveness();
  }

  initializeMyFoodsTab() {
    // Refresh food list display
    if (typeof window.loadUserData === 'function') {
      window.loadUserData();
    }
  }

  initializePreferencesTab() {
    // Load and display current preferences
    this.loadUserPreferences();
  }

  initializeProfileTab() {
    // Update profile information
    this.updateProfileDisplay();
  }

  setupCalendarResponsiveness() {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;
    
    const updateCalendarLayout = () => {
      const width = window.innerWidth;
      const calendar = calendarContainer.querySelector('.calendar-grid');
      
      if (calendar) {
        if (width < 768) {
          // Mobile layout
          calendar.classList.add('mobile-layout');
          calendar.classList.remove('desktop-layout');
        } else {
          // Desktop layout
          calendar.classList.add('desktop-layout');
          calendar.classList.remove('mobile-layout');
        }
      }
    };
    
    updateCalendarLayout();
    window.addEventListener('resize', updateCalendarLayout);
  }

  handleResize() {
    // Update layout for current tab
    if (this.currentTab === 'weeklyPlan') {
      this.setupCalendarResponsiveness();
    }
    
    // Notify observers of resize
    this.notifyObservers('resize', { width: window.innerWidth, height: window.innerHeight });
  }

  loadUserPreferences() {
    try {
      const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      
      // Update dietary restrictions
      const dietaryCheckboxes = document.querySelectorAll('#preferences input[type=\"checkbox\"]');
      dietaryCheckboxes.forEach(checkbox => {
        const restriction = checkbox.value;
        if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.includes(restriction)) {
          checkbox.checked = true;
        }
      });
      
      // Update AI preferences textarea
      const aiPrefsTextarea = document.getElementById('aiPreferences');
      if (aiPrefsTextarea && preferences.aiPreferences) {
        aiPrefsTextarea.value = preferences.aiPreferences;
      }
      
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  updateProfileDisplay() {
    try {
      // Update email display
      const profileEmail = document.getElementById('profileEmail');
      if (profileEmail && window.auth && window.auth.currentUser) {
        profileEmail.textContent = window.auth.currentUser.email;
      }
      
      // Update user stats if available
      const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
      const statsDisplay = document.getElementById('userStats');
      if (statsDisplay && Object.keys(userStats).length > 0) {
        statsDisplay.innerHTML = `
          <h3>Your Stats</h3>
          <p>Total Meals Generated: ${userStats.totalMealsGenerated || 0}</p>
          <p>Favorite Foods: ${userStats.favoriteFoods || 0}</p>
          <p>Member Since: ${userStats.memberSince || 'Recently'}</p>
        `;
      }
      
    } catch (error) {
      console.error('Error updating profile display:', error);
    }
  }

  saveTabPreference(tabId) {
    try {
      localStorage.setItem('lastActiveTab', tabId);
    } catch (error) {
      console.error('Error saving tab preference:', error);
    }
  }

  restoreTabState() {
    try {
      const lastTab = localStorage.getItem('lastActiveTab');
      if (lastTab && document.getElementById(lastTab)) {
        this.showTab(lastTab);
      } else {
        // Default to weekly plan
        this.showTab('weeklyPlan');
      }
    } catch (error) {
      console.error('Error restoring tab state:', error);
      this.showTab('weeklyPlan');
    }
  }

  // Observer pattern for state changes
  addObserver(callback) {
    this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  notifyObservers(event, data) {
    this.observers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in UI state observer:', error);
      }
    });
  }

  // Public methods for external access
  getCurrentTab() {
    return this.currentTab;
  }

  getTabState(tabId) {
    return this.tabStates[tabId];
  }

  resetTabState(tabId) {
    if (this.tabStates[tabId]) {
      this.tabStates[tabId] = {
        scrollPosition: 0,
        formData: {},
        selectedItems: [],
        filters: {},
        lastUpdated: Date.now()
      };
    }
  }

  // Force refresh of current tab content
  refreshCurrentTab() {
    this.initializeTabContent(this.currentTab);
  }
}

// Create singleton instance
const uiStateManager = new UIStateManager();

// Export for external use
export { uiStateManager, UIStateManager };

// Also make available globally for compatibility
window.uiStateManager = uiStateManager;
