import { FormGroup } from '@angular/forms';

export class DataMethodsClass {

  /**
   * Used for getting the current time
   *
   * @static
   * @param {string} timezone
   * @returns {Date}
   */
  static getCurrentDate(timezone: string): Date {
    const date = new Date();
    const year = date.toLocaleString('en-US', {year: 'numeric', timeZone: timezone });
    const month = date.toLocaleString('en-US', {month: '2-digit', timeZone: timezone });
    const day = date.toLocaleString('en-US', {day: '2-digit', timeZone: timezone });
    const hours = date.toLocaleString('en-US', {hour: '2-digit', hour12: false, timeZone: timezone });
    const minutes = date.toLocaleString('en-US', {minute: '2-digit', timeZone: timezone });
    const seconds = date.toLocaleString('en-US', {second: '2-digit', timeZone: timezone });

    return this.returnDate(parseInt(year, 10), (parseInt(month, 10) - 1), parseInt(day, 10),
                           parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));
  }

  /**
   * Returns a date from passed parameters
   *
   * @static
   * @param {number} Y - Year
   * @param {number} M - Month
   * @param {number} D - Day
   * @param {number} h - hours
   * @param {number} m - minutes
   * @param {number} s - seconds
   * @returns {Date}
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  static returnDate(Y: number, M: number, D: number, h: number, m: number, s: number): Date {
    return new Date(Y, M, D, h, m, s);
  }

  /**
   * Used for returning a form groups form control value
   *
   * @static
   * @template T
   * @param {FormGroup} form_group
   * @param {string} form_control_key
   * @returns {T}
   */
  static get_form_control_value_from_form_group<T>(form_group: FormGroup, form_control_key: string): T {
    return form_group.controls[form_control_key].value;
  }

  /**
   * Checks to see if a given IP address is within a subnet range
   *
   * @static
   * @param {string} ip - The IP we want to check to see if it is within a subnet.
   * @param {string} network_ip - The network IP EX: 192.168.1.0
   * @param {string} netmask - The netmask of the subnet EX: 255.255.255.0
   * @returns {boolean}
   */
  static is_ipv4_in_subnet(ip: string, network_ip: string, netmask: string): boolean {
    const bits: number = this.netmask_to_cidr(netmask);
    const mask: number = ~(2 ** (32 - bits) - 1);

    return (this.ipv4_to_int(ip) & mask) === (this.ipv4_to_int(network_ip) & mask);
  }

  /**
   * Used for converting the netmask to cidr
   *
   * @static
   * @param {string} netmask
   * @returns {number}
   */
  static netmask_to_cidr(netmask: string): number {
    const ret_val: string = netmask.split('.').map(Number).map((part: number) => (part >>> 0).toString(2)).join('');

    return ret_val.split('1').length - 1;
  }

  /**
   * Used for converting ipv4 address to int
   *
   * @static
   * @param {string} ip
   * @returns {number}
   */
  static ipv4_to_int(ip: string): number {
    return ip.split('.').reduce((int: number, oct: string) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
  }
}
