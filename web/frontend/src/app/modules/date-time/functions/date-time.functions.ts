import { returnDate } from '../../../functions/cvah.functions';

/**
 * Used for getting the current time
 *
 * @export
 * @param {string} timezone
 * @returns {Date}
 */
export function getCurrentDate(timezone: string): Date {
  const date = new Date();
  const year = date.toLocaleString('en-US', {year: 'numeric', timeZone: timezone });
  const month = date.toLocaleString('en-US', {month: '2-digit', timeZone: timezone });
  const day = date.toLocaleString('en-US', {day: '2-digit', timeZone: timezone });
  const hours = date.toLocaleString('en-US', {hour: '2-digit', hour12: false, timeZone: timezone });
  const minutes = date.toLocaleString('en-US', {minute: '2-digit', timeZone: timezone });
  const seconds = date.toLocaleString('en-US', {second: '2-digit', timeZone: timezone });

  return returnDate( parseInt(year, 10), (parseInt(month, 10) - 1), parseInt(day, 10),
                     parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10) );
}
