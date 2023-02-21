import { DatastoreInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockDatastoreInterfaceArray: DatastoreInterface[] = [
  {
      datastore: "datastore-131139",
      name: "TESX1 OS Drive",
      type: "VMFS",
      free_space: 208006021120,
      capacity: 231928233984
  },
  {
      datastore: "datastore-131143",
      name: "TESX2 OS Drive",
      type: "VMFS",
      free_space: 174303739904,
      capacity: 231928233984
  }
];
