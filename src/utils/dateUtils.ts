/**
 * Date utility functions for handling timezone conversions
 */

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Converts a Date object to an ISO string in local timezone
 * @param date The Date object to convert
 * @returns ISO string (YYYY-MM-DDTHH:MM) in local timezone
 */
export function dateToLocalISOString(date: Date): string {
  // Format the date directly to ISO format string using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // Return the ISO string in local timezone (YYYY-MM-DDTHH:MM)
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts an ISO string to a Date object, preserving the local timezone
 * @param isoString ISO string in local timezone
 * @returns Date object
 */
export function localISOStringToDate(isoString: string): Date {
  if (!isoString) return new Date();
  
  // Create a date object from the ISO string
  const date = new Date(isoString);
  
  return date;
}

/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @param formatStr Optional format string (default: 'yyyy/MM/dd HH:mm')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr = 'yyyy/MM/dd HH:mm'): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ja });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
