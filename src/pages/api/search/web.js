import axios from 'axios';
import { logger } from '../../../utils/logger';
import { withRetry } from '../../../utils/errorHandling';
import { rateLimit } from '../../../utils/rateLimiter';

// Constants
const MAX_CUSTOM_URLS = 10;
const MAX_UPLOADED_FILES = 5;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_CONTENT_LENGTH = 100000; // 100KB
const VALID_MODELS = ['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'];
const VALID_MODES = ['default', 'analysis', 'summary'];
const VALID_SOURCES = ['web', 'news', 'academic', 'market_data'];

// Validate URL format
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Validate file object
function isValidFile(file) {
  return file && 
    typeof file === 'object' && 
    typeof file.name === 'string' && 
    typeof file.content === 'string' &&
    file.content.length > 0 &&
    file.content.length <= MAX_CONTENT_LENGTH;
}

// Sanitize and truncate content
function sanitizeContent(content) {
  if (typeof content !== 'string') return '';
  return content
    .slice(0, MAX_CONTENT_LENGTH)
    .replace(/[<>]/g, '')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const searchId = Math.random().toString(36).substring(7);

  try {
    const { 
      query, 
      mockResults, 
      customUrls = [], 
      uploadedFiles = [], 
      model = 'mixtral-8x7b',
      customMode = 'default',
      selectedSources = ['web']
    } = req.body;
    
    // Input validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Valid query string is required' });
    }

    if (!VALID_MODELS.includes(model)) {
      return res.status(400).json({ 
        message: `Invalid model. Must be one of: ${VALID_MODELS.join(', ')}` 
      });
    }

    if (!VALID_MODES.includes(customMode)) {
      return res.status(400).json({ 
        message: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}` 
      });
    }

    const invalidSources = selectedSources.filter(source => !VALID_SOURCES.includes(source));
    if (invalidSources.length > 0) {
      return res.status(400).json({ 
        message: `Invalid sources: ${invalidSources.join(', ')}. Must be one of: ${VALID_SOURCES.join(', ')}` 
      });
    }

    if (customUrls.length > MAX_CUSTOM_URLS) {
      return res.status(400).json({ 
        message: `Maximum ${MAX_CUSTOM_URLS} custom URLs allowed` 
      });
    }

    if (uploadedFiles.length > MAX_UPLOADED_FILES) {
      return res.status(400).json({ 
        message: `Maximum ${MAX_UPLOADED_FILES} files allowed` 
      });
    }

    // Validate customUrls
    if (customUrls.length > 0) {
      const invalidUrls = customUrls.filter(url => !isValidUrl(url));
      if (invalidUrls.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid URLs provided',
          invalidUrls 
        });
      }
    }

    // Validate uploadedFiles
    if (uploadedFiles.length > 0) {
      const invalidFiles = uploadedFiles.filter(file => !isValidFile(file));
      if (invalidFiles.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid files provided',
          invalidFiles: invalidFiles.map(f => f?.name || 'unnamed') 
        });
      }
    }

    // Rate limit check
    await rateLimit('Web');

    logger.info(`[${searchId}] Processing web search for query: ${query}`);

    // Use mock results in test mode
    let response;
    if (process.env.NODE_ENV === 'test') {
      logger.info(`[${searchId}] Using mock results for web search`);
      response = { data: mockResults || { organic: [] } };
    } else {
      // Use Serper API for web search
      logger.info(`[${searchId}] Calling Serper API`);
      const serperApiKey = process.env.SERPER_API_KEY;
      if (!serperApiKey) {
        throw new Error('Serper API key not configured');
      }

      response = await withRetry(() => axios.post(
        'https://google.serper.dev/search', 
        { 
          q: query,
          num: 10,
          gl: 'us',
          hl: 'en'
        },
        { 
          headers: { 
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          timeout: REQUEST_TIMEOUT
        }
      ));
    }

    const sources = [];
    const sourceMap = {};

    // Process organic results
    if (response.data?.organic) {
      response.data.organic
        .filter(result => result.link && result.title)
        .forEach((result, index) => {
          const sourceId = `web-${index}`;
          sources.push({
            type: 'WebResult',
            content: sanitizeContent(result.snippet || ''),
            url: result.link,
            timestamp: new Date().toISOString(),
            title: result.title,
            confidence: 1.0,
            sourceId
          });
          sourceMap[sourceId] = {
            url: result.link,
            title: result.title,
            source: 'web'
          };
        });
      logger.info(`[${searchId}] Added ${response.data.organic.length} organic results`);
    }

    // Process knowledge graph if available
    if (response.data?.knowledgeGraph) {
      const kg = response.data.knowledgeGraph;
      if (kg.title && kg.description) {
        const sourceId = 'kg-0';
        sources.push({
          type: 'KnowledgeGraph',
          content: sanitizeContent(kg.description),
          url: kg.url || null,
          timestamp: new Date().toISOString(),
          title: kg.title,
          confidence: 1.0,
          sourceId
        });
        sourceMap[sourceId] = {
          url: kg.url || null,
          title: kg.title,
          source: 'knowledge_graph'
        };
        logger.info(`[${searchId}] Added knowledge graph result`);
      }
    }

    // Process "People Also Ask" if available
    if (response.data?.peopleAlsoAsk) {
      response.data.peopleAlsoAsk
        .filter(item => item.question && item.snippet)
        .forEach((item, index) => {
          const sourceId = `paa-${index}`;
          sources.push({
            type: 'RelatedQuestion',
            content: sanitizeContent(item.snippet),
            url: item.link || null,
            timestamp: new Date().toISOString(),
            title: item.question,
            confidence: 0.8,
            sourceId
          });
          sourceMap[sourceId] = {
            url: item.link || null,
            title: item.question,
            source: 'people_also_ask'
          };
        });
      logger.info(`[${searchId}] Added ${response.data.peopleAlsoAsk.length} related questions`);
    }

    // Process uploaded files if any
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        const sourceId = `file-${index}`;
        sources.push({
          type: 'UploadedFile',
          content: sanitizeContent(file.content),
          url: null,
          timestamp: new Date().toISOString(),
          title: file.name,
          confidence: 1.0,
          sourceId
        });
        sourceMap[sourceId] = {
          url: null,
          title: file.name,
          source: 'uploaded_file'
        };
      });
      logger.info(`[${searchId}] Added ${uploadedFiles.length} uploaded files`);
    }

    // Process custom URLs if any
    if (customUrls.length > 0) {
      const customResults = await Promise.allSettled(
        customUrls.map(async (url, index) => {
          try {
            const response = await withRetry(() => axios.get(url, { 
              timeout: REQUEST_TIMEOUT,
              maxContentLength: MAX_CONTENT_LENGTH
            }));
            
            return {
              type: 'CustomUrl',
              content: sanitizeContent(response.data),
              url,
              timestamp: new Date().toISOString(),
              title: url,
              confidence: 1.0,
              sourceId: `custom-${index}`
            };
          } catch (error) {
            logger.error(`[${searchId}] Failed to fetch custom URL ${url}:`, error);
            return null;
          }
        })
      );

      customResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const source = result.value;
          sources.push(source);
          sourceMap[source.sourceId] = {
            url: source.url,
            title: source.title,
            source: 'custom_url'
          };
        }
      });

      logger.info(`[${searchId}] Processed ${customUrls.length} custom URLs`);
    }

    res.json({ 
      sources, 
      summary: {
        content: '', // Will be filled by LLM processing
        sourceMap
      }
    });
  } catch (error) {
    logger.error(`[${searchId}] Search error:`, error);
    res.status(500).json({ 
      message: 'Search failed', 
      error: error.message 
    });
  }
}
