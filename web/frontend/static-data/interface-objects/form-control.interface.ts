import { FormControlInterface } from '../../src/app/interfaces';

export const MockFormControlInterfaceTextinput: FormControlInterface = {
  type: 'textinput',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_textinput'
};
export const MockFormControlInterfaceTextbox: FormControlInterface = {
  type: 'textbox',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_textbox'
};
export const MockFormControlInterfaceTextinputlist: FormControlInterface = {
  type: 'textinputlist',
  default_value: '["192.168.0.0/24"]',
  description: 'Enter Value',
  name: 'fake_textinputlist'
};
export const MockFormControlInterfaceInvisible: FormControlInterface = {
  type: 'invisible',
  name: 'fake_invisible'
};
export const MockFormControlInterfaceCheckbox: FormControlInterface = {
  type: 'checkbox',
  default_value: true,
  description: 'Enter Value',
  trueValue: true,
  falseValue: false,
  name: 'fake_checkbox'
};
export const MockFormControlInterfaceInterface: FormControlInterface = {
  type: 'interface',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_interface'
};
export const MockFormControlInterfaceSuricataList: FormControlInterface = {
  type: 'suricata-list',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_suricata_list'
};
export const MockFormControlInterfaceZeekList: FormControlInterface = {
  type: 'zeek-list',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_zeek_list'
};
export const MockFormControlInterfaceServiceNodeCheckbox: FormControlInterface = {
  type: 'service-node-checkbox',
  default_value: false,
  description: 'Enter Value',
  name: 'fake_service_node_checkbox'
};
export const MockFormControlInterfaceErrorType: FormControlInterface = {
  type: 'error',
  default_value: '',
  description: 'Enter Value',
  name: 'fake_error'
};
export const MockFormControlInterfaceRegex: FormControlInterface = {
  type: 'regexp',
  regexp: '([^\/]+$)',
  name: 'fake_regexp'
};
export const MockFormControlInterfaceRequired: FormControlInterface = {
  type: 'required',
  required: true,
  name: 'fake_required'
};
export const MockFormControlInterfaceRegexandRequired: FormControlInterface = {
  type: 'regexp',
  regexp: '([^\/]+$)',
  required: true,
  name: 'fake_regexp'
};
