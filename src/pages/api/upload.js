import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'temp-uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_TYPES = [
  // PDF
  'application/pdf',
  
  // Word Documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Excel Files
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  
  // Text & CSV
  'text/plain',
  'text/csv',
  'application/csv',
  'text/x-csv',
  
  // Rich Text
  'application/rtf',
  'text/rtf',
  
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => {
        if (!part.mimetype || !ALLOWED_TYPES.includes(part.mimetype)) {
          throw new Error(`File type not allowed: ${part.mimetype}`);
        }
        return true;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }

      const sessionId = fields.sessionId;
      const uploadedFiles = Object.values(files).map(file => ({
        name: file.originalFilename,
        path: file.filepath,
        type: file.mimetype,
        size: file.size,
      }));

      // Schedule file deletion after 1 hour
      setTimeout(() => {
        uploadedFiles.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        });
      }, 3600000);

      res.status(200).json({ 
        files: uploadedFiles,
        message: 'Files will be automatically deleted after 1 hour'
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
} 