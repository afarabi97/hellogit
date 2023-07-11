from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.kubernetes import DockerImageModel
from app.service.registry_service import get_docker_registry
from app.utils.namespaces import KUBERNETES_NS
from flask import Response
from flask_restx import Resource


@KUBERNETES_NS.route("/docker/registry")
class DockerRegistryCtrlApi(Resource):

    @KUBERNETES_NS.doc(description="Gets all the docker registry's containers and their versions.")
    @KUBERNETES_NS.response(200, "List DockerImageModel", [DockerImageModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage: InternalServerError", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_docker_registry()
