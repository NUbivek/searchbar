import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import csv from 'csv-parse';
import { promisify } from 'util';

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
  const extension = file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return await processPDF(file);
    case 'docx':
      return await processDocx(file);
    case 'xlsx':
    case 'xls':
      return await processExcel(file);
    case 'csv':
      return await processCSV(file);
    case 'json':
      return await processJSON(file);
    case 'txt':
      return await processText(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function processPDF(file) {
  const dataBuffer = await file.arrayBuffer();
  const data = await pdf(dataBuffer);
  return {
    type: 'pdf',
    content: data.text,
    metadata: {
      pages: data.numpages,
      info: data.info
    }
  };
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

async function processExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const results = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    results.push({
      sheetName,
      content: XLSX.utils.sheet_to_json(sheet)
    });
  });

  return {
    type: 'excel',
    content: results
  };
}

async function processCSV(file) {
  const text = await file.text();
  const records = await parseCSV(text, {
    columns: true,
    skip_empty_lines: true
  });

  return {
    type: 'csv',
    content: records
  };
}

async function processJSON(file) {
  const text = await file.text();
  return {
    type: 'json',
    content: JSON.parse(text)
  };
}

async function processText(file) {
  const text = await file.text();
  return {
    type: 'text',
    content: text
  };
} 