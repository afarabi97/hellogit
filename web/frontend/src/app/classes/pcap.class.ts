import { PCAPInterface } from '../interfaces';

/**
 * Class defines the PCAP
 *
 * @export
 * @class PCAPClass
 * @implements {PCAPInterface}
 */
export class PCAPClass implements PCAPInterface {
  created_date: string;
  sha256: string;
  name: string;
  size: number;
  first_packet_date: string;
  last_packet_date: string;

  /**
   * Creates an instance of PCAPClass.
   *
   * @param {PCAPInterface} pcap_interface
   * @memberof PCAPClass
   */
  constructor(pcap_interface: PCAPInterface) {
    this.created_date = pcap_interface.created_date;
    this.sha256 = pcap_interface.sha256;
    this.name = pcap_interface.name;
    this.size = pcap_interface.size;
    this.first_packet_date = pcap_interface.first_packet_date;
    this.last_packet_date = pcap_interface.last_packet_date;
  }
}
