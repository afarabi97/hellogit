import { PacketStatsInterface } from '../interfaces';

/**
 * Class defines the Packet Stats
 *
 * @export
 * @class PacketStatsClass
 * @implements {PacketStatsInterface}
 */
export class PacketStatsClass implements PacketStatsInterface {
  app: string;
  node_name: string;
  packets_received: number;
  packets_dropped: number;

  /**
   * Creates an instance of PacketStatsClass.
   *
   * @param {PacketStatsInterface} packet_stats_interface
   * @memberof PacketStatsClass
   */
  constructor(packet_stats_interface: PacketStatsInterface) {
    this.app = packet_stats_interface.app;
    this.node_name = packet_stats_interface.node_name;
    this.packets_received = packet_stats_interface.packets_received;
    this.packets_dropped = packet_stats_interface.packets_dropped;
  }
}
