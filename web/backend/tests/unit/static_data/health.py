from typing import List

from app.models.elasticsearch import ElasticSearchRejectModel
from app.models.kubernetes import AssociatedPodModel, KubernetesNodeMetricsModel, KubernetesPodMetricsModel, NodeOrPodStatusModel, PodLogsModel
from app.models.health import DatastoreModel, MetricsCPUPercentModel, MetricsDataUsageModel, MetricsMemoryModel, MetricsRootUsageModel, PacketsModel, ValueMemoryModel, ValueModel


token_id: str = "0123456789ab0123456789ab"
remote_agent_ip: str = "10.20.9.100"


nodes_and_pods = [
    {
        "node_name": "sensor1.deadshot", "pod_name": "sensor1-suricata-6468b98ddf-dw8bh"
    },
    {
        "node_name": "sensor2.deadshot", "pod_name": "sensor2-suricata-6977569987-hndcm"
    },
    {
        "node_name": "sensor3.deadshot", "pod_name": "sensor3-suricata-67b595dd89-4crtx"
    },
    {
        "node_name": "sensor4.deadshot", "pod_name": "sensor4-suricata-596dc484cf-t8d89"
    }
]


zeek_stats = {
    "hits": {
        "total": {
            "value": 5523,
        },
    },
    "aggregations": {
        "zeek_total_pkts_dropped": {
            "value": 0.0
        },
        "zeek_total_pkts_received": {
            "value": 0.0
        },
    }
}


node_or_pod: NodeOrPodStatusModel = {
    "stderr": "",
    "stdout": ""
}


pod_inform: AssociatedPodModel = {
    "podName": "test-sensor3-arkime-8659458d84-n6vzq",
    "namespace": "default"
}


pod_logs: PodLogsModel = {
    "PodLogs":
    {
            "logs": "All the log information the kubectl logs <podname> -c <container> can manage to pull back.",
            "name": "The container inside of the pod.  Kubernetes can have multiple containers inside of it."
    }
}


node_name = {
    "node_name" :"control-plane.lan"
}


node_status: List[KubernetesNodeMetricsModel] = [
  {
    "name": "control-plane.lan",
    "address": "10.40.20.65",
    "ready": True,
    "type": "control-plane",
    "storage": [
      {
        "name": "root",
        "free": 7697555456,
        "percent": 32.3
      },
      {
        "name": "data",
        "free": 106535510016,
        "percent": 0.7
      }
    ],
    "memory": {
      "available": 5681053696,
      "percent": 29.6
    },
    "cpu": 5.8,
    "capacity": {
      "cpu": "8000m",
      "ephermeral-storage": "18.564Gi",
      "memory": "7.515Gi",
      "pods": "110"
    },
    "allocatable": {
      "cpu": "8000m",
      "ephermeral-storage": "16.708Gi",
      "memory": "7.418Gi",
      "pods": "110"
    },
    "remaining": {
      "cpu": "7100m",
      "memory": "7.418Gi"
    },
    "node_info": {
      "architecture": "amd64",
      "boot_id": "89bada2e-0381-4306-90fd-4ec0af017b72",
      "container_runtime_version": "cri-o://1.24.1",
      "kernel_version": "4.18.0-477.27.1.el8_8.x86_64",
      "kube_proxy_version": "v1.24.2",
      "kubelet_version": "v1.24.2",
      "machine_id": "287144d48bf446eaa40e68712cb0f2d5",
      "operating_system": "linux",
      "os_image": "Red Hat Enterprise Linux 8.8 (Ootpa)",
      "system_uuid": "98671d42-445b-02c1-b4ae-8e3be94c5173"
    }
  },
  {
    "name": "dev10-devin-sensor3.lan",
    "address": "10.40.20.70",
    "ready": True,
    "type": "sensor",
    "storage": [
      {
        "name": "root",
        "free": 7771226112,
        "percent": 31.9
      },
      {
        "name": "data",
        "free": 52994334720,
        "percent": 1.2
      }
    ],
    "memory": {
      "available": 8546349056,
      "percent": 48.3
    },
    "cpu": 1.6,
    "capacity": {
      "cpu": "16000m",
      "ephermeral-storage": "18.639Gi",
      "memory": "15.389Gi",
      "pods": "110"
    },
    "allocatable": {
      "cpu": "16000m",
      "ephermeral-storage": "16.775Gi",
      "memory": "15.291Gi",
      "pods": "110"
    },
    "remaining": {
      "cpu": "8650m",
      "memory": "8.194Gi"
    },
    "node_info": {
      "architecture": "amd64",
      "boot_id": "b303bb3b-fbf7-4862-900d-b2b3b22c6aeb",
      "container_runtime_version": "cri-o://1.24.1",
      "kernel_version": "4.18.0-477.27.1.el8_8.x86_64",
      "kube_proxy_version": "v1.24.2",
      "kubelet_version": "v1.24.2",
      "machine_id": "d3a96a7353ef400089993f2c889ce41b",
      "operating_system": "linux",
      "os_image": "Red Hat Enterprise Linux 8.8 (Ootpa)",
      "system_uuid": "850f1d42-36c5-b00a-ebcb-e12bdb797dba"
    }
  }
]


