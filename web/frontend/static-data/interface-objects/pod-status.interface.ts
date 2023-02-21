import { PodStatusInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockPodStatusInterfaceArray: PodStatusInterface[] = [
  {
    "namespace": "cert-manager",
    "name": "cert-manager-579dbbc56-w9wfs",
    "node_name": "philpot-server1.philpot",
    "status_brief": "Running",
    "restart_count": 1,
    "states": [
      "cert-manager: running"
    ],
    "resources": [
      {
        "name": "cert-manager",
        "resources": {
          "limits": null,
          "requests": null
        }
      }
    ],
    "status": {
      "conditions": [
        {
          "last_transition_time": "2023-01-25 20:22:46",
          "status": "True",
          "type": "Initialized"
        },
        {
          "last_transition_time": "2023-01-25 20:41:09",
          "status": "True",
          "type": "Ready"
        },
        {
          "last_transition_time": "2023-01-25 20:41:09",
          "status": "True",
          "type": "ContainersReady"
        },
        {
          "last_transition_time": "2023-01-25 20:22:46",
          "status": "True",
          "type": "PodScheduled"
        }
      ],
      "container_statuses": [
        {
          "container_id": "cri-o://4c7d351aff70895c68e0ea5e55f80bafcd8c4a38a05bdd2622dcaffc5ac4430d",
          "image": "controller.philpot/jetstack/cert-manager-controller:v1.5.4",
          "image_id": "controller.philpot/jetstack/cert-manager-controller@sha256:c8612b135fbbe638befb65848504c5e7f3ca09790d0db2a2b3d79120c7ad9596",
          "last_state": {},
          "name": "cert-manager",
          "ready": true,
          "restart_count": 1,
          "started": true,
          "state": {
            "running": {
              "started_at": "2023-01-25 20:41:09"
            }
          }
        }
      ],
      "host_ip": "10.40.31.68",
      "phase": "Running",
      "pod_ip": "10.233.43.22",
      "pod_i_ps": [
        {
          "ip": "10.233.43.22"
        }
      ],
      "qos_class": "BestEffort",
      "start_time": "2023-01-25 20:22:46"
    }
  },
  {
    "namespace": "cert-manager",
    "name": "cert-manager-cainjector-6b7b946b67-lzsgq",
    "node_name": "philpot-server1.philpot",
    "status_brief": "Running",
    "restart_count": 1,
    "states": [
      "cert-manager: running"
    ],
    "resources": [
      {
        "name": "cert-manager",
        "resources": {
          "limits": null,
          "requests": null
        }
      }
    ],
    "status": {
      "conditions": [
        {
          "last_transition_time": "2023-01-25 20:22:46",
          "status": "True",
          "type": "Initialized"
        },
        {
          "last_transition_time": "2023-01-25 20:41:08",
          "status": "True",
          "type": "Ready"
        },
        {
          "last_transition_time": "2023-01-25 20:41:08",
          "status": "True",
          "type": "ContainersReady"
        },
        {
          "last_transition_time": "2023-01-25 20:22:46",
          "status": "True",
          "type": "PodScheduled"
        }
      ],
      "container_statuses": [
        {
          "container_id": "cri-o://fd4812c8b8c46764ed7d2b0512d8a7f02d6103f1bae696109b1158b8e782d143",
          "image": "controller.philpot/jetstack/cert-manager-cainjector:v1.5.4",
          "image_id": "controller.philpot/jetstack/cert-manager-cainjector@sha256:1ed234c0bab32860c004ac2e774244cafa22ef7c23e793f8484ee2a580187cd5",
          "last_state": {},
          "name": "cert-manager",
          "ready": true,
          "restart_count": 1,
          "started": true,
          "state": {
            "running": {
              "started_at": "2023-01-25 20:41:08"
            }
          }
        }
      ],
      "host_ip": "10.40.31.68",
      "phase": "Running",
      "pod_ip": "10.233.43.16",
      "pod_i_ps": [
        {
          "ip": "10.233.43.16"
        }
      ],
      "qos_class": "BestEffort",
      "start_time": "2023-01-25 20:22:46"
    }
  }
];
