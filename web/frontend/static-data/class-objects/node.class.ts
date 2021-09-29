import { NodeClass } from '../../src/app/classes';
import { MockNodeSensorInterface, MockNodeServerInterface } from '../interface-objects';

export const MockNodeServerClass: NodeClass = new NodeClass(MockNodeServerInterface);
export const MockNodeSensorClass: NodeClass = new NodeClass(MockNodeSensorInterface);
