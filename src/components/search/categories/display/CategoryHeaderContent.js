import React from 'react';

/**
 * Component for displaying category-specific headers
 * @param {Object} props Component props
 * @param {Object} props.category The category to display header for
 * @param {string} props.query The search query
 * @returns {JSX.Element} Rendered category header
 */
const CategoryHeaderContent = ({ category, query }) => {
  // Ensure category is valid
  if (!category) return null;
  
  // Skip for "All Results" category
  if (category.name === 'All Results') return null;
  
  // Get category data with fallbacks
  const categoryId = category.id || '';
  const categoryName = category.name || 'Untitled Category';
  const categoryColor = category.color || '#0066cc';
  
  // Customize header based on category type
  switch (categoryId) {
    case 'market_analysis':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Market Analysis</h3>
          <p style={{ color: '#555' }}>
            Market trends, analysis, and forecasts related to "{query}".
          </p>
        </div>
      );
    case 'financial_data':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Financial Data</h3>
          <p style={{ color: '#555' }}>
            Financial metrics, reports, and performance data for "{query}".
          </p>
        </div>
      );
    case 'company_info':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Company Information</h3>
          <p style={{ color: '#555' }}>
            Company profiles, leadership, and operations for "{query}".
          </p>
        </div>
      );
    case 'industry_trends':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Industry Trends</h3>
          <p style={{ color: '#555' }}>
            Industry-specific trends and developments related to "{query}".
          </p>
        </div>
      );
    case 'investment_strategies':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Investment Strategies</h3>
          <p style={{ color: '#555' }}>
            Investment approaches, strategies, and recommendations for "{query}".
          </p>
        </div>
      );
    case 'economic_indicators':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Economic Indicators</h3>
          <p style={{ color: '#555' }}>
            Macroeconomic data and indicators related to "{query}".
          </p>
        </div>
      );
    case 'regulatory_info':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: categoryColor }}>Regulatory Information</h3>
          <p style={{ color: '#555' }}>
            Regulatory updates, compliance, and legal information for "{query}".
          </p>
        </div>
      );
    case 'business':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: '#0066cc' }}>Business Insights</h3>
          <p style={{ color: '#555' }}>
            Business-focused analysis and insights related to "{query}".
          </p>
        </div>
      );
    case 'technical':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: '#2e7d32' }}>Technical Information</h3>
          <p style={{ color: '#555' }}>
            Technical details, specifications, and implementation insights for "{query}".
          </p>
        </div>
      );
    case 'news':
      return (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, color: '#d32f2f' }}>Latest News</h3>
          <p style={{ color: '#555' }}>
            Recent developments and news articles about "{query}".
          </p>
        </div>
      );
    default:
      // For other categories, use the category name and description
      if (category.name && category.name !== 'All Results') {
        return (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ marginTop: 0, color: categoryColor }}>{category.name}</h3>
            {category.description && (
              <p style={{ color: '#555' }}>
                {category.description} related to "{query}".
              </p>
            )}
          </div>
        );
      }
      return null;
  }
};

export default CategoryHeaderContent;
