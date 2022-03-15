/**
 * Interface defines the Replay PCAP
 *
 * @export
 * @interface ReplayPCAPInterface
 */
export interface ReplayPCAPInterface {
  ifaces: string | string[];
  pcap: string;
  preserve_timestamp: boolean;
  sensor_hostname: string;
  sensor_ip: string;
}
