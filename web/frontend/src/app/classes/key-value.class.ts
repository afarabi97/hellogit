import { KeyValueInterface } from '../interfaces';

/**
 * Class defines the Key Value
 *
 * @export
 * @class KeyValueClass
 * @implements {KeyValueInterface}
 */
export class KeyValueClass implements KeyValueInterface {
  key: string;
  value: string;

  /**
   * Creates an instance of KeyValueClass.
   *
   * @param {KeyValueInterface} key_value_interface
   * @memberof KeyValueClass
   */
  constructor(key_value_interface: KeyValueInterface) {
    this.key = key_value_interface.key;
    this.value = key_value_interface.value;
  }
}
