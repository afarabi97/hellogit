from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.version_information import VersionInformationModel
from app.service.version_service import get_version_information
from app.utils.namespaces import VERSION_NS
from flask import Response
from flask_restx.resource import Resource


@VERSION_NS.route('/information')
class VersionCtrlApi(Resource):

    @VERSION_NS.doc(description="Gets software version data.")
    @VERSION_NS.response(200, "VersionInformationModel", VersionInformationModel.DTO)
    @VERSION_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    @login_required_roles()
    def get(self) -> Response:
        return get_version_information()
