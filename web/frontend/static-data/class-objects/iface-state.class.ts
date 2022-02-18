import { IFACEStateClass } from '../../src/app/classes';
import { MockIfaceStateInterfaceENS192, MockIfaceStateInterfaceENS224 } from '../interface-objects';

export const MockIfaceStateClassENS192: IFACEStateClass = new IFACEStateClass(MockIfaceStateInterfaceENS192);
export const MockIfaceStateClassENS224: IFACEStateClass = new IFACEStateClass(MockIfaceStateInterfaceENS224);
export const MockIfaceStateClassArray: IFACEStateClass[] = [
  MockIfaceStateClassENS192,
  MockIfaceStateClassENS224
];
