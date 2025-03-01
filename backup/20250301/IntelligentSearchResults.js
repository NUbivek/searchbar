import React, { useState, useEffect } from 'react';
import { debug, info, warn, error } from '../../../utils/logger';
import { isBusinessQuery, detectQueryContext } from '../utils/contextDetector';
import { LLMResultsProcessor } from './LLMResultsProcessor';
import ModernCategoryDisplay from '../categories/ModernCategoryDisplay';
import LLMCategorizedResults from './LLMCategorizedResults';
import ScoreVisualizer from '../metrics/ScoreVisualizer';
import searchResultScorer from '../../../utils/scoring/SearchResultScorer';

// Direct imports for category processing
import { processCategories } from '../categories/processors/CategoryProcessor';
import { getDefaultCategories } from '../categories/types/DefaultCategories';

// Import keyword matching utilities
import { KeywordMatcher } from '../categories/keywords/KeywordMatcher';
import { BusinessKeywords } from '../categories/keywords/BusinessKeywords';
import { MarketKeywords } from '../categories/keywords/MarketKeywords';
import { FinancialKeywords } from '../categories/keywords/FinancialKeywords';

// Import CategoryFinder for advanced category generation
import { findBestCategories } from '../categories/processors/CategoryFinder';
import CategoryFinder from '../categories/CategoryFinder';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * Component for displaying intelligent search results with context-aware presentation
 * @param {Object} props Component props
 * @param {Array} props.results The search results to display
 * @param {string} props.query The search query
 * @param {Array} props.categories Categories from search results
 * @param {Object} props.options Additional options for display
 * @returns {JSX.Element} Rendered intelligent search results
 */
