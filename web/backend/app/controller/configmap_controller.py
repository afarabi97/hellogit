from app.middleware import controller_maintainer_required, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.kubernetes import (AssociatedPodModel, ConfigMapListModel,
                                   ConfigMapSavedModel, ConfigMapSaveModel)
from app.service.configmap_service import (get_associated_pods,
                                           get_config_maps, put_config_map)
from app.utils.logging import logger
from app.utils.namespaces import KUBERNETES_NS
from flask import Response, request
from flask_restx import Resource


@KUBERNETES_NS.route("/associated/pods/<config_map_name>")
@KUBERNETES_NS.doc(params={'config_map_name': "A pod's config_map_name"})
class AssociatedPodsApi(Resource):

    @KUBERNETES_NS.doc(description="List the pods effected by a change to the config map.")
    @KUBERNETES_NS.response(200, "List AssociatedPodModel", [AssociatedPodModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def get(self, config_map_name: str) -> Response:
        try:
            return get_associated_pods(config_map_name), 200
        except Exception as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 500

@KUBERNETES_NS.route("/configmaps")
class ConfigMapsApi(Resource):

    @KUBERNETES_NS.doc(description="Get all the config map data.")
    @KUBERNETES_NS.response(200, "List ConfigMapListModel", [ConfigMapListModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    def get(self) -> Response:
        try:
            return get_config_maps()
        except Exception as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 500

@KUBERNETES_NS.route("/configmap")
class ConfigMapApi(Resource):

    @KUBERNETES_NS.doc(description="Saves a config map to the Kubernetes cluster.")
    @KUBERNETES_NS.expect(ConfigMapSaveModel.DTO)
    @KUBERNETES_NS.response(200, "ConfigMapSavedModel", ConfigMapSavedModel.DTO)
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def put(self) -> Response:
        try:
            return put_config_map(request.get_json()), 200
        except Exception as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 500
