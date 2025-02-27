/**
 * FixedCategorizedContent.js
 * Improved content categorization with DOM-based HTML processing
 * Enhanced with intelligent category detection and content analysis
 */

import { processHtml, extractKeyTerms } from '../../../utils/htmlProcessorSimple';
import { createDynamicCategoriesFromText } from './DynamicCategorizer';
import { getContextAwareCategories } from './ContextAnalyzer';
import { findBestCategory } from './CategoryFinder';

/**
 * Display categorized content from LLM results
 * @param {Object|string} llmResults - The LLM results to categorize
 * @returns {Array} - Array of category objects
 */
export const displayCategorizedContent = (llmResults) => {
  // Default categories array for the unified format
  let categories = [];
  
  try {
    // Handle null or undefined input
    if (!llmResults) {
      console.warn("displayCategorizedContent received null or undefined input");
      return [{
        name: 'Key Insights',
        content: 'No content available',
        sources: [],
        metrics: { relevance: 0.5, credibility: 0.5, accuracy: 0.5 }
      }];
    }
    
    // Extract sources if available
    let sources = [];
    if (typeof llmResults === 'object') {
      sources = llmResults.sources || [];
    }
    
    // Handle string input - Split into multiple categories
    if (typeof llmResults === 'string') {
      console.log("displayCategorizedContent: Processing string input");
      
      // Process the content with hyperlinks
      const processedContent = processHtml(llmResults, sources);
      
      // Split content into sections for categorization
      return createDynamicCategoriesFromText(processedContent, sources);
    }
    
    // Handle object with summary property
    if (typeof llmResults === 'object' && llmResults.summary) {
      console.log("displayCategorizedContent: Processing object with summary property");
      
      // Extract sources if available
      sources = llmResults.sources || [];
      
      // Process the summary with hyperlinks
      const processedSummary = processHtml(llmResults.summary, sources);
      
      // Create the main category from summary
      categories.push({
        name: 'Key Insights',
        content: processedSummary,
        sources: sources,
        metrics: { relevance: 0.85, credibility: 0.8, accuracy: 0.8 }
      });
      
      // Add sections as additional categories if available
      if (llmResults.sections && Array.isArray(llmResults.sections) && llmResults.sections.length > 0) {
        console.log("Processing sections:", llmResults.sections);
        llmResults.sections.forEach(section => {
          if (section.title && section.content) {
            // Process section content with hyperlinks
            const processedContent = processHtml(section.content, section.sources || sources);
            
            categories.push({
              name: section.title,
              content: processedContent,
              sources: section.sources || sources,
              metrics: { 
                relevance: 0.8, 
                credibility: 0.75, 
                accuracy: 0.75 
              }
            });
          }
        });
      } else {
        // If no sections, create additional categories from the summary
        const additionalCategories = createDynamicCategoriesFromText(processedSummary, sources, 3, ['Key Insights']);
        categories = [...categories, ...additionalCategories];
      }
      
      console.log("Final categories:", categories);
      return categories;
    }
    
    // Handle array input
    if (Array.isArray(llmResults)) {
      console.log("displayCategorizedContent: Processing array input");
      llmResults.forEach(item => {
        const category = item.category || item.title || 'Key Insights';
        let content = item.content || item.text || '';
        
        // Process content with hyperlinks
        content = processHtml(content, item.sources || sources);
        
        categories.push({
          name: category,
          content: content,
          sources: item.sources || sources,
          metrics: item.metrics || { 
            relevance: 0.8, 
            credibility: 0.7, 
            accuracy: 0.75 
          }
        });
      });
      
      // If we have fewer than 3 categories, create additional ones
      if (categories.length < 3) {
        // Combine all content for analysis
        const combinedContent = categories.map(cat => cat.content).join('\n\n');
        const existingNames = categories.map(cat => cat.name);
        
        // Create additional categories
        const additionalCategories = createDynamicCategoriesFromText(
          combinedContent, 
          sources, 
          4 - categories.length,
          existingNames
        );
        
        categories = [...categories, ...additionalCategories];
      }
      
      console.log("Final categories:", categories);
      return categories;
    }
    
    // Fallback for other object types - Create multiple categories
    console.log("displayCategorizedContent: Fallback for other object types");
    
    // Convert object to string for processing
    const contentStr = typeof llmResults === 'object' ? JSON.stringify(llmResults) : String(llmResults);
    
    // Create dynamic categories
    return createDynamicCategoriesFromText(contentStr, sources);
    
  } catch (error) {
    console.error("Error in displayCategorizedContent:", error);
    return [{
      name: 'Key Insights',
      content: 'Error processing content',
      sources: [],
      metrics: { relevance: 0.5, credibility: 0.5, accuracy: 0.5 }
    }];
  }
};

