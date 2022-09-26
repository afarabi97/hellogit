import { ObjectUtilitiesClass } from '../../../classes';
import { HitSourceSourceInterface } from '../interfaces';

/**
 * Class defines the Hit Source Source
 *
 * @export
 * @class HitSourceSourceClass
 * @implements {HitSourceSourceInterface}
 */
export class HitSourceSourceClass implements HitSourceSourceInterface {
  address: string;
  port: number;
  ip: string;
  bytes?: number;
  packets?: number;

  /**
   * Creates an instance of HitSourceSourceClass.
   *
   * @param {HitSourceSourceInterface} hit_source_source_interface
   * @memberof HitSourceSourceClass
   */
  constructor(hit_source_source_interface: HitSourceSourceInterface) {
    this.address = hit_source_source_interface.address;
    this.port = hit_source_source_interface.port;
    this.ip = hit_source_source_interface.ip;
    if (ObjectUtilitiesClass.notUndefNull(hit_source_source_interface.bytes)) {
      this.bytes = hit_source_source_interface.bytes;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_source_interface.packets)) {
      this.packets = hit_source_source_interface.packets;
    }
  }
}
