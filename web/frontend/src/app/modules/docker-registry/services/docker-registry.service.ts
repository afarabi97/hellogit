import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { DockerRegistryClass } from '../classes/docker-registry.class';
import { DockerRegistryInterface } from '../interfaces/docker-registry.interface';
import { DockerRegistryServiceInterface } from '../interfaces/service-interfaces/docker-registry-service.interface';

const entityConfig: EntityConfig = { entityPart: '', type: 'DockerRegistryService' };

/**
 * Service used to get docker registry
 *
 * @export
 * @class DockerRegistryService
 * @extends {ApiService<any>}
 * @implements {DockerRegistryServiceInterface}
 */
@Injectable()
export class DockerRegistryService extends ApiService<any> implements DockerRegistryServiceInterface {

  /**
   * Creates an instance of DockerRegistryService.
   *
   * @memberof DockerRegistryService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET docker registry
   *
   * @returns {Observable<DockerRegistryClass[]>}
   * @memberof DockerRegistryService
   */
  get_docker_registry(): Observable<DockerRegistryClass[]> {
    return this.httpClient_.get<DockerRegistryInterface[]>(environment.DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY)
      .pipe(map((response: DockerRegistryInterface[]) => response.map((registry: DockerRegistryInterface) => new DockerRegistryClass(registry))),
            catchError((error: HttpErrorResponse) => this.handleError('get docker registry', error)));
  }
}
