import { DIPTimeInterface } from '../interfaces/dip-time.interface';

/**
 * Class defines the DIP time
 *
 * @export
 * @class DIPTimeClass
 * @implements {DIPTimeInterface}
 */
export class DIPTimeClass implements DIPTimeInterface {
  datetime: string;
  timezone: string;

  /**
   * Creates an instance of DIPTimeClass.
   *
   * @param {DIPTimeInterface} dipTimeInterface
   * @memberof DIPTimeClass
   */
  constructor(dipTimeInterface: DIPTimeInterface) {
    this.datetime = dipTimeInterface.datetime;
    this.timezone = dipTimeInterface.timezone;
  }
}
