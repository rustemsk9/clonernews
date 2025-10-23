// Utility functions for ClonerNews
// Debounce, Throttle, and Promise helpers

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last time it was invoked
 */
export function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle function - limits execution to at most once per specified time interval
 */
export function throttle(fn, limit) {
    let wait = false;
    return (...args) => {
        if (!wait) {
            fn(...args);
            wait = true;
            setTimeout(() => {
                wait = false;
            }, limit);
        }
    };
}

/**
 * Fetch JSON with error handling and data validation
 * Validates response size before processing
 */
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check content length for security
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Response too large');
        }
        
        const data = await response.json();
        
        // Validate data size
        const dataStr = JSON.stringify(data);
        const bytes = new Blob([dataStr]).size;
        console.log(`Received ${bytes} bytes of data`);
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Fetch multiple items with Promise.all
 * Ensures all requests complete successfully
 */
export async function fetchAll(urls) {
    try {
        const promises = urls.map(url => fetchJSON(url));
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('fetchAll error:', error);
        throw error;
    }
}

/**
 * Fetch with Promise.race - returns first completed request
 * Useful for redundant API calls or timeout implementation
 */
export async function fetchRace(urls, timeoutMs = 5000) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );
    
    const requests = urls.map(url => fetchJSON(url));
    
    try {
        const result = await Promise.race([...requests, timeout]);
        return result;
    } catch (error) {
        console.error('fetchRace error:', error);
        throw error;
    }
}

/**
 * Validate data integrity
 * Checks data structure and size
 */
export function validateData(data, expectedType = 'object') {
    if (data === null || data === undefined) {
        throw new Error('Data is null or undefined');
    }
    
    const actualType = Array.isArray(data) ? 'array' : typeof data;
    
    if (expectedType !== actualType) {
        throw new Error(`Expected ${expectedType}, got ${actualType}`);
    }
    
    // Calculate data size
    const dataStr = JSON.stringify(data);
    const bytes = new Blob([dataStr]).size;
    
    return {
        valid: true,
        type: actualType,
        size: bytes,
        itemCount: Array.isArray(data) ? data.length : Object.keys(data).length
    };
}

/**
 * Format Unix timestamp to readable date
 */
export function formatDate(unixTime) {
    const date = new Date(unixTime * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.log(`Attempt ${i + 1} failed, retrying...`);
            
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Cache wrapper for API calls
 */
export class DataCache {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    clear() {
        this.cache.clear();
    }
}
