import { ElementSpecInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';

export const MockElementSpecInterface1: ElementSpecInterface = {
  name: 'username',
  type: 'text',
  placeholder: 'Username'
};
export const MockElementSpecInterface2: ElementSpecInterface = {
  description: 'Enter password',
  name: 'password',
  type: 'password',
  placeholder: 'Password'
};
export const MockElementSpecInterface3: ElementSpecInterface = {
  name: 'description',
  type: 'textinput',
  placeholder: 'Description',
  default_value: 'fake description',
  regexp: '^[a-zA-Z]',
  required: true
};
export const MockElementSpecInterface4: ElementSpecInterface = {
  description: 'Check if admin',
  name: 'is_admin',
  type: 'checkbox',
  label: 'Admin User',
  default_value: 'false'
};
export const MockElementSpecInterfacesArray1: ElementSpecInterface[] = [
  MockElementSpecInterface1,
  MockElementSpecInterface2
];
export const MockElementSpecInterfacesArray2: ElementSpecInterface[] = [
  MockElementSpecInterface3,
  MockElementSpecInterface4
];
