import { AppConfigClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockAppConfigInterface1, MockAppConfigInterface2 } from '../interface-objects';

export const MockAppConfigClass1: AppConfigClass = new AppConfigClass(MockAppConfigInterface1);
export const MockAppConfigClass2: AppConfigClass = new AppConfigClass(MockAppConfigInterface2);
export const MockAppConfigClassesArray: AppConfigClass[] = [
  MockAppConfigClass1,
  MockAppConfigClass2
];
