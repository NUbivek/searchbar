/**
 * Analytics component exports
 */

export { 
  default as SearchAnalytics, 
  trackSearch, 
  trackInteraction, 
  recordFeedback, 
  updatePreferences,
  getAnalyticsData,
  clearAnalyticsData
} from './SearchAnalytics';

// Default export
export default {
  SearchAnalytics: require('./SearchAnalytics').default,
  trackSearch,
  trackInteraction,
  recordFeedback,
  updatePreferences,
  getAnalyticsData,
  clearAnalyticsData
};
