import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
    }

    async getHtml() {
        return `
            <div class="nav-content">
                <span class="nav-logo">Y</span>
                <strong style="color: white;">ClonerNews</strong>
                <div class="nav-links">
                    <a href="#top">top</a>
                    <a href="#new">new</a>
                    <a href="#best">best</a>
                    <a href="#ask">ask</a>
                    <a href="#show">show</a>
                    <a href="#jobs">jobs</a>
                    <span style="color: white;">|</span>
                    <a href="#submit">submit</a>
                </div>
                <div style="margin-left: auto; color: white; font-size: 9pt;">
                    <a href="#login" style="color: white;">login</a>
                </div>
            </div>
        `;
    }

    async init() {
        console.log("NavBar initialized");
        
        // Handle navigation clicks
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                console.log(`Navigating to: ${section}`);
                
                // Trigger tab change if on home page
                const targetTab = document.querySelector(`.tab[data-tab="${section}"]`);
                if (targetTab) {
                    targetTab.click();
                }
            });
        });
    }
}
