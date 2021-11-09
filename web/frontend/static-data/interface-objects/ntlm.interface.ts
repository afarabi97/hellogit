import { NTLMInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';

export const MockNTLMInterface1: NTLMInterface = {
  domain_name: 'ntlm domain 1',
  is_ssl: true,
  port: '443'
};
export const MockNTLMInterface2: NTLMInterface = {
  domain_name: 'ntlm domain 2',
  is_ssl: false,
  port: '844'
};
