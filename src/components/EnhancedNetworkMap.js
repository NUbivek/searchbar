import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ForceGraph2D } from 'react-force-graph';
import { FiSearch, FiX, FiZoomIn, FiZoomOut, FiUsers, FiTarget, FiSettings, FiFilter } from 'react-icons/fi';
import { SiLinkedin, SiTwitter, SiReddit } from 'react-icons/si';
import { RiUserSearchLine, RiOrganizationChart } from 'react-icons/ri';
import { HiOutlineLightBulb } from 'react-icons/hi';
import styles from './NetworkMap.module.css';

export default function EnhancedNetworkMap() {
  // Network data state
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [displayData, setDisplayData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active network sources
  const [connectedSources, setConnectedSources] = useState({
    linkedin: false,
    twitter: false,
    reddit: false
  });

  // UI interaction state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [focusedNode, setFocusedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [highlightNodes, setHighlightNodes] = useState([]);
  const [highlightLinks, setHighlightLinks] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  
  // Visualization controls
  const [showControls, setShowControls] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [baseNodeSize, setBaseNodeSize] = useState(5);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [connectionDepth, setConnectionDepth] = useState([1, 2, 3]);
  const [showInsights, setShowInsights] = useState(false);
  
  // Refs for DOM elements
  const graphRef = useRef();
  const searchInputRef = useRef();
  const containerRef = useRef();
  // Check for authentication status and load data on component mount
  useEffect(() => {
    // Check URL parameters for auth callbacks
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const status = urlParams.get('status');
    const errorMsg = urlParams.get('error');
    
    // Handle successful authentication
    if (source && status === 'success') {
      setConnectedSources(prev => ({
        ...prev,
        [source]: true
      }));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch network data
      fetchNetworkData(source);
    }
    
    // Handle authentication errors
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is already authenticated with any sources
    checkAuthStatus();
  }, []);
  
  // Check authentication status with all network sources
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/network/status');
      if (response.data && response.data.connectedSources) {
        setConnectedSources(response.data.connectedSources);
        
        // Load data for connected sources
        Object.entries(response.data.connectedSources)
          .filter(([_, isConnected]) => isConnected)
          .forEach(([source]) => fetchNetworkData(source));
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };
  
  // Fetch network data from a specific source
  const fetchNetworkData = async (source) => {
    if (!source) return;
    
    setLoading(true);
    
    try {
      const response = await axios.get(`/api/network/${source}/connections`);
      
      if (response.data && response.data.nodes && response.data.links) {
        // Enhance data with source info and styling
        const enhancedData = enhanceNetworkData(response.data, source);
        
        // Merge with existing data or set as new data
        const mergedData = mergeNetworkData(networkData, enhancedData);
        setNetworkData(mergedData);
        setDisplayData(filterNetworkByDepth(mergedData, connectionDepth));
      } else {
        throw new Error(`Invalid network data format from ${source}`);
      }
    } catch (err) {
      console.error(`Error fetching ${source} connections:`, err);
      setError(`Failed to load your ${source.charAt(0).toUpperCase() + source.slice(1)} network: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Add source-specific styling and metadata to network data
  const enhanceNetworkData = (data, source) => {
    const sourceColors = {
      linkedin: '#0A66C2',
      twitter: '#1DA1F2',
      reddit: '#FF4500'
    };
    
    const color = sourceColors[source] || '#888888';
    
    return {
      nodes: data.nodes.map(node => ({
        ...node,
        source,
        color,
        val: node.connections?.length || 1, // Node size based on connections count
        sourceIcon: source // For rendering the appropriate icon
      })),
      links: data.links.map(link => ({
        ...link,
        source: typeof link.source === 'object' ? link.source.id : link.source,
        target: typeof link.target === 'object' ? link.target.id : link.target,
        color: `${color}88` // Semi-transparent version of the source color
      }))
    };
  };
  
  // Merge new network data with existing data
  const mergeNetworkData = (existing, newData) => {
    if (!existing.nodes.length) return newData;
    
    // Track existing node IDs to avoid duplicates
    const existingNodeIds = new Set(existing.nodes.map(node => node.id));
    
    // Add only new nodes
    const mergedNodes = [
      ...existing.nodes,
      ...newData.nodes.filter(node => !existingNodeIds.has(node.id))
    ];
    
    // Create a map of node IDs to indices
    const nodeIndices = {};
    mergedNodes.forEach((node, index) => {
      nodeIndices[node.id] = index;
    });
    
    // Track existing links to avoid duplicates
    const existingLinkKeys = new Set();
    existing.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      existingLinkKeys.add(`${sourceId}-${targetId}`);
    });
    
    // Add only new links
    const mergedLinks = [
      ...existing.links,
      ...newData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const linkKey = `${sourceId}-${targetId}`;
        return !existingLinkKeys.has(linkKey);
      })
    ];
    
    return { nodes: mergedNodes, links: mergedLinks };
  };
  
  // Filter network by connection depth
  const filterNetworkByDepth = (data, depths) => {
    if (!data.nodes.length || !depths.length) return { nodes: [], links: [] };
    
    // Find the central node (usually the user node)
    const centralNode = data.nodes.find(node => node.isCentral) || data.nodes[0];
    if (!centralNode) return data;
    
    // Calculate connection depths from central node
    const nodeDepths = calculateNodeDepths(data, centralNode.id);
    
    // Filter nodes by selected depths
    const filteredNodeIds = new Set(
      data.nodes
        .filter(node => nodeDepths[node.id] !== undefined && depths.includes(nodeDepths[node.id]))
        .map(node => node.id)
    );
    
    // Include the central node
    filteredNodeIds.add(centralNode.id);
    
    // Filter nodes
    const filteredNodes = data.nodes.filter(node => filteredNodeIds.has(node.id));
    
    // Filter links that connect filtered nodes
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });
    
    return { nodes: filteredNodes, links: filteredLinks };
  };
  
  // Calculate node depths (connection distance) from a central node
  const calculateNodeDepths = (data, centralId) => {
    const depths = {};
    depths[centralId] = 0;
    
    // Create adjacency list for faster lookup
    const adjacencyList = {};
    data.nodes.forEach(node => { adjacencyList[node.id] = []; });
    
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (!adjacencyList[sourceId]) adjacencyList[sourceId] = [];
      if (!adjacencyList[targetId]) adjacencyList[targetId] = [];
      
      adjacencyList[sourceId].push(targetId);
      adjacencyList[targetId].push(sourceId); // Bidirectional
    });
    
    // BFS to find shortest paths
    const queue = [centralId];
    const visited = new Set([centralId]);
    
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = adjacencyList[current] || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          depths[neighbor] = depths[current] + 1;
          queue.push(neighbor);
        }
      }
    }
    
    return depths;
  };
  // Handle network interactions
  const handleNodeClick = node => {
    if (!node) return;
    
    setFocusedNode(node);
    setSelectedConnection(null);
    
    // Set highlighting to this node and its connections
    const connectedNodeIds = new Set();
    const connectedLinkIds = new Set();
    
    // Find all directly connected nodes and links
    displayData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === node.id) {
        connectedNodeIds.add(targetId);
        connectedLinkIds.add(link.id || `${sourceId}-${targetId}`);
      } else if (targetId === node.id) {
        connectedNodeIds.add(sourceId);
        connectedLinkIds.add(link.id || `${sourceId}-${targetId}`);
      }
    });
    
    setHighlightNodes([node.id, ...Array.from(connectedNodeIds)]);
    setHighlightLinks(Array.from(connectedLinkIds));
    
    // Center the graph on this node
    if (graphRef.current) {
      graphRef.current.centerAt(
        node.x || 0,
        node.y || 0,
        800
      );
      graphRef.current.zoom(1.2 * currentZoom, 800);
    }
  };
  
  // Handle link click to show connection details
  const handleLinkClick = link => {
    if (!link) return;
    
    const sourceNode = typeof link.source === 'object' 
      ? link.source 
      : displayData.nodes.find(n => n.id === link.source);
      
    const targetNode = typeof link.target === 'object' 
      ? link.target 
      : displayData.nodes.find(n => n.id === link.target);
    
    if (sourceNode && targetNode) {
      setSelectedConnection({
        source: sourceNode,
        target: targetNode,
        link
      });
      
      // Highlight just this connection
      setHighlightNodes([sourceNode.id, targetNode.id]);
      setHighlightLinks([link.id || `${sourceNode.id}-${targetNode.id}`]);
    }
  };
  
  // Expand a node to fetch its extended network (2nd and 3rd degree connections)
  const expandNodeConnections = async node => {
    if (!node || !node.id || !node.source || expandedNodes.has(node.id)) return;
    
    setLoading(true);
    
    try {
      // Add to expanded nodes set
      setExpandedNodes(prev => new Set([...prev, node.id]));
      
      // Fetch extended connections for this node
      const response = await axios.get(`/api/network/${node.source}/expand/${node.id}`);
      
      if (response.data && response.data.nodes && response.data.links) {
        // Process and merge the new extended network data
        const enhancedData = enhanceNetworkData(response.data, node.source);
        const mergedData = mergeNetworkData(networkData, enhancedData);
        
        setNetworkData(mergedData);
        setDisplayData(filterNetworkByDepth(mergedData, connectionDepth));
        
        // Highlight the expanded node and new connections
        handleNodeClick(node);
      }
    } catch (err) {
      console.error('Error expanding node connections:', err);
      setError(`Unable to load extended network: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset node highlighting and selection
  const resetSelection = () => {
    setFocusedNode(null);
    setSelectedConnection(null);
    setHighlightNodes([]);
    setHighlightLinks([]);
  };
  
  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearchResults(null);
    
    try {
      // First do a direct search on the nodes
      const term = searchQuery.toLowerCase();
      const directMatches = displayData.nodes.filter(node => 
        node.name?.toLowerCase().includes(term) ||
        node.title?.toLowerCase().includes(term) ||
        node.company?.toLowerCase().includes(term) ||
        node.skills?.some(skill => skill.toLowerCase().includes(term))
      );
      
      if (directMatches.length > 0) {
        // Handle direct matches
        setSearchResults({
          type: 'direct',
          query: searchQuery,
          matches: directMatches,
          count: directMatches.length
        });
        
        // Highlight matched nodes
        setHighlightNodes(directMatches.map(n => n.id));
        setHighlightLinks([]);
        
        // Focus on the first match
        if (graphRef.current && directMatches[0]) {
          graphRef.current.centerAt(
            directMatches[0].x || 0,
            directMatches[0].y || 0,
            800
          );
        }
      } else {
        // Use LLM for advanced natural language search
        const response = await axios.post('/api/network/search', {
          query: searchQuery,
          sources: Object.entries(connectedSources)
            .filter(([_, isConnected]) => isConnected)
            .map(([source]) => source)
        });
        
        if (response.data) {
          setSearchResults({
            type: 'semantic',
            query: searchQuery,
            ...response.data
          });
          
          // Highlight relevant nodes identified by the LLM
          if (response.data.relatedNodes?.length) {
            // Find nodes that match the IDs returned by LLM
            const nodesToHighlight = displayData.nodes.filter(node => 
              response.data.relatedNodes.includes(node.id)
            );
            
            setHighlightNodes(nodesToHighlight.map(n => n.id));
            
            // Find links between highlighted nodes
            const relevantLinks = displayData.links.filter(link => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
              const targetId = typeof link.target === 'object' ? link.target.id : link.target;
              return nodesToHighlight.some(n => n.id === sourceId) && 
                     nodesToHighlight.some(n => n.id === targetId);
            });
            
            setHighlightLinks(relevantLinks.map(link => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
              const targetId = typeof link.target === 'object' ? link.target.id : link.target;
              return link.id || `${sourceId}-${targetId}`;
            }));
            
            // Center the graph on the first highlighted node
            if (graphRef.current && nodesToHighlight[0]) {
              graphRef.current.centerAt(
                nodesToHighlight[0].x || 0,
                nodesToHighlight[0].y || 0,
                800
              );
            }
          }
        } else {
          setSearchResults({
            type: 'empty',
            query: searchQuery,
            message: 'No results found for your query.'
          });
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message}`);
      setSearchResults({
        type: 'error',
        query: searchQuery,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Authentication functions
  const connectToSource = async source => {
    setError(null);
    
    try {
      let authUrl;
      
      switch(source) {
        case 'linkedin':
          // Get LinkedIn auth URL and redirect
          const linkedinAuth = await import('../utils/socialAuthHelpers')
            .then(module => module.initiateLinkedInAuth());
          window.location.href = linkedinAuth;
          break;
          
        case 'twitter':
          // Get Twitter auth URL and redirect
          const twitterAuth = await import('../utils/socialAuthHelpers')
            .then(module => module.initiateTwitterAuth());
          window.location.href = twitterAuth;
          break;
          
        case 'reddit':
          // Get Reddit auth URL and redirect
          const redditAuth = await import('../utils/socialAuthHelpers')
            .then(module => module.initiateRedditAuth());
          window.location.href = redditAuth;
          break;
          
        default:
          throw new Error(`Unsupported network source: ${source}`);
      }
    } catch (err) {
      console.error(`Error connecting to ${source}:`, err);
      setError(`Connection to ${source} failed: ${err.message}`);
    }
  };
  
  const disconnectFromSource = async source => {
    try {
      // Call the logout endpoint
      await axios.get(`/api/auth/${source}/logout`);
      
      // Update state
      setConnectedSources(prev => ({
        ...prev,
        [source]: false
      }));
      
      // Remove nodes from this source
      const filteredNetworkData = {
        nodes: networkData.nodes.filter(n => n.source !== source),
        links: networkData.links.filter(link => {
          const sourceNode = typeof link.source === 'object' 
            ? link.source 
            : networkData.nodes.find(n => n.id === link.source);
            
          const targetNode = typeof link.target === 'object' 
            ? link.target 
            : networkData.nodes.find(n => n.id === link.target);
          
          return sourceNode?.source !== source && targetNode?.source !== source;
        })
      };
      
      setNetworkData(filteredNetworkData);
      setDisplayData(filterNetworkByDepth(filteredNetworkData, connectionDepth));
      resetSelection();
      
    } catch (err) {
      console.error(`Error disconnecting from ${source}:`, err);
      setError(`Disconnection from ${source} failed: ${err.message}`);
    }
  };
  
  // Visualization controls
  const toggleConnectionDepth = depth => {
    let newDepths;
    
    if (connectionDepth.includes(depth)) {
      // Remove this depth if it's already selected
      newDepths = connectionDepth.filter(d => d !== depth);
      // Don't allow empty selection
      if (newDepths.length === 0) newDepths = [1];
    } else {
      // Add this depth
      newDepths = [...connectionDepth, depth].sort();
    }
    
    setConnectionDepth(newDepths);
    setDisplayData(filterNetworkByDepth(networkData, newDepths));
  };
  
  const handleZoomIn = () => {
    if (graphRef.current) {
      const newZoom = Math.min(currentZoom * 1.5, 5);
      setCurrentZoom(newZoom);
      graphRef.current.zoom(newZoom, 300);
    }
  };
  
  const handleZoomOut = () => {
    if (graphRef.current) {
      const newZoom = Math.max(currentZoom / 1.5, 0.2);
      setCurrentZoom(newZoom);
      graphRef.current.zoom(newZoom, 300);
    }
  };

  // Check authentication status from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const status = urlParams.get('status');
    const errorMsg = urlParams.get('error');
    
    // Handle successful authentication
    if (source && status === 'success') {
      setConnectedSources(prev => ({
        ...prev,
        [source]: true
      }));
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fetch network data
      fetchNetworkData(source);
    }
    
    // Handle authentication errors
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // Render network visualization with custom node and link rendering
  const renderGraph = () => {
    return (
      <ForceGraph2D
        ref={graphRef}
        graphData={displayData}
        nodeRelSize={baseNodeSize}
        nodeVal={node => (highlightNodes.includes(node.id) ? node.val * 1.5 : node.val) || 1}
        nodeColor={node => highlightNodes.length && !highlightNodes.includes(node.id) ? '#cccccc77' : node.color || '#666'}
        nodeLabel={node => getNodeTooltip(node)}
        linkWidth={link => {
          const linkId = link.id || 
            (typeof link.source === 'object' && typeof link.target === 'object' ? 
              `${link.source.id}-${link.target.id}` : 
              `${link.source}-${link.target}`);
              
          return highlightLinks.includes(linkId) ? 3 : 1;
        }}
        linkColor={link => {
          const linkId = link.id || 
            (typeof link.source === 'object' && typeof link.target === 'object' ? 
              `${link.source.id}-${link.target.id}` : 
              `${link.source}-${link.target}`);
          
          return highlightLinks.includes(linkId) ? link.color || '#666' : highlightLinks.length ? '#cccccc77' : link.color || '#666';
        }}
        linkDirectionalArrowLength={0}
        linkCurvature={0.1}
        backgroundColor="#ffffff"
        width={containerRef.current?.clientWidth || 800}
        height={550}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
        onBackgroundClick={resetSelection}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || node.id;
          const fontSize = 12 / globalScale;
          const nodeSize = (node.val || 1) * baseNodeSize;
          const isHighlighted = highlightNodes.includes(node.id) || highlightNodes.length === 0;
          const isExpanded = expandedNodes.has(node.id);
          const isFocused = focusedNode?.id === node.id;
          
          // Draw node circle
          ctx.beginPath();
          ctx.fillStyle = isHighlighted ? node.color : '#cccccc77';
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw border for focused or expanded nodes
          if (isFocused || isExpanded) {
            ctx.beginPath();
            ctx.strokeStyle = isFocused ? '#3b82f6' : '#10b981';
            ctx.lineWidth = 2 / globalScale;
            ctx.arc(node.x, node.y, nodeSize + 2 / globalScale, 0, 2 * Math.PI);
            ctx.stroke();
          }
          
          // Draw source icon indicator
          if (node.source && globalScale > 0.7) {
            const iconMap = {
              linkedin: '🔵',
              twitter: '🐦',
              reddit: '🔴'
            };
            
            const icon = iconMap[node.source] || '⚫';
            const iconSize = fontSize * 1.1;
            
            ctx.font = `${iconSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, node.x, node.y);
          }
          
          // Draw label if zoomed in enough or node is highlighted
          if (globalScale > 1.2 || isHighlighted) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y - nodeSize - 2);
            
            // Draw additional info for focused nodes
            if (isFocused && node.title && globalScale > 1.5) {
              ctx.font = `${fontSize * 0.8}px Sans-Serif`;
              ctx.fillStyle = '#666';
              ctx.fillText(node.title, node.x, node.y - nodeSize - fontSize - 2);
            }
          }
        }}
      />
    );
  };
  
  // Generate node tooltip content
  const getNodeTooltip = node => {
    let tooltip = `<div style="padding: 10px; max-width: 300px;">`;
    tooltip += `<div style="font-weight: bold; margin-bottom: 5px;">${node.name || 'Unknown'}</div>`;
    
    if (node.title) {
      tooltip += `<div style="margin-bottom: 5px;">${node.title}</div>`;
    }
    
    if (node.company) {
      tooltip += `<div style="margin-bottom: 5px;">📍 ${node.company}</div>`;
    }
    
    // Add source information
    if (node.source) {
      tooltip += `<div style="margin-top: 10px; font-size: 12px;">Source: ${node.source.charAt(0).toUpperCase() + node.source.slice(1)}</div>`;
    }
    
    // Show connection count if available
    if (node.connections?.length) {
      tooltip += `<div style="margin-top: 5px; font-size: 12px;">${node.connections.length} connections</div>`;
    }
    
    tooltip += `</div>`;
    return tooltip;
  };
  
  // Render node details panel
  const renderNodeDetails = () => {
    if (!focusedNode) return null;
    
    return (
      <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{focusedNode.name}</h3>
          <button 
            onClick={resetSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX />
          </button>
        </div>
        
        {focusedNode.title && (
          <p className="text-sm text-gray-600 mb-2">{focusedNode.title}</p>
        )}
        
        {focusedNode.company && (
          <p className="text-sm mb-3">
            <span className="font-medium">Organization:</span> {focusedNode.company}
          </p>
        )}
        
        {focusedNode.location && (
          <p className="text-sm mb-3">
            <span className="font-medium">Location:</span> {focusedNode.location}
          </p>
        )}
        
        {focusedNode.skills && focusedNode.skills.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {focusedNode.skills.map(skill => (
                <span key={skill} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <button 
            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${
              expandedNodes.has(focusedNode.id) 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}
            onClick={() => expandNodeConnections(focusedNode)}
            disabled={expandedNodes.has(focusedNode.id)}
          >
            {expandedNodes.has(focusedNode.id) ? (
              <>
                <FiUsers /> Expanded
              </>
            ) : (
              <>
                <FiPlus /> Expand Network
              </>
            )}
          </button>
          
          {focusedNode.profileUrl && (
            <a 
              href={focusedNode.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 flex items-center gap-1"
            >
              View Profile
            </a>
          )}
        </div>
      </div>
    );
  };
  
  // Render source connection buttons
  const renderSourceConnections = () => {
    const sources = [
      { id: 'linkedin', name: 'LinkedIn', icon: <SiLinkedin className="text-[#0A66C2]" /> },
      { id: 'twitter', name: 'Twitter', icon: <SiTwitter className="text-[#1DA1F2]" /> },
      { id: 'reddit', name: 'Reddit', icon: <SiReddit className="text-[#FF4500]" /> }
    ];
    
    return (
      <div className="mb-6 flex flex-wrap gap-3">
        {sources.map(source => (
          <button
            key={source.id}
            onClick={() => connectedSources[source.id] 
              ? disconnectFromSource(source.id) 
              : connectToSource(source.id)
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              connectedSources[source.id] 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {source.icon}
            {source.name}
            <span className="text-xs">
              {connectedSources[source.id] ? '(Connected)' : '(Connect)'}
            </span>
          </button>
        ))}
      </div>
    );
  };
  
  // Connection depth filters
  const renderDepthFilters = () => {
    const depths = [1, 2, 3];
    
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Connection Depth:</span>
        <div className="flex gap-1">
          {depths.map(depth => (
            <button
              key={depth}
              onClick={() => toggleConnectionDepth(depth)}
              className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${connectionDepth.includes(depth) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {depth}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render search results 
  const renderSearchResults = () => {
    if (!searchResults) return null;
    
    return (
      <div className="mt-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-semibold text-blue-800">
            Results for "{searchResults.query}"
          </h3>
          <button onClick={() => setSearchResults(null)} className="text-blue-500 hover:text-blue-700">
            <FiX size={18} />
          </button>
        </div>
        
        {searchResults.type === 'direct' && (
          <div>
            <p className="text-sm text-blue-700 mb-2">Found {searchResults.count} direct matches:</p>
            <div className="max-h-60 overflow-y-auto">
              {searchResults.matches?.map(node => (
                <div 
                  key={node.id}
                  className="p-2 mb-1 hover:bg-blue-100 rounded cursor-pointer flex items-center gap-2"
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color || '#666' }} />
                  <span className="font-medium">{node.name}</span>
                  {node.title && <span className="text-xs text-gray-600">• {node.title}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {searchResults.type === 'semantic' && (
          <div>
            {searchResults.analysis && (
              <div className="prose prose-sm max-w-none mb-4 text-blue-800">
                <div dangerouslySetInnerHTML={{ __html: searchResults.analysis }} />
              </div>
            )}
            
            {searchResults.relatedNodes?.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-blue-700 mb-2">Highlighted connections:</p>
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.relatedNodes.map(nodeId => {
                    const node = displayData.nodes.find(n => n.id === nodeId);
                    if (!node) return null;
                    
                    return (
                      <div 
                        key={node.id}
                        className="p-2 mb-1 hover:bg-blue-100 rounded cursor-pointer flex items-center gap-2"
                        onClick={() => handleNodeClick(node)}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color || '#666' }} />
                        <span className="font-medium">{node.name}</span>
                        {node.title && <span className="text-xs text-gray-600">• {node.title}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-700">No specific connections found for this query.</p>
            )}
          </div>
        )}
        
        {searchResults.type === 'empty' && (
          <p className="text-sm text-blue-700">{searchResults.message || 'No results found for your query.'}</p>
        )}
        
        {searchResults.type === 'error' && (
          <p className="text-sm text-red-500">{searchResults.error || 'An error occurred during search.'}</p>
        )}
      </div>
    );
  };
  
  // Main render method
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Network Map</h1>
        <p className="text-gray-600">
          Connect your social accounts to visualize and explore your professional network.
          Use the search feature to find connections based on skills, companies, or natural language queries.
        </p>
      </div>
      
      {/* Source connections */}
      {renderSourceConnections()}
      
      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, company, skill, or ask a question..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch size={20} />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className={`px-6 py-3 rounded-lg font-medium ${searchQuery.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          Search
        </button>
      </div>
      
      {/* Search results */}
      {renderSearchResults()}
      
      {/* Connection filters */}
      <div className="flex items-center justify-between mb-4">
        {renderDepthFilters()}
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            title="Zoom in"
          >
            <FiZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            title="Zoom out"
          >
            <FiZoomOut size={18} />
          </button>
        </div>
      </div>
      
      {/* Network graph */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium mb-1">Error:</p>
          <p>{error}</p>
        </div>
      ) : Object.values(connectedSources).every(connected => !connected) ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Connect to a network source to get started
          </h3>
          <p className="text-blue-700 mb-6">
            Connect your social accounts using the buttons above to visualize your professional network.
          </p>
          <div className="w-40 h-40 mx-auto opacity-50">
            <FiUsers size={160} className="text-blue-300" />
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center h-[550px]">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">Loading your network data...</p>
        </div>
      ) : (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden" ref={containerRef}>
          {/* Graph visualization */}
          {renderGraph()}
          
          {/* Node details overlay */}
          {renderNodeDetails()}
          
          {/* Connection details overlay */}
          {selectedConnection && (
            <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg p-4 w-80"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">Connection Details</h3>
                <button 
                  onClick={() => setSelectedConnection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedConnection.source.color || '#666' }} />
                <span className="font-medium text-sm">{selectedConnection.source.name}</span>
              </div>
              
              <div className="border-l-2 border-gray-300 ml-2 my-2 pl-6 py-2">
                <div className="text-xs text-gray-500">Connected via</div>
                <div className="text-sm font-medium">
                  {selectedConnection.link.label || 'Direct connection'}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedConnection.target.color || '#666' }} />
                <span className="font-medium text-sm">{selectedConnection.target.name}</span>
              </div>
            </div>
          )}
          
          {/* Network stats */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-xs">
            <div className="font-medium text-gray-900 mb-1">Network Statistics</div>
            <div className="text-gray-700">{displayData.nodes.length} nodes • {displayData.links.length} connections</div>
            <div className="text-gray-500 text-xs mt-1">
              {Object.entries(connectedSources)
                .filter(([_, isConnected]) => isConnected)
                .map(([source]) => source.charAt(0).toUpperCase() + source.slice(1))
                .join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
