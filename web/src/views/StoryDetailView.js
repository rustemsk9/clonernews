import AbstractView from "./AbstractView.js";
import CommentCard from "../components/CommentCard.js";

export default class StoryDetailView extends AbstractView {
    constructor(params) {
        super(params);
        this.section = params.section || 'item';
        this.storyId = params.storyId || params[1]; // Support both param styles
        this.setTitle("ClonerNews - Story");
        this.story = null;
        this.comments = [];
        this.commentCard = new CommentCard();
    }

    async getHtml() {
        return `
            <!-- Navigation breadcrumb -->
            <div style="
                background: #f6f6ef;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 4px;
                border: 1px solid #ddd;
                font-size: 10pt;
            ">
                <a href="/" style="color: #ff6600; text-decoration: none;">Home</a>
                ${this.section !== 'item' ? `
                    → <a href="/${this.section}" style="color: #ff6600; text-decoration: none;">${this.getSectionTitle()}</a>
                ` : ''}
                → Story #${this.storyId}
            </div>

            <!-- Story content -->
            <div id="story-content" style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 20px;
                margin: 10px 0;
            ">
                <div class="loading" style="text-align: center; padding: 40px; color: #666;">
                    Loading story...
                </div>
            </div>

            <!-- Comments section -->
            <div id="comments-section" style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 20px;
                margin: 10px 0;
            ">
                <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    💬 Comments
                </h3>
                <div id="comments-list">
                    <div class="loading" style="text-align: center; padding: 20px; color: #666;">
                        Loading comments...
                    </div>
                </div>
            </div>

            <!-- Back button -->
            <div style="margin: 20px 0; text-align: center;">
                <button id="back-btn" style="
                    background: #ff6600;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11pt;
                ">← Back to ${this.getSectionTitle()}</button>
            </div>
        `;
    }

    async init() {
        console.log(`🚀 StoryDetailView initialized for story ${this.storyId} in section ${this.section}`);
        
        // Load story and comments
        await this.loadStoryDetails();
        
        // Setup back button
        this.setupBackButton();
    }

    async loadStoryDetails() {
        try {
            // Load story
            console.log(`📰 Loading story ${this.storyId}...`);
            this.story = await this.data.getItem(this.storyId);
            
            if (!this.story) {
                this.showError('Story not found');
                return;
            }

            // Update page title
            this.setTitle(`ClonerNews - ${this.story.title || 'Story'}`);
            
            // Render story
            this.renderStory();
            
            // Load comments if story has them
            if (this.story.kids && this.story.kids.length > 0) {
                console.log(`💬 Loading ${this.story.kids.length} comments...`);
                await this.loadComments();
            } else {
                this.updateElement('#comments-list', '<div style="text-align: center; color: #666; padding: 20px;">No comments yet</div>');
            }
            
        } catch (error) {
            console.error('❌ Error loading story details:', error);
            this.showError('Failed to load story');
        }
    }

    renderStory() {
        if (!this.story) return;

        const timeAgo = this.formatDate(this.story.time);
        const score = this.story.score || 0;
        const commentCount = this.story.descendants || 0;
        const domain = this.extractDomain(this.story.url);

        const storyHTML = `
            <div class="story-header">
                <h1 style="
                    margin: 0 0 15px 0;
                    font-size: 18pt;
                    line-height: 1.3;
                    color: #333;
                ">
                    ${this.story.url ? `
                        <a href="${this.story.url}" target="_blank" rel="noopener noreferrer" style="
                            color: #333;
                            text-decoration: none;
                        ">
                            ${this.sanitizeHTML(this.story.title || 'Untitled')}
                        </a>
                        ${domain ? `<span style="font-size: 10pt; color: #666; margin-left: 8px;">(${domain})</span>` : ''}
                    ` : `
                        ${this.sanitizeHTML(this.story.title || 'Untitled')}
                    `}
                </h1>
                
                <div style="
                    font-size: 10pt;
                    color: #666;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                ">
                    <span>${score} point${score !== 1 ? 's' : ''}</span> |
                    <span>by <strong>${this.story.by || 'unknown'}</strong></span> |
                    <span>${timeAgo}</span> |
                    <span>${commentCount} comment${commentCount !== 1 ? 's' : ''}</span>
                </div>
            </div>

            ${this.story.text ? `
                <div class="story-text" style="
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #333;
                    margin-top: 20px;
                ">
                    ${this.story.text}
                </div>
            ` : ''}

            ${this.story.url ? `
                <div style="margin-top: 20px;">
                    <a href="${this.story.url}" target="_blank" rel="noopener noreferrer" style="
                        display: inline-block;
                        background: #ff6600;
                        color: white;
                        padding: 8px 16px;
                        text-decoration: none;
                        border-radius: 4px;
                        font-size: 10pt;
                    ">Visit Link →</a>
                </div>
            ` : ''}
        `;

        this.updateElement('#story-content', storyHTML);
    }

    async loadComments() {
        try {
            // Load top-level comments
            const commentPromises = this.story.kids.slice(0, 50).map(id => this.data.getItem(id));
            const comments = await Promise.all(commentPromises);
            
            // Filter out null/deleted comments
            this.comments = comments.filter(comment => comment && !comment.deleted);
            
            console.log(`✅ Loaded ${this.comments.length} comments`);
            this.renderComments();
            
        } catch (error) {
            console.error('❌ Error loading comments:', error);
            this.updateElement('#comments-list', '<div style="color: #c62828; text-align: center; padding: 20px;">Failed to load comments</div>');
        }
    }

    renderComments() {
        if (this.comments.length === 0) {
            this.updateElement('#comments-list', '<div style="text-align: center; color: #666; padding: 20px;">No comments available</div>');
            return;
        }

        const commentsHTML = this.comments.map((comment, index) => {
            const commentCard = new CommentCard({ comment, level: 0 });
            return commentCard.render();
        }).join('');

        this.updateElement('#comments-list', commentsHTML);
    }

    setupBackButton() {
        const backBtn = this.$('#back-btn');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                const backUrl = this.section === 'item' ? '/' : `/${this.section}`;
                window.history.pushState(null, '', backUrl);
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }
    }

    getSectionTitle() {
        const titles = {
            'top': 'Top Stories',
            'new': 'New Stories',
            'best': 'Best Stories',
            'ask': 'Ask HN',
            'show': 'Show HN',
            'jobs': 'Jobs',
            'item': 'Stories'
        };
        return titles[this.section] || 'Stories';
    }

    showError(message) {
        this.updateElement('#story-content', `
            <div style="
                text-align: center;
                padding: 40px;
                color: #c62828;
            ">
                ❌ ${message}
                <div style="margin-top: 15px;">
                    <a href="/" style="color: #ff6600;">← Back to Home</a>
                </div>
            </div>
        `);
    }

    // Helper methods (could be moved to utils later)
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
    }

    extractDomain(url) {
        if (!url) return null;
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    }

    sanitizeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (match) => {
            const escape = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escape[match];
        });
    }
}