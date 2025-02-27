# Search Engine Metrics System

This document provides detailed information about the search engine's metrics calculation system, including the scoring methodology, components, and implementation details.

## Overview

The search engine metrics system evaluates search results across three primary dimensions:

1. **Relevance**: How well the result matches the user's query
2. **Accuracy**: How factually correct and reliable the result is
3. **Credibility**: How trustworthy the source and content are

Each dimension is calculated independently and then combined into an overall score that determines result ranking and filtering.

## Architecture

The metrics system follows a modular architecture with clear separation of concerns:

```
/src/components/search/metrics/
├── MetricsCalculator.js         # Main orchestration
├── calculators/
│   ├── RelevanceCalculator.js   # Relevance scoring
│   ├── AccuracyCalculator.js    # Accuracy scoring
│   └── CredibilityCalculator.js # Credibility scoring
└── utils/
    ├── calculatorUtils.js       # Shared utility functions
    ├── calculatorData.js        # Constants and configuration
    └── contextDetector.js       # Query context detection
```

## Scoring Methodology

### Score Types

1. **Relevance Score (0-100)**
   - Measures how well a result matches the user's query
   - Considers query term matching, recency, and content quality
   - Adjusts based on domain-specific relevance and personalization

2. **Accuracy Score (0-100)**
   - Measures factual correctness and reliability
   - Considers data verification, source reliability, and factual consistency
   - Includes external validation from fact-checking sources

3. **Credibility Score (0-100)**
   - Measures trustworthiness of the source and content
   - Considers source reputation, author expertise, and citation quality
   - Includes verification factors like peer review status

4. **Overall Score (0-100)**
   - Weighted average of the three primary scores
   - Weights vary based on query context (financial, medical, etc.)
   - User preferences can adjust weights

### Context Detection

The system detects the context of a query to apply appropriate scoring weights:

- **Financial**: Prioritizes accuracy and credibility for financial queries
- **Medical**: Heavily weights accuracy and credibility for health-related queries
- **News**: Balances recency, accuracy, and source credibility
- **Technical**: Emphasizes accuracy and relevance for technical topics
- **Academic**: Prioritizes credibility and accuracy for scholarly topics
- **General**: Applies balanced weights when no specific context is detected

Default context weights:

| Context   | Relevance | Accuracy | Credibility |
|-----------|-----------|----------|-------------|
| Financial | 30%       | 40%      | 30%         |
| Medical   | 25%       | 40%      | 35%         |
| News      | 40%       | 30%      | 30%         |
| Technical | 35%       | 40%      | 25%         |
| Academic  | 25%       | 35%      | 40%         |
| General   | 33%       | 33%      | 34%         |

## Calculation Details

### Relevance Calculation

Relevance score combines:
- **Query Match Score**: How well the result matches query terms
- **Recency Score**: How recent the content is
- **Content Quality Score**: Content length, structure, and details
- **Domain-Specific Score**: Relevance to specific domains
- **Personalization Boost**: User preference adjustments

### Accuracy Calculation

Accuracy score combines:
- **Data Verification Score**: Presence of verifiable data
- **Source Reliability Score**: Reliability of the source
- **Factual Consistency Score**: Internal consistency
- **External Validation Score**: Verification from external sources

### Credibility Calculation

Credibility score combines:
- **Source Reputation Score**: Reputation of the domain
- **Author Expertise Score**: Author credentials and expertise
- **Citation Quality Score**: Quality and quantity of citations
- **Verification Factors Score**: Peer review, editorial oversight

## Implementation

### MetricsCalculator.js

The main orchestration component that:
- Detects query context
- Gets appropriate weights
- Applies user preferences
- Calls individual calculator functions
- Calculates overall score
- Checks thresholds
- Provides frontend-ready data (colors, labels)

### Utility Functions

- **Data Type Checking**: Functions to check for numbers, dates, etc.
- **Recency Scoring**: Calculate scores based on content age
- **Domain Matching**: Check if a source matches specific domains
- **Score Normalization**: Ensure scores are within 0-100 range

### Frontend Integration

The metrics system provides several frontend-ready outputs:

- **Score Colors**: Visual indicators based on score ranges
- **Score Labels**: Text labels (Excellent, Good, Fair, etc.)
- **Filtering**: Functions to filter results below thresholds
- **Sorting**: Functions to sort results by specific metrics

## Usage

```javascript
// Example usage in a component
import { calculateAllMetrics } from '../metrics/MetricsCalculator';

// Calculate metrics for a search result
const metrics = calculateAllMetrics(result, query, userPreferences);

// Use metrics for display
const { relevanceScore, accuracyScore, credibilityScore, overallScore } = metrics;
const relevanceColor = metrics.relevanceColor;
const relevanceLabel = metrics.relevanceLabel;

// Filter results below threshold
const filteredResults = filterResultsByMetrics(results, minThreshold);

// Sort results by a specific metric
const sortedResults = sortResultsByMetrics(results, 'overallScore');
```

## Thresholds

The system enforces minimum thresholds for displaying results:
- Default display threshold: 70%
- Configurable per metric type
- Can be adjusted based on user preferences

## Future Enhancements

Planned improvements to the metrics system:
1. Machine learning integration for more accurate scoring
2. Expanded context detection with more granular categories
3. User feedback incorporation to improve scoring accuracy
4. Additional metric types for specific domains
5. Performance optimization for large result sets
