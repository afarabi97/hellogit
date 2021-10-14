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

/**
 * Checks to see if a given IP address is within a subnet range
 *
 * @export
 * @param {string} ip - The IP we want to check to see if it is within a subnet.
 * @param {string} network_ip - The network IP EX: 192.168.1.0
 * @param {string} netmask - The netmask of the subnet EX: 255.255.255.0
 * @returns {boolean}
 */
export function is_ipv4_in_subnet(ip: string, network_ip: string, netmask: string): boolean {
  const bits: number = netmask_to_cidr(netmask);
  const mask: number = ~(2 ** (32 - bits) - 1);

  return (ipv4_to_int(ip) & mask) === (ipv4_to_int(network_ip) & mask);
}

/**
 * Used for converting the netmask to cidr
 *
 * @param {string} netmask
 * @returns {number}
 */
function netmask_to_cidr(netmask: string): number {
  const ret_val: string = netmask.split('.').map(Number).map((part: number) => (part >>> 0).toString(2)).join('');

  return ret_val.split('1').length - 1;
}

/**
 * Used for converting ipv4 address to int
 *
 * @param {string} ip
 * @returns {number}
 */
function ipv4_to_int(ip: string): number {
  return ip.split('.').reduce((int: number, oct: string) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}
