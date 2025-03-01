/**
 * Safely stringify any value for React rendering
 * @param {any} value - The value to stringify
 * @returns {string} A string representation of the value
 */
export function safeStringify(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    try {
      // Special handling for common response structures
      if (value.summary) {
        return typeof value.summary === 'string' ? value.summary : JSON.stringify(value.summary);
      }
      
      if (value.content) {
        return typeof value.content === 'string' ? value.content : JSON.stringify(value.content);
      }
      
      // For other objects, stringify
      return JSON.stringify(value);
    } catch (e) {
      console.error('Error stringifying object:', e);
      return '[Object]';
    }
  }
  
  return String(value);
} 