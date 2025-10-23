# ClonerNews - Hacker News Clone

A modern Hacker News clone built with vanilla JavaScript, featuring advanced techniques like debouncing, throttling, Promise.all, and Promise.race for efficient data fetching.

## 🚀 Project Structure

```
clonernews/
├── web/
│   ├── index.html          # Main HTML with comprehensive styling and layout
│   ├── index.js            # Router and initialization
│   └── src/
│       ├── views/          # View components (MVC pattern)
│       │   ├── AbstractView.js
│       │   ├── HomeView.js      # Main dashboard view
│       │   ├── NavBarView.js    # Navigation component
│       │   └── FooterView.js    # Footer component
│       ├── services/       # API services
│       │   └── hackerNewsAPI.js # Hacker News API wrapper
│       └── utils/          # Utility functions
│           └── helpers.js       # Debounce, throttle, fetch helpers
└── possible-example-workers/    # Example implementations
    ├── debounce.js
    ├── throttle.js
    ├── get-json.js
    └── ...
```

## 🎨 UI Components

### Main Dashboard Features:

1. **Stats Bar** - Real-time statistics with 4 cards:
   - Total Stories
   - Comments Count
   - Active Polls
   - Top Score

2. **Search Bar** - Debounced search functionality

3. **Tabs Navigation** - Switch between:
   - Top Stories
   - New
   - Best
   - Ask HN
   - Show HN
   - Jobs

4. **Content Grid** (2-column responsive layout):
   - **Left Column:**
     - Stories List
     - Comments Section
   
   - **Right Column:**
     - User Profile Card
     - Active Polls
     - Latest Jobs

5. **Data Table** - Top Contributors table view

## 🔧 Key Features

### Security & Performance
- **Data Validation**: Checks response size before processing (10MB limit)
- **Byte Calculation**: Validates data size in bytes
- **Promise.all**: Parallel fetching of multiple items
- **Promise.race**: Timeout implementation and redundant requests
- **Caching**: 5-minute TTL cache for API responses
- **Retry Logic**: Exponential backoff for failed requests

### User Experience
- **Debounced Search**: Reduces API calls while typing
- **Throttled Events**: Efficient scroll/resize handlers
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Graceful error messages
- **Responsive Design**: Mobile-first approach

## 📡 Hacker News API Integration

### Available Endpoints:

```javascript
// Get story lists (returns IDs)
getTopStories()
getNewStories()
getBestStories()
getAskStories()
getShowStories()
getJobStories()

// Get individual items
getItem(id)              // Story, comment, job, poll, or pollopt
getUser(username)        // User profile
getMaxItem()             // Current max item ID

// Advanced fetching
getStoriesWithData(type, limit)   // Get stories with full data
getMultipleItems(ids, limit)      // Fetch multiple items with Promise.all
getComments(storyId, limit)       // Get comments for a story
```

### Data Types:

- **Story**: `{ id, title, url, by, time, score, descendants, kids }`
- **Comment**: `{ id, by, parent, text, time, kids }`
- **Job**: `{ id, title, text, by, time, url }`
- **Poll**: `{ id, title, text, by, time, score, parts, kids }`
- **PollOpt**: `{ id, text, poll, score }`

## 🛠️ Utility Functions

### helpers.js

```javascript
// Debounce - Execute after delay
debounce(fn, delay)

// Throttle - Execute at most once per interval
throttle(fn, limit)

// Secure fetch with validation
fetchJSON(url)

// Parallel fetching
fetchAll(urls)

// Race with timeout
fetchRace(urls, timeoutMs)

// Data validation
validateData(data, expectedType)

// Helpers
formatDate(unixTime)
extractDomain(url)
sanitizeHTML(html)
retryWithBackoff(fn, maxRetries, initialDelay)

// Cache
const cache = new DataCache(ttl)
```

## 🎯 Next Steps

### Phase 1: Current (HTML/CSS Structure) ✅
- [x] Create comprehensive HTML layout
- [x] Design responsive CSS
- [x] Set up view components
- [x] Create utility modules

### Phase 2: API Integration
- [ ] Connect API service to views
- [ ] Implement story loading with Promise.all
- [ ] Add debounced search functionality
- [ ] Implement throttled scroll events
- [ ] Add loading states and error handling

### Phase 3: Advanced Features
- [ ] Real-time data validation
- [ ] Promise.race for timeout handling
- [ ] Implement data interpolation/templating
- [ ] Add polling for new stories
- [ ] User authentication
- [ ] Comment threading

### Phase 4: Optimization
- [ ] Implement virtual scrolling
- [ ] Add service worker for offline support
- [ ] Optimize bundle size
- [ ] Add analytics

## 🧪 Testing

Test your utility functions:

```javascript
// Test debounce
const debouncedSearch = debounce((query) => {
    console.log('Search:', query);
}, 300);

// Test throttle
const throttledScroll = throttle(() => {
    console.log('Scroll event');
}, 100);

// Test Promise.all
const stories = await getStoriesWithData('top', 30);
console.log(`Loaded ${stories.length} stories`);

// Test data validation
const validation = validateData(stories, 'array');
console.log('Validation:', validation);
```

## 🚀 Running the Project

1. **Local Server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   ```

2. **Open in browser**:
   ```
   http://localhost:8000/web/
   ```

## 📚 Learning Goals

This project demonstrates:
- ✅ Debouncing and throttling
- ✅ Promise.all for parallel requests
- ✅ Promise.race for timeouts
- ✅ Data validation and security
- ✅ Modular JavaScript architecture
- ✅ MVC pattern implementation
- ✅ Responsive CSS Grid/Flexbox
- ✅ API integration with caching
- ✅ Error handling and retry logic

## 🎨 Design Inspiration

Color scheme inspired by Hacker News:
- Primary: `#ff6600` (Orange)
- Background: `#f6f6ef` (Beige)
- Text: `#828282` (Gray)
- Links: `#000000` (Black)

## 📝 Notes

- All API calls validate data size before processing
- Cache reduces unnecessary API calls
- Retry logic handles transient failures
- Responsive design works on mobile, tablet, and desktop
- Modular structure makes it easy to add new views

## 🔗 Resources

- [Hacker News API Docs](https://github.com/HackerNews/API)
- [Firebase API](https://hacker-news.firebaseio.com/v0/)
- [MDN Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

---

**Built with ❤️ for learning modern JavaScript techniques**
