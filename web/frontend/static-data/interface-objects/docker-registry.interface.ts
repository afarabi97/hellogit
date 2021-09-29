import { DockerRegistryInterface } from '../../src/app/modules/docker-registry/interfaces/docker-registry.interface';
import { MockDockerRegistryMetadataInterface } from './docker-registry-metadata.interface';

export const MockDockerRegistryInterface: DockerRegistryInterface = {
  name: 'Fake',
  metadata: [
    MockDockerRegistryMetadataInterface
  ]
};
