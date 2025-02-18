import { useState, useCallback } from 'react';
import { processFiles } from '../fileProcessing';

export const useFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = useCallback(async (newFiles) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const { processedFiles, errors } = await processFiles(newFiles);
      if (errors.length > 0) {
        setUploadError(errors);
      }
      setFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fileIndex) => {
    setFiles(prev => prev.filter((_, index) => index !== fileIndex));
  }, []);

  return {
    files,
    isUploading,
    uploadError,
    handleUpload,
    removeFile
  };
};