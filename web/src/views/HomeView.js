import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Home");
    }

    async getHtml() {
        return `
            <h1>Welcome to ClonerNews</h1>
            <p>Your source for the latest news articles.</p>
        `;
    }

    async init() {
        console.log("HomeView initialized");
    }
}