/**
 * LLM Category Visibility Test
 * 
 * This script helps verify that LLM categories are properly displayed in the React UI.
 * Run this in the browser console when viewing a page with search results.
 */

function testLLMCategoryVisibility() {
  console.log('=== LLM CATEGORY VISIBILITY TEST ===');
  
  // Check if LLM container exists and is visible
  const llmContainer = document.querySelector('[data-testid="llm-results-container"]');
  console.log('LLM Container:', {
    exists: !!llmContainer,
    visible: !!llmContainer && window.getComputedStyle(llmContainer).display !== 'none',
    width: llmContainer?.offsetWidth,
    height: llmContainer?.offsetHeight
  });
  
  // Check if LLM categorized results component exists and is visible
  const llmCategorizedResults = document.querySelector('[data-testid="llm-categorized-results"]');
  console.log('LLM Categorized Results:', {
    exists: !!llmCategorizedResults,
    visible: !!llmCategorizedResults && window.getComputedStyle(llmCategorizedResults).display !== 'none',
    width: llmCategorizedResults?.offsetWidth,
    height: llmCategorizedResults?.offsetHeight
  });
  
  // Check if LLM category tabs component exists and is visible
  const llmCategoryTabs = document.querySelector('[data-testid="llm-category-tabs"]');
  console.log('LLM Category Tabs:', {
    exists: !!llmCategoryTabs,
    visible: !!llmCategoryTabs && window.getComputedStyle(llmCategoryTabs).display !== 'none',
    width: llmCategoryTabs?.offsetWidth,
    height: llmCategoryTabs?.offsetHeight
  });
  
  // Check for individual category tabs
  const categoryTabs = document.querySelectorAll('[data-testid^="llm-category-"]');
  console.log('Category Tabs:', {
    count: categoryTabs.length,
    tabIds: Array.from(categoryTabs).map(tab => tab.getAttribute('data-testid')),
    allVisible: Array.from(categoryTabs).every(tab => window.getComputedStyle(tab).display !== 'none')
  });
  
  // Check tab clicks function
  if (categoryTabs.length > 0) {
    console.log('Testing tab click...');
    const firstTab = categoryTabs[0];
    const secondTab = categoryTabs[1];
    
    if (firstTab && secondTab) {
      console.log('Initial selected tab:', document.querySelector('[aria-selected="true"]')?.getAttribute('data-category-name'));
      
      // Click the second tab
      secondTab.click();
      
      // Check if selection changed
      setTimeout(() => {
        console.log('Tab after click:', document.querySelector('[aria-selected="true"]')?.getAttribute('data-category-name'));
        console.log('Tab switching test complete');
      }, 100);
    }
  }
  
  console.log('=== TEST COMPLETE ===');
  return {
    hasLLMContainer: !!llmContainer,
    hasLLMCategorizedResults: !!llmCategorizedResults,
    hasLLMCategoryTabs: !!llmCategoryTabs,
    categoryTabCount: categoryTabs.length,
    allComponentsVisible: (
      !!llmContainer && 
      window.getComputedStyle(llmContainer).display !== 'none' &&
      !!llmCategorizedResults && 
      window.getComputedStyle(llmCategorizedResults).display !== 'none' &&
      !!llmCategoryTabs && 
      window.getComputedStyle(llmCategoryTabs).display !== 'none'
    )
  };
}

// Make the test available in the global scope
window.testLLMCategoryVisibility = testLLMCategoryVisibility;

console.log('LLM Category Visibility Test loaded! Run window.testLLMCategoryVisibility() to execute the test.');

// You can call this function whenever you want to check LLM category visibility
// testLLMCategoryVisibility();
