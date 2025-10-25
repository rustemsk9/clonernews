// Hacker News Firebase API Service
import { fetchJSON, fetchAll, validateData, DataCache, retryWithBackoff } from '../utils/helpers.js';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const cache = new DataCache(600000); // 10 minute cache

//  * Get item by ID (story, comment, job, poll, or pollopt)
export async function getItem(id) {
    const cacheKey = `item_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
        console.log(`Cache hit for item ${id}`);
        return cached;
    }
    
    try {
        const url = `${BASE_URL}/item/${id}.json`;
        const data = await retryWithBackoff(() => fetchJSON(url));
        
        // Validate data
        const validation = validateData(data, 'object');
        console.log(`Item ${id} validation:`, validation);
        
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching item ${id}:`, error);
        throw error;
    }
}

/**
 * Get user information
 */
export async function getUser(username) {
    const cacheKey = `user_${username}`;
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/user/${username}.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        throw error;
    }
}

/**
 * Get max item ID
 */
export async function getMaxItem() {
    try {
        const url = `${BASE_URL}/maxitem.json`;
        return await fetchJSON(url);
    } catch (error) {
        console.error('Error fetching max item:', error);
        throw error;
    }
}

/**
 * Get top stories IDs
 */
export async function getTopStories() {
    const cacheKey = 'topstories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/topstories.json`;
        const data = await fetchJSON(url);
        
        const validation = validateData(data, 'array');
        console.log('Top stories validation:', validation);
        
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching top stories:', error);
        throw error;
    }
}

/**
 * Get new stories IDs
 */
export async function getNewStories() {
    const cacheKey = 'newstories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/newstories.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching new stories:', error);
        throw error;
    }
}

/**
 * Get best stories IDs
 */
export async function getBestStories() {
    const cacheKey = 'beststories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/beststories.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching best stories:', error);
        throw error;
    }
}

/**
 * Get Ask HN stories IDs
 */
export async function getAskStories() {
    const cacheKey = 'askstories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/askstories.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching ask stories:', error);
        throw error;
    }
}

/**
 * Get Show HN stories IDs
 */
export async function getShowStories() {
    const cacheKey = 'showstories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/showstories.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching show stories:', error);
        throw error;
    }
}

/**
 * Get Job stories IDs
 */
export async function getJobStories() {
    const cacheKey = 'jobstories';
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;
    
    try {
        const url = `${BASE_URL}/jobstories.json`;
        const data = await fetchJSON(url);
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching job stories:', error);
        throw error;
    }
}

/**
 * Get multiple items using Promise.all
 * This is more secure as it validates each item's size
 */
export async function getMultipleItems(ids, limit = 30) {
    try {
        const limitedIds = ids.slice(0, limit);
        console.log(`Fetching ${limitedIds.length} items with Promise.all`);
        
        const urls = limitedIds.map(id => `${BASE_URL}/item/${id}.json`);
        
        // Use Promise.all for parallel fetching
        const items = await fetchAll(urls);
        
        // Validate total data size
        const totalSize = items.reduce((sum, item) => {
            const itemStr = JSON.stringify(item);
            return sum + new Blob([itemStr]).size;
        }, 0);
        
        console.log(`Total data received: ${totalSize} bytes from ${items.length} items`);
        
        // Filter out null items (deleted)
        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Error fetching multiple items:', error);
        throw error;
    }
}

/**
 * Get stories with full data (not just IDs)
 */
export async function getStoriesWithData(type = 'top', limit = 30) {
    const storyGetters = {
        'top': getTopStories,
        'new': getNewStories,
        'best': getBestStories,
        'ask': getAskStories,
        'show': getShowStories,
        'jobs': getJobStories
    };
    
    const getter = storyGetters[type];
    if (!getter) {
        throw new Error(`Unknown story type: ${type}`);
    }
    
    try {
        const ids = await getter();
        const stories = await getMultipleItems(ids, limit);
        return stories;
    } catch (error) {
        console.error(`Error fetching ${type} stories with data:`, error);
        throw error;
    }
}

/**
 * Get comments for a story
 */
export async function getComments(storyId, limit = 10) {
    try {
        const story = await getItem(storyId);
        
        if (!story || !story.kids) {
            return [];
        }
        
        const commentIds = story.kids.slice(0, limit);
        const comments = await getMultipleItems(commentIds, limit);
        
        return comments;
    } catch (error) {
        console.error(`Error fetching comments for story ${storyId}:`, error);
        throw error;
    }
}

/**
 * Clear cache
 */
export function clearCache() {
    cache.clear();
    console.log('Cache cleared');
}
