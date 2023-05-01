import { KitStatusClass } from '../../src/app/classes';
import { MockKitStatusInterface, MockKitStatusInterfaceAlt } from '../interface-objects';

export const MockKitStatusClass: KitStatusClass = new KitStatusClass(MockKitStatusInterface);
export const MockKitStatusClassAlt: KitStatusClass = new KitStatusClass(MockKitStatusInterfaceAlt);
