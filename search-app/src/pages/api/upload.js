import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { API_CONFIG } from '@/config/constants';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: API_CONFIG.maxFileSize,
      filter: (part) => {
        return API_CONFIG.allowedFileTypes.includes(part.mimetype);
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const processedFiles = await Promise.all(
      Object.values(files).map(async (file) => {
        const content = await fs.readFile(file.filepath);
        const fileInfo = {
          name: file.originalFilename,
          type: file.mimetype,
          size: file.size,
          content: content.toString('base64'),
        };
        await fs.unlink(file.filepath);
        return fileInfo;
      })
    );

    return res.status(200).json({
      message: 'Files uploaded successfully',
      files: processedFiles,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      message: 'Error processing file upload',
      error: error.message,
    });
  }
}