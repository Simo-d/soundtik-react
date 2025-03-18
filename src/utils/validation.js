/**
 * Utility functions for form validation
 */

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with isValid flag and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }
    
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  export const validateUrl = (url) => {
    if (!url) return true; // Empty URLs are considered valid
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {Array<string>} allowedTypes - Array of allowed MIME types
   * @returns {boolean} Whether the file type is valid
   */
  export const validateFileType = (file, allowedTypes) => {
    if (!file || !allowedTypes || !allowedTypes.length) return false;
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSizeInMB - Maximum allowed size in MB
   * @returns {boolean} Whether the file size is valid
   */
  export const validateFileSize = (file, maxSizeInMB) => {
    if (!file || !maxSizeInMB) return false;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * Validate required fields in a form object
   * @param {Object} formData - Form data object
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} Object with errors for each invalid field
   */
  export const validateRequiredFields = (formData, requiredFields) => {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        errors[field] = 'This field is required';
      }
    });
    
    return errors;
  };
  
  /**
   * Validate campaign budget
   * @param {number} budget - Campaign budget
   * @param {number} minBudget - Minimum allowed budget
   * @returns {Object} Validation result with isValid flag and message
   */
  export const validateBudget = (budget, minBudget = 50) => {
    const numBudget = parseFloat(budget);
    
    if (isNaN(numBudget) || numBudget <= 0) {
      return {
        isValid: false,
        message: 'Please enter a valid budget amount'
      };
    }
    
    if (numBudget < minBudget) {
      return {
        isValid: false,
        message: `Budget must be at least $${minBudget}`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Validate campaign duration
   * @param {number} duration - Campaign duration in days
   * @param {number} minDuration - Minimum allowed duration
   * @returns {Object} Validation result with isValid flag and message
   */
  export const validateDuration = (duration, minDuration = 7) => {
    const numDuration = parseInt(duration);
    
    if (isNaN(numDuration) || numDuration <= 0) {
      return {
        isValid: false,
        message: 'Please enter a valid duration'
      };
    }
    
    if (numDuration < minDuration) {
      return {
        isValid: false,
        message: `Duration must be at least ${minDuration} days`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Format validation errors from Firebase Auth
   * @param {Error} error - Firebase auth error
   * @returns {string} User-friendly error message
   */
  export const formatAuthError = (error) => {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use. Please use a different email or sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or create an account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later or reset your password.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };
  
  export default {
    validateEmail,
    validatePassword,
    validateUrl,
    validateFileType,
    validateFileSize,
    validateRequiredFields,
    validateBudget,
    validateDuration,
    formatAuthError
  };