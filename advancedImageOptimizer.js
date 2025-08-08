/**
 * Advanced Image Optimization System
 * Comprehensive image optimization with lazy loading, format conversion,
 * compression, responsive images, and progressive loading.
 */

export class AdvancedImageOptimizer {
    constructor() {
        this.optimizedImages = new Map();
        this.compressionSettings = {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            progressiveThreshold: 10000, // 10KB
            webpFallback: true
        };
        
        this.formatSupport = {
            webp: false,
            avif: false,
            jpegXL: false
        };
        
        this.loadingStrategies = {
            critical: 'eager',
            aboveFold: 'lazy-immediate',
            belowFold: 'lazy-intersection',
            background: 'lazy-background'
        };
        
        this.placeholderStrategies = {
            blur: true,
            lowQuality: true,
            svg: true,
            solid: true
        };
        
        this.observers = new Map();
        this.processedImages = new Set();
        this.compressionWorker = null;
        
        this.initializeOptimizer();
        console.log('Advanced Image Optimizer initialized');
    }

    /**
     * Initialize the image optimization system
     */
    async initializeOptimizer() {
        // Detect format support
        await this.detectFormatSupport();
        
        // Setup compression worker
        this.setupCompressionWorker();
        
        // Initialize intersection observers
        this.setupIntersectionObservers();
        
        // Setup responsive image system
        this.setupResponsiveImages();
        
        // Setup progressive loading
        this.setupProgressiveLoading();
        
        // Setup background image optimization
        this.setupBackgroundImageOptimization();
        
        // Process existing images
        this.processExistingImages();
        
        // Setup mutation observer for new images
        this.setupMutationObserver();
        
        console.log('Image optimization system ready');
    }

    /**
     * Detect modern image format support
     */
    async detectFormatSupport() {
        const formats = {
            webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
            avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
        };
        
        for (const [format, dataUrl] of Object.entries(formats)) {
            try {
                const supported = await this.testImageFormat(dataUrl);
                this.formatSupport[format] = supported;
                console.log(`${format.toUpperCase()} support:`, supported);
            } catch (error) {
                this.formatSupport[format] = false;
                console.warn(`Failed to detect ${format} support:`, error);
            }
        }
    }

