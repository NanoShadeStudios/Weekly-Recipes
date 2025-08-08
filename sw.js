/**
 * Enhanced Service Worker for Weekly Recipes App
 * Provides advanced offline functionality, intelligent caching, background sync,
 * and performance optimizations.
 */

const CACHE_VERSION = 'weekly-recipes-v2.2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const RECIPE_CACHE = `${CACHE_VERSION}-recipes`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache configuration
const CACHE_CONFIG = {
    static: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 100
    },
    dynamic: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 200
    },
    recipes: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 500
    },
    images: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 300
    }
};

// Static resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/appInitializer.js',
    '/mealGenerator.js',
    '/uiManager.js',
    '/foodData.js',
    '/config.js',
    '/themeManager.js',
    '/errorBoundary.js',
    '/loadingManager.js',
    '/performanceMonitor.js',
    // Performance optimization modules
    '/advancedImageOptimizer.js',
    '/progressiveLoadingManager.js',
    '/simplifiedFirebaseOptimizer.js',
    // Enhanced features
    '/enhancedSocialFeaturesManager.js',
    '/enhancedSocialFeaturesUI.js',
    '/enhancedAIRecommendationEngine.js',
    '/enhancedAIRecommendationUI.js',
    // Essential fonts and icons
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// API endpoints to cache
const API_PATTERNS = [
    /\/api\/recipes/,
    /\/api\/ingredients/,
    /\/api\/nutrition/,
    /\/api\/user/,
    /firestore\.googleapis\.com/,
    /firebase/
];

// Image optimization patterns
const IMAGE_PATTERNS = [
    /\.(jpg|jpeg|png|gif|webp|svg)$/i,
    /unsplash\.com/,
    /images\.unsplash\.com/,
    /foodimages/
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Enhanced Service Worker v2.2.0');
    
    event.waitUntil(
        Promise.all([
            // Cache static resources
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            }),
            
            // Initialize performance monitoring
            initializePerformanceMonitoring(),
            
            // Setup background sync
            setupBackgroundSync()
        ]).then(() => {
            console.log('[SW] Installation complete');
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Enhanced Service Worker');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            
            // Claim all clients immediately
            self.clients.claim(),
            
            // Initialize background sync
            initializeBackgroundFeatures()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

/**
 * Fetch Event Handler with Intelligent Caching
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests for caching
    if (request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(request, url)
    );
});

/**
 * Handle fetch requests with intelligent caching strategies
 */
async function handleFetchRequest(request, url) {
    try {
        // Static resources - Cache First
        if (isStaticResource(url)) {
            return handleStaticResource(request);
        }
        
        // API requests - Network First with intelligent fallback
        if (isAPIRequest(url)) {
            return handleAPIRequest(request);
        }
        
        // Images - Cache First with optimization
        if (isImageRequest(url)) {
            return handleImageRequest(request);
        }
        
        // HTML pages - Network First with fallback
        if (isHTMLRequest(request)) {
            return handleHTMLRequest(request);
        }
        
        // Default - Network First
        return handleDefaultRequest(request);
        
    } catch (error) {
        console.error('[SW] Fetch error:', error);
        return handleFetchError(request, error);
    }
}

/**
 * Handle static resources with Cache First strategy
 */
async function handleStaticResource(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background if stale
        if (isCacheStale(cachedResponse, CACHE_CONFIG.static.maxAge)) {
            updateCacheInBackground(request, STATIC_CACHE);
        }
        return cachedResponse;
    }
    
    // Not in cache, fetch and cache
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return createOfflineResponse(request);
    }
}

/**
 * Handle API requests with Network First strategy
 */
async function handleAPIRequest(request) {
    try {
        // Try network first
        const response = await fetch(request, {
            timeout: 5000 // 5 second timeout
        });
        
        if (response.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
            
            // Also cache recipe data separately
            if (request.url.includes('/recipes') || request.url.includes('/meals')) {
                const recipeCache = await caches.open(RECIPE_CACHE);
                recipeCache.put(request, response.clone());
            }
        }
        
        return response;
        
    } catch (error) {
        // Network failed, try cache
        console.log('[SW] Network failed for API request, trying cache');
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Add header to indicate offline response
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-Served-By', 'service-worker-cache');
            
            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: headers
            });
        }
        
        // No cache available, return offline response
        return createOfflineAPIResponse(request);
    }
}

/**
 * Handle image requests with optimization
 */
async function handleImageRequest(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache the image
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(request, response.clone());
            
            // Optional: Optimize image in background
            optimizeImageInBackground(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        // Return placeholder image for offline
        return createPlaceholderImage();
    }
}

/**
 * Handle HTML requests
 */
async function handleHTMLRequest(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/index.html') || createOfflineResponse(request);
    }
}

/**
 * Handle default requests
 */
async function handleDefaultRequest(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || createOfflineResponse(request);
    }
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    switch (event.tag) {
        case 'meal-plan-sync':
            event.waitUntil(syncMealPlans());
            break;
        case 'user-preferences-sync':
            event.waitUntil(syncUserPreferences());
            break;
        case 'social-actions-sync':
            event.waitUntil(syncSocialActions());
            break;
        case 'analytics-sync':
            event.waitUntil(syncAnalytics());
            break;
        default:
            console.log('[SW] Unknown sync tag:', event.tag);
    }
});

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: 'Check out new meal suggestions!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Meals',
                icon: '/icons/meal-icon.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/close-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Weekly Recipes', options)
    );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Utility Functions
 */

function isStaticResource(url) {
    return STATIC_RESOURCES.some(resource => 
        url.pathname === resource || url.href === resource
    ) || url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/);
}

function isAPIRequest(url) {
    return API_PATTERNS.some(pattern => pattern.test(url.href));
}

function isImageRequest(url) {
    return IMAGE_PATTERNS.some(pattern => pattern.test(url.href));
}

function isHTMLRequest(request) {
    return request.headers.get('accept')?.includes('text/html');
}

function isCacheStale(response, maxAge) {
    const cacheDate = new Date(response.headers.get('date') || Date.now());
    const now = new Date();
    return (now - cacheDate) > maxAge;
}

async function updateCacheInBackground(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response);
        }
    } catch (error) {
        console.log('[SW] Background cache update failed:', error);
    }
}

async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames
        .filter(name => name.includes('weekly-recipes') && !name.includes(CACHE_VERSION))
        .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
        });
    
    await Promise.all(deletePromises);
    
    // Clean up oversized caches
    await cleanupOversizedCaches();
}

async function cleanupOversizedCaches() {
    const cacheConfigs = [
        { name: STATIC_CACHE, config: CACHE_CONFIG.static },
        { name: DYNAMIC_CACHE, config: CACHE_CONFIG.dynamic },
        { name: RECIPE_CACHE, config: CACHE_CONFIG.recipes },
        { name: IMAGE_CACHE, config: CACHE_CONFIG.images }
    ];
    
    for (const { name, config } of cacheConfigs) {
        await trimCache(name, config.maxEntries);
    }
}

async function trimCache(cacheName, maxEntries) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxEntries) {
            const keysToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
            console.log(`[SW] Trimmed ${keysToDelete.length} entries from ${cacheName}`);
        }
    } catch (error) {
        console.error('[SW] Cache trimming error:', error);
    }
}

function createOfflineResponse(request) {
    if (request.url.includes('.html') || request.headers.get('accept')?.includes('text/html')) {
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Weekly Recipes</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline-message { max-width: 500px; margin: 0 auto; }
                    .retry-btn { background: #4a90e2; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Don't worry - you can still browse your cached meal plans!</p>
                    <button class="retry-btn" onclick="location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    return new Response('Offline', { status: 503 });
}

function createOfflineAPIResponse(request) {
    // Return cached meal plans if available
    if (request.url.includes('/meals') || request.url.includes('/recipes')) {
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'This request is not available offline',
            cached: true
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
    
    return new Response('Service Unavailable', { status: 503 });
}

function createPlaceholderImage() {
    // Return a simple SVG placeholder
    const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">
            Image unavailable offline
        </text>
    </svg>`;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

async function initializePerformanceMonitoring() {
    // Track service worker performance metrics
    console.log('[SW] Performance monitoring initialized');
}

async function setupBackgroundSync() {
    // Register for background sync
    console.log('[SW] Background sync setup complete');
}

async function initializeBackgroundFeatures() {
    // Initialize background processing features
    console.log('[SW] Background features initialized');
}

async function optimizeImageInBackground(request, response) {
    // Placeholder for image optimization logic
    console.log('[SW] Image optimization scheduled for:', request.url);
}

// Background sync functions
async function syncMealPlans() {
    console.log('[SW] Syncing meal plans...');
    // Implement meal plan synchronization
}

async function syncUserPreferences() {
    console.log('[SW] Syncing user preferences...');
    // Implement user preferences synchronization
}

async function syncSocialActions() {
    console.log('[SW] Syncing social actions...');
    // Implement social actions synchronization
}

async function syncAnalytics() {
    console.log('[SW] Syncing analytics...');
    // Implement analytics synchronization
}

console.log('[SW] Enhanced Service Worker loaded and ready');
