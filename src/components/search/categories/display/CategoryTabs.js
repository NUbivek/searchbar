import React from 'react';

/**
 * CategoryTabs component displays tabs for each category
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories to display
 * @param {string} props.activeCategory Current active category
 * @param {Function} props.onCategoryChange Callback when category is selected
 * @param {string} props.position Position of the tabs (top or bottom)
 * @returns {JSX.Element} Rendered tabs
 */
const CategoryTabs = ({ categories, activeCategory, onCategoryChange, position = 'top' }) => {
  // Ensure categories is always an array
  const categoriesArray = Array.isArray(categories) ? categories : [];
  
  // If no categories, don't render anything
  if (categoriesArray.length === 0) {
    return null;
  }
  
  // Determine if we have a valid active category
  const hasValidActiveCategory = categoriesArray.some(cat => cat.id === activeCategory);
  
  // If no valid active category, use the first one
  const effectiveActiveCategory = hasValidActiveCategory 
    ? activeCategory 
    : (categoriesArray.length > 0 ? categoriesArray[0].id : null);
  
  // If still no valid category, don't render anything
  if (!effectiveActiveCategory) {
    return null;
  }
  
  // Determine the tab style based on position
  const tabsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    margin: position === 'top' ? '0 0 15px 0' : '15px 0 0 0',
    borderBottom: position === 'top' ? '1px solid #e0e0e0' : 'none',
    borderTop: position === 'bottom' ? '1px solid #e0e0e0' : 'none',
  };
  
  return (
    <ul className="category-tabs" style={tabsStyle}>
      {categoriesArray.map(category => (
        <li 
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          style={{
            padding: '8px 16px',
            marginRight: '5px',
            cursor: 'pointer',
            backgroundColor: category.id === effectiveActiveCategory ? '#f0f0f0' : 'transparent',
            borderRadius: '4px 4px 0 0',
            fontWeight: category.id === effectiveActiveCategory ? 'bold' : 'normal',
            borderBottom: category.id === effectiveActiveCategory && position === 'top' 
              ? '2px solid #007bff' 
              : 'none',
            borderTop: category.id === effectiveActiveCategory && position === 'bottom' 
              ? '2px solid #007bff' 
              : 'none',
            position: 'relative',
            top: position === 'bottom' ? '1px' : '0',
          }}
        >
          {category.name}
          {category.content && category.content.length > 0 && (
            <span style={{ 
              marginLeft: '5px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              borderRadius: '50%', 
              padding: '2px 6px',
              fontSize: '0.75em'
            }}>
              {category.content.length}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryTabs;