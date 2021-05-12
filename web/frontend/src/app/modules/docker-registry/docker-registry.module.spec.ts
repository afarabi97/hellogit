import { DockerRegistryModule } from './docker-registry.module';

describe('DockerRegistryModule', () => {
  let docker_registry_module: DockerRegistryModule;

  beforeEach(() => {
    docker_registry_module = new DockerRegistryModule();
  });

  it('should create an instance of DockerRegistryModule', () => {
    expect(docker_registry_module).toBeTruthy();
  });
});
