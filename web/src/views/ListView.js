import AbstractView from "./AbstractView.js";
import StoryCard from "../components/StoryCard.js";

export default class ListView extends AbstractView {
    constructor(params) {
        super(params);
        this.type = params.type || 'top';
        this.title = params.title || 'Stories';
        this.setTitle(`ClonerNews - ${this.title}`);
        this.storyCard = new StoryCard();
        this.currentPage = 0;
        this.storiesPerPage = 30;
        this.allStories = [];
        this.loading = false;
    }

    async getHtml() {
        return `
            <!-- Simple header -->
            <div style="
                background: #ff6600; 
                color: white; 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 4px;
                text-align: center;
            ">
                <h1 style="margin: 0; font-size: 18pt;">📱 ${this.title}</h1>
                <p style="margin: 5px 0 0 0; font-size: 10pt; opacity: 0.9;">Scroll down to load more stories</p>
            </div>

            <!-- Back to home button -->
            <div style="margin: 10px 0;">
                <a href="/" style="
                    display: inline-block;
                    background: #f6f6ef;
                    color: #333;
                    padding: 8px 16px;
                    text-decoration: none;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    font-size: 10pt;
                ">← Back to Home</a>
            </div>

            <!-- Stories container -->
            <div id="stories-container" style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
            ">
                <ul class="story-list" id="story-list">
                    <li class="story-item loading">Loading ${this.title.toLowerCase()}...</li>
                </ul>
                
                <!-- Load more button -->
                <div id="load-more-container" style="text-align: center; margin-top: 20px; display: none;">
                    <button id="load-more-btn" style="
                        background: #ff6600;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11pt;
                    ">Load More Stories</button>
                </div>

                <!-- Loading indicator -->
                <div id="loading-indicator" style="
                    text-align: center; 
                    padding: 20px; 
                    color: #666; 
                    display: none;
                ">
                    Loading more stories...
                </div>
            </div>

            <!-- Debug info -->
            <div style="
                margin-top: 20px;
                padding: 10px;
                background: #f8f8f8;
                border-radius: 4px;
                font-size: 9pt;
                color: #666;
            ">
                📊 Showing <span id="story-count">0</span> stories | 
                Page <span id="current-page">1</span> | 
                Type: <strong>${this.type}</strong>
            </div>
        `;
    }

    async init() {
        console.log(`🚀 ListView initialized for ${this.type}`);
        
        // Load initial stories
        await this.loadMoreStories();
        
        // Set up infinite scroll
        this.setupInfiniteScroll();
        
        // Set up load more button
        this.setupLoadMoreButton();
    }

    async loadMoreStories() {
        if (this.loading) return;
        
        this.loading = true;
        this.showLoadingIndicator();
        
        try {
            console.log(`📚 Loading page ${this.currentPage + 1} of ${this.type} stories...`);
            
            // For first load, get initial batch
            // For subsequent loads, get 15 more stories
            const limit = this.currentPage === 0 ? this.storiesPerPage : 15;
            
            // Fetch stories from DataManager
            const newStories = await this.data.getStories(this.type, limit * (this.currentPage + 1), false);
            
            // Get only the new stories (skip already loaded ones)
            const startIndex = this.allStories.length;
            const freshStories = newStories.slice(startIndex);
            
            // Add to our collection
            this.allStories.push(...freshStories);
            this.currentPage++;
            
            // Render stories
            this.renderAllStories();
            
            // Update stats
            this.updateStats();
            
            console.log(`✅ Loaded ${freshStories.length} new stories, total: ${this.allStories.length}`);
            
        } catch (error) {
            console.error(`❌ Error loading ${this.type} stories:`, error);
            this.showError();
        } finally {
            this.loading = false;
            this.hideLoadingIndicator();
        }
    }

    renderAllStories() {
        if (this.allStories.length === 0) {
            this.updateElement('#story-list', '<li class="story-item">No stories available</li>');
            return;
        }

        const storiesHTML = this.allStories.map((story, index) => {
            const storyCard = new StoryCard({ story, rank: index + 1, section: this.type });
            return storyCard.render();
        }).join('');

        this.updateElement('#story-list', storiesHTML);
        
        // Show load more button if we have stories
        const loadMoreContainer = this.$('#load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'block';
        }
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            // Check if user scrolled near bottom
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= documentHeight - 200 && !this.loading) {
                this.loadMoreStoriesScroll();
            }
        });
    }
    
    // Load 10 more stories on scroll
    async loadMoreStoriesScroll() {
        if (this.loading) return;
        
        this.loading = true;
        this.showLoadingIndicator();
        
        try {
            console.log(`📜 Scroll loading 10 more ${this.type} stories...`);
            
            // Get 10 more stories
            const totalNeeded = this.allStories.length + 10;
            const newStories = await this.data.getStories(this.type, totalNeeded, false);
            
            // Get only the new stories (skip already loaded ones)
            const startIndex = this.allStories.length;
            const freshStories = newStories.slice(startIndex);
            
            // Add to our collection
            this.allStories.push(...freshStories);
            
            // Render stories
            this.renderAllStories();
            
            // Update stats
            this.updateStats();
            
            console.log(`✅ Scroll loaded ${freshStories.length} new stories, total: ${this.allStories.length}`);
            
        } catch (error) {
            console.error(`❌ Error loading stories on scroll:`, error);
        } finally {
            this.loading = false;
            this.hideLoadingIndicator();
        }
    }

    setupLoadMoreButton() {
        const loadMoreBtn = this.$('#load-more-btn');
        if (loadMoreBtn) {
            this.addEventListener(loadMoreBtn, 'click', () => {
                this.loadMoreStories();
            });
        }
    }

    showLoadingIndicator() {
        const indicator = this.$('#loading-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    hideLoadingIndicator() {
        const indicator = this.$('#loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    updateStats() {
        this.updateElement('#story-count', this.allStories.length);
        this.updateElement('#current-page', this.currentPage);
    }

    showError() {
        this.updateElement('#story-list', `
            <li class="story-item error" style="color: #c62828; text-align: center; padding: 20px;">
                ❌ Failed to load stories. 
                <a href="#" onclick="location.reload()" style="color: #c62828; text-decoration: underline;">
                    Try again
                </a>
            </li>
        `);
    }
}