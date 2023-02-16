import { KitTokenClass } from '../../src/app/classes';
import { MockKitTokenInterface, MockKitTokenInterfaceAlt } from '../interface-objects';

export const MockKitTokenClass: KitTokenClass = new KitTokenClass(MockKitTokenInterface);
export const MockKitTokenClassAlt: KitTokenClass = new KitTokenClass(MockKitTokenInterfaceAlt);
