# Search Component Architecture

This document provides an overview of the search component architecture, explaining the organization, responsibilities, and relationships between different modules.

## Directory Structure

```
/src/components/search/
├── categories/              # Category-related components and utilities
│   ├── display/             # UI components for displaying categories
│   ├── keywords/            # Keyword definitions for category detection
│   ├── metrics/             # Category-specific metrics calculation
│   ├── processors/          # Content processing and categorization
│   ├── selection/           # Category selection and filtering
│   ├── styles/              # CSS styles for category components
│   ├── types/               # Type definitions and default categories
│   └── utils/               # Utility functions for categories
├── llm/                     # LLM (Large Language Model) processing
├── metrics/                 # Metrics calculation and display
│   ├── calculators/         # Individual metric calculators
│   ├── data/                # Data for metrics calculation
│   ├── display/             # UI components for metrics display
│   └── utils/               # Utility functions for metrics
├── results/                 # Search results processing and display
└── utils/                   # General utilities for search
    ├── extractors/          # Content extraction utilities
    └── formatters/          # Content formatting utilities
```

## Key Components

### Categories

- **CategoryDisplay.js**: Main component for displaying categorized content
- **CategoryContent.js**: Component for displaying content for a specific category
- **DynamicCategorizer.js**: Dynamically categorizes content based on various criteria

### Processors

- **CategoryProcessor.js**: Processes content to extract and categorize into different categories
- **processCategories()**: Main function for categorizing content
- **processCategory()**: Processes a single category to include business insights

### Metrics

- **MetricsCalculator.js**: Main calculator for all metrics
- **CategoryMetricsCalculator.js**: Category-specific metrics calculation
- **BusinessMetricsCalculator.js**: Business-specific metrics calculation

### Display Components

- **CategoryCard.js**: Modern card-based display for search results
- **BusinessMetricsDisplay.js**: Specialized business metrics visualization
- **CategoryTabs.js**: Tabbed interface for category navigation

## Import Guidelines

To maintain a clean architecture and avoid circular dependencies:

1. Always import from index.js files when accessing components from another directory
2. Avoid direct imports from implementation files across directories
3. Use relative imports (./file) for files in the same directory
4. Use directory imports (../directory) for files in parent/sibling directories

Example:
```javascript
// Good
import { getCategoryColor } from '../utils';

// Avoid
import { getCategoryColor } from '../utils/categoryUtils';
```

## Metrics Calculation

The metrics system follows a hierarchical approach:

1. **Base Metrics**: Calculated by individual calculators in `/metrics/calculators/`
2. **Category Metrics**: Calculated by `CategoryMetricsCalculator.js`
3. **Business Metrics**: Enhanced by `BusinessMetricsCalculator.js`

## Business-Focused Features

The search system includes specialized business features:

- Business insights extraction
- Financial data recognition
- Market trend identification
- Business source quality assessment
- Dynamic business category generation

## Best Practices

1. Keep utility functions in their appropriate directories
2. Avoid duplicate implementations of the same functionality
3. Use consistent naming conventions
4. Document complex functions and components
5. Maintain clear separation of concerns between modules
