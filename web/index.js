import NavBarView from "./src/views/NavBarView.js";
import Home from "./src/views/HomeView.js";
// import AbstractView from "./src/views/AbstractView.js";
import FooterView from "./src/views/FooterView.js";

const router = async() => {
    const routes = [
        { path: "/", view: Home },
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


    // const pageView = new match.route.view(getParams(match.result));
    const pageView = new match.route.view(match.result);

    const navBarView = new NavBarView()
    document.querySelector("#navbar").innerHTML = await navBarView.getHtml();
    await navBarView.init();
    document.querySelector("#app").innerHTML = await pageView.getHtml();
    await pageView.init();
    const footerView = new FooterView()
    document.querySelector("#footer").innerHTML = await footerView.getHtml();
    await footerView.init();
};

document.addEventListener("DOMContentLoaded", () => {
    router();
});



