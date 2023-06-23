from app.middleware import (controller_maintainer_required, handle_errors,
                            login_required_roles)
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.kubernetes import (AssociatedPodModel, ConfigMapListModel,
                                   ConfigMapSavedModel, ConfigMapSaveModel)
from app.service.configmap_service import (get_associated_pods,
                                           get_config_maps, put_config_map)
from app.utils.namespaces import KUBERNETES_NS
from flask import Response
from flask_restx import Resource


@KUBERNETES_NS.route("/associated/pods/<config_map_name>")
@KUBERNETES_NS.doc(params={'config_map_name': "A pod's config_map_name"})
class AssociatedPodsCtrlApi(Resource):

    @KUBERNETES_NS.doc(description="List the pods effected by a change to the config map.")
    @KUBERNETES_NS.response(200, "List AssociatedPodModel", [AssociatedPodModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, config_map_name: str) -> Response:
        return get_associated_pods(config_map_name)


@KUBERNETES_NS.route("/configmaps")
class ConfigMapsCtrlApi(Resource):

    @KUBERNETES_NS.doc(description="Get all the config map data.")
    @KUBERNETES_NS.response(200, "List ConfigMapListModel", [ConfigMapListModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_config_maps()


@KUBERNETES_NS.route("/configmap")
class ConfigMapCtrlApi(Resource):

    @KUBERNETES_NS.doc(description="Saves a config map to the Kubernetes cluster.")
    @KUBERNETES_NS.expect(ConfigMapSaveModel.DTO)
    @KUBERNETES_NS.response(200, "ConfigMapSavedModel", ConfigMapSavedModel.DTO)
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    @handle_errors
    def put(self) -> Response:
        return put_config_map()
