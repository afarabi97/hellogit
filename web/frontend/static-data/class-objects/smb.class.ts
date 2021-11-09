import { SMBClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockSMBInterface1, MockSMBInterface2 } from '../interface-objects';

export const MockSMBClass1: SMBClass = new SMBClass(MockSMBInterface1);
export const MockSMBClass2: SMBClass = new SMBClass(MockSMBInterface2);
