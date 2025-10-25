# Cache Analysis - Data Flow Issues

## Current Problem
The freshest stories section shows new items, but when pressing the refresh button in tabs, new items don't appear. This suggests a caching problem between different data sources.

## Data Flow Analysis

### 1. Freshest Stories Flow (`loadRecentStoriesFromMaxId()`)
```
User clicks "Discover Stories from Max ID"
    ↓
this.data.discoverRecentStories(30)
    ↓  
DataManager walks backwards from max HN item ID
    ↓
Finds recent stories (bypasses normal API endpoints)
    ↓
renderFreshestStories() - shows only items < 10 minutes old
    ↓
Stories displayed in dedicated freshest section
```

### 2. Regular Tab Stories Flow (`loadStories()`)
```
User clicks tab or refresh button
    ↓
this.data.getStories(type, 30, forceRefresh?)
    ↓
DataManager uses official HN API endpoints (topstories, newstories, etc.)
    ↓
renderStories() - shows in main tab section
    ↓
Stories displayed in regular tab area
```

## Potential Cache Issues

### Issue 1: Different Data Sources
- **Freshest**: Uses max-id discovery (most recent items regardless of score/ranking)
- **Tabs**: Uses official HN API endpoints (curated/ranked lists)
- **Problem**: These are completely different data sets

### Issue 2: Cache Separation
- Max-id discovered stories may not be cached in the same way as API endpoint stories
- refresh button might only clear API endpoint caches, not max-id discoveries
- DataManager might maintain separate cache buckets

### Issue 3: Timing Mismatch
- Fresh stories (< 10 minutes) might not yet appear in official API endpoints
- HN API endpoints update on different schedules than max-id availability
- Very new stories take time to appear in topstories/newstories lists

## Recommended Solutions

### 1. Cache Unification
```javascript
// Ensure both data sources share the same cache
// When max-id discovers stories, add them to relevant endpoint caches
```

### 2. Refresh Strategy
```javascript
// Make refresh button clear ALL caches, including max-id discoveries
// Or provide separate refresh options
```

### 3. Data Merging
```javascript
// Merge fresh discoveries with API endpoint data
// Show freshest items at top of regular tabs when available
```

### 4. Cache Debugging
```javascript
// Add cache inspection tools to see what's in each cache bucket
// Show cache age and source in debug console
```

## Current DataManager Cache Structure (Estimated)

```javascript
// Likely structure in DataManager:
{
  stories: {
    'top': [...],      // from /topstories API
    'new': [...],      // from /newstories API
    'best': [...],     // from /beststories API
    // ... other endpoints
  },
  items: {
    '12345': {...},    // individual story cache
    // ... cached by ID
  },
  maxIdDiscoveries: [...], // max-id walked stories (separate?)
}
```

## Next Steps

1. **Inspect DataManager code** to understand exact cache structure
2. **Add cache debugging** to see what refresh button actually clears
3. **Test timing** - how long before fresh stories appear in API endpoints
4. **Implement unified caching** or proper cache clearing strategy

## Debug Questions to Answer

1. What does `this.data.getStories('new', 30, true)` actually cache/clear?
2. Are max-id discovered stories stored separately from API stories?
3. How does DataManager handle story deduplication between sources?
4. What's the actual HN API delay for new stories to appear in endpoints?