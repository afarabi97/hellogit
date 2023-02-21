import { PacketStatsClass } from '../../src/app/modules/health-dashboard/classes';
import { PacketStatsInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockPacketStatInterfaceArraySuricata, MockPacketStatInterfaceArrayZeek } from '../interface-objects';

export const MockPacketStatClassArraySuricata: PacketStatsClass[] = MockPacketStatInterfaceArraySuricata.map((ps: PacketStatsInterface) => new PacketStatsClass(ps));
export const MockPacketStatClassArrayZeek: PacketStatsClass[] = MockPacketStatInterfaceArrayZeek.map((ps: PacketStatsInterface) => new PacketStatsClass(ps));
