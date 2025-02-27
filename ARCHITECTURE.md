# Research Hub Search Application Architecture

This document provides a comprehensive overview of the Research Hub Search Application architecture, including its components, data flow, and design principles.

## System Overview

The Research Hub Search Application is designed as a modular, component-based system that integrates multiple data sources, applies sophisticated processing, and presents unified results to the user. The architecture follows these key design principles:

1. **Modularity**: Components are designed with clear boundaries and responsibilities
2. **Separation of Concerns**: Each module focuses on a specific aspect of functionality
3. **Extensibility**: The system can be easily extended with new sources and features
4. **Maintainability**: Code organization promotes readability and ease of maintenance

## High-Level Architecture

```
Research Hub Search Application
├── Frontend (Next.js/React)
│   ├── Search Interface
│   ├── Results Display
│   └── UI Components
├── Backend (Node.js)
│   ├── API Routes
│   ├── Source Handlers
│   └── LLM Integration
└── Utilities
    ├── Rate Limiting
    ├── Error Handling
    └── Data Processing
```

## Component Architecture

### Search System

The search system is organized into modular components:

```
/src/components/search/
├── categorization/           # Result categorization
│   ├── CategoryFinder.js     # Identifies categories
│   ├── DynamicCategorizer.js # Dynamic categorization
│   ├── CategoryDisplay.js    # UI for categories
│   └── index.js              # Centralized exports
├── metrics/                  # Result scoring
│   ├── calculators/          # Score calculators
│   │   ├── RelevanceCalculator.js
│   │   ├── AccuracyCalculator.js
│   │   └── CredibilityCalculator.js
│   ├── utils/                # Utility functions
│   │   ├── calculatorUtils.js
│   │   ├── calculatorData.js
│   │   └── contextDetector.js
│   ├── MetricsCalculator.js  # Main metrics orchestration
│   └── index.js              # Centralized exports
├── sources/                  # Source management
│   ├── SourceDisplay.js      # UI for sources
│   └── index.js              # Centralized exports
└── LLMResults.unified.js     # Unified results display
```

### Source Integration

The source integration system handles different data sources:

```
/src/utils/sources/
├── webHandlers.js            # Web search handlers
├── financialHandlers.js      # Financial data handlers
├── verifiedHandlers.js       # Verified source handlers
├── customHandlers.js         # Custom source handlers
└── index.js                  # Centralized exports
```

### Verified Sources

The verified sources system manages trusted data sources:

```
/src/utils/verifiedSources/
├── sourceLists.js            # Lists of verified sources
└── index.js                  # Centralized exports
```

## Data Flow

1. **User Query**
   - User enters a search query
   - Query is processed and context is detected

2. **Source Selection**
   - Appropriate sources are selected based on query context
   - API calls are prepared with appropriate parameters

3. **Parallel Processing**
   - Multiple API calls are made in parallel
   - Rate limiting is applied as needed
   - Results are collected as they arrive

4. **Result Processing**
   - Results are normalized to a common format
   - Metrics are calculated for each result
   - Results are categorized and filtered

5. **LLM Enhancement** (optional)
   - Results are sent to LLM for synthesis
   - LLM generates a comprehensive answer
   - Sources are attributed properly

6. **Result Display**
   - Results are displayed to the user
   - Metrics and categories are shown
   - Sources are properly attributed

## Metrics System

The metrics system evaluates search results across three dimensions:

1. **Relevance**: How well the result matches the user's query
2. **Accuracy**: How factually correct and reliable the result is
3. **Credibility**: How trustworthy the source and content are

The metrics calculation follows this process:

1. Query context is detected (financial, medical, etc.)
2. Context-specific weights are applied
3. Individual metrics are calculated
4. Overall score is computed as a weighted average
5. Results below thresholds are filtered out

See [METRICS_SYSTEM.md](./docs/METRICS_SYSTEM.md) for detailed documentation.

## Design Decisions

### Modular Calculator Functions

The metrics system uses separate calculator modules for each metric type, allowing:
- Independent development and testing
- Clear separation of concerns
- Easier maintenance and updates

### Context-Aware Scoring

The system detects query context to apply appropriate weights:
- Financial queries prioritize accuracy and credibility
- Medical queries heavily weight accuracy and credibility
- News queries balance recency, accuracy, and source credibility

### Centralized Configuration

Constants and configuration data are centralized in dedicated files:
- Easier to update thresholds and weights
- Consistent application of rules
- Simplified maintenance

## Implementation Constraints

The implementation adheres to these constraints:

1. Files are kept under 400 lines when possible
2. Only the LLM/search results section is modified
3. All code is in the main branch
4. No test code, test pages, or mock data
5. Real data and APIs are used
6. Local development on the main website

## Future Architecture Enhancements

Planned architectural improvements:

1. **Machine Learning Integration**
   - ML-based scoring for more accurate results
   - Automated context detection

2. **Expanded Source Handlers**
   - Additional specialized source handlers
   - More granular source categorization

3. **Enhanced Personalization**
   - User preference storage and application
   - Learning from user interactions

4. **Performance Optimization**
   - Caching frequently accessed data
   - Optimizing parallel processing

5. **Comprehensive Testing**
   - Unit tests for all components
   - Integration tests for data flow
