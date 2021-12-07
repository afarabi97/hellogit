import { GenerateFileInterface } from '../../src/app/interfaces';
import { MockRoleProcessInterfaceSensor, MockRoleProcessInterfaceServer } from './role-process.interface';

export const MockGenerateRoleInterfaceSensor: GenerateFileInterface = {
  ...MockRoleProcessInterfaceSensor,
  configs: [
    {
      'fake-sensor3.fake': {
        pcapWriteMethod: 'simple',
        bpf: '',
        dontSaveBPFs: '',
        freespaceG: '25%',
        maxFileSizeG: 25,
        magicMode: 'basic',
        mem_limit: '20Gi',
        packetThreads: 3,
        tpacketv3NumThreads: 2,
        maxPacketsInQueue: 400000,
        interfaces: [
          'ens224'
        ],
        affinity_hostname: 'fake-sensor3.fake',
        node_hostname: 'fake-sensor3.fake',
        deployment_name: 'fake-sensor3-arkime'
      }
    }
  ]
};
export const MockGenerateRoleInterfaceServer: GenerateFileInterface = {
  ...MockRoleProcessInterfaceServer,
  configs: [
    {
      server: {
        serviceNode: true,
        superadmin_username: 'cortex_admin',
        superadmin_password: 'Password!123456',
        org_name: 'thehive',
        org_admin_username: 'admin_thehive',
        org_admin_password: 'Password!123456',
        node_hostname: 'server',
        deployment_name: 'cortex'
      }
    }
  ]
}
