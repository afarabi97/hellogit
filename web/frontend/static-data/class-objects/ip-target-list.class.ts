import { IPTargetListClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockIPTargetListInterface1, MockIPTargetListInterface2 } from '../interface-objects';

export const MockIPTargetListClass1: IPTargetListClass = new IPTargetListClass(MockIPTargetListInterface1);
export const MockIPTargetListClass2: IPTargetListClass = new IPTargetListClass(MockIPTargetListInterface2);
export const MockIPTargetListClassesArray: IPTargetListClass[] = [
  MockIPTargetListClass1,
  MockIPTargetListClass2
];
