# Category Troubleshooting Guide

This document provides guidance for troubleshooting category display issues in the search application. It covers common problems, diagnostic steps, and solutions related to the category display system.

## Category Flow Overview

The category system flows through these components:

1. **API Layer** (`/pages/api/search/index.js`): Categories are generated via CategoryProcessor
2. **Search Flow Helper** (`/utils/search/searchFlowHelper.js`): `executeSearch` extracts categories from API response
3. **VerifiedSearch** component adds categories to chat history
4. **SearchResultsWrapper** passes categories to IntelligentSearchResults
5. **IntelligentSearchResults** processes categories via `generateCategories`
6. **ModernCategoryDisplay** renders categories through CategoryRibbon

## Common Issues and Solutions

### 1. Categories Not Displaying

**Symptoms:** Empty category ribbon, missing category tabs, or only default categories shown.

**Troubleshooting Steps:**

1. Check API response:
   ```javascript
   // In the browser console
   fetch('/api/search', {
     method: 'POST', 
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({query: 'your test query', mode: 'verified'})
   }).then(r => r.json()).then(console.log)
   ```

2. Verify that categories are included in the response.

3. Check ModernCategoryDisplay component:
   - Open browser developer tools
   - Look for console logs: "ModernCategoryDisplay received X categories"
   - If missing, check the component chain from API to display

### 2. Wrong Categories Order

**Symptoms:** Key Insights category is not the first category in the display.

**Solution:**
- Key Insights should be prioritized at three levels:
  1. In the API response via `prioritizeKeyInsights` function
  2. In IntelligentSearchResults via `limitCategories` function
  3. In ModernCategoryDisplay via the ordering useEffect

### 3. Too Many Categories

**Symptoms:** Category display is cluttered or extends beyond a single row.

**Solution:**
- Categories are limited to maximum 6 categories
- This limiting happens in:
  1. IntelligentSearchResults.js in the `limitCategories` function
  2. ModernCategoryDisplay.js in the useEffect with `options.limitCategories`

## Verification Script

Use the `scripts/verify-category-display.js` script to test category generation and display:

```bash
node scripts/verify-category-display.js "your test query"
```

This script tests both mock categories and real API responses, checking:
1. Category limiting (max 6)
2. Key Insights prioritization
3. Proper category generation

## Debug Logging

Enable enhanced category debugging by adding these query parameters:
- `?logCategories=true`: Logs detailed category information
- `?debugCategories=true`: Adds visual debugging to category display

Example: `http://localhost:3003/?logCategories=true&debugCategories=true`

## Fallback Systems

The application has several category fallback mechanisms:

1. **API Fallbacks:** If category generation fails, a default "Search Results" category is created
2. **IntelligentSearchResults Fallbacks:** If API categories are empty, generates basic categories
3. **ModernCategoryDisplay Fallbacks:** If all else fails, creates minimal Key Insights and All Results categories

## Category Metrics

Categories are scored and sorted based on these metrics:
- `relevance`: How relevant the category is to the query
- `accuracy`: How accurately the content matches the category
- `credibility`: Source credibility factors
- `overall`: Combined score used for sorting

Higher metrics scores (closer to 1.0) result in higher category ranking.

## Emergency Reset

If category display becomes completely broken, try these steps:

1. Clear browser cache and local storage
2. Restart the development server: `./scripts/restart-server.sh`
3. Force regenerate categories by adding `?forceRegenCategories=true` to the URL
