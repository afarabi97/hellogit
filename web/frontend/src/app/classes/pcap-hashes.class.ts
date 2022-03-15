import { PCAPHashesInterface } from '../interfaces';

/**
 * Class defines the PCAP Hashes
 *
 * @export
 * @class PCAPHashesClass
 * @implements {PCAPHashesInterface}
 */
export class PCAPHashesClass implements PCAPHashesInterface {
  md5: string;
  sha1: string;
  sha256: string;

  /**
   * Creates an instance of PCAPHashesClass.
   *
   * @param {PCAPHashesInterface} pcap_hashes_interface
   * @memberof PCAPHashesClass
   */
  constructor(pcap_hashes_interface: PCAPHashesInterface) {
    this.md5 = pcap_hashes_interface.md5;
    this.sha1 = pcap_hashes_interface.sha1;
    this.sha256 = pcap_hashes_interface.sha256;
  }
}
