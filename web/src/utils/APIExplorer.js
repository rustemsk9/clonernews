// API Explorer - Tool for discovering hidden HN API endpoints and analyzing responses
import { getItem, getMaxItem } from '../services/hackerNewsAPI.js';

export class APIExplorer {
    constructor() {
        this.results = [];
        this.isStreaming = false;
        this.streamCallback = null;
    }

    // Set up streaming callback for real-time results
    setStreamCallback(callback) {
        this.streamCallback = callback;
    }

    // Stream a message to the UI
    stream(message, type = 'info', data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            data: data ? this.analyzeData(data) : null
        };
        
        this.results.push(entry);
        
        if (this.streamCallback) {
            this.streamCallback(entry);
        }
        
        console.log(`🔍 [${type.toUpperCase()}] ${message}`, data || '');
    }

    // Analyze data structure and types
    analyzeData(data) {
        if (data === null || data === undefined) {
            return { type: 'null', value: data };
        }

        const analysis = {
            type: typeof data,
            isArray: Array.isArray(data),
            length: data?.length,
            keys: null,
            sample: null,
            structure: null
        };

        if (typeof data === 'object' && data !== null) {
            if (Array.isArray(data)) {
                analysis.keys = data.length > 0 ? Object.keys(data[0] || {}) : [];
                analysis.sample = data.slice(0, 3);
                analysis.structure = `Array[${data.length}] containing ${data.length > 0 ? typeof data[0] : 'empty'}`;
            } else {
                analysis.keys = Object.keys(data);
                analysis.sample = data;
                analysis.structure = `Object with keys: ${analysis.keys.join(', ')}`;
            }
        } else {
            analysis.sample = data;
            analysis.structure = `${typeof data}: ${data}`;
        }

        return analysis;
    }

    // Test basic HN API endpoints
    async exploreBasicEndpoints() {
        this.stream('🚀 Starting API exploration...', 'start');
        
        const endpoints = [
            { name: 'maxitem', url: 'https://hacker-news.firebaseio.com/v0/maxitem.json' },
            { name: 'topstories', url: 'https://hacker-news.firebaseio.com/v0/topstories.json' },
            { name: 'newstories', url: 'https://hacker-news.firebaseio.com/v0/newstories.json' },
            { name: 'beststories', url: 'https://hacker-news.firebaseio.com/v0/beststories.json' },
            { name: 'askstories', url: 'https://hacker-news.firebaseio.com/v0/askstories.json' },
            { name: 'showstories', url: 'https://hacker-news.firebaseio.com/v0/showstories.json' },
            { name: 'jobstories', url: 'https://hacker-news.firebaseio.com/v0/jobstories.json' },
            { name: 'updates', url: 'https://hacker-news.firebaseio.com/v0/updates.json' }
        ];

        for (const endpoint of endpoints) {
            try {
                this.stream(`📡 Testing ${endpoint.name}...`, 'request');
                
                const response = await fetch(endpoint.url);
                const data = await response.json();
                
                this.stream(`✅ ${endpoint.name} response`, 'success', data);
                
                // Wait a bit to avoid rate limiting
                await this.delay(100);
                
            } catch (error) {
                this.stream(`❌ Error testing ${endpoint.name}: ${error.message}`, 'error');
            }
        }
    }

    // Test hidden/undocumented endpoints
    async exploreHiddenEndpoints() {
        this.stream('🕵️ Exploring potential hidden endpoints...', 'start');
        
        const hiddenEndpoints = [
            'https://hacker-news.firebaseio.com/v0/user.json',
            'https://hacker-news.firebaseio.com/v0/users.json',
            'https://hacker-news.firebaseio.com/v0/item.json',
            'https://hacker-news.firebaseio.com/v0/items.json',
            'https://hacker-news.firebaseio.com/v0/polls.json',
            'https://hacker-news.firebaseio.com/v0/threads.json',
            'https://hacker-news.firebaseio.com/v0/active.json',
            'https://hacker-news.firebaseio.com/v0/deleted.json',
            'https://hacker-news.firebaseio.com/v0/dead.json',
            'https://hacker-news.firebaseio.com/v0/changed.json',
            'https://hacker-news.firebaseio.com/v0/profiles.json',
            'https://hacker-news.firebaseio.com/v0/search.json',
            'https://hacker-news.firebaseio.com/v0/live.json',
            'https://hacker-news.firebaseio.com/v0/stream.json'
        ];

        for (const url of hiddenEndpoints) {
            try {
                const endpointName = url.split('/').pop().replace('.json', '');
                this.stream(`🔍 Testing hidden endpoint: ${endpointName}...`, 'request');
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    this.stream(`🎯 FOUND hidden endpoint: ${endpointName}`, 'discovery', data);
                } else {
                    this.stream(`📭 ${endpointName}: ${response.status} ${response.statusText}`, 'info');
                }
                
                await this.delay(200);
                
            } catch (error) {
                this.stream(`❌ Error testing ${url}: ${error.message}`, 'error');
            }
        }
    }

    // Test Firebase-specific endpoints
    async exploreFirebaseEndpoints() {
        this.stream('🔥 Exploring Firebase-specific endpoints...', 'start');
        
        const firebaseEndpoints = [
            'https://hacker-news.firebaseio.com/.json',
            'https://hacker-news.firebaseio.com/v0.json',
            'https://hacker-news.firebaseio.com/v0/.json',
            'https://hacker-news.firebaseio.com/v1.json',
            'https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty',
            'https://hacker-news.firebaseio.com/v0/topstories.json?orderBy="$key"&limitToFirst=10',
            'https://hacker-news.firebaseio.com/v0/item/1.json?print=pretty'
        ];

        for (const url of firebaseEndpoints) {
            try {
                const name = url.replace('https://hacker-news.firebaseio.com/', '');
                this.stream(`🔥 Testing Firebase endpoint: ${name}...`, 'request');
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    this.stream(`✅ Firebase endpoint works: ${name}`, 'success', data);
                } else {
                    this.stream(`📭 ${name}: ${response.status}`, 'info');
                }
                
                await this.delay(300);
                
            } catch (error) {
                this.stream(`❌ Error: ${error.message}`, 'error');
            }
        }
    }

    // Test item range queries
    async exploreItemRanges() {
        this.stream('📊 Testing item range queries...', 'start');
        
        try {
            // Get max item ID first
            const maxId = await getMaxItem();
            this.stream(`📈 Current max item ID: ${maxId}`, 'info');
            
            // Test different item ranges
            const ranges = [
                { start: maxId - 10, end: maxId, name: 'latest 10 items' },
                { start: 1, end: 10, name: 'first 10 items' },
                { start: Math.floor(maxId / 2), end: Math.floor(maxId / 2) + 10, name: 'middle range' }
            ];
            
            for (const range of ranges) {
                this.stream(`📋 Testing ${range.name} (${range.start}-${range.end})...`, 'request');
                
                const items = [];
                for (let id = range.start; id <= range.end; id++) {
                    try {
                        const item = await getItem(id);
                        if (item) items.push(item);
                    } catch (e) {
                        // Skip failed items
                    }
                }
                
                this.stream(`✅ Found ${items.length} items in ${range.name}`, 'success', {
                    range: range,
                    items: items.slice(0, 3), // Show first 3 as sample
                    types: [...new Set(items.map(i => i.type))],
                    count: items.length
                });
                
                await this.delay(500);
            }
            
        } catch (error) {
            this.stream(`❌ Error testing ranges: ${error.message}`, 'error');
        }
    }

    // Analyze API response patterns
    async analyzeResponsePatterns() {
        this.stream('🧬 Analyzing API response patterns...', 'start');
        
        try {
            // Get various types of items
            const sampleItems = [];
            const maxId = await getMaxItem();
            
            // Collect diverse samples
            for (let i = 0; i < 50; i++) {
                const randomId = Math.floor(Math.random() * maxId);
                try {
                    const item = await getItem(randomId);
                    if (item) sampleItems.push(item);
                    if (sampleItems.length >= 20) break;
                } catch (e) {
                    // Continue on error
                }
            }
            
            // Analyze patterns
            const analysis = {
                totalItems: sampleItems.length,
                types: {},
                fields: new Set(),
                patterns: {}
            };
            
            sampleItems.forEach(item => {
                // Count types
                analysis.types[item.type] = (analysis.types[item.type] || 0) + 1;
                
                // Collect all fields
                Object.keys(item).forEach(key => analysis.fields.add(key));
                
                // Analyze patterns
                if (item.kids) {
                    analysis.patterns.hasKids = (analysis.patterns.hasKids || 0) + 1;
                }
                if (item.parent) {
                    analysis.patterns.hasParent = (analysis.patterns.hasParent || 0) + 1;
                }
                if (item.poll) {
                    analysis.patterns.isPollOpt = (analysis.patterns.isPollOpt || 0) + 1;
                }
                if (item.parts) {
                    analysis.patterns.hasParts = (analysis.patterns.hasParts || 0) + 1;
                }
            });
            
            analysis.fields = Array.from(analysis.fields);
            
            this.stream('🧬 Response pattern analysis complete', 'success', analysis);
            
        } catch (error) {
            this.stream(`❌ Error analyzing patterns: ${error.message}`, 'error');
        }
    }

    // Discover function types and explore API capabilities
    async exploreFunctionTypes() {
        this.stream('🔧 Exploring function types and API capabilities...', 'start');
        
        try {
            // Test various query parameters and formats
            const testQueries = [
                {
                    name: 'JSON pretty printing',
                    url: 'https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty',
                    description: 'Test Firebase pretty printing'
                },
                {
                    name: 'Silent mode',
                    url: 'https://hacker-news.firebaseio.com/v0/maxitem.json?print=silent',
                    description: 'Test silent response mode'
                },
                {
                    name: 'Limited results',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=5',
                    description: 'Test result limiting'
                },
                {
                    name: 'Order by key',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?orderBy="$key"',
                    description: 'Test ordering capabilities'
                },
                {
                    name: 'Order by value',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?orderBy="$value"',
                    description: 'Test value-based ordering'
                },
                {
                    name: 'Start at specific point',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?startAt=100',
                    description: 'Test pagination start point'
                },
                {
                    name: 'End at specific point',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?endAt=200',
                    description: 'Test pagination end point'
                },
                {
                    name: 'Equal to filter',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?equalTo=123',
                    description: 'Test equality filtering'
                },
                {
                    name: 'Shallow mode',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json?shallow=true',
                    description: 'Test shallow response mode'
                },
                {
                    name: 'Timeout setting',
                    url: 'https://hacker-news.firebaseio.com/v0/maxitem.json?timeout=5s',
                    description: 'Test timeout parameter'
                }
            ];

            for (const query of testQueries) {
                try {
                    this.stream(`🔍 Testing ${query.name}: ${query.description}`, 'request');
                    
                    const response = await fetch(query.url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        this.stream(`✅ ${query.name} works!`, 'discovery', {
                            url: query.url,
                            status: response.status,
                            data: data
                        });
                    } else {
                        this.stream(`📭 ${query.name}: ${response.status} ${response.statusText}`, 'info', {
                            url: query.url,
                            status: response.status
                        });
                    }
                    
                    await this.delay(250);
                    
                } catch (error) {
                    this.stream(`❌ Error testing ${query.name}: ${error.message}`, 'error');
                }
            }

            // Test different data formats
            const formatTests = [
                {
                    name: 'JSONP callback',
                    url: 'https://hacker-news.firebaseio.com/v0/maxitem.json?callback=myCallback',
                    description: 'Test JSONP format'
                },
                {
                    name: 'Different API versions',
                    url: 'https://hacker-news.firebaseio.com/v1/maxitem.json',
                    description: 'Test API v1'
                },
                {
                    name: 'Raw data access',
                    url: 'https://hacker-news.firebaseio.com/v0.json',
                    description: 'Test direct database access'
                }
            ];

            for (const test of formatTests) {
                try {
                    this.stream(`🔬 Testing ${test.name}: ${test.description}`, 'request');
                    
                    const response = await fetch(test.url);
                    
                    if (response.ok) {
                        const text = await response.text();
                        this.stream(`🎯 ${test.name} response received`, 'discovery', {
                            url: test.url,
                            responseType: 'text',
                            length: text.length,
                            preview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
                        });
                    } else {
                        this.stream(`📭 ${test.name}: ${response.status}`, 'info');
                    }
                    
                    await this.delay(300);
                    
                } catch (error) {
                    this.stream(`❌ Error testing ${test.name}: ${error.message}`, 'error');
                }
            }

            this.stream('🔧 Function type exploration complete', 'success');
            
        } catch (error) {
            this.stream(`❌ Error exploring function types: ${error.message}`, 'error');
        }
    }

    // Helper function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get all results
    getResults() {
        return this.results;
    }

    // Clear results
    clearResults() {
        this.results = [];
    }
}

export default new APIExplorer();