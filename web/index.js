import NavBarView from "./src/views/NavBarView.js";
import HomeView from "./src/views/HomeView.js";
import FooterView from "./src/views/FooterView.js";

// Global state
let currentView = null;

const router = async() => {
    const routes = [
        { path: "/", view: HomeView },
        // Add more routes here as you create new views
        // { path: "/item/:id", view: StoryDetailView },
        // { path: "/user/:username", view: UserView },
        // { path: "/top", view: ListView },
    ]

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname === route.path ? [location.pathname] : null
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
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

    // Create new view instance
    const pageView = new match.route.view(match.result);
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


