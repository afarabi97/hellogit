import { ObjectUtilitiesClass } from '../../../classes';
import { DockerRegistryMetadataInterface } from '../interfaces/docker-registry-metadata.interface';
import { DockerRegistryInterface } from '../interfaces/docker-registry.interface';
import { DockerRegistryMetadataClass } from './docker-registry-metadata.class';

/**
 * Class defines the docker registry
 *
 * @export
 * @class DockerRegistryClass
 * @implements {DockerRegistryInterface}
 */
export class DockerRegistryClass implements DockerRegistryInterface {
  name: string;
  metadata: DockerRegistryMetadataClass[];

  /**
   * Creates an instance of DockerRegistryClass.
   *
   * @param {DockerRegistryInterface} docker_registry_interface
   * @memberof DockerRegistryClass
   */
  constructor(docker_registry_interface: DockerRegistryInterface) {
    this.name = docker_registry_interface.name;
    if (ObjectUtilitiesClass.notUndefNull(docker_registry_interface.metadata)) {
      this.metadata = docker_registry_interface.metadata.map((metadata: DockerRegistryMetadataInterface) => new DockerRegistryMetadataClass(metadata));
    } else {
      this.metadata = [];
    }
  }
}
