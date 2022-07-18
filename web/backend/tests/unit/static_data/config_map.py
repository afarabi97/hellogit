from app.models.kubernetes import (ConfigMapListModel, ConfigMappingModel,
                                   ConfigMapSavedModel, ConfigMapSaveModel)
from tests.unit.static_data.associated_pods import ASSOCIATED_PODS

CONFIG_MAPPING_1 = {
    "api_version": None,
    "binary_data": None,
    "data": {
        "labelsForPV": "app: local-volume-provisioner\n",
        "storageClassMap": "fast-disks:\n  hostDir: /mnt/disks/apps\n  mountDir: /mnt/disks/apps\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\nelastic-disks:\n  hostDir: /mnt/disks/elastic\n  mountDir: /mnt/disks/elastic\n  blockCleanerCommand:\n    - \"/scripts/shred.sh\"\n    - \"2\"\n  volumeMode: Filesystem\n  fsType: xfs\n"
    },
    "kind": None,
    "metadata": {
        "annotations": {
            "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"v1\",\"data\":{\"labelsForPV\":\"app: local-volume-provisioner\\n\",\"storageClassMap\":\"fast-disks:\\n  hostDir: /mnt/disks/apps\\n  mountDir: /mnt/disks/apps\\n  blockCleanerCommand:\\n    - \\\"/scripts/shred.sh\\\"\\n    - \\\"2\\\"\\n  volumeMode: Filesystem\\n  fsType: xfs\\nelastic-disks:\\n  hostDir: /mnt/disks/elastic\\n  mountDir: /mnt/disks/elastic\\n  blockCleanerCommand:\\n    - \\\"/scripts/shred.sh\\\"\\n    - \\\"2\\\"\\n  volumeMode: Filesystem\\n  fsType: xfs\\n\"},\"kind\":\"ConfigMap\",\"metadata\":{\"annotations\":{},\"labels\":{\"chart\":\"provisioner-2.3.4\",\"heritage\":\"Tiller\",\"release\":\"release-name\"},\"name\":\"local-provisioner-config\",\"namespace\":\"default\"}}\n"
        },
        "cluster_name": None,
        "creation_timestamp": "Tue, 10 Aug 2021 04:27:18 GMT",
        "deletion_grace_period_seconds": None,
        "deletion_timestamp": None,
        "finalizers": None,
        "generate_name": None,
        "generation": None,
        "initializers": None,
        "labels": {
            "chart": "provisioner-2.3.4",
            "heritage": "Tiller",
            "release": "release-name"
        },
        "name": "local-provisioner-config",
        "namespace": "default",
        "owner_references": None,
        "resource_version": "939",
        "self_link": None,
        "uid": "619949d5-4d58-489a-a2fe-a624b881f8ba"
    }
} #type: ConfigMappingModel

CONFIG_MAPPING_2 = {
    "api_version": None,
    "binary_data": None,
    "data": {
        "logstash.yml": "config.reload.automatic: true\nconfig.reload.interval: 10\npipeline.workers: 8\npipeline.batch.size: 8192\n",
        "metricbeat.yml": "metricbeat.config.modules:\n  # Mounted `metricbeat-daemonset-modules` configmap:\n  path: ${path.config}/modules.d/*.yml\n  # Reload module configs as they change:\n  reload.enabled: true\n\nmetricbeat.modules:\n- module: logstash\n  metricsets:\n  - node\n  - node_stats\n  period: 30s\n  hosts: [\"localhost:9600\"]\n  xpack.enabled: true\n  enabled: true\n- module: system\n  enabled: false\n\noutput.elasticsearch:\n  hosts:\n    - https://tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200\n    - https://tfplenum-es-data-1.tfplenum-es-data.default.svc.cluster.local:9200\n    - https://tfplenum-es-data-2.tfplenum-es-data.default.svc.cluster.local:9200\n    - https://tfplenum-es-data-3.tfplenum-es-data.default.svc.cluster.local:9200\n  username: ${ELASTICSEARCH_USERNAME}\n  password: ${ELASTICSEARCH_PASSWORD}\n  ssl.certificate_authorities: [\"/etc/ssl/certs/container/ca.crt\"]",
        "pipelines.yml": "- pipeline.id: external_beats\n  path.config: \"/usr/share/logstash/pipeline/external_beats.conf\"\n- pipeline.id: internal_filebeat\n  path.config: \"/usr/share/logstash/pipeline/internal_filebeat.conf\"\n"
    },
    "kind": None,
    "metadata": {
        "annotations": {
            "helm.sh/hook": "pre-install",
            "helm.sh/hook-delete-policy": "before-hook-creation",
            "helm.sh/hook-weight": "-10"
        },
        "cluster_name": None,
        "creation_timestamp": "Tue, 10 Aug 2021 05:35:15 GMT",
        "deletion_grace_period_seconds": None,
        "deletion_timestamp": None,
        "finalizers": None,
        "generate_name": None,
        "generation": None,
        "initializers": None,
        "labels": None,
        "name": "logstash",
        "namespace": "default",
        "owner_references": None,
        "resource_version": "14446",
        "self_link": None,
        "uid": "2b4601b9-aa49-40bb-b456-a8d9d9c57bfd"
    }
} # type: ConfigMappingModel

CONFIG_MAP_LIST = {
    "api_version": "v1",
    "items": [
        CONFIG_MAPPING_1,
        CONFIG_MAPPING_2
    ],
    "kind": "ConfigMapList",
    "metadata": {
        "resource_version": "191886",
        "self_link": None,
        "_continue": None
    }
} # type: ConfigMapListModel

CONFIG_MAP_SAVE = {
  "configMap": CONFIG_MAPPING_1,
  "associatedPods": ASSOCIATED_PODS
} # type: ConfigMapSaveModel

CONFIG_MAP_SAVED = {
    "name": CONFIG_MAPPING_1["metadata"]["name"]
} # type: ConfigMapSavedModel
