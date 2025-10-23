// CommentCard Component - Reusable comment UI
import Component from './Component.js';
import { formatDate, sanitizeHTML } from '../utils/helpers.js';

export default class CommentCard extends Component {
    render() {
        const { comment, depth = 0 } = this.props;
        
        if (!comment || comment.deleted || comment.dead) {
            return '';
        }
        
        const timeAgo = formatDate(comment.time);
        const indentStyle = depth > 0 ? `margin-left: ${depth * 20}px;` : '';
        
        return `
            <div class="comment-item" style="${indentStyle}" data-id="${comment.id}">
                <div class="comment-header">
                    <a href="#/user/${comment.by}">${comment.by || 'unknown'}</a>
                    <span>${timeAgo}</span>
                    ${comment.kids ? `<span>${comment.kids.length} ${comment.kids.length === 1 ? 'reply' : 'replies'}</span>` : ''}
                </div>
                <div class="comment-body">
                    ${comment.text || '<em>No content</em>'}
                </div>
                ${comment.kids && comment.kids.length > 0 ? `
                    <div class="comment-actions" style="
                        font-size: 8pt;
                        color: #828282;
                        margin-top: 6px;
                        cursor: pointer;
                    " data-action="load-replies" data-kids='${JSON.stringify(comment.kids)}'>
                        [+] Load ${comment.kids.length} ${comment.kids.length === 1 ? 'reply' : 'replies'}
                    </div>
                    <div class="comment-replies" data-comment-id="${comment.id}"></div>
                ` : ''}
            </div>
        `;
    }
}
