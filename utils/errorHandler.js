/**
 * Error handling utility for converting technical errors to user-friendly messages
 */

/**
 * Check if error is a network/connectivity error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  // Check for common network error patterns
  const networkPatterns = [
    'network',
    'fetch',
    'connection',
    'timeout',
    'econnrefused',
    'enotfound',
    'eai_again',
    'internet',
    'offline',
    'no internet',
    'network request failed',
    'networkerror',
  ];
  
  return (
    networkPatterns.some(pattern => errorMessage.includes(pattern)) ||
    networkPatterns.some(pattern => errorCode.includes(pattern)) ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror when attempting to fetch')
  );
};

/**
 * Check if error is an authentication/authorization error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's an auth error
 */
export const isAuthError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  const statusCode = error.status || error.statusCode;
  
  // Check for auth error patterns
  const authPatterns = [
    'unauthorized',
    'forbidden',
    'authentication',
    'session',
    'token',
    'expired',
    'invalid credentials',
    'sign in',
    'login',
  ];
  
  return (
    statusCode === 401 ||
    statusCode === 403 ||
    authPatterns.some(pattern => errorMessage.includes(pattern)) ||
    authPatterns.some(pattern => errorCode.includes(pattern))
  );
};

/**
 * Check if error is a validation error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a validation error
 */
export const isValidationError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  const statusCode = error.status || error.statusCode;
  
  return (
    statusCode === 400 ||
    errorCode === '23505' || // PostgreSQL unique violation
    errorCode === '23503' || // PostgreSQL foreign key violation
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('constraint')
  );
};

/**
 * Check if error is a not found error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a not found error
 */
export const isNotFoundError = (error) => {
  if (!error) return false;
  
  const statusCode = error.status || error.statusCode;
  const errorMessage = error.message?.toLowerCase() || '';
  
  return (
    statusCode === 404 ||
    errorMessage.includes('not found') ||
    errorMessage.includes('does not exist')
  );
};

/**
 * Get user-friendly error message from technical error
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error type can't be determined
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (error, defaultMessage = "Something went wrong. Please try again.") => {
  if (!error) return defaultMessage;
  
  // Network errors
  if (isNetworkError(error)) {
    return "No internet connection. Please check your network and try again.";
  }
  
  // Authentication errors
  if (isAuthError(error)) {
    if (error.message?.toLowerCase().includes('session') || error.message?.toLowerCase().includes('expired')) {
      return "Your session has expired. Please sign in again.";
    }
    if (error.message?.toLowerCase().includes('invalid credentials') || error.message?.toLowerCase().includes('invalid login')) {
      return "Invalid email or password. Please try again.";
    }
    return "Authentication failed. Please sign in again.";
  }
  
  // Validation errors
  if (isValidationError(error)) {
    // Try to extract specific validation message
    if (error.message) {
      // If it's already user-friendly, return it
      if (error.message.length < 100 && !error.message.includes('error') && !error.message.includes('code')) {
        return error.message;
      }
    }
    return "Invalid input. Please check your data and try again.";
  }
  
  // Not found errors
  if (isNotFoundError(error)) {
    return "The requested item was not found. It may have been deleted.";
  }
  
  // Database errors
  if (error.code) {
    // PostgreSQL errors
    if (error.code === '23505') {
      return "This item already exists. Please use a different value.";
    }
    if (error.code === '23503') {
      return "Cannot perform this action. Related data is missing.";
    }
    if (error.code === '23502') {
      return "Required information is missing. Please fill in all required fields.";
    }
    if (error.code === '22P02') {
      return "Invalid data format. Please check your input.";
    }
  }
  
  // Supabase specific errors
  if (error.message) {
    const lowerMessage = error.message.toLowerCase();
    
    if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
      return "This item already exists. Please use a different value.";
    }
    
    if (lowerMessage.includes('permission denied') || lowerMessage.includes('row-level security')) {
      return "You don't have permission to perform this action.";
    }
    
    if (lowerMessage.includes('timeout')) {
      return "The request took too long. Please try again.";
    }
    
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return "Too many requests. Please wait a moment and try again.";
    }
  }
  
  // If error message is short and user-friendly, return it
  if (error.message && error.message.length < 150 && !error.message.includes('Error:') && !error.message.includes('at ')) {
    return error.message;
  }
  
  // Default fallback
  return defaultMessage;
};

/**
 * Log error for debugging while showing user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred (e.g., "log-set", "create-goal")
 */
export const logError = (error, context = '') => {
  console.error(`[${context}] Error:`, {
    message: error?.message,
    code: error?.code,
    status: error?.status || error?.statusCode,
    stack: error?.stack,
  });
};

