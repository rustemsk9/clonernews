# 📋 Quick Reference Card

## 🎯 DataManager Methods

### Stories
```javascript
await dataManager.getStories('top', 30)      // Get top stories
await dataManager.getStories('new', 30)      // Get new stories
await dataManager.getStories('best', 30)     // Get best stories
await dataManager.loadDashboardData()        // Get all with Promise.all
```

### Max Item Discovery ⭐ NEW
```javascript
await dataManager.getMaxItemId()                    // Get current max ID
await dataManager.loadRecentItems(30)               // Load recent items (all types)
await dataManager.loadItemsFrom(startId, 30)        // Walk backwards from ID
await dataManager.discoverRecentStories(30)         // Find fresh stories
dataManager.startLiveItemStream(10000, callback)    // Real-time monitoring
```

### Individual Items
```javascript
await dataManager.getItem(id)                // Get single item
await dataManager.getMultipleItems(ids)      // Get many items (Promise.all)
await dataManager.getComments(storyId, 20)   // Get story comments
```

### Users
```javascript
await dataManager.getUser(username)          // Get user profile
```

### Cache & Search
```javascript
dataManager.getCachedStories('top')          // Get from cache (instant!)
dataManager.searchStories(query, 'top')      // Search cached stories
dataManager.clearCache('all')                // Clear cache
dataManager.getDebugInfo()                   // Get cache stats
```

---

## 🎨 HomeView Methods

```javascript
await homeView.loadDashboard()               // Load initial data
await homeView.loadStories('top')            // Load specific type
await homeView.loadRecentItems()             // ⭐ Load from max ID
await homeView.loadRecentStoriesFromMaxId()  // ⭐ Discover fresh stories
homeView.startLiveStream()                   // ⭐ Start monitoring
homeView.stopLiveStream()                    // ⭐ Stop monitoring
```

---

## 🔧 Utility Functions

```javascript
import { debounce, throttle, fetchJSON, validateData } from './utils/helpers.js';

const delayed = debounce(fn, 300)            // Debounce function
const limited = throttle(fn, 1000)           // Throttle function
const data = await fetchJSON(url)            // Fetch with validation
const info = validateData(data, 'array')     // Validate & get bytes
```

---

## 🎭 Component Usage

```javascript
import StoryCard from './components/StoryCard.js';
import CommentCard from './components/CommentCard.js';

const storyCard = new StoryCard();
const html = storyCard.render({ story, rank: 1 });

const commentCard = new CommentCard();
const html = commentCard.render({ comment, depth: 0 });
```

---

## 📡 Event Subscriptions

```javascript
dataManager.on('stories-updated', (data) => {})
dataManager.on('stats-updated', (stats) => {})
dataManager.on('recent-items-loaded', (data) => {})     // ⭐ NEW
dataManager.on('stories-discovered', (data) => {})      // ⭐ NEW
dataManager.on('new-items-detected', (items) => {})     // ⭐ NEW
```

---

## 🚀 Common Patterns

### Load Dashboard (Fast)
```javascript
const data = await dataManager.loadDashboardData();
// Uses Promise.all - loads everything in parallel
```

### Discover Fresh Content ⭐
```javascript
const stories = await dataManager.discoverRecentStories(30);
// Walks from max ID - freshest possible content
```

### Real-time Monitoring ⭐
```javascript
const stop = dataManager.startLiveItemStream(10000, (newItems) => {
    console.log('New items:', newItems);
});
// Polls every 10 seconds, later: stop()
```

### Progressive Loading
```javascript
renderSkeleton();                            // Show immediately
const data = await fetchData();              // Load in background
renderReal(data);                            // Update when ready
```

### Infinite Scroll
```javascript
let currentId = await dataManager.getMaxItemId();

async function loadMore() {
    const stories = await dataManager.loadItemsFrom(currentId, 30, 'story');
    appendStories(stories);
    currentId -= 30;
}
```

---

## 🔍 Browser Console Commands

```javascript
// Get max item ID
await dataManager.getMaxItemId()

// Test recent items
await dataManager.loadRecentItems(10)

// Test story discovery
await dataManager.discoverRecentStories(5)

// Check cache
dataManager.getDebugInfo()

// Clear cache
dataManager.clearCache('all')

// Start live stream
const stop = dataManager.startLiveItemStream(5000, console.log)
```

---

## 📊 API Endpoints

```
Base: https://hacker-news.firebaseio.com/v0

/maxitem.json                    ⭐ Max item ID
/item/{id}.json                  Individual item
/user/{username}.json            User profile
/topstories.json                 Top story IDs
/newstories.json                 New story IDs
/beststories.json                Best story IDs
/askstories.json                 Ask HN IDs
/showstories.json                Show HN IDs
/jobstories.json                 Job IDs
/updates.json                    Changed items
```

---

## 🎯 Keyboard Shortcuts (Suggested)

Add these to your app:

```javascript
// In init():
document.addEventListener('keydown', (e) => {
    if (e.key === 'r') this.refresh();           // R = Refresh
    if (e.key === 'n') this.loadStories('new');  // N = New
    if (e.key === 't') this.loadStories('top');  // T = Top
    if (e.key === 'd') this.toggleDebug();       // D = Debug
    if (e.key === 'l') this.startLiveStream();   // L = Live
    if (e.key === 'f') this.loadRecentStories(); // F = Fresh
});
```

---

## 📖 Documentation Files

1. **QUICK_ANSWER.md** - Your questions answered
2. **ARCHITECTURE.md** - System design
3. **IMPLEMENTATION_GUIDE.md** - Development guide
4. **ASYNC_SYNC_FLOW.md** - Execution details
5. **MAX_ITEM_DISCOVERY.md** - New feature guide ⭐
6. **FINAL_SUMMARY.md** - Complete overview
7. **QUICK_REFERENCE.md** - This file!

---

## 🎨 Color Scheme

```css
--primary-color: #ff6600    /* Orange */
--bg-color: #f6f6ef         /* Beige */
--text-color: #828282      /* Gray */
--link-color: #000000      /* Black */
--card-bg: #ffffff         /* White */
```

---

## 🚦 Status Indicators

```
📦 = Cache hit (instant)
🌐 = API call (network)
✅ = Success
❌ = Error
⏳ = Loading
🔍 = Discovery mode
🔴 = Live stream active
⏹️ = Stream stopped
🆕 = New items detected
```

---

## 💡 Pro Tips

1. **Use cache first**: Second loads are 1000x faster
2. **Batch requests**: Use Promise.all instead of sequential
3. **Debounce search**: Save 90% of API calls
4. **Progressive load**: Show skeletons while loading
5. **Clean up**: Always unmount views properly
6. **Monitor max ID**: Freshest content available ⭐
7. **Use live stream**: Real-time updates ⭐

---

**Print this and keep it handy!** 📋
