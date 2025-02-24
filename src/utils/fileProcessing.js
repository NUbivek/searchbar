import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import csv from 'csv-parse';
import { promisify } from 'util';
import { logger } from './logger';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'fs/promises';
import pdfParse from 'pdf-parse';
import xlsx from 'xlsx';

const parseCSV = promisify(csv.parse);

export async function processUploadedFiles(files) {
  const results = await Promise.allSettled(
    files.map(file => processFile(file))
  );

  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
}

async function processFile(file) {
  try {
    const extension = file.name.split('.').pop().toLowerCase();
    const content = await readFile(file, extension);
    
    return {
      source: file.name,
      type: 'FileContent',
      content,
      timestamp: new Date().toISOString(),
      title: file.name
    };
  } catch (error) {
    logger.error('File processing error:', error);
    return {
      source: file.name,
      type: 'FileError',
      content: `Error processing file: ${error.message}`,
      timestamp: new Date().toISOString(),
      title: file.name
    };
  }
}

async function readFile(file, extension) {
  switch (extension) {
    case 'txt':
    case 'json':
    case 'csv':
      return await readTextFile(file);
      
    case 'xlsx':
    case 'xls':
      return await readExcelFile(file);
      
    case 'pdf':
      return await readPDFFile(file);
      
    case 'ppt':
    case 'pptx':
      return await readPPTFile(file);
      
    case 'docx':
      return await processDocx(file);
      
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function readTextFile(file) {
  const text = await file.text();
  return text;
}

async function readExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  let content = '';
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    content += `Sheet: ${sheetName}\n`;
    content += XLSX.utils.sheet_to_csv(sheet);
    content += '\n\n';
  });
  
  return content;
}

async function readPDFFile(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();
  
  let content = '';
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    content += await page.getText();
    content += '\n\n';
  }
  
  return content;
}

async function readPPTFile(file) {
  // For PPT files, we'll extract text content
  const text = await file.text();
  return text;
}

async function processDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return {
    type: 'docx',
    content: result.value,
    metadata: result.messages
  };
}

export async function processFileNew(file) {
  try {
    const content = await readFile(file.filepath);
    const extension = file.originalFilename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'txt':
        return {
          name: file.originalFilename,
          content: content.toString(),
          type: 'text'
        };

      case 'pdf':
        const pdfData = await pdfParse(content);
        return {
          name: file.originalFilename,
          content: pdfData.text,
          type: 'pdf'
        };

      case 'xlsx':
      case 'xls':
        const workbook = xlsx.read(content);
        const sheetNames = workbook.SheetNames;
        const texts = sheetNames.map(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          return xlsx.utils.sheet_to_txt(sheet);
        });
        return {
          name: file.originalFilename,
          content: texts.join('\n'),
          type: 'spreadsheet'
        };

      case 'csv':
        const csvWorkbook = xlsx.read(content);
        const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
        return {
          name: file.originalFilename,
          content: xlsx.utils.sheet_to_txt(csvSheet),
          type: 'csv'
        };

      case 'json':
        return {
          name: file.originalFilename,
          content: JSON.stringify(JSON.parse(content.toString()), null, 2),
          type: 'json'
        };

      case 'ppt':
      case 'pptx':
        // For PPT files, we'll need to extract text content
        // This is a placeholder - you might want to use a library like pptxgenjs
        return {
          name: file.originalFilename,
          content: 'PPT content extraction not implemented yet',
          type: 'presentation'
        };

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    logger.error('File processing error:', error);
    throw new Error(`Failed to process file ${file.originalFilename}: ${error.message}`);
  }
}