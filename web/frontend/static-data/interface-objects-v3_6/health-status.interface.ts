import { HealthStatusInterface } from '../../src/app/system-health/interfaces';

export const MockHealthStatusInterface: HealthStatusInterface = {
  "totals": {
      "Unallocated": {
          "cpus_requested": 0,
          "mem_requested": 0,
          "cpus_requested_str": "0m",
          "mem_requested_str": "0.0Gi"
      },
      "jdms-server2.lan": {
          "cpus_requested": 5450,
          "mem_requested": 5550080,
          "cpus_requested_str": "5450m",
          "mem_requested_str": "5.293Gi",
          "name": "jdms-server2.lan",
          "node_type": "Server",
          "remaining_allocatable_cpu": "10550m",
          "remaining_allocatable_mem": "17.983Gi"
      },
      "jdms-server1.lan": {
          "cpus_requested": 6400,
          "mem_requested": 5898240,
          "cpus_requested_str": "6400m",
          "mem_requested_str": "5.625Gi",
          "name": "jdms-server1.lan",
          "node_type": "Server",
          "remaining_allocatable_cpu": "9600m",
          "remaining_allocatable_mem": "17.651Gi"
      },
      "jdms-sensor1.lan": {
          "cpus_requested": 1050,
          "mem_requested": 307200,
          "cpus_requested_str": "1050m",
          "mem_requested_str": "0.293Gi",
          "name": "jdms-sensor1.lan",
          "node_type": "Sensor",
          "remaining_allocatable_cpu": "14950m",
          "remaining_allocatable_mem": "15.108Gi"
      },
      "jdms-sensor2.lan": {
          "cpus_requested": 550,
          "mem_requested": 460800,
          "cpus_requested_str": "550m",
          "mem_requested_str": "0.439Gi",
          "name": "jdms-sensor2.lan",
          "node_type": "Sensor",
          "remaining_allocatable_cpu": "15450m",
          "remaining_allocatable_mem": "14.962Gi"
      }
  },
  "nodes": [
      {
          "metadata": {
              "annotations": {
                  "kubeadm.alpha.kubernetes.io/cri-socket": "/var/run/crio/crio.sock",
                  "node.alpha.kubernetes.io/ttl": "0",
                  "projectcalico.org/IPv4Address": "10.40.24.67/24",
                  "projectcalico.org/IPv4IPIPTunnelAddr": "10.233.61.0",
                  "volumes.kubernetes.io/controller-managed-attach-detach": "true"
              },
              "creation_timestamp": "2021-04-26 16:14:36",
              "labels": {
                  "beta.kubernetes.io/arch": "amd64",
                  "beta.kubernetes.io/os": "linux",
                  "kubernetes.io/arch": "amd64",
                  "kubernetes.io/hostname": "jdms-sensor1.lan",
                  "kubernetes.io/os": "linux",
                  "role": "sensor"
              },
              "name": "jdms-sensor1.lan",
              "resource_version": "2588755",
              "uid": "1d3ce06e-0282-47d5-b2c7-a83f9fa0fb1f"
          },
          "spec": {
              "pod_cidr": "10.233.2.0/24"
          },
          "status": {
              "addresses": [
                  {
                      "address": "10.40.24.67",
                      "type": "InternalIP"
                  },
                  {
                      "address": "jdms-sensor1.lan",
                      "type": "Hostname"
                  }
              ],
              "allocatable": {
                  "cpu": "16",
                  "ephemeral-storage": "18011809353",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "16149476Ki",
                  "pods": "110"
              },
              "capacity": {
                  "cpu": "16",
                  "ephemeral-storage": "19086Mi",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "16251876Ki",
                  "pods": "110"
              },
              "conditions": [
                  {
                      "last_heartbeat_time": "2021-04-26 16:15:07",
                      "last_transition_time": "2021-04-26 16:15:07",
                      "message": "Calico is running on this node",
                      "reason": "CalicoIsUp",
                      "status": "False",
                      "type": "NetworkUnavailable"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:44:10",
                      "last_transition_time": "2021-04-26 16:14:36",
                      "message": "kubelet has sufficient memory available",
                      "reason": "KubeletHasSufficientMemory",
                      "status": "False",
                      "type": "MemoryPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:44:10",
                      "last_transition_time": "2021-04-26 16:14:36",
                      "message": "kubelet has no disk pressure",
                      "reason": "KubeletHasNoDiskPressure",
                      "status": "False",
                      "type": "DiskPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:44:10",
                      "last_transition_time": "2021-04-26 16:14:36",
                      "message": "kubelet has sufficient PID available",
                      "reason": "KubeletHasSufficientPID",
                      "status": "False",
                      "type": "PIDPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:44:10",
                      "last_transition_time": "2021-04-26 16:15:00",
                      "message": "kubelet is posting ready status",
                      "reason": "KubeletReady",
                      "status": "True",
                      "type": "Ready"
                  }
              ],
              "daemon_endpoints": {
                  "kubelet_endpoint": {
                      "port": 10250
                  }
              },
              "images": [
                  {
                      "names": [
                          "dip-controller.lan/elastic-maps-service/elastic-maps-server-ubi8@sha256:b1c2ecbe84f5319b9e61ee1224200d537f20f35c6c8606185e2bb9dae5814b40",
                          "dip-controller.lan/elastic-maps-service/elastic-maps-server-ubi8:7.13.1"
                      ],
                      "size_bytes": 1243897115
                  },
                  {
                      "names": [
                          "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                          "dip-controller.lan/tfplenum/zeek:3.2.2"
                      ],
                      "size_bytes": 516158192
                  },
                  {
                      "names": [
                          "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                          "dip-controller.lan/beats/metricbeat:7.13.1"
                      ],
                      "size_bytes": 500704798
                  },
                  {
                      "names": [
                          "dip-controller.lan/beats/filebeat@sha256:808e0e57fd80f0bd60934aeeca04f18d7a92d6e7cba0b819e55f92458348fcb2",
                          "dip-controller.lan/beats/filebeat:7.13.1"
                      ],
                      "size_bytes": 477899843
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                          "dip-controller.lan/calico/node:v3.16.4"
                      ],
                      "size_bytes": 168350304
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/cni@sha256:61bb01c140c3a5fa00bb96469d77c0b8aedd63ea18a1c7935315561293843944",
                          "dip-controller.lan/calico/cni:v3.16.4"
                      ],
                      "size_bytes": 133237895
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-proxy@sha256:f0c3f51c1216bcab9bfd5146eb2810f604a1c4ff2718bc3a1028cc089f8aeac7",
                          "dip-controller.lan/kube-proxy:v1.20.0"
                      ],
                      "size_bytes": 120355337
                  },
                  {
                      "names": [
                          "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                          "dip-controller.lan/metallb/speaker:v0.10.2"
                      ],
                      "size_bytes": 44539176
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                          "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4"
                      ],
                      "size_bytes": 22965205
                  },
                  {
                      "names": [
                          "dip-controller.lan/pause@sha256:4a1c4b21597c1b4415bdbecb28a3296c6b5e23ca4f9feeb599860a1dac6a0108",
                          "dip-controller.lan/pause:3.2"
                      ],
                      "size_bytes": 686355
                  }
              ],
              "node_info": {
                  "architecture": "amd64",
                  "boot_id": "acec33e4-5763-4357-83d3-1e2ef7e324fa",
                  "container_runtime_version": "cri-o://1.20.0",
                  "kernel_version": "4.18.0-193.el8.x86_64",
                  "kube_proxy_version": "v1.20.0",
                  "kubelet_version": "v1.20.0",
                  "machine_id": "b15973f894704932bb8f1a5e8c6e7bf2",
                  "operating_system": "linux",
                  "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
                  "system_uuid": "e0601d42-c9a2-3970-901c-c960a6356862"
              }
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubeadm.alpha.kubernetes.io/cri-socket": "/var/run/crio/crio.sock",
                  "node.alpha.kubernetes.io/ttl": "0",
                  "projectcalico.org/IPv4Address": "10.40.24.68/24",
                  "projectcalico.org/IPv4IPIPTunnelAddr": "10.233.55.0",
                  "volumes.kubernetes.io/controller-managed-attach-detach": "true"
              },
              "creation_timestamp": "2021-04-26 16:15:52",
              "labels": {
                  "beta.kubernetes.io/arch": "amd64",
                  "beta.kubernetes.io/os": "linux",
                  "kubernetes.io/arch": "amd64",
                  "kubernetes.io/hostname": "jdms-sensor2.lan",
                  "kubernetes.io/os": "linux",
                  "role": "sensor"
              },
              "name": "jdms-sensor2.lan",
              "resource_version": "2588414",
              "uid": "6bad6a6a-582c-4d1e-b230-42348b5bb429"
          },
          "spec": {
              "pod_cidr": "10.233.3.0/24"
          },
          "status": {
              "addresses": [
                  {
                      "address": "10.40.24.68",
                      "type": "InternalIP"
                  },
                  {
                      "address": "jdms-sensor2.lan",
                      "type": "Hostname"
                  }
              ],
              "allocatable": {
                  "cpu": "16",
                  "ephemeral-storage": "18011809353",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "16149116Ki",
                  "pods": "110"
              },
              "capacity": {
                  "cpu": "16",
                  "ephemeral-storage": "19086Mi",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "16251516Ki",
                  "pods": "110"
              },
              "conditions": [
                  {
                      "last_heartbeat_time": "2021-04-26 16:16:39",
                      "last_transition_time": "2021-04-26 16:16:39",
                      "message": "Calico is running on this node",
                      "reason": "CalicoIsUp",
                      "status": "False",
                      "type": "NetworkUnavailable"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:20",
                      "last_transition_time": "2021-04-26 16:15:52",
                      "message": "kubelet has sufficient memory available",
                      "reason": "KubeletHasSufficientMemory",
                      "status": "False",
                      "type": "MemoryPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:20",
                      "last_transition_time": "2021-04-26 16:15:52",
                      "message": "kubelet has no disk pressure",
                      "reason": "KubeletHasNoDiskPressure",
                      "status": "False",
                      "type": "DiskPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:20",
                      "last_transition_time": "2021-04-26 16:15:52",
                      "message": "kubelet has sufficient PID available",
                      "reason": "KubeletHasSufficientPID",
                      "status": "False",
                      "type": "PIDPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:20",
                      "last_transition_time": "2021-04-26 16:16:34",
                      "message": "kubelet is posting ready status",
                      "reason": "KubeletReady",
                      "status": "True",
                      "type": "Ready"
                  }
              ],
              "daemon_endpoints": {
                  "kubelet_endpoint": {
                      "port": 10250
                  }
              },
              "images": [
                  {
                      "names": [
                          "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                          "dip-controller.lan/beats/metricbeat:7.13.1"
                      ],
                      "size_bytes": 500704798
                  },
                  {
                      "names": [
                          "dip-controller.lan/eck/eck-operator@sha256:4d2897e4b88403a7086f8b58788eae94960a68205ac95d6c0d68065299caf6ac",
                          "dip-controller.lan/eck/eck-operator:1.6.0"
                      ],
                      "size_bytes": 169976379
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                          "dip-controller.lan/calico/node:v3.16.4"
                      ],
                      "size_bytes": 168350304
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/cni@sha256:61bb01c140c3a5fa00bb96469d77c0b8aedd63ea18a1c7935315561293843944",
                          "dip-controller.lan/calico/cni:v3.16.4"
                      ],
                      "size_bytes": 133237895
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-proxy@sha256:f0c3f51c1216bcab9bfd5146eb2810f604a1c4ff2718bc3a1028cc089f8aeac7",
                          "dip-controller.lan/kube-proxy:v1.20.0"
                      ],
                      "size_bytes": 120355337
                  },
                  {
                      "names": [
                          "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                          "dip-controller.lan/metallb/speaker:v0.10.2"
                      ],
                      "size_bytes": 44539176
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                          "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4"
                      ],
                      "size_bytes": 22965205
                  },
                  {
                      "names": [
                          "dip-controller.lan/pause@sha256:4a1c4b21597c1b4415bdbecb28a3296c6b5e23ca4f9feeb599860a1dac6a0108",
                          "dip-controller.lan/pause:3.2"
                      ],
                      "size_bytes": 686355
                  }
              ],
              "node_info": {
                  "architecture": "amd64",
                  "boot_id": "1917fea9-0c72-4d36-9caa-c2a294cdbcc2",
                  "container_runtime_version": "cri-o://1.20.0",
                  "kernel_version": "4.18.0-193.el8.x86_64",
                  "kube_proxy_version": "v1.20.0",
                  "kubelet_version": "v1.20.0",
                  "machine_id": "0245581575db46118e6b7ca01cbe3eb9",
                  "operating_system": "linux",
                  "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
                  "system_uuid": "c0c91d42-03b8-0318-5582-9102bc8855b6"
              }
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubeadm.alpha.kubernetes.io/cri-socket": "unix:///var/run/crio/crio.sock",
                  "node.alpha.kubernetes.io/ttl": "0",
                  "projectcalico.org/IPv4Address": "10.40.24.65/24",
                  "projectcalico.org/IPv4IPIPTunnelAddr": "10.233.20.0",
                  "volumes.kubernetes.io/controller-managed-attach-detach": "true"
              },
              "creation_timestamp": "2021-04-26 16:11:14",
              "labels": {
                  "beta.kubernetes.io/arch": "amd64",
                  "beta.kubernetes.io/os": "linux",
                  "dedicated": "master",
                  "kubernetes.io/arch": "amd64",
                  "kubernetes.io/hostname": "jdms-server1.lan",
                  "kubernetes.io/os": "linux",
                  "node-role.kubernetes.io/control-plane": "",
                  "node-role.kubernetes.io/master": "",
                  "role": "server"
              },
              "name": "jdms-server1.lan",
              "resource_version": "2588507",
              "uid": "1b626b9c-d7c9-4016-bc1e-43add0fcedae"
          },
          "spec": {
              "pod_cidr": "10.233.0.0/24"
          },
          "status": {
              "addresses": [
                  {
                      "address": "10.40.24.65",
                      "type": "InternalIP"
                  },
                  {
                      "address": "jdms-server1.lan",
                      "type": "Hostname"
                  }
              ],
              "allocatable": {
                  "cpu": "16",
                  "ephemeral-storage": "18011809353",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "24406668Ki",
                  "pods": "110"
              },
              "capacity": {
                  "cpu": "16",
                  "ephemeral-storage": "19086Mi",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "24509068Ki",
                  "pods": "110"
              },
              "conditions": [
                  {
                      "last_heartbeat_time": "2021-04-26 16:12:16",
                      "last_transition_time": "2021-04-26 16:12:16",
                      "message": "Calico is running on this node",
                      "reason": "CalicoIsUp",
                      "status": "False",
                      "type": "NetworkUnavailable"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:50",
                      "last_transition_time": "2021-04-26 16:11:11",
                      "message": "kubelet has sufficient memory available",
                      "reason": "KubeletHasSufficientMemory",
                      "status": "False",
                      "type": "MemoryPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:50",
                      "last_transition_time": "2021-04-26 16:11:11",
                      "message": "kubelet has no disk pressure",
                      "reason": "KubeletHasNoDiskPressure",
                      "status": "False",
                      "type": "DiskPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:50",
                      "last_transition_time": "2021-04-26 16:11:11",
                      "message": "kubelet has sufficient PID available",
                      "reason": "KubeletHasSufficientPID",
                      "status": "False",
                      "type": "PIDPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:42:50",
                      "last_transition_time": "2021-04-26 16:12:11",
                      "message": "kubelet is posting ready status",
                      "reason": "KubeletReady",
                      "status": "True",
                      "type": "Ready"
                  }
              ],
              "daemon_endpoints": {
                  "kubelet_endpoint": {
                      "port": 10250
                  }
              },
              "images": [
                  {
                      "names": [
                          "dip-controller.lan/kibana/kibana@sha256:0570b27bb7c2947a50eeb1dd7cc09fa4bc51f1f234b1f113e01ac8e7443999a4",
                          "dip-controller.lan/kibana/kibana:7.13.1"
                      ],
                      "size_bytes": 1060333202
                  },
                  {
                      "names": [
                          "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                          "dip-controller.lan/elasticsearch/elasticsearch:7.13.1"
                      ],
                      "size_bytes": 830307717
                  },
                  {
                      "names": [
                          "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                          "dip-controller.lan/beats/metricbeat:7.13.1"
                      ],
                      "size_bytes": 500704798
                  },
                  {
                      "names": [
                          "dip-controller.lan/etcd@sha256:bd4d2c9a19be8a492bc79df53eee199fd04b415e9993eb69f7718052602a147a",
                          "dip-controller.lan/etcd:3.4.13-0"
                      ],
                      "size_bytes": 254660943
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                          "dip-controller.lan/calico/node:v3.16.4"
                      ],
                      "size_bytes": 168350304
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/cni@sha256:61bb01c140c3a5fa00bb96469d77c0b8aedd63ea18a1c7935315561293843944",
                          "dip-controller.lan/calico/cni:v3.16.4"
                      ],
                      "size_bytes": 133237895
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-apiserver@sha256:8033693d4421e41bd91380ce3c6b1a20fbaf762e3c4d64f79bbb3e30a2fb4310",
                          "dip-controller.lan/kube-apiserver:v1.20.0"
                      ],
                      "size_bytes": 122912176
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-proxy@sha256:f0c3f51c1216bcab9bfd5146eb2810f604a1c4ff2718bc3a1028cc089f8aeac7",
                          "dip-controller.lan/kube-proxy:v1.20.0"
                      ],
                      "size_bytes": 120355337
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-controller-manager@sha256:2611b23cb6a8df227278bf528d82bd68c38efefd282718f5ce83864f245e6da2",
                          "dip-controller.lan/kube-controller-manager:v1.20.0"
                      ],
                      "size_bytes": 117091778
                  },
                  {
                      "names": [
                          "dip-controller.lan/external_storage/local-volume-provisioner@sha256:8df9af089bf8c5990758fdd86005ecadb22fc53251989c38c81657ac1373688b",
                          "dip-controller.lan/external_storage/local-volume-provisioner:v2.3.4"
                      ],
                      "size_bytes": 100585324
                  },
                  {
                      "names": [
                          "dip-controller.lan/chartmuseum/chartmuseum@sha256:38c5ec3b30046d7a02a55b4c8bd8a0cd279538c2e36090973798a858e900b18e",
                          "dip-controller.lan/chartmuseum/chartmuseum:v0.12.0"
                      ],
                      "size_bytes": 64080339
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/kube-controllers@sha256:166d709e026516cb1c6f164d3e4379279caa192aaea0bcbd4e57206eac574b0c",
                          "dip-controller.lan/calico/kube-controllers:v3.16.4"
                      ],
                      "size_bytes": 52903622
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-scheduler@sha256:47fd311588de93073af653698a65a616c798acffe901707339ce4fdc3aca5570",
                          "dip-controller.lan/kube-scheduler:v1.20.0"
                      ],
                      "size_bytes": 47631792
                  },
                  {
                      "names": [
                          "dip-controller.lan/coredns@sha256:242d440e3192ffbcecd40e9536891f4d9be46a650363f3a004497c2070f96f5a",
                          "dip-controller.lan/coredns:1.7.0"
                      ],
                      "size_bytes": 45356383
                  },
                  {
                      "names": [
                          "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                          "dip-controller.lan/metallb/speaker:v0.10.2"
                      ],
                      "size_bytes": 44539176
                  },
                  {
                      "names": [
                          "dip-controller.lan/metallb/controller@sha256:c8b0da00dd83db99bf00fb7088c33e7aaf52fa679f962610f1fe5ed173f66b77",
                          "dip-controller.lan/metallb/controller:v0.10.2"
                      ],
                      "size_bytes": 40055095
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                          "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4"
                      ],
                      "size_bytes": 22965205
                  },
                  {
                      "names": [
                          "dip-controller.lan/pause@sha256:4a1c4b21597c1b4415bdbecb28a3296c6b5e23ca4f9feeb599860a1dac6a0108",
                          "dip-controller.lan/pause:3.2"
                      ],
                      "size_bytes": 686355
                  }
              ],
              "node_info": {
                  "architecture": "amd64",
                  "boot_id": "d847de81-c8a8-4bdc-97c5-21ce194edace",
                  "container_runtime_version": "cri-o://1.20.0",
                  "kernel_version": "4.18.0-193.el8.x86_64",
                  "kube_proxy_version": "v1.20.0",
                  "kubelet_version": "v1.20.0",
                  "machine_id": "78c3790d0c5b4538b1c3d82c6e787aa8",
                  "operating_system": "linux",
                  "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
                  "system_uuid": "4e4b1d42-b192-6e73-ec88-8ffa598fcf34"
              }
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubeadm.alpha.kubernetes.io/cri-socket": "/var/run/crio/crio.sock",
                  "node.alpha.kubernetes.io/ttl": "0",
                  "projectcalico.org/IPv4Address": "10.40.24.66/24",
                  "projectcalico.org/IPv4IPIPTunnelAddr": "10.233.38.0",
                  "volumes.kubernetes.io/controller-managed-attach-detach": "true"
              },
              "creation_timestamp": "2021-04-26 16:13:19",
              "labels": {
                  "beta.kubernetes.io/arch": "amd64",
                  "beta.kubernetes.io/os": "linux",
                  "kubernetes.io/arch": "amd64",
                  "kubernetes.io/hostname": "jdms-server2.lan",
                  "kubernetes.io/os": "linux",
                  "role": "server"
              },
              "name": "jdms-server2.lan",
              "resource_version": "2589187",
              "uid": "a1aa85fb-e70f-4c2f-80e7-d2e4c2cb4eb9"
          },
          "spec": {
              "pod_cidr": "10.233.1.0/24"
          },
          "status": {
              "addresses": [
                  {
                      "address": "10.40.24.66",
                      "type": "InternalIP"
                  },
                  {
                      "address": "jdms-server2.lan",
                      "type": "Hostname"
                  }
              ],
              "allocatable": {
                  "cpu": "16",
                  "ephemeral-storage": "18011809353",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "24406668Ki",
                  "pods": "110"
              },
              "capacity": {
                  "cpu": "16",
                  "ephemeral-storage": "19086Mi",
                  "hugepages-1Gi": "0",
                  "hugepages-2Mi": "0",
                  "memory": "24509068Ki",
                  "pods": "110"
              },
              "conditions": [
                  {
                      "last_heartbeat_time": "2021-04-26 16:13:51",
                      "last_transition_time": "2021-04-26 16:13:51",
                      "message": "Calico is running on this node",
                      "reason": "CalicoIsUp",
                      "status": "False",
                      "type": "NetworkUnavailable"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:46:30",
                      "last_transition_time": "2021-04-26 16:13:19",
                      "message": "kubelet has sufficient memory available",
                      "reason": "KubeletHasSufficientMemory",
                      "status": "False",
                      "type": "MemoryPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:46:30",
                      "last_transition_time": "2021-04-26 16:13:19",
                      "message": "kubelet has no disk pressure",
                      "reason": "KubeletHasNoDiskPressure",
                      "status": "False",
                      "type": "DiskPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:46:30",
                      "last_transition_time": "2021-04-26 16:13:19",
                      "message": "kubelet has sufficient PID available",
                      "reason": "KubeletHasSufficientPID",
                      "status": "False",
                      "type": "PIDPressure"
                  },
                  {
                      "last_heartbeat_time": "2021-05-06 09:46:30",
                      "last_transition_time": "2021-04-26 16:13:44",
                      "message": "kubelet is posting ready status",
                      "reason": "KubeletReady",
                      "status": "True",
                      "type": "Ready"
                  }
              ],
              "daemon_endpoints": {
                  "kubelet_endpoint": {
                      "port": 10250
                  }
              },
              "images": [
                  {
                      "names": [
                          "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                          "dip-controller.lan/elasticsearch/elasticsearch:7.13.1"
                      ],
                      "size_bytes": 830307717
                  },
                  {
                      "names": [
                          "dip-controller.lan/tfplenum/arkime@sha256:4ca08a74f874e14a232530d2a7266eb7f3f44dc2ad7d70e6c01c6e4489c4a54a",
                          "dip-controller.lan/tfplenum/arkime:2.7.1"
                      ],
                      "size_bytes": 650228800
                  },
                  {
                      "names": [
                          "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                          "dip-controller.lan/beats/metricbeat:7.13.1"
                      ],
                      "size_bytes": 500704798
                  },
                  {
                      "names": [
                          "dip-controller.lan/beats/filebeat@sha256:808e0e57fd80f0bd60934aeeca04f18d7a92d6e7cba0b819e55f92458348fcb2",
                          "dip-controller.lan/beats/filebeat:7.13.1"
                      ],
                      "size_bytes": 477899843
                  },
                  {
                      "names": [
                          "dip-controller.lan/tfplenum/winlogbeat-setup@sha256:dfbe5f26d438732856dc5afcff0c91e5d3e83ecb57334d993347943a7dc82c9c",
                          "dip-controller.lan/tfplenum/winlogbeat-setup:7.13.1"
                      ],
                      "size_bytes": 185577447
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                          "dip-controller.lan/calico/node:v3.16.4"
                      ],
                      "size_bytes": 168350304
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/cni@sha256:61bb01c140c3a5fa00bb96469d77c0b8aedd63ea18a1c7935315561293843944",
                          "dip-controller.lan/calico/cni:v3.16.4"
                      ],
                      "size_bytes": 133237895
                  },
                  {
                      "names": [
                          "dip-controller.lan/kube-proxy@sha256:f0c3f51c1216bcab9bfd5146eb2810f604a1c4ff2718bc3a1028cc089f8aeac7",
                          "dip-controller.lan/kube-proxy:v1.20.0"
                      ],
                      "size_bytes": 120355337
                  },
                  {
                      "names": [
                          "dip-controller.lan/external_storage/local-volume-provisioner@sha256:8df9af089bf8c5990758fdd86005ecadb22fc53251989c38c81657ac1373688b",
                          "dip-controller.lan/external_storage/local-volume-provisioner:v2.3.4"
                      ],
                      "size_bytes": 100585324
                  },
                  {
                      "names": [
                          "dip-controller.lan/jetstack/cert-manager-controller@sha256:b8a7cb5f9328443a423d2e912743809d2877f45989351b7b705d7346120b72ec",
                          "dip-controller.lan/jetstack/cert-manager-controller:v1.0.4"
                      ],
                      "size_bytes": 65477352
                  },
                  {
                      "names": [
                          "dip-controller.lan/jetstack/cert-manager-webhook@sha256:e5a2137e89c80a9420d2ac80f65c00dd348e854c0a56bbfffe8317a3a42ed6e8",
                          "dip-controller.lan/jetstack/cert-manager-webhook:v1.0.4"
                      ],
                      "size_bytes": 51858140
                  },
                  {
                      "names": [
                          "dip-controller.lan/jetstack/cert-manager-cainjector@sha256:77715627d2f90c1ec53982608dec2ab471f89bc0ba691b79945e2ed40d2d4ecb",
                          "dip-controller.lan/jetstack/cert-manager-cainjector:v1.0.4"
                      ],
                      "size_bytes": 49728232
                  },
                  {
                      "names": [
                          "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                          "dip-controller.lan/metallb/speaker:v0.10.2"
                      ],
                      "size_bytes": 44539176
                  },
                  {
                      "names": [
                          "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                          "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4"
                      ],
                      "size_bytes": 22965205
                  },
                  {
                      "names": [
                          "dip-controller.lan/pause@sha256:4a1c4b21597c1b4415bdbecb28a3296c6b5e23ca4f9feeb599860a1dac6a0108",
                          "dip-controller.lan/pause:3.2"
                      ],
                      "size_bytes": 686355
                  }
              ],
              "node_info": {
                  "architecture": "amd64",
                  "boot_id": "9f1595d8-7824-4f1e-a449-f918a7638d67",
                  "container_runtime_version": "cri-o://1.20.0",
                  "kernel_version": "4.18.0-193.el8.x86_64",
                  "kube_proxy_version": "v1.20.0",
                  "kubelet_version": "v1.20.0",
                  "machine_id": "49ec66debfa145ef8063d6d1ef387404",
                  "operating_system": "linux",
                  "os_image": "Red Hat Enterprise Linux 8.2 (Ootpa)",
                  "system_uuid": "11651d42-121d-496c-ec0f-f84d1e465a5d"
              }
          }
      }
  ],
  "pods": [
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.2/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.2/32",
                  "prometheus.io/path": "/metrics",
                  "prometheus.io/port": "9402",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:16:54",
              "generate_name": "cert-manager-8588c67cc9-",
              "labels": {
                  "app": "cert-manager",
                  "app.kubernetes.io/component": "controller",
                  "app.kubernetes.io/instance": "cert-manager",
                  "app.kubernetes.io/name": "cert-manager",
                  "pod-template-hash": "8588c67cc9"
              },
              "name": "cert-manager-8588c67cc9-mq4tq",
              "namespace": "cert-manager",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "cert-manager-8588c67cc9",
                      "uid": "66720c83-598c-4add-b567-7a40539d8fcc"
                  }
              ],
              "resource_version": "1679",
              "uid": "c925e800-3d3a-4142-af6e-3b30a8aa6f61"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "--v=2",
                          "--cluster-resource-namespace=$(POD_NAMESPACE)",
                          "--leader-election-namespace=kube-system"
                      ],
                      "env": [
                          {
                              "name": "POD_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          }
                      ],
                      "image": "jetstack/cert-manager-controller:v1.0.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "cert-manager",
                      "ports": [
                          {
                              "container_port": 9402,
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "cert-manager-token-bnkq6",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "cert-manager",
              "service_account_name": "cert-manager",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "cert-manager-token-bnkq6",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "cert-manager-token-bnkq6"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:17:01",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:17:01",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://cb8a4c8fdf7eec9cc845f1f2e236925d122db195ae074620c1188dc598dba523",
                      "image": "dip-controller.lan/jetstack/cert-manager-controller:v1.0.4",
                      "image_id": "dip-controller.lan/jetstack/cert-manager-controller@sha256:b8a7cb5f9328443a423d2e912743809d2877f45989351b7b705d7346120b72ec",
                      "last_state": {},
                      "name": "cert-manager",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:17:01"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.233.38.2",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:16:54"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.3/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.3/32"
              },
              "creation_timestamp": "2021-04-26 16:16:54",
              "generate_name": "cert-manager-cainjector-59688b6d6-",
              "labels": {
                  "app": "cainjector",
                  "app.kubernetes.io/component": "cainjector",
                  "app.kubernetes.io/instance": "cert-manager",
                  "app.kubernetes.io/name": "cainjector",
                  "pod-template-hash": "59688b6d6"
              },
              "name": "cert-manager-cainjector-59688b6d6-2lk9c",
              "namespace": "cert-manager",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "cert-manager-cainjector-59688b6d6",
                      "uid": "b2d84e3c-ec37-4b45-a4c6-9fa6ee9fbc63"
                  }
              ],
              "resource_version": "1656",
              "uid": "92f89cfd-6756-4166-b43d-7f0f05c2f9b3"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "--v=2",
                          "--leader-election-namespace=kube-system"
                      ],
                      "env": [
                          {
                              "name": "POD_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          }
                      ],
                      "image": "jetstack/cert-manager-cainjector:v1.0.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "cert-manager",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "cert-manager-cainjector-token-dw44z",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "cert-manager-cainjector",
              "service_account_name": "cert-manager-cainjector",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "cert-manager-cainjector-token-dw44z",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "cert-manager-cainjector-token-dw44z"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:59",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:59",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://042399d2127e68fd1e7bd4da5d1006e00c9e7d3a66f51b2f4b25f6ca252e8bb9",
                      "image": "dip-controller.lan/jetstack/cert-manager-cainjector:v1.0.4",
                      "image_id": "dip-controller.lan/jetstack/cert-manager-cainjector@sha256:77715627d2f90c1ec53982608dec2ab471f89bc0ba691b79945e2ed40d2d4ecb",
                      "last_state": {},
                      "name": "cert-manager",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:16:59"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.233.38.3",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:16:54"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.1/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.1/32"
              },
              "creation_timestamp": "2021-04-26 16:16:54",
              "generate_name": "cert-manager-webhook-7549d4dfcb-",
              "labels": {
                  "app": "webhook",
                  "app.kubernetes.io/component": "webhook",
                  "app.kubernetes.io/instance": "cert-manager",
                  "app.kubernetes.io/name": "webhook",
                  "pod-template-hash": "7549d4dfcb"
              },
              "name": "cert-manager-webhook-7549d4dfcb-vzbjb",
              "namespace": "cert-manager",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "cert-manager-webhook-7549d4dfcb",
                      "uid": "97ae6c2c-09ab-4862-9277-1ed54c49a50c"
                  }
              ],
              "resource_version": "1687",
              "uid": "19f5da58-e326-49b5-8c92-e44a7ab72403"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "--v=2",
                          "--secure-port=10250",
                          "--dynamic-serving-ca-secret-namespace=$(POD_NAMESPACE)",
                          "--dynamic-serving-ca-secret-name=cert-manager-webhook-ca",
                          "--dynamic-serving-dns-names=cert-manager-webhook.cert-manager.svc.cluster.local,cert-manager-webhook,cert-manager-webhook.cert-manager,cert-manager-webhook.cert-manager.svc"
                      ],
                      "env": [
                          {
                              "name": "POD_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          }
                      ],
                      "image": "jetstack/cert-manager-webhook:v1.0.4",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/livez",
                              "port": 6080,
                              "scheme": "HTTP"
                          },
                          "initial_delay_seconds": 60,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "cert-manager",
                      "ports": [
                          {
                              "container_port": 10250,
                              "name": "https",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/healthz",
                              "port": 6080,
                              "scheme": "HTTP"
                          },
                          "initial_delay_seconds": 5,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "cert-manager-webhook-token-jh8lm",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "cert-manager-webhook",
              "service_account_name": "cert-manager-webhook",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "cert-manager-webhook-token-jh8lm",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "cert-manager-webhook-token-jh8lm"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:17:02",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:17:02",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:54",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://e9bca9fa63b0b5cfda0e08b39ebed976dc8b69dbf8d7f32d62b7d0c6a747cc71",
                      "image": "dip-controller.lan/jetstack/cert-manager-webhook:v1.0.4",
                      "image_id": "dip-controller.lan/jetstack/cert-manager-webhook@sha256:e5a2137e89c80a9420d2ac80f65c00dd348e854c0a56bbfffe8317a3a42ed6e8",
                      "last_state": {},
                      "name": "cert-manager",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:16:57"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.233.38.1",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:16:54"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.8/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.8/32"
              },
              "creation_timestamp": "2021-04-26 16:18:07",
              "generate_name": "chartmuseum-67c8895787-",
              "labels": {
                  "app": "chartmuseum",
                  "pod-template-hash": "67c8895787",
                  "release": "chartmuseum"
              },
              "name": "chartmuseum-67c8895787-2b6dt",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "chartmuseum-67c8895787",
                      "uid": "98f73f3b-3521-43b0-9876-5497594b1da2"
                  }
              ],
              "resource_version": "2064",
              "uid": "59937670-feaf-455a-b675-1ad4bb24df97"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  },
                  "pod_anti_affinity": {
                      "required_during_scheduling_ignored_during_execution": [
                          {
                              "label_selector": {
                                  "match_expressions": [
                                      {
                                          "key": "app",
                                          "operator": "In",
                                          "values": [
                                              "chartmuseum"
                                          ]
                                      }
                                  ]
                              },
                              "topology_key": "kubernetes.io/hostname"
                          }
                      ]
                  }
              },
              "containers": [
                  {
                      "args": [
                          "--port=8080",
                          "--storage-local-rootdir=/charts"
                      ],
                      "env": [
                          {
                              "name": "ALLOW_OVERWRITE",
                              "value": "true"
                          },
                          {
                              "name": "CHART_POST_FORM_FIELD_NAME",
                              "value": "chart"
                          },
                          {
                              "name": "DISABLE_METRICS",
                              "value": "true"
                          },
                          {
                              "name": "LOG_JSON",
                              "value": "true"
                          },
                          {
                              "name": "PROV_POST_FORM_FIELD_NAME",
                              "value": "prov"
                          },
                          {
                              "name": "STORAGE",
                              "value": "local"
                          },
                          {
                              "name": "TLS_CERT",
                              "value": "/etc/ssl/certs/container/tls.crt"
                          },
                          {
                              "name": "TLS_KEY",
                              "value": "/etc/ssl/certs/container/tls.key"
                          }
                      ],
                      "image": "chartmuseum/chartmuseum:v0.12.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/health",
                              "port": "http",
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 5,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "chartmuseum",
                      "ports": [
                          {
                              "container_port": 8080,
                              "name": "http",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/health",
                              "port": "http",
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 5,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/charts",
                              "name": "storage-volume"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "fs_group": 1000
              },
              "service_account": "default",
              "service_account_name": "default",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "storage-volume",
                      "persistent_volume_claim": {
                          "claim_name": "chartmuseum"
                      }
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "chartmuseum-certificate"
                      }
                  },
                  {
                      "name": "default-token-skh45",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "default-token-skh45"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:18:10",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:24",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:24",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:10",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://b405a76985d3d42bad15e8428cc2a492564c3464f89f13ff2d6ba85042a0584f",
                      "image": "dip-controller.lan/chartmuseum/chartmuseum:v0.12.0",
                      "image_id": "dip-controller.lan/chartmuseum/chartmuseum@sha256:38c5ec3b30046d7a02a55b4c8bd8a0cd279538c2e36090973798a858e900b18e",
                      "last_state": {},
                      "name": "chartmuseum",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:18:12"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.8",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:18:10"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.61.1/32",
                  "cni.projectcalico.org/podIPs": "10.233.61.1/32"
              },
              "creation_timestamp": "2021-04-26 16:22:27",
              "generate_name": "elastic-maps-server-7b94945755-",
              "labels": {
                  "app": "elastic-maps-server",
                  "component": "elastic-maps-server",
                  "pod-template-hash": "7b94945755"
              },
              "name": "elastic-maps-server-7b94945755-gjcm8",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "elastic-maps-server-7b94945755",
                      "uid": "95e240a7-323d-49b8-9637-1174fe3114ae"
                  }
              ],
              "resource_version": "3808",
              "uid": "d69b1ccd-b6c0-455a-9fe2-88f656ed7980"
          },
          "spec": {
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ELASTICSEARCH_PASSWORD",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "elastic",
                                      "name": "tfplenum-es-elastic-user"
                                  }
                              }
                          }
                      ],
                      "image": "elastic-maps-service/elastic-maps-server-ubi8:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "maps-server",
                      "ports": [
                          {
                              "container_port": 4343,
                              "name": "https",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/usr/src/app/server/config/elastic-maps-server.yml",
                              "name": "configs",
                              "read_only": true,
                              "sub_path": "elastic-maps-server.yml"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "emscerts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/etc/ssl/certs/elasticsearch",
                              "name": "escerts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-sensor1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "emscerts",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "ems-certificate"
                      }
                  },
                  {
                      "name": "escerts",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "elasticsearch-certificate"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "elastic-maps-service-configs"
                      },
                      "name": "configs"
                  },
                  {
                      "name": "default-token-skh45",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "default-token-skh45"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:22:27",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:23:00",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:23:00",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:22:27",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://f46eaab9665c49e630b2b7d832ce20e750143c83912b43f932833b94f5325bf6",
                      "image": "dip-controller.lan/elastic-maps-service/elastic-maps-server-ubi8:7.13.1",
                      "image_id": "dip-controller.lan/elastic-maps-service/elastic-maps-server-ubi8@sha256:b1c2ecbe84f5319b9e61ee1224200d537f20f35c6c8606185e2bb9dae5814b40",
                      "last_state": {},
                      "name": "maps-server",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:23:00"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "phase": "Running",
              "pod_ip": "10.233.61.1",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:22:27"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-05-06 03:02:20",
              "generate_name": "jdms-sensor1-zeek-5cfdbd9d88-",
              "labels": {
                  "component": "zeek",
                  "deployment": "jdms-sensor1-zeek",
                  "pod-template-hash": "5cfdbd9d88"
              },
              "name": "jdms-sensor1-zeek-5cfdbd9d88-6bhdv",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "jdms-sensor1-zeek-5cfdbd9d88",
                      "uid": "ba385982-f9fc-4c60-b193-975cfb4f93b9"
                  }
              ],
              "resource_version": "2550833",
              "uid": "59f00c76-7283-4c0d-9821-8f405ea939e0"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "kubernetes.io/hostname",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  },
                  "pod_anti_affinity": {
                      "required_during_scheduling_ignored_during_execution": [
                          {
                              "label_selector": {
                                  "match_expressions": [
                                      {
                                          "key": "component",
                                          "operator": "In",
                                          "values": [
                                              "zeek"
                                          ]
                                      }
                                  ]
                              },
                              "topology_key": "kubernetes.io/hostname"
                          }
                      ]
                  }
              },
              "containers": [
                  {
                      "args": [
                          "-i",
                          "af_packet::ens224",
                          "-U",
                          ".status",
                          "frameworks/control/controllee",
                          "local.zeek",
                          "base/frameworks/cluster"
                      ],
                      "env": [
                          {
                              "name": "CLUSTER_NODE",
                              "value": "ens224-0"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 6,
                          "initial_delay_seconds": 30,
                          "period_seconds": 15,
                          "success_threshold": 1,
                          "tcp_socket": {
                              "port": 47764
                          },
                          "timeout_seconds": 1
                      },
                      "name": "ens224-0",
                      "resources": {},
                      "security_context": {
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_NICE"
                              ]
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/cluster-layout.zeek",
                              "name": "default-scripts",
                              "read_only": true,
                              "sub_path": "cluster-layout.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/local.zeek",
                              "name": "default-scripts",
                              "sub_path": "local.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/tfplenum",
                              "name": "scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/tfplenum/zeek/intel.dat",
                              "name": "intel-dat",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "args": [
                          "-i",
                          "af_packet::ens224",
                          "-U",
                          ".status",
                          "frameworks/control/controllee",
                          "local.zeek",
                          "base/frameworks/cluster"
                      ],
                      "env": [
                          {
                              "name": "CLUSTER_NODE",
                              "value": "ens224-1"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 6,
                          "initial_delay_seconds": 30,
                          "period_seconds": 15,
                          "success_threshold": 1,
                          "tcp_socket": {
                              "port": 47765
                          },
                          "timeout_seconds": 1
                      },
                      "name": "ens224-1",
                      "resources": {},
                      "security_context": {
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_NICE"
                              ]
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/cluster-layout.zeek",
                              "name": "default-scripts",
                              "read_only": true,
                              "sub_path": "cluster-layout.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/local.zeek",
                              "name": "default-scripts",
                              "sub_path": "local.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/tfplenum",
                              "name": "scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/tfplenum/zeek/intel.dat",
                              "name": "intel-dat",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "args": [
                          "-U",
                          ".status",
                          "frameworks/control/controllee",
                          "local.zeek",
                          "base/frameworks/cluster"
                      ],
                      "env": [
                          {
                              "name": "CLUSTER_NODE",
                              "value": "logger-0"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 6,
                          "initial_delay_seconds": 30,
                          "period_seconds": 15,
                          "success_threshold": 1,
                          "tcp_socket": {
                              "port": 47761
                          },
                          "timeout_seconds": 1
                      },
                      "name": "logger-0",
                      "resources": {
                          "requests": {
                              "cpu": "200m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/cluster-layout.zeek",
                              "name": "default-scripts",
                              "read_only": true,
                              "sub_path": "cluster-layout.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/local.zeek",
                              "name": "default-scripts",
                              "sub_path": "local.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/tfplenum",
                              "name": "scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/tfplenum/zeek/intel.dat",
                              "name": "intel-dat",
                              "read_only": true
                          },
                          {
                              "mount_path": "/data/zeek",
                              "name": "logs"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ],
                      "working_dir": "/data/zeek"
                  },
                  {
                      "args": [
                          "-U",
                          ".status",
                          "frameworks/control/controllee",
                          "local.zeek",
                          "base/frameworks/cluster"
                      ],
                      "env": [
                          {
                              "name": "CLUSTER_NODE",
                              "value": "manager"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "name": "manager",
                      "resources": {
                          "requests": {
                              "cpu": "200m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/cluster-layout.zeek",
                              "name": "default-scripts",
                              "read_only": true,
                              "sub_path": "cluster-layout.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/local.zeek",
                              "name": "default-scripts",
                              "sub_path": "local.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/tfplenum",
                              "name": "scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/tfplenum/zeek/intel.dat",
                              "name": "intel-dat",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "args": [
                          "-U",
                          ".status",
                          "frameworks/control/controllee",
                          "local.zeek",
                          "base/frameworks/cluster"
                      ],
                      "env": [
                          {
                              "name": "CLUSTER_NODE",
                              "value": "proxy"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "name": "proxy",
                      "resources": {
                          "requests": {
                              "cpu": "200m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/cluster-layout.zeek",
                              "name": "default-scripts",
                              "read_only": true,
                              "sub_path": "cluster-layout.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/local.zeek",
                              "name": "default-scripts",
                              "sub_path": "local.zeek"
                          },
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/tfplenum",
                              "name": "scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/opt/tfplenum/zeek/intel.dat",
                              "name": "intel-dat",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "init_containers": [
                  {
                      "command": [
                          "/bin/sh",
                          "-c",
                          "/bin/touch -a /opt/zeek/share/zeek/site/custom/__load__.zeek"
                      ],
                      "image": "tfplenum/zeek:3.2.2",
                      "image_pull_policy": "IfNotPresent",
                      "name": "init-zeek",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/opt/zeek/share/zeek/site/custom",
                              "name": "custom-scripts"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-sensor1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "share_process_namespace": true,
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/data/zeek",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "logs"
                  },
                  {
                      "host_path": {
                          "path": "/opt/tfplenum/zeek/scripts",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "custom-scripts"
                  },
                  {
                      "host_path": {
                          "path": "/opt/tfplenum/zeek/intel.dat",
                          "type": "FileOrCreate"
                      },
                      "name": "intel-dat"
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "jdms-sensor1-zeek"
                      },
                      "name": "default-scripts"
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "jdms-sensor1-zeek-scripts"
                      },
                      "name": "scripts"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "default-token-skh45",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "default-token-skh45"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-05-06 05:51:05",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-05-06 06:18:47",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-05-06 06:18:47",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-05-06 03:02:20",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://8c99f692a286841db113480dd97a6ed6b2c8c7113140041cd2a6738152609027",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://f250cc9ab657307379575df7b6743d36680d5b5488ad1dc1b71403372063e111",
                              "exit_code": 137,
                              "finished_at": "2021-05-06 06:13:40",
                              "reason": "Error",
                              "started_at": "2021-05-06 06:12:02"
                          }
                      },
                      "name": "ens224-0",
                      "ready": true,
                      "restart_count": 11,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 06:18:46"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://b76af05ae30d652a3aa842cf065cac4d56442f12fdc96a3ba149c79f33f0fe61",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://3c8fca1bc9b199735a52e74414c531ccc7b3bfb13dcf896937e8beff8a0668ae",
                              "exit_code": 137,
                              "finished_at": "2021-05-06 06:13:40",
                              "reason": "Error",
                              "started_at": "2021-05-06 06:12:02"
                          }
                      },
                      "name": "ens224-1",
                      "ready": true,
                      "restart_count": 11,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 06:18:46"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://dac237b7d81945db2f99c42f10f658303085eba9c69430f83813026a6e94f577",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://eebdaa361eaad92f8058d00f75c8479d02f040338545235feb206d053869b841",
                              "exit_code": 137,
                              "finished_at": "2021-05-06 06:13:40",
                              "reason": "Error",
                              "started_at": "2021-05-06 06:12:02"
                          }
                      },
                      "name": "logger-0",
                      "ready": true,
                      "restart_count": 11,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 06:18:46"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d6f62cfb438de60483aaade0aa0509c633fcf4b90ab532c329e985e604ae17aa",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://cffd170d6f96dab7d870f7e3bbadcdb8b3e176c049a039aac0cfbca80818cb13",
                              "exit_code": 137,
                              "finished_at": "2021-05-06 06:13:40",
                              "reason": "Error",
                              "started_at": "2021-05-06 06:12:02"
                          }
                      },
                      "name": "manager",
                      "ready": true,
                      "restart_count": 11,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 06:18:46"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://b4471a57593be35a4b740410b5e683455b0b83bb45464633049fdfd39c428402",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://43da91b8db0869fcf1f7396671d5f9735485f91fc2fb146c2e7b5b64d6fd6b52",
                              "exit_code": 137,
                              "finished_at": "2021-05-06 06:13:40",
                              "reason": "Error",
                              "started_at": "2021-05-06 06:12:03"
                          }
                      },
                      "name": "proxy",
                      "ready": true,
                      "restart_count": 11,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 06:18:47"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://f1c4848e0baa049560c6cc3f3b67dee19888dfc93adebe2d864404193fb7c621",
                      "image": "dip-controller.lan/tfplenum/zeek:3.2.2",
                      "image_id": "dip-controller.lan/tfplenum/zeek@sha256:ac3206ad3301031fd1c4e1863e303dc74b6c42d57d54a1a4826f9510b11cffc3",
                      "last_state": {},
                      "name": "init-zeek",
                      "ready": true,
                      "restart_count": 4,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://f1c4848e0baa049560c6cc3f3b67dee19888dfc93adebe2d864404193fb7c621",
                              "exit_code": 0,
                              "finished_at": "2021-05-06 06:13:41",
                              "reason": "Completed",
                              "started_at": "2021-05-06 06:13:41"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.40.24.67",
              "qos_class": "Burstable",
              "start_time": "2021-05-06 03:02:20"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.61.2/32",
                  "cni.projectcalico.org/podIPs": "10.233.61.2/32"
              },
              "creation_timestamp": "2021-05-06 03:02:20",
              "generate_name": "jdms-sensor1-zeek-filebeat-58947485-",
              "labels": {
                  "component": "zeek-logshipper",
                  "pod-template-hash": "58947485"
              },
              "name": "jdms-sensor1-zeek-filebeat-58947485-mwc6w",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "jdms-sensor1-zeek-filebeat-58947485",
                      "uid": "0b06bf5c-8ae5-402b-a592-c5a9601e9cee"
                  }
              ],
              "resource_version": "2514432",
              "uid": "a59bae85-cbab-4568-a1d5-de16b6f48b04"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "kubernetes.io/hostname",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  },
                  "pod_anti_affinity": {
                      "required_during_scheduling_ignored_during_execution": [
                          {
                              "label_selector": {
                                  "match_expressions": [
                                      {
                                          "key": "component",
                                          "operator": "In",
                                          "values": [
                                              "zeek-logshipper"
                                          ]
                                      }
                                  ]
                              },
                              "topology_key": "kubernetes.io/hostname"
                          }
                      ]
                  }
              },
              "containers": [
                  {
                      "args": [
                          "-e",
                          "-E",
                          "name=\"jdms-sensor1-zeek\""
                      ],
                      "env": [
                          {
                              "name": "ELASTICSEARCH_USERNAME",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "username",
                                      "name": "tfplenum-logstash-user"
                                  }
                              }
                          },
                          {
                              "name": "ELASTICSEARCH_PASSWORD",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "password",
                                      "name": "tfplenum-logstash-user"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "beats/filebeat:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "filebeat",
                      "resources": {},
                      "security_context": {
                          "run_as_group": 0,
                          "run_as_user": 0
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/log/bro/current",
                              "name": "data",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/filebeat/filebeat.yml",
                              "name": "configs",
                              "read_only": true,
                              "sub_path": "filebeat.yml"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "default-token-skh45",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-sensor1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/data/zeek",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "data"
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "jdms-sensor1-zeek-filebeat"
                      },
                      "name": "configs"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "default-token-skh45",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "default-token-skh45"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-05-06 03:02:20",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-05-06 03:02:24",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-05-06 03:02:24",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-05-06 03:02:20",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://5b7fc68562156bc4409e83d99fc7757cabbbdd0f1dd77f9818b2aad7d1f29c6d",
                      "image": "dip-controller.lan/beats/filebeat:7.13.1",
                      "image_id": "dip-controller.lan/beats/filebeat@sha256:808e0e57fd80f0bd60934aeeca04f18d7a92d6e7cba0b819e55f92458348fcb2",
                      "last_state": {},
                      "name": "filebeat",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-05-06 03:02:23"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "phase": "Running",
              "pod_ip": "10.233.61.2",
              "qos_class": "BestEffort",
              "start_time": "2021-05-06 03:02:20"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.4/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.4/32"
              },
              "creation_timestamp": "2021-04-26 16:18:05",
              "generate_name": "local-volume-provisioner-",
              "labels": {
                  "app": "local-volume-provisioner",
                  "controller-revision-hash": "5b558db4fc",
                  "pod-template-generation": "1"
              },
              "name": "local-volume-provisioner-b72hk",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "local-volume-provisioner",
                      "uid": "7dd811f1-75af-42e3-8ff6-f5446e5f8410"
                  }
              ],
              "resource_version": "2009",
              "uid": "995f2b7c-1968-4bd7-8b4a-2d047addfb25"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "MY_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "MY_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "JOB_CONTAINER_IMAGE",
                              "value": "external_storage/local-volume-provisioner:v2.3.4"
                          }
                      ],
                      "image": "external_storage/local-volume-provisioner:v2.3.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "provisioner",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/provisioner/config",
                              "name": "provisioner-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/dev",
                              "name": "provisioner-dev"
                          },
                          {
                              "mount_path": "/mnt/disks/apps",
                              "mount_propagation": "HostToContainer",
                              "name": "fast-disks"
                          },
                          {
                              "mount_path": "/mnt/disks/elastic",
                              "mount_propagation": "HostToContainer",
                              "name": "elastic-disks"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "local-storage-admin-token-bnbzc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "local-storage-admin",
              "service_account_name": "local-storage-admin",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "local-provisioner-config"
                      },
                      "name": "provisioner-config"
                  },
                  {
                      "host_path": {
                          "path": "/dev",
                          "type": ""
                      },
                      "name": "provisioner-dev"
                  },
                  {
                      "host_path": {
                          "path": "/mnt/disks/apps",
                          "type": ""
                      },
                      "name": "fast-disks"
                  },
                  {
                      "host_path": {
                          "path": "/mnt/disks/elastic",
                          "type": ""
                      },
                      "name": "elastic-disks"
                  },
                  {
                      "name": "local-storage-admin-token-bnbzc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "local-storage-admin-token-bnbzc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:18:05",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:10",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:10",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:05",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://45d14fefe9ba3b0b390c364d066150a2a0a057060ef87cf6dcc2e4172fc72971",
                      "image": "dip-controller.lan/external_storage/local-volume-provisioner:v2.3.4",
                      "image_id": "dip-controller.lan/external_storage/local-volume-provisioner@sha256:8df9af089bf8c5990758fdd86005ecadb22fc53251989c38c81657ac1373688b",
                      "last_state": {},
                      "name": "provisioner",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:18:09"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.233.38.4",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:18:05"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.7/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.7/32"
              },
              "creation_timestamp": "2021-04-26 16:18:05",
              "generate_name": "local-volume-provisioner-",
              "labels": {
                  "app": "local-volume-provisioner",
                  "controller-revision-hash": "5b558db4fc",
                  "pod-template-generation": "1"
              },
              "name": "local-volume-provisioner-k7mbf",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "local-volume-provisioner",
                      "uid": "7dd811f1-75af-42e3-8ff6-f5446e5f8410"
                  }
              ],
              "resource_version": "1983",
              "uid": "c62e5940-0992-4c99-ac68-bc738c1a25de"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "MY_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "MY_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "JOB_CONTAINER_IMAGE",
                              "value": "external_storage/local-volume-provisioner:v2.3.4"
                          }
                      ],
                      "image": "external_storage/local-volume-provisioner:v2.3.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "provisioner",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/provisioner/config",
                              "name": "provisioner-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/dev",
                              "name": "provisioner-dev"
                          },
                          {
                              "mount_path": "/mnt/disks/apps",
                              "mount_propagation": "HostToContainer",
                              "name": "fast-disks"
                          },
                          {
                              "mount_path": "/mnt/disks/elastic",
                              "mount_propagation": "HostToContainer",
                              "name": "elastic-disks"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "local-storage-admin-token-bnbzc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "local-storage-admin",
              "service_account_name": "local-storage-admin",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "local-provisioner-config"
                      },
                      "name": "provisioner-config"
                  },
                  {
                      "host_path": {
                          "path": "/dev",
                          "type": ""
                      },
                      "name": "provisioner-dev"
                  },
                  {
                      "host_path": {
                          "path": "/mnt/disks/apps",
                          "type": ""
                      },
                      "name": "fast-disks"
                  },
                  {
                      "host_path": {
                          "path": "/mnt/disks/elastic",
                          "type": ""
                      },
                      "name": "elastic-disks"
                  },
                  {
                      "name": "local-storage-admin-token-bnbzc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "local-storage-admin-token-bnbzc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:18:05",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:09",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:09",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:18:05",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://cdd383c43873013006c6479576931f4125b459a44acc9f9291e3e3f7fc004711",
                      "image": "dip-controller.lan/external_storage/local-volume-provisioner:v2.3.4",
                      "image_id": "dip-controller.lan/external_storage/local-volume-provisioner@sha256:8df9af089bf8c5990758fdd86005ecadb22fc53251989c38c81657ac1373688b",
                      "last_state": {},
                      "name": "provisioner",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:18:08"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.7",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:18:05"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:25:41",
              "generate_name": "metricbeat-beat-metricbeat-",
              "labels": {
                  "beat.k8s.elastic.co/config-checksum": "728553c998051a2339638256bd4368ad912e11580d53bc9259250fd2",
                  "beat.k8s.elastic.co/name": "metricbeat",
                  "beat.k8s.elastic.co/version": "7.13.1",
                  "common.k8s.elastic.co/type": "beat",
                  "controller-revision-hash": "5b9bf4bb56",
                  "pod-template-generation": "1"
              },
              "name": "metricbeat-beat-metricbeat-kk96p",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "metricbeat-beat-metricbeat",
                      "uid": "33ca6613-27ef-4085-9b49-fdf70cda08dc"
                  }
              ],
              "resource_version": "4694",
              "uid": "b7b9c2ac-3be3-46b1-8095-4eece43cd364"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": true,
              "containers": [
                  {
                      "args": [
                          "-e",
                          "-c",
                          "/etc/beat.yml",
                          "-system.hostfs=/hostfs"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "beats/metricbeat:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "metricbeat",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/usr/share/metricbeat/data",
                              "name": "beat-data"
                          },
                          {
                              "mount_path": "/hostfs/sys/fs/cgroup",
                              "name": "cgroup"
                          },
                          {
                              "mount_path": "/etc/beat.yml",
                              "name": "config",
                              "read_only": true,
                              "sub_path": "beat.yml"
                          },
                          {
                              "mount_path": "/var/run/crio.sock",
                              "name": "dockersock"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-certs",
                              "name": "kibana-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/hostfs/proc",
                              "name": "proc"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "metricbeat-token-v6w5j",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirstWithHostNet",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_user": 0
              },
              "service_account": "metricbeat",
              "service_account_name": "metricbeat",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/var/lib/default/metricbeat/metricbeat-data",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "beat-data"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/cgroup",
                          "type": ""
                      },
                      "name": "cgroup"
                  },
                  {
                      "name": "config",
                      "secret": {
                          "default_mode": 384,
                          "optional": false,
                          "secret_name": "metricbeat-beat-metricbeat-config"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/var/run/crio.sock",
                          "type": ""
                      },
                      "name": "dockersock"
                  },
                  {
                      "name": "elasticsearch-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-es-ca"
                      }
                  },
                  {
                      "name": "kibana-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-kibana-ca"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/proc",
                          "type": ""
                      },
                      "name": "proc"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "metricbeat-token-v6w5j",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "metricbeat-token-v6w5j"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:19",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:19",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://4ecfcb9dfbc3bf9d1ba3e4f8e44a4eaba4ea11928d2f1fbdb10eb90759058b47",
                      "image": "dip-controller.lan/beats/metricbeat:7.13.1",
                      "image_id": "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://886389332c1c3f2cad1ea7db60f562b73c8c5430ba8463251abbf6d2df961eb1",
                              "exit_code": 1,
                              "finished_at": "2021-04-26 16:26:04",
                              "reason": "Error",
                              "started_at": "2021-04-26 16:26:01"
                          }
                      },
                      "name": "metricbeat",
                      "ready": true,
                      "restart_count": 2,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:26:18"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "phase": "Running",
              "pod_ip": "10.40.24.67",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:25:41"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:25:41",
              "generate_name": "metricbeat-beat-metricbeat-",
              "labels": {
                  "beat.k8s.elastic.co/config-checksum": "728553c998051a2339638256bd4368ad912e11580d53bc9259250fd2",
                  "beat.k8s.elastic.co/name": "metricbeat",
                  "beat.k8s.elastic.co/version": "7.13.1",
                  "common.k8s.elastic.co/type": "beat",
                  "controller-revision-hash": "5b9bf4bb56",
                  "pod-template-generation": "1"
              },
              "name": "metricbeat-beat-metricbeat-q8bc5",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "metricbeat-beat-metricbeat",
                      "uid": "33ca6613-27ef-4085-9b49-fdf70cda08dc"
                  }
              ],
              "resource_version": "4678",
              "uid": "e913d2e4-7a0b-4a80-8a6c-3b3dfc589019"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": true,
              "containers": [
                  {
                      "args": [
                          "-e",
                          "-c",
                          "/etc/beat.yml",
                          "-system.hostfs=/hostfs"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "beats/metricbeat:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "metricbeat",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/usr/share/metricbeat/data",
                              "name": "beat-data"
                          },
                          {
                              "mount_path": "/hostfs/sys/fs/cgroup",
                              "name": "cgroup"
                          },
                          {
                              "mount_path": "/etc/beat.yml",
                              "name": "config",
                              "read_only": true,
                              "sub_path": "beat.yml"
                          },
                          {
                              "mount_path": "/var/run/crio.sock",
                              "name": "dockersock"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-certs",
                              "name": "kibana-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/hostfs/proc",
                              "name": "proc"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "metricbeat-token-v6w5j",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirstWithHostNet",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_user": 0
              },
              "service_account": "metricbeat",
              "service_account_name": "metricbeat",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/var/lib/default/metricbeat/metricbeat-data",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "beat-data"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/cgroup",
                          "type": ""
                      },
                      "name": "cgroup"
                  },
                  {
                      "name": "config",
                      "secret": {
                          "default_mode": 384,
                          "optional": false,
                          "secret_name": "metricbeat-beat-metricbeat-config"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/var/run/crio.sock",
                          "type": ""
                      },
                      "name": "dockersock"
                  },
                  {
                      "name": "elasticsearch-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-es-ca"
                      }
                  },
                  {
                      "name": "kibana-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-kibana-ca"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/proc",
                          "type": ""
                      },
                      "name": "proc"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "metricbeat-token-v6w5j",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "metricbeat-token-v6w5j"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:16",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:16",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://bc802cbf2d457d6716378712dafd78ff0f584cd79d6d1776ca587418cc154c0e",
                      "image": "dip-controller.lan/beats/metricbeat:7.13.1",
                      "image_id": "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://070fd776096d97c555430e22b5cc520b9512ad380c3cf32aa8054abafa46d532",
                              "exit_code": 1,
                              "finished_at": "2021-04-26 16:26:02",
                              "reason": "Error",
                              "started_at": "2021-04-26 16:26:00"
                          }
                      },
                      "name": "metricbeat",
                      "ready": true,
                      "restart_count": 2,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:26:15"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.40.24.66",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:25:41"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:25:41",
              "generate_name": "metricbeat-beat-metricbeat-",
              "labels": {
                  "beat.k8s.elastic.co/config-checksum": "728553c998051a2339638256bd4368ad912e11580d53bc9259250fd2",
                  "beat.k8s.elastic.co/name": "metricbeat",
                  "beat.k8s.elastic.co/version": "7.13.1",
                  "common.k8s.elastic.co/type": "beat",
                  "controller-revision-hash": "5b9bf4bb56",
                  "pod-template-generation": "1"
              },
              "name": "metricbeat-beat-metricbeat-tr9cb",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "metricbeat-beat-metricbeat",
                      "uid": "33ca6613-27ef-4085-9b49-fdf70cda08dc"
                  }
              ],
              "resource_version": "4644",
              "uid": "6f56b66c-ce9c-49ee-b24a-8c68b28309aa"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": true,
              "containers": [
                  {
                      "args": [
                          "-e",
                          "-c",
                          "/etc/beat.yml",
                          "-system.hostfs=/hostfs"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "beats/metricbeat:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "metricbeat",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/usr/share/metricbeat/data",
                              "name": "beat-data"
                          },
                          {
                              "mount_path": "/hostfs/sys/fs/cgroup",
                              "name": "cgroup"
                          },
                          {
                              "mount_path": "/etc/beat.yml",
                              "name": "config",
                              "read_only": true,
                              "sub_path": "beat.yml"
                          },
                          {
                              "mount_path": "/var/run/crio.sock",
                              "name": "dockersock"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-certs",
                              "name": "kibana-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/hostfs/proc",
                              "name": "proc"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "metricbeat-token-v6w5j",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirstWithHostNet",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_user": 0
              },
              "service_account": "metricbeat",
              "service_account_name": "metricbeat",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/var/lib/default/metricbeat/metricbeat-data",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "beat-data"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/cgroup",
                          "type": ""
                      },
                      "name": "cgroup"
                  },
                  {
                      "name": "config",
                      "secret": {
                          "default_mode": 384,
                          "optional": false,
                          "secret_name": "metricbeat-beat-metricbeat-config"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/var/run/crio.sock",
                          "type": ""
                      },
                      "name": "dockersock"
                  },
                  {
                      "name": "elasticsearch-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-es-ca"
                      }
                  },
                  {
                      "name": "kibana-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-kibana-ca"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/proc",
                          "type": ""
                      },
                      "name": "proc"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "metricbeat-token-v6w5j",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "metricbeat-token-v6w5j"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:10",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:10",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://8d9513ab61f42689fdcd031d4e7824d0e675c316f60c3e099406c3cdf876cfad",
                      "image": "dip-controller.lan/beats/metricbeat:7.13.1",
                      "image_id": "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://57de7c73e26ff891f0b03fce40011acc20f7a24f517994d7862b29ea0492ae59",
                              "exit_code": 1,
                              "finished_at": "2021-04-26 16:25:54",
                              "reason": "Error",
                              "started_at": "2021-04-26 16:25:53"
                          }
                      },
                      "name": "metricbeat",
                      "ready": true,
                      "restart_count": 2,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:26:10"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:25:41"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:25:41",
              "generate_name": "metricbeat-beat-metricbeat-",
              "labels": {
                  "beat.k8s.elastic.co/config-checksum": "728553c998051a2339638256bd4368ad912e11580d53bc9259250fd2",
                  "beat.k8s.elastic.co/name": "metricbeat",
                  "beat.k8s.elastic.co/version": "7.13.1",
                  "common.k8s.elastic.co/type": "beat",
                  "controller-revision-hash": "5b9bf4bb56",
                  "pod-template-generation": "1"
              },
              "name": "metricbeat-beat-metricbeat-wvdrt",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "metricbeat-beat-metricbeat",
                      "uid": "33ca6613-27ef-4085-9b49-fdf70cda08dc"
                  }
              ],
              "resource_version": "4660",
              "uid": "3eaad9f0-8e5c-4ed7-902f-61060268e30f"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": true,
              "containers": [
                  {
                      "args": [
                          "-e",
                          "-c",
                          "/etc/beat.yml",
                          "-system.hostfs=/hostfs"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "beats/metricbeat:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "metricbeat",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "200Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/usr/share/metricbeat/data",
                              "name": "beat-data"
                          },
                          {
                              "mount_path": "/hostfs/sys/fs/cgroup",
                              "name": "cgroup"
                          },
                          {
                              "mount_path": "/etc/beat.yml",
                              "name": "config",
                              "read_only": true,
                              "sub_path": "beat.yml"
                          },
                          {
                              "mount_path": "/var/run/crio.sock",
                              "name": "dockersock"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-certs",
                              "name": "kibana-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/hostfs/proc",
                              "name": "proc"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "metricbeat-token-v6w5j",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirstWithHostNet",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_user": 0
              },
              "service_account": "metricbeat",
              "service_account_name": "metricbeat",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/var/lib/default/metricbeat/metricbeat-data",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "beat-data"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/cgroup",
                          "type": ""
                      },
                      "name": "cgroup"
                  },
                  {
                      "name": "config",
                      "secret": {
                          "default_mode": 384,
                          "optional": false,
                          "secret_name": "metricbeat-beat-metricbeat-config"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/var/run/crio.sock",
                          "type": ""
                      },
                      "name": "dockersock"
                  },
                  {
                      "name": "elasticsearch-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-es-ca"
                      }
                  },
                  {
                      "name": "kibana-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "metricbeat-beat-kibana-ca"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/proc",
                          "type": ""
                      },
                      "name": "proc"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  },
                  {
                      "name": "metricbeat-token-v6w5j",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "metricbeat-token-v6w5j"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:12",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:26:12",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:25:41",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://239c322fbfec3b46c7d33072db730d98b0026b28deb42782f2e14ab1abc494de",
                      "image": "dip-controller.lan/beats/metricbeat:7.13.1",
                      "image_id": "dip-controller.lan/beats/metricbeat@sha256:1200faae67a93d43c39ee0a886f84a08a81acd106603dd94fc1c0823ec24d3ef",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://ef791b90ee661225997e3737792952d5edaa6e3630b1e6d5a4b5ae768c000cb6",
                              "exit_code": 1,
                              "finished_at": "2021-04-26 16:26:00",
                              "reason": "Error",
                              "started_at": "2021-04-26 16:25:57"
                          }
                      },
                      "name": "metricbeat",
                      "ready": true,
                      "restart_count": 2,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:26:11"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.68",
              "phase": "Running",
              "pod_ip": "10.40.24.68",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:25:41"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.5/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.5/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:42.883411296Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-coordinating-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-coordinating-7f5fcb8975",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "957585118",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "false",
                  "elasticsearch.k8s.elastic.co/node-ingest": "false",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "false",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-coordinating",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-coordinating-0"
              },
              "name": "tfplenum-es-coordinating-0",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-coordinating",
                      "uid": "8d08b948-5cbb-4a2d-955c-b11e93e878b6"
                  }
              ],
              "resource_version": "3426",
              "uid": "0cf05ea9-bf52-433f-8557-c307909bc4a1"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-coordinating"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-coordinating-0",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-coordinating"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-coordinating"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-coordinating"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-coordinating"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-coordinating",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-coordinating-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-coordinating-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-data"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:21:08",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:40",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:40",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:17",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://dbc60f2eb9a2b049c144a4afed212d7ea8f3e2f762d18484ba01803b22962958",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:21:08"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://e3912896b7c1ee058a64ab6245a8d8eff7d0c00f399a7796db4c9e2c629837ba",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://e3912896b7c1ee058a64ab6245a8d8eff7d0c00f399a7796db4c9e2c629837ba",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:44",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:41"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://eb10fbadd38bbec67c63a57b7a2a3403d65a63f505e0b809dfe91a89a1a8efef",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://eb10fbadd38bbec67c63a57b7a2a3403d65a63f505e0b809dfe91a89a1a8efef",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:01",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:44"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://405a483c1ff8b5679ea1933ffec223b90d9115e6302fa2a1ee84af5b0cac45ad",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://405a483c1ff8b5679ea1933ffec223b90d9115e6302fa2a1ee84af5b0cac45ad",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:01",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:01"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://04fdc3a2fed405d082a87d9cc32e294a55d0e71cccc0ae6ec1192be724fddf72",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://04fdc3a2fed405d082a87d9cc32e294a55d0e71cccc0ae6ec1192be724fddf72",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:07",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:02"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.38.5",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:17"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.11/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.11/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:44.78595911Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-data-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-data-84645bf59d",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "3903578246",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "true",
                  "elasticsearch.k8s.elastic.co/node-ingest": "true",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "true",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-data",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-data-0"
              },
              "name": "tfplenum-es-data-0",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-data",
                      "uid": "c811c5c2-316c-4ba5-8dff-c2d021c47ac1"
                  }
              ],
              "resource_version": "3386",
              "uid": "172d362f-53c7-4ffa-98fb-cd884638b884"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-data-0",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-data",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-data-0"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:20:51",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:37",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:37",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://99b9db8fa8b29e756b4e927af76644d0c19b5ba917befabc8b2b902949556658",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:20:51"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://b0b189a4ffbbf9838ea50bf67adce11d6273c735c673c9de643c8a05502d40d2",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://b0b189a4ffbbf9838ea50bf67adce11d6273c735c673c9de643c8a05502d40d2",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:36",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:34"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://3c50255a3b8ac3982ce5cce8d164a20e9fdd48c5ca622deb05662b55158c8d3c",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://3c50255a3b8ac3982ce5cce8d164a20e9fdd48c5ca622deb05662b55158c8d3c",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:46",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:36"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://80153324cbe5e88c226b9fb80a90c632cf114a352bf12bc2525374c3510692d6",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://80153324cbe5e88c226b9fb80a90c632cf114a352bf12bc2525374c3510692d6",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:47",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:47"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d9a6d5509f5161163a9694a335c413b3e1d68c6dc8bc334b4a708b876b19b0a8",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://d9a6d5509f5161163a9694a335c413b3e1d68c6dc8bc334b4a708b876b19b0a8",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:51",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:48"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.20.11",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.8/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.8/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:44.804835454Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-data-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-data-84645bf59d",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "3903578246",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "true",
                  "elasticsearch.k8s.elastic.co/node-ingest": "true",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "true",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-data",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-data-1"
              },
              "name": "tfplenum-es-data-1",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-data",
                      "uid": "c811c5c2-316c-4ba5-8dff-c2d021c47ac1"
                  }
              ],
              "resource_version": "3505",
              "uid": "e89cd98d-c07d-46d2-95db-b97c7c4c1150"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-data-1",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-data",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-data-1"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:21:10",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:47",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:47",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://4d9b3f8918ac0c65477b3dff3c4149b4183d162c7959dafe22a34630d190ea8d",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:21:10"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://0a13dea5edeb395cf83baac777c96730ce1006d2b740512c3c8642ed56c1e2ac",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://0a13dea5edeb395cf83baac777c96730ce1006d2b740512c3c8642ed56c1e2ac",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:45",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:41"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://81b4aa6e3d6b05608f4d035569cbfade07715acb5baa4b45a5b652d6b3af7978",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://81b4aa6e3d6b05608f4d035569cbfade07715acb5baa4b45a5b652d6b3af7978",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:02",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:45"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://f3d09dd57ccf22501b3a9528de11d7e38a7c7f04ec1f013fe0752e0a75d8e5e9",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://f3d09dd57ccf22501b3a9528de11d7e38a7c7f04ec1f013fe0752e0a75d8e5e9",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:03",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:03"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://e65b3bf4d43a9745be35639ae6036a26fb3572c1540f8d7169ddb4d5137e98f6",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://e65b3bf4d43a9745be35639ae6036a26fb3572c1540f8d7169ddb4d5137e98f6",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:10",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:04"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.38.8",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.12/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.12/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:44.824788153Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-data-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-data-84645bf59d",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "3903578246",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "true",
                  "elasticsearch.k8s.elastic.co/node-ingest": "true",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "true",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-data",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-data-2"
              },
              "name": "tfplenum-es-data-2",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-data",
                      "uid": "c811c5c2-316c-4ba5-8dff-c2d021c47ac1"
                  }
              ],
              "resource_version": "3371",
              "uid": "398f5c10-1f7f-4c76-aa35-1967f6be1538"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-data-2",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-data",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-data-2"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:20:53",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:37",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:37",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://dc61a92c73e490956fae944dea626802ec8cabe562f52441af427b2d5133adbe",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:20:53"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://b2e371e7a7aa73a7a23b36b31bb7212203d5977513cc703d3efe5bd0aab17743",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://b2e371e7a7aa73a7a23b36b31bb7212203d5977513cc703d3efe5bd0aab17743",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:36",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:34"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://675d8e6cd594e7aeed967c82b87aec5351eb1d1f7583cd9b11d07635df833444",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://675d8e6cd594e7aeed967c82b87aec5351eb1d1f7583cd9b11d07635df833444",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:47",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:37"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://e2131e932f8be383e173964b4c64cfc09de2f496a0cd10dfc779b4a5cdd4d8fa",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://e2131e932f8be383e173964b4c64cfc09de2f496a0cd10dfc779b4a5cdd4d8fa",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:48",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:48"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://92ec212c85d77f22d73cbc61bab6356ba9d07fda34189eedabf0cebd3c0926c9",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://92ec212c85d77f22d73cbc61bab6356ba9d07fda34189eedabf0cebd3c0926c9",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:52",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:49"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.20.12",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.9/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.9/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:44.845989998Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-data-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-data-84645bf59d",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "3903578246",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "true",
                  "elasticsearch.k8s.elastic.co/node-ingest": "true",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "true",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-data",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-data-3"
              },
              "name": "tfplenum-es-data-3",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-data",
                      "uid": "c811c5c2-316c-4ba5-8dff-c2d021c47ac1"
                  }
              ],
              "resource_version": "3515",
              "uid": "21dbb709-1e5a-4bba-b7eb-f345e411fc1e"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-data-3",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-data"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-data",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-data-3"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-data-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:21:09",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:48",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:48",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://827184722fbbde5f90287f5b29da5fa9d17443d9c86c5d10852ba1e1c752306a",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:21:09"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://0d6280d787ad7f358a7708c0bbb3daeeab6c918a25484f6ececbc799bf5547f8",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://0d6280d787ad7f358a7708c0bbb3daeeab6c918a25484f6ececbc799bf5547f8",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:46",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:41"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://06a2d778a52d72907c671bc69984faf9189fde409af968c828c31e11cf59dfd2",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://06a2d778a52d72907c671bc69984faf9189fde409af968c828c31e11cf59dfd2",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:03",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:46"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://ea9dd5e7df6d68ed85aa87d443b15e2dd7112b4e5811eaeb5547d95d05af5d80",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://ea9dd5e7df6d68ed85aa87d443b15e2dd7112b4e5811eaeb5547d95d05af5d80",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:03",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:03"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://4e0e89594dcb94b198098d0722d61fe781e116b3e00c170a5acac3b73125247e",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://4e0e89594dcb94b198098d0722d61fe781e116b3e00c170a5acac3b73125247e",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:09",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:04"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.38.9",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.6/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.6/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:43.731877149Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-master-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-master-9bd879757",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "182028621",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "false",
                  "elasticsearch.k8s.elastic.co/node-ingest": "false",
                  "elasticsearch.k8s.elastic.co/node-master": "true",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "false",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-master",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-master-0"
              },
              "name": "tfplenum-es-master-0",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-master",
                      "uid": "90694506-095c-4421-b282-ccd237987805"
                  }
              ],
              "resource_version": "3442",
              "uid": "7698ec20-5de2-4435-8806-54570505eaf5"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-master-0",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-master",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-master-0"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:21:09",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:40",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:40",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://1c03fca2055664899151b9330b11b3126712b97b61820bc2689190e554d18d98",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:21:09"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://1ac15228ba76bb3fafca0703eababadc14f79d40d75c11caa9fc6a9c91db2831",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://1ac15228ba76bb3fafca0703eababadc14f79d40d75c11caa9fc6a9c91db2831",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:44",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:41"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://e3642d5eb83c659354b7f0eb230997676595db4a231c12b3b71fba1ea15b4163",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://e3642d5eb83c659354b7f0eb230997676595db4a231c12b3b71fba1ea15b4163",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:01",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:44"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://ca26109da25c3a58f24156b47aea5db8de6b1e99b1b2e2f8a1c5f9b7d661c74c",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://ca26109da25c3a58f24156b47aea5db8de6b1e99b1b2e2f8a1c5f9b7d661c74c",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:02",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:02"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://a6bb962116cef5b7c51de47301c83e3c96a2d3a54e69b14e79c9c848151ebdec",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://a6bb962116cef5b7c51de47301c83e3c96a2d3a54e69b14e79c9c848151ebdec",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:08",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:03"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.38.6",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.10/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.10/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:43.751717019Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-master-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-master-9bd879757",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "182028621",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "false",
                  "elasticsearch.k8s.elastic.co/node-ingest": "false",
                  "elasticsearch.k8s.elastic.co/node-master": "true",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "false",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-master",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-master-1"
              },
              "name": "tfplenum-es-master-1",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-master",
                      "uid": "90694506-095c-4421-b282-ccd237987805"
                  }
              ],
              "resource_version": "3415",
              "uid": "705fc16f-7d4c-4ce4-8ba0-98e509187252"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-master-1",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-master",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-master-1"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:20:51",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:39",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:39",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://cb88b256c0dc661831c4108ebde39e38142126c444e20052586e4cdb7f81bf25",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:20:51"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://fed6524d69be84fc3b1784bf1e4244e314be0a38b8c17fe519c98c4d53374e8d",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://fed6524d69be84fc3b1784bf1e4244e314be0a38b8c17fe519c98c4d53374e8d",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:36",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:34"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d2e63429c43e872d6c1ef70bc22dbe406a120563cec5fd681e2d0b203064735b",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://d2e63429c43e872d6c1ef70bc22dbe406a120563cec5fd681e2d0b203064735b",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:46",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:36"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://c01d668b59c3d74c232afef32ed1d28eb0b22074d81e1ad4b26802587c5ac8de",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://c01d668b59c3d74c232afef32ed1d28eb0b22074d81e1ad4b26802587c5ac8de",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:47",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:47"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d2b3a572391a47f1a81731a5d5aabb68e259300aedf207229d6ad6336277fb0c",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://d2b3a572391a47f1a81731a5d5aabb68e259300aedf207229d6ad6336277fb0c",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:51",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:48"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.20.10",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.38.7/32",
                  "cni.projectcalico.org/podIPs": "10.233.38.7/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:43.77190822Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-master-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-master-9bd879757",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "182028621",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "false",
                  "elasticsearch.k8s.elastic.co/node-ingest": "false",
                  "elasticsearch.k8s.elastic.co/node-master": "true",
                  "elasticsearch.k8s.elastic.co/node-ml": "false",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "false",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-master",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-master-2"
              },
              "name": "tfplenum-es-master-2",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-master",
                      "uid": "90694506-095c-4421-b282-ccd237987805"
                  }
              ],
              "resource_version": "3494",
              "uid": "ef09ddf6-2018-43a5-8a63-6e4bd26bc2d0"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-master-2",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-master"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/data",
                              "name": "elasticsearch-data"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-master",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elasticsearch-data",
                      "persistent_volume_claim": {
                          "claim_name": "elasticsearch-data-tfplenum-es-master-2"
                      }
                  },
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-master-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:21:10",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:47",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:47",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:18",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://94bc13207425b017457432cd261b41b00404e7fc6322f2c1e80a71f543e217c8",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:21:10"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://a936c0178dadfb7e8c4397a9ea46e9ef3e670183c5441e9f59058b182c9d6b04",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://a936c0178dadfb7e8c4397a9ea46e9ef3e670183c5441e9f59058b182c9d6b04",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:44",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:41"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://3718a35bb04f6a77e6a2f7e5cc7501d6bdf9dccf716330b92871379eac247d66",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://3718a35bb04f6a77e6a2f7e5cc7501d6bdf9dccf716330b92871379eac247d66",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:02",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:45"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://cf636da1c7d9db833c079183d489470fffcfd7d524a72cc8abdb6cafc317c5a2",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://cf636da1c7d9db833c079183d489470fffcfd7d524a72cc8abdb6cafc317c5a2",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:03",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:03"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://dc9b90e6a8da35a52c20cbdc1832bc121a50fe69e4e3996debe326af6762062d",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://dc9b90e6a8da35a52c20cbdc1832bc121a50fe69e4e3996debe326af6762062d",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:21:10",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:21:04"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.38.7",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:18"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.9/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.9/32",
                  "co.elastic.logs/module": "elasticsearch",
                  "update.k8s.elastic.co/timestamp": "2021-04-26T16:20:42.500704387Z"
              },
              "creation_timestamp": "2021-04-26 16:20:17",
              "generate_name": "tfplenum-es-ml-",
              "labels": {
                  "common.k8s.elastic.co/type": "elasticsearch",
                  "component": "elasticsearch",
                  "controller-revision-hash": "tfplenum-es-ml-7c6486687f",
                  "elasticsearch.k8s.elastic.co/cluster-name": "tfplenum",
                  "elasticsearch.k8s.elastic.co/config-hash": "2693964849",
                  "elasticsearch.k8s.elastic.co/http-scheme": "https",
                  "elasticsearch.k8s.elastic.co/node-data": "false",
                  "elasticsearch.k8s.elastic.co/node-ingest": "false",
                  "elasticsearch.k8s.elastic.co/node-master": "false",
                  "elasticsearch.k8s.elastic.co/node-ml": "true",
                  "elasticsearch.k8s.elastic.co/node-remote_cluster_client": "true",
                  "elasticsearch.k8s.elastic.co/node-transform": "false",
                  "elasticsearch.k8s.elastic.co/node-voting_only": "false",
                  "elasticsearch.k8s.elastic.co/secure-settings-hash": "c9f95bec8eb0cbcd77233f935266b7c6d1bac2bccbfd4bab7ab70871",
                  "elasticsearch.k8s.elastic.co/statefulset-name": "tfplenum-es-ml",
                  "elasticsearch.k8s.elastic.co/version": "7.13.1",
                  "statefulset.kubernetes.io/pod-name": "tfplenum-es-ml-0"
              },
              "name": "tfplenum-es-ml-0",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "tfplenum-es-ml",
                      "uid": "199b574f-3190-41b8-b6a0-5f2fec9a59ed"
                  }
              ],
              "resource_version": "3395",
              "uid": "e4a8f7e6-3c6d-4a11-b2b4-9530c2d698da"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ES_JAVA_OPTS",
                              "value": "-Xms1g -Xmx1g"
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "PROBE_PASSWORD_PATH",
                              "value": "/mnt/elastic-internal/probe-user/elastic-internal-probe"
                          },
                          {
                              "name": "PROBE_USERNAME",
                              "value": "elastic-internal-probe"
                          },
                          {
                              "name": "READINESS_PROBE_PROTOCOL",
                              "value": "https"
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-ml"
                          },
                          {
                              "name": "NSS_SDB_USE_CACHE",
                              "value": "no"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "lifecycle": {
                          "pre_stop": {
                              "_exec": {
                                  "command": [
                                      "bash",
                                      "-c",
                                      "/mnt/elastic-internal/scripts/pre-stop-hook-script.sh"
                                  ]
                              }
                          }
                      },
                      "name": "elasticsearch",
                      "ports": [
                          {
                              "container_port": 9200,
                              "name": "https",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9300,
                              "name": "transport",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "bash",
                                  "-c",
                                  "/mnt/elastic-internal/scripts/readiness-probe-script.sh"
                              ]
                          },
                          "failure_threshold": 3,
                          "initial_delay_seconds": 10,
                          "period_seconds": 5,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "tfplenum-es-ml-0",
              "init_containers": [
                  {
                      "command": [
                          "bash",
                          "-c",
                          "/mnt/elastic-internal/scripts/prepare-fs.sh"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-ml"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-filesystem",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-bin-local",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config-local",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-plugins-local",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/transport-certificates",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/elasticsearch/bin/elasticsearch-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/elasticsearch/bin/elasticsearch-keystore add-file \"$key\" \"$filename\"\ndone\n\ntouch /usr/share/elasticsearch/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-ml"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          },
                          "requests": {
                              "cpu": "500m",
                              "memory": "196Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "sysctl -w vm.max_map_count=262144"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-ml"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "sysctl",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  },
                  {
                      "command": [
                          "sh",
                          "-c",
                          "set -o pipefail\nTEMPORARY_FILE=$(mktemp)\nbin/elasticsearch-plugin install --batch file:///tmp/plugins/repository-s3-7.13.1.zip 2>&1 | tee $TEMPORARY_FILE\nRETURN_CODE=$?\ngrep -q \"already exists\" $TEMPORARY_FILE\nALREADY_EXISTS=$?\nif [[ $RETURN_CODE -eq 0 || $ALREADY_EXISTS -eq 0 ]]; then\n  echo \"Success: RC: $RETURN_CODE\"\n  exit 0\nelse\n  echo \"Failure: RC: $RETURN_CODE\"\n  exit 1\nfi\n"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "HEADLESS_SERVICE_NAME",
                              "value": "tfplenum-es-ml"
                          }
                      ],
                      "image": "elasticsearch/elasticsearch:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-plugins",
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/downward-api",
                              "name": "downward-api",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/bin",
                              "name": "elastic-internal-elasticsearch-bin-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/elasticsearch-config",
                              "name": "elastic-internal-elasticsearch-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config",
                              "name": "elastic-internal-elasticsearch-config-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/plugins",
                              "name": "elastic-internal-elasticsearch-plugins-local"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/probe-user",
                              "name": "elastic-internal-probe-user",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-remote-certs/",
                              "name": "elastic-internal-remote-certificate-authorities",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/scripts",
                              "name": "elastic-internal-scripts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/transport-certs",
                              "name": "elastic-internal-transport-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/unicast-hosts",
                              "name": "elastic-internal-unicast-hosts",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/xpack-file-realm",
                              "name": "elastic-internal-xpack-file-realm",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/plugins",
                              "name": "elastic-plugins"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/logs",
                              "name": "elasticsearch-logs"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/kibana-saml-certs/",
                              "name": "kibana-saml"
                          },
                          {
                              "mount_path": "/usr/share/elasticsearch/config/sso-idp-metadata",
                              "name": "sso-idp-metadata"
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "subdomain": "tfplenum-es-ml",
              "termination_grace_period_seconds": 180,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "downward_api": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.labels"
                                  },
                                  "path": "labels"
                              }
                          ]
                      },
                      "name": "downward-api"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-bin-local"
                  },
                  {
                      "name": "elastic-internal-elasticsearch-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-ml-es-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-config-local"
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-elasticsearch-plugins-local"
                  },
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-probe-user",
                      "secret": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "elastic-internal-probe",
                                  "path": "elastic-internal-probe"
                              }
                          ],
                          "optional": false,
                          "secret_name": "tfplenum-es-internal-users"
                      }
                  },
                  {
                      "name": "elastic-internal-remote-certificate-authorities",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-remote-ca"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 493,
                          "name": "tfplenum-es-scripts",
                          "optional": false
                      },
                      "name": "elastic-internal-scripts"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-secure-settings"
                      }
                  },
                  {
                      "name": "elastic-internal-transport-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-ml-es-transport-certs"
                      }
                  },
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "tfplenum-es-unicast-hosts",
                          "optional": false
                      },
                      "name": "elastic-internal-unicast-hosts"
                  },
                  {
                      "name": "elastic-internal-xpack-file-realm",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-es-xpack-file-realm"
                      }
                  },
                  {
                      "host_path": {
                          "path": "/data/elastic_plugins",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "elastic-plugins"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-data"
                  },
                  {
                      "empty_dir": {},
                      "name": "elasticsearch-logs"
                  },
                  {
                      "name": "kibana-saml",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "kibana-saml"
                      }
                  },
                  {
                      "name": "sso-idp-metadata",
                      "secret": {
                          "default_mode": 292,
                          "secret_name": "sso-idp-metadata"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:20:52",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:38",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:21:38",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:17",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://641e9f17ea15549491c591a457f94430608ae32f30d2884b332e9af3885dc463",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elasticsearch",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:20:52"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://55d98c668f203defdc929ad1b48353bd64d05c676836794033ed4a67d483c698",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-filesystem",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://55d98c668f203defdc929ad1b48353bd64d05c676836794033ed4a67d483c698",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:35",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:34"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d53cd2c66ab12520c46323c4e19d3150f700ec3c43a896e53f8f889598581650",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://d53cd2c66ab12520c46323c4e19d3150f700ec3c43a896e53f8f889598581650",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:46",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:36"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://e8e4b4a16cb58125c55f932e866656ac3fc14ff9e9d3ed800471e3e80265a4d1",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "sysctl",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://e8e4b4a16cb58125c55f932e866656ac3fc14ff9e9d3ed800471e3e80265a4d1",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:47",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:47"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://59e7dacc5e088a280d030b4d4c2e041c62dbe873f0661ee1cef6136583a3a8fc",
                      "image": "dip-controller.lan/elasticsearch/elasticsearch:7.13.1",
                      "image_id": "dip-controller.lan/elasticsearch/elasticsearch@sha256:4228b7a8ef40b7593b1a7493bebf68022f0562446cef75dbff49f3af3c1d044d",
                      "last_state": {},
                      "name": "install-plugins",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://59e7dacc5e088a280d030b4d4c2e041c62dbe873f0661ee1cef6136583a3a8fc",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:20:51",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:20:48"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.20.9",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:20:17"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.13/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.13/32",
                  "co.elastic.logs/module": "kibana"
              },
              "creation_timestamp": "2021-04-26 16:23:19",
              "generate_name": "tfplenum-kb-9ff97b84f-",
              "labels": {
                  "common.k8s.elastic.co/type": "kibana",
                  "kibana.k8s.elastic.co/config-checksum": "2688cca6ef8e0e566fdd42eddb01c87aeb1946614da184ddf5d3d72f",
                  "kibana.k8s.elastic.co/name": "tfplenum",
                  "kibana.k8s.elastic.co/version": "7.13.1",
                  "pod-template-hash": "9ff97b84f"
              },
              "name": "tfplenum-kb-9ff97b84f-vmkwz",
              "namespace": "default",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "tfplenum-kb-9ff97b84f",
                      "uid": "55676e3a-f7d0-4c38-8398-84a4d3ab1fba"
                  }
              ],
              "resource_version": "4091",
              "uid": "14df5558-74fd-488f-afd8-f8cc2dcb533c"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_expressions": [
                                      {
                                          "key": "role",
                                          "operator": "In",
                                          "values": [
                                              "server"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "automount_service_account_token": false,
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ELASTICSEARCH_HOSTS",
                              "value": "https://elasticsearch.default.svc.cluster.local:9200"
                          }
                      ],
                      "image": "kibana/kibana:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "kibana",
                      "ports": [
                          {
                              "container_port": 5601,
                              "name": "https",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/login",
                              "port": 5601,
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "resources": {
                          "requests": {
                              "cpu": "1",
                              "memory": "1Gi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-config",
                              "name": "elastic-internal-kibana-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/config",
                              "name": "elastic-internal-kibana-config-local"
                          },
                          {
                              "mount_path": "/usr/share/kibana/config/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/data",
                              "name": "kibana-data"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "init_containers": [
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\n\nset -eux\n\nkeystore_initialized_flag=/usr/share/kibana/config/elastic-internal-init-keystore.ok\n\nif [[ -f \"${keystore_initialized_flag}\" ]]; then\n    echo \"Keystore already initialized.\"\n\texit 0\nfi\n\necho \"Initializing keystore.\"\n\n# create a keystore in the default data path\n/usr/share/kibana/bin/kibana-keystore create\n\n# add all existing secret entries into it\nfor filename in  /mnt/elastic-internal/secure-settings/*; do\n\t[[ -e \"$filename\" ]] || continue # glob does not match\n\tkey=$(basename \"$filename\")\n\techo \"Adding \"$key\" to the keystore.\"\n\t/usr/share/kibana/bin/kibana-keystore add \"$key\" --stdin < \"$filename\"\ndone\n\ntouch /usr/share/kibana/config/elastic-internal-init-keystore.ok\necho \"Keystore initialization successful.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          }
                      ],
                      "image": "kibana/kibana:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-keystore",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "128Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "128Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-config",
                              "name": "elastic-internal-kibana-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/config",
                              "name": "elastic-internal-kibana-config-local"
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/secure-settings",
                              "name": "elastic-internal-secure-settings",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/config/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/data",
                              "name": "kibana-data"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "command": [
                          "/usr/bin/env",
                          "bash",
                          "-c",
                          "#!/usr/bin/env bash\nset -eux\n\ninit_config_initialized_flag=/mnt/elastic-internal/kibana-config-local/elastic-internal-init-config.ok\n\nif [[ -f \"${init_config_initialized_flag}\" ]]; then\n    echo \"Kibana configuration already initialized.\"\n\texit 0\nfi\n\necho \"Setup Kibana configuration\"\n\nln -sf /mnt/elastic-internal/kibana-config/* /mnt/elastic-internal/kibana-config-local/\n\ntouch \"${init_config_initialized_flag}\"\necho \"Kibana configuration successfully prepared.\"\n"
                      ],
                      "env": [
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "POD_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.name"
                                  }
                              }
                          },
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          }
                      ],
                      "image": "kibana/kibana:7.13.1",
                      "image_pull_policy": "IfNotPresent",
                      "name": "elastic-internal-init-config",
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "50Mi"
                          }
                      },
                      "security_context": {
                          "privileged": false
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/mnt/elastic-internal/http-certs",
                              "name": "elastic-internal-http-certificates",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-config",
                              "name": "elastic-internal-kibana-config",
                              "read_only": true
                          },
                          {
                              "mount_path": "/mnt/elastic-internal/kibana-config-local",
                              "name": "elastic-internal-kibana-config-local"
                          },
                          {
                              "mount_path": "/usr/share/kibana/config/elasticsearch-certs",
                              "name": "elasticsearch-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/share/kibana/data",
                              "name": "kibana-data"
                          },
                          {
                              "mount_path": "/etc/ssl/certs/container",
                              "name": "webca",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "default",
              "service_account_name": "default",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "elastic-internal-http-certificates",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-kb-http-certs-internal"
                      }
                  },
                  {
                      "name": "elastic-internal-kibana-config",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-kb-config"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "elastic-internal-kibana-config-local"
                  },
                  {
                      "name": "elastic-internal-secure-settings",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-kb-secure-settings"
                      }
                  },
                  {
                      "name": "elasticsearch-certs",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "tfplenum-kb-es-ca"
                      }
                  },
                  {
                      "empty_dir": {},
                      "name": "kibana-data"
                  },
                  {
                      "name": "webca",
                      "secret": {
                          "default_mode": 420,
                          "optional": false,
                          "secret_name": "webca-certificate"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:23:50",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:24:00",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:24:00",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:23:19",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://07ebedecea72faf1dac23eae8fa4b2f864606559a97d01024ced9874c0ad3bb9",
                      "image": "dip-controller.lan/kibana/kibana:7.13.1",
                      "image_id": "dip-controller.lan/kibana/kibana@sha256:0570b27bb7c2947a50eeb1dd7cc09fa4bc51f1f234b1f113e01ac8e7443999a4",
                      "last_state": {},
                      "name": "kibana",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:23:50"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://5428e4db1e137594d508a94b130c75583397172a3fca7dfa2406eb2ae7ed5281",
                      "image": "dip-controller.lan/kibana/kibana:7.13.1",
                      "image_id": "dip-controller.lan/kibana/kibana@sha256:0570b27bb7c2947a50eeb1dd7cc09fa4bc51f1f234b1f113e01ac8e7443999a4",
                      "last_state": {},
                      "name": "elastic-internal-init-keystore",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://5428e4db1e137594d508a94b130c75583397172a3fca7dfa2406eb2ae7ed5281",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:23:48",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:23:36"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://b402dc8054af7db7b23801cc2e2ddcf672f7fd43c4555e2f5025e55c42592818",
                      "image": "dip-controller.lan/kibana/kibana:7.13.1",
                      "image_id": "dip-controller.lan/kibana/kibana@sha256:0570b27bb7c2947a50eeb1dd7cc09fa4bc51f1f234b1f113e01ac8e7443999a4",
                      "last_state": {},
                      "name": "elastic-internal-init-config",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://b402dc8054af7db7b23801cc2e2ddcf672f7fd43c4555e2f5025e55c42592818",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:23:49",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:23:49"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.233.20.13",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:23:19"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "checksum/config": "0d548bc052adb33254689ac24a212460301624526d6dc5336fb42d10c9775770",
                  "cni.projectcalico.org/podIP": "10.233.55.1/32",
                  "cni.projectcalico.org/podIPs": "10.233.55.1/32",
                  "co.elastic.logs/raw": "[{\"type\":\"container\",\"json.keys_under_root\":true,\"paths\":[\"/var/log/containers/*${data.kubernetes.container.id}.log\"],\"processors\":[{\"convert\":{\"mode\":\"rename\",\"ignore_missing\":true,\"fields\":[{\"from\":\"error\",\"to\":\"_error\"}]}},{\"convert\":{\"mode\":\"rename\",\"ignore_missing\":true,\"fields\":[{\"from\":\"_error\",\"to\":\"error.message\"}]}},{\"convert\":{\"mode\":\"rename\",\"ignore_missing\":true,\"fields\":[{\"from\":\"source\",\"to\":\"_source\"}]}},{\"convert\":{\"mode\":\"rename\",\"ignore_missing\":true,\"fields\":[{\"from\":\"_source\",\"to\":\"event.source\"}]}}]}]"
              },
              "creation_timestamp": "2021-04-26 16:19:36",
              "generate_name": "elastic-operator-",
              "labels": {
                  "control-plane": "elastic-operator",
                  "controller-revision-hash": "elastic-operator-8df7948d9",
                  "statefulset.kubernetes.io/pod-name": "elastic-operator-0"
              },
              "name": "elastic-operator-0",
              "namespace": "elastic-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "StatefulSet",
                      "name": "elastic-operator",
                      "uid": "5a788e97-3b39-4dea-89f4-fa70d6d1b66d"
                  }
              ],
              "resource_version": "2517",
              "uid": "bbb1d56a-6a4e-4ce3-9808-b56be71a77b3"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "manager",
                          "--config=/conf/eck.yaml",
                          "--distribution-channel=all-in-one"
                      ],
                      "env": [
                          {
                              "name": "OPERATOR_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "POD_IP",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "WEBHOOK_SECRET",
                              "value": "elastic-webhook-server-cert"
                          }
                      ],
                      "image": "eck/eck-operator:1.6.0",
                      "image_pull_policy": "IfNotPresent",
                      "name": "manager",
                      "ports": [
                          {
                              "container_port": 9443,
                              "name": "https-webhook",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "1",
                              "memory": "512Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "150Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/conf",
                              "name": "conf",
                              "read_only": true
                          },
                          {
                              "mount_path": "/tmp/k8s-webhook-server/serving-certs",
                              "name": "cert",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "elastic-operator-token-b2pcc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "hostname": "elastic-operator-0",
              "node_name": "jdms-sensor2.lan",
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_non_root": true
              },
              "service_account": "elastic-operator",
              "service_account_name": "elastic-operator",
              "subdomain": "elastic-operator",
              "termination_grace_period_seconds": 10,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "elastic-operator"
                      },
                      "name": "conf"
                  },
                  {
                      "name": "cert",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "elastic-webhook-server-cert"
                      }
                  },
                  {
                      "name": "elastic-operator-token-b2pcc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "elastic-operator-token-b2pcc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:19:36",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:15",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:20:15",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:19:36",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://1a1ea5d08cceab56420d450dcae548f967bbc396d44e7efdca460c7f390aae88",
                      "image": "dip-controller.lan/eck/eck-operator:1.6.0",
                      "image_id": "dip-controller.lan/eck/eck-operator@sha256:4d2897e4b88403a7086f8b58788eae94960a68205ac95d6c0d68065299caf6ac",
                      "last_state": {
                          "terminated": {
                              "container_id": "cri-o://f8e4e0083a66b0d7bef0874d5077befd6fe19cd8c059e862ea75897b4b91fa0a",
                              "exit_code": 1,
                              "finished_at": "2021-04-26 16:20:13",
                              "reason": "Error",
                              "started_at": "2021-04-26 16:19:41"
                          }
                      },
                      "name": "manager",
                      "ready": true,
                      "restart_count": 1,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:20:14"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.68",
              "phase": "Running",
              "pod_ip": "10.233.55.1",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:19:36"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.3/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.3/32"
              },
              "creation_timestamp": "2021-04-26 16:11:31",
              "generate_name": "calico-kube-controllers-7d569d95-",
              "labels": {
                  "k8s-app": "calico-kube-controllers",
                  "pod-template-hash": "7d569d95"
              },
              "name": "calico-kube-controllers-7d569d95-hb7bm",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "calico-kube-controllers-7d569d95",
                      "uid": "d5e2172a-744f-4883-9c0a-476a42602c65"
                  }
              ],
              "resource_version": "783",
              "uid": "e6362397-d5df-4299-9a57-1773a1822d79"
          },
          "spec": {
              "containers": [
                  {
                      "env": [
                          {
                              "name": "ENABLED_CONTROLLERS",
                              "value": "node"
                          },
                          {
                              "name": "DATASTORE_TYPE",
                              "value": "kubernetes"
                          }
                      ],
                      "image": "calico/kube-controllers:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "calico-kube-controllers",
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "/usr/bin/check-status",
                                  "-r"
                              ]
                          },
                          "failure_threshold": 3,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {},
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-kube-controllers-token-t9bxs",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000000000,
              "priority_class_name": "system-cluster-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "calico-kube-controllers",
              "service_account_name": "calico-kube-controllers",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "calico-kube-controllers-token-t9bxs",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "calico-kube-controllers-token-t9bxs"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:16",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:16",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://39c73da2690024248e4580f256546a226936ef17c4eb7d13fecd81cd8d528155",
                      "image": "dip-controller.lan/calico/kube-controllers:v3.16.4",
                      "image_id": "dip-controller.lan/calico/kube-controllers@sha256:166d709e026516cb1c6f164d3e4379279caa192aaea0bcbd4e57206eac574b0c",
                      "last_state": {},
                      "name": "calico-kube-controllers",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:18"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.3",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:12:16"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:13:19",
              "generate_name": "calico-node-",
              "labels": {
                  "controller-revision-hash": "569f57894c",
                  "k8s-app": "calico-node",
                  "pod-template-generation": "1"
              },
              "name": "calico-node-6pgth",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "calico-node",
                      "uid": "c8ea5daf-04e0-4518-a59b-92cb011ee2c6"
                  }
              ],
              "resource_version": "1056",
              "uid": "27007a9d-5f09-443f-9b19-10d86402f75a"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "DATASTORE_TYPE",
                              "value": "kubernetes"
                          },
                          {
                              "name": "WAIT_FOR_DATASTORE",
                              "value": "true"
                          },
                          {
                              "name": "NODENAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CLUSTER_TYPE",
                              "value": "k8s,bgp"
                          },
                          {
                              "name": "IP",
                              "value": "autodetect"
                          },
                          {
                              "name": "IP_AUTODETECTION_METHOD",
                              "value": "cidr=10.40.24.0/24"
                          },
                          {
                              "name": "FELIX_IPTABLESBACKEND",
                              "value": "NFT"
                          },
                          {
                              "name": "CALICO_IPV4POOL_IPIP",
                              "value": "CrossSubnet"
                          },
                          {
                              "name": "CALICO_IPV4POOL_VXLAN",
                              "value": "Never"
                          },
                          {
                              "name": "FELIX_IPINIPMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_VXLANMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_WIREGUARDMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_IPV4POOL_BLOCK_SIZE",
                              "value": "24"
                          },
                          {
                              "name": "CALICO_DISABLE_FILE_LOGGING",
                              "value": "true"
                          },
                          {
                              "name": "FELIX_DEFAULTENDPOINTTOHOSTACTION",
                              "value": "ACCEPT"
                          },
                          {
                              "name": "FELIX_IPV6SUPPORT",
                              "value": "false"
                          },
                          {
                              "name": "FELIX_LOGSEVERITYSCREEN",
                              "value": "info"
                          },
                          {
                              "name": "FELIX_HEALTHENABLED",
                              "value": "true"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/node:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-live",
                                  "-bird-live"
                              ]
                          },
                          "failure_threshold": 6,
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "calico-node",
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-ready",
                                  "-bird-ready"
                              ]
                          },
                          "failure_threshold": 3,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "requests": {
                              "cpu": "250m"
                          }
                      },
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/var/run/calico",
                              "name": "var-run-calico"
                          },
                          {
                              "mount_path": "/var/lib/calico",
                              "name": "var-lib-calico"
                          },
                          {
                              "mount_path": "/var/run/nodeagent",
                              "name": "policysync"
                          },
                          {
                              "mount_path": "/sys/fs/",
                              "mount_propagation": "Bidirectional",
                              "name": "sysfs"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "init_containers": [
                  {
                      "command": [
                          "/opt/cni/bin/calico-ipam",
                          "-upgrade"
                      ],
                      "env": [
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "upgrade-ipam",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/cni/networks",
                              "name": "host-local-net-dir"
                          },
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "command": [
                          "/opt/cni/bin/install"
                      ],
                      "env": [
                          {
                              "name": "CNI_CONF_NAME",
                              "value": "10-calico.conflist"
                          },
                          {
                              "name": "CNI_NETWORK_CONFIG",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "cni_network_config",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CNI_MTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "SLEEP",
                              "value": "false"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-cni",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/host/etc/cni/net.d",
                              "name": "cni-net-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "image": "calico/pod2daemon-flexvol:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "flexvol-driver",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/driver",
                              "name": "flexvol-driver-host"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "calico-node",
              "service_account_name": "calico-node",
              "termination_grace_period_seconds": 0,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "operator": "Exists"
                  },
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/calico",
                          "type": ""
                      },
                      "name": "var-run-calico"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/calico",
                          "type": ""
                      },
                      "name": "var-lib-calico"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "sysfs"
                  },
                  {
                      "host_path": {
                          "path": "/opt/cni/bin",
                          "type": ""
                      },
                      "name": "cni-bin-dir"
                  },
                  {
                      "host_path": {
                          "path": "/etc/cni/net.d",
                          "type": ""
                      },
                      "name": "cni-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/cni/networks",
                          "type": ""
                      },
                      "name": "host-local-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/nodeagent",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "policysync"
                  },
                  {
                      "host_path": {
                          "path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec/nodeagent~uds",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "flexvol-driver-host"
                  },
                  {
                      "name": "calico-node-token-5tqmc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "calico-node-token-5tqmc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:13:46",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:01",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:01",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:19",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://620c2bf7267717058073fc1a4425bc3c0fe93cf136b05352c24c1e1d9d394e11",
                      "image": "dip-controller.lan/calico/node:v3.16.4",
                      "image_id": "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                      "last_state": {},
                      "name": "calico-node",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:13:51"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://b93e397a0caf0a8739f0532d35f897b554190d9800ddbeb02004d6d4a878e456",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "upgrade-ipam",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://b93e397a0caf0a8739f0532d35f897b554190d9800ddbeb02004d6d4a878e456",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:13:27",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:13:27"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://910832f73beef27c0e23bd3886df02b30c1fb4de9537b912dccf11060fef8c96",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "install-cni",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://910832f73beef27c0e23bd3886df02b30c1fb4de9537b912dccf11060fef8c96",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:13:29",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:13:28"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://3b4fa4fcf5ef256647e5fe4b6c12cf956d85ee0d2263b56dccf007392fd32bfb",
                      "image": "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4",
                      "image_id": "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                      "last_state": {},
                      "name": "flexvol-driver",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://3b4fa4fcf5ef256647e5fe4b6c12cf956d85ee0d2263b56dccf007392fd32bfb",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:13:45",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:13:45"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.40.24.66",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:13:19"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:15:52",
              "generate_name": "calico-node-",
              "labels": {
                  "controller-revision-hash": "569f57894c",
                  "k8s-app": "calico-node",
                  "pod-template-generation": "1"
              },
              "name": "calico-node-ghgls",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "calico-node",
                      "uid": "c8ea5daf-04e0-4518-a59b-92cb011ee2c6"
                  }
              ],
              "resource_version": "1485",
              "uid": "a6a1cd3f-0f9d-42e5-93a0-957675eadceb"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "DATASTORE_TYPE",
                              "value": "kubernetes"
                          },
                          {
                              "name": "WAIT_FOR_DATASTORE",
                              "value": "true"
                          },
                          {
                              "name": "NODENAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CLUSTER_TYPE",
                              "value": "k8s,bgp"
                          },
                          {
                              "name": "IP",
                              "value": "autodetect"
                          },
                          {
                              "name": "IP_AUTODETECTION_METHOD",
                              "value": "cidr=10.40.24.0/24"
                          },
                          {
                              "name": "FELIX_IPTABLESBACKEND",
                              "value": "NFT"
                          },
                          {
                              "name": "CALICO_IPV4POOL_IPIP",
                              "value": "CrossSubnet"
                          },
                          {
                              "name": "CALICO_IPV4POOL_VXLAN",
                              "value": "Never"
                          },
                          {
                              "name": "FELIX_IPINIPMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_VXLANMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_WIREGUARDMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_IPV4POOL_BLOCK_SIZE",
                              "value": "24"
                          },
                          {
                              "name": "CALICO_DISABLE_FILE_LOGGING",
                              "value": "true"
                          },
                          {
                              "name": "FELIX_DEFAULTENDPOINTTOHOSTACTION",
                              "value": "ACCEPT"
                          },
                          {
                              "name": "FELIX_IPV6SUPPORT",
                              "value": "false"
                          },
                          {
                              "name": "FELIX_LOGSEVERITYSCREEN",
                              "value": "info"
                          },
                          {
                              "name": "FELIX_HEALTHENABLED",
                              "value": "true"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/node:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-live",
                                  "-bird-live"
                              ]
                          },
                          "failure_threshold": 6,
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "calico-node",
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-ready",
                                  "-bird-ready"
                              ]
                          },
                          "failure_threshold": 3,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "requests": {
                              "cpu": "250m"
                          }
                      },
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/var/run/calico",
                              "name": "var-run-calico"
                          },
                          {
                              "mount_path": "/var/lib/calico",
                              "name": "var-lib-calico"
                          },
                          {
                              "mount_path": "/var/run/nodeagent",
                              "name": "policysync"
                          },
                          {
                              "mount_path": "/sys/fs/",
                              "mount_propagation": "Bidirectional",
                              "name": "sysfs"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "init_containers": [
                  {
                      "command": [
                          "/opt/cni/bin/calico-ipam",
                          "-upgrade"
                      ],
                      "env": [
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "upgrade-ipam",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/cni/networks",
                              "name": "host-local-net-dir"
                          },
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "command": [
                          "/opt/cni/bin/install"
                      ],
                      "env": [
                          {
                              "name": "CNI_CONF_NAME",
                              "value": "10-calico.conflist"
                          },
                          {
                              "name": "CNI_NETWORK_CONFIG",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "cni_network_config",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CNI_MTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "SLEEP",
                              "value": "false"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-cni",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/host/etc/cni/net.d",
                              "name": "cni-net-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "image": "calico/pod2daemon-flexvol:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "flexvol-driver",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/driver",
                              "name": "flexvol-driver-host"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-sensor2.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "calico-node",
              "service_account_name": "calico-node",
              "termination_grace_period_seconds": 0,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "operator": "Exists"
                  },
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/calico",
                          "type": ""
                      },
                      "name": "var-run-calico"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/calico",
                          "type": ""
                      },
                      "name": "var-lib-calico"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "sysfs"
                  },
                  {
                      "host_path": {
                          "path": "/opt/cni/bin",
                          "type": ""
                      },
                      "name": "cni-bin-dir"
                  },
                  {
                      "host_path": {
                          "path": "/etc/cni/net.d",
                          "type": ""
                      },
                      "name": "cni-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/cni/networks",
                          "type": ""
                      },
                      "name": "host-local-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/nodeagent",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "policysync"
                  },
                  {
                      "host_path": {
                          "path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec/nodeagent~uds",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "flexvol-driver-host"
                  },
                  {
                      "name": "calico-node-token-5tqmc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "calico-node-token-5tqmc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:16:34",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:47",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:47",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:52",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://c750a01eab9d5683dedcefe4ee6662e3ac71ac54157a970af1dea0a714defc1a",
                      "image": "dip-controller.lan/calico/node:v3.16.4",
                      "image_id": "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                      "last_state": {},
                      "name": "calico-node",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:16:39"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.68",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://ec7c5cfc69c342d233ac87837b3f7f34c82cc1e3b9a373de841875aa852ff718",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "upgrade-ipam",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://ec7c5cfc69c342d233ac87837b3f7f34c82cc1e3b9a373de841875aa852ff718",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:16:00",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:16:00"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://cac4bab57a2034f756a5aa6751832dfb8b10cecc2b261fdf7d2f8bff9bcfcd36",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "install-cni",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://cac4bab57a2034f756a5aa6751832dfb8b10cecc2b261fdf7d2f8bff9bcfcd36",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:16:02",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:16:01"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://2f5a485d5e4f8250392d1b4a64ce7e7bbb9ab0e19fa065e6f19beecc5b0ee120",
                      "image": "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4",
                      "image_id": "71dabc642faab6767d63fde6fec2bb69b20488c2a81f79e1139b6dfb5bb574ef",
                      "last_state": {},
                      "name": "flexvol-driver",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://2f5a485d5e4f8250392d1b4a64ce7e7bbb9ab0e19fa065e6f19beecc5b0ee120",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:16:05",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:16:05"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.40.24.68",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:15:52"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:11:31",
              "generate_name": "calico-node-",
              "labels": {
                  "controller-revision-hash": "569f57894c",
                  "k8s-app": "calico-node",
                  "pod-template-generation": "1"
              },
              "name": "calico-node-pvlfh",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "calico-node",
                      "uid": "c8ea5daf-04e0-4518-a59b-92cb011ee2c6"
                  }
              ],
              "resource_version": "661",
              "uid": "98cbe27e-ee4b-4c17-b9c9-c62fbd0eccf3"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "DATASTORE_TYPE",
                              "value": "kubernetes"
                          },
                          {
                              "name": "WAIT_FOR_DATASTORE",
                              "value": "true"
                          },
                          {
                              "name": "NODENAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CLUSTER_TYPE",
                              "value": "k8s,bgp"
                          },
                          {
                              "name": "IP",
                              "value": "autodetect"
                          },
                          {
                              "name": "IP_AUTODETECTION_METHOD",
                              "value": "cidr=10.40.24.0/24"
                          },
                          {
                              "name": "FELIX_IPTABLESBACKEND",
                              "value": "NFT"
                          },
                          {
                              "name": "CALICO_IPV4POOL_IPIP",
                              "value": "CrossSubnet"
                          },
                          {
                              "name": "CALICO_IPV4POOL_VXLAN",
                              "value": "Never"
                          },
                          {
                              "name": "FELIX_IPINIPMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_VXLANMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_WIREGUARDMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_IPV4POOL_BLOCK_SIZE",
                              "value": "24"
                          },
                          {
                              "name": "CALICO_DISABLE_FILE_LOGGING",
                              "value": "true"
                          },
                          {
                              "name": "FELIX_DEFAULTENDPOINTTOHOSTACTION",
                              "value": "ACCEPT"
                          },
                          {
                              "name": "FELIX_IPV6SUPPORT",
                              "value": "false"
                          },
                          {
                              "name": "FELIX_LOGSEVERITYSCREEN",
                              "value": "info"
                          },
                          {
                              "name": "FELIX_HEALTHENABLED",
                              "value": "true"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/node:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-live",
                                  "-bird-live"
                              ]
                          },
                          "failure_threshold": 6,
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "calico-node",
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-ready",
                                  "-bird-ready"
                              ]
                          },
                          "failure_threshold": 3,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "requests": {
                              "cpu": "250m"
                          }
                      },
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/var/run/calico",
                              "name": "var-run-calico"
                          },
                          {
                              "mount_path": "/var/lib/calico",
                              "name": "var-lib-calico"
                          },
                          {
                              "mount_path": "/var/run/nodeagent",
                              "name": "policysync"
                          },
                          {
                              "mount_path": "/sys/fs/",
                              "mount_propagation": "Bidirectional",
                              "name": "sysfs"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "init_containers": [
                  {
                      "command": [
                          "/opt/cni/bin/calico-ipam",
                          "-upgrade"
                      ],
                      "env": [
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "upgrade-ipam",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/cni/networks",
                              "name": "host-local-net-dir"
                          },
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "command": [
                          "/opt/cni/bin/install"
                      ],
                      "env": [
                          {
                              "name": "CNI_CONF_NAME",
                              "value": "10-calico.conflist"
                          },
                          {
                              "name": "CNI_NETWORK_CONFIG",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "cni_network_config",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CNI_MTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "SLEEP",
                              "value": "false"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-cni",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/host/etc/cni/net.d",
                              "name": "cni-net-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "image": "calico/pod2daemon-flexvol:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "flexvol-driver",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/driver",
                              "name": "flexvol-driver-host"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "calico-node",
              "service_account_name": "calico-node",
              "termination_grace_period_seconds": 0,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "operator": "Exists"
                  },
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/calico",
                          "type": ""
                      },
                      "name": "var-run-calico"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/calico",
                          "type": ""
                      },
                      "name": "var-lib-calico"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "sysfs"
                  },
                  {
                      "host_path": {
                          "path": "/opt/cni/bin",
                          "type": ""
                      },
                      "name": "cni-bin-dir"
                  },
                  {
                      "host_path": {
                          "path": "/etc/cni/net.d",
                          "type": ""
                      },
                      "name": "cni-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/cni/networks",
                          "type": ""
                      },
                      "name": "host-local-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/nodeagent",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "policysync"
                  },
                  {
                      "host_path": {
                          "path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec/nodeagent~uds",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "flexvol-driver-host"
                  },
                  {
                      "name": "calico-node-token-5tqmc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "calico-node-token-5tqmc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:22",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:22",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:11:31",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://025e5e164a8b149b70396ef5b10aefc54758f3453ca035ff1429525891683282",
                      "image": "dip-controller.lan/calico/node:v3.16.4",
                      "image_id": "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                      "last_state": {},
                      "name": "calico-node",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:16"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://874aed8f86b9cc86808cb656fead3c36ed72caff4040c985b4a7361585052144",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "upgrade-ipam",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://874aed8f86b9cc86808cb656fead3c36ed72caff4040c985b4a7361585052144",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:11:34",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:11:34"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://2709e188938d2cd5e2418f31cb4efd3a55f44e8558e61bc9bf41a9d133e5bf12",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "install-cni",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://2709e188938d2cd5e2418f31cb4efd3a55f44e8558e61bc9bf41a9d133e5bf12",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:11:36",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:11:35"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://017f8d1118dcb6ad6d88ec7596a1d71cf9e141abfef54c521585396c5371e0b9",
                      "image": "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4",
                      "image_id": "71dabc642faab6767d63fde6fec2bb69b20488c2a81f79e1139b6dfb5bb574ef",
                      "last_state": {},
                      "name": "flexvol-driver",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://017f8d1118dcb6ad6d88ec7596a1d71cf9e141abfef54c521585396c5371e0b9",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:11:37",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:11:37"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:11:31"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:14:36",
              "generate_name": "calico-node-",
              "labels": {
                  "controller-revision-hash": "569f57894c",
                  "k8s-app": "calico-node",
                  "pod-template-generation": "1"
              },
              "name": "calico-node-tv688",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "calico-node",
                      "uid": "c8ea5daf-04e0-4518-a59b-92cb011ee2c6"
                  }
              ],
              "resource_version": "1265",
              "uid": "e719d177-a4c6-4c5f-b270-b894dbb5f721"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "env": [
                          {
                              "name": "DATASTORE_TYPE",
                              "value": "kubernetes"
                          },
                          {
                              "name": "WAIT_FOR_DATASTORE",
                              "value": "true"
                          },
                          {
                              "name": "NODENAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CLUSTER_TYPE",
                              "value": "k8s,bgp"
                          },
                          {
                              "name": "IP",
                              "value": "autodetect"
                          },
                          {
                              "name": "IP_AUTODETECTION_METHOD",
                              "value": "cidr=10.40.24.0/24"
                          },
                          {
                              "name": "FELIX_IPTABLESBACKEND",
                              "value": "NFT"
                          },
                          {
                              "name": "CALICO_IPV4POOL_IPIP",
                              "value": "CrossSubnet"
                          },
                          {
                              "name": "CALICO_IPV4POOL_VXLAN",
                              "value": "Never"
                          },
                          {
                              "name": "FELIX_IPINIPMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_VXLANMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "FELIX_WIREGUARDMTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_IPV4POOL_BLOCK_SIZE",
                              "value": "24"
                          },
                          {
                              "name": "CALICO_DISABLE_FILE_LOGGING",
                              "value": "true"
                          },
                          {
                              "name": "FELIX_DEFAULTENDPOINTTOHOSTACTION",
                              "value": "ACCEPT"
                          },
                          {
                              "name": "FELIX_IPV6SUPPORT",
                              "value": "false"
                          },
                          {
                              "name": "FELIX_LOGSEVERITYSCREEN",
                              "value": "info"
                          },
                          {
                              "name": "FELIX_HEALTHENABLED",
                              "value": "true"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/node:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-live",
                                  "-bird-live"
                              ]
                          },
                          "failure_threshold": 6,
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "name": "calico-node",
                      "readiness_probe": {
                          "_exec": {
                              "command": [
                                  "/bin/calico-node",
                                  "-felix-ready",
                                  "-bird-ready"
                              ]
                          },
                          "failure_threshold": 3,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "requests": {
                              "cpu": "250m"
                          }
                      },
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/var/run/calico",
                              "name": "var-run-calico"
                          },
                          {
                              "mount_path": "/var/lib/calico",
                              "name": "var-lib-calico"
                          },
                          {
                              "mount_path": "/var/run/nodeagent",
                              "name": "policysync"
                          },
                          {
                              "mount_path": "/sys/fs/",
                              "mount_propagation": "Bidirectional",
                              "name": "sysfs"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "init_containers": [
                  {
                      "command": [
                          "/opt/cni/bin/calico-ipam",
                          "-upgrade"
                      ],
                      "env": [
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CALICO_NETWORKING_BACKEND",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "calico_backend",
                                      "name": "calico-config"
                                  }
                              }
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "upgrade-ipam",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/cni/networks",
                              "name": "host-local-net-dir"
                          },
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "command": [
                          "/opt/cni/bin/install"
                      ],
                      "env": [
                          {
                              "name": "CNI_CONF_NAME",
                              "value": "10-calico.conflist"
                          },
                          {
                              "name": "CNI_NETWORK_CONFIG",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "cni_network_config",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "KUBERNETES_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "CNI_MTU",
                              "value_from": {
                                  "config_map_key_ref": {
                                      "key": "veth_mtu",
                                      "name": "calico-config"
                                  }
                              }
                          },
                          {
                              "name": "SLEEP",
                              "value": "false"
                          }
                      ],
                      "env_from": [
                          {
                              "config_map_ref": {
                                  "name": "kubernetes-services-endpoint",
                                  "optional": true
                              }
                          }
                      ],
                      "image": "calico/cni:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "install-cni",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/opt/cni/bin",
                              "name": "cni-bin-dir"
                          },
                          {
                              "mount_path": "/host/etc/cni/net.d",
                              "name": "cni-net-dir"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  },
                  {
                      "image": "calico/pod2daemon-flexvol:v3.16.4",
                      "image_pull_policy": "IfNotPresent",
                      "name": "flexvol-driver",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/host/driver",
                              "name": "flexvol-driver-host"
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "calico-node-token-5tqmc",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "node_name": "jdms-sensor1.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "calico-node",
              "service_account_name": "calico-node",
              "termination_grace_period_seconds": 0,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "operator": "Exists"
                  },
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/calico",
                          "type": ""
                      },
                      "name": "var-run-calico"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/calico",
                          "type": ""
                      },
                      "name": "var-lib-calico"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/sys/fs/",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "sysfs"
                  },
                  {
                      "host_path": {
                          "path": "/opt/cni/bin",
                          "type": ""
                      },
                      "name": "cni-bin-dir"
                  },
                  {
                      "host_path": {
                          "path": "/etc/cni/net.d",
                          "type": ""
                      },
                      "name": "cni-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/cni/networks",
                          "type": ""
                      },
                      "name": "host-local-net-dir"
                  },
                  {
                      "host_path": {
                          "path": "/var/run/nodeagent",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "policysync"
                  },
                  {
                      "host_path": {
                          "path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec/nodeagent~uds",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "flexvol-driver-host"
                  },
                  {
                      "name": "calico-node-token-5tqmc",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "calico-node-token-5tqmc"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:15:02",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:22",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:22",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:36",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://26004ebf64a86cd27c907b1aec330efd4d5d700999195b618598ddec5462f1eb",
                      "image": "dip-controller.lan/calico/node:v3.16.4",
                      "image_id": "dip-controller.lan/calico/node@sha256:23072129e5e6926ba90388cfd4f2a3e61447d8383c962be9ca3c1869eb5210d7",
                      "last_state": {},
                      "name": "calico-node",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:15:07"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "init_container_statuses": [
                  {
                      "container_id": "cri-o://094418a54ab9c4b5e0d7b67a66269d774e9450b3b51be652cfb603fa7a15987e",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "upgrade-ipam",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://094418a54ab9c4b5e0d7b67a66269d774e9450b3b51be652cfb603fa7a15987e",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:14:45",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:14:45"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://5c7335ea1e631192738f89f103201d53ca5df125d3018499e65e48b60a5189b7",
                      "image": "dip-controller.lan/calico/cni:v3.16.4",
                      "image_id": "70c17dd4d3dac1072dd79470eb0fc1fa470de0cf916a16f7035d27f20cf1fdcd",
                      "last_state": {},
                      "name": "install-cni",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://5c7335ea1e631192738f89f103201d53ca5df125d3018499e65e48b60a5189b7",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:14:46",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:14:45"
                          }
                      }
                  },
                  {
                      "container_id": "cri-o://d477fc5b6f9f52752724fc40551cee655eab76ce231a58689c4f5c5b9a606dad",
                      "image": "dip-controller.lan/calico/pod2daemon-flexvol:v3.16.4",
                      "image_id": "dip-controller.lan/calico/pod2daemon-flexvol@sha256:f752b97e1acdbad1577035cbe9ea7571f0633eb5087d6ae20edf03c0c7eafb58",
                      "last_state": {},
                      "name": "flexvol-driver",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "terminated": {
                              "container_id": "cri-o://d477fc5b6f9f52752724fc40551cee655eab76ce231a58689c4f5c5b9a606dad",
                              "exit_code": 0,
                              "finished_at": "2021-04-26 16:15:02",
                              "reason": "Completed",
                              "started_at": "2021-04-26 16:15:02"
                          }
                      }
                  }
              ],
              "phase": "Running",
              "pod_ip": "10.40.24.67",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:14:36"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.4/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.4/32"
              },
              "creation_timestamp": "2021-04-26 16:12:23",
              "generate_name": "coredns-757ff46bc-",
              "labels": {
                  "k8s-app": "kube-dns",
                  "pod-template-hash": "757ff46bc"
              },
              "name": "coredns-757ff46bc-2j2mb",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "coredns-757ff46bc",
                      "uid": "21ec49b4-d5c2-49ee-8a4e-8c4d1b5be279"
                  }
              ],
              "resource_version": "793",
              "uid": "6d57a6f6-f73b-48db-8f00-f3cbf775c015"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "-conf",
                          "/etc/coredns/Corefile"
                      ],
                      "image": "dip-controller.lan/coredns:1.7.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 5,
                          "http_get": {
                              "path": "/health",
                              "port": 8080,
                              "scheme": "HTTP"
                          },
                          "initial_delay_seconds": 60,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "name": "coredns",
                      "ports": [
                          {
                              "container_port": 53,
                              "name": "dns",
                              "protocol": "UDP"
                          },
                          {
                              "container_port": 53,
                              "name": "dns-tcp",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9153,
                              "name": "metrics",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/ready",
                              "port": 8181,
                              "scheme": "HTTP"
                          },
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "limits": {
                              "memory": "170Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "70Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_BIND_SERVICE"
                              ],
                              "drop": [
                                  "all"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/coredns",
                              "name": "config-volume",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "coredns-token-xf926",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "Default",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 2000000000,
              "priority_class_name": "system-cluster-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "coredns",
              "service_account_name": "coredns",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/control-plane"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "Corefile",
                                  "path": "Corefile"
                              }
                          ],
                          "name": "coredns"
                      },
                      "name": "config-volume"
                  },
                  {
                      "name": "coredns-token-xf926",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "coredns-token-xf926"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:23",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:28",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:28",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:23",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://e6c1507ffd93bb597f4107d87aee19f02cb5a5ee3f578c5250c639886fa44921",
                      "image": "dip-controller.lan/coredns:1.7.0",
                      "image_id": "dip-controller.lan/coredns@sha256:242d440e3192ffbcecd40e9536891f4d9be46a650363f3a004497c2070f96f5a",
                      "last_state": {},
                      "name": "coredns",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:24"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.4",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:12:23"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.5/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.5/32"
              },
              "creation_timestamp": "2021-04-26 16:12:23",
              "generate_name": "coredns-757ff46bc-",
              "labels": {
                  "k8s-app": "kube-dns",
                  "pod-template-hash": "757ff46bc"
              },
              "name": "coredns-757ff46bc-bb446",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "coredns-757ff46bc",
                      "uid": "21ec49b4-d5c2-49ee-8a4e-8c4d1b5be279"
                  }
              ],
              "resource_version": "809",
              "uid": "28f493b6-69da-435c-8b81-f568bf9afd34"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "-conf",
                          "/etc/coredns/Corefile"
                      ],
                      "image": "dip-controller.lan/coredns:1.7.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 5,
                          "http_get": {
                              "path": "/health",
                              "port": 8080,
                              "scheme": "HTTP"
                          },
                          "initial_delay_seconds": 60,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 5
                      },
                      "name": "coredns",
                      "ports": [
                          {
                              "container_port": 53,
                              "name": "dns",
                              "protocol": "UDP"
                          },
                          {
                              "container_port": 53,
                              "name": "dns-tcp",
                              "protocol": "TCP"
                          },
                          {
                              "container_port": 9153,
                              "name": "metrics",
                              "protocol": "TCP"
                          }
                      ],
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "path": "/ready",
                              "port": 8181,
                              "scheme": "HTTP"
                          },
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 1
                      },
                      "resources": {
                          "limits": {
                              "memory": "170Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "70Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_BIND_SERVICE"
                              ],
                              "drop": [
                                  "all"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/coredns",
                              "name": "config-volume",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "coredns-token-xf926",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "Default",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "role": "server"
              },
              "priority": 2000000000,
              "priority_class_name": "system-cluster-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "coredns",
              "service_account_name": "coredns",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/control-plane"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "items": [
                              {
                                  "key": "Corefile",
                                  "path": "Corefile"
                              }
                          ],
                          "name": "coredns"
                      },
                      "name": "config-volume"
                  },
                  {
                      "name": "coredns-token-xf926",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "coredns-token-xf926"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:23",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:29",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:29",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:23",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://df0e9d6aad3ad514dc6711a973cc557b056efbbb473b56e8d4a607bfde6fe7b3",
                      "image": "dip-controller.lan/coredns:1.7.0",
                      "image_id": "dip-controller.lan/coredns@sha256:242d440e3192ffbcecd40e9536891f4d9be46a650363f3a004497c2070f96f5a",
                      "last_state": {},
                      "name": "coredns",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:24"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.5",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:12:23"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubeadm.kubernetes.io/etcd.advertise-client-urls": "https://10.40.24.65:2379",
                  "kubernetes.io/config.hash": "ad569ed1e17ed405e7ae98b8c9a005be",
                  "kubernetes.io/config.mirror": "ad569ed1e17ed405e7ae98b8c9a005be",
                  "kubernetes.io/config.seen": "2021-04-26T16:11:22.087259986Z",
                  "kubernetes.io/config.source": "file"
              },
              "creation_timestamp": "2021-04-26 16:11:28",
              "labels": {
                  "component": "etcd",
                  "tier": "control-plane"
              },
              "name": "etcd-jdms-server1.lan",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "v1",
                      "controller": true,
                      "kind": "Node",
                      "name": "jdms-server1.lan",
                      "uid": "1b626b9c-d7c9-4016-bc1e-43add0fcedae"
                  }
              ],
              "resource_version": "900",
              "uid": "08302c97-6cd5-4f2e-a815-8d1dcc18631f"
          },
          "spec": {
              "containers": [
                  {
                      "command": [
                          "etcd",
                          "--advertise-client-urls=https://10.40.24.65:2379",
                          "--cert-file=/etc/kubernetes/pki/etcd/server.crt",
                          "--client-cert-auth=true",
                          "--data-dir=/var/lib/etcd",
                          "--initial-advertise-peer-urls=https://10.40.24.65:2380",
                          "--initial-cluster=jdms-server1.lan=https://10.40.24.65:2380",
                          "--key-file=/etc/kubernetes/pki/etcd/server.key",
                          "--listen-client-urls=https://127.0.0.1:2379,https://10.40.24.65:2379",
                          "--listen-metrics-urls=http://127.0.0.1:2381",
                          "--listen-peer-urls=https://10.40.24.65:2380",
                          "--name=jdms-server1.lan",
                          "--peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt",
                          "--peer-client-cert-auth=true",
                          "--peer-key-file=/etc/kubernetes/pki/etcd/peer.key",
                          "--peer-trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt",
                          "--snapshot-count=10000",
                          "--trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt"
                      ],
                      "image": "dip-controller.lan/etcd:3.4.13-0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 8,
                          "http_get": {
                              "host": "127.0.0.1",
                              "path": "/health",
                              "port": 2381,
                              "scheme": "HTTP"
                          },
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 15
                      },
                      "name": "etcd",
                      "resources": {
                          "requests": {
                              "cpu": "100m",
                              "ephemeral-storage": "100Mi",
                              "memory": "100Mi"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/etcd",
                              "name": "etcd-data"
                          },
                          {
                              "mount_path": "/etc/kubernetes/pki/etcd",
                              "name": "etcd-certs"
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/etc/kubernetes/pki/etcd",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "etcd-certs"
                  },
                  {
                      "host_path": {
                          "path": "/var/lib/etcd",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "etcd-data"
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:17",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:17",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://3a5fc7035e955fdfcfe160d5bc7cc4953c4502783a1214e5f0f7f21b8457ad04",
                      "image": "dip-controller.lan/etcd:3.4.13-0",
                      "image_id": "0369cf4303ffdb467dc219990960a9baa8512a54b0ad9283eaf55bd6c0adb934",
                      "last_state": {},
                      "name": "etcd",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:11:11"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:12:11"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubeadm.kubernetes.io/kube-apiserver.advertise-address.endpoint": "10.40.24.65:6443",
                  "kubernetes.io/config.hash": "b024ed5af888aec9d1fcb79f29424fb6",
                  "kubernetes.io/config.mirror": "b024ed5af888aec9d1fcb79f29424fb6",
                  "kubernetes.io/config.seen": "2021-04-26T16:11:22.087265406Z",
                  "kubernetes.io/config.source": "file"
              },
              "creation_timestamp": "2021-04-26 16:11:28",
              "labels": {
                  "component": "kube-apiserver",
                  "tier": "control-plane"
              },
              "name": "kube-apiserver-jdms-server1.lan",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "v1",
                      "controller": true,
                      "kind": "Node",
                      "name": "jdms-server1.lan",
                      "uid": "1b626b9c-d7c9-4016-bc1e-43add0fcedae"
                  }
              ],
              "resource_version": "647",
              "uid": "0c8a7eee-5b18-4541-839a-863ae7300fc8"
          },
          "spec": {
              "containers": [
                  {
                      "command": [
                          "kube-apiserver",
                          "--advertise-address=10.40.24.65",
                          "--allow-privileged=true",
                          "--authorization-mode=Node,RBAC",
                          "--client-ca-file=/etc/kubernetes/pki/ca.crt",
                          "--enable-admission-plugins=NodeRestriction",
                          "--enable-bootstrap-token-auth=true",
                          "--etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt",
                          "--etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt",
                          "--etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key",
                          "--etcd-servers=https://127.0.0.1:2379",
                          "--insecure-port=0",
                          "--kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt",
                          "--kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key",
                          "--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname",
                          "--proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt",
                          "--proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key",
                          "--requestheader-allowed-names=front-proxy-client",
                          "--requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt",
                          "--requestheader-extra-headers-prefix=X-Remote-Extra-",
                          "--requestheader-group-headers=X-Remote-Group",
                          "--requestheader-username-headers=X-Remote-User",
                          "--secure-port=6443",
                          "--service-account-issuer=https://kubernetes.default.svc.cluster.local",
                          "--service-account-key-file=/etc/kubernetes/pki/sa.pub",
                          "--service-account-signing-key-file=/etc/kubernetes/pki/sa.key",
                          "--service-cluster-ip-range=10.233.64.0/18",
                          "--tls-cert-file=/etc/kubernetes/pki/apiserver.crt",
                          "--tls-private-key-file=/etc/kubernetes/pki/apiserver.key"
                      ],
                      "image": "dip-controller.lan/kube-apiserver:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 8,
                          "http_get": {
                              "host": "10.40.24.65",
                              "path": "/livez",
                              "port": 6443,
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 15
                      },
                      "name": "kube-apiserver",
                      "readiness_probe": {
                          "failure_threshold": 3,
                          "http_get": {
                              "host": "10.40.24.65",
                              "path": "/readyz",
                              "port": 6443,
                              "scheme": "HTTPS"
                          },
                          "period_seconds": 1,
                          "success_threshold": 1,
                          "timeout_seconds": 15
                      },
                      "resources": {
                          "requests": {
                              "cpu": "250m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/ssl/certs",
                              "name": "ca-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/etc/pki",
                              "name": "etc-pki",
                              "read_only": true
                          },
                          {
                              "mount_path": "/etc/kubernetes/pki",
                              "name": "k8s-certs",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/etc/ssl/certs",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "ca-certs"
                  },
                  {
                      "host_path": {
                          "path": "/etc/pki",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "etc-pki"
                  },
                  {
                      "host_path": {
                          "path": "/etc/kubernetes/pki",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "k8s-certs"
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:17",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:17",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://603fe08546310253411a2224de29dd4d5098e58e75596fb935502afdb8f544c4",
                      "image": "dip-controller.lan/kube-apiserver:v1.20.0",
                      "image_id": "ca9843d3b545457f24b012d6d579ba85f132f2406aa171ad84d53caa55e5de99",
                      "last_state": {},
                      "name": "kube-apiserver",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:11:11"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:12:11"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubernetes.io/config.hash": "1fbab963f041af55c607d5cbca9b2b4c",
                  "kubernetes.io/config.mirror": "1fbab963f041af55c607d5cbca9b2b4c",
                  "kubernetes.io/config.seen": "2021-04-26T16:11:22.087267390Z",
                  "kubernetes.io/config.source": "file"
              },
              "creation_timestamp": "2021-04-26 16:11:28",
              "labels": {
                  "component": "kube-controller-manager",
                  "tier": "control-plane"
              },
              "name": "kube-controller-manager-jdms-server1.lan",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "v1",
                      "controller": true,
                      "kind": "Node",
                      "name": "jdms-server1.lan",
                      "uid": "1b626b9c-d7c9-4016-bc1e-43add0fcedae"
                  }
              ],
              "resource_version": "591",
              "uid": "d2dbdf07-5d30-49c3-8c74-2bcf3b775304"
          },
          "spec": {
              "containers": [
                  {
                      "command": [
                          "kube-controller-manager",
                          "--allocate-node-cidrs=true",
                          "--authentication-kubeconfig=/etc/kubernetes/controller-manager.conf",
                          "--authorization-kubeconfig=/etc/kubernetes/controller-manager.conf",
                          "--bind-address=127.0.0.1",
                          "--client-ca-file=/etc/kubernetes/pki/ca.crt",
                          "--cluster-cidr=10.233.0.0/18",
                          "--cluster-name=kubernetes",
                          "--cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt",
                          "--cluster-signing-key-file=/etc/kubernetes/pki/ca.key",
                          "--controllers=*,bootstrapsigner,tokencleaner",
                          "--kubeconfig=/etc/kubernetes/controller-manager.conf",
                          "--leader-elect=true",
                          "--node-cidr-mask-size=24",
                          "--port=0",
                          "--requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt",
                          "--root-ca-file=/etc/kubernetes/pki/ca.crt",
                          "--service-account-private-key-file=/etc/kubernetes/pki/sa.key",
                          "--service-cluster-ip-range=10.233.64.0/18",
                          "--use-service-account-credentials=true"
                      ],
                      "image": "dip-controller.lan/kube-controller-manager:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 8,
                          "http_get": {
                              "host": "127.0.0.1",
                              "path": "/healthz",
                              "port": 10257,
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 15
                      },
                      "name": "kube-controller-manager",
                      "resources": {
                          "requests": {
                              "cpu": "200m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/ssl/certs",
                              "name": "ca-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/etc/pki",
                              "name": "etc-pki",
                              "read_only": true
                          },
                          {
                              "mount_path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec",
                              "name": "flexvolume-dir"
                          },
                          {
                              "mount_path": "/etc/kubernetes/pki",
                              "name": "k8s-certs",
                              "read_only": true
                          },
                          {
                              "mount_path": "/etc/kubernetes/controller-manager.conf",
                              "name": "kubeconfig",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/etc/ssl/certs",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "ca-certs"
                  },
                  {
                      "host_path": {
                          "path": "/etc/pki",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "etc-pki"
                  },
                  {
                      "host_path": {
                          "path": "/usr/libexec/kubernetes/kubelet-plugins/volume/exec",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "flexvolume-dir"
                  },
                  {
                      "host_path": {
                          "path": "/etc/kubernetes/pki",
                          "type": "DirectoryOrCreate"
                      },
                      "name": "k8s-certs"
                  },
                  {
                      "host_path": {
                          "path": "/etc/kubernetes/controller-manager.conf",
                          "type": "FileOrCreate"
                      },
                      "name": "kubeconfig"
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:12",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:12",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:11",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://fc8193162f03de38a13af68c11cbc8054ba3610a4b79829d49c20dd61b7b45db",
                      "image": "dip-controller.lan/kube-controller-manager:v1.20.0",
                      "image_id": "b9fa1895dcaa6d3dd241d6d9340e939ca30fc0946464ec9f205a8cbe738a8080",
                      "last_state": {},
                      "name": "kube-controller-manager",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:11:11"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:12:11"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:11:31",
              "generate_name": "kube-proxy-",
              "labels": {
                  "controller-revision-hash": "78659b8b69",
                  "k8s-app": "kube-proxy",
                  "pod-template-generation": "1"
              },
              "name": "kube-proxy-m4l6s",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "kube-proxy",
                      "uid": "05665ea2-076b-43d3-9a4d-d43382204ccf"
                  }
              ],
              "resource_version": "585",
              "uid": "af11391d-9700-4ec7-9b8b-a94841fd5461"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "command": [
                          "/usr/local/bin/kube-proxy",
                          "--config=/var/lib/kube-proxy/config.conf",
                          "--hostname-override=$(NODE_NAME)"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "name": "kube-proxy",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/kube-proxy",
                              "name": "kube-proxy"
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "kube-proxy-token-6pgn4",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "kube-proxy",
              "service_account_name": "kube-proxy",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "kube-proxy"
                      },
                      "name": "kube-proxy"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "name": "kube-proxy-token-6pgn4",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "kube-proxy-token-6pgn4"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:11:31",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:11:32",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:11:32",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:11:31",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://ed994e299930e094a724551c82baf9b08815e55b113478537c41e0fb3295fb80",
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_id": "10cc881966cfd9287656c2fce1f144625602653d1e8b011487a7a71feb100bdc",
                      "last_state": {},
                      "name": "kube-proxy",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:11:32"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:11:31"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:15:52",
              "generate_name": "kube-proxy-",
              "labels": {
                  "controller-revision-hash": "78659b8b69",
                  "k8s-app": "kube-proxy",
                  "pod-template-generation": "1"
              },
              "name": "kube-proxy-m9294",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "kube-proxy",
                      "uid": "05665ea2-076b-43d3-9a4d-d43382204ccf"
                  }
              ],
              "resource_version": "1445",
              "uid": "53504410-e3d0-4c70-b615-fc72db8c1a69"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "command": [
                          "/usr/local/bin/kube-proxy",
                          "--config=/var/lib/kube-proxy/config.conf",
                          "--hostname-override=$(NODE_NAME)"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "name": "kube-proxy",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/kube-proxy",
                              "name": "kube-proxy"
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "kube-proxy-token-6pgn4",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor2.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "kube-proxy",
              "service_account_name": "kube-proxy",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "kube-proxy"
                      },
                      "name": "kube-proxy"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "name": "kube-proxy-token-6pgn4",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "kube-proxy-token-6pgn4"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:15:52",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:57",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:57",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:52",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://082a16980acb330b52f65680c311bffc76d9a99beefb377ae23f6df3f8db0729",
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_id": "10cc881966cfd9287656c2fce1f144625602653d1e8b011487a7a71feb100bdc",
                      "last_state": {},
                      "name": "kube-proxy",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:15:57"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.68",
              "phase": "Running",
              "pod_ip": "10.40.24.68",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:15:52"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:14:36",
              "generate_name": "kube-proxy-",
              "labels": {
                  "controller-revision-hash": "78659b8b69",
                  "k8s-app": "kube-proxy",
                  "pod-template-generation": "1"
              },
              "name": "kube-proxy-t2hlk",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "kube-proxy",
                      "uid": "05665ea2-076b-43d3-9a4d-d43382204ccf"
                  }
              ],
              "resource_version": "1208",
              "uid": "7317f07d-54ff-4033-bf48-5fcf72d1a4b4"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "command": [
                          "/usr/local/bin/kube-proxy",
                          "--config=/var/lib/kube-proxy/config.conf",
                          "--hostname-override=$(NODE_NAME)"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "name": "kube-proxy",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/kube-proxy",
                              "name": "kube-proxy"
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "kube-proxy-token-6pgn4",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor1.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "kube-proxy",
              "service_account_name": "kube-proxy",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "kube-proxy"
                      },
                      "name": "kube-proxy"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "name": "kube-proxy-token-6pgn4",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "kube-proxy-token-6pgn4"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:14:36",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:41",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:41",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:14:36",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://5de9afbe37f72fc43ef1976c6b98853cb9add7a16830b20ae79d8ff8b6a17927",
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_id": "10cc881966cfd9287656c2fce1f144625602653d1e8b011487a7a71feb100bdc",
                      "last_state": {},
                      "name": "kube-proxy",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:14:41"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "phase": "Running",
              "pod_ip": "10.40.24.67",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:14:36"
          }
      },
      {
          "metadata": {
              "creation_timestamp": "2021-04-26 16:13:19",
              "generate_name": "kube-proxy-",
              "labels": {
                  "controller-revision-hash": "78659b8b69",
                  "k8s-app": "kube-proxy",
                  "pod-template-generation": "1"
              },
              "name": "kube-proxy-x4l4q",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "kube-proxy",
                      "uid": "05665ea2-076b-43d3-9a4d-d43382204ccf"
                  }
              ],
              "resource_version": "1011",
              "uid": "98ddb348-fab3-4985-b551-f9d0da59d996"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "command": [
                          "/usr/local/bin/kube-proxy",
                          "--config=/var/lib/kube-proxy/config.conf",
                          "--hostname-override=$(NODE_NAME)"
                      ],
                      "env": [
                          {
                              "name": "NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          }
                      ],
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "name": "kube-proxy",
                      "resources": {},
                      "security_context": {
                          "privileged": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/lib/kube-proxy",
                              "name": "kube-proxy"
                          },
                          {
                              "mount_path": "/run/xtables.lock",
                              "name": "xtables-lock"
                          },
                          {
                              "mount_path": "/lib/modules",
                              "name": "lib-modules",
                              "read_only": true
                          },
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "kube-proxy-token-6pgn4",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "kubernetes.io/os": "linux"
              },
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "kube-proxy",
              "service_account_name": "kube-proxy",
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "key": "CriticalAddonsOnly",
                      "operator": "Exists"
                  },
                  {
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "config_map": {
                          "default_mode": 420,
                          "name": "kube-proxy"
                      },
                      "name": "kube-proxy"
                  },
                  {
                      "host_path": {
                          "path": "/run/xtables.lock",
                          "type": "FileOrCreate"
                      },
                      "name": "xtables-lock"
                  },
                  {
                      "host_path": {
                          "path": "/lib/modules",
                          "type": ""
                      },
                      "name": "lib-modules"
                  },
                  {
                      "name": "kube-proxy-token-6pgn4",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "kube-proxy-token-6pgn4"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:13:19",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:24",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:24",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:19",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://f1fb0c4f24bc0002c34cc8c78828e5d6220239944645126e9c28c850c4716216",
                      "image": "dip-controller.lan/kube-proxy:v1.20.0",
                      "image_id": "10cc881966cfd9287656c2fce1f144625602653d1e8b011487a7a71feb100bdc",
                      "last_state": {},
                      "name": "kube-proxy",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:13:23"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.40.24.66",
              "qos_class": "BestEffort",
              "start_time": "2021-04-26 16:13:19"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "kubernetes.io/config.hash": "8150ead55e0ef69b94c0eb186b5290de",
                  "kubernetes.io/config.mirror": "8150ead55e0ef69b94c0eb186b5290de",
                  "kubernetes.io/config.seen": "2021-04-26T16:11:22.087269153Z",
                  "kubernetes.io/config.source": "file"
              },
              "creation_timestamp": "2021-04-26 16:11:28",
              "labels": {
                  "component": "kube-scheduler",
                  "tier": "control-plane"
              },
              "name": "kube-scheduler-jdms-server1.lan",
              "namespace": "kube-system",
              "owner_references": [
                  {
                      "api_version": "v1",
                      "controller": true,
                      "kind": "Node",
                      "name": "jdms-server1.lan",
                      "uid": "1b626b9c-d7c9-4016-bc1e-43add0fcedae"
                  }
              ],
              "resource_version": "633",
              "uid": "49e0cc31-df7e-45bc-889e-e8a5cb1a6043"
          },
          "spec": {
              "containers": [
                  {
                      "command": [
                          "kube-scheduler",
                          "--authentication-kubeconfig=/etc/kubernetes/scheduler.conf",
                          "--authorization-kubeconfig=/etc/kubernetes/scheduler.conf",
                          "--bind-address=127.0.0.1",
                          "--kubeconfig=/etc/kubernetes/scheduler.conf",
                          "--leader-elect=true",
                          "--port=0"
                      ],
                      "image": "dip-controller.lan/kube-scheduler:v1.20.0",
                      "image_pull_policy": "IfNotPresent",
                      "liveness_probe": {
                          "failure_threshold": 8,
                          "http_get": {
                              "host": "127.0.0.1",
                              "path": "/healthz",
                              "port": 10259,
                              "scheme": "HTTPS"
                          },
                          "initial_delay_seconds": 10,
                          "period_seconds": 10,
                          "success_threshold": 1,
                          "timeout_seconds": 15
                      },
                      "name": "kube-scheduler",
                      "resources": {
                          "requests": {
                              "cpu": "100m"
                          }
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/etc/kubernetes/scheduler.conf",
                              "name": "kubeconfig",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "priority": 2000001000,
              "priority_class_name": "system-node-critical",
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "termination_grace_period_seconds": 30,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "host_path": {
                          "path": "/etc/kubernetes/scheduler.conf",
                          "type": "FileOrCreate"
                      },
                      "name": "kubeconfig"
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:11:28",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:13",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:13",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:11:28",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://2b0f5a6d9f247ad227c1c822910329d60709c3de5fdcfcb55e879ab3385f2ea4",
                      "image": "dip-controller.lan/kube-scheduler:v1.20.0",
                      "image_id": "3138b6e3d471224fd516f758f3b53309219bcb6824e07686b3cd60d78012c899",
                      "last_state": {},
                      "name": "kube-scheduler",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:11:11"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Burstable",
              "start_time": "2021-04-26 16:11:28"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "cni.projectcalico.org/podIP": "10.233.20.6/32",
                  "cni.projectcalico.org/podIPs": "10.233.20.6/32",
                  "prometheus.io/port": "7472",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:12:24",
              "generate_name": "controller-fb659dc8-",
              "labels": {
                  "app": "metallb",
                  "component": "controller",
                  "pod-template-hash": "fb659dc8"
              },
              "name": "controller-fb659dc8-v9bmh",
              "namespace": "metallb-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "ReplicaSet",
                      "name": "controller-fb659dc8",
                      "uid": "d7b0ca8a-416b-4c10-85ed-0ff7e4ac2961"
                  }
              ],
              "resource_version": "785",
              "uid": "3228c1fd-3d53-4cf1-bcfc-079dcd89069c"
          },
          "spec": {
              "containers": [
                  {
                      "args": [
                          "--port=7472",
                          "--config=config"
                      ],
                      "image": "metallb/controller:v0.10.2",
                      "image_pull_policy": "Always",
                      "name": "controller",
                      "ports": [
                          {
                              "container_port": 7472,
                              "name": "monitoring",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "drop": [
                                  "all"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "controller-token-4m2ns",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "beta.kubernetes.io/os": "linux"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {
                  "run_as_non_root": true,
                  "run_as_user": 65534
              },
              "service_account": "controller",
              "service_account_name": "controller",
              "termination_grace_period_seconds": 0,
              "tolerations": [
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists",
                      "toleration_seconds": 300
                  }
              ],
              "volumes": [
                  {
                      "name": "controller-token-4m2ns",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "controller-token-4m2ns"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:24",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:24",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://6441af1214929e283fcc53fe53ea492529ed197ccc45cc44b01c823d3b3027ac",
                      "image": "dip-controller.lan/metallb/controller:v0.10.2",
                      "image_id": "dip-controller.lan/metallb/controller@sha256:c8b0da00dd83db99bf00fb7088c33e7aaf52fa679f962610f1fe5ed173f66b77",
                      "last_state": {},
                      "name": "controller",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:27"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.233.20.6",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:12:24"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "prometheus.io/port": "7472",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:15:00",
              "generate_name": "speaker-",
              "labels": {
                  "app": "metallb",
                  "component": "speaker",
                  "controller-revision-hash": "6d67b94fd8",
                  "pod-template-generation": "1"
              },
              "name": "speaker-5p7p6",
              "namespace": "metallb-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "speaker",
                      "uid": "7a0e2364-7888-449a-971c-145794034331"
                  }
              ],
              "resource_version": "1243",
              "uid": "2f1511d0-7a1d-4561-b356-a333f938e6c8"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "args": [
                          "--port=7472",
                          "--config=config"
                      ],
                      "env": [
                          {
                              "name": "METALLB_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_HOST",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.hostIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_BIND_ADDR",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_LABELS",
                              "value": "app=metallb,component=speaker"
                          },
                          {
                              "name": "METALLB_ML_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_SECRET_KEY",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "secretkey",
                                      "name": "memberlist"
                                  }
                              }
                          }
                      ],
                      "image": "metallb/speaker:v0.10.2",
                      "image_pull_policy": "Always",
                      "name": "speaker",
                      "ports": [
                          {
                              "container_port": 7472,
                              "host_port": 7472,
                              "name": "monitoring",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_ADMIN"
                              ],
                              "drop": [
                                  "ALL"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "speaker-token-62bwt",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor1.lan",
              "node_selector": {
                  "beta.kubernetes.io/os": "linux"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "speaker",
              "service_account_name": "speaker",
              "termination_grace_period_seconds": 2,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "name": "speaker-token-62bwt",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "speaker-token-62bwt"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:15:00",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:09",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:09",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:15:00",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://a587f52a7145b781430a962910a18b3198c805e048225649b79355f8ec6992c6",
                      "image": "dip-controller.lan/metallb/speaker:v0.10.2",
                      "image_id": "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                      "last_state": {},
                      "name": "speaker",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:15:09"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.67",
              "phase": "Running",
              "pod_ip": "10.40.24.67",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:15:00"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "prometheus.io/port": "7472",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:13:44",
              "generate_name": "speaker-",
              "labels": {
                  "app": "metallb",
                  "component": "speaker",
                  "controller-revision-hash": "6d67b94fd8",
                  "pod-template-generation": "1"
              },
              "name": "speaker-9f4mr",
              "namespace": "metallb-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "speaker",
                      "uid": "7a0e2364-7888-449a-971c-145794034331"
                  }
              ],
              "resource_version": "1042",
              "uid": "3caee33e-a01f-4a28-909c-c0c2e83f5fcd"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "args": [
                          "--port=7472",
                          "--config=config"
                      ],
                      "env": [
                          {
                              "name": "METALLB_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_HOST",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.hostIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_BIND_ADDR",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_LABELS",
                              "value": "app=metallb,component=speaker"
                          },
                          {
                              "name": "METALLB_ML_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_SECRET_KEY",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "secretkey",
                                      "name": "memberlist"
                                  }
                              }
                          }
                      ],
                      "image": "metallb/speaker:v0.10.2",
                      "image_pull_policy": "Always",
                      "name": "speaker",
                      "ports": [
                          {
                              "container_port": 7472,
                              "host_port": 7472,
                              "name": "monitoring",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_ADMIN"
                              ],
                              "drop": [
                                  "ALL"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "speaker-token-62bwt",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server2.lan",
              "node_selector": {
                  "beta.kubernetes.io/os": "linux"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "speaker",
              "service_account_name": "speaker",
              "termination_grace_period_seconds": 2,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "name": "speaker-token-62bwt",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "speaker-token-62bwt"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:13:44",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:53",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:53",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:13:44",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://39569235ab579d58d74cdc71af1289b306de75e2e33c3993390be883f2d04697",
                      "image": "dip-controller.lan/metallb/speaker:v0.10.2",
                      "image_id": "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                      "last_state": {},
                      "name": "speaker",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:13:52"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.66",
              "phase": "Running",
              "pod_ip": "10.40.24.66",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:13:44"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "prometheus.io/port": "7472",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:16:34",
              "generate_name": "speaker-",
              "labels": {
                  "app": "metallb",
                  "component": "speaker",
                  "controller-revision-hash": "6d67b94fd8",
                  "pod-template-generation": "1"
              },
              "name": "speaker-9tv2q",
              "namespace": "metallb-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "speaker",
                      "uid": "7a0e2364-7888-449a-971c-145794034331"
                  }
              ],
              "resource_version": "1472",
              "uid": "0808a4de-435e-4c12-b85e-d0552f700faf"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-sensor2.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "args": [
                          "--port=7472",
                          "--config=config"
                      ],
                      "env": [
                          {
                              "name": "METALLB_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_HOST",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.hostIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_BIND_ADDR",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_LABELS",
                              "value": "app=metallb,component=speaker"
                          },
                          {
                              "name": "METALLB_ML_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_SECRET_KEY",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "secretkey",
                                      "name": "memberlist"
                                  }
                              }
                          }
                      ],
                      "image": "metallb/speaker:v0.10.2",
                      "image_pull_policy": "Always",
                      "name": "speaker",
                      "ports": [
                          {
                              "container_port": 7472,
                              "host_port": 7472,
                              "name": "monitoring",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_ADMIN"
                              ],
                              "drop": [
                                  "ALL"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "speaker-token-62bwt",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-sensor2.lan",
              "node_selector": {
                  "beta.kubernetes.io/os": "linux"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "speaker",
              "service_account_name": "speaker",
              "termination_grace_period_seconds": 2,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "name": "speaker-token-62bwt",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "speaker-token-62bwt"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:16:34",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:41",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:41",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:16:34",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://7274fb385c89136557fb3e83515ad02976c4b32feb666def0b59acfb46b32434",
                      "image": "dip-controller.lan/metallb/speaker:v0.10.2",
                      "image_id": "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                      "last_state": {},
                      "name": "speaker",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:16:41"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.68",
              "phase": "Running",
              "pod_ip": "10.40.24.68",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:16:34"
          }
      },
      {
          "metadata": {
              "annotations": {
                  "prometheus.io/port": "7472",
                  "prometheus.io/scrape": "true"
              },
              "creation_timestamp": "2021-04-26 16:12:24",
              "generate_name": "speaker-",
              "labels": {
                  "app": "metallb",
                  "component": "speaker",
                  "controller-revision-hash": "6d67b94fd8",
                  "pod-template-generation": "1"
              },
              "name": "speaker-ld7kg",
              "namespace": "metallb-system",
              "owner_references": [
                  {
                      "api_version": "apps/v1",
                      "block_owner_deletion": true,
                      "controller": true,
                      "kind": "DaemonSet",
                      "name": "speaker",
                      "uid": "7a0e2364-7888-449a-971c-145794034331"
                  }
              ],
              "resource_version": "788",
              "uid": "1376de55-302e-4b2c-bd2f-4af0c4561cfc"
          },
          "spec": {
              "affinity": {
                  "node_affinity": {
                      "required_during_scheduling_ignored_during_execution": {
                          "node_selector_terms": [
                              {
                                  "match_fields": [
                                      {
                                          "key": "metadata.name",
                                          "operator": "In",
                                          "values": [
                                              "jdms-server1.lan"
                                          ]
                                      }
                                  ]
                              }
                          ]
                      }
                  }
              },
              "containers": [
                  {
                      "args": [
                          "--port=7472",
                          "--config=config"
                      ],
                      "env": [
                          {
                              "name": "METALLB_NODE_NAME",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "spec.nodeName"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_HOST",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.hostIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_BIND_ADDR",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "status.podIP"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_LABELS",
                              "value": "app=metallb,component=speaker"
                          },
                          {
                              "name": "METALLB_ML_NAMESPACE",
                              "value_from": {
                                  "field_ref": {
                                      "api_version": "v1",
                                      "field_path": "metadata.namespace"
                                  }
                              }
                          },
                          {
                              "name": "METALLB_ML_SECRET_KEY",
                              "value_from": {
                                  "secret_key_ref": {
                                      "key": "secretkey",
                                      "name": "memberlist"
                                  }
                              }
                          }
                      ],
                      "image": "metallb/speaker:v0.10.2",
                      "image_pull_policy": "Always",
                      "name": "speaker",
                      "ports": [
                          {
                              "container_port": 7472,
                              "host_port": 7472,
                              "name": "monitoring",
                              "protocol": "TCP"
                          }
                      ],
                      "resources": {
                          "limits": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          },
                          "requests": {
                              "cpu": "100m",
                              "memory": "100Mi"
                          }
                      },
                      "security_context": {
                          "allow_privilege_escalation": false,
                          "capabilities": {
                              "add": [
                                  "NET_ADMIN",
                                  "NET_RAW",
                                  "SYS_ADMIN"
                              ],
                              "drop": [
                                  "ALL"
                              ]
                          },
                          "read_only_root_filesystem": true
                      },
                      "termination_message_path": "/dev/termination-log",
                      "termination_message_policy": "File",
                      "volume_mounts": [
                          {
                              "mount_path": "/var/run/secrets/kubernetes.io/serviceaccount",
                              "name": "speaker-token-62bwt",
                              "read_only": true
                          }
                      ]
                  }
              ],
              "dns_policy": "ClusterFirst",
              "enable_service_links": true,
              "host_network": true,
              "node_name": "jdms-server1.lan",
              "node_selector": {
                  "beta.kubernetes.io/os": "linux"
              },
              "priority": 0,
              "restart_policy": "Always",
              "scheduler_name": "default-scheduler",
              "security_context": {},
              "service_account": "speaker",
              "service_account_name": "speaker",
              "termination_grace_period_seconds": 2,
              "tolerations": [
                  {
                      "effect": "NoSchedule",
                      "key": "node-role.kubernetes.io/master"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/not-ready",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoExecute",
                      "key": "node.kubernetes.io/unreachable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/disk-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/memory-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/pid-pressure",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/unschedulable",
                      "operator": "Exists"
                  },
                  {
                      "effect": "NoSchedule",
                      "key": "node.kubernetes.io/network-unavailable",
                      "operator": "Exists"
                  }
              ],
              "volumes": [
                  {
                      "name": "speaker-token-62bwt",
                      "secret": {
                          "default_mode": 420,
                          "secret_name": "speaker-token-62bwt"
                      }
                  }
              ]
          },
          "status": {
              "conditions": [
                  {
                      "last_transition_time": "2021-04-26 16:12:24",
                      "status": "True",
                      "type": "Initialized"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "Ready"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:27",
                      "status": "True",
                      "type": "ContainersReady"
                  },
                  {
                      "last_transition_time": "2021-04-26 16:12:24",
                      "status": "True",
                      "type": "PodScheduled"
                  }
              ],
              "container_statuses": [
                  {
                      "container_id": "cri-o://44fb1b67685a24c2b5731969ff4850d48cdf6ca0b34c67502c31da8ba8ef385c",
                      "image": "dip-controller.lan/metallb/speaker:v0.10.2",
                      "image_id": "dip-controller.lan/metallb/speaker@sha256:db0ebd9b3ef47881ed50d9bc036b65306f4ddbe8f0cf781b89b96cd881ce79b3",
                      "last_state": {},
                      "name": "speaker",
                      "ready": true,
                      "restart_count": 0,
                      "state": {
                          "running": {
                              "started_at": "2021-04-26 16:12:27"
                          }
                      }
                  }
              ],
              "host_ip": "10.40.24.65",
              "phase": "Running",
              "pod_ip": "10.40.24.65",
              "qos_class": "Guaranteed",
              "start_time": "2021-04-26 16:12:24"
          }
      }
  ],
  node_info: {
    'jdms-sensor1.lan': {
      status: {
        allocatable: {
          cpu: '16000m',
          'ephemeral-storage': '16.775Gi',
          memory: '15.401Gi'
        },
        capacity: {
          cpu: '16000m',
          'ephemeral-storage': '18.639Gi',
          memory: '15.499Gi'
        }
      },
      node_type: 'Sensor'
    },
    'jdms-sensor2.lan': {
      status: {
        allocatable: {
          cpu: '16000m',
          'ephemeral-storage': '16.775Gi',
          memory: '15.401Gi'
        },
        capacity: {
          cpu: '16000m',
          'ephemeral-storage': '18.639Gi',
          memory: '15.499Gi'
        }
      },
      node_type: 'Sensor'
      },
    'jdms-server1.lan': {
      status: {
        allocatable: {
          cpu: '16000m',
          'ephemeral-storage': '16.775Gi',
          memory: '23.276Gi'
        },
        capacity: {
          cpu: '16000m',
          'ephemeral-storage': '18.639Gi',
          memory: '23.374Gi'
        }
      },
      node_type: 'Server'
      },
    'jdms-server2.lan': {
      status: {
        allocatable: {
          cpu: '16000m',
          'ephemeral-storage': '16.775Gi',
          memory: '23.276Gi'
        },
        capacity: {
          cpu: '16000m',
          'ephemeral-storage': '18.639Gi',
          memory: '23.374Gi'
        }
      },
      node_type: 'Server'
    }
  },
  "utilization_info": {
      "jdms-sensor1.lan": {
          "memory": {
              "total": 16641921024,
              "available": 13161017344,
              "percent": 20.9,
              "used": 2398183424,
              "free": 7267569664,
              "active": 2592595968,
              "inactive": 4805840896,
              "buffers": 3239936,
              "cached": 6972928000,
              "shared": 859402240,
              "slab": 1352613888
          },
          "root_usage": {
              "total": 11418992640,
              "used": 2902827008,
              "free": 8516165632,
              "percent": 25.4
          },
          "data_usage": {
              "total": 53656686592,
              "used": 407969792,
              "free": 53248716800,
              "percent": 0.8
          },
          "cpu_percent": 1.1
      },
      "jdms-server1.lan": {
          "root_usage": {
              "total": 11418992640,
              "used": 2954678272,
              "free": 8464314368,
              "percent": 25.9
          },
          "data_usage": {
              "total": 53656686592,
              "used": 8400117760,
              "free": 45256568832,
              "percent": 15.7
          },
          "cpu_percent": 4.0,
          "memory": {
              "total": 25097285632,
              "available": 12701974528,
              "percent": 49.4,
              "used": 11563122688,
              "free": 1316016128,
              "active": 11939123200,
              "inactive": 8314290176,
              "buffers": 2170880,
              "cached": 12215975936,
              "shared": 737300480,
              "slab": 3151855616
          }
      },
      "jdms-sensor2.lan": {
          "memory": {
              "total": 16641552384,
              "available": 14033686528,
              "percent": 15.7,
              "used": 1403871232,
              "free": 10254442496,
              "active": 1985466368,
              "inactive": 3132649472,
              "buffers": 3239936,
              "cached": 4979998720,
              "shared": 849678336,
              "slab": 888143872
          },
          "root_usage": {
              "total": 11418992640,
              "used": 2902654976,
              "free": 8516337664,
              "percent": 25.4
          },
          "data_usage": {
              "total": 53656686592,
              "used": 407945216,
              "free": 53248741376,
              "percent": 0.8
          },
          "cpu_percent": 0.7
      },
      "jdms-server2.lan": {
          "data_usage": {
              "total": 53656686592,
              "used": 9237090304,
              "free": 44419596288,
              "percent": 17.2
          },
          "cpu_percent": 5.8,
          "root_usage": {
              "total": 11418992640,
              "used": 2902450176,
              "free": 8516542464,
              "percent": 25.4
          },
          "memory": {
              "total": 25097285632,
              "available": 11109879808,
              "percent": 55.7,
              "used": 12915929088,
              "free": 183119872,
              "active": 13465456640,
              "inactive": 7270981632,
              "buffers": 2138112,
              "cached": 11996098560,
              "shared": 677740544,
              "slab": 3858669568
          }
      }
  }
};
