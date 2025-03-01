/**
 * Index file for source handling components
 */

// Export the source reputation scorer
export { 
  scoreSourceReputation,
  getSourceBadge,
  getRecommendedSources,
  SOURCE_REPUTATION_DB 
} from './SourceReputationScorer';

// Export the enhanced source display
export { default as EnhancedSourceDisplay } from './EnhancedSourceDisplay';

// Default export
export default {
  SourceReputationScorer: require('./SourceReputationScorer').default,
  EnhancedSourceDisplay: require('./EnhancedSourceDisplay').default
};