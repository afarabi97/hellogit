from app.models import Model
from flask_restx import Namespace, fields

KUBERNETES_NS = Namespace(
    "kubernetes", description="Kubernetes related operations.")


class DockerImageMetadataModel(Model):
    DTO = KUBERNETES_NS.model(
        "DockerImageMetadata",
        {
            "image_id": fields.String(
                example="219ee5171f80", description="The hash of the docker image."
            ),
            "image_size": fields.Float(
                example=9.63, description="The hash of the docker image."
            ),
            "tag": fields.String(
                example="1.8.4", description="The tag or version of the docker image."
            ),
        },
    )

    def __init__(self):
        pass


class DockerImageModel(Model):
    DTO = KUBERNETES_NS.model(
        "DockerImage",
        {
            "name": fields.String(
                example="busybox", description="The name of the docker image."
            ),
            "metadata": fields.List(
                fields.Nested(DockerImageMetadataModel.DTO),
                description="The metadata of the docker image.",
            ),
        },
    )

    def __init__(self):
        pass


class KubernetesNodeMetricsModel(Model):
    storage_fields = KUBERNETES_NS.model(
        "KubernetesNodeMetricsStorage",
        {"name": fields.Integer(), "free": fields.Integer(),
         "percent": fields.Float()},
    )
    memory_fields = KUBERNETES_NS.model(
        "KubernetesNodeMetricsMemory",
        {"available": fields.Integer(), "percent": fields.Float()},
    )
    capacity_fields = KUBERNETES_NS.model(
        "KubernetesNodeMetricsCapacity",
        {
            "cpu": fields.String(),
            "ephermeral-storage": fields.String(),
            "memory": fields.String(),
            "pods": fields.String(),
        },
    )
    allocatable_fields = KUBERNETES_NS.model(
        "KubernetesNodeMetricsAllocatable",
        {
            "cpu": fields.String(),
            "ephermeral-storage": fields.String(),
            "memory": fields.String(),
            "pods": fields.String(),
        },
    )
    remaining_fields = KUBERNETES_NS.model(
        "KubernetesNodeMetricsRemaining",
        {"cpu": fields.String(), "memory": fields.String()},
    )
    DTO = KUBERNETES_NS.model(
        "KubernetesNodeMetrics",
        {
            "name": fields.String(),
            "address": fields.String(),
            "ready": fields.Boolean(),
            "type": fields.String(),
            "storage": fields.List(fields.Nested(storage_fields)),
            "memory": fields.Nested(memory_fields),
            "cpu": fields.Float(),
            "capacity": fields.Nested(capacity_fields),
            "allocatable": fields.Nested(allocatable_fields),
            "remaining": fields.Nested(remaining_fields),
            "node_info": fields.Raw(),
        },
    )


class KubernetesPodMetricsModel(Model):
    DTO = KUBERNETES_NS.model(
        "KubernetesPodMetrics",
        {
            "namespace": fields.String(),
            "name": fields.String(),
            "node_name": fields.String(),
            "status_brief": fields.String(),
            "restart_count": fields.Integer(),
            "states": fields.List(fields.String()),
            "resources": fields.Raw(),
            "status": fields.Raw(),
            "warnings": fields.Integer(required=False),
        },
    )


class ConfigMapDataModel(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapData",
        {
            "labelsForPV": fields.String(example="pp: local-volume-provisioner\n"),
            "storageClassMap": fields.String(
                example='fast-disks:\n  hostDir: /mnt/disks/apps\n  mountDir: /mnt/disks/apps\n  blockCleanerCommand:\n    - "/scripts/shred.sh"\n    - "2"\n  volumeMode: Filesystem\n  fsType: xfs\nelastic-disks:\n  hostDir: /mnt/disks/elastic\n  mountDir: /mnt/disks/elastic\n  blockCleanerCommand:\n    - "/scripts/shred.sh"\n    - "2"\n  volumeMode: Filesystem\n  fsType: xfs\n'
            ),
        },
    )


class ConfigMapMetadataModel(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapMetadata",
        {
            "annotations": fields.String(example="null"),
            "cluster_name": fields.String(example="null"),
            "creation_timestamp": fields.DateTime(
                example="Tue, 15 Dec 2020 21:40:50 GMT"
            ),
            "deletion_grace_period_seconds": fields.String(example="null"),
            "deletion_timestamp": fields.String(example="null"),
            "finalizers": fields.String(example="null"),
            "generate_name": fields.String(example="null"),
            "generation": fields.String(example="null"),
            "initializers": fields.String(example="null"),
            "labels": fields.String(example="null"),
            "name": fields.String(example="local-provisioner-config"),
            "namespace": fields.String(example="default"),
            "owner_references": fields.String(example="null"),
            "resource_version": fields.String(example="1083954"),
            "self_link": fields.String(
                "/api/v1/namespaces/default/configmaps/local-provisioner-config"
            ),
            "uid": fields.String("6ecb39d9-2550-4969-ace3-2cecabd43191"),
        },
    )


class ConfigMapModel(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMap",
        {
            "name": fields.String(
                example="addon-resizer", description="The name of the docker image."
            ),
            "data": fields.Nested(ConfigMapDataModel.DTO),
            "metadata": fields.Nested(ConfigMapMetadataModel.DTO),
        },
    )


