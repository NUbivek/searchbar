import React from 'react';

/**
 * Component for displaying business insights extracted from search results
 * @param {Object} props Component props
 * @param {Array} props.insights Array of business insights
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered business insights
 */
const BusinessInsightsDisplay = ({ insights, options = {} }) => {
  // Don't render if no insights
  if (!insights || !Array.isArray(insights) || insights.length === 0) {
    return null;
  }

  // Categorize insights if possible
  const categorizedInsights = {};
  const uncategorizedInsights = [];

  // Categories to look for in insights
  const categories = {
    market: ['market', 'industry', 'sector', 'trend', 'growth'],
    financial: ['revenue', 'profit', 'financial', 'earnings', 'margin', 'cost'],
    strategy: ['strategy', 'plan', 'goal', 'objective', 'initiative'],
    competitive: ['competitor', 'competition', 'advantage', 'position', 'market share'],
    risk: ['risk', 'challenge', 'threat', 'uncertainty', 'issue']
  };

  // Attempt to categorize each insight
  insights.forEach(insight => {
    if (!insight || typeof insight !== 'string') return;
    
    const lowerInsight = insight.toLowerCase();
    let categorized = false;
    
    // Check each category for matching terms
    Object.entries(categories).forEach(([category, terms]) => {
      if (categorized) return;
      
      // Check if insight contains any of the category terms
      const hasMatch = terms.some(term => lowerInsight.includes(term));
      
      if (hasMatch) {
        // Initialize category array if needed
        if (!categorizedInsights[category]) {
          categorizedInsights[category] = [];
        }
        
        // Add insight to category
        categorizedInsights[category].push(insight);
        categorized = true;
      }
    });
    
    // If not categorized, add to uncategorized list
    if (!categorized) {
      uncategorizedInsights.push(insight);
    }
  });

  // Helper to render a category of insights
  const renderCategory = (title, insightsList, color) => {
    if (!insightsList || insightsList.length === 0) return null;
    
    return (
      <div className="business-insights-category" style={{ marginBottom: '12px' }}>
        <h5 style={{ 
          fontSize: '14px', 
          margin: '0 0 6px 0', 
          color: color || '#1976d2',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: color || '#1976d2',
            marginRight: '8px'
          }}></span>
          {title}
        </h5>
        <ul style={{ 
          margin: '0', 
          paddingLeft: '16px',
          fontSize: '13px',
          color: '#333'
        }}>
          {insightsList.map((insight, index) => (
            <li key={`${title}-insight-${index}`} style={{ marginBottom: '4px' }}>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Determine if we should use categorized view
  const hasCategorizedInsights = Object.keys(categorizedInsights).length > 0;
  const useCategories = hasCategorizedInsights && options.useCategorizedInsights !== false;

  return (
    <div className="business-insights" style={{ 
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: '#f5f9ff',
      borderRadius: '8px',
      borderLeft: '4px solid #1976d2',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <h4 style={{ 
        marginTop: 0, 
        marginBottom: '12px', 
        color: '#1976d2',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
        Business Insights
      </h4>
      
      {useCategories ? (
        <div className="categorized-insights">
          {renderCategory('Market & Industry', categorizedInsights.market, '#2196F3')}
          {renderCategory('Financial Performance', categorizedInsights.financial, '#4CAF50')}
          {renderCategory('Business Strategy', categorizedInsights.strategy, '#9C27B0')}
          {renderCategory('Competitive Landscape', categorizedInsights.competitive, '#FF9800')}
          {renderCategory('Risks & Challenges', categorizedInsights.risk, '#F44336')}
          {renderCategory('Other Insights', uncategorizedInsights, '#607D8B')}
        </div>
      ) : (
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          color: '#333'
        }}>
          {insights.map((insight, index) => (
            <li key={`insight-${index}`} style={{ marginBottom: '6px' }}>
              {insight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusinessInsightsDisplay;
