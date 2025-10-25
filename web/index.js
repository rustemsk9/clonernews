import NavBarView from "./src/views/NavBarView.js";
import HomeView from "./src/views/HomeView.js";
import FooterView from "./src/views/FooterView.js";
import ListView from "./src/views/ListView.js";
import StoryDetailView from "./src/views/StoryDetailView.js";

// Global state
let currentView = null;

const router = async() => {
    const routes = [
        { path: "/", view: HomeView },
        { path: "/top", view: ListView, params: { type: 'top', title: 'Top Stories' } },
        { path: "/new", view: ListView, params: { type: 'new', title: 'New Stories' } },
        { path: "/best", view: ListView, params: { type: 'best', title: 'Best Stories' } },
        { path: "/ask", view: ListView, params: { type: 'ask', title: 'Ask HN' } },
        { path: "/show", view: ListView, params: { type: 'show', title: 'Show HN' } },
        { path: "/jobs", view: ListView, params: { type: 'jobs', title: 'Jobs' } },
        // Add more routes here as you create new views
        // { path: "/user/:username", view: UserView },
    ]

    // Check for dynamic story routes (e.g., /top/123456, /new/789012)
    const pathParts = location.pathname.split('/').filter(part => part);
    let match = null;

    if (pathParts.length === 2) {
        const [section, storyId] = pathParts;
        const validSections = ['top', 'new', 'best', 'ask', 'show', 'jobs', 'item'];
        
        if (validSections.includes(section) && /^\d+$/.test(storyId)) {
            // This is a story detail route
            match = {
                route: { view: StoryDetailView },
                result: { section, storyId }
            };
        }
    }

    // If no dynamic match, try static routes
    if (!match) {
        const potentialMatches = routes.map(route => {
            return {
                route: route,
                result: location.pathname === route.path ? [location.pathname] : null
            };
        });

        match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
    }
    
    if (!match) {
        console.log("No match found, defaulting to /");
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    // Unmount previous view to clean up event listeners
    if (currentView && typeof currentView.unmount === 'function') {
        currentView.unmount();
    }

    // Create new view instance with params if available
    const viewParams = match.result.section ? match.result : (match.route.params || match.result);
    const pageView = new match.route.view(viewParams);
    currentView = pageView;

    // Render static components (navbar and footer)
    const navBarView = new NavBarView()
    document.querySelector("#navbar").innerHTML = await navBarView.getHtml();
    await navBarView.init();
    
    // Mount the main view using the new mount method
    await pageView.mount('#app');
    
    const footerView = new FooterView()
    document.querySelector("#footer").innerHTML = await footerView.getHtml();
    await footerView.init();
    
    console.log('✅ Router: Page loaded successfully');
};

// Initialize router on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log('🚀 ClonerNews starting...');
    router();
});

// Handle back/forward browser buttons
window.addEventListener('popstate', router);

// Handle hash changes for client-side routing
window.addEventListener('hashchange', router);

// Export router for programmatic navigation
window.navigateTo = (path) => {
    window.history.pushState(null, null, path);
    router();
};

console.log('📦 ClonerNews modules loaded');


