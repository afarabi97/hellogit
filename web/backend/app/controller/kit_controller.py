from app.middleware import (controller_admin_required, handle_errors,
                            login_required_roles)
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.models.kit_status import KitStatusModel
from app.service.kit_service import get_execute_kit_job, get_new_kit_status
from app.utils.constants import NODE_STATE_ADMIN_ROLES
from app.utils.namespaces import KIT_SETUP_NS
from flask import Response
from flask_restx import Resource


@KIT_SETUP_NS.route("/status")
class KitStatusCtrlApi(Resource):

    @KIT_SETUP_NS.doc(description="Gets kit status.")
    @KIT_SETUP_NS.response(200, "KitStatusModel", KitStatusModel.DTO)
    @KIT_SETUP_NS.response(400, "ErrorMessage: Requested database object not found.", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, "ErrorMessage: Internal Server Error.", COMMON_ERROR_MESSAGE)
    @login_required_roles(NODE_STATE_ADMIN_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_new_kit_status(), 200


@KIT_SETUP_NS.route("/deploy")
class KitCtrlApi(Resource):

    @KIT_SETUP_NS.doc(description="Gets kit job.")
    @KIT_SETUP_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @KIT_SETUP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_admin_required
    @handle_errors
    def get(self) -> Response:
        return get_execute_kit_job(), 200
