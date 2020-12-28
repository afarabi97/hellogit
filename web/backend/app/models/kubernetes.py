from app import api
from app.models import Model
from flask_restplus import fields
from flask_restplus.fields import Nested


class DockerImageMetadataModel(Model):
    DTO = api.model('DockerImageMetadata', {
        'image_id': fields.String(example="219ee5171f80", description="The hash of the docker image."),
        'image_size': fields.Float(example=9.63, description="The hash of the docker image."),
        'tag': fields.String(example="1.8.4", description="The tag or version of the docker image.")
    })

    def __init__(self):
        pass


class DockerImageModel(Model):
    DTO = api.model('DockerImage', {
        'name': fields.String(example="busybox", description="The name of the docker image."),
        'metadata': fields.List(fields.Nested(DockerImageMetadataModel.DTO), description="The metadata of the docker image.")
    })

    def __init__(self):
        pass


class HealthServiceMetadataModel(Model):
    DTO = api.model('HealthServiceMetadata', {
        'kubeadm.alpha.kubernetes.io/cri-socket': fields.String(example="/var/run/crio/crio.sock", description="The service socket of the kubernetes node."),
        'node.alpha.kubernetes.io/ttl': fields.String(example="0", description="The kubernetes node time to live for finished resources."),
        'projectcalico.org/IPv4Address': fields.String(example="10.40.25.67/24", description="The kubernetes node IP block assignment."),
        'projectcalico.org/IPv4IPIPTunnelAddr': fields.String(example="10.233.15.0", description="The kubernetes node IP subnet."),
        'tfplenum/cpu_percent': fields.Float(example="7.7", description="The percentage of cpu useage for the kubernetes node."),
        'tfplenum/data_usage': fields.String(description="The kubernetes node data usage."),
        'tfplenum/memory': fields.String(example="12345", description="The kubernetes node memory usage."),
        'tfplenum/root_usage': fields.String(example="12345", description="The kubernetes node root usage."),
        'volumes.kubernetes.io/controller-managed-attach-detach': fields.String(example="True", description="Kubernetes controller attach and detach operation management."),
        'cluster_name': fields.String(example="null", description="The kubernetes node cluster name."),
        'creation_timestamp': fields.String(example="null", description="The kubernetes node creation timestamp."),
        'deletion_grace_period_seconds': fields.String(example="null", description="The kubernetes node deletion grace period."),
        'deletion_timestamp': fields.String(example="null", description="The kubernetes node deletion timestamp."),
        'finalizers': fields.String(example="null", description="The time allowed for the kubernetes node asynchronous pre-deletion hook."),
        'generate_name': fields.String(example="null", description="Allows the kubernetes node to generate names for configurations."),
        'generation': fields.String(example="null", description="The the kubernetes node resource version."),
        'initializers': fields.String(example="null", description="Admission webhook service plug-in that intercepts kubernetes node resources before they are created."),
        'label_beta.kubernetes.io/arch': fields.String(example="amd64", description="The underlying architecture of the kubernetes node."),
        'label_beta.kubernetes.io/os': fields.String(example="linux", description="The underlying operating system of the kubernetes node."),
        'label_kubernetes.io/arch': fields.String(example="amd64", description="The underlying architecture of the kubernetes node."),
        'label_kubernetes.io/hostname': fields.String(example="tfplenum-sensor1.lan", description="The kubernetes node hostname."),
        'label_kubernetes.io/os': fields.String(example="linux", description="The underlying operating system of the kubernetes node."),
        'label_role': fields.String(example="sensor", description="The kubernetes node role label."),
        'name': fields.String(example="tfplenum-sensor1.lan", description="The kubernetes node name."),
        'namespace': fields.String(example="null", description="The kubernetes node namespace."),
        'owner_references': fields.String(example="null", description="The owner reference of the kubernetes node."),
        'public_ip': fields.Float(example="null", description="The kubernetes node public IP address."),
        'resource_version': fields.Float(example="3026920", description="The resource verison of the kubernetes node."),
        'self_link': fields.String(example="/api/v1/nodes/monash-sensor1.lan", description="The self referencing link of the kubernetes node."),
        'uid': fields.String(example="32404e71-5e07-46a0-a908-40848c2a8051", description="The uuid of the kubernetes node."),
        'config_source': fields.String(example="null", description="The kubernetes node configuration source."),
        'external_id': fields.String(example="null", description="The external source of the kubernetes node."),
        'pod_cidr': fields.Float(example="10.233.2.0/24", description="The kubernetes pod IP resource pool."),
        'provider_id': fields.String(example="null", description="The provider ID of the kubernetes node."),
        'taints': fields.String(example="null", description="The set of pods the kubernetes node has repeld."),
        'unschedulable': fields.String(example="null", description="The pods which the kubernetes node was unable to schedule."),
        'address': fields.Float(example="10.40.25.67", description="The internal IP/DNS hostname of the the kubernetes node."),
        'type': fields.String(example="InternalIP", description="The type of internal IP/DNS hostname of the the kubernetes node."),
        'allocatable_cpu': fields.String(example="16000m", description="The total constraints for allocatable cpu resources for the kubernetes node."),
        'allocatable_ephemeral-storage': fields.String(example="16.775Gi", description="The total constraints for allocatable ephemeral storage resources for the kubernetes node."),
        'allocatable_hugepages-1Gi': fields.Float(example="0", description="The total constraints for allocatable 1Gi hugepage resources for the kubernetes node."),
        'allocatable_hugepages-2Mi': fields.Float(example="0", description="The total constraints for allocatable 2Gi hugepage resources for the kubernetes node."),
        'allocatable_memory': fields.String(example="15.409Gi", description="The total constraints for allocatable memory resources for the kubernetes node."),
        'allocatable_pods': fields.Float(example="110", description="The total constraints for allocatable pods per the kubernetes node."),
        'cpu_capacity': fields.String(example="16000m", description="The total constraints for cpu resources for the kubernetes node."),
        'storage_capacity': fields.String(example="18.639Gi", description="The total constraints for ephemeral storage resources for the kubernetes node."),
        'hugepages-1Gi_capacity': fields.Float(example="0", description="The total constraints for 1Gi hugepage resources for the kubernetes node."),
        'hugepages-2Mi_capacity': fields.Float(example="0", description="The total constraints for 2Gi hugepage resources for the kubernetes node."),
        'memory_capacity': fields.String(example="15.499Gi", description="The total constraints for memory resources for the kubernetes node."),
        'pods_capacity': fields.Float(example="110", description="The total constraints for pods per the kubernetes node."),
        'conditions_last_heartbeat_time': fields.String(example="Mon, 28 Dec 2020 18:47:19 GMT", description="The timestamp of the last heartbeat from the kubernetes node."),
        'conditions_last_transition_time': fields.String(example="Mon, 28 Dec 2020 18:47:19 GMT", description="The timestamp of the last transition from the kubernetes node."),
        'conditions_message': fields.String(example="Calico is running on this node", description="The service condition of calico on the kubernetes node."),
        'conditions_reason': fields.String(example="CalicoIsUp", description="The reason for the service condition of calico the kubernetes node."),
        'conditions_status': fields.String(example="False", description="The service conditions of the kubernetes node."),
        'conditions_type': fields.String(example="NetworkUnavailable", description="The type of service condition of the kubernetes node."),
        'config': fields.String(example="null", description="The kubernetes node configutation."),
        'kubelet_endpoint_port': fields.Float(example="1050", description="The endpoint port of the kubernetes node kubelet."),
        'images_names': fields.String(example="dip-controller.lan/tfplenum/moloch@sha256:b7aeb4e941c06c8f3d3d4c5fa5551d5f738e08324814658a9895329dad83ed7e", description="The image name of the pod container images ran on the kubernetes node."),
        'images_size_bytes': fields.String(example="38570628", description="The size of the correlating pod images on the kubernetes node."),
        'node_info_architecture': fields.String(example="amd64", description="The underlying architecture of the kubernetes node."),
        'node_info_boot_id': fields.String(example="2b9a6f3f-d54c-432e-9632-f2187710113a", description="The kubernetes node boot_id uuid."),
        'node_info_container_runtime_version': fields.String(example="cri-o://1.17.4", description="The kubernetes node container runtime version."),
        'node_info_kernel_version': fields.String(example="4.18.0-193.el8.x86_64", description="The underlying kernel version of the kubernetes node."),
        'node_info_kube_proxy_version': fields.String(example="v1.17.4", description="The kubee proxy version of the kubernetes node."),
        'node_info_kubelet_version': fields.String(example="v1.17.4", description="The kubelet version of the kubernetes node."),
        'node_info_machine_id': fields.String(example="26d65764e6b143bbbc539897154e3e46", description="The machine ID of the kubernetes node."),
        'node_info_operating_system': fields.String(example="12345", description="The service conditions of the kubernetes node."),
        'node_info_os_image': fields.String(example="Red Hat Enterprise Linux 8.2 (Ootpa)", description="The whole name of the underlying operating system on the kubernetes node."),
        'node_info_system_uuid': fields.String(example="4cd51d42-e59e-b7d9-8df7-b1b0b5dbfd95", description="The system_uuid uuid of the kubernetes node."),
        'phase': fields.String(example="null", description="The phase of the kubernetes node."),
        'volumes_attached': fields.String(example="null", description="The volumes attached to the kubernetes node."),
        'volumes_in_use': fields.String(example="null", description="The volumes in use on the kubernetes node.")
    })

    def __init__(self):
        pass

