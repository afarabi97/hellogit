
import { FormGroup } from "@angular/forms";

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
// eslint-disable-next-line @typescript-eslint/naming-convention
export function returnDate(Y: number, M: number, D: number, h: number, m: number, s: number): Date {
  return new Date(Y, M, D, h, m, s);
}

/**
 * Used for returning a form groups form control value
 *
 * @export
 * @template T
 * @param {FormGroup} form_group
 * @param {string} form_control_identifier
 * @returns {T}
 */
export function get_form_control_value_from_form_group<T>(form_group: FormGroup, form_control_key: string): T {
  return form_group.controls[form_control_key].value;
}
