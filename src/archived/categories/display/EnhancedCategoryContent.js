import React, { useState } from 'react';
import { 
  CategoryHeaderContent, 
  CategorySummaryDisplay, 
  CategoryMetricsDisplay, 
  CategoryContentItem,
  BusinessInsightsDisplay
} from './';

/**
 * Enhanced category content component with header, metrics, insights, and content items
 * @param {Object} props Component props
 * @param {Object} props.category The category to display
 * @param {string} props.query The search query
 * @returns {JSX.Element} Rendered enhanced category content
 */
const EnhancedCategoryContent = ({ category, query }) => {
  const [expandedItems, setExpandedItems] = useState({});
  
  // Ensure category is valid
  if (!category || !category.content || !Array.isArray(category.content)) {
    return (
      <div className="enhanced-category-content">
        <p>No content available for this category.</p>
      </div>
    );
  }
  
  // Determine if this is a business category
  const isBusinessCategory = 
    category.id === 'business' || 
    category.id === 'market_analysis' || 
    category.id === 'financial_data' || 
    category.id === 'company_info' ||
    category.id === 'industry_trends' ||
    category.id === 'investment_strategies' ||
    category.id === 'economic_indicators';
  
  // Toggle expanded state for a content item
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Filter content items with a minimum score (if available)
  const filteredContent = category.content.filter(item => {
    // If no score, include by default
    if (!item.score && !item.relevance) return true;
    
    // Use either score or relevance property
    const score = item.score || item.relevance || 0;
    return score >= 60; // Only show items with score >= 60%
  });
  
  return (
    <div className="enhanced-category-content">
      {/* Category Header */}
      <CategoryHeaderContent category={category} query={query} />
      
      {/* Category Metrics */}
      {category.metrics && (
        <CategoryMetricsDisplay 
          metrics={category.metrics} 
          categoryType={category.id || 'default'} 
        />
      )}
      
      {/* Category Summary/Insights */}
      <CategorySummaryDisplay category={category} query={query} />
      
      {/* Business Insights for business categories */}
      {isBusinessCategory && (
        <BusinessInsightsDisplay 
          category={category} 
          query={query} 
        />
      )}
      
      {/* Content Items */}
      <div className="category-content-items">
        <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
          Search Results
        </h4>
        
        {filteredContent.length === 0 ? (
          <p>No high-quality results found for this category.</p>
        ) : (
          filteredContent.map((item, index) => (
            <CategoryContentItem
              key={`${category.id}-item-${index}`}
              item={item}
              index={index}
              isExpanded={!!expandedItems[`${category.id}-item-${index}`]}
              toggleExpand={() => toggleExpand(`${category.id}-item-${index}`)}
              categoryType={category.id || 'default'}
              query={query}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedCategoryContent;
