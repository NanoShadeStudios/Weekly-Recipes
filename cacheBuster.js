// Cache Buster and Error Recovery Script
// This script helps clear problematic cached modules and forces fresh imports

console.log('🔄 Cache Buster: Starting cache cleanup...');

// Function to clear all possible caches
async function clearAllCaches() {
    try {
        // Clear Service Worker caches
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log('🗑️ Service Worker unregistered');
            }
        }

        // Clear Cache API
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('🗑️ Cache API cleared');
        }

        // Clear localStorage
        localStorage.clear();
        console.log('🗑️ localStorage cleared');

        // Clear sessionStorage
        sessionStorage.clear();
        console.log('🗑️ sessionStorage cleared');

        // Clear IndexedDB (Firebase offline storage)
        if ('indexedDB' in window) {
            try {
                indexedDB.deleteDatabase('firebaseLocalStorageDb');
                console.log('🗑️ Firebase IndexedDB cleared');
            } catch (error) {
                console.warn('⚠️ Could not clear Firebase IndexedDB:', error);
            }
        }

        console.log('✅ Cache cleanup completed');
        return true;
    } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
        return false;
    }
}

// Function to perform hard refresh
function performHardRefresh() {
    console.log('🔄 Performing hard refresh...');
    
    // Add cache-busting parameter
    const url = new URL(window.location);
    url.searchParams.set('cache-bust', Date.now());
    
    // Force hard reload
    window.location.replace(url.toString());
}

// Emergency cache clear and refresh
window.emergencyRefresh = async function() {
    console.log('🚨 Emergency refresh initiated...');
    
    // Show user feedback
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    indicator.innerHTML = '🔄 Clearing caches and refreshing...';
    document.body.appendChild(indicator);

    // Clear caches and refresh
    await clearAllCaches();
    
    setTimeout(() => {
        performHardRefresh();
    }, 1000);
};

// Auto-recovery for Firebase import errors
let firebaseErrorCount = 0;
const maxFirebaseErrors = 3;

window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('firebase/firestore')) {
        firebaseErrorCount++;
        console.warn(`🔥 Firebase import error detected (${firebaseErrorCount}/${maxFirebaseErrors}):`, event.message);
        
        if (firebaseErrorCount >= maxFirebaseErrors) {
            console.log('🚨 Too many Firebase errors, triggering emergency refresh...');
            window.emergencyRefresh();
        }
    }
});

// Expose cache clearing function globally
window.clearAppCaches = clearAllCaches;

console.log('✅ Cache Buster: Ready for emergency cache clearing');
console.log('💡 Run window.emergencyRefresh() if you see Firebase import errors');
console.log('💡 Run window.clearAppCaches() to clear all caches manually');
