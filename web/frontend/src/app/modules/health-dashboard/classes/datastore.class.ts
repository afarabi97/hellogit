import { DatastoreInterface } from '../interfaces';

/**
 * Class defines the Datastore
 *
 * @export
 * @class DatastoreClass
 * @implements {DatastoreInterface}
 */
export class DatastoreClass implements DatastoreInterface {
  datastore: string;
  name: string;
  type: string;
  free_space: number;
  capacity: number;

  /**
   * Creates an instance of DatastoreClass.
   *
   * @param {DatastoreInterface} datastore_interface
   * @memberof DatastoreClass
   */
  constructor(datastore_interface: DatastoreInterface) {
    this.datastore = datastore_interface.datastore;
    this.name = datastore_interface.name;
    this.type = datastore_interface.type;
    this.free_space = datastore_interface.free_space;
    this.capacity = datastore_interface.capacity;
  }
}
