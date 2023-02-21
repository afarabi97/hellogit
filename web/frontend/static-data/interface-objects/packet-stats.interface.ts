import { PacketStatsInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockPacketStatInterfaceArraySuricata: PacketStatsInterface[] = [
  {
    app: "suricata",
    node_name: "test-sensor3.test",
    packets_received: 1747,
    packets_dropped: 0.0
  }
];
export const MockPacketStatInterfaceArrayZeek: PacketStatsInterface[] = [
  {
    app: "zeek",
    node_name: "test-sensor3.test",
    packets_received: 1504,
    packets_dropped: 0.0
  }
];
