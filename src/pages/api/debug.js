export default function handler(req, res) {
  res.status(200).json({
    status: 'API is working',
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
} 