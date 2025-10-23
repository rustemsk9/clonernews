# 🔍 Max Item Discovery - Feature Guide

## Overview

The DataManager now supports **discovering items from the max item ID backwards**, which gives you access to the absolute freshest content on Hacker News!

---

## 🎯 Why Use Max Item Discovery?

### Traditional API Endpoints:
```javascript
/v0/topstories.json    // Curated by HN algorithm
/v0/newstories.json    // Recent stories, but filtered
```
**Problem:** Slight delay, may miss very fresh items

### Max Item Discovery:
```javascript
/v0/maxitem.json       // Current highest ID
→ Walk backwards from max ID
→ Get items: 45684462, 45684461, 45684460, ...
```
**Benefit:** See items seconds after they're posted!

---

## 🚀 New DataManager Methods

### 1. Get Max Item ID

```javascript
const maxId = await dataManager.getMaxItemId();
console.log(maxId);  // e.g., 45684462
```

### 2. Load Recent Items (All Types)

```javascript
const result = await dataManager.loadRecentItems(30);

console.log(result);
// {
//   items: [...],        // All valid items
//   byType: {
//     stories: [...],
//     comments: [...],
//     jobs: [...],
//     polls: [...],
//     pollopts: [...]
//   },
//   maxId: 45684462
// }
```

### 3. Walk Backwards from Any ID

```javascript
// Load 50 items starting from ID 45684000
const items = await dataManager.loadItemsFrom(45684000, 50);

// Load only stories
const stories = await dataManager.loadItemsFrom(45684000, 50, 'story');
```

### 4. Discover Recent Stories

```javascript
// Find 30 recent stories by walking backwards
const stories = await dataManager.discoverRecentStories(30);

// This automatically filters out:
// - Deleted items
// - Dead items
// - Non-story items (comments, jobs, etc.)

console.log(`Found ${stories.length} fresh stories!`);
```

### 5. Live Item Stream (Real-time)

```javascript
// Start monitoring for new items
const stopStream = dataManager.startLiveItemStream(10000, (newItems) => {
    console.log('New items detected!', newItems);
    // Update UI with new items
});

// Later, stop the stream
stopStream();
```

---

## 🎨 UI Features (HomeView)

Open the Debug Info panel and you'll see 4 new buttons:

### 1. **Load Recent Items (30)**
- Fetches the 30 most recent items of ANY type
- Shows breakdown by type (stories, comments, jobs, etc.)
- Great for seeing the full activity

### 2. **Discover Stories from Max ID**
- Walks backwards finding ONLY stories
- Replaces the current story list
- Shows freshest stories available
- Title changes to "🔥 Freshest Stories"

### 3. **🔴 Start Live Stream**
- Polls max ID every 10 seconds
- Detects new items in real-time
- Shows notification banner when new items appear
- Click banner to refresh stories

### 4. **⏹️ Stop Live Stream**
- Stops the polling
- Saves API calls

---

## 📊 Example Use Cases

### Use Case 1: Find Breaking News

```javascript
// Check what's being posted RIGHT NOW
const fresh = await dataManager.loadRecentItems(100);

const breakingStories = fresh.byType.stories.filter(story => {
    const ageMinutes = (Date.now() - story.time * 1000) / 60000;
    return ageMinutes < 5;  // Posted in last 5 minutes
});

console.log(`${breakingStories.length} stories from last 5 minutes!`);
```

### Use Case 2: Real-time Monitoring

```javascript
// Monitor new comments on a specific story
let storyId = 12345678;

dataManager.startLiveItemStream(5000, (newItems) => {
    const newComments = newItems.filter(item => 
        item.type === 'comment' && item.parent === storyId
    );
    
    if (newComments.length > 0) {
        console.log(`${newComments.length} new comments on story!`);
        updateCommentsUI(newComments);
    }
});
```

### Use Case 3: Activity Dashboard

```javascript
const recent = await dataManager.loadRecentItems(200);

const stats = {
    storiesPerHour: calculateRate(recent.byType.stories),
    commentsPerHour: calculateRate(recent.byType.comments),
    jobsPerHour: calculateRate(recent.byType.jobs),
    mostActiveUsers: findMostActive(recent.items)
};

displayActivityDashboard(stats);
```

### Use Case 4: Find Trending Topics

```javascript
const stories = await dataManager.discoverRecentStories(100);

// Analyze titles for trending words
const wordFrequency = {};
stories.forEach(story => {
    const words = story.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
});

const trending = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

console.log('Trending words:', trending);
```

---

## ⚡ Performance Considerations

### Efficient Batching

```javascript
// Good: Load in reasonable batches
const items = await dataManager.loadItemsFrom(maxId, 50);

// Avoid: Too large (slow, heavy)
const items = await dataManager.loadItemsFrom(maxId, 1000);
```

### Use Caching

