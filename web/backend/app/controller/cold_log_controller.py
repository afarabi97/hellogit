from app.middleware import handle_errors, login_required_roles
from app.models.cold_log import (FilebeatModuleModel, WinlogbeatInstallModel,
                                 WinlogbeatInstallSchema)
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.service.cold_log_service import (get_module_info,
                                          get_winlogbeat_configure,
                                          post_coldlog_upload,
                                          post_winlogbeat_install)
from app.utils.namespaces import COLDLOG_NS
from app.utils.validation import required_params
from flask import Response, request
from flask_restx import Resource


@COLDLOG_NS.route("/upload")
class ColdLogUploadApi(Resource):

    @COLDLOG_NS.doc(description="Upload zip or individual files for coldlog ingest.")
    @COLDLOG_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @COLDLOG_NS.response(404, "ErrorMessage: FileNotFoundError", COMMON_ERROR_MESSAGE)
    @COLDLOG_NS.response(409, "ErrorMessage: FailedToUploadFile", COMMON_ERROR_MESSAGE)
    @COLDLOG_NS.response(500, "ErrorMessage: FailedToUploadWinLog", COMMON_ERROR_MESSAGE)
    @COLDLOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def post(self, ) -> Response:
        return post_coldlog_upload(request.files, request.form)


@COLDLOG_NS.route("/module/info")
class ModuleInfoApi(Resource):

    @COLDLOG_NS.doc(description="Gets module info containing log types and there file set types.")
    @COLDLOG_NS.response(200, "List FilebeatModuleModel", [FilebeatModuleModel.DTO])
    @COLDLOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_module_info()


@COLDLOG_NS.route("/winlogbeat/configure")
class WinlogbeatConfigureApi(Resource):

    @COLDLOG_NS.doc(description="Gets current Winlogbeat configuration will return default configuration if not setup.")
    @COLDLOG_NS.response(200, "WinlogbeatInstallModel", WinlogbeatInstallModel.DTO)
    @COLDLOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_winlogbeat_configure()


@COLDLOG_NS.route("/winlogbeat/install")
class WinlogbeatInstallApi(Resource):

    @COLDLOG_NS.doc(description="Sets up Winlogbeat on a target Windows host so that it can be used for cold log ingest.")
    @COLDLOG_NS.doc(payload=WinlogbeatInstallModel)
    @COLDLOG_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @COLDLOG_NS.response(400, "ErrorMessage: Validation Error", COMMON_ERROR_MESSAGE)
    @COLDLOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @COLDLOG_NS.expect(WinlogbeatInstallModel.DTO)
    @required_params(WinlogbeatInstallSchema())
    @login_required_roles()
    @handle_errors
    def post(self) -> Response:
        return post_winlogbeat_install(COLDLOG_NS.payload)
