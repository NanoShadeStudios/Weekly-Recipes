/**
 * Theme Manager Module
 * Handles theme switching, persistence, and UI updates
 */

export class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.availableThemes = ['light', 'dark', 'auto'];
        this.themeChangeListeners = [];
    }

    /**
     * Initialize the theme system
     */
    async initialize() {
        console.log('ThemeManager: Initializing theme system...');
        
        // Load saved theme preference
        this.loadSavedTheme();
        
        // Apply the theme
        this.applyTheme(this.currentTheme);
        
        // Set up theme toggle listeners
        this.setupThemeToggle();
        
        // Listen for system theme changes if auto mode is enabled
        this.setupSystemThemeListener();
        
        console.log('ThemeManager: Theme system initialized with theme:', this.currentTheme);
    }

    /**
     * Load theme preference from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme');
        
        if (savedTheme && this.availableThemes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            // Default to system preference
            this.currentTheme = this.getSystemTheme();
        }
    }

    /**
     * Get the system's preferred theme
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Apply a theme to the document
     */
    applyTheme(themeName) {
        const resolvedTheme = themeName === 'auto' ? this.getSystemTheme() : themeName;
        
        // Update document attribute
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        
        // Update current theme
        this.currentTheme = themeName;
        
        // Save to localStorage
        localStorage.setItem('selectedTheme', themeName);
        
        // Update toggle button
        this.updateThemeToggleIcon(resolvedTheme);
        
        // Notify listeners
        this.notifyThemeChange(themeName, resolvedTheme);
        
        console.log('ThemeManager: Applied theme:', themeName, '(resolved to:', resolvedTheme + ')');
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Set a specific theme
     */
    setTheme(themeName) {
        if (this.availableThemes.includes(themeName)) {
            this.applyTheme(themeName);
        } else {
            console.warn('ThemeManager: Invalid theme name:', themeName);
        }
    }

    /**
     * Set up theme toggle button
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Set initial state
            this.updateThemeToggleIcon(this.getResolvedTheme());
        }
    }

    /**
     * Update theme toggle button icon
     */
    updateThemeToggleIcon(resolvedTheme) {
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            const icon = resolvedTheme === 'dark' ? '☀️' : '🌙';
            const title = resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            
            themeToggle.innerHTML = icon;
            themeToggle.title = title;
            themeToggle.setAttribute('aria-label', title);
        }
    }

    /**
     * Set up system theme change listener
     */
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    // Re-apply auto theme to pick up system change
                    this.applyTheme('auto');
                }
            });
        }
    }

    /**
     * Get the currently resolved theme (what's actually applied)
     */
    getResolvedTheme() {
        return this.currentTheme === 'auto' ? this.getSystemTheme() : this.currentTheme;
    }

    /**
     * Get the current theme setting (including 'auto')
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Add a listener for theme changes
     */
    addThemeChangeListener(callback) {
        this.themeChangeListeners.push(callback);
    }

    /**
     * Remove a theme change listener
     */
    removeThemeChangeListener(callback) {
        const index = this.themeChangeListeners.indexOf(callback);
        if (index > -1) {
            this.themeChangeListeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners of theme changes
     */
    notifyThemeChange(themeName, resolvedTheme) {
        this.themeChangeListeners.forEach(callback => {
            try {
                callback(themeName, resolvedTheme);
            } catch (error) {
                console.error('ThemeManager: Error in theme change listener:', error);
            }
        });
    }

    /**
     * Create theme selector dropdown
     */
    createThemeSelector(container) {
        const selector = document.createElement('select');
        selector.id = 'themeSelector';
        selector.className = 'theme-selector';
        selector.setAttribute('aria-label', 'Select theme');
        
        this.availableThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = this.getThemeDisplayName(theme);
            if (theme === this.currentTheme) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
        
        selector.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
        
        if (container) {
            container.appendChild(selector);
        }
        
        return selector;
    }

    /**
     * Get display name for theme
     */
    getThemeDisplayName(theme) {
        const names = {
            'light': 'Light',
            'dark': 'Dark',
            'auto': 'Auto (System)'
        };
        return names[theme] || theme;
    }

    /**
     * Get theme statistics
     */
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            resolvedTheme: this.getResolvedTheme(),
            systemTheme: this.getSystemTheme(),
            availableThemes: [...this.availableThemes],
            listenerCount: this.themeChangeListeners.length
        };
    }

    /**
     * Reset theme to default
     */
    resetToDefault() {
        this.applyTheme('light');
    }

    /**
     * Check if theme is supported
     */
    isThemeSupported(themeName) {
        return this.availableThemes.includes(themeName);
    }
}

// Create and export a singleton instance
export const themeManager = new ThemeManager();
