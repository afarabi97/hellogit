import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { HTTP_OPTIONS } from '../../../constants/cvah.constants';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { AssociatedPodClass } from '../classes/associated-pod.class';
import { ConfigMapEditClass } from '../classes/config-map-edit.class';
import { KubernetesConfigClass } from '../classes/kubernetes-config.class';
import { AssociatedPodInterface } from '../interfaces/associated-pod.interface';
import { ConfigMapEditInterface } from '../interfaces/config-map-edit.interface';
import { ConfigMapSaveInterface } from '../interfaces/config-map-save.interface';
import { KubernetesConfigInterface } from '../interfaces/kubernetes-config.interface';
import { ConfigMapServiceInterface } from '../interfaces/service-interfaces/config-map-service.interface';

const entityConfig: EntityConfig = { entityPart: '', type: 'ConfigMapService' };

/**
 * Service used for REST calls for Config Map
 *
 * @export
 * @class ConfigMapService
 * @extends {ApiService<any>}
 * @implements {ConfigMapServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class ConfigMapService extends ApiService<any> implements ConfigMapServiceInterface {

  /**
   * Creates an instance of ConfigMapService.
   *
   * @memberof ConfigMapService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET config maps
   *
   * @returns {Observable<KubernetesConfigClass>}
   * @memberof ConfigMapService
   */
  get_config_maps(): Observable<KubernetesConfigClass> {
    return this.httpClient_.get<KubernetesConfigInterface>(environment.CONFIG_MAP_SERVICE_GET_CONFIG_MAPS)
      .pipe(map((response: KubernetesConfigInterface) => new KubernetesConfigClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get config maps', error)));
  }

  /**
   * REST call to PUT config map
   *
   * @param {ConfigMapSaveInterface} config_map_save
   * @returns {Observable<ConfigMapEditClass>}
   * @memberof ConfigMapService
   */
  edit_config_map(config_map_save: ConfigMapSaveInterface): Observable<ConfigMapEditClass> {
    return this.httpClient_.put<ConfigMapEditInterface>(environment.CONFIG_MAP_SERVICE_BASE_URL, config_map_save, HTTP_OPTIONS)
      .pipe(map((response: ConfigMapEditInterface) => new ConfigMapEditClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('edit config map', error)));
  }

  /**
   * REST call to GET associated pods
   *
   * @param {string} config_map_name
   * @returns {Observable<AssociatedPodClass[]>}
   * @memberof ConfigMapService
   */
  get_associated_pods(config_map_name: string): Observable<AssociatedPodClass[]> {
    const url = `${environment.CONFIG_MAP_SERVICE_GET_ASSOCIATED_PODS}${config_map_name}`;

    return this.httpClient_.get<AssociatedPodInterface[]>(url)
      .pipe(map((response: AssociatedPodInterface[]) => response.map((ap: AssociatedPodInterface) => new AssociatedPodClass(ap))),
            catchError((error: HttpErrorResponse) => this.handleError('get associated pods', error)));
  }
}
