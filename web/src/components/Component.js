// Component - Base class for reusable UI components

export default class Component {
    constructor(props = {}) {
        this.props = props;
    }
    
    /**
     * Render component to HTML string
     */
    render() {
        return "";
    }
    
    /**
     * Update component with new props
     */
    update(props) {
        this.props = { ...this.props, ...props };
        return this.render();
    }
}
