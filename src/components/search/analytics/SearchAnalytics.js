/**
 * SearchAnalytics.js
 * 
 * Tracks and analyzes search patterns, user engagement, and result quality.
 * Provides feedback mechanisms for search result quality.
 */

import React, { useState, useEffect, useRef } from 'react';
import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

// Store for analytics data 
// In a real app, this would be persisted to a database or local storage
let analyticsStore = {
  searches: [],
  interactions: [],
  feedback: [],
  preferences: {}
};

/**
 * Track a new search query
 * @param {string} query The search query
 * @param {Object} metadata Additional search metadata
 */
export const trackSearch = (query, metadata = {}) => {
  if (!query) return;
  
  const searchEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    query,
    ...metadata
  };
  
  analyticsStore.searches.push(searchEvent);
  log.debug('Search tracked:', searchEvent);
  
  // Limit the size of the store
  if (analyticsStore.searches.length > 50) {
    analyticsStore.searches = analyticsStore.searches.slice(-50);
  }
  
  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('search-analytics-updated', {
    detail: { type: 'search', data: searchEvent }
  }));
  
  return searchEvent.id;
};

/**
 * Track user interaction with search results
 * @param {string} interactionType Type of interaction (click, expand, etc.)
 * @param {Object} targetInfo Information about the interaction target
 * @param {string} searchId ID of the search that led to this interaction
 */
export const trackInteraction = (interactionType, targetInfo = {}, searchId = null) => {
  const interactionEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    type: interactionType,
    target: targetInfo,
    searchId
  };
  
  analyticsStore.interactions.push(interactionEvent);
  log.debug('Interaction tracked:', interactionEvent);
  
  // Limit the size of the store
  if (analyticsStore.interactions.length > 100) {
    analyticsStore.interactions = analyticsStore.interactions.slice(-100);
  }
  
  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('search-analytics-updated', {
    detail: { type: 'interaction', data: interactionEvent }
  }));
  
  return interactionEvent.id;
};

/**
 * Record user feedback on search results
 * @param {string} feedbackType Type of feedback (helpful, not_helpful, etc.)
 * @param {Object} feedbackDetails Additional feedback details
 * @param {string} searchId ID of the search that led to this feedback
 */
export const recordFeedback = (feedbackType, feedbackDetails = {}, searchId = null) => {
  const feedbackEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    type: feedbackType,
    details: feedbackDetails,
    searchId
  };
  
  analyticsStore.feedback.push(feedbackEvent);
  log.debug('Feedback recorded:', feedbackEvent);
  
  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('search-analytics-updated', {
    detail: { type: 'feedback', data: feedbackEvent }
  }));
  
  return feedbackEvent.id;
};

/**
 * Update user preferences for search and results
 * @param {Object} preferences User preferences object
 */
export const updatePreferences = (preferences = {}) => {
  analyticsStore.preferences = {
    ...analyticsStore.preferences,
    ...preferences,
    lastUpdated: new Date().toISOString()
  };
  
  log.debug('Preferences updated:', analyticsStore.preferences);
  
  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('search-analytics-updated', {
    detail: { type: 'preferences', data: analyticsStore.preferences }
  }));
};

/**
 * Get search analytics data
 * @param {string} dataType Type of data to retrieve
 * @returns {Array|Object} Requested analytics data
 */
export const getAnalyticsData = (dataType = 'all') => {
  switch (dataType) {
    case 'searches':
      return [...analyticsStore.searches];
    case 'interactions':
      return [...analyticsStore.interactions];
    case 'feedback':
      return [...analyticsStore.feedback];
    case 'preferences':
      return { ...analyticsStore.preferences };
    case 'all':
    default:
      return { ...analyticsStore };
  }
};

/**
 * Clear analytics data
 * @param {string} dataType Type of data to clear
 */
