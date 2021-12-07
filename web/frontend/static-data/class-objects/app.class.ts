import { AppClass } from '../../src/app/classes';
import {
  MockAppInterfaceArkimeViewer,
  MockAppInterfaceCortex,
  MockAppInterfaceHive,
  MockAppInterfaceMisp,
  MockAppInterfaceRocketChat,
  MockAppInterfaceWikijs
} from '../interface-objects';

export const MockAppClassArkimeViewer: AppClass = new AppClass(MockAppInterfaceArkimeViewer);
export const MockAppClassWikijs: AppClass = new AppClass(MockAppInterfaceWikijs);
export const MockAppClassCortex: AppClass = new AppClass(MockAppInterfaceCortex);
export const MockAppClassMisp: AppClass = new AppClass(MockAppInterfaceMisp);
export const MockAppClassHive: AppClass = new AppClass(MockAppInterfaceHive);
export const MockAppClassRocketChat: AppClass = new AppClass(MockAppInterfaceRocketChat);
export const MockAppClassArray: AppClass[] = [
  MockAppClassArkimeViewer,
  MockAppClassWikijs,
  MockAppClassCortex,
  MockAppClassMisp,
  MockAppClassHive,
  MockAppClassRocketChat
];
