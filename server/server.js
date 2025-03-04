import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const port = process.env.PORT || 3003;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3004'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.files) delete sanitizedBody.files; // Don't log file contents
    console.log('Request body:', sanitizedBody);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Initialize API configs with validation
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!TOGETHER_API_KEY) {
  console.error('TOGETHER_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!PERPLEXITY_API_KEY) {
  console.error('PERPLEXITY_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!SERPER_API_KEY) {
  console.error('SERPER_API_KEY is not set in environment variables');
  process.exit(1);
}

// Model configurations
const MODEL_CONFIGS = {
  'mistral-7b': {
    provider: 'together',
    model: 'mistralai/Mistral-7B-v0.1',
    temperature: 0.7,
    max_tokens: 800
  },
  'llama-13b': {
    provider: 'together',
    model: 'meta-llama/Llama-2-13b-chat-hf',
    temperature: 0.7,
    max_tokens: 1000
  },
  'gemma-27b': {
    provider: 'together',
    model: 'google/gemma-2-27b-it',
    temperature: 0.7,
    max_tokens: 1000
  }
};

// Helper function to process text with Together AI
async function processWithTogether(prompt, config) {
  console.log('Processing with Together AI:', { model: config.model });
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Together AI error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  console.log('Together AI response:', data);
  return data.choices[0].message.content;
}

// Updated processWithLLM function with proper model handling
async function processWithLLM(query, sources, context = "", modelId = "mistral-7b") {
  console.log('Processing with LLM:', { query, modelId, sourcesCount: sources.length });
  
  try {
    // Input validation
    if (!query) throw new Error('Query is required');
    if (!Array.isArray(sources)) throw new Error('Sources must be an array');
    
    // Validate and get model config
    const modelConfig = MODEL_CONFIGS[modelId.toLowerCase()];
    if (!modelConfig) {
      throw new Error(`Unsupported model: ${modelId}`);
    }

    // Normalize sources
    const normalizedSources = sources.map(s => ({
      content: s.content || s.snippet || '',
      title: s.title || 'Untitled',
      url: s.url || s.link || '',
      source: s.source || 'Unknown'
    })).filter(s => s.content.trim() !== '');

    if (normalizedSources.length === 0) {
      throw new Error('No valid sources available');
    }

    // Create source map and references
    const sourceMap = {};
    const references = normalizedSources.map((s, idx) => {
      const key = `[${idx + 1}]`;
      sourceMap[key] = {
        url: s.url,
        title: s.title,
        source: s.source
      };
      return `${key} ${s.title} (${s.source})`;
    });

    // Build prompt
    const prompt = `You are a helpful research assistant. Based on the following sources, answer this query: "${query}"

Sources:
${normalizedSources.map((s, idx) => `[${idx + 1}] ${s.content}`).join('\n\n')}

References:
${references.join('\n')}

${context ? `\nAdditional context:\n${context}\n` : ''}

Instructions:
1. Provide a detailed answer using information from the sources
2. Include relevant source references [1], [2], etc.
3. Format your response in markdown
4. If sources don't contain enough information, acknowledge this
5. Focus on accuracy and relevance`;

    console.log('Processing with model:', modelConfig);

    // Process with Together AI
    const result = await processWithTogether(prompt, modelConfig);
    return { content: result, sourceMap };
  } catch (error) {
    console.error('LLM Processing Error:', error);
    throw error;
  }
}

// Rate limiting configuration
const RATE_LIMITS = {
  together: { requests: 10, period: 60000 }, // 10 requests per minute
  perplexity: { requests: 5, period: 60000 }, // 5 requests per minute
  serper: { requests: 60, period: 60000 } // 60 requests per minute
};

// Rate limiting state
const rateLimitState = {
  together: { requests: [], lastReset: Date.now() },
  perplexity: { requests: [], lastReset: Date.now() },
  serper: { requests: [], lastReset: Date.now() }
};

// Rate limiting middleware
function checkRateLimit(provider) {
  const now = Date.now();
  const state = rateLimitState[provider];
  const limits = RATE_LIMITS[provider];

  // Reset if period has passed
  if (now - state.lastReset > limits.period) {
    state.requests = [];
    state.lastReset = now;
  }

  // Remove old requests
  state.requests = state.requests.filter(time => now - time < limits.period);

  // Check if limit exceeded
  if (state.requests.length >= limits.requests) {
    throw new Error(`Rate limit exceeded for ${provider}`);
  }

  // Add new request
  state.requests.push(now);
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000
};

// Helper function to handle retries
async function withRetry(operation, provider) {
  let lastError;
  let delay = RETRY_CONFIG.initialDelay;

  for (let i = 0; i < RETRY_CONFIG.maxRetries; i++) {
    try {
      checkRateLimit(provider);
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.message.includes('Rate limit exceeded')) {
        throw error; // Don't retry rate limit errors
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, RETRY_CONFIG.maxDelay);
    }
  }
  throw lastError;
}

// Helper function to extract content from a URL
async function extractContentFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style').remove();
    
    // Get text content
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();
    
    // Get title
    const title = $('title').text().trim() || url;
    
    return {
      content: text,
      title,
      url,
      source: 'Custom URL'
    };
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}

