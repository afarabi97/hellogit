import { DockerRegistryClass } from '../../src/app/modules/docker-registry/classes/docker-registry.class';
import { MockDockerRegistryInterface } from '../interface-objects';

export const MockDockerRegistryClass: DockerRegistryClass = new DockerRegistryClass(MockDockerRegistryInterface);