class HealthServiceModel(Model):
    DTO = api.model('HealthService', {
        'node_info': fields.String(description="The kubernetes system status information."),
        'api_version': fields.String(example="null", description="The kubernetes system api version."),
        'kind': fields.String(example="null", description="The kubernetes node resources."),
        'metadata_annotations': fields.List(fields.Nested(HealthServiceMetadataModel.DTO), description="The kubernetes system health metadata.")
    })

    def __init__(self):
        pass


class ConfigMapDataModel(Model):
    DTO = api.model('ConfigMapData', {
        'labelsForPV': fields.String(example="pp: local-volume-provisioner\n"),
        'storageClassMap': fields.String(example = "fast-disks:\n  hostDir: /mnt/disks/apps\n  mountDir: /mnt/disks/apps\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\nelastic-disks:\n  hostDir: /mnt/disks/elastic\n  mountDir: /mnt/disks/elastic\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\n"),
    })


class ConfigMapMetadataModel(Model):
    DTO = api.model('ConfigMapMetadata', {
        'annotations': fields.String(example="null"),
        'cluster_name': fields.String(example="null"),
        'creation_timestamp': fields.DateTime(example= 'Tue, 15 Dec 2020 21:40:50 GMT'),
        'deletion_grace_period_seconds': fields.String(example="null"),
        "deletion_timestamp": fields.String(example="null"),
        'finalizers': fields.String(example="null"),
        'generate_name': fields.String(example="null"),
        'generation': fields.String(example="null"),
        'initializers':fields.String(example="null"),
        'labels':fields.String(example="null"),
        'name': fields.String(example="local-provisioner-config"),
        'namespace': fields.String(example="default"),
        'owner_references': fields.String(example="null"),
        'resource_version': fields.String(example="1083954"),
        'self_link':fields.String("/api/v1/namespaces/default/configmaps/local-provisioner-config"),
        'uid': fields.String("6ecb39d9-2550-4969-ace3-2cecabd43191")
    })


