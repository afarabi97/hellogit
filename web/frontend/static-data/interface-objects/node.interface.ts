import { NodeInterface } from '../../src/app/interfaces';
import { MockDeviceFactsSensorInterface, MockDeviceFactsServerInterface } from './device-facts.interface';

export const MockNodeServerInterface: NodeInterface = {
  "_id": "7ca28bc3132047ef82cc44d948c6e7c7",
  "hostname": "fake-server1.fake",
  "ip_address": "10.40.31.68",
  "mac_address": "1a:09:69:bf:8d:7e",
  "raid0_override": false,
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
        "description": "Installing RHEL8",
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
export const MockNodeServerInterfaceCreateAlt: NodeInterface = {
  "_id": "7ca28bc3132047ef82cc44d948b6e7c7",
  "hostname": "fake-server2.fake",
  "ip_address": "10.40.31.69",
  "mac_address": "1a:09:69:bf:8c:7e",
  "raid0_override": false,
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
          "_id": "2c7baad8dd6b4ada96eb8b8e636e55da",
          "message": null,
          "name": "create",
          "node_id": "7ca28bc3132047ef82cc44d949c6e7c7",
          "pending": false,
          "complete": false,
          "inprogress": false,
          "error": false,
          "description": "Creating Kickstart Profiles",
          "job_id": "88907745-1e6a-4857-b940-f4db44ac669f",
          "exec_type": "DEPLOYMENT_JOBS.kickstart_profiles"
      }
  ]
};
export const MockNodeSensorInterface: NodeInterface = {
  "_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
  "hostname": "fake-dev-sensor3.fake",
  "ip_address": "10.40.31.70",
  "mac_address": "96:f9:c9:c2:54:e2",
  "raid0_override": false,
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
          "complete": false,
          "inprogress": false,
          "error": true,
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
          "description": "Installing RHEL8",
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
export const MockNodeSensorInterfaceNoJobs: NodeInterface = {
  "_id": "b6ec3e47fbeb483aaa9f5a56cd5b4de3",
  "hostname": "fake-dev-sensor4.fake",
  "ip_address": "10.40.31.72",
  "mac_address": "96:f9:c9:c3:54:e2",
  "raid0_override": false,
  "node_type": "Sensor",
  "deviceFacts": MockDeviceFactsSensorInterface,
  "deployment_type": "Iso",
  "vpn_status": null,
  "virtual_cpu": 16,
  "virtual_mem": 16,
  "virtual_os": 100,
  "virtual_data": 500,
  "jobs": [
  ]
};
export const MockNodeInterfaceArray: NodeInterface[] = [
  {
    "_id": "ca9a882b89d148c2876cc0a2daac0bb7",
    "hostname": "control-plane.fake",
    "ip_address": "10.40.31.65",
    "mac_address": "00:1b:ea:c0:27:e9",
    "raid0_override": false,
    "node_type": "Control-Plane",
    "deviceFacts": {
        "potential_monitor_interfaces": [],
        "default_ipv4_settings": {
            "address": "10.40.31.65",
            "alias": "ens192",
            "broadcast": "10.40.31.255",
            "gateway": "10.40.31.1",
            "interface": "ens192",
            "macaddress": "00:1b:ea:c0:27:e9",
            "mtu": 1500,
            "netmask": "255.255.255.0",
            "network": "10.40.31.0",
            "type": "ether"
        },
        "hostname": "control-plane.fake",
        "disks": [
            {
                "name": "sda",
                "has_root": true,
                "size_gb": 50.0,
                "size_tb": 0.048828125,
                "disk_rotation": "1"
            }
        ],
        "interfaces": [
            {
                "name": "ens192",
                "ip_address": "10.40.31.65",
                "mac_address": "00:1b:ea:c0:27:e9",
                "speed": 10000
            }
        ],
        "memory_mb": 7808.0,
        "memory_available": 7.625,
        "memory_gb": 7.625,
        "cpus_available": 8,
        "management_ip": "10.40.31.65",
        "product_name": "VMware7,1"
    },
    "deployment_type": "Virtual",
    "vpn_status": null,
    "virtual_cpu": 16,
    "virtual_mem": 16,
    "virtual_os": 100,
    "virtual_data": 500
  },
  {
    "_id": "d3808c3484fd4c01bc78d83ea3b7dce5",
    "hostname": "fake-server1.fake",
    "ip_address": "10.40.31.68",
    "mac_address": "d6:79:63:90:59:64",
    "raid0_override": false,
    "node_type": "Server",
    "deviceFacts": {
        "potential_monitor_interfaces": [],
        "default_ipv4_settings": {
            "address": "10.40.31.68",
            "alias": "ens192",
            "broadcast": "10.40.31.255",
            "gateway": "10.40.31.1",
            "interface": "ens192",
            "macaddress": "d6:79:63:90:59:64",
            "mtu": 1500,
            "netmask": "255.255.255.0",
            "network": "10.40.31.0",
            "type": "ether"
        },
        "hostname": "fake-server1.fake",
        "disks": [
            {
                "name": "sda",
                "has_root": true,
                "size_gb": 50.0,
                "size_tb": 0.048828125,
                "disk_rotation": "1"
            },
            {
                "name": "sdb",
                "has_root": false,
                "size_gb": 5.0,
                "size_tb": 0.0048828125,
                "disk_rotation": "1"
            }
        ],
        "interfaces": [
            {
                "name": "ens192",
                "ip_address": "10.40.31.68",
                "mac_address": "d6:79:63:90:59:64",
                "speed": 10000
            }
        ],
        "memory_mb": 31998.0,
        "memory_available": 31.248046875,
        "memory_gb": 31.248046875,
        "cpus_available": 16,
        "management_ip": "10.40.31.68",
        "product_name": "VMware Virtual Platform"
    },
    "deployment_type": "Baremetal",
    "vpn_status": null,
    "virtual_cpu": 16,
    "virtual_mem": 16,
    "virtual_os": 100,
    "virtual_data": 500,
    "jobs": [
        {
            "_id": "2c7baad8dd6b4ada96eb8b8e636e55da",
            "message": null,
            "name": "remove",
            "node_id": "7ca28bc3132047ef82cc44d949c6e7c7",
            "pending": false,
            "complete": false,
            "inprogress": false,
            "error": false,
            "description": "Creating Kickstart Profiles",
            "job_id": "88907745-1e6a-4857-b940-f4db44ac669f",
            "exec_type": "DEPLOYMENT_JOBS.kickstart_profiles"
        }
    ]
  },
  {
    "_id": "60ea0775521f48248febfb427560fb0d",
    "hostname": "fake-server2.fake",
    "ip_address": "10.40.31.69",
    "mac_address": "fe:2b:a2:10:40:52",
    "raid0_override": false,
    "node_type": "Server",
    "deviceFacts": {
        "potential_monitor_interfaces": [],
        "default_ipv4_settings": {
            "address": "10.40.31.69",
            "alias": "ens192",
            "broadcast": "10.40.31.255",
            "gateway": "10.40.31.1",
            "interface": "ens192",
            "macaddress": "fe:2b:a2:10:40:52",
            "mtu": 1500,
            "netmask": "255.255.255.0",
            "network": "10.40.31.0",
            "type": "ether"
        },
        "hostname": "fake-server2.fake",
        "disks": [
            {
                "name": "sda",
                "has_root": true,
                "size_gb": 50.0,
                "size_tb": 0.048828125,
                "disk_rotation": "1"
            },
            {
                "name": "sdb",
                "has_root": false,
                "size_gb": 5.0,
                "size_tb": 0.0048828125,
                "disk_rotation": "1"
            }
        ],
        "interfaces": [
            {
                "name": "ens192",
                "ip_address": "10.40.31.69",
                "mac_address": "fe:2b:a2:10:40:52",
                "speed": 10000
            }
        ],
        "memory_mb": 31998.0,
        "memory_available": 31.248046875,
        "memory_gb": 31.248046875,
        "cpus_available": 16,
        "management_ip": "10.40.31.69",
        "product_name": "VMware Virtual Platform"
    },
    "deployment_type": "Baremetal",
    "vpn_status": null,
    "virtual_cpu": 16,
    "virtual_mem": 16,
    "virtual_os": 100,
    "virtual_data": 500
  },
  {
    "_id": "7edb6c07fff44a799cd48402eb965d92",
    "hostname": "fake-service4.fake",
    "ip_address": "10.40.31.71",
    "mac_address": "00:1b:ea:a4:ef:86",
    "raid0_override": false,
    "node_type": "Service",
    "deviceFacts": {
        "potential_monitor_interfaces": [],
        "default_ipv4_settings": {
            "address": "10.40.31.71",
            "alias": "ens192",
            "broadcast": "10.40.31.255",
            "gateway": "10.40.31.1",
            "interface": "ens192",
            "macaddress": "00:1b:ea:a4:ef:86",
            "mtu": 1500,
            "netmask": "255.255.255.0",
            "network": "10.40.31.0",
            "type": "ether"
        },
        "hostname": "fake-service4.fake",
        "disks": [
            {
                "name": "sda",
                "has_root": true,
                "size_gb": 100.0,
                "size_tb": 0.09765625,
                "disk_rotation": "1"
            },
            {
                "name": "sdb",
                "has_root": false,
                "size_gb": 500.0,
                "size_tb": 0.48828125,
                "disk_rotation": "1"
            }
        ],
        "interfaces": [
            {
                "name": "ens192",
                "ip_address": "10.40.31.71",
                "mac_address": "00:1b:ea:a4:ef:86",
                "speed": 10000
            }
        ],
        "memory_mb": 31996.0,
        "memory_available": 31.24609375,
        "memory_gb": 31.24609375,
        "cpus_available": 24,
        "management_ip": "10.40.31.71",
        "product_name": "VMware7,1"
    },
    "deployment_type": "Virtual",
    "vpn_status": null,
    "virtual_cpu": 24,
    "virtual_mem": 32,
    "virtual_os": 100,
    "virtual_data": 500
  },
  {
    "_id": "763e8d30cb6c427ba7122d7ed7bd9c3c",
    "hostname": "fake-sensor3.fake",
    "ip_address": "10.40.31.134",
    "mac_address": "9e:07:38:26:7e:71",
    "raid0_override": false,
    "node_type": "Sensor",
    "deviceFacts": {
      "potential_monitor_interfaces": [
          "ens224"
      ],
      "default_ipv4_settings": {
          "address": "10.40.31.134",
          "alias": "ens192",
          "broadcast": "10.40.31.255",
          "gateway": "10.40.31.1",
          "interface": "ens192",
          "macaddress": "9e:07:38:26:7e:71",
          "mtu": 1500,
          "netmask": "255.255.255.0",
          "network": "10.40.31.0",
          "type": "ether"
      },
      "hostname": "fake-sensor3.fake",
      "disks": [
          {
              "name": "sda",
              "has_root": true,
              "size_gb": 50.0,
              "size_tb": 0.048828125,
              "disk_rotation": "1"
          },
          {
              "name": "sdb",
              "has_root": false,
              "size_gb": 15.0,
              "size_tb": 0.0146484375,
              "disk_rotation": "1"
          }
      ],
      "interfaces": [
          {
              "name": "ens192",
              "ip_address": "10.40.31.134",
              "mac_address": "9e:07:38:26:7e:71",
              "speed": 10000
          },
          {
              "name": "ens224",
              "ip_address": "",
              "mac_address": "5e:a8:74:24:06:31",
              "speed": 10000
          }
      ],
      "memory_mb": 15870.0,
      "memory_available": 15.498046875,
      "memory_gb": 15.498046875,
      "cpus_available": 16,
      "management_ip": "10.40.31.134",
      "product_name": "VMware Virtual Platform"
    },
    "deployment_type": "Baremetal",
    "vpn_status": null,
    "virtual_cpu": 16,
    "virtual_mem": 16,
    "virtual_os": 100,
    "virtual_data": 500,
    "jobs": [
    ]
  },
  {
    "_id": "763e8d30cb6c427ba7122d7ed7bd9c3c",
    "hostname": "fake-sensor4.fake",
    "ip_address": "10.40.31.134",
    "mac_address": "9e:07:38:26:7e:71",
    "raid0_override": false,
    "node_type": "Sensor",
    "deviceFacts": {
      "potential_monitor_interfaces": [
          "ens224"
      ],
      "default_ipv4_settings": {
          "address": "10.40.31.134",
          "alias": "ens192",
          "broadcast": "10.40.31.255",
          "gateway": "10.40.31.1",
          "interface": "ens192",
          "macaddress": "9e:07:38:26:7e:71",
          "mtu": 1500,
          "netmask": "255.255.255.0",
          "network": "10.40.31.0",
          "type": "ether"
      },
      "hostname": "fake-sensor4.fake",
      "disks": [
          {
              "name": "sda",
              "has_root": true,
              "size_gb": 50.0,
              "size_tb": 0.048828125,
              "disk_rotation": "1"
          },
          {
              "name": "sdb",
              "has_root": false,
              "size_gb": 15.0,
              "size_tb": 0.0146484375,
              "disk_rotation": "1"
          }
      ],
      "interfaces": [
          {
              "name": "ens192",
              "ip_address": "10.40.31.134",
              "mac_address": "9e:07:38:26:7e:71",
              "speed": 10000
          },
          {
              "name": "ens224",
              "ip_address": "",
              "mac_address": "5e:a8:74:24:06:31",
              "speed": 10000
          }
      ],
      "memory_mb": 15870.0,
      "memory_available": 15.498046875,
      "memory_gb": 15.498046875,
      "cpus_available": 16,
      "management_ip": "10.40.31.134",
      "product_name": "VMware Virtual Platform"
    },
    "deployment_type": "Iso",
    "vpn_status": null,
    "virtual_cpu": 16,
    "virtual_mem": 16,
    "virtual_os": 100,
    "virtual_data": 500,
    "jobs": [
    ]
  },
  {
    deployment_type: "Virtual",
    deviceFacts: {
      "potential_monitor_interfaces": [
        "ens224"
      ],
      "default_ipv4_settings": {
        "address": "10.40.31.134",
        "alias": "ens192",
        "broadcast": "10.40.31.255",
        "gateway": "10.40.31.1",
        "interface": "ens192",
        "macaddress": "9e:07:38:26:7e:71",
        "mtu": 1500,
        "netmask": "255.255.255.0",
        "network": "10.40.31.0",
        "type": "ether"
      },
      "hostname": "fake-sensor4.fake",
      "disks": [
        {
            "name": "sda",
            "has_root": true,
            "size_gb": 50.0,
            "size_tb": 0.048828125,
            "disk_rotation": "1"
        },
        {
            "name": "sdb",
            "has_root": false,
            "size_gb": 15.0,
            "size_tb": 0.0146484375,
            "disk_rotation": "1"
        }
      ],
      "interfaces": [
        {
            "name": "ens192",
            "ip_address": "10.40.31.134",
            "mac_address": "9e:07:38:26:7e:71",
            "speed": 10000
        },
        {
            "name": "ens224",
            "ip_address": "",
            "mac_address": "5e:a8:74:24:06:31",
            "speed": 10000
        }
      ],
      "memory_mb": 15870.0,
      "memory_available": 15.498046875,
      "memory_gb": 15.498046875,
      "cpus_available": 16,
      "management_ip": "10.40.31.134",
      "product_name": "VMware Virtual Platform"},
    hostname: "test-mip1.test",
    ip_address: "10.40.31.7",
    jobs: [
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
    ],
    mac_address: "00:1b:ea:f9:cb:9d",
    node_type: "MIP",
    raid0_override: null,
    virtual_cpu: 8,
    virtual_data: 500,
    virtual_mem: 8,
    virtual_os: 500,
    vpn_status: null,
    _id: "91dda3fe680c47d293c5b10a1fba05bd"
  },
  {
    "_id": "b6ec3e47fbeb483aaa9f5a56cd5b5de3",
    "hostname": "fake-dev-sensor3.fake",
    "ip_address": "10.40.31.70",
    "mac_address": "96:f9:c9:c2:54:e2",
    "raid0_override": false,
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
            "complete": false,
            "inprogress": false,
            "error": true,
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
            "description": "Installing RHEL8",
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
  }
];
