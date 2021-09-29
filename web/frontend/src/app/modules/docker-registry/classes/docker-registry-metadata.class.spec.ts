import { MockDockerRegistryMetadataInterface } from '../../../../../static-data/interface-objects';
import { DockerRegistryMetadataClass } from './docker-registry-metadata.class';

describe('DockerRegistryMetadataClass', () => {

  describe('new DockerRegistryMetadataClass', () => {
    it(`should create new DockerRegistryMetadataClass`, () => {
      const value: DockerRegistryMetadataClass = new DockerRegistryMetadataClass(MockDockerRegistryMetadataInterface);

      expect(value).toBeDefined();
    });
  });
});
