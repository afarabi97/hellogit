import { MockDockerRegistryInterface } from '../../../../../static-data/interface-objects';
import { DockerRegistryInterface } from '../interfaces/docker-registry.interface';
import { DockerRegistryClass } from './docker-registry.class';

describe('DockerRegistryClass', () => {

  describe('new DockerRegistryClass', () => {
    it(`should create new DockerRegistryClass`, () => {
      const value: DockerRegistryClass = new DockerRegistryClass(MockDockerRegistryInterface);

      expect(value).toBeDefined();
    });

    it(`should create new DockerRegistryClass and handle defined metadata`, () => {
      const value: DockerRegistryClass = new DockerRegistryClass(MockDockerRegistryInterface);

      expect(value.metadata.length > 0).toBeTrue();
    });

    it(`should create new DockerRegistryClass and handle undefined metadata`, () => {
      const value: DockerRegistryClass = new DockerRegistryClass(MockDockerRegistryInterface);
      value.metadata = undefined;
      const new_value: DockerRegistryClass = new DockerRegistryClass(value as DockerRegistryInterface);

      expect(new_value.metadata).toBeDefined();
      expect(new_value.metadata.length === 0).toBeTrue();
    });
  });
});