pod_status: List[KubernetesPodMetricsModel] = [
  {
    "namespace": "cert-manager",
    "name": "cert-manager-579dbbc56-22df5",
    "node_name": "dev10-devin-server1.lan",
    "status_brief": "Running",
    "restart_count": 2,
    "states": [
      "cert-manager: running"
    ],
    "resources": [
      {
        "name": "cert-manager",
        "resources": {
          "limits": None,
          "requests": None
        }
      }
    ],
    "status": {
      "conditions": [
        {
          "last_transition_time": "2023-10-09 16:51:00",
          "status": "True",
          "type": "Initialized"
        },
        {
          "last_transition_time": "2023-10-09 18:48:15",
          "status": "True",
          "type": "Ready"
        },
        {
          "last_transition_time": "2023-10-09 18:48:15",
          "status": "True",
          "type": "ContainersReady"
        },
        {
          "last_transition_time": "2023-10-09 16:51:00",
          "status": "True",
          "type": "PodScheduled"
        }
      ],
      "container_statuses": [
        {
          "container_id": "cri-o://76778aea458403b977840d0e2ecd298328a52ae55d4cb0eff573da096bedc224",
          "image": "controller.lan/jetstack/cert-manager-controller:v1.5.4",
          "image_id": "controller.lan/jetstack/cert-manager-controller@sha256:c8612b135fbbe638befb65848504c5e7f3ca09790d0db2a2b3d79120c7ad9596",
          "last_state": {},
          "name": "cert-manager",
          "ready": True,
          "restart_count": 2,
          "started": True,
          "state": {
            "running": {
              "started_at": "2023-10-09 18:48:15"
            }
          }
        }
      ],
      "host_ip": "10.40.20.68",
      "phase": "Running",
      "pod_ip": "10.233.4.42",
      "pod_i_ps": [
        {
          "ip": "10.233.4.42"
        }
      ],
      "qos_class": "BestEffort",
      "start_time": "2023-10-09 16:51:00"
    }
  },
  {
    "namespace": "cert-manager",
    "name": "cert-manager-cainjector-6b7b946b67-clnlf",
    "node_name": "dev10-devin-server1.lan",
    "status_brief": "Running",
    "restart_count": 2,
    "states": [
      "cert-manager: running"
    ],
    "resources": [
      {
        "name": "cert-manager",
        "resources": {
          "limits": None,
          "requests": None
        }
      }
    ],
    "status": {
      "conditions": [
        {
          "last_transition_time": "2023-10-09 16:51:00",
          "status": "True",
          "type": "Initialized"
        },
        {
          "last_transition_time": "2023-10-09 18:48:16",
          "status": "True",
          "type": "Ready"
        },
        {
          "last_transition_time": "2023-10-09 18:48:16",
          "status": "True",
          "type": "ContainersReady"
        },
        {
          "last_transition_time": "2023-10-09 16:51:00",
          "status": "True",
          "type": "PodScheduled"
        }
      ],
      "container_statuses": [
        {
          "container_id": "cri-o://fbe28a5c49cbd007e47023f6aae2e1f710cae675d00feaec557bdbf9b26c5076",
          "image": "controller.lan/jetstack/cert-manager-cainjector:v1.5.4",
          "image_id": "controller.lan/jetstack/cert-manager-cainjector@sha256:1ed234c0bab32860c004ac2e774244cafa22ef7c23e793f8484ee2a580187cd5",
          "last_state": {},
          "name": "cert-manager",
          "ready": True,
          "restart_count": 2,
          "started": True,
          "state": {
            "running": {
              "started_at": "2023-10-09 18:48:16"
            }
          }
        }
      ],
      "host_ip": "10.40.20.68",
      "phase": "Running",
      "pod_ip": "10.233.4.48",
      "pod_i_ps": [
        {
          "ip": "10.233.4.48"
        }
      ],
      "qos_class": "BestEffort",
      "start_time": "2023-10-09 16:51:00"
    }
  }
]


