import { ElementSpecClass } from '../../src/app/modules/agent-builder-chooser/classes';
import {
    MockElementSpecInterface1,
    MockElementSpecInterface2,
    MockElementSpecInterface3,
    MockElementSpecInterface4
} from '../interface-objects';

export const MockElementSpecClass1: ElementSpecClass = new ElementSpecClass(MockElementSpecInterface1);
export const MockElementSpecClass2: ElementSpecClass = new ElementSpecClass(MockElementSpecInterface2);
export const MockElementSpecClass3: ElementSpecClass = new ElementSpecClass(MockElementSpecInterface3);
export const MockElementSpecClass4: ElementSpecClass = new ElementSpecClass(MockElementSpecInterface4);
export const MockElementSpecClassesArray1: ElementSpecClass[] = [
  MockElementSpecInterface1,
  MockElementSpecInterface2
];
export const MockElementSpecClassesArray2: ElementSpecClass[] = [
  MockElementSpecInterface3,
  MockElementSpecInterface4
];
