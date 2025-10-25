// PollCard Component - Display HN polls with options
import Component from './Component.js';
import { formatDate, sanitizeHTML } from '../utils/helpers.js';

export default class PollCard extends Component {
    render() {
        const { poll, options = [] } = this.props;
        
        if (!poll || poll.type !== 'poll') {
            return '<div style="color: #666; text-align: center; padding: 20px;">No active polls found</div>';
        }
        
        const timeAgo = formatDate(poll.time);
        const totalVotes = options.reduce((sum, opt) => sum + (opt.score || 0), 0);
        
        return `
            <div class="poll-card" style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                margin-bottom: 15px;
            ">
                <div class="poll-header" style="
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                ">
                    <h4 style="
                        margin: 0 0 5px 0;
                        font-size: 11pt;
                        color: #333;
                        line-height: 1.3;
                    ">
                        <a href="/item/${poll.id}" style="color: #333; text-decoration: none;">
                            ${sanitizeHTML(poll.title || 'Poll')}
                        </a>
                    </h4>
                    <div style="
                        font-size: 8pt;
                        color: #666;
                    ">
                        by <strong>${poll.by || 'unknown'}</strong> | 
                        ${timeAgo} | 
                        ${totalVotes} vote${totalVotes !== 1 ? 's' : ''}
                    </div>
                </div>
                
                ${poll.text ? `
                    <div class="poll-text" style="
                        font-size: 9pt;
                        color: #333;
                        margin-bottom: 15px;
                        line-height: 1.4;
                    ">
                        ${sanitizeHTML(poll.text)}
                    </div>
                ` : ''}
                
                <div class="poll-options">
                    ${options.length > 0 ? this.renderOptions(options, totalVotes) : `
                        <div style="color: #666; font-size: 9pt; text-align: center;">
                            Loading poll options...
                        </div>
                    `}
                </div>
                
                <div style="
                    margin-top: 15px;
                    text-align: center;
                ">
                    <a href="/item/${poll.id}" style="
                        font-size: 8pt;
                        color: #ff6600;
                        text-decoration: none;
                        padding: 4px 8px;
                        border: 1px solid #ff6600;
                        border-radius: 3px;
                    ">View Full Poll →</a>
                </div>
            </div>
        `;
    }
    
    renderOptions(options, totalVotes) {
        if (options.length === 0) {
            return '<div style="color: #666; font-size: 9pt;">No options available</div>';
        }
        
        return options.slice(0, 5).map(option => {
            const votes = option.score || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            
            return `
                <div class="poll-option" style="
                    margin-bottom: 8px;
                    position: relative;
                ">
                    <div style="
                        background: #f6f6ef;
                        border-radius: 3px;
                        padding: 8px 10px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- Progress bar background -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            width: ${percentage}%;
                            background: linear-gradient(90deg, #ff6600 0%, #ff8533 100%);
                            opacity: 0.2;
                            border-radius: 3px;
                        "></div>
                        
                        <!-- Option text and stats -->
                        <div style="
                            position: relative;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 9pt;
                        ">
                            <span style="
                                color: #333;
                                flex: 1;
                                line-height: 1.2;
                                margin-right: 10px;
                            ">
                                ${sanitizeHTML(option.text || 'Option')}
                            </span>
                            <span style="
                                color: #666;
                                font-size: 8pt;
                                white-space: nowrap;
                            ">
                                ${votes} vote${votes !== 1 ? 's' : ''} (${percentage}%)
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}