import { Observable } from "rxjs";

import { DockerRegistryClass } from '../../classes/docker-registry.class';

/**
 * Interface defines the docker registry service
 *
 * @export
 * @interface DockerRegistryServiceInterface
 */
export interface DockerRegistryServiceInterface {
  get_docker_registry(): Observable<DockerRegistryClass[]>;
}
