/**
 * Structured Logging Service
 * Provides centralized logging with levels, filtering, and formatting
 */

import { errorTracker } from './errorTracker.js';

export class Logger {
    constructor(name = 'App') {
        this.name = name;
        this.logLevel = this.getLogLevel();
        this.enableColors = true;
        this.enableTimestamps = true;
        this.enableContext = true;
        
        // Log levels in order of severity
        this.levels = {
            'ERROR': 0,
            'WARN': 1,
            'INFO': 2,
            'DEBUG': 3,
            'TRACE': 4
        };
        
        // Colors for different log levels (console)
        this.colors = {
            'ERROR': '\x1b[31m', // Red
            'WARN': '\x1b[33m',  // Yellow
            'INFO': '\x1b[36m',  // Cyan
            'DEBUG': '\x1b[35m', // Magenta
            'TRACE': '\x1b[37m', // White
            'RESET': '\x1b[0m'   // Reset
        };
    }

    /**
     * Get current log level from localStorage or default
     */
    getLogLevel() {
        const saved = localStorage.getItem('logLevel');
        return saved || (process?.env?.NODE_ENV === 'development' ? 'DEBUG' : 'INFO');
    }

    /**
     * Set log level
     */
    setLogLevel(level) {
        if (this.levels.hasOwnProperty(level.toUpperCase())) {
            this.logLevel = level.toUpperCase();
            localStorage.setItem('logLevel', this.logLevel);
            this.info('Log level changed', { newLevel: this.logLevel });
        } else {
            this.warn('Invalid log level', { attempted: level, valid: Object.keys(this.levels) });
        }
    }

    /**
     * Check if a log level should be output
     */
    shouldLog(level) {
        return this.levels[level.toUpperCase()] <= this.levels[this.logLevel];
    }

    /**
     * Create formatted log message
     */
    formatMessage(level, message, context = {}) {
        const timestamp = this.enableTimestamps ? new Date().toISOString() : '';
        const levelStr = level.padEnd(5);
        const nameStr = this.name.padEnd(12);
        
        let formatted = '';
        
        if (this.enableTimestamps) {
            formatted += `[${timestamp}] `;
        }
        
        if (this.enableColors && typeof window === 'undefined') {
            // Only use colors in Node.js environment
            formatted += `${this.colors[level]}${levelStr}${this.colors.RESET} `;
        } else {
            formatted += `${levelStr} `;
        }
        
        formatted += `${nameStr} ${message}`;
        
        return formatted;
    }

    /**
     * Log at ERROR level
     */
    error(message, context = {}, error = null) {
        if (!this.shouldLog('ERROR')) return;
        
        const formatted = this.formatMessage('ERROR', message, context);
        console.error(formatted, context);
        
        // Send to error tracker
        if (errorTracker.isInitialized) {
            errorTracker.logError(message, { logger: this.name, ...context }, error);
        }
    }

    /**
     * Log at WARN level
     */
    warn(message, context = {}) {
        if (!this.shouldLog('WARN')) return;
        
        const formatted = this.formatMessage('WARN', message, context);
        console.warn(formatted, context);
        
        // Send to error tracker
        if (errorTracker.isInitialized) {
            errorTracker.logWarning(message, { logger: this.name, ...context });
        }
    }

    /**
     * Log at INFO level
     */
    info(message, context = {}) {
        if (!this.shouldLog('INFO')) return;
        
        const formatted = this.formatMessage('INFO', message, context);
        console.info(formatted, context);
        
        // Send to error tracker for analytics
        if (errorTracker.isInitialized) {
            errorTracker.logInfo(message, { logger: this.name, ...context });
        }
    }

    /**
     * Log at DEBUG level
     */
    debug(message, context = {}) {
        if (!this.shouldLog('DEBUG')) return;
        
        const formatted = this.formatMessage('DEBUG', message, context);
        console.log(formatted, context);
    }

