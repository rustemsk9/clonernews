# ClonerNews Architecture Guide

## 🎯 Core Problem: Data Flow & View Management

You have several architectural choices for managing data and views:

### Option 1: Controller + Shared State (RECOMMENDED ✅)
```
Router → Controller → Shared State Store → Views
         ↓
    Fetch Once, Share Everywhere
```

**Pros:**
- Single source of truth
- Fetch data once, use everywhere
- Views are lightweight and reactive
- Easy to sync state across views
- Better for SPA (Single Page Application)

**Cons:**
- Requires state management system
- Slightly more complex initial setup

### Option 2: View-Level Data Fetching (Simple but wasteful)
```
Router → View A (fetches data)
      → View B (re-fetches same data)
```

**Pros:**
- Simple to understand
- Each view is independent

**Cons:**
- Redundant API calls
- Slower navigation
- Cache helps but not ideal

### Option 3: Hybrid Approach (BEST FOR YOUR PROJECT ✅)
```
Router → DataManager (singleton)
      ↓
   Views query DataManager
      ↓
   DataManager caches & shares data
```

## 🎨 Recommended Architecture

### Layer Structure:

```
1. Router (index.js)
   ↓ coordinates navigation
   
2. DataManager (singleton)
   ↓ fetches, caches, validates
   
3. Views (AbstractView + subclasses)
   ↓ query DataManager, render UI
   
4. Components (reusable UI pieces)
   ↓ story cards, comment threads, etc.
```

## 🔄 Async Loading Strategy

### Progressive Loading Pattern:

```javascript
1. Initial Load (Fast)
   - Show skeleton/loading states
   - Fetch critical data (top 10 stories)
   - Render immediately

2. Secondary Load (Background)
   - Fetch remaining data
   - Update UI progressively
   - User can interact immediately

3. On-Demand Load (Lazy)
   - Load comments when story clicked
   - Load more stories on scroll
   - Fetch user data when needed
```

### Data Sharing Pattern:

```javascript
// DataManager holds all fetched data
{
  stories: {
    top: [...],      // Fetch once
    new: [...],      // Fetch once
    best: [...]      // Fetch once
  },
  items: {
    [id]: {...}      // Cache each item
  },
  users: {
    [username]: {...}
  }
}

// Views access shared data
HomeView → queries top 10 from DataManager
StoryDetailView → queries same story from cache
CommentsView → queries cached comments
```

## 🎯 AbstractView Extension Strategy

### Base AbstractView Responsibilities:
- DOM lifecycle (mount, unmount)
- Title management
- Loading/error states
- Common UI patterns

### Subclass Specialization:

```javascript
AbstractView (base)
├── HomeView (dashboard + stories list)
│   ├── Uses: StoryListComponent
│   ├── Uses: StatsComponent
│   └── Fetches: top stories (limit 30)
│
├── StoryDetailView (single story + comments)
│   ├── Uses: StoryComponent
│   ├── Uses: CommentTreeComponent
│   └── Fetches: story + comments (on demand)
│
├── UserView (user profile)
│   ├── Uses: UserProfileComponent
│   └── Fetches: user data (on demand)
│
└── ListView (full list view)
    ├── Uses: StoryListComponent (reused!)
    └── Uses: InfiniteScrollComponent
    └── Fetches: all stories (paginated)
```

## 🚀 Routing Strategy

### Multi-Level Routes:

```javascript
const routes = [
  { path: '/', view: HomeView, data: 'minimal' },
  { path: '/top', view: ListView, data: 'full', type: 'top' },
  { path: '/new', view: ListView, data: 'full', type: 'new' },
  { path: '/best', view: ListView, data: 'full', type: 'best' },
  { path: '/ask', view: ListView, data: 'full', type: 'ask' },
  { path: '/show', view: ListView, data: 'full', type: 'show' },
  { path: '/jobs', view: ListView, data: 'full', type: 'jobs' },
  { path: '/item/:id', view: StoryDetailView, data: 'on-demand' },
  { path: '/user/:username', view: UserView, data: 'on-demand' }
];
```

## 💡 Data Loading Patterns

### Pattern 1: Optimistic Loading
```javascript
// Load fast, update later
const cachedData = dataManager.getFromCache('top-stories');
view.render(cachedData); // Show immediately

dataManager.fetchTopStories().then(fresh => {
  view.update(fresh); // Update when ready
});
```

