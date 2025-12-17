/**
 * Format date as YYYY-MM-DD in local timezone (not UTC)
 * This prevents timezone conversion issues when working with dates
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD date string into a Date object in local timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export const parseDateKey = (dateString: string): Date | null => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (year && month && day) {
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/**
 * Extract date part (YYYY-MM-DD) from a datetime string without timezone conversion
 * Handles both MySQL format ("YYYY-MM-DD HH:mm:ss") and ISO format ("YYYY-MM-DDTHH:mm:ss.sssZ")
 * 
 * IMPORTANT: If the datetime is in ISO format with timezone (e.g., "2025-11-03T20:00:00.000Z"),
 * this represents a UTC time. If the original database value was "2025-11-04 05:00:00" in JST,
 * we need to account for the timezone offset to get the correct date.
 * 
 * @param datetimeString - Datetime string in any format
 * @returns Date string in YYYY-MM-DD format, or null if invalid
 */
export const extractDateFromDatetime = (datetimeString: string | null | undefined): string | null => {
  if (!datetimeString) return null;
  
  const datetimeStr = datetimeString.trim();
  
  // Check if it's ISO format with timezone (has T and ends with Z or has timezone offset)
  const isISOWithTimezone = /T\d{2}:\d{2}:\d{2}.*[Z+-]/.test(datetimeStr);
  
  if (isISOWithTimezone) {
    // For ISO format with timezone, parse it and use local date components
    // This handles the case where "2025-11-04 05:00:00" (JST) was converted to "2025-11-03T20:00:00.000Z" (UTC)
    // When we parse "2025-11-03T20:00:00.000Z" as a Date in JST timezone, it becomes "2025-11-04 05:00:00" locally
    // So we can extract the local date components to get back "2025-11-04"
    try {
      const date = new Date(datetimeStr);
      if (!isNaN(date.getTime())) {
        // Use local date components to get the correct date
        // This recovers the original date from the database
        return formatDateKey(date);
      }
    } catch (e) {
      console.warn('Error parsing ISO datetime:', datetimeStr, e);
    }
  }
  
  // For MySQL format or ISO without timezone, extract date directly from string
  const dateMatch = datetimeStr.match(/^(\d{4}-\d{2}-\d{2})/);
  
  if (dateMatch && dateMatch[1]) {
    // Validate the extracted date part
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateMatch[1])) {
      return dateMatch[1];
    }
  }
  
  // If format is unexpected, log warning and return null
  console.warn('Unexpected datetime format, cannot extract date:', datetimeString);
  return null;
};

