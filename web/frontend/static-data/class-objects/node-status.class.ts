import { NodeStatusClass } from '../../src/app/modules/health-dashboard/classes';
import { NodeStatusInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockNodeStatusInterfaceArray } from '../interface-objects';

export const MockNodeStatusClassArray: NodeStatusClass[] = MockNodeStatusInterfaceArray.map((ns: NodeStatusInterface) => new NodeStatusClass(ns));
