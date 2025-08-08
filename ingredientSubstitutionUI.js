/**
 * Ingredient Substitution UI Manager
 * Provides user interface for intelligent ingredient substitutions
 */

class IngredientSubstitutionUI {
    constructor() {
        this.substitutionManager = null;
        this.activeRecipe = null;
        this.userPreferences = {};
        this.pantryItems = [];
        
        this.initialize();
    }

    async initialize() {
        console.log('🔄 Initializing Ingredient Substitution UI...');
        
        // Wait for substitution manager to be available
        if (typeof ingredientSubstitutionManager !== 'undefined') {
            this.substitutionManager = ingredientSubstitutionManager;
        } else {
            setTimeout(() => this.initialize(), 500);
            return;
        }

        this.loadUserPreferences();
        this.setupEventListeners();
        this.addSubstitutionUI();
        this.initializeSubstitutionTab();
        
        console.log('✅ Ingredient Substitution UI initialized');
    }

    /**
     * Initialize the dedicated substitution tab functionality
     */
    initializeSubstitutionTab() {
        console.log('🔧 Setting up substitution tab...');
        
        // Setup pantry manager button
        const pantryBtn = document.querySelector('.pantry-manager-btn');
        if (pantryBtn) {
            pantryBtn.addEventListener('click', () => this.showPantryManager());
        }
        
        // Setup preferences button
        const preferencesBtn = document.querySelector('.substitution-preferences-btn');
        if (preferencesBtn) {
            preferencesBtn.addEventListener('click', () => this.showPreferencesManager());
        }
        
        // Setup ingredient search
        const searchBtn = document.getElementById('findSubstitutesBtn');
        const searchInput = document.getElementById('ingredientSearchInput');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const ingredient = searchInput.value.trim();
                if (ingredient) {
                    this.searchAndDisplaySubstitutions(ingredient);
                }
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const ingredient = searchInput.value.trim();
                    if (ingredient) {
                        this.searchAndDisplaySubstitutions(ingredient);
                    }
                }
            });
        }
    }

    /**
     * Search for substitutions and display them in the tab
     */
    async searchAndDisplaySubstitutions(ingredient) {
        console.log(`🔍 Searching substitutions for: ${ingredient}`);
        
        const resultsContainer = document.getElementById('substitutionResults');
        const listContainer = document.getElementById('substitutionsList');
        
        if (!resultsContainer || !listContainer) {
            console.warn('Substitution results containers not found');
            return;
        }
        
        try {
            // Show loading state
            resultsContainer.style.display = 'block';
            listContainer.innerHTML = '<div class="loading-state">🔍 Searching for alternatives...</div>';
            
            // Get substitutions from manager
            const substitutions = await this.substitutionManager.findSubstitutions(ingredient, {
                dietary: this.userPreferences.dietary || [],
                allergies: this.userPreferences.allergies || [],
                pantryItems: this.pantryItems
            });
            
            if (substitutions.length === 0) {
                listContainer.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🤷‍♀️</div>
                        <h3>No substitutions found</h3>
                        <p>We couldn't find any suitable alternatives for "${ingredient}". Try checking the spelling or searching for a more general ingredient.</p>
                    </div>
                `;
                return;
            }
            
            // Display substitutions
            listContainer.innerHTML = substitutions.map(sub => this.createSubstitutionCard(ingredient, sub)).join('');
            
            // Clear search input
            const searchInput = document.getElementById('ingredientSearchInput');
            if (searchInput) searchInput.value = '';
            
        } catch (error) {
            console.error('Error searching substitutions:', error);
            listContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <h3>Search Error</h3>
                    <p>There was an error searching for substitutions. Please try again.</p>
                </div>
            `;
        }
    }

    loadUserPreferences() {
        // Load from localStorage or user profile
        const saved = localStorage.getItem('substitutionPreferences');
        if (saved) {
            this.userPreferences = JSON.parse(saved);
        }

        const savedPantry = localStorage.getItem('pantryInventory');
        if (savedPantry) {
            this.pantryItems = JSON.parse(savedPantry);
            this.substitutionManager.updatePantryInventory(this.pantryItems);
        }
    }

    saveUserPreferences() {
        localStorage.setItem('substitutionPreferences', JSON.stringify(this.userPreferences));
        localStorage.setItem('pantryInventory', JSON.stringify(this.pantryItems));
    }

    setupEventListeners() {
        // Listen for meal card interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('substitution-btn')) {
                const mealCard = e.target.closest('.meal-card');
                if (mealCard) {
                    this.showMealSubstitutions(mealCard);
                }
            }

            if (e.target.classList.contains('ingredient-substitute-btn')) {
                const ingredient = e.target.dataset.ingredient;
                this.showIngredientSubstitutions(ingredient);
            }

            if (e.target.classList.contains('pantry-manager-btn')) {
                this.showPantryManager();
            }

            if (e.target.classList.contains('substitution-preferences-btn')) {
                this.showPreferencesManager();
            }
        });

        // Listen for recipe modal openings to add substitution features
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceRecipeModals();
        });
    }

    addSubstitutionUI() {
        // Add substitution button to meal cards
        this.addSubstitutionButtonsToMealCards();
        
        // Add pantry management to navigation
        this.addPantryManagementButton();
        
        // Add substitution preferences to settings
        this.addSubstitutionPreferences();
    }

    addSubstitutionButtonsToMealCards() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Check for various meal card classes
                        const mealCard = node.classList?.contains('meal-card') ? node :
                                       node.classList?.contains('meal-plan-card') ? node :
                                       node.querySelector?.('.meal-card, .meal-plan-card');
                        
                        if (mealCard) {
                            this.enhanceMealCard(mealCard);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Enhance existing meal cards with multiple class selectors
        document.querySelectorAll('.meal-card, .meal-plan-card').forEach(card => {
            this.enhanceMealCard(card);
        });
    }

    enhanceMealCard(mealCard) {
        if (!mealCard || mealCard.querySelector('.substitution-btn')) return;

        // Look for various action container classes
        const actionsContainer = mealCard.querySelector('.meal-actions') || 
                               mealCard.querySelector('.meal-card-actions') ||
                               mealCard.querySelector('.recipe-actions') ||
                               mealCard.querySelector('.card-actions');
        
        if (actionsContainer) {
            const substitutionBtn = document.createElement('button');
            substitutionBtn.className = 'substitution-btn btn btn-secondary btn-small';
            substitutionBtn.innerHTML = '🔄 Substitutions';
            substitutionBtn.title = 'Find ingredient substitutions';
            
            // Add click handler
            substitutionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMealCardSubstitution(mealCard);
            });
            
            actionsContainer.appendChild(substitutionBtn);
        } else {
            // If no actions container exists, create one
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'meal-card-actions';
            
            const substitutionBtn = document.createElement('button');
            substitutionBtn.className = 'substitution-btn btn btn-secondary btn-small';
            substitutionBtn.innerHTML = '🔄 Substitutions';
            substitutionBtn.title = 'Find ingredient substitutions';
            
            substitutionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMealCardSubstitution(mealCard);
            });
            
            actionsDiv.appendChild(substitutionBtn);
            mealCard.appendChild(actionsDiv);
        }
    }

    /**
     * Handle substitution button click for a meal card
     */
    handleMealCardSubstitution(mealCard) {
        // Extract meal name and ingredients from the card
        const mealName = mealCard.querySelector('h3, h4, .meal-title, .recipe-title')?.textContent?.trim() || 'Current Meal';
        const ingredients = this.extractIngredientsFromMealCard(mealCard);
        
        // Open substitution modal with the meal data
        this.openSubstitutionModal(mealName, ingredients);
    }

    /**
     * Extract ingredients from a meal card
     */
    extractIngredientsFromMealCard(mealCard) {
        const ingredients = [];
        
        // Try to find ingredients list in the card
        const ingredientsList = mealCard.querySelector('.ingredients, .recipe-ingredients');
        if (ingredientsList) {
            const items = ingredientsList.querySelectorAll('li, .ingredient-item');
            items.forEach(item => {
                const text = item.textContent?.trim();
                if (text) {
                    // Extract just the ingredient name (remove quantities)
                    const ingredient = text.replace(/^\d+\s*(cups?|tbsp|tsp|oz|lbs?|grams?|ml|l)\s*/i, '').trim();
                    if (ingredient) ingredients.push(ingredient);
                }
            });
        }
        
        // If no ingredients found, provide a default set
        if (ingredients.length === 0) {
            ingredients.push('chicken breast', 'rice', 'vegetables');
        }
        
        return ingredients;
    }

    addPantryManagementButton() {
        // Add to preferences section
        const preferencesSection = document.querySelector('#preferences .preference-group') || 
                                 document.querySelector('#preferences');
        
        if (preferencesSection) {
            const pantrySection = document.createElement('div');
            pantrySection.className = 'preference-group pantry-management-section';
            pantrySection.innerHTML = `
                <h4>🏠 Pantry Management</h4>
                <p>Manage your pantry inventory for better substitution suggestions</p>
                <button class="pantry-manager-btn btn btn-primary">Manage Pantry</button>
                <button class="substitution-preferences-btn btn btn-secondary">Substitution Preferences</button>
            `;
            
            preferencesSection.appendChild(pantrySection);
        }
    }

    addSubstitutionPreferences() {
        // Add substitution preferences to the preferences tab
        const preferencesContent = document.querySelector('#preferences .preferences-content') ||
                                 document.querySelector('#preferences');
        
        if (preferencesContent) {
            const substitutionPrefs = document.createElement('div');
            substitutionPrefs.className = 'substitution-preferences-section';
            substitutionPrefs.innerHTML = `
                <div class="preference-group">
                    <h4>🔄 Smart Substitutions</h4>
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableSmartSubstitutions" ${this.userPreferences.enableSmartSubstitutions !== false ? 'checked' : ''}>
                        Enable smart ingredient substitutions
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="preferPantryItems" ${this.userPreferences.preferPantryItems ? 'checked' : ''}>
                        Prefer ingredients from my pantry
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="preferSeasonalItems" ${this.userPreferences.preferSeasonalItems ? 'checked' : ''}>
                        Prefer seasonal ingredients
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="showNutritionalComparison" ${this.userPreferences.showNutritionalComparison !== false ? 'checked' : ''}>
                        Show nutritional comparisons
                    </label>
                </div>
            `;
            
            preferencesContent.appendChild(substitutionPrefs);
            
            // Add event listeners for preference changes
            substitutionPrefs.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.userPreferences[e.target.id] = e.target.checked;
                    this.saveUserPreferences();
                });
            });
        }
    }

    async showMealSubstitutions(mealCard) {
        const mealTitle = mealCard.querySelector('.meal-title')?.textContent || 'Unknown Meal';
        
        // Extract ingredients from meal (this would ideally come from a structured recipe)
        const ingredients = this.extractIngredientsFromMeal(mealTitle);
        
        if (ingredients.length === 0) {
            this.showToast('No ingredients detected for substitution', 'info');
            return;
        }

        this.showSubstitutionModal({
            title: mealTitle,
            ingredients: ingredients
        });
    }

    async showIngredientSubstitutions(ingredientName) {
        const options = {
            allergies: this.userPreferences.allergies || [],
            dietaryRestrictions: this.userPreferences.dietaryRestrictions || [],
            pantryItems: this.pantryItems,
            nutritionalGoals: this.userPreferences.nutritionalGoals || {},
            season: this.substitutionManager.getCurrentSeason()
        };

        const substitutions = await this.substitutionManager.getSubstitutions(ingredientName, options);
        this.showIngredientSubstitutionModal(ingredientName, substitutions);
    }

    showSubstitutionModal(recipe) {
        const modal = this.createModal('recipe-substitutions', 'Recipe Substitutions');
        
        const content = `
            <div class="substitution-modal-content">
                <div class="recipe-header">
                    <h3>${recipe.title}</h3>
                    <p>Find ingredient substitutions based on your preferences and pantry</p>
                </div>
                
                <div class="substitution-options">
                    <div class="quick-filters">
                        <button class="filter-btn" data-filter="all">All Ingredients</button>
                        <button class="filter-btn" data-filter="pantry">Use Pantry Items</button>
                        <button class="filter-btn" data-filter="seasonal">Seasonal Options</button>
                        <button class="filter-btn" data-filter="dietary">Dietary Friendly</button>
                    </div>
                    
                    <div class="ingredients-substitution-list" id="ingredientsSubstitutionList">
                        ${this.renderIngredientsList(recipe.ingredients)}
                    </div>
                </div>
                
                <div class="substitution-summary">
                    <h4>Substitution Summary</h4>
                    <div id="substitutionSummary" class="summary-content">
                        <p>Select ingredients above to see substitution options</p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="applySubstitutions">Apply Substitutions</button>
                    <button class="btn btn-secondary" id="saveSubstitutionPreset">Save as Preset</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Cancel</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        this.setupSubstitutionModalEvents(modal, recipe);
        modal.style.display = 'block';
    }

    showIngredientSubstitutionModal(ingredient, substitutions) {
        const modal = this.createModal('ingredient-substitution', `Substitutions for ${ingredient}`);
        
        const content = `
            <div class="ingredient-substitution-content">
                <div class="original-ingredient">
                    <h4>Original: ${ingredient}</h4>
                    ${substitutions.nutritionalComparison ? this.renderNutritionalInfo(substitutions.nutritionalComparison.original) : ''}
                </div>
                
                <div class="substitution-options">
                    <h4>Substitution Options</h4>
                    ${this.renderSubstitutionOptions(substitutions.substitutions)}
                </div>
                
                ${substitutions.cookingTips.length > 0 ? `
                    <div class="cooking-tips">
                        <h4>Cooking Tips</h4>
                        <ul>
                            ${substitutions.cookingTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${substitutions.seasonalNote ? `
                    <div class="seasonal-note">
                        <p><strong>Seasonal Note:</strong> ${substitutions.seasonalNote}</p>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal').style.display='none'">Close</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        modal.style.display = 'block';
    }

    showPantryManager() {
        const modal = this.createModal('pantry-manager', 'Pantry Management');
        
        const content = `
            <div class="pantry-manager-content">
                <div class="pantry-header">
                    <h3>Your Pantry Inventory</h3>
                    <p>Keep track of what you have to get better substitution suggestions</p>
                </div>
                
                <div class="add-pantry-item">
                    <div class="input-group">
                        <input type="text" id="newPantryItem" placeholder="Add ingredient to pantry..." class="form-input">
                        <button id="addPantryItemBtn" class="btn btn-primary">Add</button>
                    </div>
                </div>
                
                <div class="pantry-categories">
                    <div class="category-tabs">
                        <button class="category-tab active" data-category="all">All Items</button>
                        <button class="category-tab" data-category="produce">Produce</button>
                        <button class="category-tab" data-category="meat">Proteins</button>
                        <button class="category-tab" data-category="dairy">Dairy</button>
                        <button class="category-tab" data-category="pantry">Pantry</button>
                    </div>
                    
                    <div class="pantry-items-grid" id="pantryItemsGrid">
                        ${this.renderPantryItems()}
                    </div>
                </div>
                
                <div class="pantry-suggestions">
                    <h4>Suggested Items to Add</h4>
                    <div class="suggested-items" id="suggestedItems">
                        ${this.renderSuggestedPantryItems()}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal').style.display='none'">Done</button>
                    <button class="btn btn-secondary" id="clearPantryBtn">Clear All</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        this.setupPantryManagerEvents(modal);
        modal.style.display = 'block';
    }

    showPreferencesManager() {
        const modal = this.createModal('substitution-preferences', 'Substitution Preferences');
        
        const content = `
            <div class="preferences-manager-content">
                <div class="preferences-section">
                    <h4>Dietary Restrictions</h4>
                    <div class="dietary-options">
                        ${this.renderDietaryOptions()}
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h4>Allergies</h4>
                    <div class="allergy-options">
                        ${this.renderAllergyOptions()}
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h4>Nutritional Goals</h4>
                    <div class="nutritional-goals">
                        ${this.renderNutritionalGoals()}
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h4>Substitution Behavior</h4>
                    <div class="behavior-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="preferBudgetFriendly" ${this.userPreferences.preferBudgetFriendly ? 'checked' : ''}>
                            Prefer budget-friendly alternatives
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="preferHealthierOptions" ${this.userPreferences.preferHealthierOptions ? 'checked' : ''}>
                            Prefer healthier alternatives
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="preferLocalIngredients" ${this.userPreferences.preferLocalIngredients ? 'checked' : ''}>
                            Prefer locally available ingredients
                        </label>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="savePreferencesBtn">Save Preferences</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Cancel</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-body').innerHTML = content;
        this.setupPreferencesManagerEvents(modal);
        modal.style.display = 'block';
    }

    createModal(id, title) {
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal substitution-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        return modal;
    }

    renderIngredientsList(ingredients) {
        return ingredients.map(ingredient => `
            <div class="ingredient-item" data-ingredient="${ingredient}">
                <div class="ingredient-info">
                    <span class="ingredient-name">${ingredient}</span>
                    <span class="ingredient-status" id="status-${ingredient}">Click to find substitutions</span>
                </div>
                <button class="find-substitutions-btn btn btn-small" data-ingredient="${ingredient}">
                    Find Substitutions
                </button>
            </div>
        `).join('');
    }

    renderSubstitutionOptions(substitutions) {
        if (!substitutions || substitutions.length === 0) {
            return '<p>No suitable substitutions found</p>';
        }

        return substitutions.map(sub => `
            <div class="substitution-option ${sub.availability}" data-score="${sub.score}">
                <div class="substitution-header">
                    <h5>${sub.name}</h5>
                    <div class="substitution-score">
                        <span class="score-value">${Math.round(sub.score)}%</span>
                        <span class="score-label">match</span>
                    </div>
                </div>
                
                <div class="substitution-details">
                    <div class="substitution-ratio">
                        <strong>Ratio:</strong> ${sub.ratio === 1 ? '1:1' : `${sub.ratio}:1`}
                    </div>
                    
                    <div class="substitution-category">
                        <strong>Category:</strong> ${sub.category}
                    </div>
                    
                    ${sub.dietary ? `
                        <div class="dietary-tags">
                            ${sub.dietary.map(diet => `<span class="dietary-tag">${diet}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="substitution-reasons">
                        ${sub.reasons.map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
                    </div>
                    
                    <div class="availability-indicator ${sub.availability}">
                        ${sub.availability === 'in-pantry' ? '🏠 In your pantry' : '🛒 Need to buy'}
                    </div>
                    
                    ${sub.seasonality === 'in-season' ? '<div class="seasonal-indicator">🌱 In season</div>' : ''}
                </div>
                
                <button class="select-substitution-btn btn btn-primary btn-small" data-substitution="${sub.name}">
                    Select This Option
                </button>
            </div>
        `).join('');
    }

    renderNutritionalInfo(nutrition) {
        return `
            <div class="nutritional-info">
                <div class="nutrition-item">
                    <span class="nutrition-label">Calories:</span>
                    <span class="nutrition-value">${nutrition.calories}</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Protein:</span>
                    <span class="nutrition-value">${nutrition.protein}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Carbs:</span>
                    <span class="nutrition-value">${nutrition.carbs}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Fat:</span>
                    <span class="nutrition-value">${nutrition.fat}g</span>
                </div>
            </div>
        `;
    }

    renderPantryItems() {
        if (this.pantryItems.length === 0) {
            return '<p class="empty-pantry">Your pantry is empty. Add some ingredients to get started!</p>';
        }

        return this.pantryItems.map(item => `
            <div class="pantry-item">
                <span class="item-name">${item}</span>
                <button class="remove-item-btn" data-item="${item}" title="Remove from pantry">×</button>
            </div>
        `).join('');
    }

    renderSuggestedPantryItems() {
        const suggestions = [
            'olive oil', 'salt', 'black pepper', 'garlic', 'onions',
            'chicken breast', 'eggs', 'milk', 'butter', 'flour'
        ];

        return suggestions.filter(item => !this.pantryItems.includes(item)).map(item => `
            <button class="suggested-item-btn btn btn-small" data-item="${item}">
                + ${item}
            </button>
        `).join('');
    }

    renderDietaryOptions() {
        const options = ['vegetarian', 'vegan', 'keto', 'paleo', 'low-carb', 'low-fat', 'mediterranean'];
        return options.map(option => `
            <label class="checkbox-label">
                <input type="checkbox" name="dietaryRestrictions" value="${option}" 
                       ${this.userPreferences.dietaryRestrictions?.includes(option) ? 'checked' : ''}>
                ${option.charAt(0).toUpperCase() + option.slice(1)}
            </label>
        `).join('');
    }

    renderAllergyOptions() {
        const allergies = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'fish'];
        return allergies.map(allergy => `
            <label class="checkbox-label">
                <input type="checkbox" name="allergies" value="${allergy}"
                       ${this.userPreferences.allergies?.includes(allergy) ? 'checked' : ''}>
                ${allergy.charAt(0).toUpperCase() + allergy.slice(1)}
            </label>
        `).join('');
    }

    renderNutritionalGoals() {
        const goals = ['highProtein', 'lowCarb', 'lowFat', 'highFiber', 'lowCalorie'];
        return goals.map(goal => `
            <label class="checkbox-label">
                <input type="checkbox" name="nutritionalGoals" value="${goal}"
                       ${this.userPreferences.nutritionalGoals?.[goal] ? 'checked' : ''}>
                ${this.formatGoalName(goal)}
            </label>
        `).join('');
    }

    formatGoalName(goal) {
        return goal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    setupSubstitutionModalEvents(modal, recipe) {
        modal.addEventListener('click', async (e) => {
            if (e.target.classList.contains('find-substitutions-btn')) {
                const ingredient = e.target.dataset.ingredient;
                const substitutions = await this.substitutionManager.getSubstitutions(ingredient, {
                    allergies: this.userPreferences.allergies || [],
                    dietaryRestrictions: this.userPreferences.dietaryRestrictions || [],
                    pantryItems: this.pantryItems
                });
                
                const statusElement = modal.querySelector(`#status-${ingredient}`);
                if (substitutions.substitutions.length > 0) {
                    statusElement.textContent = `${substitutions.substitutions.length} substitutions found`;
                    statusElement.className = 'ingredient-status found';
                } else {
                    statusElement.textContent = 'No substitutions found';
                    statusElement.className = 'ingredient-status not-found';
                }
            }
        });
    }

    setupPantryManagerEvents(modal) {
        const addBtn = modal.querySelector('#addPantryItemBtn');
        const input = modal.querySelector('#newPantryItem');
        const grid = modal.querySelector('#pantryItemsGrid');
        
        addBtn.addEventListener('click', () => {
            const item = input.value.trim();
            if (item && !this.pantryItems.includes(item)) {
                this.pantryItems.push(item);
                this.substitutionManager.addToPantry(item);
                this.saveUserPreferences();
                grid.innerHTML = this.renderPantryItems();
                input.value = '';
                this.updateSuggestedItems(modal);
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const item = e.target.dataset.item;
                this.pantryItems = this.pantryItems.filter(i => i !== item);
                this.substitutionManager.removeFromPantry(item);
                this.saveUserPreferences();
                grid.innerHTML = this.renderPantryItems();
                this.updateSuggestedItems(modal);
            }
            
            if (e.target.classList.contains('suggested-item-btn')) {
                const item = e.target.dataset.item;
                this.pantryItems.push(item);
                this.substitutionManager.addToPantry(item);
                this.saveUserPreferences();
                grid.innerHTML = this.renderPantryItems();
                this.updateSuggestedItems(modal);
            }
        });
    }

    updateSuggestedItems(modal) {
        const suggestedContainer = modal.querySelector('#suggestedItems');
        suggestedContainer.innerHTML = this.renderSuggestedPantryItems();
    }

    setupPreferencesManagerEvents(modal) {
        const saveBtn = modal.querySelector('#savePreferencesBtn');
        
        saveBtn.addEventListener('click', () => {
            // Collect dietary restrictions
            const dietaryRestrictions = Array.from(modal.querySelectorAll('input[name="dietaryRestrictions"]:checked'))
                .map(input => input.value);
            
            // Collect allergies
            const allergies = Array.from(modal.querySelectorAll('input[name="allergies"]:checked'))
                .map(input => input.value);
            
            // Collect nutritional goals
            const nutritionalGoals = {};
            modal.querySelectorAll('input[name="nutritionalGoals"]:checked').forEach(input => {
                nutritionalGoals[input.value] = true;
            });
            
            // Collect other preferences
            const otherPrefs = {};
            modal.querySelectorAll('input[type="checkbox"]:not([name])').forEach(input => {
                otherPrefs[input.id] = input.checked;
            });
            
            this.userPreferences = {
                ...this.userPreferences,
                dietaryRestrictions,
                allergies,
                nutritionalGoals,
                ...otherPrefs
            };
            
            this.saveUserPreferences();
            this.showToast('Preferences saved successfully', 'success');
            modal.style.display = 'none';
        });
    }

    extractIngredientsFromMeal(mealTitle) {
        // Basic ingredient extraction - in a real app, this would use NLP or a recipe database
        const commonIngredients = [
            'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp',
            'rice', 'pasta', 'noodles', 'bread',
            'cheese', 'milk', 'butter', 'eggs',
            'onion', 'garlic', 'tomato', 'pepper',
            'oil', 'flour', 'sugar'
        ];
        
        const found = [];
        const lowerTitle = mealTitle.toLowerCase();
        
        commonIngredients.forEach(ingredient => {
            if (lowerTitle.includes(ingredient)) {
                found.push(ingredient);
            }
        });
        
        return found.length > 0 ? found : ['chicken', 'rice', 'vegetables']; // Default ingredients
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    enhanceRecipeModals() {
        // Enhance existing recipe modals with substitution features
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (node.id === 'recipeModal' || node.classList?.contains('recipe-modal'))) {
                        this.addSubstitutionToRecipeModal(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addSubstitutionToRecipeModal(modal) {
        const ingredientsList = modal.querySelector('.ingredients-list, .recipe-ingredients');
        if (ingredientsList && !modal.querySelector('.substitution-enhancement')) {
            const enhancementDiv = document.createElement('div');
            enhancementDiv.className = 'substitution-enhancement';
            enhancementDiv.innerHTML = `
                <button class="btn btn-secondary btn-small recipe-substitution-btn">
                    🔄 Find Substitutions
                </button>
            `;
            
            ingredientsList.appendChild(enhancementDiv);
            
            enhancementDiv.querySelector('.recipe-substitution-btn').addEventListener('click', () => {
                // Extract recipe data and show substitutions
                const recipeTitle = modal.querySelector('.recipe-title, h3')?.textContent || 'Recipe';
                const ingredients = this.extractIngredientsFromRecipeModal(modal);
                this.showSubstitutionModal({ title: recipeTitle, ingredients });
            });
        }
    }

    extractIngredientsFromRecipeModal(modal) {
        const ingredientElements = modal.querySelectorAll('.ingredient-item, .recipe-ingredient, li');
        const ingredients = [];
        
        ingredientElements.forEach(element => {
            const text = element.textContent.trim();
            if (text) {
                // Extract just the ingredient name (remove quantities and units)
                const ingredient = text.replace(/^\d+\s*(cups?|tbsp|tsp|lbs?|oz|g|kg|ml|l)\s*/i, '').trim();
                if (ingredient) {
                    ingredients.push(ingredient);
                }
            }
        });
        
        return ingredients.length > 0 ? ingredients : this.extractIngredientsFromMeal(modal.querySelector('.recipe-title, h3')?.textContent || '');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ingredientSubstitutionUI = new IngredientSubstitutionUI();
    });
} else {
    window.ingredientSubstitutionUI = new IngredientSubstitutionUI();
}

export default IngredientSubstitutionUI;
export { IngredientSubstitutionUI };
