import { useState } from 'react';

export default function FileUpload({ onUpload }) {
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Initialize progress for each file
    const initialProgress = {};
    files.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    try {
      // Simulate upload progress
      for (const file of files) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      }
      
      onUpload(files);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".pdf,.txt,.csv,.json,.xlsx"
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0 file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mt-2">
          <div className="text-sm">{fileName}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 