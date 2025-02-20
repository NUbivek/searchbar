import { handleApiError } from '@/middleware/errorHandler';
import { processVerifiedSources } from '@/lib/sources/verifiedSources';
import { processOpenSources } from '@/lib/sources/openSources';
import { formatResponse } from '@/lib/formatters/responseFormatter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      query,
      mode,
      model,
      sources,
      sourceScope,
      customSources
    } = req.body;

    // Validate request
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Process search based on mode
    let searchResults;
    if (mode === 'verified') {
      searchResults = await processVerifiedSources({
        query,
        model,
        sourceScope,
        customSources
      });
    } else {
      searchResults = await processOpenSources({
        query,
        model,
        sources
      });
    }

    // Format response
    const formattedResponse = await formatResponse(searchResults, model);

    return res.status(200).json(formattedResponse);
  } catch (error) {
    return handleApiError(error, res);
  }
} 