class ConfigMapModel(Model):
    DTO = api.model('ConfigMap', {
        'name': fields.String(example="addon-resizer", description="The name of the docker image."),
        'data': fields.Nested(ConfigMapDataModel.DTO),
        'metadata': fields.Nested(ConfigMapMetadataModel.DTO)
    })


class ConfigMapViewMetaDataModel(Model):
    DTO = api.model('ConfigMapViewMetaData', {
        '_continue': fields.String(example="null"),
        'resource_version': fields.String(example="2787102"),
        'self_link': fields.String(example="/api/v1/configmaps",)
    })


class ConfigMapViewModel(Model):
    DTO = api.model('ConfigMapView', {
        'api_version': fields.String(example="v1"),
        'items': fields.Nested(ConfigMapModel.DTO),
        'kind':fields.String(example="ConfigMapList"),
        'metadata': fields.Nested(ConfigMapViewMetaDataModel.DTO)
    })


class ConfigMapSaveMetaData(Model):
    DTO = api.model('ConfigMapSaveMetaData', {
        'annotations': fields.String(example='null'),
        'cluster_name': fields.String(example='null'),
        'creation_timestamp': fields.DateTime(example= 'Tue, 15 Dec 2020 21:40:50 GMT'),
        'deletion_grace_period_seconds':fields.String(example='null'),
        'deletion_timestamp':fields.String(example='null'),
        'finalizers':fields.String(example='null'),
        'generate_name':fields.String(example='null'),
        'generation':fields.String(example='null'),
        'initializers':fields.String(example='null'),
        'labels':fields.String(example='null'),
        'name':fields.String(example='local-provisioner-config'),
        'namespace': fields.String(example='default'),
        'owner_references': fields.String(example='null'),
        'resource_version': fields.String(example='2868936'),
        'self_link': fields.String(example='/api/v1/namespaces/default/configmaps/local-provisioner-config"'),
        'uid':fields.String(example = '6ecb39d9-2550-4969-ace3-2cecabd43191')
    })


