/**
 * Utility functions for formatting data
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {number} minimumFractionDigits - Minimum fraction digits (default: 0)
 * @param {number} maximumFractionDigits - Maximum fraction digits (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
    amount, 
    currency = 'USD', 
    minimumFractionDigits = 0, 
    maximumFractionDigits = 0
  ) => {
    if (amount === null || amount === undefined) {
      return 'N/A';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    }).format(amount);
  };
  
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  export const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return '0';
    }
    
    return num.toLocaleString('en-US');
  };
  
  /**
   * Format percentage
   * @param {number} value - Percentage value (0-100)
   * @param {number} precision - Decimal precision (default: 1)
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, precision = 1) => {
    if (value === null || value === undefined) {
      return '0%';
    }
    
    return value.toFixed(precision) + '%';
  };
  
  /**
   * Format file size in human-readable form
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Decimal precision (default: 2)
   * @returns {string} Formatted file size string
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  /**
   * Format date from timestamp
   * @param {Object|number} timestamp - Firebase timestamp, Date object, or UNIX timestamp
   * @param {Object} options - Date formatting options
   * @returns {string} Formatted date string
   */
  export const formatDate = (timestamp, options = {}) => {
    if (!timestamp) return 'N/A';
    
    let date;
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // JavaScript Date object
      date = timestamp;
    } else {
      // UNIX timestamp or string date
      date = new Date(timestamp);
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return date.toLocaleDateString('en-US', formatOptions);
  };
  
  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Object|number} timestamp - Firebase timestamp, Date object, or UNIX timestamp
   * @returns {string} Relative time string
   */
  export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // JavaScript Date object
      date = timestamp;
    } else {
      // UNIX timestamp or string date
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInMilliseconds = now - date;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else {
      return formatDate(date);
    }
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length (default: 50)
   * @returns {string} Truncated text
   */
  export const truncateText = (text, length = 50) => {
    if (!text) return '';
    
    if (text.length <= length) {
      return text;
    }
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  export const capitalizeWords = (text) => {
    if (!text) return '';
    
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  export default {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatFileSize,
    formatDate,
    formatRelativeTime,
    truncateText,
    capitalizeWords
  };