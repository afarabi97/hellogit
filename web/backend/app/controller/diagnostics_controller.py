from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.service.diagnostics_service import get_diagnostics, post_diagnostics
from app.utils.namespaces import DIAGNOSTICS_NS
from flask import Response
from flask_restx import Resource


@DIAGNOSTICS_NS.route("")
class DiagnosticsCtrlApi(Resource):

    @DIAGNOSTICS_NS.doc(description="Runs diagnostics on the controller.")
    @DIAGNOSTICS_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @DIAGNOSTICS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def post(self) -> Response:
        return post_diagnostics()


@DIAGNOSTICS_NS.route("/download/<job_id>")
@DIAGNOSTICS_NS.doc(params={"job_id": "A job_id for a log."})
class DiagnosticsCtrlApi(Resource):

    @DIAGNOSTICS_NS.doc(description="Gets the dianostic information.")
    @DIAGNOSTICS_NS.response(200, "FileDownload", DIAGNOSTICS_NS.schema_model('Diagnostics', {'type': 'file'}))
    @DIAGNOSTICS_NS.response(404, "ErrorMessage: Log not found", COMMON_ERROR_MESSAGE)
    @DIAGNOSTICS_NS.response(404, "ErrorMessage: Log archive not found", COMMON_ERROR_MESSAGE)
    @DIAGNOSTICS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, job_id) -> Response:
        return get_diagnostics(job_id)
