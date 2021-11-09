import { HostClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockHostInterface1, MockHostInterface2, MockHostInterface3, MockHostInterface4 } from '../interface-objects';

export const MockHostClass1: HostClass = new HostClass(MockHostInterface1, MockHostInterface1.target_config_id);
export const MockHostClass2: HostClass = new HostClass(MockHostInterface2, MockHostInterface2.target_config_id);
export const MockHostClass3: HostClass = new HostClass(MockHostInterface3, MockHostInterface3.target_config_id);
export const MockHostClass4: HostClass = new HostClass(MockHostInterface4, MockHostInterface4.target_config_id);
export const MockHostClassesArray1: HostClass[] = [
  MockHostClass1,
  MockHostClass2
];
export const MockHostClassesArray2: HostClass[] = [
  MockHostClass3,
  MockHostClass4
];
