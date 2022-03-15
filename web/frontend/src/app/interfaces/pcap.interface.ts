import { PCAPHashesInterface } from './pcap-hashes.interface';

/**
 * Interface defines the PCAP
 *
 * @export
 * @interface PCAPInterface
 */
export interface PCAPInterface {
  createdDate: string;
  hashes: PCAPHashesInterface;
  name: string;
  size: number;
}
