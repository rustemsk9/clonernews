// CommentCard Component - Reusable comment UI
import Component from './Component.js';
import { formatDate, sanitizeHTML } from '../utils/helpers.js';

export default class CommentCard extends Component {
    render() {
        const { comment, level = 0 } = this.props;
        
        if (!comment || comment.deleted || comment.dead) {
            return '';
        }
        
        const timeAgo = formatDate(comment.time);
        const indentPx = level * 15;
        const maxLevel = 6; // Prevent excessive nesting
        const currentLevel = Math.min(level, maxLevel);
        
        return `
            <div class="comment-item" style="
                margin-left: ${indentPx}px;
                border-left: ${currentLevel > 0 ? '2px solid #e6e6e6' : 'none'};
                padding-left: ${currentLevel > 0 ? '10px' : '0'};
                padding-bottom: 15px;
                margin-bottom: 10px;
            " data-id="${comment.id}">
                <div class="comment-header" style="
                    font-size: 9pt;
                    color: #666;
                    margin-bottom: 8px;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #f0f0f0;
                ">
                    <strong style="color: #ff6600;">${comment.by || 'unknown'}</strong>
                    <span style="margin-left: 8px;">${timeAgo}</span>
                    ${comment.kids && comment.kids.length > 0 ? `
                        <span style="margin-left: 8px; color: #999;">
                            ${comment.kids.length} repl${comment.kids.length > 1 ? 'ies' : 'y'}
                        </span>
                    ` : ''}
                </div>
                <div class="comment-body" style="
                    font-size: 10pt;
                    line-height: 1.5;
                    color: #333;
                    word-wrap: break-word;
                ">
                    ${sanitizeHTML(comment.text) || '<em style="color: #999;">Comment deleted</em>'}
                </div>
                ${comment.kids && comment.kids.length > 0 && currentLevel < maxLevel ? `
                    <div class="comment-actions" style="
                        font-size: 8pt;
                        color: #ff6600;
                        margin-top: 8px;
                        cursor: pointer;
                        user-select: none;
                    " data-action="load-replies" data-kids='${JSON.stringify(comment.kids)}' data-level="${currentLevel + 1}">
                        [+] Show ${comment.kids.length} repl${comment.kids.length === 1 ? 'y' : 'ies'}
                    </div>
                    <div class="comment-replies" data-comment-id="${comment.id}"></div>
                ` : ''}
            </div>
        `;
    }
}