    /**
     * Log at TRACE level (most verbose)
     */
    trace(message, context = {}) {
        if (!this.shouldLog('TRACE')) return;
        
        const formatted = this.formatMessage('TRACE', message, context);
        console.log(formatted, context);
    }

    /**
     * Log function entry (for debugging)
     */
    enter(functionName, args = {}) {
        this.trace(`Entering ${functionName}`, { args });
    }

    /**
     * Log function exit (for debugging)
     */
    exit(functionName, result = {}) {
        this.trace(`Exiting ${functionName}`, { result });
    }

    /**
     * Log performance timing
     */
    time(label) {
        if (!this.shouldLog('DEBUG')) return;
        console.time(`${this.name}: ${label}`);
    }

    /**
     * End performance timing
     */
    timeEnd(label) {
        if (!this.shouldLog('DEBUG')) return;
        console.timeEnd(`${this.name}: ${label}`);
    }

    /**
     * Log a group of related messages
     */
    group(label, collapsed = false) {
        if (!this.shouldLog('DEBUG')) return;
        
        if (collapsed) {
            console.groupCollapsed(`${this.name}: ${label}`);
        } else {
            console.group(`${this.name}: ${label}`);
        }
    }

    /**
     * End a log group
     */
    groupEnd() {
        if (!this.shouldLog('DEBUG')) return;
        console.groupEnd();
    }

    /**
     * Log a table (for arrays/objects)
     */
    table(data, label = 'Data') {
        if (!this.shouldLog('DEBUG')) return;
        
        this.debug(`Table: ${label}`);
        console.table(data);
    }

    /**
     * Create a child logger with additional context
     */
    child(name, context = {}) {
        const childLogger = new Logger(`${this.name}:${name}`);
        childLogger.defaultContext = context;
        return childLogger;
    }

    /**
     * Log user actions for analytics
     */
    userAction(action, data = {}) {
        this.info(`User Action: ${action}`, data);
        
        // Send to error tracker for user analytics
        if (errorTracker.isInitialized) {
            errorTracker.trackUserAction(action, { logger: this.name, ...data });
        }
    }

    /**
     * Log API calls
     */
    apiCall(method, url, data = {}) {
        this.debug(`API Call: ${method} ${url}`, data);
    }

    /**
     * Log API responses
     */
    apiResponse(method, url, status, data = {}) {
        const level = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'DEBUG';
        this[level.toLowerCase()](`API Response: ${method} ${url} ${status}`, data);
    }

    /**
     * Log state changes
     */
    stateChange(component, oldState, newState) {
        this.debug(`State Change: ${component}`, { oldState, newState });
    }

    /**
     * Log configuration information
     */
    config(data) {
        this.info('Configuration loaded', data);
    }

    /**
     * Log startup information
     */
    startup(data) {
        this.info('Application starting', data);
    }

    /**
     * Log shutdown information
     */
    shutdown(data) {
        this.info('Application shutting down', data);
    }
}

/**
 * Logger Factory - creates loggers for different modules
 */
export class LoggerFactory {
    static loggers = new Map();

    /**
     * Get or create a logger for a module
     */
    static getLogger(name) {
        if (!this.loggers.has(name)) {
            this.loggers.set(name, new Logger(name));
        }
        return this.loggers.get(name);
    }

    /**
     * Set global log level for all loggers
     */
    static setGlobalLogLevel(level) {
        this.loggers.forEach(logger => {
            logger.setLogLevel(level);
        });
    }

    /**
     * Get all active loggers
     */
    static getAllLoggers() {
        return Array.from(this.loggers.entries());
    }

    /**
     * Clear all loggers
     */
    static clearLoggers() {
        this.loggers.clear();
    }
}

// Create default app logger
export const logger = LoggerFactory.getLogger('App');

// Convenience exports for common use cases
export const authLogger = LoggerFactory.getLogger('Auth');
export const aiLogger = LoggerFactory.getLogger('AI');
export const uiLogger = LoggerFactory.getLogger('UI');
export const dataLogger = LoggerFactory.getLogger('Data');
export const apiLogger = LoggerFactory.getLogger('API');
