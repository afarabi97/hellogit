import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { HTTP_OPTIONS } from '../../../constants/cvah.constants';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import {
  ElasticsearchCheckClass,
  ElasticsearchConfigurationClass,
  ElasticsearchNodeClass,
  ElasticsearchNodeReturnClass
} from '../classes';
import {
  ElasticsearchCheckInterface,
  ElasticsearchConfigurationInterface,
  ElasticsearchNodeInterface,
  ElasticsearchServiceInterface
} from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'ElasticsearchService' };

/**
 * Service used for elasticsearch related api calls
 *
 * @export
 * @class ElasticsearchService
 * @extends {ApiService<any>}
 * @implements {ElasticsearchServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class ElasticsearchService extends ApiService<any> implements ElasticsearchServiceInterface {

  /**
   * Creates an instance of ElasticsearchService.
   *
   * @memberof ElasticsearchService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET elastic nodes
   *
   * @returns {Observable<ElasticsearchNodeClass>}
   * @memberof ElasticsearchService
   */
  get_elastic_nodes(): Observable<ElasticsearchNodeClass> {
    return this.httpClient_.get(environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_NODES)
      .pipe(map((response: ElasticsearchNodeInterface) => new ElasticsearchNodeClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('elasticsearch get nodes', error)));
  }

  /**
   * REST call to POST elastic nodes
   *
   * @param {ElasticsearchNodeReturnClass} elasticsearch_node_return
   * @returns {Observable<void>}
   * @memberof ElasticsearchService
   */
  post_elastic_nodes(elasticsearch_node_return: ElasticsearchNodeReturnClass): Observable<void> {
    return this.httpClient_.post(environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_NODES, elasticsearch_node_return, HTTP_OPTIONS)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('elasticsearch post nodes', error)));
  }

  /**
   * REST call to GET elastic full config
   *
   * @returns {Observable<ElasticsearchConfigurationClass>}
   * @memberof ElasticsearchService
   */
  get_elastic_full_config(): Observable<ElasticsearchConfigurationClass> {
    return this.httpClient_.get<ElasticsearchConfigurationInterface>(environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_FULL_CONFIG)
      .pipe(map((response: ElasticsearchConfigurationInterface) => new ElasticsearchConfigurationClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('elasticsearch get full configuration', error)));
  }

  /**
   * REST call to POST elastic full config
   *
   * @param {ElasticsearchConfigurationClass} elasticsearch_configuration
   * @returns {Observable<void>}
   * @memberof ElasticsearchService
   */
  post_elastic_full_config(elasticsearch_configuration: ElasticsearchConfigurationClass): Observable<void> {
    return this.httpClient_.post<void>(environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_FULL_CONFIG, elasticsearch_configuration, HTTP_OPTIONS)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('elasticsearch post full configuration', error)));
  }

  /**
   * REST call to GET deploy elastic
   *
   * @returns {Observable<void>}
   * @memberof ElasticsearchService
   */
  deploy_elastic(): Observable<void> {
    return this.httpClient_.get<void>(environment.ELASTICSEARCH_SERVICE_DEPLOY_ELASTIC)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('elasticsearch deploy', error)));
  }

  /**
   * REST call to GET check elastic
   *
   * @returns {Observable<ElasticsearchCheckClass>}
   * @memberof ElasticsearchService
   */
  check_elastic(): Observable<ElasticsearchCheckClass> {
    return this.httpClient_.get<ElasticsearchCheckInterface>(environment.ELASTICSEARCH_SERVICE_CHECK_ELASTIC)
      .pipe(map((response: ElasticsearchCheckInterface) => new ElasticsearchCheckClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('elasticsearch check', error)));

  }
}
