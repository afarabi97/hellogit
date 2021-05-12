import { DockerRegistryMetadataInterface } from './docker-registry-metadata.interface';

/**
 * Interface defines the docker registry
 *
 * @export
 * @interface DockerRegistryInterface
 */
export interface DockerRegistryInterface {
  name: string;
  metadata: DockerRegistryMetadataInterface[];
}
