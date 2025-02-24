import formidable from 'formidable';
import { processFile } from '../../utils/fileProcessing';
import { logger } from '../../utils/logger';

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
      allowEmptyFiles: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFiles = await Promise.all(
      Object.values(files).map(async file => {
        try {
          const result = await processFile(file);
          return {
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size,
            content: result.content,
            error: null
          };
        } catch (error) {
          logger.error('File processing error:', error);
          return {
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size,
            content: null,
            error: error.message
          };
        }
      })
    );

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

    // Log success
    logger.info('Files uploaded successfully', {
      count: uploadedFiles.length,
      types: uploadedFiles.map(f => f.type)
    });

    return res.status(200).json({ 
      files: uploadedFiles,
      message: 'Files will be automatically deleted after 1 hour'
    });
  } catch (error) {
    logger.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
} 