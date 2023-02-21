import { PodLogClass } from '../../src/app/modules/health-dashboard/classes';
import { PodLogInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockPodLogInterfaceArray } from '../interface-objects';

export const MockPodLogClassArray: PodLogClass[] = MockPodLogInterfaceArray.map((pl: PodLogInterface) => new PodLogClass(pl));
