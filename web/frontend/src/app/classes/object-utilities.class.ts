import { Constructor } from "../types/cvah.type";

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

  /**
   * Used to see if data is inluded as enum value
   *
   * @static
   * @template T
   * @template TEnumValue
   * @param {{ [key in T]: TEnumValue }} enum_variable
   * @returns {(value: string) => value is TEnumValue}
   * @memberof ObjectUtilitiesClass
   */
  static is_included_in_enum<T extends string, TEnumValue extends string>(enum_variable: { [key in T]: TEnumValue }): (value: string) => value is TEnumValue {
    const enumValues: unknown[] = Object.values(enum_variable);

  	return (value: string): value is TEnumValue => enumValues.includes(value);
  }

  /**
   * Used for returning object key value
   *
   * @static
   * @param {Object} object
   * @param {string} key
   * @return {*}
   * @memberof ObjectUtilitiesClass
   */
  static return_object_key_value(object: Object, key: string): any {
    return object.hasOwnProperty(key) ? object[key] : null;
  }

  /**
   * Used for returning a deep copy of an object
   *
   * @static
   * @template T
   * @param {T} object_to_copy
   * @return {T}
   * @memberof ObjectUtilitiesClass
   */
  static create_deep_copy<T>(object_to_copy: T): T {
    return (JSON.parse(JSON.stringify(object_to_copy)));
  }

  /**
   * Used for returning array removing any duplicate entries
   *
   * @static
   * @param {any[]} array
   * @return {*[]}
   * @memberof ObjectUtilitiesClass
   */
  static remove_duplicate_entries(array: any[]): any[] {
    return array.filter((item: string, index: number) => array.indexOf(item) === index);
  }
}
