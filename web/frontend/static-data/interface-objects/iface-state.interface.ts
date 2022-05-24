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
export const MockIfaceStateInterfaceENS224Down: IFACEStateInterface = {
  name: 'ens224',
  state: 'down',
  link_up: false
};
export const MockIfaceStateInterfaceArray: IFACEStateInterface[] = [
  MockIfaceStateInterfaceENS192,
  MockIfaceStateInterfaceENS224
];
export const MockIfaceStateInterfaceArrayAlt: IFACEStateInterface[] = [
  MockIfaceStateInterfaceENS192,
  MockIfaceStateInterfaceENS224Down
];