/**
 * Process uncategorized content into categorized format
 * @param {Object|string} content - The content to categorize
 * @returns {Object} - Object with categorizedContent and orderedCategories
 */
export const processUncategorizedContent = (content) => {
  // Default structure
  const categorizedContent = {
    'Key Insights': { 
      content: '',
      sources: [],
      metrics: { relevance: 0.5, credibility: 0.5, accuracy: 0.5 }
    }
  };
  
  const orderedCategories = ['Key Insights'];
  
  try {
    // Handle null or undefined input
    if (!content) {
      console.warn("processUncategorizedContent received null or undefined input");
      categorizedContent['Key Insights'].content = 'No content available';
      return { categorizedContent, orderedCategories };
    }
    
    // Handle string input
    if (typeof content === 'string') {
      categorizedContent['Key Insights'].content = content;
      return { categorizedContent, orderedCategories };
    }
    
    // Handle array input
    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        if (typeof item === 'string') {
          // Simple string items go into Key Insights
          categorizedContent['Key Insights'].content += item + '\n\n';
        } else if (typeof item === 'object') {
          // Object items with title/content become categories
          const categoryName = item.title || item.category || `Category ${index + 1}`;
          
          if (!categorizedContent[categoryName]) {
            categorizedContent[categoryName] = {
              content: '',
              sources: item.sources || [],
              metrics: item.metrics || { relevance: 0.5, credibility: 0.5, accuracy: 0.5 }
            };
            orderedCategories.push(categoryName);
          }
          
          categorizedContent[categoryName].content += (item.content || item.text || JSON.stringify(item)) + '\n\n';
        }
      });
      
      return { categorizedContent, orderedCategories };
    }
    
    // Handle object input
    for (const [key, value] of Object.entries(content)) {
      // Skip non-content properties
      if (typeof value !== 'string' && typeof value !== 'object') continue;
      if (key === 'type' || key === 'id' || key === 'metadata') continue;
      
      // Create a category for each key-value pair
      const categoryName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
      
      if (!categorizedContent[categoryName]) {
        categorizedContent[categoryName] = {
          content: '',
          sources: content.sources || [],
          metrics: { relevance: 0.5, credibility: 0.5, accuracy: 0.5 }
        };
        orderedCategories.push(categoryName);
      }
      
      if (typeof value === 'string') {
        categorizedContent[categoryName].content += value;
      } else if (typeof value === 'object') {
        categorizedContent[categoryName].content += JSON.stringify(value, null, 2);
      }
    }
    
    return { categorizedContent, orderedCategories };
  } catch (error) {
    console.error("Error in processUncategorizedContent:", error);
    
    // Fallback for error case
    categorizedContent['Key Insights'].content = typeof content === 'string' 
      ? content 
      : 'Error processing content';
    
    return { categorizedContent, orderedCategories };
  }
};

/**
 * Creates categorized content from LLM response
 * @param {string|Object} content - The content to categorize
 * @returns {Object} - Categorized content object
 */
export const createCategorizedContent = (content) => {
  return displayCategorizedContent(content);
};

/**
 * Analyze query context and adjust categories accordingly
 * @param {string} query - The search query
 * @param {Array} defaultCategories - Default categories list
 * @returns {Array} - Adjusted categories list based on query context
 */
export const adjustCategoriesByQueryContext = (query, defaultCategories) => {
  // Implement logic to adjust categories based on query context
  // For now, just return the default categories
  return defaultCategories;
};

/**
 * Process any content that wasn't properly categorized
 * @param {Object} results - The results object to modify
 * @param {Object} llmResults - Original LLM results
 */
