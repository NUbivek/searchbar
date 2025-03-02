import React from 'react';
import { extractCategoryInsights, categorizeBusinessInsights } from '../utils/categoryInsights';

/**
 * Component for displaying a summary of category content
 * @param {Object} props Component props
 * @param {Object} props.category The category to display summary for
 * @param {string} props.query The search query
 * @returns {JSX.Element} Rendered category summary
 */
const CategorySummaryDisplay = ({ category, query }) => {
  if (!category) return null;
  
  // Extract insights from category
  const insights = extractCategoryInsights(category, query);
  
  // Skip if no insights
  if (!insights || insights.length === 0) return null;
  
  // Determine if this is a business category
  const isBusinessCategory = 
    category.id === 'business' || 
    category.id === 'market_analysis' || 
    category.id === 'financial_data' || 
    category.id === 'company_info' ||
    category.id === 'industry_trends' ||
    category.id === 'investment_strategies' ||
    category.id === 'economic_indicators';
  
  // For business categories, categorize insights
  if (isBusinessCategory) {
    const categorizedInsights = categorizeBusinessInsights(insights);
    
    return (
      <div className="category-summary" style={{ marginBottom: '20px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#333' }}>
          Key Insights
        </h4>
        
        {/* Market Insights */}
        {categorizedInsights.market.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#0066cc' }}>
              Market Insights
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.market.map((insight, index) => (
                <li key={`market-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Financial Insights */}
        {categorizedInsights.financial.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#2e7d32' }}>
              Financial Insights
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.financial.map((insight, index) => (
                <li key={`financial-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Strategy Insights */}
        {categorizedInsights.strategy.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#9c27b0' }}>
              Strategy Insights
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.strategy.map((insight, index) => (
                <li key={`strategy-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Competitive Insights */}
        {categorizedInsights.competitive.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#ed6c02' }}>
              Competitive Insights
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.competitive.map((insight, index) => (
                <li key={`competitive-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Risk Insights */}
        {categorizedInsights.risk.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#d32f2f' }}>
              Risk Factors
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.risk.map((insight, index) => (
                <li key={`risk-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Uncategorized Insights */}
        {categorizedInsights.uncategorized.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
              Additional Insights
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {categorizedInsights.uncategorized.map((insight, index) => (
                <li key={`uncategorized-${index}`} style={{ marginBottom: '5px', color: '#555' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // For non-business categories, display simple list
  return (
    <div className="category-summary" style={{ marginBottom: '20px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#333' }}>
        Key Insights
      </h4>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {insights.map((insight, index) => (
          <li key={index} style={{ marginBottom: '5px', color: '#555' }}>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySummaryDisplay;
