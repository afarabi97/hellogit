import { RoleProcessInterface } from '../../src/app/interfaces';
import { MockDisksSDAInterface, MockDisksSDBInterface } from './disks.interface';

export const MockRoleProcessInterfaceSensor: RoleProcessInterface = {
  role: 'arkime',
  process: {
    selectedProcess: 'uninstall',
    selectedNodes: [
      {
        _id: '1608737e1e01410a8f0a0b29b32d5744',
        hostname: 'fake-sensor3.fake',
        ip_address: '10.40.31.70',
        mac_address: '72:eb:b6:00:be:ba',
        data_drives: [
          'sdb'
        ],
        boot_drives: [
          'sda'
        ],
        raid_drives: [
          'sda',
          'sdb'
        ],
        pxe_type: 'BIOS',
        os_raid: false,
        os_raid_root_size: 50,
        node_type: 'Sensor',
        deviceFacts: {
          potential_monitor_interfaces: [
            'ens224'
          ],
          default_ipv4_settings: {
            address: '10.40.31.70',
            alias: 'ens192',
            broadcast: '10.40.31.255',
            gateway: '10.40.31.1',
            interface: 'ens192',
            macaddress: '72:eb:b6:00:be:ba',
            mtu: 1500,
            netmask: '255.255.255.0',
            network: '10.40.31.0',
            type: 'ether'
          },
          hostname: 'fake-sensor3.fake',
          disks: [
            MockDisksSDAInterface,
            MockDisksSDBInterface
          ],
          interfaces: [
            {
              name: 'ens192',
              ip_address: '10.40.31.70',
              mac_address: '72:eb:b6:00:be:ba',
              speed: 10000
            },
            {
              name: 'ens224',
              ip_address: '',
              mac_address: '46:3b:70:71:d7:39',
              speed: 10000
            }
          ],
          memory_mb: 15870,
          memory_available: 15.498046875,
          memory_gb: 15.498046875,
          cpus_available: 16,
          management_ip: '10.40.31.70',
          product_name: 'VMware Virtual Platform'
        },
        deployment_type: 'Baremetal',
        vpn_status: null,
        virtual_cpu: 16,
        virtual_mem: 16,
        virtual_os: 100,
        virtual_data: 500,
        jobs: [
          {
            _id: 'fd87883381b54b1ba617b399472bd756',
            message: null,
            name: 'create',
            node_id: '1608737e1e01410a8f0a0b29b32d5744',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Creating Kickstart Profiles',
            job_id: 'cca3bda9-1d61-4334-b1ba-227c45db601e',
            exec_type: 'DEPLOYMENT_JOBS.kickstart_profiles'
          },
          {
            _id: '99fac4c3742b42b083bf6d13b76272ef',
            message: null,
            name: 'provision',
            node_id: '1608737e1e01410a8f0a0b29b32d5744',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Installing RHEL8',
            job_id: 'fe5a02b6-27aa-4c32-b89a-d959deffdf74',
            exec_type: null
          },
          {
            _id: '7dbf6dbfc68d4fb1bc718a51cf2af37e',
            message: null,
            name: 'deploy',
            node_id: '1608737e1e01410a8f0a0b29b32d5744',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Deploying Node',
            job_id: '998fed07-6a8a-4e65-ab38-82159d468a54',
            exec_type: 'DEPLOYMENT_JOBS.add_node'
          }
        ],
        status: {
          application: 'arkime',
          appVersion: '3.1.0',
          status: 'DEPLOYED',
          deployment_name: 'fake-sensor3-arkime',
          hostname: 'fake-sensor3.fake',
          node_type: 'Sensor'
        },
        deployment_name: 'fake-sensor3-arkime'
      }
    ],
    node_affinity: ''
  }
};
export const MockRoleProcessInterfaceServer: RoleProcessInterface = {
  role: 'cortex',
  process: {
    selectedProcess: 'uninstall',
    selectedNodes: [
      {
        _id: '8c27dc84531e44d4adc5f7a2aa8e4027',
        hostname: 'server',
        ip_address: '10.40.31.65',
        mac_address: '00:1b:ea:8f:90:c8',
        data_drives: [
          'sdb'
        ],
        boot_drives: [
          'sda'
        ],
        raid_drives: [
        ],
        pxe_type: 'UEFI',
        os_raid: false,
        os_raid_root_size: 0,
        node_type: 'Control-Plane',
        deviceFacts: {
          potential_monitor_interfaces: [
          ],
          default_ipv4_settings: {
            address: '10.40.31.65',
            alias: 'ens192',
            broadcast: '10.40.31.255',
            gateway: '10.40.31.1',
            interface: 'ens192',
            macaddress: '00:1b:ea:8f:90:c8',
            mtu: 1500,
            netmask: '255.255.255.0',
            network: '10.40.31.0',
            type: 'ether'
          },
          hostname: 'control-plane.fake',
          disks: [
            {
              name: 'sda',
              has_root: true,
              size_gb: 50,
              size_tb: 0.048828125,
              disk_rotation: '1'
            }
          ],
          interfaces: [
            {
              name: 'ens192',
              ip_address: '10.40.31.65',
              mac_address: '00:1b:ea:8f:90:c8',
              speed: 10000
            }
          ],
          memory_mb: 7808,
          memory_available: 7.625,
          memory_gb: 7.625,
          cpus_available: 8,
          management_ip: '10.40.31.65',
          product_name: 'VMware7,1'
        },
        deployment_type: 'Virtual',
        vpn_status: null,
        virtual_cpu: 16,
        virtual_mem: 16,
        virtual_os: 100,
        virtual_data: 500,
        jobs: [
          {
            _id: '782bdf3131cf4a1ea3504d47f687fb22',
            message: null,
            name: 'create',
            node_id: '8c27dc84531e44d4adc5f7a2aa8e4027',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Creating Kickstart Profiles',
            job_id: '3fd68528-f697-4488-a4f3-e2d5e5313f9c',
            exec_type: 'DEPLOYMENT_JOBS.setup_control_plane'
          },
          {
            _id: 'd6afd3ec95484d68a2d8aa3785c6e33c',
            message: null,
            name: 'provision',
            node_id: '8c27dc84531e44d4adc5f7a2aa8e4027',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Installing RHEL8',
            job_id: '0d0f9a19-c17c-45b6-848b-a90d4526661c',
            exec_type: 'DEPLOYMENT_JOBS.setup_control_plane'
          },
          {
            _id: '4d0d39e8a4bf418bb058d003ac51d040',
            message :null,
            name: 'deploy',
            node_id: '8c27dc84531e44d4adc5f7a2aa8e4027',
            pending: false,
            complete: true,
            inprogress: false,
            error: false,
            description: 'Deploying Node',
            job_id: 'c278415e-76be-47db-af0b-4b5414c83e9f',
            exec_type: 'DEPLOYMENT_JOBS.setup_control_plane'
          }
        ]
        ,deployment_name: 'cortex'
      }
    ],
    node_affinity: ''
  }
};
