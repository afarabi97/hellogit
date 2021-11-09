import { NTLMClass } from '../../src/app/modules/agent-builder-chooser/classes';
import { MockNTLMInterface1, MockNTLMInterface2 } from '../interface-objects';

export const MockNTLMClass1: NTLMClass = new NTLMClass(MockNTLMInterface1);
export const MockNTLMClass2: NTLMClass = new NTLMClass(MockNTLMInterface2);
