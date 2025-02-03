import { isDateValid } from '../cards/cards.js';
/**
 * number case, coming from Excel
 * 1/1/1900 is day 1 in Excel, so:
 *  - add this
 *  - add days between 1/1/1900 and 1/1/1970
 *  - add one more day for Excel's leap year bug
 *
 * @param {number} date The date to format
 * @returns {string} The formatted date
 */
export function calculateExcelDate(date) {
  return new Date(Math.round((date - (1 + 25567 + 1)) * 86400 * 1000));
}

export function formatCardLocaleDate(date) {
  if (!date || !isDateValid(date)) return '';
  const jsDate = !date.toString().includes('-') ? calculateExcelDate(date) : date.replace(/-/g, '/');

  const dateLocale = 'en-GB';

  const dateString = new Date(jsDate).toLocaleDateString(dateLocale, {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).replace(',', '');

  return dateString;
}