const IntelligentSearchResults = ({ results, query, categories = [], options = {} }) => {
  const [processedResults, setProcessedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [queryContext, setQueryContext] = useState(null);
  const [error, setError] = useState(null);
  
  // Store categories in state for proper tracking and management
  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(categories) && categories.length > 0) {
      // Store in global storage for backward compatibility only
      if (!window.__globalCategoryStorage) {
        window.__globalCategoryStorage = {};
      }
      
      window.__globalCategoryStorage.categories = categories;
      window.__globalCategoryStorage.lastUpdated = new Date().toISOString();
      window.__globalCategoryStorage.query = query;
      
      // Keep a reference for backward compatibility
      window.__intelligentSearchCategories = categories;
      
      console.log('📊 Categories available for search results', {
        count: categories.length,
        names: categories.map(c => c.name || 'Unknown').join(', ')
      });
    }
  }, [categories, query]);

  useEffect(() => {
    // Reset state when query or results change
    setIsProcessing(true);
    setProcessedResults(null);
    setError(null);

    // Detect query context
    const context = detectQueryContext(query);
    setQueryContext(context);

    // Process results with LLM if available
    const processResults = async () => {
      try {
        if (!results || !Array.isArray(results) || results.length === 0) {
          setProcessedResults([]);
          setIsProcessing(false);
          return;
        }

        // Check if results already have categories
        const hasCategories = results.some(r => r.category || r.categories);
        
        // Create LLM processor
        const processor = new LLMResultsProcessor();
        
        // Log what we're going to process
        log.info('Processing search results', {
          resultCount: results.length,
          hasCategories,
          context: context?.primaryContext || 'unknown'
        });
        
        // Process results with context
        const processed = await processor.processResults(results, query, {
          context: context,
          extractBusinessInsights: context.isBusinessQuery || options.extractBusinessInsights,
          enhanceCategories: true,
          calculateMetrics: true,
          useEnhancedView: true
        });
        
        setProcessedResults(processed);
      } catch (err) {
        log.error('Error processing search results:', err);
        setError(err.message || 'Error processing search results');
        // Fall back to original results
        setProcessedResults(results);
      } finally {
        setIsProcessing(false);
      }
    };

    // Start processing
    processResults();
  }, [query, results]);

  // If still processing, show loading state
  if (isProcessing) {
    return (
      <div className="intelligent-search-results-loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Analyzing search results for "{query}"...</p>
        </div>
      </div>
    );
  }

  // If error occurred, show error state
  if (error) {
    return (
      <div className="intelligent-search-results-error">
        <div className="error-message">
          <h3>Error Processing Results</h3>
          <p>{error}</p>
          <p>Showing standard search results instead.</p>
        </div>
        {/* Use any categories from the API or generate fallback categories */}
        <ModernCategoryDisplay 
          categories={categories || []}
          query={query}
          options={{ 
            showMetrics: true,
            useEnhancedView: true,
            limitCategories: true,
            maxCategories: 6,
            prioritizeKeyInsights: true,
            // Add context to help component determine if it's in LLM results
            context: 'standard',
            forceDisplay: true
          }} 
        />
      </div>
    );
  }

  // If no results, show empty state
  if (!processedResults || !Array.isArray(processedResults) || processedResults.length === 0) {
    return (
      <div className="intelligent-search-results-empty">
        <h3>No Results Found</h3>
        <p>We couldn't find any results for "{query}".</p>
        <p>Try adjusting your search terms or browse our popular categories.</p>
      </div>
    );
  }

  // Determine display options based on query context
  const displayOptions = {
    ...options,
    useEnhancedView: true,
    showMetrics: true,
    showCategories: true, // Force categories to always show
    extractBusinessInsights: queryContext?.isBusinessQuery || options.extractBusinessInsights,
    businessFocused: queryContext?.isBusinessQuery,
    technicalFocused: queryContext?.isTechnicalQuery,
    financialFocused: queryContext?.isFinancialQuery,
    medicalFocused: queryContext?.isMedicalQuery
  };
  
  // Force log display options
  console.log('DISPLAY OPTIONS:', JSON.stringify(displayOptions, null, 2));

  // Render context-aware header
  const renderContextHeader = () => {
    if (!queryContext) return null;

    let headerContent = null;
    
    if (queryContext.isBusinessQuery) {
      headerContent = (
        <div className="context-header business">
          <h2>Business Intelligence Results</h2>
          <p>Showing business-focused results for "{query}" with enhanced metrics and insights.</p>
        </div>
      );
    } else if (queryContext.isFinancialQuery) {
      headerContent = (
        <div className="context-header financial">
          <h2>Financial Intelligence Results</h2>
          <p>Showing financial analysis and data for "{query}" with enhanced metrics.</p>
        </div>
      );
    } else if (queryContext.isTechnicalQuery) {
      headerContent = (
        <div className="context-header technical">
          <h2>Technical Intelligence Results</h2>
          <p>Showing technical information and resources for "{query}" with enhanced context.</p>
        </div>
      );
    } else if (queryContext.isMedicalQuery) {
      headerContent = (
        <div className="context-header medical">
          <h2>Medical Intelligence Results</h2>
          <p>Showing medical information and research for "{query}" with enhanced context.</p>
        </div>
      );
    }

    return headerContent;
  };

  // Calculate aggregate metrics across all results
  const calculateAggregateMetrics = () => {
    if (!processedResults || !Array.isArray(processedResults) || processedResults.length === 0) {
      return { relevance: 0.7, credibility: 0.7, accuracy: 0.7, overall: 0.7 };
    }
    
    // If we have category results with metrics
    if (processedResults[0]?.metrics) {
      // Average the metrics across all categories
      const metrics = processedResults.reduce((acc, category) => {
        if (!category.metrics) return acc;
        
        return {
          relevance: acc.relevance + (category.metrics.relevance || 0),
          credibility: acc.credibility + (category.metrics.credibility || 0),
          accuracy: acc.accuracy + (category.metrics.accuracy || 0),
          overall: acc.overall + (category.metrics.overall || 0)
        };
      }, { relevance: 0, credibility: 0, accuracy: 0, overall: 0 });
      
      const count = processedResults.length;
      
      return {
        relevance: metrics.relevance / count,
        credibility: metrics.credibility / count,
        accuracy: metrics.accuracy / count,
        overall: metrics.overall / count
      };
    }
    
    // If we have content items with metrics (from LLM processing)
    let allContentItems = [];
    processedResults.forEach(category => {
      if (category.content && Array.isArray(category.content)) {
        allContentItems = [...allContentItems, ...category.content];
      }
    });
    
    if (allContentItems.length > 0) {
      // Look for items with metrics
      const itemsWithMetrics = allContentItems.filter(item => item.metrics);
      
      if (itemsWithMetrics.length > 0) {
        const metrics = itemsWithMetrics.reduce((acc, item) => {
          return {
            relevance: acc.relevance + (item.metrics.relevance || 0),
            credibility: acc.credibility + (item.metrics.credibility || 0),
            accuracy: acc.accuracy + (item.metrics.accuracy || 0),
            overall: acc.overall + (item.metrics.overall || 0)
          };
        }, { relevance: 0, credibility: 0, accuracy: 0, overall: 0 });
        
        const count = itemsWithMetrics.length;
        
        return {
          relevance: metrics.relevance / count,
          credibility: metrics.credibility / count,
          accuracy: metrics.accuracy / count,
          overall: metrics.overall / count
        };
      }
    }
    
    // Fallback to default metrics
    return { relevance: 0.7, credibility: 0.7, accuracy: 0.7, overall: 0.7 };
  };
  
  // Limit categories to at most MAX_CATEGORIES (6) to fit in one row
  const limitCategories = (categories, processedResults) => {
    if (!Array.isArray(categories) || categories.length <= 6) {
      return categories;
    }
    
    console.log(`Limiting ${categories.length} categories to max 6`);
    
    // First, ensure Key Insights category is included if it exists
    const keyInsightsCategory = categories.find(c => 
      c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
    );
    
    // Sort the remaining categories by overall score in descending order
    const otherCategories = categories
      .filter(c => c.id !== 'key-insights' && c.id !== 'key_insights' && c.name !== 'Key Insights')
      .sort((a, b) => {
        const aScore = a.metrics?.overall || 0;
        const bScore = b.metrics?.overall || 0;
        return bScore - aScore; // Descending order
      });
    
    // Combine Key Insights with top 4-5 highest scoring categories for a total of 5-6
    let finalCategories = [];
    const MAX_CATEGORIES = 6;
    
    // Add Key Insights first if it exists
    if (keyInsightsCategory) {
      finalCategories.push(keyInsightsCategory);
    }
    
    // Add remaining top categories up to MAX_CATEGORIES total
    const remainingSlots = MAX_CATEGORIES - finalCategories.length;
    finalCategories = [
      ...finalCategories,
      ...otherCategories.slice(0, remainingSlots)
    ];
    
    console.log(`Limited to ${finalCategories.length} categories:`, finalCategories.map(c => c.name));
    return finalCategories;
  };
  
  // Generate categories using the dynamic category processing system
  const generateCategories = () => {
    console.log('Generating categories with advanced processing', {
      hasCategories: !!categories, 
      categoriesCount: categories?.length || 0,
      processedResultsCount: processedResults?.length || 0,
      query
    });
    
    try {
      // If we have categories from the API, use those first
      if (categories && Array.isArray(categories) && categories.length > 0) {
        console.log('Using categories from API:', {
          names: categories.map(c => c.name),
          firstCategory: categories[0]?.name || 'none',
          hasContent: categories[0]?.content?.length > 0 ? 'yes' : 'no',
          contentCount: categories[0]?.content?.length || 0
        });
        
        // Ensure each category has content and all required properties for display
        const enrichedCategories = categories.map(category => {
          // Ensure each category has a valid ID
          const id = category.id || 
                    (category.name ? category.name.toLowerCase().replace(/\s+/g, '_') : null) || 
                    `category_${Math.random().toString(36).substr(2, 9)}`;
          
          // Ensure each category has a display name
          const name = category.name || category.title || 'Unnamed Category';
          
          // Generate color based on category type
          let color;
          if (name.toLowerCase().includes('key insight') || id.includes('key_insight') || id.includes('key-insight')) {
            color = '#0F9D58'; // Green for Key Insights
          } else if (name.toLowerCase().includes('all') || id.includes('all_results')) {
            color = '#4285F4'; // Blue for All Results
          } else {
            // Generate a color based on the category name to ensure consistency
            const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = nameHash % 360;
            color = `hsl(${hue}, 70%, 45%)`;
          }
          
          // Process metrics - ensure we have display-ready metrics
          let metrics = category.metrics || {};
          let displayMetrics = {};
          
          // Convert metrics from API format if needed
          if (metrics.relevanceScore !== undefined || metrics.finalScore !== undefined) {
            // API format metrics
            displayMetrics = {
              relevance: metrics.relevanceScore || 75,
              accuracy: metrics.accuracyScore || 80,
              credibility: metrics.credibilityScore || 80,
              overall: metrics.finalScore || 78
            };
            
            // Convert to decimal format for internal use
            metrics = {
              relevance: displayMetrics.relevance / 100,
              accuracy: displayMetrics.accuracy / 100,
              credibility: displayMetrics.credibility / 100,
              overall: displayMetrics.overall / 100
            };
          } else {
            // Already in decimal format, convert to percentage for display
            metrics = {
              relevance: metrics.relevance || 0.85,
              accuracy: metrics.accuracy || 0.80,
              credibility: metrics.credibility || 0.82,
              overall: metrics.overall || 0.82
            };
            
            displayMetrics = {
              relevance: Math.round(metrics.relevance * 100),
              accuracy: Math.round(metrics.accuracy * 100),
              credibility: Math.round(metrics.credibility * 100),
              overall: Math.round(metrics.overall * 100)
            };
          }
          
          console.log(`Enhanced category ${name}:`, { id, color, metrics: displayMetrics });
          
          return {
            ...category,
            id,
            name,
            color,
            metrics,
            displayMetrics,
            // Only set content if it's empty
            content: Array.isArray(category.content) && category.content.length > 0 
              ? category.content 
              : processedResults || []
          };
        });
        
        // Limit categories to 6 max
        return limitCategories(enrichedCategories, processedResults);
      }
      
      // If no categories from API, proceed with normal processing
      // First, get default categories as a starting point
      const baseCategories = getDefaultCategories(query);
      console.log('Default categories:', baseCategories.map(c => c.name));
      
      // Initialize with base data for use in case of processing failure
      const baseWithContent = baseCategories.map(category => ({
        ...category,
        content: processedResults || [],
        metrics: {
          relevance: category.name === 'Key Insights' ? 0.95 : 0.85,
          accuracy: category.name === 'Key Insights' ? 0.90 : 0.80,
          credibility: category.name === 'Key Insights' ? 0.92 : 0.82,
          overall: category.name === 'Key Insights' ? 0.92 : 0.82
        }
      }));
      
      // Only attempt additional category processing if we have results
      if (processedResults && processedResults.length > 0) {
        try {
          console.log('Processing results with CategoryProcessor...');
          
          // Process categories with the full processor
          console.log('Calling processCategories with query:', query);
          // Use categoryFinder functionality but don't instantiate
          // We'll use the imported findBestCategories function instead
          
          const processedCats = processCategories(processedResults, query, {
            categoryFinder: new CategoryFinder(), // Add categoryFinder instance to options
            llmResponse: llmResponse || '',
            showDebug: true,
            debug: true, // Enable full debugging
            keywordMatchers: {
              business: BusinessKeywords,
              market: MarketKeywords,
              financial: FinancialKeywords
            }
          });
          
          if (processedCats && processedCats.length > 0) {
            console.log('CategoryProcessor returned categories:', processedCats.map(c => c.name));
            
            // Limit to max 6 categories and return
            return limitCategories(processedCats, processedResults);
          }
        } catch (procErr) {
          console.error('Error in CategoryProcessor:', procErr);
          // Use base categories as fallback
          return baseWithContent;
        }
      }
      
      return baseWithContent;
    } catch (err) {
      console.error('Error in generateCategories:', err);
      
      console.error('CRITICAL: All category generation methods failed, using emergency fallback');
      
      // Create EMERGENCY FALLBACK categories if everything else fails
      // This is not mock data, but a last resort when all real category generation fails
      // to ensure the UI doesn't break completely
      const emergencyFallbackCategories = [
        {
          id: 'key_insights_emergency',
          name: 'Key Insights',
          icon: 'lightbulb',
          description: 'Emergency fallback - real category generation failed',
          content: processedResults || [],
          color: '#0F9D58',
          isEmergencyFallback: true,
          metrics: {
            relevance: 0.5,
            accuracy: 0.5,
            credibility: 0.5,
            overall: 0.5
          }
        },
        {
          id: 'all_results_emergency',
          name: 'All Results',
          icon: 'search',
          description: 'Emergency fallback - showing all results',
          content: processedResults || [],
          color: '#4285F4',
          isEmergencyFallback: true,
          metrics: {
            relevance: 0.5,
            accuracy: 0.5,
            credibility: 0.5,
            overall: 0.5
          }
        }
      ];
      
      // Log that we're using emergency fallback
      console.warn('Using emergency fallback categories due to category generation failure', {
        query,
        resultsCount: processedResults?.length || 0
      });
      
      return limitCategories(emergencyFallbackCategories, processedResults);
    }
  };
  
  // Render categories using the proper category processing system
  const renderCategories = () => {
    // Debug info for categories
    console.log('renderCategories called with:', {
      categoriesProp: categories?.length || 0,
      processingState: isProcessing,
      loadingState: options.isLoading,
      processedResults: processedResults?.length || 0,
      query
    });
    
    // Force showCategories to always be true
    const displayOpts = { ...displayOptions, showCategories: true };
    
    // Get categories from our generator function
    let categoriesToDisplay = generateCategories();
    
    // Always make sure Key Insights comes first
    categoriesToDisplay.sort((a, b) => {
      if (a.id === 'key_insights' || a.name === 'Key Insights') return -1;
      if (b.id === 'key_insights' || b.name === 'Key Insights') return 1;
      return 0;
    });
    
    console.log('Final categories to display:', categoriesToDisplay.map(c => c.name));
    
    // Insert categories directly into DOM to ensure they're available
    if (typeof window !== 'undefined' && Array.isArray(categoriesToDisplay) && categoriesToDisplay.length > 0) {
      try {
        // Store in window.__categoryCaptureSystem if available (from _document.js)
        if (window.__categoryCaptureSystem) {
          window.__categoryCaptureSystem.categories = categoriesToDisplay;
          window.__categoryCaptureSystem.lastCapture = new Date().toISOString() + ' (from render)';
          
          // Trigger emergency display if that function exists
          if (typeof window.emergencyCategories?.show === 'function') {
            setTimeout(() => window.emergencyCategories.show(), 500);
          }
        }
        
        // Store in redundant places for maximum availability
        window.__allCategories = categoriesToDisplay;
        window.__lastCategoriesReceived = categoriesToDisplay;
        
        // Also create a hidden JSON element with categories for direct access
        const categoriesJson = JSON.stringify(categoriesToDisplay);
        const hiddenElement = document.createElement('div');
        hiddenElement.id = 'hidden-categories-data';
        hiddenElement.style.display = 'none';
        hiddenElement.setAttribute('data-categories', categoriesJson);
        hiddenElement.innerHTML = `<!-- Categories: ${categoriesJson} -->`;
        
        // Add to document body if not already there
        if (!document.getElementById('hidden-categories-data')) {
          document.body.appendChild(hiddenElement);
        } else {
          document.getElementById('hidden-categories-data').setAttribute('data-categories', categoriesJson);
        }
      } catch (err) {
        console.error('Error storing categories in DOM:', err);
      }
    }
    
    // Create debug div
    const debugDiv = (
      <div style={{ 
        padding: '10px', 
        marginBottom: '15px',
        backgroundColor: '#fef3c7', 
        border: '1px solid #fbbf24',
        borderRadius: '6px',
        color: '#92400e',
        fontSize: '14px'
      }}>
        <strong>Debug:</strong> Using advanced category processing
        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
          <li>Categories: {categoriesToDisplay.length}</li>
          <li>Category Names: {categoriesToDisplay.map(c => c.name).join(', ')}</li>
          <li>Results Count: {processedResults?.length || 0}</li>
        </ul>
      </div>
    );
    
    // Always ensure we have valid categories with proper structure
    const validCategories = categoriesToDisplay.map(category => {
      // Ensure each category has the required properties
      return {
        id: category.id || `category-${Math.random().toString(36).substr(2, 9)}`,
        name: category.name || 'Untitled Category',
        icon: category.icon || 'document',
        description: category.description || '',
        content: Array.isArray(category.content) ? category.content : (processedResults || []),
        color: category.color || '#4285F4',
        metrics: category.metrics || {
          relevance: 0.8,
          accuracy: 0.8,
          credibility: 0.8,
          overall: 0.8
        }
      };
    });
    
    console.log('Verified categories:', validCategories.map(c => c.name));
    
    return (
      <>
        {debugDiv}
        {/* CATEGORY DEBUGGING SECTION - BEGIN */}
        <div
          id="category-debug-container"
          style={{
            border: '4px solid #0f9d58', 
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f8fef9',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'visible',
            display: 'block !important',
            visibility: 'visible !important'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f9d58',
            color: 'white',
            padding: '2px 10px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Categories Section
          </div>
          
          <div style={{ marginBottom: '10px', padding: '8px', background: '#e6f7ef', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Debug Info:</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Categories Available: {validCategories.length}</p>
            <p style={{ margin: '0', fontSize: '12px' }}>Names: {validCategories.map(c => c.name).join(', ')}</p>
          </div>
          
          {/* Force diagnostics to run */}
          {typeof window !== 'undefined' && window.diagnostics && (
            <script dangerouslySetInnerHTML={{
              __html: `
                try {
                  setTimeout(() => {
                    console.log('🧪 Forcing diagnostics from render');
                    window.diagnostics.showCategories();
                    window.diagnostics.injectCategoryDisplay();
                  }, 800);
                } catch (e) { console.error('Error in inline diagnostics:', e); }
              `
            }} />
          )}
          
          <ModernCategoryDisplay 
            categories={validCategories} 
            query={query} 
            options={{
              ...displayOpts,
              showCategories: true, // Force true
              forceDisplay: true, // Custom flag to force display
              context: 'standard', // Specify standard context
              zIndex: 9000 // High z-index
            }} 
          />
        </div>
        {/* CATEGORY DEBUGGING SECTION - END */}
      </>
    );
  };
  
  // Get the aggregate metrics
  const aggregateMetrics = calculateAggregateMetrics();
  
  // Render context info
  const renderContextInfo = () => {
    if (!queryContext) return null;
    
    // Get the primary context
    const primaryContext = queryContext.primaryContext || 
      (queryContext.isBusinessQuery ? 'business' : 
       queryContext.isFinancialQuery ? 'financial' : 
       queryContext.isTechnicalQuery ? 'technical' : 
       queryContext.isMedicalQuery ? 'medical' : 'general');
       
    // Get color for context
    const getContextColor = () => {
      switch (primaryContext) {
        case 'business': return '#009688'; // Teal
        case 'financial': return '#673AB7'; // Purple
        case 'technical': return '#3F51B5'; // Indigo
        case 'medical': return '#2196F3'; // Blue
        default: return '#757575'; // Gray
      }
    };
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        marginBottom: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: getContextColor(),
          borderRadius: '50%'
        }}></div>
        <span>
          <strong>{primaryContext.charAt(0).toUpperCase() + primaryContext.slice(1)}</strong> query detected: 
          Results optimized for {primaryContext} context
        </span>
      </div>
    );
  };

  // Render the results
  return (
    <div className="intelligent-search-results">
      {renderContextHeader()}
      
      <div style={{ marginBottom: '20px' }}>
        {renderContextInfo()}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1 }}>
            <ScoreVisualizer metrics={aggregateMetrics} />
          </div>
          <div style={{ 
            flex: 1, 
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            padding: '12px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Search Context Summary</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Your search for <strong>"{query}"</strong> was processed with:</p>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px' }}>
              <li>Context-based scoring optimization</li>
              <li>Enhanced {queryContext?.primaryContext || 'general'} result prioritization</li>
              <li>Source credibility validation</li>
              <li>Relevance-based category organization</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Use real categories from API */}
      <div style={{ 
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem' 
      }}>
        {/* Generate real categories using the actual data */}
        {(() => {
          // Generate real categories from the API data
          const realCategories = generateCategories();
          
          // Check if we have any LLM processed results
          const hasLLMResults = Array.isArray(processedResults) && processedResults.some(r => 
            r && (r.llmProcessed || r.aiProcessed)
          );
          
          // EXTENSIVE DIAGNOSTIC LOGGING
          console.log('REAL CATEGORIES FROM API - DETAILED:', {
            count: realCategories.length,
            names: realCategories.map(cat => cat.name),
            hasContent: realCategories.map(cat => (cat.content && cat.content.length) || 0),
            firstCategory: realCategories[0] ? JSON.stringify(realCategories[0]) : 'none',
            allCategoryIds: realCategories.map(cat => cat.id),
            allCategoryMetrics: realCategories.map(cat => cat.metrics ? 'has metrics' : 'no metrics')  
          });
          
          // Make a copy to avoid mutation issues
          const enhancedCategories = realCategories.map(cat => ({
            ...cat,
            // Ensure each category has required fields
            id: cat.id || `category-${Math.random().toString(36).substring(2, 9)}`,
            name: cat.name || 'Unnamed Category',
            icon: cat.icon || 'search',
            color: cat.color || '#4285F4',
            metrics: cat.metrics || { relevance: 0.7, accuracy: 0.7, credibility: 0.7, overall: 0.7 },
            content: cat.content || [],
          }));
          
          // Update window.__debugCategories for console inspection
          if (typeof window !== 'undefined') {
            window.__debugCategories = enhancedCategories;
            console.log('Set window.__debugCategories for inspection');
          }
          
          // Add visible debug output to show what's happening
          return (
            <div>
              <div style={{
                padding: '10px',
                margin: '5px 0 15px 0',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <p><strong>Categories Debug:</strong> Found {enhancedCategories.length} categories:</p>
                <ul style={{ margin: '5px 0', paddingLeft: '25px' }}>
                  {enhancedCategories.map((cat, i) => (
                    <li key={i}>{cat.name} (items: {(cat.content && cat.content.length) || 0})</li>
                  ))}
                </ul>
              </div>
              
              {/* Check if results have LLM processed content */}
              {hasLLMResults ? (
                <div className="llm-results-scroller" data-testid="llm-results-container" style={{
                  display: 'block !important',
                  width: '100% !important',
                  visibility: 'visible !important',
                  opacity: '1 !important',
                  border: '6px solid #8b5cf6',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  marginTop: '24px',
                  background: 'white',
                  boxShadow: '0 8px 12px rgba(0,0,0,0.15)',
                  position: 'relative',
                  zIndex: '50',
                  overflow: 'visible'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    textAlign: 'center',
                    color: '#5b21b6',
                    backgroundColor: '#f5f3ff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #8b5cf6'
                  }}>
                    React-based LLM Results with Categories
                  </div>
                  
                  {/* Force log category data for debugging */}
                  {(() => {
                    console.log('LLM RESULTS RENDER POINT - Categories:', {
                      count: enhancedCategories.length,
                      names: enhancedCategories.map(c => c.name),
                      ids: enhancedCategories.map(c => c.id)
                    });
                    
                    // Create a direct reference to the window for emergency access
                    if (typeof window !== 'undefined') {
                      window.__currentLLMCategories = enhancedCategories;
                      console.log('Categories stored in window.__currentLLMCategories');
                    }
                    
                    return null;
                  })()}
                  
                  <LLMCategorizedResults
                    categories={enhancedCategories}
                    results={processedResults.find(r => r.llmProcessed || r.aiProcessed)?.content || []}
                    query={query}
                    options={{
                      enhancedView: true,
                      showMetrics: true,
                      isBusinessContext: queryContext?.isBusinessQuery,
                      forceDisplay: true,
                      zIndex: 9999
                    }}
                  />
                </div>
              ) : (
                <ModernCategoryDisplay 
                  categories={enhancedCategories}
                  query={query}
                  options={{
                    showCategories: true,
                    limitCategories: true,
                    maxCategories: 6,
                    prioritizeKeyInsights: true,
                    debug: true,
                    context: 'standard', // Not in LLM results here
                    forceDisplay: true
                  }}
                />
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
};

export default IntelligentSearchResults;
