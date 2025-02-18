export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  export const validateSearchQuery = (query) => {
    if (!query?.trim()) {
      return { isValid: false, error: 'Search query cannot be empty' };
    }
    if (query.length < 3) {
      return { isValid: false, error: 'Search query must be at least 3 characters' };
    }
    return { isValid: true, error: null };
  };