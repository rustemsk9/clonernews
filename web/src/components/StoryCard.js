// StoryCard Component - Reusable story card UI
import Component from './Component.js';
import { formatDate, extractDomain, sanitizeHTML } from '../utils/helpers.js';

export default class StoryCard extends Component {
    render() {
        const { story, rank, showText = false, section = 'item' } = this.props;
        
        if (!story) {
            return '';
        }
        
        const domain = extractDomain(story.url);
        const timeAgo = formatDate(story.time);
        const commentCount = story.descendants || 0;
        const score = story.score || 0;
        
        // Create story detail URL based on section
        const storyDetailUrl = `/${section}/${story.id}`;
        
        return `
            <li class="story-item" data-id="${story.id}">
                ${rank ? `<span class="story-rank">${rank}.</span>` : ''}
                <div class="story-content">
                    <div class="story-title">
                        <a href="${storyDetailUrl}">
                            ${sanitizeHTML(story.title || 'Untitled')}
                        </a>
                        ${domain ? `<span class="story-domain">(${domain})</span>` : ''}
                        ${story.url ? `
                            <a href="${story.url}" target="_blank" rel="noopener noreferrer" style="
                                margin-left: 8px;
                                font-size: 8pt;
                                color: #666;
                                text-decoration: none;
                                border: 1px solid #ddd;
                                padding: 2px 6px;
                                border-radius: 3px;
                                background: #f9f9f9;
                            ">↗ link</a>
                        ` : ''}
                    </div>
                    
                    ${showText && story.text ? `
                        <div class="story-text" style="
                            font-size: 9pt;
                            color: #828282;
                            margin-top: 6px;
                            line-height: 1.4;
                        ">
                            ${story.text.substring(0, 200)}${story.text.length > 200 ? '...' : ''}
                        </div>
                    ` : ''}
                    
                    <div class="story-meta">
                        <span>${score} point${score !== 1 ? 's' : ''}</span>
                        <span>by <a href="/user/${story.by}">${story.by || 'unknown'}</a></span>
                        <span><a href="${storyDetailUrl}">${timeAgo}</a></span>
                        <span><a href="${storyDetailUrl}">${commentCount} comment${commentCount !== 1 ? 's' : ''}</a></span>
                    </div>
                </div>
            </li>
        `;
    }
}
