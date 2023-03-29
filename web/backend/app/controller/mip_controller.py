from app.middleware import handle_errors
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.models.mip import MIPSchemaModel
from app.service.mip_service import post_mip
from app.utils.namespaces import KIT_SETUP_NS
from app.utils.validation import required_params
from flask import Response
from flask_restx import Resource


@KIT_SETUP_NS.route("/mip")
class MipCtrlApi(Resource):

    @KIT_SETUP_NS.doc(description="Create a mip based off Schema payload.")
    @KIT_SETUP_NS.doc(payload=MIPSchemaModel)
    @KIT_SETUP_NS.response(202, "JobIDModel", JobIDModel.DTO)
    @KIT_SETUP_NS.response(400, "ErrorMessage: Validation Error", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(400, "ErrorMessage: PostValidation Error", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @required_params(MIPSchemaModel())
    @handle_errors
    def post(self) -> Response:
        return post_mip(KIT_SETUP_NS.payload), 202
