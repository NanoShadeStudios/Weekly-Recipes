/**
 * Global Error Boundary and Error Handling
 * Provides comprehensive error tracking and user-friendly error handling
 */

class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandlers();
        console.log('Error Boundary initialized');
    }

    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError({
                message: event.error?.message || 'Unknown error',
                stack: event.error?.stack || 'No stack trace',
                context: 'global',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError({
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack || 'No stack trace',
                context: 'promise',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
    }

    handleError(errorInfo) {
        // Log the error
        this.errors.push(errorInfo);
        console.error('Error handled by boundary:', errorInfo);

        // Don't show UI errors for certain types of errors
        const suppressedErrors = [
            'Script error',
            'Non-Error promise rejection captured',
            'ResizeObserver loop limit exceeded'
        ];

        if (suppressedErrors.some(suppressed => errorInfo.message.includes(suppressed))) {
            return;
        }

        // Disable error UI - just log errors without showing notifications
        console.log('Error boundary: Error logged but UI notification disabled');
        return;

        // Show user-friendly error message (DISABLED)
        // this.showErrorNotification('Something went wrong, but the app should continue working.');
    }

    

    // Method to manually report errors
    reportError(error, context = 'manual') {
        this.handleError({
            message: error.message || error.toString(),
            stack: error.stack || 'No stack trace',
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }

    // Get all errors for debugging
    getErrors() {
        return this.errors;
    }

    // Clear error log
    clearErrors() {
        this.errors = [];
    }
}

// Create global error boundary instance
const errorBoundary = new ErrorBoundary();

// Export for use in other modules
export { errorBoundary };

// Make available globally
window.errorBoundary = errorBoundary;
