import { AssociatedPodClass } from '../../src/app/modules/config-map/classes/associated-pod.class';
import {
    MockAssociatedPodInterface1,
    MockAssociatedPodInterface2,
    MockAssociatedPodInterface3
} from '../interface-objects';

export const MockAssociatedPodClass1: AssociatedPodClass = new AssociatedPodClass(MockAssociatedPodInterface1);

export const MockAssociatedPodClass2: AssociatedPodClass = new AssociatedPodClass(MockAssociatedPodInterface2);

export const MockAssociatedPodClass3: AssociatedPodClass = new AssociatedPodClass(MockAssociatedPodInterface3);

export const MockAssociatedPodClassArray: AssociatedPodClass[] = [
    MockAssociatedPodClass1,
    MockAssociatedPodClass2,
    MockAssociatedPodClass3
];
