// AbstractView - Base class for all views with lifecycle management
import dataManager from '../services/DataManager.js';

export default class {
    constructor(params = {}) {
        this.title = "";
        this.params = params;
        this.container = null;
        this.listeners = [];  // Track event listeners for cleanup
        this.dataSubscriptions = [];  // Track DataManager subscriptions
    }

    // ============ LIFECYCLE METHODS ============
    
    /**
     * Set page title
     */
    setTitle(title) {
        this.title = title;
        document.title = title;
    }
    
    /**
     * Get HTML content for this view
     * Must be implemented by subclasses
     */
    async getHtml() {
        return "";
    }
    
    /**
     * Initialize view after HTML is rendered
     * Override this in subclasses
     */
    async init() {
        console.log(`${this.constructor.name} initialized`);
    }
    
    /**
     * Mount view to a specific container
     */
    async mount(containerId = '#app') {
        try {
            this.container = document.querySelector(containerId);
            
            if (!this.container) {
                throw new Error(`Container ${containerId} not found`);
            }
            
            // Show loading state
            this.showLoading();
            
            // Get HTML content
            const html = await this.getHtml();
            this.container.innerHTML = html;
            
            // Initialize view
            await this.init();
            
            console.log(`✅ ${this.constructor.name} mounted to ${containerId}`);
        } catch (error) {
            console.error(`❌ Error mounting ${this.constructor.name}:`, error);
            this.showError(error.message);
        }
    }
    
    /**
     * Unmount view and cleanup
     */
    unmount() {
        // Remove event listeners
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
        
        // Unsubscribe from DataManager events
        this.dataSubscriptions.forEach(({ event, handler }) => {
            dataManager.off(event, handler);
        });
        this.dataSubscriptions = [];
        
        console.log(`🗑️ ${this.constructor.name} unmounted and cleaned up`);
    }
    
    // ============ DATA MANAGEMENT ============
    
    /**
     * Subscribe to DataManager events with automatic cleanup
     */
    subscribeToData(event, handler) {
        dataManager.on(event, handler);
        this.dataSubscriptions.push({ event, handler });
    }
    
    /**
     * Access DataManager instance
     */
    get data() {
        return dataManager;
    }
    
    // ============ DOM HELPERS ============
    
    /**
     * Query selector within this view's container
     */
    $(selector) {
        return this.container ? this.container.querySelector(selector) : null;
    }
    
    /**
     * Query all selectors within this view's container
     */
    $$(selector) {
        return this.container ? this.container.querySelectorAll(selector) : [];
    }
    
    /**
     * Add event listener with automatic cleanup tracking
     */
    addEventListener(element, event, handler) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.addEventListener(event, handler);
            this.listeners.push({ element, event, handler });
        }
    }
    
    /**
     * Update a specific element's content
     */
    updateElement(selector, content) {
        const element = this.$(selector);
        if (element) {
            element.innerHTML = content;
        }
    }
    
    /**
     * Toggle element visibility
     */
    toggleElement(selector, show) {
        const element = this.$(selector);
        if (element) {
            element.classList.toggle('hidden', !show);
        }
    }
    
    // ============ LOADING STATES ============
    
    showLoading(message = 'Loading...') {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading-container" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    padding: 40px;
                ">
                    <div class="loading" style="font-size: 14pt; color: #828282;">
                        ${message}
                    </div>
                </div>
            `;
        }
    }
    
    showError(message = 'An error occurred') {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-container" style="padding: 20px;">
                    <div class="error">
                        <strong>Error:</strong> ${message}
                    </div>
                    <button onclick="location.reload()" style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        background: #ff6600;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Reload Page</button>
                </div>
            `;
        }
    }
    
    showEmpty(message = 'No content available') {
        return `
            <div class="empty-state" style="
                text-align: center;
                padding: 40px;
                color: #828282;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <div style="font-size: 12pt;">${message}</div>
            </div>
        `;
    }
    
    // ============ SKELETON LOADERS ============
    
    getSkeletonLoader(count = 5) {
        return Array(count).fill(0).map(() => `
            <div class="story-item" style="padding: 12px 0;">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            </div>
        `).join('');
    }
    
    // ============ PROGRESSIVE ENHANCEMENT ============
    
    /**
     * Update view with new data (for progressive loading)
     */
    async update(data) {
        console.log(`Updating ${this.constructor.name} with new data`);
        // Override in subclasses
    }
    
    /**
     * Refresh view (re-fetch data)
     */
    async refresh() {
        console.log(`Refreshing ${this.constructor.name}`);
        await this.mount(this.container ? `#${this.container.id}` : '#app');
    }
}
