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
}
