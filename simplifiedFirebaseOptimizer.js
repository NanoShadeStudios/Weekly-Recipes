/**
 * Simplified Firebase Query Optimizer
 * Practical Firebase optimizations that work with the existing project architecture
 */

// Import Firebase functions from CDN (matching the project's setup)
import { 
    collection, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs, 
    getDoc,
    setDoc,
    updateDoc,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

export class SimplifiedFirebaseOptimizer {
    constructor(db) {
        this.db = db;
        this.queryCache = new Map();
        this.batchOperations = [];
        this.batchTimeout = null;
        
        this.cacheConfig = {
            defaultTTL: 300000, // 5 minutes
            maxCacheSize: 100
        };
        
        console.log('Simplified Firebase Optimizer initialized');
    }

    /**
     * Optimized get operation with caching
     */
    async optimizedGet(collectionName, docId, options = {}) {
        const { useCache = true, cacheTTL = this.cacheConfig.defaultTTL } = options;
        const cacheKey = `get:${collectionName}:${docId}`;

        // Check cache first
        if (useCache && this.queryCache.has(cacheKey)) {
            const cached = this.queryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTTL) {
                console.log(`Cache hit for: ${cacheKey}`);
                return cached.data;
            }
        }

        try {
            const docRef = doc(this.db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;

            // Cache the result
            if (useCache && data) {
                this.setCache(cacheKey, data, cacheTTL);
            }

            return data;
        } catch (error) {
            console.error('Optimized get error:', error);
            throw error;
        }
    }

    /**
     * Optimized query operation with caching
     */
    async optimizedQuery(collectionName, constraints = [], options = {}) {
        const { useCache = true, cacheTTL = this.cacheConfig.defaultTTL } = options;
        const queryKey = this.generateQueryKey(collectionName, constraints);

        // Check cache first
        if (useCache && this.queryCache.has(queryKey)) {
            const cached = this.queryCache.get(queryKey);
            if (Date.now() - cached.timestamp < cacheTTL) {
                console.log(`Cache hit for query: ${queryKey}`);
                return cached.data;
            }
        }

        try {
            let q = collection(this.db, collectionName);
            
            // Apply constraints
            constraints.forEach(constraint => {
                q = query(q, constraint);
            });

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Cache the result
            if (useCache) {
                this.setCache(queryKey, data, cacheTTL);
            }

            return data;
        } catch (error) {
            console.error('Optimized query error:', error);
            throw error;
        }
    }

    /**
     * Batched write operations
     */
    async optimizedSet(collectionName, docId, data, options = {}) {
        const { useBatch = true } = options;

        if (useBatch) {
            return this.addToBatch('set', collectionName, docId, data);
        }

        try {
            const docRef = doc(this.db, collectionName, docId);
            await setDoc(docRef, data);
            this.invalidateCache(collectionName, docId);
            return { success: true, id: docId };
        } catch (error) {
            console.error('Optimized set error:', error);
            throw error;
        }
    }

    /**
     * Batched update operations
     */
    async optimizedUpdate(collectionName, docId, updates, options = {}) {
        const { useBatch = true } = options;

        if (useBatch) {
            return this.addToBatch('update', collectionName, docId, updates);
        }

        try {
            const docRef = doc(this.db, collectionName, docId);
            await updateDoc(docRef, updates);
            this.invalidateCache(collectionName, docId);
            return { success: true, id: docId };
        } catch (error) {
            console.error('Optimized update error:', error);
            throw error;
        }
    }

    /**
     * Add operation to batch
     */
    addToBatch(operation, collectionName, docId, data) {
        return new Promise((resolve, reject) => {
            this.batchOperations.push({
                operation,
                collectionName,
                docId,
                data,
                resolve,
                reject
            });

            // Clear existing timeout
            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout);
            }

            // Set timeout for batch execution
            this.batchTimeout = setTimeout(() => {
                this.executeBatch();
            }, 100); // 100ms batch window

            // Execute immediately if batch is full
            if (this.batchOperations.length >= 10) {
                clearTimeout(this.batchTimeout);
                this.executeBatch();
            }
        });
    }

    /**
     * Execute batch operations
     */
    async executeBatch() {
        if (this.batchOperations.length === 0) return;

        const operations = [...this.batchOperations];
        this.batchOperations = [];
        this.batchTimeout = null;

        try {
            const batch = writeBatch(this.db);

            operations.forEach(op => {
                const docRef = doc(this.db, op.collectionName, op.docId);

                switch (op.operation) {
                    case 'set':
                        batch.set(docRef, op.data);
                        break;
                    case 'update':
                        batch.update(docRef, op.data);
                        break;
                }
            });

            await batch.commit();

            // Resolve all promises and invalidate cache
            operations.forEach(op => {
                op.resolve({ success: true, id: op.docId });
                this.invalidateCache(op.collectionName, op.docId);
            });

            console.log(`Executed batch with ${operations.length} operations`);

        } catch (error) {
            console.error('Batch execution error:', error);
            operations.forEach(op => op.reject(error));
        }
    }

    /**
     * Cache management
     */
    setCache(key, data, ttl) {
        // Check cache size limit
        if (this.queryCache.size >= this.cacheConfig.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.queryCache.keys().next().value;
            this.queryCache.delete(oldestKey);
        }

        this.queryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    invalidateCache(collectionName, docId = null) {
        const keysToDelete = [];
        
        for (const key of this.queryCache.keys()) {
            if (key.includes(collectionName)) {
                if (!docId || key.includes(docId)) {
                    keysToDelete.push(key);
                }
            }
        }

        keysToDelete.forEach(key => this.queryCache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`Invalidated ${keysToDelete.length} cache entries for ${collectionName}`);
        }
    }

    generateQueryKey(collectionName, constraints) {
        const constraintStrings = constraints.map(c => c.toString());
        return `query:${collectionName}:${constraintStrings.join(':')}`;
    }

    /**
     * Collection-specific helper methods
     */
    async getMealPlans(userId, options = {}) {
        return this.optimizedQuery('mealPlans', [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        ], options);
    }

    async getRecipes(filters = {}, options = {}) {
        const constraints = [];
        
        if (filters.cuisine) {
            constraints.push(where('cuisine', '==', filters.cuisine));
        }
        
        constraints.push(orderBy('rating', 'desc'));
        
        return this.optimizedQuery('recipes', constraints, options);
    }

    async getUserPreferences(userId, options = {}) {
        return this.optimizedGet('userPreferences', userId, options);
    }

    async updateUserPreferences(userId, preferences, options = {}) {
        return this.optimizedUpdate('userPreferences', userId, preferences, options);
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.queryCache.size,
            maxSize: this.cacheConfig.maxCacheSize,
            pendingBatchOperations: this.batchOperations.length
        };
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.queryCache.clear();
        console.log('Cache cleared');
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.executeBatch(); // Execute pending operations
        }
        this.queryCache.clear();
        console.log('Firebase optimizer cleaned up');
    }
}

// Export as default for compatibility
export default SimplifiedFirebaseOptimizer;
