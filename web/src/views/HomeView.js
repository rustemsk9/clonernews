import AbstractView from "./AbstractView.js";
import StoryCard from "../components/StoryCard.js";
import { debounce } from "../utils/helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("ClonerNews - Hacker News Clone");
        this.currentTab = 'top';
        this.storyCard = new StoryCard();
        this.liveStreamStop = null;  // Track live stream
    }
    
    // Override unmount to cleanup live stream
    unmount() {
        // Stop live stream if running
        if (this.liveStreamStop) {
            this.liveStreamStop();
            this.liveStreamStop = null;
            console.log('🔴 Live stream stopped on unmount');
        }
        
        // Call parent unmount for standard cleanup
        super.unmount();
    }

    async getHtml() {
        return `
            <!-- Stats Dashboard -->
            <div class="stats-bar">
                <div class="stat-card">
                    <h3>📰 Total Stories</h3>
                    <div class="stat-value" id="stat-stories">---</div>
                </div>
                <div class="stat-card">
                    <h3>💬 Comments</h3>
                    <div class="stat-value" id="stat-comments">---</div>
                </div>
                <div class="stat-card">
                    <h3>📊 Active Polls</h3>
                    <div class="stat-value" id="stat-polls">---</div>
                </div>
                <div class="stat-card">
                    <h3>🔥 Top Score</h3>
                    <div class="stat-value" id="stat-top-score">---</div>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="search-bar">
                <input 
                    type="text" 
                    class="search-input" 
                    id="search-input"
                    placeholder="🔍 Search stories, comments, or users... (debounced search)"
                />
            </div>

            <!-- Tabs Navigation -->
            <div class="tabs">
                <div class="tab active" data-tab="top">Top Stories</div>
                <div class="tab" data-tab="new">New</div>
                <div class="tab" data-tab="best">Best</div>
                <div class="tab" data-tab="ask">Ask HN</div>
                <div class="tab" data-tab="show">Show HN</div>
                <div class="tab" data-tab="jobs">Jobs</div>
            </div>

            <!-- Main Content Grid -->
            <div class="content-grid">
                <!-- Left Column: Stories List -->
                <div>
                    <div class="section-card">
                        <div class="section-header">
                            <h2 id="stories-title">📱 Top Stories</h2>
                            <span class="view-more" data-action="refresh">Refresh ↻</span>
                        </div>
                        <ul class="story-list" id="story-list">
                            <!-- Stories will be loaded here -->
                            <li class="story-item loading">Loading stories</li>
                        </ul>
                    </div>

                    <!-- Comments Section -->
                    <div class="comments-container mt-20">
                        <div class="section-header">
                            <h2>💬 Recent Comments</h2>
                            <span class="view-more">View All →</span>
                        </div>
                        <div id="comments-list">
                            <!-- Comments will be loaded here -->
                            <div class="loading">Loading comments</div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Sidebar -->
                <div>
                    <!-- User Profile Card -->
                    <div class="user-card">
                        <h3>👤 DataManager Stats</h3>
                        <p>Real-time caching info</p>
                        <div class="user-stats">
                            <div class="user-stat-item">
                                <div style="font-size: 18pt; font-weight: bold;" id="cache-stories">0</div>
                                <div style="font-size: 8pt;">Cached Stories</div>
                            </div>
                            <div class="user-stat-item">
                                <div style="font-size: 18pt; font-weight: bold;" id="cache-items">0</div>
                                <div style="font-size: 8pt;">Cached Items</div>
                            </div>
                            <div class="user-stat-item">
                                <div style="font-size: 18pt; font-weight: bold;" id="cache-users">0</div>
                                <div style="font-size: 8pt;">Cached Users</div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Polls -->
                    <div class="poll-container">
                        <div class="poll-title">📊 Active Poll</div>
                        <div id="poll-container">
                            <div class="loading">Loading polls</div>
                        </div>
                    </div>

                    <!-- Jobs Section -->
                    <div class="section-card mt-20">
                        <div class="section-header">
                            <h2>💼 Latest Jobs</h2>
                            <span class="view-more">View All →</span>
                        </div>
                        <ul class="story-list" id="jobs-list">
                            <li class="story-item loading">Loading jobs</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Data Table Example -->
            <div class="section-card mt-20">
                <div class="section-header">
                    <h2>📋 Debug Info</h2>
                    <span class="view-more" data-action="show-debug">Toggle →</span>
                </div>
                <div id="debug-info" class="hidden">
                    <pre style="font-size: 9pt; background: #f6f6ef; padding: 15px; border-radius: 4px; overflow-x: auto;"></pre>
                </div>
            </div>
        `;
    }

    async init() {
        console.log("🚀 HomeView initialized with DataManager");
        
        // Subscribe to DataManager events
        this.subscribeToData('stories-updated', (data) => {
            console.log('📢 Stories updated event received:', data.type);
            this.updateCacheStats();
        });
        
        this.subscribeToData('stats-updated', (stats) => {
            console.log('📢 Stats updated:', stats);
            this.renderStats(stats);
        });
        
        this.subscribeToData('recent-items-loaded', (data) => {
            console.log('📢 Recent items loaded from max ID:', data);
            this.updateCacheStats();
        });
        
        this.subscribeToData('stories-discovered', (data) => {
            console.log('📢 Stories discovered:', data);
            if (data.source === 'max-id-walk') {
                this.renderStats({
                    totalStories: data.stories.length,
                    totalComments: data.stories.reduce((sum, s) => sum + (s.descendants || 0), 0),
                    activePolls: data.stories.filter(s => s.type === 'poll').length,
                    topScore: Math.max(...data.stories.map(s => s.score || 0))
                });
            }
        });
        
        this.subscribeToData('new-items-detected', (items) => {
            console.log('🆕 New items detected in live stream!', items);
            this.showNewItemsNotification(items.length);
        });
        
        // Set up event listeners
        this.setupTabSwitching();
        this.setupSearch();
        this.setupRefreshButton();
        this.setupDebugToggle();
        this.setupMaxItemFeatures();
        
        // Load initial data using Promise.all for dashboard
        await this.loadDashboard();
        
        // Update cache stats
        this.updateCacheStats();
        
        // Optionally: Discover very recent stories from max ID
        // Uncomment to use max-id discovery instead of API
        // await this.loadRecentStoriesFromMaxId();
    }
    
    // ============ DATA LOADING ============
    
    async loadDashboard() {
        try {
            console.log('📊 Loading dashboard with Promise.all...');
            
            // Progressive loading: Show skeleton first
            this.renderSkeletonStories();
            
            // Load all dashboard data in parallel
            const dashboardData = await this.data.loadDashboardData();
            
            console.log('✅ Dashboard data loaded:', dashboardData);
            
            // Render stories
            this.renderStories(dashboardData.topStories);
            
            // Render jobs
            this.renderJobs(dashboardData.jobs);
            
            // Render stats
            this.renderStats(dashboardData.stats);
            
            // Load comments from first story
            if (dashboardData.topStories.length > 0) {
                this.loadRecentComments(dashboardData.topStories[0].id);
            }
            
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            this.updateElement('#story-list', `
                <li class="story-item error">
                    Failed to load stories. <a href="#" onclick="location.reload()">Retry</a>
                </li>
            `);
        }
    }
    
    async loadStories(type = 'top') {
        try {
            const storiesTitle = this.$('#stories-title');
            
            // Update title
            const titles = {
                'top': '📱 Top Stories',
                'new': '🆕 New Stories',
                'best': '⭐ Best Stories',
                'ask': '❓ Ask HN',
                'show': '🎨 Show HN',
                'jobs': '💼 Jobs'
            };
            
            if (storiesTitle) {
                storiesTitle.textContent = titles[type] || '📱 Stories';
            }
            
            // Show skeleton
            this.renderSkeletonStories();
            
            // Fetch stories from DataManager
            console.log(`📚 Loading ${type} stories...`);
            const stories = await this.data.getStories(type, 30);
            
            // Render stories
            this.renderStories(stories);
            
            console.log(`✅ Rendered ${stories.length} ${type} stories`);
            
        } catch (error) {
            console.error(`❌ Error loading ${type} stories:`, error);
            this.updateElement('#story-list', `
                <li class="story-item error">Failed to load stories</li>
            `);
        }
    }
    
    async loadRecentComments(storyId) {
        try {
            const comments = await this.data.getComments(storyId, 5);
            
            if (comments.length === 0) {
                this.updateElement('#comments-list', this.showEmpty('No comments yet'));
                return;
            }
            
            const commentsHTML = comments.map(comment => {
                if (!comment) return '';
                return `
                    <div class="comment-item">
                        <div class="comment-header">
                            <strong>${comment.by || 'unknown'}</strong>
                        </div>
                        <div class="comment-body">
                            ${comment.text ? comment.text.substring(0, 200) + '...' : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            this.updateElement('#comments-list', commentsHTML);
            
        } catch (error) {
            console.error('❌ Error loading comments:', error);
        }
    }
    
    // ============ RENDERING ============
    
    renderSkeletonStories() {
        this.updateElement('#story-list', this.getSkeletonLoader(10));
    }
    
    renderStories(stories) {
        if (!stories || stories.length === 0) {
            this.updateElement('#story-list', this.showEmpty('No stories available'));
            return;
        }
        
        const storiesHTML = stories.map((story, index) => {
            return this.storyCard.render({ story, rank: index + 1 });
        }).join('');
        
        this.updateElement('#story-list', storiesHTML);
    }
    
    renderJobs(jobs) {
        if (!jobs || jobs.length === 0) {
            this.updateElement('#jobs-list', '<li class="story-item">No jobs available</li>');
            return;
        }
        
        const jobsHTML = jobs.map((job) => {
            return this.storyCard.render({ story: job, showText: true });
        }).join('');
        
        this.updateElement('#jobs-list', jobsHTML);
    }
    
    renderStats(stats) {
        this.updateElement('#stat-stories', stats.totalStories);
        this.updateElement('#stat-comments', stats.totalComments);
        this.updateElement('#stat-polls', stats.activePolls);
        this.updateElement('#stat-top-score', stats.topScore);
    }
    
    updateCacheStats() {
        const debugInfo = this.data.getDebugInfo();
        
        // Calculate total cached stories
        const totalStories = Object.values(debugInfo.cachedStories).reduce((a, b) => a + b, 0);
        
        this.updateElement('#cache-stories', totalStories);
        this.updateElement('#cache-items', debugInfo.cachedItems);
        this.updateElement('#cache-users', debugInfo.cachedUsers);
    }
    
    // ============ EVENT HANDLERS ============
    
    setupTabSwitching() {
        const tabs = this.$$('.tab');
        tabs.forEach(tab => {
            this.addEventListener(tab, 'click', async (e) => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Load stories for selected tab
                const tabName = e.target.getAttribute('data-tab');
                this.currentTab = tabName;
                await this.loadStories(tabName);
            });
        });
    }
    
    setupSearch() {
        const searchInput = this.$('#search-input');
        
        if (searchInput) {
            // Debounced search (300ms delay)
            const debouncedSearch = debounce((query) => {
                console.log('🔍 Searching for:', query);
                this.performSearch(query);
            }, 300);
            
            this.addEventListener(searchInput, 'input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }
    
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            // Reset to current tab if search is empty
            this.loadStories(this.currentTab);
            return;
        }
        
        const results = this.data.searchStories(query, this.currentTab);
        console.log(`📝 Found ${results.length} results for "${query}"`);
        
        this.renderStories(results);
        
        // Update title to show search results
        this.updateElement('#stories-title', `🔍 Search Results (${results.length})`);
    }
    
    setupRefreshButton() {
        const refreshBtn = this.$('[data-action="refresh"]');
        if (refreshBtn) {
            this.addEventListener(refreshBtn, 'click', async () => {
                console.log('🔄 Refreshing stories...');
                // Force refresh (bypass cache)
                await this.data.getStories(this.currentTab, 30, true);
                await this.loadStories(this.currentTab);
            });
        }
    }
    
    setupDebugToggle() {
        const debugToggle = this.$('[data-action="show-debug"]');
        const debugInfo = this.$('#debug-info');
        
        if (debugToggle && debugInfo) {
            this.addEventListener(debugToggle, 'click', () => {
                debugInfo.classList.toggle('hidden');
                
                if (!debugInfo.classList.contains('hidden')) {
                    const info = this.data.getDebugInfo();
                    debugInfo.querySelector('pre').textContent = JSON.stringify(info, null, 2);
                }
            });
        }
    }
    
    setupMaxItemFeatures() {
        // Add button to load recent items from max ID
        const debugSection = this.$('#debug-info');
        if (debugSection) {
            const maxItemControls = document.createElement('div');
            maxItemControls.style.cssText = 'margin-top: 15px; padding: 15px; background: #fff; border-radius: 4px;';
            maxItemControls.innerHTML = `
                <h3 style="margin-bottom: 10px; font-size: 11pt;">🔍 Max Item Discovery</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button data-action="load-recent-items" style="
                        padding: 8px 16px;
                        background: #ff6600;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 9pt;
                    ">Load Recent Items (30)</button>
                    
                    <button data-action="discover-stories" style="
                        padding: 8px 16px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 9pt;
                    ">Discover Stories from Max ID</button>
                    
                    <button data-action="start-live-stream" style="
                        padding: 8px 16px;
                        background: #48bb78;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 9pt;
                    ">🔴 Start Live Stream</button>
                    
                    <button data-action="stop-live-stream" class="hidden" style="
                        padding: 8px 16px;
                        background: #e53e3e;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 9pt;
                    ">⏹️ Stop Live Stream</button>
                </div>
                <div id="max-item-results" style="margin-top: 10px; font-size: 9pt; color: #828282;"></div>
            `;
            
            debugSection.appendChild(maxItemControls);
            
            // Setup button handlers
            this.addEventListener('[data-action="load-recent-items"]', 'click', () => this.loadRecentItems());
            this.addEventListener('[data-action="discover-stories"]', 'click', () => this.loadRecentStoriesFromMaxId());
            this.addEventListener('[data-action="start-live-stream"]', 'click', () => this.startLiveStream());
            this.addEventListener('[data-action="stop-live-stream"]', 'click', () => this.stopLiveStream());
        }
    }
    
    // ============ MAX ITEM FEATURES ============
    
    async loadRecentItems() {
        try {
            const resultsDiv = this.$('#max-item-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '⏳ Loading recent items from max ID...';
            }
            
            const result = await this.data.loadRecentItems(30);
            
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    ✅ Loaded from max ID <strong>${result.maxId}</strong>:<br>
                    📰 ${result.byType.stories.length} stories,
                    💬 ${result.byType.comments.length} comments,
                    💼 ${result.byType.jobs.length} jobs,
                    📊 ${result.byType.polls.length} polls
                `;
            }
            
            console.log('Recent items breakdown:', result.byType);
            
        } catch (error) {
            console.error('Error loading recent items:', error);
            const resultsDiv = this.$('#max-item-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '❌ Failed to load recent items';
            }
        }
    }
    
    async loadRecentStoriesFromMaxId() {
        try {
            const resultsDiv = this.$('#max-item-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '⏳ Discovering stories by walking backwards from max ID...';
            }
            
            // Show skeleton
            this.renderSkeletonStories();
            
            // Discover stories
            const stories = await this.data.discoverRecentStories(30);
            
            // Render them
            this.renderStories(stories);
            
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    ✅ Discovered <strong>${stories.length}</strong> recent stories from max ID walk<br>
                    Showing freshest content available!
                `;
            }
            
            // Update title
            this.updateElement('#stories-title', '🔥 Freshest Stories (Max ID Discovery)');
            
        } catch (error) {
            console.error('Error discovering stories:', error);
            const resultsDiv = this.$('#max-item-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '❌ Failed to discover stories';
            }
        }
    }
    
    startLiveStream() {
        if (this.liveStreamStop) {
            console.log('Live stream already running');
            return;
        }
        
        console.log('🔴 Starting live item stream...');
        
        this.liveStreamStop = this.data.startLiveItemStream(10000, (newItems) => {
            console.log('🆕 New items received:', newItems);
            this.showNewItemsNotification(newItems.length);
        });
        
        // Toggle buttons
        this.toggleElement('[data-action="start-live-stream"]', false);
        this.toggleElement('[data-action="stop-live-stream"]', true);
        
        const resultsDiv = this.$('#max-item-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '🔴 <strong>Live stream active</strong> - Checking for new items every 10 seconds...';
        }
    }
    
    stopLiveStream() {
        if (this.liveStreamStop) {
            this.liveStreamStop();
            this.liveStreamStop = null;
            
            // Toggle buttons
            this.toggleElement('[data-action="start-live-stream"]', true);
            this.toggleElement('[data-action="stop-live-stream"]', false);
            
            const resultsDiv = this.$('#max-item-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '⏹️ Live stream stopped';
            }
            
            console.log('⏹️ Live stream stopped');
        }
    }
    
    showNewItemsNotification(count) {
        // Create notification banner
        const existingBanner = this.$('#new-items-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        const banner = document.createElement('div');
        banner.id = 'new-items-banner';
        banner.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: #48bb78;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            cursor: pointer;
            font-size: 10pt;
            animation: slideDown 0.3s ease;
        `;
        banner.innerHTML = `🆕 <strong>${count}</strong> new item${count > 1 ? 's' : ''} detected! Click to refresh`;
        
        banner.addEventListener('click', async () => {
            banner.remove();
            await this.loadRecentStoriesFromMaxId();
        });
        
        document.body.appendChild(banner);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (banner && banner.parentNode) {
                banner.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => banner.remove(), 300);
            }
        }, 10000);
    }
    
    // ============ PROGRESSIVE ENHANCEMENT ============
    
    async update(data) {
        console.log('🔄 Updating HomeView with new data');
        if (data.stories) {
            this.renderStories(data.stories);
        }
    }
}