export const processUncategorizedContentHelper = (results, llmResults) => {
  // Extract sources if available
  let sources = [];
  if (llmResults.sources) {
    sources = llmResults.sources;
  }
  
  // Process sections if available
  if (llmResults.sections && Array.isArray(llmResults.sections)) {
    llmResults.sections.forEach(section => {
      const content = section.content || section.text || '';
      const title = section.title || '';
      const sectionSources = section.sources || sources;
      
      // Find the best category based on content and title
      const category = section.category || findBestCategory(content, title);
      
      if (!results[category]) {
        results[category] = [];
      }
      
      results[category].push({
        content,
        sources: sectionSources,
        metrics: section.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
      });
    });
  }
  
  // Process items if available
  if (llmResults.items && Array.isArray(llmResults.items)) {
    llmResults.items.forEach(item => {
      const content = item.content || item.text || '';
      const title = item.title || '';
      const itemSources = item.sources || sources;
      
      // Find the best category based on content and title
      const category = item.category || findBestCategory(content, title);
      
      if (!results[category]) {
        results[category] = [];
      }
      
      results[category].push({
        content,
        sources: itemSources,
        metrics: item.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
      });
    });
  }
  
  // Process results if available
  if (llmResults.results && Array.isArray(llmResults.results)) {
    llmResults.results.forEach(result => {
      const content = result.content || result.text || result.snippet || '';
      const title = result.title || '';
      const resultSources = result.sources || sources;
      
      // Find the best category based on content and title
      const category = result.category || findBestCategory(content, title);
      
      if (!results[category]) {
        results[category] = [];
      }
      
      results[category].push({
        content,
        sources: resultSources,
        metrics: result.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
      });
    });
  }
  
  // Process summary if available
  if (llmResults.summary) {
    results['Key Insights'].push({
      content: llmResults.summary,
      sources: sources,
      metrics: { relevance: 0.9, credibility: 0.8, accuracy: 0.85 }
    });
  }
  
  // Process analysis if available
  if (llmResults.analysis) {
    results['Analysis'].push({
      content: llmResults.analysis,
      sources: sources,
      metrics: { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
    });
  }
  
  // Process examples if available
  if (llmResults.examples && Array.isArray(llmResults.examples)) {
    llmResults.examples.forEach(example => {
      results['Example'].push({
        content: typeof example === 'string' ? example : example.content || example.text || '',
        sources: example.sources || sources,
        metrics: example.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
      });
    });
  }
  
  // Process synthesizedAnswer if available (nested structure)
  if (llmResults.synthesizedAnswer) {
    const answer = llmResults.synthesizedAnswer;
    
    if (answer.summary) {
      results['Key Insights'].push({
        content: answer.summary,
        sources: answer.sources || sources,
        metrics: answer.metrics || { relevance: 0.9, credibility: 0.8, accuracy: 0.85 }
      });
    }
    
    if (answer.content) {
      results['Overview'].push({
        content: answer.content,
        sources: answer.sources || sources,
        metrics: answer.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
      });
    }
    
    if (answer.sections && Array.isArray(answer.sections)) {
      answer.sections.forEach(section => {
        const content = section.content || section.text || '';
        const title = section.title || '';
        const sectionSources = section.sources || answer.sources || sources;
        
        // Find the best category based on content and title
        const category = section.category || findBestCategory(content, title);
        
        if (!results[category]) {
          results[category] = [];
        }
        
        results[category].push({
          content,
          sources: sectionSources,
          metrics: section.metrics || { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
        });
      });
    }
  }
};

/**
 * Add dynamic categories based on sources
 * @param {Object} results - The results object to modify
 * @param {Array} sources - Array of sources
 */
export const addDynamicCategories = (results, sources) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return;
  }
  
  // Group sources by type
  const sourcesByType = {};
  
  sources.forEach(source => {
    if (!source || !source.type) return;
    
    if (!sourcesByType[source.type]) {
      sourcesByType[source.type] = [];
    }
    
    sourcesByType[source.type].push(source);
  });
  
  // Create categories based on source types
  for (const [type, typeSources] of Object.entries(sourcesByType)) {
    if (typeSources.length === 0) continue;
    
    // Map source types to appropriate categories
    let category;
    
    switch (type.toLowerCase()) {
      case 'research':
      case 'paper':
      case 'journal':
      case 'study':
        category = 'Research';
        break;
      case 'news':
      case 'article':
      case 'blog':
        category = 'Industry Perspectives';
        break;
      case 'documentation':
      case 'doc':
      case 'manual':
        category = 'Definition';
        break;
      case 'example':
      case 'sample':
      case 'demo':
        category = 'Example';
        break;
      case 'case study':
      case 'case-study':
        category = 'Case Studies';
        break;
      default:
        continue; // Skip unknown types
    }
    
    // Add sources to the appropriate category
    if (!results[category]) {
      results[category] = [];
    }
    
    // Create content from sources
    const content = typeSources.map(source => {
      return `Source: ${source.title || source.url || 'Unknown'}\n${source.snippet || ''}`;
    }).join('\n\n');
    
    results[category].push({
      content,
      sources: typeSources,
      metrics: { relevance: 0.8, credibility: 0.7, accuracy: 0.75 }
    });
  }
};

/**
 * Component to display categorized content
 * @param {Object} props Component props
 * @param {Array} props.categories Array of category objects with name and content
 * @returns {JSX.Element} Category display component
 */
export const CategoriesDisplay = (props) => {
  const { categories } = props;
  const [activeCategory, setActiveCategory] = useState(0);

  if (!categories || categories.length === 0) {
    return <div className="text-gray-500">No categorized content available</div>;
  }

  return (
    <div className="categories-container">
      <div className="category-tabs flex flex-wrap gap-2 mb-4">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeCategory === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveCategory(index)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="category-content">
        {categories[activeCategory]?.content.map((item, index) => (
          <div key={index} className="mb-4">
            <p className="text-gray-800">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesDisplay;