```javascript
// First call: Fetches from API
const stories1 = await dataManager.discoverRecentStories(30);

// Second call: Uses cached items
const stories2 = await dataManager.discoverRecentStories(30);
// Much faster!
```

### Live Stream Intervals

```javascript
// Good: Reasonable interval (10s)
startLiveItemStream(10000, callback);

// Avoid: Too frequent (hammers API)
startLiveItemStream(1000, callback);

// Good: Longer interval for background monitoring
startLiveItemStream(60000, callback);  // Every minute
```

---

## 🔄 Data Flow

```
User clicks "Discover Stories"
         ↓
HomeView.loadRecentStoriesFromMaxId()
         ↓
DataManager.discoverRecentStories(30)
         ↓
DataManager.getMaxItemId()
         ↓
API: /v0/maxitem.json → 45684462
         ↓
Generate IDs: [45684462, 45684461, 45684460, ...]
         ↓
DataManager.loadItemsFrom(45684462, 50)
         ↓
Promise.all([
    getItem(45684462),
    getItem(45684461),
    getItem(45684460),
    ... (parallel!)
])
         ↓
Filter: type === 'story' && !deleted && !dead
         ↓
Cache all items in DataManager
         ↓
Emit 'stories-discovered' event
         ↓
HomeView receives event
         ↓
renderStories(freshStories)
         ↓
User sees freshest content! 🎉
```

---

## 🎯 Event Subscriptions

### Listen for Recent Items

```javascript
dataManager.on('recent-items-loaded', (data) => {
    console.log('Max ID:', data.maxId);
    console.log('Items by type:', data.byType);
    // Update your UI
});
```

### Listen for Discovered Stories

```javascript
dataManager.on('stories-discovered', (data) => {
    console.log('Source:', data.source);  // 'max-id-walk'
    console.log('Stories:', data.stories);
    // Show in special section
});
```

### Listen for Live Updates

```javascript
dataManager.on('new-items-detected', (items) => {
    console.log('New items!', items);
    // Show notification badge
});
```

---

## 🧪 Testing the Feature

### In Browser Console:

```javascript
// Get the DataManager instance
const dm = window.dataManager || dataManager;

// Test max ID
const maxId = await dm.getMaxItemId();
console.log('Max ID:', maxId);

// Test recent items
const recent = await dm.loadRecentItems(10);
console.log('Recent items:', recent);

// Test story discovery
const stories = await dm.discoverRecentStories(5);
console.log('Fresh stories:', stories);

// Test live stream
const stop = dm.startLiveItemStream(5000, (items) => {
    console.log('New:', items.length);
});

// Stop after 30 seconds
setTimeout(stop, 30000);
```

---

## 📈 Comparison: API vs Max ID Discovery

### API Endpoint Method:
```javascript
// Fast, but curated/filtered
const stories = await dataManager.getStories('top', 30);
// ~1-2 seconds
// Shows algorithm-ranked stories
```

### Max ID Discovery:
```javascript
// Slightly slower, but freshest
const stories = await dataManager.discoverRecentStories(30);
// ~2-4 seconds (more API calls)
// Shows chronologically newest stories
```

**Use API for:** User-facing main content
**Use Max ID for:** Real-time monitoring, finding breaking news

---

## 🎁 Bonus: Advanced Patterns

### Pattern 1: Hybrid Approach

```javascript
async function loadBestContent() {
    // Show API content first (fast)
    const apiStories = await dataManager.getStories('top', 20);
    renderStories(apiStories);
    
    // Add fresh content in background
    const freshStories = await dataManager.discoverRecentStories(10);
    prependStories(freshStories);
}
```

### Pattern 2: Infinite Discovery

```javascript
let currentId = await dataManager.getMaxItemId();

async function loadMore() {
    const stories = await dataManager.loadItemsFrom(currentId, 30, 'story');
    appendStories(stories);
    currentId -= 30;  // Next batch
}

// Load more on scroll
window.addEventListener('scroll', throttle(loadMore, 1000));
```

### Pattern 3: Item Types Dashboard

```javascript
async function showActivityDashboard() {
    const data = await dataManager.loadRecentItems(100);
    
    renderChart({
        stories: data.byType.stories.length,
        comments: data.byType.comments.length,
        jobs: data.byType.jobs.length,
        polls: data.byType.polls.length
    });
}
```

---

## ✅ Summary

You now have access to:

- ✅ Max item ID discovery
- ✅ Backwards walking from any ID
- ✅ Story-only filtering
- ✅ Real-time live streaming
- ✅ Event-driven updates
- ✅ Smart caching
- ✅ Parallel loading

**All integrated with your existing DataManager architecture!**

---

## 🚀 Try It Now!

1. Open http://localhost:8001
2. Toggle "Debug Info" section
3. Click "Discover Stories from Max ID"
4. Watch console logs
5. See freshest stories appear!
6. Try "Start Live Stream" for real-time updates

**Enjoy exploring the freshest content on Hacker News!** 🎉
