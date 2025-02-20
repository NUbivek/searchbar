import formidable from 'formidable';
import { processUploadedFile } from '@/lib/files/fileProcessor';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed' });
      }

      const processedFiles = await Promise.all(
        Object.values(files).map(processUploadedFile)
      );

      return res.status(200).json({ files: processedFiles });
    });
  } catch (error) {
    return handleApiError(error, res);
  }
}