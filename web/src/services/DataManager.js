// DataManager - Singleton for managing all data fetching and caching
import * as API from './hackerNewsAPI.js';
import { validateData } from '../utils/helpers.js';

class DataManager {
    constructor() {
        if (DataManager.instance) {
            return DataManager.instance;
        }
        
        this.data = {
            stories: {
                top: [],
                new: [],
                best: [],
                ask: [],
                show: [],
                jobs: []
            },
            items: new Map(),      // Cache individual items by ID
            users: new Map(),      // Cache users by username
            stats: {
                totalStories: 0,
                totalComments: 0,
                activePolls: 0,
                topScore: 0
            }
        };
        
        this.loading = new Set();  // Track what's currently loading
        this.listeners = new Map(); // Event listeners
        
        DataManager.instance = this;
    }
    
    // ============ EVENT SYSTEM ============
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }
    
    // ============ STORIES LOADING ============
    
    async getStories(type = 'top', limit = 30, forceRefresh = false) {
        const cacheKey = `stories-${type}`;
        
        // Return cached if available and not forcing refresh
        if (!forceRefresh && this.data.stories[type].length > 0) {
            console.log(`📦 Using cached ${type} stories`);
            return this.data.stories[type].slice(0, limit);
        }
        
        // Avoid duplicate requests
        if (this.loading.has(cacheKey)) {
            console.log(`⏳ Already loading ${type} stories, waiting...`);
            return this._waitForLoad(cacheKey, limit);
        }
        
        this.loading.add(cacheKey);
        
        try {
            console.log(`🌐 Fetching ${type} stories from API...`);
            const stories = await API.getStoriesWithData(type, limit);
            
            // Validate data
            const validation = validateData(stories, 'array');
            console.log(`✅ Loaded ${stories.length} stories (${validation.size} bytes)`);
            
            // Cache stories
            this.data.stories[type] = stories;
            
            // Cache individual items
            stories.forEach(story => {
                if (story && story.id) {
                    this.data.items.set(story.id, story);
                }
            });
            
            // Update stats
            this._updateStats(stories);
            
            // Emit event
            this.emit(`stories-updated`, { type, stories });
            this.emit(`${type}-stories-updated`, stories);
            
            return stories.slice(0, limit);
            
        } catch (error) {
            console.error(`❌ Error loading ${type} stories:`, error);
            this.emit('error', { type: 'stories', error });
            throw error;
        } finally {
            this.loading.delete(cacheKey);
        }
    }
    
    async _waitForLoad(cacheKey, limit) {
        // Wait for ongoing request to complete
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.loading.has(cacheKey)) {
                    clearInterval(checkInterval);
                    const type = cacheKey.replace('stories-', '');
                    resolve(this.data.stories[type].slice(0, limit));
                }
            }, 100);
        });
    }
    
    // ============ INDIVIDUAL ITEM LOADING ============
    
    async getItem(id, forceRefresh = false) {
        // Check cache first
        if (!forceRefresh && this.data.items.has(id)) {
            console.log(`📦 Using cached item ${id}`);
            return this.data.items.get(id);
        }
        
        const cacheKey = `item-${id}`;
        if (this.loading.has(cacheKey)) {
            return this._waitForItemLoad(id);
        }
        
        this.loading.add(cacheKey);
        
        try {
            console.log(`🌐 Fetching item ${id}...`);
            const item = await API.getItem(id);
            
            // Cache it
            this.data.items.set(id, item);
            
            this.emit('item-loaded', { id, item });
            
            return item;
        } catch (error) {
            console.error(`❌ Error loading item ${id}:`, error);
            throw error;
        } finally {
            this.loading.delete(cacheKey);
        }
    }
    
    async _waitForItemLoad(id) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.loading.has(`item-${id}`)) {
                    clearInterval(checkInterval);
                    resolve(this.data.items.get(id));
                }
            }, 100);
        });
    }
    
    // ============ BATCH LOADING ============
    
    async getMultipleItems(ids, limit = 30) {
        // Separate cached and uncached
        const cached = [];
        const toFetch = [];
        
        ids.slice(0, limit).forEach(id => {
            if (this.data.items.has(id)) {
                cached.push(this.data.items.get(id));
            } else {
                toFetch.push(id);
            }
        });
        
        console.log(`📦 ${cached.length} items from cache, fetching ${toFetch.length}...`);
        
        if (toFetch.length === 0) {
            return cached;
        }
        
        try {
            const freshItems = await API.getMultipleItems(toFetch);
            
            // Cache them
            freshItems.forEach(item => {
                if (item && item.id) {
                    this.data.items.set(item.id, item);
                }
            });
            
            return [...cached, ...freshItems];
        } catch (error) {
            console.error('❌ Error in batch loading:', error);
            // Return at least cached items
            return cached;
        }
    }
    
    // ============ COMMENTS LOADING ============
    
    async getComments(storyId, limit = 20) {
        try {
            // Get story first (might be cached)
            const story = await this.getItem(storyId);
            
            if (!story || !story.kids || story.kids.length === 0) {
                return [];
            }
            
            console.log(`💬 Loading ${Math.min(story.kids.length, limit)} comments...`);
            
            // Use batch loading (checks cache first)
            const comments = await this.getMultipleItems(story.kids, limit);
            
            return comments;
        } catch (error) {
            console.error(`❌ Error loading comments for ${storyId}:`, error);
            return [];
        }
    }
    
    // ============ USER LOADING ============
    
    async getUser(username, forceRefresh = false) {
        if (!forceRefresh && this.data.users.has(username)) {
            console.log(`📦 Using cached user ${username}`);
            return this.data.users.get(username);
        }
        
        try {
            console.log(`🌐 Fetching user ${username}...`);
            const user = await API.getUser(username);
            
            this.data.users.set(username, user);
            this.emit('user-loaded', { username, user });
            
            return user;
        } catch (error) {
            console.error(`❌ Error loading user ${username}:`, error);
            throw error;
        }
    }
    
    // ============ STATS & UTILITIES ============
    
    _updateStats(stories) {
        if (!stories || stories.length === 0) return;
        
        const scores = stories.map(s => s.score || 0);
        const descendants = stories.map(s => s.descendants || 0);
        
        this.data.stats.topScore = Math.max(...scores);
        this.data.stats.totalComments = descendants.reduce((a, b) => a + b, 0);
        this.data.stats.totalStories = stories.length;
        
        // Count polls
        this.data.stats.activePolls = stories.filter(s => s.type === 'poll').length;
        
        this.emit('stats-updated', this.data.stats);
    }
    
    getStats() {
        return { ...this.data.stats };
    }
    
    getCachedStories(type) {
        return this.data.stories[type] || [];
    }
    
    getCachedItem(id) {
        return this.data.items.get(id);
    }
    
    // ============ CACHE MANAGEMENT ============
    
    clearCache(type = 'all') {
        if (type === 'all') {
            this.data.stories = {
                top: [], new: [], best: [], ask: [], show: [], jobs: []
            };
            this.data.items.clear();
            this.data.users.clear();
            console.log('🗑️ All cache cleared');
        } else if (type === 'stories') {
            this.data.stories = {
                top: [], new: [], best: [], ask: [], show: [], jobs: []
            };
            console.log('🗑️ Stories cache cleared');
        } else if (type === 'items') {
            this.data.items.clear();
            console.log('🗑️ Items cache cleared');
        } else if (type === 'users') {
            this.data.users.clear();
            console.log('🗑️ Users cache cleared');
        }
        
        this.emit('cache-cleared', type);
    }
    
    // ============ PROGRESSIVE LOADING ============
    
    async loadDashboardData() {
        console.log('📊 Loading dashboard data with Promise.all...');
        
        try {
            const [topStories, jobs, stats] = await Promise.all([
                this.getStories('top', 10),
                this.getStories('jobs', 5),
                Promise.resolve(this.getStats())
            ]);
            
            return {
                topStories,
                jobs,
                stats
            };
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            
            // Fallback to cached data
            return {
                topStories: this.getCachedStories('top').slice(0, 10),
                jobs: this.getCachedStories('jobs').slice(0, 5),
                stats: this.getStats()
            };
        }
    }
    
    // ============ SEARCH ============
    
    searchStories(query, type = 'top') {
        const stories = this.data.stories[type];
        const lowerQuery = query.toLowerCase();
        
        return stories.filter(story => {
            return (
                (story.title && story.title.toLowerCase().includes(lowerQuery)) ||
                (story.text && story.text.toLowerCase().includes(lowerQuery)) ||
                (story.by && story.by.toLowerCase().includes(lowerQuery))
            );
        });
    }
    
    // ============ MAX ITEM DISCOVERY ============
    
    async getMaxItemId() {
        try {
            console.log('🔍 Fetching max item ID...');
            const maxId = await API.getMaxItem();
            console.log(`✅ Current max item ID: ${maxId}`);
            return maxId;
        } catch (error) {
            console.error('❌ Error fetching max item ID:', error);
            throw error;
        }
    }
    
    /**
     * Load items starting from max ID going backwards
     * This discovers the newest items first
     */
    async loadRecentItems(count = 30) {
        try {
            console.log(`📡 Loading ${count} recent items starting from max ID...`);
            
            // Get max item ID
            const maxId = await this.getMaxItemId();
            
            // Generate IDs from max down
            const ids = [];
            for (let i = 0; i < count; i++) {
                ids.push(maxId - i);
            }
            
            console.log(`📦 Loading items from ${maxId} down to ${maxId - count + 1}...`);
            
            // Load all items in parallel
            const items = await this.getMultipleItems(ids);
            
            // Filter out null/deleted items
            const validItems = items.filter(item => item && !item.deleted && !item.dead);
            
            console.log(`✅ Loaded ${validItems.length} valid recent items`);
            
            // Separate by type
            const byType = {
                stories: [],
                comments: [],
                jobs: [],
                polls: [],
                pollopts: []
            };
            
            validItems.forEach(item => {
                if (!item.type) return;
                
                if (item.type === 'story') {
                    byType.stories.push(item);
                } else if (item.type === 'comment') {
                    byType.comments.push(item);
                } else if (item.type === 'job') {
                    byType.jobs.push(item);
                } else if (item.type === 'poll') {
                    byType.polls.push(item);
                } else if (item.type === 'pollopt') {
                    byType.pollopts.push(item);
                }
            });
            
            console.log('📊 Recent items by type:', {
                stories: byType.stories.length,
                comments: byType.comments.length,
                jobs: byType.jobs.length,
                polls: byType.polls.length,
                pollopts: byType.pollopts.length
            });
            
            this.emit('recent-items-loaded', { items: validItems, byType, maxId });
            
            return { items: validItems, byType, maxId };
            
        } catch (error) {
            console.error('❌ Error loading recent items:', error);
            throw error;
        }
    }
    
    /**
     * Walk backwards from a given ID
     * Useful for pagination or loading more items
     */
    async loadItemsFrom(startId, count = 30, filterType = null) {
        try {
            console.log(`🚶 Walking backwards from ID ${startId}, loading ${count} items...`);
            
            const ids = [];
            for (let i = 0; i < count; i++) {
                ids.push(startId - i);
            }
            
            const items = await this.getMultipleItems(ids);
            
            // Filter by type if specified
            let validItems = items.filter(item => item && !item.deleted && !item.dead);
            
            if (filterType) {
                validItems = validItems.filter(item => item.type === filterType);
                console.log(`✅ Found ${validItems.length} ${filterType} items`);
            } else {
                console.log(`✅ Found ${validItems.length} valid items`);
            }
            
            return validItems;
            
        } catch (error) {
            console.error(`❌ Error loading items from ${startId}:`, error);
            throw error;
        }
    }
    
    /**
     * Discover recent stories by walking backwards from max ID
     * More reliable than API endpoints for very fresh content
     */
    async discoverRecentStories(count = 30) {
        try {
            console.log(`🔍 Discovering ${count} recent stories from max ID...`);
            
            const maxId = await this.getMaxItemId();
            let stories = [];
            let currentId = maxId;
            let attempts = 0;
            const maxAttempts = count * 3; // Check 3x more items to find enough stories
            
            while (stories.length < count && attempts < maxAttempts) {
                // Load batch of items
                const batchSize = Math.min(50, maxAttempts - attempts);
                const items = await this.loadItemsFrom(currentId, batchSize);
                
                // Filter for stories
                const batchStories = items.filter(item => 
                    item && item.type === 'story' && !item.deleted && !item.dead
                );
                
                stories.push(...batchStories);
                
                currentId -= batchSize;
                attempts += batchSize;
                
                console.log(`📚 Found ${stories.length}/${count} stories (checked ${attempts} items)...`);
            }
            
            // Trim to requested count
            stories = stories.slice(0, count);
            
            console.log(`✅ Discovered ${stories.length} recent stories`);
            
            // Cache them
            stories.forEach(story => {
                this.data.items.set(story.id, story);
            });
            
            this.emit('stories-discovered', { stories, source: 'max-id-walk' });
            
            return stories;
            
        } catch (error) {
            console.error('❌ Error discovering recent stories:', error);
            throw error;
        }
    }
    
    /**
     * Stream items live by polling max ID
     * Useful for real-time updates
     */
    startLiveItemStream(intervalMs = 10000, callback) {
        let lastMaxId = null;
        
        const checkForNewItems = async () => {
            try {
                const currentMaxId = await this.getMaxItemId();
                
                if (lastMaxId === null) {
                    lastMaxId = currentMaxId;
                    console.log(`🎬 Starting live stream from ID ${currentMaxId}`);
                    return;
                }
                
                if (currentMaxId > lastMaxId) {
                    const newItemCount = currentMaxId - lastMaxId;
                    console.log(`🆕 ${newItemCount} new items detected!`);
                    
                    // Load new items
                    const newIds = [];
                    for (let id = lastMaxId + 1; id <= currentMaxId; id++) {
                        newIds.push(id);
                    }
                    
                    const newItems = await this.getMultipleItems(newIds);
                    const validItems = newItems.filter(item => item && !item.deleted && !item.dead);
                    
                    console.log(`📥 Loaded ${validItems.length} new valid items`);
                    
                    if (callback) {
                        callback(validItems);
                    }
                    
                    this.emit('new-items-detected', validItems);
                    
                    lastMaxId = currentMaxId;
                }
            } catch (error) {
                console.error('❌ Error in live stream:', error);
            }
        };
        
        // Initial check
        checkForNewItems();
        
        // Set up interval
        const intervalId = setInterval(checkForNewItems, intervalMs);
        
        console.log(`🔴 Live stream started (checking every ${intervalMs}ms)`);
        
        // Return stop function
        return () => {
            clearInterval(intervalId);
            console.log('⏹️ Live stream stopped');
        };
    }
    
    // ============ DEBUGGING ============
    
    getDebugInfo() {
        return {
            cachedStories: Object.keys(this.data.stories).reduce((acc, key) => {
                acc[key] = this.data.stories[key].length;
                return acc;
            }, {}),
            cachedItems: this.data.items.size,
            cachedUsers: this.data.users.size,
            loading: Array.from(this.loading),
            listeners: Array.from(this.listeners.keys())
        };
    }
}

// Export singleton instance
export default new DataManager();