### Pattern 2: Promise.all for Dashboard
```javascript
// Home page needs multiple data sources
Promise.all([
  dataManager.getTopStories(10),
  dataManager.getJobStories(5),
  dataManager.getStats()
]).then(([stories, jobs, stats]) => {
  homeView.render({ stories, jobs, stats });
});
```

### Pattern 3: Promise.race for Timeout
```javascript
// Don't wait forever
Promise.race([
  dataManager.fetchStories(),
  timeout(5000)
]).then(data => {
  view.render(data);
}).catch(error => {
  view.showError('Failed to load');
});
```

### Pattern 4: Lazy Loading
```javascript
// Load only what's visible
homeView.renderStories(first10Stories);

// Load more on scroll (throttled)
scrollHandler = throttle(() => {
  if (nearBottom) {
    dataManager.getNextBatch().then(view.appendStories);
  }
}, 200);
```

## 🔐 Security & Validation

### Data Flow with Validation:

```
API → validateResponse → DataManager → validateData → Cache → View
```

### Validation Points:

1. **Response Level**: Check status, headers, size
2. **Data Level**: Validate structure, sanitize HTML
3. **Cache Level**: Check TTL, validate integrity
4. **View Level**: Sanitize before rendering

## 🎨 Component Reusability

### Shared Components:

```javascript
// StoryCard - used by HomeView, ListView, SearchView
class StoryCard {
  render(story) {
    return `
      <div class="story-item">
        <span class="story-rank">${story.rank}</span>
        <div class="story-title">${story.title}</div>
        <div class="story-meta">...</div>
      </div>
    `;
  }
}

// Multiple views use the same component
homeView.use(new StoryCard());
listView.use(new StoryCard());
```

## 📊 Performance Optimization

### Strategies:

1. **Lazy Loading**: Load views on demand
2. **Code Splitting**: Import views dynamically
3. **Virtual Scrolling**: Render only visible items
4. **Request Batching**: Combine multiple requests
5. **Debounced Search**: Reduce API calls
6. **Throttled Scroll**: Limit event handlers

## 🔄 State Synchronization

### Event-Driven Updates:

```javascript
// DataManager emits events
dataManager.on('stories-updated', (stories) => {
  allViewsUsingStories.forEach(view => view.update(stories));
});

// Views listen and react
homeView.listen('stories-updated', (data) => {
  this.renderStories(data);
});
```

## 🎯 Recommended Implementation Order

### Phase 1: Foundation
1. Create DataManager (singleton)
2. Enhance AbstractView with lifecycle hooks
3. Create Component base class

### Phase 2: Core Views
1. Update HomeView to use DataManager
2. Create ListView for "View All" pages
3. Create StoryDetailView for individual stories

### Phase 3: Components
1. Create StoryCard component
2. Create CommentThread component
3. Create LoadingState component
4. Create ErrorState component

### Phase 4: Advanced Features
1. Implement infinite scroll
2. Add real-time updates
3. Add search functionality
4. Add user interactions

## 🛡️ Error Handling Strategy

### Graceful Degradation:

```javascript
try {
  const stories = await dataManager.fetchTopStories();
  view.renderStories(stories);
} catch (error) {
  // Try cache first
  const cached = dataManager.getFromCache('top-stories');
  if (cached) {
    view.renderStories(cached);
    view.showWarning('Showing cached data');
  } else {
    view.showError('Failed to load stories');
  }
}
```

## 📝 Summary: Best Approach for Your Project

### Use Hybrid Architecture:

1. **DataManager** (singleton) - manages all data
2. **AbstractView** - provides lifecycle & common methods
3. **Specialized Views** - lightweight, query DataManager
4. **Reusable Components** - for UI consistency
5. **Progressive Loading** - fast initial render
6. **Smart Caching** - reduce redundant fetches

### Benefits:

✅ Fetch data once, use everywhere
✅ Fast navigation (cached data)
✅ Consistent UI (shared components)
✅ Easy to maintain (separation of concerns)
✅ Scalable (add views without refetching)
✅ Testable (mock DataManager easily)

### This approach balances:
- Performance (minimal fetches)
- User Experience (fast loads)
- Code Quality (DRY, maintainable)
- Security (centralized validation)
