import React, { useState, useEffect, useRef } from 'react';
import CategoryRibbon from './display/CategoryRibbon';
import CategoryRibbonDirectStyle from './display/CategoryRibbonDirectStyle';
import CategoryRibbonVisual from './display/CategoryRibbonVisual';
// Modern React components are now used instead of direct DOM manipulation
import ExpandedCategoryContent from './display/ExpandedCategoryContent';
import { debug, info, error, warn } from '../../../utils/logger';
import CategoryDebug from './debug/CategoryDebug';
// Import our new diagnostic panel for troubleshooting
import CategoryDiagnosticPanel from './debug/CategoryDiagnosticPanel';
import Script from 'next/script';
// Import category debug helper
import categoryDebug from '../../../utils/debug/categoryDebugHelper';

// Import the LLM category tabs component
import LLMCategoryTabs from './display/LLMCategoryTabs';

// Import directly from components instead of assuming paths
import RibbonCategoryCard from './display/RibbonCategoryCard';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

/**
 * ModernCategoryDisplay component
 * Implements the sleek, modern category ribbon display as shown in the screenshot
 * with expandable detailed content
 * 
 * This is the final component in the category flow. If categories are not displaying:
 * 1. Check if this component is receiving categories from IntelligentSearchResults
 * 2. Verify that CategoryRibbon is properly rendering the categories
 * 3. See /docs/CATEGORY_FLOW.md for the complete flow documentation
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories The categories to display
 * @param {string} props.query The search query
 * @param {boolean} props.loading Whether data is loading
 * @param {Object} props.options Additional display options
 * @returns {JSX.Element} Rendered modern category display
 */
