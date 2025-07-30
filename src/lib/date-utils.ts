/**
 * Safely formats a date string or Date object to Korean locale
 * @param dateValue - Date string, Date object, or null/undefined
 * @returns Formatted date string or fallback
 */
export function formatDateSafely(dateValue: string | Date | null | undefined): string {
  if (!dateValue) {
    return '날짜 없음';
  }

  try {
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // If it's a string and not a valid date, try to return it as is
      return typeof dateValue === 'string' ? dateValue : '날짜 없음';
    }
    
    return date.toLocaleDateString('ko-KR');
  } catch (error) {
    console.warn('Date formatting error:', error, 'Value:', dateValue);
    return typeof dateValue === 'string' ? dateValue : '날짜 없음';
  }
}

/**
 * Safely formats a date for display with optional time
 * @param dateValue - Date string, Date object, or null/undefined  
 * @param includeTime - Whether to include time in the format
 * @returns Formatted date string or fallback
 */
export function formatDateTimeSafely(dateValue: string | Date | null | undefined, includeTime: boolean = false): string {
  if (!dateValue) {
    return '날짜 없음';
  }

  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return typeof dateValue === 'string' ? dateValue : '날짜 없음';
    }
    
    if (includeTime) {
      return date.toLocaleString('ko-KR');
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  } catch (error) {
    console.warn('Date formatting error:', error, 'Value:', dateValue);
    return typeof dateValue === 'string' ? dateValue : '날짜 없음';
  }
}

/**
 * Get the best available date from a blog post object
 * @param post - Blog post with various date fields
 * @returns The most appropriate date string
 */
export function getBestDateFromPost(post: { date?: string; createdAt?: string; updatedAt?: string }): string {
  return post.date || post.createdAt || post.updatedAt || '';
}