class ConfigMapSaveData(Model):
    DTO = api.model('ConfigMapSaveData',{
        'labelsForPV': fields.String(example ="app: local-volume-provisioner\n"),
        'storageClassMap': fields.String(example = "fast-disks:\n  hostDir: /mnt/disks/apps\n  mountDir: /mnt/disks/apps\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\nelastic-disks:\n  hostDir: /mnt/disks/elastic\n  mountDir: /mnt/disks/elastic\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\n")
    })


class ConfigMapSaveConfigMap(Model):
    DTO = api.model('ConfigMapSaveConfigMap', {
      "api_version":fields.String(example="null"),
      "binary_data":fields.String(example="null"),
      'kind': fields.String(example ='null'),
      'data': fields.Nested(ConfigMapSaveData.DTO),
      'metadata': fields.Nested(ConfigMapSaveMetaData.DTO),
    })


class ConfigMapSavePods(Model):
    DTO = api.model('ConfigMapSavePods', {
        "namespace": fields.String(example="default"),
        "podName":fields.String(example="local-volume-provisioner-4dht8"),
        "namespace": fields.String(example="default"),
        "podName":fields.String(example="local-volume-provisioner-xvwvr")
    })

class ConfigMapSave(Model):
    DTO = api.model('ConfigMapSave_Post', {
        'configMap': fields.Nested(ConfigMapSaveConfigMap.DTO),
        'associatedPods': fields.Nested(ConfigMapSavePods.DTO)

    })


class ConfigMapCreateDataNested(Model):
    DTO = api.model('ConfigMapCreateData', {

    })


class ConfigMapCreateMetaData(Model):
    DTO = api.model('ConfigMapCreateMetaData', {
        'name': fields.String(example= "configmapconfig"),
        'creation_timestamp':fields.DateTime(example= 'Thu, 07 Jan 2021 20:26:36 GMT'),
        'namespace': fields.String(example = 'default')
    })

class ConfigMapCreatePost(Model):
    DTO = api.model('ConfigMapCreatePost', {
        'metadata': fields.Nested(ConfigMapCreateMetaData.DTO),
        'data': fields.Nested(ConfigMapCreateDataNested.DTO)
    })


class AssociatedPodModel(Model):
    DTO = api.model('AssociatedPod', {
        'podName': fields.String(example='coredns-977b74bc6-cj4br'),
        'namespace': fields.String(example='kube-system'),
    })


class PipelineInfoModel(Model):
    DTO = api.model('AssociatedPod', {
        'sensor1.lan': fields.Nested(api.model('info', {
            "last_pcap_log_event": fields.String(example="2021-01-11 17:26:00 +0000"),
            "last_suricata_log_event": fields.String(example="2021-01-11 17:26:00 +0000"),
            "last_zeek_log_event": fields.String(example="2021-01-11 17:26:00 +0000")
        })),
    })


class NodeOrPodStatusModel(Model):
    DTO = api.model('NodeOrPodStatus', {
        'stderr': fields.String(),
        'stdout': fields.String(),
    })


class PodLogsModel(Model):
    DTO = api.model('PodLogs', {
        'logs': fields.String(description="All the log information the kubectl logs <podname> -c <container> can manage to pull back."),
        'name': fields.String(description="The container inside of the pod.  Kubernetes can have multiple containers inside of it."),
    })
