import { RoleProcessInterface } from './role-process.interface';

/**
 * Interface defines the Catalog Helm Action
 *
 * @export
 * @interface CatalogHelmActionInterface
 */
export interface CatalogHelmActionInterface extends RoleProcessInterface {
  values?: Object[];
}
