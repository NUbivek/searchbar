# Enhanced Network Map Component

The Enhanced Network Map component is a powerful visualization tool that integrates social media networks (LinkedIn, Twitter, and Facebook) and allows for natural language search across your professional and social connections.

## Features

- **Multi-Network Integration**: Connect and visualize your networks from LinkedIn, Twitter, and Facebook in a single interface
- **Interactive Visualization**: Interactive force-directed graph using react-force-graph
- **Natural Language Search**: Use LLM-powered search to find connections based on natural language queries
- **Connection Details**: View detailed information about your connections when selected
- **Network Filtering**: Filter connections by degree (1st, 2nd, 3rd)
- **Visual Indicators**: Connections are color-coded by platform and sized by importance
- **Responsive Design**: Works across desktop and mobile devices

## Setup

1. Copy `.env.local.example` to `.env.local` and add your API keys:

```
cp .env.local.example .env.local
```

2. Update `.env.local` with your API keys:
   - Together AI API key (required for LLM search functionality)
   - Social media API keys (as needed)

3. Install dependencies:

```
npm install
```

4. Start the development server:

```
npm run dev
```

## Usage

### Authentication

1. Navigate to the Network Map page
2. Click the "Connect" button for each network you wish to integrate
3. Authenticate with the respective platform
4. Your network data will be loaded and visualized

### Searching Your Network

Use natural language to search your network:

- "Find software engineers in my network"
- "Who do I know that works at Google?"
- "Show me connections who might know about marketing"
- "Find people in healthcare industry"
- "Who should I connect with for job opportunities in AI?"

### Interacting with the Map

- **Zoom**: Use mouse wheel or pinch gestures
- **Pan**: Click and drag on empty areas
- **Select**: Click on any node to see detailed information
- **Filter**: Use the degree filters to show only specific connection levels
- **Highlight**: Search results are automatically highlighted in the visualization

## Technical Details

The Enhanced Network Map uses the following key technologies:

- **React Force Graph**: For network visualization
- **Together AI API**: For LLM-powered natural language search
- **React Icons**: For UI elements
- **Tailwind CSS**: For styling

The component is modular and can be extended with additional data sources and visualization options.

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correctly set in `.env.local`
2. Ensure all dependencies are installed with `npm install`
3. Check browser console for any errors
4. Verify network connectivity to API endpoints

## Privacy Note

This component operates client-side for visualization. Authentication tokens are stored securely in the browser and not shared. Network data is processed locally where possible, with LLM queries processed securely through the API.
