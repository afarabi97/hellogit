import { NodeClass } from '../../src/app/classes';
import { MockNodeSensorInterface, MockNodeServerInterface, MockNodeInterfaceArray } from '../interface-objects';

export const MockNodeServerClass: NodeClass = new NodeClass(MockNodeServerInterface);
export const MockNodeSensorClass: NodeClass = new NodeClass(MockNodeSensorInterface);
export const MockNodeClassArray: NodeClass[] = MockNodeInterfaceArray.map((node: NodeClass) => new NodeClass(node));
