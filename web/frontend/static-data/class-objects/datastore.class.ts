import { DatastoreClass } from '../../src/app/modules/health-dashboard/classes';
import { DatastoreInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockDatastoreInterfaceArray } from '../interface-objects';

export const MockDatastoreClassArray: DatastoreClass[] = MockDatastoreInterfaceArray.map((d: DatastoreInterface) => new DatastoreClass(d));
