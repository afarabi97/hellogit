import { AppConfigInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';
import { MockElementSpecInterfacesArray1, MockElementSpecInterfacesArray2 } from './element-spec.interface';

export const MockAppConfigInterface1: AppConfigInterface = {
  name: 'App Config 1',
  form: MockElementSpecInterfacesArray1
};
export const MockAppConfigInterface2: AppConfigInterface = {
  name: 'App Config 2',
  form: MockElementSpecInterfacesArray2
};
export const MockAppConfigInterfacesArray: AppConfigInterface[] = [
  MockAppConfigInterface1,
  MockAppConfigInterface2
];
