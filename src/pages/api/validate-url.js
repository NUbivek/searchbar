export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Here you can add more validation logic if needed
    // For example, checking if the URL is accessible

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('URL validation error:', error);
    return res.status(500).json({ message: 'URL validation failed', error: error.message });
  }
}
