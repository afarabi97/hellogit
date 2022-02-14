import traceback

import yaml
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.middleware import controller_maintainer_required
from app.models.scale import SCALE_NS, read, update
from app.service.scale_service import (es_cluster_status,
                                       get_allowable_scale_count, get_es_nodes,
                                       parse_nodes)
from app.utils.logging import logger
from flask import Response, request
from flask_restx.resource import Resource


@SCALE_NS.route("/elastic")
class ScaleElastic(Resource):
    @controller_maintainer_required
    def post(self) -> Response:
        """
        Scale elasticsearch

        :return (Response): Returns a Reponse object
        """

        def scale(deployment, name, count):
            if count:
                for node_set in deployment["spec"]["nodeSets"]:
                    if node_set["name"] == name:
                        node_set["count"] = count

        def get_new_count_from_payload(payload, name):
            if payload.get("elastic", None):
                return payload["elastic"].get(name, None)
            else:
                return None

        try:
            deployment = read()

            scale(
                deployment,
                "master",
                get_new_count_from_payload(request.get_json(), "master"),
            )
            scale(
                deployment, "ml", get_new_count_from_payload(
                    request.get_json(), "ml")
            )
            scale(
                deployment,
                "data",
                get_new_count_from_payload(request.get_json(), "data"),
            )
            scale(
                deployment,
                "ingest",
                get_new_count_from_payload(request.get_json(), "ingest"),
            )

            update(deployment)
            return OK_RESPONSE

        except Exception as e:
            logger.exception(e)
            traceback.print_exc()
            return ERROR_RESPONSE


@SCALE_NS.route("/elastic/advanced")
class ScaleAdvanced(Resource):
    @controller_maintainer_required
    def post(self) -> Response:
        """
        Scale elasticsearch

        :return (Response): Returns a Reponse object
        """
        deploy_config = {}
        payload = request.get_json()
        try:
            if "elastic" in payload:
                deploy_config = yaml.load(payload["elastic"])
                update(deploy_config)

            return OK_RESPONSE
        except Exception as e:
            logger.exception(e)
            traceback.print_exc()
            return ERROR_RESPONSE

    def get(self) -> Response:
        """
        Scale elasticsearch

        :return (Response): Returns a Reponse object
        """
        deploy_config = {}
        try:
            deploy_config = read()
            return {"elastic": yaml.dump(deploy_config)}, 200
        except Exception as e:
            logger.exception(e)
            traceback.print_exc()
            return ERROR_RESPONSE


@SCALE_NS.route("/elastic/nodes")
class ElasticNodeCount(Resource):
    def get(self) -> Response:
        """
        Get current elasticsearch node count

        :return (Response): Returns a Reponse object
        """

        node_list = get_es_nodes()
        nodes = parse_nodes(node_list)
        if node_list:
            max_node_count = get_allowable_scale_count()
            nodes.update(max_node_count)
        if nodes:
            return {"elastic": nodes}, 200

        return ERROR_RESPONSE


@SCALE_NS.route("/check")
class ScaleCheck(Resource):
    def get(self) -> Response:
        status = es_cluster_status()
        return {"status": status}, 200
