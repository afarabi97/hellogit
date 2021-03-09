/**
 * Interface defines the CatalogStatus
 *
 * @export
 * @interface CatalogStatusInterface
 */
export interface CatalogStatusInterface {
  application: string;
  appVersion: string;
  status: string;
  deployment_name: string;
  hostname: string;
  node_type: string;
}
