import { IPTargetListClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockIPTargetListInterface1, MockIPTargetListInterface2, MockIPTargetListInterface3 } from '../interface-objects';

export const MockIPTargetListClass1: IPTargetListClass = new IPTargetListClass(MockIPTargetListInterface1);
export const MockIPTargetListClass2: IPTargetListClass = new IPTargetListClass(MockIPTargetListInterface2);
export const MockIPTargetListClass3: IPTargetListClass = new IPTargetListClass(MockIPTargetListInterface3);
export const MockIPTargetListClassesArray: IPTargetListClass[] = [
  MockIPTargetListClass1,
  MockIPTargetListClass2
];
