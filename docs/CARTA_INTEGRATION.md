# Carta Integration Documentation

This document provides details on the Carta integration in the Research Hub Search Application.

## Overview

Carta is a platform that helps private companies and their employees manage equity and ownership. The Research Hub Search Application integrates with Carta to provide users with information about companies, their cap tables, and equity management.

## Integration Details

### Source Handler

The application includes a dedicated source handler for Carta in the `sourceIntegration.js` file:

```javascript
// Website scraping handlers for specific domains
carta: async (query) => {
  try {
    // Use web search to find Carta-related information
    const webResults = await sourceHandlers.web(`${query} site:carta.com`);
    
    // Process and enhance the results
    return webResults.map(result => {
      // Extract company name if possible
      const companyNameMatch = result.title.match(/(.+?)(\s+\|\s+Carta|\s+-\s+Carta|,\s+Carta)/i);
      const companyName = companyNameMatch ? companyNameMatch[1].trim() : null;
      
      // Enhance the content with company information
      const enhancedContent = companyName 
        ? `${result.content}\n\nCompany: ${companyName}\nEquity Management Platform: Carta\nServices: Cap Table Management, Valuations, Equity Plans`
        : result.content;
      
      return {
        ...result,
        content: enhancedContent,
        source: 'carta',
        relevance: result.relevance || 0.8,
        metadata: {
          ...(result.metadata || {}),
          company: companyName,
          platform: 'Carta',
          services: ['Cap Table Management', 'Valuations', 'Equity Plans']
        }
      };
    });
  } catch (error) {
    logger.error('Error in Carta search:', error);
    return [];
  }
}
```

### Source Configuration

Carta is included in the list of available sources in the application:

1. Added to the `mainSources` array in the `SourceSelector` component
2. Added to the `SourceTypes` object in `constants.js`
3. Included in the `VALID_SOURCES` array in the API routes

### Search Process

When a user selects Carta as a source for their search:

1. The application sends a search query to the Carta handler
2. The handler uses web search with a site-specific filter (`site:carta.com`)
3. Results are enhanced with additional company information
4. The enhanced results are returned to the user

### Result Enhancement

The Carta handler enhances search results with:

1. Extracted company names from the result titles
2. Additional context about Carta's services
3. Metadata for improved filtering and display
4. Relevance scores for better ranking

## Usage

Users can select Carta as a source in both the OpenSearch and VerifiedSearch components:

1. In the source selector dropdown
2. As part of multi-source searches
3. For specific company equity information

## Example Queries

Effective queries for the Carta integration include:

1. Company names: "Airbnb Carta"
2. Equity-related terms: "cap table management Carta"
3. Specific equity questions: "409A valuation Carta"
4. Industry-specific searches: "tech startups equity Carta"

## Limitations

Current limitations of the Carta integration:

1. Relies on web search rather than direct API access
2. Limited to publicly available information
3. May not provide real-time data
4. Cannot access private company information

## Future Enhancements

Potential future improvements:

1. Direct API integration with Carta (requires partnership)
2. More sophisticated company name extraction
3. Enhanced filtering for specific equity-related information
4. Integration with other equity management platforms for comparison
