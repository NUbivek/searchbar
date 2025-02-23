import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import { parse } from 'csv-parse/sync';
import { logger } from './logger';

export async function processFiles(files, query) {
  const results = [];

  for (const file of files) {
    try {
      const content = await extractContent(file);
      if (!content) continue;

      // Simple text search for now - can be enhanced with more sophisticated matching
      if (content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          source: file.name,
          type: getFileType(file),
          content: content.substring(0, 500) + '...', // Truncate for response
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Error processing file ${file.name}:`, error);
    }
  }

  return results;
}

async function extractContent(file) {
  const buffer = await file.arrayBuffer();
  const fileType = getFileType(file);

  switch (fileType) {
    case 'PDF':
      const pdfData = await pdf(buffer);
      return pdfData.text;

    case 'Excel':
      const workbook = XLSX.read(buffer);
      return Object.keys(workbook.Sheets).map(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_csv(sheet);
      }).join('\n');

    case 'Word':
      const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
      return value;

    case 'CSV':
      const text = new TextDecoder().decode(buffer);
      const records = parse(text, {
        skip_empty_lines: true
      });
      return records.map(record => record.join(',')).join('\n');

    case 'Text':
      return new TextDecoder().decode(buffer);

    case 'JSON':
      const jsonText = new TextDecoder().decode(buffer);
      const jsonData = JSON.parse(jsonText);
      return JSON.stringify(jsonData, null, 2);

    default:
      return null;
  }
}

function getFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  const typeMap = {
    'pdf': 'PDF',
    'xlsx': 'Excel',
    'xls': 'Excel',
    'docx': 'Word',
    'doc': 'Word',
    'csv': 'CSV',
    'txt': 'Text',
    'json': 'JSON'
  };

  return typeMap[extension] || 'Unknown';
}