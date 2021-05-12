import { DockerRegistryMetadataInterface } from '../interfaces/docker-registry-metadata.interface';

/**
 * Class defines the dockert registry metadata
 *
 * @export
 * @class DockerRegistryMetadataClass
 */
export class DockerRegistryMetadataClass implements DockerRegistryMetadataInterface {
  tag: string;
  image_id: string;
  image_size: number;

  /**
   * Creates an instance of DockerRegistryMetadataClass.
   *
   * @param {DockerRegistryMetadataInterface} docker_registry_metadata_interface
   * @memberof DockerRegistryMetadataClass
   */
  constructor(docker_registry_metadata_interface: DockerRegistryMetadataInterface) {
    this.tag = docker_registry_metadata_interface.tag;
    this.image_id = docker_registry_metadata_interface.image_id;
    this.image_size = docker_registry_metadata_interface.image_size;
  }
}
