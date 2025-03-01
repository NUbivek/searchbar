export default async function handler(req, res) {
  const { q } = req.query;
  
  // Debug mode
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  
  try {
    // ... search logic ...
    
    // If debug mode is enabled, add debug information to the response
    if (debugMode) {
      results.debug = {
        query: q,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      // Add chat-style messages for debugging
      results.messages = [
        { type: 'user', content: q },
        { type: 'assistant', content: results }
      ];
    }
    
    res.status(200).json(results);
  } catch (error) {
    // ... error handling ...
  }
} 