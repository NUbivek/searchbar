import React, { useState, useEffect, useMemo } from 'react';
import { CategoryDisplay } from './categories';
import axios from 'axios';

/**
 * Component for displaying LLM-generated search results
 * @param {Object} props Component props
 * @param {Array} props.results Array of search results
 * @param {string} props.query Search query
 * @returns {JSX.Element} Rendered LLM results
 */
const LLMResults = ({ results, query, showTabs, tabsOptions, metricsOptions, setActiveCategory }) => {
  const [processedResults, setProcessedResults] = useState([]);
  const [isLLMProcessing, setIsLLMProcessing] = useState(false);
  const [llmProcessedContent, setLlmProcessedContent] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  
  useEffect(() => {
    const processResultsThroughLLM = async () => {
      // Only process if we have valid results and a query
      if (!results || !query || (Array.isArray(results) && results.length === 0)) {
        // Clear any previous results
        setProcessedResults([]);
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Starting LLM processing for query:', query);
      }
      
      setIsLLMProcessing(true);
      setProcessingError(null);
      
      try {
        // Ensure query is a string
        const safeQuery = typeof query === 'string' ? query : String(query || '');
        
        // Extract actual search results from the chat history
        let searchResultsData = [];
        
        if (Array.isArray(results)) {
          // Look for assistant messages with rawResults
          const assistantMessages = results.filter(msg => msg.type === 'assistant' && msg.rawResults);
          if (assistantMessages.length > 0) {
            // Use the latest assistant message with rawResults
            const latestMessage = assistantMessages[assistantMessages.length - 1];
            if (latestMessage.rawResults && latestMessage.rawResults.sources) {
              searchResultsData = latestMessage.rawResults.sources;
            }
          }
        }
        
        // If we couldn't extract from chat history, use the results directly
        if (searchResultsData.length === 0 && Array.isArray(results)) {
          searchResultsData = results;
        }
        
        // Only proceed if we have actual search results
        if (searchResultsData.length === 0) {
          setProcessedResults([]);
          setIsLLMProcessing(false);
          return;
        }
        
        // Process the results through the LLM
        const response = await fetch('/api/llm/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: safeQuery,
            sources: searchResultsData.slice(0, 20), // Limit to first 20 results for performance
            model: 'mixtral-8x7b', // Default model
          }),
        });
        
        if (!response.ok) {
          throw new Error(`LLM processing failed: ${response.status} ${response.statusText}`);
        }
        
        const llmResponse = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('LLM processing complete:', llmResponse);
        }
        
        // Process llmResponse into a safe format before storing
        const safeLlmResponse = processLlmResponseToSafeFormat(llmResponse);
        
        // Process the LLM response into categories
        const { processCategories } = await import('./categories/processors/CategoryProcessor');
        
        // Check if llmResponse is an object and extract the content or summary
        let llmContent = null;
        
        if (llmResponse) {
          if (typeof llmResponse === 'string') {
            llmContent = llmResponse;
          } else if (typeof llmResponse === 'object' && llmResponse !== null) {
            // Try to get content from different possible properties
            llmContent = llmResponse.summary || llmResponse.content || null;
            
            // If content is still an object, convert it to a string
            if (typeof llmContent === 'object' && llmContent !== null) {
              llmContent = JSON.stringify(llmContent);
            }
          }
        }
        
        // Use the CategoryProcessor to process the results
        const processedCategories = processCategories(searchResultsData, safeQuery, {
          llmResponse: llmContent,
          includeBusinessInsights: true,
          includeMetrics: true,
        });
        
        // Set the processed results
        setProcessedResults(processedCategories);
        setLlmProcessedContent(safeLlmResponse);
        setIsLLMProcessing(false);
        
      } catch (error) {
        console.error('Error processing results through LLM:', error);
        setProcessingError(error.message || 'An error occurred during LLM processing');
        
        // Store searchResultsData in local variable to prevent ReferenceError
        let localSearchResultsData = [];
        if (Array.isArray(results)) {
          localSearchResultsData = results;
        }
        
        // Create a fallback response
        const fallbackResponse = {
          summary: `Could not process results: ${error.message || 'Unknown error'}`,
          content: `Failed to process results through LLM API. Using original search results instead.`,
          followUpQuestions: ["Try a more specific search", "Try again later"],
          sources: localSearchResultsData
        };
        
        // Process fallback response into a safe format - ensure it returns a string, not an object
        const safeResponse = processLlmResponseToSafeFormat(fallbackResponse);
        
        // Clear any processed results to avoid showing mock data
        setProcessedResults([]);
        setLlmProcessedContent(safeResponse);
        setIsLLMProcessing(false);
      }
    };
    
    processResultsThroughLLM();
  }, [results, query]);
  
  // Basic processing function as fallback
  const processResultsBasic = (resultsData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performing basic processing as fallback');
    }
    
    // Process results to ensure they're in the correct format
    if (resultsData) {
      let processed = [];
      
      if (Array.isArray(resultsData)) {
        // If results is already an array, use it directly
        processed = resultsData.map(item => {
          // Ensure each item has the necessary properties for categorization
          if (typeof item === 'object' && item !== null) {
            return {
              ...item,
              // Add type if not present
              type: item.type || 'search_result',
              // Ensure title is present
              title: item.title || item.name || '',
              // Ensure description is present
              description: item.snippet || item.description || item.content || '',
              // Ensure URL is present
              url: item.link || item.url || '',
              // Add a unique ID for tracking
              _id: item._id || item.id || `result-${Math.random().toString(36).substring(2, 15)}`
            };
          }
          return item;
        });
      } else if (typeof resultsData === 'object') {
        // If results is an object with items/results/data property, use that
        if (resultsData.items && Array.isArray(resultsData.items)) {
          processed = resultsData.items;
        } else if (resultsData.results && Array.isArray(resultsData.results)) {
          processed = resultsData.results;
        } else if (resultsData.data && Array.isArray(resultsData.data)) {
          processed = resultsData.data;
        } else {
          // Otherwise, wrap the object in an array
          processed = [resultsData];
        }
      } else if (typeof resultsData === 'string') {
        // If results is a string, create a text item
        processed = [{ text: resultsData, type: 'text' }];
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Basic processed results count:', processed.length);
      }
      setProcessedResults(processed);
    }
  };

  // Helper function to extract key facts from LLM content
  const extractKeyFacts = (content) => {
    if (!content) return '';
    
    // Try to find bullet points or numbered lists that might indicate facts
    const facts = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Match bullet points, numbers, or markdown list items
      if (line.match(/^[•\-\*\d\.]+ /)) {
        facts.push(line);
      }
    }
    
    // If no facts found with bullet points, try to extract sentences that look like facts
    if (facts.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      for (const sentence of sentences) {
        if (sentence.includes('is') || sentence.includes('are') || 
            sentence.includes('was') || sentence.includes('were') ||
            sentence.match(/\d+/)) {
          facts.push(sentence.trim());
        }
        
        // Limit to 10 facts if using sentence extraction
        if (facts.length >= 10) break;
      }
    }
    
    return facts.length > 0 ? facts.join('\n\n') : content;
  };
  
  // Helper function to extract key insights from LLM content
  const extractKeyInsights = (content, query) => {
    if (!content) return '';
    
    // Try to find paragraphs or sentences that contain key insight indicators
    const insights = [];
    const lines = content.split('\n');
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Look for paragraphs with insight indicators
    let insightParagraphs = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Look for insight indicators
      const hasInsightIndicator = 
        line.toLowerCase().includes('insight') || 
        line.toLowerCase().includes('takeaway') ||
        line.toLowerCase().includes('key finding') ||
        line.toLowerCase().includes('important') ||
        line.toLowerCase().includes('significant') ||
        line.toLowerCase().includes('analysis');
      
      // Look for query terms
      const hasQueryTerms = queryTerms.some(term => 
        line.toLowerCase().includes(term) && term.length > 3
      );
      
      if (hasInsightIndicator || (hasQueryTerms && line.length > 100)) {
        insights.push(line);
      }
    }
    
    // If no insights found, try to extract important-looking sentences
    if (insights.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase();
        if (sentenceLower.includes('important') || 
            sentenceLower.includes('significant') || 
            sentenceLower.includes('key') ||
            sentenceLower.includes('noteworthy') ||
            queryTerms.some(term => sentenceLower.includes(term) && term.length > 3)) {
          insights.push(sentence.trim());
        }
        
        // Limit to 5 insights if using sentence extraction
        if (insights.length >= 5) break;
      }
    }
    
    return insights.length > 0 ? insights.join('\n\n') : content;
  };

  // Function to ensure all content is stringified for React
  const stringifyForReact = (obj) => {
    // Direct string or primitive - return as string
    if (typeof obj !== 'object' || obj === null) {
      return String(obj || '');
    }
    
    try {
      // Handle array by stringifying each element
      if (Array.isArray(obj)) {
        // If it's an array of primitive values, return as comma-separated string
        if (obj.every(item => typeof item !== 'object' || item === null)) {
          return obj.map(item => String(item || '')).join(', ');
        }
        // Otherwise, convert each item properly and return as array
        return obj.map(item => stringifyForReact(item));
      }
      
      // For objects with specific structure that needs to be preserved
      if (obj && typeof obj === 'object') {
        // If it's a structured LLM response with summary/sources, preserve it but stringify individual properties
        if (obj.summary !== undefined || obj.content !== undefined || obj.sources !== undefined) {
          const processedObj = {
            summary: typeof obj.summary === 'string' ? obj.summary : String(obj.summary || ''),
            isLLMProcessed: true
          };
          
          // Process sources to ensure they have the correct structure
          if (Array.isArray(obj.sources)) {
            processedObj.sources = obj.sources.map(source => {
              if (typeof source === 'string') {
                return source;
              } else if (typeof source === 'object' && source !== null) {
                // Ensure each source has title and url as strings
                return {
                  title: typeof source.title === 'string' ? source.title : String(source.title || ''),
                  url: typeof source.url === 'string' ? source.url : String(source.url || '')
                };
              } else {
                return String(source || '');
              }
            });
          } else {
            processedObj.sources = [];
          }
          
          // Process follow-up questions
          if (Array.isArray(obj.followUpQuestions)) {
            processedObj.followUpQuestions = obj.followUpQuestions.map(q => 
              typeof q === 'string' ? q : String(q || '')
            );
          } else {
            processedObj.followUpQuestions = [];
          }
          
          return processedObj;
        }
        
        // For source objects with title/url, preserve structure
        if (obj.title !== undefined || obj.url !== undefined) {
          return {
            title: typeof obj.title === 'string' ? obj.title : String(obj.title || ''),
            url: typeof obj.url === 'string' ? obj.url : String(obj.url || '')
          };
        }
      }
      
      // For other objects, convert to a string representation
      return JSON.stringify(obj);
    } catch (e) {
      console.error('Error stringifying object:', e);
      return String(obj || 'Error processing content');
    }
  };

  // Enhanced version of processLlmResponseToSafeFormat that fully stringifies content
  const processLlmResponseToSafeFormat = (response) => {
    if (!response) return '';
    
    try {
      // If it's already a string, we're good to go
      if (typeof response === 'string') {
        return response;
      }
      
      // If it's an array, process each item and return the processed array
      if (Array.isArray(response)) {
        return response.map(item => stringifyForReact(item));
      }
      
      // For objects with LLM response structure, process it preserving the structure
      if (typeof response === 'object' && response !== null) {
        // Check if this is a structured LLM response
        if (response.summary !== undefined || response.content !== undefined || 
            response.sources !== undefined || response.followUpQuestions !== undefined) {
          
          // Return a properly processed object with all fields stringified
          return stringifyForReact(response);
        }
        
        // For other objects, use stringifyForReact
        return stringifyForReact(response);
      }
      
      // Fallback for any other type
      return String(response || '');
    } catch (err) {
      console.error('Error in processLlmResponseToSafeFormat:', err);
      return String(response || 'Error processing content');
    }
  };

  // Function to prepare display content from LLM response
  const prepareDisplayContent = (llmResponse) => {
    if (!llmResponse) return '';
    
    // Process LLM response to safe format first
    const processedResponse = processLlmResponseToSafeFormat(llmResponse);
    
    // Ensure the response is a string, but preserve structured objects
    if (typeof processedResponse === 'string') {
      return processedResponse;
    }
    
    // Special handling for structured content objects
    if (typeof processedResponse === 'object' && processedResponse !== null) {
      if (processedResponse.summary !== undefined) {
        // Return the object structure but ensure all properties are safe strings
        return {
          summary: String(processedResponse.summary || ''),
          sources: Array.isArray(processedResponse.sources) 
            ? processedResponse.sources.map(s => typeof s === 'string' ? s : JSON.stringify(s))
            : [],
          followUpQuestions: Array.isArray(processedResponse.followUpQuestions)
            ? processedResponse.followUpQuestions.map(q => typeof q === 'string' ? q : String(q || ''))
            : [],
          isLLMProcessed: true
        };
      }
    }
    
    // Convert any other objects to string as a fallback
    return typeof processedResponse === 'object' ? JSON.stringify(processedResponse) : String(processedResponse);
  };

  // Combine content based on response source priority
  const combinedDisplayContent = () => {
    const fallbackContent = results && results.length > 0
      ? results.map(s => s.title || 'Source').join(', ')
      : 'No results found';
      
    try {
      // Get content from different potential sources with proper stringification
      let result = results?.result ? prepareDisplayContent(results.result) : '';
      let answer = results?.answer ? prepareDisplayContent(results.answer) : '';
      let content = results?.content ? prepareDisplayContent(results.content) : '';
      let summary = results?.summary ? prepareDisplayContent(results.summary) : '';
      
      // Handle the case where any of these returns an object
      if (typeof result === 'object' && result !== null) {
        // Keep the structure but make sure we return a safe formatted object
        return result;
      }
      
      if (typeof answer === 'object' && answer !== null) {
        return answer;
      }
      
      if (typeof content === 'object' && content !== null) {
        return content;
      }
      
      if (typeof summary === 'object' && summary !== null) {
        return summary;
      }
      
      // All string values - use the first available content
      return result || answer || content || summary || fallbackContent;
    } catch (e) {
      console.error('Error in combinedDisplayContent:', e);
      return fallbackContent;
    }
  };

  // Get the prepared content for display, ensuring it's properly handled for React
  const rawDisplayContent = combinedDisplayContent();
  const preparedDisplayContent = typeof rawDisplayContent === 'object' && rawDisplayContent !== null
    ? rawDisplayContent  // Keep object structure for specialized rendering
    : String(rawDisplayContent || ''); // Convert to string if it's not an object

  // Ensure query is a string
  const searchQuery = typeof query === 'string' ? query : '';
  
  // Get the display content for the LLM results
  const getDisplayContent = (content) => {
    // Handle object responses
    if (typeof content === 'object' && content !== null) {
      return content.content || JSON.stringify(content, null, 2);
    }
    return content;
  };

  // Prepare the content for CategoryDisplay
  const preparedDisplayContentForCategory = useMemo(() => {
    // Early exit if we don't have anything to display
    if (!llmProcessedContent && !processedResults) {
      return [];
    }
    
    // If it's a string, convert to a simple category format for display
    if (typeof preparedDisplayContent === 'string') {
      // Check if the string is empty
      if (!preparedDisplayContent.trim()) {
        return [];
      }
      
      // Return as single category with proper ID format
      return [
        {
          id: 'llm-response', // Use specific ID for criteria matching
          name: 'AI Analysis',
          description: 'Analysis of search results',
          icon: 'robot',
          content: [
            {
              id: 'content-1',
              title: 'Analysis',
              content: preparedDisplayContent,
              source: 'LLM Analysis',
              type: 'analysis'
            }
          ],
          metrics: { relevance: 1, accuracy: 1, credibility: 1, overall: 1 },
          color: '#4285F4' // Google Blue
        }
      ];
    } else if (preparedDisplayContent && typeof preparedDisplayContent === 'object' && !Array.isArray(preparedDisplayContent)) {
      // If it's an object with specific properties like summary, content, sources, etc.
      // convert it to a properly formatted category structure
      const content = preparedDisplayContent.summary || preparedDisplayContent.content || '';
      const sources = preparedDisplayContent.sources || [];
      const followUpQuestions = preparedDisplayContent.followUpQuestions || [];
      
      // Format the content as string
      const contentString = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Create a complete category with the content
      return [
        {
          id: 'llm-response',
          name: 'AI Analysis',
          description: 'Analysis of search results',
          icon: 'robot',
          content: [
            {
              id: 'content-main',
              title: 'Analysis',
              content: contentString,
              source: 'LLM Analysis',
              type: 'analysis'
            },
            // Add sources as separate content items
            ...sources.map((source, index) => {
              const sourceContent = typeof source === 'object' ? 
                (source.content || `Source: ${source.title || 'Unknown'}`) : 
                String(source);
              
              return {
                id: `source-${index}`,
                title: typeof source === 'object' ? (source.title || `Source ${index + 1}`) : `Source ${index + 1}`,
                content: sourceContent,
                url: typeof source === 'object' ? (source.url || '') : '',
                source: 'Search Result',
                type: 'source'
              };
            }),
            // Add follow-up questions as separate content item
            {
              id: 'followup-questions',
              title: 'Follow-up Questions',
              content: followUpQuestions.map(q => `- ${typeof q === 'string' ? q : JSON.stringify(q)}`).join('\n'),
              source: 'LLM Suggestions',
              type: 'questions'
            }
          ].filter(item => {
            // Filter out empty followup questions
            if (item.id === 'followup-questions' && (!followUpQuestions || followUpQuestions.length === 0)) {
              return false;
            }
            return true;
          }),
          metrics: { relevance: 1, accuracy: 1, credibility: 1, overall: 1 },
          color: '#4285F4' // Google Blue
        }
      ];
    }
    
    // If it's an array, make sure it's properly structured
    if (Array.isArray(preparedDisplayContent)) {
      // Validate each category has proper format and all content values are strings
      return preparedDisplayContent.map(category => {
        // Ensure category has required fields
        if (!category) return null;
        
        const safeCategory = { ...category };
        safeCategory.id = category.id || `category-${Math.random().toString(36).substring(2, 9)}`;
        safeCategory.name = category.name || 'Untitled Category';
        
        // Handle content array
        if (Array.isArray(category.content)) {
          safeCategory.content = category.content.map(item => {
            if (!item) return null;
            
            // If item is not an object, convert to object with content property
            if (typeof item !== 'object' || item === null) {
              return {
                id: `content-${Math.random().toString(36).substring(2, 9)}`,
                title: 'Content',
                content: String(item || '')
              };
            }
            
            // Ensure content is a string
            const safeItem = { ...item };
            safeItem.id = item.id || `content-${Math.random().toString(36).substring(2, 9)}`;
            safeItem.title = item.title || 'Content';
            
            if (item.content !== undefined) {
              if (typeof item.content === 'string') {
                safeItem.content = item.content;
              } else if (typeof item.content === 'object' && item.content !== null) {
                safeItem.content = JSON.stringify(item.content);
              } else {
                safeItem.content = String(item.content || '');
              }
            } else {
              safeItem.content = '';
            }
            
            return safeItem;
          }).filter(Boolean); // Remove null items
        } else if (category.content !== undefined) {
          // If content is not an array, convert to string and make single item
          safeCategory.content = [{
            id: `content-${Math.random().toString(36).substring(2, 9)}`,
            title: 'Content',
            content: typeof category.content === 'string' 
              ? category.content 
              : String(category.content || '')
          }];
        } else {
          safeCategory.content = [];
        }
        
        return safeCategory;
      }).filter(Boolean); // Remove null items
    }
    
    // For any other type, convert to string and create a category
    return [{
      id: 'llm-insights',
      name: 'AI Analysis',
      description: 'AI-generated insights',
      icon: 'lightbulb',
      content: [{
        id: 'llm-content',
        title: 'AI Content',
        content: String(preparedDisplayContent || '')
      }],
      metrics: { relevance: 0.9, accuracy: 0.8, credibility: 0.7, overall: 0.8 }
    }];
  }, [preparedDisplayContent]);

  // If we're not processing and no valid content or search, don't render
  if (!isLLMProcessing && (!preparedDisplayContentForCategory || preparedDisplayContentForCategory.length === 0)) {
    return null;
  }
  
  // Check specific criteria for showing LLM results
  const shouldShowLLMResults = () => {
    // Only show if we have exactly 1 category
    if (!Array.isArray(preparedDisplayContentForCategory) || preparedDisplayContentForCategory.length !== 1) {
      return false;
    }
    
    // Check if the first category has the required ID
    const firstCategory = preparedDisplayContentForCategory[0];
    if (!firstCategory || firstCategory.id !== 'llm-response') {
      return false;
    }
    
    // Check if we have a valid query
    if (!query || query.trim() === '') {
      return false;
    }
    
    // Only show after a search has been performed
    return true;
  };
  
  // Early exit if criteria not met
  if (!shouldShowLLMResults() && !isLLMProcessing) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Display content items:', Array.isArray(preparedDisplayContentForCategory) ? preparedDisplayContentForCategory.length : 0);
  }

  // Special renderer for source item that ensures it's a string
  const renderSource = (source, index) => {
    if (typeof source === 'string') {
      return <li key={index}>{source}</li>;
    } else if (source && typeof source === 'object') {
      // Try to extract useful information from source object
      const title = source.title || '';
      const url = source.url || '';
      return <li key={index}>{title}{url ? ` - ${url}` : ''}</li>;
    }
    return <li key={index}>Source {index + 1}</li>;
  };

  return (
    shouldShowLLMResults() && (
      <div className="llm-search-results">
        <CategoryDisplay
          title="AI Analysis"
          id="llm-response"
          icon={<i className="fas fa-robot" />}
          content={
            <div className="llm-content">
              {isLLMProcessing ? (
                <div className="processing-state">
                  <div className="spinner" style={{
                    border: '4px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '50%',
                    borderTop: '4px solid #3498db',
                    width: '30px',
                    height: '30px',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px auto'
                  }}></div>
                  <p>Processing search results with AI...</p>
                </div>
              ) : processingError ? (
                <div className="error-state">
                  <p className="error-message">Error: {processingError}</p>
                  <p>Try rephrasing your search or try again later.</p>
                </div>
              ) : typeof preparedDisplayContent === 'object' && preparedDisplayContent !== null ? (
                <div>
                  {/* Handle structured object content */}
                  {preparedDisplayContent.summary && (
                    <div className="llm-summary">{String(preparedDisplayContent.summary)}</div>
                  )}
                  
                  {/* Render sources if available */}
                  {Array.isArray(preparedDisplayContent.sources) && preparedDisplayContent.sources.length > 0 && (
                    <div className="llm-sources">
                      <h4>Sources:</h4>
                      <ul>
                        {preparedDisplayContent.sources.map((source, index) => renderSource(source, index))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Render follow-up questions if available */}
                  {Array.isArray(preparedDisplayContent.followUpQuestions) && preparedDisplayContent.followUpQuestions.length > 0 && (
                    <div className="llm-follow-up">
                      <h4>Follow-up Questions:</h4>
                      <ul>
                        {preparedDisplayContent.followUpQuestions.map((question, index) => (
                          <li key={index}>{String(question)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // Render simple string content
                <div>{String(preparedDisplayContent || "No AI analysis available for this search.")}</div>
              )}
            </div>
          }
          showTabs={showTabs}
          tabsOptions={tabsOptions}
          metricsOptions={metricsOptions}
          activeCategory="llm-response"
          setActiveCategory={setActiveCategory}
          categoriesCount={1}
        />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  );
};

export default LLMResults;
