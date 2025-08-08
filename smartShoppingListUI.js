/**
 * Smart Shopping List UI Manager
 * Advanced user interface for intelligent shopping list management with
 * store organization, budget tracking, family sharing, and AI recommendations.
 */

export class SmartShoppingListUI {
    constructor() {
        this.currentList = null;
        this.activeStore = null;
        this.checklistMode = false;
        this.familyMode = false;
        this.budgetAlerts = true;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for smart shopping features
     */
    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindSmartShoppingEvents();
        });
    }

    /**
     * Bind all smart shopping list event handlers
     */
    bindSmartShoppingEvents() {
        // Generate smart list button
        const generateBtn = document.getElementById('generateSmartListBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.showSmartListGenerator());
        }

        // Store selection events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.store-tab')) {
                this.switchStore(e.target.dataset.store);
            }
            if (e.target.matches('.shopping-item-checkbox')) {
                this.toggleShoppingItem(e.target);
            }
            if (e.target.matches('.bulk-suggestion-btn')) {
                this.applyBulkSuggestion(e.target.dataset.itemId);
            }
            if (e.target.matches('.substitution-btn')) {
                this.showSubstitutionModal(e.target.dataset.itemId);
            }
            if (e.target.matches('.share-list-btn')) {
                this.showSharingModal();
            }
            if (e.target.matches('.budget-alert-btn')) {
                this.showBudgetModal();
            }
        });

        // Real-time search and filtering
        const searchInput = document.getElementById('shoppingListSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterShoppingList(e.target.value);
            });
        }
    }

    /**
     * Show smart shopping list generator modal
     */
    showSmartListGenerator() {
        const modal = document.createElement('div');
        modal.className = 'smart-shopping-modal';
        modal.innerHTML = `
            <div class="modal-content smart-shopping-generator">
                <div class="modal-header">
                    <h2>🧠 Smart Shopping List Generator</h2>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="generator-sections">
                    <!-- Household Configuration -->
                    <div class="generator-section">
                        <h3>👨‍👩‍👧‍👦 Household Settings</h3>
                        <div class="form-group">
                            <label>Household Size:</label>
                            <select id="householdSize">
                                <option value="1">1 person</option>
                                <option value="2">2 people</option>
                                <option value="3">3 people</option>
                                <option value="4" selected>4 people</option>
                                <option value="5">5 people</option>
                                <option value="6">6 people</option>
                                <option value="7+">7+ people</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Dietary Restrictions:</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="vegetarian"> Vegetarian</label>
                                <label><input type="checkbox" value="vegan"> Vegan</label>
                                <label><input type="checkbox" value="gluten-free"> Gluten-Free</label>
                                <label><input type="checkbox" value="dairy-free"> Dairy-Free</label>
                                <label><input type="checkbox" value="nut-free"> Nut-Free</label>
                            </div>
                        </div>
                    </div>

                    <!-- Budget Configuration -->
                    <div class="generator-section">
                        <h3>💰 Budget Management</h3>
                        <div class="form-group">
                            <label>Weekly Budget ($):</label>
                            <input type="number" id="weeklyBudget" placeholder="150" min="0" step="10">
                            <small>Leave empty for no budget limit</small>
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="enableBudgetAlerts" checked> Enable budget alerts</label>
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="optimizeForSavings" checked> Optimize for savings</label>
                        </div>
                    </div>

                    <!-- Store Selection -->
                    <div class="generator-section">
                        <h3>🏪 Store Preferences</h3>
                        <div class="form-group">
                            <label>Preferred Stores (select multiple):</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="Walmart" checked> Walmart</label>
                                <label><input type="checkbox" value="Target"> Target</label>
                                <label><input type="checkbox" value="Kroger"> Kroger</label>
                                <label><input type="checkbox" value="Whole Foods"> Whole Foods</label>
                                <label><input type="checkbox" value="Costco"> Costco</label>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced Options -->
                    <div class="generator-section">
                        <h3>⚙️ Advanced Options</h3>
                        <div class="form-group">
                            <label><input type="checkbox" id="includeBulkSuggestions" checked> Include bulk buying suggestions</label>
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="includeSubstitutions" checked> Show smart substitutions</label>
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="includeCoupons" checked> Find applicable coupons</label>
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="enableFamilySharing"> Enable family sharing</label>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.smart-shopping-modal').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="smartShoppingListUI.generateSmartList()">
                        🚀 Generate Smart List
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Generate smart shopping list with user preferences
     */
    async generateSmartList() {
        try {
            const options = this.collectGeneratorOptions();
            const loadingIndicator = this.showLoadingIndicator('Generating intelligent shopping list...');
            
            // Get current meal plan
            const mealPlan = window.mealPlan || this.getMockMealPlan();
            
            // Import and use smart shopping manager
            const { smartShoppingListManager } = await import('./smartShoppingListManager.js');
            const smartList = await smartShoppingListManager.generateIntelligentList(mealPlan, options);
            
            this.currentList = smartList;
            this.hideLoadingIndicator(loadingIndicator);
            this.displaySmartShoppingList(smartList);
            
            // Close generator modal
            document.querySelector('.smart-shopping-modal')?.remove();
            
        } catch (error) {
            console.error('Error generating smart list:', error);
            this.showErrorMessage('Failed to generate smart shopping list. Please try again.');
        }
    }

    /**
     * Display comprehensive smart shopping list interface
     */
    displaySmartShoppingList(smartList) {
        const container = document.getElementById('smartShoppingContainer') || this.createSmartShoppingContainer();
        
        container.innerHTML = `
            <div class="smart-shopping-header">
                <div class="list-info">
                    <h2>🧠 Smart Shopping List</h2>
                    <div class="list-metadata">
                        <span class="household-size">👥 ${smartList.metadata.householdSize} people</span>
                        <span class="total-cost">💰 $${smartList.budget.total.toFixed(2)}</span>
                        <span class="estimated-time">⏱️ ${smartList.metadata.estimatedShoppingTime} min</span>
                        ${smartList.budget.savings > 0 ? `<span class="savings">💰 Save $${smartList.budget.savings.toFixed(2)}</span>` : ''}
                    </div>
                </div>
                
                <div class="list-actions">
                    <button class="btn btn-secondary share-list-btn">
                        📤 Share
                    </button>
                    <button class="btn btn-secondary print-list-btn" onclick="smartShoppingListUI.printList()">
                        🖨️ Print
                    </button>
                    <button class="btn btn-primary shopping-mode-btn" onclick="smartShoppingListUI.enterShoppingMode()">
                        🛒 Shopping Mode
                    </button>
                </div>
            </div>

            <!-- Budget Overview -->
            ${this.renderBudgetOverview(smartList.budget)}

            <!-- Store Tabs -->
            ${this.renderStoreTabs(smartList.stores)}

            <!-- Store Content -->
            <div class="store-content">
                ${this.renderStoreContent(smartList.stores)}
            </div>

            <!-- Recommendations Panel -->
            ${this.renderRecommendationsPanel(smartList.recommendations, smartList.coupons)}
        `;

        // Initialize first store as active
        const firstStore = Object.keys(smartList.stores)[0];
        if (firstStore) {
            this.switchStore(firstStore);
        }
    }

    /**
     * Render budget overview section
     */
    renderBudgetOverview(budget) {
        if (!budget.total) return '';
        
        return `
            <div class="budget-overview">
                <div class="budget-card">
                    <h3>💰 Budget Breakdown</h3>
                    <div class="budget-stats">
                        <div class="budget-stat">
                            <span class="label">Total Cost:</span>
                            <span class="value">$${budget.total.toFixed(2)}</span>
                        </div>
                        ${budget.savings > 0 ? `
                        <div class="budget-stat savings">
                            <span class="label">Total Savings:</span>
                            <span class="value">-$${budget.savings.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="budget-stat">
                            <span class="label">Final Total:</span>
                            <span class="value final-total">$${(budget.total - budget.savings).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="budget-breakdown">
                        ${Object.entries(budget.byStore).map(([store, cost]) => `
                            <div class="store-budget">
                                <span class="store-name">${store}:</span>
                                <span class="store-cost">$${cost.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render store tabs for navigation
     */
    renderStoreTabs(stores) {
        return `
            <div class="store-tabs">
                ${Object.entries(stores).map(([storeName, storeData]) => `
                    <button class="store-tab" data-store="${storeName}">
                        🏪 ${storeName}
                        <span class="store-stats">
                            <span class="item-count">${storeData.totalItems} items</span>
                            <span class="store-cost">$${storeData.estimatedCost.toFixed(2)}</span>
                        </span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render individual store content
     */
    renderStoreContent(stores) {
        return Object.entries(stores).map(([storeName, storeData]) => `
            <div class="store-panel" data-store="${storeName}" style="display: none;">
                <!-- Store Header -->
                <div class="store-header">
                    <h3>🏪 ${storeName}</h3>
                    <div class="store-info">
                        <span>📦 ${storeData.totalItems} items</span>
                        <span>💰 $${storeData.estimatedCost.toFixed(2)}</span>
                        <span>⏱️ ${storeData.estimatedTime} min</span>
                    </div>
                </div>

                <!-- Shopping Route -->
                ${this.renderShoppingRoute(storeData)}

                <!-- Aisle-by-Aisle List -->
                ${this.renderAisleList(storeData)}

                <!-- Bulk Suggestions -->
                ${storeData.bulkSuggestions?.length > 0 ? this.renderBulkSuggestions(storeData.bulkSuggestions) : ''}

                <!-- Budget Warnings -->
                ${storeData.budgetWarning ? `
                    <div class="budget-warning">
                        ⚠️ ${storeData.budgetWarning}
                        <button class="btn btn-sm budget-alert-btn">View Details</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    /**
     * Render optimized shopping route
     */
    renderShoppingRoute(storeData) {
        return `
            <div class="shopping-route">
                <h4>🗺️ Optimized Shopping Route</h4>
                <div class="route-path">
                    ${storeData.shoppingRoute.map(aisle => `
                        <div class="route-stop">
                            <span class="aisle-number">${aisle}</span>
                            <span class="aisle-items">${storeData.aisles[aisle]?.length || 0} items</span>
                        </div>
                    `).join('<div class="route-arrow">→</div>')}
                </div>
            </div>
        `;
    }

    /**
     * Render shopping list organized by aisle
     */
    renderAisleList(storeData) {
        return `
            <div class="aisle-shopping-list">
                ${Object.entries(storeData.aisles).map(([aisle, items]) => `
                    <div class="aisle-section">
                        <h4 class="aisle-header">
                            📍 Aisle ${aisle}
                            <span class="aisle-stats">${items.length} items | $${items.reduce((sum, item) => sum + item.estimatedCost, 0).toFixed(2)}</span>
                        </h4>
                        
                        <div class="aisle-items">
                            ${items.map(item => this.renderShoppingItem(item)).join('')}
                        </div>
                    </div>
                `).join('')}
                
                ${storeData.unassignedItems?.length > 0 ? `
                    <div class="aisle-section">
                        <h4 class="aisle-header">📍 Other Items</h4>
                        <div class="aisle-items">
                            ${storeData.unassignedItems.map(item => this.renderShoppingItem(item)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render individual shopping item
     */
    renderShoppingItem(item) {
        return `
            <div class="shopping-item" data-item-id="${item.normalizedName}">
                <div class="item-checkbox-container">
                    <input type="checkbox" class="shopping-item-checkbox" id="item_${item.normalizedName}">
                    <label for="item_${item.normalizedName}"></label>
                </div>
                
                <div class="item-details">
                    <div class="item-main">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">${item.quantity} ${item.unit}</span>
                        <span class="item-cost">$${item.estimatedCost.toFixed(2)}</span>
                    </div>
                    
                    <div class="item-meta">
                        <span class="item-sources">For: ${item.sources.join(', ')}</span>
                        ${item.seasonalAdjustment && item.seasonalAdjustment !== 1.0 ? `
                            <span class="seasonal-indicator ${item.seasonalAdjustment > 1.0 ? 'price-up' : 'price-down'}">
                                ${item.seasonalAdjustment > 1.0 ? '📈' : '📉'} Seasonal
                            </span>
                        ` : ''}
                    </div>
                </div>

                <div class="item-actions">
                    <button class="btn btn-sm substitution-btn" data-item-id="${item.normalizedName}" title="View Substitutions">
                        🔄
                    </button>
                    <button class="btn btn-sm item-notes-btn" data-item-id="${item.normalizedName}" title="Add Notes">
                        📝
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render bulk buying suggestions
     */
    renderBulkSuggestions(bulkSuggestions) {
        return `
            <div class="bulk-suggestions">
                <h4>💪 Bulk Buying Opportunities</h4>
                <div class="suggestions-list">
                    ${bulkSuggestions.map(suggestion => `
                        <div class="bulk-suggestion">
                            <div class="suggestion-info">
                                <span class="item-name">${suggestion.item}</span>
                                <span class="savings-amount">Save $${suggestion.savings.toFixed(2)}</span>
                            </div>
                            <div class="suggestion-details">
                                <span>${suggestion.bulkSize} for $${suggestion.bulkPrice.toFixed(2)}</span>
                                <button class="btn btn-sm btn-primary bulk-suggestion-btn" data-item-id="${suggestion.itemId}">
                                    Apply
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render recommendations panel
     */
    renderRecommendationsPanel(recommendations, coupons) {
        return `
            <div class="recommendations-panel">
                <h3>💡 Smart Recommendations</h3>
                
                <!-- Coupons Section -->
                ${coupons?.coupons?.length > 0 ? `
                    <div class="coupons-section">
                        <h4>🎫 Available Coupons</h4>
                        <div class="coupons-list">
                            ${coupons.coupons.map(coupon => `
                                <div class="coupon-card">
                                    <div class="coupon-details">
                                        <span class="coupon-title">${coupon.title}</span>
                                        <span class="coupon-savings">Save $${coupon.savings.toFixed(2)}</span>
                                    </div>
                                    <div class="coupon-code">${coupon.code}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- General Recommendations -->
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation ${rec.priority}">
                            <span class="rec-icon">${this.getRecommendationIcon(rec.type)}</span>
                            <span class="rec-message">${rec.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Switch between store tabs
     */
    switchStore(storeName) {
        // Update tab states
        document.querySelectorAll('.store-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.store === storeName);
        });

        // Update panel visibility
        document.querySelectorAll('.store-panel').forEach(panel => {
            panel.style.display = panel.dataset.store === storeName ? 'block' : 'none';
        });

        this.activeStore = storeName;
    }

    /**
     * Enter shopping mode for real-time list checking
     */
    enterShoppingMode() {
        document.body.classList.add('shopping-mode');
        this.checklistMode = true;
        
        // Show shopping mode controls
        this.showShoppingModeControls();
        
        // Enable location tracking if available
        if (navigator.geolocation) {
            this.enableLocationTracking();
        }
    }

    /**
     * Show shopping mode interface
     */
    showShoppingModeControls() {
        const controls = document.createElement('div');
        controls.className = 'shopping-mode-controls';
        controls.innerHTML = `
            <div class="shopping-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0 of ${this.getTotalItems()} items completed</span>
            </div>
            
            <div class="shopping-actions">
                <button class="btn btn-secondary" onclick="smartShoppingListUI.exitShoppingMode()">
                    Exit Shopping Mode
                </button>
                <button class="btn btn-primary" onclick="smartShoppingListUI.markAllCompleted()">
                    Mark All Complete
                </button>
            </div>
        `;
        
        document.querySelector('.smart-shopping-header').appendChild(controls);
    }

    /**
     * Handle shopping item toggle
     */
    toggleShoppingItem(checkbox) {
        const item = checkbox.closest('.shopping-item');
        item.classList.toggle('completed', checkbox.checked);
        
        // Update progress if in shopping mode
        if (this.checklistMode) {
            this.updateShoppingProgress();
        }
        
        // Sync with family if enabled
        if (this.familyMode) {
            this.syncWithFamily(item.dataset.itemId, checkbox.checked);
        }
    }

    /**
     * Update shopping progress
     */
    updateShoppingProgress() {
        const totalItems = this.getTotalItems();
        const completedItems = document.querySelectorAll('.shopping-item-checkbox:checked').length;
        const progress = (completedItems / totalItems) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${completedItems} of ${totalItems} items completed`;
    }

    // Helper methods
    collectGeneratorOptions() {
        return {
            householdSize: document.getElementById('householdSize')?.value || '4',
            budget: parseFloat(document.getElementById('weeklyBudget')?.value) || null,
            preferredStores: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.value).filter(v => ['Walmart', 'Target', 'Kroger', 'Whole Foods', 'Costco'].includes(v)),
            includeBulkSuggestions: document.getElementById('includeBulkSuggestions')?.checked || false,
            includeSubstitutions: document.getElementById('includeSubstitutions')?.checked || false,
            includeCoupons: document.getElementById('includeCoupons')?.checked || false,
            enableFamilySharing: document.getElementById('enableFamilySharing')?.checked || false
        };
    }

    createSmartShoppingContainer() {
        let container = document.getElementById('smartShoppingContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'smartShoppingContainer';
            container.className = 'smart-shopping-container';
            
            const mainContent = document.querySelector('.main-content') || document.body;
            mainContent.appendChild(container);
        }
        return container;
    }

    getMockMealPlan() {
        return [
            { meals: ['Chicken Stir Fry', 'Salmon Teriyaki', 'Vegetable Pasta'] },
            { meals: ['Beef Tacos', 'Chicken Salad', 'Mushroom Risotto'] },
            { meals: ['Grilled Salmon', 'Chicken Curry', 'Veggie Burgers'] }
        ];
    }

    getRecommendationIcon(type) {
        const icons = {
            timing: '⏰',
            budget: '💰',
            seasonal: '🌱',
            health: '🥗',
            savings: '💸'
        };
        return icons[type] || '💡';
    }

    getTotalItems() {
        return document.querySelectorAll('.shopping-item').length;
    }

    showLoadingIndicator(message) {
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(loader);
        return loader;
    }

    hideLoadingIndicator(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    showErrorMessage(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(error);
        
        setTimeout(() => error.remove(), 5000);
    }
}

// Export singleton instance
export const smartShoppingListUI = new SmartShoppingListUI();