// Helper function to extract content from a file
async function extractContentFromFile(file) {
  try {
    const text = await fs.readFile(file.path, 'utf8');
    return {
      content: text,
      title: file.originalname,
      url: `file://${file.path}`,
      source: 'Uploaded File'
    };
  } catch (error) {
    console.error(`Error extracting content from file ${file.originalname}:`, error);
    return null;
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Verified Search endpoint
app.post('/api/verifiedSearch', async (req, res) => {
  try {
    const { query, model } = req.body;
    
    if (!query) {
      throw new Error('Query is required');
    }

    // For verified search, we'll return a curated set of verified sources
    const verifiedSources = [
      {
        title: "Research Hub Documentation",
        content: "Research Hub is a powerful search platform that combines verified sources with AI-powered analysis. It supports multiple language models including Mistral-7B, Llama-13B, and Gemma-27B.",
        source: "Verified Source",
        url: "https://docs.researchhub.com"
      }
    ];

    // Process the query with LLM
    console.log('Processing query with LLM:', { query, model });
    const result = await processWithLLM(query, verifiedSources, "", model);
    console.log('LLM Response:', result);

    if (!result || !result.content) {
      throw new Error('Failed to process query with LLM');
    }

    res.json({
      sources: verifiedSources,
      summary: result.content,
      sourceMap: result.sourceMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Verified Search Error:', error);
    res.status(500).json({ error: error.message, timestamp: new Date().toISOString() });
  }
});

// Open Search endpoint
app.post('/api/openSearch', upload.array('files'), async (req, res) => {
  try {
    console.log('OpenSearch request received');
    
    // Parse form data
    const query = req.body.query;
    const model = req.body.model || 'mistral-7b';
    const sources = req.body.sources ? JSON.parse(req.body.sources) : [];
    const customUrls = req.body.customUrls ? JSON.parse(req.body.customUrls) : [];
    const files = req.files || [];

    console.log('Parsed request data:', {
      query,
      model,
      sources,
      customUrls,
      fileCount: files.length
    });

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Process web search if Web is selected
    let webResults = [];
    if (sources.includes('Web')) {
      console.log('Processing web search...');
      webResults = await withRetry(async () => {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: query,
            gl: 'us',
            hl: 'en',
            type: 'search'
          })
        });

        if (!response.ok) {
          throw new Error(`Serper API error: ${response.statusText}`);
        }

        const data = await response.json();
        return (data.organic || []).map(r => ({
          title: r.title,
          content: r.snippet,
          url: r.link,
          source: 'Web Search'
        }));
      }, 'serper');
      console.log(`Found ${webResults.length} web results`);
    }

    // Process custom URLs
    const urlResults = await Promise.all(
      customUrls.map(async url => {
        try {
          console.log('Processing URL:', url);
          const result = await extractContentFromUrl(url);
          return result ? {
            title: result.title,
            content: result.content,
            url: url,
            source: 'Custom URL'
          } : null;
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          return null;
        }
      })
    );

    // Process uploaded files
    const fileResults = await Promise.all(
      files.map(async file => {
        try {
          console.log('Processing file:', file.originalname);
          const content = await extractContentFromFile(file);
          return content ? {
            title: file.originalname,
            content: content,
            source: 'Uploaded File'
          } : null;
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          return null;
        }
      })
    );

    // Combine all sources
    const allSources = [
      ...webResults,
      ...(urlResults.filter(r => r !== null) || []),
      ...(fileResults.filter(r => r !== null) || [])
    ];

    if (allSources.length === 0) {
      return res.status(400).json({ error: 'No valid sources found' });
    }

    console.log(`Processing ${allSources.length} total sources with LLM`);
    const result = await processWithLLM(query, allSources, "", model);
    
    const response = {
      sources: allSources,
      summary: result.content,
      sourceMap: result.sourceMap,
      timestamp: new Date().toISOString()
    };

    // Clean up uploaded files
    await Promise.all(files.map(file => 
      new Promise((resolve, reject) => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting file:', err);
          resolve();
        });
      })
    ));

    console.log('Sending response');
    res.json(response);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Process endpoint
app.post('/api/process', async (req, res) => {
  try {
    const { query, sources, context, model } = req.body;
    if (!query || !sources || !Array.isArray(sources)) {
      throw new Error('Invalid request: query and sources array are required');
    }
    
    // Normalize sources to ensure they have title and content
    const normalizedSources = sources.map(source => ({
      title: source.title || 'Untitled',
      content: source.content || source.snippet || 'No content available',
      url: source.url,
      source: source.source
    }));

    const { content, sourceMap } = await processWithLLM(query, normalizedSources, context, model);
    res.json({ summary: content, sourceMap, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Process Error:', error);
    res.status(500).json({ error: error.message, timestamp: new Date().toISOString() });
  }
}); 

// Chat endpoint for follow-up questions
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, sources, isVerifiedOnly } = req.body;
    
    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content;
    
    // First, get fresh search results based on the original search type
    const searchEndpoint = isVerifiedOnly ? '/api/verifiedSearch' : '/api/openSearch';
    const searchResponse = await fetch(`http://localhost:${port}${searchEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: lastUserMessage,
        model,
        sources: isVerifiedOnly ? [] : sources
      })
    });

    const searchData = await searchResponse.json();
    
    // Create context from previous messages
    const context = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
    
    // Process with LLM using the new search results
    const { content, sourceMap } = await processWithLLM(
      lastUserMessage,
      searchData.sources || [],
      context,
      model
    );
    
    res.json({
      response: content,
      sourceMap,
      sources: searchData.sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message, timestamp: new Date().toISOString() });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the Next.js build directory
app.use(express.static(path.join(__dirname, '../.next')));
app.use(express.static(path.join(__dirname, '../public')));

// Handle all other routes by serving the Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../.next/server/pages/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
