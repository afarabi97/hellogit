import { PCAPInterface } from '../interfaces';
import { PCAPHashesClass } from './pcap-hashes.class';

/**
 * Class defines the PCAP
 *
 * @export
 * @class PCAPClass
 * @implements {PCAPInterface}
 */
export class PCAPClass implements PCAPInterface {
  createdDate: string;
  hashes: PCAPHashesClass;
  name: string;
  size: number;

  /**
   * Creates an instance of PCAPClass.
   *
   * @param {PCAPInterface} pcap_interface
   * @memberof PCAPClass
   */
  constructor(pcap_interface: PCAPInterface) {
    this.createdDate = pcap_interface.createdDate;
    this.hashes = new PCAPHashesClass(pcap_interface.hashes);
    this.name = pcap_interface.name;
    this.size = pcap_interface.size;
  }
}
