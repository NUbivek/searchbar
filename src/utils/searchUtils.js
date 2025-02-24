export async function performSearch(query, mode, selectedModel, customUrls = [], files = [], sources = []) {
  try {
    const formData = new FormData();
    formData.append('query', query.trim());
    formData.append('mode', mode);
    formData.append('model', selectedModel);
    
    // Add custom URLs
    customUrls.forEach(url => formData.append('customUrls', url));
    
    // Add files
    files.forEach(file => formData.append('files', file));
    
    // Add sources for open search
    if (sources.length > 0) {
      sources.forEach(source => formData.append('sources', source));
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Search failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function processSearchResults(results) {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results.map(result => ({
    source: result.source || 'Unknown Source',
    content: result.content || '',
    url: result.url || null,
    timestamp: result.timestamp || new Date().toISOString(),
    confidence: result.confidence || 1.0
  }));
}

export async function handleFileUpload(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const data = await response.json();
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      url: data.url,
      id: data.id
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

export async function validateUrl(url) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/validate-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Invalid URL');
    }

    return true;
  } catch (error) {
    console.error('URL validation error:', error);
    throw error;
  }
}
