/**
 * Returns a date from passed parameters
 *
 * @export
 * @param {number} Y - Year
 * @param {number} M - Month
 * @param {number} D - Day
 * @param {number} h - hours
 * @param {number} m - minutes
 * @param {number} s - seconds
 * @returns {Date}
 */
export function returnDate(Y: number, M: number, D: number, h: number, m: number, s: number): Date {
  return new Date(Y, M, D, h, m, s);
}
