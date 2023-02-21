/**
 * Interface defines the Packet Stats
 *
 * @export
 * @interface PacketStatsInterface
 */
export interface PacketStatsInterface {
  app: string;
  node_name: string;
  packets_received: number;
  packets_dropped: number;
}
