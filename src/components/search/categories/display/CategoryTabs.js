import React from 'react';

/**
 * Component for displaying category tabs
 * @param {Object} props Component props
 * @param {Array} props.categories Array of category objects
 * @param {string} props.activeCategory ID of the active category
 * @param {Function} props.onTabChange Function to call when tab is changed
 * @returns {JSX.Element} Category tabs component
 */
const CategoryTabs = ({ categories, activeCategory, onTabChange }) => {
  // Debug log
  console.log("CategoryTabs rendering with:", { 
    categoriesCount: categories.length, 
    activeCategory,
    categoryNames: categories.map(c => c.name),
    categoryIds: categories.map(c => c.id)
  });

  // If there's only one category, don't show tabs
  if (!categories || categories.length <= 1) {
    console.log("CategoryTabs: Only one or no categories, not rendering tabs");
    return (
      <div style={{
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#ecfdf5',
        border: '1px solid #6ee7b7',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <p>CategoryTabs Debug:</p>
        <p>Categories Count: {categories?.length || 0}</p>
        <p>Active Category: {activeCategory || 'None'}</p>
        <p>Categories: {categories?.map(c => c.name)?.join(', ') || 'None'}</p>
      </div>
    );
  }

  // Tab styles
  const tabStyles = {
    tabsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '16px'
    },
    tab: (isActive) => ({
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? '#1a56db' : '#4b5563',
      borderBottom: isActive ? '2px solid #1a56db' : '2px solid transparent',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'all 0.2s ease'
    }),
    tabCount: {
      fontSize: '12px',
      color: '#6b7280',
      marginLeft: '4px',
      padding: '2px 6px',
      backgroundColor: '#f3f4f6',
      borderRadius: '12px'
    }
  };

  return (
    <div style={tabStyles.tabsContainer}>
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        console.log(`Tab ${category.name}: isActive=${isActive}, id=${category.id}, activeCategory=${activeCategory}`);
        
        return (
          <div
            key={category.id}
            style={tabStyles.tab(isActive)}
            onClick={() => onTabChange(category.id)}
          >
            {category.name}
            {category.count !== undefined && (
              <span style={tabStyles.tabCount}>{category.count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTabs;