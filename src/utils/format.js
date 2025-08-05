/**
 * Utility functions for formatting data in the Incrypt app
 */

/**
 * Formats a wallet address by showing only the first and last few characters
 * @param {string} address - The full wallet address
 * @param {number} startChars - Number of characters to show at the start
 * @param {number} endChars - Number of characters to show at the end
 * @returns {string} Formatted address with ellipsis
 */
export const formatAddress = (address, startChars = 4, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formats a currency value with appropriate suffixes (K, M, B)
 * @param {number} value - The currency value to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0';
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(decimals)}B`;
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  
  return value.toFixed(decimals);
};

/**
 * Formats a percentage value
 * @param {number} value - The percentage value to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted percentage value
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats a date to a readable string
 * @param {Date|number|string} date - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Formats a number with commas as thousands separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};