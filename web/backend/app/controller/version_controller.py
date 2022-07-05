from app.models.common import COMMON_ERROR_MESSAGE
from app.models.version_information import VERSION_NS, VersionInformationModel
from app.service.system_info_service import (get_build_date, get_commit_hash,
                                             get_version)
from app.utils.logging import logger
from app.utils.namespaces import VERSION_NS
from flask import Response
from flask_restx.resource import Resource


@VERSION_NS.route('/information')
class VersionApi(Resource):

    @VERSION_NS.doc(description="Gets software version data.")
    @VERSION_NS.response(200, "VersionInformationModel", VersionInformationModel.DTO)
    @VERSION_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def get(self) -> VersionInformationModel:
        try:
            return {"version": get_version(), "build_date": get_build_date(), "commit_hash": get_commit_hash()}, 200
        except Exception as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 500
