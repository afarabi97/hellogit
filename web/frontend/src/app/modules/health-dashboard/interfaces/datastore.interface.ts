/**
 * Interface defines the Datastore
 *
 * @export
 * @interface DatastoreInterface
 */
export interface DatastoreInterface {
  datastore: string;
  name: string;
  type: string;
  free_space: number;
  capacity: number;
}
