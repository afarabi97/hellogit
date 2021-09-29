import { InterfacesClass } from '../../src/app/classes';
import { MockInterfacesSensorMainInterface, MockInterfacesSensorSupplementInterface, MockInterfacesServerMainInterface } from '../interface-objects';

export const MockInterfacesServerMainClass: InterfacesClass = new InterfacesClass(MockInterfacesServerMainInterface);
export const MockInterfacesSensorMainClass: InterfacesClass = new InterfacesClass(MockInterfacesSensorMainInterface);
export const MockInterfacesSensorSupplementClass: InterfacesClass = new InterfacesClass(MockInterfacesSensorSupplementInterface);
