import { FormControlClass } from '../../src/app/classes';
import {
  MockFormControlInterfaceCheckbox,
  MockFormControlInterfaceErrorType,
  MockFormControlInterfaceInterface,
  MockFormControlInterfaceInvisible,
  MockFormControlInterfaceRegex,
  MockFormControlInterfaceRegexandRequired,
  MockFormControlInterfaceRequired,
  MockFormControlInterfaceServiceNodeCheckbox,
  MockFormControlInterfaceSuricataList,
  MockFormControlInterfaceTextbox,
  MockFormControlInterfaceTextinput,
  MockFormControlInterfaceTextinputlist,
  MockFormControlInterfaceZeekList
} from '../interface-objects';

export const MockFormControlClassTextinput: FormControlClass = new FormControlClass(MockFormControlInterfaceTextinput);
export const MockFormControlClassTextbox: FormControlClass = new FormControlClass(MockFormControlInterfaceTextbox);
export const MockFormControlClassTextinputlist: FormControlClass = new FormControlClass(MockFormControlInterfaceTextinputlist);
export const MockFormControlClassInvisible: FormControlClass = new FormControlClass(MockFormControlInterfaceInvisible);
export const MockFormControlClassCheckbox: FormControlClass = new FormControlClass(MockFormControlInterfaceCheckbox);
export const MockFormControlClassInterface: FormControlClass = new FormControlClass(MockFormControlInterfaceInterface);
export const MockFormControlClassSuricataList: FormControlClass = new FormControlClass(MockFormControlInterfaceSuricataList);
export const MockFormControlClassZeekList: FormControlClass = new FormControlClass(MockFormControlInterfaceZeekList);
export const MockFormControlClassServiceNodeCheckbox: FormControlClass = new FormControlClass(MockFormControlInterfaceServiceNodeCheckbox);
export const MockFormControlClassErrorType: FormControlClass = new FormControlClass(MockFormControlInterfaceErrorType);
export const MockFormControlClassRegex: FormControlClass = new FormControlClass(MockFormControlInterfaceRegex);
export const MockFormControlClassRequired: FormControlClass = new FormControlClass(MockFormControlInterfaceRequired);
export const MockFormControlClassRegexandRequired: FormControlClass = new FormControlClass(MockFormControlInterfaceRegexandRequired);
export const MockFormControlValueObject: Object = {
  fake_textinput: 'fake input value',
  fake_textbox: 'fake textbox value',
  fake_textinputlist: '[\'192.168.0.0/24\']',
  fake_invisible: 'server',
  fake_checkbox: true,
  fake_interface: [ 'ens224' ],
  fake_suricata_list: [ 'alert', 'http', 'dns', 'tls', 'flow', 'other' ],
  fake_zeek_list: [ 'capture', 'connection', 'dce_prc', 'dhcp', 'dnp3', 'dns', 'dpd', 'files', 'ftp', 'http', 'intel', 'irc', 'kerberos', 'modbus', 'mysql' ],
  fake_service_node_checkbox: true
};