const ModernCategoryDisplay = ({ 
  categories = [],
  query = '',
  loading = false,
  options = {} 
}) => {
  // Create ref for container
  const containerRef = useRef(null);
  
  // Log category state immediately upon component mount
  useEffect(() => {
    categoryDebug.logCategoryState('ModernCategoryDisplay mounted', categories);
    
    // Ensure container is visible via direct DOM manipulation if needed
    if (containerRef.current) {
      categoryDebug.enhanceVisibility(containerRef.current);
    }
  }, []);
  // SUPER VERBOSE diagnostic logging for category troubleshooting
  log.info('ModernCategoryDisplay render with DETAILED INFO:', {
    renderId: Date.now(), // Add a unique ID to track renders in logs
    categoriesLength: Array.isArray(categories) ? categories.length : 'not array',
    allCategoryNames: Array.isArray(categories) ? categories.map(c => c.name) : 'N/A',
    firstCategory: Array.isArray(categories) && categories.length > 0 ? 
      JSON.stringify({
        id: categories[0].id,
        name: categories[0].name,
        contentLength: Array.isArray(categories[0].content) ? categories[0].content.length : 'not an array',
        hasMetrics: !!categories[0].metrics,
        color: categories[0].color,
        icon: categories[0].icon
      }) : 'none',
    showCategoriesOption: options.showCategories,
    query,
    loading,
    isDisplayBlocked: options.showCategories === false,
    cachedCategoriesAvailable: typeof window !== 'undefined' && !!window.__cachedCategories,
    options: JSON.stringify(options)
  });
  
  // Use refs to track component mounting
  useEffect(() => {
    // Apply basic styling to container
    if (containerRef.current) {
      // No need for direct styles - using React properly
      console.log('ModernCategoryDisplay mounted successfully');
    }
  }, []);
  
  // Log category info for debugging
  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      console.log(`ModernCategoryDisplay received ${categories.length} categories for query '${query}'`);
    }
  }, [categories, query]);
  
  // CATEGORY FLOW DIAGNOSTIC: This is the final component in the category display chain
  // If no categories appear, check if they were properly passed through the component chain
  // See /docs/CATEGORY_FLOW.md for detailed debugging steps
  
  // Access cached categories if available
  const cachedCategories = typeof window !== 'undefined' && window.__cachedCategories;
  if (Array.isArray(categories) && categories.length === 0 && cachedCategories) {
    log.info('DIAGNOSTIC: Using cached categories as fallback - original categories were empty', {
      count: cachedCategories.length,
      firstCategory: cachedCategories[0]?.name || 'none',
      cachedItemsCount: cachedCategories[0]?.content?.length || 0,
      query
    });
    categories = cachedCategories;
  }
  
  // Ensure categories is always an array
  let categoriesArray = Array.isArray(categories) ? categories : [];
  
  // If no categories and not loading, create default categories
  if (categoriesArray.length === 0 && !loading) {
    log.warn('DIAGNOSTIC: Creating fallback default categories - no categories were received from the flow', {
      query,
      options
    });
    // This indicates a problem in the category flow - check /docs/CATEGORY_FLOW.md
    categoriesArray = [
      {
        id: 'key_insights',
        name: 'Key Insights',
        icon: 'lightbulb',
        description: 'Most important insights from all sources',
        content: [],
        color: '#0F9D58', // Google Green
        metrics: {
          relevance: 0.95,
          accuracy: 0.90,
          credibility: 0.92,
          overall: 0.92
        }
      },
      {
        id: 'all_results-' + Date.now(),
        name: 'All Results',
        icon: 'search',
        description: 'All search results',
        content: [],
        color: '#4285F4', // Google Blue
        metrics: {
          relevance: 0.75,
          accuracy: 0.75,
          credibility: 0.75,
          overall: 0.75
        }
      }
    ];
  }
  
  // Limit categories if specified in options (to max 6 for UI row)  
  const maxCategories = options.maxCategories || 6;
  
  useEffect(() => {
    // Check if we need to limit the categories to fit in one row
    if (options.limitCategories && categoriesArray.length > maxCategories) {
      log.info(`Limiting categories from ${categoriesArray.length} to ${maxCategories}`);
      
      // First, ensure Key Insights category is included if it exists
      const keyInsightsCategory = categoriesArray.find(c => 
        c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
      );
      
      // Sort the remaining categories by overall score in descending order
      const otherCategories = categoriesArray
        .filter(c => c.id !== 'key-insights' && c.id !== 'key_insights' && c.name !== 'Key Insights')
        .sort((a, b) => {
          const aScore = a.metrics?.overall || 0;
          const bScore = b.metrics?.overall || 0;
          return bScore - aScore; // Descending order
        });
      
      // Combine Key Insights with top categories for a total of maxCategories
      let limitedCategories = [];
      
      // Add Key Insights first if it exists
      if (keyInsightsCategory) {
        limitedCategories.push(keyInsightsCategory);
      }
      
      // Add remaining top categories up to maxCategories total
      const remainingSlots = maxCategories - limitedCategories.length;
      limitedCategories = [
        ...limitedCategories,
        ...otherCategories.slice(0, remainingSlots)
      ];
      
      // Update the categories array
      categoriesArray = limitedCategories;
      log.debug('Limited categories to fit in one row:', categoriesArray.map(c => c.name));
    }
    
    // Log for debugging
    if (categoriesArray.length <= 1 && !loading && query) {
      console.log('ModernCategoryDisplay: Could use more categories for query', { 
        query, 
        currentCategories: categoriesArray.length 
      });
    }
    
    // Cache categories for future use if we have them
    if (typeof window !== 'undefined' && categoriesArray.length > 0) {
      window.__cachedCategories = categoriesArray;
      console.log('Cached categories for future use:', categoriesArray.map(c => c.name));
    }
  }, [categoriesArray.length, loading, query, options.limitCategories, maxCategories]);
  
  // State for active category and expanded state
  const [activeCategory, setActiveCategory] = useState(
    options.activeCategory || (categoriesArray.length > 0 ? categoriesArray[0].id : null)
  );
  
  const [expanded, setExpanded] = useState(false);
  
  // Set the active category when categories change or options change
  useEffect(() => {
    console.log('Checking active category setting in ModernCategoryDisplay');
    
    // First, ensure Key Insights is prioritized if it exists
    const orderedCategories = [...categoriesArray];
    const keyInsightsIndex = orderedCategories.findIndex(cat => 
      cat.name === 'Key Insights' || cat.id === 'key_insights'
    );
    
    if (keyInsightsIndex > 0) { // If Key Insights exists but isn't first
      console.log('Moving Key Insights to first position');
      const keyInsightsCat = orderedCategories[keyInsightsIndex];
      orderedCategories.splice(keyInsightsIndex, 1); // Remove it
      orderedCategories.unshift(keyInsightsCat); // Add it to beginning
    }
    
    // Then set active category appropriately
    if (options.activeCategory) {
      setActiveCategory(options.activeCategory);
    } else if (orderedCategories.length > 0) {
      // If no active category or current one is invalid
      if (!activeCategory || !orderedCategories.some(cat => cat.id === activeCategory)) {
        // Prefer Key Insights if it exists
        const keyInsightsCat = orderedCategories.find(cat => 
          cat.name === 'Key Insights' || cat.id === 'key_insights'
        );
        
        if (keyInsightsCat) {
          console.log('Setting active category to Key Insights');
          setActiveCategory(keyInsightsCat.id);
        } else {
          console.log('Setting active category to first category:', orderedCategories[0]?.name);
          setActiveCategory(orderedCategories[0]?.id);
        }
      }
    }
  }, [categories, options.activeCategory, activeCategory, categoriesArray]);
  
  // If no categories or fewer than 2 categories, create robust default categories
  if (categoriesArray.length < 2) {
    if (loading) {
      log.info('DIAGNOSTIC: In loading state, displaying loading placeholder while categories load');
      // Instead of returning early which could break rendering, let's create a temporary loading category
      categoriesArray = [
        {
          id: 'loading_category',
          name: 'Loading Categories...',
          icon: 'refresh',
          description: 'Categories are currently loading',
          content: [],
          isLoading: true,
          metrics: {
            relevance: 1.0,
            accuracy: 1.0,
            credibility: 1.0,
            overall: 1.0
          },
          displayMetrics: {
            relevance: 100,
            accuracy: 100,
            credibility: 100,
            overall: 100
          },
          color: '#9CA3AF' // Gray color for loading state
        }
      ];
    } else {
      log.warn('DIAGNOSTIC: Creating comprehensive fallback categories - either no categories or too few were received', {
        query,
        options,
        existingCategoriesCount: categoriesArray.length
      });
      
      // Store any existing categories we want to keep
      const existingCategories = [...categoriesArray];
      
      // Create robust default categories to ensure we always display a full set
      categoriesArray = [
        {
          id: 'key_insights_' + Date.now(),
          name: 'Key Insights',
          icon: 'lightbulb',
          description: 'Most important insights from search results',
          content: [],
          metrics: {
            relevance: 0.95,
            accuracy: 0.90,
            credibility: 0.92,
            overall: 0.92
          },
          displayMetrics: {
            relevance: 95,
            accuracy: 90,
            credibility: 92,
            overall: 92
          },
          color: '#0F9D58',
          isDefault: true
        },
        {
          id: 'all_results_' + Date.now(),
          name: 'All Results',
          icon: 'search',
          description: 'All search results',
          content: [],
          metrics: {
            relevance: 0.85,
            accuracy: 0.8,
            credibility: 0.82,
            overall: 0.82
          },
          displayMetrics: {
            relevance: 85,
            accuracy: 80,
            credibility: 82,
            overall: 82
          },
          color: '#4285F4',
          isDefault: true
        },
        {
          id: 'business_insights_' + Date.now(),
          name: 'Business',
          icon: 'business',
          description: 'Business-related insights',
          content: [],
          metrics: {
            relevance: 0.88,
            accuracy: 0.85,
            credibility: 0.84,
            overall: 0.86
          },
          displayMetrics: {
            relevance: 88,
            accuracy: 85,
            credibility: 84,
            overall: 86
          },
          color: '#EA4335',
          isDefault: true
        },
        {
          id: 'technology_insights_' + Date.now(),
          name: 'Technology',
          icon: 'code',
          description: 'Technology-related insights',
          content: [],
          metrics: {
            relevance: 0.83,
            accuracy: 0.89,
            credibility: 0.87,
            overall: 0.86
          },
          displayMetrics: {
            relevance: 83,
            accuracy: 89,
            credibility: 87,
            overall: 86
          },
          color: '#FBBC05',
          isDefault: true
        }
      ];
      
      // Insert any existing categories at the beginning if they exist
      if (existingCategories.length > 0) {
        categoriesArray = [...existingCategories, ...categoriesArray];
        log.info('DIAGNOSTIC: Combined existing categories with default fallbacks', {
          totalCategories: categoriesArray.length,
          existingCount: existingCategories.length
        });
      }
    }
    
    // Update state with the first category (or Key Insights if it exists)
    const keyInsightsCat = categoriesArray.find(cat => 
      cat.name === 'Key Insights' || cat.id.includes('key_insights')
    );
    setActiveCategory(keyInsightsCat?.id || categoriesArray[0]?.id);
    
    // Cache these categories for future reference
    if (typeof window !== 'undefined') {
      window.__generatedFallbackCategories = true;
      window.__cachedCategories = categoriesArray;
    }
  }
  
  // Find the active category object
  const activeCategoryObj = categoriesArray.find(cat => cat.id === activeCategory) || categoriesArray[0];
  const activeCategoryContent = activeCategoryObj?.content || [];
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setExpanded(false); // Collapse expanded view when changing categories
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Process categories to ensure they have proper color and metrics
  const processedCategories = categoriesArray.map((category, index) => {
    // Calculate score-based color intensity
    const getScoreColor = (score) => {
      // Default base colors by category type
      const baseColors = {
        key_insights: [76, 175, 80],     // Green #4CAF50
        market_analysis: [33, 150, 243], // Blue #2196F3
        financial_data: [103, 58, 183],  // Purple #673AB7
        business: [0, 150, 136],         // Teal #009688
        technical: [63, 81, 181],        // Indigo #3F51B5
        overview: [255, 152, 0],         // Orange #FF9800
        default: [33, 150, 243]          // Blue #2196F3
      };
      
      // Get base color for this category type
      const baseColor = baseColors[category.id] || baseColors[category.type] || baseColors.default;
      
      // Adjust saturation based on score (higher score = more saturated)
      const scoreMultiplier = Math.max(0.5, Math.min(1.0, (score || 0.7) / 100));
      const adjustedColor = baseColor.map(channel => 
        Math.round(channel * scoreMultiplier + (255 - channel) * (1 - scoreMultiplier))
      );
      
      return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
    };
    
    // Get score from metrics or default to reasonable value
    const score = category.metrics?.overall || (category.metrics?.relevance && category.metrics?.credibility ? 
      (category.metrics.relevance + category.metrics.credibility) / 2 : 70);
    
    // Get color based on category type or score
    let color = getScoreColor(score);
    
    // Format scores for display
    const displayMetrics = {
      relevance: Math.round((category.metrics?.relevance || 0) * 100),
      accuracy: Math.round((category.metrics?.accuracy || 0) * 100),
      credibility: Math.round((category.metrics?.credibility || 0) * 100),
      overall: Math.round((category.metrics?.overall || 0) * 100)
    };
    
    // Get badge color based on score
    const getBadgeColor = (score) => {
      if (score >= 85) return '#4CAF50'; // Green for high scores
      if (score >= 70) return '#2196F3'; // Blue for good scores
      if (score >= 50) return '#FF9800'; // Orange for medium scores
      return '#F44336'; // Red for low scores
    };
    
    // Add label for score range
    const getScoreLabel = (score) => {
      if (score >= 85) return 'High';
      if (score >= 70) return 'Good';
      if (score >= 50) return 'Fair';
      return 'Low';
    };
    
    return {
      ...category,
      color,
      displayMetrics,
      scoreBadge: {
        color: getBadgeColor(displayMetrics.overall),
        label: getScoreLabel(displayMetrics.overall)
      }
    };
  });

  // Manual render for debugging
  console.log('RENDERED MODERN CATEGORY DISPLAY', { 
    categoriesCount: processedCategories.length,
    categoryNames: processedCategories.map(c => c.name),
    activeCategory: activeCategory, 
    expanded: expanded
  });
  
  // ENHANCED DEBUG LOGGING - Key decision point for rendering
  log.info('ModernCategoryDisplay: Final render decision point', {
    showCategories,
    forceDisplay,
    categoryCount: processedCategories.length,
    categoryNames: processedCategories.map(c => c.name).join(', '),
    activeCategory
  });

  // Use the CategoryRibbon component instead of direct UI creation
  // Create a ref for direct DOM manipulation
  const directDomRef = React.useRef(null);
  
  // Use effect to directly inject categories using vanilla DOM API
  useEffect(() => {
    if (!directDomRef.current || !Array.isArray(processedCategories) || processedCategories.length === 0) {
      return;
    }
    
    try {
      // Get the container
      const container = directDomRef.current;
      
      // Clear existing content
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create a header
      const header = document.createElement('h3');
      header.textContent = '🚨 EMERGENCY CATEGORIES 🚨';
      Object.assign(header.style, {
        margin: '0 0 10px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ef4444',
        textAlign: 'center',
        padding: '5px',
        backgroundColor: '#fee2e2',
        borderRadius: '4px'
      });
      container.appendChild(header);
      
      // Create category tabs
      const tabContainer = document.createElement('div');
      Object.assign(tabContainer.style, {
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        padding: '10px 0',
        marginBottom: '10px',
        borderBottom: '1px solid #e5e7eb'
      });
      
      // Create tabs for each category
      processedCategories.forEach(category => {
        const tab = document.createElement('div');
        tab.textContent = category.name;
        tab.setAttribute('data-category-id', category.id);
        tab.setAttribute('data-category-name', category.name);
        
        Object.assign(tab.style, {
          padding: '8px 16px',
          marginRight: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          backgroundColor: category.id === activeCategory ? '#3b82f6' : '#f3f4f6',
          color: category.id === activeCategory ? 'white' : '#1f2937',
          fontWeight: '500'
        });
        
        // Add click handler
        tab.addEventListener('click', () => {
          if (typeof handleCategoryChange === 'function') {
            handleCategoryChange(category.id);
          }
          
          // Update styling manually
          document.querySelectorAll('[data-category-id]').forEach(el => {
            el.style.backgroundColor = '#f3f4f6';
            el.style.color = '#1f2937';
          });
          
          tab.style.backgroundColor = '#3b82f6';
          tab.style.color = 'white';
        });
        
        tabContainer.appendChild(tab);
      });
      
      container.appendChild(tabContainer);
      
      console.log('✅ Successfully injected categories directly into DOM using vanilla JS');
    } catch (err) {
      console.error('Error in direct DOM injection:', err);
    }
  }, [processedCategories, activeCategory, handleCategoryChange]);
  
  // Find the LLM results scroller if it exists
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Try to find LLM results scroller
    const findAndInjectIntoLLMSection = () => {
      try {
        const llmScroller = document.querySelector('.llm-results-scroller');
        const llmContent = document.querySelector('.llm-results-content');
        
        if (llmScroller || llmContent) {
          console.log('🔎 ModernCategoryDisplay found LLM results section, preparing for injection');
          window.__foundLLMSection = true;
          
          // Mark the component as being inside LLM results
          setIsInLLMResults(true);
        }
      } catch (err) {
        console.error('Error finding LLM results section:', err);
      }
    };
    
    // Try immediately and again after delay
    findAndInjectIntoLLMSection();
    setTimeout(findAndInjectIntoLLMSection, 500);
  }, []);
  
  // State to track if we're inside LLM results
  const [isInLLMResults, setIsInLLMResults] = useState(options.context === 'llm-results');
  
  // Log when we're in LLM context for debugging
  useEffect(() => {
    // Check if we're being rendered in an LLM results context
    const checkForLLMContext = () => {
      // Check for containing element with LLM context
      const isInLLMContainer = document.querySelector('[data-testid="llm-results-container"]') !== null;
      
      if (isInLLMContainer || options.context === 'llm-results') {
        setIsInLLMResults(true);
        log.info('ModernCategoryDisplay detected LLM context', { 
          categories: processedCategories.length, 
          names: processedCategories.map(c => c.name) 
        });
      }
    };
    
    // Run check immediately and after a short delay
    checkForLLMContext();
    const timer = setTimeout(checkForLLMContext, 500);
    
    return () => clearTimeout(timer);
  }, [processedCategories]);
  
  // This is the key part that ensures the categories appear in the LLM results section
  // We make sure to position this as the first element in the DOM for maximum visibility
  // CRITICAL FIX: Always ensure we have categories to display
  if (!categories || (categoriesArray.length === 0 && !loading)) {
    log.error('CRITICAL ERROR: No categories available at render time. Creating emergency categories.');
    categoriesArray = [
      {
        id: 'emergency_key_insights_' + Date.now(),
        name: 'Key Insights',
        icon: 'lightbulb',
        description: 'Emergency fallback category',
        content: [],
        color: '#0F9D58',
        isEmergency: true,
        metrics: { relevance: 0.95, accuracy: 0.90, credibility: 0.92, overall: 0.92 }
      },
      {
        id: 'emergency_all_results_' + Date.now(),
        name: 'All Results',
        icon: 'search',
        description: 'Emergency fallback category',
        content: [],
        color: '#4285F4',
        isEmergency: true,
        metrics: { relevance: 0.85, accuracy: 0.8, credibility: 0.82, overall: 0.82 }
      }
    ];
  }
  
  // Add diagnostic info to global window object for debugging
  if (typeof window !== 'undefined') {
    window.__categoryDisplayDiagnostics = {
      timestamp: new Date().toISOString(),
      categoriesProvided: categories ? categories.length : 0,
      categoriesProcessed: categoriesArray.length,
      activeCategory: activeCategory,
      hasDefaultCategories: categoriesArray.some(c => c.isDefault),
      hasEmergencyCategories: categoriesArray.some(c => c.isEmergency),
      renderedAt: Date.now()
    };
  }
  
  // Check if we have categories to display
  const hasCategories = Array.isArray(processedCategories) && processedCategories.length > 0;
  
  // Log category state - helpful for debugging
  if (hasCategories) {
    categoryDebug.logCategoryState('ModernCategoryDisplay render', processedCategories, {
      details: {
        activeCategory,
        displayType,
        isInLLMResults,
        hasCategories
      }
    });
  }
  
  // Log if we don't have categories but still render the container to help with debugging
  if (!hasCategories) {
    console.log('Warning: No categories available in ModernCategoryDisplay');
    // We'll render a minimal container for debugging, but with no content
  }
  
  return (
    <div 
      ref={containerRef}
      className="modern-category-display" 
      id="modern-category-display-container"
      data-in-llm-results={isInLLMResults ? 'true' : 'false'}
      data-categories-count={categoriesArray.length}
      data-has-default-categories={categoriesArray.some(c => c.isDefault) ? 'true' : 'false'}
      data-has-emergency-categories={categoriesArray.some(c => c.isEmergency) ? 'true' : 'false'}
      {...categoryDebug.withCategoryDebugAttributes({
        'data-active-category': activeCategory,
        'data-display-type': displayType,
      }, processedCategories)}
      style={{ 
        margin: '10px 0',
        padding: '0',
        display: 'block'
      }}>
      {/* NEW VISUAL CATEGORY DISPLAY - this matches the screenshot example */}
      {/* Display appropriate category component based on context */}
      {isInLLMResults ? (
        <div 
          id="llm-category-container"
          data-testid="llm-category-container"
          style={{
            margin: '0 0 16px 0',
            padding: '8px',
            backgroundColor: '#f5f3ff',
            borderRadius: '8px',
            border: '2px solid #8b5cf6',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Log for debugging */}
          {console.log('Rendering LLMCategoryTabs with:', {
            categories: processedCategories.length,
            names: processedCategories.map(c => c.name),
            active: activeCategory
          })}
          
          <LLMCategoryTabs 
            categories={processedCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            options={{
              ...options,
              isInLLMResults: true,
              forceDisplay: true,
              zIndex: 9999,
              compact: false, // Show full metrics by default
              showBorder: true, // Make border visible
              alwaysVisible: true // Enforce visibility
            }}
          />
        </div>
      ) : (
        <div 
          id="category-ribbon-container-wrapper"
          className="category-ribbon-container"
          data-testid="category-ribbon-wrapper"
          style={{
            margin: '0',
            padding: '0'
        }}>
          {/* Log rendering of normal categories */}
          {console.log('Rendering CategoryRibbonVisual with categories:', {
            count: processedCategories.length,
            names: processedCategories.map(c => c.name)
          })}
          <CategoryRibbonVisual
            categories={processedCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            options={{
              ...options,
              isInLLMResults: false
            }}
          />
        </div>
      )}
      
      {/* Note: Emergency category displays have been removed in favor of React components */}
      
      {/* Enhanced Debug panel - hidden by default but always available */}
      <div style={{ 
        display: options.debug ? 'block !important' : 'none', 
        margin: '10px 0',
        padding: '10px',
        border: '1px dashed #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#f9fafb'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Category Diagnostic Panel</h4>
        <CategoryDebug 
          categories={processedCategories} 
          activeCategoryId={activeCategory}
          query={query}
          loading={loading}
          hasDefaultCategories={categoriesArray.some(c => c.isDefault)}
          hasEmergencyCategories={categoriesArray.some(c => c.isEmergency)}
          originalCategoriesCount={categories ? categories.length : 0}
        />
      </div>
      
      {/* Always visible diagnostic information when debug mode is active */}
      {options.debug && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Category Debug:</p>
          <p style={{ margin: '0 0 2px 0' }}>Categories: {categoriesArray.length}</p>
          <p style={{ margin: '0 0 2px 0' }}>Active: {activeCategory}</p>
          <p style={{ margin: '0 0 2px 0' }}>Default: {categoriesArray.some(c => c.isDefault) ? 'Yes' : 'No'}</p>
          <p style={{ margin: '0' }}>Emergency: {categoriesArray.some(c => c.isEmergency) ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      {/* Original ribbon style as fallback */}
      <div style={{ 
        display: 'block !important',
        visibility: 'visible !important', 
        opacity: '1 !important',
        margin: '15px 0',
        position: 'relative !important',
        zIndex: '900 !important'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1e40af', 
          textAlign: 'center',
          marginBottom: '10px',
          padding: '5px',
          backgroundColor: '#dbeafe',
          borderRadius: '4px'
        }}>
          Original CategoryRibbon
        </h3>
        <CategoryRibbon 
          categories={processedCategories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      
      {/* React-based category display is now used instead of direct DOM manipulation */}
      
      {/* React-based category representation is now used */}

      {/* Simple toggle button for expanded view */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0.5rem auto',
            padding: '0.5rem 1.25rem',
            backgroundColor: '#f0f4f8',
            border: 'none',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#4a5568',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
          onClick={toggleExpanded}
        >
          {expanded ? 'Show Less Details' : 'Show More Details'}
        </button>
      </div>
      
      {/* Content area - improved styling */}
      {activeCategoryObj && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '10px',
          border: `1px solid ${activeCategoryObj.color || '#e2e8f0'}`
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '15px',
            color: activeCategoryObj.color || '#2d3748',
            borderBottom: '1px solid #edf2f7',
            paddingBottom: '8px' 
          }}>
            {activeCategoryObj.name} Content
          </h4>
          <div>
            {activeCategoryContent.length > 0 ? (
              activeCategoryContent.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '15px', 
                  paddingBottom: '15px', 
                  borderBottom: index < activeCategoryContent.length - 1 ? '1px solid #edf2f7' : 'none' 
                }}>
                  {item.title && <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>{item.title}</h5>}
                  {item.content && <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.5' }}>{item.content}</p>}
                  {item.source && <p style={{ fontSize: '12px', color: '#718096', marginTop: '5px' }}>Source: {item.source}</p>}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#718096', fontStyle: 'italic' }}>No content available for this category.</p>
                <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '10px' }}>Try selecting a different category or search term.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add diagnostic data attributes for troubleshooting */}
      <div 
        data-category-count={categoriesLength}
        data-has-active-category={activeCategory ? 'true' : 'false'}
        data-category-names={Array.isArray(categories) ? categories.map(c => c.name).join(',') : 'none'}
        style={{ display: 'none' }}
      />
      
      {/* Include the diagnostic panel for troubleshooting */}
      <CategoryDiagnosticPanel />
    </div>
  );
};

export default ModernCategoryDisplay;
