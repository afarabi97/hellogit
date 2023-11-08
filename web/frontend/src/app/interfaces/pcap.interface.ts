/**
 * Interface defines the PCAP
 *
 * @export
 * @interface PCAPInterface
 */
export interface PCAPInterface {
  created_date: string;
  sha256: string;
  name: string;
  size: number;
  first_packet_date: string;
  last_packet_date: string;
}
