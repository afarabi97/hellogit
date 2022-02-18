import { Observable } from 'rxjs';

import {
  AppClass,
  ChartClass,
  ChartInfoClass,
  GenericJobAndKeyClass,
  NodeClass,
  SavedValueClass,
  StatusClass
} from '../../classes';
import { CatalogHelmActionInterface } from '../catalog-helm-action.interface';
import { GenerateFileInterface } from '../generate-file.interface';

/**
 * Interface defines the Catalog Service
 *
 * @export
 * @interface CatalogServiceInterface
 */
export interface CatalogServiceInterface {
  get_catalog_nodes(): Observable<NodeClass[]>;
  get_chart_info(path_value: string): Observable<ChartInfoClass>;
  get_chart_statuses(path_value: string): Observable<StatusClass[]>;
  get_saved_values(path_value: string): Observable<SavedValueClass[]>;
  get_installed_apps(path_value: string): Observable<AppClass[]>;
  get_all_application_statuses(): Observable<ChartClass[]>;
  generate_values_file(generate_values_file: GenerateFileInterface): Observable<Object>;
  catalog_install(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass>;
  catalog_reinstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass>;
  catalog_uninstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass>;
}