export const clearAnalyticsData = (dataType = 'all') => {
  switch (dataType) {
    case 'searches':
      analyticsStore.searches = [];
      break;
    case 'interactions':
      analyticsStore.interactions = [];
      break;
    case 'feedback':
      analyticsStore.feedback = [];
      break;
    case 'preferences':
      analyticsStore.preferences = {};
      break;
    case 'all':
    default:
      analyticsStore = {
        searches: [],
        interactions: [],
        feedback: [],
        preferences: {}
      };
      break;
  }
  
  log.debug('Analytics data cleared:', dataType);
  
  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('search-analytics-updated', {
    detail: { type: 'clear', dataType }
  }));
};

/**
 * Generate a unique event ID
 * @returns {string} Unique ID
 */
const generateEventId = () => {
  return 'ev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

/**
 * Search analytics tracking component
 * @param {Object} props Component props
 * @param {string} props.query Current search query
 * @param {Array} props.results Search results
 * @param {Object} props.options Component options
 * @returns {JSX.Element} Rendered component
 */
const SearchAnalytics = ({ 
  query, 
  results, 
  options = {} 
}) => {
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const previousQueryRef = useRef(null);
  
  // Extract options with defaults
  const {
    automaticTracking = true,
    showFeedbackPrompt = true,
    feedbackDelay = 10000, // 10 seconds
    minimalist = false
  } = options;
  
  // Track new searches
  useEffect(() => {
    if (!automaticTracking || !query || query === previousQueryRef.current) {
      return;
    }
    
    const searchMetadata = {
      resultCount: results ? results.length : 0,
      hasResults: results && results.length > 0,
      timestamp: new Date().toISOString()
    };
    
    const searchId = trackSearch(query, searchMetadata);
    setCurrentSearchId(searchId);
    previousQueryRef.current = query;
    
    // Show feedback prompt after delay
    if (showFeedbackPrompt) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, feedbackDelay);
      
      return () => clearTimeout(timer);
    }
  }, [query, results, automaticTracking, showFeedbackPrompt, feedbackDelay]);
  
  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (!feedbackType) return;
    
    recordFeedback(feedbackType, {
      comment: feedbackComment,
      query,
      resultCount: results ? results.length : 0
    }, currentSearchId);
    
    // Reset feedback state
    setFeedbackType(null);
    setFeedbackComment('');
    setShowFeedback(false);
  };
  
  // Handle feedback dismissal
  const handleFeedbackDismiss = () => {
    setShowFeedback(false);
  };
  
  // Don't render anything in minimalist mode
  if (minimalist) {
    return null;
  }
  
  // Render feedback prompt
  return (
    <>
      {showFeedback && (
        <div className="feedback-prompt" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: '15px',
          width: '300px',
          zIndex: 1000
        }}>
          <div className="feedback-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>
              How helpful were these results?
            </h4>
            <button
              onClick={handleFeedbackDismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#999'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="feedback-options" style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <button
              onClick={() => setFeedbackType('helpful')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: feedbackType === 'helpful' ? '#E6F4EA' : '#f2f2f2',
                cursor: 'pointer',
                color: feedbackType === 'helpful' ? '#0F9D58' : '#666'
              }}
            >
              👍 Helpful
            </button>
            <button
              onClick={() => setFeedbackType('somewhat')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: feedbackType === 'somewhat' ? '#FEF7E0' : '#f2f2f2',
                cursor: 'pointer',
                color: feedbackType === 'somewhat' ? '#F4B400' : '#666'
              }}
            >
              😐 Somewhat
            </button>
            <button
              onClick={() => setFeedbackType('not_helpful')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: feedbackType === 'not_helpful' ? '#FCE8E6' : '#f2f2f2',
                cursor: 'pointer',
                color: feedbackType === 'not_helpful' ? '#DB4437' : '#666'
              }}
            >
              👎 Not Helpful
            </button>
          </div>
          
          {feedbackType && (
            <>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us more (optional)"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minHeight: '60px',
                  marginBottom: '10px',
                  resize: 'vertical'
                }}
              />
              
              <button
                onClick={handleFeedbackSubmit}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Submit Feedback
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SearchAnalytics;
