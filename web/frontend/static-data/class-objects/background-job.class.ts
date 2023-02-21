
import { BackgroundJobClass } from '../../src/app/classes';
import {
  MockBackgroundJobInterface,
  MockBackgroundJobInterfaceFailed,
  MockBackgroundJobInterfaceStarted
} from '../interface-objects';

export const MockBackgroundJobClass: BackgroundJobClass = new BackgroundJobClass(MockBackgroundJobInterface);
export const MockBackgroundJobClassStarted: BackgroundJobClass = new BackgroundJobClass(MockBackgroundJobInterfaceStarted);
export const MockBackgroundJobClassFailed: BackgroundJobClass = new BackgroundJobClass(MockBackgroundJobInterfaceFailed);
