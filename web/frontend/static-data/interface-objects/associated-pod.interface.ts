import { AssociatedPodInterface } from '../../src/app/modules/config-map/interfaces/associated-pod.interface';

export const MockAssociatedPodInterface1: AssociatedPodInterface = {
  podName: 'local-volume-provisioner-2r6rp',
  namespace: 'default'
};

export const MockAssociatedPodInterface2: AssociatedPodInterface = {
  podName: 'local-volume-provisioner-67qx5',
  namespace: 'default'
};

export const MockAssociatedPodInterface3: AssociatedPodInterface = {
  podName: 'local-volume-provisioner-hv64c',
  namespace: 'default'
};

export const MockAssociatedPodInterfaceArray: AssociatedPodInterface[] = [
    MockAssociatedPodInterface1,
    MockAssociatedPodInterface2,
    MockAssociatedPodInterface3
];
