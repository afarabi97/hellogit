import { NodeStatusInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockNodeStatusInterfaceArray: NodeStatusInterface[] = [
  {
      "name": "control-plane.test",
      "address": "10.40.31.65",
      "ready": true,
      "type": "control-plane",
      "storage": null,
      "memory": null,
      "cpu": null,
      "capacity": {
          "cpu": "8000m",
          "ephermeral-storage": "18.564Gi",
          "memory": "7.625Gi",
          "pods": "110"
      },
      "allocatable": {
          "cpu": "8000m",
          "ephermeral-storage": "16.708Gi",
          "memory": "7.528Gi",
          "pods": "110"
      },
      "remaining": {
          "cpu": "7100m",
          "memory": "7.528Gi"
      },
      "node_info": {
          "architecture": "amd64",
          "boot_id": "ad5836c9-e188-4897-97b8-a101d127e8ef",
          "container_runtime_version": "cri-o://1.24.1",
          "kernel_version": "4.18.0-193.el8.x86_64",
          "kube_proxy_version": "v1.24.2",
          "kubelet_version": "v1.24.2",
          "machine_id": "339f7c8daf754f52936d6cc15d7ede1a",
          "operating_system": "linux",
          "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
          "system_uuid": "1d461d42-a176-4481-82cf-35124396baf2"
      }
  },
  {
      "name": "test-sensor3.test",
      "address": "10.40.31.70",
      "ready": true,
      "type": "sensor",
      "storage": [
          {
              "name": "root",
              "free": 8310001664,
              "percent": 27.2
          },
          {
              "name": "data",
              "free": 14981865472,
              "percent": 6.9
          }
      ],
      "memory": {
          "available": 9172250624,
          "percent": 44.9
      },
      "cpu": 9.4,
      "capacity": {
          "cpu": "16000m",
          "ephermeral-storage": "18.639Gi",
          "memory": "15.499Gi",
          "pods": "110"
      },
      "allocatable": {
          "cpu": "16000m",
          "ephermeral-storage": "16.775Gi",
          "memory": "15.401Gi",
          "pods": "110"
      },
      "remaining": {
          "cpu": "3550m",
          "memory": "9.303Gi"
      },
      "node_info": {
          "architecture": "amd64",
          "boot_id": "3e9ef46f-fa88-461b-aa43-4a5fcbd463ad",
          "container_runtime_version": "cri-o://1.24.1",
          "kernel_version": "4.18.0-193.el8.x86_64",
          "kube_proxy_version": "v1.24.2",
          "kubelet_version": "v1.24.2",
          "machine_id": "4aa2a9004c0a43a9af774132f6543fb9",
          "operating_system": "linux",
          "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
          "system_uuid": "26841d42-98ce-aa04-75d5-ee71d31e2ff0"
      }
  },
  {
      "name": "test-server1.test",
      "address": "10.40.31.68",
      "ready": true,
      "type": "server",
      "storage": [
          {
              "name": "root",
              "free": 8335302656,
              "percent": 27.0
          },
          {
              "name": "data",
              "free": 436682752,
              "percent": 91.8
          }
      ],
      "memory": {
          "available": 20950802432,
          "percent": 37.6
      },
      "cpu": 15.2,
      "capacity": {
          "cpu": "16000m",
          "ephermeral-storage": "18.639Gi",
          "memory": "31.249Gi",
          "pods": "110"
      },
      "allocatable": {
          "cpu": "16000m",
          "ephermeral-storage": "16.775Gi",
          "memory": "31.151Gi",
          "pods": "110"
      },
      "remaining": {
          "cpu": "11550m",
          "memory": "26.907Gi"
      },
      "node_info": {
          "architecture": "amd64",
          "boot_id": "89a0edda-565f-4e94-a882-2a86d7d75dae",
          "container_runtime_version": "cri-o://1.24.1",
          "kernel_version": "4.18.0-193.el8.x86_64",
          "kube_proxy_version": "v1.24.2",
          "kubelet_version": "v1.24.2",
          "machine_id": "f013f4c3c5bc4d2fab07b31e6bb22df7",
          "operating_system": "linux",
          "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
          "system_uuid": "ec881d42-a5cd-c318-2567-65c8f27275fc"
      }
  },
  {
      "name": "test-server2.test",
      "address": "10.40.31.69",
      "ready": true,
      "type": "server",
      "storage": [
          {
              "name": "root",
              "free": 8335335424,
              "percent": 27.0
          },
          {
              "name": "data",
              "free": 231124992,
              "percent": 95.7
          }
      ],
      "memory": {
          "available": 19584897024,
          "percent": 41.6
      },
      "cpu": 34.2,
      "capacity": {
          "cpu": "16000m",
          "ephermeral-storage": "18.639Gi",
          "memory": "31.249Gi",
          "pods": "110"
      },
      "allocatable": {
          "cpu": "16000m",
          "ephermeral-storage": "16.775Gi",
          "memory": "31.151Gi",
          "pods": "110"
      },
      "remaining": {
          "cpu": "9450m",
          "memory": "22.917Gi"
      },
      "node_info": {
          "architecture": "amd64",
          "boot_id": "f971b6d0-40ef-4c6b-8927-d93341bf0217",
          "container_runtime_version": "cri-o://1.24.1",
          "kernel_version": "4.18.0-193.el8.x86_64",
          "kube_proxy_version": "v1.24.2",
          "kubelet_version": "v1.24.2",
          "machine_id": "56ed337b123242849fe155d893d3618a",
          "operating_system": "linux",
          "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
          "system_uuid": "8f3e1d42-2b07-48d1-9f7d-2ceabc45be59"
      }
  },
  {
      "name": "test-service4.test",
      "address": "10.40.31.71",
      "ready": true,
      "type": "service",
      "storage": [
          {
              "name": "root",
              "free": 19753938944,
              "percent": 13.8
          },
          {
              "name": "data",
              "free": 531307958272,
              "percent": 1.0
          }
      ],
      "memory": {
          "available": 5602947072,
          "percent": 83.3
      },
      "cpu": 10.3,
      "capacity": {
          "cpu": "24000m",
          "ephermeral-storage": "37.372Gi",
          "memory": "31.247Gi",
          "pods": "110"
      },
      "allocatable": {
          "cpu": "24000m",
          "ephermeral-storage": "33.635Gi",
          "memory": "31.149Gi",
          "pods": "110"
      },
      "remaining": {
          "cpu": "18650m",
          "memory": "24.856Gi"
      },
      "node_info": {
          "architecture": "amd64",
          "boot_id": "cffdb14e-18bb-4ccb-847c-7f9c067c139b",
          "container_runtime_version": "cri-o://1.24.1",
          "kernel_version": "4.18.0-193.el8.x86_64",
          "kube_proxy_version": "v1.24.2",
          "kubelet_version": "v1.24.2",
          "machine_id": "afdf57991a9c425e9a983c71ebfc0f4a",
          "operating_system": "linux",
          "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
          "system_uuid": "5d8f1d42-5ddb-c087-89b9-bc1066da44e8"
      }
  }
];
