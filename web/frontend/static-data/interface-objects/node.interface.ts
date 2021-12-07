import { NodeInterface } from '../../src/app/interfaces';
import { MockDeviceFactsSensorInterface, MockDeviceFactsServerInterface } from './device-facts.interface';

export const MockNodeServerInterface: NodeInterface = {
  "_id": "7ca28bc3132047ef82cc44d948c6e7c7",
  "hostname": "philpot-server1.philpot",
  "ip_address": "10.40.31.68",
  "mac_address": "1a:09:69:bf:8d:7e",
  "data_drives": [
      "sdb"
  ],
  "boot_drives": [
      "sda"
  ],
  "raid_drives": [
      "sda",
      "sdb"
  ],
  "pxe_type": "BIOS",
  "os_raid": false,
  "os_raid_root_size": 50,
  "node_type": "Server",
  "deviceFacts": MockDeviceFactsServerInterface,
  "deployment_type": "Baremetal",
  "vpn_status": null,
  "virtual_cpu": 16,
  "virtual_mem": 16,
  "virtual_os": 100,
  "virtual_data": 500,
  "jobs": [
      {
          "_id": "2c7baad8dd6b4ada96eb8b8e736e55da",
          "message": null,
          "name": "create",
          "node_id": "7ca28bc3132047ef82cc44d948c6e7c7",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Creating Kickstart Profiles",
          "job_id": "88907745-1e6a-4857-b940-f4db44ac669f",
          "exec_type": "DEPLOYMENT_JOBS.kickstart_profiles"
      },
      {
          "_id": "e551d8c823a2469ba714d8c3cb4efbad",
          "message": null,
          "name": "provision",
          "node_id": "7ca28bc3132047ef82cc44d948c6e7c7",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Installing RHLE8",
          "job_id": "4e912bbb-d5d9-461a-98e8-3c559a6c0414",
          "exec_type": null
      },
      {
          "_id": "a20990c4183b42d3b7ebb3a2f9573ac4",
          "message": null,
          "name": "deploy",
          "node_id": "7ca28bc3132047ef82cc44d948c6e7c7",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Deploying Node",
          "job_id": "bd664af1-1ddc-427f-8bc4-9b9d63e8edb8",
          "exec_type": "DEPLOYMENT_JOBS.base_kit"
      }
  ]
};
export const MockNodeSensorInterface: NodeInterface = {
  "_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
  "hostname": "philpot-sensor3.philpot",
  "ip_address": "10.40.31.70",
  "mac_address": "96:f9:c9:c2:54:e2",
  "data_drives": [
      "sdb"
  ],
  "boot_drives": [
      "sda"
  ],
  "raid_drives": [
      "sda",
      "sdb"
  ],
  "pxe_type": "BIOS",
  "os_raid": false,
  "os_raid_root_size": 50,
  "node_type": "Sensor",
  "deviceFacts": MockDeviceFactsSensorInterface,
  "deployment_type": "Baremetal",
  "vpn_status": null,
  "virtual_cpu": 16,
  "virtual_mem": 16,
  "virtual_os": 100,
  "virtual_data": 500,
  "jobs": [
      {
          "_id": "74db55a1d7494ff3a6569442449508fc",
          "message": null,
          "name": "create",
          "node_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Creating Kickstart Profiles",
          "job_id": "33a81e56-bd0b-4a22-b3aa-f5352dfdf1aa",
          "exec_type": "DEPLOYMENT_JOBS.kickstart_profiles"
      },
      {
          "_id": "4ba9d058e13c495c8c17b043fb4c4429",
          "message": null,
          "name": "provision",
          "node_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Installing RHLE8",
          "job_id": "9f93af60-851f-4a48-86da-e6a75ba715b8",
          "exec_type": null
      },
      {
          "_id": "4774a1efde9849d2a0e20e2f092e5cc0",
          "message": null,
          "name": "deploy",
          "node_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
          "pending": false,
          "complete": true,
          "inprogress": false,
          "error": false,
          "description": "Deploying Node",
          "job_id": "3c20ddc2-a653-496e-8b2d-7ec9e7b37771",
          "exec_type": "DEPLOYMENT_JOBS.add_node"
      }
  ]
};
export const MockNodeInterfaceArray: NodeInterface[] = [
  MockNodeServerInterface,
  MockNodeSensorInterface
];
