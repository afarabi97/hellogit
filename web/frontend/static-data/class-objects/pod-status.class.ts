import { PodStatusClass } from '../../src/app/modules/health-dashboard/classes';
import { PodStatusInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockPodStatusInterfaceArray } from '../interface-objects';

export const MockPodStatusClassArray: PodStatusInterface[] = MockPodStatusInterfaceArray.map((ps: PodStatusInterface) => new PodStatusClass(ps));
