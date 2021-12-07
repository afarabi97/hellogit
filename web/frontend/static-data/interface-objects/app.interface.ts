import { AppInterface } from '../../src/app/interfaces';

export const MockAppInterfaceArkimeViewer: AppInterface = {
  application: 'arkime-viewer',
  deployment_name: 'arkime-viewer'
};
export const MockAppInterfaceWikijs: AppInterface = {
  application: 'wikijs',
  deployment_name: 'wikijs'
};
export const MockAppInterfaceCortex: AppInterface = {
  application: 'cortex',
  deployment_name: 'cortex'
};
export const MockAppInterfaceMisp: AppInterface = {
  application: 'misp',
  deployment_name: 'misp'
};
export const MockAppInterfaceHive: AppInterface = {
  application: 'hive',
  deployment_name: 'hive'
};
export const MockAppInterfaceRocketChat: AppInterface = {
  application: 'rocketchat',
  deployment_name: 'rocketchat'
};
export const MockAppInterfaceArray: AppInterface[] = [
  MockAppInterfaceArkimeViewer,
  MockAppInterfaceWikijs,
  MockAppInterfaceCortex,
  MockAppInterfaceMisp,
  MockAppInterfaceHive,
  MockAppInterfaceRocketChat
];
