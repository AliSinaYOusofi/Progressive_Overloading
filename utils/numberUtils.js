/**
 * Utility functions for number formatting
 */

/**
 * Formats a number to a shorter version (e.g., 1000 → 1k, 1100 → 1.1k, 1000000 → 1M)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatShortNumber = (num) => {
  // Handle edge cases
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }

  const number = Number(num);
  
  // Handle zero
  if (number === 0) {
    return "0";
  }

  // Handle negative numbers (format absolute value)
  const isNegative = number < 0;
  const absNumber = Math.abs(number);

  // Format millions (>= 1,000,000)
  if (absNumber >= 1000000) {
    const value = absNumber / 1000000;
    const formatted = value.toFixed(1).replace(/\.0$/, '');
    return isNegative ? `-${formatted}M` : `${formatted}M`;
  }

  // Format thousands (>= 1,000)
  if (absNumber >= 1000) {
    const value = absNumber / 1000;
    const formatted = value.toFixed(1).replace(/\.0$/, '');
    return isNegative ? `-${formatted}k` : `${formatted}k`;
  }

  // Less than 1,000: round to integer
  const rounded = Math.round(absNumber);
  return isNegative ? `-${rounded}` : rounded.toString();
};

