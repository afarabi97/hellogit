import { MockDockerRegistryMetadataInterface } from '../../../../../static-data/interface-objects-v3_7';
import { DockerRegistryMetadataClass } from './docker-registry-metadata.class';

describe('DockerRegistryMetadataClass', () => {

  describe('new DockerRegistryMetadataClass', () => {
    it(`should create new DockerRegistryMetadataClass`, () => {
      const value: DockerRegistryMetadataClass = new DockerRegistryMetadataClass(MockDockerRegistryMetadataInterface);

      expect(value).toBeDefined();
    });
  });
});
