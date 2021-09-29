import { DisksClass } from '../../src/app/classes';
import { MockDisksSDAInterface, MockDisksSDBInterface } from '../interface-objects';

export const MockDisksSDAClass: DisksClass = new DisksClass(MockDisksSDAInterface);
export const MockDisksSDBClass: DisksClass = new DisksClass(MockDisksSDBInterface);
