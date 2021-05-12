from app import api
from app.models import Model
from flask_restx import fields
from flask_restx.fields import Nested


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

class HealthServiceTotalsModel(Model):
    DTO = api.model('HealthServiceTotalsModel', {
        'cpus_requested': fields.Integer(example="450", description="The number of millicores requested by containers."),
        'mem_requested': fields.Integer(example="307200", description="The amount of memory requested by containers given in killobytes."),
        'cpus_requested_str': fields.String(example="450m", description="How many millicores containers have requested."),
        'mem_requested_str': fields.String(example="0.293Gi", description="How many gigabytes of memory containers have requested."),
        'remaining_allocatable_cpu': fields.String(example="15550m", description="An estimate of how many millicores a node has available for scheduling.", required=False),
        'remaining_allocatable_mem': fields.String(example="15.108Gi", description="An estimate of how much memory a node has available for scheduling.", required=False),
        'name': fields.String(example="sensor1.lan", description="Name of the node."),
        'node_type': fields.String(example="Sensor", description="Type of node.")
    })

class HealthServiceTotalsWildcardModel(Model):
    _totals_wildcard = fields.Wildcard(fields.Nested(HealthServiceTotalsModel.DTO))
    DTO = api.model('HealthServiceTotalsWildcardModel', {
        '*': _totals_wildcard
    })

class HealthServiceNodeInfoModel(Model):
    DTO = api.model('HealthServiceNodeInfoModel', {
        'status.allocatable.cpu': fields.String(example="16000m"),
        'status.allocatable.ephemeral-storage': fields.String(example="16.775Gi"),
        'status.allocatable.memory': fields.String(example="15.401Gi"),
        'status.capacity.cpu': fields.String(example="16000m"),
        'status.capacity.ephemeral-storage': fields.String(example="18.639Gi"),
        'status.capacity.memory': fields.String(example="15.499Gi"),
        'node_type': fields.String(example="Sensor"),
        'public_ip': fields.String(required=False)
    })

class HealthServiceNodeInfoWildcardModel(Model):
    _node_info_wildcard = fields.Wildcard(fields.Nested(HealthServiceNodeInfoModel.DTO))
    DTO = api.model('HealthServiceNodeInfoWildcardModel', {
        '*': _node_info_wildcard
    })

class HealthServiceDiskUsageModel(Model):
    DTO = api.model('HealthServiceDiskUsageModel', {
        'total': fields.Integer(),
        'used': fields.Integer(),
        'free': fields.Integer(),
        'percent': fields.Float()
    })

class HealthServiceVirtualMemoryModel(Model):
    DTO = api.model('HealthServiceMemoryModel', {
        'total': fields.Integer(),
        'available': fields.Integer(),
        'percent': fields.Float(),
        'used': fields.Integer(),
        'free': fields.Integer(),
        'active': fields.Integer(),
        'inactive': fields.Integer(),
        'buffers': fields.Integer(),
        'cached': fields.Integer(),
        'shared': fields.Integer(),
        'slab': fields.Integer()
    })

class HealthServiceUtilizationInfoModel(Model):
    DTO = api.model('HealthServiceUtilizationInfoModel', {
        'cpu_percent': fields.Float(),
        'data_usage': fields.Nested(HealthServiceDiskUsageModel.DTO),
        'root_usage': fields.Nested(HealthServiceDiskUsageModel.DTO),
        'memory': fields.Nested(HealthServiceVirtualMemoryModel.DTO)
    })

class HealthServiceUtilizationInfoWildcardModel(Model):
    _utilization_wildcard = fields.Wildcard(fields.Nested(HealthServiceUtilizationInfoModel.DTO))
    DTO = api.model('HealthServiceUtilizationInfoWildcardModel', {
        '*': _utilization_wildcard
    })

class HealthServiceModel(Model):
    DTO = api.model('HealthService', {
        "totals": fields.Nested(HealthServiceTotalsWildcardModel.DTO),
        'nodes': fields.List(fields.Raw),
        'pods': fields.List(fields.Raw),
        'node_info': fields.Nested(HealthServiceNodeInfoWildcardModel.DTO),
        'utilization_info': fields.Nested(HealthServiceUtilizationInfoWildcardModel.DTO)
    })

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
