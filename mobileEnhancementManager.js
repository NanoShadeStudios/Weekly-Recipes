/**
 * Mobile Enhancement Manager
 * Handles mobile-specific features, touch gestures, and responsive improvements
 */

class MobileEnhancementManager {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.longPressDelay = 500;
        this.longPressTimer = null;
        this.activeElement = null;
        this.gestureState = {
            isSwipeDetected: false,
            isPinching: false,
            scale: 1
        };
        
        this.initialize();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    async initialize() {
        if (this.isMobile || this.isTouch) {
            this.setupTouchGestures();
            this.setupMobileOptimizations();
            this.enhanceCalendarNavigation();
            this.improveScrolling();
            this.addMobileSpecificStyles();
            this.setupVibrationFeedback();
            this.optimizeForViewport();
            console.log('Mobile enhancements initialized');
        }
    }

    setupTouchGestures() {
        // Add swipe gestures for meal navigation
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Long press gestures
        document.addEventListener('touchstart', this.handleLongPressStart.bind(this));
        document.addEventListener('touchend', this.handleLongPressEnd.bind(this));
        document.addEventListener('touchmove', this.handleLongPressEnd.bind(this));
        
        // Pinch to zoom for meal cards
        document.addEventListener('gesturestart', this.handlePinchStart.bind(this));
        document.addEventListener('gesturechange', this.handlePinchChange.bind(this));
        document.addEventListener('gestureend', this.handlePinchEnd.bind(this));
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.gestureState.isSwipeDetected = false;
        
        // Add touch visual feedback
        const target = e.target.closest('.meal-card, .tab-btn, .btn');
        if (target) {
            target.classList.add('touch-active');
        }
    }

    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) {
            return;
        }

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = this.touchStartX - touchX;
        const diffY = this.touchStartY - touchY;

        // Check if this is a swipe gesture
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
            this.gestureState.isSwipeDetected = true;
            
            const target = e.target.closest('.meal-card, .calendar-day, .weekly-calendar');
            if (target) {
                if (diffX > 0) {
                    this.handleSwipeLeft(target);
                } else {
                    this.handleSwipeRight(target);
                }
            }
        }
    }

    handleTouchEnd(e) {
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Remove touch visual feedback
        const target = e.target.closest('.meal-card, .tab-btn, .btn');
        if (target) {
            target.classList.remove('touch-active');
        }
    }

    handleSwipeLeft(element) {
        if (element.classList.contains('meal-card')) {
            this.swipeMealCard(element, 'left');
        } else if (element.classList.contains('calendar-day')) {
            this.navigateCalendar('next');
        } else if (element.classList.contains('weekly-calendar')) {
            this.navigateWeek('next');
        }
        this.triggerHapticFeedback();
    }

    handleSwipeRight(element) {
        if (element.classList.contains('meal-card')) {
            this.swipeMealCard(element, 'right');
        } else if (element.classList.contains('calendar-day')) {
            this.navigateCalendar('prev');
        } else if (element.classList.contains('weekly-calendar')) {
            this.navigateWeek('prev');
        }
        this.triggerHapticFeedback();
    }

    swipeMealCard(mealCard, direction) {
        const mealId = mealCard.dataset.mealId;
        if (!mealId) return;

        if (direction === 'left') {
            // Swipe left - dislike meal
            this.animateSwipe(mealCard, direction);
            setTimeout(() => {
                this.handleMealDislike(mealId);
                this.showSwipeToast('Meal disliked', '👎');
            }, 300);
        } else if (direction === 'right') {
            // Swipe right - like meal
            this.animateSwipe(mealCard, direction);
            setTimeout(() => {
                this.handleMealLike(mealId);
                this.showSwipeToast('Meal liked', '👍');
            }, 300);
        }
    }

    animateSwipe(element, direction) {
        const translateX = direction === 'left' ? '-100%' : '100%';
        element.style.transform = `translateX(${translateX})`;
        element.style.opacity = '0.5';
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.opacity = '';
            element.style.transition = '';
        }, 600);
    }

    handleLongPressStart(e) {
        this.activeElement = e.target.closest('.meal-card');
        if (this.activeElement) {
            this.longPressTimer = setTimeout(() => {
                this.showMealOptions(this.activeElement);
                this.triggerHapticFeedback('heavy');
            }, this.longPressDelay);
        }
    }

    handleLongPressEnd() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.activeElement = null;
    }

    showMealOptions(mealCard) {
        const mealId = mealCard.dataset.mealId;
        if (!mealId) return;

        const options = [
            { text: 'Pin to Plan', action: 'pin', icon: '📌' },
            { text: 'Add to Shopping List', action: 'shopping', icon: '🛒' },
            { text: 'View Recipe', action: 'recipe', icon: '📖' },
            { text: 'Share Meal', action: 'share', icon: '📤' },
            { text: 'More Options', action: 'more', icon: '⋯' }
        ];

        this.showActionSheet(options, mealId);
    }

    showActionSheet(options, mealId) {
        const existingSheet = document.getElementById('mobileActionSheet');
        if (existingSheet) {
            existingSheet.remove();
        }

        const actionSheet = document.createElement('div');
        actionSheet.id = 'mobileActionSheet';
        actionSheet.className = 'mobile-action-sheet';
        actionSheet.innerHTML = `
            <div class="action-sheet-backdrop"></div>
            <div class="action-sheet-content">
                <div class="action-sheet-header">
                    <h3>Meal Options</h3>
                    <button class="action-sheet-close">×</button>
                </div>
                <div class="action-sheet-options">
                    ${options.map(option => `
                        <button class="action-sheet-option" data-action="${option.action}" data-meal-id="${mealId}">
                            <span class="option-icon">${option.icon}</span>
                            <span class="option-text">${option.text}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(actionSheet);
        
        // Animate in
        setTimeout(() => actionSheet.classList.add('active'), 10);

        // Add event listeners
        actionSheet.querySelector('.action-sheet-close').addEventListener('click', () => {
            this.hideActionSheet(actionSheet);
        });

        actionSheet.querySelector('.action-sheet-backdrop').addEventListener('click', () => {
            this.hideActionSheet(actionSheet);
        });

        actionSheet.querySelectorAll('.action-sheet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const mealId = e.currentTarget.dataset.mealId;
                this.handleActionSheetOption(action, mealId);
                this.hideActionSheet(actionSheet);
            });
        });
    }

    hideActionSheet(actionSheet) {
        actionSheet.classList.remove('active');
        setTimeout(() => actionSheet.remove(), 300);
    }

    handleActionSheetOption(action, mealId) {
        switch (action) {
            case 'pin':
                if (window.mealActions) {
                    window.mealActions.pinMeal(mealId);
                }
                this.showToast('Meal pinned to plan', '📌');
                break;
            case 'shopping':
                if (window.shoppingListManager) {
                    window.shoppingListManager.addMealToList(mealId);
                }
                this.showToast('Added to shopping list', '🛒');
                break;
            case 'recipe':
                if (window.mealActions) {
                    window.mealActions.showRecipeDetails(mealId);
                }
                break;
            case 'share':
                this.shareMeal(mealId);
                break;
            case 'more':
                // Show additional options
                break;
        }
    }

    enhanceCalendarNavigation() {
        // Add touch-friendly calendar navigation
        const calendar = document.querySelector('.calendar-grid, .weekly-calendar');
        if (calendar) {
            // Add navigation arrows for mobile
            this.addMobileCalendarControls(calendar);
            
            // Improve day selection
            this.enhanceDaySelection();
            
            // Add month/week swipe navigation
            this.addCalendarSwipeNavigation(calendar);
        }
    }

    addMobileCalendarControls(calendar) {
        const existingControls = calendar.querySelector('.mobile-calendar-controls');
        if (existingControls) return;

        const controls = document.createElement('div');
        controls.className = 'mobile-calendar-controls';
        controls.innerHTML = `
            <button class="mobile-nav-btn prev-btn" aria-label="Previous">‹</button>
            <div class="calendar-title-mobile">
                <span class="current-month-year"></span>
            </div>
            <button class="mobile-nav-btn next-btn" aria-label="Next">›</button>
        `;

        calendar.insertBefore(controls, calendar.firstChild);

        // Add event listeners
        controls.querySelector('.prev-btn').addEventListener('click', () => {
            this.navigateCalendar('prev');
        });

        controls.querySelector('.next-btn').addEventListener('click', () => {
            this.navigateCalendar('next');
        });

        // Update title
        this.updateCalendarTitle();
    }

    navigateCalendar(direction) {
        // Trigger navigation event
        const event = new CustomEvent('mobileCalendarNavigate', {
            detail: { direction }
        });
        document.dispatchEvent(event);
        
        setTimeout(() => {
            this.updateCalendarTitle();
        }, 100);
    }

    navigateWeek(direction) {
        const event = new CustomEvent('mobileWeekNavigate', {
            detail: { direction }
        });
        document.dispatchEvent(event);
    }

    updateCalendarTitle() {
        const titleElement = document.querySelector('.current-month-year');
        if (titleElement) {
            const now = new Date();
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            titleElement.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        }
    }

    enhanceDaySelection() {
        document.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day, .day-cell');
            if (dayElement && this.isMobile) {
                // Add ripple effect
                this.addRippleEffect(dayElement, e);
                
                // Improve visual feedback
                this.highlightSelectedDay(dayElement);
            }
        });
    }

    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        ripple.className = 'mobile-ripple';
        
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    highlightSelectedDay(dayElement) {
        // Remove previous selections
        document.querySelectorAll('.calendar-day.mobile-selected, .day-cell.mobile-selected')
            .forEach(el => el.classList.remove('mobile-selected'));
        
        // Add selection to current day
        dayElement.classList.add('mobile-selected');
    }

    improveScrolling() {
        // Add momentum scrolling for iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Improve scroll performance
        const scrollContainers = document.querySelectorAll('.content-area, .meal-list, .calendar-container');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.scrollBehavior = 'smooth';
        });

        // Add scroll position restoration
        this.setupScrollRestoration();
    }

    setupScrollRestoration() {
        let scrollPositions = {};
        
        document.addEventListener('scroll', () => {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab) {
                scrollPositions[activeTab.id] = window.scrollY;
            }
        });

        // Restore scroll position when switching tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const targetTab = e.target.getAttribute('aria-controls');
                if (targetTab && scrollPositions[targetTab]) {
                    setTimeout(() => {
                        window.scrollTo(0, scrollPositions[targetTab]);
                    }, 100);
                }
            }
        });
    }

    addMobileSpecificStyles() {
        const mobileStyles = document.createElement('style');
        mobileStyles.id = 'mobile-enhancement-styles';
        mobileStyles.textContent = `
            /* Mobile Enhancement Styles */
            .touch-active {
                background-color: rgba(59, 130, 246, 0.1) !important;
                transform: scale(0.98);
                transition: all 0.1s ease;
            }

            .mobile-ripple {
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(59, 130, 246, 0.5);
                border-radius: 50%;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
                z-index: 10;
            }

            @keyframes ripple {
                to {
                    transform: scale(20);
                    opacity: 0;
                }
            }

            .mobile-calendar-controls {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-3);
                background: var(--card-bg);
                border-radius: var(--border-radius);
                margin-bottom: var(--spacing-3);
                box-shadow: var(--shadow-sm);
            }

            .mobile-nav-btn {
                background: var(--primary-color);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .mobile-nav-btn:hover,
            .mobile-nav-btn:active {
                background: var(--primary-dark);
                transform: scale(1.1);
            }

            .calendar-title-mobile {
                font-weight: 600;
                color: var(--text-primary);
                text-align: center;
                flex: 1;
            }

            .mobile-selected {
                background: var(--primary-color) !important;
                color: white !important;
                transform: scale(1.05);
                box-shadow: var(--shadow-md);
            }

            .mobile-action-sheet {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .mobile-action-sheet.active {
                opacity: 1;
                visibility: visible;
            }

            .action-sheet-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(2px);
            }

            .action-sheet-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--card-bg);
                border-radius: 20px 20px 0 0;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                max-height: 80vh;
                overflow-y: auto;
            }

            .mobile-action-sheet.active .action-sheet-content {
                transform: translateY(0);
            }

            .action-sheet-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-4);
                border-bottom: 1px solid var(--border-color);
            }

            .action-sheet-header h3 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.2rem;
            }

            .action-sheet-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .action-sheet-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .action-sheet-options {
                padding: var(--spacing-2);
            }

            .action-sheet-option {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                width: 100%;
                padding: var(--spacing-3);
                background: none;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
                color: var(--text-primary);
                font-size: 1rem;
                transition: background 0.3s ease;
            }

            .action-sheet-option:hover,
            .action-sheet-option:active {
                background: rgba(59, 130, 246, 0.1);
            }

            .option-icon {
                font-size: 1.2rem;
                width: 24px;
                text-align: center;
            }

            .option-text {
                flex: 1;
                text-align: left;
            }

            /* Better mobile meal cards */
            @media (max-width: 768px) {
                .meal-card {
                    touch-action: pan-y;
                    user-select: none;
                    cursor: pointer;
                }

                .meal-card:active {
                    transform: scale(0.98);
                }

                .calendar-day,
                .day-cell {
                    min-height: 48px;
                    touch-action: manipulation;
                }

                .btn {
                    min-height: 44px;
                    touch-action: manipulation;
                }

                .tab-btn {
                    padding: var(--spacing-3) var(--spacing-2);
                    min-height: 48px;
                }

                /* Improve text selection on mobile */
                .meal-title,
                .meal-description {
                    user-select: none;
                }

                /* Better spacing for touch */
                .meal-actions {
                    gap: var(--spacing-3);
                }

                .meal-actions .btn {
                    padding: var(--spacing-2) var(--spacing-3);
                    min-width: 44px;
                }
            }

            /* Toast notifications for mobile */
            .mobile-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--card-bg);
                color: var(--text-primary);
                padding: var(--spacing-3) var(--spacing-4);
                border-radius: 25px;
                box-shadow: var(--shadow-lg);
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
                transition: all 0.3s ease;
                border: 1px solid var(--border-color);
            }

            .mobile-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            .toast-icon {
                font-size: 1.2rem;
            }

            .toast-message {
                font-weight: 500;
            }
        `;

        document.head.appendChild(mobileStyles);
    }

    setupVibrationFeedback() {
        if ('vibrate' in navigator) {
            this.canVibrate = true;
        }
    }

    triggerHapticFeedback(type = 'light') {
        if (this.canVibrate) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(50);
                    break;
                case 'heavy':
                    navigator.vibrate([50, 50, 50]);
                    break;
            }
        }
    }

    optimizeForViewport() {
        // Ensure proper viewport settings
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

        // Handle safe area insets for newer mobile devices
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }

    showToast(message, icon = '') {
        this.showSwipeToast(message, icon);
    }

    showSwipeToast(message, icon) {
        const existingToast = document.querySelector('.mobile-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    handleMealLike(mealId) {
        // Integration with existing like system
        if (window.mealLearningSystem) {
            window.mealLearningSystem.rateMeal(mealId, 4);
        }
        this.triggerHapticFeedback('light');
    }

    handleMealDislike(mealId) {
        // Integration with existing dislike system
        if (window.mealLearningSystem) {
            window.mealLearningSystem.rateMeal(mealId, 2);
        }
        this.triggerHapticFeedback('light');
    }

    async shareMeal(mealId) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this meal!',
                    text: 'I found this great meal recipe you might like',
                    url: window.location.href + `#meal=${mealId}`
                });
                this.showToast('Meal shared successfully', '📤');
            } catch (error) {
                this.fallbackShare(mealId);
            }
        } else {
            this.fallbackShare(mealId);
        }
    }

    fallbackShare(mealId) {
        // Fallback sharing method
        if (navigator.clipboard) {
            const shareUrl = window.location.href + `#meal=${mealId}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showToast('Link copied to clipboard', '📋');
            });
        }
    }

    // Pinch to zoom handlers
    handlePinchStart(e) {
        e.preventDefault();
        this.gestureState.isPinching = true;
        this.gestureState.scale = e.scale;
    }

    handlePinchChange(e) {
        e.preventDefault();
        if (this.gestureState.isPinching) {
            const target = e.target.closest('.meal-card');
            if (target) {
                const scale = Math.min(Math.max(e.scale, 0.5), 2);
                target.style.transform = `scale(${scale})`;
            }
        }
    }

    handlePinchEnd(e) {
        e.preventDefault();
        this.gestureState.isPinching = false;
        const target = e.target.closest('.meal-card');
        if (target) {
            target.style.transform = '';
        }
    }

    updateMobileFriendlyCalendar() {
        // Update calendar for mobile-friendly display
        const calendarContainer = document.querySelector('.calendar-container');
        if (!calendarContainer) return;

        // Add mobile-specific calendar styles and interactions
        calendarContainer.classList.add('mobile-optimized');
        
        // Update calendar day elements for touch
        const calendarDays = calendarContainer.querySelectorAll('.calendar-day');
        calendarDays.forEach(day => {
            day.classList.add('mobile-day');
            day.style.minHeight = '44px'; // Minimum touch target size
            day.style.fontSize = '14px';
        });

        // Add swipe navigation indicators
        this.addCalendarSwipeIndicators();
        
        // Update calendar title for mobile
        const titleElement = document.querySelector('.current-month-year');
        if (titleElement) {
            titleElement.style.fontSize = '18px';
            titleElement.style.fontWeight = 'bold';
        }

        console.log('Mobile-friendly calendar updated');
    }

    addCalendarSwipeIndicators() {
        // Add visual indicators for swipe navigation
        const calendarContainer = document.querySelector('.calendar-container');
        if (!calendarContainer) return;

        let indicators = calendarContainer.querySelector('.swipe-indicators');
        if (!indicators) {
            indicators = document.createElement('div');
            indicators.className = 'swipe-indicators';
            indicators.innerHTML = `
                <div class="swipe-hint">
                    <span class="swipe-arrow left">‹</span>
                    <span class="swipe-text">Swipe to navigate</span>
                    <span class="swipe-arrow right">›</span>
                </div>
            `;
            calendarContainer.appendChild(indicators);
        }
    }
}

// Initialize mobile enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileEnhancementManager = new MobileEnhancementManager();
    });
} else {
    window.mobileEnhancementManager = new MobileEnhancementManager();
}

export default MobileEnhancementManager;