    /**
     * Test image format support
     */
    testImageFormat(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.width === 2 && img.height === 2);
            img.onerror = () => resolve(false);
            img.src = dataUrl;
        });
    }

    /**
     * Setup compression worker for background processing
     */
    setupCompressionWorker() {
        try {
            const workerCode = `
                // Image compression worker
                self.onmessage = function(e) {
                    const { imageData, options } = e.data;
                    
                    // Create canvas for compression
                    const canvas = new OffscreenCanvas(options.width, options.height);
                    const ctx = canvas.getContext('2d');
                    
                    // Create ImageBitmap from data
                    createImageBitmap(imageData).then(bitmap => {
                        // Draw and compress
                        ctx.drawImage(bitmap, 0, 0, options.width, options.height);
                        
                        // Convert to blob
                        canvas.convertToBlob({
                            type: options.format,
                            quality: options.quality
                        }).then(blob => {
                            self.postMessage({ success: true, blob });
                        }).catch(error => {
                            self.postMessage({ success: false, error: error.message });
                        });
                    });
                };
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.compressionWorker = new Worker(URL.createObjectURL(blob));
            
        } catch (error) {
            console.warn('Failed to create compression worker:', error);
        }
    }

    /**
     * Setup intersection observers for lazy loading
     */
    setupIntersectionObservers() {
        // Main lazy loading observer
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Critical loading observer (immediate vicinity)
        const criticalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImageImmediate(entry.target);
                    criticalObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });
        
        // Background loading observer (very aggressive preloading)
        const backgroundObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.preloadImage(entry.target);
                    backgroundObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '500px 0px',
            threshold: 0.01
        });
        
        this.observers.set('lazy', lazyObserver);
        this.observers.set('critical', criticalObserver);
        this.observers.set('background', backgroundObserver);
    }

    /**
     * Setup responsive image system
     */
    setupResponsiveImages() {
        // Create responsive image configurations
        this.responsiveBreakpoints = [
            { width: 320, suffix: 'xs' },
            { width: 480, suffix: 'sm' },
            { width: 768, suffix: 'md' },
            { width: 1024, suffix: 'lg' },
            { width: 1440, suffix: 'xl' },
            { width: 1920, suffix: 'xxl' }
        ];
        
        // Setup resize observer for dynamic responsive updates
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target.tagName === 'IMG') {
                        this.updateResponsiveImage(entry.target, entry.contentRect);
                    }
                });
            });
        }
    }

    /**
     * Setup progressive loading
     */
    setupProgressiveLoading() {
        // Progressive JPEG and WebP loading
        this.progressiveLoadingQueue = new Map();
        
        // Setup progressive loading observer
        const progressiveObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startProgressiveLoading(entry.target);
                    progressiveObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px'
        });
        
        this.observers.set('progressive', progressiveObserver);
    }

    /**
     * Setup background image optimization
     */
    setupBackgroundImageOptimization() {
        // Find and optimize CSS background images
        this.optimizeBackgroundImages();
        
        // Setup observer for dynamic background images
        this.setupBackgroundImageObserver();
    }

    /**
     * Process existing images on the page
     */
    processExistingImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            this.processImage(img);
        });
        
        console.log(`Processed ${images.length} existing images`);
    }

    /**
     * Process individual image
     */
    processImage(img) {
        if (this.processedImages.has(img)) return;
        
        // Determine loading strategy
        const strategy = this.determineLoadingStrategy(img);
        
        // Apply optimization based on strategy
        switch (strategy) {
            case 'critical':
                this.applyCriticalImageOptimization(img);
                break;
            case 'lazy-immediate':
                this.applyLazyImmediateOptimization(img);
                break;
            case 'lazy-intersection':
                this.applyLazyIntersectionOptimization(img);
                break;
            case 'background':
                this.applyBackgroundOptimization(img);
                break;
        }
        
        // Add responsive image support
        this.addResponsiveImageSupport(img);
        
        // Add progressive loading if applicable
        this.addProgressiveLoading(img);
        
        // Add format optimization
        this.optimizeImageFormat(img);
        
        // Add placeholder
        this.addImagePlaceholder(img);
        
        this.processedImages.add(img);
    }

    /**
     * Determine loading strategy for image
     */
    determineLoadingStrategy(img) {
        // Check for critical image markers
        if (img.hasAttribute('data-critical') || img.closest('[data-critical]')) {
            return 'critical';
        }
        
        // Check if image is above the fold
        const rect = img.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight) {
            return 'lazy-immediate';
        }
        
        // Check if image is in next viewport
        if (rect.top < viewportHeight * 2) {
            return 'lazy-intersection';
        }
        
        // Background loading for distant images
        return 'background';
    }

    /**
     * Apply critical image optimization
     */
    applyCriticalImageOptimization(img) {
        // Load immediately with highest priority
        img.loading = 'eager';
        img.fetchPriority = 'high';
        
        // Preload if not loaded
        if (!img.complete) {
            this.preloadImageWithPriority(img.src || img.dataset.src, 'high');
        }
        
        console.log('Applied critical optimization to:', img.src);
    }

    /**
     * Apply lazy immediate optimization
     */
    applyLazyImmediateOptimization(img) {
        // Setup for immediate lazy loading
        this.observers.get('critical')?.observe(img);
        
        // Add loading indicator
        this.addLoadingIndicator(img);
    }

    /**
     * Apply lazy intersection optimization
     */
    applyLazyIntersectionOptimization(img) {
        // Setup for intersection-based lazy loading
        this.observers.get('lazy')?.observe(img);
        
        // Move src to data-src if not already done
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            img.removeAttribute('src');
        }
        
        // Add loading indicator
        this.addLoadingIndicator(img);
    }

    /**
     * Apply background optimization
     */
    applyBackgroundOptimization(img) {
        // Setup for background preloading
        this.observers.get('background')?.observe(img);
        
        // Very low priority loading
        img.loading = 'lazy';
        img.fetchPriority = 'low';
    }

    /**
     * Load image with optimization
     */
    async loadImage(img) {
        try {
            const src = img.dataset.src || img.src;
            if (!src) return;
            
            // Show loading state
            this.showImageLoading(img);
            
            // Get optimized source
            const optimizedSrc = await this.getOptimizedImageSrc(src, img);
            
            // Create new image to test loading
            const testImg = new Image();
            
            testImg.onload = () => {
                // Update the actual image
                img.src = optimizedSrc;
                img.removeAttribute('data-src');
                
                // Remove loading state
                this.hideImageLoading(img);
                
                // Add fade-in animation
                this.addFadeInAnimation(img);
                
                console.log('Image loaded:', optimizedSrc);
            };
            
            testImg.onerror = () => {
                // Fallback to original source
                img.src = src;
                this.hideImageLoading(img);
                console.warn('Failed to load optimized image, using fallback:', src);
            };
            
            testImg.src = optimizedSrc;
            
        } catch (error) {
            console.error('Error loading image:', error);
            this.hideImageLoading(img);
        }
    }

    /**
     * Load image immediately
     */
    loadImageImmediate(img) {
        const src = img.dataset.src || img.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
    }

    /**
     * Preload image
     */
    preloadImage(img) {
        const src = img.dataset.src || img.src;
        if (src) {
            this.preloadImageWithPriority(src, 'low');
        }
    }

    /**
     * Get optimized image source
     */
    async getOptimizedImageSrc(src, img) {
        // Check cache first
        if (this.optimizedImages.has(src)) {
            return this.optimizedImages.get(src);
        }
        
        // Determine best format
        const bestFormat = this.getBestImageFormat(src);
        
        // Generate responsive sizes if needed
        const responsiveSrc = this.generateResponsiveImageSrc(src, img, bestFormat);
        
        // Cache result
        this.optimizedImages.set(src, responsiveSrc);
        
        return responsiveSrc;
    }

    /**
     * Get best image format
     */
    getBestImageFormat(src) {
        const url = new URL(src, window.location.href);
        const extension = url.pathname.split('.').pop().toLowerCase();
        
        // Return best supported format
        if (this.formatSupport.avif && this.shouldUseAVIF(src)) {
            return 'avif';
        }
        
        if (this.formatSupport.webp && this.shouldUseWebP(src)) {
            return 'webp';
        }
        
        // Fallback to original format
        return extension;
    }

    /**
     * Should use AVIF format
     */
    shouldUseAVIF(src) {
        // AVIF is best for photographs and complex images
        const isPhoto = src.includes('photo') || src.includes('image') || 
                       src.match(/\.(jpg|jpeg)$/i);
        
        return isPhoto && this.formatSupport.avif;
    }

    /**
     * Should use WebP format
     */
    shouldUseWebP(src) {
        // WebP is good for most web images
        const isWebImage = src.match(/\.(jpg|jpeg|png)$/i);
        
        return isWebImage && this.formatSupport.webp;
    }

    /**
     * Generate responsive image source
     */
    generateResponsiveImageSrc(src, img, format) {
        // Check if we need responsive images
        const needsResponsive = this.shouldUseResponsiveImages(img);
        
        if (!needsResponsive) {
            return this.convertImageFormat(src, format);
        }
        
        // Generate srcset for responsive images
        const srcset = this.generateSrcSet(src, format);
        const sizes = this.generateSizes(img);
        
        // Update image with responsive attributes
        if (srcset) {
            img.srcset = srcset;
            img.sizes = sizes;
        }
        
        return this.convertImageFormat(src, format);
    }

    /**
     * Convert image format
     */
    convertImageFormat(src, targetFormat) {
        // In a real implementation, this would call an image optimization service
        // For now, we'll return the original src with format parameter
        
        const url = new URL(src, window.location.href);
        const currentFormat = url.pathname.split('.').pop().toLowerCase();
        
        if (currentFormat === targetFormat) {
            return src;
        }
        
        // Add format conversion parameter (would be handled by image service)
        url.searchParams.set('format', targetFormat);
        url.searchParams.set('quality', this.compressionSettings.quality);
        
        return url.toString();
    }

    /**
     * Add responsive image support
     */
    addResponsiveImageSupport(img) {
        if (this.resizeObserver && this.shouldUseResponsiveImages(img)) {
            this.resizeObserver.observe(img);
        }
    }

    /**
     * Should use responsive images
     */
    shouldUseResponsiveImages(img) {
        // Use responsive images for large images or flexible layouts
        const rect = img.getBoundingClientRect();
        
        return rect.width > 300 || 
               img.hasAttribute('data-responsive') ||
               getComputedStyle(img).width.includes('%');
    }

    /**
     * Generate srcset for responsive images
     */
    generateSrcSet(src, format) {
        const srcsetEntries = this.responsiveBreakpoints.map(breakpoint => {
            const responsiveSrc = this.generateResponsiveUrl(src, breakpoint.width, format);
            return `${responsiveSrc} ${breakpoint.width}w`;
        });
        
        return srcsetEntries.join(', ');
    }

    /**
     * Generate responsive URL
     */
    generateResponsiveUrl(src, width, format) {
        const url = new URL(src, window.location.href);
        url.searchParams.set('width', width);
        url.searchParams.set('format', format);
        
        return url.toString();
    }

    /**
     * Generate sizes attribute
     */
    generateSizes(img) {
        // Generate sizes based on typical responsive patterns
        const hasContainer = img.closest('.container, .content, main');
        
        if (hasContainer) {
            return '(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px';
        }
        
        return '100vw';
    }

    /**
     * Add progressive loading
     */
    addProgressiveLoading(img) {
        const src = img.dataset.src || img.src;
        
        if (this.shouldUseProgressiveLoading(src)) {
            this.observers.get('progressive')?.observe(img);
        }
    }

    /**
     * Should use progressive loading
     */
    shouldUseProgressiveLoading(src) {
        // Use progressive loading for large images
        return src && (
            src.includes('large') ||
            src.includes('hero') ||
            src.includes('banner')
        );
    }

    /**
     * Start progressive loading
     */
    async startProgressiveLoading(img) {
        const src = img.dataset.src || img.src;
        
        try {
            // Load low-quality placeholder first
            const placeholderSrc = this.generatePlaceholderSrc(src);
            
            if (placeholderSrc) {
                img.src = placeholderSrc;
                img.classList.add('loading-progressive');
                
                // Load full quality image
                const fullImg = new Image();
                fullImg.onload = () => {
                    img.src = src;
                    img.classList.remove('loading-progressive');
                    img.classList.add('loaded-progressive');
                };
                fullImg.src = src;
            }
            
        } catch (error) {
            console.error('Progressive loading failed:', error);
        }
    }

    /**
     * Generate placeholder source
     */
    generatePlaceholderSrc(src) {
        // Generate low-quality placeholder
        const url = new URL(src, window.location.href);
        url.searchParams.set('quality', '0.1');
        url.searchParams.set('blur', '5');
        url.searchParams.set('width', '50');
        
        return url.toString();
    }

    /**
     * Add image placeholder
     */
    addImagePlaceholder(img) {
        if (img.src || !img.dataset.src) return;
        
        // Generate placeholder based on strategy
        const placeholder = this.generatePlaceholder(img);
        
        if (placeholder) {
            img.src = placeholder;
            img.classList.add('has-placeholder');
        }
    }

    /**
     * Generate placeholder
     */
    generatePlaceholder(img) {
        const rect = img.getBoundingClientRect();
        const width = rect.width || 300;
        const height = rect.height || 200;
        
        // SVG placeholder
        const svg = `data:image/svg+xml;base64,${btoa(`
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <rect width="100%" height="100%" fill="url(#shimmer)"/>
                <defs>
                    <linearGradient id="shimmer">
                        <stop offset="0%" stop-color="#f0f0f0"/>
                        <stop offset="50%" stop-color="#e0e0e0"/>
                        <stop offset="100%" stop-color="#f0f0f0"/>
                        <animateTransform attributeName="gradientTransform" type="translate" 
                                        values="-100 0;100 0;-100 0" dur="2s" repeatCount="indefinite"/>
                    </linearGradient>
                </defs>
            </svg>
        `)}`;
        
        return svg;
    }

    /**
     * Optimize background images
     */
    optimizeBackgroundImages() {
        const elements = document.querySelectorAll('[style*="background-image"]');
        
        elements.forEach(element => {
            this.optimizeBackgroundImage(element);
        });
    }

    /**
     * Optimize individual background image
     */
    optimizeBackgroundImage(element) {
        const style = element.style.backgroundImage;
        const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
        
        if (urlMatch) {
            const originalUrl = urlMatch[1];
            const optimizedUrl = this.getOptimizedBackgroundImageUrl(originalUrl);
            
            element.style.backgroundImage = `url('${optimizedUrl}')`;
        }
    }

    /**
     * Get optimized background image URL
     */
    getOptimizedBackgroundImageUrl(url) {
        const format = this.getBestImageFormat(url);
        return this.convertImageFormat(url, format);
    }

    /**
     * Setup mutation observer for new images
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's an image
                        if (node.tagName === 'IMG') {
                            this.processImage(node);
                        }
                        
                        // Check for images within the added node
                        const images = node.querySelectorAll?.('img');
                        images?.forEach(img => this.processImage(img));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.mutationObserver = observer;
    }

    /**
     * Utility methods for UI states
     */

    addLoadingIndicator(img) {
        if (!img.closest('.image-container')) {
            const container = document.createElement('div');
            container.className = 'image-container loading';
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);
        } else {
            img.closest('.image-container').classList.add('loading');
        }
    }

    showImageLoading(img) {
        const container = img.closest('.image-container');
        if (container) {
            container.classList.add('loading');
        }
    }

    hideImageLoading(img) {
        const container = img.closest('.image-container');
        if (container) {
            container.classList.remove('loading');
        }
    }

    addFadeInAnimation(img) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }

    /**
     * Preload image with priority
     */
    preloadImageWithPriority(src, priority = 'low') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        
        if (priority !== 'low') {
            link.fetchPriority = priority;
        }
        
        document.head.appendChild(link);
        
        // Remove after loading to clean up DOM
        setTimeout(() => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        }, 5000);
    }

    /**
     * Update responsive image
     */
    updateResponsiveImage(img, rect) {
        // Update image source based on new dimensions
        const optimalWidth = this.getOptimalWidth(rect.width);
        const currentWidth = this.getCurrentImageWidth(img);
        
        if (Math.abs(optimalWidth - currentWidth) > 100) {
            const src = img.dataset.originalSrc || img.src;
            const optimizedSrc = this.generateResponsiveUrl(src, optimalWidth, this.getBestImageFormat(src));
            
            img.src = optimizedSrc;
        }
    }

    /**
     * Get optimal width for image
     */
    getOptimalWidth(displayWidth) {
        // Find the best breakpoint for the display width
        const breakpoint = this.responsiveBreakpoints.find(bp => bp.width >= displayWidth * 1.2);
        return breakpoint ? breakpoint.width : this.responsiveBreakpoints[this.responsiveBreakpoints.length - 1].width;
    }

    /**
     * Get current image width from URL
     */
    getCurrentImageWidth(img) {
        try {
            const url = new URL(img.src);
            return parseInt(url.searchParams.get('width')) || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Setup background image observer
     */
    setupBackgroundImageObserver() {
        // Observer for dynamically added background images
        const bgObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.optimizeBackgroundImage(mutation.target);
                }
            });
        });
        
        bgObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
    }

    /**
     * Get optimization statistics
     */
    getOptimizationStats() {
        return {
            processedImages: this.processedImages.size,
            optimizedImages: this.optimizedImages.size,
            formatSupport: this.formatSupport,
            observers: this.observers.size,
            compressionWorkerAvailable: !!this.compressionWorker,
            cacheSize: this.optimizedImages.size
        };
    }

    /**
     * Cleanup method
     */
    cleanup() {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        
        // Terminate worker
        if (this.compressionWorker) {
            this.compressionWorker.terminate();
        }
        
        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        console.log('Image optimizer cleaned up');
    }
}

// Export singleton instance
export const advancedImageOptimizer = new AdvancedImageOptimizer();