class ConfigMapViewMetaDataModel(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapViewMetaData",
        {
            "_continue": fields.String(example="null"),
            "resource_version": fields.String(example="2787102"),
            "self_link": fields.String(
                example="/api/v1/configmaps",
            ),
        },
    )


class ConfigMapViewModel(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapView",
        {
            "api_version": fields.String(example="v1"),
            "items": fields.Nested(ConfigMapModel.DTO),
            "kind": fields.String(example="ConfigMapList"),
            "metadata": fields.Nested(ConfigMapViewMetaDataModel.DTO),
        },
    )


class ConfigMapSaveMetaData(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapSaveMetaData",
        {
            "annotations": fields.String(example="null"),
            "cluster_name": fields.String(example="null"),
            "creation_timestamp": fields.DateTime(
                example="Tue, 15 Dec 2020 21:40:50 GMT"
            ),
            "deletion_grace_period_seconds": fields.String(example="null"),
            "deletion_timestamp": fields.String(example="null"),
            "finalizers": fields.String(example="null"),
            "generate_name": fields.String(example="null"),
            "generation": fields.String(example="null"),
            "initializers": fields.String(example="null"),
            "labels": fields.String(example="null"),
            "name": fields.String(example="local-provisioner-config"),
            "namespace": fields.String(example="default"),
            "owner_references": fields.String(example="null"),
            "resource_version": fields.String(example="2868936"),
            "self_link": fields.String(
                example='/api/v1/namespaces/default/configmaps/local-provisioner-config"'
            ),
            "uid": fields.String(example="6ecb39d9-2550-4969-ace3-2cecabd43191"),
        },
    )


class ConfigMapSaveData(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapSaveData",
        {
            "labelsForPV": fields.String(example="app: local-volume-provisioner\n"),
            "storageClassMap": fields.String(
                example='fast-disks:\n  hostDir: /mnt/disks/apps\n  mountDir: /mnt/disks/apps\n  blockCleanerCommand:\n    - "/scripts/shred.sh"\n    - "2"\n  volumeMode: Filesystem\n  fsType: xfs\nelastic-disks:\n  hostDir: /mnt/disks/elastic\n  mountDir: /mnt/disks/elastic\n  blockCleanerCommand:\n    - "/scripts/shred.sh"\n    - "2"\n  volumeMode: Filesystem\n  fsType: xfs\n'
            ),
        },
    )


class ConfigMapSaveConfigMap(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapSaveConfigMap",
        {
            "api_version": fields.String(example="null"),
            "binary_data": fields.String(example="null"),
            "kind": fields.String(example="null"),
            "data": fields.Nested(ConfigMapSaveData.DTO),
            "metadata": fields.Nested(ConfigMapSaveMetaData.DTO),
        },
    )


class ConfigMapSavePods(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapSavePods",
        {
            "namespace": fields.String(example="default"),
            "podName": fields.String(example="local-volume-provisioner-4dht8"),
            "namespace": fields.String(example="default"),
            "podName": fields.String(example="local-volume-provisioner-xvwvr"),
        },
    )


class ConfigMapSave(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapSave_Post",
        {
            "configMap": fields.Nested(ConfigMapSaveConfigMap.DTO),
            "associatedPods": fields.Nested(ConfigMapSavePods.DTO),
        },
    )


class ConfigMapCreateDataNested(Model):
    DTO = KUBERNETES_NS.model("ConfigMapCreateData", {})


class ConfigMapCreateMetaData(Model):
    DTO = KUBERNETES_NS.model(
        "ConfigMapCreateMetaData",
        {
            "name": fields.String(example="configmapconfig"),
            "creation_timestamp": fields.DateTime(
                example="Thu, 07 Jan 2021 20:26:36 GMT"
            ),
            "namespace": fields.String(example="default"),
        },
    )


class AssociatedPodModel(Model):
    DTO = KUBERNETES_NS.model(
        "AssociatedPod",
        {
            "podName": fields.String(example="coredns-977b74bc6-cj4br"),
            "namespace": fields.String(example="kube-system"),
        },
    )


class ApplicationStatusListModel(Model):
    DTO = KUBERNETES_NS.schema_model(
        "ApplicationStatusList",
        {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "metrics"],
                "properties": {
                    "name": {"type": "string"},
                    "metrics": {
                        "type": "object",
                        "required": ["name", "value", "hostname"],
                        "properties": {
                            "name": {"type": "string"},
                            "value": {"type": "string"},
                            "hostname": {"type": "string"},
                        },
                    },
                },
            },
        },
    )


class NodeOrPodStatusModel(Model):
    DTO = KUBERNETES_NS.model(
        "NodeOrPodStatus",
        {
            "stderr": fields.String(),
            "stdout": fields.String(),
        },
    )


class PodLogsModel(Model):
    DTO = KUBERNETES_NS.model(
        "PodLogs",
        {
            "logs": fields.String(
                description="All the log information the kubectl logs <podname> -c <container> can manage to pull back."
            ),
            "name": fields.String(
                description="The container inside of the pod.  Kubernetes can have multiple containers inside of it."
            ),
        },
    )
