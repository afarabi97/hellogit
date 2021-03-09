import { Constructor } from '../types/cvah.type';

/**
 * Abstract class defines object utils
 *
 * @export
 * @abstract
 * @class ObjectUtilitiesClass
 */
export abstract class ObjectUtilitiesClass {

  /**
   * Used to see if object is not undefined and not null
   *
   * @static
   * @param {*} data
   * @returns {boolean}
   * @memberof ObjectUtilitiesClass
   */
  static notUndefNull(data: any): boolean {
    return (typeof data !== 'undefined') && (data !== null);
  }

  /**
   * Used for checking that all values in array are instanceof class type T
   *
   * @static
   * @template T
   * @param {any[]} passed_array
   * @param {Constructor<T>} class_name
   * @returns {boolean}
   * @memberof ObjectUtilitiesClass
   */
  static test_array_values_instanceof<T>(passed_array: any[], class_name: Constructor<T>): boolean {
    return passed_array.every((v: any) => v instanceof class_name);
  }
}
