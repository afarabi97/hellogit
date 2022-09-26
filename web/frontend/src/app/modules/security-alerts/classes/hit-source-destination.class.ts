import { ObjectUtilitiesClass } from '../../../classes';
import { HitSourceDestinationInterface } from '../interfaces';

/**
 * Class defines the Hit Source Destination
 *
 * @export
 * @class HitSourceDestinationClass
 * @implements {HitSourceDestinationInterface}
 */
export class HitSourceDestinationClass implements HitSourceDestinationInterface {
  address: string;
  port: number;
  ip: string;
  bytes?: number;
  packets?: number;

  /**
   * Creates an instance of HitSourceDestinationClass.
   *
   * @param {HitSourceDestinationInterface} hit_source_destination_interface
   * @memberof HitSourceDestinationClass
   */
  constructor(hit_source_destination_interface: HitSourceDestinationInterface) {
    this.address = hit_source_destination_interface.address;
    this.port = hit_source_destination_interface.port;
    this.ip = hit_source_destination_interface.ip;
    if (ObjectUtilitiesClass.notUndefNull(hit_source_destination_interface.bytes)) {
      this.bytes = hit_source_destination_interface.bytes;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_destination_interface.packets)) {
      this.packets = hit_source_destination_interface.packets;
    }
  }
}
