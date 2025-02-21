import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filePath } = JSON.parse(req.body);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Cleanup failed' });
  }
} 