from app import api
from app.models import Model
from app.models.nodes import Node
from flask_restx import fields
from flask_restx.fields import Nested


class ChartNodeModel(Model):
    DTO = api.model('ChartNode', {
        "application": fields.String(example="suricata",
                                     description="The name of the HELM chart."),
        "appVersion": fields.String(example="6.0.0",
                                    description="The version of the application contained within the HELM chart."),
        "status": fields.String(example="DEPLOYED",
                                description="The status of the HELM chart."),
        "deployment_name": fields.String(example="navarro2-sensor1-suricata",
                                         description="The kubenetes deployment name as shown by kubectl get deployments."),
        "hostname": fields.String(example="navarro2-sensor1.lan",
                                  description="The hostname or FQDN of the node that has this chart installed on it."),
        "node_type": fields.String(example="Sensor",
                                   description="The type of Node can be either Server or Sensor.")
    })


class ChartModel(Model):
    DTO = api.model('Chart', {
        "application": fields.String(example="suricata",
                                     description="The name of the HELM chart."),
        "version": fields.String(example="1.0.0",
                                 description="The version of the HELM chart."),
        "appVersion": fields.String(example="6.0.0",
                                    description="The version of the application contained within the HELM chart."),
        "description": fields.String(example="Suricata is a free and open source, mature, fast and robust network threat detection engine."),
        "pmoSupported": fields.Boolean(example=True,
                                       description="Whether or not the given HELM chart is supported by our application."),
        "nodes": fields.List(fields.Nested(ChartNodeModel.DTO))
    })


class ChartInfoFormCtrlModel(Model):
    DTO = api.model('ChartInfoFormCtrl', {
        "type": fields.String(example="textinputlist",
                              description="The form control type. Valid values are textinput, textinputlist, invisible, and checkbox."),
        "default_value": fields.String(example="",
                                       description="The default value of the form control if a user does not provide a value."),
        "description": fields.String(example="6.0.0",
                                     description="Enter your external/untrusted network (defaults to !home_net) [\"external network IP 1\", \" external network IP 2\"] or [\"any\"]"),
        "required": fields.Boolean(example=False, description="If set to true, the UI will not allow a user to submit the chart unless they have provided a value."),
        "regexp": fields.String(example="^(\\s*|\\[\\s*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\"\\s*,\\s*)*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\")\\s*\\])$",
                                description="The form controls client side regex validation. If it is empty, no validation will \
                                             be performed on client side other than a required check if that is set to true."),
        "name": fields.String(example="external_net", description="Name of the formcontrol."),
        "error_message": fields.String(example="Enter a valid IP in a bracket array (EX: [\"192.168.0.0/24\"] or [\"any\"]) with the brackets.",
                                        description="The error message returned on the client side if the user entered an invalid regex value.")
    })


class ChartInfoModel(Model):
    DTO = api.model('ChartInfo', {
        "id": fields.String(example="suricata",
                            description="The name of the HELM chart."),
        "version": fields.String(example="1.0.0",
                                 description="The version of the HELM chart."),
        "appVersion": fields.String(example="6.0.0",
                                    description="The version of the application contained within the HELM chart."),
        "description": fields.String(example="Suricata is a free and open source, mature, fast and robust network threat detection engine."),
        "pmoSupported": fields.Boolean(example=True,
                                       description="Whether or not the given HELM chart is supported by our application."),
        "formControls": fields.List(fields.Nested(ChartInfoFormCtrlModel.DTO)),
        "type": fields.String(example="chart"),
        "node_affinity": fields.String(example="Sensor"),
        "devDependent": fields.String(example="arkime-viewer", description="If this is not null, than a user will be prompted to install the dependent chart first before installing the current one."),
    })


class HELMProcessModel(Model):
    DTO = api.model('HELMProcess', {
        "selectedProcess": fields.String(example="uninstall"),
        "selectedNodes": fields.List(fields.Nested(Node.DTO)),
        "node_affinity": fields.String(example="", description="")
    })


class HELMActionModel(Model):
    DTO = api.model('HELMAction', {
        "role": fields.String(example="suricata",
                              description="The name of the HELM chart."),
        "process": fields.Nested(HELMProcessModel.DTO)
    })


class HelmValuesModel(Model):
    DTO = api.model('HelmValues', {
        "customvalue1": fields.String(description="A charts custom values.  They can be strings lists or objects."),
        "customvalue2": fields.List(fields.String()),
        "customvalue3 etc": fields.String()
    })


class SavedHelmValuesModel(Model):
    DTO = api.model('SavedHelmValues', {
        "_id": fields.String(example="5ff6250d16753e86415d9e0d",
                             description="A generated Mongo ID."),
        "application": fields.String(example="suricata",
                                     description="The name of the helm chart."),
        "deployment_name": fields.String(example="flash-sensor1-suricata",
                                         description="The name of the Kubernetes deployment."),
        "values": fields.Nested(HelmValuesModel.DTO)
    })

"""
[
    {
        "_id": "5ff62da816753e9cda68b3c4",
        "application": "zeek",
        "deployment_name": "navarro2-sensor1-zeek",
        "values": {
            "affinity_hostname": "navarro2-sensor1.lan",
            "deployment_name": "navarro2-sensor1-zeek",
            "elastic_ingest_nodes": [
                "https://tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200",
                "https://tfplenum-es-data-1.tfplenum-es-data.default.svc.cluster.local:9200",
                "https://tfplenum-es-data-2.tfplenum-es-data.default.svc.cluster.local:9200",
                "https://tfplenum-es-data-3.tfplenum-es-data.default.svc.cluster.local:9200"
            ],
            "filebeat_image_name": "beats/filebeat",
            "filebeat_image_tag": "7.11.1",
            "home_net": [
                "192.168.0.0/24"
            ],
            "ids_log_rotate_interval": 300,
            "image_name": "tfplenum/zeek",
            "image_tag": "3.2.0",
            "interfaces": [
                "ens224"
            ],
            "kibana_fqdn": "kibana.default.svc.cluster.local",
            "kibana_port": 443,
            "node_hostname": "navarro2-sensor1.lan",
            "shards": 4,
            "zeek_intel_dat": "/opt/tfplenum/zeek/intel.dat",
            "zeek_log_path": "/data/zeek",
            "zeek_loggers": 1,
            "zeek_scripts": "/opt/tfplenum/zeek/scripts",
            "zeek_workers": "8"
        }
    }
]
"""
