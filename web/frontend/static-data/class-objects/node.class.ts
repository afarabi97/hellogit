import { NodeClass } from '../../src/app/classes';
import {
  MockNodeInterfaceArray,
  MockNodeSensorInterface,
  MockNodeSensorInterfaceNoJobs,
  MockNodeServerInterface,
  MockNodeServerInterfaceCreateAlt
} from '../interface-objects';

export const MockNodeServerClass: NodeClass = new NodeClass(MockNodeServerInterface);
export const MockNodeServerClassCreateAlt: NodeClass = new NodeClass(MockNodeServerInterfaceCreateAlt);
export const MockNodeSensorClass: NodeClass = new NodeClass(MockNodeSensorInterface);
export const MockNodeSensorClassNoJobs: NodeClass = new NodeClass(MockNodeSensorInterfaceNoJobs);
export const MockNodeClassArray: NodeClass[] = MockNodeInterfaceArray.map((node: NodeClass) => new NodeClass(node));