datastores: List[DatastoreModel] = [
    {
        "capacity": 0,
        "datastore": "string",
        "free_space": 0,
        "name": "string",
        "type": "string"
    }
]


zeek_packets: List[PacketsModel] = [
    {
        "app": "zeek",
        "node_name": "dev10-test-sensor3.lan",
        "packets_received": 1994734,
        "packets_dropped": 0
    }
]


suricata_packets: List[PacketsModel] = [
    {
        "app": "suricata",
        "node_name": "dev10-test-sensor3.lan",
        "packets_received": 2000062,
        "packets_dropped": 0
    }
]


elastic_rejects: List[ElasticSearchRejectModel] = [
    {'node_name': 'tfplenum-es-master-0', 'name': 'analyze', 'active': '0', 'queue': '0', 'rejected': '0'},
    {'node_name': 'tfplenum-es-master-0', 'name': 'auto_complete', 'active': '0', 'queue': '0', 'rejected': '0'},
    {'node_name': 'tfplenum-es-master-0', 'name': 'ccr', 'active': '0', 'queue': '0', 'rejected': '0'},
]


value_memory_model: ValueMemoryModel = {
    "total": 33422110720,
    "available": 22150635520,
    "percent": 33.7,
    "used": 10768224256,
    "free": 18404401152,
    "active": 756977664,
    "inactive": 13281722368,
    "buffers": 3235840,
    "cached": 4246249472,
    "shared": 24104960,
    "slab": 655589376
}


value_model: ValueModel = {
    "total": 33422110720,
    "percent": 33.7,
    "used": 10768224256,
    "free": 18404401152
}


metrics_memory_model: MetricsMemoryModel = {
    "name": "memory",
    "value": value_memory_model,
    "type": "psutil",
    "hostname": "some-server2.lan"
}


metrics_root_usage_model: MetricsRootUsageModel = {
    "name": "root_usage",
    "value": value_model,
    "type": "psutil",
    "hostname": "some-server2.lan",
    "disk_pressure_warning": False,
    "disk_pressure_critical": False
}


metrics_data_usage_model: MetricsDataUsageModel = {
    "name": "data_usage",
    "value": value_model,
    "type": "psutil",
    "hostname": "some-server2.lan",
    "disk_pressure_warning": False,
    "disk_pressure_critical": False
}


metrics_cpu_percentage_model: MetricsCPUPercentModel = {
    "name": "cpu_percentage",
    "value": 3.9,
    "type": "psutil",
    "hostname": "some-server2.lan"
}
