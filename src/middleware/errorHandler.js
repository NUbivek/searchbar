export const handleApiError = (error, res) => {
  console.error('API Error:', error);
  
  if (error.response) {
    return res.status(error.response.status).json({
      error: error.response.data.message || 'API request failed'
    });
  }
  
  return res.status(500).json({
    error: error.message || 'Internal server error'
  });
}; 