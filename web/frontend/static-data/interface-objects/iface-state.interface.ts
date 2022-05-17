import { IFACEStateInterface } from '../../src/app/interfaces';

export const MockIfaceStateInterfaceENS192: IFACEStateInterface = {
  name: 'ens192',
  state: 'up',
  link_up: false
};
export const MockIfaceStateInterfaceENS224: IFACEStateInterface = {
  name: 'ens224',
  state: 'up',
  link_up: true
};
export const MockIfaceStateInterfaceArray: IFACEStateInterface[] = [
  MockIfaceStateInterfaceENS192,
  MockIfaceStateInterfaceENS224
];
