import { API_CONFIG } from '@/config/constants';

export const processFiles = async (files) => {
  const processedFiles = [];
  const errors = [];

  for (const file of files) {
    try {
      if (file.size > API_CONFIG.maxFileSize) {
        throw new Error(`File ${file.name} exceeds maximum size of ${API_CONFIG.maxFileSize / 1024 / 1024}MB`);
      }

      if (!API_CONFIG.allowedFileTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed for ${file.name}`);
      }

      const content = await readFileAsText(file);
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        lastModified: file.lastModified
      });
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }

  return { processedFiles, errors };
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};