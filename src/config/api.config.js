// Default to development API URL if NEXT_PUBLIC_API_BASE_URL is not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const API_CONFIG = {
  endpoints: {
    websearch: `${API_BASE_URL}/websearch`,
    linkedinsearch: `${API_BASE_URL}/linkedinsearch`,
    chat: `${API_BASE_URL}/chat`,
    upload: `${API_BASE_URL}/upload`,
    xsearch: `${API_BASE_URL}/xsearch`
  },
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

export default API_CONFIG;