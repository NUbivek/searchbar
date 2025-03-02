/**
 * This file contains the essential tab-related code for SimpleLLMResults.js
 * To be integrated into the clean codebase after restoration
 */

// Function to format categories into tabs for TabNavigation
const formatCategoriesAsTabs = (categories, results) => {
  if (!categories || categories.length === 0) {
    // If no categories, show just results
    return [{
      id: 'all',
      label: 'All Results',
      content: (
        <div className={styles.allResultsContent}>
          {Array.isArray(results) && results.length > 0 ? (
            results.map((result, index) => (
              <div key={`result-${index}`} className={styles.resultItem}>
                <ExpandableContent content={result} />
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No results available</div>
          )}
        </div>
      )
    }];
  }

  // Process categories into tabs
  const tabs = categories.map(category => ({
    id: category.id || `category-${category.title.toLowerCase().replace(/\s+/g, '-')}`,
    label: category.title || 'Unnamed Category',
    content: (
      <div className={styles.categoryContent}>
        <ExpandableContent content={category.content} />
      </div>
    )
  }));

  // Add "All Results" tab if we have raw results
  if (Array.isArray(results) && results.length > 0) {
    tabs.push({
      id: 'all',
      label: 'All Results',
      content: (
        <div className={styles.allResultsContent}>
          {results.map((result, index) => (
            <div key={`result-${index}`} className={styles.resultItem}>
              <ExpandableContent content={result} />
            </div>
          ))}
        </div>
      )
    });
  }

  return tabs;
};

// Code snippet to be added to SimpleLLMResults component
const tabsImplementation = `
  // Format categories for display
  const [formattedCategories, setFormattedCategories] = useState([]);
  const [allResultsTab, setAllResultsTab] = useState(null);
  
  // Format categories into tabs for display
  useEffect(() => {
    // Process categories first
    let categoriesToProcess = [];
    
    if (Array.isArray(categories) && categories.length > 0) {
      categoriesToProcess = categories;
    } else if (props.categories) {
      categoriesToProcess = props.categories;
    }
    
    // Format as tabs
    const tabs = formatCategoriesAsTabs(categoriesToProcess, results);
    setFormattedCategories(tabs);
  }, [categories, results, props.categories]);

  // Render component with TabNavigation
  return (
    <div className={styles.container} data-testid="llm-results">
      {/* Render compact query text if provided */}
      {query && (
        <div className={styles.compactQueryInfo}>
          <span className={styles.queryLabel}>Query: </span>
          <span className={styles.queryText}>{query}</span>
        </div>
      )}
      
      {/* Render tab navigation with categories */}
      {showTabs && formattedCategories.length > 0 && (
        <TabNavigation 
          tabs={formattedCategories} 
          defaultTabId="key_insights"
        />
      )}
      
      {/* If not showing tabs, just show the content directly */}
      {!showTabs && formattedCategories.length > 0 && (
        <div className={styles.noTabsContent}>
          {formattedCategories[0].content}
        </div>
      )}
      
      {/* Show no results message if nothing to display */}
      {formattedCategories.length === 0 && (
        <div className={styles.noResults}>
          No results available
        </div>
      )}
    </div>
  );
`;

// Essential styles for SimpleLLMResults.module.css related to tabs
const essentialStyles = `
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.compactQueryInfo {
  margin-bottom: 5px;
  padding: 0;
  font-size: 0.7rem;
  color: #8c96a3;
  font-style: italic;
  display: block;
  background: none;
  border: none;
  text-align: left;
}

.queryLabel {
  display: none;
}

.queryText {
  color: #aaa;
  font-size: 9px;
}

.noTabsContent {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

.categoryContent {
  position: relative;
}

.allResultsContent {
  position: relative;
}

.resultItem {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.resultItem:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.noResults {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}
`;
