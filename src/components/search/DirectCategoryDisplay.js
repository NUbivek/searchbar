import React from 'react';

/**
 * DirectCategoryDisplay - A component that bypasses React rendering and directly manipulates the DOM
 * to ensure categories are visible even if there are React rendering issues.
 */
class DirectCategoryDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.categories = props.categories || [];
  }
  
  componentDidMount() {
    // When component mounts, directly inject the HTML
    this.injectCategoryHTML();
    
    // Add a global window function to force re-render the categories
    window.forceCategoryRefresh = () => {
      console.log('Force refreshing categories via direct DOM manipulation');
      this.injectCategoryHTML();
    };
  }
  
  componentDidUpdate(prevProps) {
    // Update when categories change
    if (JSON.stringify(prevProps.categories) !== JSON.stringify(this.props.categories)) {
      this.categories = this.props.categories || [];
      this.injectCategoryHTML();
    }
  }
  
  injectCategoryHTML() {
    if (!this.containerRef.current) return;
    
    const container = this.containerRef.current;
    
    // Log before injection
    console.log('DirectCategoryDisplay injecting categories directly to DOM:', {
      containerExists: !!container,
      categoryCount: this.categories.length,
      categoryNames: this.categories.map(c => c.name).join(', ')
    });
    
    // Generate HTML for categories
    const html = this.generateCategoryHTML();
    
    // Set innerHTML directly (bypassing React rendering)
    container.innerHTML = html;
    
    // Add event listeners after setting innerHTML
    setTimeout(() => {
      this.addEventListeners();
    }, 100);
  }
  
  addEventListeners() {
    if (!this.containerRef.current) return;
    
    // Add click event listeners to category cards
    const cards = this.containerRef.current.querySelectorAll('.direct-category-card');
    cards.forEach(card => {
      const categoryId = card.getAttribute('data-category-id');
      card.addEventListener('click', () => {
        if (this.props.onCategoryChange) {
          this.props.onCategoryChange(categoryId);
        }
        
        // Update active class
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }
  
  generateCategoryHTML() {
    const { categories } = this.props;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return `
        <div style="padding: 15px; background-color: #fff0f0; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 10px; color: #ef4444;">
          <strong>Direct Category Display:</strong> No categories available to display.
        </div>
      `;
    }
    
    // Start with container
    let html = `
      <div class="direct-category-display" style="margin: 20px 0; padding: 15px; border: 3px solid #2563eb; border-radius: 8px; background-color: #f0f9ff;">
        <h3 style="font-size: 18px; font-weight: bold; color: #1e40af; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #3b82f6; padding-bottom: 10px;">
          Direct DOM Categories (${categories.length})
        </h3>
        
        <div style="padding: 10px; background-color: #ecfdf5; border-radius: 4px; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px;">Categories: ${categories.map(c => c.name).join(', ')}</p>
        </div>
        
        <div class="direct-category-ribbon" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    `;
    
    // Add each category card
    categories.forEach(category => {
      const { id, name, color = '#4CAF50', metrics = {} } = category;
      const overall = metrics.overall || 0.8;
      const percentage = Math.round((overall * 100)) + '%';
      
      html += `
        <div 
          class="direct-category-card" 
          data-category-id="${id}" 
          data-category-name="${name}"
          style="
            background-color: #ffffff;
            border-left: 4px solid ${color};
            padding: 12px 15px;
            min-width: 180px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            position: relative;
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            margin: 8px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          "
        >
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: ${color};
            color: #ffffff;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            z-index: 2;
          ">
            ${percentage}
          </div>
          
          <div style="text-align: center; margin-bottom: 8px;">
            <h3 style="
              color: #333333;
              font-size: 16px;
              font-weight: 700;
              margin: 0 0 5px 0;
            ">
              ${name}
            </h3>
          </div>
        </div>
      `;
    });
    
    // Close containers
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  render() {
    // Just render a container div that we'll manipulate directly
    return (
      <div 
        ref={this.containerRef} 
        id="direct-category-container"
        style={{
          margin: '20px 0',
          padding: '0',
          display: 'block',
          visibility: 'visible'
        }}
      />
    );
  }
}

export default DirectCategoryDisplay;
