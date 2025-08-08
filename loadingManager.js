// Loading states and UI feedback utilities
export class LoadingManager {
  constructor() {
    this.activeLoaders = new Map();
    this.setupLoadingStyles();
  }

  setupLoadingStyles() {
    const styles = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #4f8cff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        margin-top: 16px;
        color: white;
        font-size: 16px;
        text-align: center;
      }

      .loading-button {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .loading-button::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        margin: auto;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        top: 0;
        bottom: 0;
        left: 8px;
      }

      .inline-loader {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #4f8cff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        vertical-align: middle;
        margin-right: 8px;
      }

      .skeleton-loader {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
      }

      .skeleton-title {
        height: 24px;
        width: 60%;
        margin-bottom: 16px;
      }

      .skeleton-card {
        height: 200px;
        margin-bottom: 16px;
      }

      [data-theme="dark"] .skeleton-loader {
        background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
        background-size: 200% 100%;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .loading-dots {
        display: inline-block;
      }

      .loading-dots::after {
        content: '';
        animation: dots 1.5s steps(4, end) infinite;
      }

      @keyframes dots {
        0%, 20% { content: ''; }
        40% { content: '.'; }
        60% { content: '..'; }
        80%, 100% { content: '...'; }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Show global loading overlay
  showGlobalLoader(message = 'Loading...') {
    this.hideGlobalLoader(); // Remove any existing loader

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'global-loading-overlay';
    overlay.innerHTML = `
      <div>
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  // Hide global loading overlay
  hideGlobalLoader() {
    const existing = document.getElementById('global-loading-overlay');
    if (existing) {
      existing.remove();
    }
  }

  // Show button loading state
  showButtonLoader(buttonElement, loadingText = null) {
    if (!buttonElement) return;

    const originalText = buttonElement.textContent;
    const loaderId = 'btn_' + Date.now();

    buttonElement.classList.add('loading-button');
    buttonElement.disabled = true;
    
    if (loadingText) {
      buttonElement.textContent = loadingText;
    }

    this.activeLoaders.set(loaderId, {
      element: buttonElement,
      originalText,
      type: 'button'
    });

    return loaderId;
  }

  // Hide button loading state
  hideButtonLoader(loaderId) {
    const loaderInfo = this.activeLoaders.get(loaderId);
    if (!loaderInfo || loaderInfo.type !== 'button') return;

    const { element, originalText } = loaderInfo;
    
    element.classList.remove('loading-button');
    element.disabled = false;
    element.textContent = originalText;

    this.activeLoaders.delete(loaderId);
  }

  // Show inline loader
  showInlineLoader(containerElement, message = 'Loading') {
    if (!containerElement) return;

    const loader = document.createElement('span');
    loader.className = 'inline-loader-container';
    loader.innerHTML = `
      <span class="inline-loader"></span>
      <span class="loading-dots">${message}</span>
    `;

    containerElement.appendChild(loader);
    return loader;
  }

  // Show skeleton loading for content
  showSkeleton(containerElement, type = 'default') {
    if (!containerElement) return;

    let skeletonHTML = '';

    switch (type) {
      case 'meal-card':
        skeletonHTML = `
          <div class="skeleton-loader skeleton-title"></div>
          <div class="skeleton-loader skeleton-text"></div>
          <div class="skeleton-loader skeleton-text" style="width: 80%;"></div>
          <div class="skeleton-loader skeleton-text" style="width: 60%;"></div>
        `;
        break;
      case 'meal-plan':
        skeletonHTML = Array(7).fill(0).map(() => `
          <div class="skeleton-loader skeleton-card"></div>
        `).join('');
        break;
      default:
        skeletonHTML = `
          <div class="skeleton-loader skeleton-title"></div>
          <div class="skeleton-loader skeleton-text"></div>
          <div class="skeleton-loader skeleton-text" style="width: 90%;"></div>
          <div class="skeleton-loader skeleton-text" style="width: 70%;"></div>
        `;
    }

    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-container';
    skeleton.innerHTML = skeletonHTML;

    containerElement.appendChild(skeleton);
    return skeleton;
  }

  // Hide skeleton loading
  hideSkeleton(skeletonElement) {
    if (skeletonElement && skeletonElement.parentElement) {
      skeletonElement.remove();
    }
  }

  // Utility function to wrap async operations with loading
  async withLoading(asyncFn, options = {}) {
    const {
      button,
      container,
      message = 'Loading...',
      buttonText = 'Loading...',
      type = 'global'
    } = options;

    let loaderId = null;
    let loader = null;

    try {
      // Show appropriate loader
      if (type === 'button' && button) {
        loaderId = this.showButtonLoader(button, buttonText);
      } else if (type === 'skeleton' && container) {
        loader = this.showSkeleton(container, options.skeletonType);
      } else if (type === 'inline' && container) {
        loader = this.showInlineLoader(container, message);
      } else {
        loader = this.showGlobalLoader(message);
      }

      // Execute async function
      const result = await asyncFn();
      return result;

    } finally {
      // Hide loader
      if (loaderId) {
        this.hideButtonLoader(loaderId);
      } else if (loader) {
        if (type === 'global') {
          this.hideGlobalLoader();
        } else if (type === 'skeleton') {
          this.hideSkeleton(loader);
        } else if (loader.remove) {
          loader.remove();
        }
      }
    }
  }

  // Clean up all active loaders
  cleanup() {
    this.hideGlobalLoader();
    
    this.activeLoaders.forEach((loaderInfo, loaderId) => {
      if (loaderInfo.type === 'button') {
        this.hideButtonLoader(loaderId);
      }
    });

    this.activeLoaders.clear();
  }
}

// Create global loading manager instance
export const loadingManager = new LoadingManager();

// Utility functions for easy access
export const showLoader = (message) => loadingManager.showGlobalLoader(message);
export const hideLoader = () => loadingManager.hideGlobalLoader();
export const withLoading = (asyncFn, options) => loadingManager.withLoading(asyncFn, options);
