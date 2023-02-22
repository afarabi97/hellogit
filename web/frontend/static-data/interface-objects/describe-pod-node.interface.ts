import { DescribePodNodeInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockDescribePodNodeInterface: DescribePodNodeInterface = {
  stdout: "Name:               control-plane.test\nRoles:              control-plane\nLabels:             beta.kubernetes.io/arch=amd64\n                    beta.kubernetes.io/os=linux\n                    kubernetes.io/arch=amd64\n                    kubernetes.io/hostname=control-plane.test\n                    kubernetes.io/os=linux\n                    node-role.kubernetes.io/control-plane=\n                    node.kubernetes.io/exclude-from-external-load-balancers=\n                    role=control-plane\nAnnotations:        kubeadm.alpha.kubernetes.io/cri-socket: unix:///var/run/crio/crio.sock\n                    node.alpha.kubernetes.io/ttl: 0\n                    projectcalico.org/IPv4Address: 10.40.31.65/24\n                    projectcalico.org/IPv4IPIPTunnelAddr: 10.233.2.0\n                    volumes.kubernetes.io/controller-managed-attach-detach: true\nCreationTimestamp:  Wed, 18 Jan 2023 04:52:01 +0000\nTaints:             node-role.kubernetes.io/control-plane:NoSchedule\n                    node-role.kubernetes.io/master:NoSchedule\nUnschedulable:      false\nLease:\n  HolderIdentity:  control-plane.test\n  AcquireTime:     <unset>\n  RenewTime:       Wed, 25 Jan 2023 18:22:43 +0000\nConditions:\n  Type                 Status  LastHeartbeatTime                 LastTransitionTime                Reason                       Message\n  ----                 ------  -----------------                 ------------------                ------                       -------\n  NetworkUnavailable   False   Wed, 18 Jan 2023 06:34:37 +0000   Wed, 18 Jan 2023 06:34:37 +0000   CalicoIsUp                   Calico is running on this node\n  MemoryPressure       False   Wed, 25 Jan 2023 18:21:34 +0000   Wed, 18 Jan 2023 04:51:58 +0000   KubeletHasSufficientMemory   kubelet has sufficient memory available\n  DiskPressure         False   Wed, 25 Jan 2023 18:21:34 +0000   Wed, 18 Jan 2023 04:51:58 +0000   KubeletHasNoDiskPressure     kubelet has no disk pressure\n  PIDPressure          False   Wed, 25 Jan 2023 18:21:34 +0000   Wed, 18 Jan 2023 04:51:58 +0000   KubeletHasSufficientPID      kubelet has sufficient PID available\n  Ready                True    Wed, 25 Jan 2023 18:21:34 +0000   Wed, 18 Jan 2023 04:52:30 +0000   KubeletReady                 kubelet is posting ready status\nAddresses:\n  InternalIP:  10.40.31.65\n  Hostname:    control-plane.test\nCapacity:\n  cpu:                8\n  ephemeral-storage:  19010Mi\n  hugepages-1Gi:      0\n  hugepages-2Mi:      0\n  memory:             7995832Ki\n  pods:               110\nAllocatable:\n  cpu:                8\n  ephemeral-storage:  17940086755\n  hugepages-1Gi:      0\n  hugepages-2Mi:      0\n  memory:             7893432Ki\n  pods:               110\nSystem Info:\n  Machine ID:                 339f7c8daf754f52936d6cc15d7ede1a\n  System UUID:                1d461d42-a176-4481-82cf-35124396baf2\n  Boot ID:                    ad5836c9-e188-4897-97b8-a101d127e8ef\n  Kernel Version:             4.18.0-193.el8.x86_64\n  OS Image:                   Red Hat Enterprise Linux 8.2 (Ootpa)\n  Operating System:           linux\n  Architecture:               amd64\n  Container Runtime Version:  cri-o://1.24.1\n  Kubelet Version:            v1.24.2\n  Kube-Proxy Version:         v1.24.2\nPodCIDR:                      10.233.0.0/24\nPodCIDRs:                     10.233.0.0/24\nNon-terminated Pods:          (7 in total)\n  Namespace                   Name                                             CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age\n  ---------                   ----                                             ------------  ----------  ---------------  -------------  ---\n  kube-system                 calico-node-9fgnt                                250m (3%)     0 (0%)      0 (0%)           0 (0%)         7d13h\n  kube-system                 etcd-control-plane.test                       100m (1%)     0 (0%)      100Mi (1%)       0 (0%)         7d13h\n  kube-system                 kube-apiserver-control-plane.test             250m (3%)     0 (0%)      0 (0%)           0 (0%)         7d13h\n  kube-system                 kube-controller-manager-control-plane.test    200m (2%)     0 (0%)      0 (0%)           0 (0%)         7d13h\n  kube-system                 kube-proxy-9w7lb                                 0 (0%)        0 (0%)      0 (0%)           0 (0%)         7d13h\n  kube-system                 kube-scheduler-control-plane.test             100m (1%)     0 (0%)      0 (0%)           0 (0%)         7d13h\n  metallb-system              speaker-89tg5                                    0 (0%)        0 (0%)      0 (0%)           0 (0%)         7d13h\nAllocated resources:\n  (Total limits may be over 100 percent, i.e., overcommitted.)\n  Resource           Requests    Limits\n  --------           --------    ------\n  cpu                900m (11%)  0 (0%)\n  memory             100Mi (1%)  0 (0%)\n  ephemeral-storage  0 (0%)      0 (0%)\n  hugepages-1Gi      0 (0%)      0 (0%)\n  hugepages-2Mi      0 (0%)      0 (0%)\nEvents:              <none>\n",
  stderr: ""
};