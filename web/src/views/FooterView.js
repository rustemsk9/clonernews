import AbstractView from "./AbstractView.js";

export default class extends AbstractView { 
    constructor() { 
        super();
        this.title = ""; 
    }

    async getHtml() { 
        return `
            <div style="padding: 15px;">
                <div style="margin-bottom: 10px; font-size: 10pt; color: #828282;">
                    <strong>ClonerNews</strong> - A Hacker News Clone with Modern Features
                </div>
                <div class="footer-links">
                    <a href="#about">About</a>
                    <a href="#guidelines">Guidelines</a>
                    <a href="#faq">FAQ</a>
                    <a href="#api">API</a>
                    <a href="#security">Security</a>
                    <a href="#lists">Lists</a>
                    <a href="#bookmarklet">Bookmarklet</a>
                    <a href="#legal">Legal</a>
                    <a href="#apply">Apply to YC</a>
                    <a href="#contact">Contact</a>
                </div>
                <div style="margin-top: 15px; font-size: 8pt; color: #828282;">
                    Built with ❤️ using Firebase API | Features: Debounce, Throttle, Promise.all, Promise.race
                </div>
                <div style="margin-top: 8px; font-size: 8pt; color: #828282;">
                    Search powered by modern JS techniques | © 2025 ClonerNews
                </div>
            </div>
        `;
    }

    async init() { 
        console.log("FooterView initialized");
        
        // Handle footer link clicks
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                console.log(`Footer link clicked: ${section}`);
            });
        });
    }
}
