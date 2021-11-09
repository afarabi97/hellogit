import { IPTargetListInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';
import { MockHostInterfacesArray1, MockHostInterfacesArray2 } from './host.interface';
import { MockNTLMInterface1, MockNTLMInterface2 } from './ntlm.interface';
import { MockSMBInterface1, MockSMBInterface2 } from './smb.interface';

export const MockIPTargetListInterface1: IPTargetListInterface = {
  _id: '5db3291789372679049120vb',
  name: 'Fake Target List 1',
  protocol: 'fake protocol',
  ntlm: MockNTLMInterface1,
  smb: MockSMBInterface1,
  targets: MockHostInterfacesArray1
};
export const MockIPTargetListInterface2: IPTargetListInterface = {
  _id: '5db32912343726790498601b',
  name: 'Fake Target List 2',
  protocol: 'fake protocol',
  ntlm: MockNTLMInterface2,
  smb: MockSMBInterface2,
  targets: MockHostInterfacesArray2
};
export const MockIPTargetListInterfacesArray: IPTargetListInterface[] = [
  MockIPTargetListInterface1,
  MockIPTargetListInterface2
];
