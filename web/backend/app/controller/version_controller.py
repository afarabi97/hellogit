from app.models.version_information import VersionInformationModel
from app.service.system_info_service import (get_build_date, get_commit_hash,
                                             get_version)
from app.utils.namespaces import VERSION_NS
from flask_restx.resource import Resource


@VERSION_NS.route('/information')
class Version(Resource):

    @VERSION_NS.doc(description="Gets software version data.")
    @VERSION_NS.response(200, 'VersionInformationModel', VersionInformationModel.DTO)
    def get(self) -> VersionInformationModel:
        return {"version": get_version(), "build_date": get_build_date(), "commit_hash": get_commit_hash()}, 200
