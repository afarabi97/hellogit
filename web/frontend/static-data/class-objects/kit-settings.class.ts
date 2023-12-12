import { KitSettingsClass } from '../../src/app/classes';
import { MockKitSettingsInterface, MockKitSettingsInterface_Alt } from '../interface-objects';

export const MockKitSettingsClass: KitSettingsClass = new KitSettingsClass(MockKitSettingsInterface);
export const MockKitSettingsClass_Alt: KitSettingsClass = new KitSettingsClass(MockKitSettingsInterface_Alt);
